document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'istio_station_v2';
    let state = {
        stars: parseInt(localStorage.getItem(KEY + '_stars') || '0'),
        logs: JSON.parse(localStorage.getItem(KEY + '_logs') || '[]'),
        attested: localStorage.getItem(KEY + '_attested') === 'true',
        // Shipyard State
        scrap: parseInt(localStorage.getItem(KEY + '_scrap') || '0'),
        ships: parseInt(localStorage.getItem(KEY + '_ships') || '0'),
        gateways: parseInt(localStorage.getItem(KEY + '_gateways') || '0'),
        autoScrappers: parseInt(localStorage.getItem(KEY + '_auto_scrappers') || '0'),
        autoAssemblers: parseInt(localStorage.getItem(KEY + '_auto_assemblers') || '0'),
        // Traffic State
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
        // Shipyard Nodes
        scrapCount: document.getElementById('scrap-count'),
        shipCount: document.getElementById('ship-count'),
        gwCount: document.getElementById('gw-count'),
        btnCollectScrap: document.getElementById('btn-collect-scrap'),
        btnBuildShip: document.getElementById('btn-build-ship'),
        btnForgeGW: document.getElementById('btn-forge-gw'),
        btnAutoScrapper: document.getElementById('btn-auto-scrapper'),
        btnAutoAssembler: document.getElementById('btn-auto-assembler'),
        // Inspector Nodes
        btnInject: document.getElementById('btn-inject'),
        packetCount: document.getElementById('packet-count'),
        simCanvas: document.getElementById('sim-canvas')
    };

    // 3. UI Sync
    const sync = () => {
        // Hall of Fame
        if (nodes.starCount) nodes.starCount.textContent = state.stars.toLocaleString();
        if (nodes.starField) {
            nodes.starField.innerHTML = '';
            const limit = Math.min(state.stars, 60);
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

        // Shipyard
        if (nodes.scrapCount) nodes.scrapCount.textContent = state.scrap.toLocaleString();
        if (nodes.shipCount) nodes.shipCount.textContent = state.ships.toLocaleString();
        if (nodes.gwCount) nodes.gwCount.textContent = state.gateways.toLocaleString();

        nodes.btnBuildShip.disabled = state.scrap < 10;
        nodes.btnForgeGW.disabled = state.ships < 5;
        nodes.btnAutoScrapper.disabled = state.scrap < 50;
        nodes.btnAutoAssembler.disabled = state.ships < 20;

        nodes.btnAutoScrapper.textContent = `Auto-Scrapper (${state.autoScrappers}) - 50 Scrap`;
        nodes.btnAutoAssembler.textContent = `Auto-Assembler (${state.autoAssemblers}) - 20 Ships`;

        // Inspector
        if (nodes.packetCount) nodes.packetCount.textContent = state.packets.toLocaleString();
    };

    const save = () => {
        localStorage.setItem(KEY + '_stars', state.stars);
        localStorage.setItem(KEY + '_logs', JSON.stringify(state.logs));
        localStorage.setItem(KEY + '_attested', state.attested);
        localStorage.setItem(KEY + '_scrap', state.scrap);
        localStorage.setItem(KEY + '_ships', state.ships);
        localStorage.setItem(KEY + '_gateways', state.gateways);
        localStorage.setItem(KEY + '_auto_scrappers', state.autoScrappers);
        localStorage.setItem(KEY + '_auto_assemblers', state.autoAssemblers);
    };

    // 4. Traffic Simulator (Inspector) Logic
    const injectPacket = () => {
        state.packets++;
        sync();
        const packet = document.createElement('div');
        packet.className = 'packet';
        packet.style.left = '0%';
        packet.style.top = Math.random() * 90 + '%';
        nodes.simCanvas.appendChild(packet);
        const anim = packet.animate([
            { left: '0%', opacity: 1 },
            { left: '40%', opacity: 1, filter: 'blur(0px)' },
            { left: '60%', opacity: 0.5, filter: 'blur(10px)', scale: '1.5' },
            { left: '100%', opacity: 1, filter: 'blur(0px)', scale: '1' }
        ], { duration: 1500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        anim.onfinish = () => packet.remove();
    };

    // 5. Idle Game Logic
    nodes.btnCollectScrap.onclick = () => {
        state.scrap++;
        save();
        sync();
    };

    nodes.btnBuildShip.onclick = () => {
        if (state.scrap >= 10) {
            state.scrap -= 10;
            state.ships++;
            save();
            sync();
        }
    };

    nodes.btnForgeGW.onclick = () => {
        if (state.ships >= 5) {
            state.ships -= 5;
            state.gateways++;
            save();
            sync();
            notify('New Ingress Gateway Forged!');
        }
    };

    nodes.btnAutoScrapper.onclick = () => {
        if (state.scrap >= 50) {
            state.scrap -= 50;
            state.autoScrappers++;
            save();
            sync();
        }
    };

    nodes.btnAutoAssembler.onclick = () => {
        if (state.ships >= 20) {
            state.ships -= 20;
            state.autoAssemblers++;
            save();
            sync();
        }
    };

    setInterval(() => {
        let changed = false;
        if (state.autoScrappers > 0) {
            state.scrap += state.autoScrappers;
            changed = true;
        }
        if (state.autoAssemblers > 0) {
            const potential = Math.floor(state.scrap / 10);
            const toBuild = Math.min(potential, state.autoAssemblers);
            if (toBuild > 0) {
                state.scrap -= (toBuild * 10);
                state.ships += toBuild;
                changed = true;
            }
        }
        if (changed) {
            save();
            sync();
        }
    }, 1000);

    // 6. Hall of Fame Handlers
    nodes.btnStar.onclick = () => {
        state.stars++;
        save();
        sync();
    };

    nodes.btnPost.onclick = () => {
        const val = nodes.logInput.value.trim();
        if (val) {
            state.logs.push(val);
            nodes.logInput.value = '';
            save();
            sync();
        }
    };

    nodes.attestCheck.onchange = (e) => {
        state.attested = e.target.checked;
        save();
        if (state.attested) {
            notify('Link Established: Station Docking Confirmed');
        }
    };

    if (nodes.btnInject) {
        nodes.btnInject.onclick = injectPacket;
    }

    // 7. Global Feedback
    const notify = (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed; top: 24px; right: 24px; background: #fff;
            padding: 16px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 2000; border-left: 4px solid #52c41a; border-radius: 2px;
            animation: slideIn 0.3s forwards;
        `;
        div.innerHTML = `<span style="color:#52c41a">✔</span> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    };

    // 8. Animations
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);

    // Initial Sync
    sync();
});
