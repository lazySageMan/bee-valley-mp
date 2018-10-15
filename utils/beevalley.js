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
    success: callback
  });
}

function downloadWorkFile(token, workId, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/' + workId + '/file',
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    responseType: 'arraybuffer',
    success: callback
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
    success: callback
  });
}

function cancelWork(token, workIds, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/' + workIds.join(',') + '/cancel',
    method: 'DELETE',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: callback
  });
}

function login(code, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'login/weixin_mp/' + code,
    method: 'POST',
    success: callback
  });
}

function listAuthorizedWorkType(token, callback) {
  wx.request({
    url: TODVIEW_API_BASE_URL + 'works/authorized_types',
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: callback
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
    success: callback
  })
}

module.exports.fetchWorks = fetchWorks
exports.downloadWorkFile = downloadWorkFile
exports.submitWork = submitWork
exports.cancelWork = cancelWork
exports.login = login
exports.listAuthorizedWorkType = listAuthorizedWorkType
exports.getWorkHistory = getWorkHistory