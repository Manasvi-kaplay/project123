import sys
from bs4 import BeautifulSoup
import requests
import re
from operator import itemgetter
import unicodedata
import nltk
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from string import punctuation
from urllib.request import Request, urlopen
import json
import os
import heapq

def word_freq(web_url):
    response = requests.get(web_url)

    data = response.text
    soup = BeautifulSoup(data,'html.parser')

    paragraphs = soup.find_all('p')

    if(len(paragraphs)==0):
        req = Request(web_url , headers={"User-Agent": "Chrome"})
        data = urlopen(req).read()
        soup = BeautifulSoup(data, 'html.parser')
        paragraphs = soup.find_all('p')
    
    article_text = ""

    for p in paragraphs:
        article_text += p.text
        
    title1=""
    title = soup.find_all('h1')
    for t in title:
        title1+=t.text
    # Removing special characters and digits
    formatted_article_text = re.sub('[^a-zA-Z]', ' ', article_text )
    formatted_article_text = re.sub(r'\s+', ' ', formatted_article_text)

    stopwords = nltk.corpus.stopwords.words('english')

    word_frequencies = {}
    for word in nltk.word_tokenize(formatted_article_text):
        if word not in stopwords:
            if word not in word_frequencies.keys():
                word_frequencies[word] = 1
            else:
                word_frequencies[word] += 1

    maximum_frequency = max(word_frequencies.values())

    for word in word_frequencies.keys():
        word_frequencies[word] = (word_frequencies[word]/maximum_frequency)
    
    return word_frequencies, article_text, formatted_article_text, title1

def summarizer(web_url, num_sentences = 7):

    word_freqs = word_freq(web_url)
    word_frequencies = word_freqs[0]
    article_text = word_freqs[1]
    article_before_summ = word_freqs[2]
    
    sentence_list = nltk.sent_tokenize(article_text)
    sentence_scores = {}
    for sent in sentence_list:
        for word in nltk.word_tokenize(sent.lower()):
            if word in word_frequencies.keys():
                if len(sent.split(' ')) < 30:
                    if sent not in sentence_scores.keys():
                        sentence_scores[sent] = word_frequencies[word]
                    else:
                        sentence_scores[sent] += word_frequencies[word]

    
    sc=[]
    summary = "Title: "+ word_freqs[3] + list(sentence_scores)[0]
    summary_list = []
    summary_list.append(summary)
    summ_end = list(sentence_scores)[-1]
    sentence_scores = dict(list(sentence_scores.items())[1:-1])
    summary_sentences = heapq.nlargest(num_sentences-2, sentence_scores.items(), key=itemgetter(1))
    for i in summary_sentences:
        sc.append(i[1])
    for key,value in sentence_scores.items():
        if value in sc:
            summary += key
            summary_list.append(unicodedata.normalize("NFKD", key))
    summary = summary+summ_end
    summary_list.append(summ_end)
    sent_key = []
    for i in range(len(summary_list)):
        sent_score={}
        s =summary_list[i].replace(',', '')
        s= s.replace('.','')
        sent = s.split()
        for j in sent:
            j=j.lower()
            if j in word_frequencies.keys():
                sent_score[j] = word_frequencies[j]
        sent_key.append(heapq.nlargest(2, sent_score, key=sent_score.get))
    return summary, summary_list, article_before_summ, sent_key

def down_imgs(web_url):
    response = requests.get(web_url)

    data = response.text
    soup = BeautifulSoup(data,'html.parser')

    paragraphs = soup.find_all('p')

    if(len(paragraphs)==0):
        req = Request(web_url , headers={"User-Agent": "Chrome"})
        data = urlopen(req).read()
    
    soup = BeautifulSoup(data, 'html.parser')
    
    img = soup.find_all("img")
    
    res = [i for i in range(len(web_url)) if web_url.startswith('/', i)]
    website = web_url[: res[2]]
    
    urls = []
    width = []
    urlss = []
    urls_final=[]
    urls1 = []
    for i in range(len(img)):
        try:
            urls.append(img[i]['data-src'])
        except:
            pass
        try:
            url = img[i]['src']
            w = img[i]['width']
            if(int(w)>200):
                urls.append(url)
                width.append(w)
           
        except:
            pass
        
        if(len(urls)==0):
            try:    
                a = str(img[i])
                u = re.findall('(?:,\shttps.*png+\s$)|(?:,\shttps.*jpeg+\s$)|(?:,\shttps.*|jpg+\s$)', a)
                urlss.append(u)
                
                for i in range(0,len(urlss)):
                    if (len(urlss[i])!=0):
                        urls1.append(urlss[i])
                
                
                for i in urls1:
                    a = i[0].split(', ')
                    del a[0]
                    urls_final.append(a)
                
                
                for i in urls_final:
                    for y in i:
                        ws = re.findall('\d{2,7}w',y)
                        w = re.findall('\d{2,7}', ws[0])
                        #print(ws, w)
                        if(int(w[0])>200):
                            urls.append(y)
            except:
                pass

    img_urls_save = []
    for i in urls:
        img_urlf = re.findall('(.*\.png)|(.*\.jpeg)|(.*\.jpg)', i)
        for j in img_urlf:
            for k in j:
                if(len(k)!=0):
                    img_urls_save.append(k)
    return img_urls_save
    
    
web_url = sys.argv[1]
num_sentences = 7
n_freq = 2
su = summarizer(web_url, num_sentences)
srcs = down_imgs(web_url)
obj={
"summary":su[0],
"full_text":su[2],
"srcs":srcs
}
ob=json.dumps(obj)
print(ob)
