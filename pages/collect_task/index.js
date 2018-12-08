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
                let staticImg = this.data.staticImg
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
        let imgArr = this.data.staticImg.map((item) => {
            return item.photoSrc
        })
        beevalley.workFile(this.token, this.id, imgArr, (res) => {
            if(res.statusCode === 200){
                wx.showToast({
                    title: "上传成功"
                })
                // TODO
            }else{
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    },

    nextWork(){
        wx.showLoading({
            title: "加载中...",
            mask: true,
        })
        beevalley.fetchWorks(this.token, "collect", 1, this.packageId, (res) => {
            this.id = res.data[0].id;
            let imgArr = res.data[0].meta.samples.map((item) => {
                return {
                    src: item,
                    photoSrc: ''
                };
            })
            this.setData({
                staticImg: imgArr,
                textMessage: res.data[0].details
            })
            wx.hideLoading();
        })
    },

    onLoad: function (options) { 
        this.token = wx.getStorageSync('apitoken');
        this.packageId = options.packageId;
        this.nextWork();
    }
})