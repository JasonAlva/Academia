# Data Flow Diagrams (DFD) - College Management System

## DFD Level 0 (Context Diagram)

```
                                    ┌─────────────────────────────────────┐
                                    │                                     │
                                    │   COLLEGE MANAGEMENT SYSTEM (CMS)   │
                                    │                                     │
                                    └─────────────────────────────────────┘
                                                   ▲
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    │                              │                              │
            ┌───────▼────────┐            ┌───────▼────────┐            ┌────────▼───────┐
            │                │            │                │            │                │
            │    STUDENT     │            │    TEACHER     │            │     ADMIN      │
            │                │            │                │            │                │
            └────────────────┘            └────────────────┘            └────────────────┘
                    │                              │                              │
                    │                              │                              │
                    └──────────────────────────────┴──────────────────────────────┘
                                                   │
                                                   ▼
                                    ┌─────────────────────────────────────┐
                                    │         DATABASE (PostgreSQL)        │
                                    │   • Users         • Courses          │
                                    │   • Students      • Enrollments      │
                                    │   • Teachers      • Schedules        │
                                    │   • Departments   • Attendance       │
                                    │   • Chat Messages                    │
                                    └─────────────────────────────────────┘


External Entities:
┌────────────────────────────────────────────────────────────────────────┐
│ • STUDENT: Enrolls in courses, views attendance, grades, timetable     │
│ • TEACHER: Manages courses, marks attendance, views schedules          │
│ • ADMIN: Manages users, departments, courses, monitors system          │
└────────────────────────────────────────────────────────────────────────┘

Data Flows:
┌────────────────────────────────────────────────────────────────────────┐
│ IN:  Login credentials, queries, course enrollments, attendance marks  │
│ OUT: User data, course info, schedules, attendance reports, analytics  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## DFD Level 1 (Main Processes)

```
                        ┌───────────────────────┐
                        │      EXTERNAL         │
                        │       ENTITIES        │
                        │ Student/Teacher/Admin │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  1.0          │ │  2.0     │ │   3.0       │
            │ AUTHENTICATION│ │  USER    │ │  ACADEMIC   │
            │   & SECURITY  │ │ MANAGEMENT│ │ MANAGEMENT  │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  4.0          │ │  5.0     │ │   6.0       │
            │  ATTENDANCE   │ │ SCHEDULE │ │  ENROLLMENT │
            │  MANAGEMENT   │ │ MANAGEMENT│ │ MANAGEMENT  │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  7.0          │ │  8.0     │ │   9.0       │
            │   REPORTING   │ │   CHAT   │ │  ANALYTICS  │
            │   & ANALYTICS │ │  AGENT   │ │  & QUERIES  │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │         DATA STORES           │
                    │ D1: Users                     │
                    │ D2: Students/Teachers/Admins  │
                    │ D3: Departments               │
                    │ D4: Courses                   │
                    │ D5: Enrollments               │
                    │ D6: Schedules/Sessions        │
                    │ D7: Student Attendance        │
                    │ D8: Teacher Attendance        │
                    │ D9: Chat Messages             │
                    └───────────────────────────────┘


PROCESS DESCRIPTIONS:
┌──────────────────────────────────────────────────────────────────────────┐
│ 1.0 AUTHENTICATION & SECURITY                                            │
│     Input:  Login credentials, registration data                         │
│     Output: JWT tokens, user session data                                │
│     Stores: D1 (Users)                                                   │
│                                                                           │
│ 2.0 USER MANAGEMENT                                                      │
│     Input:  User data (CRUD operations)                                  │
│     Output: User profiles, role-based data                               │
│     Stores: D1 (Users), D2 (Students/Teachers/Admins)                    │
│                                                                           │
│ 3.0 ACADEMIC MANAGEMENT                                                  │
│     Input:  Course data, department data                                 │
│     Output: Course lists, department info, syllabi                       │
│     Stores: D3 (Departments), D4 (Courses)                               │
│                                                                           │
│ 4.0 ATTENDANCE MANAGEMENT                                                │
│     Input:  Attendance marks, session data                               │
│     Output: Attendance reports, statistics                               │
│     Stores: D6 (Sessions), D7 (Student Attendance), D8 (Teacher Attend.) │
│                                                                           │
│ 5.0 SCHEDULE MANAGEMENT                                                  │
│     Input:  Schedule data, timetable parameters                          │
│     Output: Timetables, class schedules                                  │
│     Stores: D6 (Schedules/Sessions)                                      │
│                                                                           │
│ 6.0 ENROLLMENT MANAGEMENT                                                │
│     Input:  Enrollment requests, course selections                       │
│     Output: Enrollment confirmations, student course lists               │
│     Stores: D5 (Enrollments)                                             │
│                                                                           │
│ 7.0 REPORTING & ANALYTICS                                                │
│     Input:  Query parameters, date ranges                                │
│     Output: Analytics, reports, statistics                               │
│     Stores: All data stores                                              │
│                                                                           │
│ 8.0 CHAT AGENT                                                           │
│     Input:  Natural language queries                                     │
│     Output: AI-generated responses, data insights                        │
│     Stores: D9 (Chat Messages), All data stores (read)                   │
│                                                                           │
│ 9.0 ANALYTICS & QUERIES                                                  │
│     Input:  Complex queries, filtering criteria                          │
│     Output: Aggregated data, trends, insights                            │
│     Stores: All data stores (read)                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 1.0 (Authentication & Security)

```
                        ┌───────────────────────┐
                        │      USER (Student/    │
                        │    Teacher/Admin)      │
                        └───────────┬───────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                ┌───────▼───────┐       ┌──────▼──────┐
                │  1.1          │       │   1.2       │
                │    LOGIN      │       │  REGISTER   │
                │  PROCESS      │       │   USER      │
                └───────┬───────┘       └──────┬──────┘
                        │                       │
                        │  ┌────────────────────┘
                        │  │
                ┌───────▼──▼───────┐
                │  1.3             │
                │  VALIDATE        │
                │  CREDENTIALS     │
                └───────┬──────────┘
                        │
                ┌───────▼───────┐
                │  1.4          │
                │  GENERATE     │
                │  JWT TOKEN    │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │  1.5          │
                │  VERIFY       │
                │  TOKEN        │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │  D1: USERS    │
                └───────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 1.1 LOGIN PROCESS                                            │
│     Input:  email, password                                  │
│     Output: Authentication request                           │
│     Logic:  Accept user credentials                          │
│                                                               │
│ 1.2 REGISTER USER                                            │
│     Input:  User registration data (name, email, password,   │
│             role)                                            │
│     Output: New user account                                 │
│     Logic:  Hash password, create user record                │
│                                                               │
│ 1.3 VALIDATE CREDENTIALS                                     │
│     Input:  email, password hash                             │
│     Process: Query D1, compare hashed passwords              │
│     Output: Validation result (success/failure)              │
│                                                               │
│ 1.4 GENERATE JWT TOKEN                                       │
│     Input:  User ID, role, email                             │
│     Process: Create JWT with expiration                      │
│     Output: Access token                                     │
│                                                               │
│ 1.5 VERIFY TOKEN                                             │
│     Input:  JWT token from request header                    │
│     Process: Decode and validate token                       │
│     Output: User context (ID, role)                          │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 2.0 (User Management)

```
                        ┌───────────────────────┐
                        │      ADMIN/USER       │
                        └───────────┬───────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
    ┌───────▼───────┐       ┌──────▼──────┐       ┌───────▼───────┐
    │  2.1          │       │   2.2       │       │   2.3         │
    │  CREATE/      │       │  MANAGE     │       │  MANAGE       │
    │  UPDATE USER  │       │  STUDENT    │       │  TEACHER      │
    │               │       │  PROFILE    │       │  PROFILE      │
    └───────┬───────┘       └──────┬──────┘       └───────┬───────┘
            │                       │                       │
            │               ┌───────▼──────┐                │
            │               │   2.4        │                │
            │               │  MANAGE      │                │
            │               │  ADMIN       │                │
            │               │  PROFILE     │                │
            │               └──────┬───────┘                │
            │                      │                        │
            └──────────────────────┼────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼───────┐           ┌─────────▼─────────┐
            │  D1: USERS    │           │ D2: STUDENTS/     │
            │               │           │     TEACHERS/     │
            │               │           │     ADMINS        │
            └───────────────┘           └───────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 2.1 CREATE/UPDATE USER                                       │
│     Input:  User data (name, email, password, role)          │
│     Output: User record                                      │
│     Stores: D1 (Users)                                       │
│     Logic:  CRUD operations on user base table               │
│                                                               │
│ 2.2 MANAGE STUDENT PROFILE                                   │
│     Input:  Student details (studentId, department, semester,│
│             batch, phone, address, DOB)                      │
│     Output: Student profile                                  │
│     Stores: D2 (Students)                                    │
│     Logic:  Create/update student-specific information       │
│                                                               │
│ 2.3 MANAGE TEACHER PROFILE                                   │
│     Input:  Teacher details (teacherId, department,          │
│             designation, specialization, office info)        │
│     Output: Teacher profile                                  │
│     Stores: D2 (Teachers)                                    │
│     Logic:  Create/update teacher-specific information       │
│                                                               │
│ 2.4 MANAGE ADMIN PROFILE                                     │
│     Input:  Admin details (adminId)                          │
│     Output: Admin profile                                    │
│     Stores: D2 (Admins)                                      │
│     Logic:  Create/update admin-specific information         │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 3.0 (Academic Management)

```
                        ┌───────────────────────┐
                        │      ADMIN/TEACHER    │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  3.1          │ │  3.2     │ │   3.3       │
            │  MANAGE       │ │ MANAGE   │ │  ASSIGN     │
            │  DEPARTMENTS  │ │ COURSES  │ │  TEACHER    │
            │               │ │          │ │  TO COURSE  │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    │       ┌───────▼───────┐       │
                    │       │  3.4          │       │
                    │       │  UPDATE       │       │
                    │       │  COURSE       │       │
                    │       │  DETAILS      │       │
                    │       └───────┬───────┘       │
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼───────┐             ┌─────────▼─────────┐
            │ D3:           │             │ D4:               │
            │ DEPARTMENTS   │             │ COURSES           │
            └───────────────┘             └───────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 3.1 MANAGE DEPARTMENTS                                       │
│     Input:  Department data (code, name, description,        │
│             HOD name)                                        │
│     Output: Department records                               │
│     Stores: D3 (Departments)                                 │
│     Logic:  Create, read, update, delete departments         │
│                                                               │
│ 3.2 MANAGE COURSES                                           │
│     Input:  Course data (courseCode, courseName, credits,    │
│             semester, department, syllabus, maxStudents)     │
│     Output: Course records                                   │
│     Stores: D4 (Courses)                                     │
│     Logic:  Create, read, update, delete courses             │
│                                                               │
│ 3.3 ASSIGN TEACHER TO COURSE                                 │
│     Input:  Course ID, Teacher ID                            │
│     Output: Updated course with teacher assignment           │
│     Stores: D4 (Courses)                                     │
│     Logic:  Link teacher to course                           │
│                                                               │
│ 3.4 UPDATE COURSE DETAILS                                    │
│     Input:  Course modifications (description, syllabus,     │
│             active status)                                   │
│     Output: Updated course information                       │
│     Stores: D4 (Courses)                                     │
│     Logic:  Modify course metadata                           │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 4.0 (Attendance Management)

```
                        ┌───────────────────────┐
                        │   TEACHER/ADMIN       │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  4.1          │ │  4.2     │ │   4.3       │
            │  CREATE       │ │  MARK    │ │  MARK       │
            │  CLASS        │ │ STUDENT  │ │  TEACHER    │
            │  SESSION      │ │ATTENDANCE│ │  ATTENDANCE │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    │       ┌───────▼───────┐       │
                    │       │  4.4          │       │
                    │       │  UPDATE       │       │
                    │       │  ATTENDANCE   │       │
                    │       │  RECORD       │       │
                    │       └───────┬───────┘       │
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  4.5          │ │  4.6     │ │   4.7       │
            │  GENERATE     │ │ CALCULATE│ │  VIEW       │
            │  ATTENDANCE   │ │ATTENDANCE│ │  ATTENDANCE │
            │  REPORT       │ │PERCENTAGE│ │  HISTORY    │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
    ┌───────▼───────┐   ┌─────────────┐   ┌───────────────▼────┐
    │ D6: CLASS     │   │ D7: STUDENT │   │ D8: TEACHER        │
    │ SESSIONS      │   │ ATTENDANCE  │   │ ATTENDANCE         │
    └───────────────┘   └─────────────┘   └────────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 4.1 CREATE CLASS SESSION                                     │
│     Input:  Course ID, teacher ID, date, time, room, topic   │
│     Output: Class session record                             │
│     Stores: D6 (Class Sessions)                              │
│     Logic:  Create new session entry for attendance tracking │
│                                                               │
│ 4.2 MARK STUDENT ATTENDANCE                                  │
│     Input:  Session ID, student IDs, attendance status       │
│             (PRESENT/ABSENT/LATE/EXCUSED/MEDICAL_LEAVE)      │
│     Output: Student attendance records                       │
│     Stores: D7 (Student Attendance)                          │
│     Logic:  Record individual student attendance per session │
│                                                               │
│ 4.3 MARK TEACHER ATTENDANCE                                  │
│     Input:  Session ID, teacher ID, attendance status        │
│     Output: Teacher attendance record                        │
│     Stores: D8 (Teacher Attendance)                          │
│     Logic:  Admin marks teacher's presence for session       │
│                                                               │
│ 4.4 UPDATE ATTENDANCE RECORD                                 │
│     Input:  Attendance ID, modified status, remarks          │
│     Output: Updated attendance record                        │
│     Stores: D7 (Student Attendance), D8 (Teacher Attendance) │
│     Logic:  Modify existing attendance entries               │
│                                                               │
│ 4.5 GENERATE ATTENDANCE REPORT                               │
│     Input:  Student/course/date range filters                │
│     Output: Attendance report (PDF/Excel)                    │
│     Stores: D6, D7 (Read)                                    │
│     Logic:  Aggregate attendance data with formatting        │
│                                                               │
│ 4.6 CALCULATE ATTENDANCE PERCENTAGE                          │
│     Input:  Student ID, course ID, date range                │
│     Output: Attendance percentage                            │
│     Stores: D7 (Read)                                        │
│     Logic:  (Present sessions / Total sessions) × 100        │
│                                                               │
│ 4.7 VIEW ATTENDANCE HISTORY                                  │
│     Input:  Student/teacher ID, course ID, filters           │
│     Output: Historical attendance records                    │
│     Stores: D6, D7, D8 (Read)                                │
│     Logic:  Query and display past attendance records        │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 5.0 (Schedule Management)

```
                        ┌───────────────────────┐
                        │   ADMIN/TEACHER       │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  5.1          │ │  5.2     │ │   5.3       │
            │  CREATE       │ │  UPDATE  │ │  DELETE     │
            │  SCHEDULE     │ │ SCHEDULE │ │  SCHEDULE   │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  5.4          │ │  5.5     │ │   5.6       │
            │  VIEW         │ │ GENERATE │ │  CHECK      │
            │  TIMETABLE    │ │TIMETABLE │ │  CONFLICTS  │
            │  (by role)    │ │ (by dept)│ │             │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │ D6: SCHEDULES & CLASS SESSIONS│
                    │ Related: D4 (Courses),        │
                    │          D2 (Teachers)        │
                    └───────────────────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 5.1 CREATE SCHEDULE                                          │
│     Input:  Course ID, teacher ID, day of week, start time,  │
│             end time, room, building, type (LECTURE/LAB)     │
│     Output: Schedule record                                  │
│     Stores: D6 (Schedules)                                   │
│     Logic:  Create recurring class schedule entry            │
│                                                               │
│ 5.2 UPDATE SCHEDULE                                          │
│     Input:  Schedule ID, modified time/room/status           │
│     Output: Updated schedule                                 │
│     Stores: D6 (Schedules)                                   │
│     Logic:  Modify existing schedule parameters              │
│                                                               │
│ 5.3 DELETE SCHEDULE                                          │
│     Input:  Schedule ID                                      │
│     Output: Deletion confirmation                            │
│     Stores: D6 (Schedules)                                   │
│     Logic:  Remove schedule (soft delete with isActive flag) │
│                                                               │
│ 5.4 VIEW TIMETABLE (by role)                                 │
│     Input:  User role, user ID                               │
│     Output: Personalized timetable                           │
│     Stores: D6 (Read)                                        │
│     Logic:  Filter schedules based on student enrollments    │
│             or teacher assignments                           │
│                                                               │
│ 5.5 GENERATE TIMETABLE (by department)                       │
│     Input:  Department code, semester                        │
│     Output: Department-wide timetable                        │
│     Stores: D6, D4, D2 (Read)                                │
│     Logic:  Aggregate all schedules for department           │
│                                                               │
│ 5.6 CHECK CONFLICTS                                          │
│     Input:  Teacher/room, day, time slot                     │
│     Output: Conflict list or validation success              │
│     Stores: D6 (Read)                                        │
│     Logic:  Detect overlapping schedules for same            │
│             teacher/room/time                                │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 6.0 (Enrollment Management)

```
                        ┌───────────────────────┐
                        │   STUDENT/ADMIN       │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  6.1          │ │  6.2     │ │   6.3       │
            │  ENROLL IN    │ │  VIEW    │ │  DROP       │
            │  COURSE       │ │ENROLLMENTS│ │  COURSE     │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    │       ┌───────▼───────┐       │
                    │       │  6.4          │       │
                    │       │  UPDATE       │       │
                    │       │  ENROLLMENT   │       │
                    │       │  STATUS       │       │
                    │       └───────┬───────┘       │
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼─────┐ ┌──────▼──────┐
            │  6.5          │ │  6.6     │ │   6.7       │
            │  ASSIGN       │ │  CHECK   │ │  VIEW       │
            │  GRADES       │ │ COURSE   │ │  STUDENT    │
            │               │ │ CAPACITY │ │  GRADES     │
            └───────┬───────┘ └────┬─────┘ └──────┬──────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │ D5: ENROLLMENTS               │
                    │ Related: D2 (Students),       │
                    │          D4 (Courses)         │
                    └───────────────────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 6.1 ENROLL IN COURSE                                         │
│     Input:  Student ID, course ID                            │
│     Output: Enrollment record                                │
│     Stores: D5 (Enrollments)                                 │
│     Logic:  Create enrollment entry with status ACTIVE,      │
│             validate prerequisites and capacity              │
│                                                               │
│ 6.2 VIEW ENROLLMENTS                                         │
│     Input:  Student ID or course ID                          │
│     Output: List of enrollments with course details          │
│     Stores: D5, D4 (Read)                                    │
│     Logic:  Query enrollments filtered by student or course  │
│                                                               │
│ 6.3 DROP COURSE                                              │
│     Input:  Enrollment ID                                    │
│     Output: Updated enrollment status                        │
│     Stores: D5 (Enrollments)                                 │
│     Logic:  Change enrollment status to DROPPED              │
│                                                               │
│ 6.4 UPDATE ENROLLMENT STATUS                                 │
│     Input:  Enrollment ID, new status (ACTIVE/COMPLETED/     │
│             DROPPED/FAILED/WITHDRAWN)                        │
│     Output: Updated enrollment                               │
│     Stores: D5 (Enrollments)                                 │
│     Logic:  Modify enrollment status based on admin/system   │
│             rules                                            │
│                                                               │
│ 6.5 ASSIGN GRADES                                            │
│     Input:  Enrollment ID, grade, grade points               │
│     Output: Updated enrollment with grades                   │
│     Stores: D5 (Enrollments)                                 │
│     Logic:  Teacher assigns final grade to enrollment        │
│                                                               │
│ 6.6 CHECK COURSE CAPACITY                                    │
│     Input:  Course ID                                        │
│     Output: Available seats, enrollment count                │
│     Stores: D4 (Courses), D5 (Enrollments - Read)           │
│     Logic:  Compare current enrollments vs maxStudents       │
│                                                               │
│ 6.7 VIEW STUDENT GRADES                                      │
│     Input:  Student ID, semester (optional)                  │
│     Output: Grade report with course details                 │
│     Stores: D5, D4 (Read)                                    │
│     Logic:  Retrieve all completed enrollments with grades   │
└──────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Process 8.0 (Chat Agent - AI Assistant)

```
                        ┌───────────────────────┐
                        │   STUDENT/TEACHER/    │
                        │      ADMIN            │
                        └───────────┬───────────┘
                                    │
                            ┌───────▼───────┐
                            │  8.1          │
                            │  RECEIVE      │
                            │  USER QUERY   │
                            └───────┬───────┘
                                    │
                            ┌───────▼───────┐
                            │  8.2          │
                            │  DETERMINE    │
                            │  USER ROLE    │
                            │  & CONTEXT    │
                            └───────┬───────┘
                                    │
                            ┌───────▼───────┐
                            │  8.3          │
                            │  ROUTE TO     │
                            │  SPECIALIZED  │
                            │  AGENT        │
                            └───────┬───────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
    ┌───────▼───────┐       ┌──────▼──────┐       ┌───────▼───────┐
    │  8.4          │       │   8.5       │       │   8.6         │
    │  STUDENT      │       │  TEACHER    │       │  ADMIN        │
    │  AGENT        │       │  AGENT      │       │  AGENT        │
    │  (Courses,    │       │ (Attendance,│       │ (Analytics,   │
    │  Grades,      │       │  Schedules, │       │  Reports,     │
    │  Attendance)  │       │  Students)  │       │  Management)  │
    └───────┬───────┘       └──────┬──────┘       └───────┬───────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                            ┌───────▼───────┐
                            │  8.7          │
                            │  QUERY        │
                            │  DATABASE     │
                            │  (via tools)  │
                            └───────┬───────┘
                                    │
                            ┌───────▼───────┐
                            │  8.8          │
                            │  GENERATE     │
                            │  LLM          │
                            │  RESPONSE     │
                            └───────┬───────┘
                                    │
                            ┌───────▼───────┐
                            │  8.9          │
                            │  SAVE CHAT    │
                            │  MESSAGE      │
                            └───────┬───────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        ┌───────▼───────┐                   ┌───────────▼─────────┐
        │ D9: CHAT      │                   │ ALL DATA STORES     │
        │ MESSAGES      │                   │ (Read Access)       │
        └───────────────┘                   └─────────────────────┘


SUBPROCESS DETAILS:
┌──────────────────────────────────────────────────────────────┐
│ 8.1 RECEIVE USER QUERY                                       │
│     Input:  Natural language question/request                │
│     Output: Query text, user context                         │
│     Logic:  Accept text input from frontend                  │
│                                                               │
│ 8.2 DETERMINE USER ROLE & CONTEXT                            │
│     Input:  User ID, JWT token                               │
│     Output: User role (STUDENT/TEACHER/ADMIN), permissions   │
│     Stores: D1 (Users - Read)                                │
│     Logic:  Extract role from authenticated session          │
│                                                               │
│ 8.3 ROUTE TO SPECIALIZED AGENT                               │
│     Input:  Query, user role                                 │
│     Output: Agent selection                                  │
│     Logic:  LangGraph routing based on role and query intent │
│                                                               │
│ 8.4 STUDENT AGENT                                            │
│     Input:  Student queries about courses, grades,           │
│             attendance, schedule                             │
│     Tools:  Access to enrollments, attendance records,       │
│             course info, schedules                           │
│     Output: Student-specific responses                       │
│                                                               │
│ 8.5 TEACHER AGENT                                            │
│     Input:  Teacher queries about their courses, student     │
│             lists, attendance marking, schedules             │
│     Tools:  Access to course management, attendance marking, │
│             student records for enrolled courses             │
│     Output: Teacher-specific responses                       │
│                                                               │
│ 8.6 ADMIN AGENT                                              │
│     Input:  Admin queries about system analytics, reports,   │
│             user management, department data                 │
│     Tools:  Full database access, analytics functions,       │
│             reporting tools                                  │
│     Output: Admin-specific responses with analytics          │
│                                                               │
│ 8.7 QUERY DATABASE (via tools)                               │
│     Input:  Structured query from agent                      │
│     Output: Database results                                 │
│     Stores: All data stores (Read)                           │
│     Logic:  Execute queries through specialized tools        │
│             (department_tools.py, etc.)                      │
│                                                               │
│ 8.8 GENERATE LLM RESPONSE                                    │
│     Input:  Database results, query context                  │
│     Output: Natural language response                        │
│     Logic:  Use LLM (via llm config) to generate helpful     │
│             human-readable response                          │
│                                                               │
│ 8.9 SAVE CHAT MESSAGE                                        │
│     Input:  User message, assistant response, metadata       │
│     Output: Chat history record                              │
│     Stores: D9 (Chat Messages)                               │
│     Logic:  Store conversation for history/analytics         │
└──────────────────────────────────────────────────────────────┘
```

---

## Complete Data Store Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                           DATA STORES                                  │
├────────────────────────────────────────────────────────────────────────┤
│ D1: USERS                                                              │
│     - User ID, email, password (hashed), role, name                    │
│     - Timestamps: createdAt, updatedAt                                 │
│                                                                         │
│ D2: STUDENT/TEACHER/ADMIN PROFILES                                     │
│     Students: ID, studentId, department, semester, batch, contact info │
│     Teachers: ID, teacherId, department, designation, specialization   │
│     Admins: ID, adminId                                                │
│                                                                         │
│ D3: DEPARTMENTS                                                        │
│     - Department ID, code, name, description, HOD name                 │
│                                                                         │
│ D4: COURSES                                                            │
│     - Course ID, code, name, credits, semester, department             │
│     - Teacher assignment, description, syllabus, max capacity          │
│     - Active status                                                    │
│                                                                         │
│ D5: ENROLLMENTS                                                        │
│     - Enrollment ID, student-course mapping                            │
│     - Status: ACTIVE/COMPLETED/DROPPED/FAILED/WITHDRAWN               │
│     - Grade and grade points                                           │
│                                                                         │
│ D6: SCHEDULES & CLASS SESSIONS                                         │
│     Schedules: Course, teacher, day, time, room, type (LECTURE/LAB)   │
│     Sessions: Specific date/time instances, topic, status              │
│                                                                         │
│ D7: STUDENT ATTENDANCE                                                 │
│     - Session-student mapping, status (PRESENT/ABSENT/LATE/EXCUSED)    │
│     - Marked by teacher, remarks                                       │
│                                                                         │
│ D8: TEACHER ATTENDANCE                                                 │
│     - Session-teacher mapping, attendance status                       │
│     - Marked by admin                                                  │
│                                                                         │
│ D9: CHAT MESSAGES                                                      │
│     - Message ID, user, role (USER/ASSISTANT), content                 │
│     - Thread ID, metadata, tokens used, response time                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                      COMPLETE SYSTEM DATA FLOWS                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ AUTHENTICATION FLOW:                                                   │
│   User → Login/Register → Validate → Generate JWT → User Session      │
│                                                                         │
│ STUDENT FLOW:                                                          │
│   Student → View Courses → Enroll → Attend Classes → View Attendance  │
│          → View Grades → Chat with AI Assistant                       │
│                                                                         │
│ TEACHER FLOW:                                                          │
│   Teacher → View Assigned Courses → Create Class Session →            │
│          → Mark Student Attendance → Assign Grades → View Schedules → │
│          → Chat with AI Assistant                                     │
│                                                                         │
│ ADMIN FLOW:                                                            │
│   Admin → Manage Departments → Manage Courses → Assign Teachers →     │
│        → Manage Users → Mark Teacher Attendance → View Analytics →    │
│        → Generate Reports → Chat with AI Assistant                    │
│                                                                         │
│ AI CHAT FLOW:                                                          │
│   User Query → Role Detection → Agent Routing (Student/Teacher/Admin) │
│   → Database Query via Tools → LLM Response Generation → Save History │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Key Interfaces & External Systems

```
┌────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTERFACES                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 1. FRONTEND (React/TypeScript)                                         │
│    - Web interface for all user roles                                  │
│    - Real-time updates via API calls                                   │
│    - Dashboard visualizations                                          │
│                                                                         │
│ 2. BACKEND API (FastAPI/Python)                                        │
│    - RESTful endpoints                                                 │
│    - JWT authentication middleware                                     │
│    - Role-based access control                                         │
│                                                                         │
│ 3. DATABASE (PostgreSQL via Prisma)                                    │
│    - Relational data storage                                           │
│    - Transaction management                                            │
│    - Data integrity constraints                                        │
│                                                                         │
│ 4. LLM SERVICE (AI Chat Agent)                                         │
│    - Natural language processing                                       │
│    - Context-aware responses                                           │
│    - LangGraph for multi-agent orchestration                           │
│                                                                         │
│ 5. DOCKER CONTAINERS                                                   │
│    - Backend service container                                         │
│    - Frontend service container                                        │
│    - Database container                                                │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Notes on DFD Design

### Level 0 (Context)

- Shows the system as a single process
- Identifies three main external entities: Student, Teacher, Admin
- Shows data flow between entities and the system
- Includes the database as a data store

### Level 1 (Main Processes)

- Decomposes system into 9 major processes
- Each process represents a major functional area
- Shows interaction between processes and data stores
- Demonstrates modular architecture

### Level 2 (Detailed Processes)

- Provides detailed breakdown of selected critical processes
- Shows specific subprocesses and their logic
- Details data transformations and validations
- Illustrates role-based access patterns

### Key Features Highlighted

1. **Role-Based Access Control**: Different flows for Student/Teacher/Admin
2. **AI Integration**: Specialized chat agents for each role
3. **Attendance Tracking**: Separate flows for students and teachers
4. **Academic Management**: Complete course lifecycle management
5. **Real-time Scheduling**: Conflict detection and timetable generation
6. **Comprehensive Reporting**: Analytics and reporting capabilities

---

_Generated on: December 28, 2025_
_System: College Management System (CMS)_
_Technology Stack: FastAPI, PostgreSQL, Prisma, React, LangGraph_
