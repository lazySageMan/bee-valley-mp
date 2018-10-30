let beevalley = require("../../utils/beevalley.js");
Page({
  data: {
  },

  groupBy: function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  },

  getTypeDisplay: function (taskType) {
    if (taskType === 'rect') {
      return '方框';
    }
  },

  setWorkHistoryData: function (responData) {

    let records = [],
      count = 1,
      groups = this.groupBy(responData, 'pack'),
      sortedKeys = Object.keys(groups).sort();

    for (var idx in sortedKeys) {
      if (groups.hasOwnProperty(sortedKeys[idx])) {
        let group = groups[sortedKeys[idx]],
          approved = group.filter(r => r.reviewResult === true),
          rejected = group.filter(r => r.reviewResult === false),
          taskType = group[0].type;
        if (taskType === 'rect') {
          records.push({
            title: '任务' + count + '(' + this.getTypeDisplay(taskType) + ')',
            total: group.length,
            approved: approved.length,
            rejected: rejected.length,
            reward: approved.reduce((sum, record) => sum + record.price, 0).toFixed(2)
          })
          count++;
        } else {
          // TODO Show only rect type task for now
        }
      }
    }

    this.setData({
      records: records
    })

    wx.hideLoading();
  },

  onLoad: function () {

    wx.showLoading({
      title: "加载中",
      mask: true,
    })

    var nowTime = new Date().getTime();
    var token = wx.getStorageSync('apitoken');
    var that = this;

    beevalley.getWorkHistory(token, nowTime, 1000, (res) => {
      that.setWorkHistoryData(res.data);
    })

  }

})