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
import AdminRequestList from './pages/AdminRequestList';
import CreateEngineer from './pages/CreateEngineer';
import EditRequestPage from './pages/EditRequestPage';
import ContactPage from './pages/ContactPage';
import { ThemeProvider } from './ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';

function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'ADMIN') {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup className="flex-grow">
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
            path="/request-list"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminRequestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-request/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <EditRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-engineer"
            element={
              <ProtectedRoute adminOnly={true}>
                <CreateEngineer />
              </ProtectedRoute>
            }
          />
          <Route path="/contacts" element={<ContactPage />} /> {/* Изменено с /contact на /contacts */}
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
          <div className="h-screen bg-gray-200 text-gray-900 flex flex-col overflow-hidden">
            <NavBar />
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-grow overflow-hidden"
              style={{ paddingTop: 'var(--navbar-height)' }}
            >
              <AnimatedRoutes />
            </div>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} className="fixed top-0 right-0" />
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;