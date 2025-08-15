// -------- Planner Linkage (URL params) --------
const url = new URL(location.href);
const plannerMode = url.searchParams.get('from') === 'planner';
const plannerDate = url.searchParams.get('date') || null; // "YYYY-MM-DD"

// -------- Elements & State --------
let selectedCategory = 'tops';
let selectedColors = new Set();

const categoryButtons = document.querySelectorAll(".category-btn");
const colorOptions = document.querySelectorAll(".color-option");
const closetGrid = document.getElementById("closetGrid");
const uploadBtn = document.getElementById("uploadBtn");
const uploadInput = document.getElementById("uploadInput");

// Selection bar injected in plannerMode
let selectionBar;
let selectedIds = new Set(); // selected item IDs when plannerMode

// -------- Storage helpers --------
const CLOSET_KEY = "closetImages";
const PLANS_KEY  = "outfitPlans";

function loadImages(){
  const data = localStorage.getItem(CLOSET_KEY);
  return data ? JSON.parse(data) : [];
}
function saveImages(images){
  localStorage.setItem(CLOSET_KEY, JSON.stringify(images));
}
function loadPlans(){
  return JSON.parse(localStorage.getItem(PLANS_KEY) || "{}");
}
function savePlans(plans){
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

// -------- UI: category & colors --------
categoryButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    selectedCategory = btn.dataset.category;
    categoryButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderImages();
  });
});

colorOptions.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const color = btn.dataset.color;
    if(selectedColors.has(color)){
      selectedColors.delete(color);
      btn.classList.remove('selected');
    } else{
      selectedColors.add(color);
      btn.classList.add('selected');
    }
  });
});

// -------- Render Closet Grid --------
function renderImages(){
  const images = loadImages();
  closetGrid.innerHTML = '';
  const filtered = images.filter(img=>img.category===selectedCategory);

  if(filtered.length===0){
    closetGrid.innerHTML = `<p style="text-align:center;color:#6b2d5c;margin-top:2rem;">
      No items in "${selectedCategory}" category yet.
    </p>`;
    return;
  }

  filtered.forEach(img=>{
    const item = document.createElement('div');
    item.className='closet-item';
    item.style.position = 'relative';

    const imageEl = document.createElement('img');
    imageEl.src = img.src;
    imageEl.alt = img.category;

    const deleteBtn = document.createElement('button');
    deleteBtn.className='delete-btn';
    deleteBtn.textContent='×';
    deleteBtn.title = "Delete this item";
    deleteBtn.addEventListener('click',(e)=>{
      e.stopPropagation();
      if(confirm("Delete this item?")){
        const updated = loadImages().filter(i=>i.id!==img.id);
        saveImages(updated);
        renderImages();
      }
    });

    // Badge showing colors
    const badge = document.createElement('span');
    badge.className='badge';
    badge.textContent = (img.colors && img.colors.length ? img.colors.join(', ') : '—');

    // Planner multi-select mode
    if (plannerMode) {
      item.style.cursor = 'pointer';
      // Selected visual
      if (selectedIds.has(String(img.id))) item.style.outline = '3px solid #a64d79';

      item.addEventListener('click', ()=>{
        const idStr = String(img.id);
        if (selectedIds.has(idStr)) {
          selectedIds.delete(idStr);
          item.style.outline = '';
        } else {
          selectedIds.add(idStr);
          item.style.outline = '3px solid #a64d79';
        }
        updateSelectionBar();
      });
    }

    const meta = document.createElement('div');
    meta.className='meta';
    meta.innerHTML=`Category: ${img.category}`;

    item.appendChild(imageEl);
    item.appendChild(deleteBtn);
    item.appendChild(badge);
    item.appendChild(meta);

    closetGrid.appendChild(item);
  });
}

// -------- Upload (with 5MB limit) --------
uploadBtn.addEventListener('click',()=>{
  if(!uploadInput.files.length){
    alert("Select an image first");
    return;
  }
  if(selectedColors.size===0){
    alert("Select at least one color");
    return;
  }

  const file = uploadInput.files[0];

  // 5MB max size
  const MAX_MB = 5;
  if (file.size > MAX_MB * 1024 * 1024) {
    alert(`Image too large (${(file.size/1024/1024).toFixed(1)}MB). Please choose an image ≤ ${MAX_MB}MB.`);
    return;
  }

  if(!file.type.startsWith('image/')){
    alert("Please select a valid image file");
    return;
  }

  const reader = new FileReader();
  reader.onload = e=>{
    const images = loadImages();
    images.push({
      id: Date.now(),
      category: selectedCategory,
      colors: Array.from(selectedColors),
      src: e.target.result
    });
    saveImages(images);
    selectedColors.clear();
    colorOptions.forEach(btn=>btn.classList.remove('selected'));
    uploadInput.value='';
    renderImages();
  };
  reader.readAsDataURL(file);
});

// -------- Planner selection bar (only in plannerMode) --------
function ensureSelectionBar(){
  if (!plannerMode || selectionBar) return;
  selectionBar = document.createElement('div');
  selectionBar.style.position = 'fixed';
  selectionBar.style.left = '0';
  selectionBar.style.right = '0';
  selectionBar.style.bottom = '64px'; // just above bottom nav
  selectionBar.style.zIndex = '70';
  selectionBar.style.display = 'flex';
  selectionBar.style.justifyContent = 'space-between';
  selectionBar.style.alignItems = 'center';
  selectionBar.style.padding = '10px 12px';
  selectionBar.style.background = 'rgba(255, 214, 232, .95)';
  selectionBar.style.borderTop = '1px solid #f0c6d3';
  selectionBar.style.backdropFilter = 'blur(6px)';
  selectionBar.innerHTML = `
    <div id="selCount" style="color:#6b2d5c;font-weight:700">0 selected</div>
    <div style="display:flex;gap:8px">
      <button id="cancelSel" style="padding:8px 12px;border-radius:8px;border:1px solid #f0c6d3;background:#fff;color:#6b2d5c;cursor:pointer">Cancel</button>
      <button id="confirmSel" style="padding:8px 12px;border-radius:8px;border:none;background:#a64d79;color:#fff;font-weight:700;cursor:pointer">Add to Planner</button>
    </div>
  `;
  document.body.appendChild(selectionBar);

  document.getElementById('cancelSel').addEventListener('click', ()=>{
    // Go back to planner without saving
    const back = url.searchParams.get('back') || 'planner.html';
    location.href = `${back}?date=${encodeURIComponent(plannerDate || '')}`;
  });
  document.getElementById('confirmSel').addEventListener('click', ()=>{
    if (!plannerDate) {
      alert('Missing planner date. Reopen the Closet from Planner.');
      return;
    }
    const plans = loadPlans();
    const ids = Array.from(selectedIds);
    const existing = plans[plannerDate] || { items: [] };

    // Merge unique (keep both)
    const merged = Array.from(new Set([...(existing.items||[]), ...ids]));
    plans[plannerDate] = {
      ...(plans[plannerDate] || {}),
      items: merged,
      updatedAt: new Date().toISOString()
    };
    savePlans(plans);

    const back = url.searchParams.get('back') || 'planner.html';
    location.href = `${back}?date=${encodeURIComponent(plannerDate)}`;
  });
}

function updateSelectionBar(){
  if (!plannerMode || !selectionBar) return;
  const selCount = document.getElementById('selCount');
  selCount.textContent = `${selectedIds.size} selected`;
}

// -------- Init --------
if (plannerMode) {
  ensureSelectionBar();
}

renderImages();