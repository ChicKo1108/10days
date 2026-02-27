const request = require('./request');

// 获取长卷列表
const getPlans = () => {
  return request.get('/plans');
};

// 创建长卷/篇章 (预览)
const createPlan = (data) => {
  return request.post('/plans', data);
};

// 编辑长卷
const updatePlan = (id, data) => {
  return request.put(`/plans/${id}`, data);
};

// 确认并开启计划
const confirmPlan = (id, data) => {
  return request.post(`/plans/${id}/confirm`, data);
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  confirmPlan
};
