/**
 * Server-only database access. The browser bundle does not import this file.
 * `@netlify/database` is loaded only when a request runs, and only if it is installed.
 * Installing that package is the step that lets a later deploy create the hosted database.
 */

declare const Netlify: {
  env: {
    get(name: string): string | undefined
  }
}

export type DbClient = {
  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>
  release(): void
}

type DatabaseModule = {
  getDatabase: () => {
    pool: {
      connect: () => Promise<DbClient>
    }
  }
}

export function privateDatabaseConfigured(): boolean {
  return Boolean(Netlify.env.get("NETLIFY_DB_URL"))
}

export async function connectPrivateDatabase(): Promise<DbClient | null> {
  if (!privateDatabaseConfigured()) return null
  try {
    const specifier = "@netlify/database"
    const loaded = (await import(specifier)) as DatabaseModule
    return await loaded.getDatabase().pool.connect()
  } catch {
    return null
  }
}

export async function withPrivateDatabase<T>(
  actor: { userId: string; role: string },
  work: (client: DbClient) => Promise<T>,
): Promise<T | null> {
  const client = await connectPrivateDatabase()
  if (!client) return null
  try {
    await client.query("BEGIN")
    await client.query("SELECT set_config('app.actor_id', $1, true)", [actor.userId])
    await client.query("SELECT set_config('app.actor_role', $1, true)", [actor.role])
    const result = await work(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch {
      /* The connection is discarded below. */
    }
    throw error
  } finally {
    client.release()
  }
}

export function databaseUnavailable(): Response {
  return Response.json(
    {
      error: "unavailable",
      code: "database_not_activated",
      message: "The private database package is not installed for this deploy.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  )
}
