Page({
  data: {
    step: 1, // 1: 选择类型, 2: 填写表单
    type: 'plan', // plan | quest
    loading: false,
    title: '',
    days: '',
    chapterCount: 'N', // 计算出的篇章数
    planIndex: null, // 必须初始化为 null
    plans: ['90天精通吉他', '30天阅读挑战'] // Mock data
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
      planIndex: Number(e.detail.value) // 确保转为数字
    });
  },

  clearPlanSelection() {
    this.setData({
      planIndex: null
    });
  },

  startPlan() {
    // 简单校验
    if (!this.data.title) {
      wx.showToast({ title: '请输入目标名称', icon: 'none' });
      return;
    }
    if (this.data.type === 'plan' && !this.data.days) {
      wx.showToast({ title: '请输入预计天数', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    
    // Mock API call & AI Generation
    setTimeout(() => {
      this.setData({ loading: false });
      // 传递参数到规划页
      wx.navigateTo({ 
        url: `/pages/quest-create/index?type=${this.data.type}&title=${this.data.title}` 
      });
    }, 2000);
  }
})
