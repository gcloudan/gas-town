document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'vanguard_ant_white_v1';
    let state = {
        stars: parseInt(localStorage.getItem(KEY + '_stars') || '0'),
        logs: JSON.parse(localStorage.getItem(KEY + '_logs') || '[]'),
        attested: localStorage.getItem(KEY + '_attested') === 'true'
    };

    // 2. Elements
    const nodes = {
        starCount: document.getElementById('star-count'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-input'),
        btnPost: document.getElementById('btn-post'),
        btnStar: document.getElementById('btn-star'),
        attestCheck: document.getElementById('attest-check'),
        timeline: document.getElementById('timeline')
    };

    // 3. UI Sync
    const sync = () => {
        // Counter
        if (nodes.starCount) nodes.starCount.textContent = state.stars.toLocaleString();

        // Stars
        if (nodes.starField) {
            nodes.starField.innerHTML = '';
            const limit = Math.min(state.stars, 100);
            for (let i = 0; i < limit; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                s.style.display = 'inline-block';
                s.style.animation = 'pop 0.3s forwards';
                nodes.starField.appendChild(s);
            }
        }

        // Timeline
        if (nodes.timeline) {
            nodes.timeline.innerHTML = '';
            [...state.logs].reverse().forEach(text => {
                const div = document.createElement('div');
                div.className = 'timeline-item';
                div.textContent = text;
                nodes.timeline.appendChild(div);
            });
        }

        // Checkbox
        if (nodes.attestCheck) nodes.attestCheck.checked = state.attested;
    };

    const save = () => {
        localStorage.setItem(KEY + '_stars', state.stars);
        localStorage.setItem(KEY + '_logs', JSON.stringify(state.logs));
        localStorage.setItem(KEY + '_attested', state.attested);
    };

    // 4. Handlers
    if (nodes.btnStar) {
        nodes.btnStar.addEventListener('click', () => {
            state.stars++;
            save();
            sync();
        });
    }

    if (nodes.btnPost) {
        nodes.btnPost.addEventListener('click', () => {
            const val = nodes.logInput.value.trim();
            if (val) {
                state.logs.push(val);
                nodes.logInput.value = '';
                save();
                sync();
            }
        });
    }

    if (nodes.attestCheck) {
        nodes.attestCheck.addEventListener('change', (e) => {
            state.attested = e.target.checked;
            save();
            if (state.attested) {
                notify('Successfully Attested Migration');
            }
        });
    }

    // 5. Ant Notification
    const notify = (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: #fff;
            border: 1px solid #f0f0f0;
            padding: 16px 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            border-left: 4px solid #52c41a;
            border-radius: 2px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s forwards;
        `;
        div.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    };

    // 6. Inline Styles for Anim
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);

    // Initial Sync
    sync();
});
