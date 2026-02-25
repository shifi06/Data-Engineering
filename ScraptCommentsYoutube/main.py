from src.scraper import YouTubeScraper
from src.analyzer import TextAnalyzer
from src.visualizer import Visualizer
import time

def main():
    # Konfigurasi
    VIDEO_URL = "https://youtu.be/BBpIV9A1PXc"
    MAX_COMMENTS = 200
    
    print("="*60)
    print("TUGAS SCRAPING DAN ANALISIS KOMENTAR YOUTUBE")
    print("="*60)
    print(f"URL Video: {VIDEO_URL}")
    print(f"Maksimal komentar: {MAX_COMMENTS}")
    print("-"*60)
    
    # 1. SCRAPING
    print("\n[1] PROSES SCRAPING DIMULAI...")
    scraper = YouTubeScraper(VIDEO_URL, MAX_COMMENTS)
    comments = scraper.scrape()
    scraper.save_to_csv("data/raw/youtube_comments_raw.csv")
    
    # 2. ANALISIS
    print("\n[2] PROSES ANALISIS DIMULAI...")
    analyzer = TextAnalyzer("config/stopwords.txt")
    results = analyzer.analyze(comments)
    analyzer.save_results(results, "data/processed/analisis_results.csv")
    
    # 3. VISUALISASI
    print("\n[3] PROSES VISUALISASI DIMULAI...")
    viz = Visualizer()
    viz.create_bar_chart(results['top_words'], "output/charts/top_words_chart.png")
    viz.create_wordcloud(results['all_text'], "output/charts/wordcloud.png")
    
    # 4. TAMPILKAN HASIL
    print("\n" + "="*60)
    print("HASIL ANALISIS - 15 KATA TERATAS:")
    print("="*60)
    for i, (word, count) in enumerate(results['top_words'], 1):
        print(f"{i:2d}. {word:<20} : {count:3d} kali")
    print("="*60)
    
    # 5. BUAT LAPORAN SEDERHANA
    with open("output/reports/analisis_komentar.txt", "w", encoding="utf-8") as f:
        f.write("LAPORAN ANALISIS KOMENTAR YOUTUBE\n")
        f.write("="*40 + "\n")
        f.write(f"URL Video: {VIDEO_URL}\n")
        f.write(f"Total Komentar: {len(comments)}\n")
        f.write(f"Tanggal Analisis: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("15 KATA PALING SERING MUNCUL:\n")
        for i, (word, count) in enumerate(results['top_words'], 1):
            f.write(f"{i:2d}. {word:<20} : {count:3d} kali\n")
    
    print("\n✅ TUGAS SELESAI!")
    print("   Hasil dapat dilihat di folder:")
    print("   - data/raw/     (komentar mentah)")
    print("   - data/processed/ (hasil analisis)")
    print("   - output/charts/  (visualisasi)")
    print("   - output/reports/ (laporan)")
    print("="*60)

if __name__ == "__main__":
    main()