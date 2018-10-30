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
    },

    showArr:[]
  },
  setApprovedData: function (responData) {
    // console.log(responData)
    let dataArr = [];
    responData.forEach((item) => {
      
      if(dataArr.length > 0){

        dataArr.forEach(items => {
          if(items.pack === item.pack){
            if(item.reviewResult === false){
              items.rejected++;
            }
            if(item.reviewResult === true){
              items.approved++;
              item.money+=item.price;
            }
            if(item.reviewResult === null){
              items.pending++
            }

          }else{
            let node = {};
            node.title = '任务1'
            node.pack = item.pack;
            node.rejected = 0;
            node.pending = 0;
            node.approved = 0
            node.money = 0;
            if(item.reviewResult === false){
              node.rejected++;
            }
            if(item.reviewResult === true){
              node.approved++;
              node.money = item.price;
            }
            if(item.reviewResult === null){
              node.pending++
            }
            dataArr.push(node)

          }

        })
      }else{
        // console.log(1)
        let node = {};
        node.title = '任务1'
        node.pack = item.pack;
        node.rejected = 0;
        node.pending = 0;
        node.approved = 0;
        node.money = 0;
        if(item.reviewResult === false){
          node.rejected++;
        }
        if(item.reviewResult === true){
          node.approved++;
          node.money = item.price;
        }
        if(item.reviewResult === null){
          node.pending++
        }
        dataArr.push(node)
      }

    })
    
    this.setData({
      showArr: dataArr
    })

    wx.hideLoading();
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

    beevalley.getWorkHistory(token, nowTime,  (res) => {
      this.setApprovedData(res.data);
    })
    
  }
})