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
import {
  IconBook,
  IconCalendar,
  IconClipboardList,
  IconTrophy,
} from "@tabler/icons-react";

/**
 * Example Student Dashboard Page
 * Shows how the same layout adapts for student role
 */
export default function StudentDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, Student!
        </h2>
        <p className="text-muted-foreground">
          Track your academic progress and stay organized.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <IconBook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <IconTrophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.75</div>
            <p className="text-xs text-muted-foreground">Overall GPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <IconClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next 2 weeks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <IconBook className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Database Systems</p>
                    <p className="text-sm text-muted-foreground">
                      Dr. Smith • Room 205
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">9:00 AM</p>
                  <Badge variant="secondary">Attended</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <IconBook className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Web Development</p>
                    <p className="text-sm text-muted-foreground">
                      Prof. Johnson • Room 102
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">11:00 AM</p>
                  <Badge variant="secondary">Attended</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 border-orange-200 bg-orange-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <IconBook className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Data Structures</p>
                    <p className="text-sm text-muted-foreground">
                      Dr. Williams • Room 301
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">2:00 PM</p>
                  <Badge>Next Class</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Assignments Due</CardTitle>
            <CardDescription>Upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Database Lab Report</p>
                    <p className="text-xs text-muted-foreground">
                      Database Systems
                    </p>
                  </div>
                  <Badge variant="destructive">Due Tomorrow</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">React Component</p>
                    <p className="text-xs text-muted-foreground">
                      Web Development
                    </p>
                  </div>
                  <Badge variant="secondary">Due in 3 days</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Binary Tree Implementation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Data Structures
                    </p>
                  </div>
                  <Badge variant="outline">Due in 5 days</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "10%" }}
                  ></div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
