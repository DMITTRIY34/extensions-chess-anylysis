// Отображение кнопки для анализа только после окончания партии (надо перезагрузить страницу :( ))
if (document.querySelector("main.round")) {
    hasButton = document.querySelector('button.fbt.new-opponent') !== null;
    if (hasButton){
        const btn = document.createElement("button");
        btn.textContent = "Анализировать партию";
        btn.style.cssText = `
        position: fixed; right: 16px; bottom: 16px; z-index: 9999;
        padding: 10px 14px; border: 0; border-radius: 6px;
        background: #b58863; color: #fff; font-size: 14px; cursor: pointer;
        `;
        btn.addEventListener("click", onClick);
        document.body.appendChild(btn);
    }
}

// Обработчик нажатия
async function onClick(e) {
  const btn = e.currentTarget;

  const match = location.pathname.match(
    /^\/(?:game\/)?([A-Za-z0-9]{8})(?:[A-Za-z0-9]{4})?(?:\/(?:white|black))?\/?$/
  );
  if (!match) {
    btn.textContent = "Это не страница партии";
    return;
  }
  const id = match[1];

  btn.textContent = "Загружаю PGN…";
  try {
    const res = await fetch(`https://lichess.org/game/export/${id}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const pgn = await res.text();

    await chrome.runtime.sendMessage({ type: "analyze", pgn });
    btn.textContent = "Анализ партии";
  } catch (err) {
    console.error(err);
    btn.textContent = "Ошибка, см. консоль";
  }
}