import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimeTableType, SubjectsDetailsList } from "./types";

export const emptyTimeTableDetails: TimeTableType = [];

interface TimeTableProps {
  className?: string;
  subjectsDetails: SubjectsDetailsList;
  details: TimeTableType;
  periodClickHandler?: (dayIndex: number, periodIndex: number) => void;
  breakTimeIndexs: number[];
  noOfPeriods: number;
  dayNames: string[];
}

export default function TimeTable({
  className,
  subjectsDetails,
  details,
  periodClickHandler,
  breakTimeIndexs = [],
  noOfPeriods = 9,
  dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"],
}: TimeTableProps) {
  const getPeriodContent = (dayIndex: number, periodIndex: number) => {
    const day = details[dayIndex];
    if (!day || !day[periodIndex]) {
      return null;
    }

    const [teacher, subject, room] = day[periodIndex] || [];
    const subjectDetail = subjectsDetails[subject];

    return {
      teacher,
      subject,
      room,
      color: subjectDetail?.color || "#3b82f6",
    };
  };

  const isBreak = (periodIndex: number) => {
    return breakTimeIndexs.includes(periodIndex);
  };

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-4">
          <div className="font-semibold text-center py-2">Day</div>
          {Array.from({ length: noOfPeriods }, (_, i) => (
            <div
              key={i}
              className={cn(
                "font-semibold text-center py-2 text-sm",
                isBreak(i) && "text-muted-foreground"
              )}
            >
              {isBreak(i) ? "Break" : `Period ${i + 1}`}
            </div>
          ))}
        </div>

        {/* Timetable Grid */}
        <div className="space-y-2">
          {dayNames.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="grid grid-cols-[100px_repeat(auto-fit,minmax(100px,1fr))] gap-2"
            >
              {/* Day Name */}
              <div className="flex items-center justify-center font-medium bg-muted rounded-lg">
                {day}
              </div>

              {/* Periods */}
              {Array.from({ length: noOfPeriods }, (_, periodIndex) => {
                if (isBreak(periodIndex)) {
                  return (
                    <div
                      key={periodIndex}
                      className="flex items-center justify-center bg-muted/50 rounded-lg min-h-20"
                    >
                      <span className="text-xs text-muted-foreground">
                        Break
                      </span>
                    </div>
                  );
                }

                const periodContent = getPeriodContent(dayIndex, periodIndex);

                return (
                  <Card
                    key={periodIndex}
                    className={cn(
                      "min-h-20 cursor-pointer transition-all hover:shadow-md",
                      !periodContent && "bg-muted/20"
                    )}
                    onClick={() => periodClickHandler?.(dayIndex, periodIndex)}
                  >
                    <CardContent className="p-2 h-full flex flex-col justify-center">
                      {periodContent ? (
                        <>
                          <Badge
                            className="mb-1 text-xs"
                            style={{ backgroundColor: periodContent.color }}
                          >
                            {periodContent.subject}
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            {periodContent.teacher}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {periodContent.room}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-center text-muted-foreground">
                          Empty
                        </p>
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
  );
}
