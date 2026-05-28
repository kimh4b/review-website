"use client";

import { SurveyForm } from "@/components/survey-flow/SurveyForm";
import { useRouter } from "next/navigation";

export default function DemoSurveyPage() {
  const router = useRouter();

  return (
    <SurveyForm
      surveyData={{
        restaurantName: "Demo Restaurant",
        surveyId: "demo",
        surveyName: "Demo Survey",
        isAuthenticated: false,
      }}
      initialResponses={{}}
      isDemo={true}
      onUpdate={() => {}}
      onSubmit={() => {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }}
    />
  );
}