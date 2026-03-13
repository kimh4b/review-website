"use client";

import { useRouter } from "next/navigation";
import { SurveyFlow } from "@/components/survey-flow/SurveyFlow";

export default function SurveyPage() {
  const router = useRouter();

  return (
    <SurveyFlow onClose={() => router.push("/")} />
  );
}