# wikifolio-watcher

Small utility to monitor [wikifolios](https://www.wikifolio.com) for transactions. It will create a RSS feed based on the wikifolio.com website.

## How to use `wikifolio-watcher`?

### 1. Getting ready
- `git clone ...`
- `yarn install --frozen-lockfile`
- `yarn build`

### 2. Configuration
- Use environment variables
- or `.env` file:
  ```
  WIKIFOLIO_USERNAME = e@mail
  WIKIFOLIO_PASSWORD = secret
  # optional:
  # DEBUG = wikifolio-watcher:*
  # DEBUG_SHOW_BROWSER = true
  ```

### 3. Run `wikifolio-watcher`
The utility takes one or multiple wikifolio symbols (`wf...`) as command line arguments, e.g.  
`yarn start wfabcdef`

This will create one file for each wikifolio, e.g. `wikifolio-wfabcdef-transactions.rss`.

### 4. And now?
You can do whatever you like, e.g.
- Run this command regularly
- Make the files available using a webserver
- Use your favorite feed reader
- ...
