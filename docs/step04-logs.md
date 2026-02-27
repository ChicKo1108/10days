# Step 04 Logs - Frontend API Integration

## 4.1 Frontend API Module Setup

**Goal**: Encapsulate RESTful API calls into a unified module for easy access within Wechat Mini Program pages.

### Actions
- [x] Create `miniprogram/api/request.js`: Base request utility with `wx.request` wrapper.
- [x] Create `miniprogram/api/quest.js`: Quest related endpoints.
- [x] Create `miniprogram/api/plan.js`: Plan related endpoints.
- [x] Create `miniprogram/api/user.js`: User/Auth endpoints.
- [x] Create `miniprogram/api/review.js`: Review endpoints.
- [x] Create `miniprogram/api/index.js`: Unified export.

## 4.2 Page Integration

**Goal**: Connect Mini Program pages to the backend API.

### Actions
- [x] **Quest List Page** (`pages/quest/index`):
    - [x] Fetch ongoing quests on load (`onShow`).
    - [x] Handle pull-down refresh.
- [x] **Quest Detail Page** (`pages/quest-detail/index`):
    - [x] Fetch quest details by ID.
    - [x] Implement Check-in (盖章) logic.
    - [x] Implement Skip (留白) logic.
- [x] **Plan List Page** (`pages/plan/index`):
    - [x] Fetch all plans and their quests.
- [x] **Plan Creation Page** (`pages/plan-create/index`):
    - [x] Implement form submission to generate AI preview.
    - [x] Render AI preview data.
    - [x] Implement confirmation to start plan.
- [x] **Quest Creation Page** (`pages/quest-create/index`):
    - [x] Handle preview data from Plan Creation.
    - [x] Implement final confirmation (create quest).
- [x] **Profile Page** (`pages/profile/index`):
    - [x] Fetch user profile.
    - [x] Implement logout/destroy account.
- [x] **Review Page** (`pages/review/index`):
    - [x] Fetch review data by Quest ID.

## 4.3 Login Integration

**Goal**: Implement WeChat Login logic.

### Actions
- [x] **Backend**:
    - [x] Create `authController.js` with `login` endpoint (Mock WeChat API for now).
    - [x] Add `/auth/login` route in `userRoutes.js`.
- [x] **Frontend**:
    - [x] Create `pages/login/index` page (UI + Logic).
    - [x] Add `login` method to `api/user.js`.
    - [x] Update `app.js` to check login status on launch.
    - [x] Update `pages/quest/index.js` to redirect to login if no token.
