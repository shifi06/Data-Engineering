from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import re
from collections import Counter
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# ================== KONFIGURASI ==================
API_KEY = "AIzaSyDUNnJH6PN-yth9CcQkNVUgcPAzl9zdQY0"
VIDEO_URL = "https://youtu.be/BBpIV9A1PXc"
MAX_COMMENTS = 500
# =================================================


def extract_video_id(url):
    import re
    match = re.search(r"(?:v=|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None


def get_youtube_comments(youtube, video_id, max_comments):
    comments = []
    next_page_token = None

    while len(comments) < max_comments:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            pageToken=next_page_token,
            textFormat="plainText"
        )

        response = request.execute()

        for item in response.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return comments[:max_comments]


def clean_text(comments):
    text = " ".join(comments).lower()
    text = re.sub(r"http\S+", "", text)
    words = re.findall(r'\b[a-zA-Z]+\b', text)

    stopwords = {
        'yang','dan','di','ke','dari','ini','itu','adalah','ya','ga','gak','ada',
        'dengan','bisa','untuk','aja','sudah','udah','bang','kalau','kalo','juga',
        'kok','si','nih','dia','saya','kamu','the','and','for','this','that'
    }

    return [w for w in words if w not in stopwords and len(w) > 2]


# ================== MAIN ==================
try:
    print("🔗 Menghubungkan ke YouTube API...")
    youtube = build("youtube", "v3", developerKey=API_KEY)

    video_id = extract_video_id(VIDEO_URL)
    print("🎬 Video ID:", video_id)

    print("📥 Mengambil komentar via API...")
    comments = get_youtube_comments(youtube, video_id, MAX_COMMENTS)

    print("✔ Total komentar diambil:", len(comments))

    df = pd.DataFrame(comments, columns=["Komentar"])
    df.to_csv("hasil_scraping.csv", index=False, encoding="utf-8")
    print("💾 CSV tersimpan")

    clean_words = clean_text(comments)
    word_counts = Counter(clean_words)

    print("\n📊 TOP 10 KATA:")
    for word, count in word_counts.most_common(10):
        print(word, ":", count)

    if clean_words:
        wc = WordCloud(width=1000, height=500, background_color="white") \
            .generate_from_frequencies(word_counts)

        plt.figure(figsize=(12,6))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        plt.savefig("wordcloud_hasil.png")
        plt.show()

        print("🖼️ WordCloud tersimpan")

except HttpError as e:
    print("❌ YouTube API Error:", e)

except Exception as e:
    print("❌ Error:", e)