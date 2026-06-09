"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Star, Loader2, MessageSquare, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabaseClient";

interface Restaurant {
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
  surveyTitle: string;
  restaurantName: string;
  submitted_at: string;
  answers: Record<string, any>;
  mainRating: number;
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

export function AdminReviews() {


  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      // Fetch all surveys with profile info
      const { data: surveys } = await supabase
        .from("surveys")
        .select("id, title, owner_id");

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, restaurant_name")
        .neq("email", "admin@gmail.com");

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.id, p.restaurant_name || "Unknown"])
      );

      const surveyList = surveys || [];
      const surveyIds = surveyList.map((s: any) => s.id);

      if (surveyIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch responses and questions
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

      const questionTypeMap = Object.fromEntries(
        (questionData || []).map((q: any) => [q.id, q.type])
      );

      // First rating question per survey
      const firstRatingPerSurvey: Record<string, string> = {};
      (questionData || []).forEach((q: any) => {
        if (q.type === "rating" && !firstRatingPerSurvey[q.survey_id]) {
          firstRatingPerSurvey[q.survey_id] = q.id;
        }
      });

      // Survey info map
      const surveyInfoMap = Object.fromEntries(
        surveyList.map((s: any) => [s.id, { title: s.title, ownerId: s.owner_id }])
      );

      const mapped: Review[] = (responseData || []).map((r: any) => {
        const answers = r.answers || {};
        const surveyInfo = surveyInfoMap[r.survey_id] || {};
        const restaurantName = profileMap[surveyInfo.ownerId] || "Unknown";

        // Main rating
        const firstRatingId = firstRatingPerSurvey[r.survey_id];
        const mainRatingRaw = firstRatingId ? answers[firstRatingId] : null;
        const mainRating = typeof mainRatingRaw === "number"
          ? mainRatingRaw
          : parseInt(mainRatingRaw) || 3;

        // Comment from text questions only
        const comment = Object.entries(answers)
          .filter(([key]) => questionTypeMap[key] === "text")
          .map(([, v]) => typeof v === "string" ? v.trim() : "")
          .filter(v => v.length > 0)
          .join(" • ");

        return {
          id: r.id,
          survey_id: r.survey_id,
          surveyTitle: surveyInfo.title || "Unknown Survey",
          restaurantName,
          submitted_at: r.submitted_at,
          answers,
          mainRating,
          comment,
          sentiment: getSentiment(mainRating),
        };
      });

      setReviews(mapped);

      // Build restaurant list for filter
      const uniqueRestaurants = Array.from(
        new Map(mapped.map(r => [r.restaurantName, r.restaurantName])).entries()
      ).map(([id, name]) => ({ id, name }));
      setRestaurants(uniqueRestaurants);

    } catch (err: any) {
      console.error("Admin reviews error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reviews.filter(r => {
    const matchesRestaurant = restaurantFilter === "all" || r.restaurantName === restaurantFilter;
    const matchesSentiment = sentimentFilter === "all" || r.sentiment === sentimentFilter;
    const matchesSearch = searchTerm === "" ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.surveyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRestaurant && matchesSentiment && matchesSearch;
  });

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
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= num ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
            </div>
            <span className="text-sm text-gray-500">{num}/5</span>
          </div>
        );
      }
      case "yes-no":
        return (
          <div className="flex items-center gap-2">
            {String(answer).toLowerCase() === "yes"
              ? <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-700 text-sm">Yes</span></>
              : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-600 text-sm">No</span></>
            }
          </div>
        );
      case "multiple-choice": {
        const items = Array.isArray(answer) ? answer : [String(answer)];
        return (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200">{item}</span>
            ))}
          </div>
        );
      }
      case "text":
        return <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-2 border">"{String(answer)}"</p>;
      default:
        return <p className="text-gray-700 text-sm">{String(answer)}</p>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl mb-1">All Reviews</h2>
        <p className="text-gray-600">Raw feedback from every restaurant on the platform</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: reviews.length, color: "text-gray-800" },
          { label: "😊 Positive", value: reviews.filter(r => r.sentiment === "positive").length, color: "text-green-600" },
          { label: "😐 Neutral", value: reviews.filter(r => r.sentiment === "neutral").length, color: "text-yellow-600" },
          { label: "😞 Negative", value: reviews.filter(r => r.sentiment === "negative").length, color: "text-red-500" },
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by comment, restaurant, or survey..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Restaurants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="positive">😊 Positive</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="negative">😞 Negative</SelectItem>
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
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const surveyQuestions = allQuestions
              .filter(q => q.survey_id === review.survey_id)
              .sort((a, b) => a.order_index - b.order_index);
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
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base ${
                        review.sentiment === "positive" ? "bg-green-100" :
                        review.sentiment === "negative" ? "bg-red-100" : "bg-yellow-100"
                      }`}>
                        {review.sentiment === "positive" ? "😊" : review.sentiment === "negative" ? "😞" : "😐"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= review.mainRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
                          </div>
                          <span className="text-xs font-medium text-gray-600">{review.mainRating}/5</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-medium text-orange-600">{review.restaurantName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400 truncate">{review.surveyTitle}</span>
                          {review.sentiment === "negative" && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">
                              <AlertCircle className="w-3 h-3" />
                              Needs attention
                            </span>
                          )}
                        </div>
                        {review.comment
                          ? <p className="text-sm text-gray-600 line-clamp-1">{review.comment}</p>
                          : <p className="text-sm text-gray-400 italic">No comment — click to expand</p>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-400">{timeAgo(review.submitted_at)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                        <span><strong>Restaurant:</strong> {review.restaurantName}</span>
                        <span><strong>Survey:</strong> {review.surveyTitle}</span>
                        <span><strong>Submitted:</strong> {new Date(review.submitted_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Full Response</p>
                      {surveyQuestions.map((q, idx) => (
                        <div key={q.id} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Q{idx + 1}</span>
                            <p className="text-sm font-medium text-gray-800">{q.question}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto flex-shrink-0 ${
                              q.type === "rating" ? "bg-yellow-50 text-yellow-700" :
                              q.type === "text" ? "bg-blue-50 text-blue-700" :
                              q.type === "yes-no" ? "bg-green-50 text-green-700" :
                              "bg-purple-50 text-purple-700"
                            }`}>{q.type}</span>
                          </div>
                          <div className="pl-5">{getAnswerDisplay(q, review.answers[q.id])}</div>
                        </div>
                      ))}
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