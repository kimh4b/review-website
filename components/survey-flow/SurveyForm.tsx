"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Star, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Question {
  id: string;
  type: "rating" | "text" | "multiple-choice" | "yes-no";
  question: string;
  required: boolean;
  options?: string[];
  order_index: number;
}

interface SurveyFormProps {
  surveyData: {
    restaurantName: string;
    surveyId: string;
    surveyName: string;
    isAuthenticated: boolean;
  };
  initialResponses: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onUpdate: (data: Record<string, any>) => void;
}

export function SurveyForm({
  surveyData,
  initialResponses,
  onSubmit,
  onUpdate,
}: SurveyFormProps) {
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Load questions from Supabase
  useEffect(() => {
    if (!surveyData.surveyId) return;
    fetchQuestions();
  }, [surveyData.surveyId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyData.surveyId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback: use default questions if none saved
        setQuestions([
          {
            id: "overall",
            type: "rating",
            question: "How would you rate your overall experience?",
            required: true,
            order_index: 0,
          },
          {
            id: "comment",
            type: "text",
            question: "Any additional comments?",
            required: false,
            order_index: 1,
          },
        ]);
      } else {
        setQuestions(
          data.map((q: any) => ({
            id: q.id,
            type: q.type as Question["type"],
            question: q.question,
            required: q.required ?? false,
            options: q.options || [],
            order_index: q.order_index,
          }))
        );
      }
    } catch (err: any) {
      toast.error("Failed to load questions");
      // Fallback questions
      setQuestions([
        {
          id: "overall",
          type: "rating",
          question: "How would you rate your overall experience?",
          required: true,
          order_index: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // Auto-save responses
  useEffect(() => {
    onUpdate(responses);
  }, [responses]);

  const validateCurrentQuestion = () => {
    if (!question) return true;
    if (question.required && !responses[question.id]) {
      setErrors({ [question.id]: "This field is required" });
      setShowValidation(true);
      return false;
    }
    setErrors({});
    setShowValidation(false);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      toast.error("Please answer the required question");
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowValidation(false);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowValidation(false);
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.required && !responses[q.id]) {
        newErrors[q.id] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please answer all required questions");
      const firstErrorIndex = questions.findIndex((q) => newErrors[q.id]);
      setCurrentQuestion(firstErrorIndex);
      setShowValidation(true);
      return;
    }

    onSubmit(responses);
  };

  const updateResponse = (value: any) => {
    if (!question) return;
    const updated = { ...responses, [question.id]: value };
    setResponses(updated);
    if (errors[question.id]) {
      setErrors({ ...errors, [question.id]: "" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (questions.length === 0 || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No questions found for this survey.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm text-gray-600">{surveyData.restaurantName}</h2>
              <p className="text-xs text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <p className="text-sm text-gray-500">{surveyData.surveyName}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 md:p-8 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {showValidation && errors[question.id] && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                {errors[question.id]}
              </div>
            )}
          </div>

          {/* Rating */}
          {question.type === "rating" && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2 md:gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateResponse(rating)}
                    className={`transition-all transform hover:scale-110 ${
                      responses[question.id] === rating ? "scale-125" : ""
                    }`}
                  >
                    <Star
                      className={`w-12 h-12 md:w-16 md:h-16 ${
                        responses[question.id] >= rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs md:text-sm text-gray-600 px-2">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          )}

          {/* Text */}
          {question.type === "text" && (
            <Textarea
              value={responses[question.id] || ""}
              onChange={(e) => updateResponse(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              className="text-base"
            />
          )}

          {/* Multiple Choice */}
          {question.type === "multiple-choice" && (
            <div className="space-y-3">
              {(question.options || []).map((option) => (
                <button
                  key={option}
                  onClick={() => updateResponse(option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    responses[question.id] === option
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        responses[question.id] === option
                          ? "border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {responses[question.id] === option && (
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Yes/No */}
          {question.type === "yes-no" && (
            <div className="flex gap-4">
              {["Yes", "No"].map((option) => (
                <button
                  key={option}
                  onClick={() => updateResponse(option)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    responses[question.id] === option
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {currentQuestion > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1 md:flex-initial">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 bg-orange-500 hover:bg-orange-600">
            {currentQuestion === questions.length - 1 ? (
              "Submit"
            ) : (
              <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}