"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Star, Loader2, MessageSquare, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Survey {
  id: string;
  name: string;
}

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
  mainRating: number; // first rating question
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
}

function getSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ReviewsProps {
  defaultFilter?: "negative";
}

export function Reviews({ defaultFilter }: ReviewsProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("all");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>(defaultFilter || "all");

  useEffect(() => {
    if (!user) return;
    fetchSurveys();
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [selectedSurveyId, surveys]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys((data || []).map((s: any) => ({ id: s.id, name: s.title })));
    } catch (err: any) {
      toast.error("Failed to load surveys");
    }
  };

  const fetchReviews = async () => {
    if (surveys.length === 0 && selectedSurveyId === "all") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const surveyIds = selectedSurveyId === "all"
        ? surveys.map(s => s.id)
        : [selectedSurveyId];

      if (surveyIds.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const [{ data: responseData }, { data: questionData }] = await Promise.all([
        supabase
          .from("survey_responses")
          .select("id, survey_id, answers, submitted_at")
          .in("survey_id", surveyIds)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("survey_questions")
          .select("id, question, type, order_index, survey_id")
          .in("survey_id", surveyIds)
          .order("order_index", { ascending: true }),
      ]);

      setAllQuestions(questionData || []);

      // Build question maps
      const questionTypeMap = Object.fromEntries(
        (questionData || []).map((q: any) => [q.id, q.type])
      );

      // Find first rating question per survey
      const firstRatingPerSurvey: Record<string, string> = {};
      (questionData || []).forEach((q: any) => {
        if (q.type === "rating" && !firstRatingPerSurvey[q.survey_id]) {
          firstRatingPerSurvey[q.survey_id] = q.id;
        }
      });

      const mapped: Review[] = (responseData || []).map((r: any) => {
        const answers = r.answers || {};

        // Main rating = first rating question for this survey
        const firstRatingId = firstRatingPerSurvey[r.survey_id];
        const mainRatingRaw = firstRatingId ? answers[firstRatingId] : null;
        const mainRating = typeof mainRatingRaw === "number"
          ? mainRatingRaw
          : parseInt(mainRatingRaw) || 3;

        // Comment = only text type question answers
        const comment = Object.entries(answers)
          .filter(([key]) => questionTypeMap[key] === "text")
          .map(([, v]) => typeof v === "string" ? v.trim() : "")
          .filter(v => v.length > 0)
          .join(" • ");

        return {
          id: r.id,
          survey_id: r.survey_id,
          submitted_at: r.submitted_at,
          answers,
          mainRating,
          comment,
          sentiment: getSentiment(mainRating),
        };
      });

      setReviews(mapped);
    } catch (err: any) {
      toast.error("Failed to load reviews: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reviews.filter(r =>
    sentimentFilter === "all" || r.sentiment === sentimentFilter
  );

  const getAnswerDisplay = (question: Question, answer: any) => {
    if (answer === undefined || answer === null || answer === "") {
      return <span className="text-gray-400 italic text-sm">No answer</span>;
    }

    switch (question.type) {
      case "rating": {
        const num = typeof answer === "number" ? answer : parseInt(answer) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= num ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">{num}/5</span>
          </div>
        );
      }
      case "yes-no":
        return (
          <div className="flex items-center gap-2">
            {String(answer).toLowerCase() === "yes" ? (
              <><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-green-700 font-medium">Yes</span></>
            ) : (
              <><XCircle className="w-5 h-5 text-red-400" /><span className="text-red-600 font-medium">No</span></>
            )}
          </div>
        );
      case "multiple-choice":
        return (
          <span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200">
            {String(answer)}
          </span>
        );
      case "text":
        return (
          <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 border">
            {String(answer)}
          </p>
        );
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
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select survey" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surveys</SelectItem>
            {surveys.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="positive">😊 Positive</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="negative">😞 Needs Attention</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
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

            return (
              <Card
                key={review.id}
                className={`border-l-4 transition-shadow hover:shadow-md ${
                  review.sentiment === "positive" ? "border-l-green-400" :
                  review.sentiment === "negative" ? "border-l-red-400" :
                  "border-l-yellow-400"
                }`}
              >
                <CardContent className="pt-4 pb-4">
                  {/* Header row — click to expand */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg
                        ${review.sentiment === "positive" ? "bg-green-100" :
                          review.sentiment === "negative" ? "bg-red-100" : "bg-yellow-100"}
                      `}>
                        {review.sentiment === "positive" ? "😊" :
                         review.sentiment === "negative" ? "😞" : "😐"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={`w-4 h-4 ${i <= review.mainRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{review.mainRating}/5</span>
                          {review.sentiment === "negative" && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              <AlertCircle className="w-3 h-3" />
                              Needs attention
                            </span>
                          )}
                        </div>
                        {review.comment ? (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{review.comment}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic mt-0.5">No comment — click to see full response</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-400">{timeAgo(review.submitted_at)}</span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded — ALL questions and answers */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Full Response</p>
                      {surveyQuestions.map((q, idx) => {
                        const answer = review.answers[q.id];
                        return (
                          <div key={q.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium">Q{idx + 1}</span>
                              <p className="text-sm font-medium text-gray-800">{q.question}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ml-auto flex-shrink-0 ${
                                q.type === "rating" ? "bg-yellow-50 text-yellow-700" :
                                q.type === "text" ? "bg-blue-50 text-blue-700" :
                                q.type === "yes-no" ? "bg-green-50 text-green-700" :
                                "bg-purple-50 text-purple-700"
                              }`}>
                                {q.type}
                              </span>
                            </div>
                            <div className="pl-6">
                              {getAnswerDisplay(q, answer)}
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-xs text-gray-400 pt-2 border-t">
                        Submitted: {new Date(review.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}