
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

    showModel(){
        this.setData({
            modelHidden: true
        })
    },

    bindPickerChange2(e){
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

    submit(){
        // 需要上传的id
        // console.log(this.data.brandArray[this.data.brandIndex].id, this.data.modelArray[this.data.modelIndex].id) 
        this.setData({
            modelHidden: false
        })

        this.nextWork();
    },

    nextWork(){

        wx.showLoading({
            title: "加载中",
            mask: true,
        })

        beevalley.fetchWorks(this.apitoken, "attribute", 1, this.packageId, (res) => {
            if (beevalley.handleError(res)) {
                this.workId = res.data[0].id;
                beevalley.downloadWorkFile(this.apitoken, this.workId, {}, (res4) => {
                    if (beevalley.handleError(res4)) {
                        let imageSrc = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res4.data)

                        this.setData({
                            'currentWork.src': imageSrc
                        });
                    }
                    wx.hideLoading();
                })
                if(this.data.brandArray.length === 0){

                    beevalley.getCarBranch(this.apitoken, (res2) => {
                        if(beevalley.handleError(res2)){

                            this.setData({
                                brandArray: res2.data
                            })
                
                            beevalley.getCarModel(this.apitoken, res2.data[0].id, (res3) => {
                                if(beevalley.handleError(res3)){

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

    cancel(){
        this.setData({
            modelHidden: false
        })
    }
})