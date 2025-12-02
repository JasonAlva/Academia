import { DashboardLayout } from "@/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconCalendar,
  IconCheck,
  IconX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useState } from "react";

export default function TeacherAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("cs401");
  const [attendance, setAttendance] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: true,
  });

  const courses = [
    { id: "cs401", name: "Database Systems - CS401" },
    { id: "cs302", name: "Web Development - CS302" },
    { id: "cs201", name: "Data Structures - CS201" },
  ];

  const students = [
    { id: 1, name: "Alice Johnson", rollNo: "CS2021001" },
    { id: 2, name: "Bob Smith", rollNo: "CS2021002" },
    { id: 3, name: "Carol Williams", rollNo: "CS2021003" },
    { id: 4, name: "David Brown", rollNo: "CS2021004" },
  ];

  const attendanceHistory = [
    { date: "2024-12-02", present: 42, absent: 3, percentage: 93.3 },
    { date: "2024-11-29", present: 40, absent: 5, percentage: 88.9 },
    { date: "2024-11-27", present: 43, absent: 2, percentage: 95.6 },
  ];

  const toggleAttendance = (studentId: number) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
            <p className="text-muted-foreground">
              Mark and manage student attendance
            </p>
          </div>
        </div>

        <Tabs defaultValue="mark" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="mark" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mark Today's Attendance</CardTitle>
                    <CardDescription>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Mark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.rollNo}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">
                          {attendance[student.id] ? (
                            <Badge className="bg-green-500">
                              <IconCheck className="mr-1 h-3 w-3" />
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <IconX className="mr-1 h-3 w-3" />
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={attendance[student.id]}
                            onCheckedChange={() => toggleAttendance(student.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Present: {Object.values(attendance).filter(Boolean).length}{" "}
                    / {students.length} (
                    {(
                      (Object.values(attendance).filter(Boolean).length /
                        students.length) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                  <Button>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    Save Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  Past attendance records for all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <IconCalendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">
                            {record.present}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50">
                            {record.absent}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.percentage >= 90 ? "default" : "secondary"
                            }
                          >
                            {record.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>
                  Generate and download attendance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reports functionality coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  
  );
}
