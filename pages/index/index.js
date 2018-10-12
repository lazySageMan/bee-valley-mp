//index.js
//获取应用实例
const app = getApp()
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;

Page({
  data: {
    imgArr: ["../../image/5.jpg", "../../image/2.jpg", "../../image/3.jpg", "../../image/1.jpg"],
    wxCanvas: null,
    imgHeight: '',
    imgWidth: '',
    canvasPosition: {
      canvasX: 0,
      canvasY: 0,
      canvasW: 0,
      canvasH: 0
    },
    arrPoints: [],
    rect: null,
    isMove: true,
    isShowPoint: true,

    isEdit: null,
    editCanvasPosition: {

    }
  },
  // //事件处理函数

  deleteImg: function () {
    let arr = this.data.imgArr.slice(1)
    this.setData({
      imgArr: arr
    })
    if (arr.length > 0) {
      this.rect.updateOption({
        x: 0,
        y: 0,
        w: 0,
        h: 0
      })
      this.data.canvasPosition = {
        canvasX: 0,
        canvasY: 0,
        canvasW: 0,
        canvasH: 0
      }
      this.data.isMove = true;
    } else {
      console.log(1)
      this.rect.destroy();
      this.wxCanvas.clear();
    }

  },
  imageLoad: function (e) {
    var $imgWidth = e.detail.width,
      $imgHeight = e.detail.height;
    this.setData({
      imgHeight: $imgHeight + 'rpx',
      imgWidth: $imgWidth + 'rpx'
    })

  },
  //画框从此开�
  bindtouchstart: function (e) {
    // 检测手指点击开始事�
    this.wxCanvas.touchstartDetect(e);

    if (this.rect.Shape.Option.x === 0) {
      this.data.canvasPosition.canvasX = e.touches[0].x;
      this.data.canvasPosition.canvasY = e.touches[0].y;
      this.rect.updateOption({
        x: this.data.canvasPosition.canvasX,
        y: this.data.canvasPosition.canvasY
      })
    } else {
      var disX = e.touches[0].x - this.data.canvasPosition.canvasX; //左边最小距�
      var disY = e.touches[0].y - this.data.canvasPosition.canvasY; //上边最小距�
      var diaX = (this.data.canvasPosition.canvasX + this.data.canvasPosition.canvasW) - e.touches[0].x; //右边最小距�
      var diaY = (this.data.canvasPosition.canvasY + this.data.canvasPosition.canvasH) - e.touches[0].y; //下边最小距�
      if (
        e.touches[0].x > this.data.canvasPosition.canvasX
        &&
        e.touches[0].y > this.data.canvasPosition.canvasY
        &&
        (this.data.canvasPosition.canvasX + this.data.canvasPosition.canvasW) > e.touches[0].x
        &&
        (this.data.canvasPosition.canvasY + this.data.canvasPosition.canvasH) > e.touches[0].y
      ) {
        if (disX < 10) {
          //this.rect.draggable = false;
          this.data.isEdit = "left";
        } else if (disY < 10) {
          //this.rect.draggable = false;
          this.data.isEdit = "top";
        } else if (diaX < 10) {
          //this.rect.draggable = false;
          this.data.isEdit = "right";
        } else if (diaY < 10) {
          //this.rect.draggable = false;
          this.data.isEdit = "bottom";
        } else {
          this.data.isEdit = false;
        }
      } else {
        this.data.isEdit = false
      };
    }
  },
  bindtouchmove: function (e) {
    this.wxCanvas.touchmoveDetect(e);
    // 检测手指点�之后的移动事�
    if (this.data.isMove) { //在这里修改框的大�
      this.wxCanvas.touchmoveDetect(e);
      this.data.canvasPosition.canvasW = e.touches[0].x - this.data.canvasPosition.canvasX
      this.data.canvasPosition.canvasH = e.touches[0].y - this.data.canvasPosition.canvasY
      this.rect.updateOption({
        x: this.data.canvasPosition.canvasX + this.data.canvasPosition.canvasW / 2,
        y: this.data.canvasPosition.canvasY + this.data.canvasPosition.canvasH / 2,
        w: this.data.canvasPosition.canvasW,
        h: this.data.canvasPosition.canvasH
      })
    } else {
      if (this.data.isEdit === "bottom") {
        this.data.editCanvasPosition.h = e.touches[0].y - this.data.canvasPosition.canvasY;
        this.data.editCanvasPosition.y = this.data.canvasPosition.canvasY + this.data.editCanvasPosition.h / 2;
        this.rect.updateOption({
          y: this.data.editCanvasPosition.y,
          h: this.data.editCanvasPosition.h
        })
      } else if (this.data.isEdit === "top") {
        this.data.editCanvasPosition.h1 = this.data.canvasPosition.canvasH + (this.data.canvasPosition.canvasY - e.touches[0].y);
        this.data.editCanvasPosition.y1 = e.touches[0].y;
        this.rect.updateOption({
          y: this.data.editCanvasPosition.y1 + this.data.editCanvasPosition.h1 / 2,
          h: this.data.editCanvasPosition.h1
        })
      } else if (this.data.isEdit === "left") {
        this.data.editCanvasPosition.w = this.data.canvasPosition.canvasW + (this.data.canvasPosition.canvasX - e.touches[0].x);
        this.data.editCanvasPosition.x = e.touches[0].x;
        this.rect.updateOption({
          x: this.data.editCanvasPosition.x + this.data.editCanvasPosition.w / 2,
          w: this.data.editCanvasPosition.w
        })
      } else if (this.data.isEdit === "right") {
        this.data.editCanvasPosition.w1 = e.touches[0].x - this.data.canvasPosition.canvasX;
        this.data.editCanvasPosition.x1 = this.data.canvasPosition.canvasX + this.data.editCanvasPosition.w1 / 2;
        this.rect.updateOption({
          x: this.data.editCanvasPosition.x1,
          w: this.data.editCanvasPosition.w1
        })
      }
    }
  },
  bindtouchend: function () {
    //检测手指点�移出事件
    this.wxCanvas.touchendDetect();
    this.data.isMove = false;
    // this.rect.draggable = true;
    if (this.data.isEdit === "bottom") { //将数据同步到 this.data.canvasPosition 好做下一次的编辑
      this.data.canvasPosition.canvasH = this.data.editCanvasPosition.h;
      this.data.canvasPosition.canvasY = this.data.editCanvasPosition.y;
    } else if (this.data.isEdit === "top") {
      this.data.canvasPosition.canvasH = this.data.editCanvasPosition.h1;
      this.data.canvasPosition.canvasY = this.data.editCanvasPosition.y1;
    } else if (this.data.isEdit === "left") {
      this.data.canvasPosition.canvasW = this.data.editCanvasPosition.w;
      this.data.canvasPosition.canvasX = this.data.editCanvasPosition.x;
    } else if (this.data.isEdit === "right") {
      this.data.canvasPosition.canvasW = this.data.editCanvasPosition.w1;
      this.data.canvasPosition.canvasX = this.data.editCanvasPosition.x1;
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
    var context = wx.createCanvasContext('first');
    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    var arrPoints = [1, 2, 3, 4];
    this.circle = [];
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
    // var that = this;
    // rect.bind("drag", function(e){
    //   that.data.canvasPosition.canvasX = e.Shape.Option.x - e.Shape.Option.w/2
    //   that.data.canvasPosition.canvasY = e.Shape.Option.y - e.Shape.Option.h/2
    // })
  },
})
