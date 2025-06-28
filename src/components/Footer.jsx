import React from 'react';
import '../Style/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2>Study-Budy</h2>
          <p>Your 24/7 Learning Companion
          Empowering students through AI-driven study tools 📚💡</p>
        </div>
        
        <div className="footer-section links">
          <h3>Main Pages</h3>
          <ul>
            <li><a href="/KeyPointsGen">Key-Points-Generator</a></li>
            <li><a href="/features">Text-to-Speech</a></li>
            <li><a href="/About">About</a></li>
          </ul>
        </div>

        <div className="footer-section links">
          <h3>Developed By</h3>
          <ul>
          <li><a
               href="https://www.linkedin.com/in/anusha-fatima-69743a288/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anusha Fatima
            </a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Study-Budy. Powered by React.</p>
        <div className="social-icons">
         
        <a
              href="https://www.linkedin.com/in/anusha-fatima-69743a288/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#333" }}
            >
               <i class="fa-brands fa-linkedin"></i>
            </a>
          <a
              href="https://github.com/anusha-fatima"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#333" }}
            >
              <i class="fa-brands fa-github"></i>
            </a>
        </div>
      </div>
     
    </footer>
  );
};

export default Footer;
