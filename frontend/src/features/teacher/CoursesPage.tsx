import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBook, IconUsers, IconAlertCircle } from "@tabler/icons-react";
import { useCourseService, type Course } from "@/services/courseService";
import { useTeacherService } from "@/services/teacherService";

export default function TeacherCoursesPage() {
  const { user } = useAuth();
  const courseService = useCourseService();
  const teacherService = useTeacherService();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Fetch teacher ID from user ID
  useEffect(() => {
    const fetchTeacherId = async () => {
      if (!user?.id) return;

      try {
        const teachers = await teacherService.getAll();
        const teacher = teachers.find((t) => t.userId === user.id);
        if (teacher) {
          setTeacherId(teacher.id);
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

  // Fetch teacher's courses
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

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              Error Loading Courses
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            Courses you are currently teaching
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Assigned</CardTitle>
            <CardDescription>
              You don't have any courses assigned yet. Contact administration
              for more information.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {course.courseName}
                    </CardTitle>
                    <CardDescription>{course.courseCode}</CardDescription>
                  </div>
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <IconBook className="h-4 w-4" />
                    {course.credits} Credits
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <IconUsers className="h-4 w-4" />
                    Sem {course.semester}
                  </span>
                </div>

                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                )}

                {course.maxStudents && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Max Students</span>
                    <span className="font-medium">{course.maxStudents}</span>
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
