import React from 'react';
import { Microscope, AlertTriangle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <Microscope size={20} color="var(--primary)" strokeWidth={2} />
          <strong>DocAI</strong>
        </div>
        <p className="footer-desc">
          AI-powered skin disease detection built as a final-year academic project.
          Combines machine learning with a symptom-based questionnaire for improved
          prediction accuracy — all running offline on your device.
        </p>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DocAI — Built for educational purposes only.</p>
        <p className="footer-disclaimer">
          <AlertTriangle size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          Always consult a qualified dermatologist for medical advice.
        </p>
      </div>
    </footer>
  );
}
