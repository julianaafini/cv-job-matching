from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

uploaded_file_path = None

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_file_path
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(pdf_path)
    uploaded_file_path = pdf_path
    return jsonify({'pdf_path': pdf_path}), 200

@app.route('/uploaded-file-path', methods=['GET'])
def get_uploaded_file_path():
    if uploaded_file_path:
        return jsonify({'pdf_path': uploaded_file_path}), 200
    else:
        return jsonify({'error': 'No file uploaded yet'}), 404

@app.route('/run-model', methods=['POST'])
def run_model():
    from model import model_score
    cv_path = uploaded_file_path
    if not cv_path:
        return jsonify({'error': 'No CV uploaded'}), 400
    try:
        filters = request.get_json().get("filters", {})  # <-- Get filters dict from request
        results = model_score(cv_path, filters)  # <-- Pass filters to model_score
        print("Jobs JSON:", results)
        return jsonify({'jobs': results}), 200
    except Exception as e:
        print("Error in run-model:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "Flask API is running!"

if __name__ == '__main__':
    app.run(debug=True)