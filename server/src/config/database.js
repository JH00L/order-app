/**
 * 데이터베이스 설정
 * Render 등에서는 DATABASE_URL 하나만 설정하면 됨
 */
const isRender = (process.env.DB_HOST || '').includes('render.com') || (process.env.DATABASE_URL || '').includes('render.com');
const sslOption = isRender ? { rejectUnauthorized: false } : undefined;

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: sslOption }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'order_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_password',
      ssl: sslOption,
    };

module.exports = config;
