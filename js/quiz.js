// quiz.js
// Loads and displays quiz questions from sessionStorage
document.addEventListener('DOMContentLoaded', function () {
  const questionsList = document.getElementById('quiz-questions');
  const quizMeta = document.getElementById('quiz-meta');
  let questions = [];
  let quizConfig = null;
  // Load question bank from localStorage
  let questionBank = [];
  try {
    const raw = localStorage.getItem('digitalSocietyQuestionBank');
    if (raw) questionBank = JSON.parse(raw);
  } catch { questionBank = []; }

  // Load quiz data from localStorage if revisiting a past quiz
  const quizId = (function() {
    const params = new URLSearchParams(window.location.search);
    return params.get('quiz');
  })();
  let quizEntry = null;
  if (quizId) {
    try {
      const store = JSON.parse(localStorage.getItem('questionBankQuizResponses') || '{}');
      quizEntry = store[quizId] || null;
    } catch { quizEntry = null; }
  }
  if (quizEntry && Array.isArray(quizEntry.responses)) {
    // Use the question IDs from the responses array to look up the questions
    questions = quizEntry.responses.map(resp => {
      return questionBank.find(q => String(q.ID) === String(resp.id));
    }).filter(Boolean);
    quizConfig = quizEntry.config || null;
  } else if (quizEntry && Array.isArray(quizEntry.questions)) {
    // Fallback: use questions array if responses not present
    questions = quizEntry.questions.map(qid => questionBank.find(q => String(q.ID) === String(qid))).filter(Boolean);
    quizConfig = quizEntry.config || null;
  } else {
    // Fallback to sessionStorage for newly generated quizzes
    try {
      questions = JSON.parse(sessionStorage.getItem('customQuiz') || '[]');
    } catch {
      questions = [];
    }
    try {
      quizConfig = JSON.parse(sessionStorage.getItem('quizConfig') || 'null');
    } catch {
      quizConfig = null;
    }
  }
  // Defensive: if questions is empty, try to load from localStorage for quizId
  if ((!questions || !questions.length) && quizId) {
    try {
      const store = JSON.parse(localStorage.getItem('questionBankQuizResponses') || '{}');
      const entry = store[quizId];
      if (entry && Array.isArray(entry.questions)) {
        questions = entry.questions.map(qid => questionBank.find(q => String(q.ID) === String(qid))).filter(Boolean);
      }
    } catch {}
  }
  // Render quiz meta summary
  function renderQuizMeta(config, questions) {
    if (!config) {
      quizMeta.innerHTML = '';
      return;
    }
    // Compose summary table
    let html = '<div class="border border-black rounded bg-[#18141e] p-4 mb-4"><div class="font-bold mb-2 text-base">Quiz Settings</div><table class="w-full text-sm">';
    html += `<tr><td class='meta-label pr-2'>Number of Questions:</td><td class='meta-value'>${questions.length}</td></tr>`;
    if (config.source) html += `<tr><td class='meta-label pr-2'>Source:</td><td class='meta-value'>${config.source || 'Any'}</td></tr>`;
    if (config.author) html += `<tr><td class='meta-label pr-2'>Author:</td><td class='meta-value'>${config.author || 'Any'}</td></tr>`;
    if (config.paper) html += `<tr><td class='meta-label pr-2'>Paper Style:</td><td class='meta-value'>${config.paper || 'Any'}</td></tr>`;
    if (config.tags && Object.values(config.tags).some(arr => arr.length)) {
      const tagStr = Object.entries(config.tags).map(([k, arr]) => arr.length ? `<span class='font-semibold'>${k.replace('Tags','')}</span>: ${arr.join(', ')}` : '').filter(Boolean).join(' | ');
      if (tagStr) html += `<tr><td class='meta-label pr-2'>Tags:</td><td class='meta-value'>${tagStr}</td></tr>`;
    }
    if (config.commandTerms && config.commandTerms.length) {
      html += `<tr><td class='meta-label pr-2'>Command Terms:</td><td class='meta-value'>${config.commandTerms.join(', ')}</td></tr>`;
    }
    html += '</table></div>';
    quizMeta.innerHTML = html;
  }

  if (!questions.length) {
    questionsList.innerHTML = '<div class="text-red-400 py-8 text-center">No quiz data found.</div>';
    quizMeta.innerHTML = '';
    return;
  }
  renderQuizMeta(quizConfig, questions);
  const commandTermDefinitions = {
    "Define": "Give the precise meaning of a word, phrase, concept or physical quantity.",
    "Identify": "Provide an answer from a number of possibilities. Recognise and state briefly a distinguishing fact or feature.",
    "Describe": "Give a detailed account or picture of a situation, event, pattern or process.",
    "Outline": "Give a brief account or summary.",
    "State": "Give a specific name, value or other brief answer without explanation or calculation.",
    "Analyse": "Break down in order to bring out the essential elements or structure. (To identify parts and relationships, and to interpret information to reach conclusions.)",
    "Distinguish": "Make clear the differences between two or more concepts or items.",
    "Explain": "Give a detailed account including reasons or causes.",
    "Suggest": "Propose a solution, hypothesis or other possible answer.",
    "Compare": "Given an account of the similarities between two (or more) items or situations, referring to both (all) of them throughout.",
    "Compare and contrast": "Give an account of similarities and differences between two (or more) items or situations, referring to both (all) of them throughout.",
    "Contrast": "Give an account of the differences between two (or more) items or situations, referring to both (all) of them throughout.",
    "Discuss": "Offer a considered and balanced review that includes a range of arguments, factors or hypotheses. Opinions or conclusions should be presented clearly and supported by appropriate evidence.",
    "Examine": "Consider an argument or concept in a way that uncovers the assumptions and interrelationships of the issue.",
    "Evaluate": "Make an appraisal by weighing up the strengths and limitations.",
    "Justify": "Give valid reasons or evidence to support an answer or conclusion. (See also 'Explain'.)",
    "To what extent": "Consider the merits or otherwise of an argument or concept. Opinions and conclusions should be presented clearly and supported with appropriate evidence and sound argument.",
    "Recommend": "Present an advisable course of action with appropriate supporting evidence/reason in relation to a given situation, problem or issue."
  };
  function getCommandTermTooltip(term) {
    return commandTermDefinitions[term] || '';
  }
  // Add CSS for info icon and tooltip
  (function() {
    const style = document.createElement('style');
    style.innerHTML = `
      .info-icon svg { color: var(--accent, #9b59ff); vertical-align: middle; }
      .info-icon:focus + .command-term-tooltip,
      .info-icon:hover + .command-term-tooltip {
        display: block !important;
      }
      .command-term-tooltip {
        background: #232136;
        color: #fff;
        border-radius: 0.375rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        padding: 0.25rem 0.75rem;
        font-size: 0.95rem;
        z-index: 50;
        min-width: 180px;
        white-space: pre-line;
        position: absolute;
        right: 0;
        top: 120%;
        margin-top: 0.25rem;
        transform: none;
        display: none;
      }
      body.light .command-term-tooltip {
        background: #ececf0 !important;
        color: #222 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        border: 1px solid #d1d5db;
      }
    `;
    document.head.appendChild(style);
  })();
  // In the question card rendering, add info icon to top-right with tooltip
  questionsList.innerHTML = questions.map((q, i) => {
    const qNum = `Q${q.ID !== undefined ? q.ID : i+1}`;
    const examId = q.ExamID || q.PaperID || '';
    const source = q.Source || '';
    let examInfo = '';
    if (examId || source) {
      let label = '';
      if (examId && source) {
        label = `Exam ${examId}: ${source}`;
      } else if (examId) {
        label = `Exam ${examId}`;
      } else {
        label = source;
      }
      examInfo = `<span class="exam-link cursor-pointer underline hover:text-accent ml-2" data-examid="${examId}">${label}</span>`;
    }
    const marks = q.Marks ? ` (${q.Marks == 1 ? '1 mark' : q.Marks + ' marks'})` : '';
    const answer = q.AnswerText || '';
    const commandTerm = q.CommandTerm || '';
    const tooltip = getCommandTermTooltip(commandTerm);
    const stimulus = q.Stimulus || '';
    return `
      <div class="mb-6 p-4 rounded border border-black bg-[#1a1620] question-card relative">
        <div class="mb-2 muted-text text-sm">${qNum}${examInfo ? ' ' + examInfo : ''}</div>
        <div class="mb-2 font-semibold accent-text flex items-center gap-2">
          <span class="accent-text">${commandTerm}</span>${marks}
        </div>
        <div class="mb-2">${q.QuestionText || q.Text || ''}</div>
        ${stimulus ? `<div class='mt-2'><span class="stimulus-toggle-btn answer-toggle-btn" tabindex="0" role="button">Show Stimulus</span><div class="stimulus-reveal answer-reveal">${stimulus.replace(/\n/g, '<br>')}</div></div>` : ''}
        <textarea class="w-full mt-2 p-2 rounded border border-black bg-[#141018] text-white darkmode-textarea" rows="2" placeholder="Your answer..."></textarea>
        <div class="mt-2">
          <span class="answer-toggle-btn" tabindex="0" role="button">Show Answer</span>
          <div class="answer-reveal">${answer ? `<div class='muted-text'>${answer.replace(/\n/g, '<br>')}</div>` : '<div class="muted-text">No answer provided.</div>'}</div>
        </div>
        ${tooltip ? `<span class="absolute top-4 right-4 group" style="display:inline-flex;align-items:center;">
          <span class="ml-1 cursor-pointer info-icon" tabindex="0" aria-label="Command term definition">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
              <text x="10" y="14" text-anchor="middle" font-size="12" fill="currentColor" font-family="Arial, sans-serif">i</text>
            </svg>
          </span>
          <span class="command-term-tooltip" style="right:0;left:auto;transform:none;">${tooltip}</span>
        </span>` : ''}
      </div>
    `;
  }).join('');
  // Add answer toggle logic
  questionsList.querySelectorAll('.answer-toggle-btn').forEach((btn, idx) => {
    // Only toggle answer if not also stimulus toggle
    if (!btn.classList.contains('stimulus-toggle-btn')) {
      btn.addEventListener('click', function() {
        const reveal = btn.parentElement.querySelector('.answer-reveal');
        if (reveal.classList.contains('open')) {
          reveal.classList.remove('open');
          btn.textContent = 'Show Answer';
        } else {
          reveal.classList.add('open');
          btn.textContent = 'Hide Answer';
        }
      });
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') btn.click();
      });
    }
  });
  // Add stimulus toggle logic
  questionsList.querySelectorAll('.stimulus-toggle-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      const reveal = btn.parentElement.querySelector('.stimulus-reveal');
      if (reveal.classList.contains('open')) {
        reveal.classList.remove('open');
        btn.textContent = 'Show Stimulus';
      } else {
        reveal.classList.add('open');
        btn.textContent = 'Hide Stimulus';
      }
    });
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });
  // Add exam link click logic
  questionsList.querySelectorAll('.exam-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const examId = link.getAttribute('data-examid');
      if (examId) {
        const url = `exam-details.html?exam=${encodeURIComponent(examId)}`;
        window.open(url, '_blank');
      }
    });
    link.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && link.getAttribute('data-examid')) {
        const examId = link.getAttribute('data-examid');
        const url = `exam-details.html?exam=${encodeURIComponent(examId)}`;
        window.open(url, '_blank');
      }
    });
    link.setAttribute('tabindex', '0');
    link.setAttribute('role', 'button');
    link.setAttribute('aria-label', 'Open exam details');
  });
  // --- Quiz response saving logic ---
  // quizId already declared above
  const saveBtn = document.getElementById('saveQuizResponsesBtn');
  const autosaveToggle = document.getElementById('quizAutosaveToggle');
  const lastSaveMsg = document.getElementById('lastQuizSaveMsg');
  let autosaveInterval = null;
  function getTextareas() {
    return Array.from(document.querySelectorAll('#quiz-questions textarea'));
  }
  function getResponsesStore() {
    const raw = localStorage.getItem('questionBankQuizResponses');
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }
  function setResponsesStore(store) {
    localStorage.setItem('questionBankQuizResponses', JSON.stringify(store));
  }
  function loadResponses() {
    const store = getResponsesStore();
    const entry = store[quizId] || {responses: [], lastSave: null};
    const responses = entry.responses || [];
    const textareas = getTextareas();
    textareas.forEach((ta, i) => {
      const respObj = responses[i];
      if (respObj && typeof respObj === 'object' && 'value' in respObj) {
        ta.value = respObj.value;
      } else if (typeof respObj === 'string') {
        ta.value = respObj;
      }
    });
  }
  function saveResponses(showStatus=true) {
    const store = getResponsesStore();
    const questionIds = questions.map(q => q.ID);
    const responses = getTextareas().map((ta, i) => ({id: questionIds[i], value: ta.value}));
    store[quizId] = {
      responses,
      lastSave: Date.now()
    };
    setResponsesStore(store);
    updateLastSaveMsg();
    if (showStatus && saveBtn) {
      saveBtn.textContent = 'Saved!';
      setTimeout(() => { saveBtn.textContent = 'Save'; }, 1200);
    }
  }
  function updateLastSaveMsg() {
    const store = getResponsesStore();
    const entry = store[quizId];
    if (entry && entry.lastSave) {
      const d = new Date(parseInt(entry.lastSave));
      lastSaveMsg.textContent = 'Last saved: ' + d.toLocaleTimeString();
    } else {
      lastSaveMsg.textContent = 'Last saved: Never';
    }
  }
  if (saveBtn) saveBtn.addEventListener('click', () => saveResponses(true));
  function startAutosave() {
    if (autosaveInterval) clearInterval(autosaveInterval);
    autosaveInterval = setInterval(() => saveResponses(false), 60000);
  }
  function stopAutosave() {
    if (autosaveInterval) clearInterval(autosaveInterval);
    autosaveInterval = null;
  }
  if (autosaveToggle) {
    autosaveToggle.addEventListener('change', function() {
      if (autosaveToggle.checked) {
        startAutosave();
      } else {
        stopAutosave();
      }
    });
    autosaveToggle.checked = true;
    startAutosave();
  }
  if (lastSaveMsg) updateLastSaveMsg();
  // Load responses on page ready
  loadResponses();
  setTimeout(loadResponses, 500);
});

