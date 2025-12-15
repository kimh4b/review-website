import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Ban,
  CheckCircle,
  Mail,
  Download
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

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  email: string;
  plan: "Basic" | "Pro" | "Enterprise";
  status: "active" | "suspended" | "trial";
  surveys: number;
  feedback: number;
  joined: string;
  lastActive: string;
  mrr: number;
}

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "The Golden Spoon",
    owner: "John Smith",
    email: "john@goldenspoon.com",
    plan: "Pro",
    status: "active",
    surveys: 8,
    feedback: 342,
    joined: "2024-01-15",
    lastActive: "2 hours ago",
    mrr: 149
  },
  {
    id: "2",
    name: "Bella Italia",
    owner: "Maria Rossi",
    email: "maria@bellaitalia.com",
    plan: "Basic",
    status: "active",
    surveys: 3,
    feedback: 156,
    joined: "2024-02-20",
    lastActive: "1 day ago",
    mrr: 49
  },
  {
    id: "3",
    name: "Sushi Master",
    owner: "Kenji Tanaka",
    email: "kenji@sushimaster.com",
    plan: "Enterprise",
    status: "active",
    surveys: 15,
    feedback: 892,
    joined: "2023-11-05",
    lastActive: "5 hours ago",
    mrr: 699
  },
  {
    id: "4",
    name: "Burger Haven",
    owner: "Mike Johnson",
    email: "mike@burgerhaven.com",
    plan: "Pro",
    status: "trial",
    surveys: 5,
    feedback: 89,
    joined: "2024-12-01",
    lastActive: "3 hours ago",
    mrr: 0
  },
  {
    id: "5",
    name: "Vegan Delight",
    owner: "Sarah Green",
    email: "sarah@vegandelight.com",
    plan: "Basic",
    status: "active",
    surveys: 4,
    feedback: 234,
    joined: "2024-03-10",
    lastActive: "12 hours ago",
    mrr: 49
  },
  {
    id: "6",
    name: "Taco Fiesta",
    owner: "Carlos Rodriguez",
    email: "carlos@tacofiesta.com",
    plan: "Pro",
    status: "suspended",
    surveys: 6,
    feedback: 178,
    joined: "2024-01-28",
    lastActive: "1 week ago",
    mrr: 0
  },
];

export function RestaurantManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    const matchesPlan = planFilter === "all" || restaurant.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleSuspend = (id: string) => {
    setRestaurants(restaurants.map(r => 
      r.id === id ? { ...r, status: "suspended" as const } : r
    ));
    toast.success("Restaurant account suspended");
  };

  const handleActivate = (id: string) => {
    setRestaurants(restaurants.map(r => 
      r.id === id ? { ...r, status: "active" as const } : r
    ));
    toast.success("Restaurant account activated");
  };

  const handleDelete = (id: string) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
    toast.success("Restaurant deleted");
  };

  const handleExport = () => {
    toast.success("Exporting restaurant data...");
  };

  const totalMRR = filteredRestaurants.reduce((sum, r) => sum + r.mrr, 0);
  const totalFeedback = filteredRestaurants.reduce((sum, r) => sum + r.feedback, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Restaurant Management</h2>
          <p className="text-gray-600">Manage all restaurant accounts on the platform</p>
        </div>
        <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">{filteredRestaurants.length}</div>
            <div className="text-sm text-gray-600">Total Restaurants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">${totalMRR.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">{totalFeedback.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl mb-1">
              {filteredRestaurants.filter(r => r.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Active Accounts</div>
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
                  placeholder="Search restaurants, owners, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Restaurant</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Surveys</th>
                  <th className="text-left py-3 px-4">Feedback</th>
                  <th className="text-left py-3 px-4">MRR</th>
                  <th className="text-left py-3 px-4">Last Active</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{restaurant.owner}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        restaurant.plan === "Enterprise" 
                          ? "bg-purple-100 text-purple-700"
                          : restaurant.plan === "Pro"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {restaurant.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        restaurant.status === "active"
                          ? "bg-green-100 text-green-700"
                          : restaurant.status === "trial"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{restaurant.surveys}</td>
                    <td className="py-3 px-4">{restaurant.feedback}</td>
                    <td className="py-3 px-4">${restaurant.mrr}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{restaurant.lastActive}</td>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Account
                          </DropdownMenuItem>
                          {restaurant.status === "suspended" ? (
                            <DropdownMenuItem onClick={() => handleActivate(restaurant.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSuspend(restaurant.id)}>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600"
                          >
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

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No restaurants match your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
