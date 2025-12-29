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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useStudentService,
  type Student,
  type StudentUpdate,
} from "@/services/studentService";
import { toast } from "sonner";
import {
  useDepartmentService,
  type Department,
} from "@/services/departmentService";
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

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  studentId?: string;
  department?: string;
  batch?: string;
  semester?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export default function StudentsPage() {
  const {
    getAll: getStudents,
    create,
    update,
    delete: deleteStudent,
  } = useStudentService();
  const { getAll: getDepartment } = useDepartmentService();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [errors, setErrors] = useState<FormErrors>({});

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    studentId: "",
    semester: 1,
    name: "",
    batch: "",
    department: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchDepartment();
  }, []);

  const resetForm = () => {
    setFormData({
      studentId: "",
      semester: 1,
      name: "",
      batch: "",
      department: "",
      email: "",
      password: "",
    });
    setEditingStudentId(null);
    setErrors({});
  };

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return undefined;
  };

  const validateDepartment = (department: string): string | undefined => {
    if (!department) return "Department is required";
    return undefined;
  };

  const validateBatch = (batch: string): string | undefined => {
    if (!batch.trim()) return "Batch is required";
    const year = parseInt(batch);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
      return "Please enter a valid year (e.g., 2023)";
    }
    return undefined;
  };

  const validateSemester = (semester: number): string | undefined => {
    if (!semester || semester < 1 || semester > 8) {
      return "Semester must be between 1 and 8";
    }
    return undefined;
  };

  const validateStudentId = (
    studentId: string,
    department: string,
    batch: string
  ): string | undefined => {
    if (!studentId.trim()) return "Student ID is required";

    // Expected format: 1RV<batch_last2><dept_code><3-4_digits>
    // Example:
    const val = Number(batch.slice(-2)) - 4;

    const expectedPrefix = `1RV${val}${department}`;

    if (!studentId.startsWith(expectedPrefix)) {
      return `Student ID must start with ${expectedPrefix}`;
    }

    // const rollNumber = studentId.substring(expectedPrefix.length);
    // if (!/^\d{3,4}$/.test(rollNumber)) {
    //   return "Student ID must end with 3-4 digits";
    // }

    return undefined;
  };

  const validateCreateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateName(formData.name || "");
    newErrors.email = validateEmail(formData.email || "");
    newErrors.password = validatePassword(formData.password || "");
    newErrors.department = validateDepartment(formData.department || "");
    newErrors.batch = validateBatch(formData.batch || "");
    newErrors.semester = validateSemester(formData.semester || 0);

    // Only validate student ID format if department and batch are valid
    if (!newErrors.department && !newErrors.batch) {
      newErrors.studentId = validateStudentId(
        formData.studentId || "",
        formData.department || "",
        formData.batch || ""
      );
    } else if (!formData.studentId?.trim()) {
      newErrors.studentId = "Student ID is required";
    }

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

    if (formData.name) {
      newErrors.name = validateName(formData.name);
    }
    newErrors.department = validateDepartment(formData.department || "");
    newErrors.batch = validateBatch(formData.batch || "");
    newErrors.semester = validateSemester(formData.semester || 0);

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be 10 digits";
      }
    }

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

      const createData: Partial<Student> = {
        studentId: formData.studentId,
        semester: formData.semester,
        name: formData.name,
        batch: formData.batch,
        department: formData.department,
        email: formData.email,
        password: formData.password,
      };

      await create(createData);
      toast.success("Student added successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error("Failed to add student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingStudentId) return;

      // Validate form
      if (!validateUpdateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const updateData: StudentUpdate = {
        department: formData.department,
        semester: formData.semester,
        batch: formData.batch,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
      };

      await update(editingStudentId, updateData);
      toast.success("Student updated successfully");
      setShowEditDialog(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error("Failed to update student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartment = async () => {
    try {
      const data = await getDepartment();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleView = async (student: Student) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudentId(student.id!);
    setFormData({
      studentId: student.studentId,
      semester: student.semester,
      name: student.user?.name || "",
      batch: student.batch,
      department: student.department,
      email: student.user?.email || "",
      phoneNumber: student.phoneNumber,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
    });
    setShowEditDialog(true);
  };

  const confirmDelete = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete);
      toast.success("Student deleted successfully");
      setShowDeleteDialog(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || student.department === departmentFilter;
    const matchesSemester =
      semesterFilter === "all" ||
      student.semester.toString() === semesterFilter;

    return matchesSearch && matchesDepartment && matchesSemester;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student information and enrollments
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
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
            {departments.map((dept: any) => (
              <SelectItem key={dept.id} value={dept.code}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            A comprehensive list of all enrolled students (
            {filteredStudents.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user?.email}`}
                          />
                          <AvatarFallback>
                            {student.user?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.user?.name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.user?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.studentId}</Badge>
                    </TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(student)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(student.id)}
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
        <DialogContent className="max-w-md max-h-[calc(100vh-80px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to the institution
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Student Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearError("name");
                }}
                className={
                  errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  setFormData({ ...formData, department: value });
                  clearError("department");
                  clearError("studentId");
                }}
              >
                <SelectTrigger
                  id="department"
                  className={errors.department ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="batch">
                Batch <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batch"
                placeholder="e.g., 2023"
                value={formData.batch}
                onChange={(e) => {
                  setFormData({ ...formData, batch: e.target.value });
                  clearError("batch");
                  clearError("studentId");
                }}
                className={
                  errors.batch
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.batch && (
                <p className="text-sm text-red-500">{errors.batch}</p>
              )}
            </div>

            {/* Student ID with helper text */}
            <div className="space-y-2">
              <Label htmlFor="studentId">
                Student ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="studentId"
                placeholder="e.g., 1RV23IS056"
                value={formData.studentId}
                onChange={(e) => {
                  setFormData({ ...formData, studentId: e.target.value });
                  clearError("studentId");
                }}
                className={
                  errors.studentId
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formData.department && formData.batch && !errors.studentId && (
                <p className="text-xs text-muted-foreground">
                  Format: 1RV{formData.batch.slice(-2)}
                  {formData.department}XXX (where XXX is 3-4 digits)
                </p>
              )}
              {errors.studentId && (
                <p className="text-sm text-red-500">{errors.studentId}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester">
                Semester <span className="text-red-500">*</span>
              </Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="8"
                placeholder="e.g., 5"
                value={formData.semester}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    semester: Number(e.target.value),
                  });
                  clearError("semester");
                }}
                className={
                  errors.semester
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.semester && (
                <p className="text-sm text-red-500">{errors.semester}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., student@domain.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearError("email");
                }}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  clearError("password");
                }}
                className={
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
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
            <Button onClick={handleCreate}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[calc(100vh-80px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Student ID - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="edit-studentId">Student ID</Label>
              <Input
                id="edit-studentId"
                value={formData.studentId}
                className="bg-muted"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={formData.email}
                className="bg-muted"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Student Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  setFormData({ ...formData, department: value });
                  clearError("department");
                }}
              >
                <SelectTrigger
                  id="edit-department"
                  className={errors.department ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="edit-semester">
                Semester <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.semester?.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, semester: Number(value) });
                  clearError("semester");
                }}
              >
                <SelectTrigger
                  id="edit-semester"
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

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="edit-batch">
                Batch <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-batch"
                placeholder="e.g., 2023"
                value={formData.batch}
                onChange={(e) => {
                  setFormData({ ...formData, batch: e.target.value });
                  clearError("batch");
                }}
                className={
                  errors.batch
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.batch && (
                <p className="text-sm text-red-500">{errors.batch}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="e.g., 9876543210"
                value={formData.phoneNumber || ""}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  clearError("phoneNumber");
                }}
                className={
                  errors.phoneNumber
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                placeholder="e.g., 123 Main St"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Detailed information about the student
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.user?.email}`}
                  />
                  <AvatarFallback>
                    {selectedStudent.user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedStudent.user?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedStudent.user?.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student ID</Label>
                  <p className="font-medium">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{selectedStudent.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Semester</Label>
                  <p className="font-medium">{selectedStudent.semester}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Batch</Label>
                  <p className="font-medium">{selectedStudent.batch}</p>
                </div>
                {selectedStudent.phoneNumber && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedStudent.phoneNumber}</p>
                  </div>
                )}
                {selectedStudent.address && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="font-medium">{selectedStudent.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setStudentToDelete(null);
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
