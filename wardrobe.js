(() => {
  // Define themes
  const themes = {
    pink: {
      '--primary-color': '#a64d79',
      '--primary-light': '#ffeaf3',
      '--border-color': '#f8bcd4',
      '--text-color': '#a64d79'
    },
    blue: {
      '--primary-color': '#2266aa',
      '--primary-light': '#d0e7ff',
      '--border-color': '#a3c1ff',
      '--text-color': '#2266aa'
    },
    brown: {
      '--primary-color': '#8b5e3c',
      '--primary-light': '#f5e9e2',
      '--border-color': '#cbb79b',
      '--text-color': '#8b5e3c'
    },
    white: {
      '--primary-color': '#555555',
      '--primary-light': '#ffffff',
      '--border-color': '#cccccc',
      '--text-color': '#555555'
    },
    free: {
      '--primary-color': '#000000',
      '--primary-light': '#f0f0f0',
      '--border-color': '#999999',
      '--text-color': '#000000'
    }
  };

  // Set current week number here (replace dynamically as needed)
  const currentWeek = 1; // 1 to 5
  const themeNames = Object.keys(themes);
  const currentThemeName = themeNames[(currentWeek - 1) % themeNames.length];

  // Apply theme CSS variables
  function applyTheme(name) {
    const theme = themes[name];
    if (!theme) return;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
  applyTheme(currentThemeName);

  // Elements refs
  const uploadForm = document.getElementById('uploadForm');
  const itemsGrid = document.getElementById('itemsGrid');

  // LocalStorage key
  const STORAGE_KEY = 'myWardrobeItems';

  // Load items or init empty
  let wardrobeItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Helper: file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Render items grid
  function renderItems() {
    itemsGrid.innerHTML = '';

    if (wardrobeItems.length === 0) {
      itemsGrid.innerHTML = '<p>No clothing items added yet.</p>';
      return;
    }

    wardrobeItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="item-name">${item.name}</div>
        <div class="item-category">${item.category}</div>
        <div class="item-color" title="Color" style="background-color:${item.color};"></div>
        <div class="item-mood">${item.mood ? item.mood.join(', ') : ''}</div>
        <div class="flags-container">
          ${item.favorite ? '<span class="flag favorite" title="Favorite">♥</span>' : ''}
          ${item.new ? '<span class="flag new" title="New">New</span>' : ''}
          ${item.lastWorn ? '<span class="flag lastWorn" title="Last Worn">👗</span>' : ''}
        </div>
      `;

      itemsGrid.appendChild(div);
    });
  }

  // Save to localStorage
  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobeItems));
  }

  // Handle add item
  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const color = document.getElementById('itemColor').value;
    const moodRaw = document.getElementById('itemMood').value.trim();
    const mood = moodRaw ? moodRaw.split(',').map(m => m.trim()).filter(Boolean) : [];
    const favorite = document.getElementById('favoriteFlag').checked;
    const isNew = document.getElementById('newFlag').checked;
    const lastWorn = document.getElementById('lastWornFlag').checked;
    const imageFile = document.getElementById('itemImage').files[0];

    if (!imageFile) {
      alert('Please select an image file.');
      return;
    }

    const imageBase64 = await fileToBase64(imageFile);

    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      color,
      mood,
      favorite,
      new: isNew,
      lastWorn,
      image: imageBase64,
    };

    wardrobeItems.push(newItem);
    saveItems();
    renderItems();
    uploadForm.reset();
  });

  // Initial render
  renderItems();

})();

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log("File read successfully");
      resolve(reader.result);
    };
    reader.onerror = (e) => {
      console.error("File read error", e);
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}