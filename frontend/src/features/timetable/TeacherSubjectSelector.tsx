import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  BookOpen,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { timetableService } from "../../services/timeTableService";
import type { Teacher, Subject, SubjectsDetailsList } from "./types";

interface TeacherSubjectSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teachers: string[], subject: string, room: string) => void;
}

type Step = 1 | 2 | 3;

export default function TeacherSubjectSelector({
  open,
  onOpenChange,
  onSelect,
}: TeacherSubjectSelectorProps) {
  // Data state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsDetails, setSubjectsDetails] = useState<SubjectsDetailsList>(
    {}
  );
  const [loading, setLoading] = useState(false);

  // Selection state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [roomNumber, setRoomNumber] = useState<string>("");

  // Deduplicated subjects list
  const uniqueSubjects = useMemo(() => {
    const seen = new Map();
    subjects.forEach((subject) => {
      if (!seen.has(subject.code)) {
        seen.set(subject.code, subject);
      }
    });
    return Array.from(seen.values());
  }, [subjects]);

  // Build course-to-teachers mapping from subjectsDetails
  const courseTeacherMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    Object.entries(subjectsDetails).forEach(([subjectCode, details]) => {
      if (!map.has(subjectCode)) {
        map.set(subjectCode, new Set());
      }

      // Parse teacher names (handle multiple teachers with +)
      const teacherNames = details.teacherName
        .split("+")
        .map((t) => t.trim())
        .filter(Boolean);

      teacherNames.forEach((teacherName) => {
        map.get(subjectCode)!.add(teacherName);
      });
    });

    return map;
  }, [subjectsDetails]);

  // Get teachers available for selected course
  const availableTeachers = useMemo(() => {
    if (!selectedCourse) return [];

    const teacherNames = courseTeacherMap.get(selectedCourse);
    if (!teacherNames || teacherNames.size === 0) {
      return [];
    }

    return teachers.filter((teacher) => teacherNames.has(teacher.name));
  }, [selectedCourse, teachers, courseTeacherMap]);

  // Get room codes for selected course
  const suggestedRooms = useMemo(() => {
    if (!selectedCourse) return [];
    const details = subjectsDetails[selectedCourse];
    return details?.roomCodes || [];
  }, [selectedCourse, subjectsDetails]);

  useEffect(() => {
    if (open) {
      loadData();
      resetSelection();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, subjectsData, detailsData] = await Promise.all([
        timetableService.getTeachersList(),
        timetableService.getSubjectsList(),
        timetableService.getSubjectsDetailsList(),
      ]);

      console.log("Raw teachers data:", teachersData);
      console.log("Raw subjects data:", subjectsData);
      console.log("Raw details data:", detailsData);

      // Map teachers to expected format (handle nested user object)
      const mappedTeachers: Teacher[] = (teachersData || []).map(
        (teacher: any) => ({
          id: teacher.id,
          name: teacher.user?.name || teacher.name || "Unknown",
          department: teacher.department,
          email: teacher.user?.email || teacher.email,
        })
      );

      // Map subjects/courses to expected format
      const mappedSubjects: Subject[] = (subjectsData || []).map(
        (course: any) => ({
          id: course.id,
          name: course.courseName || course.name,
          code: course.courseCode || course.code,
          credits: course.credits,
          department_id: course.departmentId || course.department_id,
        })
      );

      console.log("Mapped teachers:", mappedTeachers);
      console.log("Mapped subjects:", mappedSubjects);

      setTeachers(mappedTeachers);
      setSubjects(mappedSubjects);
      setSubjectsDetails(detailsData || {});
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setCurrentStep(1);
    setSelectedCourse("");
    setSelectedTeachers([]);
    setRoomNumber("");
  };

  const handleCourseSelect = (courseCode: string) => {
    setSelectedCourse(courseCode);
  };

  const handleTeacherToggle = (teacherName: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherName)
        ? prev.filter((t) => t !== teacherName)
        : [...prev, teacherName]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedCourse) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedTeachers.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedTeachers([]);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setRoomNumber("");
    }
  };

  const handleSubmit = () => {
    if (selectedTeachers.length > 0 && selectedCourse && roomNumber.trim()) {
      // Pass the course CODE, not the course name
      onSelect(selectedTeachers, selectedCourse, roomNumber.trim());
      resetSelection();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    resetSelection();
    onOpenChange(false);
  };

  const getSelectedCourseName = () => {
    const course = uniqueSubjects.find((s) => s.code === selectedCourse);
    return course?.name || selectedCourse;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Select Course";
      case 2:
        return `Select Teachers for ${getSelectedCourseName()}`;
      case 3:
        return "Enter Room Number";
      default:
        return "Select Course";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Choose the course for this timetable period";
      case 2:
        return `Select one or more teachers who will teach ${getSelectedCourseName()}`;
      case 3:
        return "Enter the room number where the class will be held";
      default:
        return "";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedCourse;
      case 2:
        return selectedTeachers.length > 0;
      case 3:
        return roomNumber.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 mx-1 transition-colors ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="py-4 h-[400px] overflow-hidden">
          {/* Step 1: Course Selection */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Available Courses</h3>
                <span className="text-xs text-muted-foreground">
                  ({uniqueSubjects.length} courses)
                </span>
              </div>
              <ScrollArea className="h-[350px] pr-4">
                {loading ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Loading courses...
                  </div>
                ) : uniqueSubjects.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No courses available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uniqueSubjects.map((subject) => {
                      const isSelected = selectedCourse === subject.code;
                      return (
                        <Badge
                          key={subject.code}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-start cursor-pointer hover:bg-accent p-3 h-auto transition-colors"
                          onClick={() => handleCourseSelect(subject.code)}
                        >
                          <span className="flex-1 text-left font-medium">
                            {subject.name}
                          </span>
                          {subject.code && (
                            <span className="text-xs opacity-70">
                              {subject.code}
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Step 2: Teacher Selection */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="text-sm font-semibold">
                  Teachers for {getSelectedCourseName()}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({availableTeachers.length} available)
                </span>
              </div>
              <ScrollArea className="h-[320px] pr-4">
                {loading ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Loading teachers...
                  </div>
                ) : availableTeachers.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No teachers assigned to {getSelectedCourseName()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableTeachers.map((teacher) => {
                      const isSelected = selectedTeachers.includes(
                        teacher.name
                      );
                      return (
                        <Badge
                          key={teacher.id}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-start cursor-pointer hover:bg-accent p-3 h-auto transition-colors"
                          onClick={() => handleTeacherToggle(teacher.name)}
                        >
                          <span className="flex-1 text-left font-medium">
                            {teacher.name}
                          </span>
                          {teacher.department && (
                            <span className="text-xs opacity-70">
                              {teacher.department}
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              {selectedTeachers.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedTeachers.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Room Number Input */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Room Information</h3>
              </div>
              <div className="space-y-4 max-w-md mx-auto pt-8">
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room Number</Label>
                  <Input
                    id="room-number"
                    placeholder="e.g., A101, Lab-3, Room 205"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    autoFocus
                  />
                </div>

                {suggestedRooms.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Suggested rooms:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedRooms.map((room) => (
                        <Badge
                          key={room}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => setRoomNumber(room)}
                        >
                          {room}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-2 text-sm">
                  <p className="font-medium">Summary:</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium">Course:</span>{" "}
                      {getSelectedCourseName()}
                    </p>
                    <p>
                      <span className="font-medium">Teachers:</span>{" "}
                      {selectedTeachers.join(", ")}
                    </p>
                    <p>
                      <span className="font-medium">Room:</span>{" "}
                      {roomNumber || "Not entered"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed()}>
                  Create Entry
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
