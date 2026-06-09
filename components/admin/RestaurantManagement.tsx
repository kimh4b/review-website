"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Search, MoreVertical, Trash2, Download, Plus,
  Loader2, Store, X, ArrowLeft, Eye, Star, MessageSquare
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabaseClient";

interface Restaurant {
  id: string; // owner_id
  fullName: string;
  restaurantName: string;
  email: string;
  surveys: number;
  responses: number;
  joined: string;
}

interface Survey {
  id: string;
  title: string;
  status: string;
  created_at: string;
  responseCount: number;
}

interface Response {
  id: string;
  answers: Record<string, any>;
  submitted_at: string;
}

interface CreateForm {
  fullName: string;
  email: string;
  password: string;
  restaurantName: string;
}

type View = "list" | "restaurant" | "survey";

export function RestaurantManagement() {


  const [view, setView] = useState<View>("list");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>({ fullName: "", email: "", password: "", restaurantName: "" });

  // Detail state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantSurveys, setRestaurantSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);

  // Survey detail state
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Response[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, restaurant_name, email, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get survey and response counts per owner
      const { data: surveys } = await supabase
        .from("surveys")
        .select("owner_id, id");

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("survey_id");

      const surveyMap: Record<string, string[]> = {};
      (surveys || []).forEach((s: any) => {
        if (!surveyMap[s.owner_id]) surveyMap[s.owner_id] = [];
        surveyMap[s.owner_id].push(s.id);
      });

      const responseCounts: Record<string, number> = {};
      (responses || []).forEach((r: any) => {
        responseCounts[r.survey_id] = (responseCounts[r.survey_id] || 0) + 1;
      });

      const mapped: Restaurant[] = (profiles || [])
        .filter((p: any) => p.email !== "admin@gmail.com")
        .map((p: any) => {
          const ownerSurveyIds = surveyMap[p.id] || [];
          const totalResponses = ownerSurveyIds.reduce((sum, sid) => sum + (responseCounts[sid] || 0), 0);
          return {
            id: p.id,
            fullName: p.full_name || "—",
            restaurantName: p.restaurant_name || "—",
            email: p.email || "—",
            surveys: ownerSurveyIds.length,
            responses: totalResponses,
            joined: p.created_at?.split("T")[0] || "—",
          };
        });

      setRestaurants(mapped);
    } catch (err: any) {
      toast.error("Failed to load restaurants: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantSurveys = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setView("restaurant");
    setLoadingSurveys(true);
    try {
      const { data: surveys, error } = await supabase
        .from("surveys")
        .select("id, title, status, created_at")
        .eq("owner_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("survey_id");

      const responseCounts: Record<string, number> = {};
      (responses || []).forEach((r: any) => {
        responseCounts[r.survey_id] = (responseCounts[r.survey_id] || 0) + 1;
      });

      const mapped: Survey[] = (surveys || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        created_at: s.created_at?.split("T")[0] || "—",
        responseCount: responseCounts[s.id] || 0,
      }));

      setRestaurantSurveys(mapped);
    } catch (err: any) {
      toast.error("Failed to load surveys: " + err.message);
    } finally {
      setLoadingSurveys(false);
    }
  };

  const fetchSurveyResponses = async (survey: Survey) => {
    setSelectedSurvey(survey);
    setView("survey");
    setLoadingResponses(true);
    try {
      const [{ data: responses }, { data: questions }] = await Promise.all([
        supabase
          .from("survey_responses")
          .select("id, answers, submitted_at")
          .eq("survey_id", survey.id)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("survey_questions")
          .select("id, question, type, order_index")
          .eq("survey_id", survey.id)
          .order("order_index", { ascending: true }),
      ]);

      setSurveyResponses(responses || []);
      setSurveyQuestions(questions || []);
    } catch (err: any) {
      toast.error("Failed to load responses: " + err.message);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.restaurantName || !form.fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { fullName: form.fullName, restaurantName: form.restaurantName }
        }
      });
      if (error) throw error;
      toast.success(`Account created for ${form.restaurantName}!`);
      setForm({ fullName: "", email: "", password: "", restaurantName: "" });
      setShowCreate(false);
      setTimeout(fetchRestaurants, 1000);
    } catch (err: any) {
      toast.error("Failed to create account: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ownerId: string) => {
    try {
      await supabase.from("surveys").delete().eq("owner_id", ownerId);
      await supabase.from("profiles").delete().eq("id", ownerId);
      setRestaurants(prev => prev.filter(r => r.id !== ownerId));
      toast.success("Restaurant deleted");
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Restaurant Name", "Owner", "Email", "Surveys", "Responses", "Joined"],
      ...restaurants.map(r => [r.restaurantName, r.fullName, r.email, r.surveys, r.responses, r.joined]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurants.csv";
    a.click();
    toast.success("Exported!");
  };

  const filtered = restaurants.filter(r =>
    r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Survey responses detail view
  if (view === "survey" && selectedSurvey) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => setView("restaurant")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {selectedRestaurant?.restaurantName}
          </Button>
        </div>

        <div>
          <h2 className="text-2xl mb-1">{selectedSurvey.title}</h2>
          <p className="text-gray-500 text-sm">{surveyResponses.length} responses</p>
        </div>

        {loadingResponses ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : surveyResponses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No responses yet for this survey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {surveyResponses.map((response, i) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">
                    Response #{i + 1} — {response.submitted_at?.split("T")[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {surveyQuestions.map((q) => {
                    const answer = response.answers?.[q.id];
                    return (
                      <div key={q.id} className="border-b pb-3 last:border-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">{q.question}</p>
                        {q.type === "rating" ? (
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className={`w-5 h-5 ${n <= answer ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">{answer}/5</span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">{answer || <span className="italic text-gray-400">No answer</span>}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Restaurant detail view
  if (view === "restaurant" && selectedRestaurant) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Button type="button" variant="ghost" onClick={() => setView("list")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </Button>

        {/* Restaurant Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Store className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl">{selectedRestaurant.restaurantName}</h2>
                <p className="text-gray-500">{selectedRestaurant.fullName} · {selectedRestaurant.email}</p>
                <p className="text-xs text-gray-400 mt-1">Joined {selectedRestaurant.joined}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-medium">{selectedRestaurant.surveys}</div>
                <div className="text-sm text-gray-500">Surveys</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-medium">{selectedRestaurant.responses}</div>
                <div className="text-sm text-gray-500">Total Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surveys */}
        <div>
          <h3 className="text-lg mb-4">Surveys</h3>
          {loadingSurveys ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : restaurantSurveys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No surveys created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurantSurveys.map((survey) => (
                <Card key={survey.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchSurveyResponses(survey)}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{survey.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Created {survey.created_at}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-medium">{survey.responseCount}</div>
                          <div className="text-xs text-gray-500">responses</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          survey.status?.toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {survey.status || "Draft"}
                        </span>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Restaurant Management</h2>
          <p className="text-gray-600">Manage all restaurant accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">Create Restaurant Account</h3>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Owner's full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input placeholder="e.g. The Golden Spoon" value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="owner@restaurant.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={creating}>
                  {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{restaurants.length}</div>
          <div className="text-sm text-gray-600">Total Restaurants</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{restaurants.reduce((s, r) => s + r.surveys, 0)}</div>
          <div className="text-sm text-gray-600">Total Surveys</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{restaurants.reduce((s, r) => s + r.responses, 0)}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by restaurant, owner, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg mb-1">No restaurants yet</p>
              <Button onClick={() => setShowCreate(true)} className="mt-4 bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Create First Account
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Restaurant</th>
                    <th className="text-left py-3 px-4">Owner</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Surveys</th>
                    <th className="text-left py-3 px-4">Responses</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => fetchRestaurantSurveys(r)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="font-medium">{r.restaurantName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{r.fullName}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{r.email}</td>
                      <td className="py-3 px-4 text-sm">{r.surveys}</td>
                      <td className="py-3 px-4 text-sm">{r.responses}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{r.joined}</td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => fetchRestaurantSurveys(r)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}