import "../Style/Header.css";
import { Link } from "react-router-dom";
import React, { useState, lazy, Suspense } from "react";
import { FcHeadset, FcViewDetails } from "react-icons/fc";

const QuizGenerator = lazy(() => import("../components/QuizGenerator"));

const Header = () => {
  const [documentText, setDocumentText] = useState("");

  const handleDocumentProcessed = (text) => {
    setDocumentText(text);
  };
  
  return (
    <div className="app-container">
      <section className="hero-section-1">
        <div className="hero-content">
          <h2>Welcome to StudyBuddy</h2>
          <p>
            Your AI-powered learning companion! Transform your study materials into interactive learning experiences...
          </p>
        </div>
        <div className="book-display">
          <div className="book-stack">
            <div className="book book-1"></div>
            <div className="book book-2"></div>
            <div className="book book-3"></div>
          </div>
        </div>
      </section>

      <div className="header-container">
        <section className="hero-section-2">
          <div className="hero-content-2">
            <h1>Transform Your Study Materials</h1>
            <p>Upload your documents and unlock powerful learning tools</p>
          </div>
          
          <Suspense fallback={<div>Loading tools...</div>}>
            <QuizGenerator
              onDocumentProcessed={handleDocumentProcessed}
              documentText={documentText}
            />
          </Suspense>
        </section>
      </div>
      
      <div className="Features">
        <div className="card">
          <FcHeadset className="icon"/>
          <h2>AudioStudy</h2>
          <p>Emphasizes learning through audio</p>
          <button>
            <Link to="/features" className="nav-link-1">
              AudioStudy
            </Link>
          </button>
        </div>
        <div className="card">
          <FcViewDetails className="icon"/>
          <h2>KeyGen</h2>
          <p>Key Points Generator</p>
          <button>
            <Link to="/KeyPointsGen" className="nav-link-1">KeyGen</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;