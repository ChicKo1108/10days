const BASE_URL = 'http://localhost:3000/api'; // Dev environment

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}` 
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const { code, data, msg } = res.data;
          if (code === 0) {
            resolve(data);
          } else {
            wx.showToast({ title: msg || '请求失败', icon: 'none' });
            reject(res.data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

module.exports = {
  get: (url, data) => request(url, 'GET', data),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url, data) => request(url, 'DELETE', data)
};
