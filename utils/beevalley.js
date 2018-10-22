// common.js

const TODVIEW_API_BASE_URL = 'https://api.todview.com/v1/';

function fetchWorks(token, type, num, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/fetch',
    method: 'POST',
    data: {
      'type': type,
      'num': num
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function downloadWorkFile(token, workId, options, callback) {
  wx.request({
    url: options ? `${TODVIEW_API_BASE_URL}works/${workId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height}` : `${TODVIEW_API_BASE_URL}works/${workId}/file`,
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    responseType: 'arraybuffer',
    success: wrap(callback)
  });
}

function submitWork(token, workId, result, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works',
    method: 'POST',
    data: {
      'id': workId,
      'result': result
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function cancelWork(token, workIds, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/' + workIds.join(',') + '/cancel',
    method: 'DELETE',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function cancelReview(token, reviewIds, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'reviews/' + reviewIds.join(',') + '/cancel',
    method: 'DELETE',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function login(code, callback, encryptedData, iv) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'login/weixin_mp/' + code + ((encryptedData && iv) ? '?encryptedData=' + encodeURIComponent(encryptedData) + '&iv=' + encodeURIComponent(iv) : ''),
    method: 'POST',
    success: wrap(callback)
  });
}

function listAuthorizedWorkType(token, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/authorized_types',
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function getWorkHistory(token, nowTime, apiType, callback) {
  wx.request({
    url: `${TODVIEW_API_BASE_URL}works/history/type/${apiType}/before/${nowTime}/limit/100`,
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    method: 'GET',
    success: wrap(callback)
  })
}

function wrap(callback) {
  return (res) => {
    handleError(res);
    callback(res);
  }
}

function handleError(res) {
  if (res.statusCode === 401) {
    wx.removeStorageSync('apitoken');
    wx.reLaunch({
      url: "../index/index"
    });
  } else if (res.statusCode === 403) {
    // TODO handle conflict case
    // wx.navigateTo({
    //   url: "../index/index"
    // });
  }
}

//audit 

function fetchAuditWorks(token, type, num, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'reviews/fetch',
    method: 'POST',
    data: {
      'type': type,
      'num': num
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function downloadAuditWorkFile(token, workId, options, callback) {
  wx.request({
    url: options ? `${TODVIEW_API_BASE_URL}reviews/${workId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height}` : `${TODVIEW_API_BASE_URL}reviews/${workId}/file`,
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    responseType: 'arraybuffer',
    success: wrap(callback)
  });
}

function submitReview(token, workId, result, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'reviews',
    method: 'POST',
    data: {
      'id': workId,
      'result': result
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function listAuthorizedReviewsType(token, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'reviews/authorized_types',
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: wrap(callback)
  });
}

function formatCountDown(expiredTime) {
  let now = new Date().getTime();
  var displayCountDown;
  if (expiredTime > now) {
    let millisToGo = expiredTime - now;
    let secondsToGo = Math.floor(millisToGo / 1000);
    let seconds = secondsToGo % 60;
    let minutes = parseInt(secondsToGo / 60);
    displayCountDown = minutes + ':' + (seconds > 10 ? seconds : '0' + seconds);
  } else {
    displayCountDown = '超时';
  }
  return displayCountDown;
}

//common

function calculateWorkarea(imageWidth, imageHeight, anchorX, anchorY, windowWidth, windowHeight) {
  var x;
  if (anchorX < windowWidth / 2) {
      x = 0;
  } else if (anchorX > imageWidth - windowWidth / 2) {
      x = imageWidth - windowWidth;
  } else {
      x = anchorX - windowWidth / 2
  }
  var y;
  if (anchorY < windowHeight / 2) {
      y = 0;
  } else if (anchorY > imageHeight - windowHeight / 2) {
      y = imageHeight - windowHeight;
  } else {
      y = anchorY - windowHeight / 2
  }
  return { x: Math.floor(x), y: Math.floor(y), width: windowWidth, height: windowHeight };
}

function renderInfoBox(that) { //随方框的大小改变显示的位置
  if (that.data.rectPosition) {
      var top = 0;
      if ((that.data.rectPosition.yMin - 5 - 33) < 0) {
          if ((that.data.rectPosition.yMax + 5 + 33) > that.data.imageAreaHeight) {
              top = that.data.rectPosition.yMin + 20
          } else {
              top = that.data.rectPosition.yMax + 5;
          }
      } else {
          top = that.data.rectPosition.yMin - 10 - 33;
      }
      let boxWidth = that.data.rectPosition.xMax - that.data.rectPosition.xMin;
      let boxHeight = that.data.rectPosition.yMax - that.data.rectPosition.yMin;

      that.setData({
          showboxInfo: {
              boxWidth: boxWidth,
              boxHeight: boxHeight,
              top: top,
              left: that.data.rectPosition.xMin,
              width: 65,
              height: 33
          }
      })
  }
}

function startTimer(that) {
  clearInterval(that.timer);
  // var that = that;
  let expiredTime = new Date(that.data.currentWork.expiredAt).getTime();
  that.timer = setInterval(function () {
      that.setData({
          displayTimer: formatCountDown(expiredTime)
      })
  }, 1000);
}

function renderRect(that) {
  // console.log(this.data.rectPosition)
  if (that.data.rectPosition) {
    that.rect.updateOption({
          x: (that.data.rectPosition.xMin + that.data.rectPosition.xMax) / 2,
          y: (that.data.rectPosition.yMin + that.data.rectPosition.yMax) / 2,
          w: that.data.rectPosition.xMax - that.data.rectPosition.xMin,
          h: that.data.rectPosition.yMax - that.data.rectPosition.yMin
      });
  }

}

module.exports.fetchWorks = fetchWorks
exports.downloadWorkFile = downloadWorkFile
exports.submitWork = submitWork
exports.cancelWork = cancelWork
exports.login = login
exports.listAuthorizedWorkType = listAuthorizedWorkType
exports.getWorkHistory = getWorkHistory
exports.fetchAuditWorks = fetchAuditWorks
exports.downloadAuditWorkFile = downloadAuditWorkFile
exports.submitReview = submitReview
exports.cancelReview = cancelReview
exports.listAuthorizedReviewsType = listAuthorizedReviewsType
exports.formatCountDown = formatCountDown
exports.calculateWorkarea = calculateWorkarea
exports.renderInfoBox = renderInfoBox
exports.startTimer = startTimer
exports.renderRect = renderRect
