const injectScriptSolution = async (tabId, url) => {
  // console.log("iiiiiiiiiii");
  chrome.scripting
    .executeScript({
      target: {
        tabId,
        allFrames: true,
      },
      world: "MAIN",
      injectImmediately: true,
      // args: [tabId],
      files: ["injected.js"],
    })
    .then(() => console.log("script injected"));
};
// let injectObj = {};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log("aaaaaaa", tab, changeInfo);
  // if (typeof injectObj[tabId] && injectObj[tabId] == true) {
  //   return;
  // }
  if (!tab.url) return;
  if (changeInfo.status === "loading") {
    // injectObj[tabId] = true;
    injectScriptSolution(tabId, tab.url);
  }
});
