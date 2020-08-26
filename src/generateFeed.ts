import { Feed } from 'feed'
import { Transaction, Wikifolio } from './WikifolioScraper'

export function generateTransactionFeed(
  wikifolio: Wikifolio,
  transactions: Array<Transaction>,
  format?: 'rss2' | 'atom1' | 'json1',
): string {
  format = format ?? 'rss2'

  let latestTransactionDate = new Date(1970, 1, 1)

  const feed = new Feed({
    title: wikifolio.title + ' - Transactions',
    description: `Transactions from Wikifolio ${wikifolio.symbol}`,
    id: wikifolio.url,
    link: wikifolio.url,
    copyright: '',
    generator: 'wikifolio-watcher',
  })

  for (const t of transactions) {
    const transactionDate = new Date(t.executionDate ?? '')

    feed.addItem({
      id: t.id,
      date: transactionDate,
      title: t.orderType + ' ' + t.name,
      link: '',
      description: '',
      content: '',
    })

    if (transactionDate > latestTransactionDate) {
      latestTransactionDate = transactionDate
    }
  }

  feed.options.updated = latestTransactionDate

  return feed[format]() // feed.rss2()
}
