// theme-toggle.js
// Handles theme toggling and persistence for all pages


document.addEventListener('DOMContentLoaded', function () {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  function setTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }
  function toggleTheme() {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    // Dispatch a custom event for theme change (for dashboard.js, etc.)
    document.dispatchEvent(new Event('themechange'));
  }
  themeBtn.addEventListener('click', toggleTheme);
  // On load, set theme from localStorage
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
  }
});
