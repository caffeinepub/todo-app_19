import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Loader2, Monitor, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type ThemePreference, useTheme } from "../hooks/useTheme";
import { useGetUserProfile, useSaveUserProfile } from "../hooks/useUserProfile";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { data: profile, isLoading } = useGetUserProfile();
  const saveProfile = useSaveUserProfile();
  const [displayName, setDisplayName] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (profile?.name) {
      setDisplayName(profile.name);
    }
  }, [profile?.name]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({ name: displayName.trim() });
      toast.success("Display name saved!");
      onBack();
    } catch {
      toast.error("Failed to save display name. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        data-ocid="settings.back.button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      {/* Appearance card */}
      <Card className="mb-6" data-ocid="settings.appearance.panel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Choose how TaskFlow looks. System follows your OS preference.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(v) => v && setTheme(v as ThemePreference)}
            className="w-full"
            data-ocid="settings.theme.toggle"
          >
            <ToggleGroupItem
              value="light"
              className="flex-1 gap-2"
              data-ocid="settings.theme.light.toggle"
            >
              <Sun className="h-4 w-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem
              value="system"
              className="flex-1 gap-2"
              data-ocid="settings.theme.system.toggle"
            >
              <Monitor className="h-4 w-4" />
              System
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              className="flex-1 gap-2"
              data-ocid="settings.theme.dark.toggle"
            >
              <Moon className="h-4 w-4" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Profile card */}
      <Card data-ocid="settings.panel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>
                Set your display name to personalize your experience.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            {isLoading ? (
              <div
                className="h-9 animate-pulse rounded-md bg-muted"
                data-ocid="settings.loading_state"
              />
            ) : (
              <Input
                id="display-name"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                maxLength={50}
                data-ocid="settings.input"
              />
            )}
            <p className="text-xs text-muted-foreground">
              This name will appear in the header instead of your identity key.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onBack}
              data-ocid="settings.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saveProfile.isPending || isLoading || !displayName.trim()
              }
              data-ocid="settings.save_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>

          {saveProfile.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="settings.error_state"
            >
              Something went wrong. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
