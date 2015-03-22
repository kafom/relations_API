# relations_API
Cruise review dashboards that use Aplchemy API keyboard and relations call.

The "keywords" dashboard analyses the sentiment of the most meaningful words used in Cruisecritic.com reviews of a given cruise line, in the example, Msc Cruises. Relevance and sentiment are estimated using the AlchemyAPI text analysis service.

The "relations" dashboard takes the most common keywords (words perceived to convey the broader sense of a conversation) found in negative reviews to shows examples of the actual usage of these words in negative and in positive reviews. More in detail, it:

1) extracts the keywords for the text with the Alchemy API keywords call (this should give the "themes" the people talk about) 2) runs the relations call on the same text 3) finds (with pandas) the phrases where the keywords were useds 4) selects the 20 most used keywords in negative comments and aggregate them by "subject" (for instance bar and cocktail go together) 3) allows the user to filter the phrases that by "subject", "verb", "sentiment" eccetera
