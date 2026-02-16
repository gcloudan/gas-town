document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'istio_station_final_v7';
    let state = {
        stars: parseInt(localStorage.getItem(KEY + '_stars') || '0'),
        logs: JSON.parse(localStorage.getItem(KEY + '_logs') || '[]'),
        attested: localStorage.getItem(KEY + '_attested') === 'true',
        money: parseInt(localStorage.getItem(KEY + '_money') || '0'),
        scrap: parseInt(localStorage.getItem(KEY + '_scrap') || '0'),
        ships: parseInt(localStorage.getItem(KEY + '_ships') || '0'),
        gateways: parseInt(localStorage.getItem(KEY + '_gateways') || '0'),
        autoScrappers: parseInt(localStorage.getItem(KEY + '_auto_scrappers') || '0'),
        autoAssemblers: parseInt(localStorage.getItem(KEY + '_auto_assemblers') || '0'),
        packets: 0
    };

    const refs = {
        moneyCount: document.getElementById('money-count'),
        scrapCount: document.getElementById('scrap-count'),
        shipCount: document.getElementById('ship-count'),
        gwCount: document.getElementById('gw-count'),
        starCount: document.getElementById('star-count'),
        starField: document.getElementById('star-field'),
        logInput: document.getElementById('log-input'),
        btnPost: document.getElementById('btn-post'),
        btnStar: document.getElementById('btn-star'),
        attestCheck: document.getElementById('attest-check'),
        timeline: document.getElementById('timeline'),
        btnCollectScrap: document.getElementById('btn-collect-scrap'),
        btnBuildShip: document.getElementById('btn-build-ship'),
        btnForgeGW: document.getElementById('btn-forge-gw'),
        btnSellGW: document.getElementById('btn-sell-gw'),
        // Control Group Nodes
        scrapperCountDisp: document.getElementById('scrapper-count-display'),
        btnScrapperMinus: document.getElementById('btn-scrapper-minus'),
        btnScrapperPlus: document.getElementById('btn-scrapper-plus'),
        assemblerCountDisp: document.getElementById('assembler-count-display'),
        btnAssemblerMinus: document.getElementById('btn-assembler-minus'),
        btnAssemblerPlus: document.getElementById('btn-assembler-plus'),
        btnInject: document.getElementById('btn-inject'),
        packetCount: document.getElementById('packet-count'),
        simCanvas: document.getElementById('sim-canvas')
    };

    const syncUI = () => {
        if (refs.moneyCount) refs.moneyCount.textContent = state.money.toLocaleString();
        if (refs.scrapCount) refs.scrapCount.textContent = state.scrap.toLocaleString();
        if (refs.shipCount) refs.shipCount.textContent = state.ships.toLocaleString();
        if (refs.gwCount) refs.gwCount.textContent = state.gateways.toLocaleString();
        
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

        // Action states
        if (refs.btnBuildShip) refs.btnBuildShip.disabled = state.scrap < 2;
        if (refs.btnForgeGW) refs.btnForgeGW.disabled = state.ships < 2;
        if (refs.btnSellGW) refs.btnSellGW.disabled = state.gateways < 1;
        
        // Control states
        if (refs.scrapperCountDisp) refs.scrapperCountDisp.textContent = state.autoScrappers;
        if (refs.assemblerCountDisp) refs.assemblerCountDisp.textContent = state.autoAssemblers;
        
        if (refs.btnScrapperMinus) refs.btnScrapperMinus.disabled = state.autoScrappers < 1;
        if (refs.btnScrapperPlus) refs.btnScrapperPlus.disabled = state.money < 50;
        if (refs.btnAssemblerMinus) refs.btnAssemblerMinus.disabled = state.autoAssemblers < 1;
        if (refs.btnAssemblerPlus) refs.btnAssemblerPlus.disabled = state.money < 200;

        if (refs.packetCount) refs.packetCount.textContent = state.packets.toLocaleString();
    };

    const save = () => {
        localStorage.setItem(KEY + '_money', state.money);
        localStorage.setItem(KEY + '_stars', state.stars);
        localStorage.setItem(KEY + '_logs', JSON.stringify(state.logs));
        localStorage.setItem(KEY + '_attested', state.attested);
        localStorage.setItem(KEY + '_scrap', state.scrap);
        localStorage.setItem(KEY + '_ships', state.ships);
        localStorage.setItem(KEY + '_gateways', state.gateways);
        localStorage.setItem(KEY + '_auto_scrappers', state.autoScrappers);
        localStorage.setItem(KEY + '_auto_assemblers', state.autoAssemblers);
    };

    // Economy Logic
    refs.btnCollectScrap.onclick = () => {
        state.scrap += 2;
        state.money += 10;
        save();
        syncUI();
    };

    refs.btnBuildShip.onclick = () => {
        if (state.scrap >= 2) {
            state.scrap -= 2;
            state.ships++;
            save();
            syncUI();
        }
    };

    refs.btnForgeGW.onclick = () => {
        if (state.ships >= 2) {
            state.ships -= 2;
            state.gateways++;
            save();
            syncUI();
            notify('New Ingress Gateway Forged!');
        }
    };

    refs.btnSellGW.onclick = () => {
        if (state.gateways >= 1) {
            state.gateways--;
            state.money += 1000;
            save();
            syncUI();
            notify('Sold Gateway! +$1,000');
        }
    };

    // Upgrade Control Logic
    refs.btnScrapperPlus.onclick = () => {
        if (state.money >= 50) {
            state.money -= 50;
            state.autoScrappers++;
            save();
            syncUI();
        }
    };
    refs.btnScrapperMinus.onclick = () => {
        if (state.autoScrappers > 0) {
            state.autoScrappers--;
            state.money += 25; // Half refund
            save();
            syncUI();
        }
    };

    refs.btnAssemblerPlus.onclick = () => {
        if (state.money >= 200) {
            state.money -= 200;
            state.autoAssemblers++;
            save();
            syncUI();
        }
    };
    refs.btnAssemblerMinus.onclick = () => {
        if (state.autoAssemblers > 0) {
            state.autoAssemblers--;
            state.money += 100; // Half refund
            save();
            syncUI();
        }
    };

    // Auto Loop
    setInterval(() => {
        let changed = false;
        if (state.autoScrappers > 0) {
            state.scrap += (state.autoScrappers * 2);
            state.money += (state.autoScrappers * 5);
            changed = true;
        }
        if (state.autoAssemblers > 0) {
            const potential = Math.floor(state.scrap / 2);
            const toBuild = Math.min(potential, state.autoAssemblers);
            if (toBuild > 0) {
                state.scrap -= (toBuild * 2);
                state.ships += toBuild;
                changed = true;
            }
        }
        if (changed) {
            save();
            syncUI();
        }
    }, 1000);

    // Inspector
    refs.btnInject.onclick = () => {
        state.packets++;
        syncUI();
        const p = document.createElement('div');
        p.className = 'packet';
        p.style.left = '0%';
        p.style.top = Math.random() * 90 + '%';
        if (refs.simCanvas) {
            refs.simCanvas.appendChild(p);
            p.animate([{ left: '0%', opacity: 1 }, { left: '100%', opacity: 1 }], 1500).onfinish = () => p.remove();
        }
    };

    // Hall of Fame
    refs.btnStar.onclick = () => {
        state.stars++;
        save();
        syncUI();
    };

    refs.btnPost.onclick = () => {
        const val = refs.logInput.value.trim();
        if (val) {
            state.logs.push(val);
            refs.logInput.value = '';
            save();
            syncUI();
        }
    };

    refs.attestCheck.onchange = (e) => {
        state.attested = e.target.checked;
        save();
        if (state.attested) notify('Orbital Parity Achieved');
    };

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
