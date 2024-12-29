# felidae

A scraping service.

## News

Returns news headlines with timestamps and providers.

`/news`

### Path variables

- `/:category` - Options: `general`, `business`, `sport`, `entertainment`, `health` and `science`. Example: `/news/general` or `/news/business`.

### API query parameters

| Parameter | Description | Accepted values | Required | Example |
| --- | --- | --- | --- | --- | 
| `locale` | Country code (of origin) and language combination | Single selection from options: `de-de`, `gb-en`, `nl-nl`, `pl-pl`, `us-en` | Optional | `&locale=gb-en` |
| `cc` | Country code (of origin) | Single selection from options: `de`, `gb`, `nl`, `pl`, `us` | Optional | `&cc=de` |
| `lang` | Language | Single selection from options:  `de`, `en`, `nl`, `pl` | Optional | `&lang=en` |
| `page` | Page number. A single page contains 100 results. | Integer number greater than `0` | Optional | `&page=3` |
| `date` | Filter by date in UTC | Format: `YYYY-MM-DD` | Optional | `&date=1999-01-01` |
| `date-gt` (or `date_gt`, `dateGt`) | Filter by dates later than to provided date in UTC | Format: `YYYY-MM-DD` | Optional | `&date_gt=1999-01-01` |
| `date-gte` (or `date_gte`, `dateGte`) | Filter by dates later than or equal to provided date in UTC | Format: `YYYY-MM-DD` | Optional | `&date_gte=1999-01-01` |
| `date-lt` (or `date_lt`, `dateLt`) | Filter by dates earlier than to provided date in UTC | Format: `YYYY-MM-DD` | Optional | `&date_lt=1999-01-01` |
| `date-lte` (or `date_lte`, `date_lte`) | Filter by dates earlier than or equal to provided date in UTC. | Format: `YYYY-MM-DD` | Optional | `&date_lte=1999-01-01` |
| `sort-by` | Sort results ascending or descending by selected dimension. | Format: `<dimension> asc/desc`, where `dimension` is one of: `id`, `timestamp` | Optional | `&sort-by=timestamp desc` |

### Examples

- `/news/general?date=2021-01-01`
- `/news/business?sortBy=timestamp desc`
- `/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2`