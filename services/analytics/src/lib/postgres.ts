// Todo export the pool instead and add init logic for sharing between modules

import { Pool, PoolClient, PoolConfig } from "pg"

/**
 * Class for interacting with a postgres pool
 */
export class PgPool {
    private pool: Pool
    constructor() {
        const pgPoolConfig = getPgPoolConfig()
        this.pool = new Pool(pgPoolConfig)
    }
    async connect(): Promise<PoolClient> {
        return await this.pool.connect()
    }
}

/**
 * Create a new postgres pool (https://node-postgres.com/features/pooling)
 * 
 * @returns {PoolConfig} Postgres pool capable of handling frequent queries
 */
function getPgPoolConfig(): PoolConfig {
    const dev = process.env.NODE_ENV !== "production"
    const pgUrl = process.env.DATABASE_URL
    const pgConfig = {
        connectionString: pgUrl,
        ssl: { rejectUnauthorized: false } as PoolConfig["ssl"]
    }
    if (dev) {
        const isLocalDb = pgUrl.includes("shane") || pgUrl.includes("ianherrington")
        if (isLocalDb) pgConfig.ssl = false
        else pgConfig.ssl = { rejectUnauthorized: false }
    }
    return pgConfig
}