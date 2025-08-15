// ------- Elements -------
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel   = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const selectedDateLabel = document.getElementById('selectedDateLabel');
const planStatus = document.getElementById('planStatus');
const planBtn    = document.getElementById('planBtn');

const topThree = document.getElementById('topThree');   // if present on page
const oldItems  = document.getElementById('oldItems');  // if present on page

const CLOSET_KEY = 'closetImages';
const PLANS_KEY  = 'outfitPlans';

// ------- Date state -------
let today = new Date();
let currentMonth = today.getMonth();
let currentYear  = today.getFullYear();
let selectedDate = null;

// If planner.html?date=YYYY-MM-DD, auto-select that date
const incomingDate = new URL(location.href).searchParams.get('date');
if (incomingDate) {
  const d = new Date(incomingDate);
  if (!isNaN(d)) {
    currentMonth = d.getMonth();
    currentYear  = d.getFullYear();
    selectedDate = incomingDate;
  }
}

// ------- Helpers -------
function getMonthName(month, year=currentYear) {
  return new Date(year, month, 1).toLocaleString('default', { month: 'long' });
}
function getPlans() {
  return JSON.parse(localStorage.getItem(PLANS_KEY) || '{}');
}
function savePlans(plans) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}
function getCloset() {
  return JSON.parse(localStorage.getItem(CLOSET_KEY) || '[]');
}
function ymd(y,m,d){ return `${y}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`; }

// ------- Calendar -------
function renderCalendar(month, year) {
  calendarGrid.innerHTML = '';
  monthLabel.textContent = `${getMonthName(month, year)} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const plans = getPlans();

  // leading blanks
  for (let i=0;i<firstDay;i++){
    const empty = document.createElement('div');
    empty.className = 'day out';
    calendarGrid.appendChild(empty);
  }

  // days
  for (let d=1; d<=daysInMonth; d++){
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    if (d === today.getDate() && month===today.getMonth() && year===today.getFullYear()) {
      dayDiv.classList.add('today');
    }

    const n = document.createElement('div');
    n.className='n';
    n.textContent=d;
    dayDiv.appendChild(n);

    const dateStr = ymd(year, month+1, d);
    const hasPlan = plans[dateStr] && Array.isArray(plans[dateStr].items) && plans[dateStr].items.length>0;
    if (hasPlan) {
      const dot = document.createElement('div');
      dot.className='dot-plan';
      dayDiv.appendChild(dot);
    }

    dayDiv.addEventListener('click', ()=> selectDate(dateStr));
    calendarGrid.appendChild(dayDiv);
  }
}

// ------- Select & render selected date -------
function selectDate(dateStr){
  selectedDate = dateStr;
  renderSelectedDate();
}

function renderSelectedDate(){
  if (!selectedDate) {
    selectedDateLabel.textContent = 'Select a date on the calendar.';
    planStatus.textContent = '';
    planBtn.textContent = 'Plan Outfit';
    return;
  }
  selectedDateLabel.textContent = `Selected Date: ${selectedDate}`;

  const plans = getPlans();
  const closet = getCloset();
  const plan = plans[selectedDate];

  const detail = document.getElementById('planArea');
  if (!detail) return; // if your HTML doesn’t have it

  // Clear current
  detail.innerHTML = '';

  if (!plan || !Array.isArray(plan.items) || plan.items.length===0) {
    // No plan
    const p = document.createElement('div');
    p.className = 'status';
    p.textContent = 'No planned outfit for this day.';
    detail.appendChild(p);

    const btnWrap = document.createElement('div');
    btnWrap.style.display='flex';
    btnWrap.style.gap='8px';
    btnWrap.style.marginTop='6px';

    const planBtnEl = document.createElement('button');
    planBtnEl.className='btn primary';
    planBtnEl.textContent='Plan Outfit';
    planBtnEl.addEventListener('click', openClosetForSelection);
    btnWrap.appendChild(planBtnEl);

    detail.appendChild(btnWrap);
    return;
  }

  // Has plan: render thumbnails grid + actions
  const grid = document.createElement('div');
  grid.style.display='grid';
  grid.style.gridTemplateColumns='repeat(auto-fill,minmax(80px,1fr))';
  grid.style.gap='8px';
  grid.style.marginTop='6px';

  plan.items.forEach(id=>{
    const imgObj = closet.find(c=>String(c.id)===String(id));
    if (!imgObj) return;
    const cell = document.createElement('div');
    cell.style.border='1px solid var(--ring)';
    cell.style.borderRadius='8px';
    cell.style.overflow='hidden';
    cell.style.background='#fff';
    cell.style.position='relative';

    const im = document.createElement('img');
    im.src = imgObj.src;
    im.alt = imgObj.category || 'item';
    im.style.width='100%';
    im.style.height='80px';
    im.style.objectFit='cover';

    // remove icon
    const x = document.createElement('button');
    x.textContent='×';
    x.title='Remove from this date';
    x.style.position='absolute';
    x.style.top='4px';
    x.style.right='4px';
    x.style.background='#fff';
    x.style.border='1px solid var(--ring)';
    x.style.borderRadius='50%';
    x.style.width='22px';
    x.style.height='22px';
    x.style.cursor='pointer';
    x.addEventListener('click', ()=>{
      const plans = getPlans();
      const cur = plans[selectedDate];
      if (!cur) return;
      cur.items = (cur.items||[]).filter(v=>String(v)!==String(id));
      plans[selectedDate] = cur;
      savePlans(plans);
      renderCalendar(currentMonth, currentYear);
      renderSelectedDate();
    });

    cell.appendChild(im);
    cell.appendChild(x);
    grid.appendChild(cell);
  });

  // Buttons
  const btnWrap = document.createElement('div');
  btnWrap.style.display='flex';
  btnWrap.style.gap='8px';
  btnWrap.style.marginTop='8px';

  const editBtn = document.createElement('button');
  editBtn.className='btn';
  editBtn.textContent='Edit Outfit';
  editBtn.addEventListener('click', openClosetForSelection);
  btnWrap.appendChild(editBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className='btn';
  clearBtn.textContent='Clear All';
  clearBtn.addEventListener('click', ()=>{
    if (!confirm('Remove all items for this date?')) return;
    const plans = getPlans();
    if (plans[selectedDate]) {
      plans[selectedDate].items = [];
      savePlans(plans);
      renderCalendar(currentMonth, currentYear);
      renderSelectedDate();
    }
  });
  btnWrap.appendChild(clearBtn);

  detail.appendChild(grid);
  detail.appendChild(btnWrap);
}

// ------- Open Closet in planner mode -------
function openClosetForSelection(){
  if (!selectedDate) {
    alert('Please select a date first.');
    return;
  }
  // Navigate to closet with planner mode enabled, and pass a "back" target
  location.href = `wardrobe.html?from=planner&date=${encodeURIComponent(selectedDate)}&back=${encodeURIComponent('planner.html')}`;
}

// ------- Month nav -------
prevMonthBtn.addEventListener('click', ()=>{
  currentMonth--;
  if (currentMonth<0){ currentMonth=11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
});
nextMonthBtn.addEventListener('click', ()=>{
  currentMonth++;
  if (currentMonth>11){ currentMonth=0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
});

// ------- (Optional) Simple analytics (items used frequency) -------
function renderAnalytics(){
  if (!topThree || !oldItems) return; // only if those sections exist
  topThree.innerHTML = '';
  oldItems.innerHTML = '';

  const plans = getPlans();
  const counts = {};
  Object.values(plans).forEach(p=>{
    (p.items||[]).forEach(id=>{
      counts[id] = (counts[id]||0)+1;
    });
  });

  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const closet = getCloset();

  // Top 3
  if (entries.length===0) {
    topThree.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
  } else {
    entries.slice(0,3).forEach(([id,count])=>{
      const imgObj = closet.find(c=>String(c.id)===String(id));
      const card = document.createElement('div');
      card.className='mini';
      if (imgObj) {
        const im = document.createElement('img');
        im.src = imgObj.src;
        im.alt = imgObj.category || 'item';
        card.appendChild(im);
      }
      const meta = document.createElement('div');
      meta.className='meta';
      meta.textContent = `Used ${count} time${count>1?'s':''}`;
      card.appendChild(meta);
      topThree.appendChild(card);
    });
  }

  // Old items (≤5 uses)
  const old = entries.filter(([,count])=>count<=5);
  if (old.length===0) {
    oldItems.innerHTML = '<div class="mini"><div class="meta">No data yet</div></div>';
  } else {
    old.forEach(([id,count])=>{
      const imgObj = closet.find(c=>String(c.id)===String(id));
      const card = document.createElement('div');
      card.className='mini';
      if (imgObj) {
        const im = document.createElement('img');
        im.src = imgObj.src;
        im.alt = imgObj.category || 'item';
        card.appendChild(im);
      }
      const meta = document.createElement('div');
      meta.className='meta';
      meta.textContent = `Used ${count} time${count>1?'s':''}`;
      card.appendChild(meta);
      oldItems.appendChild(card);
    });
  }
}

// ------- Init -------
renderCalendar(currentMonth, currentYear);
// Auto-select incoming date or default to today
if (selectedDate) {
  // ensure calendar drawn for that month/year, then render details
  renderSelectedDate();
} else {
  selectDate(ymd(today.getFullYear(), today.getMonth()+1, today.getDate()));
}
renderAnalytics(); // if analytics UI exists