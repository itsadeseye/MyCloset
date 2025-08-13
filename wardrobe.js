// Weekly themes
const themes = [
  { name: "pink-week", bgClass: "pink-week" },
  { name: "blue-week", bgClass: "blue-week" },
  { name: "brown-week", bgClass: "brown-week" },
  { name: "white-week", bgClass: "white-week" },
  { name: "riot-week", bgClass: "riot-week" }
];

// Get current week number (1-53)
function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - startOfYear) / 86400000);
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
}

function setWeeklyTheme() {
  const currentWeek = getWeekNumber(new Date());
  const themeIndex = currentWeek % themes.length;
  document.body.classList.add(themes[themeIndex].bgClass);
}

setWeeklyTheme();

// App State & Elements
const categoryButtons = document.querySelectorAll(".category-btn");
const closetGrid = document.getElementById("closetGrid");
const uploadInput = document.getElementById("uploadInput");
const uploadBtn = document.getElementById("uploadBtn");
const colorOptions = document.querySelectorAll('.color-option');

let selectedCategory = "tops";
let selectedColors = new Set();
let plannerMode = false; // true when opened from planner
let selectedOutfitsForPlanner = [];

// Handle color selection UI
colorOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.color;
    if (selectedColors.has(color)) {
      selectedColors.delete(color);
      btn.classList.remove('selected');
    } else {
      selectedColors.add(color);
      btn.classList.add('selected');
    }
  });
});

function loadImages() {
  const data = localStorage.getItem("closetImages");
  return data ? JSON.parse(data) : [];
}

function saveImages(images) {
  localStorage.setItem("closetImages", JSON.stringify(images));
}

function renderImages() {
  const images = loadImages();
  closetGrid.innerHTML = "";

  const filtered = images.filter(img => img.category === selectedCategory);

  if (filtered.length === 0) {
    closetGrid.innerHTML = `<p style="text-align:center; color:#6b2d5c; margin-top: 2rem;">
      No items in "${selectedCategory}" category yet.
    </p>`;
    return;
  }

  filtered.forEach(img => {
    const item = document.createElement("div");
    item.classList.add("closet-item");
    item.style.position = 'relative';

    // Image element
    const imageEl = document.createElement("img");
    imageEl.src = img.src;
    imageEl.alt = img.category;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Delete this item";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this item?")) {
        const updatedImages = loadImages().filter(i => i.id !== img.id);
        saveImages(updatedImages);
        renderImages();
      }
    });

    // Color swatches container
    const colorContainer = document.createElement('div');
    colorContainer.classList.add('color-swatch-container');
    img.colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.classList.add('color-swatch', color);
      colorContainer.appendChild(swatch);
    });

    // Favorite toggle button
    const favBtn = document.createElement('button');
    favBtn.classList.add('favorite-btn');
    favBtn.innerHTML = img.isFavorite ? '★' : '☆';
    favBtn.title = img.isFavorite ? 'Unmark Favorite' : 'Mark as Favorite';
    favBtn.addEventListener('click', () => {
      const images = loadImages();
      const target = images.find(i => i.id === img.id);
      if (target) {
        target.isFavorite = !target.isFavorite;
        saveImages(images);
        renderImages();
      }
    });

    item.appendChild(imageEl);
    item.appendChild(deleteBtn);
    item.appendChild(colorContainer);
    item.appendChild(favBtn);

    // New badge
    const now = new Date();
    if (img.isNew && img.addedDate) {
      const addedDate = new Date(img.addedDate);
      const diffDays = Math.floor((now - addedDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        const newBadge = document.createElement('span');
        newBadge.classList.add('badge', 'new-badge');
        newBadge.textContent = 'New';
        item.appendChild(newBadge);
      } else {
        const images = loadImages();
        const target = images.find(i => i.id === img.id);
        if (target) {
          target.isNew = false;
          saveImages(images);
        }
      }
    }

    // Recently worn badge
    if (img.lastWorn) {
      const lastWornDate = new Date(img.lastWorn);
      const daysSinceWorn = Math.floor((now - lastWornDate) / (1000 * 60 * 60 * 24));
      if (daysSinceWorn <= 14) {
        const wornBadge = document.createElement('span');
        wornBadge.classList.add('badge', 'worn-badge');
        wornBadge.textContent = 'Recently Worn';
        item.appendChild(wornBadge);
      }
    }

    // Planner selection
    if (plannerMode) {
      item.classList.add('planner-selectable');
      if (selectedOutfitsForPlanner.find(o => o.id === img.id)) {
        item.classList.add('selected-for-planner');
      }
      item.addEventListener('click', () => {
        const index = selectedOutfitsForPlanner.findIndex(o => o.id === img.id);
        if (index > -1) {
          selectedOutfitsForPlanner.splice(index, 1);
          item.classList.remove('selected-for-planner');
        } else {
          selectedOutfitsForPlanner.push(img);
          item.classList.add('selected-for-planner');
        }
      });
    }

    closetGrid.appendChild(item);
  });
}

function updateActiveCategoryBtn() {
  categoryButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === selectedCategory);
  });
}

categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCategory = btn.dataset.category;
    updateActiveCategoryBtn();
    renderImages();
  });
});

uploadBtn.addEventListener("click", () => {
  if (!uploadInput.files.length) { alert("Please select an image to upload."); return; }
  if (selectedColors.size === 0) { alert("Please select at least one color."); return; }

  const file = uploadInput.files[0];
  if (!file.type.startsWith("image/")) { alert("Please upload a valid image file."); return; }

  const reader = new FileReader();
  reader.onload = function (e) {
    const images = loadImages();
    images.push({
      id: Date.now(),
      category: selectedCategory,
      src: e.target.result,
      colors: Array.from(selectedColors),
      isFavorite: false,
      lastWorn: null,
      isNew: true,
      addedDate: new Date().toISOString()
    });
    saveImages(images);
    selectedColors.clear();
    colorOptions.forEach(btn => btn.classList.remove('selected'));
    renderImages();
    uploadInput.value = "";
  };
  reader.readAsDataURL(file);
});

// Initial render
updateActiveCategoryBtn();
renderImages();