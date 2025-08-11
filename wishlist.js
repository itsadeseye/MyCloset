(() => {
  const STORAGE_KEY_WISHLIST = 'wardrobeWishlist';
  const STORAGE_KEY_WARDROBE = 'myWardrobeItems'; // assuming same key for wardrobe items

  const wishlistForm = document.getElementById('wishlistForm');
  const wishName = document.getElementById('wishName');
  const wishCategory = document.getElementById('wishCategory');
  const wishColor = document.getElementById('wishColor');
  const wishNotes = document.getElementById('wishNotes');
  const wishlistItems = document.getElementById('wishlistItems');
  const suggestionsList = document.getElementById('suggestionsList');

  let wishlist = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHLIST)) || [];
  let wardrobeItems = JSON.parse(localStorage.getItem(STORAGE_KEY_WARDROBE)) || [];

  function saveWishlist() {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
  }

  function renderWishlist() {
    if (wishlist.length === 0) {
      wishlistItems.innerHTML = '<li>No wishlist items yet.</li>';
      return;
    }
    wishlistItems.innerHTML = '';
    wishlist.forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${item.name}</strong> (${item.category}) 
          <span style="display:inline-block;width:20px;height:20px;background-color:${item.color};border-radius:50%;border:1px solid #ccc;margin-left:8px;"></span>
          <div style="font-size:0.9rem;color:#555;">${item.notes || ''}</div>
        </div>
        <button class="remove-btn" data-index="${i}" aria-label="Remove ${item.name}">Remove</button>
      `;
      wishlistItems.appendChild(li);
    });
  }

  wishlistItems.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
      const index = parseInt(e.target.dataset.index, 10);
      wishlist.splice(index, 1);
      saveWishlist();
      renderWishlist();
      renderSuggestions();
    }
  });

  wishlistForm.addEventListener('submit', e => {
    e.preventDefault();
    const newItem = {
      name: wishName.value.trim(),
      category: wishCategory.value,
      color: wishColor.value,
      notes: wishNotes.value.trim(),
    };
    wishlist.push(newItem);
    saveWishlist();
    renderWishlist();
    renderSuggestions();
    wishlistForm.reset();
  });

  // Analyze wardrobe and wishlist to suggest missing categories/colors
  function renderSuggestions() {
    // Categories we expect to have at least one item each
    const requiredCategories = ['Tops', 'Bottoms', 'Dresses', 'Accessories', 'Shoes', 'Innerwear', 'Jackets'];

    // Get unique categories in wardrobe
    const categoriesInWardrobe = [...new Set(wardrobeItems.map(i => i.category))];

    // Find missing categories
    const missingCategories = requiredCategories.filter(cat => !categoriesInWardrobe.includes(cat));

    // Count colors frequency in wardrobe
    const colorCount = {};
    wardrobeItems.forEach(item => {
      colorCount[item.color] = (colorCount[item.color] || 0) + 1;
    });

    // Identify colors with less than 2 items (example threshold)
    const colorGaps = Object.entries(colorCount)
      .filter(([color, count]) => count < 2)
      .map(([color]) => color);

    // Compose suggestion messages
    let suggestionsHTML = '';

    if (missingCategories.length === 0 && colorGaps.length === 0 && wishlist.length === 0) {
      suggestionsHTML = '<p>Your wardrobe looks well stocked! No immediate suggestions.</p>';
    } else {
      if (missingCategories.length) {
        suggestionsHTML += <p><strong>Missing categories:</strong> ${missingCategories.join(', ')}</p>;
      }
      if (colorGaps.length) {
        suggestionsHTML += `<p><strong>Colors with few items:</strong> ${colorGaps.map(c => <span style="display:inline-block;width:20px;height:20px;background-color:${c};border-radius:50%;border:1px solid #ccc;margin-right:6px;"></span>).join('')}</p>`;
      }
      if (wishlist.length) {
        suggestionsHTML +=`<p><strong>Your Wishlist Items:</strong></p><ul>`;
        wishlist.forEach(item => {
          suggestionsHTML += <li>${item.name} (${item.category}) <span style="display:inline-block;width:20px;height:20px;background-color:${item.color};border-radius:50%;border:1px solid #ccc;margin-left:8px;"></span></li>;
        });
        suggestionsHTML += '</ul>';
      }
    }

    suggestionsList.innerHTML = suggestionsHTML;
  }

  // Initial render
  renderWishlist();
  renderSuggestions();
})();