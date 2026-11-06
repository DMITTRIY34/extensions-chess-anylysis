const input = document.getElementById("nick");

chrome.storage.local.get("nick", ({ nick }) => {
  if (nick) input.value = nick;
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({ nick: input.value.trim() });
  document.getElementById("ok").style.display = "inline";
});