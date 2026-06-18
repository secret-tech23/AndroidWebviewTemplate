/**
 * ImpulseBin — app.js
 * Vanilla ES6+ · No frameworks · Capacitor-ready
 * ─────────────────────────────────────────────
 *
 * CAPACITOR QUICK-START:
 *   npm install @capacitor/core @capacitor/cli
 *   npm install @capacitor/haptics @capacitor/status-bar @capacitor/android
 *   npx cap init "ImpulseBin" "com.yourcompany.impulsebin"
 *   # Set "webDir": "." in capacitor.config.json
 *   npx cap add android
 *   npx cap sync android
 *   npx cap open android
 *
 * PULL-TO-REFRESH DISABLED VIA:
 *   1. CSS  — html,body { overscroll-behavior: none }
 *   2. JS   — touchmove preventDefault when scrollTop === 0
 *   3. JSON — capacitor.config.json android.overScrollMode "never"
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. GLOBAL CONSTANTS & MONETISATION FLAG
   ═══════════════════════════════════════════════════════════ */

/** Toggle to true when the user has purchased Pro. */
const IS_PRO = false;

/** Maximum active impulses allowed in the free tier. */
const FREE_TIER_LIMIT = 3;

/** localStorage key for the impulse array. */
const STORAGE_KEY = 'impulsebin_impulses';

/** localStorage key for the selected UI language. */
const LANG_STORAGE_KEY = 'impulsebin_lang';

/** localStorage key for strict-mode toggle. */
const STRICT_STORAGE_KEY = 'impulsebin_strict';

/**
 * Maps i18n language codes to BCP-47 locales for Intl number formatting.
 * @type {Record<string,string>}
 */
const LOCALE_MAP = {
  uk: 'uk-UA',
  en: 'en-US',
  pl: 'pl-PL',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  zh: 'zh-CN',
};

/**
 * Currency symbol per language.
 * @type {Record<string,string>}
 */
const CURRENCY_MAP = {
  uk: '₴',
  en: '$',
  pl: 'zł',
  de: '€',
  fr: '€',
  es: '€',
  zh: '¥',
};

/** Timer tick interval in milliseconds. */
const TICK_INTERVAL = 1000;

/* ═══════════════════════════════════════════════════════════
   2. LOCALISATION (i18n)
   ═══════════════════════════════════════════════════════════ */

const i18n = (() => {
  /* ── Translation dictionary ─────────────────────────────── */
  const translations = {

    /* ── Ukrainian ──────────────────────────────────────── */
    uk: {
      heroLabel:       'Не витрачено',
      heroSub:         'за весь час',
      statActive:      'активних',
      statDone:        'виконано',
      statCanceled:    'відмін',
      listTitle:       'Мої імпульси',
      emptyText:       'Ще немає імпульсів. Додай перший!',
      archiveTitle:    '📦 Архів',
      archiveEmpty:    'Архів порожній.',
      modalTitle:      'Новий імпульс',
      modalHint:       'Опиши, що хочеш купити, і встанови паузу.',
      labelText:       'Що ти хочеш купити?',
      labelAmount:     'Сума (₴)',
      labelDelay:      'Затримка перед покупкою',
      placeholderText: 'Нові навушники, гра...',
      btnCancel:       'Скасувати',
      btnSave:         'Заблокувати 🔒',
      btnComplete:     '✓ Виконано',
      btnSkip:         '✗ Відмовитись',
      statusLocked:    '🔒 Заблоковано',
      statusUnlocked:  '⚡ Розблоковано',
      statusCompleted: '✅ Виконано',
      statusCanceled:  '❌ Скасовано',
      timerReady:      '⚡ Можна вирішувати!',
      timerPrefix:     '⏳ Залишилось: ',
      timeSuffixD:     'д',
      timeSuffixH:     'г',
      timeSuffixM:     'хв',
      timeSuffixS:     'с',
      toastCreated:    '🔒 Імпульс заблоковано!',
      toastCompleted:  '💰 Молодець! Гроші збережено!',
      toastCanceled:   '🗑️ Відмовився — це вже перемога.',
      toastExported:   '📦 Дані експортовано!',
      toastProOnly:    '⭐ Тільки для Pro-версії',
      toastLimitHit:   `🔒 Ліміт ${FREE_TIER_LIMIT} імпульсів (Free). Оновіть до Pro.`,
      toastFillAll:    '⚠️ Заповни назву та суму',
      toastStrictOn:   '🛡️ Суворий режим увімкнено',
      toastStrictOff:  '✓ Суворий режим вимкнено',
      toastPaymentSoon:'💳 Оплата зовсім скоро!',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Безлімітні імпульси та експорт даних.',
      proFeatures:     ['✅ Необмежена кількість імпульсів','✅ Експорт даних у JSON','✅ Розширена статистика','✅ Без реклами назавжди'],
      proBuy:          'Оновити до Pro',
      proClose:        'Залишитись у Free',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Назад',
      ariaAdd:         'Додати імпульс',
      titleExport:     'Експорт даних',
      ariaExport:      'Експорт',
      titleArchive:    'Архів імпульсів',
      ariaArchive:     'Архів',
      ariaBack:        'Назад',
      delay1h:         '1 год',
      delay6h:         '6 год',
      delay24h:        '24 год',
      delay3d:         '3 дні',
      delay7d:         '7 днів',
      delay30d:        '30 днів',
      langSelectorLabel:'Мова',
      strictMode:      'Суворий режим',
      strictNotice:    '🛡️ Суворий режим: відмова недоступна',
    },

    /* ── English ─────────────────────────────────────────── */
    en: {
      heroLabel:       'Saved',
      heroSub:         'all time',
      statActive:      'active',
      statDone:        'done',
      statCanceled:    'skipped',
      listTitle:       'My Impulses',
      emptyText:       'No impulses yet. Add your first!',
      archiveTitle:    '📦 Archive',
      archiveEmpty:    'Archive is empty.',
      modalTitle:      'New Impulse',
      modalHint:       'Describe what you want to buy and set a pause.',
      labelText:       'What do you want to buy?',
      labelAmount:     'Amount ($)',
      labelDelay:      'Delay before purchase',
      placeholderText: 'New headphones, a game...',
      btnCancel:       'Cancel',
      btnSave:         'Lock 🔒',
      btnComplete:     '✓ Done',
      btnSkip:         '✗ Skip',
      statusLocked:    '🔒 Locked',
      statusUnlocked:  '⚡ Unlocked',
      statusCompleted: '✅ Done',
      statusCanceled:  '❌ Skipped',
      timerReady:      '⚡ Ready to decide!',
      timerPrefix:     '⏳ Remaining: ',
      timeSuffixD:     'd',
      timeSuffixH:     'h',
      timeSuffixM:     'm',
      timeSuffixS:     's',
      toastCreated:    '🔒 Impulse locked!',
      toastCompleted:  '💰 Great! Money saved!',
      toastCanceled:   '🗑️ Skipped — still a win.',
      toastExported:   '📦 Data exported!',
      toastProOnly:    '⭐ Pro feature only',
      toastLimitHit:   `🔒 Limit of ${FREE_TIER_LIMIT} impulses (Free). Upgrade to Pro.`,
      toastFillAll:    '⚠️ Fill in the name and amount',
      toastStrictOn:   '🛡️ Strict mode on',
      toastStrictOff:  '✓ Strict mode off',
      toastPaymentSoon:'💳 Payment coming soon!',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Unlimited impulses and data export.',
      proFeatures:     ['✅ Unlimited impulses','✅ Export data as JSON','✅ Advanced statistics','✅ No ads forever'],
      proBuy:          'Upgrade to Pro',
      proClose:        'Stay on Free',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Back',
      ariaAdd:         'Add impulse',
      titleExport:     'Export data',
      ariaExport:      'Export',
      titleArchive:    'Impulse archive',
      ariaArchive:     'Archive',
      ariaBack:        'Back',
      delay1h:         '1 hr',
      delay6h:         '6 hr',
      delay24h:        '24 hr',
      delay3d:         '3 days',
      delay7d:         '7 days',
      delay30d:        '30 days',
      langSelectorLabel:'Language',
      strictMode:      'Strict Mode',
      strictNotice:    '🛡️ Strict mode: skip is disabled',
    },

    /* ── Polish ──────────────────────────────────────────── */
    pl: {
      heroLabel:       'Zaoszczędzono',
      heroSub:         'łącznie',
      statActive:      'aktywne',
      statDone:        'zrealizowane',
      statCanceled:    'odrzucone',
      listTitle:       'Moje impulsy',
      emptyText:       'Brak impulsów. Dodaj pierwszy!',
      archiveTitle:    '📦 Archiwum',
      archiveEmpty:    'Archiwum jest puste. Tak trzymaj!',
      modalTitle:      'Nowy impuls',
      modalHint:       'Opisz, co chcesz kupić, i ustaw pauzę.',
      labelText:       'Co chcesz kupić?',
      labelAmount:     'Kwota (zł)',
      labelDelay:      'Opóźnienie przed zakupem',
      placeholderText: 'Nowe słuchawki, gra...',
      btnCancel:       'Anuluj',
      btnSave:         'Zablokuj 🔒',
      btnComplete:     '✓ Kupione',
      btnSkip:         '✗ Odrzuć',
      statusLocked:    '🔒 Zablokowane',
      statusUnlocked:  '⚡ Odblokowane',
      statusCompleted: '✅ Kupione',
      statusCanceled:  '❌ Odrzucone',
      timerReady:      '⚡ Czas na decyzję!',
      timerPrefix:     '⏳ Pozostało: ',
      timeSuffixD:     'd',
      timeSuffixH:     'g',
      timeSuffixM:     'min',
      timeSuffixS:     's',
      toastCreated:    '🔒 Impuls zablokowany!',
      toastCompleted:  '💰 Brawo! Pieniądze zaoszczędzone!',
      toastCanceled:   '🗑️ Odrzucono — to też zwycięstwo.',
      toastExported:   '📦 Dane wyeksportowane!',
      toastProOnly:    '⭐ Tylko w wersji Pro',
      toastLimitHit:   `🔒 Limit ${FREE_TIER_LIMIT} impulsów (Free). Przejdź na Pro.`,
      toastFillAll:    '⚠️ Wypełnij nazwę i kwotę',
      toastStrictOn:   '🛡️ Tryb surowy włączony',
      toastStrictOff:  '✓ Tryb surowy wyłączony',
      toastPaymentSoon:'💳 Płatności już wkrótce!',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Nielimitowane impulsy i eksport danych.',
      proFeatures:     ['✅ Nielimitowana liczba impulsów','✅ Eksport danych do JSON','✅ Rozszerzone statystyki','✅ Bez reklam na zawsze'],
      proBuy:          'Przejdź na Pro',
      proClose:        'Zostań przy Free',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Wstecz',
      ariaAdd:         'Dodaj impuls',
      titleExport:     'Eksport danych',
      ariaExport:      'Eksport',
      titleArchive:    'Archiwum impulsów',
      ariaArchive:     'Archiwum',
      ariaBack:        'Wstecz',
      delay1h:         '1 godz',
      delay6h:         '6 godz',
      delay24h:        '24 godz',
      delay3d:         '3 dni',
      delay7d:         '7 dni',
      delay30d:        '30 dni',
      langSelectorLabel:'Język',
      strictMode:      'Tryb surowy',
      strictNotice:    '🛡️ Tryb surowy: odrzucenie niedostępne',
    },

    /* ── German ──────────────────────────────────────────── */
    de: {
      heroLabel:       'Gespart',
      heroSub:         'insgesamt',
      statActive:      'aktiv',
      statDone:        'erledigt',
      statCanceled:    'verzichtet',
      listTitle:       'Meine Impulse',
      emptyText:       'Noch keine Impulse. Füge den ersten hinzu!',
      archiveTitle:    '📦 Archiv',
      archiveEmpty:    'Das Archiv ist leer. Weiter so!',
      modalTitle:      'Neuer Impuls',
      modalHint:       'Beschreibe, was du kaufen möchtest, und lege eine Pause fest.',
      labelText:       'Was möchtest du kaufen?',
      labelAmount:     'Betrag (€)',
      labelDelay:      'Verzögerung vor dem Kauf',
      placeholderText: 'Neue Kopfhörer, ein Spiel...',
      btnCancel:       'Abbrechen',
      btnSave:         'Sperren 🔒',
      btnComplete:     '✓ Erledigt',
      btnSkip:         '✗ Verzichten',
      statusLocked:    '🔒 Gesperrt',
      statusUnlocked:  '⚡ Entsperrt',
      statusCompleted: '✅ Erledigt',
      statusCanceled:  '❌ Verzichtet',
      timerReady:      '⚡ Bereit zur Entscheidung!',
      timerPrefix:     '⏳ Verbleibend: ',
      timeSuffixD:     'T',
      timeSuffixH:     'h',
      timeSuffixM:     'min',
      timeSuffixS:     's',
      toastCreated:    '🔒 Impuls gesperrt!',
      toastCompleted:  '💰 Super! Geld gespart!',
      toastCanceled:   '🗑️ Verzichtet — auch das ist ein Gewinn.',
      toastExported:   '📦 Daten exportiert!',
      toastProOnly:    '⭐ Nur für Pro-Version',
      toastLimitHit:   `🔒 Limit von ${FREE_TIER_LIMIT} Impulsen (Free). Upgrade auf Pro.`,
      toastFillAll:    '⚠️ Bitte Name und Betrag ausfüllen',
      toastStrictOn:   '🛡️ Strenger Modus aktiviert',
      toastStrictOff:  '✓ Strenger Modus deaktiviert',
      toastPaymentSoon:'💳 Zahlung kommt bald!',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Unbegrenzte Impulse und Datenexport.',
      proFeatures:     ['✅ Unbegrenzte Anzahl an Impulsen','✅ Datenexport als JSON','✅ Erweiterte Statistiken','✅ Für immer werbefrei'],
      proBuy:          'Auf Pro upgraden',
      proClose:        'Bei Free bleiben',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Zurück',
      ariaAdd:         'Impuls hinzufügen',
      titleExport:     'Daten exportieren',
      ariaExport:      'Export',
      titleArchive:    'Impuls-Archiv',
      ariaArchive:     'Archiv',
      ariaBack:        'Zurück',
      delay1h:         '1 Std',
      delay6h:         '6 Std',
      delay24h:        '24 Std',
      delay3d:         '3 Tage',
      delay7d:         '7 Tage',
      delay30d:        '30 Tage',
      langSelectorLabel:'Sprache',
      strictMode:      'Strenger Modus',
      strictNotice:    '🛡️ Strenger Modus: Verzichten deaktiviert',
    },

    /* ── French ──────────────────────────────────────────── */
    fr: {
      heroLabel:       'Économisé',
      heroSub:         'au total',
      statActive:      'actifs',
      statDone:        'réalisés',
      statCanceled:    'annulés',
      listTitle:       'Mes impulsions',
      emptyText:       'Aucune impulsion. Ajoute la première !',
      archiveTitle:    '📦 Archives',
      archiveEmpty:    'Les archives sont vides. Continue comme ça !',
      modalTitle:      'Nouvelle impulsion',
      modalHint:       "Décris ce que tu veux acheter et fixe une pause.",
      labelText:       'Que veux-tu acheter ?',
      labelAmount:     'Montant (€)',
      labelDelay:      "Délai avant l'achat",
      placeholderText: 'Nouveau casque, un jeu...',
      btnCancel:       'Annuler',
      btnSave:         'Verrouiller 🔒',
      btnComplete:     '✓ Acheté',
      btnSkip:         '✗ Renoncer',
      statusLocked:    '🔒 Verrouillé',
      statusUnlocked:  '⚡ Déverrouillé',
      statusCompleted: '✅ Acheté',
      statusCanceled:  '❌ Annulé',
      timerReady:      '⚡ Prêt à décider !',
      timerPrefix:     '⏳ Restant : ',
      timeSuffixD:     'j',
      timeSuffixH:     'h',
      timeSuffixM:     'min',
      timeSuffixS:     's',
      toastCreated:    '🔒 Impulsion verrouillée !',
      toastCompleted:  '💰 Bravo ! Argent économisé !',
      toastCanceled:   "🗑️ Renoncé — c'est déjà une victoire.",
      toastExported:   '📦 Données exportées !',
      toastProOnly:    '⭐ Réservé à la version Pro',
      toastLimitHit:   `🔒 Limite de ${FREE_TIER_LIMIT} impulsions (Free). Passe à Pro.`,
      toastFillAll:    '⚠️ Remplis le nom et le montant',
      toastStrictOn:   '🛡️ Mode strict activé',
      toastStrictOff:  '✓ Mode strict désactivé',
      toastPaymentSoon:'💳 Paiement bientôt disponible !',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Impulsions illimitées et export des données.',
      proFeatures:     ["✅ Nombre illimité d'impulsions",'✅ Export des données en JSON','✅ Statistiques avancées','✅ Sans publicité pour toujours'],
      proBuy:          'Passer à Pro',
      proClose:        'Rester en Free',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Retour',
      ariaAdd:         'Ajouter une impulsion',
      titleExport:     'Exporter les données',
      ariaExport:      'Exporter',
      titleArchive:    'Archive des impulsions',
      ariaArchive:     'Archives',
      ariaBack:        'Retour',
      delay1h:         '1 h',
      delay6h:         '6 h',
      delay24h:        '24 h',
      delay3d:         '3 j',
      delay7d:         '7 j',
      delay30d:        '30 j',
      langSelectorLabel:'Langue',
      strictMode:      'Mode strict',
      strictNotice:    '🛡️ Mode strict : abandon désactivé',
    },

    /* ── Spanish ─────────────────────────────────────────── */
    es: {
      heroLabel:       'Ahorrado',
      heroSub:         'en total',
      statActive:      'activos',
      statDone:        'logrados',
      statCanceled:    'descartados',
      listTitle:       'Mis impulsos',
      emptyText:       '¡Aún no hay impulsos. Añade el primero!',
      archiveTitle:    '📦 Archivo',
      archiveEmpty:    '¡El archivo está vacío! Sigue así.',
      modalTitle:      'Nuevo impulso',
      modalHint:       'Describe qué quieres comprar y fija una pausa.',
      labelText:       '¿Qué quieres comprar?',
      labelAmount:     'Importe (€)',
      labelDelay:      'Retraso antes de comprar',
      placeholderText: 'Auriculares nuevos, un juego...',
      btnCancel:       'Cancelar',
      btnSave:         'Bloquear 🔒',
      btnComplete:     '✓ Comprado',
      btnSkip:         '✗ Renunciar',
      statusLocked:    '🔒 Bloqueado',
      statusUnlocked:  '⚡ Desbloqueado',
      statusCompleted: '✅ Comprado',
      statusCanceled:  '❌ Descartado',
      timerReady:      '⚡ ¡Listo para decidir!',
      timerPrefix:     '⏳ Restante: ',
      timeSuffixD:     'd',
      timeSuffixH:     'h',
      timeSuffixM:     'min',
      timeSuffixS:     's',
      toastCreated:    '🔒 ¡Impulso bloqueado!',
      toastCompleted:  '💰 ¡Genial! Dinero ahorrado.',
      toastCanceled:   '🗑️ Renunciaste — ya es una victoria.',
      toastExported:   '📦 ¡Datos exportados!',
      toastProOnly:    '⭐ Solo disponible en Pro',
      toastLimitHit:   `🔒 Límite de ${FREE_TIER_LIMIT} impulsos (Free). Mejora a Pro.`,
      toastFillAll:    '⚠️ Completa el nombre y el importe',
      toastStrictOn:   '🛡️ Modo estricto activado',
      toastStrictOff:  '✓ Modo estricto desactivado',
      toastPaymentSoon:'💳 ¡Pago disponible pronto!',
      proTitle:        'ImpulseBin Pro',
      proDesc:         'Impulsos ilimitados y exportación de datos.',
      proFeatures:     ['✅ Cantidad ilimitada de impulsos','✅ Exportación de datos a JSON','✅ Estadísticas avanzadas','✅ Sin anuncios para siempre'],
      proBuy:          'Mejorar a Pro',
      proClose:        'Seguir en Free',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         'Atrás',
      ariaAdd:         'Añadir impulso',
      titleExport:     'Exportar datos',
      ariaExport:      'Exportar',
      titleArchive:    'Archivo de impulsos',
      ariaArchive:     'Archivo',
      ariaBack:        'Atrás',
      delay1h:         '1 h',
      delay6h:         '6 h',
      delay24h:        '24 h',
      delay3d:         '3 d',
      delay7d:         '7 d',
      delay30d:        '30 d',
      langSelectorLabel:'Idioma',
      strictMode:      'Modo estricto',
      strictNotice:    '🛡️ Modo estricto: renunciar desactivado',
    },

    /* ── Chinese (Simplified) ────────────────────────────── */
    zh: {
      heroLabel:       '已节省',
      heroSub:         '累计',
      statActive:      '进行中',
      statDone:        '已完成',
      statCanceled:    '已放弃',
      listTitle:       '我的冲动',
      emptyText:       '还没有记录，添加第一条！',
      archiveTitle:    '📦 归档',
      archiveEmpty:    '归档为空，继续保持！',
      modalTitle:      '新的冲动',
      modalHint:       '描述你想购买的东西，设置等待时间。',
      labelText:       '你想买什么？',
      labelAmount:     '金额 (¥)',
      labelDelay:      '购买前的等待时间',
      placeholderText: '新耳机、游戏…',
      btnCancel:       '取消',
      btnSave:         '锁定 🔒',
      btnComplete:     '✓ 完成',
      btnSkip:         '✗ 放弃',
      statusLocked:    '🔒 已锁定',
      statusUnlocked:  '⚡ 已解锁',
      statusCompleted: '✅ 已完成',
      statusCanceled:  '❌ 已取消',
      timerReady:      '⚡ 可以决定了！',
      timerPrefix:     '⏳ 剩余：',
      timeSuffixD:     '天',
      timeSuffixH:     '时',
      timeSuffixM:     '分',
      timeSuffixS:     '秒',
      toastCreated:    '🔒 冲动已锁定！',
      toastCompleted:  '💰 太棒了！钱已节省！',
      toastCanceled:   '🗑️ 已放弃 — 这也是胜利。',
      toastExported:   '📦 数据已导出！',
      toastProOnly:    '⭐ 仅限 Pro 版',
      toastLimitHit:   `🔒 免费版限制 ${FREE_TIER_LIMIT} 条记录。升级到 Pro。`,
      toastFillAll:    '⚠️ 请填写名称和金额',
      toastStrictOn:   '🛡️ 严格模式已启用',
      toastStrictOff:  '✓ 严格模式已关闭',
      toastPaymentSoon:'💳 支付功能即将推出！',
      proTitle:        'ImpulseBin Pro',
      proDesc:         '无限记录及数据导出。',
      proFeatures:     ['✅ 无限数量的冲动记录','✅ 导出数据为 JSON','✅ 高级统计','✅ 永久无广告'],
      proBuy:          '升级到 Pro',
      proClose:        '继续使用免费版',
      limitBadge:      (u, m) => `${u}/${m}`,
      btnBack:         '返回',
      ariaAdd:         '添加冲动',
      titleExport:     '导出数据',
      ariaExport:      '导出',
      titleArchive:    '冲动归档',
      ariaArchive:     '归档',
      ariaBack:        '返回',
      delay1h:         '1小时',
      delay6h:         '6小时',
      delay24h:        '24小时',
      delay3d:         '3天',
      delay7d:         '7天',
      delay30d:        '30天',
      langSelectorLabel:'语言',
      strictMode:      '严格模式',
      strictNotice:    '🛡️ 严格模式：无法放弃',
    },
  };

  /**
   * Resolve starting language:
   *   1. Previously saved preference in localStorage
   *   2. navigator.language primary subtag (e.g. "fr-FR" → "fr")
   *   3. English default fallback
   */
  let current = (() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && translations[saved]) return saved;

      const navPrimary = (navigator.language || '').toLowerCase().split('-')[0];
      if (navPrimary && translations[navPrimary]) return navPrimary;
    } catch { /* localStorage blocked */ }
    return 'en';
  })();

  return {
    /**
     * Get a translation string for the current language.
     * Falls back to English if the key is missing in the current locale.
     */
    t(key, ...args) {
      const val = translations[current]?.[key] ?? translations.en?.[key];
      return (typeof val === 'function') ? val(...args) : (val ?? key);
    },
    /** Switch the active language and persist. */
    set(lang) {
      if (!translations[lang]) return;
      current = lang;
      try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* noop */ }
    },
    get lang()      { return current; },
    get languages() { return Object.keys(translations); },
  };
})();

/* ═══════════════════════════════════════════════════════════
   3. CAPACITOR PLUGIN BRIDGE
   — Gracefully degrades in a plain browser.
   ═══════════════════════════════════════════════════════════ */

async function haptic(style = 'light') {
  try {
    const { Haptics, ImpactStyle } = window.Capacitor?.Plugins ?? {};
    if (Haptics) {
      const styleMap = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      await Haptics.impact({ style: styleMap[style] ?? ImpactStyle.Light });
      return;
    }
  } catch (_) { /* not in Capacitor */ }
  if (navigator.vibrate) navigator.vibrate(style === 'heavy' ? 80 : 40);
}

async function initStatusBar() {
  try {
    const { StatusBar, Style } = window.Capacitor?.Plugins ?? {};
    if (StatusBar) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
    }
  } catch (_) { /* noop in browser */ }
}

/* ═══════════════════════════════════════════════════════════
   4. CURRENCY HELPER
   ═══════════════════════════════════════════════════════════ */

/** Returns the currency symbol for the currently active language. */
function getCurrency() {
  return CURRENCY_MAP[i18n.lang] || '$';
}

/* ═══════════════════════════════════════════════════════════
   5. STRICT MODE STATE
   ═══════════════════════════════════════════════════════════ */

/** Persisted strict-mode flag. */
let strictMode = (() => {
  try { return localStorage.getItem(STRICT_STORAGE_KEY) === 'true'; } catch { return false; }
})();

/** Toggle strict mode, persist, update button, show toast. */
function toggleStrictMode() {
  strictMode = !strictMode;
  try { localStorage.setItem(STRICT_STORAGE_KEY, String(strictMode)); } catch { /* noop */ }
  updateStrictBtn();
  haptic(strictMode ? 'heavy' : 'light');
  showToast(
    strictMode ? i18n.t('toastStrictOn') : i18n.t('toastStrictOff'),
    strictMode ? 'error' : 'default',
  );
}

/** Sync the strict-mode button's visual state to the current `strictMode` value. */
function updateStrictBtn() {
  const btn = document.getElementById('btn-strict');
  if (!btn) return;
  btn.classList.toggle('is-active', strictMode);
  btn.setAttribute('aria-pressed', String(strictMode));
}

/* ═══════════════════════════════════════════════════════════
   6. DATA LAYER (localStorage)
   ═══════════════════════════════════════════════════════════ */

/** @returns {Array<Object>} */
function loadImpulses() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

/** @param {Array<Object>} impulses */
function saveImpulses(impulses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(impulses));
}

/** Generate a 10-char URL-safe unique ID. @returns {string} */
function uid() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Derive aggregate stats from the impulse array.
 * @param {Array<Object>} impulses
 * @returns {{ totalSaved: number, active: number, completed: number, canceled: number }}
 */
function deriveStats(impulses) {
  return impulses.reduce(
    (acc, imp) => {
      if (imp.status === 'locked' || imp.status === 'unlocked') acc.active++;
      if (imp.status === 'completed') { acc.completed++; acc.totalSaved += Number(imp.amount) || 0; }
      if (imp.status === 'canceled')  acc.canceled++;
      return acc;
    },
    { totalSaved: 0, active: 0, completed: 0, canceled: 0 },
  );
}

/**
 * Update the status of one impulse and persist.
 * @param {string} id
 * @param {string} newStatus
 * @returns {Array<Object>} updated array
 */
function setImpulseStatus(id, newStatus) {
  const impulses = loadImpulses().map((imp) =>
    imp.id === id ? { ...imp, status: newStatus } : imp,
  );
  saveImpulses(impulses);
  return impulses;
}

/* ═══════════════════════════════════════════════════════════
   7. TIMER LOGIC
   ═══════════════════════════════════════════════════════════ */

/** Global setInterval handle. */
let timerHandle = null;

/**
 * Format milliseconds remaining as a localised short string.
 * Time-unit suffixes come from i18n translations.
 * @param {number} ms  Positive milliseconds.
 * @returns {string}
 */
function formatTimeLeft(ms) {
  if (ms <= 0) return i18n.t('timerReady');

  const sd = i18n.t('timeSuffixD');
  const sh = i18n.t('timeSuffixH');
  const sm = i18n.t('timeSuffixM');
  const ss = i18n.t('timeSuffixS');

  const totalSec = Math.ceil(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (d > 0) return `${d}${sd} ${h}${sh} ${m}${sm}`;
  if (h > 0) return `${h}${sh} ${m}${sm} ${s}${ss}`;
  return `${m}${sm} ${s}${ss}`;
}

/**
 * Timer tick: auto-unlocks expired impulses and updates timer labels in-place.
 * Triggers a full renderList() only when a status change occurs.
 */
function updateTimers() {
  const now = Date.now();
  let impulses = loadImpulses();
  let changed  = false;

  impulses = impulses.map((imp) => {
    if (imp.status === 'locked' && now >= imp.targetTime) {
      changed = true;
      return { ...imp, status: 'unlocked' };
    }
    return imp;
  });

  if (changed) {
    saveImpulses(impulses);
    renderList();
    updateHeroStats(impulses);
    return;
  }

  /* Only update timer label text — no DOM rebuilding */
  impulses.forEach((imp) => {
    if (imp.status !== 'locked' && imp.status !== 'unlocked') return;
    const timerEl = document.querySelector(`[data-timer="${imp.id}"]`);
    if (!timerEl) return;
    const remaining = imp.targetTime - now;
    if (imp.status === 'unlocked' || remaining <= 0) {
      timerEl.textContent = i18n.t('timerReady');
      timerEl.classList.add('timer-unlocked');
    } else {
      timerEl.textContent = i18n.t('timerPrefix') + formatTimeLeft(remaining);
      timerEl.classList.remove('timer-unlocked');
    }
  });
}

/** Start (or restart) the global 1-second timer loop. */
function startTimerLoop() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(updateTimers, TICK_INTERVAL);
  updateTimers(); /* immediate first tick */
}

/* ═══════════════════════════════════════════════════════════
   8. RENDER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

/**
 * Build a single impulse card DOM element.
 * - strict impulses show a 🛡️ tag and hide the skip button.
 * - uses getCurrency() so switching language refreshes the symbol.
 * @param {Object} imp
 * @returns {HTMLElement}
 */
function buildCard(imp) {
  const now        = Date.now();
  const remaining  = imp.targetTime - now;
  const isActive   = imp.status === 'locked' || imp.status === 'unlocked';
  const isUnlocked = imp.status === 'unlocked';

  const card = document.createElement('div');
  card.className = [
    'impulse-card',
    `status-${imp.status}`,
    imp.isStrict ? 'is-strict' : '',
  ].filter(Boolean).join(' ');
  card.setAttribute('role', 'listitem');
  card.dataset.id = imp.id;

  const badgeText = {
    locked:    i18n.t('statusLocked'),
    unlocked:  i18n.t('statusUnlocked'),
    completed: i18n.t('statusCompleted'),
    canceled:  i18n.t('statusCanceled'),
  }[imp.status] ?? imp.status;

  const badgeClass = {
    locked:    'badge-locked',
    unlocked:  'badge-unlocked',
    completed: 'badge-completed',
    canceled:  'badge-canceled',
  }[imp.status] ?? '';

  let timerText = '';
  if (imp.status === 'unlocked') {
    timerText = i18n.t('timerReady');
  } else if (imp.status === 'locked') {
    timerText = i18n.t('timerPrefix') + formatTimeLeft(remaining > 0 ? remaining : 0);
  }

  const currency   = getCurrency();
  const locale     = LOCALE_MAP[i18n.lang] || 'en-US';
  const amtDisplay = `${currency}${Number(imp.amount).toLocaleString(locale)}`;
  const strictTag  = imp.isStrict
    ? '<span class="strict-tag" aria-label="Strict">🛡️</span>'
    : '';

  card.innerHTML = `
    <div class="card-top">
      <div class="card-info">
        <div class="card-text">${escHtml(imp.text)}${strictTag}</div>
        <div class="card-amount">${amtDisplay}</div>
      </div>
      <span class="card-status-badge ${badgeClass}">${badgeText}</span>
    </div>
    ${isActive ? `
    <div class="card-timer">
      <span data-timer="${imp.id}"
            class="${isUnlocked ? 'timer-unlocked' : ''}">${timerText}</span>
    </div>
    <div class="card-actions">
      <button class="btn-success btn-do"
              data-action="complete" data-id="${imp.id}"
              ${isUnlocked ? '' : 'disabled'}
              aria-label="${i18n.t('btnComplete')}"
      >${i18n.t('btnComplete')}</button>
      ${!imp.isStrict ? `
      <button class="btn-danger btn-skip"
              data-action="cancel" data-id="${imp.id}"
              aria-label="${i18n.t('btnSkip')}"
      >${i18n.t('btnSkip')}</button>
      ` : ''}
    </div>` : ''}
  `;

  return card;
}

/**
 * Render the active impulses list (main screen).
 * Reconciles existing cards by id+className to minimise DOM work.
 */
function renderList() {
  const impulses = loadImpulses();
  const listEl   = document.getElementById('impulse-list');
  const emptyEl  = document.getElementById('empty-state');
  const active   = impulses.filter((i) => i.status === 'locked' || i.status === 'unlocked');

  if (!listEl) return;

  if (active.length === 0) {
    listEl.innerHTML   = '';
    emptyEl.style.display = 'flex';
    updateHeroStats(impulses);
    return;
  }

  emptyEl.style.display = 'none';

  /* Reconcile: only rebuild if the card fingerprint list changed */
  const fingerprint = (i) =>
    [i.id, `impulse-card status-${i.status}`, i.isStrict ? 'is-strict' : '']
      .filter(Boolean).join('|');

  const current  = [...listEl.querySelectorAll('.impulse-card')].map(
    (el) => el.dataset.id + '|' + el.className.replace(/\s+/g,' ').trim(),
  );
  const required = active.map((i) => {
    const cls = ['impulse-card', `status-${i.status}`, i.isStrict ? 'is-strict' : '']
      .filter(Boolean).join(' ');
    return i.id + '|' + cls;
  });

  if (JSON.stringify(current) === JSON.stringify(required)) return; /* timers handle label-only updates */

  const fragment = document.createDocumentFragment();
  active.forEach((imp) => fragment.appendChild(buildCard(imp)));
  listEl.replaceChildren(fragment);
  updateHeroStats(impulses);
}

/**
 * Render the archive screen (completed + canceled impulses), newest first.
 */
function renderArchive() {
  const impulses = loadImpulses();
  const listEl   = document.getElementById('archive-list');
  const emptyEl  = document.getElementById('archive-empty');
  const archived = impulses
    .filter((i) => i.status === 'completed' || i.status === 'canceled')
    .reverse();

  if (!listEl) return;

  if (archived.length === 0) {
    listEl.innerHTML      = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  const fragment = document.createDocumentFragment();
  archived.forEach((imp) => fragment.appendChild(buildCard(imp)));
  listEl.replaceChildren(fragment);
}

/**
 * Refresh the hero savings amount and all stats bar values.
 * @param {Array<Object>} impulses
 */
function updateHeroStats(impulses) {
  const stats    = deriveStats(impulses);
  const currency = getCurrency();
  const locale   = LOCALE_MAP[i18n.lang] || 'en-US';

  const heroAmountEl = document.getElementById('hero-amount');
  if (heroAmountEl) {
    heroAmountEl.textContent = `${currency}${stats.totalSaved.toLocaleString(locale)}`;
  }

  const el = (id) => document.getElementById(id);
  if (el('stat-active'))   el('stat-active').textContent   = stats.active;
  if (el('stat-done'))     el('stat-done').textContent     = stats.completed;
  if (el('stat-canceled')) el('stat-canceled').textContent = stats.canceled;

  updateLimitBadge(impulses);
}

/** @param {Array<Object>} impulses */
function updateLimitBadge(impulses) {
  const badgeEl    = document.getElementById('limit-badge');
  const proBadgeEl = document.getElementById('pro-badge');
  if (!badgeEl) return;

  const activeCount = impulses.filter(
    (i) => i.status === 'locked' || i.status === 'unlocked',
  ).length;

  if (IS_PRO) {
    badgeEl.textContent = '';
    if (proBadgeEl) proBadgeEl.style.display = 'inline-flex';
  } else {
    badgeEl.textContent = i18n.t('limitBadge', activeCount, FREE_TIER_LIMIT);
    if (proBadgeEl) proBadgeEl.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════════════
   9. ACTIONS
   ═══════════════════════════════════════════════════════════ */

/**
 * Create a new impulse.
 * Embeds isStrict from the current global strictMode.
 * @param {{ text: string, amount: number, hours: number }} opts
 * @returns {boolean} true if created, false if blocked
 */
function createImpulse({ text, amount, hours }) {
  const impulses    = loadImpulses();
  const activeCount = impulses.filter(
    (i) => i.status === 'locked' || i.status === 'unlocked',
  ).length;

  if (!IS_PRO && activeCount >= FREE_TIER_LIMIT) {
    showToast(i18n.t('toastLimitHit'), 'error');
    showProModal();
    return false;
  }

  const now = Date.now();
  /** @type {{ id:string, text:string, amount:number, createdAt:number, targetTime:number, status:string, isStrict:boolean }} */
  const newImpulse = {
    id:         uid(),
    text:       text.trim(),
    amount:     Number(amount) || 0,
    createdAt:  now,
    targetTime: now + hours * 3_600_000,
    status:     'locked',
    isStrict:   strictMode,
  };

  impulses.push(newImpulse);
  saveImpulses(impulses);
  renderList();
  showToast(i18n.t('toastCreated'), 'gold');
  return true;
}

/** @param {string} id */
function completeImpulse(id) {
  const impulses = setImpulseStatus(id, 'completed');
  renderList();
  updateHeroStats(impulses);
  showToast(i18n.t('toastCompleted'), 'success');
}

/** @param {string} id */
function cancelImpulse(id) {
  const impulses = setImpulseStatus(id, 'canceled');
  renderList();
  updateHeroStats(impulses);
  showToast(i18n.t('toastCanceled'));
}

/** Export all data as a downloadable JSON file. Pro only. */
function exportData() {
  if (!IS_PRO) {
    showToast(i18n.t('toastProOnly'), 'error');
    haptic('medium');
    showProModal();
    return;
  }

  const payload = { exportedAt: new Date().toISOString(), version: 1, impulses: loadImpulses() };
  const blob    = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url     = URL.createObjectURL(blob);
  const anchor  = document.createElement('a');
  anchor.href     = url;
  anchor.download = `impulsebin-export-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  showToast(i18n.t('toastExported'), 'success');
  haptic('light');
}

/* ═══════════════════════════════════════════════════════════
   10. UI HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Selected delay in the Add-impulse modal. */
let selectedDelayHours = 1;

/** @param {boolean} show */
function toggleAddModal(show) {
  const modal = document.getElementById('modal-add');
  if (!modal) return;

  if (show) {
    resetAddForm();
    /* Show strict-mode notice inside the modal when relevant */
    const noticeEl = document.getElementById('strict-notice');
    if (noticeEl) noticeEl.style.display = strictMode ? 'flex' : 'none';
    modal.style.display = 'flex';
    requestAnimationFrame(() => document.getElementById('input-text')?.focus());
  } else {
    modal.style.display = 'none';
  }
}

function resetAddForm() {
  const textEl   = document.getElementById('input-text');
  const amountEl = document.getElementById('input-amount');
  if (textEl)   textEl.value   = '';
  if (amountEl) amountEl.value = '';
  selectedDelayHours = 1;
  document.querySelectorAll('.delay-chip').forEach((c) => {
    c.classList.toggle('active', Number(c.dataset.hours) === 1);
  });
}

function showProModal()  { const m = document.getElementById('modal-pro'); if (m) m.style.display = 'flex'; }
function hideProModal()  { const m = document.getElementById('modal-pro'); if (m) m.style.display = 'none'; }

/** @param {'main'|'archive'} name */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.toggle('active', s.id === `screen-${name}`);
  });
  if (name === 'archive') renderArchive();
}

let toastTimer = null;
/** @param {string} message @param {'default'|'success'|'error'|'gold'} [type] @param {number} [duration] */
function showToast(message, type = 'default', duration = 2400) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className   = `toast${type !== 'default' ? ` toast-${type}` : ''} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/** @param {string} str @returns {string} */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** @param {string} id @param {string} text */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ═══════════════════════════════════════════════════════════
   11. STATIC TRANSLATIONS
   — Called on boot and on every language switch.
   ═══════════════════════════════════════════════════════════ */

function applyStaticTranslations() {
  document.documentElement.lang = i18n.lang;

  /* ── Header buttons ───────────────────────────────────── */
  const btnExport  = document.getElementById('btn-export');
  const btnArchive = document.getElementById('btn-archive');
  const btnAdd     = document.getElementById('btn-add');
  const btnStrict  = document.getElementById('btn-strict');

  if (btnExport) {
    btnExport.setAttribute('title',      i18n.t('titleExport'));
    btnExport.setAttribute('aria-label', i18n.t('ariaExport'));
  }
  if (btnArchive) {
    btnArchive.setAttribute('title',      i18n.t('titleArchive'));
    btnArchive.setAttribute('aria-label', i18n.t('ariaArchive'));
  }
  if (btnAdd)    btnAdd.setAttribute('aria-label', i18n.t('ariaAdd'));
  if (btnStrict) {
    btnStrict.setAttribute('title',      i18n.t('strictMode'));
    btnStrict.setAttribute('aria-label', i18n.t('strictMode'));
  }

  /* ── Savings hero ─────────────────────────────────────── */
  setText('hero-label', i18n.t('heroLabel'));
  setText('hero-sub',   i18n.t('heroSub'));

  /* ── Stats bar ────────────────────────────────────────── */
  setText('stat-active-label',   i18n.t('statActive'));
  setText('stat-done-label',     i18n.t('statDone'));
  setText('stat-canceled-label', i18n.t('statCanceled'));

  /* ── List section ─────────────────────────────────────── */
  setText('list-title-active', i18n.t('listTitle'));
  setText('empty-text',        i18n.t('emptyText'));

  /* ── Archive screen ───────────────────────────────────── */
  setText('archive-title',      i18n.t('archiveTitle'));
  setText('archive-empty-text', i18n.t('archiveEmpty'));
  setText('btn-back-label',     i18n.t('btnBack'));
  const btnBackArchive = document.getElementById('btn-back-archive');
  if (btnBackArchive) btnBackArchive.setAttribute('aria-label', i18n.t('ariaBack'));

  /* ── Add-impulse modal ────────────────────────────────── */
  setText('modal-title',      i18n.t('modalTitle'));
  setText('modal-hint',       i18n.t('modalHint'));
  setText('label-text',       i18n.t('labelText'));
  setText('label-amount',     i18n.t('labelAmount'));
  setText('label-delay',      i18n.t('labelDelay'));
  setText('strict-notice-text', i18n.t('strictNotice'));

  const inputText = document.getElementById('input-text');
  if (inputText) inputText.setAttribute('placeholder', i18n.t('placeholderText'));

  setText('delay-1h',   i18n.t('delay1h'));
  setText('delay-6h',   i18n.t('delay6h'));
  setText('delay-24h',  i18n.t('delay24h'));
  setText('delay-72h',  i18n.t('delay3d'));
  setText('delay-168h', i18n.t('delay7d'));
  setText('delay-720h', i18n.t('delay30d'));
  setText('btn-cancel-modal', i18n.t('btnCancel'));
  setText('btn-save-impulse', i18n.t('btnSave'));

  /* ── Pro modal ────────────────────────────────────────── */
  setText('pro-title', i18n.t('proTitle'));
  setText('pro-desc',  i18n.t('proDesc'));
  const proFeaturesEl = document.getElementById('pro-features');
  if (proFeaturesEl) {
    proFeaturesEl.innerHTML = i18n.t('proFeatures')
      .map((f) => `<li>${escHtml(f)}</li>`)
      .join('');
  }
  setText('btn-pro-buy',   i18n.t('proBuy'));
  setText('btn-pro-close', i18n.t('proClose'));

  /* ── Language selector ────────────────────────────────── */
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.setAttribute('aria-label', i18n.t('langSelectorLabel'));
}

/* ═══════════════════════════════════════════════════════════
   12. PULL-TO-REFRESH PREVENTION
   ═══════════════════════════════════════════════════════════ */

/**
 * Prevents the Android WebView pull-to-refresh gesture.
 *
 * Strategy:
 *  - CSS `overscroll-behavior: none` on html + body (styles.css).
 *  - `capacitor.config.json` android.overScrollMode "never".
 *  - This JS guard intercepts touchmove when the document is
 *    already scrolled to the top and the finger moves downward,
 *    while allowing normal scrolling inside scrollable children.
 */
function preventPullToRefresh() {
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    /* Allow natural scroll inside modal sheets and lists */
    if (e.target.closest('.modal-sheet, .impulse-list, .screen')) return;

    const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop || 0;
    const pullingDown = e.touches[0].clientY > startY;

    if (scrollTop === 0 && pullingDown) {
      e.preventDefault();
    }
  }, { passive: false });
}

/* ═══════════════════════════════════════════════════════════
   13. EVENT DELEGATION & WIRING
   ═══════════════════════════════════════════════════════════ */

function wireEvents() {

  /* ── Strict mode toggle ──────────────────────────────── */
  document.getElementById('btn-strict')?.addEventListener('click', () => {
    toggleStrictMode();
  });

  /* ── Language selector ───────────────────────────────── */
  document.getElementById('lang-select')?.addEventListener('change', (e) => {
    haptic('light');
    i18n.set(e.target.value);
    applyStaticTranslations();
    renderList();
    updateHeroStats(loadImpulses());
    /* Refresh archive view if it is currently visible */
    if (document.getElementById('screen-archive')?.classList.contains('active')) {
      renderArchive();
    }
  });

  /* ── FAB ─────────────────────────────────────────────── */
  document.getElementById('btn-add')?.addEventListener('click', () => {
    haptic('light');
    const impulses    = loadImpulses();
    const activeCount = impulses.filter(
      (i) => i.status === 'locked' || i.status === 'unlocked',
    ).length;
    if (!IS_PRO && activeCount >= FREE_TIER_LIMIT) {
      showToast(i18n.t('toastLimitHit'), 'error');
      showProModal();
      return;
    }
    toggleAddModal(true);
  });

  /* ── Delay chips ─────────────────────────────────────── */
  document.querySelectorAll('.delay-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      haptic('light');
      selectedDelayHours = Number(chip.dataset.hours);
      document.querySelectorAll('.delay-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  /* ── Save impulse ────────────────────────────────────── */
  document.getElementById('btn-save-impulse')?.addEventListener('click', () => {
    haptic('medium');
    const text   = document.getElementById('input-text')?.value.trim()  ?? '';
    const amount = document.getElementById('input-amount')?.value        ?? '';
    if (!text || !amount) {
      showToast(i18n.t('toastFillAll'), 'error');
      haptic('heavy');
      return;
    }
    const created = createImpulse({ text, amount: Number(amount), hours: selectedDelayHours });
    if (created) toggleAddModal(false);
  });

  /* ── Cancel modal ────────────────────────────────────── */
  document.getElementById('btn-cancel-modal')?.addEventListener('click', () => {
    haptic('light');
    toggleAddModal(false);
  });

  /* ── Click outside modal to close ───────────────────── */
  document.getElementById('modal-add')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) { haptic('light'); toggleAddModal(false); }
  });
  document.getElementById('modal-pro')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideProModal();
  });

  /* ── Export ──────────────────────────────────────────── */
  document.getElementById('btn-export')?.addEventListener('click', () => {
    haptic('light');
    exportData();
  });

  /* ── Archive navigation ──────────────────────────────── */
  document.getElementById('btn-archive')?.addEventListener('click', () => {
    haptic('light');
    showScreen('archive');
  });
  document.getElementById('btn-back-archive')?.addEventListener('click', () => {
    haptic('light');
    showScreen('main');
  });

  /* ── Pro modal ───────────────────────────────────────── */
  document.getElementById('btn-pro-buy')?.addEventListener('click', () => {
    haptic('medium');
    /* TODO: integrate your payment provider here */
    showToast(i18n.t('toastPaymentSoon'), 'gold');
    hideProModal();
  });
  document.getElementById('btn-pro-close')?.addEventListener('click', () => {
    haptic('light');
    hideProModal();
  });

  /* ── Impulse card actions (event delegation) ─────────── */
  document.getElementById('impulse-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const { action, id } = btn.dataset;
    if (!id) return;
    if (action === 'complete') { haptic('medium'); completeImpulse(id); }
    else if (action === 'cancel') { haptic('light'); cancelImpulse(id); }
  });

  /* ── Keyboard: Enter saves, Escape closes ────────────── */
  document.getElementById('modal-add')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'  && !e.shiftKey) document.getElementById('btn-save-impulse')?.click();
    if (e.key === 'Escape')               toggleAddModal(false);
  });
}

/* ═══════════════════════════════════════════════════════════
   14. BOOTSTRAP
   ═══════════════════════════════════════════════════════════ */

function bootstrap() {
  /* 1. Block pull-to-refresh before any gesture can fire */
  preventPullToRefresh();

  /* 2. Native status bar styling (Capacitor) */
  initStatusBar();

  /* 3. Restore language into the selector and apply translations */
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = i18n.lang;
  applyStaticTranslations();

  /* 4. Restore strict-mode button visual */
  updateStrictBtn();

  /* 5. Render impulse list and stats */
  const impulses = loadImpulses();
  renderList();
  updateHeroStats(impulses);

  /* 6. Attach all event listeners */
  wireEvents();

  /* 7. Start the 1-second timer loop */
  startTimerLoop();

  console.log('[ImpulseBin] 🚀 Ready — IS_PRO:', IS_PRO, '| Lang:', i18n.lang, '| Strict:', strictMode);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
