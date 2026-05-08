// app/survey/[id]/page.tsx
import { SurveyFlow } from "@/components/survey-flow/SurveyFlow";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SurveyFlow surveyId={id} />;
}