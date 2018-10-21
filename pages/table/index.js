let beevalley = require("../../utils/beevalley.js");
Page({
  data: {
    rect:{
      Pending: 0,
      Rejected: 0,
      Approved: 0,
      Money: 0
    },
    count:{
      Pending: 0,
      Rejected: 0,
      Approved: 0,
      Money: 0
    }
  },
  setPendingData: function (data) {
    if (data.length !== 0) {
      var rect = data.filter((item) => item.type === "rect");
      var point = data.filter((item) => item.type === "point");
      this.setData({
        ["rect.Pending"]: rect.length,
        ["count.Pending"]: point.length
      })
    }
  },
  setRejectedData: function (data) {
    if (data.length !== 0) {
      var rect = data.filter((item) => item.type === "rect");
      var point = data.filter((item) => item.type === "point");
      this.setData({
        ["rect.Rejected"]: rect.length,
        ["count.Rejected"]: point.length
      })
    }
  },
  setApprovedData: function (data) {
    // console.log(data)
    if (data.length !== 0) {
      var rect = data.filter((item) => item.type === "rect");
      var point = data.filter((item) => item.type === "point");
      var rectMoney = 0;
      var pointMoney = 0;
      rect.forEach((item) => {
        rectMoney += item.price;
      })
      point.forEach((item) => {
        pointMoney += item.price;
      })
      this.setData({
        ["rect.Money"]: rectMoney.toFixed(2),
        ["count.Money"]: pointMoney.toFixed(2),
        ["rect.Approved"]: rect.length,
        ["count.Approved"]: point.length
      })
    }
  },
  onLoad: function () {
    var nowTime = new Date().getTime();
    var token = wx.getStorageSync('apitoken');
    var apiType = ["rejected", "pending", "approved"];
    var that = this;
    wx.showLoading({
        title: "加载中",
        mask: true,
    })
    apiType.forEach((item) => {
      beevalley.getWorkHistory(token, nowTime, item, function (res) {
        if (item === "rejected") {
          that.setRejectedData(res.data)
        } else if (item === "pending") {
          that.setPendingData(res.data)
        } else if (item === "approved") {
          that.setApprovedData(res.data)
        }
        wx.hideLoading();
      })
    })
  }
})