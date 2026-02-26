# Step 03 Logs - Backend Core Development (Sequelize & MySQL)

## 3.1 Database Modeling & ORM Setup

**Goal**: Switch to MySQL with Sequelize, design database schema based on `development_plan_v2.md`.

### Actions
- [x] Initialize `docs/step03-logs.md`.
- [x] Switch Node.js version to 20 (`nvm use 20`).
- [x] Uninstall `typeorm`, `reflect-metadata` (Previous step).
- [x] Uninstall `pg`, `pg-hstore`.
- [x] Install `sequelize`, `mysql2`.
- [x] Update Sequelize configuration in `server/src/config/database.js` to use `mysql`.
- [x] Update `.env` with MySQL credentials.
- [x] Create Models in `server/src/models/`:
    - `User.js`
    - `Plan.js`
    - `Quest.js` (Updated `JSONB` to `JSON` for MySQL compatibility)
    - `CheckIn.js`
- [x] Initialize Sequelize in `app.js` and sync models.

### Entity Design
- **User**: `id` (UUID), `openId`, `nickName`, `avatarUrl`
- **Plan**: `id` (UUID), `userId` (FK), `title`, `totalDays`, `status`
- **Quest**: `id` (UUID), `planId` (FK), `userId` (FK), `title`, `orderNum`, `status`, `baseTask`, `stageTasks` (JSON), `startDate`
- **CheckIn**: `id` (UUID), `questId` (FK), `dayNum`, `status`, `stampText`, `note`

## 3.2 Core API Development

**Goal**: Implement RESTful API endpoints based on `api_docs.md`.

### Actions
- [x] Create `src/utils/response.js` for standardized JSON response `{ code, data, msg }`.
- [x] Implement **Quest API** (`src/controllers/questController.js`):
    - `GET /api/quests`: List quests with progress.
    - `GET /api/quests/:id`: Get quest detail with check-in history.
    - `PUT /api/quests/:id`: Update quest info.
    - `POST /api/quests/:id/checkin`: Daily check-in logic.
    - `POST /api/quests/:id/skip`: Skip task logic.
- [x] Implement **Plan API** (`src/controllers/planController.js`):
    - `GET /api/plans`: List plans with quests.
    - `POST /api/plans`: Create plan/quest (Mock AI preview).
    - `PUT /api/plans/:id`: Update plan info.
    - `POST /api/plans/:id/confirm`: Confirm and start plan.
- [x] Implement **User API** (`src/controllers/userController.js`):
    - `GET /api/user/profile`: Get/Create mock user profile.
    - `POST /api/auth/logout`: Logout (Mock).
    - `DELETE /api/user/destroy`: Delete account.
- [x] Implement **Review API** (`src/controllers/reviewController.js`):
    - `GET /api/quests/:id/review`: Generate review stats.
- [x] Register routes in `app.js`.

## 3.3 AI Service Integration

**Goal**: Integrate LangChain + DeepSeek for dynamic plan generation.

### Actions
- [x] Install `@langchain/openai`, `langchain`.
- [x] Configure `.env` with `DEEPSEEK_API_KEY` and `DEEPSEEK_BASE_URL`.
- [x] Create `src/services/aiService.js`:
    - Configure `ChatOpenAI` adapter for DeepSeek.
    - Implement `generatePlan` with system prompt.
- [x] Update `planController.js` to use `aiService` instead of mock data.
