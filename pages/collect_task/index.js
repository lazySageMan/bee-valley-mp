const beevalley = require("../../utils/beevalley.js");
Page({
  data: {
    staticImg: [],
  },

  takePhotos(e) {
    let index = e.currentTarget.dataset.index;

    wx.chooseImage({
      count: 1,
      sourceType: "camera",
      sizeType: "original",
      success: (res) => {

        let staticImg = this.data.staticImg;
        staticImg[index].photoSrc = res.tempFilePaths[0];
        this.setData({
          staticImg: staticImg
        })
      }
    })
  },

  delete(e) {
    let index = e.currentTarget.dataset.index;

    let staticImg = this.data.staticImg
    staticImg[index].photoSrc = '';
    this.setData({
      staticImg: staticImg
    })
  },

  submitWork() {
    let imageNotReady = this.data.staticImg.find((item) => item.photoSrc === '');
    if (imageNotReady) {
      wx.showToast({
        title: "仍有图片未添加"
      })
    } else {
      wx.showLoading({
        title: "上传中...",
        mask: true,
      })
      this.uploadImg()
    }
  },

  uploadImg() {
    let that = this
    if (this.countIndex === this.data.staticImg.length) {
      wx.hideLoading()
      beevalley.submitWork(this.token, this.id, this.uploadedImages, (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: "上传成功",
            success: that.nextWork
          })
        } else {
          wx.showToast({
            title: "上传失败，请重试"
          })
        }
      })
    } else {
      beevalley.workFile(this.token, this.id, this.data.staticImg[this.countIndex].photoSrc, (res) => {
        that.handleError(res)
        if (res.statusCode === 200) {
          that.uploadedImages.push(JSON.parse(res.data)[0]);
          that.countIndex++;
          that.uploadImg();
        } else {
          that.uploadedImages = [];
          that.countIndex = 0;
          wx.hideLoading()
          wx.showToast({
            title: "上传失败，请重试"
          })
        }
      })
    }
  },

  handleError: function (res) {
    if (res.statusCode === 403) {
      // TODO handle error
      wx.showModal({
        title: '任务超时',
        content: '请稍后重试',
        showCancel: false,
        confirmText: "知道了",
        success: function () {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  },

  nextWork() {
    wx.showLoading({
      title: "加载中...",
      mask: true,
    })
    this.id = null
    this.uploadedImages = [];
    this.countIndex = 0;
    let that = this
    beevalley.fetchWorks(this.token, "collect", 1, this.packageId, (res) => {
      that.handleError(res)
      wx.hideLoading()
      if (res.data.length > 0) {
        that.id = res.data[0].id;
        let imgArr = res.data[0].meta.samples.map((item) => {
          return {
            src: item,
            photoSrc: ''
          };
        })
        that.setData({
          staticImg: imgArr,
          textMessage: res.data[0].details
        })
      } else {
        wx.showToast({
          title: "没有任务了"
        })
      }
    })
  },

  onLoad: function (options) {
    this.uploadedImages = [];
    this.countIndex = 0;
    this.token = wx.getStorageSync('apitoken');
    this.packageId = options.packageId;
    this.nextWork();
  },

  onUnload: function () {
    if (this.id) {
      beevalley.cancelWork(this.token, [this.id], function (res) { })
    }
  }

})