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

function login(code, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'login/weixin_mp/' + code,
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

module.exports.fetchWorks = fetchWorks
exports.downloadWorkFile = downloadWorkFile
exports.submitWork = submitWork
exports.cancelWork = cancelWork
exports.login = login
exports.listAuthorizedWorkType = listAuthorizedWorkType
exports.getWorkHistory = getWorkHistory