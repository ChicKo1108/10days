# 十日计划 (10Days) - API 接口文档

本文档描述了小程序前端与后端交互的 RESTful API 接口定义。

**基础 URL**: `https://api.10days.com` (示例)

## 通用说明

- **Request Content-Type**: `application/json`
- **Response Content-Type**: `application/json`
- **鉴权**: 所有需要登录的接口需在 Header 中携带 `Authorization: Bearer <token>`

## 1. 篇章 (Quest)

### 1.1 获取篇章列表 (首页)
- **URL**: `/api/quests`
- **Method**: `GET`
- **Description**: 获取用户的进行中或历史篇章列表。
- **Query Params**:
  - `status` (string, optional): 筛选状态 (`ongoing`, `completed`, `all`)。默认为 `ongoing`。
  - `page` (number, optional): 页码，默认 1。
  - `limit` (number, optional): 每页数量，默认 10。
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "list": [
        {
          "id": "quest_001",
          "title": "吉他入门：和弦练习",
          "planTitle": "90天精通吉他",
          "currentDay": 3,
          "totalDays": 10,
          "status": "ongoing", // ongoing, completed, locked
          "dailyTask": "练习 C 和弦转换 (15min)",
          "progress": [1, 1, 0, 0, 0, 0, 0, 0, 0, 0] // 0:pending, 1:completed, 2:skipped
        }
      ],
      "total": 1
    }
  }
  ```

### 1.2 获取篇章详情
- **URL**: `/api/quests/:id`
- **Method**: `GET`
- **Description**: 获取指定篇章的详细信息，包括每日打卡状态。
- **Params**:
  - `id` (string): 篇章 ID。
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": "quest_001",
      "title": "吉他入门：和弦练习",
      "planId": "plan_001", // 可选，关联的长卷ID
      "planTitle": "90天精通吉他",
      "currentDay": 3,
      "status": "ongoing",
      "history": {
        "1": { "status": "completed", "stamp": "既成", "note": "手指有点痛" },
        "2": { "status": "completed", "stamp": "墨就", "note": "" },
        "3": { "status": "pending", "stamp": "", "note": "" }
      },
      "tasks": {
        "base": "每日练习爬格子 15 分钟",
        "stages": [
          { "name": "入门期", "days": "Day 1-3", "task": "熟悉 C、Am 和弦指法" },
          { "name": "进阶期", "days": "Day 4-7", "task": "练习 C-Am 和弦转换" },
          { "name": "冲刺期", "days": "Day 8-10", "task": "尝试弹唱《小星星》" }
        ]
      }
    }
  }
  ```

### 1.3 编辑篇章
- **URL**: `/api/quests/:id`
- **Method**: `PUT`
- **Description**: 编辑篇章内容（如标题、每日任务、阶段任务）。
- **Params**:
  - `id` (string): 篇章 ID。
- **Body**:
  ```json
  {
    "title": "吉他入门：和弦练习 (修订)",
    "tasks": {
      "base": "每日练习爬格子 20 分钟",
      "stages": [
        { "name": "入门期", "days": "Day 1-3", "task": "熟悉 C、Am、F 和弦指法" },
        { "name": "进阶期", "days": "Day 4-7", "task": "练习 C-Am-F 和弦转换" },
        { "name": "冲刺期", "days": "Day 8-10", "task": "尝试弹唱《小星星》" }
      ]
    }
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```

### 1.4 每日打卡 (盖章)
- **URL**: `/api/quests/:id/checkin`
- **Method**: `POST`
- **Description**: 对指定篇章的当前天进行打卡。
- **Params**:
  - `id` (string): 篇章 ID。
- **Body**:
  ```json
  {
    "day": 3,
    "note": "今日心得..." // 可选
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "stamp": "愿遂", // 返回随机印章文字
      "status": "completed"
    }
  }
  ```

### 1.5 每日留白 (跳过)
- **URL**: `/api/quests/:id/skip`
- **Method**: `POST`
- **Description**: 使用留白机会跳过今日任务。
- **Params**:
  - `id` (string): 篇章 ID。
- **Body**:
  ```json
  {
    "day": 3
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "remainingSkips": 2, // 剩余留白次数
      "status": "skipped"
    }
  }
  ```

## 2. 长卷 (Plan)

### 2.1 获取长卷列表
- **URL**: `/api/plans`
- **Method**: `GET`
- **Description**: 获取所有长卷及其下的篇章概览。
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "list": [
        {
          "id": "plan_001",
          "title": "90天精通吉他",
          "totalDays": 90,
          "quests": [
            { "id": "quest_101", "num": 1, "status": "completed", "rate": 95 },
            { "id": "quest_102", "num": 2, "status": "ongoing", "rate": 40 },
            { "id": "quest_103", "num": 3, "status": "locked", "rate": 0 }
          ]
        }
      ]
    }
  }
  ```

### 2.2 创建长卷/篇章 (立项与预览)
- **URL**: `/api/plans`
- **Method**: `POST`
- **Description**: 创建一个新的长卷或独立的篇章。此接口会同时触发 AI 生成初始计划预览。
- **Body**:
  ```json
  {
    "type": "plan", // plan | quest
    "title": "精通尤克里里",
    "days": 30, // 仅 type=plan 时需要
    "planId": "plan_001" // 仅 type=quest 且关联长卷时需要
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": "plan_002", // 临时 ID 或正式 ID
      "preview": {
        "baseTask": "坚持每日针对「精通尤克里里」的基础训练",
        "stages": [
          { "name": "入门期", "days": "Day 1-3", "task": "..." },
          { "name": "进阶期", "days": "Day 4-7", "task": "..." },
          { "name": "冲刺期", "days": "Day 8-10", "task": "..." }
        ]
      }
    }
  }
  ```

### 2.3 编辑长卷
- **URL**: `/api/plans/:id`
- **Method**: `PUT`
- **Description**: 编辑长卷信息（如标题、总天数）。
- **Params**:
  - `id` (string): 长卷 ID。
- **Body**:
  ```json
  {
    "title": "100天精通吉他",
    "totalDays": 100
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```

### 2.4 确认并开启计划
- **URL**: `/api/plans/:id/confirm`
- **Method**: `POST`
- **Description**: 用户确认 AI 生成或手动修改后的计划，正式开启。
- **Params**:
  - `id` (string): 计划 ID。
- **Body**:
  ```json
  {
    "baseTask": "...",
    "stages": [...]
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```

## 3. 用户 (Profile)

### 3.1 获取用户信息
- **URL**: `/api/user/profile`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "nickName": "书童",
      "avatarUrl": "https://...",
      "bio": "十日一进，久久为功"
    }
  }
  ```

### 3.2 退出登录
- **URL**: `/api/auth/logout`
- **Method**: `POST`

### 3.3 注销账号
- **URL**: `/api/user/destroy`
- **Method**: `DELETE`
- **Description**: 永久删除用户数据。

## 4. 复盘 (Review)

### 4.1 获取复盘报告
- **URL**: `/api/quests/:id/review`
- **Method**: `GET`
- **Description**: 获取篇章结束后的复盘数据。
- **Response**:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "score": 95,
      "summary": "表现优异，基本掌握了核心技巧...",
      "stats": {
        "completed": 9,
        "skipped": 1
      },
      "notes": [
        { "day": 1, "content": "..." }
      ]
    }
  }
  ```
