"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Edit, Trash2, Eye, Copy, MoreVertical, Loader2 } from "lucide-react";
import { SurveyEditor } from "./SurveyEditor";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Survey {
  id: string;
  name: string;
  description: string;
  responses: number;
  status: "active" | "draft" | "closed";
  createdAt: string;
  branchId?: string;
  branchName?: string;
}

export function Surveys() {
  const { user } = useAuth();


  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSurveys();
  }, [user]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          branch_id,
          branches(id, name),
          survey_responses (count)
        `)
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: Survey[] = (data || []).map((s: any) => {
        const rawStatus = s.status?.toLowerCase();
        const normalizedStatus = rawStatus === "archived"
          ? "closed"
          : rawStatus === "active" || rawStatus === "draft"
          ? rawStatus
          : "draft";

        return {
          id: s.id,
          name: s.title,
          description: s.description || "",
          responses: s.survey_responses?.[0]?.count || 0,
          status: normalizedStatus as Survey["status"],
          createdAt: s.created_at?.split("T")[0] || "",
          branchId: s.branch_id || undefined,
          branchName: s.branches?.name || undefined,
        };
      });

      setSurveys(mapped);
    } catch (err: any) {
      toast.error("Failed to load surveys: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSurvey(null);
    setShowEditor(true);
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setShowEditor(true);
  };

  const handlePreview = (survey: Survey) => {
    window.open(`/survey/${survey.id}`, "_blank");
  };

  const handleCopyLink = (survey: Survey) => {
    navigator.clipboard.writeText(`${window.location.origin}/survey/${survey.id}`);
    toast.success("Link copied!");
  };

  const handleDelete = async (surveyId: string) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId)
        .eq("owner_id", user!.id);

      if (error) throw error;
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
      toast.success("Survey deleted");
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  const handleDuplicate = async (survey: Survey) => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .insert({
          owner_id: user!.id,
          title: `${survey.name} (Copy)`,
          description: survey.description,
          status: "Draft",
          restaurant_name: user?.restaurantName,
        })
        .select()
        .single();

      if (error) throw error;

      const newSurvey: Survey = {
        id: data.id,
        name: data.title,
        description: data.description || "",
        responses: 0,
        status: "draft",
        createdAt: data.created_at?.split("T")[0] || "",
      };

      setSurveys((prev) => [newSurvey, ...prev]);
      toast.success("Survey duplicated");
    } catch (err: any) {
      toast.error("Failed to duplicate: " + err.message);
    }
  };

  const handleSave = async () => {
    await fetchSurveys();
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No surveys yet</p>
          <p className="text-sm mb-6">Create your first survey to start collecting feedback</p>
          <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{survey.name}</CardTitle>
                    <p className="text-sm text-gray-600">{survey.description}</p>
                    {survey.branchName && (
                      <p className="text-xs text-gray-500 mt-2">Branch: {survey.branchName}</p>
                    )}
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
                      <DropdownMenuItem onClick={() => handlePreview(survey)}>
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
                    <span className="text-gray-600">Responses:</span>
                    <span className="text-gray-900">{survey.responses}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      survey.status === "active"
                        ? "bg-green-100 text-green-700"
                        : survey.status === "draft"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {survey.status
                        ? survey.status.charAt(0).toUpperCase() + survey.status.slice(1)
                        : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{survey.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Link:</span>
                    <button
                      className="text-orange-500 hover:underline text-xs"
                      onClick={() => handleCopyLink(survey)}
                    >
                      Copy survey link
                    </button>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(survey)}
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
      )}
    </div>
  );
}