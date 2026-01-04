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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  IconEdit,
  IconTrash,
  IconEye,
  IconBuilding,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useDepartmentService,
  type Department,
  type DepartmentCreate,
  type DepartmentUpdate,
} from "@/services/departmentService";
import { toast } from "sonner";

interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
}

interface FormErrors {
  name?: string;
  code?: string;
}

export default function DepartmentsPage() {
  const {
    getAll: getDepartments,
    create,
    update,
    delete: deleteDepartment,
  } = useDepartmentService();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
    });
    setErrors({});
  };

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Department name is required";
    if (name.trim().length < 2)
      return "Department name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Department name must contain only letters and spaces";
    return undefined;
  };

  const validateCode = (code: string): string | undefined => {
    if (!code.trim()) return "Department code is required";
    if (code.trim().length < 2)
      return "Department code must be at least 2 characters";
    if (!/^[A-Z0-9]+$/.test(code.trim()))
      return "Department code must contain only uppercase letters and numbers";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateName(formData.name);
    newErrors.code = validateCode(formData.code);

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

  const handleAlphabetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters and spaces
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      return value;
    }
    return formData.name;
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Allow only uppercase letters and numbers
    if (value === "" || /^[A-Z0-9]*$/.test(value)) {
      return value;
    }
    return formData.code;
  };

  const handleCreate = async () => {
    try {
      // Validate form
      if (!validateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const createData: DepartmentCreate = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
      };

      await create(createData);
      toast.success("Department created successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to create department", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
    });
    setErrors({});
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedDepartment) return;

    try {
      // Validate form
      if (!validateForm()) {
        toast.error("Validation failed", {
          description: "Please fix the errors in the form",
        });
        return;
      }

      const updateData: DepartmentUpdate = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
      };

      await update(selectedDepartment.id, updateData);
      toast.success("Department updated successfully");
      setShowEditDialog(false);
      setSelectedDepartment(null);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to update department", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete);
      toast.success("Department deleted successfully");
      setShowDeleteDialog(false);
      setDepartmentToDelete(null);
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to delete department", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleView = (department: Department) => {
    setSelectedDepartment(department);
    setShowViewDialog(true);
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage all departments and their information
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            A list of all departments in the institution (
            {filteredDepartments.length} departments)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <IconBuilding className="h-4 w-4 text-muted-foreground" />
                        {dept.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dept.code}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(dept)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(dept)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDepartmentToDelete(dept.id);
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Add a new department to the institution
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
            <div className="space-y-2">
              <Label htmlFor="name">
                Department Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science"
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
              <Label htmlFor="code">
                Department Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., CS"
                value={formData.code}
                onChange={(e) => {
                  const newValue = handleCodeInput(e);
                  setFormData({ ...formData, code: newValue });
                  clearError("code");
                }}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Department description..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
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
            <Button onClick={handleCreate}>Create Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
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
              <Label htmlFor="edit-name">
                Department Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Computer Science"
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
              <Label htmlFor="edit-code">
                Department Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-code"
                placeholder="e.g., CS"
                value={formData.code}
                onChange={(e) => {
                  const newValue = handleCodeInput(e);
                  setFormData({ ...formData, code: newValue });
                  clearError("code");
                }}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Department description..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedDepartment(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>
              Detailed information about the department
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Department Name</Label>
                <p className="font-medium">{selectedDepartment.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Department Code</Label>
                <div className="mt-1">
                  <Badge variant="outline">{selectedDepartment.code}</Badge>
                </div>
              </div>

              {selectedDepartment.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedDepartment.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p>
                    {new Date(selectedDepartment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p>
                    {new Date(selectedDepartment.updatedAt).toLocaleString()}
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
                setSelectedDepartment(null);
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
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action
              cannot be undone and may affect related courses, students, and
              teachers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDepartmentToDelete(null);
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
