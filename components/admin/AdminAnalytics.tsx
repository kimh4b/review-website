"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, TrendingUp, MessageSquare, Star, Store } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export function AdminAnalytics() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalSurveys: 0,
    totalResponses: 0,
    avgRating: 0,
  });
  const [trendData, setTrendData] = useState<{ date: string; responses: number }[]>([]);
  const [restaurantData, setRestaurantData] = useState<{ name: string; responses: number; avgRating: number }[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<{ name: string; value: number }[]>([]);
  const [surveyActivityData, setSurveyActivityData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all surveys
      const { data: surveys } = await supabase
        .from("surveys")
        .select("id, title, owner_id, created_at");

      // Fetch all responses
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("id, survey_id, answers, submitted_at")
        .order("submitted_at", { ascending: true });

      // Fetch all questions
      const { data: questions } = await supabase
        .from("survey_questions")
        .select("id, type, survey_id");

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, restaurant_name")
        .neq("email", "admin@gmail.com");

      const surveyList = surveys || [];
      const responseList = responses || [];
      const questionList = questions || [];
      const profileList = profiles || [];

      // First rating question per survey
      const firstRatingPerSurvey: Record<string, string> = {};
      questionList.forEach((q: any) => {
        if (q.type === "rating" && !firstRatingPerSurvey[q.survey_id]) {
          firstRatingPerSurvey[q.survey_id] = q.id;
        }
      });

      const extractRating = (answers: any, surveyId: string) => {
        const firstRatingId = firstRatingPerSurvey[surveyId];
        if (firstRatingId && answers[firstRatingId] !== undefined) {
          const val = answers[firstRatingId];
          const num = typeof val === "number" ? val : parseInt(val);
          if (num >= 1 && num <= 5) return num;
        }
        const vals = Object.values(answers || {}).filter((v: any) => typeof v === "number" && v >= 1 && v <= 5) as number[];
        return vals.length > 0 ? vals[0] : null;
      };

      // Stats
      const uniqueOwners = new Set(surveyList.map((s: any) => s.owner_id));
      const allRatings = responseList
        .map((r: any) => extractRating(r.answers || {}, r.survey_id))
        .filter((r): r is number => r !== null);
      const avgRating = allRatings.length
        ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
        : 0;

      setStats({
        totalRestaurants: uniqueOwners.size,
        totalSurveys: surveyList.length,
        totalResponses: responseList.length,
        avgRating,
      });

      // Trend — responses per day last 30 days
      const last30: Record<string, number> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        last30[d.toISOString().split("T")[0]] = 0;
      }
      responseList.forEach((r: any) => {
        const day = r.submitted_at?.split("T")[0];
        if (day && last30[day] !== undefined) last30[day]++;
      });
      setTrendData(
        Object.entries(last30)
          .filter((_, i) => i % 3 === 0) // show every 3 days to avoid crowding
          .map(([date, count]) => ({ date: date.slice(5), responses: count }))
      );

      // Per restaurant stats
      const profileMap = Object.fromEntries(profileList.map((p: any) => [p.id, p.restaurant_name || "Unknown"]));
      const surveyMap: Record<string, string[]> = {};
      surveyList.forEach((s: any) => {
        if (!surveyMap[s.owner_id]) surveyMap[s.owner_id] = [];
        surveyMap[s.owner_id].push(s.id);
      });

      const restaurantStats = Array.from(uniqueOwners).map((ownerId: any) => {
        const ownerSurveyIds = surveyMap[ownerId] || [];
        const ownerResponses = responseList.filter((r: any) => ownerSurveyIds.includes(r.survey_id));
        const ownerRatings = ownerResponses
          .map((r: any) => extractRating(r.answers || {}, r.survey_id))
          .filter((r): r is number => r !== null);
        const avg = ownerRatings.length
          ? parseFloat((ownerRatings.reduce((a, b) => a + b, 0) / ownerRatings.length).toFixed(1))
          : 0;
        return {
          name: profileMap[ownerId] || "Unknown",
          responses: ownerResponses.length,
          avgRating: avg,
        };
      }).sort((a, b) => b.responses - a.responses).slice(0, 8);

      setRestaurantData(restaurantStats);

      // Rating distribution across platform
      const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allRatings.forEach(r => { if (ratingCounts[r] !== undefined) ratingCounts[r]++; });
      setRatingDistribution(
        Object.entries(ratingCounts).map(([rating, count]) => ({ name: `${rating} ⭐`, value: count }))
      );

      // Survey activity — surveys per restaurant
      setSurveyActivityData(
        Array.from(uniqueOwners).map((ownerId: any) => ({
          name: profileMap[ownerId] || "Unknown",
          value: (surveyMap[ownerId] || []).length,
        })).sort((a, b) => b.value - a.value).slice(0, 6)
      );

    } catch (err: any) {
      console.error("Admin analytics error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Platform Analytics</h2>
        <p className="text-gray-600">Charts and insights across all restaurants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Restaurants", value: stats.totalRestaurants, icon: Store, color: "text-blue-500" },
          { label: "Total Surveys", value: stats.totalSurveys, icon: MessageSquare, color: "text-purple-500" },
          { label: "Total Responses", value: stats.totalResponses, icon: TrendingUp, color: "text-green-500" },
          { label: "Avg Rating", value: stats.avgRating || "—", icon: Star, color: "text-yellow-500" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Trend */}
      <Card>
        <CardHeader><CardTitle>Response Trend (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          {trendData.some(d => d.responses > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responses" stroke="#f97316" strokeWidth={2} dot={false} name="Responses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">No responses yet</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responses per restaurant */}
        <Card>
          <CardHeader><CardTitle>Responses by Restaurant</CardTitle></CardHeader>
          <CardContent>
            {restaurantData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={restaurantData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="responses" fill="#f97316" name="Responses" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">No data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Rating distribution */}
        <Card>
          <CardHeader><CardTitle>Rating Distribution (Platform-wide)</CardTitle></CardHeader>
          <CardContent>
            {ratingDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(val) => [`${val} responses`]} />
                  <Bar dataKey="value" fill="#f97316" name="Responses" radius={[4, 4, 0, 0]}>
                    {ratingDistribution.map((_, i) => (
                      <Cell key={i} fill={i >= 3 ? "#22c55e" : i === 2 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">No ratings yet</div>
            )}
          </CardContent>
        </Card>

        {/* Avg rating per restaurant */}
        <Card>
          <CardHeader><CardTitle>Avg Rating by Restaurant</CardTitle></CardHeader>
          <CardContent>
            {restaurantData.filter(r => r.avgRating > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={restaurantData.filter(r => r.avgRating > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="avgRating" fill="#3b82f6" name="Avg Rating" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">No ratings yet</div>
            )}
          </CardContent>
        </Card>

        {/* Surveys per restaurant */}
        <Card>
          <CardHeader><CardTitle>Surveys per Restaurant</CardTitle></CardHeader>
          <CardContent>
            {surveyActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={surveyActivityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {surveyActivityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} surveys`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">No surveys yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}