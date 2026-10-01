/* ==========================================================================
   TOJI PAINTER - MOTOR DE JOGO (JAVASCRIPT VANILLA)
   Lógica de Movimento, Áudio Sintetizado, Partículas e Níveis
   ========================================================================== */

/* ==========================================================================
   0. POLYFILL DE COMPATIBILIDADE PARA NAVEGADORES ANTIGOS
   Garante que ctx.roundRect funcione em qualquer versão do navegador/webview
   ========================================================================== */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (!radii) radii = 0;
    let r = typeof radii === 'number' ? [radii, radii, radii, radii] : radii;
    if (r.length === 1) r = [r[0], r[0], r[0], r[0]];
    if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
    const [tl, tr, br, bl] = r;
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

/* ==========================================================================
   1. CONSTANTES E PALETA DE CORES
   ========================================================================== */
const TILE_EMPTY = 0;
const TILE_WALL = 1;
const TILE_CAN_RED = 2;
const TILE_CAN_BLUE = 3;
const TILE_CAN_YELLOW = 4;
const TILE_CAN_PURPLE = 5;

const TILE_TARGET_RED = 12;
const TILE_TARGET_BLUE = 13;
const TILE_TARGET_YELLOW = 14;
const TILE_TARGET_PURPLE = 15;

const TILE_STAR = 20;
const TILE_EXIT = 99;

const COLOR_INFO = {
  0: { name: "Nenhuma", hex: "#4b5563", glow: "rgba(107, 114, 128, 0.4)", kanji: "無" },
  2: { name: "Carmesim", hex: "#ff2a5f", glow: "rgba(255, 42, 95, 0.65)", kanji: "血" },
  3: { name: "Azul Ilimitado", hex: "#00d2ff", glow: "rgba(0, 210, 255, 0.65)", kanji: "蒼" },
  4: { name: "Centelha Dourada", hex: "#ffcf00", glow: "rgba(255, 207, 0, 0.65)", kanji: "閃" },
  5: { name: "Roxo Vazio", hex: "#b347ff", glow: "rgba(179, 71, 255, 0.65)", kanji: "茈" }
};

/* ==========================================================================
   2. DADOS DAS FASES (5 FASES MATEMATICAMENTE TESTADAS E 100% SOLVÍVEIS)
   ========================================================================== */
const LEVELS = [
  {
    id: 1,
    name: "Nível 1: Treinamento em Shibuya",
    subtitle: "Aprenda a deslizar, colete a Tinta Carmesim e pinte os 3 selos.",
    parMoves: 14,
    startX: 1,
    startY: 1,
    // 9 colunas x 9 linhas
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 12, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 12, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 2, 0, 0, 1, 20, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 2,
    name: "Nível 2: Becos de Shinjuku",
    subtitle: "Alterne entre o Carmesim e o Azul Ilimitado para quebrar a barreira.",
    parMoves: 28,
    startX: 1,
    startY: 1,
    // 11 colunas x 9 linhas
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 12, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 13, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 3,
    name: "Nível 3: Telhado da Escola Jujutsu",
    subtitle: "Três energias amaldiçoadas: Carmesim, Azul e a Centelha Dourada.",
    parMoves: 32,
    startX: 1,
    startY: 1,
    // 11 colunas x 9 linhas
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 14, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 12, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 14, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 4,
    name: "Nível 4: Expansão de Domínio",
    subtitle: "O Roxo Vazio foi liberado. Use as 4 energias e planeje os cruzamentos.",
    parMoves: 30,
    startX: 1,
    startY: 1,
    // 11 colunas x 9 linhas
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 14, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 15, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 5,
    name: "Nível 5: Restrição Celestial Suprema",
    subtitle: "O teste definitivo: 4 cores, 6 selos amaldiçoados e precisão total!",
    parMoves: 42,
    startX: 1,
    startY: 1,
    // 11 colunas x 9 linhas
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 14, 12, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 15, 0, 13, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }
];

/* ==========================================================================
   3. SISTEMA DE ÁUDIO VIA WEB AUDIO API (100% VANILLA E SEM ARQUIVOS EXTERNOS)
   ========================================================================== */
class AudioSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.28;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    return this.muted;
  }

  // Som do Deslize (Whoosh sutil e rápido)
  playDash() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  // Som de Impacto na Parede (Pancada firme de artes marciais)
  playBump() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

      gain.gain.setValueAtTime(this.masterVolume * 0.7, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Som de Coleta de Tinta (Campânula de energia mística)
  playPickup() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // Dó, Mi, Sol
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(this.masterVolume * 0.45, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.19);
      });
    } catch (e) {}
  }

  // Som de Selo Pintado (Splash líquido amaldiçoado)
  playPaint() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.14);

      gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // Som de Estrela Coletada (Brilho metálico agudo)
  playStar() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // Si5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // Mi6

      gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    } catch (e) {}
  }

  // Som de Desbloqueio do Portal (Gongo ritualístico ressonante)
  playPortalOpen() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [220, 277.18, 329.63, 440];
      chords.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      });
    } catch (e) {}
  }

  // Som de Conclusão da Fase (Fanfarra épica)
  playVictory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const arpeggio = [440, 554.37, 659.25, 880];
      arpeggio.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch (e) {}
  }
}

const audio = new AudioSystem();

// Ativar o contexto de áudio em qualquer primeiro clique / toque na janela
const unlockAudio = () => {
  audio.init();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

/* ==========================================================================
   4. SISTEMA DE PARTÍCULAS (RESPINGOS, FUMAÇA E POEIRA DE IMPACTO)
   ========================================================================== */
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emitPaintSplash(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4.5 + 2.5,
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        type: 'paint'
      });
    }
  }

  emitImpact(x, y, dirX, dirY) {
    for (let i = 0; i < 10; i++) {
      const spread = (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x, y,
        vx: -dirX * speed + spread,
        vy: -dirY * speed + spread,
        size: Math.random() * 3 + 1.5,
        color: '#94a3b8',
        life: 0.9,
        decay: Math.random() * 0.06 + 0.04,
        type: 'dust'
      });
    }
  }

  emitStarSparkles(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        color: '#fbbf24',
        life: 1.0,
        decay: Math.random() * 0.04 + 0.025,
        type: 'spark'
      });
    }
  }

  emitAura(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 22 + 10;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 2,
        vy: -Math.sin(angle) * 2,
        size: Math.random() * 3 + 2,
        color,
        life: 0.8,
        decay: 0.05,
        type: 'aura'
      });
    }
  }

  // Vórtice de vitória absorvendo Toji para o portal
  emitPortalVortex(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30 + 10;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 3,
        vy: -Math.sin(angle) * 3,
        size: Math.random() * 3 + 1.5,
        color: '#c084fc',
        life: 1.0,
        decay: 0.04,
        type: 'spark'
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.type === 'paint') {
        p.vx *= 0.92;
        p.vy *= 0.92;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.type === 'paint' ? 1 : p.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

const particles = new ParticleSystem();

/* ==========================================================================
   5. MOTOR DO JOGO E LÓGICA DE ESTADO (GAME ENGINE)
   ========================================================================== */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.currentLevelIndex = 0;
    this.grid = [];
    this.gridWidth = 11;
    this.gridHeight = 9;
    this.tileSize = 48;
    this.offsetX = 0;
    this.offsetY = 0;

    // Estado do Jogador (Toji)
    this.player = {
      gridX: 1,
      gridY: 1,
      x: 48,
      y: 48,
      targetGridX: 1,
      targetGridY: 1,
      isMoving: false,
      moveDirX: 0,
      moveDirY: 0,
      color: 0, // 0 = Sem cor
      facing: 1, // 1 = direita, -1 = esquerda
      slidePath: [],
      squashX: 1,
      squashY: 1,
      scale: 1,
      opacity: 1
    };

    // Buffer de entrada para resposta imediata
    this.bufferedMove = null;

    // Estado da Fase
    this.targets = []; // { x, y, requiredColor, isPainted }
    this.stars = [];   // { x, y, collected }
    this.exitPos = { x: 0, y: 0 };
    this.isExitOpen = false;
    this.levelCompleted = false;
    this.isExiting = false;

    // Estatísticas da Partida
    this.moves = 0;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.screenShake = 0;

    // Registro de progresso persistente (Estrelas e Movimentos)
    this.levelStarsRecord = [0, 0, 0, 0, 0];
    this.levelMovesRecord = [0, 0, 0, 0, 0];
    this.loadProgress();

    // Animação e Renderização
    this.lastTime = 0;
    this.animTime = 0;

    this.initEventListeners();
    this.loadLevel(0);
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Persistência com fallback seguro
  loadProgress() {
    try {
      const savedStars = localStorage.getItem('toji_painter_stars');
      if (savedStars) this.levelStarsRecord = JSON.parse(savedStars);
      const savedMoves = localStorage.getItem('toji_painter_moves');
      if (savedMoves) this.levelMovesRecord = JSON.parse(savedMoves);
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('toji_painter_stars', JSON.stringify(this.levelStarsRecord));
      localStorage.setItem('toji_painter_moves', JSON.stringify(this.levelMovesRecord));
    } catch (e) {}
  }

  // Carregar uma Fase Específica
  loadLevel(index) {
    if (index < 0 || index >= LEVELS.length) return;
    this.currentLevelIndex = index;
    const levelData = LEVELS[index];

    this.gridHeight = levelData.grid.length;
    this.gridWidth = levelData.grid[0].length;

    // Deep copy da grade para reiniciar limpo
    this.grid = levelData.grid.map(row => [...row]);

    // Centralizar a grade no canvas (528x432)
    this.tileSize = 48;
    this.offsetX = Math.floor((this.canvas.width - this.gridWidth * this.tileSize) / 2);
    this.offsetY = Math.floor((this.canvas.height - this.gridHeight * this.tileSize) / 2);

    // Reset do Jogador Toji
    this.player.gridX = levelData.startX;
    this.player.gridY = levelData.startY;
    this.player.targetGridX = levelData.startX;
    this.player.targetGridY = levelData.startY;
    this.player.x = this.offsetX + this.player.gridX * this.tileSize + this.tileSize / 2;
    this.player.y = this.offsetY + this.player.gridY * this.tileSize + this.tileSize / 2;
    this.player.isMoving = false;
    this.player.slidePath = [];
    this.player.color = 0;
    this.player.facing = 1;
    this.player.squashX = 1;
    this.player.squashY = 1;
    this.player.scale = 1;
    this.player.opacity = 1;
    this.bufferedMove = null;

    // Mapear Objetivos, Latas e Saída
    this.targets = [];
    this.stars = [];
    this.isExitOpen = false;
    this.levelCompleted = false;
    this.isExiting = false;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const val = this.grid[y][x];
        if (val >= 12 && val <= 15) {
          this.targets.push({
            x, y,
            requiredColor: val - 10,
            isPainted: false
          });
        } else if (val === TILE_STAR) {
          this.stars.push({ x, y, collected: false });
        } else if (val === TILE_EXIT) {
          this.exitPos = { x, y };
        }
      }
    }

    // Estatísticas
    this.moves = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.levelCompleted) {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      }
    }, 1000);

    // Atualizar HUD
    this.updateHUD();
    this.hidePortalBanner();
  }

  // Reiniciar a Fase Atual
  restartLevel() {
    audio.init();
    audio.playBump();
    this.loadLevel(this.currentLevelIndex);
  }

  // Próxima Fase
  nextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.showGameCompleteModal();
    }
  }

  // Verifica se uma coordenada é parede sólida
  isWall(gx, gy) {
    if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) return true;
    return this.grid[gy][gx] === TILE_WALL;
  }

  // Dispara o deslizamento contínuo em linha reta com Input Buffer
  tryMove(dirX, dirY) {
    if (this.levelCompleted || this.isExiting) return;

    audio.init();

    // Se Toji já estiver deslizando, armazena no buffer de entrada (160ms)
    if (this.player.isMoving) {
      this.bufferedMove = { dirX, dirY, time: Date.now() };
      return;
    }

    let curX = this.player.gridX;
    let curY = this.player.gridY;

    // Se o próximo passo for parede, toca o impacto
    if (this.isWall(curX + dirX, curY + dirY)) {
      audio.playBump();
      this.screenShake = 3;
      return;
    }

    // Calcular caminho completo até a parede
    const path = [];
    while (!this.isWall(curX + dirX, curY + dirY)) {
      curX += dirX;
      curY += dirY;
      path.push({ x: curX, y: curY });
    }

    if (path.length > 0) {
      this.player.isMoving = true;
      this.player.moveDirX = dirX;
      this.player.moveDirY = dirY;
      this.player.slidePath = path;
      this.player.targetGridX = curX;
      this.player.targetGridY = curY;

      if (dirX !== 0) {
        this.player.facing = dirX;
      }

      this.moves++;
      audio.playDash();
      this.updateHUD();
    }
  }

  // Atualização física e interpolação a cada frame
  update(dt) {
    particles.update();
    this.animTime += dt;

    // Decaimento do Screen Shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Recuperação elástica do squash & stretch do Toji
    this.player.squashX += (1 - this.player.squashX) * 0.25;
    this.player.squashY += (1 - this.player.squashY) * 0.25;

    // Animação de absorção no portal de saída
    if (this.isExiting) {
      this.player.scale = Math.max(0, this.player.scale - dt * 2.8);
      this.player.opacity = Math.max(0, this.player.opacity - dt * 3);
      return;
    }

    // Se estiver deslizando ao longo do caminho calculado
    if (this.player.isMoving && this.player.slidePath.length > 0) {
      const nextStep = this.player.slidePath[0];
      const targetWorldX = this.offsetX + nextStep.x * this.tileSize + this.tileSize / 2;
      const targetWorldY = this.offsetY + nextStep.y * this.tileSize + this.tileSize / 2;

      const dx = targetWorldX - this.player.x;
      const dy = targetWorldY - this.player.y;
      const dist = Math.hypot(dx, dy);

      const moveSpeed = 460 * dt; // Velocidade fluida de ~460px por segundo

      if (dist <= moveSpeed) {
        // Chegou à célula intermediária
        this.player.x = targetWorldX;
        this.player.y = targetWorldY;
        this.player.gridX = nextStep.x;
        this.player.gridY = nextStep.y;
        this.player.slidePath.shift();

        // Interações com o tile alcançado
        this.onTileEnter(this.player.gridX, this.player.gridY);

        // Se a vitória foi acionada ao passar pelo portal, encerra o movimento suavemente
        if (this.levelCompleted) {
          return;
        }

        // Se terminou o trajeto e bateu no fim (parede)
        if (this.player.slidePath.length === 0) {
          this.player.isMoving = false;
          audio.playBump();
          this.screenShake = 6;

          // Deformação de impacto (Squash & Stretch)
          if (this.player.moveDirX !== 0) {
            this.player.squashX = 0.72;
            this.player.squashY = 1.28;
          } else {
            this.player.squashX = 1.35;
            this.player.squashY = 0.68;
          }

          // Partículas de poeira do impacto
          particles.emitImpact(
            this.player.x + this.player.moveDirX * 18,
            this.player.y + this.player.moveDirY * 18,
            this.player.moveDirX,
            this.player.moveDirY
          );

          // Executar movimento armazenado no Input Buffer se houver
          if (this.bufferedMove && Date.now() - this.bufferedMove.time < 160) {
            const b = this.bufferedMove;
            this.bufferedMove = null;
            this.tryMove(b.dirX, b.dirY);
          } else {
            this.bufferedMove = null;
          }
        }
      } else {
        // Continua deslizando suavemente
        this.player.x += (dx / dist) * moveSpeed;
        this.player.y += (dy / dist) * moveSpeed;
      }
    }
  }

  // Disparado ao passar por cada ladrilho no caminho
  onTileEnter(gx, gy) {
    const val = this.grid[gy][gx];

    // 1. Passou por uma lata de tinta amaldiçoada?
    if (val >= TILE_CAN_RED && val <= TILE_CAN_PURPLE) {
      const newColor = val;
      if (this.player.color !== newColor) {
        this.player.color = newColor;
        audio.playPickup();
        particles.emitAura(
          this.offsetX + gx * this.tileSize + this.tileSize / 2,
          this.offsetY + gy * this.tileSize + this.tileSize / 2,
          COLOR_INFO[newColor].hex
        );
        this.updateHUD();
      }
    }

    // 2. Passou por um alvo a pintar?
    for (const target of this.targets) {
      if (target.x === gx && target.y === gy && !target.isPainted) {
        if (this.player.color === target.requiredColor) {
          target.isPainted = true;
          audio.playPaint();
          particles.emitPaintSplash(
            this.offsetX + gx * this.tileSize + this.tileSize / 2,
            this.offsetY + gy * this.tileSize + this.tileSize / 2,
            COLOR_INFO[target.requiredColor].hex
          );
          this.updateHUD();
          this.checkLevelTargets();
        }
      }
    }

    // 3. Passou por uma estrela bônus?
    for (const star of this.stars) {
      if (star.x === gx && star.y === gy && !star.collected) {
        star.collected = true;
        audio.playStar();
        particles.emitStarSparkles(
          this.offsetX + gx * this.tileSize + this.tileSize / 2,
          this.offsetY + gy * this.tileSize + this.tileSize / 2
        );
        this.updateHUD();
      }
    }

    // 4. Passou pelo portal de saída já desbloqueado?
    if (this.isExitOpen && gx === this.exitPos.x && gy === this.exitPos.y) {
      this.triggerLevelVictory();
    }
  }

  // Verifica se todos os alvos foram pintados para romper a barreira
  checkLevelTargets() {
    const allPainted = this.targets.every(t => t.isPainted);
    if (allPainted && !this.isExitOpen) {
      this.isExitOpen = true;
      audio.playPortalOpen();
      this.showPortalBanner();
      this.screenShake = 8;
    }
  }

  // Vitória da Fase
  triggerLevelVictory() {
    if (this.levelCompleted) return;
    this.levelCompleted = true;
    this.isExiting = true;
    this.player.isMoving = false;
    this.player.slidePath = [];
    audio.playVictory();

    // Partículas em volta do portal
    particles.emitPortalVortex(
      this.offsetX + this.exitPos.x * this.tileSize + this.tileSize / 2,
      this.offsetY + this.exitPos.y * this.tileSize + this.tileSize / 2
    );

    const lvl = LEVELS[this.currentLevelIndex];
    const starCollected = this.stars.some(s => s.collected);
    const underPar = this.moves <= lvl.parMoves;

    // Sistema das 3 Estrelas Ninja
    let earnedStars = 1; // 1: Missão concluída
    if (starCollected) earnedStars++; // 2: Shuriken coletada
    if (underPar) earnedStars++; // 3: Agilidade Ninja (<= Par)

    if (earnedStars > this.levelStarsRecord[this.currentLevelIndex]) {
      this.levelStarsRecord[this.currentLevelIndex] = earnedStars;
    }
    this.levelMovesRecord[this.currentLevelIndex] = this.moves;
    this.saveProgress();

    // Exibir Modal de Vitória após animação de absorção
    setTimeout(() => {
      this.showVictoryModal(earnedStars, starCollected, underPar);
    }, 400);
  }

  // Atualização dos elementos de interface no HTML
  updateHUD() {
    const lvl = LEVELS[this.currentLevelIndex];
    document.getElementById('hudLevelNum').textContent = `Fase ${lvl.id}/5`;
    document.getElementById('hudLevelName').textContent = lvl.name.split(':')[1]?.trim() || lvl.name;

    // Tinta Atual
    const colorData = COLOR_INFO[this.player.color];
    const paintVessel = document.getElementById('paintVessel');
    const paintName = document.getElementById('paintName');
    const paintCard = document.getElementById('paintCard');

    paintVessel.style.backgroundColor = colorData.hex;
    paintVessel.style.boxShadow = `0 0 14px ${colorData.glow}`;
    paintName.textContent = colorData.name;
    paintName.style.color = this.player.color === 0 ? '#9ca3af' : colorData.hex;
    paintCard.style.borderColor = colorData.glow;

    // Alvos Restantes
    const paintedCount = this.targets.filter(t => t.isPainted).length;
    document.getElementById('hudTargetCount').textContent = `${paintedCount} / ${this.targets.length}`;

    // Movimentos e Par
    const hudMoves = document.getElementById('hudMovesCount');
    hudMoves.textContent = `Mov: ${this.moves} / ${lvl.parMoves}`;
    if (this.moves > lvl.parMoves) {
      hudMoves.style.color = '#ef4444';
    } else {
      hudMoves.style.color = '#9ca3af';
    }

    // Estrelas em Tempo Real
    // Estrela 1: Missão (Acesa)
    const star1 = document.getElementById('starIcon1');
    star1.classList.add('earned');

    // Estrela 2: Shuriken Coletada
    const star2 = document.getElementById('starIcon2');
    const starCollected = this.stars.some(s => s.collected);
    if (starCollected) {
      star2.classList.add('earned');
    } else {
      star2.classList.remove('earned');
    }

    // Estrela 3: Dentro do Par
    const star3 = document.getElementById('starIcon3');
    if (this.moves <= lvl.parMoves) {
      star3.classList.add('earned');
    } else {
      star3.classList.remove('earned');
    }
  }

  showPortalBanner() {
    const banner = document.getElementById('portalBanner');
    banner.classList.add('show');
  }

  hidePortalBanner() {
    const banner = document.getElementById('portalBanner');
    banner.classList.remove('show');
  }

  showVictoryModal(stars, starCollected, underPar) {
    const modal = document.getElementById('victoryModal');
    const starContainer = document.getElementById('victoryStarsContainer');
    starContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.textContent = '★';
      span.style.color = i < stars ? '#fbbf24' : '#4b5563';
      span.style.textShadow = i < stars ? '0 0 14px rgba(251, 191, 36, 0.8)' : 'none';
      starContainer.appendChild(span);
    }

    // Detalhes dos 3 Desafios
    const shurikenBadge = document.getElementById('vStarShurikenBadge');
    const shurikenStatus = document.getElementById('vStarShurikenStatus');
    if (starCollected) {
      shurikenBadge.classList.add('achieved');
      shurikenStatus.textContent = 'Coletada (+1 ★)';
      shurikenStatus.style.color = '#22c55e';
    } else {
      shurikenBadge.classList.remove('achieved');
      shurikenStatus.textContent = 'Não coletada';
      shurikenStatus.style.color = '#6b7280';
    }

    const parBadge = document.getElementById('vStarParBadge');
    const parStatus = document.getElementById('vStarParStatus');
    const lvl = LEVELS[this.currentLevelIndex];
    if (underPar) {
      parBadge.classList.add('achieved');
      parStatus.textContent = `${this.moves} ≤ ${lvl.parMoves} (+1 ★)`;
      parStatus.style.color = '#22c55e';
    } else {
      parBadge.classList.remove('achieved');
      parStatus.textContent = `${this.moves} > ${lvl.parMoves}`;
      parStatus.style.color = '#ef4444';
    }

    document.getElementById('vStatMoves').textContent = this.moves;
    const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
    document.getElementById('vStatTime').textContent = `${mins}:${secs}`;

    modal.classList.add('active');
  }

  showGameCompleteModal() {
    const modal = document.getElementById('gameCompleteModal');
    const totalStars = this.levelStarsRecord.reduce((a, b) => a + b, 0);
    const totalMoves = this.levelMovesRecord.reduce((a, b) => a + b, 0);
    document.getElementById('totalStarsStat').textContent = `${totalStars} / 15`;
    document.getElementById('totalMovesStat').textContent = totalMoves || this.moves;
    modal.classList.add('active');
  }

  /* ==========================================================================
     6. RENDERIZAÇÃO GRÁFICA NO CANVAS
     Estética com pisos texturizados, paredes com selos Ofuda e Toji Fushiguro
     ========================================================================== */
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Aplicação de Screen Shake
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Fundo Sombrio
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Borda decorativa ao redor da arena de jogo
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.offsetX - 2, this.offsetY - 2, this.gridWidth * this.tileSize + 4, this.gridHeight * this.tileSize + 4);

    // 1. Renderizar Ladrilhos de Chão e Paredes
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const rx = this.offsetX + x * this.tileSize;
        const ry = this.offsetY + y * this.tileSize;
        const val = this.grid[y][x];

        if (val === TILE_WALL) {
          this.drawWall(ctx, rx, ry, x, y);
        } else {
          this.drawFloor(ctx, rx, ry);
        }
      }
    }

    // 2. Renderizar Alvos de Pintura
    for (const target of this.targets) {
      const rx = this.offsetX + target.x * this.tileSize;
      const ry = this.offsetY + target.y * this.tileSize;
      this.drawTarget(ctx, rx, ry, target);
    }

    // 3. Renderizar Latas de Tinta
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const val = this.grid[y][x];
        if (val >= TILE_CAN_RED && val <= TILE_CAN_PURPLE) {
          const rx = this.offsetX + x * this.tileSize;
          const ry = this.offsetY + y * this.tileSize;
          this.drawPaintCan(ctx, rx, ry, val);
        }
      }
    }

    // 4. Renderizar Estrelas Bônus
    for (const star of this.stars) {
      if (!star.collected) {
        const rx = this.offsetX + star.x * this.tileSize;
        const ry = this.offsetY + star.y * this.tileSize;
        this.drawStar(ctx, rx, ry);
      }
    }

    // 5. Renderizar Portal de Saída (Torii Barrier)
    this.drawExit(ctx, this.offsetX + this.exitPos.x * this.tileSize, this.offsetY + this.exitPos.y * this.tileSize);

    // 6. Renderizar Partículas
    particles.draw(ctx);

    // 7. Renderizar Toji Fushiguro
    this.drawToji(ctx);

    ctx.restore();
  }

  // Desenho do Piso Urbano
  drawFloor(ctx, x, y) {
    ctx.fillStyle = '#111522';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Borda sutil do bloco de concreto
    ctx.strokeStyle = '#181f30';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);
  }

  // Desenho da Parede Estilizada (Concreto Shibuya com Talismãs Ofuda)
  drawWall(ctx, x, y, gx, gy) {
    // Bloco principal de concreto
    ctx.fillStyle = '#1c2333';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Borda chanfrada iluminada superior
    ctx.fillStyle = '#2d374d';
    ctx.fillRect(x, y, this.tileSize, 4);
    ctx.fillStyle = '#151b27';
    ctx.fillRect(x, y + this.tileSize - 4, this.tileSize, 4);

    // Borda externa escura
    ctx.strokeStyle = '#0f131c';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);

    // Em algumas paredes, desenhar um selo de papel Ofuda amaldiçoado
    if ((gx * 7 + gy * 13) % 5 === 0) {
      ctx.save();
      ctx.fillStyle = '#fef3c7'; // Papel amarelado
      const ofudaW = 10;
      const ofudaH = 18;
      ctx.fillRect(x + this.tileSize / 2 - ofudaW / 2, y + this.tileSize / 2 - ofudaH / 2, ofudaW, ofudaH);

      // Escrita vermelha amaldiçoada no selo
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + this.tileSize / 2 - 2, y + this.tileSize / 2 - 6, 4, 3);
      ctx.fillRect(x + this.tileSize / 2 - 3, y + this.tileSize / 2 - 1, 6, 2);
      ctx.fillRect(x + this.tileSize / 2 - 2, y + this.tileSize / 2 + 3, 4, 4);
      ctx.restore();
    }
  }

  // Desenho do Alvo de Pintura
  drawTarget(ctx, x, y, target) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const col = COLOR_INFO[target.requiredColor];

    if (target.isPainted) {
      // Selo Pintado: Área preenchida com brilho denso
      ctx.save();
      ctx.fillStyle = col.hex;
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10, 8);
      ctx.fill();

      // Símbolo central de selo confirmado
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', cx, cy);
      ctx.restore();
    } else {
      // Alvo Não Pintado: Cantos iluminados com a cor necessária e kanji sutil
      ctx.save();
      ctx.strokeStyle = col.hex;
      ctx.lineWidth = 2.5;

      const bracketSize = 8;
      const pad = 8;

      // Canto Superior Esquerdo
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad + bracketSize);
      ctx.lineTo(x + pad, y + pad);
      ctx.lineTo(x + pad + bracketSize, y + pad);
      ctx.stroke();

      // Canto Superior Direito
      ctx.beginPath();
      ctx.moveTo(x + this.tileSize - pad - bracketSize, y + pad);
      ctx.lineTo(x + this.tileSize - pad, y + pad);
      ctx.lineTo(x + this.tileSize - pad, y + pad + bracketSize);
      ctx.stroke();

      // Canto Inferior Esquerdo
      ctx.beginPath();
      ctx.moveTo(x + pad, y + this.tileSize - pad - bracketSize);
      ctx.lineTo(x + pad, y + this.tileSize - pad);
      ctx.lineTo(x + pad + bracketSize, y + this.tileSize - pad);
      ctx.stroke();

      // Canto Inferior Direito
      ctx.beginPath();
      ctx.moveTo(x + this.tileSize - pad - bracketSize, y + this.tileSize - pad);
      ctx.lineTo(x + this.tileSize - pad, y + this.tileSize - pad);
      ctx.lineTo(x + this.tileSize - pad, y + this.tileSize - pad - bracketSize);
      ctx.stroke();

      // Círculo interno pulsante
      const pulse = Math.sin(this.animTime * 4) * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 7 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = col.glow;
      ctx.fill();

      // Kanji do elemento
      ctx.fillStyle = col.hex;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.kanji, cx, cy);

      ctx.restore();
    }
  }

  // Desenho da Lata / Vaso de Tinta Amaldiçoada
  drawPaintCan(ctx, x, y, colorId) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const col = COLOR_INFO[colorId];

    // Animação de flutuação vertical sutil
    const floatY = Math.sin(this.animTime * 3 + x) * 3;

    ctx.save();
    ctx.translate(cx, cy + floatY);

    // Halo de luz da tinta
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = col.glow;
    ctx.fill();

    // Corpo da Urna / Lata Metálica
    ctx.fillStyle = '#1e2433';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-10, -8, 20, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Núcleo de Líquido Colorido Brilhante
    ctx.fillStyle = col.hex;
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 12, 2);
    ctx.fill();

    // Tampa superior
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, -11, 12, 3);

    ctx.restore();
  }

  // Desenho da Shuriken / Estrela Dourada
  drawStar(ctx, x, y) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const rot = this.animTime * 3.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Estrela Ninja de 4 pontas
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(0, -12);
      ctx.lineTo(3.5, -3.5);
      ctx.rotate(Math.PI / 2);
    }
    ctx.closePath();
    ctx.fill();

    // Centro metálico escuro
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Desenho da Saída / Portal de Fechamento da Barreira
  drawExit(ctx, x, y) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;

    ctx.save();
    if (this.isExitOpen) {
      // PORTAL DESBLOQUEADO: Vórtice hipnótico de luz violeta e dourada
      const rot = this.animTime * 4;
      ctx.translate(cx, cy);

      // Brilho externo expansivo
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#c084fc');
      grad.addColorStop(0.7, '#6366f1');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Anéis giratórios do portal
      ctx.rotate(rot);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.rotate(-rot * 2);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      // PORTAL BLOQUEADO: Portão Torii de pedra escura selado com correntes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 6, y + 6, this.tileSize - 12, this.tileSize - 12);

      // Colunas do Torii
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 10, y + 8, 4, this.tileSize - 16);
      ctx.fillRect(x + this.tileSize - 14, y + 8, 4, this.tileSize - 16);
      ctx.fillRect(x + 8, y + 8, this.tileSize - 16, 5);

      // Cadeado ritual central
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Renderização do Toji Fushiguro
  drawToji(ctx) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    // Opacidade e escala (usados na animação de vitória ao entrar no portal)
    ctx.globalAlpha = this.player.opacity;
    ctx.scale(this.player.facing * this.player.squashX * this.player.scale, this.player.squashY * this.player.scale);

    // Animação de respiração idle ou inclinação de corrida
    const breath = this.player.isMoving ? 0 : Math.sin(this.animTime * 5) * 1.2;
    const tilt = this.player.isMoving ? 0.15 : 0;
    ctx.rotate(tilt);

    // 1. Sombra circular nos pés
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Calças de Artes Marciais (Brancas/Bege folgadas)
    ctx.fillStyle = '#e2ded7';
    ctx.beginPath();
    ctx.roundRect(-8, 6, 7, 12, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(1, 6, 7, 12, 2);
    ctx.fill();
    // Sapatos pretos
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-9, 16, 8, 3.5);
    ctx.fillRect(0, 16, 8, 3.5);

    // Faixa preta na cintura
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 4, 16, 3);

    // 3. Tronco Musculoso: Camiseta Preta de Compressão justa de Toji
    ctx.fillStyle = '#15161c';
    ctx.beginPath();
    ctx.moveTo(-9, -6 + breath);
    ctx.lineTo(9, -6 + breath);
    ctx.lineTo(7, 5);
    ctx.lineTo(-7, 5);
    ctx.closePath();
    ctx.fill();

    // Braço Dianteiro (Músculo definido com tom de pele)
    ctx.fillStyle = '#dfa586';
    ctx.beginPath();
    ctx.arc(7, -2 + breath, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. O Espírito Amaldiçoado de Inventário (Verme roxo enrolado no ombro)
    ctx.fillStyle = '#7c3aed';
    ctx.strokeStyle = '#5b21b6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-2, -3 + breath, 4.5, 0, Math.PI * 2);
    ctx.arc(-6, -7 + breath, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Olho esbugalhado do verme
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -8 + breath, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6.5, -8.5 + breath, 1, 1);

    // 5. Cabeça de Toji
    const headY = -12 + breath;
    ctx.fillStyle = '#e8b59b';
    ctx.beginPath();
    ctx.roundRect(-6, headY, 11, 10, 4);
    ctx.fill();

    // Olho afiado e sobrancelha intimidadora
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1, headY + 3, 3, 1.5);

    // Cicatriz no Lábio de Toji (Lado direito da boca - icônica!)
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(3, headY + 6.5);
    ctx.lineTo(5.5, headY + 9);
    ctx.stroke();

    // Cabelo Preto Espetado Desalinhado
    ctx.fillStyle = '#0f1015';
    ctx.beginPath();
    ctx.moveTo(-8, headY + 3);
    ctx.lineTo(-7, headY - 5);
    ctx.lineTo(-3, headY - 7);
    ctx.lineTo(2, headY - 8);
    ctx.lineTo(7, headY - 4);
    ctx.lineTo(7, headY + 4);
    ctx.lineTo(4, headY - 1);
    ctx.lineTo(1, headY - 3);
    ctx.lineTo(-3, headY);
    ctx.closePath();
    ctx.fill();

    // 6. Arma Amaldiçoada / Pincel de Selamento (Lança Invertida do Céu)
    ctx.save();
    ctx.translate(8, 2 + breath);
    ctx.rotate(0.35);

    // Cabo e lâmina prateada
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-1.5, 0, 3, 5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-1.5, -9, 3, 9);

    // Se o Toji estiver carregando uma cor, a ponta brilha com chamas da cor!
    if (this.player.color !== 0) {
      const c = COLOR_INFO[this.player.color];
      ctx.fillStyle = c.hex;
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -9, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  // Loop Principal de Atualização
  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /* ==========================================================================
     7. ENTRADAS DO JOGADOR (TECLADO, TOUCH E BOTÕES DE INTERFACE)
     ========================================================================== */
  initEventListeners() {
    // Teclado (Setas e WASD)
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        this.tryMove(0, -1);
        this.animateDpad('dpadUp');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.tryMove(0, 1);
        this.animateDpad('dpadDown');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        this.tryMove(-1, 0);
        this.animateDpad('dpadLeft');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        this.tryMove(1, 0);
        this.animateDpad('dpadRight');
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.restartLevel();
      }
    });

    // Controles de Toque / D-Pad Virtual
    const bindDpad = (id, dx, dy) => {
      const btn = document.getElementById(id);
      const handlePress = (e) => {
        e.preventDefault();
        this.tryMove(dx, dy);
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 140);
      };
      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('mousedown', handlePress);
    };

    bindDpad('dpadUp', 0, -1);
    bindDpad('dpadDown', 0, 1);
    bindDpad('dpadLeft', -1, 0);
    bindDpad('dpadRight', 1, 0);

    // Gestos de Deslize (Swipe) no Canvas para dispositivos móveis
    let touchStartX = 0;
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Impede rolagem acidental da página
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 24) {
          if (absX > absY) {
            this.tryMove(dx > 0 ? 1 : -1, 0);
          } else {
            this.tryMove(0, dy > 0 ? 1 : -1);
          }
        }
      }
    }, { passive: false });

    // Botões de Ação da UI
    document.getElementById('btnRestart').addEventListener('click', () => this.restartLevel());

    const btnSound = document.getElementById('btnSound');
    btnSound.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    // Modais
    const helpModal = document.getElementById('helpModal');
    document.getElementById('btnHelp').addEventListener('click', () => helpModal.classList.add('active'));
    document.getElementById('btnCloseHelp').addEventListener('click', () => helpModal.classList.remove('active'));
    document.getElementById('btnStartGame').addEventListener('click', () => {
      audio.init();
      helpModal.classList.remove('active');
    });

    const victoryModal = document.getElementById('victoryModal');
    document.getElementById('btnReplayLevel').addEventListener('click', () => {
      victoryModal.classList.remove('active');
      this.restartLevel();
    });
    document.getElementById('btnNextLevel').addEventListener('click', () => {
      victoryModal.classList.remove('active');
      this.nextLevel();
    });

    // Modal de Seleção de Fase
    const lvlSelectModal = document.getElementById('levelSelectModal');
    document.getElementById('btnLevelSelect').addEventListener('click', () => {
      this.populateLevelSelect();
      lvlSelectModal.classList.add('active');
    });
    document.getElementById('btnCloseLvlSelect').addEventListener('click', () => lvlSelectModal.classList.remove('active'));

    // Modal de Jogo Concluído
    document.getElementById('btnRestartAll').addEventListener('click', () => {
      document.getElementById('gameCompleteModal').classList.remove('active');
      this.loadLevel(0);
    });
  }

  animateDpad(id) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
    }
  }

  populateLevelSelect() {
    const list = document.getElementById('levelSelectList');
    list.innerHTML = '';
    LEVELS.forEach((lvl, i) => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.style.width = '100%';
      btn.style.justifyContent = 'space-between';
      btn.style.padding = '12px 14px';
      btn.style.border = i === this.currentLevelIndex ? '1px solid var(--color-purple)' : '1px solid var(--border-panel)';
      btn.style.background = i === this.currentLevelIndex ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.3)';

      const starsEarned = this.levelStarsRecord[i];
      let starsText = '';
      for (let s = 0; s < 3; s++) {
        starsText += s < starsEarned ? '★' : '☆';
      }

      btn.innerHTML = `
        <div style="text-align: left;">
          <strong>Fase ${lvl.id}: ${lvl.name.split(':')[1]?.trim() || lvl.name}</strong>
          <div style="font-size: 0.72rem; color: #9ca3af;">${lvl.subtitle} (Par: ${lvl.parMoves})</div>
        </div>
        <span style="color: #fbbf24; font-size: 1rem; letter-spacing: 1px;">${starsText}</span>
      `;

      btn.addEventListener('click', () => {
        document.getElementById('levelSelectModal').classList.remove('active');
        this.loadLevel(i);
      });

      list.appendChild(btn);
    });
  }
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
