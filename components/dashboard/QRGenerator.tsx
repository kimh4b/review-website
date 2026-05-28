"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Survey {
  id: string;
  name: string;
}

export function QRGenerator() {
  const { user } = useAuth();
  const supabase = createClient();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [brandColor, setBrandColor] = useState("#f97316");
  const [size, setSize] = useState<"200" | "300" | "400">("300");
  const [copied, setCopied] = useState(false);
  const [scanCount, setScanCount] = useState(0); 
  const [responsesCount, setResponsesCount] = useState(0);

   useEffect(() => {
  if (selectedSurveyId) {
    fetchScanCount();
    fetchResponsesCount();
  }
}, [selectedSurveyId]);

  const fetchScanCount = async () => {
    const { count } = await supabase
      .from("qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("survey_id", selectedSurveyId);

    setScanCount(count || 0);
  };

  const fetchResponsesCount = async () => {
  const { count } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", selectedSurveyId);

  setResponsesCount(count || 0);
};

  useEffect(() => {
    if (!user) return;
    fetchSurveys();
  }, [user]);

  const fetchSurveys = async () => {
    setLoadingSurveys(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        name: s.title,
      }));

      setSurveys(mapped);
      if (mapped.length > 0) setSelectedSurveyId(mapped[0].id);
    } catch (err: any) {
      toast.error("Failed to load surveys: " + err.message);
    } finally {
      setLoadingSurveys(false);
    }
  };

  const surveyUrl = selectedSurveyId
    ? `${window.location.origin}/qr/${selectedSurveyId}`
    : "";

  // Use goqr.me free API to generate a real QR code
  const qrImageUrl = surveyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(surveyUrl)}&color=${brandColor.replace("#", "")}&bgcolor=ffffff`
    : "";

  const handleCopyLink = () => {
    if (!surveyUrl) return;
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `survey-qr-${selectedSurveyId}.png`;
    link.target = "_blank";
    link.click();
    toast.success("QR code downloaded");
  };

  const handleTestSurvey = () => {
    if (!surveyUrl) return;
    window.open(surveyUrl, "_blank");
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl mb-1">QR Code Generator</h2>
          <p className="text-gray-600">Create QR codes for your surveys</p>
        </div>

        {loadingSurveys ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No surveys found</p>
            <p className="text-sm">Create a survey first to generate a QR code</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Customize Your QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Survey selector */}
                <div className="space-y-2">
                  <Label htmlFor="survey-select">Select Survey</Label>
                  <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                    <SelectTrigger id="survey-select">
                      <SelectValue placeholder="Choose a survey" />
                    </SelectTrigger>
                    <SelectContent>
                      {surveys.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="size-select">QR Code Size</Label>
                  <Select value={size} onValueChange={(v) => setSize(v as any)}>
                    <SelectTrigger id="size-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="200">Small (200x200px)</SelectItem>
                      <SelectItem value="300">Medium (300x300px)</SelectItem>
                      <SelectItem value="400">Large (400x400px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Color */}
                <div className="space-y-2">
                  <Label htmlFor="brand-color">QR Code Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="brand-color"
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Survey Link */}
                <div className="space-y-2">
                  <Label>Survey Link</Label>
                  <div className="flex gap-2">
                    <Input value={surveyUrl} readOnly className="flex-1 text-sm" />
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleTestSurvey}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Survey (Opens in new tab)
                </Button>
              </CardContent>
            </Card>

            {/* Preview & Download */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      width={parseInt(size)}
                      height={parseInt(size)}
                      className="rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      Select a survey
                    </div>
                  )}
                </div>

                {/* QR Stats */}
<div className="grid grid-cols-2 gap-4">
  <Card className="border-orange-100 shadow-none">
    <CardContent className="pt-6">
      <div className="text-3xl font-bold text-orange-500">
        {scanCount}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Total Scans
      </p>
    </CardContent>
  </Card>

  <Card className="border-green-100 shadow-none">
    <CardContent className="pt-6">
      <div className="text-3xl font-bold text-green-500">
        {responsesCount}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Responses
      </p>
    </CardContent>
  </Card>
</div>

<div className="space-y-3">
  <Button
    onClick={handleDownloadPNG}
    className="w-full bg-orange-500 hover:bg-orange-600"
    disabled={!qrImageUrl}
  >
    <Download className="w-4 h-4 mr-2" />
    Download QR Code (PNG)
  </Button>
</div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm mb-2">Tips for best results:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Use high contrast colors for better scanning</li>
                    <li>Print at least 2x2 inches for reliable scanning</li>
                    <li>Test the QR code before mass printing</li>
                    <li>Place codes at eye level for easy access</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placement Ideas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Placement Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
      
                <h4 className="mb-1">Table Tents</h4>
                <p className="text-sm text-gray-600">Place on dining tables for immediate feedback</p>
              </div>
              <div className="p-4 border rounded-lg">
             
                <h4 className="mb-1">Receipts</h4>
                <p className="text-sm text-gray-600">Print QR codes on customer receipts</p>
              </div>
              <div className="p-4 border rounded-lg">
               
                <h4 className="mb-1">Exit Signs</h4>
                <p className="text-sm text-gray-600">Catch customers as they leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}