import { useState } from "react";
import { Button } from "../ui/button";
import { CheckCircle2, Copy, Check, Share2, MessageCircle, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ThankYouPageProps {
  restaurantName: string;
  branchName?: string;
  discountCode: string;
  onClose?: () => void;
}

export function ThankYouPage({ restaurantName, branchName, discountCode, onClose }: ThankYouPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    toast.success("Discount code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    toast.success(`Sharing to ${platform}...`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Thank you!</h1>
          <p className="text-gray-600">
            Your feedback helps {branchName ? `${branchName} at ${restaurantName}` : `${restaurantName}`} get better
          </p>
        </div>

        {/* Discount Code */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl mb-1">10% off your next visit</h2>
            <p className="text-sm text-gray-600">Show this code at checkout</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 mb-4 text-center">
            <div className="text-white text-3xl tracking-wider mb-1">{discountCode}</div>
            <div className="text-orange-100 text-sm">Valid for 15 days</div>
          </div>

          <Button onClick={handleCopyCode} variant="outline" className="w-full">
            {copied ? (
              <><Check className="w-4 h-4 mr-2" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" /> Copy Code</>
            )}
          </Button>
        </div>

        {/* Share */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-sm mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share your experience
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" size="sm" onClick={() => handleShare("Facebook")} className="flex flex-col items-center gap-2 h-auto py-3">
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("Twitter")} className="flex flex-col items-center gap-2 h-auto py-3">
              <Twitter className="w-5 h-5 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("SMS")} className="flex flex-col items-center gap-2 h-auto py-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs">SMS</span>
            </Button>
          </div>
        </div>

        {onClose && (
          <Button variant="outline" className="w-full" onClick={onClose}>
            Done
          </Button>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">Powered by FeedbackPro</p>
        </div>
      </div>
    </div>
  );
}