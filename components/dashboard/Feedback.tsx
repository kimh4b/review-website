"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Star, Loader2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface FeedbackItem {
  id: string;
  date: string;
  rating: number;
  surveyName: string;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface Survey {
  id: string;
  name: string;
}

function getSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

export function Feedback() {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [surveyFilter, setSurveyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("owner_id", user!.id);

      if (surveyError) throw surveyError;

      const surveyList: Survey[] = (surveyData || []).map((s: any) => ({
        id: s.id,
        name: s.title,
      }));
      setSurveys(surveyList);

      if (surveyList.length === 0) {
        setFeedback([]);
        setLoading(false);
        return;
      }

      const surveyIds = surveyList.map((s) => s.id);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      const { data: responseData, error: responseError } = await supabase
        .from("survey_responses")
        .select("id, survey_id, answers, submitted_at")
        .in("survey_id", surveyIds)
        .gte("submitted_at", daysAgo.toISOString())
        .order("submitted_at", { ascending: false });

      if (responseError) throw responseError;

      const surveyMap = Object.fromEntries(surveyList.map((s) => [s.id, s.name]));

      const mapped: FeedbackItem[] = (responseData || []).map((r: any) => {
        const answers = r.answers || {};
        const rating = answers.overall_rating || answers.rating || answers.food_quality || 3;
        const comment = answers.comment || answers.feedback || answers.what_did_you_enjoy || "";
        return {
          id: r.id,
          date: r.submitted_at?.split("T")[0] || "",
          rating: typeof rating === "number" ? rating : parseInt(rating) || 3,
          surveyName: surveyMap[r.survey_id] || "Unknown Survey",
          comment: typeof comment === "string" ? comment : "",
          sentiment: getSentiment(typeof rating === "number" ? rating : parseInt(rating) || 3),
        };
      });

      setFeedback(mapped);
    } catch (err: any) {
      toast.error("Failed to load feedback: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesSurvey = surveyFilter === "all" || item.surveyName === surveyFilter;
    const matchesSearch = item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSurvey && matchesSearch;
  });

  const trendData = (() => {
    const grouped: Record<string, { ratings: number[]; count: number }> = {};
    feedback.forEach((item) => {
      if (!grouped[item.date]) grouped[item.date] = { ratings: [], count: 0 };
      grouped[item.date].ratings.push(item.rating);
      grouped[item.date].count++;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, { ratings, count }]) => ({
        date,
        rating: parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)),
        responses: count,
      }));
  })();

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  feedback.forEach((f) => sentimentCounts[f.sentiment]++);
  const total = feedback.length || 1;
  const sentimentData = [
    { name: "Positive", value: Math.round((sentimentCounts.positive / total) * 100), color: "#22c55e" },
    { name: "Neutral", value: Math.round((sentimentCounts.neutral / total) * 100), color: "#f59e0b" },
    { name: "Negative", value: Math.round((sentimentCounts.negative / total) * 100), color: "#ef4444" },
  ];

  const categoryBreakdown = surveys.map((s) => ({
    category: s.name,
    count: feedback.filter((f) => f.surveyName === s.name).length,
  }));

  const avgRating = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "—";

  const handleExportCSV = () => {
    const rows = [
      ["Date", "Survey", "Rating", "Sentiment", "Comment"],
      ...filteredFeedback.map((f) => [f.date, f.surveyName, f.rating, f.sentiment, f.comment]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-export.csv";
    a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Feedback & Analytics</h2>
          <p className="text-gray-600">Real-time insights from customer feedback</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{feedback.length}</div>
            <div className="text-sm text-gray-500">Total Responses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{avgRating}</div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{sentimentCounts.positive}</div>
            <div className="text-sm text-gray-500">Positive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{surveys.length}</div>
            <div className="text-sm text-gray-500">Active Surveys</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Survey</label>
              <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Search</label>
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No feedback yet</p>
          <p className="text-sm">Share your survey QR codes to start collecting responses</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Rating Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rating" stroke="#f97316" strokeWidth={2} name="Avg Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Response Volume</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responses" fill="#f97316" name="Responses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Feedback by Survey</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Recent Feedback</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${item.sentiment === "positive" ? "bg-green-100" :
                        item.sentiment === "negative" ? "bg-red-100" : "bg-gray-100"}
                    `}>
                      {item.sentiment === "positive" ? "😊" :
                       item.sentiment === "negative" ? "😞" : "😐"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < item.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{item.date}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{item.surveyName}</span>
                      </div>
                      {item.comment ? (
                        <p className="text-gray-700">{item.comment}</p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No comment provided</p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredFeedback.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No feedback matches your filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}