import React, { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatPage from "@/features/chat/ChatPage";
import TimetablePanel from "@/features/timetable/TimetablePanel";

type TabKey = "timetable" | "chat" | "announcements" | "settings" | "help";

export default function StudentDashboard() {
  const [tab, setTab] = useState<TabKey>("timetable");

  return (
    <div className="min-h-screen  flex bg-gray-50">
      <aside className="p-4">
        <Sidebar role="student" onSelect={(k) => setTab(k as TabKey)} />
      </aside>
      <main className="flex-1 p-6">
        <div className="w-full">
          {tab === "timetable" ? (
            <TimetablePanel />
          ) : tab === "chat" ? (
            <ChatPage />
          ) : (
            <div className="p-6 text-gray-500">
              No content yet for this section.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
