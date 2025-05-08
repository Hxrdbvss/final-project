// frontend/src/components/NavBar.jsx
import { Link } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaHome, FaList, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../ThemeContext.jsx'; // Изменено с .js на .jsx

function NavBar() {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Gas Service</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto">
            <Link className="nav-link d-flex align-items-center" to="/">
              <FaHome className="me-1" /> Home
            </Link>
            <Link className="nav-link d-flex align-items-center" to="/requests">
              <FaList className="me-1" /> Requests
            </Link>
            {isAuthenticated && (
              <Link className="nav-link d-flex align-items-center" to="/profile">
                <FaUser className="me-1" /> Profile
              </Link>
            )}
            <div className="nav-item dropdown">
              {isAuthenticated ? (
                <>
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUser className="me-1" /> Account
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                        <FaSignOutAlt className="me-1" /> Logout
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <Link className="nav-link" to="/login">Login</Link>
                  <Link className="nav-link" to="/register">Register</Link>
                </>
              )}
            </div>
            <button
              className="btn btn-outline-light ms-2"
              onClick={toggleTheme}
              title="Переключить тему"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;