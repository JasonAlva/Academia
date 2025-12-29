import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const API_URL = "http://localhost:8000/api";

interface AuthFormData {
  email: string;
  password: string;
  name: string;
  role: string;
  // Student fields
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  // Teacher fields
  teacherId: string;
  designation: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  studentId?: string;
  department?: string;
  semester?: string;
  batch?: string;
  teacherId?: string;
  designation?: string;
  general?: string;
}

export default function AuthForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authForm, setAuthForm] = useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
    role: "",
    // Student fields
    studentId: "",
    department: "",
    semester: 1,
    batch: "",
    // Teacher fields
    teacherId: "",
    designation: "",
  });

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (authMode === "register" && password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    return undefined;
  };

  const validateRole = (role: string): string | undefined => {
    if (!role) {
      return "Please select a role";
    }
    return undefined;
  };

  const validateStudentId = (studentId: string): string | undefined => {
    if (!studentId.trim()) {
      return "Student ID is required";
    }
    return undefined;
  };

  const validateTeacherId = (teacherId: string): string | undefined => {
    if (!teacherId.trim()) {
      return "Teacher ID is required";
    }
    return undefined;
  };

  const validateDepartment = (department: string): string | undefined => {
    if (!department.trim()) {
      return "Department is required";
    }
    return undefined;
  };

  const validateSemester = (semester: number): string | undefined => {
    if (!semester || semester < 1 || semester > 8) {
      return "Semester must be between 1 and 8";
    }
    return undefined;
  };

  const validateBatch = (batch: string): string | undefined => {
    if (!batch.trim()) {
      return "Batch is required";
    }
    const year = parseInt(batch);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
      return "Please enter a valid year";
    }
    return undefined;
  };

  const validateDesignation = (designation: string): string | undefined => {
    if (!designation.trim()) {
      return "Designation is required";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Common validations
    newErrors.email = validateEmail(authForm.email);
    newErrors.password = validatePassword(authForm.password);

    if (authMode === "register") {
      newErrors.name = validateName(authForm.name);
      newErrors.role = validateRole(authForm.role);

      // Role-specific validations
      if (authForm.role === "STUDENT") {
        newErrors.studentId = validateStudentId(authForm.studentId);
        newErrors.department = validateDepartment(authForm.department);
        newErrors.semester = validateSemester(authForm.semester);
        newErrors.batch = validateBatch(authForm.batch);
      } else if (authForm.role === "TEACHER") {
        newErrors.teacherId = validateTeacherId(authForm.teacherId);
        newErrors.department = validateDepartment(authForm.department);
        newErrors.designation = validateDesignation(authForm.designation);
      }
    }

    // Filter out undefined errors
    const filteredErrors = Object.entries(newErrors).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key as keyof FormErrors] = value;
        }
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

  const handleAuth = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    // Clear previous general error
    setErrors((prev) => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) {
      toast.error("Validation failed", {
        description: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";

      // Prepare payload based on auth mode and role
      let payload: any = {
        email: authForm.email,
        password: authForm.password,
      };

      if (authMode === "register") {
        payload = {
          ...payload,
          name: authForm.name,
          role: authForm.role,
        };

        // Add role-specific fields
        if (authForm.role === "STUDENT") {
          payload.studentId = authForm.studentId;
          payload.department = authForm.department;
          payload.semester = authForm.semester;
          payload.batch = authForm.batch;
        } else if (authForm.role === "TEACHER") {
          payload.teacherId = authForm.teacherId;
          payload.department = authForm.department;
          payload.designation = authForm.designation;
        }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.detail || "Authentication failed";

        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
          setErrors({ general: errorMessage });
        } else if (response.status === 400) {
          if (errorMessage.includes("Email already registered")) {
            setErrors({ email: "This email is already registered" });
            errorMessage = "Email already registered";
          } else if (errorMessage.includes("Missing required")) {
            setErrors({ general: errorMessage });
          } else {
            setErrors({ general: errorMessage });
          }
        } else if (response.status === 422) {
          errorMessage = "Invalid data format. Please check your input.";
          setErrors({ general: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      login(data); // store token & user globally
      toast.success("Success!", {
        description:
          authMode === "login"
            ? "Logged in successfully"
            : "Account created successfully",
      });
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        authMode === "login" ? "Login failed" : "Registration failed",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please check your credentials and try again",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {/* General Error Alert */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {authMode === "register" && (
        <div>
          <Input
            placeholder="Full Name"
            value={authForm.name}
            onChange={(e) => {
              setAuthForm({ ...authForm, name: e.target.value });
              clearError("name");
            }}
            className={
              errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
            }
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>
      )}

      {authMode === "register" && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <Select
            value={authForm.role}
            onValueChange={(val) => {
              setAuthForm({ ...authForm, role: val });
              clearError("role");
            }}
          >
            <SelectTrigger
              className={`w-full ${errors.role ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role}</p>
          )}
        </div>
      )}

      {/* Student-specific fields */}
      {authMode === "register" && authForm.role === "STUDENT" && (
        <>
          <div>
            <Input
              placeholder="Student ID"
              value={authForm.studentId}
              onChange={(e) => {
                setAuthForm({ ...authForm, studentId: e.target.value });
                clearError("studentId");
              }}
              className={
                errors.studentId
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.studentId && (
              <p className="text-sm text-red-500 mt-1">{errors.studentId}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Department"
              value={authForm.department}
              onChange={(e) => {
                setAuthForm({ ...authForm, department: e.target.value });
                clearError("department");
              }}
              className={
                errors.department
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.department && (
              <p className="text-sm text-red-500 mt-1">{errors.department}</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Semester"
              min="1"
              max="8"
              value={authForm.semester || ""}
              onChange={(e) => {
                setAuthForm({
                  ...authForm,
                  semester: parseInt(e.target.value) || 1,
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
              <p className="text-sm text-red-500 mt-1">{errors.semester}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Batch (e.g., 2024)"
              value={authForm.batch}
              onChange={(e) => {
                setAuthForm({ ...authForm, batch: e.target.value });
                clearError("batch");
              }}
              className={
                errors.batch ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.batch && (
              <p className="text-sm text-red-500 mt-1">{errors.batch}</p>
            )}
          </div>
        </>
      )}

      {/* Teacher-specific fields */}
      {authMode === "register" && authForm.role === "TEACHER" && (
        <>
          <div>
            <Input
              placeholder="Teacher ID"
              value={authForm.teacherId}
              onChange={(e) => {
                setAuthForm({ ...authForm, teacherId: e.target.value });
                clearError("teacherId");
              }}
              className={
                errors.teacherId
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.teacherId && (
              <p className="text-sm text-red-500 mt-1">{errors.teacherId}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Department"
              value={authForm.department}
              onChange={(e) => {
                setAuthForm({ ...authForm, department: e.target.value });
                clearError("department");
              }}
              className={
                errors.department
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.department && (
              <p className="text-sm text-red-500 mt-1">{errors.department}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Designation (e.g., Professor, Lecturer)"
              value={authForm.designation}
              onChange={(e) => {
                setAuthForm({ ...authForm, designation: e.target.value });
                clearError("designation");
              }}
              className={
                errors.designation
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.designation && (
              <p className="text-sm text-red-500 mt-1">{errors.designation}</p>
            )}
          </div>
        </>
      )}

      <div>
        <Input
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(e) => {
            setAuthForm({ ...authForm, email: e.target.value });
            clearError("email");
            clearError("general");
          }}
          className={
            errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
          }
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) => {
            setAuthForm({ ...authForm, password: e.target.value });
            clearError("password");
            clearError("general");
          }}
          className={
            errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
          }
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? authMode === "login"
            ? "Logging in..."
            : "Registering..."
          : authMode === "login"
          ? "Login"
          : "Register"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={isSubmitting}
        onClick={() => {
          setAuthMode(authMode === "login" ? "register" : "login");
          setErrors({});
        }}
      >
        {authMode === "login"
          ? "Need an account? Register"
          : "Have an account? Login"}
      </Button>
    </form>
  );
}
