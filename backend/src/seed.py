import random
import asyncio
from prisma import Prisma
from faker import Faker
from passlib.context import CryptContext

fake = Faker()

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


DEPARTMENTS = [
    {"code": "CSE", "name": "Computer Science & Engineering"},
    {"code": "ECE", "name": "Electronics & Communication"},
    {"code": "ME", "name": "Mechanical Engineering"},
    {"code": "EEE", "name": "Electrical & Electronics"},
    {"code": "CV", "name": "Civil Engineering"},
    {"code": "ISE", "name": "Information Science"},
]

COURSES = {
    "CSE": ["DSA", "DBMS", "Operating Systems", "Computer Networks", "Web Development", "Cloud Computing"],
    "ECE": ["Digital Electronics", "Microprocessors", "Signals & Systems"],
    "ME": ["Thermodynamics", "Fluid Mechanics"],
    "EEE": ["Power Systems", "Control Engineering"],
    "CV": ["Structural Analysis", "Surveying"],
    "ISE": ["DSA", "DBMS", "Operating Systems", "Computer Networks", "Web Development", "Cloud Computing", "IOT"]
}

DESIGNATIONS = ["Professor", "Assistant Professor", "Lecturer"]
SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]


def generate_student_id(dept_code: str, roll: int) -> str:
    return f"1RV{dept_code}{roll:03d}"


async def seed():
    db = Prisma()
    await db.connect()

    # -------------------------------------------
    # DELETE OLD DATA
    # -------------------------------------------
    print("\n=== Wiping old data ===")
    await db.enrollment.delete_many()
    await db.schedule.delete_many()
    await db.teacher.delete_many()
    await db.student.delete_many()
    await db.admin.delete_many()
    await db.user.delete_many()
    await db.course.delete_many()
    await db.department.delete_many()
    print("Old records cleared.\n")

    # -------------------------------------------
    # DEPARTMENTS
    # -------------------------------------------
    print("=== Seeding Departments ===")
    await db.department.create_many(
        data=[
            {
                "code": d["code"],
                "name": d["name"],
                "description": f"{d['name']} Department"
            }
            for d in DEPARTMENTS
        ]
    )
    dept_map = {d.code: d.id for d in await db.department.find_many()}
    print("Departments seeded.\n")

    # -------------------------------------------
    # COURSES
    # -------------------------------------------
    print("=== Seeding Courses ===")
    course_map = {}

    for dept in DEPARTMENTS:
        code = dept["code"]
        for cname in COURSES[code]:
            course = await db.course.create(
                data={
                    "courseCode": f"{code}{random.randint(100, 999)}",
                    "courseName": cname,
                    "credits": random.choice([3, 4]),
                    "departmentId": dept_map[code],
                    "semester": random.choice(SEMESTERS),
                }
            )
            course_map.setdefault(code, []).append(course.id)

    print("Courses seeded.\n")

    # -------------------------------------------
    # USERS + PROFILES
    # -------------------------------------------
    print("=== Seeding Users ===")
    total_users = random.randint(60, 70)

    teacher_ids = []
    student_ids = []
    dept_roll_count = {d["code"]: 0 for d in DEPARTMENTS}

    for _ in range(total_users):
        role = random.choice(["STUDENT", "TEACHER", "ADMIN"])
        email = fake.unique.email()
        password = hash_password("1234")   # ALL USERS → PASSWORD = 1234

        user = await db.user.create(
            data={
                "email": email,
                "password": password,
                "role": role,
                "name": fake.name(),
            }
        )

        # STUDENT
        if role == "STUDENT":
            dept = random.choice(DEPARTMENTS)["code"]
            dept_roll_count[dept] += 1
            sid = generate_student_id(dept, dept_roll_count[dept])

            student = await db.student.create(
                data={
                    "userId": user.id,
                    "studentId": sid,
                    "department": dept,
                    "semester": random.choice(SEMESTERS),
                    "batch": str(random.randint(2022, 2025)),
                }
            )
            student_ids.append(student.id)

        # TEACHER
        elif role == "TEACHER":
            dept = random.choice(DEPARTMENTS)["code"]
            tid = f"TCH{random.randint(1000, 9999)}"

            teacher = await db.teacher.create(
                data={
                    "userId": user.id,
                    "teacherId": tid,
                    "department": dept,
                    "designation": random.choice(DESIGNATIONS),
                }
            )
            teacher_ids.append(teacher.id)

        # ADMIN
        else:
            await db.admin.create(
                data={
                    "userId": user.id,
                    "adminId": f"ADM{random.randint(1000, 9999)}"
                }
            )

    print("Users seeded.\n")

    # -------------------------------------------
    # ASSIGN TEACHERS TO COURSES
    # -------------------------------------------
    print("=== Assigning Teachers to Courses ===")
    for dept, cids in course_map.items():
        for cid in cids:
            if teacher_ids:
                await db.course.update(
                    where={"id": cid},
                    data={"teacherId": random.choice(teacher_ids)}
                )
    print("Teachers assigned.\n")

    # -------------------------------------------
    # SCHEDULES
    # -------------------------------------------
    print("=== Creating Schedules ===")
    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

    for dept, cids in course_map.items():
        for cid in cids:
            await db.schedule.create(
                data={
                    "courseId": cid,
                    "teacherId": random.choice(teacher_ids),
                    "dayOfWeek": random.choice(days),
                    "startTime": "10:00 AM",
                    "endTime": "11:00 AM",
                    "room": f"Room-{random.randint(100, 500)}",
                }
            )
    print("Schedules created.\n")

    # -------------------------------------------
    # ENROLLMENTS (NO DUPLICATES!)
    # -------------------------------------------
    print("=== Creating Enrollments ===")

    for sid in student_ids:
        dept = random.choice(DEPARTMENTS)["code"]

        if course_map.get(dept):

            # pick unique courses safely
            available_courses = course_map[dept][:]
            random.shuffle(available_courses)
            selected = available_courses[:random.randint(2, 4)]

            for cid in selected:
                await db.enrollment.create(
                    data={
                        "studentId": sid,
                        "courseId": cid
                    }
                )

    print("Enrollments done.\n")

    print("=== Seeder Completed Successfully! ===")
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
