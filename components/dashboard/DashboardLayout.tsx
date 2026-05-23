"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { 
  LayoutDashboard, FileText, QrCode, BarChart3,
  Settings, LogOut, Menu, X, Star, MessageSquare
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardHome } from "./DashboardHome";
import { Surveys } from "./Surveys";
import { QRGenerator } from "./QRGenerator";
import { Feedback } from "./Feedback";
import { AccountSettings } from "./AccountSettings";
import { Reviews } from "./Reviews";

type Page = "dashboard" | "surveys" | "qr" | "feedback" | "reviews" | "settings";

const navigation = [
  { id: "dashboard" as Page, name: "Dashboard", icon: LayoutDashboard },
  { id: "surveys" as Page, name: "Surveys", icon: FileText },
  { id: "qr" as Page, name: "QR Codes", icon: QrCode },
  { id: "feedback" as Page, name: "Feedback & Analytics", icon: BarChart3 },
  { id: "reviews" as Page, name: "Reviews", icon: MessageSquare },
  { id: "settings" as Page, name: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"negative" | undefined>(undefined);

  const [currentPage, setCurrentPageState] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dashboardPage") as Page) || "dashboard";
    }
    return "dashboard";
  });

  const setCurrentPage = (page: Page) => {
    localStorage.setItem("dashboardPage", page);
    setCurrentPageState(page);
  };

  const handleNeedsAttention = () => {
    setReviewFilter("negative");
    setCurrentPage("reviews");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome onNeedsAttention={handleNeedsAttention} />;
      case "surveys":
        return <Surveys />;
      case "qr":
        return <QRGenerator />;
      case "feedback":
        return <Feedback onViewReview={handleNeedsAttention} />;
      case "reviews":
        return <Reviews defaultFilter={reviewFilter} />;
      case "settings":
        return <AccountSettings />;
      default:
        return <DashboardHome onNeedsAttention={handleNeedsAttention} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-lg">FeedbackPro</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-medium">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.fullName}</div>
                <div className="text-xs text-gray-500 truncate">{user?.restaurantName}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id !== "reviews") setReviewFilter(undefined);
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700"
              onClick={() => { localStorage.removeItem("dashboardPage"); logout(); }}
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
          <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">
            {navigation.find(item => item.id === currentPage)?.name}
          </h1>
        </header>

        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}