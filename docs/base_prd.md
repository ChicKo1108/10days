这份PRD已为您重新锻造。它不仅包含了业务逻辑的严密性，还融入了**新中式水墨风**的视觉灵魂，并针对 **Express.js + PostgreSQL** 的技术栈进行了深度适配。

---

# 《十日计划》全量产品需求文档 (PRD V3.0)

**项目定位：** 基于水墨美学的长线目标动态拆解工具。
**技术栈：** 微信小程序 (Frontend) + Express.js (Backend) + PostgreSQL (Database)。

---

## 1. 专有名词解释 (Glossary)

为了统一团队语境，我们将产品中的功能模块进行“水墨风”命名：

| 术语 | 定义 | 对应水墨隐喻 |
| --- | --- | --- |
| **Master Plan** | **大计划**：用户设定的长远目标（如90天学会尤克里里）。 | **【长卷】** |
| **Quest** | **十日阵地**：大计划下的执行单元，固定周期为10天。 | **【篇章】** |
| **Daily Action** | **每日行动**：AI拆解出的当天具体任务。 | **【墨迹】** |
| **Buffer/Stamina** | **精力值**：每个篇章拥有的1次跳过打卡机会。 | **【留白】** |
| **Master Canvas** | **画布视图**：纵览全局、回顾历史、规划未来的核心页面。 | **【画轴】** |
| **Review** | **结项复盘**：第11天对过去篇章的总结。 | **【落款】** |

---

## 2. UI/UX 视觉方案 (New Chinese Ink Wash)

### 2.1 视觉规范

* **色调：** * 背景：宣纸色 (`#F7F4ED`)，带微弱纤维纹理。
* 墨色：松烟墨 (`#2C2C2C`)，用于正文与线条。
* 强调：朱砂红 (`#B22222`)，用于点亮、印章。


* **字体：** 标题使用“思源宋体”，正文使用“等线/思源黑体”。
* **交互特效：** * **墨色洇染：** 打卡成功时，圆点呈现朱砂色墨水在纸上扩散的效果。
* **卷轴拉伸：** 画布页左右滑动时，伴随纸张展开的轻微物理阴影。



### 2.2 核心布局

* **极简主义：** 所有的按钮避免硬边框，改用书法笔触或印章形状。
* **动效：** 复盘通过时，屏幕中央落下“方篆印章”。

---

## 3. 功能模块详细说明

### 3.1 首页：阵地纵览 (The Hub)

* **功能：** 展示所有进行中的“长卷”。
* **内容：** 卡片式排列，显示长卷标题、当前篇章进度（如：3/9）、今日墨迹任务摘要。
* **交互：** 点击进入对应的【十日执行页】。

### 3.2 核心：十日执行页 (Quest Detail)

* **视觉中心：** 10个排列成弧形或直线形的“墨点”。
* **功能点：**
* **长按点亮：** 触发“朱砂洇染”动画，点亮今日墨迹。
* **每日任务：** 展示AI生成的具体动作描述。
* **歇笔（留白）：** 点击消耗1次精力值，今日状态变为淡灰色。



### 3.3 全景：大计划画布 (Master Canvas)

* **功能：** 大计划的“仪表盘”。
* **视图：** 横向拉伸的长卷，展示所有 Quest 方块。
* **历史回顾：** 点击绿色方块，查看往期落款总结。
* **动态更新：** 点击最后一个 Quest 后的空白位，若前序已完成，则调用 AI 规划下一篇章。



### 3.4 灵魂：AI 滚动规划流

* **场景：** 篇章结项后的“落款时刻”。
* **逻辑：** 1. 用户反馈（评价+心情）。
2. 后端 Express 发送 `prompt`（含往期达成率、自我评分）至大模型。
3. 返回下一阶段的 10 天任务，用户微调后存入 PostgreSQL。

---

## 4. 技术架构与数据设计

### 4.1 技术栈

* **前端：** 微信小程序原生框架（WXML/WXSS/JS）。
* **后端：** Node.js (Express.js)，使用 `Sequelize` 或 `Knex.js` 作为 ORM。
* **数据库：** PostgreSQL。

### 4.2 数据库 Schema (PostgreSQL)

```sql
-- 长卷表 MasterPlans
CREATE TABLE master_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    total_quests INT NOT NULL, -- 总篇章数
    current_quest_index INT DEFAULT 1,
    theme_color VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 篇章表 Quests
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES master_plans(id),
    quest_index INT NOT NULL,
    daily_actions JSONB, -- 存储10天的任务文本数组
    check_in_data INT[] DEFAULT '{0,0,0,0,0,0,0,0,0,0}', -- 0:未做, 1:完成, 2:留白
    buffer_used BOOLEAN DEFAULT FALSE,
    review_rating INT,
    review_summary TEXT,
    status VARCHAR(20) DEFAULT 'planned',
    start_date DATE
);

```

---

## 5. 核心 API 接口定义

| 路径 | 方法 | 描述 |
| --- | --- | --- |
| `/api/plans` | `POST` | 创建长卷（立项） |
| `/api/plans/:id/canvas` | `GET` | 获取画布全景数据 |
| `/api/quests/:id/checkin` | `PATCH` | 每日墨迹点亮（打卡） |
| `/api/quests/:id/roll` | `POST` | AI 滚动生成下一篇章任务 |

---

## 6. 开发者的建议
> 1. **数据库层**：确保 `Quests` 表的 `check_in_data` 数组能够准确更新。
> 2. **前端层**：使用 Canvas 模拟墨迹在宣纸色背景上的扩散效果。
> 3. **核心逻辑**：实现‘滚动更新’，即只有当前 Quest 复盘完成后，方可生成下一个 Quest。”
> 
