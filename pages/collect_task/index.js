const beevalley = require("../../utils/beevalley.js");
Page({
  data: {
    staticImg: [],
  },

  takePhotos(e) {
    let index = e.currentTarget.dataset.index;

    wx.chooseImage({
      count: 1,
      // sourceType: "camera",
      sizeType: "original",
      success: (res) => {

        let staticImg = this.data.staticImg;
        staticImg[index].photoSrc = res.tempFilePaths[0];

        if(res.tempFiles[0].size <= 10000000){
          //console.log(res.tempFiles[0].size)
          this.setData({
            staticImg: staticImg
          })
        }else{
          wx.showToast({
            title: "图片不能超过10M"
          })
        }
      }
    })
  },

  delete(e) {
    let index = e.currentTarget.dataset.index;

    let staticImg = this.data.staticImg
    staticImg[index].photoSrc = null;
    this.setData({
      staticImg: staticImg
    })
  },

  submitWork() {
    let imageNotReady = this.data.staticImg.find((item) => !item.photoSrc);
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

  cancelWork() {
    if (this.id) {
      wx.showLoading({
        title: "加载中...",
        mask: true,
      })
      beevalley.cancelWork(this.token, [this.id], (res) => this.nextWork())
    }
  },

  uploadImg() {
    let that = this
    if (this.countIndex === this.data.staticImg.length) {

      let uploadFileIds = this.data.staticImg.map(e => e.fileId).filter(f => f)

      beevalley.submitWork(this.token, this.id, uploadFileIds, (res) => {
        that.handleError(res)
        wx.hideLoading()
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

      let ele = this.data.staticImg[this.countIndex]

      if (!ele.shouldUpload) { //判断图片是否已经 是上传成功的
        that.countIndex++;
        that.uploadImg();
      } else {
        beevalley.workFile(this.token, this.id, ele.photoSrc, (res) => {
          that.handleError(res)
          if (res.statusCode === 200) {
            ele.fileId = JSON.parse(res.data)[0];  //根据对应的下标，赋值id
            that.countIndex++;
            that.uploadImg();
          } else {
            // that.uploadedImages = [];
            that.countIndex = 0;
            wx.hideLoading()
            wx.showToast({
              title: "上传失败，请重试"
            })
          }
        })
      }

    }
  },

  handleError: function (res) {
    if (res.statusCode === 403) {
      // TODO handle error
      if (typeof res.data === 'object' && res.data.code === '20') {
        wx.showModal({
          title: '任务配额已用完',
          content: '请稍后重试',
          showCancel: false,
          confirmText: "知道了",
          success: function () {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      } else {
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
    }
  },

  nextWork() {
    wx.showLoading({
      title: "加载中...",
      mask: true,
    })
    this.id = null
    // this.uploadedImages = [];
    this.countIndex = 0;
    let that = this
    beevalley.fetchWorks(this.token, "collect", 1, this.packageId, (res) => {
      that.handleError(res)
      wx.hideLoading()
      if (res.data.length > 0) {
        let work = res.data[0]
        that.id = work.id;
        let imgArr = work.meta.samples.map((item) => {
          return {
            src: item,
            editable: true,
            shouldUpload: true
          };
        })
        if (work.previousWork) {
          let successImg = this.getDiff(work.previousWork.result, work.meta.rejectedReason);

          successImg.forEach(f => {
            let index = work.previousWork.result.indexOf(f)
            imgArr[index].editable = false
            imgArr[index].shouldUpload = false
            imgArr[index].fileId = f

            beevalley.downloadWorkFiles(this.token, work.id, f, (res) => {
              that.handleError(res);
              // let imageSrc = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res.data);
              let newImgArr = that.data.staticImg
              newImgArr[index].photoSrc = res.tempFilePath
              // this.uploadedImages[index] = f;
              that.setData({//由于是异步所以每次都需要更新数据，
                staticImg: newImgArr
              })
            })
          })
        }

        this.setData({
          staticImg: imgArr,
          textMessage: work.details
        })

      } else {
        wx.showToast({
          title: "没有任务了"
        })
      }
    })
  },

  getDiff(arr1, arr2) {
    return arr1.filter(i => arr2.indexOf(i) < 0)
  },

  onLoad: function (options) {
    // this.uploadedImages = [];
    this.countIndex = 0;
    this.token = wx.getStorageSync('apitoken');
    this.packageId = options.packageId;
    this.nextWork();
  },

  onUnload: function () {
    if (this.id) {
      // beevalley.cancelWork(this.token, [this.id], function (res) { })
    }
  }

})