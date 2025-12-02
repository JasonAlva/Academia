import { DashboardLayout } from "@/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  IconTrophy,
  IconChartBar,
  IconBook,
  IconCalendar,
} from "@tabler/icons-react";

export default function StudentGradesPage() {
  const currentGrades = [
    {
      course: "Database Systems",
      code: "CS401",
      midterm: 88,
      assignments: 92,
      final: null,
      current: "A",
      credits: 3,
    },
    {
      course: "Web Development",
      code: "CS302",
      midterm: 85,
      assignments: 90,
      final: null,
      current: "A-",
      credits: 4,
    },
    {
      course: "Data Structures",
      code: "CS201",
      midterm: 82,
      assignments: 88,
      final: null,
      current: "B+",
      credits: 3,
    },
    {
      course: "Computer Networks",
      code: "CS303",
      midterm: 90,
      assignments: 95,
      final: null,
      current: "A",
      credits: 3,
    },
  ];

  const gradeHistory = [
    { semester: "Fall 2024", gpa: 3.75, credits: 15, status: "In Progress" },
    { semester: "Spring 2024", gpa: 3.82, credits: 16, status: "Completed" },
    { semester: "Fall 2023", gpa: 3.65, credits: 15, status: "Completed" },
    { semester: "Spring 2023", gpa: 3.7, credits: 14, status: "Completed" },
  ];

  const currentGPA = 3.75;
  const cumulativeGPA = 3.73;
  const totalCredits = 60;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "default";
    if (grade.startsWith("B")) return "secondary";
    return "outline";
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Grades</h2>
        <p className="text-muted-foreground">
          Track your academic performance and GPA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <IconTrophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGPA}</div>
            <p className="text-xs text-muted-foreground">Fall 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cumulative GPA
            </CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cumulativeGPA}</div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <IconBook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Progress
            </CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalCredits / 120) * 100).toFixed(0)}%
            </div>
            <Progress value={(totalCredits / 120) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Semester</TabsTrigger>
          <TabsTrigger value="history">Grade History</TabsTrigger>
          <TabsTrigger value="calculator">GPA Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fall 2024 Grades</CardTitle>
              <CardDescription>
                Current grades for all enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-center">Midterm</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Final</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGrades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{grade.course}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{grade.midterm}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{grade.assignments}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {grade.final ? (
                          <Badge variant="outline">{grade.final}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getGradeColor(grade.current)}>
                          {grade.current}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {grade.credits}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Semester GPA</p>
                  <p className="text-sm text-muted-foreground">
                    Based on current grades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentGPA}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentGrades.reduce((acc, g) => acc + g.credits, 0)}{" "}
                    Credits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic History</CardTitle>
              <CardDescription>
                Your GPA and performance across semesters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-center">GPA</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeHistory.map((semester, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {semester.semester}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            semester.gpa >= 3.7 ? "default" : "secondary"
                          }
                        >
                          {semester.gpa}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {semester.credits}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            semester.status === "Completed"
                              ? "outline"
                              : "default"
                          }
                        >
                          {semester.status}
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

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Calculator</CardTitle>
              <CardDescription>
                Calculate your potential GPA with different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                GPA calculator functionality coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
