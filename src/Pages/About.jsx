import React from "react";
import "../Style/About.css";

const About = () => {
  return (
    <div className="about-container">
      <section className="intro-section">
        <h2 className="titleAbout">About</h2>
      </section>

      <div className="AboutMidSection">
        <div className="AboutContent">
          <h1 className="AboutMidTitle">My Background and Inspiration</h1>
          <p className="AboutDescription">
            As a developer passionate about education technology, I created
            StudyBuddy to address the challenges students face with information
            overload. This project combines my interest in AI-powered learning
            tools with practical web development skills.
          </p>
        </div>
      </div>

      <section className="team-section">
        <div className="team-members">
          <div className="team-member">
            <h4>Anusha Fatima</h4>
            <p>Full-Stack Developer</p>
            <p>
              Full-Stack Developer & Database Architect. Designed and built the
              entire system.
            </p>
            <a
              href="https://github.com/anusha-fatima"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#ad336d" }}
            >
              <i class="fa-brands fa-github"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/anusha-fatima-69743a288/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#ad336d" }}
            >
              <i class="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>
      </section>

      <div className="tech-section">
        <section className="tech-stack">
          <h3 className="missionTitle">Technical Implementation</h3>
          <div className="tech-card">
            <h4>Core Technologies</h4>
            <ul>
              <li>React.js with Vite for frontend</li>
              <li>Google Gemini AI for content generation</li>
              <li>PDF.js for document processing</li>
              <li>Mammoth.js for Word document extraction</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>Key Features Implemented</h4>
            <ul>
              <li>Multi-format document processing (PDF/DOCX/TXT)</li>
              <li>AI-powered quiz generation</li>
              <li>Smart key point extraction</li>
              <li>Text-to-speech functionality</li>
              <li>Responsive design for all devices</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="missionBox">
        <section className="mission-section">
          <h3 className="missionTitle">StudyBuddy AI Learning Platform</h3>
          <p className="missionPara">
            An intelligent learning companion that transforms study materials
            into interactive learning experiences using cutting-edge AI
            technology.
          </p>

          <h2 className="missionTitle">Mission</h2>
          <p className="missionPara">
            The mission is to revolutionize learning by making educational
            content more accessible through AI-powered tools. We bridge the gap
            between complex materials and student comprehension by providing
            smart summarization, audio learning, and personalized study aids -
            helping learners of all types master their subjects faster.
          </p>

          <h3 className="missionTitle">Technical Highlights</h3>
          <ul className="missionLIst">
            <li>
              <strong>Hybrid Architecture:</strong> Combines traditional
              algorithms with AI fallback systems for reliability
            </li>
            <li>
              <strong>Advanced Document Processing:</strong> Handles complex PDF
              and Word document extraction with error recovery
            </li>
            <li>
              <strong>SmartSummary - Key Point Extraction:</strong> Our AI
              analyzes your documents to extract and highlight the most
              important concepts, creating instant study guides from lengthy
              materials.
            </li>
          </ul>

          <h3 className="missionTitle">Learning Outcomes</h3>
          <p className="missionPara">
            Through building StudyBuddy, I've gained deep experience in:
          </p>
          <ul className="missionLIst">
            <li>Integrating LLM APIs into practical applications</li>
            <li>Designing effective AI prompts for educational content</li>
            <li>Processing diverse document formats at scale</li>
            <li>Building robust fallback mechanisms when AI services fail</li>
            <li>Creating accessible educational interfaces</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default About;
