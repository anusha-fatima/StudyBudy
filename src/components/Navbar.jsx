import React from 'react';
import { Link } from 'react-router-dom';
import '../Style/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo">
          STUDY-BUDY
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/features" className="nav-link">Text-to-Speech</Link>
          </li>
          <li className="nav-item">
            <Link to="/KeyPointsGen" className="nav-link">Key-Points-Genrator</Link>
          </li>
          <li className="nav-item">
            <Link to="/About" className="nav-link">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

