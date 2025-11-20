import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import AuthForm from "@/pages/auth/AuthForm";
import StudentDashboard from "@/pages/dashboard/student";
import TeacherDashboard from "@/pages/dashboard/teacher";
import AdminDashboard from "@/pages/dashboard/admin";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function LoginPage() {
  const navigate = useNavigate();

  const onAuthSuccess = (data: { token: string; user: any }) => {
    // persist and navigate based on role
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    const role = (data.user?.role || "").toString().toLowerCase();
    if (role === "student" || role === "student")
      navigate("/dashboard/student");
    else if (role === "instructor" || role === "teacher")
      navigate("/dashboard/teacher");
    else if (role === "admin") navigate("/dashboard/admin");
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <AuthForm onAuthSuccess={onAuthSuccess} />
      </div>
    </div>
  );
}

function ProtectedDashboard() {
  const raw = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!raw || !token) return <Navigate to="/login" replace />;

  let user: any = null;
  try {
    user = JSON.parse(raw);
  } catch {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || "").toString().toLowerCase();

  if (role === "student") return <StudentDashboard />;
  if (role === "instructor" || role === "teacher") return <TeacherDashboard />;
  if (role === "admin") return <AdminDashboard />;

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
