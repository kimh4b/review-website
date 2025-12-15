import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Star, ArrowRight, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
    id: string;
    type: "rating" | "slider" | "text" | "multiple-choice";
    question: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
}

const questions: Question[] = [
    {
        id: "overall",
        type: "rating",
        question: "How would you rate your overall experience?",
        required: true,
    },
    {
        id: "food",
        type: "slider",
        question: "How satisfied were you with the food quality?",
        required: true,
        min: 1,
        max: 5,
    },
    {
        id: "service",
        type: "slider",
        question: "How would you rate our service?",
        required: true,
        min: 1,
        max: 5,
    },
    {
        id: "ambiance",
        type: "slider",
        question: "How was the ambiance and atmosphere?",
        required: false,
        min: 1,
        max: 5,
    },
    {
        id: "favorite",
        type: "text",
        question: "What did you enjoy most about your visit?",
        required: false,
    },
    {
        id: "improve",
        type: "text",
        question: "What could we improve?",
        required: false,
    },
    {
        id: "recommend",
        type: "multiple-choice",
        question: "Would you recommend us to friends and family?",
        required: true,
        options: [
            "Definitely",
            "Probably",
            "Not sure",
            "Probably not",
            "Definitely not",
        ],
    },
];

interface SurveyFormProps {
    surveyData: {
        restaurantName: string;
        surveyId: string;
        surveyName: string;
        isAuthenticated: boolean;
    };
    initialResponses: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    onUpdate: (data: Record<string, any>) => void;
}

export function SurveyForm({
    surveyData,
    initialResponses,
    onSubmit,
    onUpdate,
}: SurveyFormProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] =
        useState<Record<string, any>>(initialResponses);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidation, setShowValidation] = useState(false);

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    // Auto-save when responses change
    useEffect(() => {
        onUpdate(responses);
    }, [responses, onUpdate]);

    const validateCurrentQuestion = () => {
        if (question.required && !responses[question.id]) {
            setErrors({ [question.id]: "This field is required" });
            setShowValidation(true);
            return false;
        }
        setErrors({});
        setShowValidation(false);
        return true;
    };

    const handleNext = () => {
        if (!validateCurrentQuestion()) {
            toast.error("Please answer the required question");
            return;
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowValidation(false);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setShowValidation(false);
        }
    };

    const handleSubmit = () => {
        // Validate all required fields
        const newErrors: Record<string, string> = {};
        questions.forEach((q) => {
            if (q.required && !responses[q.id]) {
                newErrors[q.id] = "This field is required";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please answer all required questions");
            // Go to first question with error
            const firstErrorIndex = questions.findIndex((q) => newErrors[q.id]);
            setCurrentQuestion(firstErrorIndex);
            setShowValidation(true);
            return;
        }

        onSubmit(responses);
    };

    const updateResponse = (value: any) => {
        setResponses({ ...responses, [question.id]: value });
        if (errors[question.id]) {
            setErrors({ ...errors, [question.id]: "" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm text-gray-600">
                                {surveyData.restaurantName}
                            </h2>
                            <p className="text-xs text-gray-500">
                                Question {currentQuestion + 1} of{" "}
                                {questions.length}
                            </p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 container max-w-2xl mx-auto px-4 py-8">
                <Card className="p-6 md:p-8 shadow-lg">
                    <div className="mb-6">
                        <h3 className="text-xl md:text-2xl mb-2">
                            {question.question}
                            {question.required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </h3>
                        {showValidation && errors[question.id] && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors[question.id]}
                            </div>
                        )}
                    </div>

                    {/* Rating */}
                    {question.type === "rating" && (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-2 md:gap-3">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => updateResponse(rating)}
                                        className={`transition-all transform hover:scale-110 ${
                                            responses[question.id] === rating
                                                ? "scale-125"
                                                : ""
                                        }`}
                                    >
                                        <Star
                                            className={`w-12 h-12 md:w-16 md:h-16 ${
                                                responses[question.id] >= rating
                                                    ? "text-yellow-500 fill-yellow-500"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs md:text-sm text-gray-600 px-2">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    )}

                    {/* Slider */}
                    {question.type === "slider" && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-5xl mb-4 text-orange-500">
                                    {responses[question.id] ||
                                        question.min ||
                                        1}
                                </div>
                            </div>
                            <input
                                type="range"
                                min={question.min || 1}
                                max={question.max || 5}
                                value={
                                    responses[question.id] || question.min || 1
                                }
                                onChange={(e) =>
                                    updateResponse(parseInt(e.target.value))
                                }
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Not satisfied</span>
                                <span>Very satisfied</span>
                            </div>
                        </div>
                    )}

                    {/* Text */}
                    {question.type === "text" && (
                        <Textarea
                            value={responses[question.id] || ""}
                            onChange={(e) => updateResponse(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={6}
                            className="text-base"
                        />
                    )}

                    {/* Multiple Choice */}
                    {question.type === "multiple-choice" && (
                        <div className="space-y-3">
                            {question.options?.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateResponse(option)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                        responses[question.id] === option
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-orange-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                responses[question.id] ===
                                                option
                                                    ? "border-orange-500"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {responses[question.id] ===
                                                option && (
                                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            )}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Navigation */}
            <div className="bg-white border-t sticky bottom-0">
                <div className="container max-w-2xl mx-auto px-4 py-4 flex gap-3">
                    {currentQuestion > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1 md:flex-initial"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={handleNext}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                        {currentQuestion === questions.length - 1 ? (
                            <>Submit</>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
