//index.js
//获取应用实例
const app = getApp()
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;

Page({

  data: {
    imgArr: ["../../image/5.jpg", "../../image/2.jpg", "../../image/3.jpg", "../../image/1.jpg"],
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
    let arr = this.data.imgArr.slice(1)
    this.setData({
      imgArr: arr
    })
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
    this.setData({
      imgHeight: e.detail.height + 'rpx',
      imgWidth: e.detail.width + 'rpx'
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
    var context = wx.createCanvasContext('first');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
  }

})