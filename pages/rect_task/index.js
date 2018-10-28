//index.js
//获取应用实例
const app = getApp()
let wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
let Shape = require("../../utils/wxdraw.min.js").Shape;
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {
    currentWork: null,
    works: [],
    imgHeight: 0,
    imgWidth: 0,
    rectPosition: {},
    rectInitialized: false,
    showboxInfo: {}
  },

  clickIcon(e) {
    var info = ''

    this.data.currentWork.details.forEach(item => {
      info += `• ${item}\r\n`
    })
    
    wx.showModal({
      title: '提示',
      content: info, 
      showCancel: false,
      confirmText: "知道了"
    })
  },

  submitWork: function (e) {
    if (this.data.rectInitialized) {
      let that = this;
      let item = this.data.currentWork;
      var relativeAnchorX = item.anchorX - item.xOffset;
      var relativeAnchorY = item.anchorY - item.yOffset;
      if (relativeAnchorX > this.data.rectPosition.xMin && relativeAnchorX < this.data.rectPosition.xMax && relativeAnchorY > this.data.rectPosition.yMin && relativeAnchorY < this.data.rectPosition.yMax) {
        this.showLoading();

        beevalley.submitWork(
          this.apitoken,
          item.id, [
            [{
              x: item.xOffset + Math.floor(this.data.rectPosition.xMin * this.data.imgRatio),
              y: item.yOffset + Math.floor(this.data.rectPosition.yMin * this.data.imgRatio)
            },
            {
              x: item.xOffset + Math.floor(this.data.rectPosition.xMax * this.data.imgRatio),
              y: item.yOffset + Math.floor(this.data.rectPosition.yMax * this.data.imgRatio)
            }
            ]
          ],
          function (res) {
            that.handleError(res);
            that.nextWork();
          });
      }
    }
  },

  cancelWork: function (e) {
    if (this.data.currentWork) {
      this.showLoading();
      let that = this;
      let deletedWorkId = this.data.currentWork.id;
      beevalley.cancelWork(that.apitoken, [deletedWorkId], function (res) {
        // TODO handle error
        that.nextWork();
      })
    }
  },

  showLoading: function () {
    wx.showLoading({
      title: "加载中",
      mask: true,
    })
  },

  nextWork: function () {

    if (this.rect) {
      this.rect.destroy();
      this.rect = null;
    }
    if (this.circle) {
      this.circle.destroy();
      this.circle = null;
    }
    let data = {};
    data['rectInitialized'] = false;
    data['rectPosition'] = {};
    data['showboxInfo'] = {};
    data['currentWork'] = null;

    if (this.data.works.length > 0) {
      let candidate = this.data.works.pop();

      if (candidate.previousWork) {
        data['rectPosition'] = {
          xMin: candidate.previousWork.result[0][0].x - candidate.xOffset,
          yMin: candidate.previousWork.result[0][0].y - candidate.yOffset,
          xMax: candidate.previousWork.result[0][1].x - candidate.xOffset,
          yMax: candidate.previousWork.result[0][1].y - candidate.yOffset
        };
        data['rectInitialized'] = true;
      }
      data['currentWork'] = candidate;
    } else {
      this.fetchWorks();
    }
    this.setData(data);

  },

  preprocessWork: function (work) {

    let anchorX = Math.floor(work.prerequisites[0].result[work.meta.index].x);
    let anchorY = Math.floor(work.prerequisites[0].result[work.meta.index].y);

    let options = beevalley.calculateWorkarea(work.meta.imageWidth, work.meta.imageHeight, anchorX, anchorY, this.data.imageAreaWidth, this.data.imageAreaHeight);
    options['format'] = 'png';

    work['xOffset'] = options.x;
    work['yOffset'] = options.y;
    work['anchorX'] = anchorX;
    work['anchorY'] = anchorY;
    work['downloadOptions'] = options;

    return work;
  },

  fetchWorks: function () {
    let that = this;

    beevalley.fetchWorks(this.apitoken, 'rect', 3, function (res) {
      that.handleError(res);
      let works = res.data;
      that.setData({
        works: works.map(w => that.preprocessWork(w))
      });
      if (works.length > 0) {
        works.reverse().forEach(w => that.downloadWorkFile(w));
        that.nextWork();
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '暂时没有任务',
        })
      }
    });

  },

  downloadWorkFile: function (work) {
    let that = this;

    beevalley.downloadWorkFile(this.apitoken, work.id, work.downloadOptions, function (res) {
      that.handleError(res);
      let imageSrc = 'data:image/png;base64,' + wx.arrayBufferToBase64(res.data);

      if (that.data.currentWork.id === work.id) {
        that.setData({
          'currentWork.src': imageSrc
        });
      } else {
        let foundIndex = that.data.works.findIndex(w => w.id === work.id);
        if (foundIndex >= 0) {
          let imageData = {};
          imageData['works[' + foundIndex + '].src'] = imageSrc;
          that.setData(imageData);
        }
      }

    })

  },

  imageLoad: function (e) {
    // var imgW = this.data.imageAreaWidth,
    //   imgH = imgW * e.detail.height / e.detail.width;

    // TODO use default imgRatio
    let that = this;

    this.setData({
      imgHeight: e.detail.height,
      imgWidth: e.detail.width,
      imgRatio: 1
    });

    this.createAnchor(e.currentTarget.dataset.imgid);
    this.createRect();
    beevalley.renderRect(this.rect, this.data.rectPosition);
    beevalley.renderInfoBox(function (data) {
      that.setData(data);
    }, this.data.rectPosition, this.data.imageAreaHeight);
    clearInterval(this.timer);
    this.timer = beevalley.startTimer(function (data) {
      that.setData(data);
    }, this.data.currentWork.expiredAt);
    wx.hideLoading();

  },

  createAnchor: function (id) {
    if (this.data.currentWork.id === id && !this.circle) {
      var circle = new Shape('circle', {
        x: this.data.currentWork.anchorX - this.data.currentWork.xOffset,
        y: this.data.currentWork.anchorY - this.data.currentWork.yOffset,
        r: 5,
        fillStyle: "#E6324B"
      });
      this.wxCanvas.add(circle);
      this.circle = circle;
    }
  },

  startBoxInfoRefresher: function () {
    let that = this;
    clearInterval(this.boxRefresher);
    this.boxRefresher = setInterval(function () {
      beevalley.renderInfoBox(function (data) {
        that.setData(data);
      }, that.data.rectPosition, that.data.imageAreaHeight);
    }, 250);
  },

  stopBoxInfoRefresher: function () {
    clearInterval(this.boxRefresher);
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
    if (minimum > 100) {
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

  //画框从此开始
  bindtouchstart: function (e) {
    this.wxCanvas.touchstartDetect(e);
    if (e.touches[0].x < 0 || e.touches[0].y < 0 || e.touches[0].x > this.data.imgWidth || e.touches[0].y > this.data.imgHeight) {
      return;
    }
    if (!this.data.rectInitialized) {
      this.data.rectPosition.xMin = Math.floor(e.touches[0].x);
      this.data.rectPosition.yMin = Math.floor(e.touches[0].y);
    }
    this.startBoxInfoRefresher();
  },

  bindtouchmove: function (e) {
    this.wxCanvas.touchmoveDetect(e);

    if (e.touches[0].x < 0 || e.touches[0].y < 0 || e.touches[0].x > this.data.imgWidth || e.touches[0].y > this.data.imgHeight) {
      return;
    }

    if (!this.data.rectInitialized) {
      this.initializeRectPosition(Math.floor(e.touches[0].x), Math.floor(e.touches[0].y));
    } else {
      this.adjustRectPosition(Math.floor(e.touches[0].x), Math.floor(e.touches[0].y));
    }
    beevalley.renderRect(this.rect, this.data.rectPosition);
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
    this.stopBoxInfoRefresher();
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
    this.showLoading()
    this.apitoken = wx.getStorageSync('apitoken');
    let context = wx.createCanvasContext('rectTask');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    let that = this;
    var query = wx.createSelectorQuery();
    query.select('.imglab').boundingClientRect()
    query.exec(function (res) {
      //console.log(res);  
      that.setData({
        imageAreaWidth: Math.floor(res[0].width),
        imageAreaHeight: Math.floor(res[0].height)
      });
      // console.log(res[0].height, res[0].width);
      that.nextWork();
    })

  },

  onUnload: function () {
    this.wxCanvas.clear();
    var worksToCancel = this.data.works.map(w => w.id);
    if (this.data.currentWork) {
      worksToCancel.push(this.data.currentWork.id);
    }
    if (worksToCancel.length > 0) {
      beevalley.cancelWork(this.apitoken, worksToCancel, function (res) { })
    }
  },

  handleError: function (res) {
    if (res.statusCode === 403) {
      // TODO handle conflict case
      wx.navigateBack({
        delta: 1
      })
    }
  }

})