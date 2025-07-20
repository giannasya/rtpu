import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Student from "./pages/student";
import Materi from "./pages/materi";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import MateriDetail from "./pages/materidetail";
import Quiz from "./components/quiz";
import Profile from "./pages/profile";
import CourseOverview from "./pages/courseoverview";
import Sidebar from "./components/sidebar";
import AddQuiz from "./pages/addquiz";
import Progress from "./components/progress";
import Pricing from "./pages/pricing";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import About from "./pages/about";
import Contact from "./pages/contact";
import Catalog from "./pages/catalog";
import LandingPortal from "./pages/landingportal";
import LearningPath from "./pages/learningpath";
import LearningPathDetail from "./pages/learningpathdetail";
import CourseDetail from "./pages/coursedetail";
import QuizList from "./pages/quizlist";
import { AuthProvider } from "./components/authcontext";
import AdminDashboard from "./pages/admin";
import HasilQuizList from "./pages/hasilquizlist";
import HasilQuizDetail from "./pages/hasilquizdetail";


const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && !role.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function Layout() {
  const location = useLocation();
  const noSidebarRoutes = [
    "/",
    "/landing",
    "/login",
    "/register",
    "/catalog",
    "/learning-path",
    "/learningpath/:id",
    "/course/:id",
    "/coursedetail",
  ];
  const showSidebar = !noSidebarRoutes.some((route) =>
    route.includes(":id")
      ? location.pathname.match(route.replace(":id", "\\d+"))
      : route === location.pathname
  );

  return (
    <>
      <Navbar />
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<LandingPortal />} />
        <Route path="/landing" element={<LandingPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role={["teacher"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role={["teacher"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role={["student"]}>
              <Student />
            </ProtectedRoute>
          }
        />

        {/* ✅ Route Materi course dan submateri */}
        <Route
          path="/materi/:courseId"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <Materi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/:courseId/:materialId"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <MateriDetail />
            </ProtectedRoute>
          }
        />

        {/* ❌ Remove this, unless you want redirect */}
        {/* <Route
          path="/materi"
          element={
            <Navigate to="/not-found" />
          }
        /> */}

        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courseoverview"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <CourseOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addquiz"
          element={
            <ProtectedRoute role={["teacher"]}>
              <AddQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute role={["teacher", "student"]}>
              <Pricing />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/learningpath/:id" element={<LearningPathDetail />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/quizlist" element={<QuizList />} />
          
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={["teacher", "admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      <Route
        path="/hasilquiz"
        element={
          <ProtectedRoute role={["teacher"]}>
            <HasilQuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hasilquiz/:id"
        element={
          <ProtectedRoute role={["teacher"]}>
            <HasilQuizDetail />
          </ProtectedRoute>
        }
      />

        {/* Optional Not Found */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
