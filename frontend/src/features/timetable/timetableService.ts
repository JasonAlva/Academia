import type {
  TimeTableType,
  FullTimeTable,
  TimeTableStructure,
  SubjectsDetailsList,
  Teacher,
  Subject,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const timetableService = {
  // Get timetable structure configuration
  async getTimeTableStructure(): Promise<TimeTableStructure> {
    return request("/schedules/structure", { method: "GET" });
  },

  // Get all schedules
  async getSchedule(): Promise<FullTimeTable> {
    return request("/schedules", { method: "GET" });
  },

  // Save a specific schedule
  async saveSchedule(
    semester: number,
    section: number,
    timetable: TimeTableType
  ): Promise<void> {
    return request("/schedules", {
      method: "POST",
      body: JSON.stringify({ semester, section, timetable }),
    });
  },

  // Generate timetable automatically
  async generateTimeTable(): Promise<FullTimeTable> {
    return request("/schedules/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  // Get subjects details list
  async getSubjectsDetailsList(): Promise<SubjectsDetailsList> {
    return request("/courses", { method: "GET" });
  },

  // Get teachers list
  async getTeachersList(): Promise<Teacher[]> {
    return request("/teachers", { method: "GET" });
  },

  // Get subjects list
  async getSubjectsList(): Promise<Subject[]> {
    return request("/courses", { method: "GET" });
  },
};
