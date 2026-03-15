const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rappi_lab",
  password: "coral123",
  port: 5432,
});

module.exports = pool;