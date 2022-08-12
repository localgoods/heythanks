import express from 'express'
import Shopify, { shopQuery } from '../lib/shopify'
import Postgres from '../lib/postgres'
const postgres = new Postgres()
const shopify = new Shopify()

export default async function shop(req: express.Request) {
  const { shop } = req.query
  const postgresClient = await postgres.connect()
  const shopsMeta = await postgresClient.query(`SELECT access_token FROM shop where shop = '${shop}'`)
  const accessToken = shopsMeta.rows[0]((meta: { access_token: string }) => meta.access_token)
  return await getShop(shop as string, accessToken)
}

export async function getShop(domain: string, accessToken: string) {
  const shopifyClient = shopify.graphql(domain, accessToken)
  const shopData = await shopifyClient.query({
      data: {
          query: shopQuery,
      }
  })
  const { shop } = (shopData.body as any).data
  return shop
}
