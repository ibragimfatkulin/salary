import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Загружаем переменные из server/.env и корневого .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.error('\n❌ Ошибка: Переменная TURSO_DATABASE_URL не указана!');
  console.log('\nПожалуйста, укажите TURSO_DATABASE_URL и TURSO_AUTH_TOKEN в файле server/.env:');
  console.log('TURSO_DATABASE_URL=libsql://your-db-name.turso.io');
  console.log('TURSO_AUTH_TOKEN=your-turso-token\n');
  process.exit(1);
}

const localDbPath = path.resolve(__dirname, '../salary_tracker.db');

if (!fs.existsSync(localDbPath)) {
  console.error(`\n❌ Локальный файл базы данных не найден по пути: ${localDbPath}`);
  process.exit(1);
}

console.log('🚀 Начинаем миграцию данных в Turso...');
console.log(`📁 Локальная БД: ${localDbPath}`);
console.log(`🌐 Turso URL: ${tursoUrl}\n`);

async function migrate() {
  const localClient = createClient({
    url: `file:${localDbPath.replace(/\\/g, '/')}`,
  });

  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  // 1. Создаем схему в Turso
  console.log('1️⃣  Создание схемы таблиц в Turso...');
  await tursoClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incomes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      comment TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurring_period TEXT,
      recurring_end_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      comment TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurring_period TEXT,
      recurring_end_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
    CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  `);
  console.log('✅ Схема таблиц успешно создана/проверена');

  // 2. Перенос пользователей
  console.log('\n2️⃣  Миграция пользователей (users)...');
  const localUsers = await localClient.execute('SELECT * FROM users');
  console.log(`Найдено пользователей в локальной БД: ${localUsers.rows.length}`);

  let insertedUsers = 0;
  for (const user of localUsers.rows) {
    await tursoClient.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, password_hash, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [user.id, user.email, user.password_hash, user.created_at, user.updated_at],
    });
    insertedUsers++;
  }
  console.log(`✅ Пользователи перенесены (${insertedUsers})`);

  // 3. Перенос доходов
  console.log('\n3️⃣  Миграция доходов (incomes)...');
  const localIncomes = await localClient.execute('SELECT * FROM incomes');
  console.log(`Найдено доходов в локальной БД: ${localIncomes.rows.length}`);

  let insertedIncomes = 0;
  for (const inc of localIncomes.rows) {
    await tursoClient.execute({
      sql: `INSERT OR IGNORE INTO incomes (
              id, user_id, amount, date, category, comment, 
              is_recurring, recurring_period, recurring_end_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        inc.id,
        inc.user_id,
        inc.amount,
        inc.date,
        inc.category,
        inc.comment,
        inc.is_recurring,
        inc.recurring_period,
        inc.recurring_end_date,
        inc.created_at,
        inc.updated_at,
      ],
    });
    insertedIncomes++;
  }
  console.log(`✅ Доходы перенесены (${insertedIncomes})`);

  // 4. Перенос расходов
  console.log('\n4️⃣  Миграция расходов (expenses)...');
  const localExpenses = await localClient.execute('SELECT * FROM expenses');
  console.log(`Найдено расходов в локальной БД: ${localExpenses.rows.length}`);

  let insertedExpenses = 0;
  for (const exp of localExpenses.rows) {
    await tursoClient.execute({
      sql: `INSERT OR IGNORE INTO expenses (
              id, user_id, amount, date, category, comment, 
              is_recurring, recurring_period, recurring_end_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        exp.id,
        exp.user_id,
        exp.amount,
        exp.date,
        exp.category,
        exp.comment,
        exp.is_recurring,
        exp.recurring_period,
        exp.recurring_end_date,
        exp.created_at,
        exp.updated_at,
      ],
    });
    insertedExpenses++;
  }
  console.log(`✅ Расходы перенесены (${insertedExpenses})`);

  // 5. Проверка итогов в Turso
  const tursoUsers = await tursoClient.execute('SELECT count(*) as count FROM users');
  const tursoIncomes = await tursoClient.execute('SELECT count(*) as count FROM incomes');
  const tursoExpenses = await tursoClient.execute('SELECT count(*) as count FROM expenses');

  console.log('\n======================================');
  console.log('🎉 Миграция успешно завершена!');
  console.log('Итого записей в Turso:');
  console.log(`👥 Пользователи: ${tursoUsers.rows[0].count}`);
  console.log(`📈 Доходы:       ${tursoIncomes.rows[0].count}`);
  console.log(`📉 Расходы:      ${tursoExpenses.rows[0].count}`);
  console.log('======================================\n');
}

migrate().catch((err) => {
  console.error('\n❌ Ошибка во время миграции:', err);
  process.exit(1);
});
