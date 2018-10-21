const app = getApp()
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {

  },

  onLoad: function () {
    wx.showLoading({
      title: "登录中",
      mask: true,
    })
    console.log("index");
    let that = this;
    let apitoken = wx.getStorageSync('apitoken');
    if (!apitoken) {
      wx.login({
        success: function (res) {
          if (res.code) {
            // console.log(res.code);
            beevalley.login(res.code, function (res) {
              if (res.statusCode === 200) {
                let token = res.data;
                that.handleSuccessLogin(token);
              } else if (res.statusCode === 403) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: that.bindGetUserInfo,
                  fail: function () {
                    that.setData({ requiredAuth: true });
                    wx.hideLoading();
                  }
                });
              }
            });
          }
        }
      });
    } else {
      this.setData({ requiredAuth: false });
      wx.hideLoading();
    }
  },

  bindGetUserInfoButton(e) {
    this.bindGetUserInfo(e.detail);
  },

  bindGetUserInfo(e) {

    // console.log(e.detail.userInfo)
    let that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          // console.log(res.code);
          beevalley.login(res.code, function (res) {
            if (res.statusCode === 200) {
              let token = res.data;
              that.handleSuccessLogin(token);
            } else if (res.statusCode === 403) {
              that.setData({ requiredAuth: true });
            }
          }, e.encryptedData, e.iv);
        }
      }
    });

  },

  handleSuccessLogin(token) {
    let that = this;
    wx.setStorage({
      key: 'apitoken', data: token, success: function () {
        that.setData({ requiredAuth: false });
        wx.hideLoading();
      }
    });
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
      url: '../review_list/index'
    })
  }

})