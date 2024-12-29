# felidae

A scraping service.

## News

Returns news headlines with timestamps and providers.

`/news`

### Path variables

- `/:category` - Options: `general`, `business`, `sport`, `entertainment`, `health` and `science`. Example: `/news/general` or `/news/business`.

### API query parameters

<table>
    <tr>
        <td>test</td>
        <td>test</td>
    </tr>
    <tr>
        <td>test</td>
        <td>test</td>
    </tr>
</table>

- `locale` - Country code (of origin) and language combination. Optional. Options: `de-de`, `gb-en`, `nl-nl`, `pl-pl`, `us-en`. Example `locale=gb-en`.
- `cc` - Country code (of origin). Example: `cc=de`.
- `lang` - Optional. Language. Example: `lang=pl`.
- `page` - Page number as integer number greater than `0`. A single page returns 100 results. Optional. Example: `page=10`.
- `date` - Date in format `YYYY-MM-DD` equal to (in UTC). Optional. Example: `date=1999-01-01`.
- `date_gt` - Date greater than (in UTC). Optional. Example `date_gt=2023-02-01`.
- `date_gte` - Date greater than or equal (in UTC). Optional. Example `date_gte=2023-02-01`.
- `date_lt` - Date less than (in UTC). Optional. Example `date_lt=2023-02-01`.
- `date_lte` - Date less than or equal (in UTC). Optional. Example `date_lte=2023-02-01`.

### Examples

- `/news/general?date=2021-01-01`
- `/news/business?sortBy=timestamp desc`
- `/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2`