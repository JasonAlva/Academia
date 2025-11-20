import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  to: string;
  title: string;
  icon?: React.ReactNode;
}

export default function SidebarItem({ to, title, icon }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500` +
        (isActive ? " bg-indigo-50" : " hover:bg-gray-50")
      }
    >
      <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </Button>
    </NavLink>
  );
}
