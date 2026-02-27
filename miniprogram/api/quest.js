const request = require('./request');

// 获取篇章列表
const getQuests = (params) => {
  return request.get('/quests', params);
};

// 获取篇章详情
const getQuestDetail = (id) => {
  return request.get(`/quests/${id}`);
};

// 编辑篇章
const updateQuest = (id, data) => {
  return request.put(`/quests/${id}`, data);
};

// 每日打卡
const checkIn = (id, data) => {
  return request.post(`/quests/${id}/checkin`, data);
};

// 每日留白
const skipTask = (id, data) => {
  return request.post(`/quests/${id}/skip`, data);
};

module.exports = {
  getQuests,
  getQuestDetail,
  updateQuest,
  checkIn,
  skipTask
};
