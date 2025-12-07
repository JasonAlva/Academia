// Timetable Types
export type PeriodDetails = [string, string, string]; // [teacher, subject, room]

export type DaySchedule = (PeriodDetails | null)[];

export type TimeTableType = (DaySchedule | null)[];

export type FullTimeTable = TimeTableType[][];

export interface TimeTableStructure {
  breaksPerSemester: number[][];
  periodCount: number;
  sectionsPerSemester: number[];
  semesterCount: number;
  dayCount: number;
}

export interface SubjectDetails {
  subjectName: string;
  teacherName: string;
  roomCodes: string[];
  color?: string;
}

export interface SubjectsDetailsList {
  [key: string]: SubjectDetails;
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
  code?: string;
  credits?: number;
}
