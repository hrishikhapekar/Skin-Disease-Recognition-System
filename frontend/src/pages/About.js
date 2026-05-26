import React from 'react';
import { AlertTriangle, Target, Microscope, Lock, Brain, Server, Code2 } from 'lucide-react';
import './About.css';

const team = [
  { icon: Brain,       name: 'ML Engineer',  role: 'Model Training & Optimization' },
  { icon: Server,      name: 'Backend Dev',  role: 'Flask API & Model Integration' },
  { icon: Code2,       name: 'Frontend Dev', role: 'React Dashboard & UI/UX' },
];

const techStack = [
  { name: 'React',                    category: 'Frontend',             color: '#0284c7' },
  { name: 'Python Flask',             category: 'Backend',              color: '#059669' },
  { name: 'Scikit-learn / TensorFlow',category: 'ML Framework',         color: '#d97706' },
  { name: 'Pickle',                   category: 'Model Serialization',  color: '#7c3aed' },
  { name: 'OpenCV / PIL',             category: 'Image Processing',     color: '#0ea5e9' },
  { name: 'Axios',                    category: 'HTTP Client',          color: '#dc2626' },
];

const mission = [
  { icon: Target,     title: 'Accessibility', desc: 'Make early skin disease screening available to everyone, regardless of location or resources.' },
  { icon: Microscope, title: 'Accuracy',      desc: 'Use state-of-the-art ML models trained on dermatology datasets for reliable predictions.' },
  { icon: Lock,       title: 'Privacy',       desc: 'Images are transmitted over HTTPS and are never stored or logged on the server.' },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">

        <div className="about-hero">
          <h1>About <span className="gradient-text">DocAI</span></h1>
          <p>
            DocAI is a final-year project aimed at making dermatological screening accessible
            through artificial intelligence. By leveraging cloud-hosted machine learning models
            deployed on Render, we provide instant predictions for conditions including Acne,
            Chickenpox, Measles, Monkeypox, Psoriasis, and more — via a secure REST API.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-box">
          <AlertTriangle size={18} color="#d97706" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3>Medical Disclaimer</h3>
            <p>
              DocAI is developed for educational and research purposes only. It is not a substitute
              for professional medical advice, diagnosis, or treatment. Always consult a qualified
              dermatologist for any skin-related concerns.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="about-section">
          <h2>Our Mission</h2>
          <div className="mission-grid">
            {mission.map(({ icon: Icon, title, desc }) => (
              <div className="mission-card" key={title}>
                <div className="mission-icon">
                  <Icon size={22} color="var(--primary)" strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            {techStack.map(t => (
              <div className="tech-card" key={t.name}>
                <div className="tech-dot" style={{ background: t.color }} />
                <div>
                  <p className="tech-name">{t.name}</p>
                  <p className="tech-cat">{t.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="about-section">
          <h2>Team Roles</h2>
          <div className="team-grid">
            {team.map(({ icon: Icon, name, role }) => (
              <div className="team-card" key={name}>
                <div className="team-icon">
                  <Icon size={28} color="var(--primary)" strokeWidth={1.6} />
                </div>
                <h3>{name}</h3>
                <p>{role}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
