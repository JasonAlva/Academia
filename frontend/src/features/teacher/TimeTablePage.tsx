import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconAlertCircle,
  IconCalendar,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { timetableService } from "@/services/timeTableService";
import { useTeacherService } from "@/services/teacherService";

type PeriodDetails = [string, string, string] | null; // [teacher, subject, room]
type DaySchedule = PeriodDetails[];
type TimeTableType = DaySchedule[];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "9:00-10:00",
  "10:00-11:00",
  "11:00-11:30",
  "11:30-12:30",
  "12:30-1:30",
  "1:30-2:30",
  "2:30-3:30",
  "3:30-4:30",
];
const BREAK_PERIODS = [2, 5]; // Index 2 is break time

export default function TeacherTimeTablePage() {
  const { user } = useAuth();
  const teacherService = useTeacherService();

  const [timetable, setTimetable] = useState<TimeTableType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Fetch teacher ID from user ID
  useEffect(() => {
    const fetchTeacherId = async () => {
      if (!user?.id) return;

      try {
        const teachers = await teacherService.getAll();
        const teacher = teachers.find((t) => t.userId === user.id);
        if (teacher) {
          setTeacherId(teacher.id);
        } else {
          setError("Teacher profile not found");
        }
      } catch (err) {
        console.error("Failed to fetch teacher profile:", err);
        setError("Failed to load teacher profile");
      }
    };

    fetchTeacherId();
  }, [user]);

  // Fetch teacher's timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        const data = await timetableService.getTeacherTimetable(teacherId);
        setTimetable(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
        setError("Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [teacherId]);

  const isBreak = (periodIndex: number) => {
    return BREAK_PERIODS.includes(periodIndex);
  };

  const getClassCount = () => {
    return timetable.reduce(
      (count, day) => count + day.filter((period) => period !== null).length,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error Loading Timetable</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Timetable</h2>
          <p className="text-muted-foreground">Your weekly class schedule</p>
        </div>
        <Card className="px-6 py-4">
          <div className="flex items-center gap-3">
            <IconCalendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Classes/Week</p>
              <p className="text-2xl font-bold">{getClassCount()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="w-full overflow-auto">
            <div className="min-w-[900px]">
              {/* Header with time slots */}
              <div className="grid grid-cols-[120px_repeat(9,minmax(100px,1fr))] gap-2 mb-4">
                <div className="font-semibold text-center py-2 bg-muted rounded-lg">
                  Day / Time
                </div>
                {TIME_SLOTS.map((time, i) => (
                  <div
                    key={i}
                    className={cn(
                      "font-semibold text-center py-2 text-xs rounded-lg",
                      isBreak(i)
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
                        : "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {time}
                    </div>
                    {isBreak(i) && (
                      <div className="text-[10px] font-normal mt-1">Break</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Timetable Grid */}
              <div className="space-y-2">
                {DAY_NAMES.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="grid grid-cols-[120px_repeat(9,minmax(100px,1fr))] gap-2"
                  >
                    {/* Day Name */}
                    <div className="flex items-center justify-center font-medium bg-primary/10 text-primary rounded-lg py-2">
                      {day}
                    </div>

                    {/* Periods */}
                    {Array.from({ length: 8 }, (_, periodIndex) => {
                      if (isBreak(periodIndex)) {
                        return (
                          <div
                            key={periodIndex}
                            className="flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 rounded-lg min-h-20 border border-orange-200 dark:border-orange-800"
                          >
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              Break Time
                            </span>
                          </div>
                        );
                      }

                      const periodContent = timetable[dayIndex]?.[periodIndex];

                      return (
                        <Card
                          key={periodIndex}
                          className={cn(
                            "min-h-20 transition-all",
                            periodContent
                              ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
                              : "bg-muted/20"
                          )}
                        >
                          <CardContent className="p-3 h-full flex flex-col justify-center items-center">
                            {periodContent ? (
                              <>
                                <Badge className="mb-1.5 text-xs w-full justify-center bg-blue-600 hover:bg-blue-700">
                                  {periodContent[1]}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                  <IconMapPin className="h-3 w-3" />
                                  <span className="font-medium">
                                    {periodContent[2]}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">
                                  Free
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
