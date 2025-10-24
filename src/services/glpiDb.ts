import mysql from "mysql2/promise";

const host = process.env.GLPI_IP || process.env.GLPI_DB_HOST || "localhost";
const port = Number(process.env.GLPI_DB_PORT || 3306);
const user = process.env.GLPI_USER_DB || process.env.GLPI_DB_USER || "root";
const password =
  process.env.GLPI_PASSWORD_DB || process.env.GLPI_DB_PASSWORD || "";
const database = process.env.GLPI_DB || process.env.GLPI_DB_NAME || "glpi";

const useSsl = String(process.env.GLPI_DB_SSL || "0") === "1";
const rejectUnauthorized =
  String(process.env.GLPI_DB_SSL_REJECT_UNAUTHORIZED || "0") === "1";

let ssl: any = undefined;
if (useSsl) {
  ssl = { rejectUnauthorized };
  const ca = process.env.GLPI_DB_SSL_CA;
  if (ca) ssl.ca = ca;
}

// Log leve sem credenciais
// console.log("[GLPI DB] Pool config:", { host, port, database, useSsl });
console.log("[GLPI DB] Pool inicializado.");

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl,
});

export async function listItilCategories(): Promise<
  Array<{ id: number; completename: string }>
> {
  try {
    console.log("[GLPI DB] Testando conexão...");
    const conn = await pool.getConnection();
    conn.release();

    const [rows] = await pool.query(
      "SELECT id, completename FROM glpi_itilcategories ORDER BY completename ASC"
    );
    return rows as Array<{ id: number; completename: string }>;
  } catch (err: any) {
    console.error("[GLPI DB] Erro na consulta:", {
      code: err?.code,
      message: err?.message,
    });
    throw err;
  }
}
export async function listLocations(): Promise<
  Array<{ id: number; completename: string }>
> {
  try {
    console.log("[GLPI DB] Testando conexão...");
    const conn = await pool.getConnection();
    conn.release();

    const [rows] = await pool.query(
      "SELECT id, completename FROM glpi_locations ORDER BY completename ASC"
    );
    return rows as Array<{ id: number; completename: string }>;
  } catch (err: any) {
    console.error("[GLPI DB] Erro na consulta:", {
      code: err?.code,
      message: err?.message,
    });
    throw err;
  }
}
export async function listGroups(): Promise<
  Array<{ id: number; name: string }>
> {
  try {
    console.log("[GLPI DB] Testando conexão...");
    const conn = await pool.getConnection();
    conn.release();

    const [rows] = await pool.query(
      "SELECT id, completename FROM glpi_groups ORDER BY completename ASC"
    );
    return rows as Array<{ id: number; name: string }>;
  } catch (err: any) {
    console.error("[GLPI DB] Erro na consulta:", {
      code: err?.code,
      message: err?.message,
    });
    throw err;
  }
}

// Busca o usuário do GLPI pelo login (campo 'name' em glpi_users)
export async function findGlpiUserByLogin(
  login: string
): Promise<{ id: number; name: string } | null> {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM glpi_users WHERE name = ? LIMIT 1",
      [login]
    );
    const arr = rows as Array<{ id: number; name: string }>;
    return arr?.[0] ?? null;
  } catch (err: any) {
    console.error("[GLPI DB] Erro ao buscar usuário:", {
      code: err?.code,
      message: err?.message,
    });
    throw err;
  }
}
