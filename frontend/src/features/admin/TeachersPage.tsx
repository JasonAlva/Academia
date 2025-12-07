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
  IconBriefcase,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTeacherService, type Teacher } from "@/services/teacherService";
import { toast } from "sonner";
import {
  useDepartmentService,
  type Department,
} from "@/services/departmentService";

export default function TeachersPage() {
  const { getAll: getTeachers, delete: deleteTeacher } = useTeacherService();
  const { getAll: getDepartments } = useDepartmentService();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

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
        <Button>
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
                <TableHead>Specialization</TableHead>
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
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.user?.email}`}
                          />
                          <AvatarFallback>
                            {teacher.user?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "??"}
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
                    <TableCell>
                      {teacher.specialization || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
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
                        <Button variant="ghost" size="icon">
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
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher.user?.email}`}
                  />
                  <AvatarFallback>
                    {selectedTeacher.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "??"}
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
