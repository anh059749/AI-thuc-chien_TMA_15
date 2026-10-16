const essayService = {
  async improveEssay(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/improve', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'We could not improve this photo. Please try again.');
    return data;
  }
};

const fileInput = document.querySelector('#file-input');
const dropZone = document.querySelector('#drop-zone');
const previewPanel = document.querySelector('#preview-panel');
const previewImage = document.querySelector('#preview-image');
const fileName = document.querySelector('#file-name');
const error = document.querySelector('#upload-error');
const improveButton = document.querySelector('#improve-button');
const readyHint = document.querySelector('#ready-hint');
const processing = document.querySelector('#processing');
const results = document.querySelector('#results');
let currentFile = null;
let previewUrl = null;
let processingTimer = null;
const processingMessages = [
  ['Reading your handwriting', 'Looking closely at your uploaded essay photo.'],
  ['Checking your writing', 'Finding grammar, clarity, and organization ideas.'],
  ['Preparing feedback', 'Writing helpful suggestions just for this essay.'],
];

function startProcessingUi() {
  const preview = document.querySelector('#loading-preview');
  preview.src = previewUrl;
  let messageIndex = 0;
  const updateMessage = () => {
    document.querySelector('#processing-title').childNodes[0].textContent = processingMessages[messageIndex][0];
    document.querySelector('#processing-copy').textContent = processingMessages[messageIndex][1];
    messageIndex = (messageIndex + 1) % processingMessages.length;
  };
  updateMessage();
  clearInterval(processingTimer);
  processingTimer = setInterval(updateMessage, 1800);
  processing.hidden = false;
}

function stopProcessingUi() {
  clearInterval(processingTimer);
  processingTimer = null;
  processing.hidden = true;
}

function showError(message) { error.textContent = message; error.hidden = false; }
function clearError() { error.hidden = true; error.textContent = ''; }
function setFile(file) {
  clearError();
  if (!file) return;
  const supported = ['image/jpeg', 'image/png', 'image/webp'];
  if (!supported.includes(file.type)) return showError('Please choose a JPG, PNG, or WEBP image.');
  if (file.size > 10 * 1024 * 1024) return showError('That photo is too large. Please choose one smaller than 10 MB.');
  currentFile = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  fileName.textContent = file.name;
  previewPanel.hidden = false;
  dropZone.hidden = true;
  improveButton.disabled = false;
  readyHint.textContent = 'Your photo is ready. Press the button when you are ready.';
}
function resetUpload() {
  currentFile = null; fileInput.value = '';
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null; previewImage.removeAttribute('src');
  previewPanel.hidden = true; dropZone.hidden = false;
  improveButton.disabled = true; readyHint.textContent = 'Add a photo first to continue.'; clearError();
}
// Force the empty state when the page first loads or is restored from browser history.
resetUpload();
window.addEventListener('pageshow', (event) => { if (event.persisted) resetUpload(); });
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
['dragenter', 'dragover'].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', (event) => setFile(event.dataTransfer.files[0]));
document.querySelector('#replace-button').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
document.querySelector('#remove-button').addEventListener('click', resetUpload);
improveButton.addEventListener('click', async () => {
  if (!currentFile) return;
  document.querySelector('#upload-section').hidden = true;
  document.querySelector('.how-it-works').hidden = true;
  startProcessingUi(); processing.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try {
    const result = await essayService.improveEssay(currentFile);
    document.querySelector('.category-card h3').textContent = result.category;
    document.querySelector('.category-copy').textContent = result.categoryDescription;
    document.querySelector('#result-image').src = previewUrl;
    document.querySelector('#ai-report').textContent = result.report;
    const guide = document.querySelector('#improvement-guide');
    guide.replaceChildren(...result.suggestions.map((suggestion) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${suggestion.title}: `;
      const quote = document.createElement('blockquote');
      quote.textContent = `“${suggestion.quote}”`;
      item.append(title, quote, suggestion.advice);
      return item;
    }));
    stopProcessingUi(); results.hidden = false; results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (requestError) {
    stopProcessingUi(); document.querySelector('#upload-section').hidden = false; document.querySelector('.how-it-works').hidden = false;
    showError(requestError.message || 'We could not improve this photo. Please try again with a clearer image.');
  }
});
function startOver() { results.hidden = true; stopProcessingUi(); document.querySelector('#upload-section').hidden = false; document.querySelector('.how-it-works').hidden = false; resetUpload(); document.querySelector('#upload-section').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
document.querySelector('#start-over-top').addEventListener('click', startOver);
document.querySelector('#start-over-bottom').addEventListener('click', startOver);
