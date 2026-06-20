/**
 * ImpulseBin — app.js v3.0
 * Bug fixes: canceled→totalSaved, human dates, achievements, stats screen
 */
'use strict';

/* ════════════════════════════════ 1. CONSTANTS ═════════════════ */
const IS_PRO          = false;
const FREE_TIER_LIMIT = 3;
const STORAGE_KEY     = 'impulsebin_impulses';
const LANG_KEY        = 'impulsebin_lang';
const STRICT_KEY      = 'impulsebin_strict';
const ACHIEVE_KEY     = 'impulsebin_achievements';
const THEME_KEY       = 'impulsebin_theme';
const FLAGS_KEY       = 'impulsebin_flags';
const AD_SLOTS_KEY    = 'impulsebin_ad_slots';
const MAX_EXTRA_SLOTS = 7;   // ad-earned slots, on top of FREE_TIER_LIMIT
const ABS_MAX_LIMIT   = FREE_TIER_LIMIT + MAX_EXTRA_SLOTS; // 10
const TICK_INTERVAL   = 1000;

const LOCALE_MAP   = { uk:'uk-UA',en:'en-US',pl:'pl-PL',de:'de-DE',fr:'fr-FR',es:'es-ES',zh:'zh-CN' };
const CURRENCY_MAP = { uk:'₴',en:'$',pl:'zł',de:'€',fr:'€',es:'€',zh:'¥' };
/** Approximate local-currency → USD rates for achievement thresholds */
const USD_RATE     = { uk:0.024,en:1,pl:0.25,de:1.08,fr:1.08,es:1.08,zh:0.14 };

/* ════════════════════════════════ 2. i18n ══════════════════════ */
const i18n = (() => {
  const T = {
    uk:{
      heroLabel:'Не витрачено',heroSub:'за весь час',
      statActive:'активних',statDone:'куплено',statCanceled:'збережено',
      listTitle:'Мої імпульси',emptyText:'Ще немає імпульсів. Додай перший!',
      archiveTitle:'📦 Архів',archiveEmpty:'Архів порожній.',
      achievementsTitle:'Ачівки',statsTitle:'Статистика',
      modalTitle:'Новий імпульс',modalHint:'Опиши, що хочеш купити, і встанови паузу.',
      labelText:'Що ти хочеш купити?',labelAmount:'Сума (₴)',
      labelDelay:'Затримка перед покупкою',placeholderText:'Нові навушники, гра...',
      btnCancel:'Скасувати',btnSave:'Заблокувати 🔒',
      btnComplete:'✓ Куплено',btnSkip:'✗ Відмовитись',
      statusLocked:'🔒 Заблоковано',statusUnlocked:'⚡ Розблоковано',
      statusCompleted:'✅ Куплено',statusCanceled:'💰 Збережено',
      timerReady:'⚡ Можна вирішувати!',timerPrefix:'⏳ Залишилось: ',
      timeSuffixD:'д',timeSuffixH:'г',timeSuffixM:'хв',timeSuffixS:'с',
      toastCreated:'🔒 Імпульс заблоковано!',
      toastCompleted:'✅ Покупку зроблено! Свідоме рішення.',
      toastCanceled:'💰 Молодець! Гроші збережено!',
      toastExported:'📦 Дані експортовано!',toastProOnly:'⭐ Тільки для Pro',
      toastLimitHit:'🔒 Ліміт '+FREE_TIER_LIMIT+' імпульсів (Free). Оновіть до Pro.',
      toastFillAll:'⚠️ Заповни назву та суму',
      toastStrictOn:'🛡️ Суворий режим увімкнено',toastStrictOff:'✓ Суворий режим вимкнено',
      toastPaymentSoon:'💳 Оплата зовсім скоро!',
      proTitle:'ImpulseBin Pro',proDesc:'Безлімітні імпульси та розширена статистика.',
      proFeatures:['✅ Необмежена кількість імпульсів','✅ Детальна статистика','✅ Розширений експорт JSON','✅ Без реклами назавжди','✅ Преміум дизайн'],
      proBuy:'Оновити до Pro',proClose:'Залишитись у Free',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Назад',
      ariaAdd:'Додати імпульс',titleExport:'Експорт',ariaExport:'Експорт',
      titleArchive:'Архів',ariaArchive:'Архів',ariaBack:'Назад',
      titleStats:'Статистика',ariaStats:'Статистика',
      titleAchievements:'Ачівки',ariaAchievements:'Ачівки',
      delay1h:'1 год',delay6h:'6 год',delay24h:'24 год',delay3d:'3 дні',delay7d:'7 днів',delay30d:'30 днів',
      langSelectorLabel:'Мова',strictMode:'Суворий режим',
      strictNotice:'🛡️ Суворий режим: відмова недоступна',
      achievementUnlockedLabel:'🏆 Ачівмент розблоковано!',achClose:'Супер! 🎉',
      statsSaved:'Не витрачено',statsSpent:'Витрачено',
      statsSavedSub:'відмовлені покупки',statsSpentSub:'свідомі покупки',
      statsResisted:'відмовлено',statsPurchased:'куплено',statsTotal:'всього',
      statsTime:'Час очікування',btnExportStats:'Експортувати статистику',
      titleSettings:'Налаштування',ariaSettings:'Налаштування',settingsScreenTitle:'Налаштування',
      settingsSectionLanguage:'Мова',settingsSectionTheme:'Тема',settingsSectionData:'Дані',
      themeDark:'Темна',themeLight:'Світла',
      settingsResetTitle:'Скинути прогрес',settingsResetDesc:'Видаляє всі імпульси та збережену суму. Ачівки залишаться.',
      btnResetProgress:'Скинути весь прогрес',
      resetConfirmTitle:'Точно скинути?',resetConfirmDesc:'Цю дію неможливо скасувати. Всі активні та архівні імпульси, а також збережена сума будуть видалені назавжди.',
      btnResetConfirm:'Так, скинути',btnResetCancel:'Залишити',
      toastReset:'🗑️ Прогрес скинуто. Чиста сторінка!',
      limitModalTitle:'Ліміт вичерпано',limitModalDesc:'Безкоштовно доступно '+FREE_TIER_LIMIT+' активних імпульси. Розблокуй ще один слот безкоштовно!',
      btnWatchAd:'▶️ Переглянути рекламу (+1 слот)',btnUpgradeFromLimit:'⭐ Перейти на Pro — без лімітів',
      btnLimitCancel:'Скасувати',adLoadingText:'Завантаження реклами...',
      toastAdReward:'🎉 +1 слот розблоковано!',limitModalMaxedNote:'Максимум додаткових слотів досягнуто (10/10).',
      secretLockedTitle:'Секретна ачівка',secretLockedDesc:'Розблокуй, щоб дізнатись',
    },
    en:{
      heroLabel:'Saved',heroSub:'all time',
      statActive:'active',statDone:'purchased',statCanceled:'saved',
      listTitle:'My Impulses',emptyText:'No impulses yet. Add your first!',
      archiveTitle:'📦 Archive',archiveEmpty:'Archive is empty.',
      achievementsTitle:'Achievements',statsTitle:'Statistics',
      modalTitle:'New Impulse',modalHint:'Describe what you want to buy and set a pause.',
      labelText:'What do you want to buy?',labelAmount:'Amount ($)',
      labelDelay:'Delay before purchase',placeholderText:'New headphones, a game...',
      btnCancel:'Cancel',btnSave:'Lock 🔒',
      btnComplete:'✓ Purchased',btnSkip:'✗ Resist',
      statusLocked:'🔒 Locked',statusUnlocked:'⚡ Unlocked',
      statusCompleted:'✅ Purchased',statusCanceled:'💰 Saved',
      timerReady:'⚡ Ready to decide!',timerPrefix:'⏳ Remaining: ',
      timeSuffixD:'d',timeSuffixH:'h',timeSuffixM:'m',timeSuffixS:'s',
      toastCreated:'🔒 Impulse locked!',
      toastCompleted:'✅ Purchase made! Mindful spending.',
      toastCanceled:'💰 Resisted! Money saved.',
      toastExported:'📦 Data exported!',toastProOnly:'⭐ Pro feature only',
      toastLimitHit:'🔒 Limit of '+FREE_TIER_LIMIT+' impulses (Free). Upgrade to Pro.',
      toastFillAll:'⚠️ Fill in the name and amount',
      toastStrictOn:'🛡️ Strict mode on',toastStrictOff:'✓ Strict mode off',
      toastPaymentSoon:'💳 Payment coming soon!',
      proTitle:'ImpulseBin Pro',proDesc:'Unlimited impulses and detailed statistics.',
      proFeatures:['✅ Unlimited impulses','✅ Detailed statistics','✅ Advanced JSON export','✅ No ads forever','✅ Premium design'],
      proBuy:'Upgrade to Pro',proClose:'Stay on Free',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Back',
      ariaAdd:'Add impulse',titleExport:'Export',ariaExport:'Export',
      titleArchive:'Archive',ariaArchive:'Archive',ariaBack:'Back',
      titleStats:'Statistics',ariaStats:'Statistics',
      titleAchievements:'Achievements',ariaAchievements:'Achievements',
      delay1h:'1 hr',delay6h:'6 hr',delay24h:'24 hr',delay3d:'3 days',delay7d:'7 days',delay30d:'30 days',
      langSelectorLabel:'Language',strictMode:'Strict Mode',
      strictNotice:'🛡️ Strict mode: skip disabled',
      achievementUnlockedLabel:'🏆 Achievement Unlocked!',achClose:'Awesome! 🎉',
      statsSaved:'Not Spent',statsSpent:'Spent',
      statsSavedSub:'resisted purchases',statsSpentSub:'mindful purchases',
      statsResisted:'resisted',statsPurchased:'purchased',statsTotal:'total',
      statsTime:'Blocking Time',btnExportStats:'Export Statistics',
      titleSettings:'Settings',ariaSettings:'Settings',settingsScreenTitle:'Settings',
      settingsSectionLanguage:'Language',settingsSectionTheme:'Theme',settingsSectionData:'Data',
      themeDark:'Dark',themeLight:'Light',
      settingsResetTitle:'Reset Progress',settingsResetDesc:'Deletes all impulses and saved totals. Achievements stay.',
      btnResetProgress:'Reset All Progress',
      resetConfirmTitle:'Are you sure?',resetConfirmDesc:'This cannot be undone. All active and archived impulses, plus your saved total, will be permanently deleted.',
      btnResetConfirm:'Yes, reset',btnResetCancel:'Keep it',
      toastReset:'🗑️ Progress reset. Clean slate!',
      limitModalTitle:'Limit Reached',limitModalDesc:'Free plan allows '+FREE_TIER_LIMIT+' active impulses. Unlock one more slot for free!',
      btnWatchAd:'▶️ Watch ad (+1 slot)',btnUpgradeFromLimit:'⭐ Go Pro — no limits',
      btnLimitCancel:'Cancel',adLoadingText:'Loading ad...',
      toastAdReward:'🎉 +1 slot unlocked!',limitModalMaxedNote:'Maximum extra slots reached (10/10).',
      secretLockedTitle:'Secret Achievement',secretLockedDesc:'Unlock it to find out',
    },
    pl:{
      heroLabel:'Zaoszczędzono',heroSub:'łącznie',
      statActive:'aktywne',statDone:'kupiono',statCanceled:'zaoszczędzono',
      listTitle:'Moje impulsy',emptyText:'Brak impulsów. Dodaj pierwszy!',
      archiveTitle:'📦 Archiwum',archiveEmpty:'Archiwum jest puste. Tak trzymaj!',
      achievementsTitle:'Osiągnięcia',statsTitle:'Statystyki',
      modalTitle:'Nowy impuls',modalHint:'Opisz, co chcesz kupić, i ustaw pauzę.',
      labelText:'Co chcesz kupić?',labelAmount:'Kwota (zł)',
      labelDelay:'Opóźnienie przed zakupem',placeholderText:'Nowe słuchawki, gra...',
      btnCancel:'Anuluj',btnSave:'Zablokuj 🔒',
      btnComplete:'✓ Kupione',btnSkip:'✗ Odrzuć',
      statusLocked:'🔒 Zablokowane',statusUnlocked:'⚡ Odblokowane',
      statusCompleted:'✅ Kupione',statusCanceled:'💰 Zaoszczędzono',
      timerReady:'⚡ Czas na decyzję!',timerPrefix:'⏳ Pozostało: ',
      timeSuffixD:'d',timeSuffixH:'g',timeSuffixM:'min',timeSuffixS:'s',
      toastCreated:'🔒 Impuls zablokowany!',
      toastCompleted:'✅ Zakup dokonany! Świadoma decyzja.',
      toastCanceled:'💰 Brawo! Pieniądze zaoszczędzone!',
      toastExported:'📦 Dane wyeksportowane!',toastProOnly:'⭐ Tylko Pro',
      toastLimitHit:'🔒 Limit '+FREE_TIER_LIMIT+' impulsów (Free). Przejdź na Pro.',
      toastFillAll:'⚠️ Wypełnij nazwę i kwotę',
      toastStrictOn:'🛡️ Tryb surowy włączony',toastStrictOff:'✓ Tryb surowy wyłączony',
      toastPaymentSoon:'💳 Płatności już wkrótce!',
      proTitle:'ImpulseBin Pro',proDesc:'Nielimitowane impulsy i statystyki.',
      proFeatures:['✅ Nielimitowane impulsy','✅ Szczegółowe statystyki','✅ Zaawansowany eksport','✅ Bez reklam','✅ Premium design'],
      proBuy:'Przejdź na Pro',proClose:'Zostań przy Free',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Wstecz',
      ariaAdd:'Dodaj impuls',titleExport:'Eksport',ariaExport:'Eksport',
      titleArchive:'Archiwum',ariaArchive:'Archiwum',ariaBack:'Wstecz',
      titleStats:'Statystyki',ariaStats:'Statystyki',
      titleAchievements:'Osiągnięcia',ariaAchievements:'Osiągnięcia',
      delay1h:'1 godz',delay6h:'6 godz',delay24h:'24 godz',delay3d:'3 dni',delay7d:'7 dni',delay30d:'30 dni',
      langSelectorLabel:'Język',strictMode:'Tryb surowy',
      strictNotice:'🛡️ Tryb surowy: odrzucenie niedostępne',
      achievementUnlockedLabel:'🏆 Osiągnięcie odblokowane!',achClose:'Świetnie! 🎉',
      statsSaved:'Zaoszczędzono',statsSpent:'Wydano',
      statsSavedSub:'odrzucone zakupy',statsSpentSub:'świadome zakupy',
      statsResisted:'odrzucono',statsPurchased:'kupiono',statsTotal:'łącznie',
      statsTime:'Czas oczekiwania',btnExportStats:'Eksportuj statystyki',
      titleSettings:'Ustawienia',ariaSettings:'Ustawienia',settingsScreenTitle:'Ustawienia',
      settingsSectionLanguage:'Język',settingsSectionTheme:'Motyw',settingsSectionData:'Dane',
      themeDark:'Ciemny',themeLight:'Jasny',
      settingsResetTitle:'Resetuj postęp',settingsResetDesc:'Usuwa wszystkie impulsy i zaoszczędzoną kwotę. Osiągnięcia zostają.',
      btnResetProgress:'Resetuj cały postęp',
      resetConfirmTitle:'Na pewno zresetować?',resetConfirmDesc:'Tej czynności nie można cofnąć. Wszystkie aktywne i zarchiwizowane impulsy oraz zaoszczędzona kwota zostaną trwale usunięte.',
      btnResetConfirm:'Tak, resetuj',btnResetCancel:'Zostaw',
      toastReset:'🗑️ Postęp zresetowany. Czysta karta!',
      limitModalTitle:'Limit osiągnięty',limitModalDesc:'Wersja Free pozwala na '+FREE_TIER_LIMIT+' aktywne impulsy. Odblokuj kolejny slot za darmo!',
      btnWatchAd:'▶️ Obejrzyj reklamę (+1 slot)',btnUpgradeFromLimit:'⭐ Przejdź na Pro — bez limitów',
      btnLimitCancel:'Anuluj',adLoadingText:'Ładowanie reklamy...',
      toastAdReward:'🎉 +1 slot odblokowany!',limitModalMaxedNote:'Osiągnięto maksimum dodatkowych slotów (10/10).',
      secretLockedTitle:'Tajne osiągnięcie',secretLockedDesc:'Odblokuj, aby się dowiedzieć',
    },
    de:{
      heroLabel:'Gespart',heroSub:'insgesamt',
      statActive:'aktiv',statDone:'gekauft',statCanceled:'gespart',
      listTitle:'Meine Impulse',emptyText:'Noch keine Impulse. Füge den ersten hinzu!',
      archiveTitle:'📦 Archiv',archiveEmpty:'Das Archiv ist leer. Weiter so!',
      achievementsTitle:'Erfolge',statsTitle:'Statistik',
      modalTitle:'Neuer Impuls',modalHint:'Beschreibe, was du kaufen möchtest, und lege eine Pause fest.',
      labelText:'Was möchtest du kaufen?',labelAmount:'Betrag (€)',
      labelDelay:'Verzögerung vor dem Kauf',placeholderText:'Neue Kopfhörer, ein Spiel...',
      btnCancel:'Abbrechen',btnSave:'Sperren 🔒',
      btnComplete:'✓ Gekauft',btnSkip:'✗ Verzichten',
      statusLocked:'🔒 Gesperrt',statusUnlocked:'⚡ Entsperrt',
      statusCompleted:'✅ Gekauft',statusCanceled:'💰 Gespart',
      timerReady:'⚡ Bereit zur Entscheidung!',timerPrefix:'⏳ Verbleibend: ',
      timeSuffixD:'T',timeSuffixH:'h',timeSuffixM:'min',timeSuffixS:'s',
      toastCreated:'🔒 Impuls gesperrt!',
      toastCompleted:'✅ Kauf getätigt! Bewusste Entscheidung.',
      toastCanceled:'💰 Super! Geld gespart!',
      toastExported:'📦 Daten exportiert!',toastProOnly:'⭐ Nur Pro',
      toastLimitHit:'🔒 Limit '+FREE_TIER_LIMIT+' Impulse (Free). Upgrade auf Pro.',
      toastFillAll:'⚠️ Bitte Name und Betrag ausfüllen',
      toastStrictOn:'🛡️ Strenger Modus aktiviert',toastStrictOff:'✓ Strenger Modus deaktiviert',
      toastPaymentSoon:'💳 Zahlung kommt bald!',
      proTitle:'ImpulseBin Pro',proDesc:'Unbegrenzte Impulse und detaillierte Statistik.',
      proFeatures:['✅ Unbegrenzte Impulse','✅ Detaillierte Statistik','✅ Erweiterter JSON-Export','✅ Für immer werbefrei','✅ Premium-Design'],
      proBuy:'Auf Pro upgraden',proClose:'Bei Free bleiben',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Zurück',
      ariaAdd:'Impuls hinzufügen',titleExport:'Export',ariaExport:'Export',
      titleArchive:'Archiv',ariaArchive:'Archiv',ariaBack:'Zurück',
      titleStats:'Statistik',ariaStats:'Statistik',
      titleAchievements:'Erfolge',ariaAchievements:'Erfolge',
      delay1h:'1 Std',delay6h:'6 Std',delay24h:'24 Std',delay3d:'3 Tage',delay7d:'7 Tage',delay30d:'30 Tage',
      langSelectorLabel:'Sprache',strictMode:'Strenger Modus',
      strictNotice:'🛡️ Strenger Modus: Verzichten deaktiviert',
      achievementUnlockedLabel:'🏆 Erfolg freigeschaltet!',achClose:'Super! 🎉',
      statsSaved:'Gespart',statsSpent:'Ausgegeben',
      statsSavedSub:'abgelehnte Käufe',statsSpentSub:'bewusste Käufe',
      statsResisted:'abgelehnt',statsPurchased:'gekauft',statsTotal:'gesamt',
      statsTime:'Wartezeit',btnExportStats:'Statistik exportieren',
      titleSettings:'Einstellungen',ariaSettings:'Einstellungen',settingsScreenTitle:'Einstellungen',
      settingsSectionLanguage:'Sprache',settingsSectionTheme:'Design',settingsSectionData:'Daten',
      themeDark:'Dunkel',themeLight:'Hell',
      settingsResetTitle:'Fortschritt zurücksetzen',settingsResetDesc:'Löscht alle Impulse und den gesparten Betrag. Erfolge bleiben erhalten.',
      btnResetProgress:'Gesamten Fortschritt zurücksetzen',
      resetConfirmTitle:'Wirklich zurücksetzen?',resetConfirmDesc:'Dies kann nicht rückgängig gemacht werden. Alle aktiven und archivierten Impulse sowie dein gesparter Betrag werden dauerhaft gelöscht.',
      btnResetConfirm:'Ja, zurücksetzen',btnResetCancel:'Behalten',
      toastReset:'🗑️ Fortschritt zurückgesetzt. Neuanfang!',
      limitModalTitle:'Limit erreicht',limitModalDesc:'Die Free-Version erlaubt '+FREE_TIER_LIMIT+' aktive Impulse. Schalte kostenlos einen weiteren Slot frei!',
      btnWatchAd:'▶️ Werbung ansehen (+1 Slot)',btnUpgradeFromLimit:'⭐ Auf Pro upgraden — ohne Limits',
      btnLimitCancel:'Abbrechen',adLoadingText:'Werbung wird geladen...',
      toastAdReward:'🎉 +1 Slot freigeschaltet!',limitModalMaxedNote:'Maximale Anzahl zusätzlicher Slots erreicht (10/10).',
      secretLockedTitle:'Geheimer Erfolg',secretLockedDesc:'Schalte ihn frei, um es herauszufinden',
    },
    fr:{
      heroLabel:'Économisé',heroSub:'au total',
      statActive:'actifs',statDone:'achetés',statCanceled:'économisés',
      listTitle:'Mes impulsions',emptyText:'Aucune impulsion. Ajoute la première !',
      archiveTitle:'📦 Archives',archiveEmpty:'Les archives sont vides. Continue !',
      achievementsTitle:'Succès',statsTitle:'Statistiques',
      modalTitle:'Nouvelle impulsion',modalHint:"Décris ce que tu veux acheter et fixe une pause.",
      labelText:'Que veux-tu acheter ?',labelAmount:'Montant (€)',
      labelDelay:"Délai avant l'achat",placeholderText:'Nouveau casque, un jeu...',
      btnCancel:'Annuler',btnSave:'Verrouiller 🔒',
      btnComplete:'✓ Acheté',btnSkip:'✗ Renoncer',
      statusLocked:'🔒 Verrouillé',statusUnlocked:'⚡ Déverrouillé',
      statusCompleted:'✅ Acheté',statusCanceled:'💰 Économisé',
      timerReady:'⚡ Prêt à décider !',timerPrefix:'⏳ Restant : ',
      timeSuffixD:'j',timeSuffixH:'h',timeSuffixM:'min',timeSuffixS:'s',
      toastCreated:'🔒 Impulsion verrouillée !',
      toastCompleted:'✅ Achat effectué ! Dépense consciente.',
      toastCanceled:'💰 Bravo ! Argent économisé !',
      toastExported:'📦 Données exportées !',toastProOnly:'⭐ Version Pro uniquement',
      toastLimitHit:'🔒 Limite de '+FREE_TIER_LIMIT+' impulsions (Free). Passe à Pro.',
      toastFillAll:'⚠️ Remplis le nom et le montant',
      toastStrictOn:'🛡️ Mode strict activé',toastStrictOff:'✓ Mode strict désactivé',
      toastPaymentSoon:'💳 Paiement bientôt disponible !',
      proTitle:'ImpulseBin Pro',proDesc:'Impulsions illimitées et statistiques détaillées.',
      proFeatures:["✅ Nombre illimité d'impulsions",'✅ Statistiques détaillées','✅ Export JSON avancé','✅ Sans publicité pour toujours','✅ Design premium'],
      proBuy:'Passer à Pro',proClose:'Rester en Free',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Retour',
      ariaAdd:'Ajouter une impulsion',titleExport:'Exporter',ariaExport:'Exporter',
      titleArchive:'Archives',ariaArchive:'Archives',ariaBack:'Retour',
      titleStats:'Statistiques',ariaStats:'Statistiques',
      titleAchievements:'Succès',ariaAchievements:'Succès',
      delay1h:'1 h',delay6h:'6 h',delay24h:'24 h',delay3d:'3 j',delay7d:'7 j',delay30d:'30 j',
      langSelectorLabel:'Langue',strictMode:'Mode strict',
      strictNotice:'🛡️ Mode strict : abandon désactivé',
      achievementUnlockedLabel:'🏆 Succès débloqué !',achClose:'Super ! 🎉',
      statsSaved:'Économisé',statsSpent:'Dépensé',
      statsSavedSub:'achats refusés',statsSpentSub:'achats conscients',
      statsResisted:'refusés',statsPurchased:'achetés',statsTotal:'total',
      statsTime:"Temps d'attente",btnExportStats:'Exporter les statistiques',
      titleSettings:'Paramètres',ariaSettings:'Paramètres',settingsScreenTitle:'Paramètres',
      settingsSectionLanguage:'Langue',settingsSectionTheme:'Thème',settingsSectionData:'Données',
      themeDark:'Sombre',themeLight:'Clair',
      settingsResetTitle:'Réinitialiser la progression',settingsResetDesc:'Supprime toutes les impulsions et le montant économisé. Les succès restent.',
      btnResetProgress:'Réinitialiser toute la progression',
      resetConfirmTitle:'Vraiment réinitialiser ?',resetConfirmDesc:'Cette action est irréversible. Toutes les impulsions actives et archivées, ainsi que le montant économisé, seront définitivement supprimés.',
      btnResetConfirm:'Oui, réinitialiser',btnResetCancel:'Garder',
      toastReset:'🗑️ Progression réinitialisée. Nouveau départ !',
      limitModalTitle:'Limite atteinte',limitModalDesc:'La version gratuite autorise '+FREE_TIER_LIMIT+' impulsions actives. Débloque un slot de plus gratuitement !',
      btnWatchAd:'▶️ Regarder une pub (+1 slot)',btnUpgradeFromLimit:'⭐ Passer à Pro — sans limites',
      btnLimitCancel:'Annuler',adLoadingText:'Chargement de la pub...',
      toastAdReward:'🎉 +1 slot débloqué !',limitModalMaxedNote:'Nombre maximal de slots supplémentaires atteint (10/10).',
      secretLockedTitle:'Succès secret',secretLockedDesc:'Débloque-le pour le découvrir',
    },
    es:{
      heroLabel:'Ahorrado',heroSub:'en total',
      statActive:'activos',statDone:'comprados',statCanceled:'ahorrados',
      listTitle:'Mis impulsos',emptyText:'Aún no hay impulsos. Añade el primero.',
      archiveTitle:'📦 Archivo',archiveEmpty:'El archivo está vacío. Sigue así.',
      achievementsTitle:'Logros',statsTitle:'Estadísticas',
      modalTitle:'Nuevo impulso',modalHint:'Describe qué quieres comprar y fija una pausa.',
      labelText:'¿Qué quieres comprar?',labelAmount:'Importe (€)',
      labelDelay:'Retraso antes de comprar',placeholderText:'Auriculares nuevos, un juego...',
      btnCancel:'Cancelar',btnSave:'Bloquear 🔒',
      btnComplete:'✓ Comprado',btnSkip:'✗ Renunciar',
      statusLocked:'🔒 Bloqueado',statusUnlocked:'⚡ Desbloqueado',
      statusCompleted:'✅ Comprado',statusCanceled:'💰 Ahorrado',
      timerReady:'⚡ Listo para decidir.',timerPrefix:'⏳ Restante: ',
      timeSuffixD:'d',timeSuffixH:'h',timeSuffixM:'min',timeSuffixS:'s',
      toastCreated:'🔒 Impulso bloqueado.',
      toastCompleted:'✅ Compra realizada. Decisión consciente.',
      toastCanceled:'💰 Resistido. Dinero ahorrado.',
      toastExported:'📦 Datos exportados.',toastProOnly:'⭐ Solo Pro',
      toastLimitHit:'🔒 Límite de '+FREE_TIER_LIMIT+' impulsos (Free). Mejora a Pro.',
      toastFillAll:'⚠️ Completa el nombre y el importe',
      toastStrictOn:'🛡️ Modo estricto activado',toastStrictOff:'✓ Modo estricto desactivado',
      toastPaymentSoon:'💳 Pago disponible pronto.',
      proTitle:'ImpulseBin Pro',proDesc:'Impulsos ilimitados y estadísticas detalladas.',
      proFeatures:['✅ Cantidad ilimitada de impulsos','✅ Estadísticas detalladas','✅ Exportación JSON avanzada','✅ Sin anuncios para siempre','✅ Diseño premium'],
      proBuy:'Mejorar a Pro',proClose:'Seguir en Free',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'Atrás',
      ariaAdd:'Añadir impulso',titleExport:'Exportar',ariaExport:'Exportar',
      titleArchive:'Archivo',ariaArchive:'Archivo',ariaBack:'Atrás',
      titleStats:'Estadísticas',ariaStats:'Estadísticas',
      titleAchievements:'Logros',ariaAchievements:'Logros',
      delay1h:'1 h',delay6h:'6 h',delay24h:'24 h',delay3d:'3 d',delay7d:'7 d',delay30d:'30 d',
      langSelectorLabel:'Idioma',strictMode:'Modo estricto',
      strictNotice:'🛡️ Modo estricto: renunciar desactivado',
      achievementUnlockedLabel:'🏆 Logro desbloqueado.',achClose:'Genial. 🎉',
      statsSaved:'Ahorrado',statsSpent:'Gastado',
      statsSavedSub:'compras rechazadas',statsSpentSub:'compras conscientes',
      statsResisted:'rechazados',statsPurchased:'comprados',statsTotal:'total',
      statsTime:'Tiempo de espera',btnExportStats:'Exportar estadísticas',
      titleSettings:'Ajustes',ariaSettings:'Ajustes',settingsScreenTitle:'Ajustes',
      settingsSectionLanguage:'Idioma',settingsSectionTheme:'Tema',settingsSectionData:'Datos',
      themeDark:'Oscuro',themeLight:'Claro',
      settingsResetTitle:'Reiniciar progreso',settingsResetDesc:'Elimina todos los impulsos y el total ahorrado. Los logros se mantienen.',
      btnResetProgress:'Reiniciar todo el progreso',
      resetConfirmTitle:'¿Seguro que quieres reiniciar?',resetConfirmDesc:'Esta acción no se puede deshacer. Todos los impulsos activos y archivados, así como el total ahorrado, se eliminarán de forma permanente.',
      btnResetConfirm:'Sí, reiniciar',btnResetCancel:'Conservar',
      toastReset:'🗑️ Progreso reiniciado. Tabla rasa.',
      limitModalTitle:'Límite alcanzado',limitModalDesc:'La versión gratuita permite '+FREE_TIER_LIMIT+' impulsos activos. ¡Desbloquea una ranura más gratis!',
      btnWatchAd:'▶️ Ver anuncio (+1 ranura)',btnUpgradeFromLimit:'⭐ Pasar a Pro — sin límites',
      btnLimitCancel:'Cancelar',adLoadingText:'Cargando anuncio...',
      toastAdReward:'🎉 ¡+1 ranura desbloqueada!',limitModalMaxedNote:'Máximo de ranuras adicionales alcanzado (10/10).',
      secretLockedTitle:'Logro secreto',secretLockedDesc:'Desbloquéalo para descubrirlo',
    },
    zh:{
      heroLabel:'已节省',heroSub:'累计',
      statActive:'进行中',statDone:'已购买',statCanceled:'已节省',
      listTitle:'我的冲动',emptyText:'还没有记录，添加第一条！',
      archiveTitle:'📦 归档',archiveEmpty:'归档为空，继续保持！',
      achievementsTitle:'成就',statsTitle:'统计',
      modalTitle:'新的冲动',modalHint:'描述你想购买的东西，设置等待时间。',
      labelText:'你想买什么？',labelAmount:'金额 (¥)',
      labelDelay:'购买前的等待时间',placeholderText:'新耳机、游戏…',
      btnCancel:'取消',btnSave:'锁定 🔒',
      btnComplete:'✓ 已购买',btnSkip:'✗ 放弃',
      statusLocked:'🔒 已锁定',statusUnlocked:'⚡ 已解锁',
      statusCompleted:'✅ 已购买',statusCanceled:'💰 已节省',
      timerReady:'⚡ 可以决定了！',timerPrefix:'⏳ 剩余：',
      timeSuffixD:'天',timeSuffixH:'时',timeSuffixM:'分',timeSuffixS:'秒',
      toastCreated:'🔒 冲动已锁定！',
      toastCompleted:'✅ 购买完成！有意识的消费。',
      toastCanceled:'💰 太棒了！钱已节省！',
      toastExported:'📦 数据已导出！',toastProOnly:'⭐ 仅限 Pro',
      toastLimitHit:'🔒 免费版限制 '+FREE_TIER_LIMIT+' 条。升级到 Pro。',
      toastFillAll:'⚠️ 请填写名称和金额',
      toastStrictOn:'🛡️ 严格模式已启用',toastStrictOff:'✓ 严格模式已关闭',
      toastPaymentSoon:'💳 支付功能即将推出！',
      proTitle:'ImpulseBin Pro',proDesc:'无限记录及详细统计。',
      proFeatures:['✅ 无限数量的记录','✅ 详细统计','✅ 高级 JSON 导出','✅ 永久无广告','✅ 高级设计'],
      proBuy:'升级到 Pro',proClose:'继续使用免费版',
      limitBadge:(u,m)=>u+'/'+m,btnBack:'返回',
      ariaAdd:'添加冲动',titleExport:'导出',ariaExport:'导出',
      titleArchive:'归档',ariaArchive:'归档',ariaBack:'返回',
      titleStats:'统计',ariaStats:'统计',
      titleAchievements:'成就',ariaAchievements:'成就',
      delay1h:'1小时',delay6h:'6小时',delay24h:'24小时',delay3d:'3天',delay7d:'7天',delay30d:'30天',
      langSelectorLabel:'语言',strictMode:'严格模式',
      strictNotice:'🛡️ 严格模式：无法放弃',
      achievementUnlockedLabel:'🏆 成就已解锁！',achClose:'太棒了！🎉',
      statsSaved:'已节省',statsSpent:'已花费',
      statsSavedSub:'拒绝的购物',statsSpentSub:'有意识的购物',
      statsResisted:'已拒绝',statsPurchased:'已购买',statsTotal:'总计',
      statsTime:'等待时间',btnExportStats:'导出统计',
      titleSettings:'设置',ariaSettings:'设置',settingsScreenTitle:'设置',
      settingsSectionLanguage:'语言',settingsSectionTheme:'主题',settingsSectionData:'数据',
      themeDark:'深色',themeLight:'浅色',
      settingsResetTitle:'重置进度',settingsResetDesc:'删除所有冲动记录和已节省金额，成就将被保留。',
      btnResetProgress:'重置全部进度',
      resetConfirmTitle:'确定要重置吗？',resetConfirmDesc:'此操作无法撤销。所有活跃和归档的冲动记录，以及已节省的金额都将被永久删除。',
      btnResetConfirm:'是的，重置',btnResetCancel:'保留',
      toastReset:'🗑️ 进度已重置，全新开始！',
      limitModalTitle:'已达上限',limitModalDesc:'免费版最多可有 '+FREE_TIER_LIMIT+' 条活跃记录。免费解锁一个额外名额！',
      btnWatchAd:'▶️ 观看广告（+1 名额）',btnUpgradeFromLimit:'⭐ 升级到 Pro — 无限制',
      btnLimitCancel:'取消',adLoadingText:'广告加载中...',
      toastAdReward:'🎉 已解锁 +1 名额！',limitModalMaxedNote:'已达额外名额上限（10/10）。',
      secretLockedTitle:'隐藏成就',secretLockedDesc:'解锁后揭晓',
    },
  };

  let lang = (() => {
    try {
      const s = localStorage.getItem(LANG_KEY);
      if (s && T[s]) return s;
      const p = (navigator.language||'').toLowerCase().split('-')[0];
      if (p && T[p]) return p;
    } catch {}
    return 'en';
  })();

  return {
    t(k,...a){ const v=T[lang]?.[k]??T.en?.[k]; return typeof v==='function'?v(...a):(v??k); },
    set(l){ if(T[l]){lang=l;try{localStorage.setItem(LANG_KEY,l);}catch{}} },
    get lang(){return lang;},
  };
})();

/* ══════════════════════════════ 3. CAPACITOR BRIDGE ════════ */
async function haptic(style='light'){
  try{const{Haptics,ImpactStyle}=window.Capacitor?.Plugins??{};
    if(Haptics){const m={light:ImpactStyle.Light,medium:ImpactStyle.Medium,heavy:ImpactStyle.Heavy};
      await Haptics.impact({style:m[style]??ImpactStyle.Light});return;}}catch(_){}
  if(navigator.vibrate)navigator.vibrate(style==='heavy'?80:40);
}
async function initStatusBar(){
  try{const{StatusBar,Style}=window.Capacitor?.Plugins??{};
    if(StatusBar){await StatusBar.setStyle({style:Style.Dark});await StatusBar.setBackgroundColor({color:'#0A0A0A'});}}
  catch(_){}
}

/* ═══════════════════════════════════════ 4. HELPERS ════════ */
const getCurrency = () => CURRENCY_MAP[i18n.lang] || '$';
const toUSD = amt => amt * (USD_RATE[i18n.lang] || 1);

function formatReadableDate(ts) {
  if (!ts) return '';
  const d = new Date(ts), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function formatBlockingDuration(ms) {
  if (ms <= 0) return '0m';
  const tm = Math.floor(ms/60000);
  const d=Math.floor(tm/1440), h=Math.floor((tm%1440)/60), m=tm%60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function formatStatsTime(ms) {
  const sd=i18n.t('timeSuffixD'),sh=i18n.t('timeSuffixH'),sm=i18n.t('timeSuffixM');
  const tm=Math.floor(ms/60000);
  const d=Math.floor(tm/1440),h=Math.floor((tm%1440)/60),m=tm%60;
  if (d>0) return `${d}${sd} ${h}${sh}`;
  if (h>0) return `${h}${sh} ${m}${sm}`;
  return `${m}${sm}`;
}
function formatTimeLeft(ms) {
  if (ms<=0) return i18n.t('timerReady');
  const sd=i18n.t('timeSuffixD'),sh=i18n.t('timeSuffixH'),sm=i18n.t('timeSuffixM'),ss=i18n.t('timeSuffixS');
  const t=Math.ceil(ms/1000);
  const d=Math.floor(t/86400),h=Math.floor((t%86400)/3600),m=Math.floor((t%3600)/60),s=t%60;
  if (d>0) return `${d}${sd} ${h}${sh} ${m}${sm}`;
  if (h>0) return `${h}${sh} ${m}${sm} ${s}${ss}`;
  return `${m}${sm} ${s}${ss}`;
}
const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const setText = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };

/* ════════════════════════════════ 5. STRICT MODE ═══════════ */
let strictMode = (() => { try{return localStorage.getItem(STRICT_KEY)==='true';}catch{return false;} })();

function toggleStrictMode() {
  strictMode = !strictMode;
  try{localStorage.setItem(STRICT_KEY,String(strictMode));}catch{}
  updateStrictBtn();
  haptic(strictMode?'heavy':'light');
  showToast(strictMode?i18n.t('toastStrictOn'):i18n.t('toastStrictOff'), strictMode?'error':'default');
}
function updateStrictBtn() {
  const btn = document.getElementById('btn-strict');
  if(!btn) return;
  btn.classList.toggle('is-active', strictMode);
  btn.setAttribute('aria-pressed', String(strictMode));
}

/* ═══════════════════════════ 5b. THEME ══════════════════════ */
function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  try {
    const { StatusBar, Style } = window.Capacitor?.Plugins ?? {};
    if (StatusBar) {
      StatusBar.setStyle({ style: theme==='light' ? Style.Light : Style.Dark }).catch(()=>{});
      StatusBar.setBackgroundColor({ color: theme==='light' ? '#FBF9F5' : '#0A0A0A' }).catch(()=>{});
    }
  } catch {}
  updateThemeToggleUI(theme);
}
function updateThemeToggleUI(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.classList.toggle('is-light', theme==='light');
  toggle.querySelectorAll('.theme-opt').forEach(b =>
    b.classList.toggle('active', b.dataset.theme===theme));
}
function setTheme(theme) {
  const prev = loadTheme();
  applyTheme(theme);
  if (theme !== prev) {
    haptic('light');
    markThemeChanged();
    checkAchievements();
  }
}

/* ═══════════════════════ 5c. ACHIEVEMENT FLAGS ══════════════ */
/** Misc flags that feed "secret" achievements but don't fit the core
 *  impulses array (theme switches, language exploration, ads, resets). */
function loadFlags() {
  try { return Object.assign({ themeChanged:false, langsUsed:[], adWatched:false, didReset:false }, JSON.parse(localStorage.getItem(FLAGS_KEY)??'{}')); }
  catch { return { themeChanged:false, langsUsed:[], adWatched:false, didReset:false }; }
}
function saveFlags(f) { try { localStorage.setItem(FLAGS_KEY, JSON.stringify(f)); } catch {} }
function markThemeChanged() { const f=loadFlags(); if(!f.themeChanged){ f.themeChanged=true; saveFlags(f); } }
function markLangUsed(lang) {
  const f = loadFlags();
  if (!f.langsUsed.includes(lang)) { f.langsUsed.push(lang); saveFlags(f); }
}
function markAdWatched() { const f=loadFlags(); if(!f.adWatched){ f.adWatched=true; saveFlags(f); } }
function markReset() { const f=loadFlags(); f.didReset=true; saveFlags(f); }

/* ═══════════════════════ 5d. AD-EARNED SLOTS ════════════════ */
const loadExtraSlots = () => { try{return Math.min(MAX_EXTRA_SLOTS, Number(localStorage.getItem(AD_SLOTS_KEY))||0);}catch{return 0;} };
const saveExtraSlots = n => { try{localStorage.setItem(AD_SLOTS_KEY, String(Math.min(MAX_EXTRA_SLOTS, Math.max(0,n))));}catch{} };
const getEffectiveLimit = () => IS_PRO ? Infinity : FREE_TIER_LIMIT + loadExtraSlots();

/* ════════════════════════════════ 6. DATA LAYER ════════════ */
const loadImpulses = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)??'[]');}catch{return[];} };
const saveImpulses = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
const uid = () => Math.random().toString(36).slice(2,12);

/**
 * BUG FIX ✅
 * canceled  = user RESISTED buying → money SAVED  → adds to totalSaved (hero counter)
 * completed = user BOUGHT consciously → money SPENT → adds to totalSpent (stats screen)
 */
function deriveStats(impulses) {
  return impulses.reduce((acc, imp) => {
    const amt = Number(imp.amount) || 0;
    if (imp.status==='locked' || imp.status==='unlocked') acc.active++;
    if (imp.status==='completed') { acc.completed++; acc.totalSpent += amt; }
    if (imp.status==='canceled')  { acc.canceled++;  acc.totalSaved += amt; } // ← fixed
    return acc;
  }, { totalSaved:0, totalSpent:0, active:0, completed:0, canceled:0 });
}
function computeDetailedStats(impulses) {
  const base = deriveStats(impulses);
  /* BUG FIX ✅ — use the REAL moment the user acted (resolvedAt), not the
     original targetTime. Falls back to targetTime for legacy records that
     predate this field, and to createdAt for impulses still locked/unlocked. */
  const totalBlockingMs = impulses.reduce((s,i) => {
    if (i.status==='completed' || i.status==='canceled') {
      const end = i.resolvedAt || i.targetTime;
      return s + Math.max(0, end - i.createdAt);
    }
    return s + Math.max(0, i.targetTime - i.createdAt);
  }, 0);
  return { ...base, totalBlockingMs, totalCount: impulses.length };
}
function setImpulseStatus(id, status) {
  const now = Date.now();
  const list = loadImpulses().map(i => i.id===id
    ? { ...i, status, resolvedAt: (status==='completed'||status==='canceled') ? now : (i.resolvedAt ?? null) }
    : i);
  saveImpulses(list); return list;
}

/* ════════════════════════════════ 7. ACHIEVEMENTS ══════════ */

/** All achievement definitions. title/desc are {lang: string} maps. */
const ACH_DEFS = [
  /* ── Saved (by resisting) ── */
  { id:'save_100',  cat:'saved',    usd:100,  emoji:'🍦',
    title:{uk:'На морозиво!',en:'Ice Cream Time!',pl:'Na loda!',de:'Eis verdient!',fr:'Glace méritée!',es:'Helado ganado.',zh:'买冰淇淋！'},
    desc: {uk:'Ви зберегли $100',en:'You saved $100',pl:'$100 oszczędzone',de:'$100 gespart!',fr:'$100 économisés!',es:'$100 ahorrados.',zh:'节省了$100'} },
  { id:'save_250',  cat:'saved',    usd:250,  emoji:'💪',
    title:{uk:'Знаєш собі ціну!',en:'Know Your Worth!',pl:'Znasz swoją wartość!',de:'Kenne deinen Wert!',fr:'Tu vaux de l\'or!',es:'Sabes lo que vales.',zh:'认识自己的价值！'},
    desc: {uk:'Ви зберегли $250',en:'You saved $250',pl:'$250 oszczędzone',de:'$250 gespart!',fr:'$250 économisés!',es:'$250 ahorrados.',zh:'节省了$250'} },
  { id:'save_500',  cat:'saved',    usd:500,  emoji:'💰',
    title:{uk:'Гроші, гроші, грошики..',en:'Money, Money, Money!',pl:'Pieniądze!',de:'Geld, Geld, Geld!',fr:'L\'argent!',es:'Dinero, dinero.',zh:'钱，钱，钱…'},
    desc: {uk:'Ви зберегли $500',en:'You saved $500',pl:'$500 oszczędzone',de:'$500 gespart!',fr:'$500 économisés!',es:'$500 ahorrados.',zh:'节省了$500'} },
  { id:'save_1000', cat:'saved',    usd:1000, emoji:'🏦',
    title:{uk:'Я скоро стану Банкіром!',en:'Future Banker!',pl:'Będę bankierem!',de:'Zukünftiger Banker!',fr:'Futur banquier!',es:'Futuro banquero.',zh:'未来的银行家！'},
    desc: {uk:'Ви зберегли $1 000',en:'You saved $1,000',pl:'$1 000 oszczędzone',de:'$1.000 gespart!',fr:'$1 000 économisés!',es:'$1.000 ahorrados.',zh:'节省了$1000'} },
  { id:'save_2500', cat:'saved',    usd:2500, emoji:'🚀',
    title:{uk:'Фінансовий геній!',en:'Financial Genius!',pl:'Geniusz finansowy!',de:'Finanzgenie!',fr:'Génie financier!',es:'Genio financiero.',zh:'理财天才！'},
    desc: {uk:'Ви зберегли $2 500',en:'You saved $2,500',pl:'$2 500 oszczędzone',de:'$2.500 gespart!',fr:'$2 500 économisés!',es:'$2.500 ahorrados.',zh:'节省了$2500'} },
  { id:'save_5000', cat:'saved',    usd:5000, emoji:'🏛️',
    title:{uk:'Імперія заощаджень',en:'Savings Empire',pl:'Imperium oszczędności',de:'Sparimperium',fr:"Empire de l'épargne",es:'Imperio del ahorro',zh:'储蓄帝国'},
    desc: {uk:'Ви зберегли $5 000',en:'You saved $5,000',pl:'$5 000 oszczędzone',de:'$5.000 gespart!',fr:'$5 000 économisés!',es:'$5.000 ahorrados.',zh:'节省了$5000'} },
  /* ── Purchased (completed) ── */
  { id:'buy_first', cat:'bought_n', n:1,      emoji:'🛍️',
    title:{uk:'Перша покупка!',en:'First Purchase!',pl:'Pierwszy zakup!',de:'Erster Kauf!',fr:'Premier achat!',es:'Primera compra.',zh:'第一次购买！'},
    desc: {uk:'Перша свідома покупка',en:'Your first mindful purchase',pl:'Twój pierwszy świadomy zakup',de:'Dein erster bewusster Kauf',fr:'Ton premier achat conscient',es:'Tu primera compra consciente.',zh:'你的第一次有意识购买'} },
  { id:'buy_10',    cat:'bought_n', n:10,     emoji:'🎒',
    title:{uk:'Постійний покупець',en:'Regular Buyer',pl:'Stały klient',de:'Stammkäufer',fr:'Acheteur régulier',es:'Comprador habitual.',zh:'常客买家'},
    desc: {uk:'10 свідомих покупок',en:'10 mindful purchases',pl:'10 świadomych zakupów',de:'10 bewusste Käufe',fr:'10 achats conscients',es:'10 compras conscientes.',zh:'10次有意识购买'} },
  { id:'buy_25',    cat:'bought_n', n:25,     emoji:'🏬',
    title:{uk:'Король покупок',en:'Shopping Royalty',pl:'Król zakupów',de:'Einkaufskönig',fr:'Royauté du shopping',es:'Realeza de compras.',zh:'购物之王'},
    desc: {uk:'25 свідомих покупок',en:'25 mindful purchases',pl:'25 świadomych zakupów',de:'25 bewusste Käufe',fr:'25 achats conscients',es:'25 compras conscientes.',zh:'25次有意识购买'} },
  { id:'buy_100',   cat:'spent',    usd:100,  emoji:'🛒',
    title:{uk:'Шопоголік-початківець',en:'Rookie Shopaholic',pl:'Nowicjusz zakupoholik',de:'Anfänger-Shopaholic',fr:'Novice shopaholic',es:'Principiante shopaholic.',zh:'购物新手'},
    desc: {uk:'Витрачено $100 на покупки',en:'Spent $100 on purchases',pl:'$100 wydano',de:'$100 ausgegeben',fr:'$100 dépensés',es:'$100 gastados.',zh:'花了$100'} },
  { id:'buy_500',   cat:'spent',    usd:500,  emoji:'💳',
    title:{uk:'Справжній шопоголік',en:'True Shopaholic',pl:'Prawdziwy zakupoholik',de:'Echter Shopaholic',fr:'Vrai shopaholic',es:'Verdadero shopaholic.',zh:'真正的购物狂'},
    desc: {uk:'Витрачено $500',en:'Spent $500',pl:'$500 wydano',de:'$500 ausgegeben',fr:'$500 dépensés',es:'$500 gastados.',zh:'花了$500'} },
  { id:'buy_1000',  cat:'spent',    usd:1000, emoji:'👑',
    title:{uk:'Майстер трат',en:'Spending Master',pl:'Mistrz wydatków',de:'Ausgabenmeister',fr:'Maître des dépenses',es:'Maestro del gasto.',zh:'花钱大师'},
    desc: {uk:'Витрачено $1 000',en:'Spent $1,000',pl:'$1 000 wydano',de:'$1.000 ausgegeben',fr:'$1 000 dépensés',es:'$1.000 gastados.',zh:'花了$1000'} },
  { id:'buy_2500',  cat:'spent',    usd:2500, emoji:'💎',
    title:{uk:'Колекціонер чеків',en:'Receipt Collector',pl:'Kolekcjoner paragonów',de:'Quittungssammler',fr:'Collectionneur de tickets',es:'Coleccionista de recibos.',zh:'收据收藏家'},
    desc: {uk:'Витрачено $2 500',en:'Spent $2,500',pl:'$2 500 wydano',de:'$2.500 ausgegeben',fr:'$2 500 dépensés',es:'$2.500 gastados.',zh:'花了$2500'} },
  /* ── Resistance count ── */
  { id:'resist_1',  cat:'cancel_n', n:1,      emoji:'🎯',
    title:{uk:'Перший крок!',en:'First Step!',pl:'Pierwszy krok!',de:'Erster Schritt!',fr:'Premier pas!',es:'Primer paso.',zh:'第一步！'},
    desc: {uk:'Перший відмовлений імпульс',en:'First impulse resisted',pl:'Pierwszy impuls pokonany',de:'Erster Widerstand!',fr:'Première impulsion résistée!',es:'Primer impulso resistido.',zh:'抵制了第一次冲动'} },
  { id:'resist_3',  cat:'cancel_n', n:3,      emoji:'🦾',
    title:{uk:'Залізна воля!',en:'Iron Will!',pl:'Żelazna wola!',de:'Eiserner Wille!',fr:'Volonté de fer!',es:'Voluntad de hierro.',zh:'钢铁意志！'},
    desc: {uk:'3 імпульси подолано!',en:'3 impulses resisted!',pl:'3 impulsy pokonane!',de:'3 Impulse widerstanden!',fr:'3 impulsions résistées!',es:'3 impulsos resistidos.',zh:'抵制了3次冲动！'} },
  { id:'resist_10', cat:'cancel_n', n:10,     emoji:'🏆',
    title:{uk:'Чемпіон контролю!',en:'Control Champion!',pl:'Mistrz kontroli!',de:'Kontroll-Champion!',fr:'Champion du contrôle!',es:'Campeón del control.',zh:'自控冠军！'},
    desc: {uk:'10 імпульсів подолано!',en:'10 impulses resisted!',pl:'10 impulsów pokonanych!',de:'10 Impulse widerstanden!',fr:'10 impulsions résistées!',es:'10 impulsos resistidos.',zh:'抵制了10次冲动！'} },
  { id:'resist_25', cat:'cancel_n', n:25,     emoji:'🧠',
    title:{uk:'Майстер розуму!',en:'Mind Master!',pl:'Mistrz umysłu!',de:'Geistesmeister!',fr:'Maître de l\'esprit!',es:'Maestro mental.',zh:'心智大师！'},
    desc: {uk:'25 імпульсів подолано!',en:'25 impulses resisted!',pl:'25 impulsów pokonanych!',de:'25 Impulse widerstanden!',fr:'25 impulsions résistées!',es:'25 impulsos resistidos.',zh:'抵制了25次冲动！'} },
  { id:'resist_50', cat:'cancel_n', n:50,     emoji:'🧘',
    title:{uk:'Дзен-майстер',en:'Zen Master',pl:'Mistrz zen',de:'Zen-Meister',fr:'Maître zen',es:'Maestro zen.',zh:'禅意大师'},
    desc: {uk:'50 імпульсів подолано!',en:'50 impulses resisted!',pl:'50 impulsów pokonanych!',de:'50 Impulse widerstanden!',fr:'50 impulsions résistées!',es:'50 impulsos resistidos.',zh:'抵制了50次冲动！'} },
  /* ── Total created (any status) ── */
  { id:'create_1',  cat:'created_n', n:1,  emoji:'✨',
    title:{uk:'Перша іскра',en:'First Spark',pl:'Pierwsza iskra',de:'Erster Funke',fr:'Première étincelle',es:'Primera chispa.',zh:'第一缕火花'},
    desc: {uk:'Перший заблокований імпульс',en:'Your very first locked impulse',pl:'Twój pierwszy zablokowany impuls',de:'Dein allererster gesperrter Impuls',fr:'Ta toute première impulsion verrouillée',es:'Tu primer impulso bloqueado.',zh:'你的第一个被锁定的冲动'} },
  { id:'create_5',  cat:'created_n', n:5,  emoji:'🔥',
    title:{uk:'Вже не випадковість',en:'No Longer a Fluke',pl:'To już nie przypadek',de:'Kein Zufall mehr',fr:"Plus un hasard",es:'Ya no es casualidad.',zh:'不再是偶然'},
    desc: {uk:'5 імпульсів створено',en:'5 impulses created',pl:'5 impulsów utworzonych',de:'5 Impulse erstellt',fr:'5 impulsions créées',es:'5 impulsos creados.',zh:'创建了5个冲动'} },
  { id:'create_10', cat:'created_n', n:10, emoji:'📋',
    title:{uk:'Звичка формується',en:'Habit in the Making',pl:'Nawyk się kształtuje',de:'Eine Gewohnheit entsteht',fr:'Une habitude se forme',es:'Se está formando un hábito.',zh:'习惯正在养成'},
    desc: {uk:'10 імпульсів створено',en:'10 impulses created',pl:'10 impulsów utworzonych',de:'10 Impulse erstellt',fr:'10 impulsions créées',es:'10 impulsos creados.',zh:'创建了10个冲动'} },
  { id:'create_15', cat:'created_n', n:15, emoji:'🧩',
    title:{uk:'Частина системи',en:'Part of the System',pl:'Część systemu',de:'Teil des Systems',fr:'Partie du système',es:'Parte del sistema.',zh:'系统的一部分'},
    desc: {uk:'15 імпульсів створено',en:'15 impulses created',pl:'15 impulsów utworzonych',de:'15 Impulse erstellt',fr:'15 impulsions créées',es:'15 impulsos creados.',zh:'创建了15个冲动'} },
  { id:'create_20', cat:'created_n', n:20, emoji:'🎓',
    title:{uk:'Досвідчений користувач',en:'Seasoned User',pl:'Doświadczony użytkownik',de:'Erfahrener Nutzer',fr:'Utilisateur expérimenté',es:'Usuario experimentado.',zh:'资深用户'},
    desc: {uk:'20 імпульсів створено',en:'20 impulses created',pl:'20 impulsów utworzonych',de:'20 Impulse erstellt',fr:'20 impulsions créées',es:'20 impulsos creados.',zh:'创建了20个冲动'} },
  { id:'create_25', cat:'created_n', n:25, emoji:'🏅',
    title:{uk:'Чверть сотні!',en:'Quarter Century!',pl:'Ćwierć wieku!',de:'Ein Vierteljahrhundert!',fr:'Quart de siècle!',es:'¡Cuarto de siglo!',zh:'四分之一世纪！'},
    desc: {uk:'25 імпульсів створено',en:'25 impulses created',pl:'25 impulsów utworzonych',de:'25 Impulse erstellt',fr:'25 impulsions créées',es:'25 impulsos creados.',zh:'创建了25个冲动'} },
  { id:'create_30', cat:'created_n', n:30, emoji:'⚙️',
    title:{uk:'На автопілоті',en:'On Autopilot',pl:'Na autopilocie',de:'Auf Autopilot',fr:'En pilote automatique',es:'En piloto automático.',zh:'自动驾驶模式'},
    desc: {uk:'30 імпульсів створено',en:'30 impulses created',pl:'30 impulsów utworzonych',de:'30 Impulse erstellt',fr:'30 impulsions créées',es:'30 impulsos creados.',zh:'创建了30个冲动'} },
  { id:'create_35', cat:'created_n', n:35, emoji:'🛡️',
    title:{uk:'Ветеран контролю',en:'Control Veteran',pl:'Weteran kontroli',de:'Kontroll-Veteran',fr:'Vétéran du contrôle',es:'Veterano del control.',zh:'自控老兵'},
    desc: {uk:'35 імпульсів створено',en:'35 impulses created',pl:'35 impulsów utworzonych',de:'35 Impulse erstellt',fr:'35 impulsions créées',es:'35 impulsos creados.',zh:'创建了35个冲动'} },
  { id:'create_40', cat:'created_n', n:40, emoji:'👔',
    title:{uk:'Володар своїх бажань',en:'Master of Desires',pl:'Władca swoich pragnień',de:'Herr der Wünsche',fr:'Maître de ses désirs',es:'Amo de sus deseos.',zh:'欲望的主人'},
    desc: {uk:'40 імпульсів створено',en:'40 impulses created',pl:'40 impulsów utworzonych',de:'40 Impulse erstellt',fr:'40 impulsions créées',es:'40 impulsos creados.',zh:'创建了40个冲动'} },
  { id:'create_45', cat:'created_n', n:45, emoji:'🌟',
    title:{uk:'Майже легенда',en:'Almost a Legend',pl:'Niemal legenda',de:'Fast eine Legende',fr:'Presque une légende',es:'Casi una leyenda.',zh:'近乎传奇'},
    desc: {uk:'45 імпульсів створено',en:'45 impulses created',pl:'45 impulsów utworzonych',de:'45 Impulse erstellt',fr:'45 impulsions créées',es:'45 impulsos creados.',zh:'创建了45个冲动'} },
  { id:'create_50', cat:'created_n', n:50, emoji:'👑',
    title:{uk:'Легенда ImpulseBin',en:'ImpulseBin Legend',pl:'Legenda ImpulseBin',de:'ImpulseBin-Legende',fr:'Légende ImpulseBin',es:'Leyenda de ImpulseBin.',zh:'ImpulseBin 传奇'},
    desc: {uk:'50 імпульсів створено — справжня легенда',en:'50 impulses created — a true legend',pl:'50 impulsów — prawdziwa legenda',de:'50 Impulse — eine echte Legende',fr:'50 impulsions — une vraie légende',es:'50 impulsos — una verdadera leyenda.',zh:'创建了50个冲动 — 真正的传奇'} },
  /* ── Strict Mode milestone ── */
  { id:'strict_5',  cat:'strict_n', n:5, emoji:'🛡️',
    title:{uk:'Залізна дисципліна',en:'Iron Discipline',pl:'Żelazna dyscyplina',de:'Eiserne Disziplin',fr:'Discipline de fer',es:'Disciplina de hierro.',zh:'铁的纪律'},
    desc: {uk:'5 імпульсів у суворому режимі',en:'5 impulses locked in Strict Mode',pl:'5 impulsów w trybie surowym',de:'5 Impulse im strengen Modus',fr:'5 impulsions en mode strict',es:'5 impulsos en modo estricto.',zh:'5次严格模式锁定'} },
  /* ── Pro incentive ── */
  { id:'go_pro',    cat:'pro',                emoji:'⭐',
    title:{uk:'Обрав найкраще!',en:'Best Choice!',pl:'Najlepszy wybór!',de:'Beste Wahl!',fr:'Meilleur choix!',es:'Mejor elección.',zh:'最佳选择！'},
    desc: {uk:'Ви оновились до Pro!',en:'You upgraded to Pro!',pl:'Uaktualniłeś do Pro!',de:'Auf Pro aufgerüstet!',fr:'Passé à Pro!',es:'Actualizado a Pro.',zh:'升级到了Pro！'} },
  /* ── Secret achievements (hidden until unlocked) ── */
  { id:'secret_theme', cat:'theme_change', secret:true, emoji:'🎨',
    title:{uk:'Новий одяг!',en:'New Outfit!',pl:'Nowy strój!',de:'Neues Outfit!',fr:'Nouvelle tenue!',es:'¡Look nuevo!',zh:'新装扮！'},
    desc: {uk:'Ви вперше перемкнули тему',en:'You switched the theme for the first time',pl:'Pierwsza zmiana motywu',de:'Du hast zum ersten Mal das Design gewechselt',fr:'Tu as changé de thème pour la première fois',es:'Cambiaste el tema por primera vez.',zh:'第一次切换了主题'} },
  { id:'secret_polyglot', cat:'lang_explorer', secret:true, emoji:'🌍',
    title:{uk:'Поліглот',en:'Polyglot',pl:'Poliglota',de:'Polyglott',fr:'Polyglotte',es:'Políglota.',zh:'语言达人'},
    desc: {uk:'Випробував усі 7 мов додатку',en:'Tried all 7 app languages',pl:'Wypróbowałeś wszystkie 7 języków',de:'Alle 7 Sprachen ausprobiert',fr:"Essayé les 7 langues de l'app",es:'Probaste los 7 idiomas.',zh:'尝试了全部7种语言'} },
  { id:'secret_big_dream', cat:'big_dream', usd:1000, secret:true, emoji:'💭',
    title:{uk:'Великі мрії',en:'Big Dreamer',pl:'Wielkie marzenia',de:'Großer Träumer',fr:'Grand rêveur',es:'Gran soñador.',zh:'大梦想家'},
    desc: {uk:'Заблокували імпульс на $1 000+',en:'Locked a single impulse worth $1,000+',pl:'Zablokowano impuls za $1000+',de:'Einen Impuls über $1.000 gesperrt',fr:'Verrouillé une impulsion de $1000+',es:'Bloqueaste un impulso de $1000+.',zh:'锁定了价值$1000+的单笔冲动'} },
  { id:'secret_free_spirit', cat:'free_spirit', secret:true, emoji:'🪶',
    title:{uk:'Вільна душа',en:'Free Spirit',pl:'Wolny duch',de:'Freier Geist',fr:'Esprit libre',es:'Espíritu libre.',zh:'自由灵魂'},
    desc: {uk:'Створили імпульс на $0 — просто щоб відслідкувати бажання',en:'Created a $0 impulse — just to track the urge',pl:'Stworzono impuls za $0',de:'Einen $0-Impuls erstellt',fr:'Créé une impulsion à $0',es:'Creaste un impulso de $0.',zh:'创建了价值$0的冲动'} },
  { id:'secret_first_ad', cat:'ad_watch', secret:true, emoji:'📺',
    title:{uk:'Підтримав розробника',en:'Supported the Dev',pl:'Wsparłeś dewelopera',de:'Entwickler unterstützt',fr:'Soutien au développeur',es:'Apoyaste al desarrollador.',zh:'支持了开发者'},
    desc: {uk:'Переглянули свою першу рекламу',en:'Watched your first rewarded ad',pl:'Obejrzano pierwszą reklamę',de:'Erste Werbung angesehen',fr:'Première pub regardée',es:'Viste tu primer anuncio.',zh:'观看了第一个广告'} },
  { id:'secret_ad_master', cat:'ad_max', secret:true, emoji:'📡',
    title:{uk:'Рекламний магнат',en:'Ad Tycoon',pl:'Reklamowy magnat',de:'Werbe-Tycoon',fr:'Magnat de la pub',es:'Magnate de la publicidad.',zh:'广告大亨'},
    desc: {uk:'Розблокували всі 7 бонусних слотів за рекламу',en:'Unlocked all 7 bonus slots via ads',pl:'Odblokowano wszystkie 7 bonusowych slotów',de:'Alle 7 Bonus-Slots freigeschaltet',fr:'Débloqué les 7 emplacements bonus',es:'Desbloqueaste las 7 ranuras extra.',zh:'解锁了全部7个额外名额'} },
  { id:'secret_night_owl', cat:'night_owl', secret:true, emoji:'🦉',
    title:{uk:'Нічна сова',en:'Night Owl',pl:'Nocna sowa',de:'Nachteule',fr:'Oiseau de nuit',es:'Búho nocturno.',zh:'夜猫子'},
    desc: {uk:'Створили імпульс після півночі',en:'Created an impulse after midnight',pl:'Stworzono impuls po północy',de:'Impuls nach Mitternacht erstellt',fr:'Impulsion créée après minuit',es:'Creaste un impulso después de medianoche.',zh:'在午夜后创建了冲动'} },
  { id:'secret_clean_slate', cat:'reset_progress', secret:true, emoji:'🧹',
    title:{uk:'Чиста сторінка',en:'Clean Slate',pl:'Czysta karta',de:'Neuanfang',fr:'Page blanche',es:'Tabla rasa.',zh:'重新开始'},
    desc: {uk:'Скинули весь прогрес і почали заново',en:'Reset all progress and started fresh',pl:'Zresetowano cały postęp',de:'Den gesamten Fortschritt zurückgesetzt',fr:'Réinitialisé toute la progression',es:'Reiniciaste todo el progreso.',zh:'重置了全部进度'} },
  { id:'secret_completionist', cat:'completionist', secret:true, emoji:'🏆',
    title:{uk:'Колекціонер усього',en:'The Completionist',pl:'Kolekcjoner wszystkiego',de:'Der Komplettierer',fr:'Le complétionniste',es:'El completista.',zh:'全成就收集者'},
    desc: {uk:'Розблокували геть усі інші ачівки',en:'Unlocked every other achievement',pl:'Odblokowano wszystkie pozostałe osiągnięcia',de:'Alle anderen Erfolge freigeschaltet',fr:'Débloqué tous les autres succès',es:'Desbloqueaste todos los demás logros.',zh:'解锁了所有其他成就'} },
];

const loadAchievements  = () => { try{return JSON.parse(localStorage.getItem(ACHIEVE_KEY)??'[]');}catch{return[];} };
const saveAchievements  = arr => localStorage.setItem(ACHIEVE_KEY, JSON.stringify(arr));

/** Extended stats used ONLY for achievement evaluation — merges the core
 *  saved/spent/completed/canceled numbers with secret-achievement signals
 *  (theme, language exploration, ads, strict count, time-of-day, resets). */
function getAchievementStats(impulses) {
  const base  = deriveStats(impulses);
  const flags = loadFlags();
  return {
    ...base,
    total:          impulses.length,
    strictCount:    impulses.filter(i => i.isStrict).length,
    maxAmountUsd:   impulses.length ? Math.max(...impulses.map(i => toUSD(Number(i.amount)||0))) : 0,
    hasFreeImpulse: impulses.some(i => Number(i.amount) === 0),
    hasNightOwl:    impulses.some(i => { const h = new Date(i.createdAt).getHours(); return h >= 0 && h < 5; }),
    themeChanged:   flags.themeChanged,
    langsUsedCount: flags.langsUsed.length,
    adWatched:      flags.adWatched,
    extraSlots:     loadExtraSlots(),
    didReset:       flags.didReset,
  };
}

function isEarned(def, stats) {
  switch(def.cat) {
    case 'saved':          return toUSD(stats.totalSaved) >= def.usd;
    case 'spent':          return toUSD(stats.totalSpent) >= def.usd;
    case 'bought_n':       return stats.completed    >= def.n;
    case 'cancel_n':       return stats.canceled     >= def.n;
    case 'created_n':      return stats.total        >= def.n;
    case 'strict_n':       return stats.strictCount  >= def.n;
    case 'pro':            return IS_PRO;
    case 'theme_change':   return stats.themeChanged;
    case 'lang_explorer':  return stats.langsUsedCount >= 7;
    case 'big_dream':      return stats.maxAmountUsd  >= def.usd;
    case 'free_spirit':    return stats.hasFreeImpulse;
    case 'ad_watch':       return stats.adWatched;
    case 'ad_max':         return stats.extraSlots    >= MAX_EXTRA_SLOTS;
    case 'night_owl':      return stats.hasNightOwl;
    case 'reset_progress': return stats.didReset;
    default:                return false; // 'completionist' is evaluated separately
  }
}

let achQueue = [];
function queueAch(def){ achQueue.push(def); if(achQueue.length===1) showNextAch(); }
function showNextAch(){ if(achQueue.length) showAchModal(achQueue[0]); }

function showAchModal(def) {
  const m = document.getElementById('modal-achievement'); if(!m) return;
  const l = i18n.lang;
  setText('ach-unlock-label', i18n.t('achievementUnlockedLabel'));
  setText('ach-emoji',  def.emoji);
  setText('ach-title',  def.title[l] || def.title.en || '');
  setText('ach-desc',   def.desc[l]  || def.desc.en  || '');
  setText('btn-ach-close', i18n.t('achClose'));
  m.style.display = 'flex';
  haptic('heavy');
}
function closeAchModal() {
  const m = document.getElementById('modal-achievement');
  if(m){ m.style.display='none'; achQueue.shift(); if(achQueue.length) setTimeout(showNextAch,350); }
}

function checkAchievements() {
  const impulses = loadImpulses();
  const stats    = getAchievementStats(impulses);
  const unlocked = loadAchievements();
  const added    = [];
  ACH_DEFS.forEach(d => {
    if (d.cat === 'completionist') return; // evaluated after the main pass
    if (!unlocked.includes(d.id) && isEarned(d, stats)) { unlocked.push(d.id); added.push(d); }
  });
  // Completionist: the meta-achievement, earned once every other one is unlocked
  const meta = ACH_DEFS.find(d => d.cat === 'completionist');
  if (meta && !unlocked.includes(meta.id)) {
    const others = ACH_DEFS.filter(d => d.cat !== 'completionist');
    if (others.every(d => unlocked.includes(d.id))) { unlocked.push(meta.id); added.push(meta); }
  }
  if (added.length) { saveAchievements(unlocked); added.forEach(queueAch); }
  updateAchBadge();
}

function initAchievements() {
  // Silently unlock already-earned achievements at boot (no popups)
  const impulses = loadImpulses();
  const stats    = getAchievementStats(impulses);
  const unlocked = loadAchievements();
  let changed    = false;
  ACH_DEFS.forEach(d => {
    if (d.cat === 'completionist') return;
    if (!unlocked.includes(d.id) && isEarned(d, stats)) { unlocked.push(d.id); changed=true; }
  });
  const meta = ACH_DEFS.find(d => d.cat === 'completionist');
  if (meta && !unlocked.includes(meta.id)) {
    const others = ACH_DEFS.filter(d => d.cat !== 'completionist');
    if (others.every(d => unlocked.includes(d.id))) { unlocked.push(meta.id); changed=true; }
  }
  if (changed) saveAchievements(unlocked);
  updateAchBadge();
}

function updateAchBadge() {
  const el = document.getElementById('ach-count-badge'); if(!el) return;
  const n  = loadAchievements().length;
  el.textContent = `${n}/${ACH_DEFS.length}`;
  el.style.display = n > 0 ? 'inline-flex' : 'none';
}

/* ═══════════════════════════════════ 8. TIMER LOGIC ════════ */
let timerHandle = null;

function updateTimers() {
  const now = Date.now();
  let list = loadImpulses();
  let changed = false;
  list = list.map(i => {
    if (i.status==='locked' && now>=i.targetTime) { changed=true; return {...i, status:'unlocked'}; }
    return i;
  });
  if (changed) { saveImpulses(list); renderList(); updateHeroStats(list); return; }
  list.forEach(i => {
    if (i.status!=='locked' && i.status!=='unlocked') return;
    const el = document.querySelector(`[data-timer="${i.id}"]`); if(!el) return;
    const rem = i.targetTime - now;
    if (i.status==='unlocked' || rem<=0) { el.textContent=i18n.t('timerReady'); el.classList.add('timer-unlocked'); }
    else { el.textContent=i18n.t('timerPrefix')+formatTimeLeft(rem); el.classList.remove('timer-unlocked'); }
  });
}
function startTimerLoop() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(updateTimers, TICK_INTERVAL);
  updateTimers();
}

/* ═══════════════════════════ 9. CARD & RENDER ══════════════ */

function buildCard(imp) {
  const now=Date.now(), rem=imp.targetTime-now;
  const isActive   = imp.status==='locked' || imp.status==='unlocked';
  const isUnlocked = imp.status==='unlocked';
  const card = document.createElement('div');
  card.className = ['impulse-card',`status-${imp.status}`,imp.isStrict?'is-strict':''].filter(Boolean).join(' ');
  card.setAttribute('role','listitem');
  card.dataset.id = imp.id;

  const badge = { locked:i18n.t('statusLocked'), unlocked:i18n.t('statusUnlocked'),
                  completed:i18n.t('statusCompleted'), canceled:i18n.t('statusCanceled') };
  const cls   = { locked:'badge-locked', unlocked:'badge-unlocked',
                  completed:'badge-completed', canceled:'badge-canceled' };
  const timer = imp.status==='unlocked' ? i18n.t('timerReady')
              : imp.status==='locked'   ? i18n.t('timerPrefix')+formatTimeLeft(rem>0?rem:0) : '';
  const amt = `${getCurrency()}${Number(imp.amount).toLocaleString(LOCALE_MAP[i18n.lang]||'en-US')}`;
  const tag = imp.isStrict ? '<span class="strict-tag" aria-label="Strict">🛡️</span>' : '';

  card.innerHTML = `
    <div class="card-top">
      <div class="card-info">
        <div class="card-text">${escHtml(imp.text)}${tag}</div>
        <div class="card-amount">${amt}</div>
      </div>
      <span class="card-status-badge ${cls[imp.status]??''}">${badge[imp.status]??imp.status}</span>
    </div>
    ${isActive ? `
    <div class="card-timer">
      <span data-timer="${imp.id}" class="${isUnlocked?'timer-unlocked':''}">${timer}</span>
    </div>
    <div class="card-actions">
      <button class="btn-success btn-do" data-action="complete" data-id="${imp.id}"
              ${isUnlocked?'':'disabled'} aria-label="${i18n.t('btnComplete')}"
      >${i18n.t('btnComplete')}</button>
      ${!imp.isStrict ? `<button class="btn-danger btn-skip" data-action="cancel" data-id="${imp.id}"
              aria-label="${i18n.t('btnSkip')}">${i18n.t('btnSkip')}</button>` : ''}
    </div>` : ''}`;
  return card;
}

function renderList() {
  const impulses = loadImpulses();
  const listEl   = document.getElementById('impulse-list');
  const emptyEl  = document.getElementById('empty-state');
  const active   = impulses.filter(i => i.status==='locked' || i.status==='unlocked');
  if (!listEl) return;
  if (active.length === 0) { listEl.innerHTML=''; emptyEl.style.display='flex'; updateHeroStats(impulses); return; }
  emptyEl.style.display = 'none';
  // Reconcile — only rebuild when card fingerprints change
  const fp = i => i.id + '|' + ['impulse-card',`status-${i.status}`,i.isStrict?'is-strict':''].filter(Boolean).join(' ');
  const cur = [...listEl.querySelectorAll('.impulse-card')].map(el => el.dataset.id+'|'+el.className.trim());
  const req = active.map(fp);
  if (JSON.stringify(cur) === JSON.stringify(req)) return;
  const frag = document.createDocumentFragment();
  active.forEach(i => frag.appendChild(buildCard(i)));
  listEl.replaceChildren(frag);
  updateHeroStats(impulses);
}

function renderArchive() {
  const impulses = loadImpulses();
  const listEl   = document.getElementById('archive-list');
  const emptyEl  = document.getElementById('archive-empty');
  const arch     = impulses.filter(i => i.status==='completed'||i.status==='canceled').reverse();
  if (!listEl) return;
  if (arch.length === 0) { listEl.innerHTML=''; emptyEl.style.display='flex'; return; }
  emptyEl.style.display = 'none';
  const frag = document.createDocumentFragment();
  arch.forEach(i => frag.appendChild(buildCard(i)));
  listEl.replaceChildren(frag);
}

function renderAchievementsScreen() {
  const listEl   = document.getElementById('achievements-list'); if(!listEl) return;
  const unlocked = loadAchievements();
  const l        = i18n.lang;
  const frag     = document.createDocumentFragment();
  ACH_DEFS.forEach(def => {
    const isU       = unlocked.includes(def.id);
    const isHidden  = !isU && def.secret; // secret + locked → fully mystery
    const div = document.createElement('div');
    div.className = `ach-card${isU?' unlocked':''}${isHidden?' is-secret':''}`;
    div.setAttribute('role','listitem');
    const titleHtml = isU ? escHtml(def.title[l]||def.title.en||'')
                          : (isHidden ? i18n.t('secretLockedTitle') : escHtml(def.title[l]||def.title.en||''));
    const descHtml  = isU ? escHtml(def.desc[l]||def.desc.en||'')
                          : (isHidden ? i18n.t('secretLockedDesc') : '???');
    div.innerHTML = `
      <div class="ach-card-emoji">${isU ? def.emoji : (isHidden ? '❔' : '🔒')}</div>
      <div class="ach-card-title">${titleHtml}</div>
      <div class="ach-card-desc">${descHtml}</div>
      ${isU ? '<div class="ach-card-check">✓</div>' : ''}`;
    frag.appendChild(div);
  });
  listEl.replaceChildren(frag);
}

function renderStatsScreen() {
  const impulses = loadImpulses();
  const stats    = computeDetailedStats(impulses);
  const cur      = getCurrency();
  const locale   = LOCALE_MAP[i18n.lang]||'en-US';
  setText('stat-total-saved',   `${cur}${stats.totalSaved.toLocaleString(locale)}`);
  setText('stat-total-spent',   `${cur}${stats.totalSpent.toLocaleString(locale)}`);
  setText('stat-blocking-time', stats.totalBlockingMs>0 ? formatStatsTime(stats.totalBlockingMs) : '—');
  setText('stat-resisted',  stats.canceled);
  setText('stat-purchased', stats.completed);
  setText('stat-total',     stats.totalCount);
}

function updateHeroStats(impulses) {
  const stats  = deriveStats(impulses);
  const cur    = getCurrency();
  const locale = LOCALE_MAP[i18n.lang]||'en-US';
  const heroEl = document.getElementById('hero-amount');
  if (heroEl) heroEl.textContent = `${cur}${stats.totalSaved.toLocaleString(locale)}`;
  const el = id => document.getElementById(id);
  if (el('stat-active'))   el('stat-active').textContent   = stats.active;
  if (el('stat-done'))     el('stat-done').textContent     = stats.completed;
  if (el('stat-canceled')) el('stat-canceled').textContent = stats.canceled;
  updateLimitBadge(impulses);
}

function updateLimitBadge(impulses) {
  const el   = document.getElementById('limit-badge');
  const prEl = document.getElementById('pro-badge');
  if (!el) return;
  const n = impulses.filter(i => i.status==='locked'||i.status==='unlocked').length;
  if (IS_PRO) { el.textContent=''; if(prEl) prEl.style.display='inline-flex'; }
  else { el.textContent=i18n.t('limitBadge', n, getEffectiveLimit()); if(prEl) prEl.style.display='none'; }
}

/* ════════════════════════════════ 10. ACTIONS ══════════════ */

function createImpulse({text, amount, hours}) {
  const impulses = loadImpulses();
  const active   = impulses.filter(i => i.status==='locked'||i.status==='unlocked').length;
  if (!IS_PRO && active >= getEffectiveLimit()) { showToast(i18n.t('toastLimitHit'),'error'); showLimitModal(); return false; }
  const now = Date.now();
  impulses.push({ id:uid(), text:text.trim(), amount:Number(amount)||0,
    createdAt:now, targetTime:now+hours*3_600_000, resolvedAt:null,
    status:'locked', isStrict:strictMode });
  saveImpulses(impulses);
  renderList();
  showToast(i18n.t('toastCreated'), 'gold');
  checkAchievements(); // created_n / free_spirit / big_dream / night_owl / strict_n
  return true;
}

function completeImpulse(id) {
  const list = setImpulseStatus(id, 'completed');
  renderList(); updateHeroStats(list);
  showToast(i18n.t('toastCompleted'), 'success');
  checkAchievements(); // triggers achievement popup if milestone reached
}

function cancelImpulse(id) {
  const list = setImpulseStatus(id, 'canceled');
  renderList(); updateHeroStats(list);
  showToast(i18n.t('toastCanceled'), 'gold');
  checkAchievements(); // money saved → may unlock saving achievements
}

function triggerDownload(content, mime, filename) {
  const blob = new Blob([content],{type:mime+';charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'),{href:url, download:filename});
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportData() {
  if (!IS_PRO) { showToast(i18n.t('toastProOnly'),'error'); haptic('medium'); showProModal(); return; }
  const cur = getCurrency();
  const payload = {
    exportedAt: formatReadableDate(Date.now()), version: 3,
    impulses: loadImpulses().map(i => ({
      id:i.id, text:i.text, amount:i.amount, currency:cur,
      status:i.status, isStrict:i.isStrict,
      created:  formatReadableDate(i.createdAt),
      unlockTime: formatReadableDate(i.targetTime),
      resolved: i.resolvedAt ? formatReadableDate(i.resolvedAt) : null,
      blockingDuration: formatBlockingDuration((i.resolvedAt || i.targetTime) - i.createdAt),
    })),
  };
  triggerDownload(JSON.stringify(payload,null,2),'application/json',`impulsebin-${Date.now()}.json`);
  showToast(i18n.t('toastExported'),'success'); haptic('light');
}

function exportDetailedStats() {
  const impulses = loadImpulses();
  const stats    = computeDetailedStats(impulses);
  const cur      = getCurrency();
  const locale   = LOCALE_MAP[i18n.lang]||'en-US';
  const payload  = {
    exportedAt: formatReadableDate(Date.now()), version: 3,
    summary: {
      totalSaved:       `${stats.totalSaved.toLocaleString(locale)} ${cur}`,
      totalSpent:       `${stats.totalSpent.toLocaleString(locale)} ${cur}`,
      resisted:         stats.canceled,
      purchased:        stats.completed,
      total:            stats.totalCount,
      totalBlockingTime: formatBlockingDuration(stats.totalBlockingMs),
    },
    achievements: loadAchievements(),
    impulses: impulses.map(i => ({
      id:i.id, text:i.text, amount:i.amount, currency:cur,
      status:i.status, isStrict:i.isStrict,
      created:  formatReadableDate(i.createdAt),
      unlockTime: formatReadableDate(i.targetTime),
      resolved: i.resolvedAt ? formatReadableDate(i.resolvedAt) : null,
      blockingDuration: formatBlockingDuration((i.resolvedAt || i.targetTime) - i.createdAt),
    })),
  };
  triggerDownload(JSON.stringify(payload,null,2),'application/json',`impulsebin-stats-${Date.now()}.json`);
  showToast(i18n.t('toastExported'),'success'); haptic('light');
}

/* ══════════════════════════════ 11. UI HELPERS ══════════════ */

let selectedDelay = 1;

function toggleAddModal(show) {
  const m = document.getElementById('modal-add'); if(!m) return;
  if (show) {
    resetForm();
    const n = document.getElementById('strict-notice');
    if (n) n.style.display = strictMode ? 'flex' : 'none';
    m.style.display = 'flex';
    requestAnimationFrame(() => document.getElementById('input-text')?.focus());
  } else { m.style.display = 'none'; }
}
function resetForm() {
  const t=document.getElementById('input-text'), a=document.getElementById('input-amount');
  if(t) t.value=''; if(a) a.value='';
  selectedDelay = 1;
  document.querySelectorAll('.delay-chip').forEach(c => c.classList.toggle('active', Number(c.dataset.hours)===1));
}
const showProModal = () => { const m=document.getElementById('modal-pro'); if(m) m.style.display='flex'; };
const hideProModal = () => { const m=document.getElementById('modal-pro'); if(m) m.style.display='none'; };

/* ── Limit reached → Watch Ad / Go Pro choice ── */
function showLimitModal() {
  const m = document.getElementById('modal-limit'); if (!m) return;
  const maxed = loadExtraSlots() >= MAX_EXTRA_SLOTS;
  const adBtn = document.getElementById('btn-watch-ad');
  const note  = document.getElementById('limit-maxed-note');
  if (adBtn) adBtn.style.display = maxed ? 'none'  : 'flex';
  if (note)  note.style.display  = maxed ? 'block' : 'none';
  m.style.display = 'flex';
}
const hideLimitModal = () => { const m=document.getElementById('modal-limit'); if(m) m.style.display='none'; };

/**
 * ── REWARDED AD STUB (AdMob) ─────────────────────────────────
 * Real integration (commented — requires native build, not just web):
 *
 *   npm install @capacitor-community/admob
 *   npx cap sync
 *
 *   import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
 *   await AdMob.initialize({ requestTrackingAuthorization: true });
 *   await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-XXXXXXX/YYYYYYY' });
 *   AdMob.addListener(RewardAdPluginEvents.Rewarded, () => grantExtraSlot());
 *   await AdMob.showRewardVideoAd();
 *
 * Below: a timeout-based stand-in for that flow (load → reward → UI
 * update) so the rest of the app can be built/tested without the
 * native plugin wired in yet.
 */
let adLoading = false;
function showRewardedAd() {
  if (adLoading) return;
  const extra = loadExtraSlots();
  if (extra >= MAX_EXTRA_SLOTS) { hideLimitModal(); showProModal(); return; }

  adLoading = true;
  const btn = document.getElementById('btn-watch-ad');
  if (btn) btn.disabled = true;
  haptic('light');
  showToast(i18n.t('adLoadingText'), 'default', 2200);

  setTimeout(() => {
    /* ---- in production this body runs inside the Rewarded listener ---- */
    saveExtraSlots(extra + 1);
    markAdWatched();
    adLoading = false;
    if (btn) btn.disabled = false;
    hideLimitModal();
    showToast(i18n.t('toastAdReward'), 'success');
    haptic('heavy');
    updateLimitBadge(loadImpulses());
    checkAchievements(); // secret_first_ad / secret_ad_master
  }, 1800);
}

/* ── Reset all progress ── */
const showResetConfirm = () => { const m=document.getElementById('modal-reset-confirm'); if(m) m.style.display='flex'; };
const hideResetConfirm = () => { const m=document.getElementById('modal-reset-confirm'); if(m) m.style.display='none'; };

function resetProgress() {
  saveImpulses([]);
  saveExtraSlots(0);
  markReset();
  hideResetConfirm();
  renderList();
  updateHeroStats([]);
  showToast(i18n.t('toastReset'), 'gold');
  haptic('heavy');
  checkAchievements(); // secret_clean_slate
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id===`screen-${name}`));
  if (name==='archive')      renderArchive();
  if (name==='achievements') renderAchievementsScreen();
  if (name==='stats')        renderStatsScreen();
  if (name==='settings')     updateThemeToggleUI(loadTheme());
}

let toastTimer = null;
function showToast(msg, type='default', dur=2600) {
  const el = document.getElementById('toast'); if(!el) return;
  el.textContent = msg;
  el.className   = `toast${type!=='default'?' toast-'+type:''} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}

/* ════════════════════════════ 12. TRANSLATIONS ═════════════ */

function applyStaticTranslations() {
  document.documentElement.lang = i18n.lang;

  const setBtn = (id,t,a) => { const b=document.getElementById(id); if(b){b.setAttribute('title',t);b.setAttribute('aria-label',a);} };
  setBtn('btn-export',       i18n.t('titleExport'),       i18n.t('ariaExport'));
  setBtn('btn-archive',      i18n.t('titleArchive'),      i18n.t('ariaArchive'));
  setBtn('btn-strict',       i18n.t('strictMode'),        i18n.t('strictMode'));
  setBtn('btn-achievements', i18n.t('titleAchievements'), i18n.t('ariaAchievements'));
  setBtn('btn-stats',        i18n.t('titleStats'),        i18n.t('ariaStats'));
  const addBtn = document.getElementById('btn-add');
  if (addBtn) addBtn.setAttribute('aria-label', i18n.t('ariaAdd'));

  setText('hero-label', i18n.t('heroLabel'));
  setText('hero-sub',   i18n.t('heroSub'));

  setText('stat-active-label',   i18n.t('statActive'));
  setText('stat-done-label',     i18n.t('statDone'));
  setText('stat-canceled-label', i18n.t('statCanceled'));

  setText('btn-ach-label',   i18n.t('achievementsTitle'));
  setText('btn-stats-label', i18n.t('statsTitle'));

  setText('list-title-active', i18n.t('listTitle'));
  setText('empty-text',        i18n.t('emptyText'));

  setText('archive-title',      i18n.t('archiveTitle'));
  setText('archive-empty-text', i18n.t('archiveEmpty'));
  setText('btn-back-label',     i18n.t('btnBack'));
  const bba = document.getElementById('btn-back-archive');
  if (bba) bba.setAttribute('aria-label', i18n.t('ariaBack'));

  setText('achievements-screen-title', i18n.t('achievementsTitle'));

  setText('stats-screen-title',    i18n.t('statsTitle'));
  setText('stats-label-saved',     i18n.t('statsSaved'));
  setText('stats-label-saved-sub', i18n.t('statsSavedSub'));
  setText('stats-label-spent',     i18n.t('statsSpent'));
  setText('stats-label-spent-sub', i18n.t('statsSpentSub'));
  setText('stats-label-resisted',  i18n.t('statsResisted'));
  setText('stats-label-purchased', i18n.t('statsPurchased'));
  setText('stats-label-total',     i18n.t('statsTotal'));
  setText('stats-label-time',      i18n.t('statsTime'));
  setText('btn-export-stats-label',i18n.t('btnExportStats'));

  setText('modal-title',       i18n.t('modalTitle'));
  setText('modal-hint',        i18n.t('modalHint'));
  setText('label-text',        i18n.t('labelText'));
  setText('label-amount',      i18n.t('labelAmount'));
  setText('label-delay',       i18n.t('labelDelay'));
  setText('strict-notice-text',i18n.t('strictNotice'));
  const inp = document.getElementById('input-text');
  if (inp) inp.setAttribute('placeholder', i18n.t('placeholderText'));

  setText('delay-1h',   i18n.t('delay1h'));  setText('delay-6h',   i18n.t('delay6h'));
  setText('delay-24h',  i18n.t('delay24h')); setText('delay-72h',  i18n.t('delay3d'));
  setText('delay-168h', i18n.t('delay7d'));  setText('delay-720h', i18n.t('delay30d'));
  setText('btn-cancel-modal', i18n.t('btnCancel'));
  setText('btn-save-impulse', i18n.t('btnSave'));

  setText('pro-title', i18n.t('proTitle'));
  setText('pro-desc',  i18n.t('proDesc'));
  const pf = document.getElementById('pro-features');
  if (pf) pf.innerHTML = i18n.t('proFeatures').map(f=>`<li>${escHtml(f)}</li>`).join('');
  setText('btn-pro-buy',   i18n.t('proBuy'));
  setText('btn-pro-close', i18n.t('proClose'));

  const ls = document.getElementById('lang-select');
  if (ls) ls.setAttribute('aria-label', i18n.t('langSelectorLabel'));

  // Settings screen
  setBtn('btn-settings', i18n.t('titleSettings'), i18n.t('ariaSettings'));
  setText('settings-screen-title',     i18n.t('settingsScreenTitle'));
  setText('settings-section-language', i18n.t('settingsSectionLanguage'));
  setText('settings-section-theme',    i18n.t('settingsSectionTheme'));
  setText('settings-section-data',     i18n.t('settingsSectionData'));
  setText('theme-label-dark',  i18n.t('themeDark'));
  setText('theme-label-light', i18n.t('themeLight'));
  setText('settings-reset-title', i18n.t('settingsResetTitle'));
  setText('settings-reset-desc',  i18n.t('settingsResetDesc'));
  setText('btn-reset-progress-label', i18n.t('btnResetProgress'));

  // Reset confirmation modal
  setText('reset-confirm-title', i18n.t('resetConfirmTitle'));
  setText('reset-confirm-desc',  i18n.t('resetConfirmDesc'));
  setText('btn-reset-confirm',   i18n.t('btnResetConfirm'));
  setText('btn-reset-cancel',    i18n.t('btnResetCancel'));

  // Limit / rewarded-ad modal
  setText('limit-modal-title', i18n.t('limitModalTitle'));
  setText('limit-modal-desc',  i18n.t('limitModalDesc'));
  setText('btn-watch-ad-label',     i18n.t('btnWatchAd'));
  setText('btn-limit-upgrade-label',i18n.t('btnUpgradeFromLimit'));
  setText('btn-limit-cancel',       i18n.t('btnLimitCancel'));
  setText('limit-maxed-note',       i18n.t('limitModalMaxedNote'));
}

/* ═══════════════════════════ 13. PULL-TO-REFRESH ═══════════ */

function preventPullToRefresh() {
  let startY = 0;
  document.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, {passive:true});
  document.addEventListener('touchmove', e => {
    if (e.target.closest('.modal-sheet,.impulse-list,.achievements-grid,.stats-content,.screen')) return;
    const top = document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (top===0 && e.touches[0].clientY > startY) e.preventDefault();
  }, {passive:false});
}

/* ══════════════════════════════ 14. EVENT WIRING ═══════════ */

function wireEvents() {

  // Strict mode
  document.getElementById('btn-strict')?.addEventListener('click', () => toggleStrictMode());

  // Language
  document.getElementById('lang-select')?.addEventListener('change', e => {
    haptic('light');
    i18n.set(e.target.value);
    markLangUsed(e.target.value);
    applyStaticTranslations();
    renderList();
    updateHeroStats(loadImpulses());
    if (document.getElementById('screen-archive')?.classList.contains('active'))      renderArchive();
    if (document.getElementById('screen-achievements')?.classList.contains('active')) renderAchievementsScreen();
    if (document.getElementById('screen-stats')?.classList.contains('active'))        renderStatsScreen();
    checkAchievements(); // secret_polyglot
  });

  // FAB — add impulse
  document.getElementById('btn-add')?.addEventListener('click', () => {
    haptic('light');
    const n = loadImpulses().filter(i => i.status==='locked'||i.status==='unlocked').length;
    if (!IS_PRO && n >= getEffectiveLimit()) { showToast(i18n.t('toastLimitHit'),'error'); showLimitModal(); return; }
    toggleAddModal(true);
  });

  // Delay chips
  document.querySelectorAll('.delay-chip').forEach(c => c.addEventListener('click', () => {
    haptic('light');
    selectedDelay = Number(c.dataset.hours);
    document.querySelectorAll('.delay-chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  }));

  // Save impulse
  document.getElementById('btn-save-impulse')?.addEventListener('click', () => {
    haptic('medium');
    const text   = document.getElementById('input-text')?.value.trim()  ?? '';
    const amount = document.getElementById('input-amount')?.value        ?? '';
    if (!text || !amount) { showToast(i18n.t('toastFillAll'),'error'); haptic('heavy'); return; }
    if (createImpulse({text, amount:Number(amount), hours:selectedDelay})) toggleAddModal(false);
  });

  // Cancel modal
  document.getElementById('btn-cancel-modal')?.addEventListener('click', () => { haptic('light'); toggleAddModal(false); });

  // Click overlay to close modals
  document.getElementById('modal-add')?.addEventListener('click', e => { if(e.target===e.currentTarget){haptic('light');toggleAddModal(false);} });
  document.getElementById('modal-pro')?.addEventListener('click', e => { if(e.target===e.currentTarget) hideProModal(); });

  // Export (header, Pro only)
  document.getElementById('btn-export')?.addEventListener('click', () => { haptic('light'); exportData(); });

  // Archive navigation
  document.getElementById('btn-archive')?.addEventListener('click', () => { haptic('light'); showScreen('archive'); });
  document.getElementById('btn-back-archive')?.addEventListener('click', () => { haptic('light'); showScreen('main'); });

  // Achievements navigation
  document.getElementById('btn-achievements')?.addEventListener('click', () => { haptic('light'); showScreen('achievements'); });
  document.getElementById('btn-back-achievements')?.addEventListener('click', () => { haptic('light'); showScreen('main'); });

  // Settings navigation
  document.getElementById('btn-settings')?.addEventListener('click', () => { haptic('light'); showScreen('settings'); });
  document.getElementById('btn-back-settings')?.addEventListener('click', () => { haptic('light'); showScreen('main'); });

  // Theme toggle (Dark / Light)
  document.querySelectorAll('.theme-opt').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));

  // Reset progress
  document.getElementById('btn-reset-progress')?.addEventListener('click', () => { haptic('medium'); showResetConfirm(); });
  document.getElementById('btn-reset-confirm')?.addEventListener('click', () => resetProgress());
  document.getElementById('btn-reset-cancel')?.addEventListener('click', () => { haptic('light'); hideResetConfirm(); });
  document.getElementById('modal-reset-confirm')?.addEventListener('click', e => { if(e.target===e.currentTarget) hideResetConfirm(); });

  // Limit reached → Watch Ad / Go Pro
  document.getElementById('btn-watch-ad')?.addEventListener('click', () => showRewardedAd());
  document.getElementById('btn-limit-upgrade')?.addEventListener('click', () => { hideLimitModal(); showProModal(); });
  document.getElementById('btn-limit-cancel')?.addEventListener('click', () => { haptic('light'); hideLimitModal(); });
  document.getElementById('modal-limit')?.addEventListener('click', e => { if(e.target===e.currentTarget) hideLimitModal(); });

  // Statistics navigation (Pro-only)
  document.getElementById('btn-stats')?.addEventListener('click', () => {
    haptic('light');
    if (!IS_PRO) { showToast(i18n.t('toastProOnly'),'error'); showProModal(); return; }
    showScreen('stats');
  });
  document.getElementById('btn-back-stats')?.addEventListener('click', () => { haptic('light'); showScreen('main'); });

  // Export detailed stats (stats screen)
  document.getElementById('btn-stats-export')?.addEventListener('click', () => { haptic('light'); exportDetailedStats(); });

  // Achievement modal close
  document.getElementById('btn-ach-close')?.addEventListener('click', () => { haptic('light'); closeAchModal(); });
  document.getElementById('modal-achievement')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeAchModal(); });

  // Pro modal buttons
  document.getElementById('btn-pro-buy')?.addEventListener('click', () => { haptic('medium'); showToast(i18n.t('toastPaymentSoon'),'gold'); hideProModal(); });
  document.getElementById('btn-pro-close')?.addEventListener('click', () => { haptic('light'); hideProModal(); });

  // Card actions (event delegation)
  document.getElementById('impulse-list')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const {action, id} = btn.dataset; if (!id) return;
    if (action==='complete') { haptic('medium'); completeImpulse(id); }
    else if (action==='cancel') { haptic('light'); cancelImpulse(id); }
  });

  // Keyboard shortcuts in modal
  document.getElementById('modal-add')?.addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) document.getElementById('btn-save-impulse')?.click();
    if (e.key==='Escape') toggleAddModal(false);
  });
}

/* ════════════════════════════════ 15. BOOTSTRAP ════════════ */

function bootstrap() {
  preventPullToRefresh();
  applyTheme(loadTheme()); // also sets native StatusBar style/color for the active theme

  // Apply Pro styling class to body
  document.body.classList.toggle('is-pro', IS_PRO);

  // Restore language
  const ls = document.getElementById('lang-select');
  if (ls) ls.value = i18n.lang;
  markLangUsed(i18n.lang);
  applyStaticTranslations();

  // Restore strict mode button
  updateStrictBtn();

  // Render initial UI
  const impulses = loadImpulses();
  renderList();
  updateHeroStats(impulses);

  // Silently unlock past achievements (no popups)
  initAchievements();

  // Wire all events
  wireEvents();

  // Start timer loop
  startTimerLoop();

  console.log('[ImpulseBin] v4.0 ready — IS_PRO:', IS_PRO, '| lang:', i18n.lang, '| theme:', loadTheme(), '| strict:', strictMode);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
