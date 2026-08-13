import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/static/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import BlogDetail from "./pages/BlogDetail";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import Profile from "./pages/Profile";
import MainLayout from "./components/layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/write" element={<CreateBlog />} />
            <Route path="/edit/:id" element={<EditBlog />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;