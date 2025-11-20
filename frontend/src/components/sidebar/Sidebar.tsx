import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  FileText,
  Users,
  BarChart,
  PlusSquare,
  Edit3,
} from "lucide-react";

export type Role = "student" | "teacher" | "admin";

interface SidebarProps {
  role: Role;
  onSelect?: (key: string) => void;
}

export default function Sidebar({ role, onSelect }: SidebarProps) {
  const navigate = useNavigate();

  const common = [
    {
      to: "/dashboard",
      key: "dashboard",
      title: "Dashboard",
      icon: <Home className="w-4 h-4" />,
    },
    {
      to: "/chat",
      key: "chat",
      title: "Chat",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      to: "/timetable",
      key: "timetable",
      title: "Timetable",
      icon: <FileText className="w-4 h-4" />,
    },
    // Placeholder sections
    {
      to: "/dashboard/announcements",
      key: "announcements",
      title: "Announcements",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      to: "/dashboard/settings",
      key: "settings",
      title: "Settings",
      icon: <Edit3 className="w-4 h-4" />,
    },
    {
      to: "/dashboard/help",
      key: "help",
      title: "Help",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const student = [
    {
      to: "/dashboard/my-queries",
      title: "My Queries",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      to: "/dashboard/submit",
      title: "Submit Query",
      icon: <PlusSquare className="w-4 h-4" />,
    },
  ];

  const teacher = [
    {
      to: "/dashboard/student-queries",
      title: "Student Queries",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      to: "/dashboard/respond",
      title: "Respond",
      icon: <Edit3 className="w-4 h-4" />,
    },
  ];

  const admin = [
    {
      to: "/dashboard/manage-users",
      title: "Manage Users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      to: "/dashboard/reports",
      title: "Reports",
      icon: <BarChart className="w-4 h-4" />,
    },
  ];

  const roleItems =
    role === "student" ? student : role === "teacher" ? teacher : admin;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <Card className="w-64 h-full">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="px-4 py-4 border-b">
          <h3 className="text-lg font-semibold">College Query</h3>
          <p className="text-xs text-muted-foreground">Role: {role}</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {common.map((c) =>
              onSelect ? (
                <div key={c.key}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2"
                    onClick={() => onSelect?.(c.key)}
                  >
                    {c.icon}
                    <span className="text-sm font-medium">{c.title}</span>
                  </Button>
                </div>
              ) : (
                <SidebarItem
                  key={c.to}
                  to={c.to}
                  title={c.title}
                  icon={c.icon}
                />
              )
            )}

            <Separator className="my-2" />

            {roleItems.map((c) => (
              <SidebarItem key={c.to} to={c.to} title={c.title} icon={c.icon} />
            ))}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
