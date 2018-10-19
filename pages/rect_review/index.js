let beevalley = require("../../utils/beevalley.js");
let wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
let Shape = require("../../utils/wxdraw.min.js").Shape;

Page({

  data: {
    apiToken: null,
    pointsPosition: [],
    rectsPosition: [],
    imgDataArr: [],
    imgHeight: 0,
    imgWidth: 0,
    showboxInfo: {
      boxWidth: 0,
      boxHeight: 0,
      top: 0,
      left: 0,
      width: 0,
      height: 0
    },
    cutTime: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    timer: null
  },

  onLoad: function () {
    var query = wx.createSelectorQuery();
    query.select('.rectAudit').boundingClientRect()
    query.exec(function (res) {
      //console.log(res);  
      console.log(res[0].height, res[0].width);
    })
    console.log("audit pages");
    this.setData({
      apiToken: wx.getStorageSync('apitoken')
    });
    let context = wx.createCanvasContext('rectAudit');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pixelRatio: res.pixelRatio,
          windowWidth: res.windowWidth
        });
        var query = wx.createSelectorQuery();
        query.select('.rectAudit').boundingClientRect()
        query.exec(function (res) {
          that.setData({
            imageAreaWidth: Math.floor(res[0].width),
            imageAreaHeight: Math.floor(res[0].height)
          });
          that.fetchWorks("rect");
        })
      }
    });
  },

  getCutTime(time) {
    var that = this;
    this.data.timer = setInterval(function () {
      var date = new Date(time).getTime() - new Date().getTime();
      var days = Math.floor(date / (24 * 3600 * 1000));

      var leave1 = date % (24 * 3600 * 1000);
      var hours = Math.floor(leave1 / (3600 * 1000));

      var leave2 = leave1 % (3600 * 1000);
      var minutes = Math.floor(leave2 / (60 * 1000));

      var leave3 = leave2 % (60 * 1000);
      var seconds = Math.round(leave3 / 1000);

      that.setData({
        cutTime: {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds
        }
      })
    }, 1000)
  },

  onUnload: function () {
    this.wxCanvas.clear();
    beevalley.cancelReview(this.data.apiToken, this.data.imgDataArr.map(w => w.id), function (res) { })
  },

  clickIcon(e) {
    wx.showModal({
      title: "提示",
      content: e.target.dataset.imgdescription,
      showCancel: false,
      confirmText: "知道了"
    })
  },

  imageLoad: function (e) {
    var imgW = this.data.windowWidth,
      imgH = imgW * e.detail.height / e.detail.width;
    this.setData({
      imgHeight: imgH,
      imgWidth: imgW,
      imgRatio: e.detail.width / imgW
    })
    console.log(this.data.imgDataArr)
    this.createRect(e.currentTarget.dataset.imgid)
  },

  deleteImg: function (imgId) {
    let imgA = this.data.imgDataArr.filter((item) => item.id !== imgId);
    if (this.rect) {
      this.rect.destroy();
      this.rect = null;
    }
    this.setData({
      imgDataArr: imgA,
      showboxInfo: {
        boxWidth: 0,
        boxHeight: 0,
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
    })
    if (imgA.length === 0) {
      this.fetchWorks("rect")
    } else {
      this.createAnchor(this.data.imgDataArr[0].id);
      this.createRect(this.data.imgDataArr[0].id);
    }
  },

  submitWork: function (e) {
    var imgId = e.currentTarget.dataset.imgid;
    var that = this;
    beevalley.submitReview(this.data.apiToken, imgId, true, function (res) {
      if (res.statusCode === 200) {
        that.deleteImg(imgId);
      }
    })
  },

  rejectWork: function (e) {
    var imgId = e.currentTarget.dataset.imgid;
    var that = this;
    beevalley.submitReview(this.data.apiToken, imgId, false, function (res) {
      if (res.statusCode === 200) {
        that.deleteImg(imgId);
      }
    })
  },

  cancelReview: function (e) {
    var imgId = e.currentTarget.dataset.imgid;
    var that = this;
    beevalley.cancelReview(this.data.apiToken, [imgId], function (res) {
      if (res.statusCode === 200) {
        that.deleteImg(imgId);
      }
    })
  },

  fetchWorks: function (type) {
    var that = this;
    beevalley.fetchAuditWorks(that.data.apiToken, type, 2, function (res) { //这边接受一个query确定是什么类型的请求
      if (res.data.length > 0) {
        wx.showLoading({
          title: "加载中",
          mask: true,
        })
        that.changePosition(res.data, type)
      } else {
        wx.showToast({
          title: "没有任务，请联系客服",
          icon: "loading",
          mask: true,
          duration: 2000,
          success: function () {
            wx.navigateTo({
              url: "../index/index"
            })
          }
        })
      }
    })
  },

  changePosition: function (data, type) {
    if (type === 'rect' && data.length > 0) {//根据类型分别处理数据

      this.getImgFiles(data);
    } else if (type === 'count' && data.length > 0) {
      //这里吧对应的点放入
    }
  },

  getImgFiles(work) {
    if (work.length > 0) {
      var imgArr = [];
      var that = this;
      work.forEach((item) => {
        beevalley.downloadAuditWorkFile(this.data.apiToken, item.id, function (res) {
          imgArr.push({
            src: 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res.data),
            id: item.id,
            minX: item.work.result[0][0].x,
            minY: item.work.result[0][0].y,
            maxX: item.work.result[0][1].x,
            maxY: item.work.result[0][1].y,
            description: item.work.description,
            cutOutTime: item.expiredAt
          })
          that.setData({
            imgDataArr: imgArr
          })
          wx.hideLoading();
        })

      })
    }
  },

  createAnchor: function (id) {

  },

  createRect: function (id) {
    if (!this.rect) {
      console.log(this.data.imgDataArr)
      this.data.imgDataArr.forEach((item) => {
        if (item.id === id) {
          var rect = new Shape('rect', {
            x: ((item.maxX / this.data.imgRatio) + (item.minX / this.data.imgRatio)) / 2,
            y: ((item.maxY / this.data.imgRatio) + (item.minY / this.data.imgRatio)) / 2,
            w: (item.maxX / this.data.imgRatio) - (item.minX / this.data.imgRatio),
            h: (item.maxY / this.data.imgRatio) - (item.minY / this.data.imgRatio),
            lineWidth: 2,
            lineCap: 'round',
            strokeStyle: "#339933",
          }, 'stroke', false);
          this.wxCanvas.add(rect);
          this.rect = rect;
          clearInterval(this.data.timer);
          this.getCutTime(item.cutOutTime);
          this.changeBox(id);
        }
      })
    }
  },

  changeBox(id) { //随方框的大小改变显示的位置
    this.data.imgDataArr.forEach((item) => {
      if (id === item.id) {
        var top = 0;
        if ((item.minY / this.data.imgRatio - 5 - 33) < 0) {
          if ((item.maxY / this.data.imgRatio + 5 + 33) > this.data.imageAreaHeight) {
            top = item.minY / this.data.imgRatio + 20
          } else {
            top = item.maxY / this.data.imgRatio + 5;
          }
        } else {
          top = item.minY / this.data.imgRatio - 10 - 33;
        }
        this.setData({
          showboxInfo: {
            boxWidth: Math.floor(item.maxX / this.data.imgRatio - item.minX / this.data.imgRatio),
            boxHeight: Math.floor(item.maxY / this.data.imgRatio - item.minY / this.data.imgRatio),
            top: top,
            left: item.minX / this.data.imgRatio,
            width: 65,
            height: 33
          }
        })
      }
    })
  },

})