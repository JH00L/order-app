/**
 * 서버 진입점
 */
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 서버가 시작되었습니다.`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});
