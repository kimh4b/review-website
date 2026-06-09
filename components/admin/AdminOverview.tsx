"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Store, Users, FileText, MessageSquare, Loader2, Activity, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabaseClient";

interface Stats {
  totalRestaurants: number;
  totalReviews: number;
  averageRating: number;
  topRatedRestaurant: string;
}

interface RecentUser {
  restaurantName: string;
  created_at: string;
}

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
  totalRestaurants: 0,
  totalReviews: 0,
  averageRating: 0,
  topRatedRestaurant: "",
});
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  setLoading(true);

  try {
    // Restaurants (surveys)
    const { data: restaurants, count: restaurantCount } = await supabase
      .from("surveys")
      .select("*", { count: "exact" });

    // Reviews (responses)
    const { data: reviews, count: reviewCount } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact" });

    // Average rating
    const ratings =
      reviews
        ?.map((r: any) => Number(r.rating))
        .filter((r) => !isNaN(r)) || [];

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Top restaurant
    let topRestaurant = "N/A";

    if (restaurants && restaurants.length > 0) {
      topRestaurant = restaurants[0].title;
    }

    setStats({
      totalRestaurants: restaurantCount || 0,
      totalReviews: reviewCount || 0,
      averageRating: Number(averageRating.toFixed(1)),
      topRatedRestaurant: topRestaurant,
    });

    // Last 7 days reviews
    const last7: Record<string, number> = {};

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);

      d.setDate(d.getDate() - i);

      last7[d.toISOString().split("T")[0]] = 0;
    }

    reviews?.forEach((review: any) => {
      const day = review.submitted_at?.split("T")[0];

      if (day && last7[day] !== undefined) {
        last7[day]++;
      }
    });

    setTrendData(
      Object.entries(last7).map(([date, count]) => ({
        date: date.slice(5),
        reviews: count,
      }))
    );

    // Recent reviews
    const recent =
      restaurants?.slice(0, 5).map((r: any) => ({
        restaurantName: r.title,
        created_at: r.created_at,
      })) || [];

    setRecentUsers(recent);

  } catch (err) {
    console.error(err);
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
    {/* Header */}
    <div>
      <h2 className="text-3xl font-semibold mb-2">
        Restaurant Dashboard
      </h2>
      <p className="text-gray-600">
        Monitor restaurants, reviews, and platform activity
      </p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Total Restaurants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Restaurants
          </CardTitle>
          <Store className="w-4 h-4 text-orange-500" />
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {stats.totalRestaurants}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            total listed restaurants
          </p>
        </CardContent>
      </Card>

      {/* Total Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Reviews
          </CardTitle>
          <MessageSquare className="w-4 h-4 text-green-500" />
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {stats.totalReviews}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            anonymous customer reviews
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Average Rating
          </CardTitle>

          <Activity className="w-4 h-4 text-yellow-500" />
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {stats.averageRating}⭐
          </div>

          <p className="text-xs text-gray-500 mt-1">
            overall platform rating
          </p>
        </CardContent>
      </Card>

      {/* Top Restaurant */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Top Restaurant
          </CardTitle>

          <CheckCircle className="w-4 h-4 text-blue-500" />
        </CardHeader>

        <CardContent>
          <div className="text-lg font-semibold truncate">
            {stats.topRatedRestaurant || "N/A"}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            highest rated restaurant
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Charts + Recent Reviews */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Reviews Per Day */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reviews Per Day
          </CardTitle>
        </CardHeader>

        <CardContent>
          {trendData.some((d) => d.reviews > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="reviews"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="Reviews"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">
              No reviews in the last 7 days
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>
            Latest Reviews
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">

            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No recent reviews
              </div>
            ) : (
              recentUsers.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Store className="w-5 h-5 text-orange-500" />
                    </div>

                    <div>
                      <div className="text-sm font-medium">
                        {item.restaurantName}
                      </div>

                      <div className="text-xs text-gray-500">
                        New anonymous review
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400">
                    {timeAgo(item.created_at)}
                  </span>
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