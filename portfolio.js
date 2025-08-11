(() => {
  const STORAGE_KEY = 'outfitBoardItems';

  const uploadForm = document.getElementById('uploadForm');
  const photoInput = document.getElementById('photoInput');
  const notesInput = document.getElementById('notesInput');
  const gallery = document.getElementById('gallery');

  const editModal = document.getElementById('editModal');
  const editCloseBtn = document.getElementById('editCloseBtn');
  const editForm = document.getElementById('editForm');
  const editPhotoId = document.getElementById('editPhotoId');
  const editNotesInput = document.getElementById('editNotesInput');

  let outfitItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Convert file to base64 string
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Save to localStorage
  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outfitItems));
  }

  // Generate unique ID
  function generateId() {
    return Date.now() + Math.random().toString(16).slice(2);
  }

  // Render gallery items
  function renderGallery() {
    gallery.innerHTML = '';

    if (outfitItems.length === 0) {
      gallery.innerHTML = '<p>No outfit photos added yet.</p>';
      return;
    }

    outfitItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'photo-card';
      div.dataset.id = item.id;

      div.innerHTML = `
        <img src="${item.image}" alt="Outfit photo" />
        <div class="photo-info">
          <div class="photo-notes">${item.notes || ''}</div>
        </div>
        <div class="photo-actions">
          <button class="editBtn" aria-label="Edit notes for photo">Edit</button>
          <button class="deleteBtn" aria-label="Delete photo">Delete</button>
        </div>
      `;

      gallery.appendChild(div);
    });
  }

  // Add new photos handler
  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();

    const files = photoInput.files;
    if (!files.length) {
      alert('Please select at least one photo to upload.');
      return;
    }

    const notes = notesInput.value.trim();

    for (const file of files) {
      const base64Image = await fileToBase64(file);
      outfitItems.push({
        id: generateId(),
        image: base64Image,
        notes,
      });
    }

    saveItems();
    renderGallery();
    uploadForm.reset();
  });

  // Handle edit & delete clicks
  gallery.addEventListener('click', e => {
    const photoCard = e.target.closest('.photo-card');
    if (!photoCard) return;
    const id = photoCard.dataset.id;

    if (e.target.classList.contains('editBtn')) {
      openEditModal(id);
    } else if (e.target.classList.contains('deleteBtn')) {
      if (confirm('Are you sure you want to delete this photo?')) {
        deletePhoto(id);
      }
    }
  });

  // Open edit modal and populate notes
  function openEditModal(id) {
    const item = outfitItems.find(i => i.id === id);
    if (!item) return;

    editPhotoId.value = item.id;
    editNotesInput.value = item.notes || '';

    editModal.classList.remove('hidden');
    editNotesInput.focus();
  }

  // Close edit modal
  editCloseBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });

  // Save changes from edit modal
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = editPhotoId.value;
    const index = outfitItems.findIndex(i => i.id === id);
    if (index === -1) return;

    outfitItems[index].notes = editNotesInput.value.trim();

    saveItems();
    renderGallery();
    editModal.classList.add('hidden');
  });

  // Delete photo by id
  function deletePhoto(id) {
    outfitItems = outfitItems.filter(i => i.id !== id);
    saveItems();
    renderGallery();
  }

  // Initial render
  renderGallery();
})();