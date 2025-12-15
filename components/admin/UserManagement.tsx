import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Mail, 
  Ban,
  CheckCircle,
  Download,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  restaurant: string;
  role: "Owner" | "Admin" | "Member";
  status: "active" | "suspended";
  lastLogin: string;
  joined: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@goldenspoon.com",
    restaurant: "The Golden Spoon",
    role: "Owner",
    status: "active",
    lastLogin: "2 hours ago",
    joined: "2024-01-15"
  },
  {
    id: "2",
    name: "Emily Brown",
    email: "emily@goldenspoon.com",
    restaurant: "The Golden Spoon",
    role: "Admin",
    status: "active",
    lastLogin: "1 day ago",
    joined: "2024-02-01"
  },
  {
    id: "3",
    name: "Maria Rossi",
    email: "maria@bellaitalia.com",
    restaurant: "Bella Italia",
    role: "Owner",
    status: "active",
    lastLogin: "5 hours ago",
    joined: "2024-02-20"
  },
  {
    id: "4",
    name: "Kenji Tanaka",
    email: "kenji@sushimaster.com",
    restaurant: "Sushi Master",
    role: "Owner",
    status: "active",
    lastLogin: "3 hours ago",
    joined: "2023-11-05"
  },
  {
    id: "5",
    name: "Yuki Yamamoto",
    email: "yuki@sushimaster.com",
    restaurant: "Sushi Master",
    role: "Admin",
    status: "active",
    lastLogin: "12 hours ago",
    joined: "2023-11-10"
  },
  {
    id: "6",
    name: "Tom Wilson",
    email: "tom@sushimaster.com",
    restaurant: "Sushi Master",
    role: "Member",
    status: "suspended",
    lastLogin: "2 weeks ago",
    joined: "2024-03-15"
  },
  {
    id: "7",
    name: "Mike Johnson",
    email: "mike@burgerhaven.com",
    restaurant: "Burger Haven",
    role: "Owner",
    status: "active",
    lastLogin: "8 hours ago",
    joined: "2024-12-01"
  },
  {
    id: "8",
    name: "Sarah Green",
    email: "sarah@vegandelight.com",
    restaurant: "Vegan Delight",
    role: "Owner",
    status: "active",
    lastLogin: "1 day ago",
    joined: "2024-03-10"
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspend = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: "suspended" as const } : u
    ));
    toast.success("User suspended");
  };

  const handleActivate = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: "active" as const } : u
    ));
    toast.success("User activated");
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success("User deleted");
  };

  const handleExport = () => {
    toast.success("Exporting user data...");
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">User Management</h2>
          <p className="text-gray-600">Manage all users across the platform</p>
        </div>
        <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">{filteredUsers.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">
              {filteredUsers.filter(u => u.role === "Owner").length}
            </div>
            <div className="text-sm text-gray-600">Restaurant Owners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">
              {filteredUsers.filter(u => u.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">
              {filteredUsers.filter(u => u.status === "suspended").length}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users, emails, or restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Restaurant</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Login</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.restaurant}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === "Owner" 
                          ? "bg-orange-100 text-orange-700"
                          : user.role === "Admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{user.joined}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          {user.status === "suspended" ? (
                            <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users match your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
