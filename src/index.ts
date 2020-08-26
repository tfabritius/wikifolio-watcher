import dotenv = require('dotenv')
dotenv.config()

import puppeteer from 'puppeteer'

import Debug from 'debug'
const log = Debug('wikifolio-watcher:index')

import commandLineArgs from 'command-line-args'

import { WikifolioScraper } from './WikifolioScraper'
import { generateTransactionFeed } from './generateFeed'

import fs from 'fs'

async function main() {
  if (!process.env.WIKIFOLIO_USERNAME || !process.env.WIKIFOLIO_PASSWORD) {
    console.error('Credentials missing.')
    process.exit(1)
  }

  const options = commandLineArgs([
    { name: 'symbol', type: String, multiple: true, defaultOption: true },
  ])
  if (!options.symbol) {
    console.error('Wikifolio symbols missing.')
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    headless: process.env.DEBUG_SHOW_BROWSER !== 'true',
  })

  try {
    const wikifolioScraper = new WikifolioScraper(browser)
    await wikifolioScraper.login(
      process.env.WIKIFOLIO_USERNAME,
      process.env.WIKIFOLIO_PASSWORD,
    )

    for (const symbol of options.symbol as Array<string>) {
      log(`Processing wikifolio ${symbol}`)
      const wikifolio = await wikifolioScraper.getWikifolio(symbol)
      const transactions = await wikifolioScraper.getTransactions(wikifolio)
      const feed = generateTransactionFeed(wikifolio, transactions)

      const filename = `wikifolio-${symbol}-transactions.rss`
      log(`Writing to file ${filename}...`)
      await fs.promises.writeFile(filename, feed)
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
