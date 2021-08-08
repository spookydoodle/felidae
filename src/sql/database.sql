CREATE DATABASE scraper;

CREATE TABLE newsheadlines(
    id SERIAL PRIMARY KEY,
    category VARCHAR(20),
    lang VARCHAR(7),
    headline VARCHAR(150),
    provider VARCHAR(40),
    url VARCHAR(255),
    timestamp TIMESTAMP
);

-- CREATE DATABASE "news-scraper"
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Dutch_Netherlands.1252'
--     LC_CTYPE = 'Dutch_Netherlands.1252'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;