// Классы кнопок выбора цвета при анализе
const COLOR_SELECTORS = {
  white: ".side.side--w",
  black: ".side.side--b",
};

// Функция для ожидания
function waitFor(fn, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const result = fn();
      if (result) {
        clearInterval(timer);
        resolve(result);
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error("Не дождались элемента"));
      }
    }, 200);
  });
}

const isVisible = (el) => el.offsetParent !== null;

// Поиск по тексту
function findByText(selector, text) {
  return [...document.querySelectorAll(selector)]
    .filter(isVisible)
    .find((el) => el.textContent.trim() === text);
}

// Определение цвета, за который мы играли
function detectColor(pgn, nick) {
  if (!nick) return null;
  const white = pgn.match(/\[White "([^"]*)"\]/)?.[1] ?? "";
  const black = pgn.match(/\[Black "([^"]*)"\]/)?.[1] ?? "";
  const n = nick.trim().toLowerCase();
  if (white.toLowerCase() === n) return "white";
  if (black.toLowerCase() === n) return "black";
  return null; // ник не найден, ничего не выбираем
}

// Выбор цвета по нику
async function chooseColor(color) {
  const selector = COLOR_SELECTORS[color];
  try {
    const el = await waitFor(() => {
      const found = document.querySelector(selector);
      return found && isVisible(found) ? found : null;
    }, 3000);
    el.click();
  } catch {
    console.log(`Кнопка цвета ${color} не появилась, пропускаю`);
  }
}

// Вставка значения так, чтобы Vue заметил изменение
function setNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

async function run(pgn) {
  // Открываем вкладку PGN
  const tab = await waitFor(() =>
    findByText("button, [role='tab'], a, li, span", "PGN")
  );
  tab.click();

  // Ждём поле ввода и вставляем PGN
  const field = await waitFor(() => {
    const el = document.querySelector("textarea");
    return el && isVisible(el) ? el : null;
  });
  setNativeValue(field, pgn);

  // Нажимаем «Запустить анализ»
  const btn = await waitFor(() => findByText("button", "Запустить анализ"));
  btn.click();
}

chrome.storage.local.get(["pendingPgn", "nick"], async ({ pendingPgn, nick }) => {
  if (!pendingPgn) return;
  chrome.storage.local.remove("pendingPgn");

  const color = detectColor(pendingPgn, nick);
  try {
    await run(pendingPgn);
    if (color) await chooseColor(color);
  } catch (err) {
    console.error(err);
  }
});
