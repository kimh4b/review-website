"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, MoreVertical, Trash2, Download, Loader2, Users } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
  owner_id: string;
  surveyCount: number;
  responseCount: number;
  firstSeen: string;
}

export function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: surveys } = await supabase
        .from("surveys")
        .select("owner_id, id, created_at");

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("survey_id");

      const responseCounts: Record<string, number> = {};
      (responses || []).forEach((r: any) => {
        responseCounts[r.survey_id] = (responseCounts[r.survey_id] || 0) + 1;
      });

      const ownerMap: Record<string, UserRow> = {};
      (surveys || []).forEach((s: any) => {
        if (!ownerMap[s.owner_id]) {
          ownerMap[s.owner_id] = {
            owner_id: s.owner_id,
            surveyCount: 0,
            responseCount: 0,
            firstSeen: s.created_at,
          };
        }
        ownerMap[s.owner_id].surveyCount++;
        ownerMap[s.owner_id].responseCount += responseCounts[s.id] || 0;
        if (s.created_at < ownerMap[s.owner_id].firstSeen) {
          ownerMap[s.owner_id].firstSeen = s.created_at;
        }
      });

      setUsers(Object.values(ownerMap));
    } catch (err: any) {
      toast.error("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ownerId: string) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("owner_id", ownerId);

      if (error) throw error;
      setUsers(prev => prev.filter(u => u.owner_id !== ownerId));
      toast.success("User data deleted");
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Owner ID", "Surveys", "Responses", "First Seen"],
      ...users.map(u => [u.owner_id, u.surveyCount, u.responseCount, u.firstSeen.split("T")[0]]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    toast.success("Exported!");
  };

  const filtered = users.filter(u =>
    u.owner_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">User Management</h2>
          <p className="text-gray-600">All restaurant owner accounts</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{users.reduce((s, u) => s + u.surveyCount, 0)}</div>
          <div className="text-sm text-gray-600">Total Surveys Created</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl mb-1">{users.reduce((s, u) => s + u.responseCount, 0)}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by user ID..."
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
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No users yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User ID</th>
                    <th className="text-left py-3 px-4">Surveys</th>
                    <th className="text-left py-3 px-4">Responses</th>
                    <th className="text-left py-3 px-4">First Seen</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.owner_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm text-gray-600">{u.owner_id}</td>
                      <td className="py-3 px-4">{u.surveyCount}</td>
                      <td className="py-3 px-4">{u.responseCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{u.firstSeen.split("T")[0]}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDelete(u.owner_id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User Data
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