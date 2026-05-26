import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  ImageUp, Camera, FolderOpen, RotateCcw, Video, Pill, RefreshCw,
  AlertTriangle, X, Ban, Hospital, ChevronLeft, ChevronRight,
  Search, Hand, Thermometer, Wind, Activity, CheckCircle2, Ban as BanIcon
} from 'lucide-react';
import './Detect.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('[DermAI] API_URL =', API_URL);

const GROUP_ICONS = {
  skin_lesions: Search,
  skin_feel: Hand,
  fever_energy: Thermometer,
  respiratory: Wind,
  lymph: Activity,
};

const GROUPS = [
  {
    id: 'skin_lesions',
    title: 'Skin & Lesion Symptoms',
    subtitle: 'Select all that apply to your skin right now.',
    color: '#E3F2FD',
    symptoms: [
      { key: 'rash',                   name: 'Rash / Skin Changes',       desc: 'Redness, bumps, spots, or discoloration' },
      { key: 'blisters',               name: 'Fluid-filled Blisters',     desc: 'Clear or cloudy vesicles on skin' },
      { key: 'pus',                    name: 'Pus / Pustules',            desc: 'White or yellow fluid from sores' },
      { key: 'scaling',                name: 'Dry Scaly Patches',         desc: 'Skin peeling in flakes or silver sheets' },
      { key: 'skin_dryness',           name: 'Cracked / Dry Skin',        desc: 'Parched, cracked skin beyond normal' },
      { key: 'lesion_stage_variation', name: 'Mixed Lesion Stages',       desc: 'Fresh bumps, blisters AND scabs at once' },
    ],
  },
  {
    id: 'skin_feel',
    title: 'Skin Feel & Character',
    subtitle: 'How does the affected skin feel?',
    color: '#F3E5F5',
    symptoms: [
      { key: 'itching',      name: 'Itching / Pruritus',       desc: 'Persistent urge to scratch the skin' },
      { key: 'pain',         name: 'Pain or Tenderness',       desc: 'Sore or painful when touched' },
      { key: 'chronic',      name: 'Long-lasting / Recurring', desc: 'Symptoms lasting weeks or months' },
      { key: 'localized',    name: 'Localized Area',           desc: 'Rash confined to face, elbows, back, etc.' },
      { key: 'nail_changes', name: 'Nail Changes',             desc: 'Pitting, discoloration or thickening' },
    ],
  },
  {
    id: 'fever_energy',
    title: 'Fever & Energy',
    subtitle: 'Are you experiencing any general illness symptoms?',
    color: '#FFF8E1',
    symptoms: [
      { key: 'fever',    name: 'Fever',           desc: 'Body temperature above 38°C (100.4°F)' },
      { key: 'fatigue',  name: 'Unusual Fatigue', desc: 'Persistent tiredness beyond normal' },
      { key: 'headache', name: 'Headache',        desc: 'Pain or pressure in the head' },
    ],
  },
  {
    id: 'respiratory',
    title: 'Respiratory & Eye Symptoms',
    subtitle: 'Any symptoms in your airways or eyes?',
    color: '#E8F5E9',
    symptoms: [
      { key: 'cough',      name: 'Cough',                  desc: 'Persistent, not just throat-clearing' },
      { key: 'runny_nose', name: 'Runny / Blocked Nose',   desc: 'Nasal discharge or congestion' },
      { key: 'red_eyes',   name: 'Red / Irritated Eyes',   desc: 'Redness, watering, or conjunctivitis' },
    ],
  },
  {
    id: 'lymph',
    title: 'Lymph Nodes & Glands',
    subtitle: 'Feel for any tender lumps under your skin.',
    color: '#FCE4EC',
    symptoms: [
      { key: 'swollen_lymph_nodes', name: 'Swollen Lymph Nodes', desc: 'Tender lumps in neck, armpits, or groin' },
    ],
  },
];

const ALL_FEATURES = [
  'fever','itching','rash','blisters','pus','scaling','pain','fatigue',
  'headache','cough','runny_nose','red_eyes','swollen_lymph_nodes',
  'skin_dryness','lesion_stage_variation','chronic','localized','nail_changes',
];

const TOTAL_G = GROUPS.length;

// ── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Upload Image', 'Symptoms', 'Results'];
  return (
    <div className="step-bar">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className={`step-node ${step > i ? 'done' : step === i ? 'active' : ''}`}>
            <div className="step-circle">{step > i ? '✓' : i + 1}</div>
            <span>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${step > i ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ group, selections, isNone, onToggle, onToggleNone, groupIndex, total, onBack, onNext, isFirst, isLast }) {
  const Icon = GROUP_ICONS[group.id];
  const ready = isNone || selections.size > 0;
  return (
    <div className="group-card slide-in">
      <div className="group-header">
        <div className="group-icon-wrap" style={{ background: group.color }}>
          {Icon && <Icon size={22} strokeWidth={1.8} color="#1565C0" />}
        </div>
        <div>
          <div className="group-step-badge">Section {groupIndex + 1} of {total}</div>
          <div className="group-title">{group.title}</div>
        </div>
      </div>
      <p className="group-subtitle">{group.subtitle} <em>Select all that apply, or "None of these."</em></p>
      <div className="symptoms-grid">
        {group.symptoms.map(s => (
          <button
            key={s.key}
            className={`sym-pill ${selections.has(s.key) && !isNone ? 'selected' : ''}`}
            onClick={() => onToggle(group.id, s.key)}
          >
            <div className="sym-text-wrap">
              <div className="sym-name">{s.name}</div>
              <div className="sym-desc">{s.desc}</div>
            </div>
            <div className="sym-check">
              <CheckCircle2 size={14} strokeWidth={2.5} color="white" />
            </div>
          </button>
        ))}
      </div>
      <button className={`none-option ${isNone ? 'selected' : ''}`} onClick={() => onToggleNone(group.id)}>
        <BanIcon size={16} strokeWidth={2} color={isNone ? '#5C6BC0' : '#9CA3AF'} />
        <span className="none-name">None of these apply to me</span>
        <div className="sym-check" style={{ background: '#5C6BC0' }}>
          <CheckCircle2 size={14} strokeWidth={2.5} color="white" />
        </div>
      </button>
      <div className="nav-row">
        <button className="btn-back" onClick={onBack} disabled={isFirst}>
          <ChevronLeft size={14} strokeWidth={2.5} /> Back
        </button>
        <span className="nav-hint">{ready ? '✓ Ready to continue' : 'Select at least one option'}</span>
        <button className="btn-next" onClick={onNext} disabled={!ready}>
          {isLast ? 'Finish' : 'Next'} <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── Remedy Modal ──────────────────────────────────────────────────────────────
function RemedyModal({ disease, remedy, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">First Aid Remedy</span>
            <h2 className="modal-title">{disease}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} strokeWidth={2.5} /></button>
        </div>

        {/* Disclaimer — top of modal */}
        <div className="modal-disclaimer">
          <AlertTriangle size={18} color="#d97706" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>First Aid Only — Not Medical Treatment</strong>
            <p>
              These are basic self-care steps to provide temporary relief. They are
              not a substitute for professional medical diagnosis or treatment.
              Please consult a qualified dermatologist or doctor for proper care.
            </p>
          </div>
        </div>

        <div className="modal-section">
          <h4>Recommended Steps</h4>
          <ol className="remedy-steps">
            {remedy.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {remedy.avoid && (
          <div className="modal-section">
            <h4>What to Avoid</h4>
            <div className="remedy-avoid">
              <Ban size={16} color="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
              <p>{remedy.avoid}</p>
            </div>
          </div>
        )}

        {remedy.urgency && (
          <div className="remedy-urgency">
            <Hospital size={16} color="#059669" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
            <p>{remedy.urgency}</p>
          </div>
        )}

        <button className="modal-btn-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Detect() {
  const [step, setStep] = useState(0);

  const [mode, setMode] = useState('upload');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  const [curG, setCurG] = useState(0);
  const [groupSelections, setGroupSelections] = useState(() => Object.fromEntries(GROUPS.map(g => [g.id, new Set()])));
  const [noneSelected, setNoneSelected] = useState(() => Object.fromEntries(GROUPS.map(g => [g.id, false])));

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [remedy, setRemedy] = useState(null);
  const [remedyLoading, setRemedyLoading] = useState(false);
  const [showRemedy, setShowRemedy] = useState(false);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // Stop webcam stream on unmount
  useEffect(() => {
    const webcam = webcamRef.current;
    return () => {
      const stream = webcam?.video?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { setImageFile(file); setImage(URL.createObjectURL(file)); }
  };

  const stopCamera = useCallback(() => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    setCameraOn(false);
  }, []);

  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setImage(screenshot);
    fetch(screenshot).then(r => r.blob()).then(blob =>
      setImageFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
    );
    stopCamera();
  }, [stopCamera]);

  const handleToggle = (gid, key) => {
    setNoneSelected(prev => ({ ...prev, [gid]: false }));
    setGroupSelections(prev => {
      const next = new Set(prev[gid]);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, [gid]: next };
    });
  };

  const handleToggleNone = (gid) => {
    setNoneSelected(prev => ({ ...prev, [gid]: !prev[gid] }));
    if (!noneSelected[gid]) setGroupSelections(prev => ({ ...prev, [gid]: new Set() }));
  };

  const handleGNext = () => {
    if (curG < TOTAL_G - 1) setCurG(c => c + 1);
    else handleSubmit();
  };

  const handleGBack = () => {
    if (curG > 0) setCurG(c => c - 1);
    else setStep(0);
  };

  const buildPayload = () => {
    const payload = Object.fromEntries(ALL_FEATURES.map(k => [k, 0]));
    GROUPS.forEach(g => {
      if (!noneSelected[g.id]) groupSelections[g.id].forEach(k => { payload[k] = 1; });
    });
    return payload;
  };

  const handleSubmit = async () => {
    setStep(2);
    setLoading(true);
    setError('');
    setResult(null);
    setRemedy(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('symptoms', JSON.stringify(buildPayload()));

    try {
      const res = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error
        || (err.code === 'ERR_NETWORK' ? `Network error — cannot reach ${API_URL}. Check that backend is running and phone/PC are on the same Wi-Fi.`
        : err.code === 'ECONNREFUSED' ? 'Connection refused — backend is not running.'
        : err.message || 'Unknown error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRemedy = async () => {
    if (remedy) { setShowRemedy(true); return; }
    setRemedyLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/remedy/${encodeURIComponent(result.prediction)}`);
      setRemedy(res.data.remedy);
      setShowRemedy(true);
    } catch {
      // Fallback: show a generic message if disease not in lookup
      setRemedy({
        steps: ['Keep the area clean and dry.', 'Avoid scratching or irritating the skin.', 'Apply a gentle, fragrance-free moisturiser.'],
        avoid: 'Avoid harsh soaps and prolonged sun exposure.',
        urgency: 'Consult a dermatologist for a proper diagnosis and treatment plan.',
      });
      setShowRemedy(true);
    } finally {
      setRemedyLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0); setCurG(0);
    setGroupSelections(Object.fromEntries(GROUPS.map(g => [g.id, new Set()])));
    setNoneSelected(Object.fromEntries(GROUPS.map(g => [g.id, false])));
    setImage(null); setImageFile(null); setResult(null); setError('');
    stopCamera(); setRemedy(null); setShowRemedy(false);
  };

  const getSeverityColor = (c) => c >= 0.8 ? 'var(--danger)' : c >= 0.5 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="detect-page">
      <div className="detect-container">
        <div className="detect-header">
          <h1>Skin Disease Detection</h1>
          <p>Complete all steps for the most accurate AI-powered prediction</p>
        </div>

        <StepBar step={step} />

        {/* ── STEP 0: Image ── */}
        {step === 0 && (
          <div className="step-panel">
            <div className="mode-toggle">
              <button className={mode === 'upload' ? 'active' : ''} onClick={() => { setMode('upload'); stopCamera(); setImage(null); setImageFile(null); }}>
                <ImageUp size={15} strokeWidth={2} /> Upload Image
              </button>
              <button className={mode === 'camera' ? 'active' : ''} onClick={() => { setMode('camera'); setImage(null); setImageFile(null); }}>
                <Camera size={15} strokeWidth={2} /> Live Camera
              </button>
            </div>

            {mode === 'upload' ? (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                {image
                  ? <img src={image} alt="preview" className="preview-img" />
                  : <><div className="upload-icon"><FolderOpen size={40} color="var(--primary)" strokeWidth={1.5} /></div><p>Click or drag & drop an image here</p><span>Supports JPG, PNG, WEBP</span></>
                }
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            ) : (
              <div className="camera-zone">
                {isMobile ? (
                  /* ── Mobile: native camera input ── */
                  image ? (
                    <>
                      <img src={image} alt="captured" className="preview-img" />
                      <button className="btn-start-cam" onClick={() => { setImage(null); setImageFile(null); cameraInputRef.current?.click(); }}>
                        <RotateCcw size={14} strokeWidth={2} /> Retake
                      </button>
                    </>
                  ) : (
                    <div className="camera-placeholder">
                      <div className="upload-icon"><Video size={40} color="var(--primary)" strokeWidth={1.5} /></div>
                      <p>Tap to open camera</p>
                      <button className="btn-start-cam" onClick={() => cameraInputRef.current?.click()}>
                        <Camera size={14} strokeWidth={2} /> Open Camera
                      </button>
                    </div>
                  )
                ) : (
                  /* ── Desktop: react-webcam ── */
                  cameraOn ? (
                    <>
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="webcam-view"
                        videoConstraints={{ facingMode: 'user' }}
                        onUserMediaError={stopCamera}
                      />
                      <div className="camera-actions">
                        <button className="btn-capture" onClick={handleCapture}><Camera size={15} strokeWidth={2} /> Capture</button>
                        <button className="btn-cam-cancel" onClick={stopCamera}>Cancel</button>
                      </div>
                    </>
                  ) : image ? (
                    <>
                      <img src={image} alt="captured" className="preview-img" />
                      <button className="btn-start-cam" onClick={() => { setImage(null); setImageFile(null); setCameraOn(true); }}>
                        <RotateCcw size={14} strokeWidth={2} /> Retake
                      </button>
                    </>
                  ) : (
                    <div className="camera-placeholder">
                      <div className="upload-icon"><Video size={40} color="var(--primary)" strokeWidth={1.5} /></div>
                      <p>Camera is off</p>
                      <button className="btn-start-cam" onClick={() => setCameraOn(true)}>
                        <Camera size={14} strokeWidth={2} /> Start Camera
                      </button>
                    </div>
                  )
                )}
                {/* Hidden native camera input for mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            <div className="step-nav">
              <span />
              <button className="btn-next" disabled={!imageFile} onClick={() => setStep(1)}>
                Next: Symptoms →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Symptoms ── */}
        {step === 1 && (
          <div className="step-panel symptoms-panel">
            <div className="sym-progress">
              <div className="sym-prog-bar">
                <div className="sym-prog-fill" style={{ width: `${((curG + 1) / TOTAL_G) * 100}%` }} />
              </div>
              <span>{Math.round(((curG + 1) / TOTAL_G) * 100)}%</span>
            </div>
            <div className="sym-dots">
              {GROUPS.map((_, i) => (
                <div key={i} className={`sym-dot ${i < curG ? 'done' : i === curG ? 'active' : ''}`} />
              ))}
            </div>
            <GroupCard
              group={GROUPS[curG]}
              selections={groupSelections[GROUPS[curG].id]}
              isNone={noneSelected[GROUPS[curG].id]}
              onToggle={handleToggle}
              onToggleNone={handleToggleNone}
              groupIndex={curG}
              total={TOTAL_G}
              onBack={handleGBack}
              onNext={handleGNext}
              isFirst={curG === 0}
              isLast={curG === TOTAL_G - 1}
            />
          </div>
        )}

        {/* ── STEP 2: Results ── */}
        {step === 2 && (
          <div className="step-panel results-panel">
            {loading && (
              <div className="result-placeholder">
                <div className="big-spinner" />
                <p>Analyzing image and symptoms...</p>
              </div>
            )}

            {error && (
              <div className="error-box">
                <span>⚠️</span>
                <div>
                  <p>{error}</p>
                  <button className="btn-back" style={{ marginTop: '0.8rem' }} onClick={() => setStep(1)}>← Go Back</button>
                </div>
              </div>
            )}

            {result && (
              <div className="results-grid">
                {/* Left: prediction */}
                <div className="result-box">
                  <div className="result-top">
                    <h3>Analysis Complete</h3>
                    <span className="result-badge">AI Result</span>
                  </div>

                  <div className="primary-result">
                    <p className="result-label">Detected Condition</p>
                    <h2 className="result-disease">{result.prediction}</h2>
                    <div className="confidence-bar-wrap">
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{ width: `${(result.confidence * 100).toFixed(0)}%`, background: getSeverityColor(result.confidence) }} />
                      </div>
                      <span style={{ color: getSeverityColor(result.confidence) }}>
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {result.top_predictions && (
                    <div className="top-predictions">
                      <p className="result-label">Top Predictions</p>
                      {result.top_predictions.map((p, i) => (
                        <div className="pred-row" key={i}>
                          <span>{p.label}</span>
                          <div className="mini-bar"><div className="mini-fill" style={{ width: `${(p.confidence * 100).toFixed(0)}%` }} /></div>
                          <span className="pred-pct">{(p.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="disclaimer">
                    ⚠️ AI prediction for educational purposes only. Consult a dermatologist for medical advice.
                  </div>

                  {/* Action buttons */}
                  <div className="result-actions">
                    <button className="btn-remedy" onClick={handleShowRemedy} disabled={remedyLoading}>
                      {remedyLoading ? <span className="spinner-sm" /> : <Pill size={15} strokeWidth={2} />} Basic Remedy
                    </button>
                    <button className="btn-restart" onClick={handleReset}><RefreshCw size={14} strokeWidth={2} /> New Analysis</button>
                  </div>
                </div>

                {/* Right: symptom summary */}
                <div className="sym-summary">
                  <h3>Symptom Summary</h3>
                  <div className="sym-summary-list">
                    {GROUPS.map((g, i) => {
                      const keys = noneSelected[g.id] ? [] : [...groupSelections[g.id]];
                      return (
                        <div className="sym-sum-item" key={g.id}>
                          <span className="sym-sum-num">S{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <p className="sym-sum-q">{g.title}</p>
                            <p className="sym-sum-a">
                              {noneSelected[g.id] ? 'None' : keys.length ? keys.map(k => k.replace(/_/g, ' ')).join(', ') : '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Remedy Modal ── */}
      {showRemedy && remedy && (
        <RemedyModal
          disease={result?.prediction}
          remedy={remedy}
          onClose={() => setShowRemedy(false)}
        />
      )}
    </div>
  );
}
