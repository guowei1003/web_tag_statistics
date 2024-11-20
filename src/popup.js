'use strict';

// import './popup.css';

const optionDist = {
  tooltip: {
    show: false,
    trigger: 'item'
  },
  legend: {
    show: false,
    type: 'scroll',
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20,
  },
  series: [
    {
      name: 'Tag Dist',
      type: 'pie',
      radius: ['60%', '100%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false,
      },
      data: []
    }
  ]
};
const hisMap = {
  'Iframe Tags': 'totalIframeTags',
  'Meta Tags': 'totalMetaTags',
  'JS Tags': 'totalScriptTags',
  'CSS Tags': 'totalCssTags',
}
const optionHis = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    show: true,
    // orient: 'vertical',
    // right: 10,
    // top: '20%'
  },
  grid: {
    left: '10%',
    right: '5%',
    top: '20%',
    bottom: '25%',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLabel: {
      inside: false,
      rotate: 70,
      interval: 0,
      // margin: 30,
      // align: 'center',
      // color: '#fff',
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    z: 10,
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Iframe Tags',
      data: [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#4e88ca'
          },
          {
            offset: 1,
            color: 'rgb(255,255,255,1)'
          }
        ]),
      },
      // markPoint: {
      //   data: [{ type: 'max', name: 'Max' }]
      // }
    },
    {
      name: 'Meta Tags',
      data: [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#ebebeb'
          },
          {
            offset: 1,
            color: 'rgb(255,255,255,1)'
          }
        ]),
      },
      // markPoint: {
      //   data: [{ type: 'max', name: 'Max' }]
      // }
    },
    {
      name: 'JS Tags',
      data: [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#b7e9ff'
          },
          {
            offset: 1,
            color: 'rgb(255,255,255,1)'
          }
        ]),
      },
      // markPoint: {
      //   data: [{ type: 'max', name: 'Max' }]
      // }
    },
    {
      name: 'CSS Tags',
      data: [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#FFD700'
          },
          {
            offset: 1,
            color: 'rgb(255,255,255,1)'
          }
        ]),
      },
      // markPoint: {
      //   data: [{ type: 'max', name: 'Max' }]
      // }
    }
  ]
};


const storageTemplate = {
  tabId: 0,
  url: '',
  updated_at: 0,
  value: [],
};

const formatDate = (oldDate, format = 'yyyy-MM-dd HH:mm:ss') => {
  if (!oldDate) {
    return '';
  }
  let d = Number(oldDate);
  if (!isNaN(d) && String(d).length < 13) {
    d = d * 1000;
  } else {
    d = oldDate;
  }
  const date = new Date(d);

  function formatNum(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  const config = {
    yyyy: date.getFullYear(),
    M: date.getMonth() + 1,
    MM: formatNum(date.getMonth() + 1),
    W: date.getDay(),
    WW: formatNum(date.getDay()),
    d: date.getDate(),
    dd: formatNum(date.getDate()),
    H: date.getHours(),
    HH: formatNum(date.getHours()),
    h: date.getHours() > 12 ? date.getHours() - 12 : date.getHours(),
    hh:
      parseInt(formatNum(date.getHours())) > 12
        ? parseInt(formatNum(date.getHours())) - 12
        : formatNum(date.getHours()),
    m: date.getMinutes(),
    mm: formatNum(date.getMinutes()),
    s: date.getSeconds(),
    ss: formatNum(date.getSeconds()),
    A: date.getHours() < 12 ? 'AM' : 'PM',
    a: date.getHours() < 12 ? 'am' : 'pm',
  };
  const formatConfigs = format.match(/[a-zA-Z]+/g) || [];
  formatConfigs.forEach(item => {
    format = format.replace(item, config[item]);
  });
  return format;
};

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
// 定义一个内容存储对象，提供获取和设置内容的方法
const counterStorage = {
  // 获取指定标签页的内容值
  // url: 要获取内容值的Url
  // cb: 获取内容值后的回调函数，接收内容值作为参数
  get: (cb) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const lId = btoa(tabs[0].url.split('?')[0]);
      // console.log('get storage:', lId)
      chrome.storage.local.get([lId], result => {
        // 回调函数中返回内容值
        console.log('get storage data:', result)
        cb(result[lId]);
      });
    });

  },
  // 设置指定标签页的内容值
  // value: 要设置的内容值
  // url: 要设置内容值的标签页URL
  // cb: 设置内容值后的回调函数
  set: async (value) => {
    let lData;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const lId = btoa(tabs[0].url.split('?')[0]);
    const result = await chrome.storage.local.get([lId]);
    if (typeof result[lId] === 'undefined') {
      lData = {
        url: tabs[0].url.split('?')[0],
        updated_at: Date.now(),
        value: [
          {
            updated_at: Date.now(),
            tabId: tabs[0].id,
            value: value,
          }
        ],
      };
    } else {
      lData = result[lId];
      if (Date.now() - lData.updated_at < 1000) {
        return;
      }
      lData.updated_at = Date.now();
      lData.value.push({
        updated_at: Date.now(),
        tabId: tabs[0].id,
        value: value,
      });
      if (lData.value.length > 10) {
        lData.value.shift();
      }
    }
    chrome.storage.local.set({ [lId]: lData });
  },
  clear: async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const lId = btoa(tabs[0].url.split('?')[0]);
    const res = await chrome.storage.local.remove(lId);
    return res;
  },
};

const sendPopupMessageToContent = async (t, p, cb) => {
  const tabId = await getCurrentTabId();
  const message = {
    type: t,
    payload: p,
  };
  chrome.tabs.sendMessage(tabId, message, {}, cb);
}

const sendPopupMessageToBackground = (t, p, cb) => {
  const message = {
    type: t,
    payload: p,
  };
  chrome.runtime.sendMessage(message, {}, cb);
}

function renderHtmlToPage(p) {
  console.log('popup renderHtmlToPage', p)
  const tagIframeCount = $('#tagIframeCount');
  const tagCount = $('#tagCount');
  const tagMax = $('#tagMax');
  const tagMetaCount = $('#tagMetaCount');
  const refJsCount = $('#refJsCount');
  const refCssCount = $('#refCssCount');
  const tagsList = $('#tagList');
  const refreshTime = $('#refreshTime');

  tagCount.text(p.totalTags);
  tagMax.text((p.tagList[0] || { key: '未知' }).key);
  tagIframeCount.text(p.totalIframeTags);
  tagMetaCount.text(p.totalMetaTags);
  refJsCount.text(p.totalScriptTags);
  refCssCount.text(p.totalCssTags);
  const tags = p.tagList;
  tagsList.text('');
  let itemStr = '';
  tags.forEach((tag, index) => {
    itemStr += `<div class="flex items-center justify-between style-list-item">
    <div class="text-xs truncate">
      ${tag.key.toLowerCase()}
    </div>
    <div class="flex items-center text-xs font-bold">
      ${tag.value}
    </div>
  </div>`;
  });
  tagsList.html(itemStr);

  const tagDist = document.getElementById('tagDist');
  tagDist.removeAttribute('_echarts_instance_')
  const myChart = echarts.init(tagDist);
  optionDist.series[0].data = tags.map(i => ({ name: i.key, value: i.value }));
  myChart.setOption(optionDist);
  refreshTime.text(new Date().toLocaleString());
}

function setLoading() {
  const tagIframeCount = $('#tagIframeCount');
  const tagCount = $('#tagCount');
  const tagMax = $('#tagMax');
  const tagMetaCount = $('#tagMetaCount');
  const refJsCount = $('#refJsCount');
  const refCssCount = $('#refCssCount');
  const tagsList = $('#tagList');
  const tagsDist = $('#tagDist');
  // const refreshTime = document.getElementById('refreshTime');
  tagIframeCount.text('Loading...');
  tagCount.text('Loading...');
  tagMax.text('Loading...');
  tagMetaCount.text('Loading...');
  refJsCount.text('Loading...');
  refCssCount.text('Loading...');
  // refreshTime.innerText = 'Loading...';
  tagsList.html(`<div class="style-content-empty flex items-center justify-center">
  <span class="text-xs text-gray-500">Loading...</span>
  </div>`);
  tagsDist.html(`<div class="style-content-empty flex items-center justify-center">
  <span class="text-xs text-gray-500">Loading...</span>
  </div>`);
}
/**
 * 设置错误信息显示
 * 该函数遍历页面上的特定ID元素，并将它们的文本内容设置为"Error"，同时设置刷新时间和两个特定列表的内容为空白的"无数据"提示。
 * 该函数不接受参数并且没有返回值。
 */
function setError() {
  // 获取需要设置错误信息的DOM元素

  const tagIframeCount = $('#tagIframeCount');
  const tagCount = $('#tagCount');
  const tagMax = $('#tagMax');
  const tagMetaCount = $('#tagMetaCount');
  const refJsCount = $('#refJsCount');
  const refCssCount = $('#refCssCount');
  const tagsList = $('#tagList');
  const refreshTime = $('#refreshTime');
  const tagsDist = $('#tagDist');
  // const refreshTime = document.getElementById('refreshTime');
  // const tagsDist = document.getElementById('tagDist');

  // 设置错误信息
  tagIframeCount.text('Error');
  tagCount.text('Error');
  tagMax.text('Error');
  tagMetaCount.text('Error');
  refJsCount.text('Error');
  refCssCount.text('Error');

  // 设置刷新提示信息
  refreshTime.text('Please Reload Page').css('font-weight', 'bold');

  // 清空标签列表和分布列表的内容，并添加"无数据"提示
  tagsList.html(`<div class="style-content-empty flex items-center justify-center">
  <span class="text-xs text-gray-500">No Data</span>
  </div>`);
  tagsDist.html(`<div class="style-content-empty flex items-center justify-center">
  <span class="text-xs text-gray-500">No Data</span>
  </div>`);
}

/**
 * 刷新历史函数
 * 无参数
 * 无返回值
 */
function refreshHistory() {
  // 向后台发送消息计算，并从弹出窗口接收响应
  counterStorage.get((res) => {
    if (res) {
      const tmp = { ...optionHis };
      tmp.xAxis.data = res.value.map(i => formatDate(i.updated_at, 'MM/dd HH:mm'));
      res.value.forEach((v, i) => {
        tmp.series.map(j => {
          j.data.push(v.value[hisMap[j.name]] || 0);
        })
      })
      const historyChart = document.getElementById('history-chart');
      historyChart.removeAttribute('_echarts_instance_')
      const myChart = echarts.init(historyChart);
      myChart.setOption(tmp);
    } else {
      // 如果没有响应，则记录错误信息
      console.log('no history')
    }
  });
}

function renderOverviewToPage() {
  counterStorage.get((p) => {
    const loadTime = $('#load-time');
    const iconPage = $('#icon-page');
    const pageUrl = $('#page-url');
    const pageTitle = $('#page-title');
    console.log(p);
    pageTitle.text(p.title || 'page is loading ...');
    pageTitle.attr('title', p.title);
    pageUrl.text(p.url || 'page is loading ...');
    pageUrl.attr('title', p.url);
    iconPage.attr('src', p.icon_url);
    if (p.load_end_time) {
      loadTime.text(`${(p.load_end_time - p.load_start_time) / 1000} s`);
    } else {
      loadTime.text('page is loading ...');
    }
  })
}

function renderAdListToPage(v) {
  const adOverview = $('#ad-overview');
  if (v && v.length > 0) {
    adOverview.text(`Found ${v.length} Ad Element${v.length === 1 ? '' : 's'}`)
    const adList = $('#ad-list');
    const adTable = $('#ad-table');
    adList.html('');
    v.forEach((ad, index) => {
      adList.append(`
      <tr>
        <td>${ad.tag}</td>
        <td>${ad.type}</td>
        <td title='xpath: ${ad.xpath}'>
          <div style="word-break: break-all;">
            ${ad.value}
          </div>
        </td>
      </tr>
      `);
    })
    adTable.show();
  } else {
    adOverview.text('No Ad Element Found ^_^')
  }
}
/**
 * 刷新标签函数
 * 无参数
 * 无返回值
 */
function refreshTags() {
  // 向后台发送消息计算，并从弹出窗口接收响应
  sendPopupMessageToBackground('calc', 'message from popup', response => {
    if (response) {
      // 如果有响应，则将HTML渲染到页面
      renderHtmlToPage(response)
      counterStorage.set(response).then(() => {
        renderOverviewToPage();
      }).catch(err => {
        console.log('set data error', err)
      })
    } else {
      // 如果没有响应，则记录错误信息
      console.log('response is null')
      setError();
    }
  })
}

function getCheckAds() {
  // 向后台发送消息计算，并从弹出窗口接收响应
  sendPopupMessageToBackground('checkAd', 'message from popup', response => {
    if (response) {
      // 如果有响应，则将HTML渲染到页面
      renderAdListToPage(response)
    } else {
      // 如果没有响应，则记录错误信息
      console.log('ads is null')
    }
  })
}

$(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  console.log('popup starting1')
  // const bg = chrome.runtime.getBackgroundPage();
  // console.log(chrome.runtime)
  // console.log(chrome.storage)

  $('#refresh').on('click', () => {
    setLoading();
    refreshTags();
  })
  $('#go-history').on('click', () => {
    $('#index').hide();
    $('#history').show();
    refreshHistory();
  })
  $('#go-index').on('click', () => {
    $('#history').hide();
    $('#index').show();
  })
  $('#ad-refresh').on('click', () => {
    getCheckAds();
  })

  // 初始化时渲染一次
  refreshTags();
  setTimeout(() => {
    getCheckAds();
  }, 3000)
});
