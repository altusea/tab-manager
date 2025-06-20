// 加载当前打开的标签页
function loadTabs() {
  chrome.tabs.query({}, (tabs) => {
    const tabsList = document.getElementById("tabs-list");
    tabsList.innerHTML = "";

    tabs.forEach((tab) => {
      const tabItem = document.createElement("div");
      tabItem.className = "tab-item";
      tabItem.textContent = tab.title;
      tabsList.appendChild(tabItem);
    });
  });
}

// 关闭重复标签页
document.getElementById("close-duplicates").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "closeDuplicates" }, (response) => {
    if (response && response.success) {
      loadTabs(); // 刷新标签页列表
    }
  });
});

// 按地址排序标签页
document.getElementById("reorder-tabs").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reorderTabs" }, (response) => {
    if (response && response.success) {
      loadTabs(); // 刷新标签页列表
    }
  });
});

// 滚动当前标签页到底部
document.getElementById("scroll-to-bottom").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          window.scrollTo(0, document.body.scrollHeight);
        },
      });
    }
  });
});

// 初始化加载标签页
loadTabs();
