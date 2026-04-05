/* ================================================================
   GOM — Gestão de Obras de Manutenção de Frota Municipal
   Versão OFFLINE — sem fetch, sem API, sem ligações externas
   Todos os dados são geridos localmente via localStorage
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. DADOS INICIAIS FICTÍCIOS
   Carregados apenas se o localStorage estiver vazio
   ---------------------------------------------------------------- */

const DADOS_VEICULOS = [
  { id:'v001', matricula:'23-AB-45', patrimonio:'PAT-001', tipo:'ligeiro',  marca:'Volkswagen',   modelo:'Caddy',        ano:2019, ativo:true },
  { id:'v002', matricula:'67-CD-89', patrimonio:'PAT-002', tipo:'ligeiro',  marca:'Renault',       modelo:'Kangoo',       ano:2020, ativo:true },
  { id:'v003', matricula:'12-EF-34', patrimonio:'PAT-003', tipo:'pesado',   marca:'Mercedes-Benz', modelo:'Actros 2040',  ano:2018, ativo:true },
  { id:'v004', matricula:'56-GH-78', patrimonio:'PAT-004', tipo:'pesado',   marca:'Volvo',         modelo:'FH 460',       ano:2017, ativo:true },
  { id:'v005', matricula:'90-IJ-12', patrimonio:'PAT-005', tipo:'maquina',  marca:'Caterpillar',   modelo:'420F2',        ano:2016, ativo:true },
  { id:'v006', matricula:'34-KL-56', patrimonio:'PAT-006', tipo:'maquina',  marca:'JCB',           modelo:'3CX',          ano:2015, ativo:true },
  { id:'v007', matricula:'78-MN-90', patrimonio:'PAT-007', tipo:'ligeiro',  marca:'Ford',          modelo:'Transit Custom',ano:2021, ativo:true },
  { id:'v008', matricula:'11-OP-22', patrimonio:'PAT-008', tipo:'pesado',   marca:'Scania',        modelo:'R 450',        ano:2019, ativo:true },
  { id:'v009', matricula:'33-QR-44', patrimonio:'PAT-009', tipo:'maquina',  marca:'Komatsu',       modelo:'PC210',        ano:2014, ativo:true },
  { id:'v010', matricula:'55-ST-66', patrimonio:'PAT-010', tipo:'ligeiro',  marca:'Peugeot',       modelo:'Partner',      ano:2022, ativo:true },
  { id:'v011', matricula:'77-UV-88', patrimonio:'PAT-011', tipo:'pesado',   marca:'MAN',           modelo:'TGS 26.440',   ano:2018, ativo:true },
  { id:'v012', matricula:'99-WX-00', patrimonio:'PAT-012', tipo:'maquina',  marca:'Bobcat',        modelo:'S650',         ano:2020, ativo:true }
];

const DADOS_OBRAS = [
  {
    id:'o001', numero_obra:'OBR-2024-001', veiculo_id:'v001',
    matricula:'23-AB-45', patrimonio:'PAT-001',
    data_abertura:'2024-01-15', data_fecho:'2024-01-17', estado:'fechada',
    tipo_intervencao:'manutenção preventiva',
    descricao_avaria:'Mudança de óleo e filtros programada. Veículo atingiu os 15.000 km desde a última manutenção.',
    trabalhos_realizados:'Substituição de óleo motor 5W-40 (5L). Substituição de filtro de óleo. Substituição de filtro de ar. Verificação de fluidos e pressão dos pneus.',
    pecas_materiais:'1x Óleo motor 5W-40 (5L) — 28,50€\n1x Filtro de óleo — 12,80€\n1x Filtro de ar — 18,90€',
    servicos_externos:'',
    custo_mao_obra:45.00, custo_servicos_externos:0, custo_materiais:60.20, custo_total:105.20
  },
  {
    id:'o002', numero_obra:'OBR-2024-002', veiculo_id:'v003',
    matricula:'12-EF-34', patrimonio:'PAT-003',
    data_abertura:'2024-02-05', data_fecho:'2024-02-12', estado:'fechada',
    tipo_intervencao:'reparação',
    descricao_avaria:'Falha no sistema de travões. Condutor reportou pedal mole e ruído ao travar. Veículo imobilizado por segurança.',
    trabalhos_realizados:'Diagnóstico completo do sistema de travagem. Substituição de pastilhas e discos de travão no eixo dianteiro. Purga e substituição do líquido de travões. Regulação do sistema de travagem traseiro.',
    pecas_materiais:'2x Discos de travão dianteiro — 145,00€\n1x Jogo de pastilhas dianteiro — 68,50€\n1x Líquido de travões DOT4 (1L) — 9,80€',
    servicos_externos:'Alinhamento e geometria em oficina externa — 85,00€',
    custo_mao_obra:120.00, custo_servicos_externos:85.00, custo_materiais:223.30, custo_total:428.30
  },
  {
    id:'o003', numero_obra:'OBR-2024-003', veiculo_id:'v005',
    matricula:'90-IJ-12', patrimonio:'PAT-005',
    data_abertura:'2024-02-20', data_fecho:'2024-03-05', estado:'fechada',
    tipo_intervencao:'reparação',
    descricao_avaria:'Avaria no sistema hidráulico. Perda de pressão na pá frontal. Detetada fuga de óleo hidráulico na mangueira principal.',
    trabalhos_realizados:'Localização e identificação da fuga hidráulica. Substituição de mangueira hidráulica principal. Substituição de óleo hidráulico completo. Teste de pressão e verificação de vedantes.',
    pecas_materiais:'1x Mangueira hidráulica DN16 (3m) — 89,00€\n60L Óleo hidráulico HV46 — 156,00€\nKit vedantes hidráulicos — 45,00€',
    servicos_externos:'Deslocação de técnico especializado em hidráulica — 220,00€',
    custo_mao_obra:180.00, custo_servicos_externos:220.00, custo_materiais:290.00, custo_total:690.00
  },
  {
    id:'o004', numero_obra:'OBR-2024-004', veiculo_id:'v007',
    matricula:'78-MN-90', patrimonio:'PAT-007',
    data_abertura:'2024-03-10', data_fecho:'2024-03-11', estado:'fechada',
    tipo_intervencao:'manutenção preventiva',
    descricao_avaria:'Substituição de pneus. Pneus dianteiros com desgaste excessivo e abaixo do limite legal de segurança.',
    trabalhos_realizados:'Substituição dos 2 pneus dianteiros. Equilibragem e balanceamento das rodas. Verificação da pressão dos 4 pneus.',
    pecas_materiais:'2x Pneu 205/65R16C — 185,00€\nEquilibragem 2 rodas — 20,00€',
    servicos_externos:'',
    custo_mao_obra:30.00, custo_servicos_externos:0, custo_materiais:205.00, custo_total:235.00
  },
  {
    id:'o005', numero_obra:'OBR-2024-005', veiculo_id:'v004',
    matricula:'56-GH-78', patrimonio:'PAT-004',
    data_abertura:'2024-03-18', data_fecho:'2024-04-02', estado:'fechada',
    tipo_intervencao:'reparação',
    descricao_avaria:'Avaria grave no motor. Motor com perda de potência, fumo azul no escape e consumo excessivo de óleo. Suspeita de desgaste nos segmentos.',
    trabalhos_realizados:'Diagnóstico completo do motor. Desmontagem e inspeção do bloco. Retificação do bloco e cabeça. Substituição de segmentos, casquilhos e vedantes. Montagem e afinação do motor.',
    pecas_materiais:'Kit de retificação motor — 820,00€\nJuntas e vedantes — 145,00€\nÓleo motor 10W-40 (20L) — 89,00€',
    servicos_externos:'Retificação em oficina especializada — 1.200,00€',
    custo_mao_obra:480.00, custo_servicos_externos:1200.00, custo_materiais:1054.00, custo_total:2734.00
  },
  {
    id:'o006', numero_obra:'OBR-2024-006', veiculo_id:'v002',
    matricula:'67-CD-89', patrimonio:'PAT-002',
    data_abertura:'2024-04-08', data_fecho:'2024-04-09', estado:'fechada',
    tipo_intervencao:'revisão',
    descricao_avaria:'Revisão geral programada anual. Veículo com 20.000 km. Verificação completa de todos os sistemas.',
    trabalhos_realizados:'Mudança de óleo e filtros. Substituição de filtro de habitáculo. Verificação e ajuste da embraiagem. Inspeção visual da estrutura. Verificação elétrica geral.',
    pecas_materiais:'Óleo motor + filtros — 75,00€\nFiltro habitáculo — 22,00€',
    servicos_externos:'',
    custo_mao_obra:90.00, custo_servicos_externos:0, custo_materiais:97.00, custo_total:187.00
  },
  {
    id:'o007', numero_obra:'OBR-2024-007', veiculo_id:'v006',
    matricula:'34-KL-56', patrimonio:'PAT-006',
    data_abertura:'2024-05-14', data_fecho:'2024-05-16', estado:'fechada',
    tipo_intervencao:'reparação',
    descricao_avaria:'Falha no sistema elétrico. Pá carregadora sem arranque. Bateria descarregada repetidamente. Suspeita de alternador avariado.',
    trabalhos_realizados:'Teste e diagnóstico do sistema elétrico. Confirmação de alternador com falha. Substituição do alternador. Substituição da bateria por degradação. Teste completo do sistema elétrico.',
    pecas_materiais:'1x Alternador remanufaturado — 340,00€\n1x Bateria 100Ah — 185,00€',
    servicos_externos:'',
    custo_mao_obra:95.00, custo_servicos_externos:0, custo_materiais:525.00, custo_total:620.00
  },
  {
    id:'o008', numero_obra:'OBR-2025-001', veiculo_id:'v008',
    matricula:'11-OP-22', patrimonio:'PAT-008',
    data_abertura:'2025-01-08', data_fecho:null, estado:'aberta',
    tipo_intervencao:'inspeção',
    descricao_avaria:'Inspeção periódica obrigatória. Camião com prazo de inspeção a vencer. Necessário verificar todos os requisitos legais.',
    trabalhos_realizados:'Verificação de luzes e sinalização. Verificação de travões e direção.',
    pecas_materiais:'Lâmpadas substituídas — 15,00€',
    servicos_externos:'Inspeção técnica obrigatória — 85,00€',
    custo_mao_obra:60.00, custo_servicos_externos:85.00, custo_materiais:15.00, custo_total:0
  },
  {
    id:'o009', numero_obra:'OBR-2025-002', veiculo_id:'v009',
    matricula:'33-QR-44', patrimonio:'PAT-009',
    data_abertura:'2025-02-03', data_fecho:null, estado:'aberta',
    tipo_intervencao:'reparação',
    descricao_avaria:'Avaria na escavadora. Lagartas com desgaste excessivo, risco de paragem em obra. Necessário substituição urgente.',
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  },
  {
    id:'o010', numero_obra:'OBR-2025-003', veiculo_id:'v010',
    matricula:'55-ST-66', patrimonio:'PAT-010',
    data_abertura:'2025-03-12', data_fecho:null, estado:'aberta',
    tipo_intervencao:'manutenção preventiva',
    descricao_avaria:'Mudança de óleo de serviço. Veículo atingiu os 10.000 km programados para manutenção.',
    trabalhos_realizados:'Drenagem e substituição de óleo motor 5W-30 (5L). Substituição de filtro de óleo.',
    pecas_materiais:'Óleo motor 5W-30 + filtro — 52,00€',
    servicos_externos:'',
    custo_mao_obra:35.00, custo_servicos_externos:0, custo_materiais:52.00, custo_total:0
  },
  {
    id:'o011', numero_obra:'OBR-2025-004', veiculo_id:'v011',
    matricula:'77-UV-88', patrimonio:'PAT-011',
    data_abertura:'2025-03-25', data_fecho:null, estado:'aberta',
    tipo_intervencao:'reparação',
    descricao_avaria:'Fuga de combustível detetada pelo condutor. Veículo imobilizado por razões de segurança. Fuga aparente na linha de combustível próxima do filtro.',
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  },
  {
    id:'o012', numero_obra:'OBR-2025-005', veiculo_id:'v012',
    matricula:'99-WX-00', patrimonio:'PAT-012',
    data_abertura:'2025-04-01', data_fecho:null, estado:'aberta',
    tipo_intervencao:'manutenção preventiva',
    descricao_avaria:'Manutenção preventiva semestral. Substituição de filtros e fluidos conforme plano de manutenção do fabricante.',
    trabalhos_realizados:'Mudança de óleo hidráulico. Substituição de filtro hidráulico.',
    pecas_materiais:'Óleo hidráulico + filtro — 78,00€',
    servicos_externos:'',
    custo_mao_obra:50.00, custo_servicos_externos:0, custo_materiais:78.00, custo_total:0
  }
];

/* ----------------------------------------------------------------
   2. CAMADA DE DADOS LOCAL (localStorage)
   ---------------------------------------------------------------- */

const DB = {
  KEY_V: 'gom_veiculos',
  KEY_O: 'gom_obras',

  init() {
    if (!localStorage.getItem(this.KEY_V)) {
      localStorage.setItem(this.KEY_V, JSON.stringify(DADOS_VEICULOS));
    }
    if (!localStorage.getItem(this.KEY_O)) {
      localStorage.setItem(this.KEY_O, JSON.stringify(DADOS_OBRAS));
    }
  },

  /* Veículos */
  getVeiculos() {
    return JSON.parse(localStorage.getItem(this.KEY_V) || '[]');
  },
  getVeiculo(id) {
    return this.getVeiculos().find(v => v.id === id) || null;
  },
  saveVeiculos(list) {
    localStorage.setItem(this.KEY_V, JSON.stringify(list));
  },

  /* Obras */
  getObras() {
    return JSON.parse(localStorage.getItem(this.KEY_O) || '[]');
  },
  getObra(id) {
    return this.getObras().find(o => o.id === id) || null;
  },
  saveObras(list) {
    localStorage.setItem(this.KEY_O, JSON.stringify(list));
  },
  criarObra(dados) {
    const obras = this.getObras();
    const nova = { id: 'o' + Date.now(), ...dados };
    obras.push(nova);
    this.saveObras(obras);
    return nova;
  },
  actualizarObra(id, campos) {
    const obras = this.getObras();
    const idx = obras.findIndex(o => o.id === id);
    if (idx === -1) return null;
    obras[idx] = { ...obras[idx], ...campos };
    this.saveObras(obras);
    return obras[idx];
  },

  /* Nº sequencial de obra */
  proximoNumeroObra(ano) {
    const obras = this.getObras();
    const desse_ano = obras.filter(o => o.numero_obra && o.numero_obra.startsWith(`OBR-${ano}-`));
    const seq = String(desse_ano.length + 1).padStart(3, '0');
    return `OBR-${ano}-${seq}`;
  }
};

/* ----------------------------------------------------------------
   3. UTILITÁRIOS DE FORMATAÇÃO
   ---------------------------------------------------------------- */

function fmtData(str) {
  if (!str) return '—';
  // suporta 'YYYY-MM-DD' e ISO
  const d = new Date(str.length === 10 ? str + 'T00:00:00' : str);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function fmtHora(str) {
  if (!str) return '—';
  const d = new Date(str.length === 10 ? str + 'T00:00:00' : str);
  if (isNaN(d)) return '—';
  return d.toLocaleString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function fmtEuro(v) {
  return (parseFloat(v) || 0).toLocaleString('pt-PT', { style:'currency', currency:'EUR' });
}

function uid() {
  return 'o' + Date.now() + Math.random().toString(36).slice(2, 7);
}

function toastMsg(msg, tipo = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${tipo}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ----------------------------------------------------------------
   4. CONSTANTES DE INTERFACE
   ---------------------------------------------------------------- */

const TIPO_ICON  = { ligeiro:'&#x1F697;', pesado:'&#x1F69A;', maquina:'&#x1F69C;' };
const TIPO_SVG   = { ligeiro:'car', pesado:'truck', maquina:'tractor' };
const TIPO_LABEL = { ligeiro:'Ligeiro', pesado:'Pesado', maquina:'Máquina' };

const INT_COR = {
  'manutenção preventiva': 'badge-blue',
  'reparação':             'badge-red',
  'inspeção':              'badge-yellow',
  'revisão':               'badge-green'
};

// SVG icons inline (sem Font Awesome)
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  truck:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`,
  wrench:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  plus:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  eye:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  print:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  back:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  close:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  bars:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  city:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  save:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  euro:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M4 14h12M19.5 16.5A7.5 7.5 0 1 1 19.5 7.5"/></svg>`,
  car:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-7l2-5h14l2 5v7h-2"/><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  tractor:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/><path d="M3 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M7 20V7l5-4h6v8h2v5h-2a3 3 0 0 0-6 0H7z"/><path d="M12 3v8"/></svg>`,
  clock:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  list:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  checkCircle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  tools:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  history:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>`,
  info:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
};

function icon(name, size = 16) {
  return `<span class="svg-icon" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;vertical-align:middle;">${ICONS[name] || ''}</span>`;
}

/* ----------------------------------------------------------------
   5. MODAL
   ---------------------------------------------------------------- */

function openModal(titulo, corpo, rodape = '') {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML = corpo;
  document.getElementById('modalFooter').innerHTML = rodape;
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

/* ----------------------------------------------------------------
   6. ROTEADOR
   ---------------------------------------------------------------- */

let paginaAtual = 'dashboard';
let paramsAtual = {};

function ir(pagina, params = {}) {
  paginaAtual = pagina;
  paramsAtual = params;

  // Fechar sidebar em mobile
  document.getElementById('sidebar').classList.remove('open');

  // Actualizar links activos
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pagina);
  });

  // Título
  const titulos = {
    dashboard:          'Dashboard',
    veiculos:           'Veículos',
    obras:              'Obras',
    'obra-detalhe':     'Detalhe da Obra',
    'veiculo-historico':'Histórico do Veículo'
  };
  document.getElementById('pageTitle').textContent = titulos[pagina] || pagina;
  document.getElementById('topbarActions').innerHTML = '';

  // Renderizar página
  switch (pagina) {
    case 'dashboard':          renderDashboard();               break;
    case 'veiculos':           renderVeiculos();                break;
    case 'obras':              renderObras();                   break;
    case 'obra-detalhe':       renderObraDetalhe(params.id);   break;
    case 'veiculo-historico':  renderVeiculoHistorico(params.id); break;
    default:
      document.getElementById('pageContainer').innerHTML = '<p>Página não encontrada.</p>';
  }
}

/* ----------------------------------------------------------------
   7. BADGE DE ESTADO
   ---------------------------------------------------------------- */

function badgeEstado(estado) {
  if (estado === 'aberta')
    return `<span class="badge badge-red">${icon('tools',11)} Aberta</span>`;
  if (estado === 'fechada')
    return `<span class="badge badge-green">${icon('check',11)} Fechada</span>`;
  return `<span class="badge badge-gray">${estado}</span>`;
}

/* ----------------------------------------------------------------
   8. DASHBOARD
   ---------------------------------------------------------------- */

function renderDashboard() {
  const obras    = DB.getObras();
  const abertas  = obras.filter(o => o.estado === 'aberta');
  const fechadas = obras.filter(o => o.estado === 'fechada');
  const custoTot = fechadas.reduce((s, o) => s + (parseFloat(o.custo_total) || 0), 0);
  const recentes = [...obras].sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura)).slice(0, 6);

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Resumo geral do sistema de gestão de obras</p>
      </div>
      <button class="btn btn-primary" onclick="modalCriarObra()">
        ${icon('plus')} Nova Obra
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">${icon('list',22)}</div>
        <div class="stat-info">
          <div class="stat-value">${obras.length}</div>
          <div class="stat-label">Total de Obras</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">${icon('tools',22)}</div>
        <div class="stat-info">
          <div class="stat-value">${abertas.length}</div>
          <div class="stat-label">Obras Abertas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">${icon('checkCircle',22)}</div>
        <div class="stat-info">
          <div class="stat-value">${fechadas.length}</div>
          <div class="stat-label">Obras Fechadas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">${icon('euro',22)}</div>
        <div class="stat-info">
          <div class="stat-value" style="font-size:18px">${fmtEuro(custoTot)}</div>
          <div class="stat-label">Custo Total (fechadas)</div>
        </div>
      </div>
    </div>

    <div class="grid-2col">
      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('clock',15)} Obras Abertas</span>
          <button class="btn btn-sm btn-outline" onclick="ir('obras')">Ver todas</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nº Obra</th><th>Veículo</th><th>Descrição</th><th>Data</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${abertas.length === 0
                ? `<tr><td colspan="5" class="table-empty">Não existem obras abertas</td></tr>`
                : abertas.slice(0, 5).map(o => `
                  <tr>
                    <td><strong>${o.numero_obra}</strong></td>
                    <td>
                      <div style="font-weight:600">${o.matricula}</div>
                      <div style="font-size:11.5px;color:var(--text-medium)">${o.patrimonio}</div>
                    </td>
                    <td class="td-trunc" title="${esc(o.descricao_avaria)}">${o.descricao_avaria || '—'}</td>
                    <td>${fmtData(o.data_abertura)}</td>
                    <td>
                      <button class="btn btn-sm btn-outline btn-icon" title="Ver detalhe" onclick="ir('obra-detalhe',{id:'${o.id}'})">
                        ${icon('eye',14)}
                      </button>
                    </td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('history',15)} Obras Recentes</span>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Nº Obra</th><th>Matrícula</th><th>Estado</th><th>Data</th><th></th></tr>
            </thead>
            <tbody>
              ${recentes.map(o => `
                <tr>
                  <td><strong>${o.numero_obra}</strong></td>
                  <td>${o.matricula}</td>
                  <td>${badgeEstado(o.estado)}</td>
                  <td>${fmtData(o.data_abertura)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">
                      ${icon('eye',14)}
                    </button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   9. VEÍCULOS
   ---------------------------------------------------------------- */

function renderVeiculos() {
  const veiculos = DB.getVeiculos();
  window._veiculos = veiculos;

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div>
        <h2>Frota Municipal</h2>
        <p>${veiculos.length} veículos/máquinas registados</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input type="text" class="form-control" placeholder="Pesquisar..." id="searchVeiculo"
               oninput="filtrarVeiculos()" style="max-width:200px;">
        <select class="form-control" id="filtroTipoV" onchange="filtrarVeiculos()" style="max-width:150px;">
          <option value="">Todos os tipos</option>
          <option value="ligeiro">Ligeiro</option>
          <option value="pesado">Pesado</option>
          <option value="maquina">Máquina</option>
        </select>
      </div>
    </div>
    <div class="veiculos-grid" id="veiculosGrid">${renderVeiculoCards(veiculos)}</div>
  `;
}

function renderVeiculoCards(lista) {
  if (!lista.length)
    return '<p style="color:var(--text-light);grid-column:1/-1;padding:40px;text-align:center">Nenhum veículo encontrado.</p>';

  return lista.map(v => {
    const obras    = DB.getObras().filter(o => o.veiculo_id === v.id || o.matricula === v.matricula);
    const abertas  = obras.filter(o => o.estado === 'aberta').length;
    const iconeV   = v.tipo === 'pesado' ? icon('truck', 22)
                   : v.tipo === 'maquina' ? icon('tractor', 22)
                   : icon('car', 22);
    return `
      <div class="veiculo-card" onclick="ir('veiculo-historico',{id:'${v.id}'})">
        <div class="veiculo-icon">${iconeV}</div>
        <div class="veiculo-info">
          <h4>${v.marca} ${v.modelo}</h4>
          <p>${TIPO_LABEL[v.tipo] || v.tipo} · ${v.ano}</p>
          <span class="matricula">${v.matricula}</span>
          <div style="margin-top:4px;font-size:11.5px;color:var(--text-light)">${v.patrimonio}</div>
          ${abertas > 0 ? `<div style="margin-top:5px;"><span class="badge badge-red" style="font-size:10.5px;">${abertas} obra${abertas>1?'s':''} aberta${abertas>1?'s':''}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function filtrarVeiculos() {
  const q = (document.getElementById('searchVeiculo')?.value || '').toLowerCase();
  const t = document.getElementById('filtroTipoV')?.value || '';
  const lista = (window._veiculos || []).filter(v => {
    const match = !q || `${v.marca} ${v.modelo} ${v.matricula} ${v.patrimonio}`.toLowerCase().includes(q);
    return match && (!t || v.tipo === t);
  });
  document.getElementById('veiculosGrid').innerHTML = renderVeiculoCards(lista);
}

/* ----------------------------------------------------------------
   10. OBRAS — LISTA
   ---------------------------------------------------------------- */

function renderObras() {
  const obras = [...DB.getObras()].sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura));
  window._obras = obras;

  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-primary" onclick="modalCriarObra()">
      ${icon('plus')} Nova Obra
    </button>
  `;

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div>
        <h2>Gestão de Obras</h2>
        <p>${obras.length} obras registadas</p>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" class="form-control" placeholder="Pesquisar..." id="searchObra" oninput="filtrarObras()">
      <select class="form-control" id="filtroEstado" onchange="filtrarObras()">
        <option value="">Todos os estados</option>
        <option value="aberta">Abertas</option>
        <option value="fechada">Fechadas</option>
      </select>
      <select class="form-control" id="filtroInt" onchange="filtrarObras()">
        <option value="">Todos os tipos</option>
        <option value="manutenção preventiva">Manutenção preventiva</option>
        <option value="reparação">Reparação</option>
        <option value="inspeção">Inspeção</option>
        <option value="revisão">Revisão</option>
      </select>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nº Obra</th><th>Matrícula</th><th>Património</th><th>Tipo</th>
              <th>Descrição</th><th>Abertura</th><th>Custo</th><th>Estado</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="obrasBody">${rowsObras(obras)}</tbody>
        </table>
      </div>
    </div>
  `;
}

function rowsObras(lista) {
  if (!lista.length)
    return `<tr><td colspan="9" class="table-empty">Nenhuma obra encontrada.</td></tr>`;

  return lista.map(o => `
    <tr>
      <td><strong>${o.numero_obra}</strong></td>
      <td>${o.matricula}</td>
      <td>${o.patrimonio}</td>
      <td>${o.tipo_intervencao ? `<span class="badge ${INT_COR[o.tipo_intervencao]||'badge-gray'}">${o.tipo_intervencao}</span>` : '—'}</td>
      <td class="td-trunc" title="${esc(o.descricao_avaria)}">${o.descricao_avaria || '—'}</td>
      <td>${fmtData(o.data_abertura)}</td>
      <td>${o.estado==='fechada' ? fmtEuro(o.custo_total) : '<span style="color:var(--text-light)">—</span>'}</td>
      <td>${badgeEstado(o.estado)}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-sm btn-outline btn-icon" title="Ver detalhe" onclick="ir('obra-detalhe',{id:'${o.id}'})">
            ${icon('eye',14)}
          </button>
          <button class="btn btn-sm btn-secondary btn-icon" title="Imprimir" onclick="imprimirObra('${o.id}')">
            ${icon('print',14)}
          </button>
          ${o.estado === 'aberta' ? `
          <button class="btn btn-sm btn-warning btn-icon" title="Actualizar" onclick="modalActualizar('${o.id}')">
            ${icon('edit',14)}
          </button>
          <button class="btn btn-sm btn-success btn-icon" title="Fechar obra" onclick="modalFechar('${o.id}')">
            ${icon('check',14)}
          </button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function filtrarObras() {
  const q  = (document.getElementById('searchObra')?.value || '').toLowerCase();
  const es = document.getElementById('filtroEstado')?.value || '';
  const ti = document.getElementById('filtroInt')?.value || '';
  const lista = (window._obras || []).filter(o => {
    const match = !q || `${o.numero_obra} ${o.matricula} ${o.patrimonio} ${o.descricao_avaria}`.toLowerCase().includes(q);
    return match && (!es || o.estado === es) && (!ti || o.tipo_intervencao === ti);
  });
  document.getElementById('obrasBody').innerHTML = rowsObras(lista);
}

/* ----------------------------------------------------------------
   11. DETALHE DA OBRA
   ---------------------------------------------------------------- */

function renderObraDetalhe(id) {
  const o = DB.getObra(id);
  if (!o) {
    document.getElementById('pageContainer').innerHTML = '<p style="color:var(--danger)">Obra não encontrada.</p>';
    return;
  }

  const mao  = parseFloat(o.custo_mao_obra) || 0;
  const serv = parseFloat(o.custo_servicos_externos) || 0;
  const mat  = parseFloat(o.custo_materiais) || 0;
  const tot  = o.estado === 'fechada' ? (parseFloat(o.custo_total) || 0) : mao + serv + mat;

  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="ir('obras')">${icon('back')} Voltar</button>
    <button class="btn btn-outline btn-sm" onclick="imprimirObra('${o.id}')">${icon('print')} Imprimir</button>
    ${o.estado === 'aberta' ? `
    <button class="btn btn-warning btn-sm" onclick="modalActualizar('${o.id}')">${icon('edit')} Actualizar</button>
    <button class="btn btn-success btn-sm" onclick="modalFechar('${o.id}')">${icon('check')} Fechar Obra</button>
    ` : ''}
  `;

  document.getElementById('pageContainer').innerHTML = `
    <div style="max-width:860px;margin:0 auto;">
      <div class="card" style="margin-bottom:16px;">
        <div style="padding:20px;background:linear-gradient(135deg,var(--primary-dark),var(--primary));border-radius:var(--radius) var(--radius) 0 0;color:#fff;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:22px;font-weight:800;">${o.numero_obra}</div>
              <div style="opacity:.8;font-size:13px;margin-top:3px;">Criada em ${fmtData(o.data_abertura)}</div>
            </div>
            <div style="text-align:right;">
              ${badgeEstado(o.estado)}
              ${o.estado === 'fechada' && o.data_fecho
                ? `<div style="opacity:.8;font-size:12px;margin-top:4px;">Fechada em ${fmtData(o.data_fecho)}</div>`
                : ''}
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="obra-detail-grid">
            <div class="detail-item">
              <div class="detail-label">Matrícula</div>
              <div class="detail-value" style="font-size:20px;font-weight:800;color:var(--primary);">${o.matricula}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Nº de Património</div>
              <div class="detail-value">${o.patrimonio}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tipo de Intervenção</div>
              <div class="detail-value">
                ${o.tipo_intervencao
                  ? `<span class="badge ${INT_COR[o.tipo_intervencao]||'badge-gray'}">${o.tipo_intervencao}</span>`
                  : '—'}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Data de Abertura</div>
              <div class="detail-value">${fmtData(o.data_abertura)}</div>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="form-group">
            <div class="detail-label">Descrição da Avaria / Intervenção</div>
            <div class="text-block">${o.descricao_avaria || '<em style="color:var(--text-light)">Sem descrição</em>'}</div>
          </div>

          ${o.trabalhos_realizados ? `
          <div class="form-group">
            <div class="detail-label">Trabalhos Realizados</div>
            <div class="text-block">${nl2br(o.trabalhos_realizados)}</div>
          </div>` : ''}

          ${o.pecas_materiais ? `
          <div class="form-group">
            <div class="detail-label">Peças e Materiais</div>
            <div class="text-block">${nl2br(o.pecas_materiais)}</div>
          </div>` : ''}

          ${o.servicos_externos ? `
          <div class="form-group">
            <div class="detail-label">Serviços Externos</div>
            <div class="text-block">${nl2br(o.servicos_externos)}</div>
          </div>` : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('euro',15)} Resumo de Custos</span>
        </div>
        <div class="card-body">
          <div class="custo-row"><span>Mão de obra interna</span><strong>${fmtEuro(mao)}</strong></div>
          <div class="custo-row"><span>Serviços externos</span><strong>${fmtEuro(serv)}</strong></div>
          <div class="custo-row"><span>Materiais / Peças</span><strong>${fmtEuro(mat)}</strong></div>
          <div class="custo-row total"><span>TOTAL</span><strong>${fmtEuro(tot)}</strong></div>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   12. HISTÓRICO DO VEÍCULO
   ---------------------------------------------------------------- */

function renderVeiculoHistorico(id) {
  const v = DB.getVeiculo(id);
  if (!v) {
    document.getElementById('pageContainer').innerHTML = '<p style="color:var(--danger)">Veículo não encontrado.</p>';
    return;
  }

  const obras    = DB.getObras()
    .filter(o => o.veiculo_id === id || o.matricula === v.matricula)
    .sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura));

  const abertas  = obras.filter(o => o.estado === 'aberta').length;
  const fechadas = obras.filter(o => o.estado === 'fechada').length;
  const custoAc  = obras.filter(o => o.estado === 'fechada').reduce((s, o) => s + (parseFloat(o.custo_total) || 0), 0);

  const tipos = {};
  obras.forEach(o => {
    if (o.tipo_intervencao) tipos[o.tipo_intervencao] = (tipos[o.tipo_intervencao] || 0) + 1;
  });

  const iconeV = v.tipo === 'pesado' ? icon('truck',26)
               : v.tipo === 'maquina' ? icon('tractor',26)
               : icon('car',26);

  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="ir('veiculos')">${icon('back')} Voltar</button>
    <button class="btn btn-primary btn-sm" onclick="modalCriarObraVeiculo('${v.id}','${v.matricula}','${v.patrimonio}')">
      ${icon('plus')} Nova Obra
    </button>
  `;

  document.getElementById('pageContainer').innerHTML = `
    <div style="max-width:900px;margin:0 auto;">
      <div class="card" style="margin-bottom:20px;">
        <div class="historico-header">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:56px;height:56px;background:rgba(255,255,255,.15);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:#fff;">
              ${iconeV}
            </div>
            <div>
              <h3>${v.marca} ${v.modelo}</h3>
              <p>${TIPO_LABEL[v.tipo]||v.tipo} · Ano ${v.ano}</p>
            </div>
            <div style="margin-left:auto;text-align:right;">
              <div style="font-size:22px;font-weight:800;color:#fff">${v.matricula}</div>
              <div style="opacity:.8;font-size:13px;">${v.patrimonio}</div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="stats-grid" style="margin-bottom:0">
            <div class="stat-card">
              <div class="stat-icon blue">${icon('list',22)}</div>
              <div class="stat-info"><div class="stat-value">${obras.length}</div><div class="stat-label">Total de Obras</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon red">${icon('tools',22)}</div>
              <div class="stat-info"><div class="stat-value">${abertas}</div><div class="stat-label">Em Aberto</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">${icon('checkCircle',22)}</div>
              <div class="stat-info"><div class="stat-value">${fechadas}</div><div class="stat-label">Concluídas</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon yellow">${icon('euro',22)}</div>
              <div class="stat-info"><div class="stat-value" style="font-size:16px">${fmtEuro(custoAc)}</div><div class="stat-label">Custo Acumulado</div></div>
            </div>
          </div>
        </div>
      </div>

      ${Object.keys(tipos).length > 0 ? `
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header"><span class="card-title">Tipos de Intervenção</span></div>
        <div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap;">
          ${Object.entries(tipos).map(([t,n]) => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--border);border-radius:var(--radius);background:#f8fafc;">
              <span class="badge ${INT_COR[t]||'badge-gray'}">${t}</span>
              <span style="font-weight:700;font-size:15px;">${n}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="card">
        <div class="card-header"><span class="card-title">Histórico de Obras</span></div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Nº Obra</th><th>Tipo</th><th>Descrição</th><th>Abertura</th><th>Fecho</th><th>Custo</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              ${obras.length === 0
                ? `<tr><td colspan="8" class="table-empty">Este veículo não tem obras registadas.</td></tr>`
                : obras.map(o => `
                  <tr>
                    <td><strong>${o.numero_obra}</strong></td>
                    <td>${o.tipo_intervencao ? `<span class="badge ${INT_COR[o.tipo_intervencao]||'badge-gray'}">${o.tipo_intervencao}</span>` : '—'}</td>
                    <td class="td-trunc">${o.descricao_avaria || '—'}</td>
                    <td>${fmtData(o.data_abertura)}</td>
                    <td>${fmtData(o.data_fecho)}</td>
                    <td>${o.estado==='fechada' ? fmtEuro(o.custo_total) : '—'}</td>
                    <td>${badgeEstado(o.estado)}</td>
                    <td>
                      <button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">
                        ${icon('eye',14)}
                      </button>
                    </td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   13. MODAL — CRIAR OBRA
   ---------------------------------------------------------------- */

function modalCriarObra() {
  const veiculos = DB.getVeiculos().sort((a, b) => a.matricula.localeCompare(b.matricula));
  const hoje = new Date().toISOString().split('T')[0];

  openModal(
    'Nova Obra de Manutenção',
    `<form id="formCriarObra" onsubmit="return false;">
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Veículo *</label>
          <select class="form-control" id="nv_veiculo" required onchange="nv_preencherPat()">
            <option value="">— Selecionar veículo —</option>
            ${veiculos.map(v => `<option value="${v.id}" data-mat="${v.matricula}" data-pat="${v.patrimonio}">
              ${v.matricula} — ${v.marca} ${v.modelo} (${v.patrimonio})
            </option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nº de Património</label>
          <input type="text" class="form-control" id="nv_pat" readonly placeholder="Preenchido automaticamente">
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Data de Abertura *</label>
          <input type="date" class="form-control" id="nv_data" value="${hoje}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de Intervenção *</label>
          <select class="form-control" id="nv_tipo" required>
            <option value="">— Selecionar —</option>
            <option value="manutenção preventiva">Manutenção preventiva</option>
            <option value="reparação">Reparação</option>
            <option value="inspeção">Inspeção</option>
            <option value="revisão">Revisão</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição da Avaria / Intervenção *</label>
        <textarea class="form-control" id="nv_desc" rows="4" required placeholder="Descreva a avaria ou intervenção a realizar..."></textarea>
      </div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarObra()">${icon('save')} Criar Obra</button>`
  );
}

function modalCriarObraVeiculo(vid, mat, pat) {
  modalCriarObra();
  setTimeout(() => {
    const sel = document.getElementById('nv_veiculo');
    if (sel) { sel.value = vid; document.getElementById('nv_pat').value = pat; }
  }, 50);
}

function nv_preencherPat() {
  const sel = document.getElementById('nv_veiculo');
  const opt = sel.options[sel.selectedIndex];
  document.getElementById('nv_pat').value = opt.dataset.pat || '';
}

function criarObra() {
  const sel  = document.getElementById('nv_veiculo');
  const vid  = sel.value;
  if (!vid) { toastMsg('Seleccione um veículo', 'error'); return; }

  const opt  = sel.options[sel.selectedIndex];
  const mat  = opt.dataset.mat;
  const pat  = opt.dataset.pat;
  const data = document.getElementById('nv_data').value;
  const tipo = document.getElementById('nv_tipo').value;
  const desc = document.getElementById('nv_desc').value.trim();

  if (!data || !tipo || !desc) { toastMsg('Preencha todos os campos obrigatórios', 'error'); return; }

  const ano  = new Date(data).getFullYear();
  const num  = DB.proximoNumeroObra(ano);

  DB.criarObra({
    numero_obra: num, veiculo_id: vid, matricula: mat, patrimonio: pat,
    data_abertura: data, data_fecho: null, estado: 'aberta',
    descricao_avaria: desc, tipo_intervencao: tipo,
    trabalhos_realizados: '', pecas_materiais: '', servicos_externos: '',
    custo_mao_obra: 0, custo_servicos_externos: 0, custo_materiais: 0, custo_total: 0
  });

  closeModal();
  toastMsg(`Obra ${num} criada com sucesso!`, 'success');
  ir('obras');
}

/* ----------------------------------------------------------------
   14. MODAL — ACTUALIZAR OBRA
   ---------------------------------------------------------------- */

function modalActualizar(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada', 'error'); return; }

  openModal(
    `Actualizar Obra — ${o.numero_obra}`,
    `<form onsubmit="return false;">
      <div style="margin-bottom:14px;padding:12px;background:var(--secondary);border-radius:var(--radius-sm);font-size:13px;">
        <strong>${o.matricula}</strong> · ${o.patrimonio} · ${badgeEstado(o.estado)}
      </div>
      <div class="form-group">
        <label class="form-label">Trabalhos Realizados</label>
        <textarea class="form-control" id="ua_trabalhos" rows="3" placeholder="Descreva os trabalhos já realizados...">${o.trabalhos_realizados||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Peças e Materiais Utilizados</label>
        <textarea class="form-control" id="ua_pecas" rows="3" placeholder="Peças, quantidades e referências...">${o.pecas_materiais||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Serviços Externos</label>
        <textarea class="form-control" id="ua_servicos" rows="2" placeholder="Serviços contratados externamente...">${o.servicos_externos||''}</textarea>
      </div>
      <div class="section-divider"></div>
      <p class="form-label" style="margin-bottom:12px;">Custos (€)</p>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label class="form-label">Mão de Obra</label>
          <input type="number" class="form-control" id="ua_mao" step="0.01" min="0" value="${o.custo_mao_obra||0}">
        </div>
        <div class="form-group">
          <label class="form-label">Serviços Externos</label>
          <input type="number" class="form-control" id="ua_servext" step="0.01" min="0" value="${o.custo_servicos_externos||0}">
        </div>
        <div class="form-group">
          <label class="form-label">Materiais</label>
          <input type="number" class="form-control" id="ua_mat" step="0.01" min="0" value="${o.custo_materiais||0}">
        </div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-warning" onclick="actualizarObra('${id}')">${icon('save')} Guardar</button>`
  );
}

function actualizarObra(id) {
  DB.actualizarObra(id, {
    trabalhos_realizados:    document.getElementById('ua_trabalhos').value,
    pecas_materiais:         document.getElementById('ua_pecas').value,
    servicos_externos:       document.getElementById('ua_servicos').value,
    custo_mao_obra:          parseFloat(document.getElementById('ua_mao').value) || 0,
    custo_servicos_externos: parseFloat(document.getElementById('ua_servext').value) || 0,
    custo_materiais:         parseFloat(document.getElementById('ua_mat').value) || 0
  });
  closeModal();
  toastMsg('Obra actualizada com sucesso!', 'success');
  if (paginaAtual === 'obra-detalhe') renderObraDetalhe(id);
  else ir('obras');
}

/* ----------------------------------------------------------------
   15. MODAL — FECHAR OBRA
   ---------------------------------------------------------------- */

function modalFechar(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada', 'error'); return; }

  const mao  = parseFloat(o.custo_mao_obra) || 0;
  const serv = parseFloat(o.custo_servicos_externos) || 0;
  const mat  = parseFloat(o.custo_materiais) || 0;
  const hoje = new Date().toISOString().split('T')[0];

  openModal(
    `Fechar Obra — ${o.numero_obra}`,
    `<div style="margin-bottom:16px;padding:14px;background:var(--success-light);border:1px solid #6ee7b7;border-radius:var(--radius-sm);">
       <strong style="color:var(--success)">${icon('info',14)} Confirme os valores antes de fechar</strong>
       <p style="font-size:12.5px;color:var(--text-medium);margin-top:4px;">Após o fecho, a obra ficará marcada como concluída.</p>
     </div>
     <div style="margin-bottom:14px;padding:12px;background:var(--secondary);border-radius:var(--radius-sm);font-size:13px;">
       <strong>${o.matricula}</strong> · ${o.patrimonio} · ${o.numero_obra}
     </div>
     <div class="form-group">
       <label class="form-label">Data de Fecho *</label>
       <input type="date" class="form-control" id="fc_data" value="${hoje}" required>
     </div>
     <div class="section-divider"></div>
     <p class="form-label" style="margin-bottom:12px;">Revisão de Custos (€)</p>
     <div class="form-row form-row-3">
       <div class="form-group">
         <label class="form-label">Mão de Obra</label>
         <input type="number" class="form-control" id="fc_mao" step="0.01" min="0" value="${mao}" oninput="fc_recalc()">
       </div>
       <div class="form-group">
         <label class="form-label">Serviços Externos</label>
         <input type="number" class="form-control" id="fc_serv" step="0.01" min="0" value="${serv}" oninput="fc_recalc()">
       </div>
       <div class="form-group">
         <label class="form-label">Materiais</label>
         <input type="number" class="form-control" id="fc_mat" step="0.01" min="0" value="${mat}" oninput="fc_recalc()">
       </div>
     </div>
     <div class="custo-row total" style="padding:12px;background:#f0f7ff;border-radius:var(--radius-sm);border:2px solid var(--primary);">
       <span>CUSTO TOTAL DA OBRA</span>
       <strong id="fc_total" style="font-size:20px;">${fmtEuro(mao+serv+mat)}</strong>
     </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-success" onclick="fecharObra('${id}')">${icon('checkCircle')} Confirmar Fecho</button>`
  );
}

function fc_recalc() {
  const m = parseFloat(document.getElementById('fc_mao')?.value)  || 0;
  const s = parseFloat(document.getElementById('fc_serv')?.value) || 0;
  const t = parseFloat(document.getElementById('fc_mat')?.value)  || 0;
  const el = document.getElementById('fc_total');
  if (el) el.textContent = fmtEuro(m + s + t);
}

function fecharObra(id) {
  const data = document.getElementById('fc_data').value;
  if (!data) { toastMsg('Preencha a data de fecho', 'error'); return; }

  const mao  = parseFloat(document.getElementById('fc_mao').value)  || 0;
  const serv = parseFloat(document.getElementById('fc_serv').value) || 0;
  const mat  = parseFloat(document.getElementById('fc_mat').value)  || 0;

  DB.actualizarObra(id, {
    estado: 'fechada', data_fecho: data,
    custo_mao_obra: mao, custo_servicos_externos: serv,
    custo_materiais: mat, custo_total: mao + serv + mat
  });

  closeModal();
  toastMsg('Obra fechada com sucesso!', 'success');
  if (paginaAtual === 'obra-detalhe') renderObraDetalhe(id);
  else ir('obras');
}

/* ----------------------------------------------------------------
   16. IMPRESSÃO — Folha A4 profissional
   ---------------------------------------------------------------- */

function imprimirObra(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada', 'error'); return; }

  const mao  = parseFloat(o.custo_mao_obra) || 0;
  const serv = parseFloat(o.custo_servicos_externos) || 0;
  const mat  = parseFloat(o.custo_materiais) || 0;
  const tot  = o.estado === 'fechada' ? (parseFloat(o.custo_total) || 0) : mao + serv + mat;

  const agora = new Date().toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

  document.getElementById('printArea').innerHTML = `
    <style>
      @page{size:A4;margin:18mm 16mm;}
      *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
      body{font-size:11pt;color:#111;}
      .ph{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #1a4d8f;margin-bottom:18px;}
      .logo{width:52px;height:52px;background:#1a4d8f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border-radius:4px;flex-shrink:0;}
      .org h1{font-size:13pt;color:#1a4d8f;font-weight:800;}
      .org p{font-size:9pt;color:#666;margin-top:2px;}
      .doc-right{text-align:right;}
      .doc-right h2{font-size:15pt;font-weight:900;color:#1a4d8f;}
      .doc-right .num{font-size:12pt;color:#333;margin-top:3px;}
      .estado-box{display:inline-block;padding:3px 12px;border-radius:10px;font-size:9pt;font-weight:700;margin-top:5px;
        background:${o.estado==='fechada'?'#d4edda':'#fee2e2'};color:${o.estado==='fechada'?'#1e7e44':'#b91c1c'};}
      .ig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px;}
      .ii{border:1px solid #ddd;border-radius:4px;padding:10px;}
      .il{font-size:8pt;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
      .iv{font-size:11pt;font-weight:700;color:#1a4d8f;}
      .iv.n{font-size:10pt;color:#111;}
      .sec{margin-bottom:14px;}
      .st{font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#1a4d8f;border-bottom:1.5px solid #1a4d8f;padding-bottom:4px;margin-bottom:8px;}
      .sb{padding:10px;border:1px solid #e0e0e0;border-radius:4px;font-size:10pt;line-height:1.6;min-height:44px;background:#fafafa;white-space:pre-wrap;}
      .sb.empty{color:#aaa;font-style:italic;}
      .ct{width:100%;border-collapse:collapse;}
      .ct td{padding:7px 10px;border:1px solid #ddd;font-size:10pt;}
      .ct tr:last-child td{font-weight:800;background:#1a4d8f;color:#fff;font-size:11pt;}
      .ct td:last-child{text-align:right;}
      .assin{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;}
      .ab{border-top:1.5px solid #333;padding-top:6px;text-align:center;font-size:9pt;color:#555;}
      .footer{margin-top:20px;border-top:1px solid #ccc;padding-top:8px;display:flex;justify-content:space-between;font-size:8pt;color:#888;}
    </style>

    <div class="ph">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="logo">CM</div>
        <div class="org">
          <h1>Câmara Municipal</h1>
          <p>Serviço de Gestão de Frota e Manutenção</p>
          <p>GOM — Gestão de Obras de Manutenção</p>
        </div>
      </div>
      <div class="doc-right">
        <h2>Ordem de Trabalho</h2>
        <div class="num">${o.numero_obra}</div>
        <div class="estado-box">${o.estado==='fechada'?'✓ CONCLUÍDA':'⚙ EM ABERTO'}</div>
      </div>
    </div>

    <div class="ig">
      <div class="ii"><div class="il">Matrícula</div><div class="iv">${o.matricula}</div></div>
      <div class="ii"><div class="il">Nº de Património</div><div class="iv">${o.patrimonio}</div></div>
      <div class="ii"><div class="il">Data de Abertura</div><div class="iv n">${fmtData(o.data_abertura)}</div></div>
      <div class="ii"><div class="il">Tipo de Intervenção</div><div class="iv n">${o.tipo_intervencao||'—'}</div></div>
      <div class="ii"><div class="il">Data de Fecho</div><div class="iv n">${fmtData(o.data_fecho)}</div></div>
      <div class="ii"><div class="il">Estado</div><div class="iv n">${o.estado==='fechada'?'Concluída':'Em aberto'}</div></div>
    </div>

    <div class="sec">
      <div class="st">Descrição da Avaria / Intervenção</div>
      <div class="sb ${!o.descricao_avaria?'empty':''}">${o.descricao_avaria||'Sem descrição'}</div>
    </div>

    <div class="sec">
      <div class="st">Trabalhos Realizados</div>
      <div class="sb ${!o.trabalhos_realizados?'empty':''}">${o.trabalhos_realizados||'Não preenchido'}</div>
    </div>

    <div class="sec">
      <div class="st">Peças e Materiais Utilizados</div>
      <div class="sb ${!o.pecas_materiais?'empty':''}">${o.pecas_materiais||'Não preenchido'}</div>
    </div>

    <div class="sec">
      <div class="st">Serviços Externos</div>
      <div class="sb ${!o.servicos_externos?'empty':''}">${o.servicos_externos||'Não aplicável'}</div>
    </div>

    <div class="sec">
      <div class="st">Resumo de Custos</div>
      <table class="ct">
        <tr><td>Mão de obra interna</td><td>${fmtEuro(mao)}</td></tr>
        <tr><td>Serviços externos</td><td>${fmtEuro(serv)}</td></tr>
        <tr><td>Materiais / Peças</td><td>${fmtEuro(mat)}</td></tr>
        <tr><td>CUSTO TOTAL</td><td>${fmtEuro(tot)}</td></tr>
      </table>
    </div>

    <div class="assin">
      <div class="ab">Responsável pela Intervenção</div>
      <div class="ab">Chefe de Serviço / Responsável</div>
    </div>

    <div class="footer">
      <span>Impresso em ${agora}</span>
      <span>GOM — Gestão de Obras de Manutenção · Câmara Municipal</span>
      <span>Documento interno</span>
    </div>
  `;

  document.getElementById('printArea').style.display = 'block';
  window.print();
  setTimeout(() => {
    document.getElementById('printArea').style.display = 'none';
    document.getElementById('printArea').innerHTML = '';
  }, 1200);
}

/* ----------------------------------------------------------------
   17. HELPERS
   ---------------------------------------------------------------- */

function esc(s) {
  return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(s) {
  return (s || '').replace(/\n/g, '<br>');
}

/* ----------------------------------------------------------------
   18. EVENTOS GLOBAIS
   ---------------------------------------------------------------- */

// Fechar modal ao clicar no overlay
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('modalClose').addEventListener('click', closeModal);

// Menu toggle (mobile)
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Links de navegação
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    ir(link.dataset.page);
  });
});

/* ----------------------------------------------------------------
   19. ARRANQUE
   ---------------------------------------------------------------- */

DB.init();      // Inicializa localStorage com dados fictícios
ir('dashboard'); // Renderiza a página inicial
