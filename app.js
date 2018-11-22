//app.js
App({
  onLaunch: function (options) {
    if (options.referrerInfo && options.referrerInfo.extraData && options.referrerInfo.extraData.partner === 'qts') {
      let uid = options.referrerInfo.extraData.uid
      this.globalData['uid'] = uid
    }
  },

  globalData: {}

})