const beevalley = require("../../utils/beevalley.js");
Page({
    data: {
        staticImg: [],
    },

    takePhotos(e){
        let indexs = e.currentTarget.dataset.index;

        wx.chooseImage({
            count: 1,
            sourceType: "camera",
            sizeType: "original",
            success: (res) => {
                let staticImg = this.data.staticImg.map((item,index) => {
                    if(index === indexs){
                        item.photoSrc = res.tempFilePaths[0]
                    }
                    return item;
                })
                this.setData({
                    staticImg: staticImg
                })
            }
        })
    },

    delete(e){
        let indexs = e.currentTarget.dataset.index;

        let staticImg = this.data.staticImg.map((item,index) => {
            if(index === indexs){
                item.photoSrc = ''
            }
            return item;
        })

        this.setData({
            staticImg: staticImg
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