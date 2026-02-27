const api = require('../../api/index');

Page({
  data: {
    id: '',
    title: '',
    planTitle: '',
    currentDay: 1, // 实际进行到的天数
    selectedDay: 1, // 用户当前查看的天数
    status: 'pending', // pending, completed, skipped, locked
    stampText: '', // 既成, 愿遂, 笔讫, 墨成
    skippedStamp: false, // 是否是留白印章
    history: {}, // 历史数据 { dayNum: { status, stamp, note } }
    tasks: {}, // 任务详情 { base, stages: [] }
    dailyTask: '', // 当前选中日期的任务描述
    note: '', // 今日心得
    loading: true,
    isPressed: false,
    remainingSkips: 3 // 剩余留白次数 (需要后端返回，暂时 mock)
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ id });
      this.fetchDetail(id);
    }
  },

  fetchDetail(id) {
    api.quest.getQuestDetail(id)
      .then(res => {
        const { title, planTitle, currentDay, status, history, tasks } = res;
        
        // 计算剩余留白次数
        let usedSkips = 0;
        Object.values(history).forEach(h => {
          if (h.status === 'skipped') usedSkips++;
        });

        this.setData({
          title,
          planTitle,
          currentDay,
          selectedDay: currentDay, // 默认选中今天
          status, // 篇章整体状态，需转换为每日状态
          history,
          tasks,
          remainingSkips: 3 - usedSkips,
          loading: false
        });
        
        this.updateCurrentStatus();
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      });
  },
  
  switchDay(e) {
    const day = e.currentTarget.dataset.day;
    this.setData({ selectedDay: day });
    this.updateCurrentStatus();
  },

  updateCurrentStatus() {
    const { selectedDay, currentDay, history, tasks } = this.data;
    
    // 获取选中日期的任务描述
    let taskDesc = tasks.base || '';
    if (tasks.stages) {
      // 简单逻辑：根据天数判断阶段
      let stageTask = '';
      if (selectedDay <= 3) stageTask = tasks.stages[0]?.task;
      else if (selectedDay <= 7) stageTask = tasks.stages[1]?.task;
      else stageTask = tasks.stages[2]?.task;
      
      if (stageTask) taskDesc += `\n${stageTask}`;
    }

    // 获取选中日期的状态
    let dayStatus = 'locked';
    let stamp = '';
    let note = '';
    let skipped = false;

    if (selectedDay < currentDay) {
      // 过去的日子，从 history 取
      const h = history[selectedDay];
      if (h) {
        dayStatus = h.status;
        stamp = h.stamp;
        note = h.note || '';
        skipped = h.status === 'skipped';
      } else {
        dayStatus = 'skipped'; // 过去未完成视为跳过? 或者 pending? 视业务逻辑
      }
    } else if (selectedDay === currentDay) {
      // 今天，先看 history 有没有(可能已完成)，没有则是 pending
      const h = history[selectedDay];
      if (h) {
        dayStatus = h.status;
        stamp = h.stamp;
        note = h.note || '';
        skipped = h.status === 'skipped';
      } else {
        dayStatus = 'pending';
      }
    } else {
      // 未来
      dayStatus = 'locked';
    }

    this.setData({
      status: dayStatus,
      stampText: stamp,
      skippedStamp: skipped,
      dailyTask: taskDesc,
      note
    });
  },

  handleInput(e) {
    this.setData({ note: e.detail.value });
  },

  handleStampStart() {
    if (this.data.status !== 'pending' || this.data.selectedDay !== this.data.currentDay) return;
    this.setData({ isPressed: true });
  },

  handleStampEnd() {
    this.setData({ isPressed: false });
  },

  handleCheckIn() {
    if (this.data.selectedDay !== this.data.currentDay || this.data.status !== 'pending') return;
    
    wx.vibrateShort({ type: 'heavy' });
    
    const { id, currentDay, note } = this.data;

    api.quest.checkIn(id, { day: currentDay, note })
      .then(res => {
        const { stamp, status } = res;
        
        const newHistory = { ...this.data.history };
        newHistory[currentDay] = { status, stamp, note };

        this.setData({ 
          status,
          stampText: stamp,
          skippedStamp: false,
          history: newHistory
        });
        
        wx.showToast({ title: '打卡成功', icon: 'success' });

        if (currentDay === 10) {
          setTimeout(() => {
            wx.navigateTo({ url: `/pages/review/index?id=${id}` });
          }, 1500);
        }
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: err.msg || '打卡失败', icon: 'none' });
      });
  },

  handleSkip() {
    if (this.data.selectedDay !== this.data.currentDay || this.data.status !== 'pending') return;

    wx.showModal({
      title: '使用留白',
      content: `今日暂且歇笔？(剩余次数: ${this.data.remainingSkips})`,
      confirmColor: '#B22222',
      success: (res) => {
        if (res.confirm) {
          const { id, currentDay } = this.data;
          
          api.quest.skipTask(id, { day: currentDay })
            .then(res => {
              const { remainingSkips, status } = res;
              
              const newHistory = { ...this.data.history };
              newHistory[currentDay] = { status, stamp: '留白' };

              this.setData({
                status,
                stampText: '留白',
                skippedStamp: true,
                history: newHistory,
                remainingSkips
              });
            })
            .catch(err => {
              console.error(err);
              wx.showToast({ title: err.msg || '操作失败', icon: 'none' });
            });
        }
      }
    });
  },

  goToEdit() {
    // 暂未实现编辑页跳转，可复用创建页或新增编辑页
    wx.showToast({ title: '修订功能开发中', icon: 'none' });
  },

  goToPlanDetail() {
    wx.switchTab({ url: '/pages/plan/index' }); 
  }
});
