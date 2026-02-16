document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'dark-mode') {
            toggleButton.textContent = '☀️';
        } else {
            toggleButton.textContent = '🌙';
        }
    } else {
        // Default to light mode if no preference is saved
        body.classList.add('light-mode');
        toggleButton.textContent = '🌙';
    }

    toggleButton.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            toggleButton.textContent = '☀️';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            toggleButton.textContent = '🌙';
            localStorage.setItem('theme', 'light-mode');
        }
    });
});
