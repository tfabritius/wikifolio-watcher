import axios from 'axios'
import puppeteer from 'puppeteer'

import Debug from 'debug'
const log = Debug('wikifolio-watcher:WikifolioScraper')

export interface Wikifolio {
  id: string
  symbol: string
  title: string
  url: string
}

export interface Transaction {
  id?: string
  name?: string
  isin?: string
  orderType?: string
  executionDate?: string
}

/**
 * Scraper for wikifolio.com
 */
export class WikifolioScraper {
  private browser: puppeteer.Browser
  private cookie = ''

  constructor(browser: puppeteer.Browser) {
    this.browser = browser
  }

  async login(username: string, password: string): Promise<void> {
    const page = await this.browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    try {
      log(`Login in to wikifolio.com (user: ${username})...`)
      await page.goto('https://www.wikifolio.com/')

      // Click "Login"
      await page.waitForSelector('a.js-login-button')
      await page.click('a.js-login-button')

      // Enter credentials
      await page.waitForSelector('#Username')
      await page.keyboard.type(username)
      await page.keyboard.press('Tab')
      await page.keyboard.type(password)

      // If successful, url will change
      const navigationPromise = page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 5000,
      })

      await page.keyboard.press('Enter')

      // Wait for promise
      await navigationPromise

      log('Login successful.')

      // Store cookies for reuse outside puppeteer
      this.cookie = (await page.cookies())
        .map((cookie) => cookie.name + '=' + cookie.value)
        .join('; ')
    } catch (err) {
      log('Login failed (timeout).')
      throw new Error(`Could not login to wikifolio.com (user: ${username})`)
    } finally {
      page.close()
    }
  }

  async getWikifolio(symbol: string): Promise<Wikifolio> {
    const page = await this.browser.newPage()
    const url = 'https://www.wikifolio.com/de/de/w/' + symbol
    log('Browsing:', url)

    await page.goto(url, { waitUntil: 'load' })

    const id = await page.$eval('button[data-wikifolioid]', (el) =>
      el.getAttribute('data-wikifolioid'),
    )
    if (!id) {
      throw Error(`WikifolioId not found for symbol: ${symbol}`)
    }
    log('Got WikifolioId:', id)

    const title =
      (await page.$eval(
        'span.c-wf-head__title-text',
        (el) => el.textContent,
      )) ?? ''
    log('Got title:', title)

    return { id, symbol, title, url }
  }

  async getTransactions(
    wikifolio: Wikifolio,
    lastN = 10,
  ): Promise<Array<Transaction>> {
    const url = `https://www.wikifolio.com/api/wikifolio/${
      wikifolio.id
    }/tradehistory?page=0&pageSize=${lastN}&country=de&language=de&_=${Date.now()}`
    log(`Getting transactions, URL: ${url}`)

    const response = await axios.get(url, {
      headers: {
        accept: '*/*',
        'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
        cookie: this.cookie,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalPages = response.data.pageCount

    return response.data.tradeHistory.orders
  }
}
