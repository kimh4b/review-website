"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { User, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const { user } = useAuth();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          fullName,
          restaurantName,
        }
      });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Failed to update password: " + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl mb-1">Account Settings</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="restaurantName"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="pl-10"
                        placeholder="Your restaurant name"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      : "Save Changes"
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={savingPassword}
                  >
                    {savingPassword
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                      : "Update Password"
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}