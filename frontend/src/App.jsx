// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import NavBar from './components/NavBar';
import RequestForm from './pages/RequestForm';
import RequestList from './pages/RequestList';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { ThemeProvider } from './ThemeContext.jsx'; // Изменено с .js на .jsx


function AnimatedRoutes() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route
            path="/"
            element={isAuthenticated ? <RequestForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/requests"
            element={isAuthenticated ? <RequestList /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
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
        <div className="min-vh-100">
          <NavBar />
          <div className="container-fluid py-3 py-md-5">
            <AnimatedRoutes />
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;