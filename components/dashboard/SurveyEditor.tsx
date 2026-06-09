"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface Question {
    id: string;
    type: "rating" | "text" | "multiple-choice" | "yes-no";
    text: string;
    required: boolean;
    options: string[];
}

interface BranchOption {
    id: string;
    name: string;
    location?: string;
}

interface SurveyEditorProps {
    survey: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export function SurveyEditor({ survey, onSave, onCancel }: SurveyEditorProps) {
    const { user } = useAuth();

    const [saving, setSaving] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(!!survey?.id);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(survey?.branchId ?? "none");
    const [status, setStatus] = useState<string>(
        survey?.status?.toLowerCase() === "archived"
            ? "closed"
            : survey?.status?.toLowerCase() ?? "draft"
    );

    useEffect(() => {
        if (!survey) return;
        const rawStatus = survey.status?.toLowerCase();
        setStatus(
            rawStatus === "archived"
                ? "closed"
                : rawStatus === "active" || rawStatus === "closed" || rawStatus === "draft"
                ? rawStatus
                : "draft"
        );
    }, [survey?.status]);

    const [formData, setFormData] = useState({
        name: survey?.name || "",
        description: survey?.description || "",
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    useEffect(() => {
        if (!survey?.id) return;

        const fetchQuestions = async () => {
            setLoadingQuestions(true);
            try {
                const { data, error } = await supabase
                    .from("survey_questions")
                    .select("id, question, type, required, options, order_index")
                    .eq("survey_id", survey.id)
                    .order("order_index", { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setQuestions(data.map((q: any) => ({
                        id: q.id,
                        type: q.type as Question["type"],
                        text: q.question,
                        required: q.required ?? false,
                        options: Array.isArray(q.options) ? q.options : [],
                    })));
                }
            } catch (err: any) {
                toast.error("Failed to load questions: " + err.message);
            } finally {
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, [survey?.id]);

    useEffect(() => {
        if (!user) return;

        const fetchBranches = async () => {
            try {
                const { data, error } = await supabase
                    .from("branches")
                    .select("id, name, location")
                    .eq("owner_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setBranches(data || []);
            } catch (err: any) {
                toast.error("Failed to load branches: " + err.message);
            }
        };

        fetchBranches();
    }, [user, survey?.id]);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            type: "text",
            text: "",
            required: false,
            options: [],
        }]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
    };

    const addOption = (questionId: string) => {
        setQuestions(questions.map((q) =>
            q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q
        ));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map((q) => {
            if (q.id !== questionId) return q;
            const newOptions = [...(q.options || [])];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
        }));
    };

    const removeOption = (questionId: string, optionIndex: number) => {
        setQuestions(questions.map((q) => {
            if (q.id !== questionId) return q;
            return { ...q, options: (q.options || []).filter((_, i) => i !== optionIndex) };
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            let surveyId = survey?.id;

            const statusForDb =
                status === "closed" ? "Archived"
                : status === "active" ? "Active"
                : "Draft";

            // Log payload and status to help debug 400 responses from Supabase
            const surveyPayload = {
                title: formData.name,
                description: formData.description,
                status: statusForDb,
                restaurant_name: user.restaurantName,
                branch_id: selectedBranchId === "none" ? null : selectedBranchId,
            };
            console.debug("Saving survey payload", { surveyId: survey?.id, payload: surveyPayload });

            if (survey?.id) {
                const { error } = await supabase
                    .from("surveys")
                    .update(surveyPayload)
                    .eq("id", survey.id)
                    .eq("owner_id", user.id);

                if (error) {
                    console.error("Supabase update error", { error, payload: surveyPayload, id: survey.id });
                    // Re-throw so our outer catch can handle presenting the error
                    throw error;
                }

                const { error: deleteError } = await supabase
                    .from("survey_questions")
                    .delete()
                    .eq("survey_id", survey.id);

                if (deleteError) {
                    console.error("Supabase delete questions error", { deleteError, surveyId: survey.id });
                    throw deleteError;
                }
            } else {
                const { data, error } = await supabase
                    .from("surveys")
                    .insert({
                        owner_id: user.id,
                        ...surveyPayload,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Supabase insert error", { error, payload: surveyPayload });
                    throw error;
                }
                surveyId = data.id;
            }

            for (let index = 0; index < questions.length; index++) {
                const q = questions[index];
                const { error: qError } = await supabase
                    .from("survey_questions")
                    .insert({
                        survey_id: surveyId,
                        question: q.text,
                        type: q.type,
                        order_index: index,
                        options: q.type === "multiple-choice" && q.options && q.options.length > 0
                            ? q.options.filter(o => o.trim() !== "")
                            : [],
                        required: q.required ?? false,
                    });

                if (qError) {
                    console.log("Question insert error:", JSON.stringify(qError));
                    throw new Error(`Question "${q.text}" failed: ${qError.message}`);
                }
            }

            toast.success(survey ? "Survey updated!" : "Survey created!");
            onSave({ ...formData, questions });
        } catch (err: any) {
            console.error("Failed to save survey", err);
            // If Supabase provides details, include them in the toast for debugging
            const details = err?.details || err?.message || JSON.stringify(err);
            toast.error("Failed to save: " + details);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Button type="button" variant="ghost" onClick={onCancel} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Surveys
                </Button>

                <div className="mb-6">
                    <h2 className="text-3xl mb-2">{survey ? "Edit Survey" : "Create New Survey"}</h2>
                    <p className="text-gray-600">Design your custom feedback survey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Survey Details */}
                    <Card>
                        <CardHeader><CardTitle>Survey Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                <Label htmlFor="survey-name">Survey Name</Label>
                                <Input
                                    id="survey-name"
                                    placeholder="e.g., Customer Satisfaction Survey"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="survey-branch">Branch</Label>
                                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                                    <SelectTrigger id="survey-branch">
                                        <SelectValue placeholder="Select branch (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No branch</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}{branch.location ? ` — ${branch.location}` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="survey-status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="survey-status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="survey-description">Description</Label>
                                <Textarea
                                    id="survey-description"
                                    placeholder="Brief description of what this survey measures"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Questions</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingQuestions ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                    <span className="ml-2 text-gray-500">Loading questions...</span>
                                </div>
                            ) : (
                                <>
                                    {questions.map((question) => (
                                        <div key={question.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move flex-shrink-0" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <Input
                                                            placeholder="Question text"
                                                            value={question.text}
                                                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                                            className="flex-1"
                                                        />
                                                        <Select
                                                            value={question.type}
                                                            onValueChange={(value: any) =>
                                                                updateQuestion(question.id, { type: value, options: [] })
                                                            }
                                                        >
                                                            <SelectTrigger className="w-44">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="rating"> Rating</SelectItem>
                                                                <SelectItem value="text"> Text</SelectItem>
                                                                <SelectItem value="multiple-choice"> Multiple Choice</SelectItem>
                                                                <SelectItem value="yes-no"> Yes / No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {question.type === "rating" && (
                                                        <div className="flex gap-1 pl-1">
                                                            {[1, 2, 3, 4, 5].map(n => (
                                                                <div key={n} className="w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm text-gray-400">{n}</div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {question.type === "yes-no" && (
                                                        <div className="flex gap-3 pl-1">
                                                            <div className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-400">Yes</div>
                                                            <div className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-400">No</div>
                                                        </div>
                                                    )}

                                                    {question.type === "multiple-choice" && (
                                                        <div className="space-y-2 pl-1">
                                                            <Label className="text-xs text-gray-500">Answer Options</Label>
                                                            {(question.options || []).map((option, optIndex) => (
                                                                <div key={optIndex} className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                                    <Input
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        value={option}
                                                                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOption(question.id, optIndex)}
                                                                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => addOption(question.id)}
                                                                className="text-orange-500 hover:text-orange-600 pl-0"
                                                            >
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Add Option
                                                            </Button>
                                                           
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 pt-1">
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={question.required}
                                                                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                                className="rounded"
                                                            />
                                                            <span>Required</span>
                                                        </label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeQuestion(question.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {questions.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No questions yet. Click "Add Question" to get started.
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving || loadingQuestions}>
                            {saving
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                : survey ? "Update Survey" : "Create Survey"
                            }
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}