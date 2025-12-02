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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconBook,
  IconUsers,
  IconCalendar,
  IconFileText,
  IconPlus,
} from "@tabler/icons-react";

export default function TeacherCoursesPage() {
  const courses = [
    {
      id: 1,
      name: "Database Systems",
      code: "CS401",
      students: 45,
      schedule: "Mon, Wed 10:00 AM",
      progress: 65,
      status: "Active",
    },
    {
      id: 2,
      name: "Web Development",
      code: "CS302",
      students: 38,
      schedule: "Tue, Thu 2:00 PM",
      progress: 72,
      status: "Active",
    },
    {
      id: 3,
      name: "Data Structures",
      code: "CS201",
      students: 52,
      schedule: "Mon, Wed 2:00 PM",
      progress: 58,
      status: "Active",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses, materials, and assignments
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
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
                <Badge>{course.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <IconUsers className="h-4 w-4" />
                  {course.students} Students
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <IconCalendar className="h-4 w-4" />
                  {course.schedule.split(" ")[0]}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <IconBook className="mr-2 h-4 w-4" />
                  Materials
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <IconFileText className="mr-2 h-4 w-4" />
                  Grades
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Course Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Materials</CardTitle>
              <CardDescription>
                Latest uploaded course materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                  <div>
                    <p className="font-medium">Database Design Lecture.pdf</p>
                    <p className="text-sm text-muted-foreground">
                      Database Systems • Uploaded 2 days ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between border-l-4 border-green-500 pl-4 py-2">
                  <div>
                    <p className="font-medium">React Hooks Tutorial.pdf</p>
                    <p className="text-sm text-muted-foreground">
                      Web Development • Uploaded 1 week ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Assignments</CardTitle>
              <CardDescription>Assignments pending grading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Assignment content...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Your latest course announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Announcements content...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
