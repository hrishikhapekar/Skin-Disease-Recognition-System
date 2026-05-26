import React from 'react';
import { Package, Palette, Search, Zap, Monitor, Server, Brain, ArrowRight, Smartphone, Building2, Globe, TrendingUp, Stethoscope } from 'lucide-react';
import './Idea.css';

const steps = [
  { num: '01', title: 'Image Acquisition', desc: 'User uploads a skin image or captures one via webcam. The image is sent to the Flask backend as multipart form data.' },
  { num: '02', title: 'Preprocessing', desc: 'The backend resizes, normalizes, and transforms the image to match the format expected by the trained model.' },
  { num: '03', title: 'Model Inference', desc: 'The cloud-hosted pickle model on Render runs inference on the preprocessed image and outputs class probabilities.' },
  { num: '04', title: 'Result Delivery', desc: 'The top prediction and confidence scores are returned as JSON and displayed on the dashboard.' },
];

const challenges = [
  { icon: Package, title: 'Dataset Imbalance', desc: 'Skin disease datasets are often imbalanced. Techniques like oversampling and class weighting are used.' },
  { icon: Palette, title: 'Skin Tone Variation', desc: 'Models are trained on diverse datasets to reduce bias across different skin tones.' },
  { icon: Search, title: 'Low Resolution Images', desc: 'Image augmentation and preprocessing pipelines handle varying image quality.' },
  { icon: Zap, title: 'Cloud Deployment', desc: 'The Flask backend and ML model are hosted on Render, accessible via a secure public API endpoint.' },
];

export default function Idea() {
  return (
    <div className="idea-page">
      <div className="idea-container">
        <div className="idea-hero">
          <div className="idea-badge">Project Concept</div>
          <h1>The Idea Behind <span className="gradient-text">DocAI</span></h1>
          <p>
            Skin diseases affect millions globally, yet access to dermatologists remains limited
            in many regions. DocAI bridges this gap by bringing AI-powered skin analysis
            to anyone with an internet connection — fast, accessible, and secure.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="idea-section">
          <h2>Problem Statement</h2>
          <div className="problem-box">
            <p>
              Over <strong>3 billion</strong> people worldwide suffer from skin diseases, yet
              dermatologist consultations are expensive and inaccessible in rural areas.
              Early detection is critical — melanoma survival rates drop from <strong>98%</strong> to
              <strong> 23%</strong> when detected late. DocAI aims to provide a first-line
              screening tool that empowers individuals to seek timely medical attention.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="idea-section">
          <h2>How It Works</h2>
          <div className="steps-list">
            {steps.map(s => (
              <div className="step-item" key={s.num}>
                <div className="step-num">{s.num}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="idea-section">
          <h2>System Architecture</h2>
          <div className="arch-diagram">
            <div className="arch-box frontend">
              <div className="arch-icon frontend-icon">
                <Monitor size={28} strokeWidth={1.8} color="#0284c7" />
              </div>
              <strong>React Frontend</strong>
              <small>Image Upload / Camera</small>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={22} strokeWidth={2} color="var(--text-muted)" />
            </div>
            <div className="arch-box api">
              <div className="arch-icon api-icon">
                <Server size={28} strokeWidth={1.8} color="#059669" />
              </div>
              <strong>Flask API</strong>
              <small>REST Endpoints</small>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={22} strokeWidth={2} color="var(--text-muted)" />
            </div>
            <div className="arch-box model">
              <div className="arch-icon model-icon">
                <Brain size={28} strokeWidth={1.8} color="#7c3aed" />
              </div>
              <strong>ML Model</strong>
              <small>Pickle File</small>
            </div>
          </div>

        </div>

        {/* Challenges */}
        <div className="idea-section">
          <h2>Challenges & Solutions</h2>
          <div className="challenges-grid">
            {challenges.map(({ icon: Icon, title, desc }) => (
              <div className="challenge-card" key={title}>
                <div className="challenge-icon">
                  <Icon size={28} strokeWidth={1.8} color="var(--primary)" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Scope */}
        <div className="idea-section">
          <h2>Future Scope</h2>
          <ul className="future-list">
            <li><Smartphone size={17} strokeWidth={1.8} color="var(--primary)" /> Mobile app with on-device TensorFlow Lite models</li>
            <li><Building2 size={17} strokeWidth={1.8} color="var(--primary)" /> Integration with hospital management systems</li>
            <li><Globe size={17} strokeWidth={1.8} color="var(--primary)" /> Multi-language support for global accessibility</li>
            <li><TrendingUp size={17} strokeWidth={1.8} color="var(--primary)" /> Continuous model improvement with federated learning</li>
            <li><Stethoscope size={17} strokeWidth={1.8} color="var(--primary)" /> Telemedicine integration for direct doctor consultation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

