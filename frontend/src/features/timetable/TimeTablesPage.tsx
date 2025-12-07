import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, AlertCircle } from "lucide-react";
import { timetableService } from "./timetableService";
import TimeTable, { emptyTimeTableDetails } from "./TimeTableGrid";
import { TimetableControls, SemesterTabs } from "./TimetableControls";
import TeacherSubjectSelector from "./TeacherSubjectSelector";
import type {
  TimeTableType,
  FullTimeTable,
  TimeTableStructure,
  SubjectsDetailsList,
} from "./types";

export default function TimeTablesPage() {
  const [allTimeTables, setAllTimeTables] = useState<FullTimeTable>([]);
  const [timeTable, setTimeTable] = useState<TimeTableType>(emptyTimeTableDetails);
  const [currentSemester, setCurrentSemester] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [timeTableStructure, setTimeTableStructure] = useState<TimeTableStructure>({
    breaksPerSemester: [[4, 5], [5], [5], [5]],
    periodCount: 9,
    sectionsPerSemester: [0, 0, 0, 0],
    semesterCount: 3,
    dayCount: 5,
  });
  const [dayNames, setDayNames] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<[number, number] | null>(null);
  const [fillManually, setFillManually] = useState(true);
  const [subjectsDetails, setSubjectsDetails] = useState<SubjectsDetailsList>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update current timetable when semester/section changes
  useEffect(() => {
    updateCurrentTimeTable();
  }, [currentSemester, currentSection, allTimeTables]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [structure, schedules, subjects] = await Promise.all([
        timetableService.getTimeTableStructure(),
        timetableService.getSchedule(),
        timetableService.getSubjectsDetailsList(),
      ]);

      setTimeTableStructure(structure);
      setAllTimeTables(schedules);
      setSubjectsDetails(subjects);

      // Calculate day names based on structure
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const calculatedDays = weekDays.slice(0, structure.dayCount);
      setDayNames(calculatedDays);
    } catch (error) {
      console.error("Failed to load timetable data:", error);
      toast.error("Failed to load timetable data");
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentTimeTable = useCallback(() => {
    try {
      if (allTimeTables?.[currentSemester]?.[currentSection]) {
        setTimeTable(allTimeTables[currentSemester][currentSection]);
      } else {
        setTimeTable(emptyTimeTableDetails);
      }
    } catch (error) {
      console.error("Error selecting timetable:", error);
      setTimeTable(emptyTimeTableDetails);
    }
  }, [currentSemester, currentSection, allTimeTables]);

  const handlePeriodClick = (dayIndex: number, periodIndex: number) => {
    if (!fillManually) return;
    setSelectedPeriod([dayIndex, periodIndex]);
    setShowSelector(true);
  };

  const handlePeriodSet = async (teachers: string[], subject: string) => {
    if (!selectedPeriod) return;

    const [dayIndex, periodIndex] = selectedPeriod;
    const newTimeTable: TimeTableType = [...timeTable];
    
    if (!newTimeTable[dayIndex]) {
      newTimeTable[dayIndex] = [];
    }

    const room = subjectsDetails[subject]?.roomCodes?.[0] || "";
    newTimeTable[dayIndex][periodIndex] = [teachers.join("+"), subject, room];

    try {
      await timetableService.saveSchedule(
        currentSemester + 1,
        currentSection + 1,
        newTimeTable
      );
      setTimeTable(newTimeTable);
      setShowSelector(false);
      toast.success("Period updated successfully");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule");
    }
  };

  const handleAutoFill = async () => {
    setGenerating(true);
    try {
      const generatedTimetables = await timetableService.generateTimeTable();
      setAllTimeTables(generatedTimetables);
      toast.success("Timetable generated successfully");
    } catch (error) {
      console.error("Failed to generate timetable:", error);
      toast.error("Failed to generate timetable");
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadInitialData();
    toast.success("Timetable refreshed");
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const currentSectionsCount = timeTableStructure.sectionsPerSemester[currentSemester] || 0;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <div>
                <CardTitle>College Timetable</CardTitle>
                <CardDescription>
                  Manage and generate timetables for all years and sections
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Semester Tabs */}
          <SemesterTabs
            semesterCount={timeTableStructure.semesterCount}
            currentSemester={currentSemester}
            onSemesterChange={setCurrentSemester}
          />

          {/* Controls */}
          <TimetableControls
            onAutoFillClick={handleAutoFill}
            onFillManuallyChange={setFillManually}
            currentSection={currentSection}
            sectionsCount={currentSectionsCount}
            onSectionChange={setCurrentSection}
          />

          {/* Timetable */}
          {timeTable && Object.keys(subjectsDetails).length > 0 ? (
            <TimeTable
              subjectsDetails={subjectsDetails}
              details={timeTable}
              periodClickHandler={handlePeriodClick}
              breakTimeIndexs={timeTableStructure.breaksPerSemester[currentSemester] || []}
              noOfPeriods={timeTableStructure.periodCount}
              dayNames={dayNames}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No timetable found for Year {currentSemester + 1} Section{" "}
                {String.fromCharCode(65 + currentSection)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Teacher and Subject Selector Dialog */}
      <TeacherSubjectSelector
        open={showSelector}
        onOpenChange={setShowSelector}
        onSelect={handlePeriodSet}
      />

      {/* Loading overlay for generation */}
      {generating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating timetable with AI...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
