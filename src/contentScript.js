'use strict';

function getElementXPath(element) {
  const paths = [];
  let current = element;
  while (current && current !== document.body) {
    let tag = current.tagName ? current.tagName.toLowerCase() : '';
    let index = 0;
    let sibling = current.previousSibling;
    while (sibling) {
      if (sibling.nodeType === 1 && sibling.tagName && sibling.tagName.toLowerCase() === tag) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    let pathIndex = index ? `[${index + 1}]` : '';
    paths.unshift(`${tag}${pathIndex}`);
    current = current.parentNode;
  }
  return `/${paths.join('/')}`;
}

const calcTags = () => {
  const tags = document.getElementsByTagName('*');
  const iframeTags = document.getElementsByTagName('iframe');
  const metaTags = document.getElementsByTagName('meta');
  const scriptTags = document.getElementsByTagName('script');
  const cssTags = document.getElementsByTagName('style');
  const payload = {
    totalTags: tags.length,
    totalIframeTags: iframeTags.length,
    totalMetaTags: metaTags.length,
    totalScriptTags: scriptTags.length,
    totalCssTags: cssTags.length,
  };
  const tagMap = {};
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const tagName = tag.tagName;
    if (tagMap[tagName]) {
      tagMap[tagName] += 1;
    } else {
      tagMap[tagName] = 1;
    }
    if (tagName === 'link') {
      const href = tag.getAttribute('href');
      if (href) {
        if (href.split('?')[0].endsWith('.css')) {
          payload.totalCssTags += 1;
        } else if (href.split('?')[0].endsWith('.js')) {
          payload.totalScriptTags += 1;
        }
      }
    }
  }
  const tagArray = Object.entries(tagMap).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  payload.tagList = tagArray;
  return payload;
}

function checkAd() {
  const ads = [];
  const tags = document.getElementsByTagName('*');
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const tagName = tag.tagName.toLowerCase();
    if (tagName === 'iframe' || tagName === 'img') {
      const src = tag.getAttribute('src');
      if (src && src.startsWith('http') && src.split('/')[2].includes('ad')) {
        ads.push({
          tag: tagName,
          type: 'src',
          xpath: getElementXPath(tag),
          value: src.split('/')[2],
        })
      }
    } else if (tagName === 'span' ||tagName === 'div') {
      const text = tag.textContent;
      if (text === '广告' || text.toLowerCase() === 'ad' || text.toLowerCase() === 'ads') {
        ads.push({
          tag: tagName,
          type: 'text',
          xpath: getElementXPath(tag),
          value: text,
        })
      }
    }
  }
  return ads;
}

const sendMessage = (t, p, cb) => {
  const message = {
    type: t,
    payload: p,
  };
  chrome.runtime.sendMessage(message, response => {
    cb(response);
  });
}

const receivedMessageCs = (request, sender, sendResponse) => {
  if (request.type === 'calc') {
    sendResponse(calcTags());
  } else if (request.type === 'checkAd') {
    sendResponse(checkAd());
  }
  return true;
}

const initListeners = () => {
  // Listen for message
  chrome.runtime.onMessage.addListener(receivedMessageCs);
}
(function() {
  initListeners();
  chrome.runtime.sendMessage({ type: 'pageLoadTime', value: {time: performance.timeOrigin, url: window.location.href} });
})();