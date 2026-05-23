"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Star, Loader2, AlertCircle, MessageSquare, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Survey {
  id: string;
  name: string;
}

interface Question {
  id: string;
  question: string;
  type: string;
  order_index: number;
  options: string[];
}

interface ResponseRow {
  id: string;
  answers: Record<string, any>;
  submitted_at: string;
}

interface FeedbackItem {
  id: string;
  date: string;
  mainRating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
}

function getSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#f97316", "#06b6d4"];

interface FeedbackProps {
  onViewReview?: () => void;
}

export function Feedback({ onViewReview }: FeedbackProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [dateRange, setDateRange] = useState("30");

  // Add this above the return statement
  const renderLabel = ({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`;
  const renderPercentLabel = ({ percent }: any) => `${(percent * 100).toFixed(0)}%`;
  useEffect(() => {
    if (!user) return;
    fetchSurveys();
  }, [user]);

  useEffect(() => {
    if (selectedSurveyId) fetchSurveyData();
  }, [selectedSurveyId, dateRange]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = (data || []).map((s: any) => ({ id: s.id, name: s.title }));
      setSurveys(list);
      if (list.length > 0) setSelectedSurveyId(list[0].id);
      else setLoading(false);
    } catch (err: any) {
      toast.error("Failed to load surveys");
      setLoading(false);
    }
  };

  const fetchSurveyData = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      const [{ data: qData }, { data: rData }] = await Promise.all([
        supabase
          .from("survey_questions")
          .select("id, question, type, order_index, options")
          .eq("survey_id", selectedSurveyId)
          .order("order_index", { ascending: true }),
        supabase
          .from("survey_responses")
          .select("id, answers, submitted_at")
          .eq("survey_id", selectedSurveyId)
          .gte("submitted_at", daysAgo.toISOString())
          .order("submitted_at", { ascending: false }),
      ]);

      setQuestions((qData || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        order_index: q.order_index,
        options: Array.isArray(q.options) ? q.options : [],
      })));

      setResponses(rData || []);

      // Build recent feedback items
      const firstRatingQ = (qData || []).find((q: any) => q.type === "rating");
      const textQIds = (qData || []).filter((q: any) => q.type === "text").map((q: any) => q.id);

      const recent: FeedbackItem[] = (rData || []).slice(0, 10).map((r: any) => {
        const answers = r.answers || {};
        const mainRating = firstRatingQ
          ? (typeof answers[firstRatingQ.id] === "number" ? answers[firstRatingQ.id] : 3)
          : 3;
        const comment = textQIds
          .map((qid: string) => typeof answers[qid] === "string" ? answers[qid].trim() : "")
          .filter((v: string) => v.length > 0)
          .join(" • ");

        return {
          id: r.id,
          date: r.submitted_at?.split("T")[0] || "",
          mainRating,
          comment,
          sentiment: getSentiment(mainRating),
        };
      });

      setRecentFeedback(recent);
    } catch (err: any) {
      toast.error("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (responses.length === 0) { toast.error("No data to export"); return; }
    const headers = ["Submitted At", ...questions.map(q => q.question)];
    const rows = responses.map(r => [
      r.submitted_at?.split("T")[0] || "",
      ...questions.map(q => {
        const a = r.answers[q.id];
        return a !== undefined ? `"${String(a).replace(/"/g, "'")}"` : "";
      })
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${selectedSurveyId}.csv`;
    a.click();
    toast.success("CSV exported!");
  };

  // Build chart data for each question
  const getChartData = (question: Question) => {
    const answers = responses.map(r => r.answers[question.id]).filter(a => a !== undefined && a !== null && a !== "");

    if (question.type === "rating") {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      answers.forEach(a => {
        const n = typeof a === "number" ? a : parseInt(a);
        if (n >= 1 && n <= 5) counts[n]++;
      });
      return Object.entries(counts).map(([rating, count]) => ({ name: `${rating} ⭐`, value: count }));
    }

    if (question.type === "yes-no") {
      const counts: Record<string, number> = { Yes: 0, No: 0 };
      answers.forEach(a => {
        const s = String(a);
        if (s === "Yes") counts.Yes++;
        else if (s === "No") counts.No++;
      });
      return [
        { name: "Yes", value: counts.Yes },
        { name: "No", value: counts.No },
      ];
    }

    if (question.type === "multiple-choice") {
      const counts: Record<string, number> = {};
      answers.forEach(a => {
        const s = String(a);
        counts[s] = (counts[s] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    return [];
  };

  const getAvgRating = (question: Question) => {
    const answers = responses
      .map(r => r.answers[question.id])
      .filter(a => typeof a === "number" && a >= 1 && a <= 5) as number[];
    if (answers.length === 0) return 0;
    return parseFloat((answers.reduce((a, b) => a + b, 0) / answers.length).toFixed(1));
  };

  const getTextAnswers = (question: Question) => {
    return responses
      .map(r => r.answers[question.id])
      .filter(a => typeof a === "string" && a.trim().length > 0) as string[];
  };

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Feedback & Analytics</h2>
          <p className="text-gray-600">Question-by-question breakdown of responses</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Survey + Date filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Select survey" />
          </SelectTrigger>
          <SelectContent>
            {surveys.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-48">
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No surveys yet. Create one first!</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">No responses yet</p>
          <p className="text-sm">Share your survey QR code to start collecting feedback</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-500">Survey: </span>
              <span className="font-medium">{selectedSurvey?.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Total responses: </span>
              <span className="font-medium">{responses.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Questions: </span>
              <span className="font-medium">{questions.length}</span>
            </div>
          </div>

          {/* Per-question cards */}
          <div className="space-y-6">
            {questions.map((question, idx) => {
              const chartData = getChartData(question);
              const totalAnswered = responses.filter(r =>
                r.answers[question.id] !== undefined && r.answers[question.id] !== null && r.answers[question.id] !== ""
              ).length;

              return (
                <Card key={question.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Question {idx + 1} · {question.type}</p>
                        <CardTitle className="text-lg font-medium">{question.question}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{totalAnswered} responses</p>
                      </div>
                      {question.type === "rating" && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-medium text-orange-500">{getAvgRating(question)}</div>
                          <div className="flex gap-0.5 justify-end mt-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-4 h-4 ${i <= Math.round(getAvgRating(question)) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">avg rating</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Rating — bar chart */}
                    {question.type === "rating" && chartData.length > 0 && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis dataKey="name" type="category" width={50} />
                          <Tooltip formatter={(val) => [`${val} responses`]} />
                          <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} name="Responses" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* Yes/No — pie chart */}
                    {question.type === "yes-no" && (
                      <div className="flex items-center gap-8">
                        <ResponsiveContainer width={220} height={220}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              dataKey="value"
                              label={renderLabel}
                              labelLine={false}
                            >
                              {chartData.map((_, i) => (
                                <Cell key={i} fill={i === 0 ? "#3b82f6" : "#ef4444"} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val) => [`${val} responses`]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {chartData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? "#3b82f6" : "#ef4444" }} />
                              <span className="font-medium">{d.name}</span>
                              <span className="text-gray-500">— {d.value} ({totalAnswered > 0 ? Math.round(d.value / totalAnswered * 100) : 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multiple choice — pie chart */}
                    {question.type === "multiple-choice" && chartData.length > 0 && (
                      <div className="flex flex-col lg:flex-row items-start gap-8">
                        <ResponsiveContainer width={220} height={220}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              dataKey="value"
                              labelLine={false}
                              label={renderPercentLabel}
                            >
                              {chartData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val) => [`${val} responses`]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex-1">
                          {chartData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="text-sm flex-1">{d.name}</span>
                              <span className="text-sm font-medium">{d.value}</span>
                              <span className="text-xs text-gray-400">({totalAnswered > 0 ? Math.round(d.value / totalAnswered * 100) : 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text — list of answers */}
                    {question.type === "text" && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {getTextAnswers(question).length === 0 ? (
                          <p className="text-gray-400 italic text-sm">No text responses yet</p>
                        ) : (
                          getTextAnswers(question).map((answer, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
                              "{answer}"
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent responses with caution for bad ones */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFeedback.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                      item.sentiment === "negative"
                        ? "border-red-200 bg-red-50 hover:border-red-400 cursor-pointer"
                        : "hover:border-orange-300"
                    }`}
                    onClick={item.sentiment === "negative" && onViewReview ? onViewReview : undefined}
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < item.mainRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{item.date}</span>
                        {item.sentiment === "negative" && (
                          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Needs attention
                          </span>
                        )}
                      </div>
                      {item.comment ? (
                        <p className="text-gray-700 text-sm">{item.comment}</p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No comment</p>
                      )}
                    </div>
                    {item.sentiment === "negative" && onViewReview && (
                      <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}