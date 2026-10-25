// Hält statisch gebaute Terminlisten ohne neuen Build aktuell. Erwartetes Markup:
//
//   [data-event-list]            Container; optional data-limit, data-hide-when-empty="true"
//     [data-event-items]         Liste (wird ausgeblendet, wenn leer)
//       [data-event-end]         Termin; Wert = Ablaufzeitpunkt in ms (UTC), dazu data-event-date
//         [data-event-today]     Hinweis „Heute“, nur am Termintag sichtbar
//     [data-event-empty]         Hinweis, wenn kein Termin mehr ansteht
//     [data-event-more]          Link zur Übersicht, wenn mehr Termine als das Limit anstehen
//   [data-show-after]            Beliebiges Element, sichtbar ab dem angegebenen Zeitpunkt (ms)
//
// Abgelaufene Termine werden entfernt, die nächsten rücken bis zum Limit nach. Verglichen werden
// absolute Zeitpunkte; nur „Heute“ braucht den Kalendertag in deutscher Zeit.

const berlinToday = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function refreshEventLists() {
  const now = Date.now();
  const today = berlinToday.format(new Date(now));

  document.querySelectorAll<HTMLElement>('[data-event-list]').forEach((list) => {
    const limit = Number(list.dataset.limit) || Number.POSITIVE_INFINITY;
    let remaining = 0;

    list.querySelectorAll<HTMLElement>('[data-event-end]').forEach((item) => {
      if (Number(item.dataset.eventEnd) <= now) {
        item.remove();
        return;
      }
      item.hidden = remaining >= limit;
      remaining += 1;

      const todayBadge = item.querySelector<HTMLElement>('[data-event-today]');
      if (todayBadge) todayBadge.hidden = item.dataset.eventDate !== today;
    });

    const items = list.querySelector<HTMLElement>('[data-event-items]');
    if (items) items.hidden = remaining === 0;
    const empty = list.querySelector<HTMLElement>('[data-event-empty]');
    if (empty) empty.hidden = remaining > 0;
    const more = list.querySelector<HTMLElement>('[data-event-more]');
    if (more) more.hidden = remaining <= limit;
    if (list.dataset.hideWhenEmpty === 'true') list.hidden = remaining === 0;
  });

  document.querySelectorAll<HTMLElement>('[data-show-after]').forEach((element) => {
    element.hidden = Number(element.dataset.showAfter) > now;
  });
}

refreshEventLists();
// Auch bei lange geöffnetem Tab bzw. Rückkehr per Zurück-Taste (bfcache) aktuell halten.
window.addEventListener('pageshow', refreshEventLists);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshEventLists();
});
window.setInterval(refreshEventLists, 60_000);
