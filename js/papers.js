// papers.js
// Renders a table of exams grouped by ExamID, with clickable rows for details

document.addEventListener('DOMContentLoaded', function () {
  const resultsCount = document.getElementById('results-count');
  // Remove fetch and use global variable
  // const DATA_URL = 'data/Digital_Society_Question_Bank_Master_flat.json';
  const tableBody = document.getElementById('papers-table-body');
  const loadingRow = document.getElementById('papers-loading');
  const filterSource = document.getElementById('filter-source');
  const filterAuthor = document.getElementById('filter-author');
  const filterPaper = document.getElementById('filter-paper');
  const searchInput = document.getElementById('search-input');
  const orderSelect = document.getElementById('order-select');
  const orderDirToggle = document.getElementById('order-dir-toggle');
  const orderDirSpan = document.getElementById('order-dir');
  // Tag filter elements
  const conceptsList = document.getElementById('concepts-list');
  const contentList = document.getElementById('content-list');
  const contextsList = document.getElementById('contexts-list');
  const challengesList = document.getElementById('challenges-list');
  let orderAsc = false;
  let orderBy = 'date';
  let allData = [];
  let allRows = [];
  let tagSets = {ConceptTags: new Set(), ContentTags: new Set(), ContextTags: new Set(), ChallengeTags: new Set()};

  function renderDropdown(select, values, label) {
    select.innerHTML = `<option value=\"\">All ${label}</option>` + values.map(v => `<option value=\"${v}\">${v}</option>`).join('');
  }

  function renderTagCheckboxes(container, tags, group) {
    container.innerHTML = tags.length ? tags.map(tag => `
      <label class="block text-sm mb-1"><input type="checkbox" class="tag-filter" data-group="${group}" value="${tag}"> ${tag}</label>
    `).join('') : '<div class="text-xs text-white/50">No tags</div>';
  }

  function getCheckedTags() {
    const checked = {ConceptTags: [], ContentTags: [], ContextTags: [], ChallengeTags: []};
    document.querySelectorAll('.tag-filter:checked').forEach(cb => {
      const group = cb.getAttribute('data-group');
      checked[group].push(cb.value);
    });
    return checked;
  }

  function examHasAllTags(exam, checked, allData) {
    // Find all questions for this exam
    const examQuestions = allData.filter(q => String(q.ExamID) === String(exam.ExamID));
    // For each tag group, if any tags are checked, at least one question must have all checked tags in that group
    for (const group of ['ConceptTags','ContentTags','ContextTags','ChallengeTags']) {
      if (checked[group].length) {
        const found = examQuestions.some(q => {
          const tags = Array.isArray(q[group]) ? q[group] : [];
          return checked[group].every(tag => tags.includes(tag));
        });
        if (!found) return false;
      }
    }
    return true;
  }

  function renderTable(filtered) {
    tableBody.innerHTML = '';
    if (resultsCount) {
      resultsCount.textContent = filtered.length === 1 ? '1 result' : filtered.length + ' results';
    }
    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-white/60 py-8">No exams found.</td></tr>';
      return;
    }
    // Helper: check if exam has any responses in localStorageExamResponses
    function hasExamResponses(examId) {
      try {
        const examResponses = JSON.parse(localStorage.getItem('questionBankExamResponses') || '{}');
        return examResponses[examId] && Array.isArray(examResponses[examId].responses) && examResponses[examId].responses.length > 0;
      } catch {}
      return false;
    }
    // Sorting logic
    let sorted = [...filtered];
    if (orderBy === 'exam-status') {
      sorted.sort((a, b) => {
        const aResp = hasExamResponses(a.ExamID) ? 1 : 0;
        const bResp = hasExamResponses(b.ExamID) ? 1 : 0;
        return orderAsc ? aResp - bResp : bResp - aResp;
      });
    } else {
      // Default: sort by date
      sorted.sort((a, b) => {
        if (orderAsc) return String(a.PublicationDate).localeCompare(String(b.PublicationDate));
        else return String(b.PublicationDate).localeCompare(String(a.PublicationDate));
      });
    }
    for (const exam of sorted) {
      const tr = document.createElement('tr');
      tr.className = 'cursor-pointer hover:bg-accent/10 transition';
      tr.onclick = () => {
        window.location.href = `exam-details.html?exam=${encodeURIComponent(exam.ExamID)}`;
      };
      const examStatusBadge = hasExamResponses(exam.ExamID)
        ? '<span class="inline-flex items-center gap-1 px-2 py-1 border border-green-500 rounded text-green-700 bg-green-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-green-500 inline-block\"></span>Responded</span>'
        : '<span class="inline-flex items-center gap-1 px-2 py-1 border border-red-500 rounded text-red-700 bg-red-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-red-500 inline-block\"></span>Not responded</span>';
      tr.innerHTML = `
        <td class=\"px-2 py-2 border-b border-black\">${exam.ExamID}</td>
        <td class=\"px-2 py-2 border-b border-black\">${exam.Source}</td>
        <td class=\"px-2 py-2 border-b border-black\">${exam.Author}</td>
        <td class=\"px-2 py-2 border-b border-black\">${exam.PublicationDate}</td>
        <td class=\"px-2 py-2 border-b border-black\">${[...exam.Papers].sort().join(', ')}</td>
        <td class=\"px-2 py-2 border-b border-black\">${exam.Level}</td>
        <td class=\"px-2 py-2 border-b border-black text-left min-w-[140px]\">${examStatusBadge}</td>
        <td class=\"px-2 py-2 border-b border-black\"><ul class=\"list-disc ml-4\">${[...exam.Titles].map(t => `<li>${t}</li>`).join('')}</ul></td>
      `;
      tableBody.appendChild(tr);
    }
  }

  function filterAndRender() {
    let filtered = allRows;
    // Filter by dropdowns
    if (filterSource.value) filtered = filtered.filter(e => e.Source === filterSource.value);
    if (filterAuthor.value) filtered = filtered.filter(e => e.Author === filterAuthor.value);
    if (filterPaper.value) filtered = filtered.filter(e => [...e.Papers].map(String).includes(filterPaper.value));
    // Tag filters
    const checked = getCheckedTags();
    filtered = filtered.filter(e => examHasAllTags(e, checked, allData));
    // Command term filter
    const checkedTerms = Array.from(document.querySelectorAll('.command-term-filter:checked')).map(cb => cb.value);
    if (checkedTerms.length) {
      filtered = filtered.filter(e => {
        // Find all questions for this exam
        const examQuestions = allData.filter(q => String(q.ExamID) === String(e.ExamID));
        return examQuestions.some(q => checkedTerms.includes(q.CommandTerm));
      });
    }
    // Search
    const search = searchInput.value.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(e => {
        const inTitles = [...e.Titles].some(t => t.toLowerCase().includes(search));
        // Search in allData for this exam's questions
        const examQuestions = allData.filter(q => String(q.ExamID) === String(e.ExamID));
        const inQuestions = examQuestions.some(q =>
          (q.QuestionText && q.QuestionText.toLowerCase().includes(search)) ||
          (q.AnswerText && q.AnswerText.toLowerCase().includes(search))
        );
        return inTitles || inQuestions;
      });
    }
    // Order
    filtered = filtered.sort((a, b) => {
      if (orderAsc) return String(a.PublicationDate).localeCompare(String(b.PublicationDate));
      else return String(b.PublicationDate).localeCompare(String(a.PublicationDate));
    });
    renderTable(filtered);
  }

  // Instead, use global variable
    let data = [];
    try {
      const raw = localStorage.getItem('digitalSocietyQuestionBank');
      if (raw) data = JSON.parse(raw);
    } catch { data = []; }
  allData = data;
  // Group by ExamID
  const exams = {};
  const sources = new Set();
  const authors = new Set();
  const papers = new Set();
  // Tag sets
  const conceptTags = new Set();
  const contentTags = new Set();
  const contextTags = new Set();
  const challengeTags = new Set();
  for (const row of data) {
    if (!row.ExamID) continue;
    const id = row.ExamID;
    if (!exams[id]) {
      exams[id] = {
        ExamID: id,
        Source: row.Source || '',
        Author: row.Author || '',
        PublicationDate: row.PublicationDate || '',
        Level: row.Level || '',
        Papers: new Set(),
        Titles: new Set(),
      };
    }
    if (row.PaperID) exams[id].Papers.add(row.PaperID);
    if (row.Title) exams[id].Titles.add(row.Title);
    if (row.Source) sources.add(row.Source);
    if (row.Author) authors.add(row.Author);
    if (row.PaperID) papers.add(row.PaperID);
    // Tag sets
    (Array.isArray(row.ConceptTags) ? row.ConceptTags : []).forEach(t => conceptTags.add(t));
    (Array.isArray(row.ContentTags) ? row.ContentTags : []).forEach(t => contentTags.add(t));
    (Array.isArray(row.ContextTags) ? row.ContextTags : []).forEach(t => contextTags.add(t));
    (Array.isArray(row.ChallengeTags) ? row.ChallengeTags : []).forEach(t => challengeTags.add(t));
  }
  allRows = Object.values(exams);
  // Populate dropdowns
  renderDropdown(filterSource, Array.from(sources).sort(), 'Sources');
  renderDropdown(filterAuthor, Array.from(authors).sort(), 'Authors');
  renderDropdown(filterPaper, Array.from(papers).sort(), 'Paper Styles');
  // Populate tag checkboxes
  renderTagCheckboxes(conceptsList, Array.from(conceptTags).sort(), 'ConceptTags');
  renderTagCheckboxes(contentList, Array.from(contentTags).sort(), 'ContentTags');
  renderTagCheckboxes(contextsList, Array.from(contextTags).sort(), 'ContextTags');
  renderTagCheckboxes(challengesList, Array.from(challengeTags).sort(), 'ChallengeTags');
  if (loadingRow) loadingRow.remove();
  filterAndRender();

  // Event listeners
  [filterSource, filterAuthor, filterPaper, searchInput].forEach(el => {
    el && el.addEventListener('input', filterAndRender);
  });
  orderDirToggle && orderDirToggle.addEventListener('click', function() {
    orderAsc = !orderAsc;
    orderDirSpan.textContent = orderAsc ? '↑' : '↓';
    filterAndRender();
  });
  orderSelect && orderSelect.addEventListener('change', function() {
    orderBy = orderSelect.value;
    filterAndRender();
  });
  // Tag checkbox listeners
  document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('tag-filter')) {
      filterAndRender();
    }
  });
});
