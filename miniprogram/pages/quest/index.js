Page({
  data: {},
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/quest-detail/index?id=${id}` });
  },
  goToCreate() {
    wx.navigateTo({ url: '/pages/plan-create/index' });
  }
})
