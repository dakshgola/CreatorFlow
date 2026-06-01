import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import useDarkMode from "./hooks/useDarkMode";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AITools from "./pages/AITools";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import Planner from "./pages/Planner";
import Payments from "./pages/Payments";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";

function App() {
  useDarkMode();

  // Ping backend /health endpoint on app mount to wake up Render instances early
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    fetch(`${apiUrl}/health`).catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected with SaaS Layout and Error Boundaries */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-tools"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <AITools />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Clients />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Tasks />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Planner />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Payments />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <History />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Analytics />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
