import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useEnrollmentService,
  type Enrollment,
  type EnrollmentCreate,
  type EnrollmentUpdate,
} from "@/services/enrollmentService";
import { useStudentService, type Student } from "@/services/studentService";
import { useCourseService, type Course } from "@/services/courseService";
import { toast } from "sonner";

interface EnrollmentFormData {
  studentId: string;
  courseId: string;
  status?: string;
  grade?: string;
  gradePoints?: number;
}

interface FormErrors {
  studentId?: string;
  courseId?: string;
  status?: string;
  grade?: string;
  gradePoints?: string;
}

const ENROLLMENT_STATUS = ["ACTIVE", "COMPLETED", "DROPPED", "WITHDRAWN"];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

const GRADE_POINTS_MAP: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

export default function EnrollmentsPage() {
  const {
    getAll: getEnrollments,
    create,
    update,
    delete: deleteEnrollment,
  } = useEnrollmentService();
  const { getAll: getStudents } = useStudentService();
  const { getAll: getCourses } = useCourseService();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<EnrollmentFormData>({
    studentId: "",
    courseId: "",
    status: "ACTIVE",
    grade: "",
    gradePoints: undefined,
  });

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (error) {
      toast.error("Failed to fetch enrollments", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to fetch courses", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      courseId: "",
      status: "ACTIVE",
      grade: "",
      gradePoints: undefined,
    });
    setErrors({});
    setSelectedEnrollment(null);
  };

  // Validation functions
  const validateStudent = (studentId: string): string | undefined => {
    if (!studentId) return "Student is required";
    return undefined;
  };

  const validateCourse = (courseId: string): string | undefined => {
    if (!courseId) return "Course is required";
    return undefined;
  };

  const validateStatus = (status?: string): string | undefined => {
    if (status && !ENROLLMENT_STATUS.includes(status)) {
      return "Invalid status";
    }
    return undefined;
  };

  const validateGrade = (grade?: string): string | undefined => {
    if (grade && !GRADES.includes(grade)) {
      return "Invalid grade";
    }
    return undefined;
  };

  const validateGradePoints = (gradePoints?: number): string | undefined => {
    if (gradePoints !== undefined && (gradePoints < 0 || gradePoints > 4)) {
      return "Grade points must be between 0 and 4";
    }
    return undefined;
  };

  const validateCreateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.studentId = validateStudent(formData.studentId);
    newErrors.courseId = validateCourse(formData.courseId);

    // Filter out undefined errors
    const filteredErrors = Object.entries(newErrors).reduce(
      (acc, [key, value]) => {
        if (value) acc[key as keyof FormErrors] = value;
        return acc;
      },
      {} as FormErrors
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const validateUpdateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.status = validateStatus(formData.status);
    newErrors.grade = validateGrade(formData.grade);
    newErrors.gradePoints = validateGradePoints(formData.gradePoints);

    // Filter out undefined errors
    const filteredErrors = Object.entries(newErrors).reduce(
      (acc, [key, value]) => {
        if (value) acc[key as keyof FormErrors] = value;
        return acc;
      },
      {} as FormErrors
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleCreate = async () => {
    try {
      // Validate form
      if (!validateCreateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const enrollmentData: EnrollmentCreate = {
        studentId: formData.studentId,
        courseId: formData.courseId,
      };

      await create(enrollmentData);
      toast.success("Enrollment created successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchEnrollments();
    } catch (error) {
      toast.error("Failed to create enrollment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormData({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status || "ACTIVE",
      grade: enrollment.grade || "",
      gradePoints: enrollment.gradePoints,
    });
    setErrors({});
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedEnrollment) return;

    try {
      // Validate form
      if (!validateUpdateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const updateData: EnrollmentUpdate = {
        status: formData.status,
        grade: formData.grade || undefined,
        gradePoints: formData.gradePoints,
      };

      await update(selectedEnrollment.id, updateData);
      toast.success("Enrollment updated successfully");
      setShowEditDialog(false);
      setSelectedEnrollment(null);
      resetForm();
      fetchEnrollments();
    } catch (error) {
      toast.error("Failed to update enrollment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDelete = async () => {
    if (!enrollmentToDelete) return;

    try {
      await deleteEnrollment(enrollmentToDelete);
      toast.success("Enrollment deleted successfully");
      setShowDeleteDialog(false);
      setEnrollmentToDelete(null);
      fetchEnrollments();
    } catch (error) {
      toast.error("Failed to delete enrollment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleView = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowViewDialog(true);
  };

  const handleGradeChange = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      grade,
      gradePoints: GRADE_POINTS_MAP[grade] || undefined,
    }));
    clearError("grade");
    clearError("gradePoints");
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.user?.name || student?.name || "Unknown Student";
  };

  const getStudentId = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.studentId || "N/A";
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.courseName || "Unknown Course";
  };

  const getCourseCode = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.courseCode || "N/A";
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "DROPPED":
        return <Badge className="bg-yellow-500">Dropped</Badge>;
      case "WITHDRAWN":
        return <Badge className="bg-red-500">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return <Badge variant="secondary">Not Graded</Badge>;

    const gradeColor = grade.startsWith("A")
      ? "bg-green-500"
      : grade.startsWith("B")
      ? "bg-blue-500"
      : grade.startsWith("C")
      ? "bg-yellow-500"
      : grade.startsWith("D")
      ? "bg-orange-500"
      : "bg-red-500";

    return <Badge className={gradeColor}>{grade}</Badge>;
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      getStudentName(enrollment.studentId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getCourseName(enrollment.courseId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getStudentId(enrollment.studentId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getCourseCode(enrollment.courseId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;

    const matchesSemester =
      semesterFilter === "all" ||
      (enrollment.student?.semester &&
        enrollment.student.semester.toString() === semesterFilter);

    return matchesSearch && matchesStatus && matchesSemester;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-6 w-6" />
                Enrollments Management
              </CardTitle>
              <CardDescription>
                Manage student course enrollments, grades, and status
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="h-4 w-4 mr-2" />
              New Enrollment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, course name, student ID, or course code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Grade Points</TableHead>
                  <TableHead>Enrolled At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {getStudentId(enrollment.studentId)}
                      </TableCell>
                      <TableCell>
                        {enrollment.student?.user?.name ||
                          getStudentName(enrollment.studentId)}
                      </TableCell>
                      <TableCell>
                        {enrollment.course?.courseCode ||
                          getCourseCode(enrollment.courseId)}
                      </TableCell>
                      <TableCell>
                        {enrollment.course?.courseName ||
                          getCourseName(enrollment.courseId)}
                      </TableCell>
                      <TableCell>
                        {enrollment.student?.semester || "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell>{getGradeBadge(enrollment.grade)}</TableCell>
                      <TableCell>
                        {enrollment.gradePoints?.toFixed(2) || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(enrollment)}
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(enrollment)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEnrollmentToDelete(enrollment.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredEnrollments.length} of {enrollments.length}{" "}
            enrollments
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Enrollment</DialogTitle>
            <DialogDescription>
              Enroll a student in a course. Fill in the required information.
            </DialogDescription>
          </DialogHeader>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following errors:
                <ul className="list-disc list-inside mt-2">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">
                Student <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => {
                  setFormData({ ...formData, studentId: value });
                  clearError("studentId");
                }}
              >
                <SelectTrigger
                  id="student"
                  className={errors.studentId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.studentId} - {student.user?.name || student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && (
                <p className="text-sm text-red-500">{errors.studentId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">
                Course <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => {
                  setFormData({ ...formData, courseId: value });
                  clearError("courseId");
                }}
              >
                <SelectTrigger
                  id="course"
                  className={errors.courseId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-sm text-red-500">{errors.courseId}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>
              Update enrollment status, grade, and grade points
            </DialogDescription>
          </DialogHeader>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following errors:
                <ul className="list-disc list-inside mt-2">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {selectedEnrollment && (
              <>
                <div className="grid gap-2">
                  <Label>Student</Label>
                  <Input
                    value={
                      getStudentId(selectedEnrollment.studentId) +
                      " - " +
                      getStudentName(selectedEnrollment.studentId)
                    }
                    disabled
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Course</Label>
                  <Input
                    value={
                      getCourseCode(selectedEnrollment.courseId) +
                      " - " +
                      getCourseName(selectedEnrollment.courseId)
                    }
                    disabled
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  setFormData({ ...formData, status: value });
                  clearError("status");
                }}
              >
                <SelectTrigger
                  id="status"
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={formData.grade} onValueChange={handleGradeChange}>
                <SelectTrigger
                  id="grade"
                  className={errors.grade ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select grade (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Graded</SelectItem>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade} ({GRADE_POINTS_MAP[grade].toFixed(1)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-red-500">{errors.grade}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gradePoints">Grade Points</Label>
              <Input
                id="gradePoints"
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={formData.gradePoints || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : undefined;
                  setFormData({ ...formData, gradePoints: value });
                  clearError("gradePoints");
                }}
                className={errors.gradePoints ? "border-red-500" : ""}
                placeholder="Auto-filled when grade is selected"
              />
              {errors.gradePoints && (
                <p className="text-sm text-red-500">{errors.gradePoints}</p>
              )}
              <p className="text-xs text-gray-500">
                Grade points will be automatically set when you select a grade
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedEnrollment(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              View complete enrollment information
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Student ID</Label>
                  <p className="mt-1">
                    {selectedEnrollment.student?.studentId ||
                      getStudentId(selectedEnrollment.studentId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Student Name</Label>
                  <p className="mt-1">
                    {selectedEnrollment.student?.user?.name ||
                      getStudentName(selectedEnrollment.studentId)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Course Code</Label>
                  <p className="mt-1">
                    {selectedEnrollment.course?.courseCode ||
                      getCourseCode(selectedEnrollment.courseId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Course Name</Label>
                  <p className="mt-1">
                    {selectedEnrollment.course?.courseName ||
                      getCourseName(selectedEnrollment.courseId)}
                  </p>
                </div>
              </div>

              {selectedEnrollment.student && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Department</Label>
                    <p className="mt-1">
                      {selectedEnrollment.student.department}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Semester</Label>
                    <p className="mt-1">
                      {selectedEnrollment.student.semester}
                    </p>
                  </div>
                </div>
              )}

              {selectedEnrollment.course && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Credits</Label>
                    <p className="mt-1">{selectedEnrollment.course.credits}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">
                      Course Teacher
                    </Label>
                    <p className="mt-1">
                      {selectedEnrollment.course.teacher?.user?.name ||
                        "Not Assigned"}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Enrolled At</Label>
                  <p className="mt-1">
                    {new Date(selectedEnrollment.enrolledAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Grade</Label>
                  <div className="mt-1">
                    {getGradeBadge(selectedEnrollment.grade)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Grade Points</Label>
                  <p className="mt-1">
                    {selectedEnrollment.gradePoints?.toFixed(2) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setSelectedEnrollment(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enrollment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setEnrollmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
