Page({
  data: {
    currentDay: 3, // 实际进行到的天数 (今天)
    selectedDay: 3, // 用户当前查看的天数
    isPressed: false,
    status: 'pending', // pending, completed, skipped, locked
    stampText: '', // 既成, 愿遂, 笔讫, 墨成
    skippedStamp: false, // 是否是留白印章
    planTitle: '90天精通吉他', // 模拟所属长卷标题，为空则不显示
    
    // 模拟历史数据
    history: {
      1: { status: 'completed', stamp: '既成' },
      2: { status: 'completed', stamp: '墨就' },
      3: { status: 'pending', stamp: '' },
      4: { status: 'locked', stamp: '' },
      // ...
    }
  },

  onLoad(options) {
    // 默认选中当前进行的天数
    this.setData({
      selectedDay: this.data.currentDay
    });
    this.updateCurrentStatus();
  },
  
  switchDay(e) {
    const day = e.currentTarget.dataset.day;
    // 如果点击的是未来锁定的天数(大于今天)，暂不处理或给提示
    // if (day > this.data.currentDay) {
    //   wx.showToast({ title: '时日未到', icon: 'none' });
    //   return;
    // }
    this.setData({ selectedDay: day });
    this.updateCurrentStatus();
  },

  updateCurrentStatus() {
    const { selectedDay, history } = this.data;
    const dayData = history[selectedDay] || { status: 'pending', stamp: '' };
    
    this.setData({
      status: dayData.status,
      stampText: dayData.stamp,
      skippedStamp: dayData.status === 'skipped'
    });
  },

  handleStampStart() {
    if (this.data.status !== 'pending' || this.data.selectedDay !== this.data.currentDay) return;
    this.setData({ isPressed: true });
  },

  handleStampEnd() {
    this.setData({ isPressed: false });
  },

  handleCheckIn() {
    // 仅允许对“今天”且“未完成”的任务盖章
    if (this.data.selectedDay !== this.data.currentDay || this.data.status !== 'pending') return;
    
    wx.vibrateShort({ type: 'heavy' });
    
    // 随机获取印章文字
    const stamps = ['既成', '愿遂', '笔讫', '墨就'];
    const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];
    
    // 更新本地数据
    const newHistory = { ...this.data.history };
    newHistory[this.data.currentDay] = { status: 'completed', stamp: randomStamp };

    this.setData({ 
      status: 'completed',
      stampText: randomStamp,
      skippedStamp: false,
      history: newHistory
    });
    
    console.log('Stamped:', randomStamp);
    
    // 第10天跳转逻辑
    if (this.data.currentDay === 10) {
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/review/index' });
      }, 1500);
    }
  },

  handleSkip() {
    // 仅允许对“今天”且“未完成”的任务留白
    if (this.data.selectedDay !== this.data.currentDay || this.data.status !== 'pending') return;

    wx.showModal({
      title: '使用留白',
      content: '今日暂且歇笔？(剩余次数: 2)',
      confirmColor: '#B22222',
      success: (res) => {
        if (res.confirm) {
          const newHistory = { ...this.data.history };
          newHistory[this.data.currentDay] = { status: 'skipped', stamp: '留白' };

          this.setData({
            status: 'skipped',
            stampText: '留白',
            skippedStamp: true,
            history: newHistory
          });
        }
      }
    });
  },

  goToEdit() {
    wx.navigateTo({ url: '/pages/quest-create/index' });
  },

  goToPlanDetail() {
    // 跳转到长卷详情页 (假设 ID 为 1)
    wx.switchTab({ url: '/pages/plan/index' }); 
  }
})
