const state = {
    comments: JSON.parse(localStorage.getItem('istio_warp_comments') || '[]'),
    stars: parseInt(localStorage.getItem('istio_warp_stars') || '0'),
    attested: localStorage.getItem('istio_warp_attested') === 'true'
};

const saveState = () => {
    localStorage.setItem('istio_warp_comments', JSON.stringify(state.comments));
    localStorage.setItem('istio_warp_stars', state.stars.toString());
    localStorage.setItem('istio_warp_attested', state.attested.toString());
};

const render = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header class="hero">
            <h1>ISTIO WARP</h1>
            <p>Accelerating beyond NGINX into the Service Mesh future.</p>
        </header>

        <section class="feature-grid">
            <div class="glass-card">
                <h3>The "Why"</h3>
                <p>NGINX is a gateway; Istio is an ecosystem. mTLS by default, fine-grained traffic shifting, and observability that doesn't ask for permission.</p>
            </div>
            <div class="glass-card">
                <h3>Shared vs Dedicated</h3>
                <p><strong>Shared:</strong> Efficiency for the many. <br><strong>Dedicated:</strong> Sovereignty for the critical. Blast radius control starts at the Gateway.</p>
            </div>
        </section>

        <section class="interactive-zone glass-card">
            <h2>Migration Hall of Fame</h2>
            <div id="star-display" class="star-field">
                ${'⭐'.repeat(Math.min(state.stars, 50))}${state.stars > 50 ? '+' : ''}
            </div>
            
            <div class="input-container">
                <input type="text" id="comment-input" class="cyber-input" placeholder="Transmit your migration frequency...">
                <div style="margin-top: 20px;">
                    <button id="btn-star" class="cyber-button">Manifest Star</button>
                    <button id="btn-post" class="cyber-button">Transmit</button>
                </div>
            </div>

            <div style="margin-top: 30px;">
                <label style="cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <input type="checkbox" id="attest-check" ${state.attested ? 'checked' : ''} style="width: 20px; height: 20px;">
                    <span>I have breached the Istio event horizon.</span>
                </label>
            </div>

            <div class="comment-wall">
                ${state.comments.map(c => `<span class="badge">${c}</span>`).join('')}
            </div>
        </section>
    `;

    attachListeners();
};

const attachListeners = () => {
    document.getElementById('btn-star').addEventListener('click', () => {
        state.stars++;
        saveState();
        render();
    });

    document.getElementById('btn-post').addEventListener('click', () => {
        const input = document.getElementById('comment-input');
        if (input.value.trim()) {
            state.comments.push(input.value.trim());
            saveState();
            render();
        }
    });

    document.getElementById('attest-check').addEventListener('change', (e) => {
        state.attested = e.target.checked;
        saveState();
        if(state.attested) {
            confettiEffect();
        }
    });
};

const confettiEffect = () => {
    // Simple visual flair without external libs
    const colors = ['#00d2ff', '#9d50bb', '#ffffff'];
    for(let i=0; i<50; i++) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-10px';
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.zIndex = '1000';
        document.body.appendChild(div);
        
        const animation = div.animate([
            { transform: 'translateY(0) rotate(0)', opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: 2000 + Math.random() * 1000 });
        
        animation.onfinish = () => div.remove();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    render();
    
    // Simple Particle Background
    const container = document.getElementById('canvas-container');
    for(let i=0; i<30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'white';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.opacity = Math.random();
        container.appendChild(particle);
    }
});
