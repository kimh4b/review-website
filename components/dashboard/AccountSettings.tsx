import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { User, Building2, CreditCard, Users, Trash2, Plus, Crown } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  status: "active" | "pending";
}

export function AccountSettings() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: user?.fullName || "", email: user?.email || "", role: "Owner", status: "active" },
    { id: "2", name: "Sarah Johnson", email: "sarah@restaurant.com", role: "Admin", status: "active" },
    { id: "3", name: "Mike Chen", email: "mike@restaurant.com", role: "Member", status: "pending" },
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Member" as const });

  const handleAddMember = () => {
    if (user?.plan === "Basic") {
      toast.error("Team members are available on Pro and Enterprise plans");
      return;
    }
    if (!newMember.name || !newMember.email) {
      toast.error("Please fill in all fields");
      return;
    }
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      status: "pending"
    };
    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: "", email: "", role: "Member" });
    setShowAddMember(false);
    toast.success("Invitation sent!");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success("Member removed");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  const handleCancelSubscription = () => {
    toast.error("This is a demo - subscription management is disabled");
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl mb-1">Account Settings</h2>
          <p className="text-gray-600">Manage your account, subscription, and team</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="restaurantName"
                        defaultValue={user?.restaurantName}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
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
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button type="submit" variant="outline">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl">{user?.plan} Plan</h3>
                      {user?.plan === "Pro" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          <Crown className="w-4 h-4" />
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {user?.plan === "Basic" && "Perfect for small restaurants"}
                      {user?.plan === "Pro" && "Advanced features for growing restaurants"}
                      {user?.plan === "Enterprise" && "Custom solution for restaurant chains"}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Billing cycle:</span>
                        <span>Monthly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Next billing date:</span>
                        <span>January 3, 2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Amount:</span>
                        <span>
                          {user?.plan === "Basic" && "$49/month"}
                          {user?.plan === "Pro" && "$149/month"}
                          {user?.plan === "Enterprise" && "Custom"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.plan !== "Enterprise" && (
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      {user?.plan === "Basic" ? "Upgrade to Pro" : "Upgrade to Enterprise"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div>•••• •••• •••• 4242</div>
                    <div className="text-sm text-gray-600">Expires 12/2025</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update Payment Method</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Dec 3, 2024", amount: "$149.00", status: "Paid" },
                    { date: "Nov 3, 2024", amount: "$149.00", status: "Paid" },
                    { date: "Oct 3, 2024", amount: "$149.00", status: "Paid" },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="text-sm">{invoice.date}</div>
                        <div className="text-xs text-gray-600">{invoice.status}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{invoice.amount}</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Once you cancel your subscription, you will lose access to all features at the end of your billing period.
                </p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Button 
                    onClick={() => setShowAddMember(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={user?.plan === "Basic"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {user?.plan === "Basic" ? (
                  <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                    <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="mb-2">Team Collaboration</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upgrade to Pro or Enterprise to invite team members and collaborate on feedback management.
                    </p>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Upgrade Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {showAddMember && (
                      <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="memberName">Name</Label>
                          <Input
                            id="memberName"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memberEmail">Email</Label>
                          <Input
                            id="memberEmail"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            placeholder="john@restaurant.com"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddMember} className="bg-orange-500 hover:bg-orange-600">
                            Send Invitation
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddMember(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{member.name}</span>
                              {member.role === "Owner" && (
                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm px-2 py-1 rounded ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                          {member.role !== "Owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
