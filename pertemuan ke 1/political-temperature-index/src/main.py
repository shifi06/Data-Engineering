from scraper import scrape_politics
from analyzer import analyze_news
import requests

if __name__ == "__main__":
    print("Scraping berita politik...")
    scrape_politics()

    print("Menganalisis suhu politik...")
    result = analyze_news()

    print("\n=== HASIL ANALISIS ===")
    print(result)