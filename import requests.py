import requests

# Fetch the uploaded file path from the Flask API or localStorage
def get_uploaded_cv_path():
    try:
        # Replace this with the actual API endpoint if needed
        response = requests.get("http://127.0.0.1:5000/uploaded-file-path")
        if response.status_code == 200:
            return response.json().get("pdf_path")
        else:
            print("Error fetching uploaded CV path:", response.text)
            return None
    except Exception as e:
        print("Error connecting to the API:", e)
        return None

# Get the uploaded CV path
cv_path = get_uploaded_cv_path()

if cv_path:
    print(f"Using uploaded CV: {cv_path}")
    model_score(cv_path)
else:
    print("No uploaded CV found. Please upload a file.")