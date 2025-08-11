const themeColors = [
  { name: 'pink', light: '#ffeaf3', border: '#f8bcd4', color: '#a64d79' },
  { name: 'blue', light: '#d0e7ff', border: '#a3c1ff', color: '#2266aa' },
  { name: 'brown', light: '#f5e9e2', border: '#cbb79b', color: '#8b5e3c' },
  { name: 'white', light: '#ffffff', border: '#cccccc', color: '#555555' },
  { name: 'free', light: '#f0f0f0', border: '#999999', color: '#000000' }
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function applyTheme(weekNum) {
  const theme = themeColors[(weekNum - 1) % themeColors.length];

  document.documentElement.style.setProperty('--theme-color-light', theme.light);
  document.documentElement.style.setProperty('--theme-color-border', theme.border);
  document.documentElement.style.setProperty('--theme-color', theme.color);
  document.documentElement.style.setProperty('--theme-color-text', theme.color);

  const themeNameElem = document.getElementById('themeName');
  if (themeNameElem) {
    themeNameElem.textContent =`  ${capitalize(theme.name)} Week`;
    themeNameElem.style.color = theme.color;
  }
}

function getCurrentWeekNumber() {
  const today = new Date();
  const firstJan = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstJan) / 86400000;
  return Math.ceil((pastDaysOfYear + firstJan.getDay() + 1) / 7);
}

document.addEventListener('DOMContentLoaded', () => {
  const weekNum = getCurrentWeekNumber();
  applyTheme(weekNum);
});