/**
 * planner.js
 * Full planner script that works with closetImages (localStorage) and outfitPlans (localStorage).
 *
 * Closet item shape (expected):
 * { id, category, src, colors: ['pink','blue',...], isFavorite, lastWorn, ... }
 *
 * outfitPlans structure:
 * { "2025-8-13": [1234567890, 1234567891], "2025-8-14": [ ... ] }
 */

// Config / keys
const OUTFIT_KEY = 'outfitPlans';
const CLOSET_KEY = 'closetImages';

// DOM refs (must exist in page)
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const selectedDateLabel = document.getElementById('selectedDateLabel');
const planStatus = document.getElementById('planStatus');
const planBtn = document.getElementById('planBtn');

const topThree = document.getElementById('topThree');
const oldItems = document.getElementById('oldItems');

// Date state
let today = new Date();
let currentMonth = today.getMonth(); // 0-11
let currentYear = today.getFullYear();
let selectedDate = null; // string like "2025-8-13"

// Helper: month name
function getMonthName(m) {
  return new Date(currentYear, m).toLocaleString('default', { month: 'long' });
}

// Storage helpers
function loadCloset() {
  return JSON.parse(localStorage.getItem(CLOSET_KEY) || '[]');
}
function loadOutfitPlans() {
  return JSON.parse(localStorage.getItem(OUTFIT_KEY) || '{}');
}
function saveOutfitPlans(plans) {
  localStorage.setItem(OUTFIT_KEY, JSON.stringify(plans));
}

// Normalizer: ensure a date entry becomes an array of ids
function normalizePlanValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.slice();
  if (typeof value === 'string') {
    // if comma-separated IDs or a single id
    const parts = value.split(',').map(s => s.trim()).filter(Boolean);
    // try to convert to numbers if they look numeric
    return parts.map(p => {
      const n = Number(p);
      return Number.isNaN(n) ? p : n;
    });
  }
  // if it's an object (older shape), try to extract ids
  if (typeof value === 'object') {
    // maybe {id: 123} or [{id:123}, ...]
    if (Array.isArray(value)) {
      return value.map(v => (v && (v.id ?? v)) || v).filter(Boolean);
    }
    if (value.id) return [value.id];
  }
  return [];
}

// Format date string consistently: YYYY-M-D (no leading zeros)
function formatDateStr(year, month0, day) {
  return `${year}-${month0 + 1}-${day}`;
}

// Get items array for a date
function getItemsForDate(dateStr) {
  const plans = loadOutfitPlans();
  return normalizePlanValue(plans[dateStr]);
}

// Set items array for a date (replace)
function setItemsForDate(dateStr, itemsArray) {
  const plans = loadOutfitPlans();
  plans[dateStr] = itemsArray;
  saveOutfitPlans(plans);
}

// Remove plan for a date entirely
function deletePlanForDate(dateStr) {
  const plans = loadOutfitPlans();
  delete plans[dateStr];
  saveOutfitPlans(plans);
}

// Map body theme class to a closet color keyword
function getWeekThemeColor() {
  const mapping = {
    'pink-week': 'pink',
    'blue-week': 'blue',
    'brown-week': 'brown',
    'white-week': 'white',
    'riot-week': 'riot'
  };
  for (const cls of Object.keys(mapping)) {
    if (document.body.classList.contains(cls)) return mapping[cls];
  }
  // fallback: try themeLabel text if exists (contains color)
  const lbl = document.getElementById('themeLabel');
  if (lbl && lbl.textContent) {
    const text = lbl.textContent.toLowerCase();
    for (const c of ['pink','blue','brown','white','riot','black']) {
      if (text.includes(c)) return c;
    }
  }
  return ''; // no theme
}

/* =========================
   Calendar rendering
   ========================= */
function renderCalendar(month, year) {
  if (!calendarGrid) return;
  calendarGrid.innerHTML = '';
  monthLabel && (monthLabel.textContent = `${getMonthName(month)} ${year}`);

  // first day of month (0 = Sunday)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const plans = loadOutfitPlans();
  const closet = loadCloset();

  // leading empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day out';
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    // mark today
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayDiv.classList.add('today');
    }

    // day number
    const n = document.createElement('div');
    n.className = 'n';
    n.textContent = day;
    dayDiv.appendChild(n);

    const dateStr = formatDateStr(year, month, day);
    const items = normalizePlanValue(plans[dateStr]);

    if (items.length > 0) {
      // dot indicator
      const dot = document.createElement('div');
      dot.className = 'dot-plan';
      dayDiv.appendChild(dot);

      // thumbnail container
      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'thumb-container';
      // show up to 3 tiny thumbs
      items.slice(0, 3).forEach(id => {
        const obj = closet.find(c => c.id === id || String(c.id) === String(id));
        if (obj && obj.src) {
          const t = document.createElement('img');
          t.src = obj.src;
          t.className = 'thumb';
          t.alt = obj.category || '';
          thumbContainer.appendChild(t);
        }
      });
      dayDiv.appendChild(thumbContainer);
    }

    // click handler
    dayDiv.addEventListener('click', () => {
      selectDate(dateStr);
    });

    calendarGrid.appendChild(dayDiv);
  }
}

/* =========================
   Date selection & panel
   ========================= */
function selectDate(dateStr) {
  selectedDate = dateStr;
  // visually mark selected day in the grid (optional)
  Array.from(calendarGrid.children).forEach(cell => {
    cell.classList.toggle('selected', cell.querySelector('.n') && (dateStr.endsWith(`-${cell.querySelector('.n').textContent}`)));
  });
  renderSelectedDate(dateStr);
}

function renderSelectedDate(dateStr) {
  if (!selectedDateLabel || !planStatus) return;
  selectedDateLabel.textContent = `Selected Date: ${dateStr}`;
  planStatus.innerHTML = ''; // clear

  const closet = loadCloset();
  const items = getItemsForDate(dateStr);

  if (!items || items.length === 0) {
    planStatus.textContent = 'No planned outfit for this day.';
    if (planBtn) planBtn.textContent = 'Plan Outfit';
    return;
  }

  // show thumbnails for planned items
  const container = document.createElement('div');
  container.className = 'planned-list';
  items.forEach(id => {
    const obj = closet.find(c => c.id === id || String(c.id) === String(id));
    if (!obj) return;
    const box = document.createElement('div');
    box.className = 'planned-item';
    const img = document.createElement('img');
    img.src = obj.src;
    img.alt = obj.category || '';
    img.className = 'planned-thumb';
    const meta = document.createElement('div');
    meta.className = 'planned-meta';
    meta.textContent = obj.category || '';
    box.appendChild(img);
    box.appendChild(meta);
    container.appendChild(box);
  });
  planStatus.appendChild(container);
  if (planBtn) planBtn.textContent = 'Edit Outfit';
}

/* =========================
   Plan button -> open closet
   ========================= */
if (planBtn) {
  planBtn.addEventListener('click', () => {
    if (!selectedDate) {
      alert('Please select a date first.');
      return;
    }
    // Put the date into localStorage so the Closet enters planner selection mode
    localStorage.setItem('planningDate', selectedDate);
    // navigate to the closet/wardrobe page - adjust filename if yours differs
    window.location.href = 'wardrobe.html';
  });
}

/* =========================
   Delete plan (optional)
   ========================= */
function setupDeleteButtonIfExists() {
  const delBtn = document.getElementById('deletePlanBtn');
  if (!delBtn) return;
  delBtn.addEventListener('click', () => {
    if (!selectedDate) { alert('Select a date first'); return; }
    if (!confirm('Delete saved outfit for ' + selectedDate + '?')) return;
    deletePlanForDate(selectedDate);
    renderCalendar(currentMonth, currentYear);
    renderSelectedDate(selectedDate);
  });
}

/* =========================
   Analytics (Top 3 & Old items <=5 uses)
   ========================= */
function renderAnalytics() {
  if (!topThree || !oldItems) return;
  topThree.innerHTML = '';
  oldItems.innerHTML = '';

  const plans = loadOutfitPlans();
  const closet = loadCloset();
  const weekTheme = getWeekThemeColor();

  // count usage per item id
  const countMap = new Map();
  for (const date in plans) {
    const list = normalizePlanValue(plans[date]);
    list.forEach(id => {
      const obj = closet.find(c => c.id === id || String(c.id) === String(id));
      if (!obj) return;
      // filter by week theme if closet item has colors
      if (weekTheme && obj.colors && !obj.colors.includes(weekTheme)) return;
      const key = String(id);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });
  }

  // convert to array and sort
  const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);

  // Top 3
  if (sorted.length === 0) {
    topThree.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
  } else {
    sorted.slice(0, 3).forEach(([id, count]) => {
      const obj = closet.find(c => String(c.id) === String(id));
      if (!obj) return;
      const card = document.createElement('div');
      card.className = 'mini';
      card.innerHTML = `<img src="${obj.src}" alt="${obj.category}" /><div class="meta">${obj.category} (${count} times)</div>`;
      topThree.appendChild(card);
    });
  }

  // Old items ≤5 uses
  const old = sorted.filter(([id, count]) => count <= 5);
  if (old.length === 0) {
    oldItems.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
  } else {
    old.forEach(([id, count]) => {
      const obj = closet.find(c => String(c.id) === String(id));
      if (!obj) return;
      const card = document.createElement('div');
      card.className = 'mini';
      card.innerHTML = `<img src="${obj.src}" alt="${obj.category}" /><div class="meta">${obj.category} (${count} times)</div>`;
      oldItems.appendChild(card);
    });
  }
}

/* =========================
   Month navigation
   ========================= */
if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
});
if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
});

/* =========================
   Initialization
   ========================= */
(function init() {
  // default selected date: today
  selectedDate = formatDateStr(currentYear, currentMonth, today.getDate());
  renderCalendar(currentMonth, currentYear);
  renderSelectedDate(selectedDate);
  renderAnalytics();
  setupDeleteButtonIfExists();
})();