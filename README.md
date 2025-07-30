# SmartMatch: AI-Powered CV & Job Description Matcher
SmartMatch is an AI system designed to streamline the job application process by automatically comparing a candidate's CV with business analicts job descriptions to identify the best-fit positions. This project leverages a combination of semantic similarity using sentence embeddings and skill-level matching via Named Entity Recognition (NER).

## 1. Project Summary
In today's competitive job market, efficiently finding the right opportunities is crucial. SmartMatch addresses this challenge by providing an automated, data-driven approach to match candidates with jobs. It helps both job seekers quickly pinpoint relevant roles and recruiters efficiently screen applications.

<img width="1864" height="709" alt="image" src="https://github.com/user-attachments/assets/a2e9a341-cd3f-4da3-85ed-d160859ecedf" />

## 2. Key Features
#### 2.1. CV Upload: SmartMatch allows to directly upload a CV (PDF format), and the system automatically extracts relevant information.
<img width="1797" height="875" alt="image" src="https://github.com/user-attachments/assets/3173bcbc-128a-4061-9b82-e7de969833a3" />


#### 2.2. Customizable Job Preferences & Filters: Tailor the job search by applying filters for specific preferences such as:
- Job Type: (e.g., Full-time, Part-time, Contract)
- Experience Level: (e.g., Entry-level, Mid-senior, Director)
- Salary Range: Define desired compensation.
- Country: Specify preferred geographical locations.
- Industry: Focus on industries that align with your career goals.
- Company Size: Target companies based on their employee count.
<img width="1803" height="873" alt="image" src="https://github.com/user-attachments/assets/bd1e9499-51be-428c-af5d-2bb1da1a8275" />


#### 2.3. Complete job search platform with tailored features:
<img width="1805" height="874" alt="image" src="https://github.com/user-attachments/assets/64759f4c-b064-48c8-b03a-02de66815603" />



- Semantic Similarity Matching: Utilizes sentence transformers to understand the contextual relevance between CVs and job descriptions.
- Skill-Level Matching with NER: Employs a fine-tuned NER model to extract and compare specific skills.
- Weighted Scoring: Combines semantic and skill-based scores with customizable weights to prioritize different aspects of the match.
- Comprehensive Feedback: Generates AI-powered written feedback to help candidates optimize their CVs.
<img width="1803" height="870" alt="image" src="https://github.com/user-attachments/assets/2cc45764-a6e0-40f9-8450-e43700ce0e88" />


## 3. Pipeline Overview
1. Library Setup: Imports essential libraries including pandas, transformers, scikit-learn, and supporting NLP/embedding utilities.
2. Model Loading: Loads a pre-trained SentenceTransformer model (all-MiniLM-L6-v2 or similar) for generating dense vector embeddings.
3. Data Loading:
- Loads job descriptions from a CSV file.
- Extracts text from a user-uploaded CV (PDF format).
4. Embedding Generation: Computes vector embeddings for both the extracted CV text and each job description using the loaded SentenceTransformer.
5. Semantic Scoring: Calculates cosine similarity between the CV vector and each job description vector to quantify content relevance and contextual overlap. A semantic similarity score is then derived.
6. Skill Extraction with NER and Skills Scoring:
- Applies a fine-tuned Hugging Face NER model (algiraldohe/lm-ner-linkedin-skills-recognition) to identify and extract technical, technology-related, and soft skills from both the CV and job descriptions.
- Compares the extracted skills and computes a skill match score based on overlapping and missing skills.
7. Final Weighted Score: A composite weighted score is calculated, applying a 90% weight to the semantic similarity score and a 10% weight to the skills score. This weighting scheme ensures that the overall results reflect both broad contextual fit and specific technical skill alignment.
8. LLM-powered Written Feedback: Leverages the Gemini API to generate detailed written feedback. This feedback includes insights into the semantic fit, suggestions for improving the CV's relevance to specific job descriptions, and areas where the user can highlight or develop skills to enhance future scores.

## 4.  Installation
To get started with SmartMatch, follow these steps:

Clone the repository:

Bash

git clone https://github.com/your-username/smartmatch.git
cd smartmatch
Create a virtual environment (recommended):

Bash

python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
Install the required libraries:

Bash

pip install -r requirements.txt
Note: Ensure you have a requirements.txt file listing all dependencies (e.g., pandas, transformers, scikit-learn, sentence-transformers, pypdf, google-generativeai).

Set up your Gemini API Key:

Obtain an API key from Google AI Studio (if you plan to use the LLM feedback feature).

Set it as an environment variable or load it securely within your notebook:

Python

import os
os.environ["GEMINI_API_KEY"] = "YOUR_GEMINI_API_KEY"


