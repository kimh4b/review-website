import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  Users, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12400, customers: 45 },
  { month: "Feb", revenue: 15800, customers: 58 },
  { month: "Mar", revenue: 18200, customers: 67 },
  { month: "Apr", revenue: 21500, customers: 78 },
  { month: "May", revenue: 24800, customers: 89 },
  { month: "Jun", revenue: 28400, customers: 102 },
];

const planDistribution = [
  { name: "Basic", value: 45, color: "#94a3b8", revenue: "$2,205" },
  { name: "Pro", value: 52, color: "#f97316", revenue: "$7,748" },
  { name: "Enterprise", value: 18, color: "#f59e0b", revenue: "$12,600" },
];

const recentRestaurants = [
  { id: 1, name: "The Golden Spoon", plan: "Pro", status: "active", joined: "2 hours ago" },
  { id: 2, name: "Bella Italia", plan: "Basic", status: "active", joined: "5 hours ago" },
  { id: 3, name: "Sushi Master", plan: "Enterprise", status: "trial", joined: "1 day ago" },
  { id: 4, name: "Burger Haven", plan: "Pro", status: "active", joined: "1 day ago" },
  { id: 5, name: "Vegan Delight", plan: "Basic", status: "active", joined: "2 days ago" },
];

const systemAlerts = [
  { id: 1, type: "warning", message: "Server load at 85% - consider scaling", time: "10 min ago" },
  { id: 2, type: "info", message: "Database backup completed successfully", time: "2 hours ago" },
  { id: 3, type: "success", message: "Monthly revenue goal reached", time: "5 hours ago" },
];

export function AdminOverview() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl mb-2">Platform Overview</h2>
        <p className="text-gray-600">Monitor platform performance and key metrics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Restaurants</CardTitle>
            <Store className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">115</div>
            <p className="text-xs text-gray-600">active accounts</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+8 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">342</div>
            <p className="text-xs text-gray-600">platform users</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+24 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">$28,400</div>
            <p className="text-xs text-gray-600">MRR (Monthly Recurring)</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">System Health</CardTitle>
            <Activity className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">99.8%</div>
            <p className="text-xs text-gray-600">uptime this month</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <CheckCircle className="w-4 h-4" />
              <span>All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {planDistribution.map((plan, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{plan.value} accounts</span>
                    <span className="font-medium">{plan.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Restaurants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sign-ups</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">{restaurant.name}</div>
                      <div className="text-sm text-gray-500">{restaurant.joined}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 bg-orange-100 text-orange-700 rounded">
                      {restaurant.plan}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      restaurant.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {restaurant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Alerts</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${alert.type === 'warning' ? 'bg-yellow-100' : 
                      alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}
                  `}>
                    {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                    {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
