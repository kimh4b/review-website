import { useState, useEffect } from "react";
import { SurveyIntro } from "./SurveyIntro";
import { SurveyForm } from "./SurveyForm";
import { ThankYouPage } from "./ThankYouPage";

export type SurveyStep = "intro" | "form" | "thankyou";

interface SurveyData {
  restaurantName: string;
  surveyId: string;
  surveyName: string;
  isAuthenticated: boolean;
  userEmail?: string;
}

interface SurveyFlowProps {
  surveyId?: string;
  onClose?: () => void;
}

export function SurveyFlow({ surveyId = "1", onClose }: SurveyFlowProps) {
  const [currentStep, setCurrentStep] = useState<SurveyStep>("intro");
  const [surveyData] = useState<SurveyData>({
    restaurantName: "Cha Kroeung-ឆាគ្រឿង",
    surveyId,
    surveyName: "Customer Experience Survey",
    isAuthenticated: false
  });
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Auto-save responses to localStorage
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(`survey_${surveyId}_draft`, JSON.stringify(responses));
    }
  }, [responses, surveyId]);

  // Load saved responses on mount
  useEffect(() => {
    const saved = localStorage.getItem(`survey_${surveyId}_draft`);
    if (saved) {
      setResponses(JSON.parse(saved));
    }
  }, [surveyId]);

  const handleStart = (isAnonymous: boolean) => {
    if (!isAnonymous) {
      // In a real app, this would trigger social login
      surveyData.isAuthenticated = true;
      surveyData.userEmail = "customer@email.com";
    }
    setCurrentStep("form");
  };

  const handleSubmit = (formData: Record<string, any>) => {
    setResponses(formData);
    // Clear draft
    localStorage.removeItem(`survey_${surveyId}_draft`);
    setCurrentStep("thankyou");
  };

  const handleUpdateResponses = (data: Record<string, any>) => {
    setResponses(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "intro" && (
        <SurveyIntro 
          restaurantName={surveyData.restaurantName}
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
          isAuthenticated={surveyData.isAuthenticated}
          onClose={onClose}
        />
      )}
    </div>
  );
}
