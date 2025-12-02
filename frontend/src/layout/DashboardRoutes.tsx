import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/layout";

export default function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
