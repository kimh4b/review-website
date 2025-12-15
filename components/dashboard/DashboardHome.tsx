import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, MessageSquare, Star, Users, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const recentFeedback = [
  { id: 1, text: "Great food and excellent service!", rating: 5, time: "2 hours ago", sentiment: "positive" },
  { id: 2, text: "Food was cold when it arrived", rating: 2, time: "3 hours ago", sentiment: "negative" },
  { id: 3, text: "Amazing ambiance and atmosphere", rating: 5, time: "5 hours ago", sentiment: "positive" },
  { id: 4, text: "Service was a bit slow but food was good", rating: 3, time: "6 hours ago", sentiment: "neutral" },
  { id: 5, text: "Best restaurant in the area!", rating: 5, time: "8 hours ago", sentiment: "positive" },
];

const npsData = [
  { month: "Jan", score: 45 },
  { month: "Feb", score: 52 },
  { month: "Mar", score: 58 },
  { month: "Apr", score: 61 },
  { month: "May", score: 65 },
  { month: "Jun", score: 68 },
];

const categoryData = [
  { category: "Food Quality", score: 4.5 },
  { category: "Service", score: 4.2 },
  { category: "Ambiance", score: 4.7 },
  { category: "Value", score: 4.0 },
  { category: "Cleanliness", score: 4.8 },
];

export function DashboardHome() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl mb-2">Welcome back!</h2>
        <p className="text-gray-600">Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">NPS Score</CardTitle>
            <Star className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">68</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+3 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Reviews</CardTitle>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">1,247</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Avg Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">4.6</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+0.2 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Response Rate</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">94%</div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>-2% this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Trend */}
        <Card>
          <CardHeader>
            <CardTitle>NPS Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={npsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Category Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div 
                key={feedback.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${feedback.sentiment === 'positive' ? 'bg-green-100' : 
                    feedback.sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'}
                `}>
                  {feedback.sentiment === 'positive' ? '😊' : 
                   feedback.sentiment === 'negative' ? '😞' : '😐'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < feedback.rating 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{feedback.time}</span>
                  </div>
                  <p className="text-gray-700">{feedback.text}</p>
                  {feedback.sentiment === 'negative' && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Needs attention</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
