document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'istio_nexus_v1';
    let state = {
        stars: parseInt(localStorage.getItem(KEY + '_stars') || '0'),
        logs: JSON.parse(localStorage.getItem(KEY + '_logs') || '[]'),
        attested: localStorage.getItem(KEY + '_attested') === 'true',
        packets: 0
    };

    // 2. Elements
    const nodes = {
        starCount: document.getElementById('star-count'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-input'),
        btnPost: document.getElementById('btn-post'),
        btnStar: document.getElementById('btn-star'),
        attestCheck: document.getElementById('attest-check'),
        timeline: document.getElementById('timeline'),
        btnInject: document.getElementById('btn-inject'),
        packetCount: document.getElementById('packet-count'),
        simCanvas: document.getElementById('sim-canvas')
    };

    // 3. UI Sync
    const sync = () => {
        if (nodes.starCount) nodes.starCount.textContent = state.stars.toLocaleString();
        if (nodes.packetCount) nodes.packetCount.textContent = state.packets.toLocaleString();

        if (nodes.starField) {
            nodes.starField.innerHTML = '';
            const limit = Math.min(state.stars, 80);
            for (let i = 0; i < limit; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                s.style.animation = 'pop 0.3s forwards';
                nodes.starField.appendChild(s);
            }
        }

        if (nodes.timeline) {
            nodes.timeline.innerHTML = '';
            [...state.logs].reverse().forEach(text => {
                const div = document.createElement('div');
                div.className = 'timeline-item';
                div.textContent = text;
                nodes.timeline.appendChild(div);
            });
        }

        if (nodes.attestCheck) nodes.attestCheck.checked = state.attested;
    };

    const save = () => {
        localStorage.setItem(KEY + '_stars', state.stars);
        localStorage.setItem(KEY + '_logs', JSON.stringify(state.logs));
        localStorage.setItem(KEY + '_attested', state.attested);
    };

    // 4. Traffic Simulator Logic
    const injectPacket = () => {
        state.packets++;
        sync();
        
        const packet = document.createElement('div');
        packet.className = 'packet';
        packet.style.left = '0%';
        packet.style.top = Math.random() * 90 + '%';
        nodes.simCanvas.appendChild(packet);
        
        // Warp Animation
        const anim = packet.animate([
            { left: '0%', opacity: 1 },
            { left: '40%', opacity: 1, filter: 'blur(0px)' },
            { left: '60%', opacity: 0.5, filter: 'blur(10px)', scale: '1.5' },
            { left: '100%', opacity: 1, filter: 'blur(0px)', scale: '1' }
        ], { duration: 1500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        
        anim.onfinish = () => packet.remove();
    };

    // 5. Handlers
    if (nodes.btnStar) {
        nodes.btnStar.addEventListener('click', () => {
            state.stars++;
            save();
            sync();
        });
    }

    if (nodes.btnInject) {
        nodes.btnInject.addEventListener('click', injectPacket);
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
                notify('Nexus Link Established: Parity Achieved');
            }
        });
    }

    // 6. Feedback
    const notify = (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: #fff;
            padding: 16px 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 2000;
            border-left: 4px solid #52c41a;
            border-radius: 2px;
            animation: slideIn 0.3s forwards;
        `;
        div.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    };

    // 7. Animations
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);

    // 8. Background Background Packets
    setInterval(() => {
        if (Math.random() > 0.7) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: fixed;
                width: 2px; height: 2px;
                background: #1890ff;
                left: -10px;
                top: ${Math.random() * 100}vh;
                opacity: 0.5;
                pointer-events: none;
                z-index: -1;
            `;
            document.body.appendChild(p);
            p.animate([
                { left: '-10px' },
                { left: '110vw' }
            ], { duration: 5000 + Math.random() * 5000 }).onfinish = () => p.remove();
        }
    }, 500);

    // Initial Sync
    sync();
});
