const api = require('../../api/index');

Page({
  data: {
    id: '', // Quest ID (if available) or Plan ID
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
    chapters: [], // For plan mode: [{ baseTask, stages: [...], isLocked }]
    loading: false
  },

  onLoad(options) {
    const { id, isPreview, title, type } = options;
    
    // 如果是创建流程传来的预览
    if (isPreview && id) {
      this.setData({ id, isEdit: false });
      
      const previewData = wx.getStorageSync('temp_plan_preview');
      if (previewData && previewData.id === id) {
        const { preview } = previewData;
        
        // Check for new multi-stage format (stages is object) vs old format (stages is array)
        if (preview.stages && !Array.isArray(preview.stages)) {
            // Multi-stage Plan Mode
            const stagesObj = preview.stages;
            const chapters = [];
            const stageKeys = Object.keys(stagesObj).filter(k => k.startsWith('stage'));
            
            // Sort stage keys numerically (stage1, stage2...)
            stageKeys.sort((a, b) => {
                const numA = parseInt(a.replace('stage', ''));
                const numB = parseInt(b.replace('stage', ''));
                return numA - numB;
            });
            
            stageKeys.forEach((key, index) => {
                chapters.push({
                    baseTask: stagesObj.baseTask, // Use global base task for all stages initially
                    stages: stagesObj[key], // The 3 phases array
                    isLocked: false // Allow editing all stages in preview
                });
            });

            this.setData({
                type: 'plan',
                title: title || '新长卷',
                chapters: chapters
            });

        } else {
            // Single Quest Mode
            this.setData({
              type: 'quest',
              title: title || '新篇章',
              baseTask: preview.baseTask || (preview.stages && preview.stages.baseTask) || '',
              stages: Array.isArray(preview.stages) ? preview.stages : (preview.stages ? preview.stages.stage1 : [])
            });
        }
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

  // Handlers for Plan Mode (Chapters)
  handleChapterBaseInput(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const chapters = this.data.chapters;
      chapters[index].baseTask = value;
      this.setData({ chapters });
  },

  handleChapterStageInput(e) {
      const cIndex = e.currentTarget.dataset.cindex; // Chapter index
      const sIndex = e.currentTarget.dataset.sindex; // Stage/Phase index (0-2)
      const value = e.detail.value;
      
      const chapters = this.data.chapters;
      chapters[cIndex].stages[sIndex].task = value;
      this.setData({ chapters });
  },

  confirmPlan() {
    this.setData({ loading: true });
    wx.showLoading({ title: '墨迹定格中...' });

    let payload = {};

    if (this.data.type === 'plan') {
        // Construct payload for multi-stage plan
        // Expects: { stages: { baseTask, stage1: [...], stage2: [...] } }
        // Note: backend expects baseTask at top level of stages object if global, 
        // but our UI allows per-chapter baseTask. 
        // Let's assume we use the first chapter's baseTask as global, or send per-stage if backend supports it.
        // Backend confirmPlan implementation uses `stages.baseTask` globally for all quests currently.
        // Let's use the first chapter's baseTask.
        
        const stagesPayload = {
            baseTask: this.data.chapters[0]?.baseTask || ''
        };
        
        this.data.chapters.forEach((chapter, index) => {
            stagesPayload[`stage${index + 1}`] = chapter.stages;
        });
        
        payload = { stages: stagesPayload };

    } else {
        // Single Quest payload
        if (!this.data.baseTask) {
            wx.hideLoading();
            this.setData({ loading: false });
            wx.showToast({ title: '请完善基础任务', icon: 'none' });
            return;
        }
        
        payload = {
            baseTask: this.data.baseTask,
            stages: this.data.stages
        };
    }

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
        // If it was a plan, redirect to plan list or first quest?
        // Let's redirect to plan list for now, or maybe the plan detail page (if we had one).
        // The current pages are plan/index (list) and quest-detail (quest).
        // Since we activated the plan, maybe go to plan list.
        if (this.data.type === 'plan') {
            wx.switchTab({ url: '/pages/plan/index' });
        } else {
            wx.redirectTo({ url: `/pages/quest-detail/index?id=${this.data.id}` });
        }
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
