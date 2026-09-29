chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_SIDE_PANEL" && sender.tab?.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
  }
  return true;
});