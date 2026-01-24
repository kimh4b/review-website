"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  Download
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const revenueData = [
  { month: "Jan", basic: 2205, pro: 7450, enterprise: 10500 },
  { month: "Feb", basic: 2352, pro: 8635, enterprise: 12600 },
  { month: "Mar", basic: 2499, pro: 8932, enterprise: 12600 },
  { month: "Apr", basic: 2205, pro: 9527, enterprise: 15400 },
  { month: "May", basic: 2646, pro: 10420, enterprise: 15400 },
  { month: "Jun", basic: 2205, pro: 7748, enterprise: 18200 },
];

const churnData = [
  { month: "Jan", churned: 2, total: 98 },
  { month: "Feb", churned: 3, total: 103 },
  { month: "Mar", churned: 1, total: 109 },
  { month: "Apr", churned: 4, total: 113 },
  { month: "May", churned: 2, total: 120 },
  { month: "Jun", churned: 5, total: 115 },
];

interface Subscription {
  id: string;
  restaurant: string;
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  amount: number;
  nextBilling: string;
  paymentMethod: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    restaurant: "The Golden Spoon",
    plan: "Pro",
    status: "active",
    amount: 149,
    nextBilling: "Jan 15, 2025",
    paymentMethod: "•••• 4242"
  },
  {
    id: "2",
    restaurant: "Bella Italia",
    plan: "Basic",
    status: "active",
    amount: 49,
    nextBilling: "Jan 20, 2025",
    paymentMethod: "•••• 5555"
  },
  {
    id: "3",
    restaurant: "Sushi Master",
    plan: "Enterprise",
    status: "active",
    amount: 699,
    nextBilling: "Jan 5, 2025",
    paymentMethod: "•••• 8888"
  },
  {
    id: "4",
    restaurant: "Burger Haven",
    plan: "Pro",
    status: "trialing",
    amount: 0,
    nextBilling: "Jan 14, 2025",
    paymentMethod: "•••• 3333"
  },
  {
    id: "5",
    restaurant: "Vegan Delight",
    plan: "Basic",
    status: "active",
    amount: 49,
    nextBilling: "Jan 10, 2025",
    paymentMethod: "•••• 7777"
  },
  {
    id: "6",
    restaurant: "Taco Fiesta",
    plan: "Pro",
    status: "past_due",
    amount: 149,
    nextBilling: "Dec 28, 2024",
    paymentMethod: "•••• 9999"
  },
  {
    id: "7",
    restaurant: "Pizza Palace",
    plan: "Basic",
    status: "canceled",
    amount: 49,
    nextBilling: "N/A",
    paymentMethod: "•••• 1111"
  },
];

export function SubscriptionManagement() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    return matchesStatus && matchesPlan;
  });

  const handleExport = () => {
    toast.success("Exporting subscription data...");
  };

  const totalMRR = subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);
  
  const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
  const pastDueSubscriptions = subscriptions.filter(s => s.status === "past_due").length;
  const trialingSubscriptions = subscriptions.filter(s => s.status === "trialing").length;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-1">Subscription Management</h2>
          <p className="text-gray-600">Monitor revenue and subscription metrics</p>
        </div>
        <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total MRR</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Monthly Recurring Revenue</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Subscriptions</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{activeSubscriptions}</div>
            <p className="text-xs text-gray-600">paying customers</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+8 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Trial Accounts</CardTitle>
            <CreditCard className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{trialingSubscriptions}</div>
            <p className="text-xs text-gray-600">active trials</p>
            <div className="text-sm text-gray-600 mt-2">
              Converting at 68%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Past Due</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{pastDueSubscriptions}</div>
            <p className="text-xs text-gray-600">failed payments</p>
            <div className="text-sm text-red-600 mt-2">
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="basic" stackId="a" fill="#94a3b8" name="Basic" />
                <Bar dataKey="pro" stackId="a" fill="#f97316" name="Pro" />
                <Bar dataKey="enterprise" stackId="a" fill="#f59e0b" name="Enterprise" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="churned" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Churned Customers"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Total Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[200px]">
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
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Restaurant</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Next Billing</th>
                  <th className="text-left py-3 px-4">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{sub.restaurant}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        sub.plan === "Enterprise" 
                          ? "bg-purple-100 text-purple-700"
                          : sub.plan === "Pro"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "trialing"
                          ? "bg-blue-100 text-blue-700"
                          : sub.status === "past_due"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {sub.status === "past_due" ? "Past Due" : 
                         sub.status === "trialing" ? "Trial" : 
                         sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sub.amount > 0 ? `$${sub.amount}/mo` : "Free Trial"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{sub.nextBilling}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{sub.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subscriptions match your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
