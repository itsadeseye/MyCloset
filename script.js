const themeColors = [
    {
      name: 'pink',
      light: '#ffeaf3',
      border: '#f8bcd4',
      color: '#a64d79'
    },
    {
      name: 'blue',
      light: '#d0e7ff',
      border: '#a3c1ff',
      color: '#2266aa'
    },
    {
      name: 'brown',
      light: '#f5e9e2',
      border: '#cbb79b',
      color: '#8b5e3c'
    },
    {
      name: 'white',
      light: '#ffffff',
      border: '#cccccc',
      color: '#555555'
    },
    {
      name: 'free',
      light: '#f0f0f0',
      border: '#999999',
      color: '#000000'
    }
  ];

  function getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function setTheme(theme) {
    document.documentElement.style.setProperty('--theme-color-light', theme.light);
    document.documentElement.style.setProperty('--theme-color-border', theme.border);
    document.documentElement.style.setProperty('--theme-color', theme.color);
    document.documentElement.style.setProperty('--theme-color-text', theme.color);

    const colorSample = document.getElementById('colorSample');
    const themeName = document.getElementById('themeName');

    if (colorSample) {
      colorSample.style.backgroundColor = theme.color;
      colorSample.style.borderColor = theme.border;
    }
    if (themeName) {
      themeName.textContent =`  ${capitalize(theme.name)} Week`;
      themeName.style.color = theme.color;
    }
  }

  function initTheme() {
    const weekNumber = getWeekNumber();
    const theme = themeColors[(weekNumber - 1) % themeColors.length];
    setTheme(theme);
  }

  window.onload = initTheme;