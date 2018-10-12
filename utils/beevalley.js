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

module.exports.fetchWorks = fetchWorks
exports.downloadWorkFile = downloadWorkFile