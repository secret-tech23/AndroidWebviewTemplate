# ⚡ ImpulseBin

**Заблокуй імпульсивні покупки. Збережи гроші.**

Мобільний додаток-«холодний душ» для шопоголіків.  
Коли хочеш щось купити — заблокуй це на N годин.  
Якщо бажання пройшло — гроші залишились у тебе.

---

## 🏗️ Технічний стек

| Шар          | Технологія                              |
|--------------|-----------------------------------------|
| Frontend     | Vanilla HTML5 / CSS3 / ES6+             |
| Сховище      | `localStorage`                          |
| Мобільна збірка | Capacitor 7                          |
| Плагіни      | `@capacitor/haptics`, `@capacitor/status-bar` |

---

## 🚀 Запуск у браузері

Просто відкрий `index.html` у будь-якому браузері.  
Дані зберігаються у `localStorage`.

---

## 📱 Збірка під Android

### Крок 1 — Встановлення залежностей

```bash
npm install
```

### Крок 2 — Ініціалізація Capacitor (лише один раз)

```bash
npx cap init "ImpulseBin" "com.yourcompany.impulsebin" --web-dir .
```

> ⚠️ Якщо `capacitor.config.json` вже є — цей крок пропускаємо.

### Крок 3 — Додати платформу Android

```bash
npx cap add android
```

### Крок 4 — Синхронізувати код з нативним проєктом

```bash
npx cap sync android
```

Цю команду повторюємо **кожного разу після змін** у HTML/CSS/JS.

### Крок 5 — Відкрити у Android Studio

```bash
npx cap open android
```

Натисни **Run ▶** у Android Studio для запуску на емуляторі або пристрої.

---

## 🔧 Конфігурація

### `capacitor.config.json`

```json
{
  "appId": "com.yourcompany.impulsebin",
  "appName": "ImpulseBin",
  "webDir": ".",
  "plugins": {
    "StatusBar": { "style": "DARK", "backgroundColor": "#0A0A0A" }
  }
}
```

> Заміни `com.yourcompany.impulsebin` на свій реальний bundle ID.

---

## 💰 Монетизація (Pro-версія)

У `app.js` є глобальна константа:

```js
const IS_PRO = false; // ← змінити на true після покупки
```

**Free tier обмеження:**
- Максимум **3 активних** імпульси
- **Заблокований** експорт даних (`exportData()`)

**Pro дає:**
- Необмежену кількість імпульсів
- Експорт у JSON
- (заглушка для платіжного провайдера у `btn-pro-buy` click handler)

---

## 🗂️ Структура проєкту

```
impulsebin/
├── index.html          # Розмітка (один файл, всі екрани)
├── styles.css          # Dark Minimalist дизайн + токени
├── app.js              # Вся логіка (таймери, localStorage, i18n)
├── capacitor.config.json
├── package.json
└── README.md
```

---

## 🌍 Локалізація (i18n)

Всі рядки — в об'єкті `i18n` всередині `app.js`.
Підтримуються 6 мов: 🇺🇦 `uk` (за замовчуванням), 🇬🇧 `en`, 🇵🇱 `pl`, 🇩🇪 `de`, 🇫🇷 `fr`, 🇪🇸 `es`.

У шапці застосунку є випадаючий список (`<select id="lang-select">`), яким користувач сам перемикає мову. Вибір мови зберігається в `localStorage` (ключ `impulsebin_lang`) і відновлюється при наступному запуску.

Щоб додати ще одну мову:

```js
const translations = {
  uk: { ... },
  en: { ... },
  pl: { ... },
  de: { ... },
  fr: { ... },
  es: { ... },
  it: { ... }  // ← додай сюди + <option value="it">🇮🇹 IT</option> в index.html
};
```

Переключення програмно: `i18n.set('en')`, після чого виклич `applyStaticTranslations()` та перерендери список, щоб оновити вже відображені елементи.

---

## 📦 Data Structure

```ts
interface Impulse {
  id:         string;               // uid, 10 chars
  text:       string;               // опис покупки
  amount:     number;               // сума в гривнях
  createdAt:  number;               // Date.now() при створенні
  targetTime: number;               // Date.now() + затримка (ms)
  status:     'locked'              // таймер тікає
             | 'unlocked'          // час минув, чекає рішення
             | 'completed'         // куплено (гроші "збережено")
             | 'canceled';         // відмовився від покупки
}
```

---

## ✅ Checklist перед релізом

- [ ] Замінити `const IS_PRO = false` на логіку з платіжним провайдером
- [ ] Встановити реальний `appId` у `capacitor.config.json`
- [ ] Додати іконку застосунку (`android/app/src/main/res/`)
- [ ] Додати splash screen
- [ ] Підписати APK для Google Play

---

**Зроблено з ⚡ та чистим JS.**
