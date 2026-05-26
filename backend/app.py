from flask import Flask, request, jsonify
from flask_cors import CORS
from model_loader import load_model, predict, REMEDIES
import json
import os

app = Flask(__name__)
CORS(app)

# Load Keras model + labels once at startup
model, labels = load_model()


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'labels': labels,
    })


@app.route('/api/predict', methods=['POST'])
def predict_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    image_file.seek(0)
    raw = image_file.read()
    print(f"[DEBUG] filename={image_file.filename} content_type={image_file.content_type} bytes={len(raw)}")
    print(f"[DEBUG] first 16 bytes={raw[:16]}")
    image_file.seek(0)

    symptoms_raw = request.form.get('symptoms', '{}')
    try:
        symptoms = json.loads(symptoms_raw)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid symptoms data'}), 400

    if model is None:
        return jsonify({'error': 'Model not loaded. Check backend/models/image_model.keras exists.'}), 503

    print(f"[INFO] Image: {image_file.filename} | Symptoms keys: {list(symptoms.keys())}")

    try:
        result = predict(model, labels, image_file, symptoms)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/remedy/<disease>', methods=['GET'])
def remedy_route(disease):
    key = disease.strip().lower()
    remedy = next((v for k, v in REMEDIES.items() if k.lower() == key), None)
    if remedy is None:
        return jsonify({'error': f'No remedy found for: {disease}'}), 404
    return jsonify({'disease': disease, 'remedy': remedy})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
