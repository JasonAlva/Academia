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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconBook,
  IconCalendar,
  IconFileText,
  IconDownload,
  IconExternalLink,
} from "@tabler/icons-react";

export default function StudentCoursesPage() {
  const courses = [
    {
      id: 1,
      name: "Database Systems",
      code: "CS401",
      instructor: "Dr. Sarah Johnson",
      credits: 3,
      grade: "A",
      progress: 85,
      schedule: "Mon, Wed 10:00 AM",
      status: "Active",
    },
    {
      id: 2,
      name: "Web Development",
      code: "CS302",
      instructor: "Prof. Michael Chen",
      credits: 4,
      grade: "A-",
      progress: 78,
      schedule: "Tue, Thu 2:00 PM",
      status: "Active",
    },
    {
      id: 3,
      name: "Data Structures",
      code: "CS201",
      instructor: "Dr. Emily Davis",
      credits: 3,
      grade: "B+",
      progress: 92,
      schedule: "Mon, Wed 2:00 PM",
      status: "Active",
    },
  ];

  const assignments = [
    {
      id: 1,
      course: "Database Systems",
      title: "ER Diagram Assignment",
      dueDate: "2024-12-10",
      status: "pending",
    },
    {
      id: 2,
      course: "Web Development",
      title: "React Project",
      dueDate: "2024-12-15",
      status: "pending",
    },
    {
      id: 3,
      course: "Data Structures",
      title: "Tree Implementation",
      dueDate: "2024-12-05",
      status: "submitted",
    },
  ];

  const materials = [
    {
      id: 1,
      course: "Database Systems",
      title: "Database Design Lecture.pdf",
      uploadDate: "2024-12-01",
      size: "2.4 MB",
    },
    {
      id: 2,
      course: "Web Development",
      title: "React Hooks Tutorial.pdf",
      uploadDate: "2024-11-28",
      size: "1.8 MB",
    },
  ];

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            View your enrolled courses, materials, and assignments
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.code}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      course.grade.startsWith("A")
                        ? "default"
                        : course.grade.startsWith("B")
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {course.grade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {course.instructor}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      {course.schedule.split(" ")[0]}
                    </span>
                    <span>{course.credits} Credits</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Course Progress
                    </span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  <IconBook className="mr-2 h-4 w-4" />
                  View Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Course Materials</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>
                  Assignments due soon across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <IconFileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.course}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            assignment.status === "submitted"
                              ? "default"
                              : "outline"
                          }
                        >
                          {assignment.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {assignment.status === "submitted"
                            ? "View"
                            : "Submit"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>
                  Download materials from your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <IconFileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.course} • {material.size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded:{" "}
                            {new Date(material.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <IconExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                  Latest updates from your instructors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium">Midterm Exam Schedule Updated</p>
                    <p className="text-sm text-muted-foreground">
                      Database Systems • 2 days ago
                    </p>
                    <p className="text-sm mt-2">
                      The midterm exam has been rescheduled to December 20th...
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-medium">New Assignment Posted</p>
                    <p className="text-sm text-muted-foreground">
                      Web Development • 1 week ago
                    </p>
                    <p className="text-sm mt-2">
                      A new React project assignment has been posted...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
}
