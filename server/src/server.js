const { createApp } = require("./app");
const { createPool, initSchema } = require("./db");

const PORT = process.env.PORT || 4000;
const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/cst_sms";

async function main() {
  const pool = createPool(DATABASE_URL);
  await initSchema(pool);

  const app = createApp(pool);
  app.listen(PORT, () => {
    console.log(`CST SMS API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
