const api = require('../../api/index');

Page({
  data: {
    id: '', // Quest ID (if available)
    isEdit: false,
    title: '',
    planTitle: '',
    type: 'quest', // quest | plan
    baseTask: '',
    stages: [
      { name: '入门期', days: 'Day 1-3', task: '' },
      { name: '进阶期', days: 'Day 4-7', task: '' },
      { name: '冲刺期', days: 'Day 8-10', task: '' }
    ],
    chapters: [],
    loading: false
  },

  onLoad(options) {
    const { id, isPreview, title, type } = options;
    
    // 如果是创建流程传来的预览
    if (isPreview && id) {
      this.setData({ id, type: 'quest', isEdit: false });
      
      const previewData = wx.getStorageSync('temp_plan_preview');
      if (previewData && previewData.id === id) {
        const { preview } = previewData;
        this.setData({
          title: title || '新篇章', // Note: title might need to be passed or stored
          baseTask: preview.baseTask,
          stages: preview.stages
        });
      }
    } 
    // 如果是编辑模式
    else if (id) {
      this.setData({ id, isEdit: true });
      this.fetchQuestDetail(id);
    }
    // 纯手动创建 (不走 AI) - 暂未实现入口，保留逻辑
    else if (title) {
      this.setData({ title, type: type || 'quest' });
    }
  },

  fetchQuestDetail(id) {
    api.quest.getQuestDetail(id).then(res => {
      this.setData({
        title: res.title,
        baseTask: res.tasks.base,
        stages: res.tasks.stages
      });
    });
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  handleStageInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const stages = this.data.stages;
    stages[index].task = value;
    this.setData({ stages });
  },

  confirmPlan() {
    if (!this.data.baseTask) {
      wx.showToast({ title: '请完善基础任务', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '墨迹定格中...' });

    const payload = {
      baseTask: this.data.baseTask,
      stages: this.data.stages
    };

    // 如果是新建确认 (AI 预览后)
    if (!this.data.isEdit && this.data.id) {
      api.plan.confirmPlan(this.data.id, payload)
        .then(() => {
          this.handleSuccess('篇章已启');
        })
        .catch(this.handleError);
    } 
    // 如果是编辑更新
    else if (this.data.isEdit && this.data.id) {
      api.quest.updateQuest(this.data.id, {
        title: this.data.title,
        tasks: {
          base: this.data.baseTask,
          stages: this.data.stages
        }
      })
        .then(() => {
          this.handleSuccess('修订完成');
        })
        .catch(this.handleError);
    }
  },

  handleSuccess(msg) {
    wx.hideLoading();
    this.setData({ loading: false });
    wx.showToast({ title: msg, icon: 'success' });
    
    // 清除预览缓存
    wx.removeStorageSync('temp_plan_preview');

    setTimeout(() => {
      if (this.data.isEdit) {
        wx.navigateBack();
      } else {
        wx.redirectTo({ url: `/pages/quest-detail/index?id=${this.data.id}` });
      }
    }, 1500);
  },

  handleError(err) {
    console.error(err);
    wx.hideLoading();
    this.setData({ loading: false });
    wx.showToast({ title: '操作失败', icon: 'none' });
  }
});
