document.addEventListener('DOMContentLoaded', () => {
    // 1. Precise State Management
    const KEY = 'vanguard_ant_v1';
    const raw = localStorage.getItem(KEY);
    let state = {
        stars: 0,
        logs: [],
        attested: false
    };

    if (raw) {
        try {
            state = JSON.parse(raw);
        } catch (e) {
            console.warn('State recovery failed');
        }
    }

    // 2. DOM Selection with Strict IDs
    const nodes = {
        starValue: document.getElementById('star-count-value'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-entry-input'),
        btnTransmit: document.getElementById('btn-transmit-log'),
        btnAwardStar: document.getElementById('btn-award-star'),
        checkbox: document.getElementById('attest-checkbox'),
        timeline: document.getElementById('migration-timeline')
    };

    // 3. UI Sync Logic
    const sync = () => {
        // Stats
        if (nodes.starValue) {
            nodes.starValue.textContent = state.stars.toLocaleString();
        }

        // Star Field
        if (nodes.starField) {
            nodes.starField.innerHTML = '';
            const visualLimit = Math.min(state.stars, 120);
            for (let i = 0; i < visualLimit; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                s.style.animation = 'antPop 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46)';
                nodes.starField.appendChild(s);
            }
        }

        // Timeline
        if (nodes.timeline) {
            nodes.timeline.innerHTML = '';
            // Show latest logs first
            [...state.logs].reverse().forEach(entry => {
                const div = document.createElement('div');
                div.className = 'ant-timeline-item';
                div.textContent = entry;
                nodes.timeline.appendChild(div);
            });
        }

        // Checkbox
        if (nodes.checkbox) {
            nodes.checkbox.checked = state.attested;
        }
    };

    const persist = () => {
        localStorage.setItem(KEY, JSON.stringify(state));
    };

    // 4. Action Bindings
    if (nodes.btnAwardStar) {
        nodes.btnAwardStar.addEventListener('click', (e) => {
            e.preventDefault();
            state.stars++;
            persist();
            sync();
        });
    }

    if (nodes.btnTransmit) {
        nodes.btnTransmit.addEventListener('click', (e) => {
            e.preventDefault();
            const text = nodes.logInput.value.trim();
            if (text) {
                state.logs.push(text);
                nodes.logInput.value = '';
                persist();
                sync();
            }
        });
    }

    if (nodes.checkbox) {
        nodes.checkbox.addEventListener('change', (e) => {
            state.attested = e.target.checked;
            persist();
            if (state.attested) {
                notify('Successfully Attested Migration Status');
            }
        });
    }

    // 5. Ant Design Feedback (Notification)
    const notify = (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: #fff;
            padding: 16px 24px;
            border-radius: 2px;
            box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08);
            z-index: 9999;
            border-left: 4px solid #52c41a;
            animation: antSlideIn 0.3s forwards;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        div.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.style.animation = 'antSlideOut 0.3s forwards';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    };

    // Inject Runtime Styles
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes antPop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes antSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes antSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);

    // Initial Sync
    sync();
});
