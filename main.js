const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');
const themeToggleBtn = document.getElementById('theme-toggle');
const storageKey = 'lotto-theme';

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
}

function setTheme(theme) {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
}

themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
});

applyTheme(getPreferredTheme());

generateBtn.addEventListener('click', () => {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();

    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    numbers.forEach((number, index) => {
        const circle = document.createElement('div');
        circle.classList.add('number-circle');
        circle.textContent = number;
        circle.style.animationDelay = `${index * 0.1}s`;
        lottoNumbersContainer.appendChild(circle);
    });
});
