Page({
  data: {
    plans: [
      {
        id: 1,
        title: '90天精通吉他',
        totalDays: 90,
        chapters: [
          { id: 101, num: 1, status: 'completed', rate: 95 },
          { id: 102, num: 2, status: 'completed', rate: 88 },
          { id: 103, num: 3, status: 'ongoing', rate: 40 },
          { id: 104, num: 4, status: 'locked', rate: 0 },
          { id: 105, num: 5, status: 'locked', rate: 0 },
          { id: 106, num: 6, status: 'locked', rate: 0 },
        ]
      },
      {
        id: 2,
        title: '30天阅读挑战',
        totalDays: 30,
        chapters: [
          { id: 201, num: 1, status: 'completed', rate: 100 },
          { id: 202, num: 2, status: 'completed', rate: 92 },
          { id: 203, num: 3, status: 'completed', rate: 85 }
        ]
      },
      {
        id: 3,
        title: '60天减脂计划',
        totalDays: 60,
        chapters: [
          { id: 301, num: 1, status: 'ongoing', rate: 60 },
          { id: 302, num: 2, status: 'locked', rate: 0 },
          { id: 303, num: 3, status: 'locked', rate: 0 },
          { id: 304, num: 4, status: 'locked', rate: 0 },
          { id: 305, num: 5, status: 'locked', rate: 0 },
          { id: 306, num: 6, status: 'locked', rate: 0 },
        ]
      },
      {
        id: 4,
        title: '100个单词突击',
        totalDays: 20,
        chapters: [
          { id: 401, num: 1, status: 'locked', rate: 0 },
          { id: 402, num: 2, status: 'locked', rate: 0 }
        ]
      }
    ]
  },

  onLoad(options) {

  },

  goToChapter(e) {
    const { id, status } = e.currentTarget.dataset;
    if (status === 'locked') {
      wx.showToast({ title: '前序篇章未完，静候时机', icon: 'none' });
      return;
    }
    // 跳转到详情页 (只读或编辑)
    wx.navigateTo({ url: `/pages/quest-detail/index?id=${id}` });
  },

  goToCreatePlan() {
    wx.navigateTo({ url: '/pages/plan-create/index' });
  }
})
