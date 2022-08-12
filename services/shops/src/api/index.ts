import express from 'express'
import { getShop } from './shop'
import Postgres from '../lib/postgres'
const postgres = new Postgres()

const forbiddenList = ['hanging-with-the-kiddos.myshopify.com']

export default async function shops(req: express.Request) {
    console.log('QUERY', req.query)
    const postgresClient = await postgres.connect()
    const shopMeta = await postgresClient.query(`SELECT * FROM shop where access_token is not null`)

    const shopOperations = shopMeta.rows
        .filter(({ shop, access_token }) => !!shop && !!access_token && !forbiddenList.includes(shop))
        .map(async ({ shop, access_token }) => await getShop(shop, access_token))

    return await Promise.all(shopOperations)
}