/* ================================================================
   GOM — Gestão de Obras de Manutenção de Frota Municipal
   Versão 2.0 OFFLINE — localStorage, SVG icons, zero dependências
   ================================================================ */
'use strict';

/* ================================================================
   1. DADOS INICIAIS FICTÍCIOS
   ================================================================ */
const TIPOS_INT = [
  'Manutenção preventiva',
  'Reparação',
  'Inspeção',
  'Revisão geral',
  'Avaria elétrica',
  'Avaria hidráulica',
  'Avaria motor',
  'Substituição de pneus',
  'Carroçaria / Pintura',
  'Outro'
];

const SETORES = ['Setor A','Setor B','Setor C','Setor D'];

const DADOS_VEICULOS = [
  { id:'v001', matricula:'23-AB-45', patrimonio:'PAT-001', tipo:'ligeiro', marca:'Volkswagen',   modelo:'Caddy',         ano:2019, ativo:true, setor:'Setor A' },
  { id:'v002', matricula:'67-CD-89', patrimonio:'PAT-002', tipo:'ligeiro', marca:'Renault',       modelo:'Kangoo',        ano:2020, ativo:true, setor:'Setor A' },
  { id:'v003', matricula:'12-EF-34', patrimonio:'PAT-003', tipo:'pesado',  marca:'Mercedes-Benz', modelo:'Actros 2040',   ano:2018, ativo:true, setor:'Setor B' },
  { id:'v004', matricula:'56-GH-78', patrimonio:'PAT-004', tipo:'pesado',  marca:'Volvo',         modelo:'FH 460',        ano:2017, ativo:true, setor:'Setor B' },
  { id:'v005', matricula:'90-IJ-12', patrimonio:'PAT-005', tipo:'maquina', marca:'Caterpillar',   modelo:'420F2',         ano:2016, ativo:true, setor:'Setor C' },
  { id:'v006', matricula:'34-KL-56', patrimonio:'PAT-006', tipo:'maquina', marca:'JCB',           modelo:'3CX',           ano:2015, ativo:true, setor:'Setor C' },
  { id:'v007', matricula:'78-MN-90', patrimonio:'PAT-007', tipo:'ligeiro', marca:'Ford',          modelo:'Transit Custom',ano:2021, ativo:true, setor:'Setor A' },
  { id:'v008', matricula:'11-OP-22', patrimonio:'PAT-008', tipo:'pesado',  marca:'Scania',        modelo:'R 450',         ano:2019, ativo:true, setor:'Setor B' },
  { id:'v009', matricula:'33-QR-44', patrimonio:'PAT-009', tipo:'maquina', marca:'Komatsu',       modelo:'PC210',         ano:2014, ativo:true, setor:'Setor D' },
  { id:'v010', matricula:'55-ST-66', patrimonio:'PAT-010', tipo:'ligeiro', marca:'Peugeot',       modelo:'Partner',       ano:2022, ativo:true, setor:'Setor A' },
  { id:'v011', matricula:'77-UV-88', patrimonio:'PAT-011', tipo:'pesado',  marca:'MAN',           modelo:'TGS 26.440',    ano:2018, ativo:true, setor:'Setor B' },
  { id:'v012', matricula:'99-WX-00', patrimonio:'PAT-012', tipo:'maquina', marca:'Bobcat',        modelo:'S650',          ano:2020, ativo:true, setor:'Setor D' }
];

// Helper: ISO datetime com offset fixo para dados de exemplo
function iso(d,h='08:00') { return `${d}T${h}:00`; }

const DADOS_OBRAS = [
  {
    id:'o001', numero_obra:'OBR-2024-001', veiculo_id:'v001',
    matricula:'23-AB-45', patrimonio:'PAT-001',
    data_entrada: iso('2024-01-15','08:00'), data_saida: iso('2024-01-17','16:30'), estado:'fechada',
    tipos_intervencao:['Manutenção preventiva'],
    descricao_avaria:'Mudança de óleo e filtros programada. Veículo atingiu os 15.000 km.',
    trabalhos_realizados:'Substituição de óleo motor 5W-40. Filtro de óleo e ar. Verificação de fluidos.',
    pecas_materiais:'1x Óleo motor 5W-40 (5L) — 28,50€\n1x Filtro de óleo — 12,80€\n1x Filtro de ar — 18,90€',
    servicos_externos:'',
    custo_mao_obra:45, custo_servicos_externos:0, custo_materiais:60.20, custo_total:105.20
  },
  {
    id:'o002', numero_obra:'OBR-2024-002', veiculo_id:'v003',
    matricula:'12-EF-34', patrimonio:'PAT-003',
    data_entrada: iso('2024-02-05','09:30'), data_saida: iso('2024-02-12','17:00'), estado:'fechada',
    tipos_intervencao:['Reparação'],
    descricao_avaria:'Falha no sistema de travões. Pedal mole e ruído ao travar.',
    trabalhos_realizados:'Substituição de pastilhas e discos dianteiros. Purga do líquido de travões.',
    pecas_materiais:'2x Discos travão — 145,00€\n1x Pastilhas — 68,50€\n1x Líquido DOT4 — 9,80€',
    servicos_externos:'Alinhamento em oficina externa — 85,00€',
    custo_mao_obra:120, custo_servicos_externos:85, custo_materiais:223.30, custo_total:428.30
  },
  {
    id:'o003', numero_obra:'OBR-2024-003', veiculo_id:'v005',
    matricula:'90-IJ-12', patrimonio:'PAT-005',
    data_entrada: iso('2024-02-20','10:00'), data_saida: iso('2024-03-05','12:00'), estado:'fechada',
    tipos_intervencao:['Avaria hidráulica','Reparação'],
    descricao_avaria:'Perda de pressão na pá frontal. Fuga de óleo hidráulico na mangueira principal.',
    trabalhos_realizados:'Substituição de mangueira hidráulica. Troca de óleo hidráulico. Teste de pressão.',
    pecas_materiais:'1x Mangueira DN16 — 89,00€\n60L Óleo HV46 — 156,00€\nKit vedantes — 45,00€',
    servicos_externos:'Técnico especializado — 220,00€',
    custo_mao_obra:180, custo_servicos_externos:220, custo_materiais:290, custo_total:690
  },
  {
    id:'o004', numero_obra:'OBR-2024-004', veiculo_id:'v007',
    matricula:'78-MN-90', patrimonio:'PAT-007',
    data_entrada: iso('2024-03-10','08:00'), data_saida: iso('2024-03-11','15:30'), estado:'fechada',
    tipos_intervencao:['Substituição de pneus','Manutenção preventiva'],
    descricao_avaria:'Pneus dianteiros com desgaste excessivo, abaixo do limite legal.',
    trabalhos_realizados:'Substituição dos 2 pneus dianteiros. Equilibragem e balanceamento.',
    pecas_materiais:'2x Pneu 205/65R16C — 185,00€\nEquilibragem — 20,00€',
    servicos_externos:'',
    custo_mao_obra:30, custo_servicos_externos:0, custo_materiais:205, custo_total:235
  },
  {
    id:'o005', numero_obra:'OBR-2024-005', veiculo_id:'v004',
    matricula:'56-GH-78', patrimonio:'PAT-004',
    data_entrada: iso('2024-03-18','14:00'), data_saida: iso('2024-04-02','11:00'), estado:'fechada',
    tipos_intervencao:['Avaria motor','Reparação'],
    descricao_avaria:'Motor com perda de potência, fumo azul e consumo excessivo de óleo.',
    trabalhos_realizados:'Desmontagem e retificação do bloco. Substituição de segmentos e vedantes.',
    pecas_materiais:'Kit retificação — 820,00€\nJuntas — 145,00€\nÓleo 10W-40 — 89,00€',
    servicos_externos:'Retificação em oficina — 1.200,00€',
    custo_mao_obra:480, custo_servicos_externos:1200, custo_materiais:1054, custo_total:2734
  },
  {
    id:'o006', numero_obra:'OBR-2024-006', veiculo_id:'v002',
    matricula:'67-CD-89', patrimonio:'PAT-002',
    data_entrada: iso('2024-04-08','09:00'), data_saida: iso('2024-04-09','16:30'), estado:'fechada',
    tipos_intervencao:['Revisão geral'],
    descricao_avaria:'Revisão geral programada anual. Veículo com 20.000 km.',
    trabalhos_realizados:'Mudança de óleo e filtros. Filtro habitáculo. Verificação elétrica.',
    pecas_materiais:'Óleo + filtros — 75,00€\nFiltro habitáculo — 22,00€',
    servicos_externos:'',
    custo_mao_obra:90, custo_servicos_externos:0, custo_materiais:97, custo_total:187
  },
  {
    id:'o007', numero_obra:'OBR-2024-007', veiculo_id:'v006',
    matricula:'34-KL-56', patrimonio:'PAT-006',
    data_entrada: iso('2024-05-14','08:00'), data_saida: iso('2024-05-16','17:00'), estado:'fechada',
    tipos_intervencao:['Avaria elétrica','Reparação'],
    descricao_avaria:'Pá carregadora sem arranque. Bateria descarregada repetidamente.',
    trabalhos_realizados:'Diagnóstico elétrico. Substituição do alternador e bateria.',
    pecas_materiais:'1x Alternador — 340,00€\n1x Bateria 100Ah — 185,00€',
    servicos_externos:'',
    custo_mao_obra:95, custo_servicos_externos:0, custo_materiais:525, custo_total:620
  },
  {
    id:'o008', numero_obra:'OBR-2025-001', veiculo_id:'v008',
    matricula:'11-OP-22', patrimonio:'PAT-008',
    data_entrada: iso('2025-04-08','08:30'), data_saida: null, estado:'aberta',
    tipos_intervencao:['Inspeção'],
    descricao_avaria:'Inspeção periódica obrigatória. Prazo a vencer.',
    trabalhos_realizados:'Verificação de luzes. Verificação de travões.',
    pecas_materiais:'Lâmpadas — 15,00€',
    servicos_externos:'Inspeção técnica — 85,00€',
    custo_mao_obra:60, custo_servicos_externos:85, custo_materiais:15, custo_total:0
  },
  {
    id:'o009', numero_obra:'OBR-2025-002', veiculo_id:'v009',
    matricula:'33-QR-44', patrimonio:'PAT-009',
    data_entrada: iso('2025-04-09','10:00'), data_saida: null, estado:'aberta',
    tipos_intervencao:['Reparação','Avaria hidráulica'],
    descricao_avaria:'Lagartas com desgaste excessivo. Risco de paragem em obra.',
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  },
  {
    id:'o010', numero_obra:'OBR-2025-003', veiculo_id:'v010',
    matricula:'55-ST-66', patrimonio:'PAT-010',
    data_entrada: iso('2025-04-10','09:00'), data_saida: null, estado:'aberta',
    tipos_intervencao:['Manutenção preventiva'],
    descricao_avaria:'Mudança de óleo. Veículo atingiu os 10.000 km programados.',
    trabalhos_realizados:'Drenagem e substituição de óleo 5W-30. Filtro de óleo.',
    pecas_materiais:'Óleo 5W-30 + filtro — 52,00€',
    servicos_externos:'',
    custo_mao_obra:35, custo_servicos_externos:0, custo_materiais:52, custo_total:0
  },
  {
    id:'o011', numero_obra:'OBR-2025-004', veiculo_id:'v011',
    matricula:'77-UV-88', patrimonio:'PAT-011',
    data_entrada: iso('2025-04-11','14:00'), data_saida: null, estado:'aberta',
    tipos_intervencao:['Reparação','Avaria motor'],
    descricao_avaria:'Fuga de combustível. Veículo imobilizado por segurança.',
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  },
  {
    id:'o012', numero_obra:'OBR-2025-005', veiculo_id:'v012',
    matricula:'99-WX-00', patrimonio:'PAT-012',
    data_entrada: iso('2025-04-12','08:00'), data_saida: null, estado:'aberta',
    tipos_intervencao:['Manutenção preventiva','Avaria hidráulica'],
    descricao_avaria:'Manutenção preventiva semestral. Fluidos e filtros.',
    trabalhos_realizados:'Óleo hidráulico trocado. Filtro hidráulico substituído.',
    pecas_materiais:'Óleo hidráulico + filtro — 78,00€',
    servicos_externos:'',
    custo_mao_obra:50, custo_servicos_externos:0, custo_materiais:78, custo_total:0
  }
];

/* ================================================================
   2. CAMADA DB — localStorage
   ================================================================ */
const DB = {
  KEY_V:'gom_veiculos', KEY_O:'gom_obras', KEY_VER:'gom_version',
  VERSION: '2.0',
  init() {
    // Se versão diferente, reinicia dados para o novo modelo
    const vAtual = localStorage.getItem(this.KEY_VER);
    if (vAtual !== this.VERSION) {
      localStorage.setItem(this.KEY_V, JSON.stringify(DADOS_VEICULOS));
      localStorage.setItem(this.KEY_O, JSON.stringify(DADOS_OBRAS));
      localStorage.setItem(this.KEY_VER, this.VERSION);
      return;
    }
    if (!localStorage.getItem(this.KEY_V)) localStorage.setItem(this.KEY_V, JSON.stringify(DADOS_VEICULOS));
    if (!localStorage.getItem(this.KEY_O)) localStorage.setItem(this.KEY_O, JSON.stringify(DADOS_OBRAS));
  },
  getVeiculos()  { return JSON.parse(localStorage.getItem(this.KEY_V)||'[]'); },
  getVeiculo(id) { return this.getVeiculos().find(v=>v.id===id)||null; },
  getObras()     { return JSON.parse(localStorage.getItem(this.KEY_O)||'[]'); },
  getObra(id)    { return this.getObras().find(o=>o.id===id)||null; },
  saveObras(l)   { localStorage.setItem(this.KEY_O, JSON.stringify(l)); },
  criarObra(d)   {
    const obras = this.getObras();
    const nova = { id:'o'+Date.now(), ...d };
    obras.push(nova); this.saveObras(obras); return nova;
  },
  actualizarObra(id, campos) {
    const obras = this.getObras();
    const i = obras.findIndex(o=>o.id===id);
    if (i===-1) return null;
    obras[i] = {...obras[i], ...campos};
    this.saveObras(obras); return obras[i];
  },
  proximoNumeroObra(ano) {
    const n = this.getObras().filter(o=>o.numero_obra&&o.numero_obra.startsWith(`OBR-${ano}-`)).length;
    return `OBR-${ano}-${String(n+1).padStart(3,'0')}`;
  }
};

/* ================================================================
   3. UTILITÁRIOS
   ================================================================ */
function fmtData(s) {
  if (!s) return '—';
  const d = new Date(s.length===10 ? s+'T00:00:00' : s);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function fmtDataHora(s) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function fmtEuro(v) {
  return (parseFloat(v)||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
}
// Calcula duração entre duas datas/agora. Retorna string legível.
function calcDuracao(entrada, saida) {
  if (!entrada) return '—';
  const ini = new Date(entrada);
  const fim = saida ? new Date(saida) : new Date();
  const min = Math.round((fim - ini) / 60000);
  if (isNaN(min) || min < 0) return '—';
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  let r = '';
  if (d > 0) r += `${d}d `;
  if (h > 0 || d > 0) r += `${h}h `;
  r += `${String(m).padStart(2,'0')}m`;
  return r.trim();
}
function calcMinutos(entrada, saida) {
  if (!entrada) return 0;
  const ini = new Date(entrada);
  const fim = saida ? new Date(saida) : new Date();
  return Math.max(0, Math.round((fim - ini) / 60000));
}
function toastMsg(msg, tipo='') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast show ${tipo}`;
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.className='toast'; }, 3000);
}
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nl2br(s) { return (s||'').replace(/\n/g,'<br>'); }
function tiposArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v]; // retrocompatibilidade com campo string antigo
}
function tiposStr(v) { return tiposArray(v).join(', ') || '—'; }
function getMesAtual() { const n=new Date(); return {ano:n.getFullYear(), mes:n.getMonth()}; }

/* ================================================================
   4. CONSTANTES DE INTERFACE
   ================================================================ */
const TIPO_LABEL = { ligeiro:'Ligeiro', pesado:'Pesado', maquina:'Máquina' };
const INT_COR = {
  'Manutenção preventiva':'badge-blue',
  'Reparação':'badge-red',
  'Inspeção':'badge-yellow',
  'Revisão geral':'badge-green',
  'Avaria elétrica':'badge-purple',
  'Avaria hidráulica':'badge-orange',
  'Avaria motor':'badge-dark-red',
  'Substituição de pneus':'badge-teal',
  'Carroçaria / Pintura':'badge-gray',
  'Outro':'badge-gray'
};

const ICONS = {
  dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  truck:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-7l2-5h14l2 5v7h-2"/><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  wrench:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  chart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  print:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  save:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  euro:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M4 14h12M19.5 16.5A7.5 7.5 0 1 1 19.5 7.5"/></svg>`,
  car:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-7l2-5h14l2 5v7h-2"/><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  tractor:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/><path d="M3 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M7 20V7l5-4h6v8h2v5h-2a3 3 0 0 0-6 0H7z"/><path d="M12 3v8"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  checkCircle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  tools:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  history:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  timer:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><path d="M9 2h6"/><path d="M12 2v3"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  refresh:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`
};
function icon(name, size=16) {
  return `<span class="svg-icon" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;vertical-align:middle;">${ICONS[name]||''}</span>`;
}

/* ================================================================
   5. MODAL
   ================================================================ */
function openModal(titulo, corpo, rodape='', grande=false) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML = corpo;
  document.getElementById('modalFooter').innerHTML = rodape;
  const box = document.getElementById('modalBox');
  box.style.maxWidth = grande ? '860px' : '700px';
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

/* ================================================================
   6. ROTEADOR
   ================================================================ */
let paginaAtual = 'dashboard';
let _relTimers = [];

function ir(pagina, params={}) {
  // parar timers de tempo real anteriores
  _relTimers.forEach(t=>clearInterval(t));
  _relTimers = [];

  paginaAtual = pagina;
  document.getElementById('sidebar').classList.remove('open');
  document.querySelectorAll('.nav-link').forEach(l=>{
    l.classList.toggle('active', l.dataset.page===pagina);
  });
  const titulos = {
    dashboard:'Dashboard', veiculos:'Veículos', obras:'Obras',
    relatorios:'Relatórios', 'obra-detalhe':'Detalhe da Obra',
    'veiculo-historico':'Histórico do Veículo'
  };
  document.getElementById('pageTitle').textContent = titulos[pagina]||pagina;
  document.getElementById('topbarActions').innerHTML = '';
  switch(pagina) {
    case 'dashboard':          renderDashboard();           break;
    case 'veiculos':           renderVeiculos();            break;
    case 'obras':              renderObras();               break;
    case 'relatorios':         renderRelatorios();          break;
    case 'obra-detalhe':       renderObraDetalhe(params.id);break;
    case 'veiculo-historico':  renderVeiculoHistorico(params.id); break;
    default: document.getElementById('pageContainer').innerHTML='<p>Página não encontrada.</p>';
  }
}

/* ================================================================
   7. BADGES E HELPERS DE RENDER
   ================================================================ */
function badgeEstado(estado) {
  if (estado==='aberta')  return `<span class="badge badge-red">${icon('tools',11)} Aberta</span>`;
  if (estado==='fechada') return `<span class="badge badge-green">${icon('check',11)} Fechada</span>`;
  return `<span class="badge badge-gray">${estado}</span>`;
}
function badgeTipos(tipos) {
  return tiposArray(tipos).map(t=>`<span class="badge ${INT_COR[t]||'badge-gray'}" style="margin:1px 2px 1px 0">${t}</span>`).join('');
}
function iconVeiculo(tipo, size=22) {
  if (tipo==='pesado')  return icon('truck',size);
  if (tipo==='maquina') return icon('tractor',size);
  return icon('car',size);
}

/* ================================================================
   8. CHECKBOXES DE TIPO DE INTERVENÇÃO (reutilizável)
   ================================================================ */
function htmlCheckboxesTipos(selecionados=[], prefixo='ti') {
  return `<div class="checkbox-grid">
    ${TIPOS_INT.map(t=>`
      <label class="checkbox-label">
        <input type="checkbox" class="${prefixo}-check" value="${t}" ${tiposArray(selecionados).includes(t)?'checked':''}>
        <span class="badge ${INT_COR[t]||'badge-gray'}" style="pointer-events:none">${t}</span>
      </label>`).join('')}
  </div>`;
}
function lerCheckboxesTipos(prefixo='ti') {
  return [...document.querySelectorAll(`.${prefixo}-check:checked`)].map(c=>c.value);
}

/* ================================================================
   9. DASHBOARD
   ================================================================ */
function renderDashboard() {
  const obras   = DB.getObras();
  const abertas = obras.filter(o=>o.estado==='aberta');
  const fechadas= obras.filter(o=>o.estado==='fechada');
  const custoTot= fechadas.reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);
  const recentes= [...obras].sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada)).slice(0,6);

  // Imobilização total ativa (em horas)
  const horasImob = abertas.reduce((s,o)=>s+calcMinutos(o.data_entrada,null)/60,0);

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div><h2>Dashboard</h2><p>Resumo geral do sistema de gestão de obras</p></div>
      <button class="btn btn-primary" onclick="modalCriarObra()">${icon('plus')} Nova Obra</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">${icon('list',22)}</div>
        <div class="stat-info"><div class="stat-value">${obras.length}</div><div class="stat-label">Total de Obras</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">${icon('tools',22)}</div>
        <div class="stat-info"><div class="stat-value">${abertas.length}</div><div class="stat-label">Obras Abertas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">${icon('checkCircle',22)}</div>
        <div class="stat-info"><div class="stat-value">${fechadas.length}</div><div class="stat-label">Obras Fechadas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">${icon('euro',22)}</div>
        <div class="stat-info"><div class="stat-value" style="font-size:17px">${fmtEuro(custoTot)}</div><div class="stat-label">Custo Total (fechadas)</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">${icon('timer',22)}</div>
        <div class="stat-info"><div class="stat-value">${Math.round(horasImob)}h</div><div class="stat-label">Imob. Total Ativa</div></div>
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
            <thead><tr><th>Nº Obra</th><th>Viatura</th><th>Tipo(s)</th><th>Imobilização</th><th></th></tr></thead>
            <tbody>
              ${abertas.length===0
                ?`<tr><td colspan="5" class="table-empty">Sem obras abertas</td></tr>`
                :abertas.slice(0,5).map(o=>`
                  <tr>
                    <td><strong>${o.numero_obra}</strong></td>
                    <td><div style="font-weight:600">${o.matricula}</div><div style="font-size:11px;color:var(--text-medium)">${o.patrimonio}</div></td>
                    <td>${badgeTipos(o.tipos_intervencao)}</td>
                    <td><span class="imob-live badge badge-orange" data-entrada="${o.data_entrada||''}">${calcDuracao(o.data_entrada,null)}</span></td>
                    <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button></td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">${icon('history',15)} Obras Recentes</span></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Nº Obra</th><th>Matrícula</th><th>Estado</th><th>Entrada</th><th></th></tr></thead>
            <tbody>
              ${recentes.map(o=>`
                <tr>
                  <td><strong>${o.numero_obra}</strong></td>
                  <td>${o.matricula}</td>
                  <td>${badgeEstado(o.estado)}</td>
                  <td>${fmtDataHora(o.data_entrada)}</td>
                  <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  iniciarTimersImob();
}

// Atualiza os contadores de imobilização em tempo real
function iniciarTimersImob() {
  const els = document.querySelectorAll('.imob-live');
  if (!els.length) return;
  const t = setInterval(()=>{
    els.forEach(el=>{
      const entrada = el.dataset.entrada;
      if (entrada) el.textContent = calcDuracao(entrada, null);
    });
  }, 30000); // atualiza a cada 30s
  _relTimers.push(t);
}

/* ================================================================
   10. VEÍCULOS
   ================================================================ */
function renderVeiculos() {
  const veiculos = DB.getVeiculos();
  window._veiculos = veiculos;
  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div><h2>Frota Municipal</h2><p>${veiculos.length} veículos/máquinas registados</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input type="text" class="form-control" placeholder="Pesquisar..." id="searchVeiculo" oninput="filtrarVeiculos()" style="max-width:180px;">
        <select class="form-control" id="filtroTipoV" onchange="filtrarVeiculos()" style="max-width:140px;">
          <option value="">Todos os tipos</option>
          <option>Ligeiro</option><option>Pesado</option><option>Máquina</option>
        </select>
        <select class="form-control" id="filtroSetorV" onchange="filtrarVeiculos()" style="max-width:130px;">
          <option value="">Todos os setores</option>
          ${SETORES.map(s=>`<option>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="veiculos-grid" id="veiculosGrid">${renderVeiculoCards(veiculos)}</div>`;
}

function renderVeiculoCards(lista) {
  if (!lista.length) return '<p style="color:var(--text-light);grid-column:1/-1;padding:40px;text-align:center">Nenhum veículo encontrado.</p>';
  return lista.map(v=>{
    const obras = DB.getObras().filter(o=>o.veiculo_id===v.id||o.matricula===v.matricula);
    const abertas = obras.filter(o=>o.estado==='aberta').length;
    return `
      <div class="veiculo-card" onclick="ir('veiculo-historico',{id:'${v.id}'})">
        <div class="veiculo-icon">${iconVeiculo(v.tipo)}</div>
        <div class="veiculo-info">
          <h4>${v.marca} ${v.modelo}</h4>
          <p>${TIPO_LABEL[v.tipo]||v.tipo} · ${v.ano} · <span style="font-weight:600;color:var(--primary)">${v.setor||'—'}</span></p>
          <span class="matricula">${v.matricula}</span>
          <div style="margin-top:4px;font-size:11.5px;color:var(--text-light)">${v.patrimonio}</div>
          ${abertas>0?`<div style="margin-top:5px;"><span class="badge badge-red" style="font-size:10.5px;">${abertas} obra${abertas>1?'s':''} aberta${abertas>1?'s':''}</span></div>`:''}
        </div>
      </div>`;
  }).join('');
}

function filtrarVeiculos() {
  const q = (document.getElementById('searchVeiculo')?.value||'').toLowerCase();
  const t = (document.getElementById('filtroTipoV')?.value||'').toLowerCase();
  const s = document.getElementById('filtroSetorV')?.value||'';
  const lista = (window._veiculos||[]).filter(v=>{
    const match = !q||`${v.marca} ${v.modelo} ${v.matricula} ${v.patrimonio}`.toLowerCase().includes(q);
    const tipo  = !t||TIPO_LABEL[v.tipo].toLowerCase()===t;
    const setor = !s||v.setor===s;
    return match&&tipo&&setor;
  });
  document.getElementById('veiculosGrid').innerHTML = renderVeiculoCards(lista);
}

/* ================================================================
   11. OBRAS — LISTA
   ================================================================ */
function renderObras() {
  const obras = [...DB.getObras()].sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
  window._obras = obras;
  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-primary" onclick="modalCriarObra()">${icon('plus')} Nova Obra</button>`;
  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div><h2>Gestão de Obras</h2><p>${obras.length} obras registadas</p></div>
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
        ${TIPOS_INT.map(t=>`<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Nº Obra</th><th>Matrícula</th><th>Pat.</th><th>Tipo(s) Intervenção</th>
                <th>Entrada</th><th>Imob.</th><th>Custo</th><th>Estado</th><th>Ações</th></tr>
          </thead>
          <tbody id="obrasBody">${rowsObras(obras)}</tbody>
        </table>
      </div>
    </div>`;
  iniciarTimersImob();
}

function rowsObras(lista) {
  if (!lista.length) return `<tr><td colspan="9" class="table-empty">Nenhuma obra encontrada.</td></tr>`;
  return lista.map(o=>`
    <tr>
      <td><strong>${o.numero_obra}</strong></td>
      <td>${o.matricula}</td>
      <td>${o.patrimonio}</td>
      <td>${badgeTipos(o.tipos_intervencao)}</td>
      <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
      <td><span class="${o.estado==='aberta'?'imob-live badge badge-orange':'badge badge-gray'}" data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">
        ${calcDuracao(o.data_entrada, o.data_saida)}
      </span></td>
      <td>${o.estado==='fechada'?fmtEuro(o.custo_total):'<span style="color:var(--text-light)">—</span>'}</td>
      <td>${badgeEstado(o.estado)}</td>
      <td>
        <div style="display:flex;gap:3px;">
          <button class="btn btn-sm btn-outline btn-icon" title="Ver" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button>
          <button class="btn btn-sm btn-secondary btn-icon" title="Imprimir" onclick="imprimirObra('${o.id}')">${icon('print',14)}</button>
          ${o.estado==='aberta'?`
          <button class="btn btn-sm btn-warning btn-icon" title="Actualizar" onclick="modalActualizar('${o.id}')">${icon('edit',14)}</button>
          <button class="btn btn-sm btn-success btn-icon" title="Fechar" onclick="modalFechar('${o.id}')">${icon('check',14)}</button>`:''}
        </div>
      </td>
    </tr>`).join('');
}

function filtrarObras() {
  const q  = (document.getElementById('searchObra')?.value||'').toLowerCase();
  const es = document.getElementById('filtroEstado')?.value||'';
  const ti = document.getElementById('filtroInt')?.value||'';
  const lista = (window._obras||[]).filter(o=>{
    const match = !q||`${o.numero_obra} ${o.matricula} ${o.patrimonio} ${o.descricao_avaria}`.toLowerCase().includes(q);
    const tipok = !ti||tiposArray(o.tipos_intervencao).includes(ti);
    return match&&(!es||o.estado===es)&&tipok;
  });
  document.getElementById('obrasBody').innerHTML = rowsObras(lista);
}

/* ================================================================
   12. DETALHE DA OBRA
   ================================================================ */
function renderObraDetalhe(id) {
  const o = DB.getObra(id);
  if (!o) { document.getElementById('pageContainer').innerHTML='<p style="color:var(--danger)">Obra não encontrada.</p>'; return; }
  const mao=parseFloat(o.custo_mao_obra)||0, serv=parseFloat(o.custo_servicos_externos)||0, mat=parseFloat(o.custo_materiais)||0;
  const tot = o.estado==='fechada'?(parseFloat(o.custo_total)||0):mao+serv+mat;

  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="ir('obras')">${icon('back')} Voltar</button>
    <button class="btn btn-outline btn-sm" onclick="imprimirObra('${o.id}')">${icon('print')} Imprimir</button>
    ${o.estado==='aberta'?`
    <button class="btn btn-warning btn-sm" onclick="modalActualizar('${o.id}')">${icon('edit')} Actualizar</button>
    <button class="btn btn-success btn-sm" onclick="modalFechar('${o.id}')">${icon('check')} Fechar Obra</button>`:''}`;

  document.getElementById('pageContainer').innerHTML = `
    <div style="max-width:860px;margin:0 auto;">
      <div class="card" style="margin-bottom:16px;">
        <div style="padding:20px;background:linear-gradient(135deg,var(--primary-dark),var(--primary));border-radius:var(--radius) var(--radius) 0 0;color:#fff;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:22px;font-weight:800;">${o.numero_obra}</div>
              <div style="opacity:.8;font-size:13px;margin-top:3px;">${fmtDataHora(o.data_entrada)}</div>
            </div>
            <div style="text-align:right;">${badgeEstado(o.estado)}</div>
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
              <div class="detail-label">Entrada da Viatura</div>
              <div class="detail-value">${fmtDataHora(o.data_entrada)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Saída da Viatura</div>
              <div class="detail-value">${o.data_saida?fmtDataHora(o.data_saida):'<span style="color:var(--text-light)">— (em intervenção)</span>'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tempo de Imobilização</div>
              <div class="detail-value">
                <span class="${o.estado==='aberta'?'imob-live badge badge-orange':'badge badge-gray'}" data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">
                  ${icon('timer',13)} ${calcDuracao(o.data_entrada,o.data_saida)}
                </span>
              </div>
            </div>
            <div class="detail-item" style="grid-column:span 1">
              <div class="detail-label">Estado</div>
              <div class="detail-value">${badgeEstado(o.estado)}</div>
            </div>
          </div>
          <div class="form-group">
            <div class="detail-label">Tipos de Intervenção</div>
            <div style="margin-top:6px;">${badgeTipos(o.tipos_intervencao)||'—'}</div>
          </div>
          <div class="section-divider"></div>
          <div class="form-group">
            <div class="detail-label">Descrição da Avaria / Intervenção</div>
            <div class="text-block">${o.descricao_avaria||'<em style="color:var(--text-light)">Sem descrição</em>'}</div>
          </div>
          ${o.trabalhos_realizados?`<div class="form-group"><div class="detail-label">Trabalhos Realizados</div><div class="text-block">${nl2br(o.trabalhos_realizados)}</div></div>`:''}
          ${o.pecas_materiais?`<div class="form-group"><div class="detail-label">Peças e Materiais</div><div class="text-block">${nl2br(o.pecas_materiais)}</div></div>`:''}
          ${o.servicos_externos?`<div class="form-group"><div class="detail-label">Serviços Externos</div><div class="text-block">${nl2br(o.servicos_externos)}</div></div>`:''}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">${icon('euro',15)} Resumo de Custos</span></div>
        <div class="card-body">
          <div class="custo-row"><span>Mão de obra interna</span><strong>${fmtEuro(mao)}</strong></div>
          <div class="custo-row"><span>Serviços externos</span><strong>${fmtEuro(serv)}</strong></div>
          <div class="custo-row"><span>Materiais / Peças</span><strong>${fmtEuro(mat)}</strong></div>
          <div class="custo-row total"><span>TOTAL</span><strong>${fmtEuro(tot)}</strong></div>
        </div>
      </div>
    </div>`;
  if (o.estado==='aberta') iniciarTimersImob();
}

/* ================================================================
   13. HISTÓRICO DO VEÍCULO
   ================================================================ */
function renderVeiculoHistorico(id) {
  const v = DB.getVeiculo(id);
  if (!v) { document.getElementById('pageContainer').innerHTML='<p style="color:var(--danger)">Veículo não encontrado.</p>'; return; }
  const obras = DB.getObras().filter(o=>o.veiculo_id===id||o.matricula===v.matricula)
    .sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
  const abertas=obras.filter(o=>o.estado==='aberta').length;
  const fechadas=obras.filter(o=>o.estado==='fechada').length;
  const custoAc=obras.filter(o=>o.estado==='fechada').reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);
  const tipos={};
  obras.forEach(o=>tiposArray(o.tipos_intervencao).forEach(t=>{tipos[t]=(tipos[t]||0)+1;}));

  document.getElementById('topbarActions').innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="ir('veiculos')">${icon('back')} Voltar</button>
    <button class="btn btn-primary btn-sm" onclick="modalCriarObraVeiculo('${v.id}','${v.matricula}','${v.patrimonio}')">${icon('plus')} Nova Obra</button>`;

  document.getElementById('pageContainer').innerHTML = `
    <div style="max-width:900px;margin:0 auto;">
      <div class="card" style="margin-bottom:20px;">
        <div class="historico-header">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:56px;height:56px;background:rgba(255,255,255,.15);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:#fff;">${iconVeiculo(v.tipo,26)}</div>
            <div><h3>${v.marca} ${v.modelo}</h3><p>${TIPO_LABEL[v.tipo]||v.tipo} · Ano ${v.ano} · ${v.setor||'—'}</p></div>
            <div style="margin-left:auto;text-align:right;"><div style="font-size:22px;font-weight:800;color:#fff">${v.matricula}</div><div style="opacity:.8;font-size:13px;">${v.patrimonio}</div></div>
          </div>
        </div>
        <div class="card-body">
          <div class="stats-grid" style="margin-bottom:0">
            <div class="stat-card"><div class="stat-icon blue">${icon('list',22)}</div><div class="stat-info"><div class="stat-value">${obras.length}</div><div class="stat-label">Total de Obras</div></div></div>
            <div class="stat-card"><div class="stat-icon red">${icon('tools',22)}</div><div class="stat-info"><div class="stat-value">${abertas}</div><div class="stat-label">Em Aberto</div></div></div>
            <div class="stat-card"><div class="stat-icon green">${icon('checkCircle',22)}</div><div class="stat-info"><div class="stat-value">${fechadas}</div><div class="stat-label">Concluídas</div></div></div>
            <div class="stat-card"><div class="stat-icon yellow">${icon('euro',22)}</div><div class="stat-info"><div class="stat-value" style="font-size:16px">${fmtEuro(custoAc)}</div><div class="stat-label">Custo Acumulado</div></div></div>
          </div>
        </div>
      </div>
      ${Object.keys(tipos).length?`
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header"><span class="card-title">Tipos de Intervenção</span></div>
        <div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap;">
          ${Object.entries(tipos).map(([t,n])=>`
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--border);border-radius:var(--radius);background:#f8fafc;">
              <span class="badge ${INT_COR[t]||'badge-gray'}">${t}</span>
              <span style="font-weight:700;font-size:15px;">${n}</span>
            </div>`).join('')}
        </div>
      </div>`:''}
      <div class="card">
        <div class="card-header"><span class="card-title">Histórico de Obras</span></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Nº Obra</th><th>Tipo(s)</th><th>Entrada</th><th>Saída</th><th>Imob.</th><th>Custo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${obras.length===0?`<tr><td colspan="8" class="table-empty">Sem obras registadas.</td></tr>`
                :obras.map(o=>`<tr>
                  <td><strong>${o.numero_obra}</strong></td>
                  <td>${badgeTipos(o.tipos_intervencao)}</td>
                  <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
                  <td style="white-space:nowrap">${fmtDataHora(o.data_saida)}</td>
                  <td><span class="badge badge-gray">${calcDuracao(o.data_entrada,o.data_saida)}</span></td>
                  <td>${o.estado==='fechada'?fmtEuro(o.custo_total):'—'}</td>
                  <td>${badgeEstado(o.estado)}</td>
                  <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* ================================================================
   14. MODAL — CRIAR OBRA
   ================================================================ */
function htmlFormObra(v, mat, pat, presel=[]) {
  const veiculos = DB.getVeiculos().sort((a,b)=>a.matricula.localeCompare(b.matricula));
  const agora = new Date();
  const localISO = d => {
    const pad = n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return `<form id="formCriarObra" onsubmit="return false;">
    <div class="form-row form-row-2">
      <div class="form-group">
        <label class="form-label">Veículo *</label>
        <select class="form-control" id="nv_veiculo" required onchange="nv_preencherPat()">
          <option value="">— Selecionar veículo —</option>
          ${veiculos.map(vv=>`<option value="${vv.id}" data-mat="${vv.matricula}" data-pat="${vv.patrimonio}" ${vv.id===v?'selected':''}>
            ${vv.matricula} — ${vv.marca} ${vv.modelo} (${vv.patrimonio})
          </option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nº de Património</label>
        <input type="text" class="form-control" id="nv_pat" readonly value="${pat||''}" placeholder="Preenchido automaticamente">
      </div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group">
        <label class="form-label">${icon('calendar',12)} Data/Hora de Entrada *</label>
        <input type="datetime-local" class="form-control" id="nv_entrada" value="${localISO(agora)}" required>
        <div class="form-hint">Data e hora de entrada da viatura na oficina</div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('calendar',12)} Data/Hora de Saída</label>
        <input type="datetime-local" class="form-control" id="nv_saida" value="">
        <div class="form-hint">Opcional — preencher quando a viatura sair</div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Tipos de Intervenção * <span style="font-size:11px;color:var(--text-light);text-transform:none;font-weight:400">(seleção múltipla)</span></label>
      ${htmlCheckboxesTipos(presel,'nv')}
    </div>
    <div class="form-group">
      <label class="form-label">Descrição da Avaria / Intervenção *</label>
      <textarea class="form-control" id="nv_desc" rows="3" required placeholder="Descreva a avaria ou intervenção a realizar..."></textarea>
    </div>
  </form>`;
}

function modalCriarObra() {
  openModal('Nova Obra de Manutenção', htmlFormObra('','',''),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarObra()">${icon('save')} Criar Obra</button>`);
}

function modalCriarObraVeiculo(vid, mat, pat) {
  openModal('Nova Obra de Manutenção', htmlFormObra(vid, mat, pat),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarObra()">${icon('save')} Criar Obra</button>`);
}

function nv_preencherPat() {
  const sel = document.getElementById('nv_veiculo');
  const opt = sel.options[sel.selectedIndex];
  document.getElementById('nv_pat').value = opt.dataset.pat||'';
}

function criarObra() {
  const sel  = document.getElementById('nv_veiculo');
  const vid  = sel.value;
  if (!vid) { toastMsg('Seleccione um veículo','error'); return; }
  const opt   = sel.options[sel.selectedIndex];
  const mat   = opt.dataset.mat;
  const pat   = opt.dataset.pat;
  const entrada = document.getElementById('nv_entrada').value;
  const saida   = document.getElementById('nv_saida').value||null;
  const tipos   = lerCheckboxesTipos('nv');
  const desc    = document.getElementById('nv_desc').value.trim();
  if (!entrada) { toastMsg('Preencha a data/hora de entrada','error'); return; }
  if (!tipos.length) { toastMsg('Seleccione pelo menos um tipo de intervenção','error'); return; }
  if (!desc) { toastMsg('Preencha a descrição','error'); return; }
  const ano = new Date(entrada).getFullYear();
  const num = DB.proximoNumeroObra(ano);
  DB.criarObra({
    numero_obra:num, veiculo_id:vid, matricula:mat, patrimonio:pat,
    data_entrada:entrada, data_saida:saida, estado:'aberta',
    tipos_intervencao:tipos, descricao_avaria:desc,
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  });
  closeModal();
  toastMsg(`Obra ${num} criada com sucesso!`,'success');
  ir('obras');
}

/* ================================================================
   15. MODAL — ACTUALIZAR OBRA
   ================================================================ */
function modalActualizar(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada','error'); return; }
  const saida = o.data_saida ? o.data_saida.slice(0,16) : '';
  const entrada = o.data_entrada ? o.data_entrada.slice(0,16) : '';
  openModal(`Actualizar Obra — ${o.numero_obra}`, `
    <form onsubmit="return false;">
      <div style="margin-bottom:14px;padding:12px;background:var(--secondary);border-radius:var(--radius-sm);font-size:13px;">
        <strong>${o.matricula}</strong> · ${o.patrimonio} · ${badgeEstado(o.estado)}
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">${icon('calendar',12)} Data/Hora de Entrada</label>
          <input type="datetime-local" class="form-control" id="ua_entrada" value="${entrada}">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('calendar',12)} Data/Hora de Saída</label>
          <input type="datetime-local" class="form-control" id="ua_saida" value="${saida}">
          <div class="form-hint">Preencher quando a viatura sair</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipos de Intervenção <span style="font-size:11px;color:var(--text-light);text-transform:none;font-weight:400">(seleção múltipla)</span></label>
        ${htmlCheckboxesTipos(o.tipos_intervencao,'ua')}
      </div>
      <div class="form-group">
        <label class="form-label">Trabalhos Realizados</label>
        <textarea class="form-control" id="ua_trabalhos" rows="3">${o.trabalhos_realizados||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Peças e Materiais</label>
        <textarea class="form-control" id="ua_pecas" rows="3">${o.pecas_materiais||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Serviços Externos</label>
        <textarea class="form-control" id="ua_servicos" rows="2">${o.servicos_externos||''}</textarea>
      </div>
      <div class="section-divider"></div>
      <p class="form-label" style="margin-bottom:12px;">Custos (€)</p>
      <div class="form-row form-row-3">
        <div class="form-group"><label class="form-label">Mão de Obra</label>
          <input type="number" class="form-control" id="ua_mao" step="0.01" min="0" value="${o.custo_mao_obra||0}"></div>
        <div class="form-group"><label class="form-label">Serviços Ext.</label>
          <input type="number" class="form-control" id="ua_servext" step="0.01" min="0" value="${o.custo_servicos_externos||0}"></div>
        <div class="form-group"><label class="form-label">Materiais</label>
          <input type="number" class="form-control" id="ua_mat" step="0.01" min="0" value="${o.custo_materiais||0}"></div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-warning" onclick="actualizarObra('${id}')">${icon('save')} Guardar</button>`);
}

function actualizarObra(id) {
  const tipos = lerCheckboxesTipos('ua');
  DB.actualizarObra(id, {
    data_entrada:   document.getElementById('ua_entrada').value||null,
    data_saida:     document.getElementById('ua_saida').value||null,
    tipos_intervencao: tipos,
    trabalhos_realizados: document.getElementById('ua_trabalhos').value,
    pecas_materiais:      document.getElementById('ua_pecas').value,
    servicos_externos:    document.getElementById('ua_servicos').value,
    custo_mao_obra:       parseFloat(document.getElementById('ua_mao').value)||0,
    custo_servicos_externos: parseFloat(document.getElementById('ua_servext').value)||0,
    custo_materiais:      parseFloat(document.getElementById('ua_mat').value)||0
  });
  closeModal();
  toastMsg('Obra actualizada com sucesso!','success');
  if (paginaAtual==='obra-detalhe') renderObraDetalhe(id);
  else ir('obras');
}

/* ================================================================
   16. MODAL — FECHAR OBRA
   ================================================================ */
function modalFechar(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada','error'); return; }
  const mao=parseFloat(o.custo_mao_obra)||0, serv=parseFloat(o.custo_servicos_externos)||0, mat=parseFloat(o.custo_materiais)||0;
  const agora = new Date();
  const pad = n=>String(n).padStart(2,'0');
  const localISO = `${agora.getFullYear()}-${pad(agora.getMonth()+1)}-${pad(agora.getDate())}T${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
  const saidaExist = o.data_saida ? o.data_saida.slice(0,16) : localISO;

  openModal(`Fechar Obra — ${o.numero_obra}`, `
    <div style="margin-bottom:14px;padding:12px;background:var(--success-light);border:1px solid #6ee7b7;border-radius:var(--radius-sm);">
      <strong style="color:var(--success)">${icon('info',14)} Confirme os valores antes de fechar</strong>
    </div>
    <div style="margin-bottom:14px;padding:12px;background:var(--secondary);border-radius:var(--radius-sm);font-size:13px;">
      <strong>${o.matricula}</strong> · ${o.patrimonio} · ${o.numero_obra}
    </div>
    <div class="form-row form-row-2">
      <div class="form-group">
        <label class="form-label">${icon('calendar',12)} Data/Hora de Entrada</label>
        <input type="datetime-local" class="form-control" id="fc_entrada" value="${o.data_entrada?o.data_entrada.slice(0,16):''}">
      </div>
      <div class="form-group">
        <label class="form-label">${icon('calendar',12)} Data/Hora de Saída *</label>
        <input type="datetime-local" class="form-control" id="fc_saida" value="${saidaExist}" required onchange="fc_recalc()">
        <div class="form-hint">Hora em que a viatura saiu da oficina</div>
      </div>
    </div>
    <div id="fc_imob_box" style="margin-bottom:14px;padding:10px 14px;background:#f0f7ff;border-radius:var(--radius-sm);border:1px solid #bfdbfe;font-size:13px;">
      ${icon('timer',14)} <strong>Tempo de imobilização:</strong>
      <span id="fc_imob">${calcDuracao(o.data_entrada, saidaExist)}</span>
    </div>
    <div class="section-divider"></div>
    <p class="form-label" style="margin-bottom:12px;">Revisão de Custos (€)</p>
    <div class="form-row form-row-3">
      <div class="form-group"><label class="form-label">Mão de Obra</label>
        <input type="number" class="form-control" id="fc_mao" step="0.01" min="0" value="${mao}" oninput="fc_recalc()"></div>
      <div class="form-group"><label class="form-label">Serviços Externos</label>
        <input type="number" class="form-control" id="fc_serv" step="0.01" min="0" value="${serv}" oninput="fc_recalc()"></div>
      <div class="form-group"><label class="form-label">Materiais</label>
        <input type="number" class="form-control" id="fc_mat" step="0.01" min="0" value="${mat}" oninput="fc_recalc()"></div>
    </div>
    <div class="custo-row total" style="padding:12px;background:#f0f7ff;border-radius:var(--radius-sm);border:2px solid var(--primary);">
      <span>CUSTO TOTAL DA OBRA</span>
      <strong id="fc_total" style="font-size:20px;">${fmtEuro(mao+serv+mat)}</strong>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-success" onclick="fecharObra('${id}')">${icon('checkCircle')} Confirmar Fecho</button>`);
}

function fc_recalc() {
  const m=parseFloat(document.getElementById('fc_mao')?.value)||0;
  const s=parseFloat(document.getElementById('fc_serv')?.value)||0;
  const t=parseFloat(document.getElementById('fc_mat')?.value)||0;
  const el=document.getElementById('fc_total');
  if (el) el.textContent=fmtEuro(m+s+t);
  const saida = document.getElementById('fc_saida')?.value;
  const entrada = document.getElementById('fc_entrada')?.value;
  const imobEl = document.getElementById('fc_imob');
  if (imobEl && entrada) imobEl.textContent = calcDuracao(entrada, saida||null);
}

function fecharObra(id) {
  const saida   = document.getElementById('fc_saida').value;
  const entrada = document.getElementById('fc_entrada').value;
  if (!saida) { toastMsg('Preencha a data/hora de saída','error'); return; }
  const mao=parseFloat(document.getElementById('fc_mao').value)||0;
  const serv=parseFloat(document.getElementById('fc_serv').value)||0;
  const mat=parseFloat(document.getElementById('fc_mat').value)||0;
  DB.actualizarObra(id,{
    estado:'fechada', data_entrada:entrada||null, data_saida:saida,
    custo_mao_obra:mao, custo_servicos_externos:serv,
    custo_materiais:mat, custo_total:mao+serv+mat
  });
  closeModal();
  toastMsg('Obra fechada com sucesso!','success');
  if (paginaAtual==='obra-detalhe') renderObraDetalhe(id);
  else ir('obras');
}

/* ================================================================
   17. RELATÓRIOS
   ================================================================ */
function renderRelatorios() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div><h2>Relatórios</h2><p>Análise e acompanhamento da frota municipal</p></div>
    </div>

    <!-- TABS -->
    <div class="tabs-bar" id="relTabs">
      <button class="tab-btn active" data-tab="acompanhamento" onclick="switchRelTab(this,'acompanhamento')">
        ${icon('timer',15)} Acompanhamento de Viaturas
      </button>
      <button class="tab-btn" data-tab="mensal" onclick="switchRelTab(this,'mensal')">
        ${icon('chart',15)} Relatório Mensal
      </button>
    </div>

    <div id="tabAcompanhamento">${htmlTabAcompanhamento()}</div>
    <div id="tabMensal" style="display:none">${htmlTabMensal()}</div>
  `;
}

function switchRelTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tabAcompanhamento').style.display = tab==='acompanhamento'?'block':'none';
  document.getElementById('tabMensal').style.display = tab==='mensal'?'block':'none';
  if (tab==='acompanhamento') iniciarTimersImob();
}

/* ── BLOCO 1: Acompanhamento ── */
function htmlTabAcompanhamento() {
  const veiculos = DB.getVeiculos();
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><span class="card-title">${icon('users',15)} Filtros</span></div>
      <div class="card-body">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
          <div class="form-group" style="margin:0;flex:1;min-width:160px;">
            <label class="form-label">Setor</label>
            <select class="form-control" id="rel_setor" onchange="gerarAcompanhamento()">
              <option value="">Todos os setores</option>
              ${SETORES.map(s=>`<option>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;flex:2;min-width:200px;">
            <label class="form-label">Ou selecionar viaturas específicas</label>
            <select class="form-control" id="rel_viatura" multiple size="3" onchange="gerarAcompanhamento()" style="height:auto;">
              ${veiculos.map(v=>`<option value="${v.id}">${v.matricula} — ${v.marca} ${v.modelo}</option>`).join('')}
            </select>
            <div class="form-hint">Ctrl+clique para selecionar múltiplas</div>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Estado</label>
            <select class="form-control" id="rel_estado_v" onchange="gerarAcompanhamento()">
              <option value="">Todos</option>
              <option value="aberta">Em intervenção</option>
              <option value="fechada">Concluídas</option>
            </select>
          </div>
          <div>
            <button class="btn btn-primary" onclick="gerarAcompanhamento()">${icon('refresh',14)} Atualizar</button>
            <button class="btn btn-outline" style="margin-left:6px;" onclick="exportarAcompanhamentoPDF()">${icon('print',14)} Exportar PDF</button>
          </div>
        </div>
      </div>
    </div>
    <div id="relAcompResult">${renderAcompResult(DB.getObras(), DB.getVeiculos())}</div>
  `;
}

function gerarAcompanhamento() {
  const setor  = document.getElementById('rel_setor')?.value||'';
  const estado = document.getElementById('rel_estado_v')?.value||'';
  const vSel   = [...(document.getElementById('rel_viatura')?.selectedOptions||[])].map(o=>o.value);
  let veiculos = DB.getVeiculos();
  if (setor)   veiculos = veiculos.filter(v=>v.setor===setor);
  if (vSel.length) veiculos = DB.getVeiculos().filter(v=>vSel.includes(v.id));
  let obras = DB.getObras().filter(o=>veiculos.some(v=>v.id===o.veiculo_id||v.matricula===o.matricula));
  if (estado) obras = obras.filter(o=>o.estado===estado);
  document.getElementById('relAcompResult').innerHTML = renderAcompResult(obras, veiculos);
  iniciarTimersImob();
}

function renderAcompResult(obras, veiculos) {
  if (!obras.length) return `<div class="card"><div class="card-body" style="text-align:center;padding:40px;color:var(--text-light)">Nenhuma obra encontrada para os filtros selecionados.</div></div>`;

  // Agrupar por veículo
  const map = {};
  obras.forEach(o=>{
    const key = o.veiculo_id||o.matricula;
    if (!map[key]) map[key] = { obras:[], veiculo: veiculos.find(v=>v.id===o.veiculo_id||v.matricula===o.matricula)||{matricula:o.matricula, patrimonio:o.patrimonio} };
    map[key].obras.push(o);
  });

  return Object.values(map).map(({obras:oList, veiculo:v})=>`
    <div class="card" style="margin-bottom:14px;">
      <div class="card-header" style="background:#f8fafc;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="veiculo-icon" style="width:36px;height:36px;">${iconVeiculo(v.tipo||'ligeiro',18)}</div>
          <div>
            <strong>${v.matricula}</strong>
            <span style="color:var(--text-medium);font-size:12px;margin-left:8px;">${v.patrimonio||''} · ${v.marca||''} ${v.modelo||''} · ${v.setor||''}</span>
          </div>
        </div>
        <span class="badge ${oList.some(o=>o.estado==='aberta')?'badge-red':'badge-green'}">${oList.filter(o=>o.estado==='aberta').length} em intervenção</span>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nº Obra</th><th>Tipo(s) Intervenção</th><th>Data/Hora Entrada</th><th>Data/Hora Saída</th><th>Estado</th><th>Imobilização</th></tr></thead>
          <tbody>
            ${oList.sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada)).map(o=>{
              const emAberto = o.estado==='aberta';
              return `<tr class="${emAberto?'row-aberta':''}">
                <td><strong>${o.numero_obra}</strong></td>
                <td>${badgeTipos(o.tipos_intervencao)}</td>
                <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
                <td style="white-space:nowrap">${o.data_saida?fmtDataHora(o.data_saida):'<span style="color:var(--text-light)">—</span>'}</td>
                <td>${emAberto
                  ? `<span class="badge badge-red">${icon('alert',11)} Em intervenção</span>`
                  : `<span class="badge badge-green">${icon('check',11)} Concluído</span>`}</td>
                <td>
                  <span class="${emAberto?'imob-live badge badge-orange':'badge badge-gray'}"
                        data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">
                    ${icon('timer',12)} ${calcDuracao(o.data_entrada, o.data_saida)}
                  </span>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`).join('');
}

/* ── BLOCO 2: Mensal ── */
function htmlTabMensal() {
  const {ano, mes} = getMesAtual();
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const anosDisp = [...new Set(DB.getObras().map(o=>o.data_entrada?new Date(o.data_entrada).getFullYear():null).filter(Boolean))].sort((a,b)=>b-a);
  if (!anosDisp.includes(ano)) anosDisp.unshift(ano);
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><span class="card-title">${icon('calendar',15)} Período</span></div>
      <div class="card-body">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Mês</label>
            <select class="form-control" id="rel_mes">
              ${meses.map((m,i)=>`<option value="${i}" ${i===mes?'selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Ano</label>
            <select class="form-control" id="rel_ano">
              ${anosDisp.map(a=>`<option value="${a}" ${a===ano?'selected':''}>${a}</option>`).join('')}
            </select>
          </div>
          <div>
            <button class="btn btn-primary" onclick="gerarMensal()">${icon('chart',14)} Gerar Relatório</button>
            <button class="btn btn-outline" style="margin-left:6px;" onclick="exportarMensalPDF()">${icon('print',14)} Exportar PDF</button>
          </div>
        </div>
      </div>
    </div>
    <div id="relMensalResult"></div>
  `;
}

function gerarMensal() {
  const mes = parseInt(document.getElementById('rel_mes').value);
  const ano = parseInt(document.getElementById('rel_ano').value);
  const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const obras = DB.getObras().filter(o=>{
    if (!o.data_entrada) return false;
    const d = new Date(o.data_entrada);
    return d.getMonth()===mes && d.getFullYear()===ano;
  });

  if (!obras.length) {
    document.getElementById('relMensalResult').innerHTML = `
      <div class="card"><div class="card-body" style="text-align:center;padding:40px;color:var(--text-light)">
        Sem obras registadas em ${meses[mes]} ${ano}.
      </div></div>`;
    return;
  }

  // Estatísticas
  const total = obras.length;
  const viaturas = [...new Set(obras.map(o=>o.matricula))];
  const minTotal = obras.reduce((s,o)=>s+calcMinutos(o.data_entrada,o.data_saida),0);
  const minMedio = Math.round(minTotal/total);
  const minHora  = n=>`${Math.floor(n/60)}h${String(n%60).padStart(2,'0')}m`;

  // Tipos mais frequentes
  const tiposCount = {};
  obras.forEach(o=>tiposArray(o.tipos_intervencao).forEach(t=>{tiposCount[t]=(tiposCount[t]||0)+1;}));
  const tiposTop = Object.entries(tiposCount).sort((a,b)=>b[1]-a[1]);

  // Viaturas com mais ocorrências
  const viatCount = {};
  obras.forEach(o=>{ viatCount[o.matricula]=(viatCount[o.matricula]||0)+1; });
  const viatTop = Object.entries(viatCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Dias com maior carga
  const diasCount = {};
  obras.forEach(o=>{
    if (!o.data_entrada) return;
    const d = new Date(o.data_entrada);
    const key = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    diasCount[key]=(diasCount[key]||0)+1;
  });
  const diasTop = Object.entries(diasCount).sort((a,b)=>b[1]-a[1]).slice(0,7);

  // Bar chart simples em CSS
  const maxBar = Math.max(...diasTop.map(([,n])=>n));
  const barChart = diasTop.map(([d,n])=>`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <div style="width:56px;font-size:12px;font-weight:600;text-align:right;color:var(--text-medium)">${d}</div>
      <div style="flex:1;background:#e2e8f0;border-radius:4px;overflow:hidden;height:22px;">
        <div style="width:${Math.round(n/maxBar*100)}%;background:var(--primary);height:100%;display:flex;align-items:center;padding-left:8px;">
          <span style="font-size:11px;font-weight:700;color:#fff">${n}</span>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('relMensalResult').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px;">
      <div class="stat-card"><div class="stat-icon blue">${icon('list',22)}</div>
        <div class="stat-info"><div class="stat-value">${total}</div><div class="stat-label">Intervenções</div></div></div>
      <div class="stat-card"><div class="stat-icon green">${icon('truck',22)}</div>
        <div class="stat-info"><div class="stat-value">${viaturas.length}</div><div class="stat-label">Viaturas</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow">${icon('timer',22)}</div>
        <div class="stat-info"><div class="stat-value">${minHora(minMedio)}</div><div class="stat-label">Imob. Média</div></div></div>
      <div class="stat-card"><div class="stat-icon orange">${icon('clock',22)}</div>
        <div class="stat-info"><div class="stat-value">${minHora(minTotal)}</div><div class="stat-label">Imob. Total</div></div></div>
    </div>

    <div class="grid-2col" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-header"><span class="card-title">${icon('tools',15)} Tipos Mais Frequentes</span></div>
        <div class="card-body">
          ${tiposTop.map(([t,n],i)=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;font-weight:700;color:var(--text-light);width:18px">#${i+1}</span>
                <span class="badge ${INT_COR[t]||'badge-gray'}">${t}</span>
              </div>
              <strong>${n}</strong>
            </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">${icon('alert',15)} Viaturas c/ Mais Ocorrências</span></div>
        <div class="card-body">
          ${viatTop.map(([mat,n],i)=>{
            const v = DB.getVeiculos().find(v=>v.matricula===mat);
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;font-weight:700;color:var(--text-light);width:18px">#${i+1}</span>
                <div>
                  <div style="font-weight:700">${mat}</div>
                  ${v?`<div style="font-size:11.5px;color:var(--text-medium)">${v.marca} ${v.modelo}</div>`:''}
                </div>
              </div>
              <span class="badge badge-red">${n} ocorr.</span>
            </div>`;}).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><span class="card-title">${icon('calendar',15)} Dias com Maior Carga — ${meses[mes]} ${ano}</span></div>
      <div class="card-body">${barChart}</div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">${icon('list',15)} Detalhe — Todas as Intervenções de ${meses[mes]} ${ano}</span>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nº Obra</th><th>Matrícula</th><th>Tipo(s)</th><th>Entrada</th><th>Saída</th><th>Imob.</th><th>Custo</th><th>Estado</th></tr></thead>
          <tbody>
            ${obras.sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada)).map(o=>`
              <tr>
                <td><strong>${o.numero_obra}</strong></td>
                <td>${o.matricula}</td>
                <td>${badgeTipos(o.tipos_intervencao)}</td>
                <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
                <td style="white-space:nowrap">${fmtDataHora(o.data_saida)}</td>
                <td><span class="badge badge-gray">${calcDuracao(o.data_entrada,o.data_saida)}</span></td>
                <td>${o.estado==='fechada'?fmtEuro(o.custo_total):'—'}</td>
                <td>${badgeEstado(o.estado)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ================================================================
   18. EXPORTAR PDF (Acompanhamento)
   ================================================================ */
function exportarAcompanhamentoPDF() {
  const content = document.getElementById('relAcompResult')?.innerHTML||'';
  if (!content || content.includes('Nenhuma obra')) { toastMsg('Gere primeiro o relatório','warning'); return; }
  const agora = new Date().toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  _imprimirHTML(`
    <h1 style="color:#1a4d8f;font-size:16pt;border-bottom:3px solid #1a4d8f;padding-bottom:8px;margin-bottom:16px;">
      GOM — Acompanhamento de Viaturas
    </h1>
    <p style="font-size:9pt;color:#888;margin-bottom:16px;">Impresso em ${agora} · Câmara Municipal · GOM v2.0</p>
    ${_stripTimers(content)}
  `, 'Acompanhamento de Viaturas');
}

function exportarMensalPDF() {
  const content = document.getElementById('relMensalResult')?.innerHTML||'';
  if (!content) { toastMsg('Gere primeiro o relatório mensal','warning'); return; }
  const mes = document.getElementById('rel_mes')?.value;
  const ano = document.getElementById('rel_ano')?.value;
  const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const agora = new Date().toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  _imprimirHTML(`
    <h1 style="color:#1a4d8f;font-size:16pt;border-bottom:3px solid #1a4d8f;padding-bottom:8px;margin-bottom:16px;">
      GOM — Relatório Global Mensal · ${meses[mes]} ${ano}
    </h1>
    <p style="font-size:9pt;color:#888;margin-bottom:16px;">Impresso em ${agora} · Câmara Municipal · GOM v2.0</p>
    ${content}
  `, `Relatório Mensal ${meses[mes]} ${ano}`);
}

function _stripTimers(html) {
  // Remove atributos data- dos spans de imobilização no print (mostra valor estático)
  return html.replace(/class="imob-live/g, 'class="badge badge-orange');
}

function _imprimirHTML(conteudo, titulo='') {
  const printArea = document.getElementById('printArea');
  printArea.innerHTML = `
    <style>
      @page{size:A4;margin:16mm 14mm;}
      *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
      body{font-size:10pt;color:#111;}
      .card{border:1px solid #ddd;border-radius:4px;margin-bottom:14px;}
      .card-header{padding:10px 14px;background:#f8fafc;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;}
      .card-body{padding:14px;}
      .card-title{font-size:11pt;font-weight:700;}
      table{width:100%;border-collapse:collapse;font-size:9pt;}
      thead th{background:#f0f4f8;padding:7px 10px;text-align:left;border:1px solid #ddd;font-size:8.5pt;text-transform:uppercase;color:#555;}
      tbody td{padding:7px 10px;border:1px solid #ddd;}
      tbody tr:nth-child(even){background:#fafafa;}
      .badge{display:inline-block;padding:2px 7px;border-radius:10px;font-size:8pt;font-weight:700;margin:1px;}
      .badge-green{background:#d4edda;color:#1e7e44;}
      .badge-red{background:#fee2e2;color:#b91c1c;}
      .badge-blue{background:#dbeafe;color:#1a4d8f;}
      .badge-yellow{background:#fef3c7;color:#d97706;}
      .badge-orange{background:#ffedd5;color:#c2410c;}
      .badge-purple{background:#ede9fe;color:#6d28d9;}
      .badge-gray{background:#f1f5f9;color:#475569;}
      .badge-teal{background:#ccfbf1;color:#0f766e;}
      .badge-dark-red{background:#fde8e8;color:#991b1b;}
      .stat-card{border:1px solid #ddd;border-radius:4px;padding:12px;display:inline-flex;align-items:center;gap:10px;min-width:130px;}
      .stat-value{font-size:18pt;font-weight:700;}
      .stat-label{font-size:8pt;color:#666;}
      .stats-grid,.grid-2col{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
      .grid-2col{grid-template-columns:1fr 1fr;}
      .svg-icon{display:none;}
      .row-aberta{background:#fff5f5;}
      .veiculo-icon{display:none;}
      .form-hint,.tab-btn,.btn,.tabs-bar,.filter-bar,.form-group,.form-label,select,input{display:none!important;}
    </style>
    ${conteudo}`;
  printArea.style.display = 'block';
  window.print();
  setTimeout(()=>{ printArea.style.display='none'; printArea.innerHTML=''; }, 1500);
}

/* ================================================================
   19. IMPRESSÃO DE OBRA (Folha A4)
   ================================================================ */
function imprimirObra(id) {
  const o = DB.getObra(id);
  if (!o) { toastMsg('Obra não encontrada','error'); return; }
  const mao=parseFloat(o.custo_mao_obra)||0, serv=parseFloat(o.custo_servicos_externos)||0, mat=parseFloat(o.custo_materiais)||0;
  const tot = o.estado==='fechada'?(parseFloat(o.custo_total)||0):mao+serv+mat;
  const agora = new Date().toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const tiposStr2 = tiposArray(o.tipos_intervencao).join(' · ')||'—';

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
      .imob-box{background:#f0f4ff;border:1px solid #bfdbfe;border-radius:4px;padding:8px 12px;font-size:10pt;margin-bottom:14px;}
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
        <div class="org"><h1>Câmara Municipal</h1><p>Serviço de Gestão de Frota e Manutenção</p><p>GOM — Gestão de Obras de Manutenção v2.0</p></div>
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
      <div class="ii"><div class="il">Estado</div><div class="iv n">${o.estado==='fechada'?'Concluída':'Em aberto'}</div></div>
      <div class="ii"><div class="il">Data/Hora de Entrada</div><div class="iv n">${fmtDataHora(o.data_entrada)}</div></div>
      <div class="ii"><div class="il">Data/Hora de Saída</div><div class="iv n">${fmtDataHora(o.data_saida)}</div></div>
      <div class="ii"><div class="il">Tipo(s) de Intervenção</div><div class="iv n" style="font-size:9pt">${tiposStr2}</div></div>
    </div>
    <div class="imob-box"><strong>Tempo de imobilização:</strong> ${calcDuracao(o.data_entrada,o.data_saida)}</div>
    <div class="sec"><div class="st">Descrição da Avaria / Intervenção</div>
      <div class="sb ${!o.descricao_avaria?'empty':''}">${o.descricao_avaria||'Sem descrição'}</div></div>
    <div class="sec"><div class="st">Trabalhos Realizados</div>
      <div class="sb ${!o.trabalhos_realizados?'empty':''}">${o.trabalhos_realizados||'Não preenchido'}</div></div>
    <div class="sec"><div class="st">Peças e Materiais Utilizados</div>
      <div class="sb ${!o.pecas_materiais?'empty':''}">${o.pecas_materiais||'Não preenchido'}</div></div>
    <div class="sec"><div class="st">Serviços Externos</div>
      <div class="sb ${!o.servicos_externos?'empty':''}">${o.servicos_externos||'Não aplicável'}</div></div>
    <div class="sec"><div class="st">Resumo de Custos</div>
      <table class="ct">
        <tr><td>Mão de obra interna</td><td>${fmtEuro(mao)}</td></tr>
        <tr><td>Serviços externos</td><td>${fmtEuro(serv)}</td></tr>
        <tr><td>Materiais / Peças</td><td>${fmtEuro(mat)}</td></tr>
        <tr><td>CUSTO TOTAL</td><td>${fmtEuro(tot)}</td></tr>
      </table></div>
    <div class="assin">
      <div class="ab">Responsável pela Intervenção</div>
      <div class="ab">Chefe de Serviço / Responsável</div>
    </div>
    <div class="footer">
      <span>Impresso em ${agora}</span>
      <span>GOM — Gestão de Obras de Manutenção · Câmara Municipal</span>
      <span>Documento interno</span>
    </div>`;
  document.getElementById('printArea').style.display = 'block';
  window.print();
  setTimeout(()=>{ document.getElementById('printArea').style.display='none'; document.getElementById('printArea').innerHTML=''; }, 1500);
}

/* ================================================================
   20. EVENTOS GLOBAIS
   ================================================================ */
document.getElementById('modalOverlay').addEventListener('click', e=>{
  if (e.target===document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('modalClose').addEventListener('click', closeModal);

document.getElementById('menuToggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    ir(link.dataset.page);
  });
});

/* ================================================================
   21. ARRANQUE
   ================================================================ */
DB.init();
ir('dashboard');
