const api = require('../../api/index');

Page({
  data: {
    id: '',
    score: 0,
    summary: '',
    stats: {
      completed: 0,
      skipped: 0
    },
    notes: [],
    loading: true,
    showSeal: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ id });
      this.fetchReview(id);
    }
  },

  fetchReview(id) {
    api.review.getReview(id)
      .then(res => {
        const { score, summary, stats, notes } = res;
        this.setData({
          score,
          summary,
          stats,
          notes,
          loading: false
        });

        // 延迟显示印章动画
        setTimeout(() => {
          this.setData({ showSeal: true });
        }, 500);
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: '获取复盘失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  nextQuest() {
    // 跳转到创建页或长卷页
    wx.switchTab({ url: '/pages/plan/index' });
  }
});
