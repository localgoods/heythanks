import express from 'express'
import { getShop } from './shop'
import Postgres from '../lib/postgres'
const postgres = new Postgres()

const hiddenShops = [
    'hanging-with-the-kiddos.myshopify.com', 
    'urban-edc-supply-staging.myshopify.com', 
    'spotted-by-humphrey-staging.myshopify.com', 
    'loop-chocolate.myshopify.com', 
    'appstoretest8.myshopify.com', 
    'shopwayre-staging.myshopify.com'
]

export default async function shops(req: express.Request) {
    console.log('QUERY', req.query)
    const postgresClient = await postgres.connect()
    const shopMeta = await postgresClient.query(`SELECT * FROM shop`)

    const shopOperations = shopMeta.rows
        .filter(({ shop, access_token }) => !!shop && !!access_token && !hiddenShops.includes(shop))
        .map(async ({ shop, access_token }) => await getShop(shop, access_token))

    return await Promise.all(shopOperations)
}