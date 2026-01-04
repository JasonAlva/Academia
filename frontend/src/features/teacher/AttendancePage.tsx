import { DashboardLayout } from "@/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconCalendar,
  IconCheck,
  IconX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherService } from "@/services/teacherService";
import { useAuth } from "@/auth/AuthContext";
import { useCourseService, type Course } from "@/services/courseService";
import { type Student } from "@/services/studentService";
import { useAttendanceService } from "@/services/attendanceService";
import { toast } from "sonner";

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const teacherService = useTeacherService();
  const courseService = useCourseService();
  const attendanceService = useAttendanceService();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  useEffect(() => {
    const fetchTeacherId = async () => {
      if (!user?.id) return;

      try {
        const teacher = await teacherService.getByUserId(user.id);

        if (teacher) {
          setTeacherId(teacher.id);
          console.log(teacher.id);
          console.log("tid");
        } else {
          setError("Teacher profile not found");
        }
      } catch (err) {
        console.error("Failed to fetch teacher profile:", err);
        setError("Failed to load teacher profile");
      }
    };

    fetchTeacherId();
  }, [user]);

  // Fetch teacher's courses and students
  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        const data = await courseService.getTeacherCourses(teacherId);
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        const data = await courseService.getTeacherCourses(teacherId);
        setCourses(data);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacherId || !selectedCourse) return;
      try {
        setLoading(true);
        const data = await teacherService.getStudentsWithCourse(
          teacherId,
          selectedCourse
        );
        setStudents(data);

        // Initialize all students as present by default
        const initialAttendance: Record<string, boolean> = {};
        data.forEach((student: Student) => {
          initialAttendance[student.id] = true;
        });
        setAttendance(initialAttendance);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Fetch attendance history for teacher's courses
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!teacherId) return;

      try {
        setHistoryLoading(true);

        // Get all class sessions for teacher's courses
        const sessionsPromises = courses.map(async (course) => {
          const sessions = await attendanceService.getCourseAttendance(
            course.id
          );
          return sessions;
        });

        const allSessions = (await Promise.all(sessionsPromises)).flat();

        // Group sessions by date and calculate statistics
        const sessionMap = new Map();

        allSessions.forEach((record: any) => {
          const sessionDate = new Date(record.session?.date || record.markedAt)
            .toISOString()
            .split("T")[0];
          const courseId = record.courseId;
          const key = `${sessionDate}-${courseId}`;

          if (!sessionMap.has(key)) {
            sessionMap.set(key, {
              date: sessionDate,
              courseId: courseId,
              courseName: record.course?.courseName || "Unknown",
              present: 0,
              absent: 0,
              late: 0,
              total: 0,
            });
          }

          const stats = sessionMap.get(key);
          stats.total++;

          if (record.status === "PRESENT") stats.present++;
          else if (record.status === "ABSENT") stats.absent++;
          else if (record.status === "LATE") stats.late++;
        });

        // Convert to array and sort by date descending
        const historyData = Array.from(sessionMap.values())
          .map((stats) => ({
            ...stats,
            percentage:
              stats.total > 0
                ? (((stats.present + stats.late) / stats.total) * 100).toFixed(
                    1
                  )
                : "0",
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setAttendanceHistory(historyData);
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (courses.length > 0) {
      fetchAttendanceHistory();
    }
  }, [courses, teacherId]);

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !teacherId || students.length === 0) {
      toast.error("Please select a course and ensure students are loaded");
      return;
    }

    try {
      setSaving(true);

      // Step 1: Get the course's schedules
      const schedules = await attendanceService.getCourseSchedules(
        selectedCourse
      );

      // Step 2: Find today's schedule
      const now = new Date();
      const dayNames = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const todayDay = dayNames[now.getDay()];

      // Find schedule matching today's day
      const todaysSchedule = schedules.find(
        (schedule) => schedule.dayOfWeek === todayDay && schedule.isActive
      );

      // Step 3: Check if there's a class scheduled today
      if (!todaysSchedule) {
        toast.error("No class scheduled for this course today", {
          description: `This course doesn't have a class on ${todayDay}. Please check the timetable.`,
        });
        setSaving(false);
        return;
      }

      // Step 4: Use schedule's times and room (from the actual schedule)
      const todayDateString = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const startTime = `${todayDateString}T${todaysSchedule.startTime}`;
      const endTime = `${todayDateString}T${todaysSchedule.endTime}`;

      // Step 5: Create class session based on the schedule
      const selectedCourseData = courses.find((c) => c.id === selectedCourse);
      const sessionData = {
        courseId: selectedCourse,
        teacherId: teacherId,
        scheduleId: todaysSchedule.id,
        date: now.toISOString(),
        startTime: startTime,
        endTime: endTime,
        room: todaysSchedule.room,
        status: "CONDUCTED" as const,
        topic: selectedCourseData?.courseName || "Class Session",
      };

      const session = await attendanceService.createClassSession(sessionData);

      // Step 6: Prepare bulk attendance data
      const attendanceList = students.map((student) => ({
        sessionId: session.id,
        studentId: student.id,
        status: (attendance[student.id] ? "PRESENT" : "ABSENT") as
          | "PRESENT"
          | "ABSENT",
      }));

      // Step 7: Mark bulk attendance
      await attendanceService.markBulkAttendance(attendanceList);

      const presentCount = Object.values(attendance).filter(Boolean).length;
      toast.success(`Attendance saved successfully`, {
        description: `${presentCount} present, ${
          students.length - presentCount
        } absent out of ${students.length} students`,
      });

      // Reset selection
      setSelectedCourse("");
      setStudents([]);
      setAttendance({});

      // Refresh attendance history after saving
      if (courses.length > 0) {
        const sessionsPromises = courses.map(async (course) => {
          const sessions = await attendanceService.getCourseAttendance(
            course.id
          );
          return sessions;
        });
        const allSessions = (await Promise.all(sessionsPromises)).flat();
        const sessionMap = new Map();
        allSessions.forEach((record: any) => {
          const sessionDate = new Date(record.session?.date || record.markedAt)
            .toISOString()
            .split("T")[0];
          const courseId = record.courseId;
          const key = `${sessionDate}-${courseId}`;
          if (!sessionMap.has(key)) {
            sessionMap.set(key, {
              date: sessionDate,
              courseId: courseId,
              courseName: record.course?.courseName || "Unknown",
              present: 0,
              absent: 0,
              late: 0,
              total: 0,
            });
          }
          const stats = sessionMap.get(key);
          stats.total++;
          if (record.status === "PRESENT") stats.present++;
          else if (record.status === "ABSENT") stats.absent++;
          else if (record.status === "LATE") stats.late++;
        });
        const historyData = Array.from(sessionMap.values())
          .map((stats) => ({
            ...stats,
            percentage:
              stats.total > 0
                ? (((stats.present + stats.late) / stats.total) * 100).toFixed(
                    1
                  )
                : "0",
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        setAttendanceHistory(historyData);
      }
    } catch (err: any) {
      console.error("Failed to save attendance:", err);
      toast.error("Failed to save attendance", {
        description: err?.response?.data?.detail || "Please try again later",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            Mark and manage student attendance
          </p>
        </div>
      </div>

      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mark Today's Attendance</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Mark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.studentId}
                      </TableCell>
                      <TableCell>{student.user?.name}</TableCell>
                      <TableCell className="text-center">
                        {attendance[student.id] ? (
                          <Badge className="bg-green-500">
                            <IconCheck className="mr-1 h-3 w-3" />
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <IconX className="mr-1 h-3 w-3" />
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance[student.id]}
                          onCheckedChange={() => toggleAttendance(student.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Present: {Object.values(attendance).filter(Boolean).length} /{" "}
                  {students.length} (
                  {students.length > 0
                    ? (
                        (Object.values(attendance).filter(Boolean).length /
                          students.length) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %)
                </div>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={saving || students.length === 0 || !selectedCourse}
                >
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Past attendance records for all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconCalendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {record.present}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50">
                          {record.absent}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.percentage >= 90 ? "default" : "secondary"
                          }
                        >
                          {record.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
