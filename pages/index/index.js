//index.js
//获取应用实例
var wxDraw= require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;

const app = getApp()

Page({
  data: {
    imgArr : ["../../image/1.jpg","../../image/2.jpg","../../image/3.jpg","../../image/5.jpg"],
    wxCanvas : null,
    imgHeight : '',
    imgWidth : '',
    canvasPosition:{
      canvasX : 0,
      canvasY : 0,
      canvasW : 0,
      canvasH : 0
    },
    rect:null

  },
  // //事件处理函数

  deleteImg: function() {
    let arr = this.data.imgArr.slice(1)
    this.setData({
      imgArr : arr
    })
  },
  onLoad: function() {
    var context = wx.createCanvasContext('first');
    this.wxCanvas = new wxDraw(context);
  },
  imageLoad: function(e){
    var $imgWidth = e.detail.width,
        $imgHeight = e.detail.height;
        // ratio = $imgWidth/$imgHeight,
        // viewHeight = 1000,
        // viewWidth = 1000*ratio;
    this.setData({
      imgHeight : $imgHeight+'rpx',
      imgWidth : $imgWidth+'rpx'
    })

  },
  //画框从此开始
  bindtouchstart:function(e){
    // 检测手指点击开始事件
    this.data.canvasPosition.canvasX = e.touches[0].x;
    this.data.canvasPosition.canvasY = e.touches[0].y;
    if(!this.data.rect){
      this.wxCanvas.touchstartDetect(e);
      this.data.rect = new Shape('rect', {
                                      x: this.data.canvasPosition.canvasX, 
                                      y: this.data.canvasPosition.canvasY, 
                                      w: 0, 
                                      h: 0, 
                                      lineWidth: 2, 
                                      lineCap: 'round',
                                      strokeStyle:"#339933",
                                    }, 'stroke', true);
      this.wxCanvas.add(this.data.rect)
    }else{
      this.data.rect.updateOption({
        x : this.data.canvasPosition.canvasX,
        y : this.data.canvasPosition.canvasY
      })
    }
  },
  bindtouchmove:function(e){
    // 检测手指点击 之后的移动事件
    this.wxCanvas.touchmoveDetect(e);
    this.data.canvasPosition.canvasW = e.touches[0].x - this.data.canvasPosition.canvasX
    this.data.canvasPosition.canvasH = e.touches[0].y - this.data.canvasPosition.canvasY
    this.data.rect.updateOption({
      x : this.data.canvasPosition.canvasX + this.data.canvasPosition.canvasW/2,
      y : this.data.canvasPosition.canvasY + this.data.canvasPosition.canvasH/2,
      w : this.data.canvasPosition.canvasW,
      h : this.data.canvasPosition.canvasH
    })
    
  },
  bindtouchend:function(){
     //检测手指点击 移出事件
    this.wxCanvas.touchendDetect();
  },
  bindtap:function(e){
    // 检测tap事件
    this.wxCanvas.tapDetect(e);
  },
  bindlongpress:function(e){
       // 检测longpress事件
    this.wxCanvas.longpressDetect(e);
  },
})
