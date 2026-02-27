const request = require('./request');

// 获取复盘报告
const getReview = (id) => {
  return request.get(`/quests/${id}/review`);
};

module.exports = {
  getReview
};
