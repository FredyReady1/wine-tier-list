const tiers = [
  { id: 's', label: 'S', name: 'Exceptional' },
  { id: 'a', label: 'A', name: 'Excellent' },
  { id: 'b', label: 'B', name: 'Very good' },
  { id: 'c', label: 'C', name: 'Good' },
  { id: 'd', label: 'D', name: 'Average' },
  { id: 'f', label: 'F', name: 'Poor' }
];

const STORAGE_KEY = 'wine-tier-list-v1';
const board = document.querySelector('#tierBoard');
const unranked = document.querySelector('#unranked');
const form = document.querySelector('#wineForm');
const fileInput = document.querySelector('#wineImage');
const fileName = document.querySelector('#fileName');
const countLabel = document.querySelector('#wineCount');
const template = document.querySelector('#wineCardTemplate');
let wines = loadWines();
let draggedId = null;

function buildBoard() {
  board.innerHTML = '';
  tiers.forEach((tier) => {
    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `
      <div class="tier-label tier-${tier.id}">
        <strong>${tier.label}</strong>
        <span>${tier.name}</span>
      </div>
      <div class="drop-zone card-grid" data-tier="${tier.id}" aria-label="${tier.name} tier"></div>
    `;
    board.appendChild(row);
  });
  wireDropZones();
}

function loadWines() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWines() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
  } catch (error) {
    alert('Your browser storage is full. Try smaller images or delete some wines.');
    console.error(error);
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const max = 900;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

function render() {
  document.querySelectorAll('.wine-card').forEach((card) => card.remove());
  wines.forEach((wine) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = wine.id;
    card.querySelector('img').src = wine.image;
    card.querySelector('img').alt = `${wine.name} bottle`;
    card.querySelector('h4').textContent = wine.name;
    card.querySelector('p').textContent = wine.notes || 'No notes added';

    card.addEventListener('dragstart', () => {
      draggedId = wine.id;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      draggedId = null;
      card.classList.remove('dragging');
    });
    card.querySelector('.delete-button').addEventListener('click', () => {
      const confirmed = confirm(`Delete ${wine.name}?`);
      if (!confirmed) return;
      wines = wines.filter((item) => item.id !== wine.id);
      saveWines();
      render();
    });

    const target = document.querySelector(`[data-tier="${wine.tier || 'unranked'}"]`);
    target.appendChild(card);
  });
  countLabel.textContent = `${wines.length} ${wines.length === 1 ? 'wine' : 'wines'}`;
}

function wireDropZones() {
  document.querySelectorAll('.drop-zone').forEach((zone) => {
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('drag-over');
      const wine = wines.find((item) => item.id === draggedId);
      if (!wine) return;
      wine.tier = zone.dataset.tier;
      saveWines();
      render();
    });
  });
}

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || 'Choose an image';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const imageFile = fileInput.files[0];
  if (!imageFile) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Adding…';

  try {
    const image = await compressImage(imageFile);
    wines.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: document.querySelector('#wineName').value.trim(),
      notes: document.querySelector('#wineNotes').value.trim(),
      image,
      tier: 'unranked'
    });
    saveWines();
    render();
    form.reset();
    fileName.textContent = 'Choose an image';
  } catch (error) {
    console.error(error);
    alert('That image could not be added. Please try a JPG, PNG, or HEIC image supported by your browser.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Add wine';
  }
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (!wines.length) return;
  const confirmed = confirm('Clear every wine and reset the board?');
  if (!confirmed) return;
  wines = [];
  saveWines();
  render();
});

document.querySelector('#exportBtn').addEventListener('click', async () => {
  const exportButton = document.querySelector('#exportBtn');
  exportButton.disabled = true;
  exportButton.textContent = 'Creating image…';
  document.body.classList.add('exporting');

  try {
    const canvas = await html2canvas(document.querySelector('#captureArea'), {
      scale: 2,
      backgroundColor: '#f8f1e7',
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `wine-tier-list-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error(error);
    alert('The image could not be exported. Please try again.');
  } finally {
    document.body.classList.remove('exporting');
    exportButton.disabled = false;
    exportButton.textContent = 'Export as image';
  }
});

buildBoard();
wireDropZones();
render();
