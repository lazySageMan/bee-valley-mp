//index.js
//获取应用实例
const app = getApp()
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
let beevalley = require("../../utils/beevalley.js");

Page({

  data: {
    apitoken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YjkwZjZkOWE1NmY4MzAwMDE5NWYwM2UiLCJyb2xlcyI6WyJXT1JLRVIiLCJSRVFVRVNURVIiLCJBRE1JTiIsIlJFVklFV0VSIl0sImlhdCI6MTUzOTMzNjc3NCwiZXhwIjoxNTM5NDIzMTc0fQ.42Y7uOc0lOA3iMfUI-mk2msXpCJKc_Y9FADf0J5UY9k',
    works: [],
    currentWork: null,
    currentImgSrc: null,
    // imgArr: ["../../image/5.jpg", "../../image/2.jpg", "../../image/3.jpg", "../../image/1.jpg"],
    imgHeight: '',
    imgWidth: '',
    rectPosition: {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    },
    rectInitialized: false
  },

  deleteImg: function() {
    let arr = this.data.works.slice(1)
    this.setData({
      works: arr
    })
    // TODO fetch next work file
    this.rect.destroy();
    this.rect = null;
    this.setData({
      rectInitialized: false
    });
    if (arr.length === 0) {
      this.wxCanvas.clear();
    }
  },

  imageLoad: function(e) {
    var proportion = e.detail.width/e.detail.height,
        imgW = 750 * 0.95,
        imgH = imgW/proportion;

    this.setData({
      imgHeight: imgH + 'rpx',
      imgWidth: imgW + 'rpx'
    })
  },

  createRect: function() {
    if (!this.rect) {
      var rect = new Shape('rect', {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        lineWidth: 5,
        lineCap: 'round',
        strokeStyle: "#339933",
      }, 'stroke', false);
      this.wxCanvas.add(rect);
      this.rect = rect;
    }
  },

  initializeRectPosition: function(x, y) {
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

  adjustRectPosition: function(x, y) {
    let deltaXmin = Math.abs(x - this.data.rectPosition.xMin);
    let deltaXmax = Math.abs(x - this.data.rectPosition.xMax);
    let deltaYmin = Math.abs(y - this.data.rectPosition.yMin);
    let deltaYmax = Math.abs(y - this.data.rectPosition.yMax);
    let minimum = Math.min(deltaXmin, deltaXmax, deltaYmin, deltaYmax);
    if (deltaXmax === minimum) {
      this.data.rectPosition.xMax = x;
    } else if (deltaXmin === minimum) {
      this.data.rectPosition.xMin = x;
    } else if (deltaYmax === minimum) {
      this.data.rectPosition.yMax = y;
    } else if (deltaYmin === minimum) {
      this.data.rectPosition.yMin = y;
    }
  },

  renderRect: function() {
    this.rect.updateOption({
      x: (this.data.rectPosition.xMin + this.data.rectPosition.xMax) / 2,
      y: (this.data.rectPosition.yMin + this.data.rectPosition.yMax) / 2,
      w: this.data.rectPosition.xMax - this.data.rectPosition.xMin,
      h: this.data.rectPosition.yMax - this.data.rectPosition.yMin
    })
  },

  //画框从此开始
  bindtouchstart: function(e) {
    // 检测手指点击开始事件
    this.wxCanvas.touchstartDetect(e);

    if (!this.data.rectInitialized) {
      this.createRect();
      this.data.rectPosition.xMin = e.touches[0].x;
      this.data.rectPosition.yMin = e.touches[0].y;
    } else {
      this.adjustRectPosition(e.touches[0].x, e.touches[0].y);
      this.renderRect();
    }
  },

  bindtouchmove: function(e) {
    this.wxCanvas.touchmoveDetect(e);
    if (!this.data.rectInitialized) {
      this.initializeRectPosition(e.touches[0].x, e.touches[0].y);
    } else {
      this.adjustRectPosition(e.touches[0].x, e.touches[0].y);
    }
    this.renderRect();
  },

  bindtouchend: function(e) {
    //检测手指点�移出事件
    this.wxCanvas.touchendDetect();
    if (!this.data.rectInitialized) {
      this.setData({
        rectInitialized: true
      });
    }
  },

  bindtap: function(e) {
    // 检测tap事件
    this.wxCanvas.tapDetect(e);
  },

  bindlongpress: function(e) {
    // 检测longpress事件
    this.wxCanvas.longpressDetect(e);
  },

  onLoad: function() {
    let context = wx.createCanvasContext('first');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    this.fetchWorks();
  },

  fetchWorks: function() {
    let pointer = this;
    beevalley.fetchWorks(this.data.apitoken, 'rect', 2, function(res) {
      console.log(res.data);
      let works = res.data;
      pointer.setData({
        works: works
      });
      if (works.length > 0) {
        let currentWork = works[0];
        pointer.setData({
          currentWork: currentWork
        });
        beevalley.downloadWorkFile(pointer.data.apitoken, currentWork.id, function(res) {
          var base64 = wx.arrayBufferToBase64(res.data);
          var base64Data = 'data:image/jpeg;base64,' + base64;
          pointer.setData({
            currentImgSrc: base64Data
          });
        });
      }
    });
  }

})