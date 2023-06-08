API_KEY = "AIzaSyDZ_Cudb4mj0W8eWKB7eWpOwpBXD9aAeqM"
SEARCH_ENGINE_ID = "e77aadef9bb7b49c1"

import spacy
import sys
import requests
import pickle
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from collections import defaultdict
from heapq import nlargest
from googleapiclient.discovery import build

args = sys.argv

# Load Spacy model
nlp = spacy.load("en_core_web_sm")


def preprocess_text(text):
    doc = nlp(text)
    tokens = [
        token.text
        for token in doc
        if token.text not in STOP_WORDS
        and token.text not in punctuation
        and token.pos_ not in ["PROPN", "VERB"]
    ]
    return " ".join(tokens)


def calculate_similarity(sent1, sent2):
    doc1 = nlp(sent1)
    doc2 = nlp(sent2)
    return doc1.similarity(doc2)


def summarize_text(text):
    preprocessed_text = preprocess_text(text)
    doc = nlp(preprocessed_text)

    # Calculate similarity scores between sentences
    sentences = [sent.text for sent in doc.sents]
    num_sentences = len(sentences)
    similarity_matrix = defaultdict(lambda: defaultdict(float))

    for i in range(num_sentences):
        for j in range(i + 1, num_sentences):
            similarity_matrix[i][j] = calculate_similarity(sentences[i], sentences[j])
            similarity_matrix[j][i] = similarity_matrix[i][j]

    # Apply TextRank algorithm
    scores = defaultdict(float)
    damping_factor = 0.85
    max_iter = 50
    convergence_threshold = 0.0001

    for _ in range(max_iter):
        prev_scores = scores.copy()
        for i in range(num_sentences):
            score = 1 - damping_factor
            for j in range(num_sentences):
                if j != i:
                    score += (
                        damping_factor
                        * (similarity_matrix[i][j] / sum(similarity_matrix[j].values()))
                        * prev_scores[j]
                    )
            scores[i] = score

        # Check for convergence
        if (
            sum(abs(scores[i] - prev_scores[i]) for i in range(num_sentences))
            < convergence_threshold
        ):
            break

    # Select top sentences based on scores
    top_sentences = nlargest(3, scores, key=scores.get)
    summary = [sentences[i] for i in top_sentences]

    return " ".join(summary)


def is_common_word(keyword):
    common_words = ["today", "tomorrow", "yesterday"]
    return keyword in common_words


def is_date_related(keyword):
    doc = nlp(keyword)
    return any(ent.label_ == "DATE" for ent in doc.ents)


def get_latest_articles(keywords):
    service = build("customsearch", "v1", developerKey=API_KEY)
    query = " ".join(
        keyword
        for keyword in keywords
        if not is_common_word(keyword) and not is_date_related(keyword)
    )
    res = service.cse().list(q=query, cx=SEARCH_ENGINE_ID, num=5).execute()
    articles = []
    if "items" in res:
        for item in res["items"]:
            article = {
                "title": item["title"],
                "link": item["link"],
                "snippet": item["snippet"],
            }
            articles.append(article)

    return articles


API_KEY_Location = "AIzaSyBzwjNe11Q_bnonrQVs8uj1xwjyoI73t4E"


def get_geocode(location):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={API_KEY_Location}"
    response = requests.get(url).json()
    if "results" in response:
        result = response["results"][0]
        geometry = result["geometry"]
        location = geometry["location"]
        lat = location["lat"]
        lng = location["lng"]
        return f"{lat},{lng}"
    return None


def get_nearby_places(keywords, location, limit=10):
    places = []
    geocode = get_geocode(location)
    if geocode:
        for keyword in keywords:
            if not is_common_word(keyword) and not is_date_related(keyword):
                url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={geocode}&radius=5000&keyword={keyword}&key={API_KEY_Location}"
                response = requests.get(url).json()
                if "results" in response:
                    for result in response["results"]:
                        place = {
                            "name": result["name"],
                            "address": result["vicinity"],
                            "rating": result.get("rating", None),
                            "types": result["types"],
                        }
                        places.append(place)
                        if len(places) >= limit:
                            return places
    return places[:limit]


import json

# ... (rest of the code remains the same)

# Get user input for the elderly person's input
input_text = args[1]

# Perform summarization
summary = summarize_text(input_text)

# Extract keywords from the summary
summary_keywords = preprocess_text(summary).split()

# Get relevant articles based on keywords
latest_articles = get_latest_articles(summary_keywords)

# Get nearby places based on keywords and location
location = "mumbai"  # Replace with the desired location
nearby_places = get_nearby_places(summary_keywords, location)

# Create a JSON object with all the results
result = {
    "input_text": input_text,
    "summary": summary,
    "keywords": summary_keywords,
    "latest_articles": latest_articles,
    "nearby_places": nearby_places,
}

# Convert the result to a JSON string and print it
result_json = json.dumps(result, indent=2)
print(result_json)
