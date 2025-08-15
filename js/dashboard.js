// dashboard.js
// Handles dashboard logic for index.html

// Elements
const titleEl = document.getElementById('paperTitle');
const totalQuestionsEl = document.getElementById('metric-total-questions');
const uniqueTermsEl = document.getElementById('metric-unique-terms');
const mostCommonTermEl = document.getElementById('metric-most-common-term');
const chartEl = document.getElementById('chartPlaceholder');

let papers = [];
let currentIndex = 0;
let flatData = [];
let chartInstance = null;
let conceptChartInstance = null;
let contentChartInstance = null;
let conceptPapers = [];
let conceptCurrentIndex = 0;
let contentPapers = [];
let contentCurrentIndex = 0;

function fmtNum(n) {
  return n.toLocaleString();
}

function extractPaperAggregates(flatArr) {
  const paperIds = ['1', '2', '3'];
  const paperAggs = {};
  let totalQuestions = flatArr.length;
  for (const pid of paperIds) {
    paperAggs[pid] = {
      paperNum: pid,
      questionCount: 0,
      commandTerms: [],
    };
  }
  for (const row of flatArr) {
    if (paperIds.includes(String(row.PaperID))) {
      paperAggs[String(row.PaperID)].questionCount++;
      if (row.CommandTerm) paperAggs[String(row.PaperID)].commandTerms.push(row.CommandTerm);
    }
  }
  return { paperAggs, totalQuestions };
}

function updatePaper(index, animate = true) {
  const paper = papers[index];
  if (!paper) return;
  titleEl.textContent = `Paper ${paper.paperNum}`;
  totalQuestionsEl.textContent = fmtNum(paper.questionCount);
  // Unique command terms
  const termCounts = {};
  for (const term of paper.commandTerms) {
    if (!term) continue;
    termCounts[term] = (termCounts[term] || 0) + 1;
  }
  uniqueTermsEl.textContent = Object.keys(termCounts).length;
  // Most common command term
  let mostCommon = '-';
  let maxCount = 0;
  for (const term in termCounts) {
    if (termCounts[term] > maxCount) {
      mostCommon = term;
      maxCount = termCounts[term];
    }
  }
  mostCommonTermEl.textContent = mostCommon;
  // Chart: show command term counts using Chart.js
  renderChart(termCounts);
  if (animate) {
    chartEl.classList.remove('pulse-border');
    void chartEl.offsetWidth;
    chartEl.classList.add('pulse-border');
  }
}

function getChartTextColor() {
  // Use CSS variable for accent or fallback to #fff/#222
  const isLight = document.body.classList.contains('light');
  // Try to get computed style for text color
  const style = getComputedStyle(document.body);
  return isLight ? (style.color || '#222') : (style.color || '#fff');
}

function getChartAccentColor(alpha = 1) {
  // Use CSS variable for accent color
  const style = getComputedStyle(document.documentElement);
  let accent = style.getPropertyValue('--accent').trim() || '#9b59ff';
  // Convert hex to rgba
  if (accent.startsWith('#')) {
    const hex = accent.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0]+hex[0], 16);
      g = parseInt(hex[1]+hex[1], 16);
      b = parseInt(hex[2]+hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0,2), 16);
      g = parseInt(hex.substring(2,4), 16);
      b = parseInt(hex.substring(4,6), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return accent;
}

function renderChart(termCounts) {
  chartEl.innerHTML = '<canvas id="commandTermChart" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('commandTermChart').getContext('2d');
  // Sort labels alphabetically
  const labels = Object.keys(termCounts).sort((a, b) => a.localeCompare(b));
  const data = labels.map(l => termCounts[l]);
  if (chartInstance) chartInstance.destroy();
  const textColor = getChartTextColor();
  const accentBg = getChartAccentColor(0.6);
  const accentBorder = getChartAccentColor(1);
  chartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: accentBg,
        borderColor: accentBorder,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Command Term Counts', color: textColor }
      },
      scales: {
        x: { ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { color: textColor } }
      }
    }
  });
}

function renderConceptChart(conceptCounts) {
  const conceptChartEl = document.getElementById('conceptChartPlaceholder');
  conceptChartEl.innerHTML = '<canvas id="conceptChart" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('conceptChart').getContext('2d');
  const labels = Object.keys(conceptCounts).sort((a, b) => a.localeCompare(b));
  const data = labels.map(l => conceptCounts[l]);
  if (conceptChartInstance) conceptChartInstance.destroy();
  const textColor = getChartTextColor();
  const accentBg = getChartAccentColor(0.6);
  const accentBorder = getChartAccentColor(1);
  conceptChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: accentBg,
        borderColor: accentBorder,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Concept Tag Counts', color: textColor }
      },
      scales: {
        x: { ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { color: textColor } }
      }
    }
  });
}

function renderContentChart(contentCounts) {
  const contentChartEl = document.getElementById('contentChartPlaceholder');
  contentChartEl.innerHTML = '<canvas id="contentChart" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('contentChart').getContext('2d');
  const labels = Object.keys(contentCounts).sort((a, b) => a.localeCompare(b));
  const data = labels.map(l => contentCounts[l]);
  if (contentChartInstance) contentChartInstance.destroy();
  const textColor = getChartTextColor();
  const accentBg = getChartAccentColor(0.6);
  const accentBorder = getChartAccentColor(1);
  contentChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: accentBg,
        borderColor: accentBorder,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Content Tag Counts', color: textColor }
      },
      scales: {
        x: { ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { color: textColor } }
      }
    }
  });
}

function renderContextChart(contextCounts) {
  const contextChartEl = document.getElementById('contextChartPlaceholder');
  contextChartEl.innerHTML = '<canvas id="contextChart" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('contextChart').getContext('2d');
  const labels = Object.keys(contextCounts).sort((a, b) => a.localeCompare(b));
  const data = labels.map(l => contextCounts[l]);
  if (window.contextChartInstance) window.contextChartInstance.destroy();
  const textColor = getChartTextColor();
  const accentBg = getChartAccentColor(0.6);
  const accentBorder = getChartAccentColor(1);
  window.contextChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: accentBg,
        borderColor: accentBorder,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Context Tag Counts', color: textColor }
      },
      scales: {
        x: { ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { color: textColor } }
      }
    }
  });
}

let contextPapers = [];
let contextCurrentIndex = 0;

function updateConceptPaper(index) {
  const paper = conceptPapers[index];
  if (!paper) return;
  document.getElementById('conceptPaperTitle').textContent = `Paper ${paper.paperNum}`;
  document.getElementById('metric-total-concept-tags').textContent = fmtNum(paper.totalConceptTags);
  document.getElementById('metric-unique-concepts').textContent = paper.uniqueConceptsUsed;
  document.getElementById('metric-most-common-concept').textContent = paper.mostCommonConcept;
  renderConceptChart(paper.conceptCounts);
}

function updateContentPaper(index) {
  const paper = contentPapers[index];
  if (!paper) return;
  document.getElementById('contentPaperTitle').textContent = `Paper ${paper.paperNum}`;
  document.getElementById('metric-total-content-tags').textContent = fmtNum(paper.totalContentTags);
  document.getElementById('metric-unique-content').textContent = paper.uniqueContentUsed;
  document.getElementById('metric-most-common-content').textContent = paper.mostCommonContent;
  renderContentChart(paper.contentCounts);
}

function updateContextPaper(index) {
  const paper = contextPapers[index];
  if (!paper) return;
  document.getElementById('contextPaperTitle').textContent = `Paper ${paper.paperNum}`;
  document.getElementById('metric-total-context-tags').textContent = fmtNum(paper.totalContextTags);
  document.getElementById('metric-unique-context').textContent = paper.uniqueContextUsed;
  document.getElementById('metric-most-common-context').textContent = paper.mostCommonContext;
  renderContextChart(paper.contextCounts);
}

function nextConceptPaper() {
  conceptCurrentIndex = (conceptCurrentIndex + 1) % conceptPapers.length;
  updateConceptPaper(conceptCurrentIndex);
}
function prevConceptPaper() {
  conceptCurrentIndex = (conceptCurrentIndex - 1 + conceptPapers.length) % conceptPapers.length;
  updateConceptPaper(conceptCurrentIndex);
}
function nextContentPaper() {
  contentCurrentIndex = (contentCurrentIndex + 1) % contentPapers.length;
  updateContentPaper(contentCurrentIndex);
}
function prevContentPaper() {
  contentCurrentIndex = (contentCurrentIndex - 1 + contentPapers.length) % contentPapers.length;
  updateContentPaper(contentCurrentIndex);
}
function nextContextPaper() {
  contextCurrentIndex = (contextCurrentIndex + 1) % contextPapers.length;
  updateContextPaper(contextCurrentIndex);
}
function prevContextPaper() {
  contextCurrentIndex = (contextCurrentIndex - 1 + contextPapers.length) % contextPapers.length;
  updateContextPaper(contextCurrentIndex);
}

document.getElementById('conceptNextBtn').addEventListener('click', nextConceptPaper);
document.getElementById('conceptPrevBtn').addEventListener('click', prevConceptPaper);
document.getElementById('contentNextBtn').addEventListener('click', nextContentPaper);
document.getElementById('contentPrevBtn').addEventListener('click', prevContentPaper);
document.getElementById('contextNextBtn').addEventListener('click', nextContextPaper);
document.getElementById('contextPrevBtn').addEventListener('click', prevContextPaper);
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'ArrowRight' && document.activeElement !== document.getElementById('nextBtn')) nextConceptPaper();
  if (ev.key === 'ArrowLeft' && document.activeElement !== document.getElementById('prevBtn')) prevConceptPaper();
  if (ev.key === 'ArrowRight' && document.activeElement !== document.getElementById('nextBtn') && document.activeElement !== document.getElementById('conceptNextBtn')) nextContentPaper();
  if (ev.key === 'ArrowLeft' && document.activeElement !== document.getElementById('prevBtn') && document.activeElement !== document.getElementById('conceptPrevBtn')) prevContentPaper();
  if (ev.key === 'ArrowRight' && document.activeElement !== document.getElementById('nextBtn') && document.activeElement !== document.getElementById('conceptNextBtn') && document.activeElement !== document.getElementById('contentNextBtn')) nextContextPaper();
  if (ev.key === 'ArrowLeft' && document.activeElement !== document.getElementById('prevBtn') && document.activeElement !== document.getElementById('conceptPrevBtn') && document.activeElement !== document.getElementById('contentPrevBtn')) prevContextPaper();
});

function nextPaper() {
  currentIndex = (currentIndex + 1) % papers.length;
  updatePaper(currentIndex);
}
function prevPaper() {
  currentIndex = (currentIndex - 1 + papers.length) % papers.length;
  updatePaper(currentIndex);
}

document.getElementById('nextBtn').addEventListener('click', nextPaper);
document.getElementById('prevBtn').addEventListener('click', prevPaper);
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'ArrowRight') nextPaper();
  if (ev.key === 'ArrowLeft') prevPaper();
});


let data = [];
try {
  const raw = localStorage.getItem('digitalSocietyQuestionBank');
  if (raw) data = JSON.parse(raw);
} catch { data = []; }

// Use 'data' wherever the question bank is needed
document.getElementById('total-results').textContent = fmtNum(data.length);
const paperSet = new Set(data.map(row => (row.ExamID || '') + '-' + (row.PaperID || '')));
document.getElementById('total-papers').textContent = fmtNum(paperSet.size);
const { paperAggs } = extractPaperAggregates(data);
papers = ['1','2','3'].map(pid => paperAggs[pid]);
// Immediately render Paper 1 metrics (including unique command terms) on page load
updatePaper(0, false);

// Concepts aggregate logic, grouped by paper
const conceptList = [
  'change', 'expression', 'identity', 'power', 'space', 'systems', 'values and ethics'
];
const paperIds = ['1', '2', '3'];
conceptPapers = paperIds.map(pid => {
  const conceptCounts = {};
  for (const concept of conceptList) conceptCounts[concept] = 0;
  let totalConceptTags = 0;
  for (const row of data) {
    if (String(row.PaperID) === pid && Array.isArray(row.ConceptTags)) {
      for (const tag of row.ConceptTags) {
        if (conceptCounts.hasOwnProperty(tag)) {
          conceptCounts[tag]++;
          totalConceptTags++;
        }
      }
    }
  }
  const uniqueConceptsUsed = Object.values(conceptCounts).filter(v => v > 0).length;
  let mostCommonConcept = '-';
  let maxConceptCount = 0;
  for (const concept in conceptCounts) {
    if (conceptCounts[concept] > maxConceptCount) {
      mostCommonConcept = concept;
      maxConceptCount = conceptCounts[concept];
    }
  }
  return {
    paperNum: pid,
    conceptCounts,
    totalConceptTags,
    uniqueConceptsUsed,
    mostCommonConcept
  };
});
updateConceptPaper(conceptCurrentIndex);

// Content aggregate logic, grouped by paper
const contentList = [
  'algorithms', 'artificial intelligence', 'computers', 'data', 'media', 'networks and the internet', 'robots and autonomous technologies'
];
contentPapers = paperIds.map(pid => {
  const contentCounts = {};
  for (const content of contentList) contentCounts[content] = 0;
  let totalContentTags = 0;
  for (const row of data) {
    if (String(row.PaperID) === pid && Array.isArray(row.ContentTags)) {
      for (const tag of row.ContentTags) {
        if (contentCounts.hasOwnProperty(tag)) {
          contentCounts[tag]++;
          totalContentTags++;
        }
      }
    }
  }
  const uniqueContentUsed = Object.values(contentCounts).filter(v => v > 0).length;
  let mostCommonContent = '-';
  let maxContentCount = 0;
  for (const content in contentCounts) {
    if (contentCounts[content] > maxContentCount) {
      mostCommonContent = content;
      maxContentCount = contentCounts[content];
    }
  }
  return {
    paperNum: pid,
    contentCounts,
    totalContentTags,
    uniqueContentUsed,
    mostCommonContent
  };
});
updateContentPaper(contentCurrentIndex);

// Context aggregate logic, grouped by paper
const contextList = [
  'cultural', 'economic', 'environmental', 'health', 'human knowledge', 'political', 'social'
];
contextPapers = paperIds.map(pid => {
  const contextCounts = {};
  for (const context of contextList) contextCounts[context] = 0;
  let totalContextTags = 0;
  for (const row of data) {
    if (String(row.PaperID) === pid && Array.isArray(row.ContextTags)) {
      for (const tag of row.ContextTags) {
        if (contextCounts.hasOwnProperty(tag)) {
          contextCounts[tag]++;
          totalContextTags++;
        }
      }
    }
  }
  const uniqueContextUsed = Object.values(contextCounts).filter(v => v > 0).length;
  let mostCommonContext = '-';
  let maxContextCount = 0;
  for (const context in contextCounts) {
    if (contextCounts[context] > maxContextCount) {
      mostCommonContext = context;
      maxContextCount = contextCounts[context];
    }
  }
  return {
    paperNum: pid,
    contextCounts,
    totalContextTags,
    uniqueContextUsed,
    mostCommonContext
  };
});
updateContextPaper(contextCurrentIndex);

window.addEventListener('resize', () => {
  // placeholder for future chart resize
});
