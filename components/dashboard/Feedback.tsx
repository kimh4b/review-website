import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, FileText, Filter, Star, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const feedbackData = [
  { id: 1, date: "2024-12-03", rating: 5, survey: "Food Quality", sentiment: "positive", comment: "Outstanding food and service!" },
  { id: 2, date: "2024-12-03", rating: 4, survey: "Service Experience", sentiment: "positive", comment: "Great experience overall" },
  { id: 3, date: "2024-12-03", rating: 2, survey: "Food Quality", sentiment: "negative", comment: "Food was cold" },
  { id: 4, date: "2024-12-02", rating: 5, survey: "Ambiance", sentiment: "positive", comment: "Beautiful atmosphere" },
  { id: 5, date: "2024-12-02", rating: 3, survey: "Service Experience", sentiment: "neutral", comment: "Service was okay" },
  { id: 6, date: "2024-12-02", rating: 5, survey: "Food Quality", sentiment: "positive", comment: "Delicious!" },
  { id: 7, date: "2024-12-01", rating: 4, survey: "Service Experience", sentiment: "positive", comment: "Friendly staff" },
  { id: 8, date: "2024-12-01", rating: 1, survey: "Food Quality", sentiment: "negative", comment: "Very disappointed" },
];

const trendData = [
  { date: "Nov 27", rating: 4.2, responses: 45 },
  { date: "Nov 28", rating: 4.3, responses: 52 },
  { date: "Nov 29", rating: 4.1, responses: 48 },
  { date: "Nov 30", rating: 4.4, responses: 56 },
  { date: "Dec 1", rating: 4.5, responses: 61 },
  { date: "Dec 2", rating: 4.6, responses: 58 },
  { date: "Dec 3", rating: 4.5, responses: 54 },
];

const sentimentData = [
  { name: "Positive", value: 68, color: "#22c55e" },
  { name: "Neutral", value: 22, color: "#f59e0b" },
  { name: "Negative", value: 10, color: "#ef4444" },
];

const categoryBreakdown = [
  { category: "Food Quality", count: 342 },
  { category: "Service", count: 289 },
  { category: "Ambiance", count: 156 },
  { category: "Value", count: 124 },
];

export function Feedback() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("7");
  const [surveyFilter, setSurveyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeedback = feedbackData.filter(item => {
    const matchesSurvey = surveyFilter === "all" || item.survey === surveyFilter;
    const matchesSearch = item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSurvey && matchesSearch;
  });

  const handleExportPDF = () => {
    if (user?.plan === "Basic") {
      toast.error("Export to PDF is available on Pro and Enterprise plans");
      return;
    }
    toast.success("Exporting report as PDF...");
  };

  const handleExportCSV = () => {
    if (user?.plan === "Basic") {
      toast.error("Export to CSV is available on Pro and Enterprise plans");
      return;
    }
    toast.success("Exporting data as CSV...");
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Feedback & Analytics</h2>
          <p className="text-gray-600">Real-time insights from customer feedback</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={user?.plan === "Basic"}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={user?.plan === "Basic"}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>
                  <SelectItem value="Food Quality">Food Quality</SelectItem>
                  <SelectItem value="Service Experience">Service Experience</SelectItem>
                  <SelectItem value="Ambiance">Ambiance</SelectItem>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Avg Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
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
                  fill="#8884d8"
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

        {/* Response Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Response Volume</CardTitle>
          </CardHeader>
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

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFeedback.map((item) => (
              <div 
                key={item.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:border-orange-300 transition-colors"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${item.sentiment === 'positive' ? 'bg-green-100' : 
                    item.sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'}
                `}>
                  {item.sentiment === 'positive' ? '😊' : 
                   item.sentiment === 'negative' ? '😞' : '😐'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < item.rating 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{item.date}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{item.survey}</span>
                  </div>
                  <p className="text-gray-700">{item.comment}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No feedback matches your filters
            </div>
          )}
        </CardContent>
      </Card>

      {user?.plan === "Basic" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="mb-2">Unlock Advanced Analytics</h3>
              <p className="text-sm text-gray-700 mb-4">
                Upgrade to Pro to access export features, advanced filtering, sentiment analysis, and more.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
