
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sales-notifications">
              Sales Notifications
              <p className="text-sm text-muted-foreground">
                Receive notifications when a new ticket is sold
              </p>
            </Label>
            <Switch id="sales-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="report-notifications">
              Report Summaries
              <p className="text-sm text-muted-foreground">
                Receive weekly summaries of your sales performance
              </p>
            </Label>
            <Switch id="report-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notifications">
              System Notifications
              <p className="text-sm text-muted-foreground">
                Receive notifications about system updates and maintenance
              </p>
            </Label>
            <Switch id="system-notifications" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled">
              Enable Push Notifications
              <p className="text-sm text-muted-foreground">
                Allow SkyTrack Pro to send push notifications
              </p>
            </Label>
            <Switch id="push-enabled" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-sales">
              Ticket Sales
              <p className="text-sm text-muted-foreground">
                Notify when tickets are sold
              </p>
            </Label>
            <Switch id="push-sales" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-reminders">
              Reminders
              <p className="text-sm text-muted-foreground">
                Get reminded about pending tasks
              </p>
            </Label>
            <Switch id="push-reminders" defaultChecked />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
