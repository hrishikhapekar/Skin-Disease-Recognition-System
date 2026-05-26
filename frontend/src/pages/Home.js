import React from 'react';
import { Link } from 'react-router-dom';
import {
  ImageUp, Camera, Brain, BarChart2, Zap, ShieldCheck,
  ArrowRight, Info,
} from 'lucide-react';
import './Home.css';

const features = [
  { icon: ImageUp,    title: 'Image Upload',    desc: 'Upload any skin image from your device for instant AI-powered analysis.' },
  { icon: Camera,     title: 'Live Camera',     desc: 'Use your webcam to capture and analyze skin conditions in real time.' },
  { icon: Brain,      title: 'AI Detection',    desc: 'Powered by trained ML models to classify multiple skin diseases accurately.' },
  { icon: BarChart2,  title: 'Confidence Score',desc: 'Get prediction confidence scores to understand model certainty.' },
  { icon: Zap,        title: 'Fast Results',    desc: 'Cloud-hosted model inference delivers quick results via a secure REST API.' },
  { icon: ShieldCheck,title: 'Secure & Private', desc: 'Images are sent over HTTPS and are never stored or shared on the server.' },
];

const diseases = ['Acne', 'Chickenpox', 'Healthy', 'Measles', 'Monkeypox', 'Psoriasis'];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badge">AI-Powered Dermatology</div>
        <h1>
          Detect Skin Diseases<br />
          <span className="gradient-text">Instantly with AI</span>
        </h1>
        <p className="hero-sub">
          Upload a photo or use your camera to get instant skin disease predictions
          powered by cloud-hosted machine learning models via a secure API.
        </p>
        <div className="hero-actions">
          <Link to="/detect" className="btn-primary">
            Start Detection <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link to="/about" className="btn-secondary">
            <Info size={15} strokeWidth={2} /> Learn More
          </Link>
        </div>

        <div className="diseases-inline">
          <p className="diseases-label">Detectable Conditions</p>
          <div className="diseases-grid">
            {diseases.map(d => (
              <div className="disease-tag" key={d}>{d}</div>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat"><span>6</span><p>Conditions Detected</p></div>
          <div className="stat"><span>Fast</span><p>Cloud Inference</p></div>
          <div className="stat"><span>HTTPS</span><p>Secure & Private</p></div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={24} color="var(--primary)" strokeWidth={1.8} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
