const { Quest, CheckIn } = require('../models');
const response = require('../utils/response');

// 4.1 获取复盘报告
exports.getReview = async (req, res) => {
    try {
        const { id } = req.params;
        const quest = await Quest.findByPk(id);
        
        if (!quest) {
            return response.notFound(res, 'Quest not found');
        }

        const checkIns = await CheckIn.findAll({ where: { questId: id } });
        const completedCount = checkIns.filter(c => c.status === 'completed').length;
        const skippedCount = checkIns.filter(c => c.status === 'skipped').length;
        
        const score = completedCount * 10; 

        const notes = checkIns
            .filter(c => c.note)
            .map(c => ({
                day: c.dayNum,
                content: c.note
            }));

        response.success(res, {
            score,
            summary: score >= 80 ? "表现优异，基本掌握了核心技巧，继续保持！" : "完成了本次旅程，虽然略有遗憾，但坚持本身就是胜利。",
            stats: {
                completed: completedCount,
                skipped: skippedCount
            },
            notes
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
