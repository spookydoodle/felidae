# felidae
This API provides news headlines collected daily in various categories and languages.

## Category
- general
- business
- sport
- entertainment
- health
- science

## Country of origin and language combinations
- de-de
- gb-en
- nl-nl
- pl-pl
- us-en

## Main path
/news

## API params
:category - example: /news/general or /news/business

## API query parameters
cc - country code (of origin); example: cc=de
lang - language; example: lang=pl
page - page number (natural; > 0) starting from 1; a single page returns max. 100 results; example: page=10
date - date in format YYYY-MM-DD equal to (in UTC); example: date=1999-01-01
date_gt - date greater than (in UTC)
date_gte - date greater than or equal (in UTC)
date_lt - date less than (in UTC)
date_lte - date less than or equal (in UTC)

## Example path
/news/general?date=2021-01-01
/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2