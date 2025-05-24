# felidae

A scraping service.

## News

Returns news headlines with timestamps and providers.

`/news`

### Path variables

| Path | Accepted values | Example |
| --- | --- | --- |
|`/:category` | `general`, `business`, `sport`, `entertainment`, `health`, `science`, `mercury`, `venus`, `earth`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto` | `/news/business` |

### API query parameters

| Parameter | Aliases | Description | Accepted values | Required | Example |
| --- | --- | --- | --- | --- | --- | 
| `locale` | --- | Country code (of origin) and language combination. Takes priority over `cc` and `lang`. | Single selection from options: `de-de`, `gb-en`, `nl-nl`, `pl-pl`, `us-en` | Optional | `&locale=gb-en` |
| `cc` | `countrycode`, `country_code` | Country code (of origin). Will be ignored if `locale` is also provided. | Single selection from options: `de`, `gb`, `nl`, `pl`, `us` | Optional | `&cc=de` |
| `lang` | `language` | Language. Will be ignored if `locale` is also provided. | Single selection from options:  `de`, `en`, `nl`, `pl` | Optional | `&lang=en` |
| `page` | --- | Page number. A single page contains 100 results by default, unless the `items` parameter specifies differently. | Integer number greater than `0` | Optional | `&page=3` |
| `items` | --- | Number of items per page. Defaults to `100`. | Integer number greater than `0` and less than `500` | Optional | `&items=10` |
| `date` | --- | Filter by date. | Format: `YYYY-MM-DD` in UTC | Optional | `&date=1999-01-01` |
| `dategt` | `date_gt` | Filter by dates later than to provided date. | Format: `YYYY-MM-DD` in UTC | Optional | `&date_gt=1999-01-01` |
| `dategte` | `date_gte` | Filter by dates later than or equal to provided date. | Format: `YYYY-MM-DD` in UTC | Optional | `&date_gte=1999-01-01` |
| `datelt` | `date_lt` | Filter by dates earlier than to provided date. | Format: `YYYY-MM-DD` in UTC | Optional | `&date_lt=1999-01-01` |
| `datelte` | `date_lt` | Filter by dates earlier than or equal to provided. | Format: `YYYY-MM-DD` in UTC | Optional | `&date_lte=1999-01-01` |
| `sortby` | `sort_by` | Sort results ascending or descending by selected dimension. | Format: `<dimension> <sort-order>`, where `dimension` is one of: `id`, `timestamp` and `sort-order` can be optionally provided as `asc` or `desc` (if not provided, will default to `asc`) | Optional | `&sort-by=timestamp` (defaults to `asc`), `&sort-by=timestamp desc` |

### Examples

- [/news/general?date=2023-01-01](https://felidae.spookydoodle.com/news/general?date=2023-01-01)
- [/news/business?sortBy=timestamp%20desc](https://felidae.spookydoodle.com/news/business?sortBy=timestamp%20desc)
- [/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2](https://felidae.spookydoodle.com/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2&items=50)