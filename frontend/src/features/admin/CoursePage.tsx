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
import { Textarea } from "@/components/ui/textarea";
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
  IconBook,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useCourseService, type Course } from "@/services/courseService";
import {
  useDepartmentService,
  type Department,
} from "@/services/departmentService";
import { useTeacherService, type Teacher } from "@/services/teacherService";
import { toast } from "sonner";

interface CourseFormData {
  courseCode: string;
  courseName: string;
  credits: number;
  departmentId: string;
  semester: number;
  description?: string;
  syllabus?: string;
  maxStudents?: number;
  teacherId?: string;
  isActive: boolean;
}

interface FormErrors {
  courseCode?: string;
  courseName?: string;
  credits?: string;
  departmentId?: string;
  semester?: string;
  maxStudents?: string;
}

export default function CoursePage() {
  const {
    getAll: getCourses,
    create,
    update,
    delete: deleteCourse,
  } = useCourseService();
  const { getAll: getDepartments } = useDepartmentService();
  const { getAll: getTeachers } = useTeacherService();

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: "",
    courseName: "",
    credits: 3,
    departmentId: "",
    semester: 1,
    description: "",
    syllabus: "",
    maxStudents: 60,
    teacherId: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to fetch courses", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      toast.error("Failed to fetch teachers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: "",
      courseName: "",
      credits: 3,
      departmentId: "",
      semester: 1,
      description: "",
      syllabus: "",
      maxStudents: 60,
      teacherId: "",
      isActive: true,
    });
    setErrors({});
    setSelectedCourse(null);
  };

  // Validation functions
  const validateCourseCode = (code: string): string | undefined => {
    if (!code.trim()) return "Course code is required";
    if (code.trim().length < 2)
      return "Course code must be at least 2 characters";
    if (!/^[A-Z0-9]+$/i.test(code))
      return "Course code must contain only letters and numbers";
    return undefined;
  };

  const validateCourseName = (name: string): string | undefined => {
    if (!name.trim()) return "Course name is required";
    if (name.trim().length < 3)
      return "Course name must be at least 3 characters";
    return undefined;
  };

  const validateCredits = (credits: number): string | undefined => {
    if (!credits || credits < 1 || credits > 10) {
      return "Credits must be between 1 and 10";
    }
    return undefined;
  };

  const validateDepartment = (departmentId: string): string | undefined => {
    if (!departmentId) return "Department is required";
    return undefined;
  };

  const validateSemester = (semester: number): string | undefined => {
    if (!semester || semester < 1 || semester > 8) {
      return "Semester must be between 1 and 8";
    }
    return undefined;
  };

  const validateMaxStudents = (maxStudents?: number): string | undefined => {
    if (maxStudents && (maxStudents < 1 || maxStudents > 500)) {
      return "Max students must be between 1 and 500";
    }
    return undefined;
  };

  const validateCreateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.courseCode = validateCourseCode(formData.courseCode);
    newErrors.courseName = validateCourseName(formData.courseName);
    newErrors.credits = validateCredits(formData.credits);
    newErrors.departmentId = validateDepartment(formData.departmentId);
    newErrors.semester = validateSemester(formData.semester);
    newErrors.maxStudents = validateMaxStudents(formData.maxStudents);

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
    return validateCreateForm(); // Same validation for update
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

      await create(formData);
      toast.success("Course created successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error("Failed to create course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      departmentId: course.departmentId,
      semester: course.semester,
      description: course.description || "",
      syllabus: course.syllabus || "",
      maxStudents: course.maxStudents || 60,
      teacherId: course.teacherId || "",
      isActive: course.isActive,
    });
    setErrors({});
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedCourse) return;

    try {
      // Validate form
      if (!validateUpdateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      await update(selectedCourse.id, formData);
      toast.success("Course updated successfully");
      setShowEditDialog(false);
      setSelectedCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete);
      toast.success("Course deleted successfully");
      setShowDeleteDialog(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept ? dept.name : "Unknown";
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "Not Assigned";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.user?.name : "Unknown";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || course.departmentId === departmentFilter;

    const matchesSemester =
      semesterFilter === "all" || course.semester.toString() === semesterFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && course.isActive) ||
      (statusFilter === "inactive" && !course.isActive);

    return (
      matchesSearch && matchesDepartment && matchesSemester && matchesStatus
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Manage course information and assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semester" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            A list of all courses in the institution ({filteredCourses.length}{" "}
            courses)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Teacher</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <IconBook className="h-4 w-4 text-muted-foreground" />
                        {course.courseCode}
                      </div>
                    </TableCell>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDepartmentName(course.departmentId)}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell className="text-sm">
                      {getTeacherName(course.teacherId)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(course)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(course)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCourseToDelete(course.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the institution
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors below before submitting.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">
                  Course Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., CS101"
                  value={formData.courseCode}
                  onChange={(e) => {
                    setFormData({ ...formData, courseCode: e.target.value });
                    clearError("courseCode");
                  }}
                  className={errors.courseCode ? "border-red-500" : ""}
                />
                {errors.courseCode && (
                  <p className="text-sm text-red-500">{errors.courseCode}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">
                  Credits <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      credits: parseInt(e.target.value) || 3,
                    });
                    clearError("credits");
                  }}
                  className={errors.credits ? "border-red-500" : ""}
                />
                {errors.credits && (
                  <p className="text-sm text-red-500">{errors.credits}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">
                Course Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseName"
                placeholder="e.g., Introduction to Computer Science"
                value={formData.courseName}
                onChange={(e) => {
                  setFormData({ ...formData, courseName: e.target.value });
                  clearError("courseName");
                }}
                className={errors.courseName ? "border-red-500" : ""}
              />
              {errors.courseName && (
                <p className="text-sm text-red-500">{errors.courseName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, departmentId: value });
                    clearError("departmentId");
                  }}
                >
                  <SelectTrigger
                    className={errors.departmentId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{errors.departmentId}</p>
                )}
              </div>
              <div className="space-y-2 justify-self-end">
                <Label htmlFor="semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => {
                    setFormData({ ...formData, semester: parseInt(value) });
                    clearError("semester");
                  }}
                >
                  <SelectTrigger
                    className={errors.semester ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <p className="text-sm text-red-500">{errors.semester}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher (Optional)</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacherId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user?.name} ({teacher.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      maxStudents: parseInt(e.target.value) || 60,
                    });
                    clearError("maxStudents");
                  }}
                  className={errors.maxStudents ? "border-red-500" : ""}
                />
                {errors.maxStudents && (
                  <p className="text-sm text-red-500">{errors.maxStudents}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Course description..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syllabus">Syllabus</Label>
              <Textarea
                id="syllabus"
                placeholder="Course syllabus and topics..."
                rows={4}
                value={formData.syllabus}
                onChange={(e) =>
                  setFormData({ ...formData, syllabus: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
              >
                {formData.isActive ? (
                  <IconToggleRight className="h-4 w-4 mr-2" />
                ) : (
                  <IconToggleLeft className="h-4 w-4 mr-2" />
                )}
                {formData.isActive ? "Active" : "Inactive"}
              </Button>
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
            <Button onClick={handleCreate}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors below before submitting.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-courseCode">
                  Course Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-courseCode"
                  placeholder="e.g., CS101"
                  value={formData.courseCode}
                  onChange={(e) => {
                    setFormData({ ...formData, courseCode: e.target.value });
                    clearError("courseCode");
                  }}
                  className={errors.courseCode ? "border-red-500" : ""}
                />
                {errors.courseCode && (
                  <p className="text-sm text-red-500">{errors.courseCode}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credits">
                  Credits <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      credits: parseInt(e.target.value) || 3,
                    });
                    clearError("credits");
                  }}
                  className={errors.credits ? "border-red-500" : ""}
                />
                {errors.credits && (
                  <p className="text-sm text-red-500">{errors.credits}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-courseName">
                Course Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-courseName"
                placeholder="e.g., Introduction to Computer Science"
                value={formData.courseName}
                onChange={(e) => {
                  setFormData({ ...formData, courseName: e.target.value });
                  clearError("courseName");
                }}
                className={errors.courseName ? "border-red-500" : ""}
              />
              {errors.courseName && (
                <p className="text-sm text-red-500">{errors.courseName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, departmentId: value });
                    clearError("departmentId");
                  }}
                >
                  <SelectTrigger
                    className={errors.departmentId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{errors.departmentId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => {
                    setFormData({ ...formData, semester: parseInt(value) });
                    clearError("semester");
                  }}
                >
                  <SelectTrigger
                    className={errors.semester ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <p className="text-sm text-red-500">{errors.semester}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-teacher">Teacher (Optional)</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacherId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user?.name} ({teacher.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxStudents">Max Students</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      maxStudents: parseInt(e.target.value) || 60,
                    });
                    clearError("maxStudents");
                  }}
                  className={errors.maxStudents ? "border-red-500" : ""}
                />
                {errors.maxStudents && (
                  <p className="text-sm text-red-500">{errors.maxStudents}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Course description..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-syllabus">Syllabus</Label>
              <Textarea
                id="edit-syllabus"
                placeholder="Course syllabus and topics..."
                rows={4}
                value={formData.syllabus}
                onChange={(e) =>
                  setFormData({ ...formData, syllabus: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
              >
                {formData.isActive ? (
                  <IconToggleRight className="h-4 w-4 mr-2" />
                ) : (
                  <IconToggleLeft className="h-4 w-4 mr-2" />
                )}
                {formData.isActive ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedCourse(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Detailed information about the course
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Course Code</Label>
                  <p className="font-medium">{selectedCourse.courseCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Credits</Label>
                  <p className="font-medium">{selectedCourse.credits}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Course Name</Label>
                <p className="font-medium">{selectedCourse.courseName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">
                    {getDepartmentName(selectedCourse.departmentId)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Semester</Label>
                  <p className="font-medium">
                    Semester {selectedCourse.semester}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Teacher</Label>
                  <p className="font-medium">
                    {getTeacherName(selectedCourse.teacherId)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Students</Label>
                  <p className="font-medium">
                    {selectedCourse.maxStudents || "Not Set"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={selectedCourse.isActive ? "default" : "secondary"}
                  >
                    {selectedCourse.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {selectedCourse.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {selectedCourse.syllabus && (
                <div>
                  <Label className="text-muted-foreground">Syllabus</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedCourse.syllabus}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p>{new Date(selectedCourse.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p>{new Date(selectedCourse.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setSelectedCourse(null);
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
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone and will affect all related enrollments and schedules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setCourseToDelete(null);
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
