const app = getApp()
Page({
    data: {

    },
    onLoad: function () {
        console.log("index")
    },
    intoChoose: function () {
        wx.navigateTo({
            url: "../task_list/index"
        })
    },
    intoList: function(){
        wx.navigateTo({
            url: '../table/index'
        })
    }
})