let beevalley = require("../../utils/beevalley.js");
Page({
  data: {
    rectPending: 0,
    rectRejected: 0,
    rectApproved: 0,
    rectMoney: 0,

    pointPending: 0,
    pointRejected: 0,
    pointApproved: 0,
    pointMoney: 0,
  },
  setPendingData: function (data) {
    if (data.length !== 0) {
      var rect = data.filter((item) => item.type === "rect");
      var point = data.filter((item) => item.type === "point");
      this.setData({
        rectPending: rect.length,
        PointPending: point.length
      })
    }
  },
  setRejectedData: function (data) {
    if (data.length !== 0) {
      var rect = data.filter((item) => item.type === "rect");
      var point = data.filter((item) => item.type === "point");
      this.setData({
        rectRejected: rect.length,
        pointRejected: point.length
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
        rectMoney: rectMoney,
        pointMoney: pointMoney,
        rectApproved: rect.length,
        pointApproved: point.length
      })
    }
  },
  onLoad: function () {
    console.log('任务记录')
    var nowTime = new Date().getTime();
    var token = wx.getStorageSync('apitoken');
    var apiType = ["rejected", "pending", "approved"];
    var that = this;
    apiType.forEach((item) => {
      beevalley.getWorkHistory(token, nowTime, item, function (res) {
        if (item === "rejected") {
          that.setRejectedData(res.data)
        } else if (item === "pending") {
          that.setPendingData(res.data)
        } else if (item === "approved") {
          that.setApprovedData(res.data)
        }
      })
    })
  }
})