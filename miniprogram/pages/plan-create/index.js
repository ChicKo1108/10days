const api = require('../../api/index');

Page({
  data: {
    step: 1, // 1: 选择类型, 2: 填写表单
    type: 'plan', // plan | quest
    loading: false,
    title: '',
    days: '',
    chapterCount: 'N',
    planIndex: null,
    plans: [], // 存储 {id, title}
    planNames: [] // 仅存储 title 用于 picker
  },

  onLoad() {
    this.fetchPlans();
  },

  fetchPlans() {
    api.plan.getPlans().then(res => {
      const plans = res.list;
      const planNames = plans.map(p => p.title);
      this.setData({ plans, planNames });
    });
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type });
  },

  nextStep() {
    this.setData({ step: 2 });
  },

  prevStep() {
    this.setData({ step: 1 });
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({ [field]: value });

    // 实时计算篇章数
    if (field === 'days') {
      this.calculateChapters(value);
    }
  },

  selectPresetDay(e) {
    const day = e.currentTarget.dataset.day;
    this.setData({ days: day });
    this.calculateChapters(day);
  },

  calculateChapters(days) {
    if (days && days > 0) {
      const count = Math.ceil(days / 10);
      this.setData({ chapterCount: count });
    } else {
      this.setData({ chapterCount: 'N' });
    }
  },

  bindPlanChange(e) {
    this.setData({
      planIndex: Number(e.detail.value)
    });
  },

  clearPlanSelection() {
    this.setData({
      planIndex: null
    });
  },

  startPlan() {
    if (!this.data.title) {
      wx.showToast({ title: '请输入目标名称', icon: 'none' });
      return;
    }
    if (this.data.type === 'plan' && !this.data.days) {
      wx.showToast({ title: '请输入预计天数', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    
    const payload = {
      type: this.data.type,
      title: this.data.title,
      days: this.data.days ? Number(this.data.days) : undefined,
      planId: this.data.planIndex !== null ? this.data.plans[this.data.planIndex].id : undefined
    };

    api.plan.createPlan(payload)
      .then(res => {
        const { id, preview } = res;
        this.setData({ loading: false });
        
        // 跳转到任务确认页 (复用 quest-create 页面)
        // 传递预览数据太长，可以存到全局或本地存储，这里先简化传递核心参数
        // 建议：quest-create 页面根据 ID 再次获取详情，或者把 preview 传过去
        // 鉴于 2.2 接口返回了 preview，我们直接通过 event channel 或 storage 传递
        
        wx.setStorageSync('temp_plan_preview', { id, preview });
        
        wx.navigateTo({ 
          url: `/pages/quest-create/index?id=${id}&isPreview=true` 
        });
      })
      .catch(err => {
        console.error(err);
        this.setData({ loading: false });
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      });
  }
});
