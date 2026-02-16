document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State from LocalStorage
    const state = {
        stars: parseInt(localStorage.getItem('ant_istio_stars') || '0'),
        logs: JSON.parse(localStorage.getItem('ant_istio_logs') || '[]'),
        attested: localStorage.getItem('ant_istio_attested') === 'true'
    };

    // 2. DOM Elements
    const starBtn = document.getElementById('btn-star');
    const postBtn = document.getElementById('btn-post');
    const commentInput = document.getElementById('user-comment');
    const starField = document.getElementById('star-field');
    const starDisplay = document.getElementById('star-count-display');
    const commentsList = document.getElementById('comments-list');
    const attestCheck = document.getElementById('migration-check');

    // 3. UI Sync Function
    const syncUI = () => {
        // Update Star Count Text
        if (starDisplay) {
            starDisplay.textContent = `${state.stars} Star${state.stars !== 1 ? 's' : ''} Awarded`;
        }

        // Render Stars visually
        if (starField) {
            starField.innerHTML = '';
            // Cap visual stars to prevent DOM bloat, but keep the count accurate
            const limit = Math.min(state.stars, 200);
            for (let i = 0; i < limit; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                starField.appendChild(s);
            }
        }

        // Render Timeline/Logs
        if (commentsList) {
            commentsList.innerHTML = '';
            // Show latest logs first
            state.logs.slice().reverse().forEach(log => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.textContent = log;
                commentsList.appendChild(item);
            });
        }

        // Sync Checkbox
        if (attestCheck) {
            attestCheck.checked = state.attested;
        }
    };

    // 4. Persistence
    const saveState = () => {
        localStorage.setItem('ant_istio_stars', state.stars);
        localStorage.setItem('ant_istio_logs', JSON.stringify(state.logs));
        localStorage.setItem('ant_istio_attested', state.attested);
    };

    // 5. Handlers
    if (starBtn) {
        starBtn.onclick = (e) => {
            e.preventDefault();
            state.stars++;
            saveState();
            syncUI();
        };
    }

    if (postBtn) {
        postBtn.onclick = (e) => {
            e.preventDefault();
            const text = commentInput.value.trim();
            if (text) {
                state.logs.push(text);
                commentInput.value = '';
                saveState();
                syncUI();
            }
        };
    }

    if (attestCheck) {
        attestCheck.onchange = (e) => {
            state.attested = e.target.checked;
            saveState();
            if (state.attested) {
                // Subtle feedback instead of alert
                console.log('User attested successful migration.');
                showNotification('Migration Attested Successfully!');
            }
        };
    }

    // Helper: Subtle Notification
    const showNotification = (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: white;
            border: 1px solid #d9d9d9;
            padding: 16px 24px;
            border-radius: 2px;
            box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s forwards;
        `;
        div.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(div);

        setTimeout(() => {
            div.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    };

    // Add CSS for notifications
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);

    // 6. Initial Sync
    syncUI();
});
