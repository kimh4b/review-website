"use client";

import { useState, useEffect } from "react";
import { SurveyIntro } from "./SurveyIntro";
import { SurveyForm } from "./SurveyForm";
import { ThankYouPage } from "./ThankYouPage";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabaseClient";

export type SurveyStep = "intro" | "form" | "thankyou";

interface SurveyData {
  restaurantName: string;
  surveyId: string;
  surveyName: string;
  branchName?: string;
  isAuthenticated: boolean;
}

interface Question {
  id: string;
  question: string;
  type: string;
}

interface SurveyFlowProps {
  surveyId?: string;
  onClose?: () => void;
}

export function SurveyFlow({ surveyId = "", onClose }: SurveyFlowProps) {

  const [currentStep, setCurrentStep] = useState<SurveyStep>("intro");
  const [surveyData, setSurveyData] = useState<SurveyData>({
    restaurantName: "Loading...",
    surveyId,
    surveyName: "Customer Feedback",
    isAuthenticated: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!surveyId) return;
    fetchSurveyData();
    loadDraft();
  }, [surveyId]);

  const fetchSurveyData = async () => {
    try {
      // Fetch survey info
      const { data: survey, error } = await supabase
        .from("surveys")
        .select("id, title, owner_id, restaurant_name, branch_id, branches(name)")
        .eq("id", surveyId)
        .single();

      if (error || !survey) {
        setNotFound(true);
        return;
      }

      // Try to get restaurant name from owner's metadata
      // We store it in the survey owner's user metadata
      // For now use survey title as fallback
      setSurveyData({
        restaurantName: survey.restaurant_name || survey.title,
        surveyId: survey.id,
        surveyName: survey.title,
        branchName: survey.branches?.[0]?.name || undefined,
        isAuthenticated: false,
      });

      // Fetch questions
      const { data: qs } = await supabase
        .from("survey_questions")
        .select("id, question, type")
        .eq("survey_id", surveyId)
        .order("order_index", { ascending: true });

      setQuestions(qs || []);
    } catch (err) {
      setNotFound(true);
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(`survey_${surveyId}_draft`);
      if (saved) setResponses(JSON.parse(saved));
    } catch {}
  };

  const createVoucherCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment()}-${segment()}`;
  };

  const handleStart = () => {
    setCurrentStep("form");
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    const code = createVoucherCode();
    let hasError = false;

    try {
      const { error } = await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        answers: formData,
      });

      if (error) {
        hasError = true;
        console.error("Failed to save response:", error);
      }
    } catch (err) {
      hasError = true;
      console.error("Failed to save response:", err);
    } finally {
      localStorage.removeItem(`survey_${surveyId}_draft`);
    }

    if (!hasError) {
      setResponses(formData);
      setVoucherCode(code);
      setCurrentStep("thankyou");
    }
  };

  const handleUpdateResponses = (data: Record<string, any>) => {
    setResponses(data);
    if (Object.keys(data).length > 0) {
      localStorage.setItem(`survey_${surveyId}_draft`, JSON.stringify(data));
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Survey not found</h2>
          <p className="text-gray-600">This survey link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "intro" && (
        <SurveyIntro
          restaurantName={surveyData.restaurantName}
          branchName={surveyData.branchName}
          questions={questions}
          onStart={handleStart}
        />
      )}

      {currentStep === "form" && (
        <SurveyForm
          surveyData={surveyData}
          initialResponses={responses}
          onSubmit={handleSubmit}
          onUpdate={handleUpdateResponses}
        />
      )}

      {currentStep === "thankyou" && (
        <ThankYouPage
          restaurantName={surveyData.restaurantName}
          branchName={surveyData.branchName}
          discountCode={voucherCode}
          onClose={onClose}
        />
      )}
    </div>
  );
}