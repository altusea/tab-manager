// 监听标签更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkAndCloseDuplicateTabs(tab);
  }
});

// 检查并关闭重复标签页
function checkAndCloseDuplicateTabs(newTab) {
  chrome.tabs.query({}, (tabs) => {
    const duplicateTabs = tabs.filter(
      (tab) => tab.url === newTab.url && tab.id !== newTab.id
    );

    if (duplicateTabs.length > 0) {
      duplicateTabs.forEach((tab) => {
        chrome.tabs.remove(tab.id);
      });
    }
  });
}

// 按地址排序标签页
function sortTabsByUrl() {
  chrome.tabs.query({}, (tabs) => {
    tabs.sort((a, b) => {
      const urlA = new URL(a.url);
      const urlB = new URL(b.url);
      return urlA.pathname.localeCompare(urlB.pathname);
    });
  });
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeDuplicates") {
    chrome.tabs.query({}, (tabs) => {
      const uniqueUrls = new Set();
      const duplicates = [];

      tabs.forEach((tab) => {
        if (uniqueUrls.has(tab.url)) {
          duplicates.push(tab.id);
        } else {
          uniqueUrls.add(tab.url);
        }
      });

      if (duplicates.length > 0) {
        chrome.tabs.remove(duplicates);
      }
      sendResponse({ success: true });
    });
    return true; // 保持消息通道打开以发送响应
  }

  if (request.action === "sortTabs") {
    sortTabsByUrl();
    sendResponse({ success: true });
    return true;
  }
});
