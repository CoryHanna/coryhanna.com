const setStatus = (element, message, isError = false) => {
  element.textContent = message;
  element.classList.toggle('error', isError);
};

async function copyText(text, statusElement) {
  if (!text.trim()) {
    setStatus(statusElement, 'Nothing to copy.', true);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus(statusElement, 'Copied.');
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    setStatus(statusElement, copied ? 'Copied.' : 'Copy failed.', !copied);
  }
}

const soqlForm = document.getElementById('soql-form');
const soqlOutput = document.getElementById('soql-output');
const soqlStatus = document.getElementById('soql-status');

function buildSoql() {
  const objectName = document.getElementById('soql-object').value.trim();
  const fields = document.getElementById('soql-fields').value
    .split(/[\n,]+/)
    .map(field => field.trim())
    .filter(Boolean);
  const whereClause = document.getElementById('soql-where').value.trim().replace(/^WHERE\s+/i, '');
  const orderField = document.getElementById('soql-order').value.trim().replace(/^ORDER\s+BY\s+/i, '');
  const direction = document.getElementById('soql-direction').value;
  const limitInput = document.getElementById('soql-limit').value;

  if (!objectName || fields.length === 0) {
    setStatus(soqlStatus, 'Add an object and at least one field.', true);
    return;
  }

  const lines = [`SELECT ${fields.join(', ')}`, `FROM ${objectName}`];
  if (whereClause) lines.push(`WHERE ${whereClause}`);
  if (orderField) lines.push(`ORDER BY ${orderField} ${direction}`);
  if (limitInput) lines.push(`LIMIT ${Math.min(50000, Math.max(1, Number(limitInput)))}`);

  soqlOutput.textContent = lines.join('\n');
  setStatus(soqlStatus, 'Query ready.');
}

soqlForm.addEventListener('submit', event => {
  event.preventDefault();
  buildSoql();
});

document.getElementById('copy-soql').addEventListener('click', () => copyText(soqlOutput.textContent, soqlStatus));

const suffixCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';

function convertSalesforceId(id) {
  if (id.length === 18) return id;

  let suffix = '';
  for (let group = 0; group < 3; group += 1) {
    let flags = 0;
    for (let character = 0; character < 5; character += 1) {
      const value = id[group * 5 + character];
      if (value >= 'A' && value <= 'Z') flags += 1 << character;
    }
    suffix += suffixCharacters[flags];
  }
  return id + suffix;
}

const idForm = document.getElementById('id-form');
const idInput = document.getElementById('id-input');
const idOutput = document.getElementById('id-output');
const idStatus = document.getElementById('id-status');

idForm.addEventListener('submit', event => {
  event.preventDefault();
  const ids = idInput.value.split(/[\s,]+/).map(id => id.trim()).filter(Boolean);
  const invalidIds = ids.filter(id => !/^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/.test(id));

  if (ids.length === 0) {
    idOutput.value = '';
    setStatus(idStatus, 'Paste at least one Salesforce ID.', true);
    return;
  }

  if (invalidIds.length > 0) {
    idOutput.value = '';
    setStatus(idStatus, `${invalidIds.length} invalid ID${invalidIds.length === 1 ? '' : 's'} found.`, true);
    return;
  }

  idOutput.value = ids.map(convertSalesforceId).join('\n');
  setStatus(idStatus, `${ids.length} ID${ids.length === 1 ? '' : 's'} ready.`);
});

document.getElementById('copy-ids').addEventListener('click', () => copyText(idOutput.value, idStatus));

function parseCsv(source) {
  const text = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if (character === '\n' && !inQuotes) {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function serializeCsv(rows) {
  return rows.map(row => row.map(cell => {
    const value = String(cell ?? '');
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(',')).join('\r\n');
}

const csvFile = document.getElementById('csv-file');
const cleanCsvButton = document.getElementById('clean-csv');
const downloadCsvButton = document.getElementById('download-csv');
const csvFileName = document.getElementById('csv-file-name');
const csvPreview = document.getElementById('csv-preview');
const csvStatus = document.getElementById('csv-status');
let cleanedCsv = '';
let cleanedFileName = 'cleaned-data.csv';

csvFile.addEventListener('change', () => {
  const file = csvFile.files[0];
  cleanedCsv = '';
  downloadCsvButton.disabled = true;
  cleanCsvButton.disabled = !file;
  csvFileName.textContent = file ? file.name : 'No file selected';
  csvPreview.textContent = file ? 'Ready to clean. Choose options, then select CLEAN CSV.' : 'Select a CSV file to preview cleaned data.';
  setStatus(csvStatus, '');
});

cleanCsvButton.addEventListener('click', async () => {
  const file = csvFile.files[0];
  if (!file) return;

  try {
    let rows = parseCsv(await file.text());
    const originalRowCount = rows.length;

    if (document.getElementById('trim-cells').checked) {
      rows = rows.map(row => row.map(cell => cell.trim()));
    }

    if (document.getElementById('remove-blanks').checked) {
      rows = rows.filter(row => row.some(cell => cell !== ''));
    }

    if (document.getElementById('remove-duplicates').checked) {
      const seen = new Set();
      rows = rows.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    cleanedCsv = serializeCsv(rows);
    cleanedFileName = file.name.replace(/\.csv$/i, '') + '-cleaned.csv';
    const previewLines = cleanedCsv.split(/\r?\n/);
    csvPreview.textContent = previewLines.slice(0, 8).join('\n') + (previewLines.length > 8 ? '\n…' : '');
    downloadCsvButton.disabled = rows.length === 0;
    setStatus(csvStatus, `${rows.length} row${rows.length === 1 ? '' : 's'} ready · ${originalRowCount - rows.length} removed.`);
  } catch {
    cleanedCsv = '';
    downloadCsvButton.disabled = true;
    setStatus(csvStatus, 'That file could not be cleaned.', true);
  }
});

downloadCsvButton.addEventListener('click', () => {
  if (!cleanedCsv) return;
  const fileUrl = URL.createObjectURL(new Blob([cleanedCsv], { type: 'text/csv;charset=utf-8' }));
  const downloadLink = document.createElement('a');
  downloadLink.href = fileUrl;
  downloadLink.download = cleanedFileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(fileUrl);
  setStatus(csvStatus, 'Download started.');
});

const checklist = document.getElementById('permission-list');
const checklistItems = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
const checklistCount = document.getElementById('checklist-count');
const checklistBar = document.getElementById('checklist-bar');

function updateChecklist() {
  const checked = checklistItems.filter(item => item.checked).length;
  checklistCount.textContent = `${checked} of ${checklistItems.length} checked`;
  checklistBar.style.width = `${(checked / checklistItems.length) * 100}%`;
}

checklist.addEventListener('change', updateChecklist);
document.getElementById('reset-checklist').addEventListener('click', () => {
  checklistItems.forEach(item => { item.checked = false; });
  updateChecklist();
});
