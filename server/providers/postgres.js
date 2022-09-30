// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Pool, PoolConfig } from "pg"

/**
 * Client class for interacting with a postgres pool
 */
export class Postgres {
    #pool

    constructor() {
        const poolConfig = getPoolConfig()
        this.#pool = new Pool(poolConfig)
    }

    async connect() {
        return await this.#pool.connect()
    }
}

/**
 * Create a new postgres pool (https://node-postgres.com/features/pooling)
 * 
 * @returns {PoolConfig} Postgres pool capable of handling frequent queries
 */
function getPoolConfig() {
    const dev = !!process.env.DEV_APP
    const postgresUrl = process.env.DATABASE_URL
    const poolConfig = {
        connectionString: postgresUrl,
        ssl: { rejectUnauthorized: false }
    }
    if (dev) {
        const isLocalDb = postgresUrl?.includes("shane") || postgresUrl?.includes("ianherrington")
        if (isLocalDb) poolConfig.ssl = false
        else poolConfig.ssl = { rejectUnauthorized: false }
    }
    return poolConfig
}

export default new Postgres()