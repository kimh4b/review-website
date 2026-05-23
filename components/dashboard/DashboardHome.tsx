"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, MessageSquare, Star, Users, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  submitted_at: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface Stats {
  totalResponses: number;
  avgRating: number;
  totalSurveys: number;
  positiveCount: number;
}

interface DashboardHomeProps {
  onNeedsAttention?: () => void;
}

function getSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function extractRating(answers: Record<string, any>): number {
  const ratingValues = Object.values(answers).filter(
    (v: any) => typeof v === "number" && v >= 1 && v <= 5
  ) as number[];
  return ratingValues.length > 0
    ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
    : 3;
}

function extractComment(answers: Record<string, any>, questionTypeMap: Record<string, string>): string {
  return Object.entries(answers)
    .filter(([key]) => questionTypeMap[key] === "text")
    .map(([, value]) => typeof value === "string" ? value.trim() : "")
    .filter(v => v.length > 0)
    .join(" • ");
}

export function DashboardHome({ onNeedsAttention }: DashboardHomeProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalResponses: 0,
    avgRating: 0,
    totalSurveys: 0,
    positiveCount: 0,
  });
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; responses: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; score: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: surveys, error: surveyError } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("owner_id", user!.id);

      if (surveyError) throw surveyError;

      const surveyIds = (surveys || []).map((s: any) => s.id);
      setStats(prev => ({ ...prev, totalSurveys: surveyIds.length }));

      if (surveyIds.length === 0) {
        setLoading(false);
        return;
      }

      const [{ data: responses, error: respError }, { data: questionsData }] = await Promise.all([
        supabase
          .from("survey_responses")
          .select("id, survey_id, answers, submitted_at")
          .in("survey_id", surveyIds)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("survey_questions")
          .select("id, type")
          .in("survey_id", surveyIds),
      ]);

      if (respError) throw respError;

      const questionTypeMap = Object.fromEntries(
        (questionsData || []).map((q: any) => [q.id, q.type])
      );

      const allResponses = responses || [];

      // Build stats
      const allRatings = allResponses.map((r: any) => extractRating(r.answers || {}));
      const avgRating = allRatings.length
        ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
        : 0;
      const positiveCount = allRatings.filter(r => r >= 4).length;

      setStats({
        totalResponses: allResponses.length,
        avgRating,
        totalSurveys: surveyIds.length,
        positiveCount,
      });

      // Recent feedback (last 5)
      const recent: FeedbackItem[] = allResponses.slice(0, 5).map((r: any) => {
        const answers = r.answers || {};
        const rating = extractRating(answers);
        const comment = extractComment(answers, questionTypeMap);
        return {
          id: r.id,
          rating,
          comment,
          submitted_at: r.submitted_at,
          sentiment: getSentiment(rating),
        };
      });
      setRecentFeedback(recent);

      // Trend data
      const last7: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7[d.toISOString().split("T")[0]] = 0;
      }
      allResponses.forEach((r: any) => {
        const day = r.submitted_at?.split("T")[0];
        if (day && last7[day] !== undefined) last7[day]++;
      });
      setTrendData(
        Object.entries(last7).map(([date, count]) => ({
          date: date.slice(5),
          responses: count,
        }))
      );

      // Category breakdown
      const catData = (surveys || []).map((s: any) => {
        const surveyResponses = allResponses.filter((r: any) => r.survey_id === s.id);
        const surveyRatings = surveyResponses.map((r: any) => extractRating(r.answers || {}));
        const avg = surveyRatings.length
          ? parseFloat((surveyRatings.reduce((a: number, b: number) => a + b, 0) / surveyRatings.length).toFixed(1))
          : 0;
        return { category: s.title, score: avg };
      });
      setCategoryData(catData);

    } catch (err: any) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const positiveRate = stats.totalResponses
    ? Math.round((stats.positiveCount / stats.totalResponses) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Welcome back!</h2>
        <p className="text-gray-600">Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Responses</CardTitle>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalResponses.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Across {stats.totalSurveys} survey{stats.totalSurveys !== 1 ? "s" : ""}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Avg Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.avgRating || "—"}</div>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(stats.avgRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Positive Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{positiveRate}%</div>
            <div className="text-sm text-gray-500">{stats.positiveCount} positive responses</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Surveys</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalSurveys}</div>
            <div className="text-sm text-gray-500">Collecting feedback</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Response Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            {trendData.some(d => d.responses > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="responses" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} name="Responses" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No responses in the last 7 days</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Avg Rating by Survey</CardTitle></CardHeader>
          <CardContent>
            {categoryData.some(d => d.score > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#f97316" name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No ratings yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader><CardTitle>Recent Feedback</CardTitle></CardHeader>
        <CardContent>
          {recentFeedback.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No feedback yet — share your survey QR codes to get started
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${feedback.sentiment === "positive" ? "bg-green-100" :
                      feedback.sentiment === "negative" ? "bg-red-100" : "bg-gray-100"}
                  `}>
                    {feedback.sentiment === "positive" ? "😊" :
                     feedback.sentiment === "negative" ? "😞" : "😐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{timeAgo(feedback.submitted_at)}</span>
                    </div>
                    {feedback.comment ? (
                      <p className="text-gray-700">{feedback.comment}</p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">No comment provided</p>
                    )}
                    {/* Clickable "Needs attention" button */}
                    {feedback.sentiment === "negative" && (
                      <button
                        onClick={onNeedsAttention}
                        className="mt-2 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Needs attention — view full review</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}