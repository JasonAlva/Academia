import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface YearTabsProps {
  yearCount: number;
  currentYear: number;
  onYearChange: (year: number) => void;
}

export function YearTabs({
  yearCount,
  currentYear,
  onYearChange,
}: YearTabsProps) {
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <Tabs
      value={currentYear.toString()}
      onValueChange={(val) => onYearChange(parseInt(val))}
      className="w-full mb-6"
    >
      <TabsList
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${yearCount}, 1fr)` }}
      >
        {Array.from({ length: yearCount }, (_, i) => (
          <TabsTrigger key={i} value={i.toString()}>
            {getOrdinal(i + 1)} Year
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

interface TimetableControlsProps {
  currentSemester: number;
  onSemesterChange: (semester: number) => void;
  departments: Array<{ id: string; name: string; code: string }>;
  currentDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
}

export function TimetableControls({
  currentSemester,
  onSemesterChange,
  departments,
  currentDepartment,
  onDepartmentChange,
}: TimetableControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:justify-start sm:items-end gap-4 mb-6 ">
      {/* Semester Selection */}
      <div className=" space-y-2 w-full sm:w-auto">
        <Label htmlFor="semester-select">Semester</Label>
        <Select
          value={currentSemester.toString()}
          onValueChange={(val) => onSemesterChange(parseInt(val))}
        >
          <SelectTrigger id="semester-select" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Odd Semester</SelectItem>
            <SelectItem value="1">Even Semester </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Selection */}
      <div className=" space-y-2 w-full sm:w-auto">
        <Label htmlFor="department-select">Department</Label>
        <Select value={currentDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department-select" className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
