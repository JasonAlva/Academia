-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_teacherId_fkey";

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
