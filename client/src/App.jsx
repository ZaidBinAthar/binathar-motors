import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import BikeCatalog from "./pages/BikeCatalog";
import BikeDetail from "./pages/BikeDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Inquiries from "./pages/admin/Inquiries";
import Chat from "./pages/admin/Chat";
import Reports from "./pages/admin/Reports";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bikes" element={<BikeCatalog />} />
                <Route path="/bikes/:id" element={<BikeDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute ownerOnly>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inquiries"
                  element={
                    <ProtectedRoute adminOnly>
                      <Inquiries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inquiries/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute ownerOnly>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
