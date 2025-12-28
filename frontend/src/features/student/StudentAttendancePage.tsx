import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useStudentCourseService } from "@/services/studentCourseService";
import { useStudentAttendanceService } from "@/services/studentAttendanceService";
import type { Enrollment } from "@/services/studentCourseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  IconBook,
  IconCalendar,
  IconUser,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";

interface CourseWithAttendance extends Enrollment {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  lateCount: number;
  attendancePercentage: number;
  status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const studentCourseService = useStudentCourseService();
  const attendanceService = useStudentAttendanceService();
  const [coursesWithAttendance, setCoursesWithAttendance] = useState<
    CourseWithAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalSessions: 0,
    attended: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get student profile
        const studentProfile = await studentCourseService.getStudentByUserId(
          user.id
        );

        // Get enrolled courses
        const enrollments = await studentCourseService.getEnrolledCourses(
          studentProfile.id
        );

        // Get attendance records
        const attendanceRecords = await attendanceService.getStudentAttendance(
          studentProfile.id
        );

        // Map attendance to courses
        const coursesWithStats = await Promise.all(
          enrollments.map(async (enrollment) => {
            // Filter attendance for this course
            const courseAttendance = attendanceRecords.filter(
              (record: any) =>
                record.courseId === enrollment.courseId ||
                record.session?.courseId === enrollment.courseId
            );

            const totalSessions = courseAttendance.length;
            const attendedSessions = courseAttendance.filter(
              (r: any) => r.status === "PRESENT" || r.status === "LATE"
            ).length;
            const absentSessions = courseAttendance.filter(
              (r: any) => r.status === "ABSENT"
            ).length;
            const lateCount = courseAttendance.filter(
              (r: any) => r.status === "LATE"
            ).length;

            const percentage =
              totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

            let status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
            if (percentage >= 90) {
              status = "EXCELLENT";
            } else if (percentage >= 75) {
              status = "GOOD";
            } else if (percentage >= 60) {
              status = "WARNING";
            } else {
              status = "CRITICAL";
            }

            return {
              ...enrollment,
              totalSessions,
              attendedSessions,
              absentSessions,
              lateCount,
              attendancePercentage: percentage,
              status,
            };
          })
        );

        setCoursesWithAttendance(coursesWithStats);

        // Calculate overall stats
        const totalSessions = coursesWithStats.reduce(
          (sum, c) => sum + c.totalSessions,
          0
        );
        const attended = coursesWithStats.reduce(
          (sum, c) => sum + c.attendedSessions,
          0
        );
        setOverallStats({
          totalSessions,
          attended,
          percentage: totalSessions > 0 ? (attended / totalSessions) * 100 : 0,
        });
      } catch (err: any) {
        console.error("Error fetching attendance data:", err);
        setError(
          err?.message || "Failed to load attendance data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "GOOD":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
        <p className="text-muted-foreground">
          Track your attendance across all enrolled courses
        </p>
      </div>

      {/* Overall Statistics Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Overall Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">
                {coursesWithAttendance.length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{overallStats.totalSessions}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Overall Attendance
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {overallStats.percentage.toFixed(1)}%
                </p>
                <Badge
                  variant={
                    overallStats.percentage >= 75 ? "default" : "destructive"
                  }
                >
                  {overallStats.attended}/{overallStats.totalSessions}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallStats.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Course Attendance Cards */}
      {coursesWithAttendance.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <IconBook className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No attendance records found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coursesWithAttendance.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">
                      {course.course.courseName}
                    </CardTitle>
                    <CardDescription>
                      {course.course.courseCode}
                    </CardDescription>
                  </div>
                  <Badge
                    className={getStatusColor(course.status)}
                    variant="outline"
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Teacher Info */}
                {course.course.teacher?.user && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    <span>{course.course.teacher.user.name}</span>
                  </div>
                )}

                {/* Department Info */}
                {course.course.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconBook className="h-4 w-4" />
                    <span>{course.course.department.name}</span>
                  </div>
                )}

                {/* Attendance Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-bold text-lg">
                      {course.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={course.attendancePercentage}
                    className="h-2"
                  />
                </div>

                {/* Attendance Statistics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <IconCheck className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Present:</span>
                    <span className="font-semibold">
                      {course.attendedSessions}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconX className="h-4 w-4 text-red-600" />
                    <span className="text-muted-foreground">Absent:</span>
                    <span className="font-semibold">
                      {course.absentSessions}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconClock className="h-4 w-4 text-yellow-600" />
                    <span className="text-muted-foreground">Late:</span>
                    <span className="font-semibold">{course.lateCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconCalendar className="h-4 w-4 text-blue-600" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">
                      {course.totalSessions}
                    </span>
                  </div>
                </div>

                {/* Warning for low attendance */}
                {course.attendancePercentage < 75 && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <IconAlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      {course.attendancePercentage < 60
                        ? "Critical! Attendance below 60%"
                        : "Warning! Attendance below 75%"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
