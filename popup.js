// 加载当前打开的标签页
function loadTabs() {
  chrome.tabs.query({}, (tabs) => {
    const tabsList = document.getElementById('tabs-list');
    tabsList.innerHTML = '';

    tabs.forEach(tab => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item';
      tabItem.textContent = tab.title;
      tabsList.appendChild(tabItem);
    });
  });
}

// 关闭重复标签页
document.getElementById('close-duplicates').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'closeDuplicates' }, (response) => {
    if (response && response.success) {
      loadTabs(); // 刷新标签页列表
    }
  });
});

// 按地址排序标签页
document.getElementById('sort-tabs').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'sortTabs' }, (response) => {
    if (response && response.success) {
      loadTabs(); // 刷新标签页列表
    }
  });
});

// 初始化加载标签页
loadTabs();
