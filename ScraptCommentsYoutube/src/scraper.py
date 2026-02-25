from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
import csv
import os

class YouTubeScraper:
    def __init__(self, url, max_comments=200):
        self.url = url
        self.max_comments = max_comments
        self.comments = []
        
    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=automation")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        return webdriver.Chrome(options=chrome_options)
    
    def scrape(self):
        driver = self.setup_driver()
        
        try:
            print(f"Membuka URL: {self.url}")
            driver.get(self.url)
            time.sleep(5)
            
            # Scroll untuk memuat komentar
            print("Memuat komentar...")
            for i in range(5):
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.END)
                time.sleep(3)
                print(f"Scroll ke-{i+1} selesai")
            
            # Ambil komentar
            comment_elements = driver.find_elements(By.CSS_SELECTOR, "#content-text")
            
            for comment in comment_elements[:self.max_comments]:
                text = comment.text
                if text:
                    self.comments.append(text)
            
            print(f"Berhasil mengambil {len(self.comments)} komentar")
            
        finally:
            driver.quit()
        
        return self.comments
    
    def save_to_csv(self, filename):
        # Buat folder jika belum ada
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['comment'])
            for comment in self.comments:
                writer.writerow([comment])
        print(f"Data disimpan ke: {filename}")