document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    const STORAGE_KEY = 'vanguard_v5_data';
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    let state = {
        stars: 0,
        logs: [],
        attested: false
    };

    if (savedData) {
        try {
            state = JSON.parse(savedData);
        } catch (e) {
            console.error('State parse failed', e);
        }
    }

    // 2. Element References
    const refs = {
        starLabel: document.getElementById('star-count-label'),
        starField: document.getElementById('star-field-display'),
        logInput: document.getElementById('log-message'),
        submitBtn: document.getElementById('submit-log'),
        starBtn: document.getElementById('award-star-btn'),
        attestCheck: document.getElementById('attestation-box'),
        logsList: document.getElementById('migration-logs')
    };

    // 3. UI Synchronization
    const updateUI = () => {
        // Update Star Label
        if (refs.starLabel) {
            refs.starLabel.textContent = `${state.stars} Star${state.stars === 1 ? '' : 's'} Collected`;
        }

        // Update Star Field
        if (refs.starField) {
            refs.starField.innerHTML = '';
            // Display limit to 150 stars
            const count = Math.min(state.stars, 150);
            for (let i = 0; i < count; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                refs.starField.appendChild(s);
            }
        }

        // Update Logs
        if (refs.logsList) {
            refs.logsList.innerHTML = '';
            [...state.logs].reverse().forEach(text => {
                const div = document.createElement('div');
                div.className = 'timeline-entry';
                div.textContent = text;
                refs.logsList.appendChild(div);
            });
        }

        // Sync Checkbox
        if (refs.attestCheck) {
            refs.attestCheck.checked = state.attested;
        }
    };

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    // 4. Interaction Logic
    if (refs.starBtn) {
        refs.starBtn.onclick = (e) => {
            e.preventDefault();
            state.stars++;
            save();
            updateUI();
        };
    }

    if (refs.submitBtn) {
        refs.submitBtn.onclick = (e) => {
            e.preventDefault();
            const val = refs.logInput.value.trim();
            if (val) {
                state.logs.push(val);
                refs.logInput.value = '';
                save();
                updateUI();
            }
        };
    }

    if (refs.attestCheck) {
        refs.attestCheck.onchange = (e) => {
            state.attested = e.target.checked;
            save();
            if (state.attested) {
                spawnNotification('Successfully Attested Migration');
            }
        };
    }

    // 5. Feedback Notifications
    const spawnNotification = (msg) => {
        const n = document.createElement('div');
        n.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: #fff;
            border: 1px solid #d9d9d9;
            padding: 16px 24px;
            border-radius: 2px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid #52c41a;
            animation: slideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        `;
        n.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(n);
        
        setTimeout(() => {
            n.style.animation = 'slideOut 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards';
            setTimeout(() => n.remove(), 300);
        }, 3000);
    };

    // Inject Animation CSS
    const sheet = document.createElement('style');
    sheet.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(sheet);

    // Run initial UI sync
    updateUI();
});
