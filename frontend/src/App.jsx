import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import NavBar from './components/NavBar';
import RequestForm from './pages/RequestForm';
import RequestList from './pages/RequestList';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import { ThemeProvider } from './ThemeContext.jsx';
import EditRequest from './pages/EditRequest';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-request/:id"
            element={
              <ProtectedRoute>
                <EditRequest />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-200 text-gray-900">
            <NavBar />
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5"
              style={{ paddingTop: 'var(--navbar-height)' }}
            >
              <AnimatedRoutes />
            </div>
            <ToastContainer position="top-right" autoClose={3000} className="mt-16" />
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;