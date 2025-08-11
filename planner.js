(() => {
  const STORAGE_KEY = 'plannedOutfits';
  const COLLECTIONS_KEY = 'outfitCollections';

  const planForm = document.getElementById('planForm');
  const dayInput = document.getElementById('day');
  const collectionSelect = document.getElementById('collectionSelect');
  const outfitColorsInput = document.getElementById('outfitColors');
  const notesInput = document.getElementById('notes');
  const ratingSelect = document.getElementById('rating');

  const newCollectionNameInput = document.getElementById('newCollectionName');
  const addCollectionBtn = document.getElementById('addCollectionBtn');
  const collectionList = document.getElementById('collectionList');

  const filterDay = document.getElementById('filterDay');
  const filterCollection = document.getElementById('filterCollection');
  const plannedList = document.getElementById('plannedList');

  // Load data
  let plannedOutfits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let collections = JSON.parse(localStorage.getItem(COLLECTIONS_KEY)) || [];

  // Helpers
  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plannedOutfits));
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }
  function generateId() {
    return Date.now() + Math.random().toString(16).slice(2);
  }
  function normalizeColor(c) {
    // simple lowercase and trim
    return c.trim().toLowerCase();
  }

  // Add collection UI
  function renderCollections() {
    collectionList.innerHTML = '';
    collectionSelect.innerHTML = '<option value="">-- None --</option>';
    filterCollection.innerHTML = '<option value="">All Collections</option>';
    collections.forEach(c => {
      // List
      const li = document.createElement('li');
      li.textContent = c.name;
      // Add rename & delete buttons
      const renameBtn = document.createElement('button');
      renameBtn.textContent = 'Rename';
      renameBtn.onclick = () => {
        const newName = prompt('New name for collection:', c.name);
        if (newName && newName.trim()) {
          c.name = newName.trim();
          saveData();
          renderCollections();
          renderPlannedOutfits();
        }
      };
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        if (confirm(`Delete collection "${c.name}"? This will unassign it from planned outfits.`)) {
          collections = collections.filter(x => x.id !== c.id);
          plannedOutfits.forEach(po => {
            if (po.collectionId === c.id) po.collectionId = null;
          });
          saveData();
          renderCollections();
          renderPlannedOutfits();
        }
      };
      li.appendChild(renameBtn);
      li.appendChild(deleteBtn);
      collectionList.appendChild(li);

      // Options
      const option1 = document.createElement('option');
      option1.value = c.id;
      option1.textContent = c.name;
      collectionSelect.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = c.id;
      option2.textContent = c.name;
      filterCollection.appendChild(option2);
    });
  }

  addCollectionBtn.onclick = () => {
    const name = newCollectionNameInput.value.trim();
    if (!name) return alert('Enter a collection name');
    if (collections.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return alert('Collection name already exists');
    }
    collections.push({ id: generateId(), name });
    newCollectionNameInput.value = '';
    saveData();
    renderCollections();
  };

  // Feedback color matching check (simple example)
  function checkColorMatch(outfitColors) {
    // Assume current color theme week, for demo set to pink tones
    const themeColors = ['pink', '#a64d79', '#f8bcd4', 'white', '#fff'];

    // normalize outfit colors
    const normalized = outfitColors.map(c => normalizeColor(c));
    let matches = normalized.some(c => themeColors.includes(c));

    if (matches) {
      return { match: true, message: 'Good match with theme colors!' };
    } else {
      // Recommend complementary colors (basic example)
      return { match: false, message: 'Colors do not match theme. Consider pink, white, or soft pastels.' };
    }
  }

  // Render planned outfits with filtering and feedback
  function renderPlannedOutfits() {
    const dayFilter = filterDay.value;
    const collectionFilterVal = filterCollection.value;

    plannedList.innerHTML = '';

    let filtered = plannedOutfits.filter(po => {
      let dayOk = !dayFilter || po.day === dayFilter;
      let collectionOk = !collectionFilterVal || po.collectionId === collectionFilterVal;
      return dayOk && collectionOk;
    });

    if (filtered.length === 0) {
      plannedList.innerHTML = '<li>No planned outfits found.</li>';
      return;
    }

    filtered.forEach(po => {
      const li = document.createElement('li');
      li.setAttribute('tabindex', '0');

      // Find collection name
      const col = collections.find(c => c.id === po.collectionId);
      const colName = col ? col.name : 'None';

      // Color matching feedback
      const outfitColors = po.outfitColors.split(',').map(c => c.trim());
      const feedback = checkColorMatch(outfitColors);

      // Display color circles
      const colorCircles = outfitColors.map(c => {
        const div = <span class="color-circle" style="background:${c}"></span>;
        return div;
      }).join('');

      li.innerHTML = `
        <div class="planned-header">
          <strong>${po.day} - Collection: <span class="badge">${colName}</span></strong>
          <span>Rating: ${po.rating || 'N/A'}</span>
        </div>
        <div>Colors: ${colorCircles}</div>
        <div>Notes: ${po.notes || 'None'}</div>
        <div class="feedback">${feedback.message}</div>
      `;

      plannedList.appendChild(li);
    });
  }

  // Add planned outfit
  planForm.onsubmit = e => {
    e.preventDefault();

    const dayVal = dayInput.value;
    const collectionVal = collectionSelect.value || null;
    const colorsRaw = outfitColorsInput.value.trim();
    const notesVal = notesInput.value.trim();
    const ratingVal = ratingSelect.value;

    if (!dayVal) {
      alert('Please select a day');
      return;
    }
    if (!colorsRaw) {
      alert('Please enter outfit colors');
      return;
    }

    plannedOutfits.push({
      id: generateId(),
      day: dayVal,
      collectionId: collectionVal,
      outfitColors: colorsRaw,
      notes: notesVal,
      rating: ratingVal,
    });
    saveData();
    renderPlannedOutfits();
    planForm.reset();
  };

  filterDay.onchange = renderPlannedOutfits;
  filterCollection.onchange = renderPlannedOutfits;

  // Initial render
  renderCollections();
  renderPlannedOutfits();
})();

// Sample theme colors per weekday (example)
const dayColorMap = {
  Monday: 'pink',
  Tuesday: 'blue',
  Wednesday: 'brown',
  Thursday: 'white',
  Friday: 'free',
  Saturday: 'pink',
  Sunday: 'blue',
};

// Mock wardrobe items loaded from localStorage or API
// Example item structure: { id, name, category, color, image, ... }
// Replace this with your actual data loading logic
let wardrobeItems = JSON.parse(localStorage.getItem('myWardrobeItems')) || [];

const daySelect = document.getElementById('daySelect');
const suggestionsGrid = document.getElementById('suggestionsGrid');

function renderSuggestions(day) {
  suggestionsGrid.innerHTML = '';

  if (!day || !dayColorMap[day]) {
    suggestionsGrid.textContent = 'Please select a valid day to see suggestions.';
    return;
  }

  const themeColor = dayColorMap[day];

  // Filter items matching the theme color (you can refine matching logic)
  const filteredItems = wardrobeItems.filter(item => item.color.toLowerCase().includes(themeColor));

  if (filteredItems.length === 0) {
    suggestionsGrid.textContent = `No items found matching the color theme (${themeColor}) for ${day}.;
    return`;
  }

  filteredItems.forEach(item => {
    const div = document.createElement('div');
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '8px';
    div.style.padding = '0.5rem';
    div.style.width = '120px';
    div.style.textAlign = 'center';

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:100%; height:100px; object-fit:contain; border-radius: 6px;" />
      <div style="font-weight:bold; margin-top: 0.3rem;">${item.name}</div>
      <div style="font-size: 0.85rem; color:#555;">${item.category}</div>
    `;

    suggestionsGrid.appendChild(div);
  });
}

// Update suggestions on day change
daySelect.addEventListener('change', () => {
  renderSuggestions(daySelect.value);
});

// Initial call to clear or show suggestions on load
renderSuggestions(daySelect.value);
function updateAnalytics() {
  const topWornItemsContainer = document.querySelector('#topWornItems ul');
  const colorUsageContainer = document.querySelector('#colorUsage ul');
  const oldItemsContainer = document.querySelector('#oldItems ul');

  if (!wardrobeItems || wardrobeItems.length === 0) {
    topWornItemsContainer.innerHTML = '<li>No wardrobe items found.</li>';
    colorUsageContainer.innerHTML = '<li>No wardrobe items found.</li>';
    oldItemsContainer.innerHTML = '<li>No wardrobe items found.</li>';
    return;
  }

  // Sort by timesWorn desc
  const sortedByWorn = [...wardrobeItems]
    .filter(item => item.timesWorn !== undefined)
    .sort((a,b) => (b.timesWorn || 0) - (a.timesWorn || 0))
    .slice(0, 3);

  if (sortedByWorn.length === 0) {
    topWornItemsContainer.innerHTML = '<li>No usage data yet.</li>';
  } else {
    topWornItemsContainer.innerHTML = sortedByWorn.map(item => `
      <li>
        <img src="${item.image}" alt="${item.name}" style="width:40px; height:40px; object-fit:contain; border-radius:5px; vertical-align:middle; margin-right:8px;" />
        <strong>${item.name}</strong> — Worn ${item.timesWorn} times
      </li>
    `).join('');
  }

  // Count colors usage
  const colorCount = {};
  wardrobeItems.forEach(item => {
    const c = item.color.toLowerCase();
    colorCount[c] = (colorCount[c] || 0) + 1;
  });

  colorUsageContainer.innerHTML = Object.entries(colorCount)
    .map(([color, count]) => `
      <li><span style="display:inline-block;width:20px;height:20px;background:${color};border:1px solid #aaa;margin-right:6px;"></span> ${color.toUpperCase()}: ${count}</li>
    `).join('');

  // Identify old items (not worn in 4+ weeks)
  const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const oldItems = wardrobeItems.filter(item => {
    if(!item.lastWorn) return true; // never worn = old
    const lastWornDate = new Date(item.lastWorn).getTime();
    return now - lastWornDate > FOUR_WEEKS_MS;
  });

  if(oldItems.length === 0) {
    oldItemsContainer.innerHTML = '<li>None! You wear everything regularly.</li>';
  } else {
    oldItemsContainer.innerHTML = oldItems.map(item => `
      <li>${item.name} (Last worn: ${item.lastWorn || 'Never'})</li>
    `).join('');
  }
}

// Call this whenever wardrobe updates
updateAnalytics();

// Assume plannedOutfits is an array of objects like:
// [{ id, day, collection, items: [wardrobeItemId, ...] }, ...]

const outfitSelect = document.getElementById('outfitSelect');
const generateBtn = document.getElementById('generatePackingListBtn');
const printBtn = document.getElementById('printPackingListBtn');
const packingListDisplay = document.getElementById('packingListDisplay');

// Populate outfitSelect options from plannedOutfits
function populateOutfitOptions(plannedOutfits) {
  outfitSelect.innerHTML = '';
  plannedOutfits.forEach(outfit => {
    const option = document.createElement('option');
    option.value = outfit.id;
    option.textContent =`${outfit.day} - ${outfit.collection || 'No Collection'}`;
    outfitSelect.appendChild(option);
  });
}

// Generate packing list from selected outfits
function generatePackingList(plannedOutfits, wardrobeItems) {
  const selectedIds = Array.from(outfitSelect.selectedOptions).map(opt => opt.value);

  // Collect all wardrobe item IDs from selected outfits
  let allItemIds = [];
  selectedIds.forEach(id => {
    const outfit = plannedOutfits.find(o => o.id === id);
    if (outfit) {
      allItemIds = allItemIds.concat(outfit.items);
    }
  });

  // Deduplicate IDs
  const uniqueIds = [...new Set(allItemIds)];

  // Map IDs to wardrobe items
  const itemsToPack = uniqueIds.map(id => wardrobeItems.find(item => item.id === id)).filter(Boolean);

  // Format packing list string
  if (itemsToPack.length === 0) {
    packingListDisplay.textContent = 'No items found for selected outfits.';
    printBtn.style.display = 'none';
    return;
  }

  const listText = itemsToPack.map(item =>`- ${item.name} (${item.category})`).join(`\n`);
  packingListDisplay.textContent =`Packing List:\n${listText}`;
  printBtn.style.display = 'inline-block';
}

// Print the packing list
function printPackingList() {
  const printWindow = window.open('', '', 'width=600,height=400');
  printWindow.document.write('<pre>' + packingListDisplay.textContent + '</pre>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// Events
generateBtn.addEventListener('click', () => {
  // Assume you have global arrays plannedOutfits and wardrobeItems loaded from storage
  generatePackingList(plannedOutfits, wardrobeItems);
});
printBtn.addEventListener('click', printPackingList);
