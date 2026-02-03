/**
 * 데이터베이스 초기화 스크립트
 * - DATABASE_URL 있음 (Render 등): 해당 DB에 스키마만 실행
 * - DATABASE_URL 없음 (로컬): postgres에 연결해 DB 생성 후 스키마 실행
 */
require('dotenv').config();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const isRender = (process.env.DB_HOST || '').includes('render.com') || (process.env.DATABASE_URL || '').includes('render.com');
const sslOption = isRender ? { rejectUnauthorized: false } : undefined;

const defaultConfig = hasDatabaseUrl
  ? { connectionString: process.env.DATABASE_URL, ssl: sslOption }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_password',
      ssl: sslOption,
    };

const dbName = process.env.DB_NAME || 'order_app';

async function createDatabase() {
  // Render 등 클라우드 DB는 이미 생성되어 있음
  if (hasDatabaseUrl || isRender) return;

  const client = new Client(defaultConfig);

  try {
    await client.connect();
    console.log('✅ PostgreSQL에 연결되었습니다.');

    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ 데이터베이스 '${dbName}'가 생성되었습니다.`);
    } else {
      console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 생성 오류:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function createTables() {
  const appConfig = hasDatabaseUrl
    ? { connectionString: process.env.DATABASE_URL, ssl: sslOption }
    : { ...defaultConfig, database: dbName };

  const client = new Client(appConfig);

  try {
    await client.connect();
    console.log(hasDatabaseUrl ? '✅ 데이터베이스에 연결되었습니다.' : `✅ '${dbName}' 데이터베이스에 연결되었습니다.`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await client.query(schema);
    console.log('✅ 테이블 스키마가 생성되었습니다.');
    console.log('✅ 샘플 데이터가 삽입되었습니다.');
  } catch (error) {
    console.error('❌ 테이블 생성 오류:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function testConnection() {
  const appConfig = hasDatabaseUrl
    ? { connectionString: process.env.DATABASE_URL, ssl: sslOption }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: dbName,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'your_password',
        ssl: sslOption,
      };

  const client = new Client(appConfig);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 생성된 테이블 목록:');
    result.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    const menuCount = await client.query('SELECT COUNT(*) FROM menus');
    console.log(`\n📦 메뉴 개수: ${menuCount.rows[0].count}개`);

    const optionCount = await client.query('SELECT COUNT(*) FROM options');
    console.log(`📦 옵션 개수: ${optionCount.rows[0].count}개`);
  } catch (error) {
    console.error('❌ 연결 테스트 오류:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 데이터베이스 초기화 시작');
  console.log('========================================\n');

  try {
    await createDatabase();
    await createTables();
    await testConnection();

    console.log('\n========================================');
    console.log('✅ 데이터베이스 초기화 완료!');
    console.log('========================================');
  } catch (error) {
    console.error('\n❌ 초기화 실패:', error.message);
    process.exit(1);
  }
}

main();
