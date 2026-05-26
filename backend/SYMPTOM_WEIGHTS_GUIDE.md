# Symptom Weighting System

## Overview
The model now uses **symptom-weighted prediction blending** to improve accuracy by combining:
- **65% Image CNN prediction** (MobileNetV2)
- **35% Symptom-based scoring** (clinical feature weights)

## How It Works

### 1. Binary Feature Input
The frontend sends 18 binary features (0 or 1):
```json
{
  "fever": 1,
  "itching": 1,
  "rash": 1,
  "blisters": 0,
  "pus": 0,
  "scaling": 0,
  "pain": 0,
  "fatigue": 1,
  "headache": 0,
  "cough": 0,
  "runny_nose": 0,
  "red_eyes": 0,
  "swollen_lymph_nodes": 0,
  "skin_dryness": 0,
  "lesion_stage_variation": 0,
  "chronic": 0,
  "localized": 1,
  "nail_changes": 0
}
```

### 2. Disease-Specific Weights
Each disease has a weight map where:
- **Positive weights** (0.0 to 1.0) = symptom supports this disease
- **Negative weights** (-1.0 to 0.0) = symptom contradicts this disease

Example for **Chickenpox**:
```python
'Chickenpox': {
    'blisters':               0.95,  # Highly indicative
    'lesion_stage_variation': 0.90,  # Multiple stages of lesions
    'itching':                0.85,
    'fever':                  0.80,
    'chronic':               -0.70,  # Chickenpox is acute, not chronic
    'localized':             -0.50,  # Chickenpox is widespread
}
```

### 3. Scoring Algorithm
For each disease:
1. **Compute raw symptom score**: `Σ(weight × feature_value)` for all features
2. **Normalize scores** to [0, 1] range across all diseases
3. **Blend with image prediction**: `0.65 × image_prob + 0.35 × symptom_score`
4. **Re-normalize** final probabilities to sum to 1.0

### 4. Clinical Rationale

#### Acne
- **Strong positive**: `pus` (0.90), `localized` (0.60)
- **Strong negative**: `fever` (-0.60), `blisters` (-0.50)
- Rationale: Acne presents with pustules on face/back, no systemic symptoms

#### Chickenpox
- **Strong positive**: `blisters` (0.95), `lesion_stage_variation` (0.90), `itching` (0.85), `fever` (0.80)
- **Strong negative**: `chronic` (-0.70), `localized` (-0.50)
- Rationale: Acute viral illness with widespread itchy vesicles at different stages

#### Measles
- **Strong positive**: `fever` (0.90), `rash` (0.85), `cough` (0.80), `red_eyes` (0.80)
- **Strong negative**: `chronic` (-0.70), `blisters` (-0.50)
- Rationale: Classic triad of fever, cough, conjunctivitis + maculopapular rash

#### Monkeypox
- **Strong positive**: `swollen_lymph_nodes` (0.95), `fever` (0.90), `blisters` (0.90), `lesion_stage_variation` (0.85)
- Rationale: Lymphadenopathy distinguishes it from chickenpox

#### Psoriasis
- **Strong positive**: `scaling` (0.95), `chronic` (0.90), `nail_changes` (0.85), `skin_dryness` (0.80)
- **Strong negative**: `fever` (-0.50), `blisters` (-0.60)
- Rationale: Chronic condition with silver scales, nail pitting, no systemic symptoms

#### Healthy
- **Strong negative**: All pathological features have negative weights
- Rationale: Absence of symptoms supports healthy classification

## Tuning the Weights

### Adjusting Blend Ratio
In `model_loader.py`, modify:
```python
IMAGE_WEIGHT = 0.65    # Increase for more reliance on image
SYMPTOM_WEIGHT = 0.35  # Increase for more reliance on symptoms
```

### Adjusting Feature Weights
Edit `SYMPTOM_WEIGHTS` dictionary:
- Increase weight (0.0 → 1.0) for stronger positive association
- Decrease weight (0.0 → -1.0) for stronger negative association
- Remove feature from dict if it's not relevant to that disease

### Example: Making fever more important for Measles
```python
'Measles': {
    'fever': 0.95,  # Changed from 0.90
    # ... other weights
}
```

## Testing Impact
To test symptom weighting effectiveness:
1. Upload same image twice
2. First time: select no symptoms
3. Second time: select disease-specific symptoms
4. Compare confidence scores and top predictions

Expected: Confidence should increase when symptoms match the disease.

## Disabling Symptom Weighting
To use image-only prediction, modify `predict()` in `model_loader.py`:
```python
probs = np.array(raw_probs, dtype=float)  # Skip symptom blending
```
