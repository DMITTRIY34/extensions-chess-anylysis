chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "analyze") return;

  (async () => {
    await chrome.storage.local.set({ pendingPgn: msg.pgn });
    await chrome.tabs.create({ url: "https://arslanovchess.com/games-analysis" });
  })();
});