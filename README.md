# College Management System

A full-stack AI-powered college management system with role-based access control and natural language query capabilities. The system uses LangGraph agents to provide intelligent assistance for administrators, teachers, and students.

## 🌟 Features

### Role-Based Access Control

- **Admin**: Full system access for managing departments, courses, teachers, students, schedules, and attendance
- **Teacher**: Access to course management, student enrollment, attendance marking, and schedule viewing
- **Student**: View personal profile, courses, schedules, and attendance records

### AI-Powered Natural Language Interface

- Context-aware conversational agents for each role
- Natural language queries for data retrieval and management
- LangGraph-based agent architecture with dynamic tool binding
- Support for multiple LLM providers (Ollama, Google Gemini)

### Core Functionality

- **User Management**: Authentication and authorization with JWT tokens
- **Department Management**: Create, update, delete, and list departments
- **Course Management**: Manage courses with prerequisites and department associations
- **Teacher Management**: Handle teacher profiles, specializations, and course assignments
- **Student Management**: Manage student profiles, enrollments, and academic records
- **Enrollment System**: Handle course enrollments with capacity limits
- **Attendance Tracking**: Mark and track attendance for both students and teachers
- **Schedule Management**: Create and manage class schedules with conflict detection
- **Chat System**: AI-powered conversational interface with message history

## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **AI/ML**: LangChain, LangGraph, LangChain-Ollama, LangChain-Google-GenAI
- **Python Version**: 3.10+

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **Icons**: Lucide React, Tabler Icons

### DevOps

- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Prisma Migrate

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)
- PostgreSQL 15 (handled by Docker)

## 🚀 Getting Started

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DBMS
   ```

2. **Configure environment variables**

   Create a `.env` file in the backend directory:

   ```env
   DATABASE_URL="postgresql://postgres:1117@localhost:5432/college_query_system"
   JWT_SECRET="your-secret-key-here"
   ```

3. **Start the application**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PostgreSQL: localhost:5432

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Generate Prisma Client**

   ```bash
   prisma generate
   ```

5. **Run database migrations**

   ```bash
   prisma migrate deploy
   ```

6. **Start the backend server**
   ```bash
   python run.py
   # or
   uvicorn src.main:app --reload
   ```

#### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env` file:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
DBMS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── agents/                # LangGraph AI agents
│   │   │   ├── admin_agent.py
│   │   │   ├── teacher_agent.py
│   │   │   ├── student_agent.py
│   │   │   └── role_based_agent.py
│   │   ├── api/                   # API routes
│   │   │   └── routes/
│   │   ├── config/                # Configuration files
│   │   │   ├── database.py
│   │   │   ├── llm.py
│   │   │   └── settings.py
│   │   ├── middleware/            # Middleware components
│   │   │   ├── auth_middleware.py
│   │   │   └── error_handler.py
│   │   ├── models/                # Pydantic schemas
│   │   ├── services/              # Business logic layer
│   │   ├── tools/                 # LangChain tools
│   │   └── utils/                 # Utility functions
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── auth/                  # Authentication context
│   │   ├── components/            # Reusable UI components
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── config/                # Configuration files
│   │   ├── features/              # Feature-specific components
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   ├── student/
│   │   │   ├── chat/
│   │   │   └── timetable/
│   │   ├── layout/                # Layout components
│   │   ├── pages/                 # Page components
│   │   └── services/              # API service layer
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml

```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Admin Routes

- `GET /api/admin/stats` - Get system statistics

### Departments

- `GET /api/departments` - List all departments
- `POST /api/departments` - Create a department
- `GET /api/departments/{id}` - Get department details
- `PUT /api/departments/{id}` - Update a department
- `DELETE /api/departments/{id}` - Delete a department

### Courses

- `GET /api/courses` - List all courses
- `POST /api/courses` - Create a course
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update a course
- `DELETE /api/courses/{id}` - Delete a course

### Students

- `GET /api/students` - List all students
- `POST /api/students` - Create a student
- `GET /api/students/{id}` - Get student details
- `PUT /api/students/{id}` - Update a student
- `DELETE /api/students/{id}` - Delete a student

### Teachers

- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create a teacher
- `GET /api/teachers/{id}` - Get teacher details
- `PUT /api/teachers/{id}` - Update a teacher
- `DELETE /api/teachers/{id}` - Delete a teacher

### Enrollments

- `POST /api/enrollments` - Enroll a student in a course
- `GET /api/enrollments/student/{student_id}` - Get student enrollments
- `GET /api/enrollments/course/{course_id}` - Get course enrollments

### Attendance

- `POST /api/attendance/student` - Mark student attendance
- `GET /api/attendance/student/{student_id}` - Get student attendance
- `POST /api/attendance/teacher` - Mark teacher attendance
- `GET /api/attendance/teacher/{teacher_id}` - Get teacher attendance

### Schedules

- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create a schedule
- `GET /api/schedules/{id}` - Get schedule details
- `PUT /api/schedules/{id}` - Update a schedule
- `DELETE /api/schedules/{id}` - Delete a schedule

### Chat

- `POST /api/chat` - Send a message to the AI agent
- `GET /api/chat/history` - Get chat history

## 🤖 AI Agent System

The system uses LangGraph to create role-based conversational agents that can:

- Answer natural language queries about courses, schedules, attendance
- Perform CRUD operations through conversational interface
- Provide context-aware responses based on user role
- Maintain conversation history for contextual understanding

### Supported Tools by Role

#### Admin Tools

- All department, course, teacher, and student management tools
- Schedule and attendance management
- System statistics and reporting

#### Teacher Tools

- View own profile and courses
- View enrolled students
- Mark student attendance
- View and manage schedules
- Access course information

#### Student Tools

- View own profile
- View enrolled courses
- View attendance records
- View class schedules
- Check course information

## 🗃️ Database Schema

The system uses PostgreSQL with the following main entities:

- **User**: Core user authentication and role management
- **Student**: Student profile with department and semester info
- **Teacher**: Teacher profile with specialization and department
- **Admin**: Administrative user profile
- **Department**: Academic departments
- **Course**: Course information with prerequisites
- **Enrollment**: Student-course enrollment relationship
- **Schedule**: Class scheduling with room and time information
- **ClassSession**: Individual class session records
- **StudentAttendance**: Student attendance tracking
- **TeacherAttendance**: Teacher attendance tracking
- **ChatMessage**: Conversation history storage

## 🔒 Security

- JWT-based authentication with secure token generation
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Protected API routes with authentication middleware
- CORS configuration for frontend-backend communication

## 🧪 Testing

To run tests (if implemented):

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

## 📝 Seeding Data

To seed the database with sample data:

```bash
cd backend
python src/newSeed.py
```

## 🐛 Common Issues & Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running (check Docker container status)
- Verify DATABASE_URL in environment variables
- Check if port 5432 is not being used by another process

### Frontend Not Loading

- Clear browser cache
- Check if backend is running on port 8000
- Verify VITE_API_URL environment variable

### Migration Issues

```bash
# Reset database (development only!)
cd backend
prisma migrate reset

# Apply migrations
prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Jason Alva

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- LangChain and LangGraph for AI agent capabilities
- Prisma for the modern database toolkit
- shadcn/ui for beautiful UI components
- Radix UI for accessible component primitives

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note**: This project is for educational purposes. Ensure you properly configure security settings before deploying to production.
