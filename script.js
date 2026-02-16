document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    const state = {
        stars: parseInt(localStorage.getItem('gt_warp_stars') || '0'),
        comments: JSON.parse(localStorage.getItem('gt_warp_comments') || '[]'),
        attested: localStorage.getItem('gt_warp_attested') === 'true'
    };

    // 2. Select Elements (with null checks)
    const starBtn = document.getElementById('btn-star');
    const postBtn = document.getElementById('btn-post');
    const commentInput = document.getElementById('user-comment');
    const starField = document.getElementById('star-field');
    const starBadge = document.getElementById('star-count-badge');
    const commentsList = document.getElementById('comments-list');
    const attestCheck = document.getElementById('migration-check');

    // 3. UI Update Function
    const updateUI = () => {
        if (starBadge) starBadge.textContent = `${state.stars} Stars`;
        
        if (starField) {
            starField.innerHTML = '';
            const displayStars = Math.min(state.stars, 100);
            for (let i = 0; i < displayStars; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                s.style.animation = `pop 0.3s ease forwards`;
                starField.appendChild(s);
            }
        }

        if (commentsList) {
            commentsList.innerHTML = '';
            state.comments.slice().reverse().forEach(c => {
                const div = document.createElement('div');
                div.className = 'comment-entry';
                div.textContent = c;
                commentsList.appendChild(div);
            });
        }

        if (attestCheck) {
            attestCheck.checked = state.attested;
        }
    };

    // 4. Persistence
    const save = () => {
        localStorage.setItem('gt_warp_stars', state.stars);
        localStorage.setItem('gt_warp_comments', JSON.stringify(state.comments));
        localStorage.setItem('gt_warp_attested', state.attested);
    };

    // 5. Event Listeners
    if (starBtn) {
        starBtn.onclick = () => {
            state.stars++;
            save();
            updateUI();
        };
    }

    if (postBtn) {
        postBtn.onclick = () => {
            const val = commentInput.value.trim();
            if (val) {
                state.comments.push(val);
                commentInput.value = '';
                save();
                updateUI();
            }
        };
    }

    if (attestCheck) {
        attestCheck.onchange = (e) => {
            state.attested = e.target.checked;
            save();
            if (state.attested) {
                triggerConfetti();
            }
        };
    }

    const triggerConfetti = () => {
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: -10px;
                width: 10px; height: 10px;
                background: ${['#00d2ff', '#9d50bb', '#fff'][Math.floor(Math.random() * 3)]};
                border-radius: 50%;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(p);
            p.animate([
                { transform: 'translateY(0) rotate(0)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], { duration: 2000 }).onfinish = () => p.remove();
        }
    };

    // Initial Sync
    updateUI();
});
