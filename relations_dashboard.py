
# coding: utf-8

# In[ ]:


import json
import collections
import pandas as pd
import numpy as np
from pandas.io.json import json_normalize
import math
import csv
from alchemyapi import AlchemyAPI

def open_json_review_files(cruiseLines):
    """
    creates dictionary with one or more cruise lines review json files
    """
    lineDb= {}
    commentDb = {}
    totcount = 0
    for line in cruiseLines:
        count = 0
        with open('data/'+line+'.json', 'rb') as fp:
            lineDb[line] = json.load(fp)
            commentDb.update(lineDb)
            for element in commentDb[line]:
                count = count + 1 
        totcount=totcount+count
        print "processed", line, len(commentDb[line]),"reviews"
    print 'total processed', totcount, 'reviews'
    return commentDb

def cleanRatings(commentDb,cruiseLines):
    """
    cleans up and aggregates ratings data
    """
    ratingAggregations={"6":"good","5":"good","4":"medium","3":"medium","2":"bad","1":"bad","no rating":"no rating"}
    count = 0 
    for line in cruiseLines:
        for element in commentDb[line]:
            if len(commentDb[line][element]["kind"]) <5:
                   commentDb[line][element]["kind"]="not specified"
            if not commentDb[line][element]["rating"].isdigit():
                    commentDb[line][element]["rating"]="no rating" 
            if len(commentDb[line][element]["ship"]) <5:
                    commentDb[line][element]["ship"]="not available"                     
            commentDb[line][element]["aggregatedRating"]=ratingAggregations[commentDb[line][element]["rating"]] 
    return commentDb

def checkDailyQuotaAndRunAlchemy(commentDb,cruiseLines):
    with open('data/Alchemy_response_keywords.json', 'rb') as fp:
            returned_keywords = json.load(fp)
    with open('data/Alchemy_response_relations.json', 'rb') as fp:
            returned_relations = json.load(fp)       
    alchemyapi = AlchemyAPI()
    test="test if finished Alchemy daily quota"
    response = alchemyapi.keywords('text', test, {'sentiment': 0})
    if response['status'] == 'OK':
        returned_keywords,returned_relations=runAlchemyApi(cruiseLines,commentDb,returned_keywords,returned_relations,alchemyapi)
    else:
        print 'Error in keyword extraction call: ', response['statusInfo']
    return returned_keywords, returned_relations 

def runAlchemyApi(cruiseLines, commentDb,returned_keywords,returned_relations,alchemyapi):
    count_keywords=0
    count_relations=0
    check=0
    low_ratings={"1","2","5","6"}    
    print "getting Alchemy keyword data. We already have keywords of ", len(returned_keywords),"reviews"
    for line in cruiseLines:
        for element in commentDb[line]:
            text=commentDb[line][element]["comment"]
            if element in returned_keywords or len(text) <100:
                pass
            else:
                response = alchemyapi.keywords('text', text, {'sentiment': 1})
                call="keywords"
                if response['status'] == 'OK':
                    returned_keywords=load_element_data(call,response,returned_keywords,commentDb,element,line)            
                    count_keywords=count_keywords+1
                else:
                    print 'Error in keyword extaction call: ', response['statusInfo']
                    break                      
            if commentDb[line][element]['rating'] in low_ratings:
                if element in returned_relations or len(text) <100:
                    pass
                else:
                    response = alchemyapi.relations('text', text, {'sentiment': 1})
                    call="relations"
                    if response['status'] == 'OK' :
                        count_relations=count_relations+1 
                        returned_relations==load_element_data(call,response,returned_relations,commentDb,element,line)    
                    else:
                        print 'Error in keyword extaction call: ', response['statusInfo']
                        break  
    print "finished getting keyword data from Alchemy for", count_keywords,"reviews"        
    print "in total we have got keyword data for", len(returned_keywords),"reviews"
    print "finished getting relations data from Alchemy for", count_relations,"reviews"        
    print "in total we have got relations data for", len(returned_relations),"reviews"        
    save_dictionary(returned_keywords,"keywords")
    save_dictionary(returned_relations,"relations")    
    return returned_keywords, returned_relations

def load_element_data(call,response,returned_dictionary,commentDb,element,line):   
    returned_dictionary[element]={}
    returned_dictionary[element]=response
    returned_dictionary[element]["rating"]=commentDb[line][element]['rating']
    returned_dictionary[element]['ship']=commentDb[line][element]['ship']
    returned_dictionary[element]['sail_date']=commentDb[line][element]['sail Date']
    returned_dictionary[element]['line']=line
    return returned_dictionary

def save_dictionary(returned_dictionary,call):
    with open('data/Alchemy_response_'+call+'.json', 'wb') as fp:
        json.dump(returned_dictionary, fp) 
                     
def make_keywords_csv_alchemy(returned_keywords,commentDb):
    """
    generates the csv file that powers the keyword dashboard
    """
    call="keywords"
    df=clean_dictionary_keys(returned_keywords,call,commentDb)
    patterns = [(r'[^A-Za-z0-9 ]+',''),(r' +',' ')]
    regex_columns=["Word"]
    df=clean_with_regex(regex_columns,patterns,df)    
    columns=["Word"]
    make_lowercase(columns,df)
    mask=df.Word.str.len() >= 2
    df=delete_useless_rows(mask,df)   
    mask=df.Rating!="no rating"
    df=delete_useless_rows(mask,df)  
    to_float=["relevance","sentiment_score","Rating"]
    df=convert_to_float(to_float, df)
    minimum_scores={"standard":0.50,"high":0.6,"very_high":0.7}
    for hypothesis in minimum_scores:
        filter_data_and_generate_hypothesis(df,hypothesis,minimum_scores)        
        
def make_relations_csv_alchemy(returned_relations,commentDb):
    """
    generates the csv file that powers the relations dashboard
    """
    call="relations"
    df=clean_dictionary_keys(returned_relations,call,commentDb)
    patterns = [(r'[^A-Za-z0-9%\' ]+',''),(r' +',' ')]
    text_columns=["sbjText","actText", "objText","location.text"]
    df=clean_with_regex(text_columns,patterns,df)
    make_lowercase(text_columns,df)
    to_float=["sbjSentScore","objSentScore","object.sentimentFromSubject.score","location.sentiment.score"]
    df=convert_to_float(to_float, df)    
    save_csv(df,call)   

def clean_dictionary_keys(returned_dictionary,call,commentDb):
    line=cruiseLines[0]
    df=pd.DataFrame()
    count_keywords=0
    count_relations=0
    keys_to_drop=["language","status","usage","totalTransactions","url"]
    to_rename=  {"keywords":{"text":"Word",'relevance_x': 'relevance','sentiment.score': 'sentiment_score',
        "sentiment":"dictionary",'sentiment.type': 'Sentiment',"rating":"Rating","ship":"Ship","line":"Line"},
        "relations":{"action.lemmatized":"actLemma",
                     "action.text":"actText",
                     "action.verb.negated":"actVerbNeg",
                     "action.verb.text":"actVerbText",
                     "object.sentiment.score":"objSentScore",
                     "object.sentiment.type":"objSentType",
                     "object.text":"objText",
                     "subject.sentiment.score":"sbjSentScore",
                     "subject.sentiment.type":"sbjSentType",
                     "subject.text":"sbjText"           
                     }}
    for review in returned_dictionary:
        if call == "relations":
            count_relations=count_relations+1
            if count_relations % 500 == 0:    
                print "finished", count_relations,"out of",len(returned_dictionary)
        else:
            count_keywords=count_keywords+1
            if count_keywords % 500 == 0:    
                print "finished", count_keywords,"out of",len(returned_dictionary)
        if returned_dictionary[review]["language"]!="english":
            print review, "review seems not to be in English, but in", returned_dictionary["language"]
        for key in keys_to_drop:
            returned_dictionary[review].pop(key, None)
        else:
            df=flatten_dictionary(returned_dictionary,review,call,df,commentDb,line)
    df.rename(columns=to_rename[call], inplace=True)
    return df

def clean_with_regex(regex_columns,patterns,df):
    for column in regex_columns:
        for pattern in patterns:
            df[column].replace(pattern[0],pattern[1], regex = True, inplace=True)
    return df

def filter_data_and_generate_hypothesis(df,hypothesis,minimum_scores):        
    min_relevance=minimum_scores[hypothesis]
    min_sentiment=minimum_scores[hypothesis]
    mask=df.relevance>=min_relevance
    df=delete_useless_rows(mask,df)
    df=change_unsure_to_neutral(min_sentiment,df)    
    mask=df.Sentiment!="neutral"
    df=delete_useless_rows(mask,df)
    df=aggregate_ratings(df)
    mask=df.Rating!="medium"
    df=delete_useless_rows(mask,df) 
    mask=df.Line!="Costa"
    df=delete_useless_rows(mask,df) 
    df=reformat_dates(df)
    to_drop=["sentiment_score","relevance","sail_date","date","dictionary","relevance_y","sentiment.mixed"]
    df=drop_columns(to_drop,df)    
    to_add={"count":1}
    df=add_columns(to_add,df)
    df=make_pivot(df)
    df["Total"]=df["Positive"]+df["Negative"]
    to_rename={"rating":"Rating"}
    df.rename(columns=to_rename, inplace=True)
    save_csv(df,hypothesis)

def flatten_dictionary(returned_dictionary,review,call,df,commentDb,line): 
    if call == "keywords":
        first_level=json_normalize(returned_dictionary[review],call,['rating','sail_date',"ship","line"])
        second_level=json_normalize(returned_dictionary[review][call])
        together=pd.merge(first_level, second_level, on='text', how='outer')
        df=pd.concat([df, together])
    else:
        if review in commentDb["Msc"]:
            rating=commentDb["Msc"][review]["rating"]
            for element in returned_dictionary[review][call]:
                second_level=json_normalize(element)
                second_level['review']=review
                second_level['rating']=rating                
                df=pd.concat([df,second_level])
    return df 


def open_csv(suffix):
    df= pd.DataFrame(pd.read_csv('data/alchemy_ratings_'+suffix+'.csv'))
    return df

def drop_columns(to_drop,df):    
    for column in to_drop:
        df.drop(column, axis=1, inplace=True)
    return df

def fill_na_columns(df,lista,fill_with):
    for column in lista:
        df[column].fillna(fill_with,inplace=True)
        df["objSentScore"].fillna(0,inplace=True)   
    return df

def reorder_column(df,new_list):
    varlist =[w for w in df.columns if w not in new_list]
    df = df[new_list+varlist]
    return df 


def delete_useless_rows(mask,df):
    df=df[mask]
    return df

def reformat_dates(df):
    df["date"]=pd.to_datetime(df.sail_date, format= "%B %Y", coerce= True)
    df["Year"]=pd.DatetimeIndex(df.date).year
    return df

def add_columns(to_add,df):                
    for column in to_add:
        df[column]=to_add[column]
    return df

def make_lowercase(columns,df):
    for column in columns:
        df[column]=df[column].str.lower()
    return df

def convert_to_float(to_float, df):
    for column in to_float:
        df[column]=df[column].astype(float).fillna(0.0)
    return df

def change_unsure_to_neutral(min_sentiment,df):
    df["Sentiment"][(df["sentiment_score"] <= min_sentiment) & (df["sentiment_score"] >= -min_sentiment)]="neutral"
    return df

def make_pivot(df):
    df=df.reset_index()  
    dataDims=["Word","Rating","Year","Ship","Line"]
    valueDims=["count"]
    columnDims=["Sentiment"]
    labels=['Negative','Positive']
    pivotValues=preparePivotValues(columnDims,df)   
    df=pd.pivot_table(df,values=valueDims,index=dataDims,columns=columnDims,aggfunc='sum').fillna(0)
    result={}
    for valueDim in valueDims:
        result[valueDim]= df[valueDim]
        print 'processing ', valueDim, ' valuedimension'        
        result[valueDim] =renamePivotColumns(result[valueDim],labels,pivotValues[0]) 
        result[valueDim]=result[valueDim].reset_index()
        print 'processing pivot with ', len(columnDims) ,' pivot column dimensions and ', len(valueDims),' value column dimensions.....'        
    if len(columnDims) == 1 and len(valueDims) == 1:
        df=result[valueDim]          
    df.fillna(0, inplace=True)
    return df

    
def renamePivotColumns(result,labels,dimensions):
    count=0    
    print "CHECK THAT RENAMING IS CORRECT ==>" 
    for dimension in dimensions:
        print "renamed ", dimension, " as ", labels[count]                
        result.rename(columns={dimension:labels[count]}, inplace=True) 
        count=count+1
    print "\n "    
    return result    
    
    
def preparePivotValues(columnDims,df):
    pivotValues={}
    count = 0    
    for columnDim in columnDims:
        pivotValues[count]=df[columnDims[count]].unique()
        pivotValues[count].sort()
        if (len(pivotValues[count]) != 2):
            print 'More than two pivot values in a column. POSSIBLE ERROR IN DATA ==> ', pivotValues[count] 
        count = count + 1
    print "these are the pivot values ",pivotValues
    return pivotValues    


def prepare_keywords(sum_field,rating,suffix,top_number,line):
    df=open_csv(suffix)
    mask=df.Line==line
    df=delete_useless_rows(mask,df)
    mask=df.Rating==rating
    df=delete_useless_rows(mask,df)
    df=get_top_words(df,sum_field,top_number)
    return df

def get_top_words(df,sum_field,top_number):
    df = df.groupby('Word')
    df=df[sum_field].sum().order(ascending=False)
    df=df.head(top_number).copy()
    return df   

def save_csv(df,hypothesis):
    fileName='data/alchemy_ratings_'+hypothesis+'.csv'
    print fileName  
    df.to_csv(fileName,encoding='utf-8')

def blank_out_short_sentences(df,blank_out_rules):
    for rule in blank_out_rules:
        df.loc[df[rule[0]].str.len() <=rule[1], rule[0]] = ""
    return df    

def make_top_dataframes(top_number,line):
    """
    spits out top keywords used in negative reviews
    """
    suffix="standard"
    top_neg_bad=prepare_keywords("Negative","bad",suffix,top_number,line)
    top_neg_bad=top_neg_bad.reset_index()
    return top_neg_bad

def prepare_relations():
    """
    gets cvs output from API relations call and 
    cleans it up for dc.js
    """
    suffix="relations"
    df=open_csv(suffix)
    df=df.drop_duplicates()
    #blank_out_rules=(("objText",3),("sbjText",3))
    #df=blank_out_short_sentences(df,blank_out_rules)    
    to_rename={"object.sentimentFromSubject.score":"objSentFromSbjScore",
               "object.sentimentFromSubject.type":"objSentFromSbjType",
               "action.verb.tense":"actVerbTense",
               "location.sentiment.score":"locSentScore",
               "location.sentiment.type":"locSentType",
               "location.text":"locText"
               }
    df.rename(columns=to_rename, inplace=True)
    fill_na_str=["objText","sbjText","actVerbText","locText"]
    fill_with=""
    df=fill_na_columns(df,fill_na_str,fill_with)
    fill_na_int=["actVerbNeg","objSentScore","objSentFromSbjScore","sbjSentScore","locSentScore"]
    fill_with=0
    df=fill_na_columns(df,fill_na_int,fill_with) 
    fill_na_sent=["objSentType","objSentFromSbjType","sbjSentType","locSentType"]
    fill_with="neutral"
    df=fill_na_columns(df,fill_na_sent,fill_with)
    to_rename={"rating":"Rating"}
    df.rename(columns=to_rename, inplace=True)
    df=aggregate_ratings(df)
    to_rename={"Rating":"rating"}
    df.rename(columns=to_rename, inplace=True)
    new_order=["review","rating","sbjText","actText","actVerbNeg","objText","locText","sbjSentType",
               "objSentType","objSentFromSbjType","locSentType","sbjSentScore","objSentScore",
               "objSentFromSbjScore","actVerbText","locSentScore","actLemma","actVerbTense"]    
    df = reorder_column(df,new_order)
    to_drop=["Unnamed: 0","actLemma","actVerbText","locSentScore","actVerbTense",
             "locSentType","locText","review","objSentFromSbjScore","objSentFromSbjType"]
    to_drop=["Unnamed: 0"]
    df=drop_columns(to_drop,df)
    return df

     
def aggregate_ratings(df):
    conditions=[((df["Rating"] >= 5) & (df["Rating"] <= 6),"good"),
                ((df["Rating"] >= 3) & (df["Rating"] <= 4),"medium"),
                ((df["Rating"] >= 1) & (df["Rating"] <= 2),"bad")]
    for condition in conditions:
        df["Rating"][condition[0]]=condition[1]
    return df 

def find_keywords_in_text(df, top_bad):
    """
    Finds phrases that contains keywords and aggregates then according to similar issues. 
    ++> Must manually fill in 'interesting' dictionary with interesting and non interesting top keywords words.
    ++> Must manually aggregate interesting keywords in aggr_keywords dictionary
    
    """
    count=0
    interesting={"food": 1,"people": 1,"cruise line": 0,"msc": 0,
                     "dining room": 1,"worst cruise": 0,"ship": 1,"cruise": 0,
                     "cruise ship": 1,"room service": 1,"msc cruise": 0,"poor quality": 1,
                     "customer service": 1,"passengers": 1,"time": 1,"poor service": 1,
                     "board": 1,"bar service": 1,"buffet": 1,"cruise lines": 0,                     
                     "buffet":1,"cruise lines":0,"cruise director":1,"table":1,
                     "bar staff":1,"poor food":1,"times":1,"waiter":1,"public areas":1,
                     "credit card":0,"food quality":1,"biggest disappointment":0}
    aggr_keywords={"food": "food","poor food":"food","buffet":"food","food quality":"food",
                   "people": "people","passengers":"people",
                   "time": "time","times": "time",
                   "dining room": "dining","table":"dining","waiter":"dining", "room service": "dining",
                   "bar service": "bar","bar staff":"bar",        
                    "ship": "ship","cruise ship": "ship","board": "ship","public areas":"ship",             
                    "poor quality": "service","customer service": "service","poor service": "service","cruise director":"service"}  
    count=0
    text_columns=["objText","sbjText","actVerbText"]
    for word in top_bad["Word"]:
        if interesting[word]==1:
            count=count + 1
            print "processing",word,"total = ", count
            for column in text_columns:
                df.loc[df[column].str.contains(word), "foundKeyword"] = word
                df.loc[df[column].str.contains(word), "aggKeyword"] = aggr_keywords[word]
    df=df[pd.notnull(df["foundKeyword"])]
    df["count"]=1
    save_csv(df,"data/relations_cleaned")
    mask=df.actVerbNeg!=1
    df=delete_useless_rows(mask,df)
    df["message"]=df["sbjText"]+" "+df["actText"]+" "+df["objText"]
    df=df.reset_index()
    to_drop=["review","locText","actVerbNeg","actLemma","actVerbTense","actText", "sbjText","objText",
             "foundKeyword","locSentType","locSentScore","objSentFromSbjType","objSentFromSbjScore"]
    df=drop_columns(to_drop,df)
    new_order=["rating","aggKeyword","message","actVerbText","sbjSentType",
               "objSentType","sbjSentScore","objSentScore","count"]    
    df = reorder_column(df,new_order)
    to_rename={"rating":"Rating","aggKeyword":"AggKeyword","message":"Message","actVerbText":"ActVerbText",
                "sbjSentType":"SbjSentType","objSentType":"ObjSentType","sbjSentScore":"SbjSentScore",
                "objSentScore":"ObjSentScore","count":"Count"}
    df.rename(columns=to_rename, inplace=True)
    save_csv(df,"relations_small")
    return df


cruiseLines=["Msc"]

def main():

    commentDb=open_json_review_files(cruiseLines)
    commentDb=cleanRatings(commentDb,cruiseLines)
    returned_keywords,returned_relations=checkDailyQuotaAndRunAlchemy(commentDb,cruiseLines) 
    make_keywords_csv_alchemy(returned_keywords,commentDb)
    make_relations_csv_alchemy(returned_relations,commentDb)
    top_keywords=30
    df=prepare_relations()
    top_bad=make_top_dataframes(top_keywords,cruiseLines[0])
    print top_bad
    df=find_keywords_in_text(df, top_bad)    
    print df.info()
    
main()

    






# In[ ]:



