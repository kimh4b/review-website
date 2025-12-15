import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { toast } from "sonner";

export function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserSignups, setNewUserSignups] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackups, setAutoBackups] = useState(true);

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings updated");
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Email settings updated");
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment settings updated");
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl mb-1">Platform Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>

        <Tabs defaultValue="platform">
          <TabsList>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePlatform} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      defaultValue="FeedbackPro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      defaultValue="support@feedbackpro.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      defaultValue="FeedbackPro Inc."
                    />
                  </div>

                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1">Maintenance Mode</div>
                      <p className="text-sm text-gray-600">Put the platform in maintenance mode</p>
                    </div>
                    <Switch 
                      checked={maintenanceMode}
                      onCheckedChange={(checked) => {
                        setMaintenanceMode(checked);
                        toast.success(checked ? "Maintenance mode enabled" : "Maintenance mode disabled");
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1">New User Signups</div>
                      <p className="text-sm text-gray-600">Allow new restaurants to sign up</p>
                    </div>
                    <Switch 
                      checked={newUserSignups}
                      onCheckedChange={(checked) => {
                        setNewUserSignups(checked);
                        toast.success(checked ? "Signups enabled" : "Signups disabled");
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1">Email Notifications</div>
                      <p className="text-sm text-gray-600">Send system email notifications</p>
                    </div>
                    <Switch 
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        toast.success("Email notification settings updated");
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1">Automatic Backups</div>
                      <p className="text-sm text-gray-600">Daily database backups at 2 AM</p>
                    </div>
                    <Switch 
                      checked={autoBackups}
                      onCheckedChange={(checked) => {
                        setAutoBackups(checked);
                        toast.success("Backup settings updated");
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      defaultValue="smtp.sendgrid.net"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      defaultValue="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      defaultValue="apikey"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      defaultValue="noreply@feedbackpro.com"
                    />
                  </div>

                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Save Email Settings
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeEmail">Welcome Email Template</Label>
                    <Textarea
                      id="welcomeEmail"
                      rows={4}
                      defaultValue="Welcome to FeedbackPro! We're excited to have you on board..."
                    />
                  </div>
                  <Button variant="outline">Edit Template</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
                    <Input
                      id="stripeKey"
                      defaultValue="pk_live_••••••••••••••••"
                      placeholder="pk_live_..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripeSecret">Stripe Secret Key</Label>
                    <Input
                      id="stripeSecret"
                      type="password"
                      placeholder="sk_live_..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="whsec_..."
                    />
                  </div>

                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Save Payment Settings
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basicPrice">Basic Plan Price</Label>
                      <Input
                        id="basicPrice"
                        type="number"
                        defaultValue="49"
                        placeholder="49"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proPrice">Pro Plan Price</Label>
                      <Input
                        id="proPrice"
                        type="number"
                        defaultValue="149"
                        placeholder="149"
                      />
                    </div>
                  </div>
                  <Button variant="outline">Update Pricing</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue="60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      defaultValue="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      defaultValue="8"
                    />
                  </div>

                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm mb-2">Production API Key</div>
                    <div className="font-mono text-sm">fp_live_••••••••••••••••••••••••</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Regenerate Key</Button>
                    <Button variant="outline">View Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Clear All Cache</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      This will clear all cached data across the platform. Use with caution.
                    </p>
                    <Button variant="outline" className="text-orange-600 border-orange-200">
                      Clear Cache
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="mb-2">Reset Database</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      This action cannot be undone. All data will be permanently deleted.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-200">
                      Reset Database
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
