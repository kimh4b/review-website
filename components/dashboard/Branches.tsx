"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, Trash2, MapPin, Store, Loader2, X } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  location?: string;
  created_at?: string;
};

interface BranchesProps {
  onSelectBranch?: (branchId: string) => void;
}

export function Branches({ onSelectBranch }: BranchesProps) {
  const { user } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBranches = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, location, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load branches");
    else setBranches(data || []);
    setLoading(false);
  };

  const createBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("branches").insert([{
      name: name.trim(),
      location: location.trim() || null,
      owner_id: user.id,
    }]);

    if (error) {
      toast.error("Failed to create branch");
    } else {
      toast.success(`Branch "${name.trim()}" created!`);
      setName("");
      setLocation("");
      setShowForm(false);
      await fetchBranches();
    }
    setSaving(false);
  };

  const deleteBranch = async (id: string, branchName: string) => {
    if (!confirm(`Delete "${branchName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) toast.error("Failed to delete branch");
    else {
      toast.success("Branch deleted");
      setBranches(prev => prev.filter(b => b.id !== id));
    }
    setDeletingId(null);
  };

  useEffect(() => {
    if (user) fetchBranches();
  }, [user]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Branches</h2>
          <p className="text-gray-600">Manage your restaurant locations</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Add Branch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Add New Branch</h3>
              <button
                onClick={() => { setShowForm(false); setName(""); setLocation(""); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createBranch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branch-name">Branch Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="branch-name"
                    placeholder="e.g. Main Branch, City Center"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-location">Location <span className="text-gray-400 text-xs">(optional)</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="branch-location"
                    placeholder="e.g. 123 Main St, Phnom Penh"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowForm(false); setName(""); setLocation(""); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!name.trim() || saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Branch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{branches.length}</div>
            <div className="text-sm text-gray-500">Total Branches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{branches.filter(b => b.location).length}</div>
            <div className="text-sm text-gray-500">With Location</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-1">{branches.filter(b => !b.location).length}</div>
            <div className="text-sm text-gray-500">Location Not Set</div>
          </CardContent>
        </Card>
      </div>

      {/* Branch List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-2">No branches yet</p>
          <p className="text-sm mb-6">Add your first branch to organize surveys by location</p>
          <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add First Branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map(branch => (
            <Card
              key={branch.id}
              className="hover:shadow-md transition-shadow"
              onClick={() => onSelectBranch?.(branch.id)}
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{branch.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-500 truncate">
                          {branch.location || "Location not set"}
                        </p>
                      </div>
                      {branch.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created {new Date(branch.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBranch(branch.id, branch.name);
                    }}
                    disabled={deletingId === branch.id}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                  >
                    {deletingId === branch.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}