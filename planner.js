// ==== Planner.js ====

// Elements
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const selectedDateLabel = document.getElementById('selectedDateLabel');
const planStatus = document.getElementById('planStatus');
const planBtn = document.getElementById('planBtn');

const topThree = document.getElementById('topThree');
const oldItems = document.getElementById('oldItems');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;

// LocalStorage keys
const outfitKey = 'outfitPlans';
const closetKey = 'closetImages';

// ===== Utility Functions =====
function getMonthName(month) {
    return new Date(currentYear, month).toLocaleString('default', { month: 'long' });
}

function getOutfitPlans() {
    return JSON.parse(localStorage.getItem(outfitKey) || '{}');
}

function saveOutfit(dateStr, outfit) {
    const plans = getOutfitPlans();
    plans[dateStr] = outfit;
    localStorage.setItem(outfitKey, JSON.stringify(plans));
    renderCalendar(currentMonth, currentYear);
    renderSelectedDate(dateStr);
    renderAnalytics();
}

// ===== Calendar Rendering =====
function renderCalendar(month, year) {
    calendarGrid.innerHTML = '';
    monthLabel.textContent = `${getMonthName(month)} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const plans = getOutfitPlans();

    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.classList.add('day', 'out');
        calendarGrid.appendChild(empty);
    }

    // Render days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        const n = document.createElement('div');
        n.classList.add('n');
        n.textContent = day;
        dayDiv.appendChild(n);

        const dateStr = `${year}-${month + 1}-${day}`;
        if (plans[dateStr]) {
            const dot = document.createElement('div');
            dot.classList.add('dot-plan');
            dayDiv.appendChild(dot);
        }

        dayDiv.addEventListener('click', () => selectDate(dateStr));
        calendarGrid.appendChild(dayDiv);
    }
}

// ===== Date Selection =====
function selectDate(dateStr) {
    selectedDate = dateStr;
    renderSelectedDate(dateStr);
}

// ===== Selected Date Info =====
function renderSelectedDate(dateStr) {
    const plans = getOutfitPlans();
    selectedDateLabel.textContent = `Selected Date: ${dateStr}`;
    if (plans[dateStr]) {
        planStatus.textContent = `Outfit planned: ${plans[dateStr].name || "Outfit"}`;
        planBtn.textContent = 'Edit Outfit';
    } else {
        planStatus.textContent = 'No planned outfit for this day.';
        planBtn.textContent = 'Plan Outfit';
    }
}

// ===== Plan Outfit Button =====
planBtn.addEventListener('click', () => {
    if (!selectedDate) {
        alert('Please select a date first.');
        return;
    }

    // Store date in localStorage so Closet knows what day we're planning for
    localStorage.setItem('planningDate', selectedDate);

    // Redirect to Closet page for outfit selection
    window.location.href = 'wardrobe.html';
});

// ===== Month Navigation =====
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});
nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// ===== Analytics =====
function renderAnalytics() {
    topThree.innerHTML = '';
    oldItems.innerHTML = '';
    const plans = getOutfitPlans();
    const closet = JSON.parse(localStorage.getItem(closetKey) || '[]');
    const weekTheme = document.getElementById('themeLabel')?.textContent.toLowerCase() || "";

    // Count usage
    const countMap = {};
    for (let date in plans) {
        const outfit = plans[date];
        const itemName = outfit.name || outfit; 
        const itemObj = closet.find(c => c.id === itemName || c.src === itemName);
        if (!itemObj) continue;
        if (itemObj.colors && weekTheme && !itemObj.colors.includes(weekTheme)) continue;
        countMap[itemName] = (countMap[itemName] || 0) + 1;
    }

    // Top 3
    const topItems = Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (topItems.length === 0) topThree.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
    else topItems.forEach(([name, count]) => {
        const div = document.createElement('div');
        div.classList.add('mini');
        div.innerHTML = `<div class="meta">${name} (${count} times)</div>;
        topThree.appendChild(div)`;
    });

    // Old items ≤5
    const old = Object.entries(countMap).filter(([name, count]) => count <= 5);
    if (old.length === 0) oldItems.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
    else old.forEach(([name, count]) => {
        const div = document.createElement('div');
        div.classList.add('mini');
        div.innerHTML = `<div class="meta">${name} (${count} times)</div>;
        oldItems.appendChild(div)`;
    });
}

// ===== Initial Render =====
renderCalendar(currentMonth, currentYear);
renderAnalytics();