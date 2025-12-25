import random
from datetime import datetime, timedelta
import asyncio
from prisma import Prisma
from faker import Faker
from passlib.context import CryptContext


fake = Faker()
prisma = Prisma()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


COURSES = [

    {
        "courseCode": "HS251TA",
        "courseName": "Principles of Management and Economics",
        "department": "ISE",
        "semester": 5,
        "credits": 3,
        "category": "HS",
        "type": "Theory"
    },
    {
        "courseCode": "CD252IA",
        "courseName": "Database Management Systems",
        "department": "ISE",
        "semester": 5,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory + Lab"
    },
    {
        "courseCode": "IS353IA",
        "courseName": "Artificial Intelligence and Machine Learning",
        "department": "ISE",
        "semester": 5,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory + Lab"
    },
    {
        "courseCode": "CS354TA",
        "courseName": "Theory of Computation",
        "department": "ISE",
        "semester": 5,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory"
    },
    {
        "courseCode": "XXX55TBX",
        "courseName": "Professional Core Elective – I (Group B)",
        "department": "ISE",
        "semester": 5,
        "credits": 3,
        "category": "Professional Elective",
        "type": "Theory"
    },
    {
        "courseCode": "IS256TCX",
        "courseName": "Professional Core Elective – II (Group C – NPTEL)",
        "department": "ISE",
        "semester": 5,
        "credits": 2,
        "category": "Professional Elective",
        "type": "NPTEL"
    },
    {
        "courseCode": "HS361TA",
        "courseName": "Entrepreneurship and Intellectual Property Rights",
        "department": "ISE",
        "semester": 6,
        "credits": 3,
        "category": "HS",
        "type": "Theory"
    },
    {
        "courseCode": "IS362IA",
        "courseName": "Cryptography and Network Security",
        "department": "ISE",
        "semester": 6,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory + Lab"
    },
    {
        "courseCode": "CS363IA",
        "courseName": "Compiler Design",
        "department": "ISE",
        "semester": 6,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory + Lab"
    },
    {
        "courseCode": "IS364TA",
        "courseName": "Software Engineering with Agile Technologies",
        "department": "ISE",
        "semester": 6,
        "credits": 4,
        "category": "Professional Core",
        "type": "Theory"
    },
    {
        "courseCode": "IS365TDX",
        "courseName": "Professional Core Elective – III (Group D)",
        "department": "ISE",
        "semester": 6,
        "credits": 3,
        "category": "Professional Elective",
        "type": "Theory"
    },
    {
        "courseCode": "XX266TEX",
        "courseName": "Institutional Elective – I (Group E)",
        "department": "ISE",
        "semester": 6,
        "credits": 3,
        "category": "Institutional Elective",
        "type": "Theory"
    },
    {
        "courseCode": "IS367P",
        "courseName": "Interdisciplinary Project",
        "department": "ISE",
        "semester": 6,
        "credits": 3,
        "category": "Project",
        "type": "Practical"
    },

    {"courseCode": "EC101", "courseName": "Circuit Theory", "department": "ECE", "semester": 3, "credits": 4, "category": "Professional Core", "type": "Theory"},
    {"courseCode": "EC102", "courseName": "Digital Electronics", "department": "ECE", "semester": 3, "credits": 4, "category": "Professional Core", "type": "Theory + Lab"},
    {"courseCode": "EC201", "courseName": "Signals and Systems", "department": "ECE", "semester": 4, "credits": 4, "category": "Professional Core", "type": "Theory"},
    {"courseCode": "EC202", "courseName": "Microprocessors", "department": "ECE", "semester": 4, "credits": 3, "category": "Professional Core", "type": "Theory + Lab"},
    {"courseCode": "EC301", "courseName": "Communication Systems", "department": "ECE", "semester": 5, "credits": 4, "category": "Professional Core", "type": "Theory"},

    {"courseCode": "BT101", "courseName": "Biology Fundamentals", "department": "BT", "semester": 1, "credits": 3, "category": "Core", "type": "Theory"},
    {"courseCode": "BT201", "courseName": "Genetics", "department": "BT", "semester": 3, "credits": 4, "category": "Core", "type": "Theory + Lab"},
    {"courseCode": "BT301", "courseName": "Bioprocess Engineering", "department": "BT", "semester": 5, "credits": 4, "category": "Core", "type": "Theory + Lab"},

    {"courseCode": "AI101", "courseName": "Machine Learning Basics", "department": "AIML", "semester": 3, "credits": 4, "category": "Core", "type": "Theory"},
    {"courseCode": "AI201", "courseName": "Deep Learning", "department": "AIML", "semester": 5, "credits": 4, "category": "Core", "type": "Theory + Lab"},
    {"courseCode": "AI301", "courseName": "NLP & Applications", "department": "AIML", "semester": 6, "credits": 3, "category": "Core", "type": "Theory"},

    {"courseCode": "DS101", "courseName": "Data Analytics", "department": "DS", "semester": 3, "credits": 4, "category": "Core", "type": "Theory + Lab"},
    {"courseCode": "DS201", "courseName": "Big Data Technologies", "department": "DS", "semester": 5, "credits": 4, "category": "Core", "type": "Theory"},
    {"courseCode": "DS301", "courseName": "Data Mining", "department": "DS", "semester": 6, "credits": 3, "category": "Core", "type": "Theory"},

    {"courseCode": "ME101", "courseName": "Thermodynamics", "department": "ME", "semester": 3, "credits": 4, "category": "Core", "type": "Theory"},
    {"courseCode": "ME201", "courseName": "Fluid Mechanics", "department": "ME", "semester": 4, "credits": 4, "category": "Core", "type": "Theory + Lab"},
    {"courseCode": "ME301", "courseName": "Manufacturing Processes", "department": "ME", "semester": 5, "credits": 3, "category": "Core", "type": "Theory + Lab"},

    {"courseCode": "CV101", "courseName": "Structural Analysis", "department": "CV", "semester": 3, "credits": 4, "category": "Core", "type": "Theory"},
    {"courseCode": "CV201", "courseName": "Concrete Technology", "department": "CV", "semester": 4, "credits": 3, "category": "Core", "type": "Theory + Lab"},

    {"courseCode": "CY101", "courseName": "Introduction to Cybersecurity", "department": "CY", "semester": 3, "credits": 3, "category": "Core", "type": "Theory"},
    {"courseCode": "CY201", "courseName": "Ethical Hacking", "department": "CY", "semester": 5, "credits": 4, "category": "Core", "type": "Theory + Lab"}
]



DEPARTMENTS = [
    {"code": "CSE", "name": "Computer Science and Engineering"},
    {"code": "ECE", "name": "Electronics and Communication Engineering"},
    {"code": "ISE", "name": "Information Science and Engineering"},
    {"code": "BT",  "name": "Biotechnology"},
    {"code": "AIML","name": "Artificial Intelligence & Machine Learning"},
    {"code": "DS",  "name": "Data Science"},
    {"code": "ME",  "name": "Mechanical Engineering"},
    {"code": "CV",  "name": "Civil Engineering"},
    {"code": "CY",  "name": "Cybersecurity"}
]

ROLES = ["STUDENT", "TEACHER", "ADMIN"]
DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
ATT_STATUS = ["PRESENT", "ABSENT", "LATE", "EXCUSED", "MEDICAL_LEAVE"]
CLASS_TYPES = ["LECTURE", "LAB"]
DESIGNATIONS = ["Professor", "Assistant Professor", "Lecturer"]
SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]


def student_usn(dept_code: str, roll: int) -> str:
    return f"1RV{dept_code}{roll:03d}"


async def reset():
    await prisma.connect()
    await prisma.teacherattendance.delete_many()
    await prisma.studentattendance.delete_many()
    await prisma.classsession.delete_many()
    await prisma.schedule.delete_many()
    await prisma.enrollment.delete_many()
    await prisma.course.delete_many()
    await prisma.teacher.delete_many()
    await prisma.student.delete_many()
    await prisma.admin.delete_many()
    await prisma.user.delete_many()
    await prisma.department.delete_many()
    await prisma.chatmessage.delete_many()

# ---------------- MAIN SEED ----------------
async def main():
    await reset()

    # ---- Departments ----
    dep_map = {}
    for dept_info in DEPARTMENTS:
        d = await prisma.department.create(
            data={"code": dept_info["code"], "name": dept_info["name"]}
        )
        dep_map[dept_info["code"]] = d.id

    # ---- Courses ----
    course_map = {}
    for course_info in COURSES:
        c = await prisma.course.create(
            data={
                "courseCode": course_info["courseCode"],
                "courseName": course_info["courseName"],
                "departmentId": dep_map[course_info["department"]],
                "semester": course_info["semester"],
                "credits": course_info["credits"],
            }
        )
        course_map.setdefault(course_info["department"], []).append(c)

    # ---- Users ----
    students, teachers, admins = [], [], []

    roll = {d["code"]: 0 for d in DEPARTMENTS}

    for _ in range(40):
        role = random.choice(ROLES)
        user = await prisma.user.create(
            data={
                "email": fake.unique.email(),
                "password": hash_password("1234"),
                "name": fake.name(),
                "role": role
            }
        )

        if role == "STUDENT":
            dept = random.choice(list(dep_map.keys()))
            roll[dept] += 1
            s = await prisma.student.create(
                data={
                    "userId": user.id,
                    "studentId": student_usn(dept, roll[dept]),
                    "department": dept,
                    "semester": random.randint(3, 6),
                    "batch": "2023"
                }
            )
            students.append(s)

        elif role == "TEACHER":
            t = await prisma.teacher.create(
                data={
                    "userId": user.id,
                    "teacherId": f"TCH{random.randint(1000,9999)}",
                    "department": random.choice(list(dep_map.keys())),
                    "designation": "Assistant Professor"
                }
            )
            teachers.append(t)

        else:
            a = await prisma.admin.create(
                data={
                    "userId": user.id,
                    "adminId": f"ADM{random.randint(1000,9999)}"
                }
            )
            admins.append(a)

    # ---- Assign Teachers ----
    course_teacher_map = {}
    for dept, courses in course_map.items():
        for c in courses:
            teacher_id = random.choice(teachers).id
            await prisma.course.update(
                where={"id": c.id},
                data={"teacherId": teacher_id}
            )
            course_teacher_map[c.id] = teacher_id

    # ---- Schedules ----
    schedules = []
    for courses in course_map.values():
        for c in courses:
            s = await prisma.schedule.create(
                data={
                    "course": {"connect": {"id": c.id}},
                    "teacher": {"connect": {"id": course_teacher_map[c.id]}},
                    "dayOfWeek": random.choice(DAYS),
                    "startTime": "09:00",
                    "endTime": "10:00",
                    "room": "Room-101",
                    "type": random.choice(CLASS_TYPES)
                }
            )
            schedules.append(s)

    # ---- Enrollments ----
    for s in students:
        dept_courses = course_map.get(s.department, [])
        for c in random.sample(dept_courses, min(2, len(dept_courses))):
            await prisma.enrollment.create(
                data={
                    "studentId": s.id,
                    "courseId": c.id
                }
            )

    # ---- Class Sessions ----
    sessions = []
    for sch in schedules:
        for i in range(3):
            cs = await prisma.classsession.create(
                data={
                    "courseId": sch.courseId,
                    "scheduleId": sch.id,
                    "teacherId": sch.teacherId,
                    "date": datetime.now() - timedelta(days=i),
                    "startTime": sch.startTime,
                    "endTime": sch.endTime,
                    "status": "CONDUCTED"
                }
            )
            sessions.append(cs)

    # ---- Student Attendance ----
    for sess in sessions:
        enrolls = await prisma.enrollment.find_many(
            where={"courseId": sess.courseId}
        )
        for e in enrolls:
            await prisma.studentattendance.create(
                data={
                    "sessionId": sess.id,
                    "studentId": e.studentId,
                    "courseId": sess.courseId,
                    "status": random.choice(ATT_STATUS),
                    "markedById": sess.teacherId
                }
            )

    # ---- Teacher Attendance ----
    for sess in sessions:
        await prisma.teacherattendance.create(
            data={
                "sessionId": sess.id,
                "teacherId": sess.teacherId,
                "courseId": sess.courseId,
                "status": "PRESENT",
                "markedById": random.choice(admins).id
            }
        )

    # ---- Chat Messages ----
    for u in await prisma.user.find_many():
        await prisma.chatmessage.create(
            data={
                "userId": u.id,
                "role": "USER",
                "content": fake.sentence()
            }
        )

    print("✅ FULL DATABASE SEEDED SUCCESSFULLY")
    await prisma.disconnect()

# ---------------- RUN ----------------
if __name__ == "__main__":
    asyncio.run(main())