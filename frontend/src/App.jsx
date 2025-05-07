// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import RequestForm from './pages/RequestForm';
import RequestList from './pages/RequestList';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-vh-100 bg-light">
        <NavBar />
        <div className="container-fluid py-5">
          <Routes>
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
        </div>
      </div>
    </Router>
  );
}

export default App;