"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Star, Loader2, MessageSquare, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { extractMainRating, extractComment, getSentiment, timeAgo } from "./surveyHelpers";

interface Survey { id: string; name: string; }

interface Question {
  id: string;
  question: string;
  type: string;
  order_index: number;
  survey_id: string;
}

interface Review {
  id: string;
  survey_id: string;
  submitted_at: string;
  answers: Record<string, any>;
  mainRating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface ReviewsProps {
  defaultFilter?: "negative";
  expandReviewId?: string;
}

export function Reviews({ defaultFilter, expandReviewId }: ReviewsProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("all");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>(defaultFilter || "all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { if (!user) return; fetchSurveys(); }, [user]);
  useEffect(() => { fetchReviews(); }, [selectedSurveyId, surveys]);

  useEffect(() => {
    if (expandReviewId && reviews.length > 0) {
      setExpandedId(expandReviewId);
      setSentimentFilter("all");
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById(`review-${expandReviewId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      });
    }
  }, [expandReviewId, reviews]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys").select("id, title").eq("owner_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      setSurveys((data || []).map((s: any) => ({ id: s.id, name: s.title })));
    } catch { toast.error("Failed to load surveys"); }
  };

  const fetchReviews = async () => {
    if (surveys.length === 0 && selectedSurveyId === "all") { setLoading(false); return; }
    setLoading(true);
    try {
      const surveyIds = selectedSurveyId === "all" ? surveys.map(s => s.id) : [selectedSurveyId];
      if (surveyIds.length === 0) { setReviews([]); setLoading(false); return; }

      const [{ data: responseData }, { data: questionData }] = await Promise.all([
        supabase.from("survey_responses").select("id, survey_id, answers, submitted_at").in("survey_id", surveyIds).order("submitted_at", { ascending: false }),
        supabase.from("survey_questions").select("id, question, type, order_index, survey_id").in("survey_id", surveyIds).order("order_index", { ascending: true }),
      ]);

      setAllQuestions(questionData || []);
      const questionTypeMap = Object.fromEntries((questionData || []).map((q: any) => [q.id, q.type]));

      const mapped: Review[] = (responseData || []).map((r: any) => {
        const answers = r.answers || {};
        const mainRating = extractMainRating(answers, questionTypeMap);
        const comment = extractComment(answers, questionTypeMap);
        return { id: r.id, survey_id: r.survey_id, submitted_at: r.submitted_at, answers, mainRating, comment, sentiment: getSentiment(mainRating) };
      });

      setReviews(mapped);
    } catch (err: any) {
      toast.error("Failed to load reviews: " + err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async (reviewId: string, e: React.MouseEvent) => {
      console.log("DELETE CLICKED", reviewId);

    e.stopPropagation(); // prevent expanding
    if (!confirm("Delete this response? This cannot be undone.")) return;
    setDeletingId(reviewId);
   try {
  const result = await supabase
    .from("survey_responses")
    .delete()
    .eq("id", reviewId);

  console.log("DELETE RESULT", result);

  if (result.error) throw result.error;

  setReviews(prev => prev.filter(r => r.id !== reviewId));

  if (expandedId === reviewId) {
    setExpandedId(null);
  }

  toast.success("Response deleted");
} catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    } finally { setDeletingId(null); }
  };

  const filtered = reviews.filter(r => sentimentFilter === "all" || r.sentiment === sentimentFilter);

  const getAnswerDisplay = (question: Question, answer: any) => {
    if (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
      return <span className="text-gray-400 italic text-sm">No answer</span>;
    }
    switch (question.type) {
      case "rating": {
        const num = typeof answer === "number" ? answer : parseInt(answer) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= num ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
            </div>
            <span className="text-sm text-gray-500 font-medium">{num}/5</span>
          </div>
        );
      }
      case "yes-no":
        return (
          <div className="flex items-center gap-2">
            {String(answer).toLowerCase() === "yes"
              ? <><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-green-700 font-medium">Yes</span></>
              : <><XCircle className="w-5 h-5 text-red-400" /><span className="text-red-600 font-medium">No</span></>
            }
          </div>
        );
      case "multiple-choice": {
        const items = Array.isArray(answer) ? answer : [String(answer)];
        return (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200">{item}</span>
            ))}
          </div>
        );
      }
      case "text":
        return <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 border">{String(answer)}</p>;
      default:
        return <p className="text-gray-700 text-sm">{String(answer)}</p>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Reviews</h2>
        <p className="text-gray-600">View individual customer responses in detail</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: reviews.length, color: "text-gray-800" },
          { label: "😊 Positive", value: reviews.filter(r => r.sentiment === "positive").length, color: "text-green-600" },
          { label: "😐 Neutral", value: reviews.filter(r => r.sentiment === "neutral").length, color: "text-yellow-600" },
          { label: "😞 Needs Attention", value: reviews.filter(r => r.sentiment === "negative").length, color: "text-red-500" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className={`text-3xl mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select survey" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surveys</SelectItem>
            {surveys.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="positive">😊 Positive</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="negative">😞 Needs Attention</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">No reviews found</p>
          <p className="text-sm">Try changing your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const surveyQuestions = allQuestions.filter(q => q.survey_id === review.survey_id);
            const isExpanded = expandedId === review.id;
            const isDeleting = deletingId === review.id;

            return (
              <Card
                key={review.id}
                id={`review-${review.id}`}
                className={`border-l-4 transition-shadow hover:shadow-md ${
                  review.sentiment === "positive" ? "border-l-green-400" :
                  review.sentiment === "negative" ? "border-l-red-400" : "border-l-yellow-400"
                }`}
              >
                <CardContent className="pt-4 pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : review.id)}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                        review.sentiment === "positive" ? "bg-green-100" :
                        review.sentiment === "negative" ? "bg-red-100" : "bg-yellow-100"
                      }`}>
                        {review.sentiment === "positive" ? "😊" : review.sentiment === "negative" ? "😞" : "😐"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.mainRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{review.mainRating}/5</span>
                          {review.sentiment === "negative" && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              <AlertCircle className="w-3 h-3" />Needs attention
                            </span>
                          )}
                        </div>
                        {review.comment
                          ? <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{review.comment}</p>
                          : <p className="text-sm text-gray-400 italic mt-0.5">No comment — click to see full response</p>
                        }
                      </div>
                    </div>

                    {/* Right side: time + delete + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                      <span className="text-xs text-gray-400">{timeAgo(review.submitted_at)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(review.id, e)}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        {isDeleting
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                      <div onClick={() => setExpandedId(isExpanded ? null : review.id)} className="cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? "max-h-[2000px] opacity-100 mt-4 pt-4 border-t" : "max-h-0 opacity-0"
                  }`}>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold">Full Response</p>
                        <span className="text-xs text-gray-400">Submitted {new Date(review.submitted_at).toLocaleString()}</span>
                      </div>

                      {surveyQuestions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl border bg-white p-4 shadow-sm">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800">{q.question}</p>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                  q.type === "rating" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                                  q.type === "text" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                  q.type === "yes-no" ? "bg-green-50 text-green-700 border border-green-200" :
                                  "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}>{q.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="pl-10">{getAnswerDisplay(q, review.answers[q.id])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}