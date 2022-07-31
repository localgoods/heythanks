import { Pool } from "pg"

/**
 * Create a new postgres pool (https://node-postgres.com/features/pooling)
 * 
 * @returns {pg.Pool} Postgres pool capable of handling frequent queries
 */
export const createPgClient = () => {
    const dev = !!process.env.DEV_APP
    const pgUrl = process.env.DATABASE_URL

    const pgConfig = {
        connectionString: pgUrl,
        ssl: { rejectUnauthorized: false }
    }

    if (dev) {
        pgConfig.ssl = getDevSslConfig(pgUrl)
    }
    
    return new Pool(pgConfig)
}

/**
 * Get the ssl config needed for development given a database url
 * 
 * @param {string} pgUrl - Postgres database url
 * @returns {pg.PoolConfig} Postgres pool config object
 */
function getDevSslConfig(pgUrl) {
    const isLocalDb = pgUrl.includes("shane") || pgUrl.includes("ianherrington")
    if (isLocalDb) return false
    return { rejectUnauthorized: false }
}