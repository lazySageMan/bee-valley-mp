const app = getApp()
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {

  },

  onLoad: function () {
    console.log("index");
    let that = this;
    let apitoken = wx.getStorageSync('apitoken');
    if (!apitoken) {
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log(res.code);
            beevalley.login(res.code, function (res) {
              if (res.statusCode === 200) {
                let token = res.data;
                wx.setStorage({
                  key: 'apitoken', data: token, success: function () {
                    that.setData({ authenticated: true });
                  }
                });
              }
            });
          }
        }
      });
    } else {
      this.setData({ authenticated: true });
    }
  },

  intoChoose: function () {
    wx.navigateTo({
      url: "../task_list/index"
    })
  },

  intoList: function () {
    wx.navigateTo({
      url: '../table/index'
    })
  },

  intoAuditChoose: function () {
    wx.navigateTo({
      url: '../audit_list/index'
    })
  }

})