"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { useAuth } from "@/auth/AuthContext";
import { getDashboardConfig, type UserRole } from "@/config/roles.config";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Normalize role to lowercase
  const normalizedRole = user.role?.toLowerCase() as UserRole;

  // Get the dashboard configuration based on user role
  const dashboardConfig = getDashboardConfig(normalizedRole, {
    name: user.name,
    email: user.email,
    role:user.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar config={dashboardConfig} variant="inset" />
      <SidebarInset>
        <TopBar title={user.email} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
