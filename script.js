document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'istio_station_final_v1';
    let state = {
        stars: parseInt(localStorage.getItem(KEY + '_stars') || '0'),
        logs: JSON.parse(localStorage.getItem(KEY + '_logs') || '[]'),
        attested: localStorage.getItem(KEY + '_attested') === 'true',
        scrap: parseInt(localStorage.getItem(KEY + '_scrap') || '0'),
        ships: parseInt(localStorage.getItem(KEY + '_ships') || '0'),
        gateways: parseInt(localStorage.getItem(KEY + '_gateways') || '0'),
        autoScrappers: parseInt(localStorage.getItem(KEY + '_auto_scrappers') || '0'),
        autoAssemblers: parseInt(localStorage.getItem(KEY + '_auto_assemblers') || '0'),
        packets: 0
    };

    const refs = {
        starCount: document.getElementById('star-count'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-input'),
        btnPost: document.getElementById('btn-post'),
        btnStar: document.getElementById('btn-star'),
        attestCheck: document.getElementById('attest-check'),
        timeline: document.getElementById('timeline'),
        scrapCount: document.getElementById('scrap-count'),
        shipCount: document.getElementById('ship-count'),
        gwCount: document.getElementById('gw-count'),
        btnCollectScrap: document.getElementById('btn-collect-scrap'),
        btnBuildShip: document.getElementById('btn-build-ship'),
        btnForgeGW: document.getElementById('btn-forge-gw'),
        btnAutoScrapper: document.getElementById('btn-auto-scrapper'),
        btnAutoAssembler: document.getElementById('btn-auto-assembler'),
        btnInject: document.getElementById('btn-inject'),
        packetCount: document.getElementById('packet-count'),
        simCanvas: document.getElementById('sim-canvas')
    };

    const syncUI = () => {
        if (refs.starCount) refs.starCount.textContent = state.stars.toLocaleString();
        if (refs.starField) {
            refs.starField.innerHTML = '';
            const limit = Math.min(state.stars, 60);
            for (let i = 0; i < limit; i++) {
                const s = document.createElement('span');
                s.textContent = '⭐';
                s.style.animation = 'pop 0.3s forwards';
                refs.starField.appendChild(s);
            }
        }
        if (refs.timeline) {
            refs.timeline.innerHTML = '';
            [...state.logs].reverse().forEach(text => {
                const div = document.createElement('div');
                div.className = 'timeline-item';
                div.textContent = text;
                refs.timeline.appendChild(div);
            });
        }
        if (refs.attestCheck) refs.attestCheck.checked = state.attested;

        if (refs.scrapCount) refs.scrapCount.textContent = state.scrap.toLocaleString();
        if (refs.shipCount) refs.shipCount.textContent = state.ships.toLocaleString();
        if (refs.gwCount) refs.gwCount.textContent = state.gateways.toLocaleString();

        if (refs.btnBuildShip) refs.btnBuildShip.disabled = state.scrap < 10;
        if (refs.btnForgeGW) refs.btnForgeGW.disabled = state.ships < 5;
        if (refs.btnAutoScrapper) refs.btnAutoScrapper.disabled = state.scrap < 50;
        if (refs.btnAutoAssembler) refs.btnAutoAssembler.disabled = state.ships < 20;

        if (refs.btnAutoScrapper) refs.btnAutoScrapper.textContent = `Auto-Scrapper (${state.autoScrappers}) - 50 Scrap`;
        if (refs.btnAutoAssembler) refs.btnAutoAssembler.textContent = `Auto-Assembler (${state.autoAssemblers}) - 20 Ships`;

        if (refs.packetCount) refs.packetCount.textContent = state.packets.toLocaleString();
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

    // Use direct onclick for maximum reliability
    if (refs.btnCollectScrap) {
        refs.btnCollectScrap.onclick = () => {
            state.scrap++;
            save();
            syncUI();
        };
    }

    if (refs.btnBuildShip) {
        refs.btnBuildShip.onclick = () => {
            if (state.scrap >= 10) {
                state.scrap -= 10;
                state.ships++;
                save();
                syncUI();
            }
        };
    }

    if (refs.btnForgeGW) {
        refs.btnForgeGW.onclick = () => {
            if (state.ships >= 5) {
                state.ships -= 5;
                state.gateways++;
                save();
                syncUI();
                notify('New Ingress Gateway Forged!');
            }
        };
    }

    if (refs.btnAutoScrapper) {
        refs.btnAutoScrapper.onclick = () => {
            if (state.scrap >= 50) {
                state.scrap -= 50;
                state.autoScrappers++;
                save();
                syncUI();
            }
        };
    }

    if (refs.btnAutoAssembler) {
        refs.btnAutoAssembler.onclick = () => {
            if (state.ships >= 20) {
                state.ships -= 20;
                state.autoAssemblers++;
                save();
                syncUI();
            }
        };
    }

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
            syncUI();
        }
    }, 1000);

    if (refs.btnInject) {
        refs.btnInject.onclick = () => {
            state.packets++;
            syncUI();
            const p = document.createElement('div');
            p.className = 'packet';
            p.style.left = '0%';
            p.style.top = Math.random() * 90 + '%';
            refs.simCanvas.appendChild(p);
            const a = p.animate([
                { left: '0%', opacity: 1 },
                { left: '40%', opacity: 1, filter: 'blur(0px)' },
                { left: '60%', opacity: 0.5, filter: 'blur(10px)', scale: '1.5' },
                { left: '100%', opacity: 1, filter: 'blur(0px)', scale: '1' }
            ], { duration: 1500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
            a.onfinish = () => p.remove();
        };
    }

    if (refs.btnStar) {
        refs.btnStar.onclick = () => {
            state.stars++;
            save();
            syncUI();
        };
    }

    if (refs.btnPost) {
        refs.btnPost.onclick = () => {
            const val = refs.logInput.value.trim();
            if (val) {
                state.logs.push(val);
                refs.logInput.value = '';
                save();
                syncUI();
            }
        };
    }

    if (refs.attestCheck) {
        refs.attestCheck.onchange = (e) => {
            state.attested = e.target.checked;
            save();
            if (state.attested) notify('Orbital Parity Achieved');
        };
    }

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

    syncUI();
});
