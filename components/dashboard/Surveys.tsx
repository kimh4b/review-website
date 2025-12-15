import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Edit, Trash2, Eye, Copy, MoreVertical } from "lucide-react";
import { SurveyEditor } from "./SurveyEditor";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Survey {
  id: string;
  name: string;
  description: string;
  template: string;
  responses: number;
  status: "active" | "draft" | "archived";
  createdAt: string;
}

const initialSurveys: Survey[] = [
  {
    id: "1",
    name: "Food Quality Survey",
    description: "Gather feedback on food taste, presentation, and freshness",
    template: "Food Quality",
    responses: 342,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Service Experience",
    description: "Measure customer satisfaction with service speed and friendliness",
    template: "Service",
    responses: 289,
    status: "active",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Ambiance & Atmosphere",
    description: "Understand how customers feel about restaurant environment",
    template: "Ambiance",
    responses: 156,
    status: "draft",
    createdAt: "2024-02-01"
  }
];

export function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);

  const handleCreate = () => {
    setEditingSurvey(null);
    setShowEditor(true);
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setShowEditor(true);
  };

  const handleDelete = (surveyId: string) => {
    setSurveys(surveys.filter(s => s.id !== surveyId));
    toast.success("Survey deleted");
  };

  const handleDuplicate = (survey: Survey) => {
    const newSurvey = {
      ...survey,
      id: Date.now().toString(),
      name: `${survey.name} (Copy)`,
      status: "draft" as const,
      responses: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSurveys([...surveys, newSurvey]);
    toast.success("Survey duplicated");
  };

  const handleSave = (surveyData: Partial<Survey>) => {
    if (editingSurvey) {
      setSurveys(surveys.map(s => 
        s.id === editingSurvey.id 
          ? { ...s, ...surveyData }
          : s
      ));
      toast.success("Survey updated");
    } else {
      const newSurvey: Survey = {
        id: Date.now().toString(),
        name: surveyData.name || "New Survey",
        description: surveyData.description || "",
        template: surveyData.template || "Custom",
        responses: 0,
        status: "draft",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSurveys([...surveys, newSurvey]);
      toast.success("Survey created");
    }
    setShowEditor(false);
  };

  if (showEditor) {
    return (
      <SurveyEditor
        survey={editingSurvey}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  if (previewSurvey) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Survey Preview</h2>
            <Button variant="outline" onClick={() => setPreviewSurvey(null)}>
              Close Preview
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{previewSurvey.name}</CardTitle>
              <p className="text-gray-600">{previewSurvey.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block mb-2">How would you rate the food quality?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className="w-12 h-12 border-2 rounded-lg hover:border-orange-500">
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2">What did you enjoy most?</label>
                <textarea className="w-full border-2 rounded-lg p-3" rows={4} />
              </div>
              <div>
                <label className="block mb-2">Would you recommend us?</label>
                <div className="flex gap-4">
                  <button className="px-6 py-2 border-2 rounded-lg hover:border-orange-500">Yes</button>
                  <button className="px-6 py-2 border-2 rounded-lg hover:border-orange-500">No</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Surveys</h2>
          <p className="text-gray-600">Create and manage your feedback surveys</p>
        </div>
        <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{survey.name}</CardTitle>
                  <p className="text-sm text-gray-600">{survey.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(survey)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPreviewSurvey(survey)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(survey)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(survey.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Template:</span>
                  <span className="text-gray-900">{survey.template}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Responses:</span>
                  <span className="text-gray-900">{survey.responses}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    survey.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : survey.status === 'draft'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setPreviewSurvey(survey)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(survey)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
