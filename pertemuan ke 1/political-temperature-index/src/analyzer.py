import pandas as pd

kata_positif = ["success", "growth", "win", "improve"]
kata_negatif = ["fail", "problem", "bug", "issue"]

def analyze_news():
    df = pd.read_csv("data/raw/politics_news.csv")

    positive_count = 0
    negative_count = 0

    for title in df["Title"]:
        title_lower = title.lower()

        for word in kata_positif:
            if word in title_lower:
                positive_count += 1

        for word in kata_negatif:
            if word in title_lower:
                negative_count += 1

    temperature_score = positive_count - negative_count

    result = {
        "Positive": positive_count,
        "Negative": negative_count,
        "Temperature_Score": temperature_score
    }

    return result