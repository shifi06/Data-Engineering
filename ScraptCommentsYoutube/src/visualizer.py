import matplotlib.pyplot as plt
from wordcloud import WordCloud
import os

class Visualizer:
    @staticmethod
    def create_bar_chart(top_words, filename):
        words = [w for w, _ in top_words]
        counts = [c for _, c in top_words]
        
        plt.figure(figsize=(12, 6))
        bars = plt.bar(words, counts, color='skyblue')
        plt.xticks(rotation=45, ha='right')
        plt.xlabel("Kata")
        plt.ylabel("Frekuensi")
        plt.title("15 Kata Paling Sering Muncul di Komentar")
        
        for bar, count in zip(bars, counts):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                    str(count), ha='center', va='bottom')
        
        plt.tight_layout()
        
        # Buat folder jika belum ada
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        plt.savefig(filename, dpi=300)
        plt.close()
        print(f"Bar chart disimpan ke: {filename}")
    
    @staticmethod
    def create_wordcloud(text, filename):
        wordcloud = WordCloud(
            width=1000,
            height=500,
            background_color='white',
            max_words=100,
            colormap='viridis'
        ).generate(text)
        
        plt.figure(figsize=(15, 7))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title("Word Cloud - Kata yang Sering Muncul")
        plt.tight_layout()
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        plt.savefig(filename, dpi=300)
        plt.close()
        print(f"Word cloud disimpan ke: {filename}")