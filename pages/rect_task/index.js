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
    imgHeight: '',
    imgWidth: '',
    rectPosition: {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    },
    rectInitialized: false,
    imgDataArr: [],
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

  clickIcon(e) {
    // e.target.dataset.imgdescription
    wx.showModal({
      title: "提示",
      content: e.target.dataset.imgdescription,
      showCancel: false,
      confirmText: "知道了"
    })
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
    // clearInterval(timer)
  },

  submitWork: function (e) {
    if (this.data.rectInitialized) {
      let imgId = e.currentTarget.dataset.imgid
      let that = this;
      this.data.imgDataArr.forEach((item) => {
        if (item.id === imgId) {
          var relativeAnchorX = item.x / this.data.imgRatio;
          var relativeAnchorY = item.y / this.data.imgRatio;
          if (relativeAnchorX > this.data.rectPosition.xMin && relativeAnchorX < this.data.rectPosition.xMax && relativeAnchorY > this.data.rectPosition.yMin && relativeAnchorY < this.data.rectPosition.yMax) {
            beevalley.submitWork(
              this.data.apitoken,
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
        // let pointP = this.data.pointsPosition.filter((item) => item.id !== imgId);
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
          // pointsPosition: pointP,
          imgDataArr: imgA,
          rectInitialized: false,
          showboxInfo: {
            boxWidth: 0,
            boxHeight: 0,
            top: 0,
            left: 0,
            width: 0,
            height: 0
          },
        })
        if (arr.length === 0 && imgA.length === 0) {
          this.fetchWorks();
        } else {//这边判断请求来的图片，没有就将对应图片的point创建出来
          this.createAnchor(this.data.imgDataArr[0].id)//一直让imgDataArr的第一个作为显示的图片
        }
      }
    })
  },

  imageLoad: function (e) {
    var imgW = this.data.imageAreaWidth,
      imgH = imgW * e.detail.height / e.detail.width;

    this.setData({
      imgHeight: imgH,
      imgWidth: imgW,
      imgRatio: e.detail.width / imgW
    })
    this.createAnchor(e.currentTarget.dataset.imgid);
    this.createRect(e.currentTarget.dataset.imgid);
  },

  createAnchor: function (id) {
    this.data.imgDataArr.forEach((item) => {
      if (item.id === id && !this.circle) {
        var circle = new Shape('circle', {
          x: item.x / this.data.imgRatio,
          y: item.y / this.data.imgRatio,
          r: 5,
          fillStyle: "#E6324B"
        });
        this.wxCanvas.add(circle);
        this.circle = circle;
      }
    })
  },

  createRect: function (id) {
    this.data.imgDataArr.forEach((item) => {
      if (item.id === id && !this.rect) {
        var rect = new Shape('rect', {
          x: ((item.PreviousWork.xMax / this.data.imgRatio) + (item.PreviousWork.xMin / this.data.imgRatio)) / 2,
          y: ((item.PreviousWork.yMin / this.data.imgRatio) + (item.PreviousWork.yMax / this.data.imgRatio)) / 2,
          w: (item.PreviousWork.xMax / this.data.imgRatio) - (item.PreviousWork.xMin / this.data.imgRatio),
          h: (item.PreviousWork.yMax / this.data.imgRatio) - (item.PreviousWork.yMin / this.data.imgRatio),
          lineWidth: 2,
          lineCap: 'round',
          strokeStyle: "#339933",
        }, 'stroke', false);
        this.wxCanvas.add(rect);
        this.rect = rect;
        this.data.rectPosition.xMax = (item.PreviousWork.xMax / this.data.imgRatio);
        this.data.rectPosition.xMin = (item.PreviousWork.xMin / this.data.imgRatio);
        this.data.rectPosition.yMax = (item.PreviousWork.yMax / this.data.imgRatio);
        this.data.rectPosition.yMin = (item.PreviousWork.yMin / this.data.imgRatio);
        clearInterval(this.data.timer);
        this.getCutTime(item.cutOutTime);
        if (this.data.rectPosition.xMax !== 0 && this.data.rectPosition.xMin !== 0 && this.data.rectPosition.yMax !== 0 && this.data.rectPosition.yMin !== 0) {
          this.data.rectInitialized = true //如果有驳回的方框，就开始编辑
          this.changeBox();
        }
      }
    })

  },

  changeBox() { //随方框的大小改变显示的位置
    var top = 0;
    if ((this.data.rectPosition.yMin - 5 - 33) < 0) {
      if ((this.data.rectPosition.yMax + 5 + 33) > this.data.imageAreaHeight) {
        top = this.data.rectPosition.yMin + 20
      } else {
        top = this.data.rectPosition.yMax + 5;
      }
    } else {
      top = this.data.rectPosition.yMin - 10 - 33;
    }
    this.setData({
      showboxInfo: {
        boxWidth: this.data.rectPosition.xMax - this.data.rectPosition.xMin,
        boxHeight: this.data.rectPosition.yMax - this.data.rectPosition.yMin,
        top: top,
        left: this.data.rectPosition.xMin,
        width: 65,
        height: 33
      }
    })
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

  renderRect: function () {

    this.rect.updateOption({
      x: (this.data.rectPosition.xMin + this.data.rectPosition.xMax) / 2,
      y: (this.data.rectPosition.yMin + this.data.rectPosition.yMax) / 2,
      w: this.data.rectPosition.xMax - this.data.rectPosition.xMin,
      h: this.data.rectPosition.yMax - this.data.rectPosition.yMin
    });
    this.changeBox()
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
    } else {
      this.adjustRectPosition(Math.floor(e.touches[0].x, Math.floor(e.touches[0].y)));
      this.renderRect();
    }
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
      that.fetchWorks();
    })

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
      this.downloadWorkFile()
    } else {
      wx.hideLoading()
      wx.showToast({
        title: '暂时没有任务，请稍后再试。',
        mask: true,
        icon: "loading"
      });
    }
  },

  downloadWorkFile: function () {
    let that = this;
    if (this.data.works.length !== 0) {
      var imgArr = [];
      // console.log(this.data.pointsPosition)
      this.data.works.forEach((item) => {
        let anchorX = Math.floor(item.prerequisites[0].result[item.meta.index].x);
        let anchorY = Math.floor(item.prerequisites[0].result[item.meta.index].y);
        let PreviousRect = that.getPreviousRect(item.previousWork);
        // console.log(PreviousRect)
        // TODO remove default image width height 
        let options = that.calculateWorkarea(item.meta.imageWidth ? item.meta.imageWidth : 1536, item.meta.imageHeight ? item.meta.imageHeight : 1900, anchorX, anchorY, that.data.imageAreaWidth, that.data.imageAreaHeight);
        options['format'] = 'png';
        beevalley.downloadWorkFile(this.data.apitoken, item.id, options, function (res) {
          that.handleError(res);
          imgArr.push({
            description: item.description,
            src: 'data:image/png;base64,' + wx.arrayBufferToBase64(res.data),
            id: item.id,
            xOffset: options.x,
            yOffset: options.y,
            x: anchorX - options.x,
            y: anchorY - options.y,
            PreviousWork: {
              xMin: PreviousRect ? PreviousRect.xMin : 0,
              xMax: PreviousRect ? PreviousRect.xMax : 0,
              yMin: PreviousRect ? PreviousRect.yMin : 0,
              yMax: PreviousRect ? PreviousRect.yMax : 0
            },
            cutOutTime: item.expiredAt
          })
          that.setData({
            imgDataArr: imgArr
          })
          wx.hideLoading()
        })
      })
    }
  },

  getPreviousRect: function (PreviousWork) {
    // console.log(PreviousWork)
    if (PreviousWork && PreviousWork.result.length === 1) {
      var result = PreviousWork.result[0];
      return {
        xMin: result[0].x,
        yMin: result[0].y,
        xMax: result[1].x,
        yMax: result[1].y
      }
    } else {
      return false
    }
  },

  calculateWorkarea: function (imageWidth, imageHeight, anchorX, anchorY, windowWidth, windowHeight) {
    var x;
    if (anchorX < windowWidth / 2) {
      x = 0;
    } else if (anchorX > imageWidth - windowWidth / 2) {
      x = imageWidth - windowWidth;
    } else {
      x = anchorX - windowWidth / 2
    }
    var y;
    if (anchorY < windowHeight / 2) {
      y = 0;
    } else if (anchorY > imageHeight - windowHeight / 2) {
      y = imageHeight - windowHeight;
    } else {
      y = anchorY - windowHeight / 2
    }
    return { x: Math.floor(x), y: Math.floor(y), width: windowWidth, height: windowHeight };
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