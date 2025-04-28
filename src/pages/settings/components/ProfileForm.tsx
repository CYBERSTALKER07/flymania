
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, Clock } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  currentAgent: {
    name: string;
    email: string;
    bio?: string;
  };
}

export function ProfileForm({ currentAgent }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const defaultValues: Partial<ProfileFormValues> = {
    name: currentAgent.name,
    email: currentAgent.email,
    bio: currentAgent.bio || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    const updates = {
      name: data.name,
      email: data.email,
      // Optionally include 'bio' if you store it
    };
    let error;
    try {
      if (user?.id) {
        const { error: supaError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
        error = supaError;
      } else {
        error = { message: "No user ID" };
      }
      if (error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message || "Error updating profile",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Unknown error",
      });
    }
    setIsSaving(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-16 w-16">
            <AvatarImage alt={currentAgent.name} src="/placeholder.svg" />
            <AvatarFallback>
              {currentAgent.name
                ? currentAgent.name.split(" ").map((n) => n[0]).join("")
                : ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" type="button" disabled>
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
