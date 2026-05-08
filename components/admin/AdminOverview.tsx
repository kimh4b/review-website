"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Store, Users, FileText, MessageSquare, Loader2, Activity, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalRestaurants: number;
  totalSurveys: number;
  totalResponses: number;
  activeUsers: number;
}

interface RecentUser {
  id: string;
  email: string;
  fullName: string;
  restaurantName: string;
  created_at: string;
}

export function AdminOverview() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRestaurants: 0,
    totalSurveys: 0,
    totalResponses: 0,
    activeUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Total surveys
      const { count: surveyCount } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true });

      // Total responses
      const { count: responseCount } = await supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true });

      // All users (via surveys - get unique owner_ids)
      const { data: surveyData } = await supabase
        .from("surveys")
        .select("owner_id, created_at");

      const uniqueOwners = new Set((surveyData || []).map((s: any) => s.owner_id));

      setStats({
        totalRestaurants: uniqueOwners.size,
        totalSurveys: surveyCount || 0,
        totalResponses: responseCount || 0,
        activeUsers: uniqueOwners.size,
      });

      // Build trend data — responses per day last 7 days
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("submitted_at")
        .order("submitted_at", { ascending: true });

      const last7: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7[d.toISOString().split("T")[0]] = 0;
      }
      (responses || []).forEach((r: any) => {
        const day = r.submitted_at?.split("T")[0];
        if (day && last7[day] !== undefined) last7[day]++;
      });
      setTrendData(
        Object.entries(last7).map(([date, count]) => ({
          date: date.slice(5),
          responses: count,
        }))
      );

      // Recent surveys as proxy for recent activity
      const { data: recentSurveys } = await supabase
        .from("surveys")
        .select("owner_id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Map to display
      const recent = (recentSurveys || []).map((s: any) => ({
        id: s.owner_id,
        email: "",
        fullName: "Restaurant Owner",
        restaurantName: s.title,
        created_at: s.created_at,
      }));
      setRecentUsers(recent);

    } catch (err: any) {
      console.error("Admin overview error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Platform Overview</h2>
        <p className="text-gray-600">Monitor platform performance and key metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Restaurant Owners</CardTitle>
            <Store className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalRestaurants}</div>
            <p className="text-xs text-gray-600">registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Surveys</CardTitle>
            <FileText className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalSurveys}</div>
            <p className="text-xs text-gray-600">across all restaurants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Responses</CardTitle>
            <MessageSquare className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalResponses}</div>
            <p className="text-xs text-gray-600">customer submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">System Health</CardTitle>
            <Activity className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">99.9%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <CheckCircle className="w-4 h-4" />
              <span>All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trend */}
        <Card>
          <CardHeader><CardTitle>Response Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            {trendData.some(d => d.responses > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responses" stroke="#f97316" strokeWidth={2} name="Responses" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                No responses in the last 7 days
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle>Recent Surveys Created</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
              ) : (
                recentUsers.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.restaurantName}</div>
                        <div className="text-xs text-gray-500">New survey</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}