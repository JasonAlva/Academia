-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeacherAttendance" ALTER COLUMN "teacherId" DROP NOT NULL;
