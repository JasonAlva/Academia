import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = "http://localhost:8000/api";

export default function AuthForm({
  onAuthSuccess,
}: {
  onAuthSuccess: (data: { token: string; user: any }) => void;
}) {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });

  const handleAuth = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      if (!response.ok) throw new Error("Authentication failed");

      const data = await response.json();
      onAuthSuccess(data);
    } catch (error) {
      if (error instanceof Error) {
        alert("Authentication failed: " + error.message);
      } else {
        alert("unknown error");
      }
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {authMode === "register" && (
        <Input
          placeholder="Full Name"
          value={authForm.name}
          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
          required
        />
      )}

      {authMode === "register" && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <Select
            value={authForm.role}
            onValueChange={(val) => setAuthForm({ ...authForm, role: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      <Input
        type="email"
        placeholder="Email"
        value={authForm.email}
        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={authForm.password}
        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
        required
      />

      <Button type="submit" className="w-full">
        {authMode === "login" ? "Login" : "Register"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
      >
        {authMode === "login"
          ? "Need an account? Register"
          : "Have an account? Login"}
      </Button>
    </form>
  );
}
