// frontend/src/components/NavBar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaGasPump, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function NavBar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Вы успешно вышли из аккаунта!', { position: 'top-right' });
    navigate('/login');
  };

  const toggleMenu = () => {
    setExpanded(!expanded);
  };

  const menuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren',
      },
    },
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 },
  };

  const isDarkTheme = document.body.classList.contains('dark-theme');

  return (
    <Navbar
      className={`
        bg-gradient shadow-md
        ${isDarkTheme ? 'dark-theme' : ''}
      `}
      variant="dark"
      expand="lg"
      expanded={expanded}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaGasPump className="me-2" style={{ fontSize: '1.5rem', color: '#50e3c2' }} />
          <span className="fw-bold text-white">Gas Service</span>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbar-nav"
          onClick={toggleMenu}
          className="border-0"
        >
          {expanded ? (
            <FaTimes size={24} className="text-white" />
          ) : (
            <FaBars size={24} className="text-white" />
          )}
        </Navbar.Toggle>
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <AnimatePresence>
            <motion.div
              initial="closed"
              animate={expanded ? 'open' : 'closed'}
              exit="closed"
              variants={menuVariants}
              className="w-100"
            >
              <Nav className="ms-auto">
                {isAuthenticated ? (
                  <>
                    <motion.div variants={itemVariants}>
                      <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>
                        Создать заявку
                      </Nav.Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Nav.Link as={Link} to="/requests" onClick={() => setExpanded(false)}>
                        Мои заявки
                      </Nav.Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Nav.Link as={Link} to="/profile" onClick={() => setExpanded(false)}>
                        Профиль
                      </Nav.Link>
                    </motion.div>
                    <motion.div variants={itemVariants} className="d-flex align-items-center">
                      <Button
                        variant="outline-light"
                        onClick={() => {
                          handleLogout();
                          setExpanded(false);
                        }}
                        className="ms-2"
                      >
                        Выйти
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                        Войти
                      </Nav.Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Nav.Link as={Link} to="/register" onClick={() => setExpanded(false)}>
                        Регистрация
                      </Nav.Link>
                    </motion.div>
                  </>
                )}
              </Nav>
            </motion.div>
          </AnimatePresence>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;