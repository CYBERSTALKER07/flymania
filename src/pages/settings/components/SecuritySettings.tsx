
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input id="confirm-password" type="password" />
        </div>
        <Button>Update Password</Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
        </p>
        <div className="flex items-center justify-between">
          <Label htmlFor="two-factor">
            Enable Two-Factor Authentication
            <p className="text-sm text-muted-foreground">
              Require a verification code when signing in
            </p>
          </Label>
          <Switch id="two-factor" />
        </div>
        <Button variant="outline">Setup Two-Factor Authentication</Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Session Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage your active sessions and sign out from other devices
        </p>
        <div className="rounded-md border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">
                  Last active now • Windows • Chrome
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Current
            </Button>
          </div>
          <Separator />
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Mobile App</p>
                <p className="text-xs text-muted-foreground">
                  Last active 2 hours ago • iOS • SkyTrack App
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
        <Button variant="destructive">Sign Out All Devices</Button>
      </div>
    </div>
  );
}
