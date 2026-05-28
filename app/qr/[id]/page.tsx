"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function QRRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const trackAndRedirect = async () => {
      const surveyId = params.id as string;

      // Save scan
      await supabase.from("qr_scans").insert({
        survey_id: surveyId,
      });

      // Redirect to actual survey
      router.replace(`/survey/${surveyId}`);
    };

    trackAndRedirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}