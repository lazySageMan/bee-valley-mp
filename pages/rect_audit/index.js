let beevalley = require("../../utils/beevalley.js");
let wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
let Shape = require("../../utils/wxdraw.min.js").Shape;

Page({
    data: {
        apiToken: null,
        pointsPosition: [],
        rectsPosition: [],
        imgDataArr: [],
        imgHeight: 0,
        imgWidth: 0,
    },
    onLoad: function () {
        console.log("audit pages");
        this.setData({
            apiToken: wx.getStorageSync('apitoken')
        });
        let context = wx.createCanvasContext('rectAudit');
        this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    pixelRatio: res.pixelRatio,
                    windowWidth: res.windowWidth
                });
                that.fetchWorks("rect")
            }
        });
    },
    imageLoad: function (e) {
        var imgW = this.data.windowWidth,
            imgH = imgW * e.detail.height / e.detail.width;
        this.setData({
            imgHeight: imgH,
            imgWidth: imgW,
            imgRatio: e.detail.width / imgW
        })
        if (this.data.pointsPosition.length > 0) {
            this.createAnchor(e.currentTarget.dataset.imgid);
        } else if (this.data.rectsPosition.length > 0) {
            this.createRect(e.currentTarget.dataset.imgid);
        }
    },
    deleteImg: function (imgId) {
        let pointP = this.data.pointsPosition.filter((item) => item.id !== imgId);
        let rectP = this.data.rectsPosition.filter((item) => item.id !== imgId);
        let imgA = this.data.imgDataArr.filter((item) => item.id !== imgId);
        if (this.rect) {
            this.rect.destroy();
            this.rect = null;
        }
        if (this.circle) {
            this.circle.destroy();
            this.circle = null;
        }
        this.setData({
            pointsPosition: pointP,
            rectsPosition: rectP,
            imgDataArr: imgA
        })
        if (imgA.length === 0) {
            this.fetchWorks("rect")
        } else {
            this.createAnchor(this.data.imgDataArr[0].id);
            this.createRect(this.data.imgDataArr[0].id);
        }
    },
    submitWork: function (e) {
        var imgId = e.currentTarget.dataset.imgid;
        var that = this;
        beevalley.submitAuditWork(this.data.apiToken, imgId, true, function (res) {
            if (res.statusCode === 200) {
                that.deleteImg(imgId);
            }
        })
    },
    rejectWork: function (e) {
        var imgId = e.currentTarget.dataset.imgid;
        var that = this;
        beevalley.submitAuditWork(this.data.apiToken, imgId, false, function (res) {
            if (res.statusCode === 200) {
                that.deleteImg(imgId);
            }
        })
    },
    cancelWork: function (e) {
        var imgId = e.currentTarget.dataset.imgid;
        var that = this;
        beevalley.cancelAuditWork(this.data.apiToken, imgId, function (res) {
            if (res.statusCode === 200) {
                that.deleteImg(imgId);
            }
        })
    },
    fetchWorks: function(type){
        var that = this;
        beevalley.fetchAuditWorks(that.data.apiToken, type, 2, function (res) { //这边接受一个query确定是什么类型的请求
            if(res.data.length > 0){
                wx.showLoading({
                    title: "加载中",
                    mask: true,
                })
                that.changePosition(res.data, type)
            }else{
                wx.showToast({
                    title: "没有任务，请联系客服",
                    icon: "loading",
                    mask: true,
                    duration:2000,
                    success: function(){
                        wx.navigateTo({
                            url: "../index/index"
                        })
                    }
                })
            }
        })
    },
    changePosition: function (data, type) {
        if (type === 'rect' && data.length > 0) {//根据类型分别处理数据
            var positionArr = [];
            data.forEach((item) => {
                positionArr.push({
                    id: item.id,
                    minX: item.work.result[0][0].x,
                    minY: item.work.result[0][0].y,
                    maxX: item.work.result[0][1].x,
                    maxY: item.work.result[0][1].y
                })
                this.setData({
                    rectsPosition: positionArr
                })
            })
            this.getImgFiles(this.data.rectsPosition);
        } else if (type === 'count' && data.length > 0) {
            //这里吧对应的点放入
        }
    },
    getImgFiles(work) {
        if (work.length > 0) {
            var imgArr = [];
            var that = this;
            work.forEach((item) => {
                beevalley.downloadAuditWorkFile(this.data.apiToken, item.id, function (res) {
                    imgArr.push({
                        src: 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res.data),
                        id: item.id
                    })
                    that.setData({
                        imgDataArr: imgArr
                    })
                    wx.hideLoading();
                })

            })
        }

    },
    createAnchor: function (id) {
        // this.data.pointsPosition.forEach((item) => {
        //   if (item.id === id && !this.circle) {
        //     var circle = new Shape('circle', {
        //         x: item.x / this.data.imgRatio,
        //         y: item.y / this.data.imgRatio,
        //         r: 2,
        //         fillStyle: "#E6324B"
        //     });
        //     this.wxCanvas.add(circle);
        //     this.circle = circle;
        //   }
        // })
    },
    createRect: function (id) {
        if (!this.rect) {
            this.data.rectsPosition.forEach((item) => {
                if (item.id === id) {
                    var rect = new Shape('rect', {
                        x: ((item.maxX / this.data.imgRatio) + (item.minX / this.data.imgRatio)) / 2,
                        y: ((item.maxY / this.data.imgRatio) + (item.minY / this.data.imgRatio)) / 2,
                        w: (item.maxX / this.data.imgRatio) - (item.minX / this.data.imgRatio),
                        h: (item.maxY / this.data.imgRatio) - (item.minY / this.data.imgRatio),
                        lineWidth: 2,
                        lineCap: 'round',
                        strokeStyle: "#339933",
                    }, 'stroke', false);
                    this.wxCanvas.add(rect);
                    this.rect = rect;
                }
            })
        }
    },
})