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

            // Generate Quests based on AI preview stages
            const stages = preview.stages;
            const stageKeys = Object.keys(stages).filter(key => key.startsWith('stage'));
            
            // Sort keys to ensure order (stage1, stage2...)
            stageKeys.sort((a, b) => {
                const numA = parseInt(a.replace('stage', ''));
                const numB = parseInt(b.replace('stage', ''));
                return numA - numB;
            });

            for (let i = 0; i < stageKeys.length; i++) {
                const key = stageKeys[i];
                const stageData = stages[key]; // Array of 3 phases
                
                await Quest.create({
                    userId: user.id,
                    planId: plan.id,
                    title: `${title} - 阶段${i + 1}`,
                    orderNum: i + 1,
                    status: 'locked', // All locked initially, will be activated on confirm
                    baseTask: stages.baseTask, // Global base task
                    stageTasks: {
                        stage1Task: [stageData[0].task], // Intro
                        stage2Task: [stageData[1].task], // Advanced
                        stage3Task: [stageData[2].task]  // Sprint
                    }
                });
            }

        } else {
            // Create a single Quest (assuming it fits into the first stage structure)
            // Note: If the AI returns multiple stages for a single quest request, we just take stage1
            const stage1Data = preview.stages.stage1 || preview.stages[Object.keys(preview.stages).find(k => k.startsWith('stage'))];
            
            const quest = await Quest.create({
                userId: user.id,
                planId: planId || null,
                title,
                status: 'locked',
                baseTask: preview.stages.baseTask,
                stageTasks: {
                    stage1Task: [stage1Data[0].task],
                    stage2Task: [stage1Data[1].task],
                    stage3Task: [stage1Data[2].task]
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
        // Expecting full structure: { stages: { baseTask, stage1: [...], stage2: [...] } }
        const { stages } = req.body; 
        
        // Check if ID is Plan or Quest
        const plan = await Plan.findByPk(id);
        
        if (plan) {
            // It is a Plan ID
            const quests = await Quest.findAll({ where: { planId: id }, order: [['orderNum', 'ASC']] });
            
            // Iterate and update quests
            // We expect the frontend to send back the edited stages structure matching what createPlan returned
            const stageKeys = Object.keys(stages).filter(key => key.startsWith('stage'));
             stageKeys.sort((a, b) => {
                const numA = parseInt(a.replace('stage', ''));
                const numB = parseInt(b.replace('stage', ''));
                return numA - numB;
            });

            for (let i = 0; i < quests.length; i++) {
                const quest = quests[i];
                const key = stageKeys[i];
                if (stages[key]) {
                    const stageData = stages[key];
                    const updateData = {
                        baseTask: stages.baseTask,
                        stageTasks: {
                            stage1Task: [stageData[0].task],
                            stage2Task: [stageData[1].task],
                            stage3Task: [stageData[2].task]
                        }
                    };
                    
                    // Activate the first quest
                    if (i === 0) {
                        updateData.status = 'ongoing';
                        updateData.startDate = new Date();
                    } else {
                        updateData.status = 'locked';
                    }
                    
                    await quest.update(updateData);
                }
            }
            
            await plan.update({ status: 'ongoing' });
            
        } else {
            // Try Quest
            let quest = await Quest.findByPk(id);
            if (!quest) {
                 return response.notFound(res, 'Plan or Quest not found');
            }
            
            // For single quest update, we might receive the 'stages' object from frontend 
            // but wrapped differently or just the single stage array if the frontend logic varies.
            // Assuming frontend sends the same structure for consistency:
            // payload: { stages: { baseTask, stage1: [...] } }
            
            // But wait, existing frontend logic sends: { baseTask, stages: [...] } (array of phases)
            // We should support the new structure.
            
            let stageData;
            let baseTaskVal;
            
            if (Array.isArray(stages)) {
                // Old format or single stage array
                stageData = stages;
                baseTaskVal = req.body.baseTask;
            } else if (stages && stages.stage1) {
                // New format
                stageData = stages.stage1;
                baseTaskVal = stages.baseTask;
            }

            if (stageData) {
                const stageTasks = {
                    stage1Task: [stageData[0].task],
                    stage2Task: [stageData[1].task],
                    stage3Task: [stageData[2].task]
                };

                await quest.update({
                    baseTask: baseTaskVal,
                    stageTasks,
                    status: 'ongoing',
                    startDate: new Date()
                });
            }
        }

        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
