# felidae

A scraping service.

## News

Returns news headlines with timestamps and providers.

`/news`

### Path variables

- `/:category` - Options: `general`, `business`, `sport`, `entertainment`, `health` and `science`. Example: `/news/general` or `/news/business`.

### API query parameters

<table>
    <thead>
        <tr>
            <th>Parameter</th>
            <th>Desctription</th>
            <th>Accepted values</th>
            <th>Required</th>
            <th>Example</th>
        </tr>
    </thead>
    <tr>
        <td>`locale`</td>
        <td>Country code (of origin) and language combination</td>
        <td>
            Single selection. Options:
            - `de-de` 
            - `gb-en`
            - `nl-nl`
            - `pl-pl`
            - `us-en`
        </td>
        <td>Optional</td>
        <td>`&locale=gb-en`</td>
    </tr>
    <tr>
        <td>`cc`</td>
        <td>Country code (of origin)</td>
        <td>
            Single selection. Options:
            - `de` 
            - `gb`
            - `nl`
            - `pl`
            - `us`
        </td>
        <td>Optional</td>
        <td>`&cc=de`</td>
    </tr>
    <tr>
        <td>`lang`</td>
        <td>Language</td>
        <td>
            Single selection. Options:
            - `de` 
            - `en`
            - `nl`
            - `pl`
        </td>
        <td>Optional</td>
        <td>`&lang=en`</td>
    </tr>
    <tr>
        <td>`page`</td>
        <td>Page number. A single page contains 100 results.</td>
        <td>Integer number greater than `0`</td>
        <td>Optional</td>
        <td>`&page=3`</td>
    </tr>
    <tr>
        <td>`date`</td>
        <td>Date in UTC</td>
        <td>Format: `YYYY-MM-DD`</td>
        <td>Optional</td>
        <td>`&date=1999-01-01`</td>
    </tr>
    <tr>
        <td>`date_gt`</td>
        <td>Filter by dates later than provided date in UTC.</td>
        <td>Format: `YYYY-MM-DD`</td>
        <td>Optional</td>
        <td>`&date_gt=2023-02-01`</td>
    </tr>
    <tr>
        <td>`date_gte`</td>
        <td>Filter by dates later than or equal to provided date in UTC.</td>
        <td>Format: `YYYY-MM-DD`</td>
        <td>Optional</td>
        <td>`&date_gte=2023-02-01`</td>
    </tr>
    <tr>
        <td>`date_lt`</td>
        <td>Filter by date earlier than provided date in UTC.</td>
        <td>Format: `YYYY-MM-DD`</td>
        <td>Optional</td>
        <td>`&date_lt=2023-02-01`</td>
    </tr>
    <tr>
        <td>`date_lte`</td>
        <td>Filter by date earlier than or equal to provided date in UTC.</td>
        <td>Format: `YYYY-MM-DD`</td>
        <td>Optional</td>
        <td>`&date_lte=2023-02-01`</td>
    </tr>
</table>

### Examples

- `/news/general?date=2021-01-01`
- `/news/business?sortBy=timestamp desc`
- `/news/sport?cc=de&date_gte=2021-01-01&date_lt=2021-02-01&page=2`