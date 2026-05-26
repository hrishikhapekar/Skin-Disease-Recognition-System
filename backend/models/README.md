# models/

Place your trained pickle model files here.

## Expected filename
`skin_disease_model.pkl`

## How to change the model
Open `backend/model_loader.py` and update `MODEL_CONFIG`:

```python
MODEL_CONFIG = {
    'model_file': 'your_model_name.pkl',   # filename of your .pkl file
    'labels': ['Class1', 'Class2', ...],   # class labels in training order
    'image_size': (224, 224),              # (width, height) expected by model
}
```

## Preprocessing
If your model needs different preprocessing (e.g., flatten for sklearn, different normalization),
edit the `preprocess_image()` function in `model_loader.py`.
