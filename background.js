// 监听标签更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkDuplicateTabs(tab);
  }
});

// 检查并关闭重复标签页
function checkDuplicateTabs(newTab) {
  chrome.tabs.query({}, (tabs) => {
    const duplicateTabs = tabs.filter(tab =>
      tab.url === newTab.url &&
      tab.id !== newTab.id
    );

    if (duplicateTabs.length > 0) {
      duplicateTabs.forEach(tab => {
        chrome.tabs.remove(tab.id);
      });
    }
  });
}

// 按域名分组标签页
function groupTabsByDomain() {
  chrome.tabs.query({}, (tabs) => {
    const groups = {};

    tabs.forEach(tab => {
      const url = new URL(tab.url);
      const domain = url.hostname;

      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(tab.id);
    });

    Object.entries(groups).forEach(([domain, tabIds]) => {
      if (tabIds.length > 1) {
        chrome.tabs.group({ tabIds }, (groupId) => {
          chrome.tabGroups.update(groupId, { title: domain });
        });
      }
    });
  });
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'closeDuplicates') {
    chrome.tabs.query({}, (tabs) => {
      const uniqueUrls = new Set();
      const duplicates = [];

      tabs.forEach(tab => {
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

  if (request.action === 'groupTabs') {
    groupTabsByDomain();
    sendResponse({ success: true });
    return true;
  }
});
