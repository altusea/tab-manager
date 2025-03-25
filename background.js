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

// 获取当前窗口的标签页并重新排序
function reorderTabs() {
  chrome.tabs.query({ currentWindow: true }, (es) => {
    if (es.length < 2) {
      return;
    }

    const sortedTabs = es.sort((a, b) => a.url.localeCompare(b.burl));
    console.log(sortedTabs);

    // 按排序后的顺序移动标签页
    sortedTabs.forEach((tab, index) => {
      chrome.tabs.move(tab.id, { index: index });
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

  if (request.action === "reorderTabs") {
    reorderTabs();
    sendResponse({ success: true });
    return true;
  }
});
