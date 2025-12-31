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
import {
  IconBook,
  IconUsers,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconId,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTeacherService } from "@/services/teacherService";

interface Student {
  id: string;
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  phoneNumber?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  student: Student;
}

interface CourseWithStudents {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  description?: string;
  maxStudents?: number;
  isActive: boolean;
  department?: {
    departmentName: string;
    departmentCode: string;
  };
  enrollments: Enrollment[];
}

export default function TeacherStudentPage() {
  const { user } = useAuth();
  const teacherService = useTeacherService();

  const [courses, setCourses] = useState<CourseWithStudents[]>([]);
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

  // Fetch courses with students
  useEffect(() => {
    const fetchCoursesWithStudents = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        const data = await teacherService.getCoursesWithStudents(teacherId);
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch courses with students:", err);
        setError("Failed to load courses and students");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesWithStudents();
  }, [teacherId]);

  const getTotalStudents = () => {
    return courses.reduce(
      (total, course) => total + course.enrollments.length,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
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
              Error Loading Students
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
          <h2 className="text-3xl font-bold tracking-tight">My Students</h2>
          <p className="text-muted-foreground">
            Students enrolled in your courses
          </p>
        </div>
        <Card className="px-6 py-4">
          <div className="flex items-center gap-3">
            <IconUsers className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{getTotalStudents()}</p>
            </div>
          </div>
        </Card>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Assigned</CardTitle>
            <CardDescription>
              You don't have any courses assigned yet, so there are no students
              to display.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {courses.map((course) => (
            <AccordionItem
              key={course.id}
              value={course.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <IconBook className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.courseCode} • Semester {course.semester} •{" "}
                        {course.department?.departmentName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm">
                      <IconUsers className="h-3 w-3 mr-1" />
                      {course.enrollments.length} Students
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  {course.enrollments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No students enrolled in this course yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {course.enrollments.map((enrollment) => (
                        <Card
                          key={enrollment.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              {enrollment.student.user?.name || "N/A"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <IconId className="h-3 w-3" />
                              {enrollment.student.studentId}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <IconMail className="h-4 w-4" />
                              <span className="truncate">
                                {enrollment.student.user?.email || "N/A"}
                              </span>
                            </div>
                            {enrollment.student.phoneNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconPhone className="h-4 w-4" />
                                <span>{enrollment.student.phoneNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-muted-foreground">
                                {enrollment.student.department}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {enrollment.student.batch}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
