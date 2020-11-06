import sys
from bs4 import BeautifulSoup
import requests
import re
from operator import itemgetter
#from PIL import Image
import unicodedata
import nltk
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from string import punctuation
from urllib.request import Request, urlopen
import os
import heapq
import json

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

    # Removing special characters and digits
    formatted_article_text = re.sub('[^a-zA-Z]', ' ', article_text )
    formatted_article_text = re.sub(r'\s+', ' ', formatted_article_text)
    formatted_article_text = re.sub(r'\r\n', '', formatted_article_text)
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
    
    return word_frequencies, article_text, formatted_article_text

def summarizer(web_url, num_sentences):
    summary_list = []
    word_freqs = word_freq(web_url)
    word_frequencies = word_freqs[0]
    article_text = word_freqs[1]
    #article_before_summ = word_freqs[2]
    
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

    summary_sentences = heapq.nlargest(num_sentences, sentence_scores.items(), key=itemgetter(1))
    sc=[]
    summary=''
    for i in summary_sentences:
        sc.append(i[1])
    for key,value in sentence_scores.items():
        if value in sc:
            summary += key
            summary_list.append(unicodedata.normalize("NFKD", key))
    sent_key = []
    scene_duration=[]
    for i in range(len(summary_list)):
        words=len(summary_list[i].split())
        if(words<=10):
            scene_duration.append(4)
        elif(words>10 and words<=15):
            scene_duration.append(5)
        else:
            scene_duration.append(6)
        sent_score={}
        s =summary_list[i].replace(',', '')
        s= s.replace('.','')
        sent = s.split()
        for j in sent:
            j=j.lower()
            if j in word_frequencies.keys():
                sent_score[j] = word_frequencies[j]
        sent_key.append(heapq.nlargest(2, sent_score, key=sent_score.get))
    #return summary, summary_list, article_before_summ, sent_key
    return summary, summary_list, sent_key,scene_duration

def n_freq_words(web_url, n):
    word_frequencies = word_freq(web_url)[0]
    for i in ['a','an', 'the', 'A', 'An', 'The']:
        word_frequencies.pop(i, 'No Key found')

    freq_words = heapq.nlargest(n, word_frequencies, key=word_frequencies.get)
    
    return freq_words


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
    
    # names = []
    # img_urls_uncommon = []
    # for k in img_urls_save:
    #     p = [i for i in range(len(k)) if k.startswith('/', i)]
    #     name = k[p[-1]:]
    #     if name in names:
    #         continue
    #     else:
    #         names.append(name)
    #         img_urls_uncommon.append(k)
                
    # for i in range(0,len(img_urls_uncommon)):
    #     if('https' in img_urls_uncommon[i]):
    #         continue
    #     elif('http' in img_urls_uncommon[i]):
    #         continue
    #     elif('www' in img_urls_uncommon[i]):
    #         continue
    #     elif('.com' in img_urls_uncommon[i]):
    #         continue
    #     else:
    #         img_urls_uncommon[i] = website+img_urls_uncommon[i]

                
    # directory = web_url
    # bad_chars = [';', ':', '!' , "*", '?', '<', '>', '|', '/', '.']
    # for i in bad_chars:
    #     directory = directory.replace(i,'_')

    # parent_dir = parent_directory + '/Downloaded_Images'
    # path = os.path.join(parent_dir, directory) 
    # try: 
    #     os.makedirs(path, exist_ok = True) 
    #     print("Directory '%s' created successfully" % directory) 
    # except OSError as error: 
    #     print("Directory '%s' can not be created" % directory)
    #     pass
    
    
    # for i in range(len(img_urls_uncommon)):
    #     down = Image.open(requests.get(img_urls_uncommon[i], stream = True).raw)
    #     down.save(path + "\\" + str(i) + '.jpg')
    
    # return img_urls_uncommon


web_url = sys.argv[1]
#web_url=input("Enter the url")
num_sentences = 7
n_freq = 2
full_text=word_freq(web_url)[2]
summary=summarizer(web_url, num_sentences)
freq=n_freq_words(web_url, n_freq)
srcs=down_imgs(web_url)
#obj1={
    #"full_text":full_text
#}
obj={
    "summary":summary[0],
    "summarized_sentences":summary[1],
    "full_text":full_text,
    "keywords":summary[2],
    "freq":freq,
    "srcs":srcs,
    "scene_duration":summary[3]
}
#ob1=json.dumps(obj1)
ob=json.dumps(obj)
#print(ob1)
print(ob)


