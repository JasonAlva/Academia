import { DashboardLayout } from "@/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBook,
  IconUsers,
  IconCalendar,
  IconClipboardCheck,
} from "@tabler/icons-react";

/**
 * Example Teacher Dashboard Page
 * Shows how the same layout adapts for teacher role
 */
export default function TeacherDashboardPage() {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your classes today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Active this semester
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Classes Today
              </CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                2 completed, 2 upcoming
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <IconClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4">
                  <div>
                    <p className="font-medium">Database Systems</p>
                    <p className="text-sm text-muted-foreground">
                      CS-301 • Room 205
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">9:00 AM - 10:30 AM</p>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between border-l-4 border-green-500 pl-4">
                  <div>
                    <p className="font-medium">Web Development</p>
                    <p className="text-sm text-muted-foreground">
                      CS-201 • Room 102
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">11:00 AM - 12:30 PM</p>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between border-l-4 border-orange-500 pl-4">
                  <div>
                    <p className="font-medium">Data Structures</p>
                    <p className="text-sm text-muted-foreground">
                      CS-202 • Room 301
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">2:00 PM - 3:30 PM</p>
                    <Badge>Upcoming</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-orange-100 p-1">
                    <IconClipboardCheck className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Grade Lab Reports</p>
                    <p className="text-xs text-muted-foreground">
                      12 submissions pending
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1">
                    <IconBook className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Update Course Materials
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Web Development - Week 5
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-1">
                    <IconCalendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schedule Office Hours</p>
                    <p className="text-xs text-muted-foreground">
                      Next week's slots
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
