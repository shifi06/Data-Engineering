import re
from collections import Counter
import pandas as pd
import os

class TextAnalyzer:
    def __init__(self, stopwords_file=None):
        self.stopwords = self.load_stopwords(stopwords_file)
    
    def load_stopwords(self, filename):
        if filename and os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return [line.strip() for line in f.readlines()]
        return []
    
    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r"http\S+|www\S+|https\S+", "", text)
        text = re.sub(r"[^a-zA-Z\s]", "", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()
    
    def analyze(self, comments):
        # Cleaning
        cleaned = [self.clean_text(c) for c in comments if self.clean_text(c)]
        
        # Gabungkan semua teks
        all_text = " ".join(cleaned)
        
        # Tokenisasi
        words = all_text.split()
        
        # Filter stopwords
        filtered = [w for w in words if w not in self.stopwords and len(w) > 2]
        
        # Hitung frekuensi
        word_counts = Counter(filtered)
        
        return {
            'cleaned_comments': cleaned,
            'all_text': all_text,
            'word_counts': word_counts,
            'top_words': word_counts.most_common(15)
        }
    
    def save_results(self, results, filename):
        df = pd.DataFrame(results['top_words'], columns=['kata', 'frekuensi'])
        df.to_csv(filename, index=False)
        print(f"Hasil analisis disimpan ke: {filename}")