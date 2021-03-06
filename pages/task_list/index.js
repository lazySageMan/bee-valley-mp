const app = getApp()
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {
        is_modal_Hidden:true,
        is_modal_Msg:'我是一个自定义组件'
    

  },

  onLoad: function () {
    console.log("任务面板");

    let that = this;
    let apitoken = wx.getStorageSync('apitoken');
    this.setData({ apitoken: apitoken });
    this.fetchTaskTypes();

  },

  getmodaldata: function(e){

    this.setData({
      is_modal_Hidden: !this.data.is_modal_Hidden
    })
    if(e.detail.isSumbit){
      wx.navigateTo({
        url: "../" + this.taskType + "_task/index?packageId=" + this.packageId
      })
    }
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
    this.taskType = e.currentTarget.dataset.tasktype;
    this.packageId = e.currentTarget.dataset.packageid;

    // Display only rect type for QTS
    if (this.taskType === 'rect') {
      this.setData({
        is_modal_Hidden: !this.data.is_modal_Hidden
      })
    }

  }

})