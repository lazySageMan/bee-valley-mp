const app = getApp()
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {
  },

  onLoad: function () {
    console.log("任务面板");

    let that = this;
    let apitoken = wx.getStorageSync('apitoken');
    this.setData({ apitoken: apitoken });
    this.fetchTaskTypes();

  },

  onShow: function () {
    // this.fetchTaskTypes();
  },

  onPullDownRefresh: function () {
    this.fetchTaskTypes();
  },

  fetchTaskTypes: function () {

    wx.showLoading({
      title: "加载中",
      mask: true,
    })

    let that = this;
    beevalley.listAuthorizedWorkType(this.data.apitoken, function (res) {
      console.log(res)//等待后端改数据类型
      if (res.statusCode === 200) {
        that.setData({ taskTypes: res.data });
      } else {
        that.setData({ taskTypes: [] });
      }
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });

  },

  navToTask: function (e) {
    let taskType = e.currentTarget.dataset.tasktype,
      packageId = e.currentTarget.dataset.packageid;

    wx.showModal({
      title: '提示信息',
      content: '注意事项',
      success: function(res){
        if(res.confirm){
          wx.navigateTo({
            url: "../" + taskType + "_task/index?packageId=" + packageId
          })
        }
      }
    })
  }

})