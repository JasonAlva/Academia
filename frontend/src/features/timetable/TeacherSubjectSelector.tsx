import { useState, useEffect } from "react";
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
import { User, BookOpen } from "lucide-react";
import { timetableService } from "./timetableService";
import type { Teacher, Subject } from "./types";

interface TeacherSubjectSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teachers: string[], subject: string) => void;
}

export default function TeacherSubjectSelector({
  open,
  onOpenChange,
  onSelect,
}: TeacherSubjectSelectorProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, subjectsData] = await Promise.all([
        timetableService.getTeachersList(),
        timetableService.getSubjectsList(),
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherToggle = (teacherName: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherName)
        ? prev.filter((t) => t !== teacherName)
        : [...prev, teacherName]
    );
  };

  const handleSubjectSelect = (subjectName: string) => {
    setSelectedSubject(subjectName);
  };

  const handleSubmit = () => {
    if (selectedTeachers.length > 0 && selectedSubject) {
      onSelect(selectedTeachers, selectedSubject);
      resetSelection();
    }
  };

  const handleCancel = () => {
    resetSelection();
    onOpenChange(false);
  };

  const resetSelection = () => {
    setSelectedTeachers([]);
    setSelectedSubject("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Teacher and Subject</DialogTitle>
          <DialogDescription>
            Choose one or more teachers and a subject for this period
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Teachers Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Teachers</h3>
            </div>
            <Separator />
            <ScrollArea className="h-[300px] pr-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <Badge
                      key={teacher.id}
                      variant={
                        selectedTeachers.includes(teacher.name)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer w-full justify-start py-2 px-3"
                      onClick={() => handleTeacherToggle(teacher.name)}
                    >
                      {teacher.name}
                      {teacher.department && (
                        <span className="ml-2 text-xs opacity-70">
                          ({teacher.department})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Subjects Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h3 className="font-semibold">Subjects</h3>
            </div>
            <Separator />
            <ScrollArea className="h-[300px] pr-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant={
                        selectedSubject === subject.name ? "default" : "outline"
                      }
                      className="cursor-pointer w-full justify-start py-2 px-3"
                      onClick={() => handleSubjectSelect(subject.name)}
                    >
                      {subject.name}
                      {subject.code && (
                        <span className="ml-2 text-xs opacity-70">
                          ({subject.code})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedTeachers.length === 0 || !selectedSubject}
          >
            Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
