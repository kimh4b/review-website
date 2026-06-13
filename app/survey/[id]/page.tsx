// app/survey/[id]/page.tsx
import { SurveyFlow } from "@/components/survey-flow/SurveyFlow";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const { preview } = await searchParams;
  return <SurveyFlow surveyId={id} isPreview={preview === "true"} />;
}