import os
import json
import numpy as np
from PIL import Image
import io
try:
    import pillow_avif
except ImportError:
    pass

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'image_model')
CLASS_INDICES_PATH = os.path.join(MODELS_DIR, 'class_indices.json')
IMAGE_SIZE = (160, 160)

# ── Symptom weights per disease ───────────────────────────────────────────────
# Each disease maps binary feature keys → weight (positive = supports, negative = contradicts).
# Weights reflect clinical relevance of each symptom to the disease.
SYMPTOM_WEIGHTS = {
    'Acne': {
        'pus':                    0.90,  # pustules are hallmark of acne
        'rash':                   0.55,
        'skin_dryness':           0.30,
        'itching':               -0.20,  # acne is rarely itchy
        'fever':                 -0.60,
        'blisters':              -0.50,
        'scaling':               -0.30,
        'swollen_lymph_nodes':   -0.40,
        'localized':              0.60,  # typically face/back
        'chronic':                0.40,
    },
    'Chickenpox': {
        'blisters':               0.95,  # fluid-filled vesicles are defining
        'lesion_stage_variation': 0.90,  # crops of lesions at different stages
        'itching':                0.85,
        'fever':                  0.80,
        'rash':                   0.70,
        'fatigue':                0.60,
        'headache':               0.50,
        'localized':             -0.50,  # chickenpox is widespread
        'nail_changes':          -0.40,
        'scaling':               -0.30,
        'chronic':               -0.70,  # acute illness
    },
    'Healthy': {
        'rash':                  -0.80,
        'blisters':              -0.90,
        'pus':                   -0.85,
        'scaling':               -0.70,
        'itching':               -0.75,
        'pain':                  -0.70,
        'fever':                 -0.80,
        'swollen_lymph_nodes':   -0.80,
        'skin_dryness':          -0.40,
        'chronic':               -0.60,
    },
    'Measles': {
        'rash':                   0.75,
        'fever':                  0.95,  # high fever is almost always present
        'cough':                  0.95,  # cough is part of the classic triad
        'runny_nose':             0.90,  # runny nose is part of the classic triad
        'red_eyes':               0.95,  # conjunctivitis is the most specific sign
        'fatigue':                0.65,
        'headache':               0.55,
        'lesion_stage_variation': 0.30,
        # Strong contradictors — these are psoriasis/chronic markers, not measles
        'scaling':               -0.90,  # measles does NOT cause scaling
        'nail_changes':          -0.95,  # nail changes never occur in measles
        'chronic':               -0.95,  # measles is always acute, never chronic
        'blisters':              -0.70,  # measles rash is macular, not blistered
        'pus':                   -0.60,
        'localized':             -0.60,  # measles rash is widespread
        'skin_dryness':          -0.50,
    },
    'Monkeypox': {
        'blisters':               0.90,
        'pus':                    0.75,
        'lesion_stage_variation': 0.85,
        'fever':                  0.90,
        'swollen_lymph_nodes':    0.95,  # most distinguishing vs chickenpox
        'fatigue':                0.70,
        'headache':               0.65,
        'rash':                   0.70,
        'itching':                0.60,
        'pain':                   0.65,
        'chronic':               -0.50, 
    },
    'Psoriasis': {
        'scaling':                0.98,  # silver-white scales are the hallmark
        'nail_changes':           0.95,  # nail pitting is highly specific to psoriasis
        'chronic':                0.95,  # lifelong relapsing — never acute
        'skin_dryness':           0.80,
        'itching':                0.70,
        'localized':              0.70,  # elbows, knees, scalp — well-defined patches
        'pain':                   0.45,
        'rash':                   0.50,
        # Strong contradictors — these are measles/infectious markers, not psoriasis
        'fever':                 -0.90,  # psoriasis does NOT cause fever
        'cough':                 -0.95,  # no respiratory involvement in psoriasis
        'runny_nose':            -0.95,  # no respiratory involvement in psoriasis
        'red_eyes':              -0.80,  # no conjunctivitis in psoriasis
        'blisters':              -0.70,  # psoriasis is plaques, not blisters
        'swollen_lymph_nodes':   -0.60,
        'lesion_stage_variation':-0.50,  # psoriasis plaques are uniform, not staged
    },
    'Random': {
        'rash':                   0.40,
        'skin_dryness':           0.35,
        'itching':                0.30,
        'chronic':                0.30,
        'localized':              0.35,
    },
}

# ── Remedies per disease ──────────────────────────────────────────────────────
REMEDIES = {
    'Acne': {
        'steps': [
            'Wash the affected area twice daily with a gentle, non-comedogenic cleanser.',
            'Apply a thin layer of over-the-counter benzoyl peroxide (2.5–5%) or salicylic acid gel.',
            'Avoid touching or picking at spots to prevent scarring and spreading.',
            'Use oil-free, non-comedogenic moisturiser and SPF 30+ sunscreen daily.',
            'Change pillowcases every 2–3 days and keep hair clean and off the face.',
        ],
        'avoid': 'Avoid heavy makeup, oily products, and squeezing pimples.',
        'urgency': 'See a dermatologist if acne is severe, cystic, or leaves scars.',
    },
    'Chickenpox': {
        'steps': [
            'Keep the patient isolated to prevent spreading to others.',
            'Apply calamine lotion to itchy blisters to soothe irritation.',
            'Take lukewarm oatmeal baths to relieve itching.',
            'Use paracetamol (not aspirin) for fever and discomfort.',
            'Keep fingernails short and clean to prevent scratching and infection.',
        ],
        'avoid': 'Avoid aspirin, scratching blisters, and contact with pregnant women or immunocompromised individuals.',
        'urgency': 'Seek immediate medical help if high fever, difficulty breathing, or blisters near eyes develop.',
    },
    'Healthy': {
        'steps': [
            'No treatment needed — your skin appears healthy.',
            'Maintain a daily routine: gentle cleanser, moisturiser, and SPF 30+ sunscreen.',
            'Stay hydrated and eat a balanced diet rich in vitamins A, C, and E.',
            'Avoid prolonged sun exposure and use protective clothing outdoors.',
        ],
        'avoid': 'Avoid harsh scrubs, over-washing, and skipping sunscreen.',
        'urgency': 'Schedule a routine skin check with a dermatologist once a year.',
    },
    'Measles': {
        'steps': [
            'Rest in a well-ventilated room and stay hydrated with fluids.',
            'Use paracetamol to manage fever and body aches.',
            'Keep the room dimly lit if eyes are sensitive to light.',
            'Apply a cool, damp cloth to the forehead for comfort.',
            'Isolate the patient for at least 4 days after the rash appears.',
        ],
        'avoid': 'Avoid contact with unvaccinated individuals, especially infants and pregnant women.',
        'urgency': 'Seek urgent medical care if breathing difficulty, severe headache, or confusion occurs.',
    },
    'Monkeypox': {
        'steps': [
            'Isolate immediately and contact a healthcare provider.',
            'Keep skin lesions clean and covered with dry bandages.',
            'Use paracetamol for fever and pain relief.',
            'Avoid touching lesions and wash hands frequently with soap.',
            'Do not share towels, bedding, or clothing with others.',
        ],
        'avoid': 'Avoid close skin-to-skin contact, scratching lesions, and sharing personal items.',
        'urgency': 'Seek immediate medical attention — monkeypox is a notifiable disease requiring professional care.',
    },
    'Psoriasis': {
        'steps': [
            'Moisturise the skin frequently with thick, fragrance-free creams or ointments.',
            'Apply over-the-counter hydrocortisone cream (1%) to reduce mild inflammation.',
            'Take short, lukewarm baths with colloidal oatmeal or Epsom salts.',
            'Expose affected areas to brief, controlled sunlight (10–15 min/day).',
            'Identify and avoid personal triggers such as stress, alcohol, or certain medications.',
        ],
        'avoid': 'Avoid hot water, harsh soaps, alcohol, smoking, and skin injuries.',
        'urgency': 'Consult a dermatologist for prescription treatments if patches are widespread or painful.',
    },
    'Random': {
        'steps': [
            'Keep the affected area clean and avoid irritating it further.',
            'Apply a gentle, fragrance-free moisturiser to soothe the skin.',
            'Avoid scratching or picking at the area.',
            'Monitor for changes in size, colour, or texture.',
        ],
        'avoid': 'Avoid harsh soaps, prolonged sun exposure, and self-diagnosis.',
        'urgency': 'Consult a dermatologist for a proper diagnosis if the condition persists or worsens.',
    },
}
# ─────────────────────────────────────────────────────────────────────────────


def load_model():
    """Load the Keras model and read labels from class_indices.json."""
    # Load labels from class_indices.json (sorted by index value)
    try:
        with open(CLASS_INDICES_PATH, 'r') as f:
            class_indices = json.load(f)
        labels = [k for k, v in sorted(class_indices.items(), key=lambda x: x[1])]
        print(f"[INFO] Labels loaded: {labels}")
    except Exception as e:
        print(f"[ERROR] Could not load class_indices.json: {e}")
        return None, []

    # Load Keras model (directory-based .keras format)
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[INFO] Keras model loaded from {MODEL_PATH}")
        return model, labels
    except Exception as e:
        print(f"[ERROR] Failed to load Keras model: {e}")
        return None, labels


def preprocess_image(file_storage):
    """Resize and preprocess image using MobileNetV2's expected input range [-1, 1]."""
    file_storage.seek(0)
    img_bytes = file_storage.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img = img.resize(IMAGE_SIZE)
    arr = np.array(img, dtype=np.float32)
    # MobileNetV2 preprocess_input: scales pixels from [0, 255] to [-1, 1]
    arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, axis=0)


def apply_symptom_boost(probs, labels, symptoms):
    """
    Re-rank image probabilities using binary symptom feature weights.

    For each disease, compute a weighted symptom score by summing
    weight * feature_value for every feature present in SYMPTOM_WEIGHTS.
    Positive weights support the disease; negative weights contradict it.
    The symptom score is then blended with the image probability:
        final = IMAGE_WEIGHT * image_prob + SYMPTOM_WEIGHT * symptom_score
    """
    IMAGE_WEIGHT = 0.70
    SYMPTOM_WEIGHT = 0.30

    sym_scores = np.zeros(len(labels), dtype=float)

    for i, label in enumerate(labels):
        weights = SYMPTOM_WEIGHTS.get(label, {})
        if not weights:
            sym_scores[i] = 0.0
            continue
        score = sum(
            w * float(symptoms.get(feat, 0))
            for feat, w in weights.items()
        )
        sym_scores[i] = score

    # Shift so minimum is 0, then normalise to [0, 1]
    s_min = sym_scores.min()
    sym_scores -= s_min
    s_max = sym_scores.max()
    if s_max > 0:
        sym_scores /= s_max

    blended = IMAGE_WEIGHT * np.array(probs) + SYMPTOM_WEIGHT * sym_scores
    blended = np.clip(blended, 0, None)
    blended /= blended.sum()
    return blended


def predict(model, labels, file_storage, symptoms: dict) -> dict:
    """Run Keras inference, then blend with symptom scores."""
    file_storage.seek(0)
    img_input = preprocess_image(file_storage)
    raw_probs = model.predict(img_input, verbose=0)[0]

    probs = apply_symptom_boost(raw_probs, labels, symptoms) if symptoms else np.array(raw_probs, dtype=float)

    sorted_idx = np.argsort(probs)[::-1]
    top_idx = int(sorted_idx[0])

    return {
        'prediction': labels[top_idx],
        'confidence': float(probs[top_idx]),
        'top_predictions': [
            {'label': labels[i], 'confidence': float(probs[i])}
            for i in sorted_idx[:5]
        ],
    }
