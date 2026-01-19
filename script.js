// Dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.documentElement.classList.toggle('dark', e.matches);
});

// ==================== GAME STATE ====================
const gameState = {
    money: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    currentChallenge: 0,
    completedChallenges: new Set(),
    isDark: document.documentElement.classList.contains('dark'),
    simulation: {
        water: Infinity,
        seeds: Infinity,
        cycles: 0,
        maxCycles: Infinity,
        plants: []
    }
};

// ==================== CHALLENGES ====================
const challenges = [
    // LEVEL 1 - Básico: Primeira função
    {
        id: 1,
        title: "Plantando sua primeira semente",
        text: 'Crie uma função <code>plantar()</code> que retorne a string <code>"semente"</code> para plantar na fazenda.',
        concept: { title: "Funções", text: "Funções são blocos de código reutilizáveis. Use <code>return</code> para retornar um valor." },
        hint: 'Use <code>return "semente";</code> dentro da função!',
        difficulty: "easy",
        template: '// 🌱 Crie sua primeira função!\nfunction plantar() {\n  // Retorne a string "semente"\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + '\nreturn plantar();');
                return fn() === 'semente';
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.addPlant(0, 'semente');
        },
        reward: 20,
        xp: 25
    },

    // LEVEL 2 - Básico: Condição simples
    {
        id: 2,
        title: "Regando com cuidado",
        text: 'Crie uma função <code>regar(quantidade)</code> que retorne <code>true</code> se a quantidade de água for maior que 5, caso contrário <code>false</code>.',
        concept: { title: "Condicionais", text: "Use <code>if</code> para tomar decisões. A condição deve ser verdadeira para executar o bloco." },
        hint: 'Use <code>if (quantidade > 5) { return true; }</code>',
        difficulty: "easy",
        template: '// 💧 Verifique se há água suficiente\nfunction regar(quantidade) {\n  // Retorne true se quantidade > 5\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + '\nreturn regar(10) === true && regar(3) === false && regar(5) === false;');
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.waterPlant(0);
            sim.growPlant(0, 'crescendo');
        },
        reward: 25,
        xp: 30
    },

    // LEVEL 3 - Básico: Múltiplos retornos
    {
        id: 3,
        title: "Estágios de crescimento",
        text: 'Crie <code>crescer(dias)</code> que retorne o emoji baseado nos dias:<br>• 1-2 dias: <code>"🌱"</code><br>• 3-5 dias: <code>"🌿"</code><br>• 6+ dias: <code>"🌻"</code>',
        concept: { title: "Múltiplas Condições", text: "Use <code>if/else if/else</code> para verificar múltiplas condições em sequência." },
        hint: 'Use <code>if (dias <= 2)</code>, depois <code>else if (dias <= 5)</code>, depois <code>else</code>',
        difficulty: "easy",
        template: '// 🌻 Determine o estágio da planta\nfunction crescer(dias) {\n  // Retorne o emoji baseado nos dias\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + '\nreturn crescer(1)==="🌱" && crescer(2)==="🌱" && crescer(3)==="🌿" && crescer(5)==="🌿" && crescer(6)==="🌻" && crescer(10)==="🌻";');
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.growPlant(0, 'pronta', '🌻');
        },
        reward: 30,
        xp: 35
    },

    // LEVEL 4 - Intermediário: Condições encadeadas (AND/OR)
    {
        id: 4,
        title: "Condições combinadas",
        text: 'Crie <code>podeRegar(agua, planta)</code> que retorne <code>true</code> APENAS se:<br>• <code>agua > 0</code> <strong>E</strong><br>• <code>planta.estado !== "pronta"</code>',
        concept: { title: "Operadores Lógicos", text: "Use <code>&&</code> (E) quando TODAS as condições devem ser verdadeiras. Use <code>||</code> (OU) quando pelo menos uma deve ser." },
        hint: 'Use <code>if (agua > 0 && planta.estado !== "pronta")</code>',
        difficulty: "medium",
        template: '// 🔗 Combine condições com &&\nfunction podeRegar(agua, planta) {\n  // Retorne true se água > 0 E planta não está pronta\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const t1 = podeRegar(5, {estado: "crescendo"}) === true;
              const t2 = podeRegar(0, {estado: "crescendo"}) === false;
              const t3 = podeRegar(5, {estado: "pronta"}) === false;
              const t4 = podeRegar(0, {estado: "pronta"}) === false;
              return t1 && t2 && t3 && t4;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.addPlant(1, 'semente');
            sim.growPlant(1, 'crescendo', '🌿');
        },
        reward: 40,
        xp: 45,
        unlockConcept: "Operadores Lógicos"
    },

    // LEVEL 5 - Intermediário: Estados e decisões
    {
        id: 5,
        title: "Máquina de estados",
        text: 'Crie <code>cuidar(planta)</code> que analise o <code>planta.estado</code> e retorne:<br>• <code>"seca"</code> → <code>"regar"</code><br>• <code>"crescendo"</code> → <code>"esperar"</code><br>• <code>"pronta"</code> → <code>"colher"</code><br>• outros → <code>"plantar"</code>',
        concept: { title: "Máquina de Estados", text: "Pense em cada estado como uma situação única que requer uma ação específica. Isso é fundamental em programação!" },
        hint: 'Use múltiplos <code>if</code> ou <code>switch</code> para cada estado',
        difficulty: "medium",
        template: '// 🔄 Decida baseado no estado\nfunction cuidar(planta) {\n  // Analise planta.estado e retorne a ação\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const t1 = cuidar({estado: "seca"}) === "regar";
              const t2 = cuidar({estado: "crescendo"}) === "esperar";
              const t3 = cuidar({estado: "pronta"}) === "colher";
              const t4 = cuidar({estado: "vazia"}) === "plantar";
              return t1 && t2 && t3 && t4;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.addPlant(2, 'seca', '🥀');
            setTimeout(() => sim.waterPlant(2), 300);
            setTimeout(() => sim.growPlant(2, 'crescendo', '🌿'), 600);
        },
        reward: 50,
        xp: 55,
        unlockConcept: "Máquina de Estados"
    },

    // LEVEL 6 - Intermediário: Função com objeto
    {
        id: 6,
        title: "Tomando decisões complexas",
        text: 'Crie <code>decidir(planta)</code> que receba um objeto com <code>estado</code> e <code>diasSemAgua</code>:<br>• Se <code>estado === "seca"</code> OU <code>diasSemAgua > 2</code> → <code>"regar"</code><br>• Se <code>estado === "pronta"</code> → <code>"colher"</code><br>• Caso contrário → <code>"esperar"</code>',
        concept: { title: "Objetos como Parâmetros", text: "Objetos permitem passar múltiplas informações para uma função. Acesse propriedades com <code>objeto.propriedade</code>." },
        hint: 'Use <code>planta.estado</code> e <code>planta.diasSemAgua</code> nas condições',
        difficulty: "medium",
        template: '// 🎯 Decisões com múltiplos fatores\nfunction decidir(planta) {\n  // Use planta.estado e planta.diasSemAgua\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const t1 = decidir({estado: "seca", diasSemAgua: 1}) === "regar";
              const t2 = decidir({estado: "crescendo", diasSemAgua: 3}) === "regar";
              const t3 = decidir({estado: "pronta", diasSemAgua: 0}) === "colher";
              const t4 = decidir({estado: "crescendo", diasSemAgua: 1}) === "esperar";
              return t1 && t2 && t3 && t4;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => sim.growPlant(i, 'pronta', '🌻'), i * 200);
            }
        },
        reward: 60,
        xp: 65
    },

    // LEVEL 7 - Avançado: Loop while
    {
        id: 7,
        title: "Loop até ficar pronta",
        text: 'Crie <code>regarAtePronta(planta)</code> que use um <code>while</code> para regar até <code>planta.estado === "pronta"</code>.<br><br>Use <code>planta.regar()</code> para regar (muda o estado automaticamente).<br>Retorne quantas vezes regou.',
        concept: { title: "Loop While", text: "O <code>while</code> repete um bloco ENQUANTO a condição for verdadeira. Cuidado com loops infinitos!" },
        hint: 'Use <code>while (planta.estado !== "pronta") { planta.regar(); contador++; }</code>',
        difficulty: "hard",
        resources: { water: 10 },
        template: '// 🔁 Use while para repetir\nfunction regarAtePronta(planta) {\n  let vezesRegada = 0;\n  \n  // Use while para regar até planta.estado === "pronta"\n  // Chame planta.regar() para regar\n  \n  return vezesRegada;\n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              let regas = 0;
              const planta = {
                estado: "seca",
                regar() {
                  regas++;
                  if (regas >= 3) this.estado = "pronta";
                  else this.estado = "crescendo";
                }
              };
              const result = regarAtePronta(planta);
              return result === 3 && planta.estado === "pronta";
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.log('Iniciando loop...', 'info');
            let delay = 0;
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    sim.log(`Rega ${i + 1}: 💧`, 'water');
                    sim.waterPlant(3 + i % 3);
                }, delay);
                delay += 400;
            }
            setTimeout(() => sim.log('Loop completo! ✅', 'success'), delay);
        },
        reward: 80,
        xp: 85,
        unlockConcept: "Loops"
    },

    // LEVEL 8 - Avançado: For com limite
    {
        id: 8,
        title: "Recursos limitados",
        text: 'Você tem apenas <strong>5 unidades de água</strong>!<br><br>Crie <code>regarComLimite(plantas)</code> que receba um array de plantas e regue apenas as que têm <code>estado === "seca"</code>, usando no máximo 5 águas.<br><br>Retorne quantas plantas foram regadas.',
        concept: { title: "Loop For com Controle", text: "Use <code>for</code> para iterar arrays. Combine com condições e contadores para controlar recursos." },
        hint: 'Use <code>for</code> para percorrer, um contador de água, e <code>break</code> quando acabar',
        difficulty: "hard",
        resources: { water: 5 },
        template: '// 💧 Gerencie recursos com for\nfunction regarComLimite(plantas) {\n  let aguaUsada = 0;\n  const limiteAgua = 5;\n  let plantasRegadas = 0;\n  \n  // Percorra as plantas e regue as secas\n  // Pare quando a água acabar!\n  \n  return plantasRegadas;\n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const plantas = [
                {estado: "seca"}, {estado: "crescendo"}, {estado: "seca"},
                {estado: "seca"}, {estado: "pronta"}, {estado: "seca"},
                {estado: "seca"}, {estado: "seca"}
              ];
              const result = regarComLimite(plantas);
              return result === 5;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.setResource('water', 5);
            let delay = 0;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    sim.log(`Água ${5 - i} restante`, 'water');
                    sim.waterPlant(i);
                    sim.setResource('water', 4 - i);
                }, delay);
                delay += 300;
            }
        },
        reward: 100,
        xp: 100,
        unlockConcept: "Gerenciamento de Recursos"
    },

    // LEVEL 9 - Expert: Estratégia
    {
        id: 9,
        title: "Maximizando lucros",
        text: 'Crie <code>maximizarLucro(plantas, ciclos)</code> que simule <code>ciclos</code> turnos de cultivo.<br><br>Cada turno, para cada planta:<br>• <code>"pronta"</code>: colha (+10 moedas), vira <code>"vazia"</code><br>• <code>"crescendo"</code>: vira <code>"pronta"</code><br>• <code>"semente"</code>: vira <code>"crescendo"</code><br>• <code>"vazia"</code>: plante, vira <code>"semente"</code><br><br>Retorne o lucro total após todos os ciclos.',
        concept: { title: "Simulação", text: "Simular sistemas é pensar como um programador de verdade. Você controla o tempo e as regras!" },
        hint: 'Use loop externo para ciclos, interno para plantas. Atualize estados e some lucro.',
        difficulty: "hard",
        resources: { cycles: 3 },
        template: '// 🎮 Simule a fazenda!\nfunction maximizarLucro(plantas, ciclos) {\n  let lucro = 0;\n  \n  // Para cada ciclo\n  //   Para cada planta\n  //     Atualize o estado e some lucro se colher\n  \n  return lucro;\n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const plantas = [
                {estado: "semente"}, {estado: "crescendo"}, {estado: "pronta"}
              ];
              const result = maximizarLucro(plantas, 3);
              // Ciclo 1: pronta->colhe(10), crescendo->pronta, semente->crescendo
              // Ciclo 2: vazia->semente, pronta->colhe(10), crescendo->pronta
              // Ciclo 3: semente->crescendo, vazia->semente, pronta->colhe(10)
              // Total: 30
              return result === 30;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            sim.setResource('cycles', 3);
            const states = ['semente', 'crescendo', 'pronta'];
            const emojis = ['🌱', '🌿', '🌻'];
            let delay = 0;

            for (let c = 0; c < 3; c++) {
                setTimeout(() => {
                    sim.log(`── Ciclo ${c + 1} ──`, 'info');
                    for (let i = 0; i < 3; i++) {
                        const idx = (c + i) % 3;
                        sim.growPlant(i, states[idx], emojis[idx]);
                    }
                    sim.setResource('cycles', 2 - c);
                }, delay);
                delay += 800;
            }
            setTimeout(() => sim.log('💰 Lucro: 30 moedas!', 'success'), delay);
        },
        reward: 150,
        xp: 150,
        unlockConcept: "Pensamento Algorítmico"
    },

    // LEVEL 10 - Master: O teste final
    {
        id: 10,
        title: "O Fazendeiro Autônomo",
        text: '🏆 <strong>DESAFIO FINAL</strong><br><br>Crie <code>gerenciarFazenda(fazenda)</code> que receba um objeto com:<br>• <code>plantas</code>: array de plantas<br>• <code>agua</code>: quantidade de água<br>• <code>dinheiro</code>: dinheiro atual<br><br>A função deve retornar um objeto com as ações tomadas:<br><code>{ plantadas, regadas, colhidas, lucroTotal }</code><br><br><strong>Regras:</strong><br>• Plante em slots vazios (custa 5 de dinheiro)<br>• Regue plantas secas (custa 1 de água)<br>• Colha plantas prontas (ganha 15 de dinheiro)<br>• Gerencie recursos sabiamente!',
        concept: { title: "🎓 Você é um Programador!", text: "Este desafio reúne tudo: funções, condições, loops, objetos e lógica. Sem template. Sem dica detalhada. Você consegue!" },
        hint: 'Pense em cada tipo de planta e o que fazer. Itere, decida, aja, conte.',
        difficulty: "expert",
        template: '// 🏆 O DESAFIO FINAL\n// Sem template. Sem ajuda. Você consegue!\n\nfunction gerenciarFazenda(fazenda) {\n  // fazenda.plantas = array de {estado: "..."}\n  // fazenda.agua = número\n  // fazenda.dinheiro = número\n  \n  // Retorne: { plantadas, regadas, colhidas, lucroTotal }\n  \n}',
        validate: (code) => {
            try {
                const fn = new Function(code + `
              const fazenda = {
                plantas: [
                  {estado: "vazia"}, {estado: "seca"}, {estado: "pronta"},
                  {estado: "crescendo"}, {estado: "pronta"}, {estado: "vazia"}
                ],
                agua: 5,
                dinheiro: 20
              };
              const result = gerenciarFazenda(fazenda);

              // Esperado: 2 vazias plantadas (-10), 1 seca regada (-1 água), 2 prontas colhidas (+30)
              // Lucro: 30 - 10 = 20
              const valid = result &&
                typeof result.plantadas === 'number' &&
                typeof result.regadas === 'number' &&
                typeof result.colhidas === 'number' &&
                typeof result.lucroTotal === 'number' &&
                result.plantadas === 2 &&
                result.regadas === 1 &&
                result.colhidas === 2 &&
                result.lucroTotal === 20;

              return valid;
            `);
                return fn();
            } catch { return false; }
        },
        onSuccess: (sim) => {
            // Celebração épica
            sim.log('🏆 FAZENDA AUTOMATIZADA! 🏆', 'success');
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    sim.growPlant(i, 'pronta', ['🌻', '🌹', '🌷', '🌺', '🌸', '💐'][i]);
                }, i * 150);
            }
        },
        reward: 500,
        xp: 500,
        isFinal: true
    }
];

// ==================== DOM ELEMENTS ====================
const elements = {
    farmField: document.getElementById('farmField'),
    codeEditor: document.getElementById('codeEditor'),
    output: document.getElementById('output'),
    runCodeBtn: document.getElementById('runCode'),
    resetCodeBtn: document.getElementById('resetCode'),
    successModal: document.getElementById('successModal'),
    nextChallengeBtn: document.getElementById('nextChallenge'),
    celestial: document.getElementById('celestial'),
    simLog: document.getElementById('simLog'),
    hintToggle: document.getElementById('hintToggle'),
    hintContent: document.getElementById('hintContent'),
    levelSelect: document.getElementById('levelSelect'),
    docsContent: document.getElementById('docsContent')
};

// ==================== SIMULATION ENGINE ====================
const simulation = {
    addPlant(index, state, emoji = '🌱') {
        const plot = elements.farmField.children[index];
        if (!plot) return;
        plot.classList.remove('empty', 'dead');
        plot.classList.add('growing');
        const plantEmoji = plot.querySelector('.plant-emoji');
        const plantState = plot.querySelector('.plant-state');
        plantEmoji.textContent = emoji;
        plantState.textContent = state;
        gameState.simulation.plants[index] = { state, emoji };
        setTimeout(() => plot.classList.remove('growing'), 600);
        this.log(`Plantou ${emoji} no slot ${index + 1}`, 'plant');
    },

    waterPlant(index) {
        const plot = elements.farmField.children[index];
        if (!plot) return;
        plot.classList.add('watered');

        const drops = document.createElement('div');
        drops.className = 'water-drops';
        drops.textContent = '💧💧💧';
        plot.appendChild(drops);

        setTimeout(() => {
            plot.classList.remove('watered');
            if (drops.parentNode) drops.remove();
        }, 800);

        this.log(`Regou slot ${index + 1} 💧`, 'water');
    },

    growPlant(index, state, emoji) {
        const plot = elements.farmField.children[index];
        if (!plot) return;
        plot.classList.add('growing');
        const plantEmoji = plot.querySelector('.plant-emoji');
        const plantState = plot.querySelector('.plant-state');
        if (emoji) plantEmoji.textContent = emoji;
        plantState.textContent = state;
        if (gameState.simulation.plants[index]) {
            gameState.simulation.plants[index].state = state;
            if (emoji) gameState.simulation.plants[index].emoji = emoji;
        }
        setTimeout(() => plot.classList.remove('growing'), 600);
    },

    harvestPlant(index) {
        const plot = elements.farmField.children[index];
        if (!plot) return;
        plot.classList.add('harvested');
        setTimeout(() => {
            plot.classList.remove('harvested');
            plot.classList.add('empty');
            const plantEmoji = plot.querySelector('.plant-emoji');
            const plantState = plot.querySelector('.plant-state');
            plantEmoji.textContent = '';
            plantState.textContent = '';
            gameState.simulation.plants[index] = null;
        }, 500);
        this.log(`Colheu do slot ${index + 1} 🧺`, 'harvest');
    },

    killPlant(index) {
        const plot = elements.farmField.children[index];
        if (!plot) return;
        plot.classList.add('dead');
        this.log(`Planta ${index + 1} morreu! 💀`, 'error');
    },

    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = 'sim-log-entry';
        const step = elements.simLog.children.length;
        entry.innerHTML = `<span class="step">[${step}]</span><span class="action ${type}">${message}</span>`;
        elements.simLog.appendChild(entry);
        elements.simLog.scrollTop = elements.simLog.scrollHeight;
    },

    clearLog() {
        elements.simLog.innerHTML = '<div class="sim-log-entry"><span class="step">--</span><span class="action">Aguardando execução...</span></div>';
    },

    setResource(type, value) {
        const el = document.getElementById(`${type}Resource`);
        if (el) el.textContent = value === Infinity ? '∞' : value;
    },

    reset() {
        this.clearLog();
        gameState.simulation.plants = [];
        initFarm();
    }
};

// ==================== FARM INITIALIZATION ====================
function initFarm() {
    elements.farmField.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const plot = document.createElement('div');
        plot.className = 'plot empty';
        plot.dataset.index = i;
        plot.innerHTML = '<span class="plant-emoji"></span><span class="plant-state"></span>';
        elements.farmField.appendChild(plot);
    }
}

// ==================== UI UPDATES ====================
function updateUI() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('completedCount').textContent = `${gameState.completedChallenges.size}/${challenges.length}`;
    document.getElementById('xpDisplay').textContent = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    document.getElementById('progressBar').style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;

    // Level badge
    const badge = document.getElementById('levelBadge');
    if (gameState.level <= 3) {
        badge.textContent = 'Iniciante';
        badge.className = 'level-badge beginner';
    } else if (gameState.level <= 6) {
        badge.textContent = 'Intermediário';
        badge.className = 'level-badge intermediate';
    } else if (gameState.level <= 9) {
        badge.textContent = 'Avançado';
        badge.className = 'level-badge advanced';
    } else {
        badge.textContent = 'Mestre';
        badge.className = 'level-badge master';
    }

    updateLevelSelect();
}

function updateLevelSelect() {
    elements.levelSelect.innerHTML = '';
    challenges.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = c.id;

        if (gameState.completedChallenges.has(i)) {
            btn.classList.add('completed');
        } else if (i === gameState.currentChallenge) {
            btn.classList.add('current');
        } else if (i > gameState.currentChallenge && !gameState.completedChallenges.has(i - 1)) {
            btn.classList.add('locked');
            btn.disabled = true;
        }

        btn.addEventListener('click', () => {
            if (!btn.disabled && !btn.classList.contains('locked')) {
                gameState.currentChallenge = i;
                loadChallenge(i);
            }
        });

        elements.levelSelect.appendChild(btn);
    });
}

// ==================== CHALLENGE LOADING ====================
function loadChallenge(index) {
    if (index >= challenges.length) {
        showCompletionModal();
        return;
    }

    const challenge = challenges[index];

    document.getElementById('challengeNumber').textContent = challenge.id;
    document.getElementById('challengeTitle').textContent = challenge.title;
    document.getElementById('challengeText').innerHTML = challenge.text;
    document.getElementById('challengeReward').textContent = challenge.reward;
    elements.codeEditor.value = challenge.template;

    // Difficulty badge
    const diffBadge = document.getElementById('difficultyBadge');
    diffBadge.className = `difficulty-badge ${challenge.difficulty}`;
    diffBadge.textContent = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', expert: 'Expert' }[challenge.difficulty];

    // Concept box
    const conceptBox = document.getElementById('conceptBox');
    const conceptText = document.getElementById('conceptText');
    document.querySelector('#conceptBox h4').textContent = `🧠 Conceito: ${challenge.concept.title}`;
    conceptText.innerHTML = challenge.concept.text;

    // Hint
    elements.hintContent.innerHTML = challenge.hint;
    elements.hintContent.classList.remove('visible');
    elements.hintToggle.textContent = 'Ver dica';

    // Resources
    if (challenge.resources) {
        if (challenge.resources.water !== undefined) {
            simulation.setResource('water', challenge.resources.water);
        }
        if (challenge.resources.cycles !== undefined) {
            simulation.setResource('cycles', challenge.resources.cycles);
        }
    } else {
        simulation.setResource('water', '∞');
        simulation.setResource('cycles', '-');
    }

    clearOutput();
    simulation.clearLog();
    updateUI();
}

// ==================== OUTPUT ====================
function showOutput(message, type = 'neutral') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️', neutral: '📝' };
    line.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    elements.output.appendChild(line);
    elements.output.scrollTop = elements.output.scrollHeight;
}

function clearOutput() {
    elements.output.innerHTML = '';
    showOutput('Aguardando seu código...', 'neutral');
}

// ==================== CODE EXECUTION ====================
function runCode() {
    const code = elements.codeEditor.value;
    const challenge = challenges[gameState.currentChallenge];

    elements.output.innerHTML = '';
    simulation.clearLog();
    showOutput('Executando código...', 'info');

    setTimeout(() => {
        try {
            if (challenge.validate(code)) {
                showOutput('✨ Código correto!', 'success');
                simulation.log('Execução bem-sucedida! ✅', 'success');

                if (challenge.onSuccess) {
                    challenge.onSuccess(simulation);
                }

                setTimeout(() => {
                    gameState.money += challenge.reward;
                    gameState.xp += challenge.xp;
                    gameState.completedChallenges.add(gameState.currentChallenge);

                    // Level up
                    while (gameState.xp >= gameState.xpToNextLevel) {
                        gameState.xp -= gameState.xpToNextLevel;
                        gameState.level++;
                        gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.3);
                    }

                    updateUI();
                    showSuccessModal(challenge);
                }, 800);
            } else {
                showOutput('Hmm, não funcionou. Verifique a lógica!', 'error');
                simulation.log('Erro na execução ❌', 'error');

                // Chance to kill a plant
                const activePlots = gameState.simulation.plants.filter(p => p).length;
                if (activePlots > 0 && Math.random() > 0.6) {
                    const plantedIndexes = gameState.simulation.plants.map((p, i) => p ? i : -1).filter(i => i >= 0);
                    if (plantedIndexes.length > 0) {
                        const randomIdx = plantedIndexes[Math.floor(Math.random() * plantedIndexes.length)];
                        simulation.killPlant(randomIdx);
                        showOutput('💀 Uma planta morreu por código errado!', 'error');
                    }
                }
            }
        } catch (error) {
            showOutput(`Erro de sintaxe: ${error.message}`, 'error');
            simulation.log(`Erro: ${error.message}`, 'error');
        }
    }, 300);
}

// ==================== MODALS ====================
function showSuccessModal(challenge) {
    document.getElementById('modalCoins').textContent = `+${challenge.reward}`;
    document.getElementById('modalXP').textContent = `+${challenge.xp} XP`;

    const unlockBadge = document.getElementById('unlockBadge');
    if (challenge.unlockConcept) {
        unlockBadge.style.display = 'inline-block';
        unlockBadge.textContent = `🔓 Desbloqueado: ${challenge.unlockConcept}`;
    } else {
        unlockBadge.style.display = 'none';
    }

    if (challenge.isFinal) {
        document.getElementById('modalTitle').textContent = '🏆 MESTRE FAZENDEIRO!';
        document.getElementById('modalText').textContent = 'Você completou todos os desafios! Você agora pensa como um programador!';
        document.getElementById('modalIcon').textContent = '👨‍🌾';
        elements.nextChallengeBtn.innerHTML = '<span>🔄</span> Jogar Novamente';
    } else if (gameState.currentChallenge >= challenges.length - 1) {
        document.getElementById('modalTitle').textContent = '🎉 Última Fase!';
        document.getElementById('modalText').textContent = 'Prepare-se para o desafio final!';
        document.getElementById('modalIcon').textContent = '🚀';
        elements.nextChallengeBtn.innerHTML = '<span>⚔️</span> Desafio Final';
    } else {
        document.getElementById('modalTitle').textContent = 'Parabéns!';
        document.getElementById('modalText').textContent = 'Você completou o desafio!';
        document.getElementById('modalIcon').textContent = '🎉';
        elements.nextChallengeBtn.innerHTML = '<span>➡️</span> Próximo Nível';
    }

    elements.successModal.classList.add('active');
    createConfetti();
}

function showCompletionModal() {
    document.getElementById('modalTitle').textContent = '🌟 Jornada Completa!';
    document.getElementById('modalText').textContent = 'Você dominou todos os conceitos. Hora de criar seus próprios projetos!';
    document.getElementById('modalIcon').textContent = '🏆';
    elements.nextChallengeBtn.innerHTML = '<span>🔄</span> Reiniciar Jornada';
    elements.successModal.classList.add('active');
    createConfetti();
}

// ==================== CONFETTI ====================
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe'];
    const container = document.createElement('div');
    container.className = 'confetti';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 3500);
}

// ==================== EVENT LISTENERS ====================
elements.runCodeBtn.addEventListener('click', runCode);

elements.resetCodeBtn.addEventListener('click', () => {
    loadChallenge(gameState.currentChallenge);
});

elements.nextChallengeBtn.addEventListener('click', () => {
    elements.successModal.classList.remove('active');

    if (challenges[gameState.currentChallenge].isFinal || gameState.currentChallenge >= challenges.length - 1) {
        // Reset game
        gameState.currentChallenge = 0;
        gameState.completedChallenges.clear();
        gameState.money = 0;
        gameState.xp = 0;
        gameState.level = 1;
        gameState.xpToNextLevel = 100;
        simulation.reset();
    } else {
        gameState.currentChallenge++;
    }

    loadChallenge(gameState.currentChallenge);
});

elements.hintToggle.addEventListener('click', () => {
    const isVisible = elements.hintContent.classList.toggle('visible');
    elements.hintToggle.textContent = isVisible ? 'Esconder dica' : 'Ver dica';
});

elements.celestial.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    gameState.isDark = document.documentElement.classList.contains('dark');
    elements.celestial.textContent = gameState.isDark ? '🌙' : '☀️';
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
});

// Tab support in editor
elements.codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = elements.codeEditor.selectionStart;
        const end = elements.codeEditor.selectionEnd;
        elements.codeEditor.value = elements.codeEditor.value.substring(0, start) + '  ' + elements.codeEditor.value.substring(end);
        elements.codeEditor.selectionStart = elements.codeEditor.selectionEnd = start + 2;
    }
});

// ==================== INITIALIZATION ====================
elements.celestial.textContent = gameState.isDark ? '🌙' : '☀️';
initFarm();
loadChallenge(0);
updateUI();