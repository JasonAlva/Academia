import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimeTableEntry {
  id?: string;
  userId?: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

const daysOrder = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function TimetablePanel() {
  const [entries, setEntries] = useState<TimeTableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<TimeTableEntry>>({
    courseName: "",
    courseCode: "",
    instructor: "",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    room: "",
    type: "LECTURE",
  });

  const fetchTimetable = async () => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/timetable", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const addEntry = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch("http://localhost:8000/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          ...form,
          courseName: "",
          courseCode: "",
          instructor: "",
          startTime: "",
          endTime: "",
          room: "",
          type: "LECTURE",
        });
        fetchTimetable();
      } else {
        const t = await res.text();
        alert("Failed to add entry: " + t);
      }
    } catch (err) {
      alert("Failed to add entry");
    }
  };

  const deleteEntry = async (id?: string) => {
    if (!id) return alert("Invalid id");
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`http://localhost:8000/api/timetable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchTimetable();
      else alert("Failed to delete");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const grouped = entries.reduce<Record<string, TimeTableEntry[]>>((acc, e) => {
    if (!acc[e.dayOfWeek]) acc[e.dayOfWeek] = [];
    acc[e.dayOfWeek].push(e);
    return acc;
  }, {});

  return (
    <Card className="w-full min-h-[520px]">
      <CardHeader>
        <CardTitle>My Timetable</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Course Name"
              value={form.courseName || ""}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
            />
            <Input
              placeholder="Course Code"
              value={form.courseCode || ""}
              onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
            />
            <Input
              placeholder="Instructor"
              value={form.instructor || ""}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />
            <select
              className="p-2 border rounded"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            >
              {daysOrder.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Input
              type="time"
              value={form.startTime || ""}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              type="time"
              value={form.endTime || ""}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
            <Input
              placeholder="Room"
              value={form.room || ""}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
            <select
              className="p-2 border rounded"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="LECTURE">Lecture</option>
              <option value="LAB">Lab</option>
              <option value="TUTORIAL">Tutorial</option>
            </select>
          </div>
          <div>
            <Button onClick={addEntry}>Add Entry</Button>
          </div>

          <div className="space-y-3">
            {daysOrder.map((day) => {
              const dayEntries = grouped[day] || [];
              if (dayEntries.length === 0) return null;
              return (
                <div key={day}>
                  <h4 className="font-semibold">{day}</h4>
                  <div className="space-y-2">
                    {dayEntries.map((en) => (
                      <div
                        key={en.id}
                        className="p-3 bg-white rounded shadow flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">
                            {en.courseName} ({en.courseCode})
                          </div>
                          <div className="text-xs text-gray-600">
                            {en.startTime} - {en.endTime} | {en.room}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            onClick={() => deleteEntry(en.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
