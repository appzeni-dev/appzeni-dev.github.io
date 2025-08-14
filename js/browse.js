// papers.js
// Renders a table of exams grouped by ExamID, with clickable rows for details

document.addEventListener('DOMContentLoaded', function () {
  const resultsCount = document.getElementById('results-count');
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
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-white/60 py-8">No questions found.</td></tr>';
      return;
    }
    // Helper: has exam response
    function hasExamResponse(questionId) {
      try {
        const examResponses = JSON.parse(localStorage.getItem('questionBankExamResponses') || '{}');
        for (const examId in examResponses) {
          if (examResponses[examId].responses && examResponses[examId].responses.some(r => String(r.id) === String(questionId))) {
            return true;
          }
        }
      } catch {}
      return false;
    }
    // Helper: get quiz count
    function getQuizCount(questionId) {
      try {
        const quizResponses = JSON.parse(localStorage.getItem('questionBankQuizResponses') || '{}');
        let count = 0;
        for (const quizId in quizResponses) {
          if (quizResponses[quizId].responses) {
            count += quizResponses[quizId].responses.filter(r => String(r.id) === String(questionId)).length;
          }
        }
        return count;
      } catch {}
      return 0;
    }
    // Sorting logic
    let sorted = [...filtered];
    if (orderBy === 'exam-status') {
      // Sort by exam responded (true first if desc, false first if asc)
      sorted.sort((a, b) => {
        const aResp = hasExamResponse(a.ID) ? 1 : 0;
        const bResp = hasExamResponse(b.ID) ? 1 : 0;
        return orderAsc ? aResp - bResp : bResp - aResp;
      });
    } else if (orderBy === 'quiz-status') {
      // Sort by quiz count
      sorted.sort((a, b) => {
        const aCount = getQuizCount(a.ID);
        const bCount = getQuizCount(b.ID);
        return orderAsc ? aCount - bCount : bCount - aCount;
      });
    }
    // ...existing code...
    for (const q of sorted) {
      const tr = document.createElement('tr');
      const examResponded = hasExamResponse(q.ID);
      const quizCount = getQuizCount(q.ID);
      // Tailwind border and dot badges
      const examBadge = examResponded
        ? '<span class="inline-flex items-center gap-1 px-2 py-1 border border-green-500 rounded text-green-700 bg-green-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-green-500 inline-block\"></span>Responded</span>'
        : '<span class="inline-flex items-center gap-1 px-2 py-1 border border-red-500 rounded text-red-700 bg-red-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-red-500 inline-block\"></span>Not responded</span>';
      const quizBadge = quizCount > 0
        ? `<span class="inline-flex items-center gap-1 px-2 py-1 border border-green-500 rounded text-green-700 bg-green-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-green-500 inline-block\"></span>Quizzes (${quizCount})</span>`
        : `<span class="inline-flex items-center gap-1 px-2 py-1 border border-red-500 rounded text-red-700 bg-red-50 text-xs font-semibold"><span class=\"w-2 h-2 rounded-full bg-red-500 inline-block\"></span>Quizzes (0)</span>`;
      tr.innerHTML =
        '<td class="px-2 py-2 border-b border-black">' + (q.ID !== undefined ? q.ID : '') + '</td>' +
        '<td class="px-2 py-2 border-b border-black">' + (q.ExamID !== undefined ? q.ExamID : '') + '</td>' +
        '<td class="px-2 py-2 border-b border-black">' + (q.Source || '') + '</td>' +
        '<td class="px-2 py-2 border-b border-black" title="' + (q.Stimulus ? q.Stimulus.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '') + '">' + (q.QuestionText ? q.QuestionText : '') + '</td>' +
  '<td class="px-2 py-2 border-b border-black text-left">' + examBadge + '</td>' +
  '<td class="px-2 py-2 border-b border-black text-left">' + quizBadge + '</td>' +
        '<td class="px-2 py-2 border-b border-black min-w-[160px]">' +
          '<ul class="list-none p-0 m-0 flex flex-col gap-1">' +
            '<li><a href="#" class="action-link see-answer-link underline" style="text-decoration-thickness:2px;" data-answer="' + (q.AnswerText ? encodeURIComponent(q.AnswerText) : '') + '">See answer</a></li>' +
            '<li><a href="exam-details.html?exam=' + encodeURIComponent(q.ExamID) + '" class="action-link see-exam-link underline" style="text-decoration-thickness:2px;" target="_blank">See exam</a></li>' +
          '</ul>' +
        '</td>';
// Set action link colors based on theme
function setActionLinkColors() {
  const theme = localStorage.getItem('theme');
  const links = document.querySelectorAll('.action-link');
  links.forEach(link => {
    if (theme === 'light') {
      link.style.color = '#111';
    } else {
      link.style.color = '#fff';
    }
  });
}
document.addEventListener('DOMContentLoaded', setActionLinkColors);
setTimeout(setActionLinkColors, 100);

// Listen for theme changes and update link colors
document.addEventListener('themechange', setActionLinkColors);

// If theme-toggle.js does not dispatch a custom event, patch it here
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', function() {
    setTimeout(() => {
      const event = new Event('themechange');
      document.dispatchEvent(event);
    }, 50);
  });
}
      tableBody.appendChild(tr);
    }
    // Add event listeners for see answer links
    document.querySelectorAll('.see-answer-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const answer = decodeURIComponent(link.getAttribute('data-answer') || '');
        const modal = document.getElementById('answer-modal');
        const modalAnswerText = document.getElementById('modal-answer-text');
        if (modal && modalAnswerText) {
          modalAnswerText.innerHTML = answer ? answer.replace(/\n/g, '<br>') : '<span class="muted-text">No answer provided.</span>';
          modal.style.display = '';
        }
      });
    });
  }

  function getCheckedCommandTerms() {
    return Array.from(document.querySelectorAll('.command-term-filter:checked')).map(cb => cb.value);
  }

  function filterAndRender() {
    let filtered = allData;
    // Filter by dropdowns
    if (filterSource.value) filtered = filtered.filter(q => q.Source === filterSource.value);
    if (filterAuthor && filterAuthor.value) filtered = filtered.filter(q => q.Author === filterAuthor.value);
    if (filterPaper.value) filtered = filtered.filter(q => String(q.PaperID) === String(filterPaper.value));
    // Tag filters
    const checked = getCheckedTags();
    filtered = filtered.filter(q => {
      for (const group of ['ConceptTags','ContentTags','ContextTags','ChallengeTags']) {
        if (checked[group].length) {
          const tags = Array.isArray(q[group]) ? q[group] : [];
          if (!checked[group].every(tag => tags.includes(tag))) return false;
        }
      }
      return true;
    });
    // Command term filter
    const checkedTerms = getCheckedCommandTerms();
    if (checkedTerms.length) {
      filtered = filtered.filter(q => checkedTerms.includes(q.CommandTerm));
    }
    // Search
    const search = searchInput.value.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(q => {
        return (q.QuestionText && q.QuestionText.toLowerCase().includes(search)) ||
               (q.AnswerText && q.AnswerText.toLowerCase().includes(search)) ||
               (q.Stimulus && q.Stimulus.toLowerCase().includes(search));
      });
    }
    // Order
    filtered = filtered.sort((a, b) => {
      if (orderAsc) return (a.ID || 0) - (b.ID || 0);
      else return (b.ID || 0) - (a.ID || 0);
    });
    renderTable(filtered);
  }

  // Remove fetch and use global variable
  // const DATA_URL = 'data/Digital_Society_Question_Bank_Master_flat.json';
  // fetch(DATA_URL)
  //   .then(res => res.json())
  //   .then(data => {
  //     ...
  //   });
  // Instead, use global variable
    let data = [];
    try {
      const raw = localStorage.getItem('digitalSocietyQuestionBank');
      if (raw) data = JSON.parse(raw);
    } catch { data = []; }
  allData = data;
  // Tag sets
  const sources = new Set();
  const authors = new Set();
  const papers = new Set();
  const conceptTags = new Set();
  const contentTags = new Set();
  const contextTags = new Set();
  const challengeTags = new Set();
  for (const row of data) {
    if (row.Source) sources.add(row.Source);
    if (row.Author) authors.add(row.Author);
    if (row.PaperID) papers.add(row.PaperID);
    (Array.isArray(row.ConceptTags) ? row.ConceptTags : []).forEach(t => conceptTags.add(t));
    (Array.isArray(row.ContentTags) ? row.ContentTags : []).forEach(t => contentTags.add(t));
    (Array.isArray(row.ContextTags) ? row.ContextTags : []).forEach(t => contextTags.add(t));
    (Array.isArray(row.ChallengeTags) ? row.ChallengeTags : []).forEach(t => challengeTags.add(t));
  }
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
  // Tag and command term checkbox listeners
  document.addEventListener('change', function(e) {
    if (e.target && (e.target.classList.contains('tag-filter') || e.target.classList.contains('command-term-filter'))) {
      filterAndRender();
    }
  });
  // Modal close logic
  const answerModal = document.getElementById('answer-modal');
  const closeModal = document.getElementById('close-modal');
  if (closeModal && answerModal) {
    closeModal.addEventListener('click', function() {
      answerModal.style.display = 'none';
    });
    answerModal.addEventListener('click', function(e) {
      if (e.target === answerModal) answerModal.style.display = 'none';
    });
  }
});
