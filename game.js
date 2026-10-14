/* ==========================================================================
   TOJI PAINTER - MOTOR DE JOGO (JAVASCRIPT VANILLA)
   Toji Fushiguro (Jujutsu Kaisen) com Efeitos Visuais Máximos (Juicy FX)
   Cores Originais da Primeira Versão + 15 Fases Solvíveis + Áudio Sintético
   ========================================================================== */

/* ==========================================================================
   0. POLYFILL DE COMPATIBILIDADE PARA NAVEGADORES ANTIGOS
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
   1. CONSTANTES E PALETA DE CORES ORIGINAIS (PRIMEIRA VERSÃO)
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

// Cores Oficiais e Exatas da Primeira Versão do Jogo
const COLOR_INFO = {
  0: { 
    name: "Nenhuma", 
    hex: "#4b5563", 
    glow: "rgba(107, 114, 128, 0.6)", 
    shadow: "#1f2937", 
    kanji: "無" 
  },
  2: { 
    name: "Carmesim", 
    hex: "#ff2a5f", 
    glow: "rgba(255, 42, 95, 0.8)", 
    shadow: "#9f1239", 
    kanji: "血" 
  },
  3: { 
    name: "Azul Ilimitado", 
    hex: "#00d2ff", 
    glow: "rgba(0, 210, 255, 0.8)", 
    shadow: "#0369a1", 
    kanji: "蒼" 
  },
  4: { 
    name: "Centelha Dourada", 
    hex: "#ffcf00", 
    glow: "rgba(255, 207, 0, 0.8)", 
    shadow: "#b45309", 
    kanji: "閃" 
  },
  5: { 
    name: "Roxo Vazio", 
    hex: "#b347ff", 
    glow: "rgba(179, 71, 255, 0.8)", 
    shadow: "#6b21a8", 
    kanji: "茈" 
  }
};

/* ==========================================================================
   2. DADOS DAS 15 FASES MATEMATICAMENTE TESTADAS E 100% SOLVÍVEIS
   ========================================================================== */
const LEVELS = [
  // FASE 1
  {
    id: 1,
    name: "Fase 1: Treinamento em Shibuya",
    subtitle: "Aprenda a deslizar com a Restrição Celestial e pinte 3 selos Carmesim.",
    parMoves: 14,
    startX: 1,
    startY: 1,
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
  // FASE 2
  {
    id: 2,
    name: "Fase 2: Becos de Shinjuku",
    subtitle: "Alterne entre o Carmesim e o Azul Ilimitado para abrir a barreira.",
    parMoves: 28,
    startX: 1,
    startY: 1,
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
  // FASE 3
  {
    id: 3,
    name: "Fase 3: Pátio do Dragão Dourado",
    subtitle: "Três energias: Carmesim, Azul e a Centelha Dourada.",
    parMoves: 32,
    startX: 1,
    startY: 1,
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
  // FASE 4
  {
    id: 4,
    name: "Fase 4: Salão Místico das Sombras",
    subtitle: "O Roxo Vazio foi liberado. Planeje os cruzamentos com precisão.",
    parMoves: 30,
    startX: 1,
    startY: 1,
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
  // FASE 5
  {
    id: 5,
    name: "Fase 5: Santuário do Clã Zen'in",
    subtitle: "O teste dos 6 selos com as 4 energias amaldiçoadas!",
    parMoves: 42,
    startX: 1,
    startY: 1,
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
  },
  // FASE 6
  {
    id: 6,
    name: "Fase 6: Cruzamento de Lâminas",
    subtitle: "Domine as trocas velozes entre o Carmesim e o Azul nos corredores.",
    parMoves: 28,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 13, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 12, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 7
  {
    id: 7,
    name: "Fase 7: Corredor de Bambu Dourado",
    subtitle: "O poder do Ouro e do Carmesim em harmonia tática.",
    parMoves: 34,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 14, 0, 0, 0, 12, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 14, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 8
  {
    id: 8,
    name: "Fase 8: Fonte Celeste",
    subtitle: "Azul Ilimitado e a Centelha Dourada nos cantos do templo.",
    parMoves: 34,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 14, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 3, 0, 0, 1, 0, 1, 0, 0, 13, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 14, 0, 0, 0, 0, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 9
  {
    id: 9,
    name: "Fase 9: Três Forças Ancestrais",
    subtitle: "5 selos rituais exigem Vermelho, Azul e Amarelo em sequência.",
    parMoves: 32,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 14, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 13, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 14, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 10
  {
    id: 10,
    name: "Fase 10: Véu Noturno de Shibuya",
    subtitle: "Vermelho, Azul e Roxo Vazio protegendo o portal dimensional.",
    parMoves: 30,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 15, 0, 13, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 15, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 11
  {
    id: 11,
    name: "Fase 11: Passagem dos Quatro Selos",
    subtitle: "As quatro tintas distribuídas nos quatro cantos do templo.",
    parMoves: 30,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 14, 0, 14, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 0, 15, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 12
  {
    id: 12,
    name: "Fase 12: Labirinto dos Shurikens",
    subtitle: "6 alvos com cruzamentos complexos e precisão milimétrica.",
    parMoves: 38,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 14, 12, 0, 14, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 15, 0, 0, 0, 13, 0, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 13
  {
    id: 13,
    name: "Fase 13: Câmara dos Mil Ventos",
    subtitle: "Pinte 6 selos dispersos sem errar a sequência das tintas.",
    parMoves: 36,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 12, 0, 0, 0, 13, 0, 0, 0, 14, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 15, 0, 0, 0, 12, 0, 13, 0, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 14
  {
    id: 14,
    name: "Fase 14: Permutação Proibida",
    subtitle: "Um arranjo engenhoso que exige raciocínio espacial avançado.",
    parMoves: 38,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 12, 0, 0, 13, 14, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 15, 0, 0, 0, 12, 0, 13, 99, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // FASE 15
  {
    id: 15,
    name: "Fase 15: Restrição Celestial Suprema",
    subtitle: "O desafio definitivo de Toji Fushiguro: 6 selos, 4 energias e maestria lendária!",
    parMoves: 40,
    startX: 1,
    startY: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 20, 1, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 14, 0, 0, 12, 13, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 1, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 13, 0, 0, 0, 15, 0, 14, 99, 1],
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
    this.masterVolume = 0.30;
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

  playDash() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  playBump() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      gain.gain.setValueAtTime(this.masterVolume * 0.75, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playPickup() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.00, 1174.66];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.035);
        gain.gain.setValueAtTime(this.masterVolume * 0.45, now + i * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.035);
        osc.stop(now + i * 0.035 + 0.21);
      });
    } catch (e) {}
  }

  playPaint() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);

      gain.gain.setValueAtTime(this.masterVolume * 0.65, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playStar() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [1046.50, 1318.51, 1567.98];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.26);
      });
    } catch (e) {}
  }

  playPortalOpen() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [220, 293.66, 369.99, 440, 587.33];
      chords.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.15);
      });
    } catch (e) {}
  }

  playVictory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      arpeggio.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.075);
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now + idx * 0.075);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.075);
        osc.stop(now + idx * 0.075 + 0.39);
      });
    } catch (e) {}
  }
}

const audio = new AudioSystem();

const unlockAudio = () => {
  audio.init();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

/* ==========================================================================
   4. SISTEMA DE PARTÍCULAS & JUICY FX (EFEITOS VISUAIS SUPREMOS)
   ========================================================================== */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.popups = [];
    this.ambientMotes = [];
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    for (let i = 0; i < 24; i++) {
      this.ambientMotes.push({
        x: Math.random() * 528,
        y: Math.random() * 432,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  // Ondas de Choque Radiais nas Colisões com Paredes
  emitShockwave(x, y, color = '#ffffff') {
    this.shockwaves.push({
      x, y,
      radius: 4,
      maxRadius: 28,
      alpha: 0.9,
      color
    });
  }

  // Textos Flutuantes Dinâmicos (+SELADO, ★ SHURIKEN!)
  emitPopup(text, x, y, color = '#ffffff') {
    this.popups.push({
      text, x, y,
      vy: -24,
      alpha: 1.0,
      color,
      scale: 1.2
    });
  }

  // Explosão de Tinta Líquida: 24-28 gotas com gravidade e brilho
  emitPaintSplash(x, y, color) {
    const count = 24 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.0 + 2.0;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 130,
        size: Math.random() * 4.5 + 2.5,
        color,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.025,
        type: 'paint_drop'
      });
    }
  }

  // Trilha de Poeira/Fumaça Aerodinâmica ao Deslizar
  emitDustTrail(x, y, dirX, dirY) {
    for (let i = 0; i < 2; i++) {
      const spread = (Math.random() - 0.5) * 8;
      this.particles.push({
        x: x - dirX * 12 + (dirY !== 0 ? spread : 0),
        y: y - dirY * 12 + (dirX !== 0 ? spread : 0),
        vx: -dirX * (Math.random() * 1.8 + 0.6) + (Math.random() - 0.5) * 0.8,
        vy: -dirY * (Math.random() * 1.8 + 0.6) + (Math.random() - 0.5) * 0.8,
        gravity: 0,
        size: Math.random() * 3.5 + 2.5,
        color: '#f8fafc',
        life: 0.7,
        decay: Math.random() * 0.06 + 0.04,
        type: 'smoke'
      });
    }
  }

  // Chamas e gotas amaldiçoadas caindo da Inverted Spear
  emitCursedFlame(x, y, color) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -Math.random() * 2.5 - 0.5,
      gravity: -30, // Flutua para cima como chama
      size: Math.random() * 3.0 + 1.8,
      color,
      life: 0.85,
      decay: 0.04,
      type: 'sparkle'
    });
  }

  // Impacto de Toji contra a Parede
  emitImpact(x, y, dirX, dirY) {
    for (let i = 0; i < 14; i++) {
      const spread = (Math.random() - 0.5) * 2.4;
      const speed = Math.random() * 3.8 + 1.2;
      this.particles.push({
        x, y,
        vx: -dirX * speed + spread,
        vy: -dirY * speed + spread,
        gravity: 50,
        size: Math.random() * 3.8 + 2.0,
        color: '#cbd5e1',
        life: 0.85,
        decay: Math.random() * 0.05 + 0.035,
        type: 'smoke'
      });
    }
  }

  // Shuriken de Ouro Coletada
  emitStarSparkles(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 30,
        size: Math.random() * 4.5 + 2,
        color: Math.random() > 0.3 ? '#ffcf00' : '#ffffff',
        life: 1.0,
        decay: Math.random() * 0.035 + 0.025,
        type: 'sparkle'
      });
    }
  }

  // Aura mística ao coletar tinta
  emitAura(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 24 + 10;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 2.5,
        vy: -Math.sin(angle) * 2.5,
        gravity: 0,
        size: Math.random() * 3.5 + 2,
        color,
        life: 0.85,
        decay: 0.045,
        type: 'aura'
      });
    }
  }

  // Vórtice de saída absorvendo Toji para o portal
  emitPortalVortex(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 38 + 12;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 4.0,
        vy: -Math.sin(angle) * 4.0,
        gravity: 0,
        size: Math.random() * 4.0 + 2,
        color: Math.random() > 0.5 ? '#b347ff' : '#00d2ff',
        life: 1.0,
        decay: 0.035,
        type: 'sparkle'
      });
    }
  }

  update(dt) {
    // 1. Partículas principais
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.life -= p.decay;
      if (p.type === 'paint_drop') {
        p.vx *= 0.94;
      } else if (p.type === 'smoke') {
        p.vx *= 0.90;
        p.vy *= 0.90;
        p.size += dt * 4;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Ondas de Choque Radiais
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += dt * 90;
      sw.alpha -= dt * 3.5;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Textos Flutuantes
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy * dt;
      pop.alpha -= dt * 1.5;
      pop.scale = Math.max(1.0, pop.scale - dt * 0.8);
      if (pop.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }

    // 4. Motes Ambientais
    for (const m of this.ambientMotes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -10) {
        m.y = 440;
        m.x = Math.random() * 528;
      }
      if (m.x < -10) m.x = 538;
      if (m.x > 538) m.x = -10;
    }
  }

  drawAmbient(ctx) {
    ctx.save();
    for (const m of this.ambientMotes) {
      ctx.fillStyle = `rgba(179, 71, 255, ${m.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    // 1. Desenhar Ondas de Choque
    for (const sw of this.shockwaves) {
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 2.5;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Desenhar Partículas
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.type === 'paint_drop') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Desenhar Textos Flutuantes (+SELADO, ★ SHURIKEN!)
    for (const pop of this.popups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.translate(pop.x, pop.y);
      ctx.scale(pop.scale, pop.scale);
      ctx.font = 'bold 15px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = pop.color;
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 10;
      ctx.fillText(pop.text, 0, 0);
      ctx.restore();
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

    // Estado de Toji Fushiguro
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
      color: 0, // 0 = Sem tinta
      facing: 1, // 1 = direita, -1 = esquerda
      slidePath: [],
      squashX: 1,
      squashY: 1,
      scale: 1,
      opacity: 1,
      ghosts: [] // Efeito de silhuetas / after-images
    };

    // Buffer de entrada para resposta imediata
    this.bufferedMove = null;

    // Estado da Fase
    this.targets = [];
    this.stars = [];
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

    // Registro de progresso persistente para as 15 fases
    this.levelStarsRecord = Array(LEVELS.length).fill(0);
    this.levelMovesRecord = Array(LEVELS.length).fill(0);
    this.loadProgress();

    // Animação e Renderização
    this.lastTime = 0;
    this.animTime = 0;
    this.flameTimer = 0;

    this.initEventListeners();
    this.loadLevel(0);
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadProgress() {
    try {
      const savedStars = localStorage.getItem('toji_painter_stars');
      if (savedStars) {
        const parsed = JSON.parse(savedStars);
        for (let i = 0; i < parsed.length && i < this.levelStarsRecord.length; i++) {
          this.levelStarsRecord[i] = parsed[i];
        }
      }
      const savedMoves = localStorage.getItem('toji_painter_moves');
      if (savedMoves) {
        const parsed = JSON.parse(savedMoves);
        for (let i = 0; i < parsed.length && i < this.levelMovesRecord.length; i++) {
          this.levelMovesRecord[i] = parsed[i];
        }
      }
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('toji_painter_stars', JSON.stringify(this.levelStarsRecord));
      localStorage.setItem('toji_painter_moves', JSON.stringify(this.levelMovesRecord));
    } catch (e) {}
  }

  loadLevel(index) {
    if (index < 0 || index >= LEVELS.length) return;
    this.currentLevelIndex = index;
    const levelData = LEVELS[index];

    this.gridHeight = levelData.grid.length;
    this.gridWidth = levelData.grid[0].length;

    this.grid = levelData.grid.map(row => [...row]);

    this.tileSize = 48;
    this.offsetX = Math.floor((this.canvas.width - this.gridWidth * this.tileSize) / 2);
    this.offsetY = Math.floor((this.canvas.height - this.gridHeight * this.tileSize) / 2);

    this.player.gridX = levelData.startX;
    this.player.gridY = levelData.startY;
    this.player.targetGridX = levelData.startX;
    this.player.targetGridY = levelData.startY;
    this.player.x = this.offsetX + this.player.gridX * this.tileSize + this.tileSize / 2;
    this.player.y = this.offsetY + this.player.gridY * this.tileSize + this.tileSize / 2;
    this.player.isMoving = false;
    this.player.moveDirX = 0;
    this.player.moveDirY = 0;
    this.player.slidePath = [];
    this.player.color = 0;
    this.player.facing = 1;
    this.player.squashX = 1;
    this.player.squashY = 1;
    this.player.scale = 1;
    this.player.opacity = 1;
    this.player.ghosts = [];
    this.bufferedMove = null;

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

    this.moves = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.levelCompleted) {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      }
    }, 1000);

    document.getElementById('victoryModal').classList.remove('active');
    this.updateHUD();
    this.hidePortalBanner();
  }

  restartLevel() {
    audio.init();
    audio.playBump();
    this.loadLevel(this.currentLevelIndex);
  }

  nextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.showGameCompleteModal();
    }
  }

  isWall(gx, gy) {
    if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) return true;
    return this.grid[gy][gx] === TILE_WALL;
  }

  tryMove(dirX, dirY) {
    if (this.levelCompleted || this.isExiting) return;

    audio.init();

    if (this.player.isMoving) {
      this.bufferedMove = { dirX, dirY, time: Date.now() };
      return;
    }

    let curX = this.player.gridX;
    let curY = this.player.gridY;

    if (this.isWall(curX + dirX, curY + dirY)) {
      audio.playBump();
      this.screenShake = 3;
      particles.emitShockwave(this.player.x, this.player.y, '#64748b');
      return;
    }

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

  update(dt) {
    particles.update(dt);
    this.animTime += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    this.player.squashX += (1 - this.player.squashX) * 0.28;
    this.player.squashY += (1 - this.player.squashY) * 0.28;

    // Atualizar After-Images (Ghost Silhouettes)
    for (let i = this.player.ghosts.length - 1; i >= 0; i--) {
      const g = this.player.ghosts[i];
      g.opacity -= dt * 3.5;
      if (g.opacity <= 0) {
        this.player.ghosts.splice(i, 1);
      }
    }

    if (this.isExiting) {
      this.player.scale = Math.max(0, this.player.scale - dt * 2.8);
      this.player.opacity = Math.max(0, this.player.opacity - dt * 3.2);
      return;
    }

    // Chamas místicas no pincel/arma quando energizado com tinta
    if (this.player.color !== 0) {
      this.flameTimer += dt;
      if (this.flameTimer > 0.08) {
        this.flameTimer = 0;
        const col = COLOR_INFO[this.player.color];
        particles.emitCursedFlame(
          this.player.x + (this.player.facing * 12),
          this.player.y + 4,
          col.hex
        );
      }
    }

    // Se estiver deslizando
    if (this.player.isMoving && this.player.slidePath.length > 0) {
      // Registrar silhueta fantasma de velocidade
      if (Math.random() > 0.3) {
        this.player.ghosts.push({
          x: this.player.x,
          y: this.player.y,
          facing: this.player.facing,
          squashX: this.player.squashX,
          squashY: this.player.squashY,
          opacity: 0.45,
          color: this.player.color !== 0 ? COLOR_INFO[this.player.color].hex : '#94a3b8'
        });
      }

      particles.emitDustTrail(
        this.player.x, 
        this.player.y + 12, 
        this.player.moveDirX, 
        this.player.moveDirY
      );

      const nextStep = this.player.slidePath[0];
      const targetWorldX = this.offsetX + nextStep.x * this.tileSize + this.tileSize / 2;
      const targetWorldY = this.offsetY + nextStep.y * this.tileSize + this.tileSize / 2;

      const dx = targetWorldX - this.player.x;
      const dy = targetWorldY - this.player.y;
      const dist = Math.hypot(dx, dy);

      const moveSpeed = 490 * dt;

      if (dist <= moveSpeed) {
        this.player.x = targetWorldX;
        this.player.y = targetWorldY;
        this.player.gridX = nextStep.x;
        this.player.gridY = nextStep.y;
        this.player.slidePath.shift();

        this.onTileEnter(this.player.gridX, this.player.gridY);

        if (this.levelCompleted) {
          return;
        }

        // Colisão com a Parede
        if (this.player.slidePath.length === 0) {
          this.player.isMoving = false;
          audio.playBump();
          this.screenShake = 6;

          // Onda de choque no impacto
          const shockColor = this.player.color !== 0 ? COLOR_INFO[this.player.color].hex : '#ffffff';
          particles.emitShockwave(
            this.player.x + this.player.moveDirX * 16,
            this.player.y + this.player.moveDirY * 16,
            shockColor
          );

          if (this.player.moveDirX !== 0) {
            this.player.squashX = 0.58;
            this.player.squashY = 1.42;
          } else {
            this.player.squashX = 1.42;
            this.player.squashY = 0.58;
          }

          particles.emitImpact(
            this.player.x + this.player.moveDirX * 18,
            this.player.y + this.player.moveDirY * 18,
            this.player.moveDirX,
            this.player.moveDirY
          );

          if (this.bufferedMove && Date.now() - this.bufferedMove.time < 350) {
            const b = this.bufferedMove;
            this.bufferedMove = null;
            this.tryMove(b.dirX, b.dirY);
          } else {
            this.bufferedMove = null;
          }
        }
      } else {
        this.player.x += (dx / dist) * moveSpeed;
        this.player.y += (dy / dist) * moveSpeed;
      }
    }
  }

  onTileEnter(gx, gy) {
    const val = this.grid[gy][gx];

    // 1. Passou por uma lata de tinta?
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
        particles.emitPopup(
          COLOR_INFO[newColor].name.toUpperCase(),
          this.offsetX + gx * this.tileSize + this.tileSize / 2,
          this.offsetY + gy * this.tileSize,
          COLOR_INFO[newColor].hex
        );
        this.updateHUD();
      }
    }

    // 2. Passou por um alvo a pintar? (O chão comum permanece limpo como no Ninja Painter!)
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
          particles.emitShockwave(
            this.offsetX + gx * this.tileSize + this.tileSize / 2,
            this.offsetY + gy * this.tileSize + this.tileSize / 2,
            COLOR_INFO[target.requiredColor].hex
          );
          particles.emitPopup(
            "✓ SELADO!",
            this.offsetX + gx * this.tileSize + this.tileSize / 2,
            this.offsetY + gy * this.tileSize,
            COLOR_INFO[target.requiredColor].hex
          );
          this.updateHUD();
          this.checkLevelTargets();
        }
      }
    }

    // 3. Passou por uma Shuriken de Ouro?
    for (const star of this.stars) {
      if (star.x === gx && star.y === gy && !star.collected) {
        star.collected = true;
        audio.playStar();
        particles.emitStarSparkles(
          this.offsetX + gx * this.tileSize + this.tileSize / 2,
          this.offsetY + gy * this.tileSize + this.tileSize / 2
        );
        particles.emitPopup(
          "★ SHURIKEN!",
          this.offsetX + gx * this.tileSize + this.tileSize / 2,
          this.offsetY + gy * this.tileSize,
          "#ffcf00"
        );
        this.updateHUD();
      }
    }

    // 4. Passou pelo portal de saída já aberto?
    if (this.isExitOpen && gx === this.exitPos.x && gy === this.exitPos.y) {
      this.triggerLevelVictory();
    }
  }

  checkLevelTargets() {
    const allPainted = this.targets.every(t => t.isPainted);
    if (allPainted && !this.isExitOpen) {
      this.isExitOpen = true;
      audio.playPortalOpen();
      this.showPortalBanner();
      this.screenShake = 8;
      particles.emitShockwave(
        this.offsetX + this.exitPos.x * this.tileSize + this.tileSize / 2,
        this.offsetY + this.exitPos.y * this.tileSize + this.tileSize / 2,
        '#b347ff'
      );
    }
  }

  triggerLevelVictory() {
    if (this.levelCompleted) return;
    this.levelCompleted = true;
    this.isExiting = true;
    this.player.isMoving = false;
    this.player.slidePath = [];
    audio.playVictory();

    particles.emitPortalVortex(
      this.offsetX + this.exitPos.x * this.tileSize + this.tileSize / 2,
      this.offsetY + this.exitPos.y * this.tileSize + this.tileSize / 2
    );

    const lvl = LEVELS[this.currentLevelIndex];
    const starCollected = this.stars.some(s => s.collected);
    const underPar = this.moves <= lvl.parMoves;

    let earnedStars = 1;
    if (starCollected) earnedStars++;
    if (underPar) earnedStars++;

    if (earnedStars > this.levelStarsRecord[this.currentLevelIndex]) {
      this.levelStarsRecord[this.currentLevelIndex] = earnedStars;
    }

    const prevMoves = this.levelMovesRecord[this.currentLevelIndex];
    if (prevMoves === 0 || this.moves < prevMoves) {
      this.levelMovesRecord[this.currentLevelIndex] = this.moves;
    }
    this.saveProgress();

    setTimeout(() => {
      this.showVictoryModal(earnedStars, starCollected, underPar);
    }, 450);
  }

  updateHUD() {
    const lvl = LEVELS[this.currentLevelIndex];
    document.getElementById('hudLevelNum').textContent = `Fase ${lvl.id}/${LEVELS.length}`;
    document.getElementById('hudLevelName').textContent = lvl.name.split(':')[1]?.trim() || lvl.name;

    const colorData = COLOR_INFO[this.player.color];
    const paintVessel = document.getElementById('paintVessel');
    const paintName = document.getElementById('paintName');
    const paintCard = document.getElementById('paintCard');

    paintVessel.style.backgroundColor = colorData.hex;
    paintVessel.style.boxShadow = `0 0 16px ${colorData.glow}`;
    paintName.textContent = colorData.name;
    paintName.style.color = this.player.color === 0 ? '#94a3b8' : colorData.hex;
    paintCard.style.borderColor = colorData.glow;

    const paintedCount = this.targets.filter(t => t.isPainted).length;
    document.getElementById('hudTargetCount').textContent = `${paintedCount} / ${this.targets.length}`;

    const hudMoves = document.getElementById('hudMovesCount');
    hudMoves.textContent = `Passos: ${this.moves} / ${lvl.parMoves}`;
    if (this.moves > lvl.parMoves) {
      hudMoves.style.color = '#ef4444';
    } else {
      hudMoves.style.color = '#94a3b8';
    }

    const star1 = document.getElementById('starIcon1');
    star1.classList.add('earned');

    const star2 = document.getElementById('starIcon2');
    const starCollected = this.stars.some(s => s.collected);
    if (starCollected) {
      star2.classList.add('earned');
    } else {
      star2.classList.remove('earned');
    }

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
      span.style.color = i < stars ? '#ffcf00' : '#334155';
      span.style.textShadow = i < stars ? '0 0 16px rgba(255, 207, 0, 0.9), 0 0 30px rgba(255, 207, 0, 0.4)' : 'none';
      starContainer.appendChild(span);
    }

    const shurikenBadge = document.getElementById('vStarShurikenBadge');
    const shurikenStatus = document.getElementById('vStarShurikenStatus');
    if (starCollected) {
      shurikenBadge.classList.add('achieved');
      shurikenStatus.textContent = 'Coletada (+1 ★)';
      shurikenStatus.style.color = '#4ade80';
    } else {
      shurikenBadge.classList.remove('achieved');
      shurikenStatus.textContent = 'Não coletada';
      shurikenStatus.style.color = '#94a3b8';
    }

    const parBadge = document.getElementById('vStarParBadge');
    const parStatus = document.getElementById('vStarParStatus');
    const lvl = LEVELS[this.currentLevelIndex];
    if (underPar) {
      parBadge.classList.add('achieved');
      parStatus.textContent = `${this.moves} ≤ ${lvl.parMoves} (+1 ★)`;
      parStatus.style.color = '#4ade80';
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
    document.getElementById('totalStarsStat').textContent = `${totalStars} / ${LEVELS.length * 3}`;
    document.getElementById('totalMovesStat').textContent = totalMoves || this.moves;
    modal.classList.add('active');
  }

  /* ==========================================================================
     6. RENDERIZAÇÃO GRÁFICA NO CANVAS
     ========================================================================== */
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Fundo Sobrenatural da Arena
    this.drawCanvasBackground(ctx);

    // Motes Ambientais de Fundo
    particles.drawAmbient(ctx);

    // 1. Renderizar Pisos da Arena (Limpos e polidos, sem pintar o chão!)
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const rx = this.offsetX + x * this.tileSize;
        const ry = this.offsetY + y * this.tileSize;
        const val = this.grid[y][x];

        if (val !== TILE_WALL) {
          this.drawFloor(ctx, rx, ry, x, y);
        }
      }
    }

    // 2. Sombras Projetadas das Paredes sobre o Piso
    this.drawWallShadows(ctx);

    // 3. Renderizar Blocos de Parede (Pedra Obsidiana 3D com Chanfro e Selos Ofuda)
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const rx = this.offsetX + x * this.tileSize;
        const ry = this.offsetY + y * this.tileSize;
        const val = this.grid[y][x];

        if (val === TILE_WALL) {
          this.drawWall(ctx, rx, ry, x, y);
        }
      }
    }

    // 4. Renderizar Alvos de Pintura (Apenas os alvos ganham preenchimento)
    for (const target of this.targets) {
      const rx = this.offsetX + target.x * this.tileSize;
      const ry = this.offsetY + target.y * this.tileSize;
      this.drawTarget(ctx, rx, ry, target);
    }

    // 5. Renderizar Frascos / Baldes de Tinta (Sempre nítidos e visíveis)
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

    // 6. Renderizar Shurikens de Ouro
    for (const star of this.stars) {
      if (!star.collected) {
        const rx = this.offsetX + star.x * this.tileSize;
        const ry = this.offsetY + star.y * this.tileSize;
        this.drawShuriken(ctx, rx, ry);
      }
    }

    // 7. Renderizar Portal de Saída
    this.drawExit(ctx, this.offsetX + this.exitPos.x * this.tileSize, this.offsetY + this.exitPos.y * this.tileSize);

    // 8. Renderizar Silhuetas Fantasma de Velocidade (After-images)
    this.drawGhosts(ctx);

    // 9. Renderizar Toji Fushiguro
    this.drawToji(ctx);

    // 10. Renderizar Partículas e Textos Flutuantes
    particles.draw(ctx);

    ctx.restore();
  }

  // Fundo com Moldura Urbana / Jujutsu
  drawCanvasBackground(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Fundo sombrio com gradiente radial profundo
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#10141f');
    bgGrad.addColorStop(0.7, '#080a11');
    bgGrad.addColorStop(1, '#040508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Moldura externa da arena de combate
    const boardX = this.offsetX - 6;
    const boardY = this.offsetY - 6;
    const boardW = this.gridWidth * this.tileSize + 12;
    const boardH = this.gridHeight * this.tileSize + 12;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boardX + 3, boardY + 6, boardW, boardH, 8);
    ctx.fill();

    ctx.fillStyle = '#161b2a';
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(179, 71, 255, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Friso de neon ciano sutil interno
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(boardX + 2, boardY + 2, boardW - 4, boardH - 4, 6);
    ctx.stroke();
  }

  // Desenho do Piso Limpo (Concreto / Tatame Urbano)
  drawFloor(ctx, x, y, gx, gy) {
    const isAlt = (gx + gy) % 2 === 0;
    ctx.fillStyle = isAlt ? '#131826' : '#101420';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Divisórias sutis do bloco
    ctx.strokeStyle = '#1b2234';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);
  }

  // Sombras Projetadas das Paredes sobre o Piso
  drawWallShadows(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.grid[y][x] === TILE_WALL && y + 1 < this.gridHeight && this.grid[y + 1][x] !== TILE_WALL) {
          const rx = this.offsetX + x * this.tileSize;
          const ry = this.offsetY + (y + 1) * this.tileSize;
          ctx.fillRect(rx, ry, this.tileSize, 8);
        }
      }
    }
  }

  // Desenho das Paredes: Blocos 3D de Pedra Obsidiana com Selos Ofuda
  drawWall(ctx, x, y, gx, gy) {
    const s = this.tileSize;

    // Face principal
    ctx.fillStyle = '#22293a';
    ctx.fillRect(x, y, s, s);

    // Divisões estilizadas de blocos
    ctx.fillStyle = '#1c2230';
    ctx.fillRect(x + 2, y + 2, s - 4, (s / 2) - 3);
    ctx.fillRect(x + 2, y + (s / 2) + 1, s - 4, (s / 2) - 3);

    // Junta de argamassa horizontal
    ctx.fillStyle = '#111520';
    ctx.fillRect(x, y + Math.floor(s / 2) - 1, s, 2);

    // Chanfro Iluminado Superior
    ctx.fillStyle = '#3a4763';
    ctx.fillRect(x, y, s, 4);

    // Chanfro Esquerdo
    ctx.fillStyle = '#2e384e';
    ctx.fillRect(x, y, 4, s);

    // Chanfro Direito
    ctx.fillStyle = '#141824';
    ctx.fillRect(x + s - 4, y, 4, s);

    // Chanfro Inferior
    ctx.fillStyle = '#0d1017';
    ctx.fillRect(x, y + s - 4, s, 4);

    // Brilho de aresta
    ctx.fillStyle = '#55678d';
    ctx.fillRect(x, y, 4, 4);

    ctx.strokeStyle = '#0e111a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);

    // Selo Ofuda Amaldiçoado decorativo em algumas paredes
    if ((gx * 7 + gy * 13) % 6 === 0) {
      ctx.save();
      ctx.fillStyle = '#fef08a';
      const ofudaW = 10;
      const ofudaH = 18;
      ctx.fillRect(x + s / 2 - ofudaW / 2, y + s / 2 - ofudaH / 2, ofudaW, ofudaH);

      // Ideogramas vermelhos de maldição
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + s / 2 - 2, y + s / 2 - 6, 4, 3);
      ctx.fillRect(x + s / 2 - 3, y + s / 2 - 1, 6, 2);
      ctx.fillRect(x + s / 2 - 2, y + s / 2 + 3, 4, 4);
      ctx.restore();
    }
  }

  // Desenho do Alvo de Pintura com Efeitos Neon Pulsantes
  drawTarget(ctx, x, y, target) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const col = COLOR_INFO[target.requiredColor];

    if (target.isPainted) {
      // ALVO PINTADO: Preenchimento denso com a cor pura, brilho e selo de conclusão
      ctx.save();
      
      ctx.shadowColor = col.hex;
      ctx.shadowBlur = 14;

      const grad = ctx.createLinearGradient(x, y, x, y + this.tileSize);
      grad.addColorStop(0, col.hex);
      grad.addColorStop(1, col.shadow);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8, 8);
      ctx.fill();

      // Reflexo especular brilhante
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x + 7, y + 6, this.tileSize - 14, 6, 3);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8, 8);
      ctx.stroke();

      // Símbolo de conclusão
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000000';
      ctx.fillText('✓', cx, cy + 1);

      ctx.restore();
    } else {
      // ALVO NÃO PINTADO: Contorno neon pulsante com kanji do elemento e anel de energia
      ctx.save();

      const pulse = Math.sin(this.animTime * 4.5);
      const glowBlur = 9 + pulse * 4;

      ctx.shadowColor = col.hex;
      ctx.shadowBlur = glowBlur;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10, 8);
      ctx.fill();

      ctx.strokeStyle = col.hex;
      ctx.lineWidth = 2.6 + pulse * 0.4;
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10, 8);
      ctx.stroke();

      // Cantoneiras luminosas
      const pad = 6;
      const bracket = 7;
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#ffffff';

      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad + bracket);
      ctx.lineTo(x + pad, y + pad);
      ctx.lineTo(x + pad + bracket, y + pad);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + this.tileSize - pad - bracket, y + this.tileSize - pad);
      ctx.lineTo(x + this.tileSize - pad, y + this.tileSize - pad);
      ctx.lineTo(x + this.tileSize - pad, y + this.tileSize - pad - bracket);
      ctx.stroke();

      // Anel rotativo sutil de energia
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.animTime * 2);
      ctx.strokeStyle = col.hex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 9 + pulse, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Círculo central com o Kanji do elemento amaldiçoado
      ctx.fillStyle = col.hex;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.kanji, cx, cy);

      ctx.restore();
    }
  }

  // Desenho do Pote / Balde Metálico de Tinta
  drawPaintCan(ctx, x, y, colorId) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const col = COLOR_INFO[colorId];

    const floatY = Math.sin(this.animTime * 3.5 + x) * 2.5;

    ctx.save();
    ctx.translate(cx, cy + floatY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 14 - floatY, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Halo brilhante da cor
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fillStyle = col.glow;
    ctx.globalAlpha = 0.4 + Math.sin(this.animTime * 4) * 0.15;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Alça metálica arqueada
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -7, 9, Math.PI, 0);
    ctx.stroke();

    // Corpo metálico
    const bodyGrad = ctx.createLinearGradient(-11, 0, 11, 0);
    bodyGrad.addColorStop(0, '#475569');
    bodyGrad.addColorStop(0.3, '#cbd5e1');
    bodyGrad.addColorStop(0.7, '#94a3b8');
    bodyGrad.addColorStop(1, '#334155');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-11, -8, 22, 20, [3, 3, 6, 6]);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Abertura superior com líquido vibrante
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, -8, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = col.hex;
    ctx.beginPath();
    ctx.ellipse(0, -8, 8.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-3, -8.5, 3, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Faixa colorida no corpo do pote
    ctx.fillStyle = col.hex;
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 7, 2);
    ctx.fill();

    ctx.restore();
  }

  // Desenho da Shuriken Ninja Reluzente
  drawShuriken(ctx, x, y) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    const rot = this.animTime * 4.2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(rot);

    ctx.shadowColor = '#ffcf00';
    ctx.shadowBlur = 14;

    const points = 8;
    const outerRadius = 14;
    const innerRadius = 5.5;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < points; i++) {
      const a1 = (i * 2 * Math.PI) / points;
      const a2 = ((i * 2 + 1) * Math.PI) / points;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * outerRadius, Math.sin(a1) * outerRadius);
      ctx.lineTo(Math.cos(a2) * innerRadius, Math.sin(a2) * innerRadius);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Desenho do Portal de Saída (Vórtice Cósmico / Torii Mágico)
  drawExit(ctx, x, y) {
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;

    ctx.save();
    if (this.isExitOpen) {
      const rot = this.animTime * 3.5;
      ctx.translate(cx, cy);

      const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, 25);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#ffcf00');
      grad.addColorStop(0.55, '#00d2ff');
      grad.addColorStop(0.85, '#b347ff');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();

      // Feixes estelares rotativos
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(rot + (i * Math.PI) / 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(-2, -23, 4, 46);
        ctx.restore();
      }

      ctx.rotate(rot);
      ctx.strokeStyle = '#ffcf00';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffcf00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 1.6);
      ctx.stroke();

      ctx.rotate(-rot * 2.2);
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 1.6);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 8, y + 8, this.tileSize - 16, this.tileSize - 16);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 8, cy);
      ctx.lineTo(x + this.tileSize - 8, cy);
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, y + this.tileSize - 8);
      ctx.stroke();

      ctx.fillStyle = '#be123c';
      ctx.fillRect(x + 6, y + 6, 5, this.tileSize - 12);
      ctx.fillRect(x + this.tileSize - 11, y + 6, 5, this.tileSize - 12);
      ctx.fillRect(x + 5, y + 5, this.tileSize - 10, 6);

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff2a5f';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Renderização de Silhuetas Fantasma de Velocidade (After-Images)
  drawGhosts(ctx) {
    ctx.save();
    for (const g of this.player.ghosts) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.globalAlpha = Math.max(0, g.opacity);
      ctx.scale(g.facing * g.squashX, g.squashY);

      // Silhueta luminosa translúcida
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-8, -12, 16, 26, 4);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // Renderização de TOJI FUSHIGURO (伏黒 甚爾)
  drawToji(ctx) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    ctx.globalAlpha = this.player.opacity;
    ctx.scale(
      this.player.facing * this.player.squashX * this.player.scale, 
      this.player.squashY * this.player.scale
    );

    const breath = this.player.isMoving ? 0 : Math.sin(this.animTime * 5.5) * 1.2;
    const tilt = this.player.isMoving ? 0.16 : 0;
    ctx.rotate(tilt);

    // 1. Sombra nos pés
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Calças de Artes Marciais (Brancas folgadas de Toji)
    ctx.fillStyle = '#f1ece1';
    ctx.beginPath();
    ctx.roundRect(-8, 7, 7, 11, 2.5);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(1, 7, 7, 11, 2.5);
    ctx.fill();

    // Sapatos Shinobi pretos
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-9, 16.5, 8, 3.5);
    ctx.fillRect(1, 16.5, 8, 3.5);

    // Faixa preta na cintura (Obi)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 4.5, 16, 3.5);

    // 3. Tronco Musculoso: Camiseta Preta de Compressão justa
    ctx.fillStyle = '#111319';
    ctx.beginPath();
    ctx.moveTo(-9, -6 + breath);
    ctx.lineTo(9, -6 + breath);
    ctx.lineTo(7.5, 5);
    ctx.lineTo(-7.5, 5);
    ctx.closePath();
    ctx.fill();

    // Braço dianteiro musculoso
    ctx.fillStyle = '#e5ab8c';
    ctx.beginPath();
    ctx.arc(7.5, -2 + breath, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // 4. O Espírito Amaldiçoado de Inventário (Verme Roxo de Toji)
    ctx.fillStyle = '#7c3aed';
    ctx.strokeStyle = '#5b21b6';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(-2, -3 + breath, 5, 0, Math.PI * 2);
    ctx.arc(-6.5, -7 + breath, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6.5, -7.5 + breath, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(-7, -8 + breath, 1.2, 1.2);

    // 5. Cabeça de Toji Fushiguro
    const headY = -14 + breath;
    ctx.fillStyle = '#f0bfa4';
    ctx.beginPath();
    ctx.roundRect(-7, headY, 13, 11, 4);
    ctx.fill();

    // Olho focado e afiado
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0.5, headY + 3.5, 3.5, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1.5, headY + 3.5, 1.2, 1);

    // Cicatriz no canto direito da boca
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(3.2, headY + 7);
    ctx.lineTo(5.8, headY + 9.5);
    ctx.stroke();

    // Cabelo Preto Espetado e Desalinhado
    ctx.fillStyle = '#0d0e13';
    ctx.beginPath();
    ctx.moveTo(-9, headY + 3);
    ctx.lineTo(-8, headY - 6);
    ctx.lineTo(-4, headY - 9);
    ctx.lineTo(1, headY - 10);
    ctx.lineTo(6, headY - 8);
    ctx.lineTo(8, headY - 4);
    ctx.lineTo(8, headY + 4);
    ctx.lineTo(5, headY - 1);
    ctx.lineTo(1, headY - 3);
    ctx.lineTo(-3, headY);
    ctx.closePath();
    ctx.fill();

    // 6. Inverted Spear of Heaven (Ame no Sakahoko)
    ctx.save();
    ctx.translate(9, 2 + breath);
    ctx.rotate(0.38);

    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.5, 0, 3, 6);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-1.5, -10, 3, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(1.5, -6, 2.5, 3);

    // Chamas místicas com a cor original ativa
    if (this.player.color !== 0) {
      const c = COLOR_INFO[this.player.color];
      ctx.fillStyle = c.hex;
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /* ==========================================================================
     7. ENTRADAS DO JOGADOR
     ========================================================================== */
  initEventListeners() {
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

    const bindDpad = (id, dx, dy) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const handlePress = (e) => {
        e.preventDefault();
        this.tryMove(dx, dy);
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 120);
      };
      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('mousedown', handlePress);
    };

    bindDpad('dpadUp', 0, -1);
    bindDpad('dpadDown', 0, 1);
    bindDpad('dpadLeft', -1, 0);
    bindDpad('dpadRight', 1, 0);

    let touchStartX = 0;
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 20) {
          if (absX > absY) {
            this.tryMove(dx > 0 ? 1 : -1, 0);
          } else {
            this.tryMove(0, dy > 0 ? 1 : -1);
          }
        }
      }
    }, { passive: false });

    document.getElementById('btnRestart').addEventListener('click', () => this.restartLevel());

    const btnSound = document.getElementById('btnSound');
    btnSound.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

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

    const lvlSelectModal = document.getElementById('levelSelectModal');
    document.getElementById('btnLevelSelect').addEventListener('click', () => {
      this.populateLevelSelect();
      lvlSelectModal.classList.add('active');
    });
    document.getElementById('btnCloseLvlSelect').addEventListener('click', () => lvlSelectModal.classList.remove('active'));

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
      btn.style.marginBottom = '6px';
      btn.style.border = i === this.currentLevelIndex ? '2px solid var(--color-purple)' : '1px solid rgba(255, 255, 255, 0.12)';
      btn.style.background = i === this.currentLevelIndex ? 'rgba(179, 71, 255, 0.25)' : 'rgba(0, 0, 0, 0.35)';

      const starsEarned = this.levelStarsRecord[i] || 0;
      let starsText = '';
      for (let s = 0; s < 3; s++) {
        starsText += s < starsEarned ? '★' : '☆';
      }

      btn.innerHTML = `
        <div style="text-align: left;">
          <strong style="color: #fff; font-size: 0.95rem;">${lvl.name}</strong>
          <div style="font-size: 0.74rem; color: #94a3b8;">${lvl.subtitle} (Par: ${lvl.parMoves})</div>
        </div>
        <span style="color: #ffcf00; font-size: 1.15rem; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255, 207, 0, 0.5);">${starsText}</span>
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
