import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, logout }) {
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(to right, #232F3E, #131A22)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          {/* Logo Image */}
          <img 
            src="/light-on.png" 
            alt="Quiz App Logo" 
            width="50" 
            height="50" 
            className="me-3 rounded"
          />
          <span style={{ fontSize: '1.6rem', fontWeight: '700', color: '#FF9900' }}>
            QuizMaster
          </span>
        </Link>

        <div className="d-flex align-items-center">
          <span className="navbar-text text-light me-4">
            Hi, <strong>{user.username}</strong> ({user.role})
          </span>
          <button className="btn btn-warning text-white fw-bold" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}