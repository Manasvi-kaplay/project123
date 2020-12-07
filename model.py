import sys
from operator import itemgetter
import re
import nltk
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from string import punctuation
from urllib.request import Request, urlopen
import heapq
import json

def key_words_of_each_sent(article_text):
    sentence_list = nltk.sent_tokenize(article_text)
    # formatted_sentence_list=[]
    # count=0
    # for j in range(len(sentence_list)):
    #     if j==0:
    #         formatted_sentence_list.append(sentence_list[j])
    #     else:
    #         if len(sentence_list[j].split())<=12:
    #             formatted_sentence_list.append(sentence_list[j]+sentence_list[j+1])
    #             count=j+1
    #         elif j!=count:
    #             formatted_sentence_list.append(sentence_list[j])
    # print("formatted_sentence_list..",formatted_sentence_list)
    # print("formatted_sentence_list length...",len(formatted_sentence_list))
    # Removing special characters and digits
    formatted_article_text = re.sub('[^a-zA-Z]', ' ', article_text )
    formatted_article_text = re.sub(r'\s+', ' ', formatted_article_text)
    formatted_article_text= formatted_article_text.lower()
    
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
    
    
    sent_key = []
    scene_duration=[]
    for i in range(len(sentence_list)):
        words=len(sentence_list[i].split())
        if(words<=10):
            scene_duration.append(4)
        elif(words>10 and words<=15):
            scene_duration.append(5)
        else:
            scene_duration.append(6)
        sent_score={}
        s =sentence_list[i].replace(',', '')
        s= s.replace('.','')
        sent = s.split()
        for j in sent:
            j=j.lower()
            if j in word_frequencies.keys():
                sent_score[j] = word_frequencies[j]
        sent_key.append(heapq.nlargest(2, sent_score, key=sent_score.get))
    for i in ['a','an', 'the', 'A', 'An', 'The']:
        word_frequencies.pop(i, 'No Key found')
    freq_words = heapq.nlargest(2, word_frequencies, key=word_frequencies.get)
    return sentence_list, sent_key,scene_duration,freq_words
    
article_text = sys.argv[1]
article_text = re.sub(r'(?<=[.,])(?=[^\s])', r' ', article_text)
result = key_words_of_each_sent(article_text)    
obj={
"summarized_sentences":result[0],
"keywords":result[1],
"freq":result[3],
"scene_duration":result[2]
}
ob=json.dumps(obj)
print(ob)



