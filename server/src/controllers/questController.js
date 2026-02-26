const { Quest, Plan, CheckIn, User } = require('../models');
const response = require('../utils/response');

// 1.1 获取篇章列表
exports.getQuests = async (req, res) => {
    try {
        const { status = 'ongoing', page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        
        if (status !== 'all') {
            where.status = status;
        }

        const user = await User.findOne(); // Mock user
        if (!user) {
            return response.notFound(res, 'User not found');
        }
        where.userId = user.id;

        const { count, rows } = await Quest.findAndCountAll({
            where,
            include: [{ model: Plan, attributes: ['title'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const list = await Promise.all(rows.map(async (quest) => {
            const checkIns = await CheckIn.findAll({ where: { questId: quest.id } });
            const progress = Array(10).fill(0); // 0: pending
            checkIns.forEach(c => {
                progress[c.dayNum - 1] = c.status === 'completed' ? 1 : 2;
            });

            return {
                id: quest.id,
                title: quest.title,
                planTitle: quest.Plan ? quest.Plan.title : null,
                currentDay: 1, // Logic to calculate current day based on startDate
                totalDays: 10,
                status: quest.status,
                dailyTask: quest.baseTask,
                progress
            };
        }));

        response.success(res, { list, total: count });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 1.2 获取篇章详情
exports.getQuestDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const quest = await Quest.findByPk(id, {
            include: [{ model: Plan, attributes: ['title'] }]
        });

        if (!quest) {
            return response.notFound(res, 'Quest not found');
        }

        const checkIns = await CheckIn.findAll({ where: { questId: id } });
        const history = {};
        checkIns.forEach(c => {
            history[c.dayNum] = {
                status: c.status,
                stamp: c.stampText,
                note: c.note
            };
        });

        let tasks = { base: quest.baseTask, stages: [] };
        if (quest.stageTasks) {
            const stages = typeof quest.stageTasks === 'string' ? JSON.parse(quest.stageTasks) : quest.stageTasks;
            tasks.stages = [
                { name: "入门期", days: "Day 1-3", task: stages.stage1Task?.[0] || '' },
                { name: "进阶期", days: "Day 4-7", task: stages.stage2Task?.[0] || '' },
                { name: "冲刺期", days: "Day 8-10", task: stages.stage3Task?.[0] || '' }
            ];
        }

        response.success(res, {
            id: quest.id,
            title: quest.title,
            planId: quest.planId,
            planTitle: quest.Plan ? quest.Plan.title : null,
            currentDay: 1, // TODO: Calculate real current day
            status: quest.status,
            history,
            tasks
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 1.3 编辑篇章
exports.updateQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, tasks } = req.body;
        
        const quest = await Quest.findByPk(id);
        if (!quest) {
            return response.notFound(res, 'Quest not found');
        }

        const stageTasks = {
            stage1Task: [tasks.stages[0].task],
            stage2Task: [tasks.stages[1].task],
            stage3Task: [tasks.stages[2].task]
        };

        await quest.update({
            title,
            baseTask: tasks.base,
            stageTasks
        });

        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 1.4 每日打卡
exports.checkIn = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, note } = req.body;

        const stamps = ['既成', '愿遂', '笔讫', '墨就'];
        const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];

        const existing = await CheckIn.findOne({ where: { questId: id, dayNum: day } });
        if (existing) {
            return response.badRequest(res, 'Already checked in today');
        }

        await CheckIn.create({
            questId: id,
            dayNum: day,
            status: 'completed',
            stampText: randomStamp,
            note
        });

        response.success(res, {
            stamp: randomStamp,
            status: 'completed'
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 1.5 每日留白
exports.skipTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { day } = req.body;

        const existing = await CheckIn.findOne({ where: { questId: id, dayNum: day } });
        if (existing) {
            return response.badRequest(res, 'Day already processed');
        }

        const skipCount = await CheckIn.count({ where: { questId: id, status: 'skipped' } });
        if (skipCount >= 3) {
            return response.badRequest(res, 'No skips remaining');
        }

        await CheckIn.create({
            questId: id,
            dayNum: day,
            status: 'skipped'
        });

        response.success(res, {
            remainingSkips: 2 - skipCount,
            status: 'skipped'
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
