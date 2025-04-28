
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Sun, Moon } from "lucide-react";

export function AppearanceForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred theme mode
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <RadioGroup defaultValue="light" className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-1.5">
                <Sun className="h-4 w-4" />
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-1.5">
                <Moon className="h-4 w-4" />
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Layout</h3>
        <p className="text-sm text-muted-foreground">
          Set your display preferences
        </p>
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="compact-mode">Compact Mode</Label>
            <Switch id="compact-mode" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comfortable-max-width">Comfortable Max Width</Label>
            <Switch id="comfortable-max-width" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-avatars">Show Avatars</Label>
            <Switch id="show-avatars" defaultChecked />
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
