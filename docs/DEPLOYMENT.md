# Render.com 배포 가이드

## 배포 순서

**1 → 2 → 3** 순서로 진행해야 합니다. (아래 서비스가 위 서비스의 URL/정보를 사용합니다.)

| 순서 | 서비스 | 이유 |
|------|--------|------|
| **1** | PostgreSQL | 백엔드가 DB 연결 정보가 필요함 |
| **2** | Backend (Express) | 프론트엔드 빌드 시 백엔드 API URL이 필요함 |
| **3** | Frontend (React) | 백엔드 API URL을 환경 변수로 넣어 빌드함 |

---

## 1단계: PostgreSQL 배포

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **PostgreSQL**
2. 설정:
   - **Name**: `order-app-db` (원하는 이름)
   - **Region**: Singapore 또는 가까운 지역
   - **Plan**: Free 선택
3. **Create Database** 클릭
4. 생성 후 **Connect** 화면에서 다음 정보 확인/복사:
   - **Internal Database URL** (같은 Render 내부 서비스용, 백엔드에서 사용)
   - **External Database URL** (로컬에서 접속할 때만 사용)
5. **Environment** 탭에서 **Internal Database URL** 값을 복사해 두기 (2단계에서 사용)

> ⚠️ Free PostgreSQL는 90일 후 삭제됩니다. 실서비스는 유료 플랜 사용을 권장합니다.

---

## 2단계: Backend (Express) 배포

1. **New +** → **Web Service**
2. 저장소 연결:
   - GitHub 저장소 선택 후 **order-app** 연결
   - **Root Directory**: `server` 로 설정 (프로젝트 루트가 아닌 server 폴더만 배포)
3. 설정:
   - **Name**: `order-app-api` (원하는 이름)
   - **Region**: 1단계 DB와 동일 지역 권장
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Advanced** → **Add Environment Variable** 에서 아래 변수 추가:

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `PORT` | (비워두기 – Render가 자동 지정) |
   | `DB_HOST` | (1단계 DB의 Host) |
   | `DB_PORT` | (1단계 DB의 Port, 보통 5432) |
   | `DB_NAME` | (1단계 DB의 Database 이름) |
   | `DB_USER` | (1단계 DB의 User) |
   | `DB_PASSWORD` | (1단계 DB의 Password) |

   또는 **Internal Database URL** 하나만 쓰려면:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | (1단계에서 복사한 **Internal Database URL** 전체) |

   > `DATABASE_URL`을 쓰려면 서버 코드에서 이 한 줄로 DB 연결하도록 수정이 필요합니다. 아래 “선택: DATABASE_URL 사용” 참고.

5. **Create Web Service** 클릭
6. 첫 배포가 끝난 뒤, **Shell** 탭에서 DB 초기화 실행:
   - 서비스 상세 화면에서 **Shell** 탭 클릭 → **Open Shell**
   - 아래 명령 실행 (테이블 생성 + 샘플 데이터 삽입)
   ```bash
   npm run db:init
   ```
7. 배포된 백엔드 URL 복사 (예: `https://order-app-api.onrender.com`) → 3단계에서 사용

---

## 3단계: Frontend (React) 배포

1. **New +** → **Static Site**
2. 저장소 연결:
   - 같은 GitHub **order-app** 저장소 선택
   - **Root Directory**: `ui` 로 설정
3. 설정:
   - **Name**: `order-app-web` (원하는 이름)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment** 에서 변수 추가:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | 2단계 백엔드 URL + `/api` (예: `https://order-app-api.onrender.com/api`) |

   > ⚠️ 반드시 빌드 시점에 설정해야 하므로, **첫 배포 전에** 이 변수를 넣고 저장한 뒤 Deploy 하세요.

5. **Create Static Site** 클릭
6. 빌드가 끝나면 사이트 URL로 접속 (예: `https://order-app-web.onrender.com`)

---

## 환경 변수 요약

### Backend (Web Service)

- **권장: DATABASE_URL**  
  Render PostgreSQL의 **Internal Database URL** 을 `DATABASE_URL` 에 넣기 (이 프로젝트는 이미 지원함)

- **또는 개별 변수**  
  `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Frontend (Static Site)

- `VITE_API_URL`: 백엔드 주소 + `/api` (예: `https://order-app-api.onrender.com/api`)

---

## 체크리스트

- [ ] 1단계: PostgreSQL 생성 후 Internal Database URL 복사
- [ ] 2단계: Web Service Root Directory = `server`, Build/Start 명령 확인
- [ ] 2단계: DB 환경 변수 설정 (개별 변수 또는 DATABASE_URL)
- [ ] 2단계: 배포 후 Shell에서 `npm run db:init` 실행 (필요 시)
- [ ] 2단계: 백엔드 URL 복사 (예: `https://order-app-api.onrender.com`)
- [ ] 3단계: Static Site Root Directory = `ui`
- [ ] 3단계: `VITE_API_URL` = 백엔드 URL + `/api` 설정 후 배포
- [ ] 브라우저에서 프론트 URL 접속 후 메뉴 조회·주문·관리자 동작 확인

---

## 참고

- **Free Tier**: 서비스가 일정 시간 미사용 시 sleep 되며, 첫 요청 시 깨우는 데 시간이 걸릴 수 있습니다.
- **CORS**: 현재 백엔드에서 `cors()`를 사용 중이므로, 프론트 도메인이 바뀌어도 기본 설정으로 동작합니다. 특정 도메인만 허용하려면 `app.js`에서 origin을 제한할 수 있습니다.
- **환경별 API URL**: 로컬은 `VITE_API_URL` 없이 `http://localhost:3000/api`, 배포는 Render 백엔드 URL을 사용하도록 위처럼 설정하면 됩니다.
