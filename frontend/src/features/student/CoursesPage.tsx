import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  useStudentCourseService,
  type Enrollment,
} from "@/services/studentCourseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBook, IconCalendar, IconUser } from "@tabler/icons-react";

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const studentCourseService = useStudentCourseService();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get the student profile using user ID
        const studentProfile = await studentCourseService.getStudentByUserId(
          user.id
        );

        // Then fetch enrolled courses using student ID
        const data = await studentCourseService.getEnrolledCourses(
          studentProfile.id
        );

        console.log("Enrolled courses:", data);
        setEnrollments(data);
      } catch (err: any) {
        console.error("Error fetching enrolled courses:", err);
        setError(
          err?.message || "Failed to load enrolled courses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading courses...</p>
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
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
        <p className="text-muted-foreground">
          View your enrolled courses for the current semester
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <IconBook className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You are not enrolled in any courses yet
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {enrollment.course.courseName}
                    </CardTitle>
                    <CardDescription>
                      {enrollment.course.courseCode}
                    </CardDescription>
                  </div>
                  {enrollment.grade && (
                    <Badge
                      variant={
                        enrollment.grade.startsWith("A")
                          ? "default"
                          : enrollment.grade.startsWith("B")
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {enrollment.grade}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollment.course.teacher?.user && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    <span>{enrollment.course.teacher.user.name}</span>
                  </div>
                )}

                {enrollment.course.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconBook className="h-4 w-4" />
                    <span>{enrollment.course.department.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>Semester {enrollment.course.semester}</span>
                  </div>
                  <span className="font-medium">
                    {enrollment.course.credits} Credits
                  </span>
                </div>

                {enrollment.course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {enrollment.course.description}
                  </p>
                )}

                <div className="pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    {enrollment.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
