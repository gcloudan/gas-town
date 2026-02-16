document.addEventListener('DOMContentLoaded', () => {
    // 1. Core State
    const storageKey = 'istio_vanguard_data';
    const rawData = localStorage.getItem(storageKey);
    let state = {
        stars: 0,
        logs: [],
        attested: false
    };

    if (rawData) {
        try {
            state = JSON.parse(rawData);
        } catch (e) {
            console.error('Failed to parse state', e);
        }
    }

    // 2. DOM Selectors (Strict IDs)
    const el = {
        starCount: document.getElementById('stars-total'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-input'),
        btnTransmit: document.getElementById('btn-transmit'),
        btnAwardStar: document.getElementById('btn-award-star'),
        checkAttest: document.getElementById('check-attest'),
        logsTimeline: document.getElementById('logs-timeline')
    };

    // 3. Update Function
    const syncUI = () => {
        if (el.starCount) {
            el.starCount.textContent = `${state.stars} Stars Awarded`;
        }

        if (el.starField) {
            el.starField.innerHTML = '';
            // Visual cap to 100 stars for performance
            const visualStars = Math.min(state.stars, 100);
            for (let i = 0; i < visualStars; i++) {
                const span = document.createElement('span');
                span.textContent = '⭐';
                el.starField.appendChild(span);
            }
        }

        if (el.logsTimeline) {
            el.logsTimeline.innerHTML = '';
            // Show logs in reverse chronological order
            [...state.logs].reverse().forEach(text => {
                const item = document.createElement('div');
                item.className = 'ant-timeline-item';
                item.textContent = text;
                el.logsTimeline.appendChild(item);
            });
        }

        if (el.checkAttest) {
            el.checkAttest.checked = !!state.attested;
        }
    };

    const persist = () => {
        localStorage.setItem(storageKey, JSON.stringify(state));
    };

    // 4. Action Handlers
    if (el.btnAwardStar) {
        el.btnAwardStar.addEventListener('click', () => {
            state.stars++;
            persist();
            syncUI();
        });
    }

    if (el.btnTransmit) {
        el.btnTransmit.addEventListener('click', () => {
            const val = el.logInput.value.trim();
            if (val) {
                state.logs.push(val);
                el.logInput.value = '';
                persist();
                syncUI();
            }
        });
    }

    if (el.checkAttest) {
        el.checkAttest.addEventListener('change', (e) => {
            state.attested = e.target.checked;
            persist();
            if (state.attested) {
                showAntNotification('Migration status updated to: Attested');
            }
        });
    }

    // 5. High-end Ant Feedback
    const showAntNotification = (message) => {
        const notify = document.createElement('div');
        notify.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: white;
            padding: 16px 24px;
            border-radius: 2px;
            box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08);
            z-index: 1000;
            border-left: 4px solid #52c41a;
            animation: antSlide 0.3s forwards;
        `;
        notify.innerHTML = `<span style="color:#52c41a; margin-right: 8px;">✔</span> ${message}`;
        document.body.appendChild(notify);
        
        setTimeout(() => {
            notify.style.animation = 'antSlideOut 0.3s forwards';
            setTimeout(() => notify.remove(), 300);
        }, 3000);
    };

    // Global Styles for Animations
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes antSlide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes antSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(styleSheet);

    // Initial Sync
    syncUI();
});
