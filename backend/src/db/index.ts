import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ENV } from "../config/env";


if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// initialize(başlat) PostgreSQL connection pool
const pool = new Pool({ connectionString: ENV.DATABASE_URL });


// log when first connection is made
pool.on("connect", () => {
  console.log("Database connected successfully ✅");
});

// log when an error occurs
pool.on("error", (err) => {
  console.error("💥 Database connection error:", err);
});

export const db = drizzle({ client: pool, schema });

// 👀 Connection Pool (Bağlantı Havuzu) Nedir?
// Connection Pool, açık tutulan ve tekrar kullanılan veritabanı
// bağlantılarının bir önbelleğidir.

// 🤷‍♂️ Neden kullanılır?
// 🔴 Bağlantıları açmak/kapatmak yavaştır. Her istek için yeni bir bağlantı
// oluşturmak yerine, mevcut bağlantıları tekrar kullanırız.
// 🔴 Veritabanları eş zamanlı bağlantı sayısını sınırlar. Connection Pool,
// belirli sayıda bağlantıyı yönetir ve bu bağlantıları istekler arasında paylaşır.

