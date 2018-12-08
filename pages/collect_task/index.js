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
        let isSubmit = this.data.staticImg.find((item) => item.photoSrc === '');
        if(isSubmit){
            wx.showToast({
                title: "请上传任务图片"
            })
            return ;
        }else{

            this.uploadImg()
        }
        
    },

    uploadImg(){
        if(this.countIndex === this.data.staticImg.length){
            wx.hideLoading();
            beevalley.submitWork(this.token, this.id, this.uploadedImages, (res) => {
                if(res.statusCode === 200){
                    wx.showToast({
                        title: "上传成功"
                    })
                }else{
                    wx.showToast({
                        title: "上传失败，请重试"
                    })
                }
            })
        
        }else{
            wx.showLoading({
                title: "上传中...",
                mask: true,
            })
            beevalley.workFile(this.token, this.id, this.data.staticImg[this.countIndex].photoSrc, (res) => {
            
                if(res.statusCode === 200) {
                    this.uploadedImages.push(JSON.parse(res.data)[0]);
                    this.uploadImg();
                }else{
                    this.uploadedImages = [];
                    this.countIndex = 0;
                } 
            })
            this.countIndex++; 
        }
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
        this.uploadedImages = [];
        this.countIndex = 0;
        this.token = wx.getStorageSync('apitoken');
        this.packageId = options.packageId;
        this.nextWork();
    }
})