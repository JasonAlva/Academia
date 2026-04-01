// Timetable Types
export type PeriodDetails = [string, string, string]; // [teacher, subject, room]

export type DaySchedule = (PeriodDetails | null)[];

export type TimeTableType = (DaySchedule | null)[];

export type FullTimeTable = TimeTableType[]; // [semester][day][period]

export interface TimeTableStructure {
  breaksPerSemester: number[][]; // Break positions for each semester
  periodCount: number; // Total slots including breaks
  sectionsPerSemester: number[]; // Number of sections per semester
  semesterCount: number; // Total semesters (e.g., 8 for 4 years)
  dayCount: number; // Number of days (e.g., 5 for Mon-Fri)
}

export interface SubjectDetails {
  subjectName: string;
  teacherName: string;
  roomCodes: string[];
  color?: string;
}

export interface SubjectsDetailsList {
  [subjectCode: string]: SubjectDetails;
}

export interface Teacher {
  id: string;
  name: string;
  department?: string;
  email?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits?: number;
  department_id?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}
