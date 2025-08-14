// study.js
// Handles quiz generation form logic and navigation to quiz page
document.addEventListener('DOMContentLoaded', function () {
  const filterFamiliarity = document.getElementById('filter-familiarity');
  // Remove fetch and use global variable
  // const DATA_URL = 'data/Digital_Society_Question_Bank_Master_flat.json';
  // fetch(DATA_URL)
  //   .then(res => res.json())
  //   .then(data => {
  //     ...
  //   });
  // Instead, use localStorage
  let allData = [];
  try {
    const raw = localStorage.getItem('digitalSocietyQuestionBank');
    if (raw) allData = JSON.parse(raw);
  } catch { allData = []; }
  const form = document.getElementById('quiz-form');
  const numQuestionsInput = document.getElementById('num-questions');
  const numQuestionsError = document.getElementById('num-questions-error');
  const generateCustomBtn = document.getElementById('generate-custom');
    const generateRandomBtn = document.getElementById('generate-random');
    // Random quiz form elements
    const randomForm = document.getElementById('random-quiz-form');
    const randomNumQuestionsInput = document.getElementById('random-num-questions');
    const randomNumQuestionsError = document.getElementById('random-num-questions-error');
  const filterSource = document.getElementById('filter-source');
  const filterAuthor = document.getElementById('filter-author');
  const filterPaper = document.getElementById('filter-paper');
  const conceptsList = document.getElementById('concepts-list');
  const contentList = document.getElementById('content-list');
  const contextsList = document.getElementById('contexts-list');
  const challengesList = document.getElementById('challenges-list');
  const ao1List = document.getElementById('ao1-list');
  const ao2List = document.getElementById('ao2-list');
  const ao3List = document.getElementById('ao3-list');

  // allData is already initialized above

  function renderDropdown(select, values, label) {
    select.innerHTML = `<option value="">All ${label}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
  }

  function renderTagCheckboxes(container, tags, group) {
    container.innerHTML = tags.length ? tags.map(tag => `
      <label class="block text-sm mb-1"><input type="checkbox" class="tag-filter" data-group="${group}" value="${tag}"> ${tag}</label>
    `).join('') : '<div class="text-xs text-white/50">No tags</div>';
  }

  function renderCommandTermCheckboxes(container, terms) {
    container.innerHTML = terms.map(term => `
      <label class="block text-sm mb-1"><input type="checkbox" class="command-term-filter" value="${term}"> ${term}</label>
    `).join('');
  }

  function getCheckedTags() {
    const checked = {ConceptTags: [], ContentTags: [], ContextTags: [], ChallengeTags: []};
    document.querySelectorAll('.tag-filter:checked').forEach(cb => {
      const group = cb.getAttribute('data-group');
      checked[group].push(cb.value);
    });
    return checked;
  }

  function getCheckedCommandTerms() {
    return Array.from(document.querySelectorAll('.command-term-filter:checked')).map(cb => cb.value);
  }

  function validateNumQuestions(input, errorSpan) {
    const val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1 || val > 100) {
      errorSpan.textContent = 'Please enter a number between 1 and 100.';
      errorSpan.style.display = '';
      return false;
    }
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
    return true;
  }

  numQuestionsInput.addEventListener('input', function() {
        let data = [];
        try {
          const raw = localStorage.getItem('digitalSocietyQuestionBank');
          if (raw) data = JSON.parse(raw);
        } catch { data = []; }
  });
  randomNumQuestionsInput.addEventListener('input', function() {
    validateNumQuestions(randomNumQuestionsInput, randomNumQuestionsError);
  });

  numQuestionsInput.addEventListener('input', validateNumQuestions);

  // Accordion logic
  document.getElementById('tags-accordion-toggle').addEventListener('click', function() {
    const content = document.getElementById('tags-accordion-content');
    const arrow = document.getElementById('tags-accordion-arrow');
    const isOpen = content.style.display !== 'none';
    content.style.display = isOpen ? 'none' : '';
    arrow.textContent = isOpen ? '▼' : '▲';
  });
  document.getElementById('command-terms-accordion-toggle').addEventListener('click', function() {
    const content = document.getElementById('command-terms-accordion-content');
    const arrow = document.getElementById('command-terms-accordion-arrow');
    const isOpen = content.style.display !== 'none';
    content.style.display = isOpen ? 'none' : '';
    arrow.textContent = isOpen ? '▼' : '▲';
  });

  // Load data and populate filters
  const sources = new Set();
  const authors = new Set();
  const papers = new Set();
  const conceptTags = new Set();
  const contentTags = new Set();
  const contextTags = new Set();
  const challengeTags = new Set();
  const ao1 = ['Define','Identify','Describe','Outline','State'];
  const ao2 = ['Analyse','Distinguish','Explain','Suggest'];
  const ao3 = ['Compare','Compare and contrast','Contrast','Discuss','Examine','Evaluate','Justify','To what extent','Recommend'];
  for (const row of allData) {
    if (row.Source) sources.add(row.Source);
    if (row.Author) authors.add(row.Author);
    if (row.PaperID) papers.add(row.PaperID);
    (Array.isArray(row.ConceptTags) ? row.ConceptTags : []).forEach(t => conceptTags.add(t));
    (Array.isArray(row.ContentTags) ? row.ContentTags : []).forEach(t => contentTags.add(t));
    (Array.isArray(row.ContextTags) ? row.ContextTags : []).forEach(t => contextTags.add(t));
    (Array.isArray(row.ChallengeTags) ? row.ChallengeTags : []).forEach(t => challengeTags.add(t));
  }
  renderDropdown(filterSource, Array.from(sources).sort(), 'Sources');
  renderDropdown(filterAuthor, Array.from(authors).sort(), 'Authors');
  renderDropdown(filterPaper, Array.from(papers).sort(), 'Paper Styles');
  renderTagCheckboxes(conceptsList, Array.from(conceptTags).sort(), 'ConceptTags');
  renderTagCheckboxes(contentList, Array.from(contentTags).sort(), 'ContentTags');
  renderTagCheckboxes(contextsList, Array.from(contextTags).sort(), 'ContextTags');
  renderTagCheckboxes(challengesList, Array.from(challengeTags).sort(), 'ChallengeTags');
  renderCommandTermCheckboxes(ao1List, ao1);
  renderCommandTermCheckboxes(ao2List, ao2);
  renderCommandTermCheckboxes(ao3List, ao3);

  function filterQuestionsCustom() {
    let filtered = allData;
    if (filterSource.value) filtered = filtered.filter(q => q.Source === filterSource.value);
    if (filterAuthor.value) filtered = filtered.filter(q => q.Author === filterAuthor.value);
    if (filterPaper.value) filtered = filtered.filter(q => String(q.PaperID) === String(filterPaper.value));
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
    const checkedTerms = getCheckedCommandTerms();
    if (checkedTerms.length) {
      filtered = filtered.filter(q => checkedTerms.includes(q.CommandTerm));
    }
    // Familiarity filter
    if (filterFamiliarity && filterFamiliarity.value !== 'both') {
      // Get all seen question IDs from localStorage questionBankQuizResponses
      let seenIds = new Set();
      try {
        const quizResponses = JSON.parse(localStorage.getItem('questionBankQuizResponses') || '{}');
        Object.values(quizResponses).forEach(qr => {
          if (Array.isArray(qr.responses)) {
            qr.responses.forEach(r => seenIds.add(String(r.id)));
          }
        });
      } catch {}
      if (filterFamiliarity.value === 'seen') {
        filtered = filtered.filter(q => seenIds.has(String(q.ID)));
      } else if (filterFamiliarity.value === 'unseen') {
        filtered = filtered.filter(q => !seenIds.has(String(q.ID)));
      }
    }
    return filtered;
  }

  function filterQuestionsRandom(num) {
    // Random: select one content tag, all AO1/AO2 command terms
    const contentTags = Array.from(new Set(allData.flatMap(q => Array.isArray(q.ContentTags) ? q.ContentTags : [])));
    if (!contentTags.length) return [];
    const randomTag = contentTags[Math.floor(Math.random() * contentTags.length)];
    const allowedTerms = ['Define','Identify','Describe','Outline','State','Analyse','Distinguish','Explain','Suggest'];
    let filtered = allData.filter(q =>
      Array.isArray(q.ContentTags) && q.ContentTags.includes(randomTag) && allowedTerms.includes(q.CommandTerm)
    );
    // Shuffle and pick num
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, num);
  }

  function goToQuizPage(questions, config) {
    // Create a new quiz entry in localStorage.questionBankQuizResponses
    let store = {};
    try {
      store = JSON.parse(localStorage.getItem('questionBankQuizResponses')) || {};
    } catch { store = {}; }
    // Find max ID and increment
    let maxId = 0;
    Object.keys(store).forEach(id => {
      const n = parseInt(id, 10);
      if (!isNaN(n) && n > maxId) maxId = n;
    });
    const newQuizId = (maxId + 1).toString();
    store[newQuizId] = {
      questions: questions.map(q => q.ID), // store question IDs
      config,
      responses: [],
      lastSave: null
    };
    localStorage.setItem('questionBankQuizResponses', JSON.stringify(store));
    // Store quiz JSON and config in sessionStorage for page load
    sessionStorage.setItem('customQuiz', JSON.stringify(questions));
    sessionStorage.setItem('quizConfig', JSON.stringify(config));
    window.location.href = `quiz.html?quiz=${encodeURIComponent(newQuizId)}`;
  }

  generateCustomBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!validateNumQuestions(numQuestionsInput, numQuestionsError)) return;
    const num = parseInt(numQuestionsInput.value, 10);
  let questions = filterQuestionsCustom();
    if (questions.length > num) {
      // Shuffle and pick num
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      questions = questions.slice(0, num);
    }
    // Gather config
    const config = {
      source: filterSource.value || '',
      author: filterAuthor.value || '',
      paper: filterPaper.value || '',
      tags: getCheckedTags(),
      commandTerms: getCheckedCommandTerms(),
      numQuestions: num
    };
  goToQuizPage(questions, config);
  });

  generateRandomBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!validateNumQuestions(randomNumQuestionsInput, randomNumQuestionsError)) return;
    const num = parseInt(randomNumQuestionsInput.value, 10);
    const questions = filterQuestionsRandom(num);
    // Gather config for random: only numQuestions
    const config = {
      source: '',
      author: '',
      paper: '',
      tags: {},
      commandTerms: [],
      numQuestions: num
    };
  goToQuizPage(questions, config);
  });
});

