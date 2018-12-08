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
            new Promise((resove, reject) => {
                this.data.staticImg.forEach((item) => {
                    beevalley.workFile(this.token, this.id, item.photoSrc, (res) => {
                    
                        if(res.statusCode === 200) {
                            
                            this.uploadedImages.push(JSON.parse(res.data)[0]);
                            if(this.uploadedImages.length === this.data.staticImg.length){
                                resove(this.uploadedImages);
                            }
                        }else{
                            this.uploadedImages = [];
                            reject(res)
                        } 
                    })
                })
                
            }).then(uploadedImages => {
                beevalley.submitWork(this.token, this.id, uploadedImages, (res) => {
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
            }).catch((err) => {
                wx.showToast({
                    title: "上传失败，请重试"
                })
            })
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
        this.uploadedImages = []
        this.token = wx.getStorageSync('apitoken');
        this.packageId = options.packageId;
        this.nextWork();
    }
})