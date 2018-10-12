const app = getApp()
Page({
    data: {

    },
    onLoad: function () {
        console.log("任务面板")
    },
    intoIfram: function () {
        wx.navigateTo({
            url: "../index/index"
        })
    }
})