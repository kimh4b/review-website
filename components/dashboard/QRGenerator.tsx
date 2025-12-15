import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function QRGenerator() {
  const [survey, setSurvey] = useState("1");
  const [brandColor, setBrandColor] = useState("#f97316");
  const [includelogo, setIncludeLogo] = useState(true);
  const [size, setSize] = useState("medium");
  const [copied, setCopied] = useState(false);

  const qrUrl = `${window.location.origin}?survey=${survey}`;

  const handleDownloadPNG = () => {
    toast.success("QR code downloaded as PNG");
  };

  const handleDownloadSVG = () => {
    toast.success("QR code downloaded as SVG");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleTestSurvey = () => {
    window.open(qrUrl, '_blank');
  };

  const sizeMap = {
    small: "200px",
    medium: "300px",
    large: "400px"
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl mb-1">QR Code Generator</h2>
          <p className="text-gray-600">Create customized QR codes for your surveys</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Customize Your QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="survey-select">Select Survey</Label>
                <Select value={survey} onValueChange={setSurvey}>
                  <SelectTrigger id="survey-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Food Quality Survey</SelectItem>
                    <SelectItem value="2">Service Experience</SelectItem>
                    <SelectItem value="3">Ambiance & Atmosphere</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size-select">QR Code Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger id="size-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (200x200px)</SelectItem>
                    <SelectItem value="medium">Medium (300x300px)</SelectItem>
                    <SelectItem value="large">Large (400x400px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-color">Brand Color</Label>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-logo"
                  checked={includelogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="include-logo" className="cursor-pointer">
                  Include logo in center
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Survey Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={qrUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleTestSurvey}
              >
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
                <div 
                  className="bg-white p-6 rounded-lg shadow-lg relative"
                  style={{ 
                    width: sizeMap[size as keyof typeof sizeMap],
                    height: sizeMap[size as keyof typeof sizeMap]
                  }}
                >
                  {/* Mock QR Code */}
                  <div className="w-full h-full grid grid-cols-8 gap-1">
                    {[...Array(64)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor: Math.random() > 0.5 ? brandColor : 'white'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Logo overlay */}
                  {includelogo && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-lg shadow"
                    >
                      <div 
                        className="w-12 h-12 rounded flex items-center justify-center"
                        style={{ backgroundColor: brandColor }}
                      >
                        <span className="text-white text-xl">★</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleDownloadPNG} className="bg-orange-500 hover:bg-orange-600">
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button onClick={handleDownloadSVG} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </div>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  Print QR Code
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

        {/* Placement Ideas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Placement Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="mb-1">Table Tents</h4>
                <p className="text-sm text-gray-600">Place on dining tables for immediate feedback</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🧾</div>
                <h4 className="mb-1">Receipts</h4>
                <p className="text-sm text-gray-600">Print QR codes on customer receipts</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🚪</div>
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