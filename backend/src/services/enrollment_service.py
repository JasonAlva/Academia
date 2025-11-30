from typing import List, Optional
from prisma import Prisma
from models.schemas import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse


class EnrollmentService:
    def __init__(self,db:Prisma):
        self.db=db

    async def create_enrollment(self,enrollment_data:EnrollmentCreate)->EnrollmentResponse:
        enrollment= await self.db.enrollment.create(data={
            'student':{'connect':{'id':enrollment_data.student_id}},
            'course':{'connect':{'id':enrollment_data.course_id}},
            'semester':enrollment_data.semester,
            'academic_year':enrollment_data.academic_year,
            'status':"active"
        })

        return EnrollmentResponse.model_validate(enrollment)
    
    async def get_enrollment(self,enrollment_id:str)->Optional[EnrollmentResponse]:
        enrollment=await self.db.enrollment.find_unique(where={
            'id':enrollment_id
        })
        return EnrollmentResponse.model_validate(enrollment) if enrollment else None

    async def update_enrollment(self, enrollment_id: str, enrollment_data: EnrollmentUpdate) -> EnrollmentResponse:
        enrollment = await self.db.enrollment.update(
            where={'id': enrollment_id},
            data=enrollment_data.model_dump(exclude_unset=True)
        )
        return EnrollmentResponse.model_validate(enrollment)

    async def delete_enrollment(self, enrollment_id: str) -> bool:
        await self.db.enrollment.delete(where={'id': enrollment_id})
        return True

    async def list_enrollments(self, student_id: Optional[str] = None) -> List[EnrollmentResponse]:
        where = {'student_id': student_id} if student_id else {}
        enrollments = await self.db.enrollment.find_many(where=where)
        return [EnrollmentResponse.model_validate(e) for e in enrollments]