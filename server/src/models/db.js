/**
 * PostgreSQL 데이터베이스 연결 모듈
 */
const { Pool } = require('pg');
const dbConfig = require('../config/database');

// 커넥션 풀 생성
const pool = new Pool(dbConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('📦 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err);
  process.exit(-1);
});

/**
 * 쿼리 실행 함수
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise} 쿼리 결과
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('쿼리 실행:', { text, duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('쿼리 오류:', error);
    throw error;
  }
};

/**
 * 트랜잭션을 위한 클라이언트 가져오기
 * @returns {Promise} 클라이언트
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  query,
  getClient,
  pool,
};
