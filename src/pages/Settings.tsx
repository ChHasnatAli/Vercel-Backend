import { useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, initials, updateProfile } = useProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);

  const [emailNotif, setEmailNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const [compactMode, setCompactMode] = useState(false);

  const saveProfile = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({ title: "Error", description: "First name, last name, and email are required.", variant: "destructive" });
      return;
    }

    updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), bio: bio.trim() });
    toast({ title: "Profile updated", description: "Your profile information has been saved." });
  };

  const savePreferences = () => {
    toast({ title: "Preferences saved", description: "Your preferences have been updated." });
  };

  const saveAppearance = () => {
    toast({ title: "Appearance saved", description: "Your appearance settings have been applied." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary h-9">
          <TabsTrigger value="profile" className="text-xs px-4">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs px-4">Preferences</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs px-4">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm">Change avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary border-none" />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary border-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-none" />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary border-none min-h-[100px]" />
              </div>

              <Button type="button" onClick={saveProfile} className="bg-primary text-primary-foreground">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription>Control notifications and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive account updates by email.</p>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Order notifications</p>
                  <p className="text-xs text-muted-foreground">Get alerts for new and updated orders.</p>
                </div>
                <Switch checked={orderNotif} onCheckedChange={setOrderNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Marketing emails</p>
                  <p className="text-xs text-muted-foreground">Receive product news and promotions.</p>
                </div>
                <Switch checked={marketingNotif} onCheckedChange={setMarketingNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">Add extra security for your account.</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>

              <Button type="button" onClick={savePreferences} className="bg-primary text-primary-foreground">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize how your dashboard looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>Light</Button>
                  <Button type="button" variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>Dark</Button>
                  <Button type="button" variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")}>System</Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compact mode</p>
                  <p className="text-xs text-muted-foreground">Use tighter spacing for dense layout.</p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>

              <Button type="button" onClick={saveAppearance} className="bg-primary text-primary-foreground">Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
