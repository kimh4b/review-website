"use client";

import { useState, useEffect } from "react";
import { SurveyIntro } from "./SurveyIntro";
import { SurveyForm } from "./SurveyForm";
import { ThankYouPage } from "./ThankYouPage";
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
  isPreview?: boolean;
}

export function SurveyFlow({ surveyId = "", onClose, isPreview = false }: SurveyFlowProps) {

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
  const [notAvailable, setNotAvailable] = useState<"draft" | "closed" | null>(null); 

  useEffect(() => {
    if (!surveyId) return;
    fetchSurveyData();
    loadDraft();
  }, [surveyId]);

  const fetchSurveyData = async () => {
    
    try {
      const { data: survey, error } = await supabase
        .from("surveys")
        .select("id, title, owner_id, restaurant_name, status, branch_id, branches(name)")
        .eq("id", surveyId)
        .single();

      if (error || !survey) {
        setNotFound(true);
        return;
      }

      const rawStatus = survey.status?.toLowerCase();
      const normalizedStatus =
        rawStatus === "archived" ? "closed"
        : rawStatus === "active" || rawStatus === "draft" || rawStatus === "closed"
        ? rawStatus
        : "draft";

      if (!isPreview && (normalizedStatus === "draft" || normalizedStatus === "closed")) {
        setNotAvailable(normalizedStatus);
        return;
      }

      setSurveyData({
        restaurantName: survey.restaurant_name || survey.title,
        surveyId: survey.id,
        surveyName: survey.title,
        branchName: survey.branches?.[0]?.name || undefined,
        isAuthenticated: false,
      });

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

  const handleStart = () => setCurrentStep("form");

  const handleSubmit = async (formData: Record<string, any>) => {

    // Preview mode — don't save anything
    if (isPreview) {
      setResponses(formData);
      setVoucherCode("PREVIEW-MODE");
      setCurrentStep("thankyou");
      return;
    }

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

   if (notAvailable === "closed") {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full  p-10">
        <div className="w-18 h-18 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}>
          <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium text-gray-900 mb-3">Thanks for stopping by!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This survey is closed and we're no longer collecting responses. Thank you for your interest — we hope to hear from you next time!
        </p>
        <div className="bg-amber-50 rounded-xl px-5 py-3">
          <p className="text-amber-800 text-sm font-medium">Hope to see you next time !</p>
        </div>
      </div>
    </div>
  );
}

if (notAvailable === "draft") {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full  p-10">
        <div className="rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}>
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium text-gray-900 mb-3">Something exciting is coming!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          We're still setting things up. This survey will be available soon — please check back later.
        </p>
        <div className="bg-gray-100 rounded-xl px-5 py-3">
          <p className="text-gray-600 text-sm font-medium">Check back soon, it won't be long</p>
        </div>
      </div>
    </div>
  );
}

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
      {isPreview && (
      <div className="bg-yellow-400 text-yellow-900 text-center text-sm py-2 font-medium">
        Preview Mode — responses will not be saved
      </div>
    )}
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