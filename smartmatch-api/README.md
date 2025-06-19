### Step 1: Install Flask

If you haven't already, you need to install Flask. You can do this using pip:

```bash
pip install Flask
```

### Step 2: Create the Flask API

Create a new Python file (e.g., `app.py`) and add the following code:

```python
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Define the upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file to the upload folder
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(pdf_path)

    # Here you can set the pdf_path variable to the uploaded file path
    # For example, you can return it in the response
    return jsonify({'pdf_path': pdf_path}), 200

if __name__ == '__main__':
    app.run(debug=True)
```

### Step 3: Run the Flask Application

Run the Flask application by executing the following command in your terminal:

```bash
python app.py
```

### Step 4: Upload a PDF File

You can use a tool like Postman or cURL to test the file upload. Here’s an example using cURL:

```bash
curl -X POST -F "file=@/path/to/your/CV.pdf" http://127.0.0.1:5000/upload
```

### Step 5: Integrate with Your SmartMatch Page

In your SmartMatch page, you will need to create a form that allows users to upload their PDF files. The form should send a POST request to the `/upload` endpoint.

Here’s a simple HTML form example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartMatch Upload</title>
</head>
<body>
    <h1>Upload Your CV</h1>
    <form action="http://127.0.0.1:5000/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept=".pdf" required>
        <button type="submit">Upload</button>
    </form>
</body>
</html>
```

### Summary

This setup allows users to upload a PDF file, which is then saved on the server. The `pdf_path` variable is set to the path of the uploaded file, and you can use this path in your existing code to extract text from the uploaded CV. Make sure to handle any necessary security measures, such as validating file types and sizes, in a production environment.