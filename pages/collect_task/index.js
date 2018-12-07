const beevalley = require("../../utils/beevalley.js");
Page({
    data: {
        img1: '/img/1.jpg',
        staticImg: [],
        showCamera: false
    },

    takePhoto() {
        const ctx = wx.createCameraContext()
        ctx.takePhoto({
            quality: 'high',
            success: (res) => {
                let staticImg = this.data.staticImg.map((item,index) => {
                    if(index === this.data.indexPhoto){
                        item.photoSrc = res.tempImagePath
                    }
                    return item;
                })

                this.setData({
                    showCamera: false,
                    staticImg: staticImg
                })
            }
        })

    },

    error(e) {
        console.log(e.detail)
    },

    takePhotos(e){
        let index = e.currentTarget.dataset.index;
        this.setData({
            indexPhoto: index,
            showCamera: true
        })
    },

    submitWork(){
        let imgArr = this.data.staticImg.map((item) => {
            return item.photoSrc
        })
        beevalley.workFile(this.token, this.packageId, imgArr, (res) => {
            console.log(res)
        })
    },

    onLoad: function(options){
        this.token = wx.getStorageSync('apitoken');
        this.packageId = options.packageId;
        beevalley.fetchWorks(this.token, "collect", 1, this.packageId, (res) => {
            
            let imgArr = res.data[0].meta.samples.map((item) => {
                return {
                    src: item,
                    photoSrc: ''
                };
            })
            this.setData({
                staticImg: imgArr
            })
        })
    }
})