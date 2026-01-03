import { useApiClient } from "./api";
import type {
  FullTimeTable,
  TimeTableType,
  SubjectsDetailsList,
  Teacher,
  Subject,
} from "../features/timetable/types";

export interface Schedule {
  id: string;
  course_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  building: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreate {
  course_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  building: string;
  type: string;
  is_active?: boolean;
}

export interface ScheduleUpdate {
  course_id?: string;
  teacher_id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  room?: string;
  building?: string;
  type?: string;
  is_active?: boolean;
}

// Main timetable service - single export
class TimetableService {
  private getApi() {
    return useApiClient();
  }

  // Get the full schedule structure (semester -> section -> timetable)
  async getSchedule(): Promise<FullTimeTable> {
    const api = this.getApi();
    return api.get("/schedules/timetable");
  }

  // Get subjects details list with teacher and room info
  async getSubjectsDetailsList(): Promise<SubjectsDetailsList> {
    const api = this.getApi();
    return api.get("/schedules/subjects-details");
  }

  // Save schedule for a specific semester and section
  async saveSchedule(
    semester: number,
    section: number,
    timetable: TimeTableType
  ): Promise<void> {
    const api = this.getApi();
    return api.post("/schedules/save", {
      semester,
      section,
      timetable,
    });
  }

  // Generate timetable automatically using AI/algorithm
  async generateTimeTable(): Promise<FullTimeTable> {
    const api = this.getApi();
    return api.post("/schedules/generate", {});
  }

  // Get all teachers
  async getTeachersList(): Promise<Teacher[]> {
    const api = this.getApi();
    return api.get("/teachers");
  }

  // Get all subjects/courses
  async getSubjectsList(): Promise<Subject[]> {
    const api = this.getApi();
    return api.get("/courses");
  }

  // Get all schedules
  async getAllSchedules(): Promise<Schedule[]> {
    const api = this.getApi();
    return api.get("/schedules");
  }

  // Get teacher's timetable grid
  async getTeacherTimetable(teacherId: string): Promise<any> {
    const api = this.getApi();
    return api.get(`/schedules/teacher/${teacherId}/timetable`);
  }
  async getStudentTimetable(studentId: string): Promise<any> {
    const api = this.getApi();
    return api.get(`/schedules/student/${studentId}/timetable`);
  }

  // Get a specific schedule by ID
  async getScheduleById(scheduleId: string): Promise<Schedule> {
    const api = this.getApi();
    return api.get(`/schedules/${scheduleId}`);
  }

  // Create a new schedule
  async createSchedule(scheduleData: ScheduleCreate): Promise<Schedule> {
    const api = this.getApi();
    return api.post("/schedules", scheduleData);
  }

  // Update an existing schedule
  async updateSchedule(
    scheduleId: string,
    scheduleData: ScheduleUpdate
  ): Promise<Schedule> {
    const api = this.getApi();
    return api.put(`/schedules/${scheduleId}`, scheduleData);
  }

  // Delete a schedule
  async deleteSchedule(scheduleId: string): Promise<{ detail: string }> {
    const api = this.getApi();
    return api.delete(`/schedules/${scheduleId}`);
  }
}

// Single export - can be used directly in components
export const timetableService = new TimetableService();
