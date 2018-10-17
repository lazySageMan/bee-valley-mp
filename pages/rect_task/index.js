//index.js
//获取应用实例
const app = getApp()
let wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
let Shape = require("../../utils/wxdraw.min.js").Shape;
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {
    errorMessage: null,
    works: [],
    // currentWork: null,
    // currentImgSrc: null,
    imgHeight: '',
    imgWidth: '',
    rectPosition: {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    },
    // anchorPosition: {
    //   x: 0,
    //   y: 0
    // },
    rectInitialized: false,

    //在这里改变
    pointsPosition: [],
    imgDataArr: []
  },

  submitWork: function (e) {
    if (this.data.pointsPosition && this.data.rectInitialized) {
      let imgId = e.currentTarget.dataset.imgid
      let that = this;
      this.data.pointsPosition.forEach((item) => {
        if (item.id === imgId) {
          var relativeAnchorX = item.x / this.data.imgRatio;
          var relativeAnchorY = item.y / this.data.imgRatio;
          if (relativeAnchorX > this.data.rectPosition.xMin && relativeAnchorX < this.data.rectPosition.xMax && relativeAnchorY > this.data.rectPosition.yMin && relativeAnchorY < this.data.rectPosition.yMax) {
            beevalley.submitWork(
              this.data.apitoken,
              item.id, [
                [{
                  x: Math.round(this.data.rectPosition.xMin * this.data.imgRatio),
                  y: Math.round(this.data.rectPosition.yMin * this.data.imgRatio)
                },
                {
                  x: Math.round(this.data.rectPosition.xMax * this.data.imgRatio),
                  y: Math.round(this.data.rectPosition.yMax * this.data.imgRatio)
                }
                ]
              ],
              function (res) {
                that.handleError(res);
                that.deleteImg(imgId);
              });
          }
        }
      })
    }
  },

  cancelWork: function (e) {
    if (this.data.imgDataArr.length > 0) {
      let that = this;
      let imgId = e.currentTarget.dataset.imgid;
      this.data.imgDataArr.forEach((item) => {
        if (e.currentTarget.dataset.imgid === item.id) {
          beevalley.cancelWork(that.data.apitoken, [item.id], function (res) {
            // TODO handle error
            that.deleteImg(imgId);
          })
        }
      })

    }
  },

  deleteImg: function (imgId) { //根据id删除对应的点 图片
    this.data.imgDataArr.forEach((item) => {
      if (item.id === imgId) {
        let arr = this.data.works.filter((item) => item.id !== imgId);
        let pointP = this.data.pointsPosition.filter((item) => item.id !== imgId);
        let imgA = this.data.imgDataArr.filter((item) => item.id !== imgId);
        if (this.rect) {
          this.rect.destroy();
          this.rect = null;
        }
        if (this.circle) {
          this.circle.destroy();
          this.circle = null;
        }
        this.setData({
          works: arr,
          pointsPosition: pointP,
          imgDataArr: imgA,
          rectInitialized: false
        })
        if (arr.length === 0 && pointP.length === 0 && imgA.length === 0) {
          this.fetchWorks();
        } else {//这边判断请求来的图片，没有就将对应图片的point创建出来
          this.createAnchor(this.data.imgDataArr[0].id)//一直让imgDataArr的第一个作为显示的图片
        }
      }
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
    this.createAnchor(e.currentTarget.dataset.imgid);
  },

  createAnchor: function (id) {
    this.data.pointsPosition.forEach((item) => {
      if (item.id === id && !this.circle) {
        var circle = new Shape('circle', {
          x: item.x / this.data.imgRatio,
          y: item.y / this.data.imgRatio,
          r: 2,
          fillStyle: "#E6324B"
        });
        this.wxCanvas.add(circle);
        this.circle = circle;
      }
    })
  },

  createRect: function () {
    if (!this.rect) {
      var rect = new Shape('rect', {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        lineWidth: 2,
        lineCap: 'round',
        strokeStyle: "#339933",
      }, 'stroke', false);
      this.wxCanvas.add(rect);
      this.rect = rect;
    }
  },

  initializeRectPosition: function (x, y) {
    if (x > this.data.rectPosition.xMin) {
      this.data.rectPosition.xMax = x;
    } else {
      this.data.rectPosition.xMax = this.data.rectPosition.xMin;
      this.data.rectPosition.xMin = x;
    }
    if (y > this.data.rectPosition.yMin) {
      this.data.rectPosition.yMax = y;
    } else {
      this.data.rectPosition.yMax = this.data.rectPosition.yMin;
      this.data.rectPosition.yMin = y;
    }
  },

  adjustRectPosition: function (x, y) {
    let deltaXmin = Math.abs(x - this.data.rectPosition.xMin);
    let deltaXmax = Math.abs(x - this.data.rectPosition.xMax);
    let deltaYmin = Math.abs(y - this.data.rectPosition.yMin);
    let deltaYmax = Math.abs(y - this.data.rectPosition.yMax);
    let minimum = Math.min(deltaXmin, deltaXmax, deltaYmin, deltaYmax);
    if (minimum > 50) {
      return;
    }
    if (deltaXmax === minimum && this.data.rectPosition.yMin < y && this.data.rectPosition.yMax > y) {
      this.data.rectPosition.xMax = x;
    } else if (deltaXmin === minimum && this.data.rectPosition.yMin < y && this.data.rectPosition.yMax > y) {
      this.data.rectPosition.xMin = x;
    } else if (deltaYmax === minimum && this.data.rectPosition.xMin < x && this.data.rectPosition.xMax > x) {
      this.data.rectPosition.yMax = y;
    } else if (deltaYmin === minimum && this.data.rectPosition.xMin < x && this.data.rectPosition.xMax > x) {
      this.data.rectPosition.yMin = y;
    }
  },

  renderRect: function () {

    this.rect.updateOption({
      x: (this.data.rectPosition.xMin + this.data.rectPosition.xMax) / 2,
      y: (this.data.rectPosition.yMin + this.data.rectPosition.yMax) / 2,
      w: this.data.rectPosition.xMax - this.data.rectPosition.xMin,
      h: this.data.rectPosition.yMax - this.data.rectPosition.yMin
    });

  },

  //画框从此开始
  bindtouchstart: function (e) {
    // 检测手指点击开始事件
    this.wxCanvas.touchstartDetect(e);

    if (e.touches[0].x < 0 || e.touches[0].y < 0 || e.touches[0].x > this.data.imgWidth || e.touches[0].y > this.data.imgHeight) {
      return;
    }

    if (!this.data.rectInitialized) {
      this.createRect();
      this.data.rectPosition.xMin = e.touches[0].x;
      this.data.rectPosition.yMin = e.touches[0].y;
    } else {
      this.adjustRectPosition(e.touches[0].x, e.touches[0].y);
      this.renderRect();
    }
  },

  bindtouchmove: function (e) {
    this.wxCanvas.touchmoveDetect(e);

    if (e.touches[0].x < 0 || e.touches[0].y < 0 || e.touches[0].x > this.data.imgWidth || e.touches[0].y > this.data.imgHeight) {
      return;
    }

    if (!this.data.rectInitialized) {
      this.initializeRectPosition(e.touches[0].x, e.touches[0].y);
    } else {
      this.adjustRectPosition(e.touches[0].x, e.touches[0].y);
    }
    this.renderRect();
  },

  bindtouchend: function (e) {
    //检测手指点�移出事件
    this.wxCanvas.touchendDetect();
    if (!this.data.rectInitialized) {
      if (this.data.rectPosition.xMin < this.data.rectPosition.xMax && this.data.rectPosition.yMin < this.data.rectPosition.yMax) {
        this.setData({
          rectInitialized: true
        });
      }
    }
  },

  bindtap: function (e) {
    // 检测tap事件
    this.wxCanvas.tapDetect(e);
  },

  bindlongpress: function (e) {
    // 检测longpress事件
    this.wxCanvas.longpressDetect(e);
  },

  onLoad: function () {
    this.setData({
      apitoken: wx.getStorageSync('apitoken')
    });
    let context = wx.createCanvasContext('first');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pixelRatio: res.pixelRatio,
          windowWidth: res.windowWidth
        });
        that.fetchWorks();
      }
    });
  },

  onUnload: function () {
    this.wxCanvas.clear();
    beevalley.cancelWork(this.data.apitoken, this.data.works.map(w => w.id), function (res) { })
  },
  fetchWorks: function () {
    let that = this;
    wx.showLoading({ //调用这个可以不用传显示时间，请求链结束后，调用关闭的api就好了
      title: "加载中",
      mask: true,
    })
    beevalley.fetchWorks(this.data.apitoken, 'rect', 2, function (res) {//传不同的数字，请求不同数量的图片
      that.handleError(res);
      let works = res.data;
      that.setData({
        works: works
      });
      that.processFirstWork();
    });

  },

  processFirstWork: function () {
    // TODO preload next work when user working current work
    if (this.data.works.length > 0) {
      var that = this;
      var pointsArr = []
      this.data.works.forEach((item) => { //将请求的到点，放到
        pointsArr.push({
          id: item.id,
          x: item.prerequisites[0].result[item.meta.index].x,
          y: item.prerequisites[0].result[item.meta.index].y
        })
        that.setData({
          pointsPosition: pointsArr
        })
      })
      this.downloadWorkFile()
    } else {
      wx.showToast({
        title: '暂时没有任务，请稍后再试。',
        mask: true
      });
    }
  },

  downloadWorkFile: function () {
    let that = this;
    if (this.data.works.length !== 0) {
      var imgArr = [];
      console.log(this.data.pointsPosition)
      this.data.works.forEach((item) => {
        beevalley.downloadWorkFile(this.data.apitoken, item.id, function (res) {
          that.handleError(res);
          imgArr.push({
            src: 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res.data),
            id: item.id
          })
          that.setData({
            imgDataArr: imgArr
          })
          wx.hideLoading();
        })
      })
    }
  },

  handleError: function (res) {
    if (res.statusCode === 401) {
      wx.removeStorageSync('apitoken');
      wx.navigateTo({
        url: "../task_list/index"
      });
    } else if (res.statusCode === 403) {
      // TODO handle conflict case
      wx.navigateTo({
        url: "../task_list/index"
      });
    }
  }

})