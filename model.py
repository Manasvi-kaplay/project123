import sys
import re
from operator import itemgetter
import unicodedata
import nltk
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize, sent_tokenize
#from string import punctuation
#from urllib.request import Request, urlopen
#import os
import heapq
import json
def word_freq(summary):
    stopwords = nltk.corpus.stopwords.words('english')
    word_frequencies = {}
    #print(word_tokenize(summary))
    for word in word_tokenize(summary):
        if word not in stopwords:
            if word not in word_frequencies.keys():
                word_frequencies[word] = 1
            else:
                word_frequencies[word] += 1

    maximum_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = (word_frequencies[word]/maximum_frequency)
    return word_frequencies

def frequency(summary):
    word_frequencies = word_freq(summary)
    #sentence_list = nltk.tokenize.sent_tokenize(summ)
    sentence_list=re.split(r' *[\.\?!][\'"\)\]]* *', summary)
    #print("sentence_list..",sentence_list)
    num_sentences=len(sentence_list)
    #print("sentence_list length..",num_sentences)
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
    first=list(sentence_scores)[0]
    summary_list = []
    summary_list.append(first)
    #print(sentence_scores)
    summ_end = list(sentence_scores)[-1]
    sentence_scores = dict(list(sentence_scores.items())[1:-1])
    summary_sentences = heapq.nlargest(num_sentences-3, sentence_scores.items(), key=itemgetter(1))
    for i in summary_sentences:
        sc.append(i[1])
    for key,value in sentence_scores.items():
        if value in sc:
            summary_list.append(unicodedata.normalize("NFKD", key))
    summary_list.append(summ_end)
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
        s=s.replace('|','')
        sent = s.split()
        for j in sent:
            j=j.lower()
            if j in word_frequencies.keys():
                sent_score[j] = word_frequencies[j]
        sent_key.append(heapq.nlargest(2, sent_score, key=sent_score.get))
    
    
    return sentence_list,sent_key,scene_duration

# def n_freq_words(web_url, n=2):
#     word_frequencies = word_freq(web_url)[0]
#     for i in ['a','an', 'the', 'A', 'An', 'The']:
#         word_frequencies.pop(i, 'No Key found')

#     freq_words = heapq.nlargest(n, word_frequencies, key=word_frequencies.get)
#     return freq_words

summary = sys.argv[1]
su = frequency(summary)
#freq=n_freq_words(web_url, n_freq)
obj={
"summarized_sentences":su[0],
"keywords":su[1],
#"freq":freq,
"scene_duration":su[2]
}
ob=json.dumps(obj)
print(ob)
