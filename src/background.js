'use strict';

/**
 * 获取当前活动标签页的ID。
 * 该函数没有参数。
 * @returns {Promise} 返回一个Promise对象，成功时携带当前活动标签页的ID，如果无法获取则为null。
 */
function getCurrentTabId() {
  return new Promise((resolve, reject) => {
    // 使用chrome.tabs.query方法查询当前窗口中活动的标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // 如果查询结果存在，则解析Promise为标签页ID，否则为null
      resolve(tabs.length ? tabs[0].id : null)
    });
  })
}


function getUntActiveTabId() {
  return new Promise((resolve, reject) => {
    // 使用chrome.tabs.query方法查询当前窗口中活动的标签页
    chrome.tabs.query({ active: false, currentWindow: true }, function (tabs) {
      // 如果查询结果存在，则解析Promise为标签页ID，否则为null
      resolve(tabs.length ? tabs : null)
    });
  })
}

async function clearHistory() {
  const tabs = await getUntActiveTabId();
  if (tabs) {
    tabs.forEach(tab => {
      const lId = btoa(tab.url.split('?')[0]);
      chrome.storage.local.get([lId], result => {
        if (result[lId] && result[lId].updated_at < Date.now() - 1000 * 60 * 60 * 24 * 10) {
          chrome.storage.local.remove(lId);
        }
      });
    })
  } else {
    console.log('no tabs')
  }
}

const sendBgMessageToContent = async (t, p, cb) => {
  const tabId = await getCurrentTabId();
  const message = {
    type: t,
    payload: p,
  };
  try {
    chrome.tabs.sendMessage(tabId, message, {}, cb);
  } catch (e) {
    console.warn(e)
    cb(null)
  }
}

async function savePageLoadTime(v, t) {
  let lData;
  const lId = btoa(v.url.split('?')[0]);
  const result = await chrome.storage.local.get([lId]);
  if (typeof result[lId] === 'undefined') {
    lData = {
      url: v.url.split('?')[0],
      [t]: v.time,
      updated_at: Date.now(),
      value: [],
    };
  } else {
    lData = result[lId];
    lData[t] = v.time;
    lData.updated_at = Date.now();
    if (t === 'load_start_time') {
      delete lData.load_end_time;
    }
  }
  if (t === 'load_end_time') {
    lData.title = v.title;
    lData.icon_url = v.icon;
  }
  chrome.storage.local.set({ [lId]: lData });
}

/**
 * 处理接收到的消息。
 * @param {Object} request - 包含消息类型和负载的数据对象。
 * @param {Object} sender - 发送消息的源对象。
 * @param {Function} sendResponse - 用于回应消息的函数。
 * @returns {boolean} 总是返回true，表示消息已处理。
 */
const receivedMessageBg = (request, sender, sendResponse) => {
  // 当请求类型为'calc'时， 访问content脚本获取数据
  if (request.type === 'pageLoadTime') {
    savePageLoadTime(request.value, 'load_start_time');
  } else {
    sendBgMessageToContent(request.type, '', sendResponse)
  }
  // 清理历史数据
  clearHistory();
  return true;
}



/**
 * 初始化监听器。
 */
const initListeners = () => {
  console.log('bg run listener')
  // Listen for message
  chrome.runtime.onMessage.addListener(receivedMessageBg);
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      console.log(tab);
      savePageLoadTime({ time: Date.now(), url: tab.url, title: tab.title, icon: tab.favIconUrl }, 'load_end_time');
    }
  });
}

initListeners();