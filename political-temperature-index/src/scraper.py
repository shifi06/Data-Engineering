import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_politics():
    url = "https://news.ycombinator.com/"
    
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    articles = soup.select("span.titleline > a")

    titles = []

    for article in articles[:30]:
        titles.append(article.get_text(strip=True))

    print("Jumlah berita ditemukan:", len(titles))
    print("SCRAPER BARU JALAN")

    df = pd.DataFrame({
        "Title": titles
    })

    df.to_csv("data/raw/politics_news.csv", index=False)

    return df