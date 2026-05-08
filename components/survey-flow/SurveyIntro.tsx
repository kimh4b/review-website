import { Button } from "../ui/button";
import { Star, Clock, Shield, FileLock } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
}

interface SurveyIntroProps {
  restaurantName: string;
  questions: Question[];
  onStart: () => void;
}

export function SurveyIntro({ restaurantName, questions, onStart }: SurveyIntroProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Star className="w-9 h-9 text-white fill-white" />
          </div>
          <h1 className="text-3xl mb-2">{restaurantName}</h1>
          <p className="text-gray-600">We'd love your feedback!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Time Estimate */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-orange-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-sm">Takes only 2 minutes</div>
              <div className="text-xs text-gray-600">Help us improve your experience</div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 mb-6"
            onClick={onStart}
          >
            <Shield className="w-5 h-5 mr-2" />
            Start Survey
          </Button>

          {/* Privacy Note */}
          <div className="flex items-center justify-center text-xs text-gray-500 text-center">
            <FileLock className="mr-2" size={18} />
            <p>Your responses are confidential and help us serve you better</p>
          </div>
        </div>

        {/* What to Expect — real questions */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm mb-3">What we'll ask about:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {questions.map((q) => (
                <li key={q.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  {q.question}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}