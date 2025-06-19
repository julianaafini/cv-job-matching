import re
import fitz
import nltk
from nltk.stem import PorterStemmer, WordNetLemmatizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import os
from rapidfuzz import process, fuzz
import google.generativeai as genai
from transformers import pipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the model ONCE when the module is imported
print("Loading SentenceTransformer model (this may take a while the first time)...")
model1 = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
ner_skills = pipeline("ner", model="algiraldohe/lm-ner-linkedin-skills-recognition", aggregation_strategy="simple")
print("Model loaded.")

def model_score(CV_path, filters=None):
    print("Opening PDF...")
    doc = fitz.open(CV_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    extracted_text = text.strip()

    phone_pattern = r"\+?\d[\d -]{8,12}\d"
    url_pattern = r"(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
    linkedin_pattern = r"linkedin\.com/in/\w+"
    name = "Finn"

    text = re.sub(phone_pattern, "", text)
    text = re.sub(url_pattern, "", text)
    text = re.sub(linkedin_pattern, "", text)
    text = re.sub(name, "", text)
    text = re.sub(name, "", text)

    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = " ".join(text.split())
    tokens = nltk.word_tokenize(text)

    porter = PorterStemmer()
    stemmed_tokens = [porter.stem(w) for w in tokens]
    lemmatizer = WordNetLemmatizer()
    lemmatized_tokens = [lemmatizer.lemmatize(w) for w in stemmed_tokens]
    preprocessed_text = ' '.join(lemmatized_tokens)
    processed_CV_text = preprocessed_text

    print("Reading jobs CSV...")
    merged_jobs = pd.read_csv(os.path.join(BASE_DIR, 'data', 'merged_jobs.csv'))
    
    print("Loading embeddings...")
    job_embeddings_model1 = np.load(os.path.join(BASE_DIR, 'data', 'job_embeddings_model1.npy'))
    
    print("Encoding job descriptions...")
    cv_embedding_model1 = model1.encode(processed_CV_text)
    similarities_model1 = cosine_similarity(job_embeddings_model1, cv_embedding_model1.reshape(1, -1))
    merged_jobs['score_model1'] = similarities_model1.flatten()
    
    print("Identifying skills in CV...")
    cv_skills = list(set(ent["word"] for ent in ner_skills(extracted_text) if ent["entity_group"] in ["TECHNOLOGY", "TECHNICAL", "SOFT"] and ent["word"].lower() != "doe"))

    print("Calculating skills score...")
    cv_skills_set = set(cv_skills)
    merged_jobs['skills'] = merged_jobs['skills'].apply(
        lambda x: [skill.strip("'[]") for skill in x.split(', ')] if isinstance(x, str) else []
    )
    merged_jobs['skills_score'] = merged_jobs['skills'].map(lambda job_skills: len(set(cv_skills) & set(job_skills)) / len(set(job_skills)) if job_skills else 0.0)

    print("Calculating weighted score...")
    merged_jobs["weighted_score"] = 0.9 * merged_jobs["score_model1"] + 0.1 * merged_jobs["skills_score"]

    merged_jobs_final = merged_jobs.drop_duplicates(subset=['job_url'], keep='first')

    # Use filters dict to filter jobs as needed
    # Apply filters to merged_jobs_final
    if filters:

        # 1. score_model1 range (matchScoreFilter: [min, max], values are 0-100)
        if filters.get("matchScoreFilter"):
            min_score, max_score = filters["matchScoreFilter"]
            merged_jobs_final = merged_jobs_final[
                (merged_jobs_final["weighted_score"] * 100 >= min_score) &
                (merged_jobs_final["weighted_score"] * 100 <= max_score)
            ]
            print(f"After matchScoreFilter: {len(merged_jobs_final)} jobs")

        # 2. jobType (if not "all")
        if filters.get("jobType") and filters["jobType"].lower() != "all":
            merged_jobs_final = merged_jobs_final[
                merged_jobs_final["jobType"].str.lower() == filters["jobType"].lower()
            ]
            print(f"After jobType filter: {len(merged_jobs_final)} jobs")
        
        # 3. remoteOnly (True means is_remote == 1)
        if filters.get("remoteOnly"):
            merged_jobs_final = merged_jobs_final[merged_jobs_final["is_remote"] == 1]
            print(f"After remoteOnly filter: {len(merged_jobs_final)} jobs")
        
        # 4. experienceLevel (if not "all")
        if filters.get("experienceLevel") and filters["experienceLevel"].lower() != "all":
            merged_jobs_final = merged_jobs_final[
                merged_jobs_final["jobLevel"].str.lower() == filters["experienceLevel"].lower()
            ]
            print(f"After experienceLevel filter: {len(merged_jobs_final)} jobs")
        
        # 5. salary range (salary: [min, max], filter by salarySim bucket)
        if filters.get("salary"):
            min_salary, max_salary = filters["salary"]
            def salary_in_range(salary_sim):
                import re
                if not isinstance(salary_sim, str):
                    return False
                # Extract all numbers and K/M suffixes
                matches = re.findall(r"\d+(?:,\d+)?(?:[kKmM])?", salary_sim)
                numbers = []
                for s in matches:
                    num = int(re.sub(r"[^\d]", "", s))
                    if "k" in s.lower():
                        num *= 1000
                    if "m" in s.lower():
                        num *= 1000000
                    numbers.append(num)
                if not numbers:
                    return False
                max_val = max(numbers)
                min_val = min(numbers)
                # Accept if any part of the range overlaps with user range
                return (min_val <= max_salary and max_val >= min_salary)
            merged_jobs_final = merged_jobs_final[merged_jobs_final["salarySim"].apply(salary_in_range)]
            print(f"After salary filter: {len(merged_jobs_final)} jobs")
        
        # 6. locations (country column)
        if filters.get("locations") and len(filters["locations"]) > 0:
            merged_jobs_final = merged_jobs_final[
            merged_jobs_final["country"].isin(filters["locations"])
            ]
            print(f"After locations filter: {len(merged_jobs_final)} jobs")
        else:
            # If no options are selected, provide no results
            merged_jobs_final = merged_jobs_final.iloc[0:0]
            print("No options selected, providing no results.")
        
        # 7. industries (industry column, can be multiple)
        if filters.get("industries") and len(filters["industries"]) > 0:
            merged_jobs_final = merged_jobs_final[
            merged_jobs_final["industry"].isin(filters["industries"])
            ]
            print(f"After industries filter: {len(merged_jobs_final)} jobs")
        else:
            # If no options are selected, provide no results
            merged_jobs_final = merged_jobs_final.iloc[0:0]
            print("No options selected, providing no results.")

        # 8. companySize (size column, if not "all")
        if filters.get("companySize") and filters["companySize"].lower() != "all":
            size_map = {
                "startup": "Startup (1-50)",
                "midsize": "Mid-size (51-500)",
                "large": "Large (500+)"
            }
            size_value = size_map.get(filters["companySize"].lower())
            if size_value:
                merged_jobs_final = merged_jobs_final[merged_jobs_final["size"] == size_value]

    top5_jobs = merged_jobs_final.sort_values(by='weighted_score', ascending=False).head(5)
    
    # Ensure skills are split into lists of words
    top5_jobs['matchedSkills'] = top5_jobs.apply(
        lambda row: [skill.title() for skill in row['skills'] if skill in cv_skills], axis=1)

    top5_jobs['missingSkills'] = top5_jobs.apply(
        lambda row: [skill.title() for skill in row['skills'] if skill not in cv_skills], axis=1)
    
    print("Setting up Gemini API...")
    is_api_key_configured = False

    try:
        # Attempt to get the API key from an environment variable
        # Switch back to secret instead of hardcoded API key for final submission
        gemini_api_key = 'AIzaSyDDhgYMcWY42RyjZvjT5z1AJrCLY29TCiI'
        genai.configure(api_key=gemini_api_key)
        is_api_key_configured = True

        print("Gemini API Key configured successfully from environment variable.")
    except KeyError:
        print("--------------------------------------------------------------------------------")
        print("🚨 GEMINI_API_KEY environment variable not found.")
        print("🚨 Please try one of the following options:")
        print("🚨 OPTION 1 (Recommended): Set an environment variable or Colab Secret named GEMINI_API_KEY.")
        print("🚨 OPTION 2 (For quick testing, less secure):")
        print("🚨   In the next code cell, uncomment the lines and replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key.")
        print("🚨 Get an API key from Google AI Studio: https://aistudio.google.com/app/apikey")
        print("--------------------------------------------------------------------------------")
    
    generation_config = {
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,}
    
    if is_api_key_configured:
        try:
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash-preview-04-17",
                generation_config=generation_config,
                # safety_settings=... # Optional: configure safety settings if needed
            )
            print(f"Gemini model '{model.model_name}' initialized successfully.")
        except Exception as e:
            print(f"🚨 Error initializing Gemini model: {e}")
            print("🚨 This can happen if the API key is invalid, not authorized for the model, or if there are network issues.")
            print("🚨 Please double-check your API key and its permissions in Google AI Studio.")
    else:
        print("🚨 Skipping model initialization because the API key was not configured.")
    
    def gemini_generation(prompt_template, CV_text, top_5_job, model_instance):
        """Generate an output based on a prompt and an input document using Gemini."""
        if not model_instance:
            print("Error: Gemini model is not initialized.")
            return None

        full_prompt = prompt_template.replace("[CV]", CV_text)
        full_prompt = full_prompt.replace("[TOP_5_JOB]", top_5_job)

        try:
            response = model_instance.generate_content(full_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error during Gemini API call for CV '{CV_text[:50]}...': {e}")
            print(f"Or Error during Gemini API Call for top 5 jobs")
            return None  # Return None or raise error for more robust handling
    
    prompt_template = """Write a semantic fit analysis between the following CV and job description.

    Format your answer as follows (do not include any introduction or summary) and it should only two bullet points for each.:

    **Semantic Fit between CV and Job Description:**
    - [bullet point 1]
    - [bullet point 2]

    **Skills/Experience to Consider Including (If Applicable):**
    - [bullet point 1]
    - [bullet point 2]

    **Disclaimer:**
    - We do not condone faking experiences in your CV just to get a better match. Only include skills and experience you genuinely possess.
    CV: '[CV]'
    Job Description: '[TOP_5_JOB]'
    """
    def clean_semantic_fit_output(text):
        # Remove any leading intro like "Here is the semantic fit analysis and suggestions:"
        text = re.sub(r"^.*?(?=\*\*Semantic Fit between CV and Job Description:)", "", text, flags=re.DOTALL)
        # Ensure each bullet point starts with '- ' (sometimes Gemini uses '* ')
        text = text.replace("* ", "- ")
        # Remove extra whitespace
        text = text.strip()
        return text

    print("Generating semantic fit...")
    top5_jobs['semanticFit'] = top5_jobs.apply(
        lambda row: clean_semantic_fit_output(
            gemini_generation(prompt_template, extracted_text, row['description_en'], model)
        ),
        axis=1
    )
    
    top5_jobs['confidenceLevel'] = np.nan
    top_jobs_output = top5_jobs[['title_en', 'company', 'location', 'is_remote', 'weighted_score', 'matchedSkills', 'missingSkills', 'description_en', 'postedDate', 'jobType', 'jobLevel', 'salarySim', 'semanticFit', 'confidenceLevel', 'job_url']]

    # Convert DataFrame to list of dicts for JSON serialization
    return top_jobs_output.fillna("").to_dict(orient="records")

