document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const addCommentBtn = document.getElementById('add-comment');
    const commentInput = document.getElementById('user-comment');
    const commentsList = document.getElementById('comments-list');
    const addStarBtn = document.getElementById('add-star');
    const starsContainer = document.getElementById('stars-container');
    const migrationCheck = document.getElementById('migration-check');

    // Theme logic
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    body.className = savedTheme;
    themeToggle.textContent = savedTheme === 'dark-mode' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.className = 'dark-mode';
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.className = 'light-mode';
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // Comments logic
    const loadComments = () => {
        const comments = JSON.parse(localStorage.getItem('migrationComments') || '[]');
        commentsList.innerHTML = '';
        comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.textContent = c;
            commentsList.appendChild(div);
        });
    };

    addCommentBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text) {
            const comments = JSON.parse(localStorage.getItem('migrationComments') || '[]');
            comments.push(text);
            localStorage.setItem('migrationComments', JSON.stringify(comments));
            commentInput.value = '';
            loadComments();
        }
    });

    // Stars logic
    const loadStars = () => {
        const starCount = parseInt(localStorage.getItem('starCount') || '0');
        starsContainer.innerHTML = '⭐'.repeat(starCount);
    };

    addStarBtn.addEventListener('click', () => {
        let starCount = parseInt(localStorage.getItem('starCount') || '0');
        starCount++;
        localStorage.setItem('starCount', starCount.toString());
        loadStars();
    });

    // Attestation logic
    migrationCheck.checked = localStorage.getItem('attested') === 'true';
    migrationCheck.addEventListener('change', () => {
        localStorage.setItem('attested', migrationCheck.checked);
        if (migrationCheck.checked) {
            alert('Congratulations on your migration! 🎊');
        }
    });

    loadComments();
    loadStars();
});
