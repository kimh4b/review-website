import { useState } from "react";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  Store,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { AdminOverview } from "./AdminOverview";
import { RestaurantManagement } from "./RestaurantManagement";
import { AdminAnalytics } from "./AdminAnalytics";

import { AdminSettings } from "./AdminSettings";

type Page = "overview" | "restaurants" | "analytics" | "reviews" | "settings";

const navigation = [
  {
    id: "overview" as Page,
    name: "Overview",
    icon: LayoutDashboard,
    description: "Dashboard summary",
  },
  {
    id: "restaurants" as Page,
    name: "Restaurants",
    icon: Store,
    description: "Manage accounts",
  },
  // {
  //   id: "analytics" as Page,
  //   name: "Analytics",
  //   icon: BarChart3,
  //   description: "Charts & insights",
  // },
  // {
  //   id: "reviews" as Page,
  //   name: "Reviews",
  //   icon: MessageSquare,
  //   description: "Raw feedback",
  // },
  {
    id: "settings" as Page,
    name: "Settings",
    icon: Settings,
    description: "Admin controls",
  },
];

export function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "overview": return <AdminOverview />;
      case "restaurants": return <RestaurantManagement />;
      case "analytics": return <AdminAnalytics />;
     
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">FeedbackPro</div>
                <div className="text-xs text-gray-400">Admin Portal</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Admin info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.fullName || "Admin"}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                    ${isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs truncate ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-medium">
              {navigation.find(item => item.id === currentPage)?.name}
            </h1>
            <p className="text-xs text-gray-400">
              {navigation.find(item => item.id === currentPage)?.description}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}