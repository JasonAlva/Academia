import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useUserService, type UserUpdate } from "@/services/userService";
import { useApiKeyService } from "@/services/apiKeyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, EyeOff, Key, ExternalLink, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const userService = useUserService();
  const apiKeyService = useApiKeyService();

  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState<{ has_key: boolean; hint?: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Load API key status on mount
  useEffect(() => {
    apiKeyService
      .getStatus()
      .then(setApiKeyStatus)
      .catch(() => setApiKeyStatus({ has_key: false }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: UserUpdate = {
        name: formData.name,
        email: formData.email,
      };

      const updatedUser = await userService.updateProfile(updateData);

      // Update auth context
      updateUser(updatedUser);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UserUpdate = {
        password: formData.newPassword,
      };

      await userService.updateProfile(updateData);

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
      console.error("Password update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setApiKeyLoading(true);
    try {
      const status = await apiKeyService.saveKey(apiKeyInput.trim());
      setApiKeyStatus(status);
      setApiKeyInput("");
      setShowApiKey(false);
      toast.success("API key saved securely!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save API key");
    } finally {
      setApiKeyLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setApiKeyLoading(true);
    try {
      const status = await apiKeyService.deleteKey();
      setApiKeyStatus(status);
      setApiKeyInput("");
      toast.success("API key removed.");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove API key");
    } finally {
      setApiKeyLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Profile Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-mono text-sm mt-1">{user.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium capitalize mt-1">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={
                isLoading || !formData.newPassword || !formData.confirmPassword
              }
            >
              {isLoading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── AI Settings (Google API Key) ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>AI Settings</CardTitle>
          </div>
          <CardDescription>
            Add your personal Google API key to power the AI assistant. Your key
            is stored encrypted and never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            {apiKeyStatus?.has_key ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Key saved
                {apiKeyStatus.hint && (
                  <span className="font-mono text-xs opacity-75">
                    ({apiKeyStatus.hint})
                  </span>
                )}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30"
              >
                <XCircle className="h-3.5 w-3.5" />
                No key saved
              </Badge>
            )}
          </div>

          <Separator />

          {/* Save / update key form */}
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                {apiKeyStatus?.has_key ? "Replace API Key" : "Enter your Google API Key"}
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10 font-mono"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showApiKey ? "Hide key" : "Show key"}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get a free key at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2 hover:opacity-80"
                >
                  Google AI Studio
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={apiKeyLoading || !apiKeyInput.trim()}
              >
                {apiKeyLoading ? "Saving..." : apiKeyStatus?.has_key ? "Update Key" : "Save Key"}
              </Button>

              {apiKeyStatus?.has_key && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
                  disabled={apiKeyLoading}
                  onClick={handleDeleteApiKey}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Key
                </Button>
              )}
            </div>
          </form>

          {/* Info box */}
          <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">How it works</p>
            <p>
              Your key is encrypted with AES before being stored. If you provide
              your own key, the AI assistant will use it for your queries.
              Otherwise the system key (if configured) is used. Your key is
              never visible to other users or in API responses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

