import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Edit3 } from "lucide-react";
import { useState } from "react";

interface TimetableControlsProps {
  onAutoFillClick?: () => void;
  onFillManuallyChange?: (value: boolean) => void;
  currentSection: number;
  sectionsCount: number;
  onSectionChange: (section: number) => void;
}

export function TimetableControls({
  onAutoFillClick,
  onFillManuallyChange,
  currentSection,
  sectionsCount,
  onSectionChange,
}: TimetableControlsProps) {
  const [fillManually, setFillManually] = useState(true);

  const handleManualToggle = () => {
    const newValue = !fillManually;
    setFillManually(newValue);
    onFillManuallyChange?.(newValue);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      {/* Left Controls */}
      <div className="flex items-center gap-3">
        <Button onClick={onAutoFillClick} variant="default" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Auto Fill with AI
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Fill Manually:</span>
          <Toggle
            pressed={fillManually}
            onPressedChange={handleManualToggle}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {fillManually ? "On" : "Off"}
          </Toggle>
        </div>
      </div>

      {/* Sections Selector */}
      {sectionsCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Section:</span>
          <div className="flex gap-1">
            {Array.from({ length: sectionsCount }, (_, i) => (
              <Badge
                key={i}
                variant={currentSection === i ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => onSectionChange(i)}
              >
                {String.fromCharCode(65 + i)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SemesterTabsProps {
  semesterCount: number;
  currentSemester: number;
  onSemesterChange: (semester: number) => void;
}

export function SemesterTabs({
  semesterCount,
  currentSemester,
  onSemesterChange,
}: SemesterTabsProps) {
  return (
    <Tabs
      value={currentSemester.toString()}
      onValueChange={(val) => onSemesterChange(parseInt(val))}
      className="w-full mb-6"
    >
      <TabsList
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${semesterCount}, 1fr)` }}
      >
        {Array.from({ length: semesterCount }, (_, i) => (
          <TabsTrigger key={i} value={i.toString()}>
            Year {i + 1}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
