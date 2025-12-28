-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_markedById_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_markedById_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_teacherId_fkey";

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
