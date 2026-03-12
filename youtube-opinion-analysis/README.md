# YouTube Comment Sentiment Analysis

Simple Python script to scrape YouTube comments and perform basic sentiment analysis.

--------------------------------------------------------------------------------------------------------------------------

## Clone & Using

Clone the repository:

``````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
git clone https://github.com/USERNAME/REPOSITORY.git


Masuk ke folder project:

cd youtube-opinion-analysis


Install dependencies:


py -m pip install pandas numpy matplotlib scipy google-api-python-client


atau jika ada requirements.txt:

py -m pip install -r requirements.txt


## Setup API Key

Buka file:

```
main.py
```

Ganti bagian ini:

`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
API_KEY = "MASUKKAN_API_KEY_KAMU"


dengan API Key YouTube kamu.

Contoh:


API_KEY = "AIzaSyXXXXXXX"


## Run Program

Jalankan program:

py main.py


Masukkan Video ID YouTube ketika diminta.

Contoh:


Masukkan Video ID YouTube: _0eSyCd4nrs

## Output

Program akan menampilkan:

- statistik sentimen
- jumlah komentar positif / negatif / netral
- top 10 kata paling sering muncul
- grafik distribusi sentimen

Hasil analisis juga disimpan sebagai file:



------------------------------------------------------------------------------------------------------

## Libraries Used

- pandas
- numpy
- matplotlib
- scipy
- google-api-python-client