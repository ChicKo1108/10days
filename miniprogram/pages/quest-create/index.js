Page({
  data: {
    isEdit: false,
    title: '',
    planTitle: '', // 所属长卷标题
    type: 'quest', // quest | plan
    baseTask: '',
    stages: [
      { name: '入门期', days: 'Day 1-3', task: '' },
      { name: '进阶期', days: 'Day 4-7', task: '' },
      { name: '冲刺期', days: 'Day 8-10', task: '' }
    ],
    // 长卷模式下的多篇章预览
    chapters: [] 
  },

  onLoad(options) {
    const { title, type } = options;
    
    // 如果没有 title，说明可能是从详情页进来的编辑模式，或者参数丢失
    // 这里简单判断，如果有 title 则是新建，否则默认为编辑(仅为演示)
    // 实际应根据 options.id 判断
    
    if (title) {
      this.setData({ 
        title, // 这里 title 在 plan 模式下其实是 planTitle
        planTitle: type === 'plan' ? title : '',
        type,
        isEdit: false 
      });
      this.generatePlan(title, type);
    } else {
      // 模拟编辑模式加载数据
      this.setData({ 
        isEdit: true,
        title: '吉他入门',
        baseTask: '每日练习爬格子 15 分钟',
        stages: [
          { name: '入门期', days: 'Day 1-3', task: '熟悉 C、Am 和弦指法' },
          { name: '进阶期', days: 'Day 4-7', task: '练习 C-Am 和弦转换，速度 60bpm' },
          { name: '冲刺期', days: 'Day 8-10', task: '尝试弹唱《小星星》前四小节' }
        ]
      });
    }
  },

  // Mock AI Generation
  generatePlan(title, type) {
    // 模拟书童根据标题生成计划
    if (type === 'plan') {
       // 长卷模式：生成前3个篇章
       const chapters = [];
       for(let i=0; i<3; i++) {
         // 前2个解锁，第3个锁定
         const isLocked = i >= 2; 
         chapters.push({
           isLocked,
           baseTask: isLocked ? '' : `坚持每日针对「${title}」阶段${i+1}的基础训练`,
           stages: [
              { name: '入门期', days: 'Day 1-3', task: isLocked ? '' : `了解阶段${i+1}核心概念` },
             { name: '进阶期', days: 'Day 4-7', task: isLocked ? '' : `强化阶段${i+1}专项技巧` },
             { name: '冲刺期', days: 'Day 8-10', task: isLocked ? '' : `完成阶段${i+1}实战演练` }
            ]
         });
       }
       // 模拟更多篇章...
       chapters.push({ isLocked: true }); // 第4个
       
       this.setData({ chapters });

    } else {
      // 单篇章模式
      const aiTasks = {
        base: `坚持每日针对「${title}」的基础训练`,
        s1: `了解「${title}」的基本概念与核心技巧`,
        s2: `针对「${title}」进行专项强化练习`,
        s3: `尝试完成一次完整的「${title}」实战应用`
      };

      this.setData({
        baseTask: aiTasks.base,
        stages: [
          { name: '入门期', days: 'Day 1-3', task: aiTasks.s1 },
          { name: '进阶期', days: 'Day 4-7', task: aiTasks.s2 },
          { name: '冲刺期', days: 'Day 8-10', task: aiTasks.s3 }
        ]
      });
    }
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

  handleChapterBaseInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const chapters = this.data.chapters;
    chapters[index].baseTask = value;
    this.setData({ chapters });
  },

  handleChapterStageInput(e) {
    const cindex = e.currentTarget.dataset.cindex;
    const sindex = e.currentTarget.dataset.sindex;
    const value = e.detail.value;
    const chapters = this.data.chapters;
    chapters[cindex].stages[sindex].task = value;
    this.setData({ chapters });
  },

  confirmPlan() {
    if (this.data.type === 'quest' && !this.data.baseTask) {
      wx.showToast({ title: '请完善基础任务', icon: 'none' });
      return;
    }
    // 长卷模式简单校验
    if (this.data.type === 'plan' && (!this.data.chapters[0].baseTask)) {
       wx.showToast({ title: '请至少完善第一篇章', icon: 'none' });
       return;
    }

    wx.showLoading({ title: '墨迹定格中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: this.data.isEdit ? '修订完成' : '篇章已启', icon: 'success' });
      
      setTimeout(() => {
        // 返回上一页或跳转到详情页
        if (this.data.isEdit) {
          wx.navigateBack();
        } else {
          // 新建完成后跳转到详情页 (Mock ID)
          wx.redirectTo({ url: '/pages/quest-detail/index?id=1' });
        }
      }, 1500);
    }, 1000);
  }
})
