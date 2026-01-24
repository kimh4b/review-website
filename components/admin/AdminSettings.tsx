import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import {
    User,
    Building2,
    CreditCard,
    Users,
    Trash2,
    Plus,
    Crown,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "Owner" | "Admin" | "Member";
    status: "active" | "pending";
}

export function AdminSettings() {
    const { user } = useAuth();

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Profile updated successfully");
    };

    return (
        <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl mb-1">Account Settings</h2>
                    <p className="text-gray-600">
                        Manage your account, subscription, and team
                    </p>
                </div>

                <Tabs defaultValue="profile">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSaveProfile}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="fullName"
                                                defaultValue={user?.fullName}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={user?.email}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600"
                                    >
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">
                                            Current Password
                                        </Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">
                                            New Password
                                        </Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                        />
                                    </div>
                                    <Button type="submit" variant="outline">
                                        Update Password
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
