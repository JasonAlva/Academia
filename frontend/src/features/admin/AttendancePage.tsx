import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAttendanceService } from "@/services/attendanceService";
import type {
  StudentAttendance,
  TeacherAttendance,
  CourseAttendance,
  TeacherCourseAttendance,
} from "@/services/attendanceService";
import {
  IconUser,
  IconBook,
  IconCalendar,
  IconSearch,
  IconAlertCircle,
  IconChevronRight,
} from "@tabler/icons-react";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"students" | "teachers">(
    "students"
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Attendance Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and track attendance records for students and teachers
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "students" | "teachers")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <IconUser size={18} />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <IconBook size={18} />
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <StudentsAttendanceTab />
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          <TeachersAttendanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Students Attendance Tab Component
function StudentsAttendanceTab() {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentAttendance[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const attendanceService = useAttendanceService();

  useEffect(() => {
    loadStudentsAttendance();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (student) =>
            student.studentName.toLowerCase().includes(query) ||
            student.studentIdNumber.toLowerCase().includes(query) ||
            student.department.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);

  const loadStudentsAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAllStudentsAttendance();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError("Failed to load student attendance data. Please try again.");
      console.error("Error loading students attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student: StudentAttendance) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { label: "Good", variant: "default" as const };
    if (percentage >= 60)
      return { label: "Warning", variant: "secondary" as const };
    return { label: "Critical", variant: "destructive" as const };
  };

  const calculateOverallAttendance = (courses: CourseAttendance[]) => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((sum, course) => sum + course.totalClasses, 0);
    const attended = courses.reduce(
      (sum, course) => sum + course.attendedClasses,
      0
    );
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconAlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredStudents.length} Students
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Attendance Records</CardTitle>
          <CardDescription>
            Click on a student to view detailed course-wise attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Overall Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const overallAttendance = calculateOverallAttendance(
                      student.courses
                    );
                    const status = getAttendanceStatus(overallAttendance);
                    return (
                      <TableRow
                        key={student.studentId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleStudentClick(student)}
                      >
                        <TableCell className="font-medium">
                          {student.studentIdNumber}
                        </TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.semester}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.courses.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={overallAttendance}
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {overallAttendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <IconChevronRight
                            size={18}
                            className="text-muted-foreground"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUser size={24} />
              {selectedStudent?.studentName}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.studentIdNumber} • {selectedStudent?.department}{" "}
              • Semester {selectedStudent?.semester}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Overall Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {calculateOverallAttendance(selectedStudent.courses)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {selectedStudent.courses.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Course-wise Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Attended</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.courses.map((course) => {
                        const status = getAttendanceStatus(
                          course.attendancePercentage
                        );
                        return (
                          <TableRow key={course.courseId}>
                            <TableCell className="font-medium">
                              {course.courseCode}
                            </TableCell>
                            <TableCell>{course.courseName}</TableCell>
                            <TableCell>{course.attendedClasses}</TableCell>
                            <TableCell>{course.totalClasses}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={course.attendancePercentage}
                                  className="w-20"
                                />
                                <span className="text-sm font-medium">
                                  {course.attendancePercentage}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Teachers Attendance Tab Component
function TeachersAttendanceTab() {
  const [teachers, setTeachers] = useState<TeacherAttendance[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherAttendance[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherAttendance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const attendanceService = useAttendanceService();

  useEffect(() => {
    loadTeachersAttendance();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeachers(teachers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTeachers(
        teachers.filter(
          (teacher) =>
            teacher.teacherName.toLowerCase().includes(query) ||
            teacher.teacherIdNumber.toLowerCase().includes(query) ||
            teacher.department.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, teachers]);

  const loadTeachersAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAllTeachersAttendance();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (err) {
      setError("Failed to load teacher attendance data. Please try again.");
      console.error("Error loading teachers attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherClick = (teacher: TeacherAttendance) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const calculateTotalClassesConducted = (
    courses: TeacherCourseAttendance[]
  ) => {
    return courses.reduce(
      (sum, course) => sum + course.totalClassesConducted,
      0
    );
  };

  const calculateAverageAttendance = (courses: TeacherCourseAttendance[]) => {
    if (courses.length === 0) return 0;
    const total = courses.reduce(
      (sum, course) => sum + course.averageAttendancePercentage,
      0
    );
    return Math.round(total / courses.length);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconAlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredTeachers.length} Teachers
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Course Statistics</CardTitle>
          <CardDescription>
            Click on a teacher to view detailed course-wise statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Courses Teaching</TableHead>
                  <TableHead>Total Classes Conducted</TableHead>
                  <TableHead>Avg. Student Attendance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No teachers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const totalClasses = calculateTotalClassesConducted(
                      teacher.courses
                    );
                    const avgAttendance = calculateAverageAttendance(
                      teacher.courses
                    );
                    return (
                      <TableRow
                        key={teacher.teacherId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleTeacherClick(teacher)}
                      >
                        <TableCell className="font-medium">
                          {teacher.teacherIdNumber}
                        </TableCell>
                        <TableCell>{teacher.teacherName}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {teacher.courses.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconCalendar
                              size={16}
                              className="text-muted-foreground"
                            />
                            <span className="font-medium">{totalClasses}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={avgAttendance} className="w-20" />
                            <span className="text-sm font-medium">
                              {avgAttendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <IconChevronRight
                            size={18}
                            className="text-muted-foreground"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Teacher Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBook size={24} />
              {selectedTeacher?.teacherName}
            </DialogTitle>
            <DialogDescription>
              {selectedTeacher?.teacherIdNumber} • {selectedTeacher?.department}
            </DialogDescription>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {selectedTeacher.courses.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Classes Conducted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {calculateTotalClassesConducted(selectedTeacher.courses)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Avg. Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {calculateAverageAttendance(selectedTeacher.courses)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Course-wise Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Classes Conducted</TableHead>
                        <TableHead>Students Enrolled</TableHead>
                        <TableHead>Avg. Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeacher.courses.map((course) => (
                        <TableRow key={course.courseId}>
                          <TableCell className="font-medium">
                            {course.courseCode}
                          </TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconCalendar
                                size={16}
                                className="text-muted-foreground"
                              />
                              <span>{course.totalClassesConducted}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {course.totalStudentsEnrolled}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={course.averageAttendancePercentage}
                                className="w-20"
                              />
                              <span className="text-sm font-medium">
                                {course.averageAttendancePercentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
