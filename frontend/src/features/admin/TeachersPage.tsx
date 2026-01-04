import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useTeacherService,
  type Teacher,
  type TeacherUpdate,
} from "@/services/teacherService";
import { toast } from "sonner";
import {
  useDepartmentService,
  type Department,
} from "@/services/departmentService";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormErrors {
  name?: string;
  teacherId?: string;
  email?: string;
  password?: string;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  officeRoom?: string;
}

interface TeacherFormData {
  teacherId?: string;
  userId?: string;
  department?: string;
  designation?: string;
  specialization?: string;
  phoneNumber?: string;
  officeRoom?: string;
  officeHours?: string;
  name?: string;
  email?: string;
  password?: string;
  user?: {
    name: string;
    role: string;
    email: string;
    id: string;
  };
}

export default function TeachersPage() {
  const {
    getAll: getTeachers,
    create: createTeacher,
    delete: deleteTeacher,
    update: updateTeacher,
  } = useTeacherService();
  const { getAll: getDepartments } = useDepartmentService();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [teacherToUpdateId, setTeacherToUpdateId] = useState<string | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<TeacherFormData>({
    teacherId: "",
    userId: " ",
    department: "",
    designation: "",
    specialization: "",
    phoneNumber: "",
    officeRoom: "",
    name: "",
    email: "",
    password: "",
    user: {
      name: "",
      role: "",
      email: "",
      id: "",
    },
  });

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormData({
      teacherId: "",
      userId: "",
      department: "",
      designation: "",
      specialization: "",
      phoneNumber: "",
      officeRoom: "",
      name: "",
      email: "",
      password: "",
      user: {
        name: "",
        email: "",
        role: "",
        id: "",
      },
    });
    setTeacherToUpdateId(null);
    setErrors({});
  };

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name must contain only letters and spaces";
    return undefined;
  };

  const validateTeacherId = (id: string): string | undefined => {
    if (!id.trim()) return "Teacher ID is required";
    if (!/^[A-Z0-9]+$/i.test(id.trim()))
      return "Teacher ID must contain only letters and numbers";
    return undefined;
  };

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

  const validateDepartment = (dept: string): string | undefined => {
    if (!dept) return "Department is required";
    return undefined;
  };

  const validateDesignation = (designation: string): string | undefined => {
    if (!designation.trim()) return "Designation is required";
    return undefined;
  };

  const validatePhoneNumber = (phone?: string): string | undefined => {
    if (phone && !/^[0-9+\-\s()]+$/.test(phone))
      return "Phone number can only contain numbers and + - ( ) characters";
    return undefined;
  };

  const validateOfficeRoom = (room?: string): string | undefined => {
    if (room && !/^[A-Z0-9\s]+$/i.test(room))
      return "Office room must contain only letters and numbers";
    return undefined;
  };

  const validateCreateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateName(formData.name || "");
    newErrors.teacherId = validateTeacherId(formData.teacherId || "");
    newErrors.email = validateEmail(formData.email || "");
    newErrors.password = validatePassword(formData.password || "");
    newErrors.department = validateDepartment(formData.department || "");
    newErrors.designation = validateDesignation(formData.designation || "");
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    newErrors.officeRoom = validateOfficeRoom(formData.officeRoom);

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

    newErrors.department = validateDepartment(formData.department || "");
    newErrors.designation = validateDesignation(formData.designation || "");
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    newErrors.officeRoom = validateOfficeRoom(formData.officeRoom);

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

  const handleAlphabetInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ): string => {
    const value = e.target.value;
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      return value;
    }
    return formData.name || "";
  };

  const handleAlphanumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentValue: string
  ): string => {
    const value = e.target.value;
    if (value === "" || /^[A-Z0-9\s]*$/i.test(value)) {
      return value;
    }
    return currentValue;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
    const value = e.target.value;
    if (value === "" || /^[0-9+\-\s()]*$/.test(value)) {
      return value;
    }
    return formData.phoneNumber || "";
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      toast.error("Failed to fetch teachers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTeacher = async () => {
    try {
      if (!validateCreateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const createData: any = {
        name: formData.name,
        teacherId: formData.teacherId,
        department: formData.department,
        designation: formData.designation,
        specialization: formData.specialization,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        officeRoom: formData.officeRoom,
        userId: formData.userId,
      };

      await createTeacher(createData);

      toast.success("Teacher added successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to add teacher", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setTeacherToUpdateId(teacher.id!);
    setFormData({
      teacherId: teacher.id,
      department: teacher.department,
      designation: teacher.designation,
      specialization: teacher.specialization || "",
      phoneNumber: teacher.phoneNumber || "",
      officeRoom: teacher.officeRoom || "",
      officeHours: teacher.officeHours || "",
      name: teacher.user?.name || "",
      email: teacher.user?.email || "",
      user: {
        name: teacher.user!.name,
        role: teacher.user!.role,
        email: teacher.user!.email,
        id: teacher.user!.id,
      },
    });
    setErrors({});
    setShowEditDialog(true);
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
  const handleUpdate = async () => {
    if (!teacherToUpdateId) {
      return;
    }
    if (!validateUpdateForm()) {
      toast.error("Validation failed", {
        description: "Please fix the errors in the form",
      });
      return;
    }
    const updateDataTeacher: TeacherUpdate = {
      department: formData.department!,
      designation: formData.designation!,
      specialization: formData.specialization,
      phoneNumber: formData.phoneNumber,
      officeRoom: formData.officeRoom,
      officeHours: formData.officeHours,

      user: {
        name: formData.user!.name,
        email: formData.user!.email,
      },
    };

    await updateTeacher(teacherToUpdateId, updateDataTeacher);
    toast.success("Teacher updated successfully");
    setShowEditDialog(false);
    resetForm();
    fetchTeachers();
  };
  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher(teacherToDelete);
      toast.success("Teacher deleted successfully");
      fetchTeachers();
      setShowDeleteDialog(false);
      setTeacherToDelete(null);
    } catch (error) {
      toast.error("Failed to delete teacher", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || teacher.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage faculty information and assignments
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateDialog(true);
          }}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
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
              <SelectItem key={dept.id} value={dept.code}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            A comprehensive list of all faculty members (
            {filteredTeachers.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {teacher.user?.name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {teacher.user?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.teacherId}</Badge>
                    </TableCell>
                    <TableCell>{teacher.department}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{teacher.designation}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(teacher)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTeacherToDelete(teacher.id);
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

      {/*Teacher edit dialogue*/}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[calc(100vh-80px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update Teacher information</DialogDescription>
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
            <div className="space-y-2">
              <Label htmlFor="edit-teacherId">Teacher ID</Label>
              <Input
                id="edit-teacherId"
                value={formData.teacherId}
                className="bg-muted"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={formData.user!.email}
                className="bg-muted"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Teacher Name</Label>
              <Input
                id="edit-name"
                value={formData.user!.name}
                disabled
                className="bg-muted"
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

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="edit-designation">
                Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-designation"
                placeholder="e.g., Professor"
                value={formData.designation}
                onChange={(e) => {
                  setFormData({ ...formData, designation: e.target.value });
                  clearError("designation");
                }}
                className={errors.designation ? "border-red-500" : ""}
              />
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="e.g., +1234567890"
                value={formData.phoneNumber || ""}
                onChange={(e) => {
                  const newValue = handlePhoneInput(e);
                  setFormData({ ...formData, phoneNumber: newValue });
                  clearError("phoneNumber");
                }}
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input
                id="edit-specialization"
                placeholder="e.g., 123 Main St"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="edit-dob">Office Room</Label>
              <Input
                id="edit-office-room"
                placeholder="eg : IS102"
                value={formData.officeRoom || ""}
                onChange={(e) => {
                  const newValue = handleAlphanumericInput(
                    e,
                    formData.officeRoom || ""
                  );
                  setFormData({ ...formData, officeRoom: newValue });
                  clearError("officeRoom");
                }}
                className={errors.officeRoom ? "border-red-500" : ""}
              />
              {errors.officeRoom && (
                <p className="text-sm text-red-500">{errors.officeRoom}</p>
              )}
            </div>
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="edit-dob">Office Hours</Label>
              <Input
                id="edit-office-hours"
                value={formData.officeHours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, officeHours: e.target.value })
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
            <Button onClick={handleUpdate}>Update Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md max-h-[calc(100vh-80px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Add a new teacher to the institution
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
            {/* Teacher Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Teacher Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Dr. John Doe"
                value={formData.name}
                onChange={(e) => {
                  const newValue = handleAlphabetInput(e);
                  setFormData({ ...formData, name: newValue });
                  clearError("name");
                }}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">
                Teacher ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="teacherId"
                placeholder="e.g., T001"
                value={formData.teacherId}
                onChange={(e) => {
                  const newValue = handleAlphanumericInput(
                    e,
                    formData.teacherId || ""
                  );
                  setFormData({ ...formData, teacherId: newValue });
                  clearError("teacherId");
                }}
                className={errors.teacherId ? "border-red-500" : ""}
              />
              {errors.teacherId && (
                <p className="text-sm text-red-500">{errors.teacherId}</p>
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

            {/* Designation */}
            <div className="space-y-2">
              <Label htmlFor="designation">
                Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="designation"
                placeholder="e.g., Professor, Assistant Professor"
                value={formData.designation}
                onChange={(e) => {
                  setFormData({ ...formData, designation: e.target.value });
                  clearError("designation");
                }}
                className={errors.designation ? "border-red-500" : ""}
              />
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation}</p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="e.g., Machine Learning, Database Systems"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="e.g., +1234567890"
                value={formData.phoneNumber || ""}
                onChange={(e) => {
                  const newValue = handlePhoneInput(e);
                  setFormData({ ...formData, phoneNumber: newValue });
                  clearError("phoneNumber");
                }}
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Office Room */}
            <div className="space-y-2">
              <Label htmlFor="officeRoom">Office Room</Label>
              <Input
                id="officeRoom"
                placeholder="e.g., IS102"
                value={formData.officeRoom || ""}
                onChange={(e) => {
                  const newValue = handleAlphanumericInput(
                    e,
                    formData.officeRoom || ""
                  );
                  setFormData({ ...formData, officeRoom: newValue });
                  clearError("officeRoom");
                }}
                className={errors.officeRoom ? "border-red-500" : ""}
              />
              {errors.officeRoom && (
                <p className="text-sm text-red-500">{errors.officeRoom}</p>
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
                placeholder="e.g., example@domain.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearError("email");
                }}
                className={errors.email ? "border-red-500" : ""}
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
                className={errors.password ? "border-red-500" : ""}
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
            <Button onClick={handleCreateTeacher}>Add Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Details Dialog */}
      <Dialog
        open={selectedTeacher !== null}
        onOpenChange={(open) => !open && setSelectedTeacher(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              Detailed information about the teacher
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedTeacher.user?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeacher.user?.email}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {selectedTeacher.teacherId}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="mt-1">{selectedTeacher.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Designation
                  </p>
                  <p className="mt-1">
                    <Badge variant="secondary">
                      {selectedTeacher.designation}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Specialization
                  </p>
                  <p className="mt-1">
                    {selectedTeacher.specialization || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="mt-1">{selectedTeacher.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Office Room
                  </p>
                  <p className="mt-1">{selectedTeacher.officeRoom || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Office Hours
                  </p>
                  <p className="mt-1">{selectedTeacher.officeHours || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Joining Date
                  </p>
                  <p className="mt-1">
                    {selectedTeacher.joiningDate
                      ? new Date(
                          selectedTeacher.joiningDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this teacher? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setTeacherToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeacher}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
