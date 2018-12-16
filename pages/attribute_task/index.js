const beevalley = require("../../utils/beevalley.js");
Page({
    data: {
        brandArray: [],
        brandIndex: 0,

        modelArray: [],
        modelIndex: 0,
        modelHidden: false,

        currentWork: {}
    },

    showModel() {
        this.setData({
            modelHidden: true
        })
    },

    bindPickerChange2(e) {
        this.setData({
            modelIndex: e.detail.value
        })
    },

    bindPickerChange(e) {
        beevalley.getCarModel(this.apitoken, this.data.brandArray[e.detail.value].id, (res) => {
            this.setData({
                modelArray: res.data
            })
        })
        this.setData({
            brandIndex: e.detail.value
        })
    },

    submitWork() {
        // 需要上传的id
        // console.log(this.data.brandArray[this.data.brandIndex].id, this.data.modelArray[this.data.modelIndex].id) 
        if(this.data.displayTimer === "超时"){
            this.showLoading();
            wx.navigateBack({
                delta: 1
            })
        }else{
            this.setData({
                modelHidden: false
            })
            
            this.nextWork();
        }

        
    },

    cancelWork() {
        if (this.data.currentWork) {
            wx.showLoading({
                title: "加载中",
                mask: true,
            })
            let deletedWorkId = this.data.currentWork.id;
            beevalley.cancelWork(this.apitoken, [deletedWorkId], (res) => {
                if (beevalley.handleError(res)) {
                    this.nextWork();
                } 
            })
        }
    },

    clickIcon() {
        if (this.data.currentWork) {
            var info = ''

            this.data.currentWork.details.forEach(item => {
                info += `• ${item}\r\n`
            })

            wx.showModal({
                title: '提示',
                content: info,
                showCancel: false,
                confirmText: "知道了"
            })
        }
    },

    imageLoad(){
        this.clearTimer();
        this.timer = beevalley.startTimer( (data) => {
            this.setData(data);
        }, this.data.currentWork.expiredAt);
    },

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },

    nextWork() {
        wx.showLoading({
            title: "加载中",
            mask: true,
        })

        beevalley.fetchWorks(this.apitoken, "attribute", 1, this.packageId, (res) => {
            if (beevalley.handleError(res)) {
                let work = {};
                work.id = res.data[0].id
                work.price = res.data[0].price;
                work.details = res.data[0].details;
                work.expiredAt = res.data[0].expiredAt;

                beevalley.downloadWorkFile(this.apitoken, work.id, {}, (res4) => {
                    if (beevalley.handleError(res4)) {
                        work.src = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res4.data)

                        this.setData({
                            currentWork: work
                        });
                    }
                    wx.hideLoading();
                })
                if (this.data.brandArray.length === 0) {

                    beevalley.getCarBranch(this.apitoken, (res2) => {
                        if (beevalley.handleError(res2)) {

                            this.setData({
                                brandArray: res2.data
                            })

                            beevalley.getCarModel(this.apitoken, res2.data[0].id, (res3) => {
                                if (beevalley.handleError(res3)) {

                                    this.setData({
                                        modelArray: res3.data
                                    })
                                }

                            })
                        }

                    })
                }

            }
        })
    },

    onLoad(options) {
        this.packageId = options.packageId;
        this.apitoken = wx.getStorageSync('apitoken');
        this.nextWork();

    },

    hideModel() {
        this.setData({
            modelHidden: false
        })
    }
})