const { Pool } = require('pg');

// Supabase exige SSL. rejectUnauthorized:false evita erro de certificado em ambiente de estudo.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
