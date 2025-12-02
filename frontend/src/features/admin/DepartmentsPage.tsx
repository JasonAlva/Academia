import { DashboardLayout } from "@/layout";
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
import { IconPlus, IconSearch, IconEdit, IconTrash } from "@tabler/icons-react";

export default function DepartmentsPage() {
  const departments = [
    {
      id: 1,
      name: "Computer Science",
      code: "CS",
      students: 450,
      teachers: 25,
      courses: 32,
    },
    {
      id: 2,
      name: "Electrical Engineering",
      code: "EE",
      students: 380,
      teachers: 22,
      courses: 28,
    },
    {
      id: 3,
      name: "Mechanical Engineering",
      code: "ME",
      students: 420,
      teachers: 24,
      courses: 30,
    },
    {
      id: 4,
      name: "Business Administration",
      code: "BA",
      students: 510,
      teachers: 28,
      courses: 35,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage all departments and their information
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            A list of all departments in the institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dept.code}</Badge>
                  </TableCell>
                  <TableCell>{dept.students}</TableCell>
                  <TableCell>{dept.teachers}</TableCell>
                  <TableCell>{dept.courses}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
