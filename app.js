/* -------------------------
   Utility: Format Labels
-------------------------- */
function formatLabel(key) {
  return key
    .replace(/_/g, " ")                 // remove underscores
    .replace(/\b\w/g, c => c.toUpperCase()); // capitalize words
}

async function searchWord() {
  const searchInput = document.getElementById('searchInput');
  const resultDiv = document.getElementById('result');
  const query = searchInput.value.trim().toLowerCase();

  // Clear previous results
  resultDiv.innerHTML = '';

  if (!query) {
    resultDiv.innerHTML = '<p>Please enter a word.</p>';
    return;
  }

  // Determine the file path based on the first letter
  const firstLetter = query.charAt(0);
  
  if (!/[a-z]/.test(firstLetter)) {
      resultDiv.innerHTML = '<p>Please enter a valid word.</p>';
      return;
  }

  const filePath = `data/${firstLetter}/${query}.json`;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error('Word not found');
    }

    const entry = await response.json();
    displayResult(entry);

  } catch (error) {
    resultDiv.innerHTML = `<p class="error" style="color: #f87171;">${error.message}</p>`;
  }
}

function displayResult(entry) {
  const resultDiv = document.getElementById('result');
  
  let html = `
    <h2>${entry.word}</h2>
    <p><em>${entry.phonetic || ''}</em></p>

    <div class="section">
      <h3>Meanings</h3>
      ${Object.entries(entry.meanings || {}).map(([pos, meanings]) =>
        `<b>${formatLabel(pos)}</b>
         <ul>
           ${meanings.map(m =>
             `<li>
                ${m.definition}
                ${m.example ? `<br><small>Example: ${m.example}</small>` : ''}
              </li>`
           ).join("")}
         </ul>`
      ).join("")}
    </div>
  `;

  // Tense Forms
  if (entry.tense_forms) {
    html += `
    <div class="section">
      <h3>Tense Forms</h3>
      <ul>
        ${Object.entries(entry.tense_forms).map(
          ([k, v]) => `
            <li>
              <strong>${formatLabel(k)}</strong>: ${v}
            </li>`
        ).join("")}
      </ul>
    </div>`;
  }

  // Synonyms
  if (entry.synonyms && entry.synonyms.length > 0) {
    html += `
    <div class="section">
      <h3>Synonyms</h3>
      <div class="list">
        ${entry.synonyms.map(s => `<span>${s}</span>`).join("")}
      </div>
    </div>`;
  }

  // Antonyms
  if (entry.antonyms && entry.antonyms.length > 0) {
    html += `
    <div class="section">
      <h3>Antonyms</h3>
      <div class="list">
        ${entry.antonyms.map(a => `<span>${a}</span>`).join("")}
      </div>
    </div>`;
  }

  // Usage Examples
  if (entry.usage_examples && entry.usage_examples.length > 0) {
    html += `
    <div class="section">
      <h3>Usage Examples</h3>
      <ul>
        ${entry.usage_examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    </div>`;
  }

  resultDiv.innerHTML = html;
}

// Add Enter key listener for better UX
document.getElementById('searchInput').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    searchWord();
  }
});