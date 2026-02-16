document.addEventListener('DOMContentLoaded', () => {
    // Initial State
    const state = {
        stars: parseInt(localStorage.getItem('vanguard_stars') || '0'),
        logs: JSON.parse(localStorage.getItem('vanguard_logs') || '[]'),
        attested: localStorage.getItem('vanguard_attested') === 'true'
    };

    // DOM Elements
    const starBtn = document.getElementById('action-star');
    const transmitBtn = document.getElementById('action-transmit');
    const commInput = document.getElementById('comm-input');
    const starField = document.getElementById('star-field');
    const starBadge = document.getElementById('star-count-badge');
    const logWall = document.getElementById('log-wall');
    const attestCheck = document.getElementById('vanguard-check');

    // Sync State to UI
    const syncUI = () => {
        // Update Stars
        starBadge.textContent = `${state.stars} Stars`;
        starField.innerHTML = '';
        for (let i = 0; i < Math.min(state.stars, 100); i++) {
            const s = document.createElement('span');
            s.textContent = '⭐';
            s.className = 'star-anim';
            starField.appendChild(s);
        }

        // Update Logs
        logWall.innerHTML = '';
        state.logs.slice().reverse().forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.textContent = entry;
            logWall.appendChild(div);
        });

        // Update Attestation
        attestCheck.checked = state.attested;
    };

    const save = () => {
        localStorage.setItem('vanguard_stars', state.stars);
        localStorage.setItem('vanguard_logs', JSON.stringify(state.logs));
        localStorage.setItem('vanguard_attested', state.attested);
    };

    // Listeners
    starBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.stars++;
        save();
        syncUI();
        
        // Visual feedback
        starBtn.style.transform = 'scale(0.95)';
        setTimeout(() => starBtn.style.transform = 'translateY(-2px)', 100);
    });

    transmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const val = commInput.value.trim();
        if (val) {
            state.logs.push(val);
            commInput.value = '';
            save();
            syncUI();
        }
    });

    attestCheck.addEventListener('change', () => {
        state.attested = attestCheck.checked;
        save();
        if (state.attested) {
            triggerConfetti();
        }
    });

    // High-end interaction effects
    const triggerConfetti = () => {
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: -10px;
                width: 8px; height: 8px;
                background: ${['#6366f1', '#f59e0b', '#fff'][Math.floor(Math.random()*3)]};
                border-radius: 50%;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(p);
            p.animate([
                { transform: 'translateY(0) rotate(0)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], { duration: 1500 + Math.random() * 1000 }).onfinish = () => p.remove();
        }
    };

    // Handle Enter key for transmission
    commInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') transmitBtn.click();
    });

    // Initial Sync
    syncUI();
});
