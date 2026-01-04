import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, AlertCircle } from "lucide-react";
import { timetableService } from "../../services/timeTableService";
import { useDepartmentService } from "../../services/departmentService";
import TimeTable, { emptyTimeTableDetails } from "./TimeTableGrid";
import { YearTabs, TimetableControls } from "./TimetableControls";
import TeacherSubjectSelector from "./TeacherSubjectSelector";
import type {
  TimeTableType,
  FullTimeTable,
  TimeTableStructure,
  SubjectsDetailsList,
} from "./types";

export default function TimeTablesPage() {
  const departmentService = useDepartmentService();

  const [allTimeTables, setAllTimeTables] = useState<FullTimeTable>([]);
  const [timeTable, setTimeTable] = useState<TimeTableType>(
    emptyTimeTableDetails
  );
  const [currentYear, setCurrentYear] = useState(0); // 0-3 for 1st-4th year
  const [currentSemester, setCurrentSemester] = useState(0); // 0-1 for sem 1-2 within a year
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [currentDepartment, setCurrentDepartment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timeTableStructure, setTimeTableStructure] =
    useState<TimeTableStructure>({
      breaksPerSemester: [
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
      ],
      periodCount: 8,
      sectionsPerSemester: [2, 2, 2, 2, 2, 2, 2, 2],
      semesterCount: 8,
      dayCount: 5,
    });
  const [dayNames, setDayNames] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<[number, number] | null>(
    null
  );
  const [subjectsDetails, setSubjectsDetails] = useState<SubjectsDetailsList>(
    {}
  );

  // Calculate absolute semester index (0-7) from year and semester
  const absoluteSemester = currentYear * 2 + currentSemester;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update current timetable when year/semester/department changes
  useEffect(() => {
    updateCurrentTimeTable();
  }, [currentYear, currentSemester, currentDepartment, allTimeTables]);

  // Reload schedules when department changes
  useEffect(() => {
    if (currentDepartment) {
      loadSchedulesForDepartment(currentDepartment);
    }
  }, [currentDepartment]);

  const loadSchedulesForDepartment = async (departmentId: string) => {
    try {
      const schedules = await timetableService.getSchedule(departmentId);
      console.log("Loaded schedules for department:", departmentId, schedules);
      setAllTimeTables(schedules || []);
    } catch (error) {
      console.error("Failed to load schedules for department:", error);
      toast.error("Failed to load schedules for selected department");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load departments
      const depts = await departmentService.getAll();
      console.log("Loaded departments:", depts);
      setDepartments(depts || []);

      // Set first department as default if available
      if (depts && depts.length > 0) {
        setCurrentDepartment(depts[0].id);

        // Load schedules for first department
        const schedules = await timetableService.getSchedule(depts[0].id);
        console.log("Loaded schedules:", schedules);
        setAllTimeTables(schedules || []);
      }

      // Load subjects/courses for display
      const courses = await timetableService.getSubjectsDetailsList();
      console.log("Loaded courses:", courses);
      setSubjectsDetails(courses || {});

      // Set default structure for 4 years (8 semesters)
      const defaultStructure: TimeTableStructure = {
        breaksPerSemester: [
          [2, 5],
          [2, 5],
          [2, 5],
          [2, 5],
          [2, 5],
          [2, 5],
          [2, 5],
          [2, 5],
        ],
        periodCount: 8,
        sectionsPerSemester: [2, 2, 2, 2, 2, 2, 2, 2],
        semesterCount: 8,
        dayCount: 5,
      };
      setTimeTableStructure(defaultStructure);

      // Calculate day names based on structure
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const calculatedDays = weekDays.slice(0, defaultStructure.dayCount);
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
      // Calculate absolute semester index (0-7)
      const semIndex = currentYear * 2 + currentSemester;
      // For now, using section 0 as default
      // TODO: Filter by department when backend supports it
      if (allTimeTables?.[semIndex]?.[0]) {
        setTimeTable(allTimeTables[semIndex][0]);
      } else {
        setTimeTable(emptyTimeTableDetails);
      }
    } catch (error) {
      console.error("Error selecting timetable:", error);
      setTimeTable(emptyTimeTableDetails);
    }
  }, [currentYear, currentSemester, currentDepartment, allTimeTables]);

  const handlePeriodClick = (dayIndex: number, periodIndex: number) => {
    // Check if it's a break period
    const isBreak =
      timeTableStructure.breaksPerSemester[absoluteSemester]?.includes(
        periodIndex
      );
    if (isBreak) return; // Don't allow editing break periods

    setSelectedPeriod([dayIndex, periodIndex]);
    setShowSelector(true);
  };

  const handlePeriodSet = async (
    teachers: string[],
    subject: string,
    room: string
  ) => {
    if (!selectedPeriod) return;

    const [dayIndex, periodIndex] = selectedPeriod;

    // Deep clone the timetable to ensure proper state update
    const newTimeTable: TimeTableType = JSON.parse(JSON.stringify(timeTable));

    // Initialize day array if it doesn't exist
    if (!newTimeTable[dayIndex]) {
      newTimeTable[dayIndex] = [];
    }

    // Set the period with teacher names, subject code, and room
    newTimeTable[dayIndex][periodIndex] = [teachers.join("+"), subject, room];

    try {
      await timetableService.saveSchedule(
        absoluteSemester + 1,
        1, // Using section 1 as default
        newTimeTable,
        currentDepartment
      );

      // Update both local state and global state
      setTimeTable(newTimeTable);
      const updatedAllTimeTables = [...allTimeTables];
      if (!updatedAllTimeTables[absoluteSemester]) {
        updatedAllTimeTables[absoluteSemester] = [];
      }
      updatedAllTimeTables[absoluteSemester][0] = newTimeTable;
      setAllTimeTables(updatedAllTimeTables);

      setShowSelector(false);
      toast.success("Period updated successfully");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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
                  Manage and generate timetables for all years and departments
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Year Tabs */}
          <YearTabs
            yearCount={4}
            currentYear={currentYear}
            onYearChange={setCurrentYear}
          />

          {/* Semester and Department Controls */}
          <TimetableControls
            currentSemester={currentSemester}
            onSemesterChange={setCurrentSemester}
            departments={departments}
            currentDepartment={currentDepartment}
            onDepartmentChange={setCurrentDepartment}
          />

          {/* Timetable */}
          {timeTable && timeTable.length > 0 ? (
            <TimeTable
              subjectsDetails={subjectsDetails}
              details={timeTable}
              periodClickHandler={handlePeriodClick}
              breakTimeIndexs={
                timeTableStructure.breaksPerSemester[absoluteSemester] || []
              }
              noOfPeriods={timeTableStructure.periodCount}
              dayNames={dayNames}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {Object.keys(subjectsDetails).length === 0
                  ? "No courses found. Please add courses first."
                  : departments.length === 0
                  ? "No departments found. Please add departments first."
                  : `No timetable found for the selected year, semester, and department. Click on a period to manually add classes.`}
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
    </div>
  );
}
