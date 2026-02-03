# 프론트엔드(UI) Render 배포 가이드

## 1. 코드에서 수정할 부분

### 수정 없음 (이미 반영됨)

- **API 주소**: `ui/src/api/client.js` 에서 `import.meta.env.VITE_API_URL` 을 사용하고 있어, Render에서 환경 변수만 넣으면 됨.
- **기본값**: `VITE_API_URL` 이 없으면 `http://localhost:3000/api` 로 동작 (로컬 개발용).

### 추가된 파일 (참고용)

- **`ui/.env.example`**: 배포 시 필요한 환경 변수 설명. 로컬에서 복사해 `.env` 로 쓰거나, Render에서는 직접 환경 변수만 설정하면 됨.

### 정리

- **코드 수정은 하지 않아도 됨.**
- 배포 시 **Render 대시보드에서 `VITE_API_URL` 만 설정**하면 됨.

---

## 2. Render 배포 과정

### 사전 준비

- GitHub 에 `order-app` 저장소가 연결되어 있어야 함.
- **백엔드가 이미 Render에 배포되어 있고**, 그 서비스 URL을 알고 있어야 함.  
  예: `https://order-app-api.onrender.com`

---

### Step 1: Static Site 생성

1. [Render Dashboard](https://dashboard.render.com) 로그인
2. **New +** → **Static Site** 선택
3. **Connect a repository** 에서 GitHub 계정 연결 후 **order-app** 저장소 선택
4. **Connect** 클릭

---

### Step 2: 설정 입력

| 항목 | 값 |
|------|-----|
| **Name** | `order-app-web` (원하는 이름) |
| **Region** | 가까운 지역 (예: Singapore) |
| **Branch** | `main` (사용 중인 기본 브랜치) |
| **Root Directory** | **`ui`** ← 반드시 입력 |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

- **Root Directory** 를 `ui` 로 해야 `ui` 폴더 기준으로 `npm install` / `npm run build` 가 실행됨.
- **Publish Directory** `dist` 는 Vite 빌드 결과 폴더 이름.

---

### Step 3: 환경 변수 설정 (필수)

1. **Environment** 섹션으로 이동
2. **Add Environment Variable** 클릭
3. 아래 한 개 추가:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | 백엔드 URL + `/api` |

**예시** (백엔드 URL이 `https://order-app-api.onrender.com` 인 경우):

- **Key**: `VITE_API_URL`
- **Value**: `https://order-app-api.onrender.com/api`

- **주의**: `VITE_API_URL` 은 **빌드 시점**에만 사용됩니다.  
  **첫 배포 전에** 이 변수를 저장한 뒤 Deploy 해야, 배포된 사이트가 올바른 백엔드로 요청합니다.

---

### Step 4: 배포 실행

1. **Create Static Site** 클릭
2. 자동으로 첫 배포가 시작됨
3. **Logs** 탭에서 빌드 로그 확인
4. 빌드가 성공하면 **사이트 URL** 이 표시됨 (예: `https://order-app-web.onrender.com`)

---

### Step 5: 동작 확인

1. 표시된 URL 로 접속
2. 메뉴가 보이면 백엔드 연동 정상
3. 주문하기 / 관리자 화면도 한 번씩 눌러 보기

---

## 3. 체크리스트

- [ ] GitHub 저장소 연결
- [ ] **Root Directory** = `ui`
- [ ] **Build Command** = `npm install && npm run build`
- [ ] **Publish Directory** = `dist`
- [ ] **VITE_API_URL** = 백엔드 URL + `/api` (끝에 `/api` 포함)
- [ ] 위 환경 변수 저장 후 배포
- [ ] 배포 후 메뉴/주문/관리자 동작 확인

---

## 4. 문제 해결

- **메뉴가 안 나오거나 네트워크 에러**
  - `VITE_API_URL` 이 백엔드 URL + `/api` 인지 확인
  - 환경 변수 수정 후 **재배포(Manual Deploy)** 필요 (빌드 시점에만 반영됨)

- **404 / 빌드 실패**
  - **Root Directory** 가 `ui` 인지 확인
  - **Build Command** 가 `npm install && npm run build` 인지 확인
  - **Publish Directory** 가 `dist` 인지 확인

- **백엔드 연결이 느리거나 타임아웃**
  - Render Free Tier 는 일정 시간 미사용 시 sleep 됨. 첫 요청 시 깨우는 데 30초~1분 걸릴 수 있음.
