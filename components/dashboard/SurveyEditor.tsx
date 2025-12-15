import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

const templates = [
  { id: "food-quality", name: "Food Quality" },
  { id: "service", name: "Service Experience" },
  { id: "ambiance", name: "Ambiance & Atmosphere" },
  { id: "value", name: "Value for Money" },
  { id: "custom", name: "Custom Survey" }
];

interface Question {
  id: string;
  type: "rating" | "text" | "multiple-choice" | "yes-no";
  text: string;
  required: boolean;
  options?: string[];
}

interface SurveyEditorProps {
  survey: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function SurveyEditor({ survey, onSave, onCancel }: SurveyEditorProps) {
  const [formData, setFormData] = useState({
    name: survey?.name || "",
    description: survey?.description || "",
    template: survey?.template || "custom",
  });

  const [questions, setQuestions] = useState<Question[]>(
    survey?.questions || [
      {
        id: "1",
        type: "rating",
        text: "How would you rate your overall experience?",
        required: true
      },
      {
        id: "2",
        type: "text",
        text: "What did you enjoy most about your visit?",
        required: false
      }
    ]
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "text",
      text: "",
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, questions });
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onCancel} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Surveys
        </Button>

        <div className="mb-6">
          <h2 className="text-3xl mb-2">
            {survey ? "Edit Survey" : "Create New Survey"}
          </h2>
          <p className="text-gray-600">
            Design your custom survey or use one of our templates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
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
                <Label htmlFor="survey-description">Description</Label>
                <Textarea
                  id="survey-description"
                  placeholder="Brief description of what this survey measures"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="survey-template">Template</Label>
                <Select 
                  value={formData.template}
                  onValueChange={(value) => setFormData({ ...formData, template: value })}
                >
                  <SelectTrigger id="survey-template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
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
                          onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="yes-no">Yes/No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              {survey ? "Update Survey" : "Create Survey"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
