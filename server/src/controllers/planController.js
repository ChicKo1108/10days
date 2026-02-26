const { Plan, Quest, User } = require('../models');
const response = require('../utils/response');
const aiService = require('../services/aiService');

// 2.1 获取长卷列表
exports.getPlans = async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return response.notFound(res, 'User not found');
        }

        const plans = await Plan.findAll({
            where: { userId: user.id },
            include: [{ model: Quest, attributes: ['id', 'orderNum', 'status'] }],
            order: [['createdAt', 'DESC']]
        });

        const list = plans.map(plan => {
            const quests = plan.Quests.map(q => ({
                id: q.id,
                num: q.orderNum,
                status: q.status,
                rate: 0 
            }));
            
            return {
                id: plan.id,
                title: plan.title,
                totalDays: plan.totalDays,
                quests
            };
        });

        response.success(res, { list });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 2.2 创建长卷/篇章
exports.createPlan = async (req, res) => {
    try {
        const { type, title, days, planId } = req.body;
        const user = await User.findOne();

        // Use AI Service to generate preview
        const preview = await aiService.generatePlan(title, days || 10);

        let resultId;

        if (type === 'plan') {
            const plan = await Plan.create({
                userId: user.id,
                title,
                totalDays: days || 30,
                status: 'ongoing'
            });
            resultId = plan.id;
        } else {
            const quest = await Quest.create({
                userId: user.id,
                planId: planId || null,
                title,
                status: 'locked',
                baseTask: preview.baseTask,
                stageTasks: {
                    stage1Task: [preview.stages[0].task],
                    stage2Task: [preview.stages[1].task],
                    stage3Task: [preview.stages[2].task]
                }
            });
            resultId = quest.id;
        }

        response.success(res, { id: resultId, preview });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 2.3 编辑长卷
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, totalDays } = req.body;

        const plan = await Plan.findByPk(id);
        if (!plan) {
            return response.notFound(res, 'Plan not found');
        }

        await plan.update({ title, totalDays });
        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 2.4 确认并开启计划
exports.confirmPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { baseTask, stages } = req.body;
        
        let quest = await Quest.findByPk(id);
        if (!quest) {
             return response.notFound(res, 'Quest not found');
        }

        const stageTasks = {
            stage1Task: [stages[0].task],
            stage2Task: [stages[1].task],
            stage3Task: [stages[2].task]
        };

        await quest.update({
            baseTask,
            stageTasks,
            status: 'ongoing',
            startDate: new Date()
        });

        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
