document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Store
    const KEY = 'istio_station_final_v15'; 
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
        askingPrice: parseInt(localStorage.getItem(KEY + '_asking_price') || '1000'),
        prestige: parseInt(localStorage.getItem(KEY + '_prestige') || '0'),
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
        scrapperCountDisp: document.getElementById('scrapper-count-display'),
        btnScrapperMinus: document.getElementById('btn-scrapper-minus'),
        btnScrapperPlus: document.getElementById('btn-scrapper-plus'),
        assemblerCountDisp: document.getElementById('assembler-count-display'),
        btnAssemblerMinus: document.getElementById('btn-assembler-minus'),
        btnAssemblerPlus: document.getElementById('btn-assembler-plus'),
        askingPriceDisp: document.getElementById('asking-price-disp'),
        btnPriceMinus: document.getElementById('btn-price-minus'),
        btnPricePlus: document.getElementById('btn-price-plus'),
        demandDisp: document.getElementById('demand-disp'),
        prestigeCount: document.getElementById('prestige-count'),
        btnPrestige: document.getElementById('btn-prestige'),
        btnInject: document.getElementById('btn-inject'),
        packetCount: document.getElementById('packet-count'),
        simCanvas: document.getElementById('sim-canvas')
    };

    const calculateDemand = () => {
        const basePrice = 1000;
        let demand = Math.max(0, 100 - (state.askingPrice - basePrice) / 10);
        if (state.askingPrice < basePrice) demand = Math.min(250, 100 + (basePrice - state.askingPrice) / 2);
        return Math.round(demand);
    };

    const syncUI = () => {
        if (refs.moneyCount) refs.moneyCount.textContent = state.money.toLocaleString();
        if (refs.scrapCount) refs.scrapCount.textContent = state.scrap.toLocaleString();
        if (refs.shipCount) refs.shipCount.textContent = state.ships.toLocaleString();
        if (refs.gwCount) refs.gwCount.textContent = state.gateways.toLocaleString();
        if (refs.prestigeCount) refs.prestigeCount.textContent = state.prestige.toLocaleString();
        
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

        // Logic Sync
        if (refs.btnBuildShip) refs.btnBuildShip.disabled = state.scrap < 2;
        if (refs.btnForgeGW) refs.btnForgeGW.disabled = state.ships < 2;
        if (refs.btnSellGW) refs.btnSellGW.disabled = state.gateways < 1;
        if (refs.btnPrestige) refs.btnPrestige.disabled = state.money < 10000;
        
        if (refs.scrapperCountDisp) refs.scrapperCountDisp.textContent = state.autoScrappers;
        if (refs.assemblerCountDisp) refs.assemblerCountDisp.textContent = state.autoAssemblers;
        
        // UPGRADE COSTS: Ships for Scrapper, Gateways for Assembler
        if (refs.btnScrapperMinus) refs.btnScrapperMinus.disabled = state.autoScrappers < 1;
        if (refs.btnScrapperPlus) refs.btnScrapperPlus.disabled = state.ships < 5;
        if (refs.btnAssemblerMinus) refs.btnAssemblerMinus.disabled = state.autoAssemblers < 1;
        if (refs.btnAssemblerPlus) refs.btnAssemblerPlus.disabled = state.gateways < 5;

        if (refs.askingPriceDisp) refs.askingPriceDisp.textContent = state.askingPrice.toLocaleString();
        if (refs.demandDisp) refs.demandDisp.textContent = calculateDemand();
        if (refs.btnPriceMinus) refs.btnPriceMinus.disabled = state.askingPrice <= 100;

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
        localStorage.setItem(KEY + '_asking_price', state.askingPrice);
        localStorage.setItem(KEY + '_prestige', state.prestige);
    };

    // Logic implementation
    if (refs.btnCollectScrap) {
        refs.btnCollectScrap.onclick = () => {
            state.scrap += 1;
            save();
            syncUI();
        };
    }

    if (refs.btnBuildShip) {
        refs.btnBuildShip.onclick = () => {
            if (state.scrap >= 2) {
                state.scrap -= 2;
                state.ships++;
                save();
                syncUI();
            }
        };
    }

    if (refs.btnForgeGW) {
        refs.btnForgeGW.onclick = () => {
            if (state.ships >= 2) {
                state.ships -= 2;
                state.gateways++;
                save();
                syncUI();
                notify('New Ingress Gateway Forged!');
            }
        };
    }

    if (refs.btnSellGW) {
        refs.btnSellGW.onclick = () => {
            if (state.gateways >= 1) {
                state.gateways--;
                state.money += state.askingPrice;
                save();
                syncUI();
                notify(`Manual Sale: +$${state.askingPrice.toLocaleString()} Federation Credits`);
            }
        };
    }

    if (refs.btnPrestige) {
        refs.btnPrestige.onclick = () => {
            if (state.money >= 10000) {
                state.money -= 10000;
                state.prestige++;
                save();
                syncUI();
                notify('Vanguard Prestige Achieved! 🎖️');
            }
        };
    }

    if (refs.btnPricePlus) {
        refs.btnPricePlus.onclick = () => {
            state.askingPrice += 100;
            save();
            syncUI();
        };
    }
    if (refs.btnPriceMinus) {
        refs.btnPriceMinus.onclick = () => {
            if (state.askingPrice > 100) {
                state.askingPrice -= 100;
                save();
                syncUI();
            }
        };
    }

    // Auto-Scrapper Costs 5 Ships
    if (refs.btnScrapperPlus) {
        refs.btnScrapperPlus.onclick = () => {
            if (state.ships >= 5) {
                state.ships -= 5;
                state.autoScrappers++;
                save();
                syncUI();
            }
        };
    }
    if (refs.btnScrapperMinus) {
        refs.btnScrapperMinus.onclick = () => {
            if (state.autoScrappers > 0) {
                state.autoScrappers--;
                // NO REFUND
                save();
                syncUI();
            }
        };
    }

    // Auto-Assembler Costs 5 Gateways
    if (refs.btnAssemblerPlus) {
        refs.btnAssemblerPlus.onclick = () => {
            if (state.gateways >= 5) {
                state.gateways -= 5;
                state.autoAssemblers++;
                save();
                syncUI();
            }
        };
    }
    if (refs.btnAssemblerMinus) {
        refs.btnAssemblerMinus.onclick = () => {
            if (state.autoAssemblers > 0) {
                state.autoAssemblers--;
                // NO REFUND
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

    if (refs.btnInject) {
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
        setTimeout(() => div.remove(), 3000);
    };

    syncUI();
});
