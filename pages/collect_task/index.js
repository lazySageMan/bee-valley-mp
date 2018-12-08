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
                beevalley.workFile(this.token, this.id, res.tempFilePaths[0], (res) => {
                    
                    if(res.statusCode === 200) {
                        
                        this.taskId.push({name: index, id: JSON.parse(res.data)[0]});
                        this.setData({
                            staticImg: staticImg
                        })
                    } 
                     
                })
            }
        })
    },

    delete(e) {
        let index = e.currentTarget.dataset.index;

        let staticImg = this.data.staticImg
        staticImg[index].photoSrc = '';
        this.taskId = this.taskId.filter((item) => item.name !== index)
        console.log(this.taskId)
        this.setData({
            staticImg: staticImg
        })
    },

    submitWork() {

        if(this.data.staticImg.length !== this.taskId.length){
            wx.showToast({
                title: "请上传任务图片"
            })
            return ;
        }else{
            this.taskId = this.taskId.map(item => item.id)
            beevalley.submitWork(this.token, this.id, this.taskId, (res) => {
                if(res.statusCode === 200){
                    wx.showToast({
                        title: "上传成功"
                    })
                }
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
        this.taskId = []
        this.token = wx.getStorageSync('apitoken');
        this.packageId = options.packageId;
        this.nextWork();
    }
})