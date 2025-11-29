import re

def validate_email(email: str) -> bool:
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def validate_password(password: str) -> bool:
    return len(password) >= 8

def validate_student_id(student_id: str) -> bool:
    return bool(re.match(r'^ST\d{7}$', student_id))

def validate_teacher_id(teacher_id: str) -> bool:
    return bool(re.match(r'^TCH\d{7}$', teacher_id))

def validate_admin_id(admin_id: str) -> bool:
    return bool(re.match(r'^ADM\d{7}$', admin_id))
