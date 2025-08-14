// exam-details.js
// Loads and displays all questions for a given ExamID, with meta info
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener('DOMContentLoaded', function () {
  const examId = getQueryParam('exam');
  const titleEl = document.getElementById('exam-title');
  const metaEl = document.getElementById('exam-meta');
  const questionsList = document.getElementById('questions-list');
  const navList = document.getElementById('question-nav-list');

  if (!examId) {
    titleEl.textContent = 'Exam Not Found';
    questionsList.innerHTML = '<div class="text-red-400 py-8 text-center">No exam ID specified.</div>';
    return;
  }
  // Load question bank from localStorage
  let data = [];
  try {
    const raw = localStorage.getItem('digitalSocietyQuestionBank');
    if (raw) data = JSON.parse(raw);
  } catch { data = []; }

  // Filter for this exam
  const examQuestions = data.filter(row => String(row.ExamID) === String(examId));
  if (!examQuestions.length) {
    titleEl.textContent = 'Exam Not Found';
    questionsList.innerHTML = '<div class="text-red-400 py-8 text-center">No questions found for this exam.</div>';
    return;
  }
  // Meta info from first row (exam-level only)
  const meta = examQuestions[0];
  titleEl.textContent = `Exam ${meta.ExamID}`;
  metaEl.innerHTML = `
    <div class="flex flex-wrap gap-4 text-sm mb-2">
      <div><span class="meta-label">Paper:</span> <span class="meta-value">${meta.PaperID ? `Paper ${meta.PaperID}` : ''}</span></div>
      <div><span class="meta-label">Source:</span> <span class="meta-value">${meta.Source || ''}</span></div>
      <div><span class="meta-label">Author:</span> <span class="meta-value">${meta.Author || ''}</span></div>
      <div><span class="meta-label">Publication Date:</span> <span class="meta-value">${meta.PublicationDate || ''}</span></div>
      <div><span class="meta-label">Level:</span> <span class="meta-value">${meta.Level || ''}</span></div>
    </div>
  `;
  // --- Navigation links array ---
  let navLinks = [];
  // Paper 2/3: Show Title/Stimulus only once at the top, then all questions
  if (meta.PaperID == 2 || meta.PaperID == 3) {
    // Only one nav link for the main title
    const anchor = 'main-title';
    navLinks.push({anchor, label: meta.Title || 'Main Title'});
    questionsList.innerHTML = `
      <div id="${anchor}">
        ${meta.Title ? `<div class='question-title font-bold mb-1 text-lg'>${meta.Title}</div>` : ''}
        ${meta.Stimulus ? `<div class='question-stimulus muted-text mb-4'>${meta.Stimulus.replace(/\n/g, '<br>')}</div>` : ''}
      </div>
      ${examQuestions.map((q, i) => {
        const qNum = `Q${q.QuestionNo ? q.QuestionNo : i+1}${q.SubQuestionNo ? `.${q.SubQuestionNo}` : ''}${q.SubSubQuestionNo ? `.${q.SubSubQuestionNo}` : ''}`;
        const marks = q.Marks ? ` (${q.Marks} mark${q.Marks == 1 ? '' : 's'})` : '';
        const answer = q.AnswerText || '';
        const anchorQ = `question-${i+1}`;
        const commandTerm = q.CommandTerm || '';
        const tooltip = getCommandTermTooltip(commandTerm);
        return `
          <div class="mb-6 p-4 rounded border border-black bg-[#1a1620] question-card relative" id="${anchorQ}">
            <div class="mb-2 muted-text text-sm">${qNum}</div>
            <div class="mb-2 font-semibold accent-text flex items-center gap-2">
              <span class="accent-text">${commandTerm}</span>${marks}
            </div>
            <div class="mb-2">${q.QuestionText || q.Text || ''}</div>
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
      }).join('')}
    `;
  } else {
    // Paper 1 and others: group by Title+Stimulus
    const groups = [];
    const groupMap = {};
    examQuestions.forEach(q => {
      const key = (q.Title || '') + '||' + (q.Stimulus || '');
      if (!groupMap[key]) {
        groupMap[key] = { title: q.Title, stimulus: q.Stimulus, questions: [] };
        groups.push(groupMap[key]);
      }
      groupMap[key].questions.push(q);
    });
    let qIdx = 0;
    questionsList.innerHTML = groups.map((group, groupIdx) => {
      const groupAnchor = `question-group-${groupIdx+1}`;
      navLinks.push({anchor: groupAnchor, label: group.title ? group.title : `Question Group ${groupIdx+1}`});
      return `
        <div class="mb-8" id="${groupAnchor}">
          ${group.title ? `<div class='question-title font-bold mb-1 text-lg'>${group.title}</div>` : ''}
          ${group.stimulus ? `<div class='question-stimulus muted-text mb-4'>${group.stimulus.replace(/\n/g, '<br>')}</div>` : ''}
          ${group.questions.map((q, i) => {
            qIdx++;
            const qNum = `Q${q.QuestionNo ? q.QuestionNo : groupIdx+1}${q.SubQuestionNo ? `.${q.SubQuestionNo}` : ''}${q.SubSubQuestionNo ? `.${q.SubSubQuestionNo}` : ''}`;
            const marks = q.Marks ? ` (${q.Marks} mark${q.Marks == 1 ? '' : 's'})` : '';
            const answer = q.AnswerText || '';
            const anchorQ = `question-${qIdx}`;
            const commandTerm = q.CommandTerm || '';
            const tooltip = getCommandTermTooltip(commandTerm);
            return `
              <div class="mb-6 p-4 rounded border border-black bg-[#1a1620] question-card relative" id="${anchorQ}">
                <div class="mb-2 muted-text text-sm">${qNum}</div>
                <div class="mb-2 font-semibold accent-text flex items-center gap-2">
                  <span class="accent-text">${commandTerm}</span>${marks}
                </div>
                <div class="mb-2">${q.QuestionText || q.Text || ''}</div>
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
          }).join('')}
        </div>
      `;
    }).join('');
  }

  // Render nav links
  if (navList) {
    navList.innerHTML = navLinks.map(link => `<li><a href="#${link.anchor}">${link.label}</a></li>`).join('');
  }

  // Highlight active nav link on scroll
  if (navList && navLinks.length) {
    const anchorIds = navLinks.map(l => l.anchor);
    function onScroll() {
      let active = anchorIds[0];
      for (const id of anchorIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - 120 < 0) {
          active = id;
        }
      }
      navList.querySelectorAll('a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + active);
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }
  // Add answer toggle logic
  questionsList.querySelectorAll('.answer-toggle-btn').forEach((btn, idx) => {
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
  });
});

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

