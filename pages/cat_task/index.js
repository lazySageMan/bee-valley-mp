
const beevalley = require("../../utils/beevalley.js");
Page({
    data: {
        brandArray: [],
        brandIndex: 0,

        modelArray: [],
        modelIndex: 0,
        modelHidden: false
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
        //console.log(e.detail, this.data.typeArray[e.detail.value].id)
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
        this.setData({
            modelHidden: false
        })
    },

    onLoad() {
        this.apitoken = wx.getStorageSync('apitoken');
        beevalley.getCarBranch(this.apitoken, (res) => {
            this.setData({
                brandArray: res.data
            })

            beevalley.getCarModel(this.apitoken, res.data[0].id, (res) => {
                this.setData({
                    modelArray: res.data
                })
            })
        })

    },

    cancel(){
        this.setData({
            modelHidden: false
        })
    }
})