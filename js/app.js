/* ================================================================
   GOM v3.0 — APP PRINCIPAL (MVP OFFLINE)
   100% localStorage · sem Firebase · sem APIs externas
   ================================================================ */
'use strict';

/* ================================================================
   CONSTANTES DE INTERFACE
   ================================================================ */
const TIPO_LABEL    = {ligeiro:'Ligeiro',pesado:'Pesado',maquina:'Máquina'};
const ESTADO_OP_LABEL = {
  operacional:'Operacional', em_reparacao:'Em reparação',
  inoperacional_standby:'Inoperacional/Standby',
  // Valores antigos mantidos apenas para leitura/migração de registos existentes.
  manutencao:'Em Manutenção', avaria:'Em reparação', inativo:'Inoperacional/Standby'
};
const INT_COR = {
  'Manutenção preventiva':'badge-blue','Reparação':'badge-red',
  'Inspeção':'badge-yellow','Revisão geral':'badge-green',
  'Avaria elétrica':'badge-purple','Avaria hidráulica':'badge-orange',
  'Avaria motor':'badge-dark-red','Substituição de pneus':'badge-teal',
  'Carroçaria / Pintura':'badge-gray','Outro':'badge-gray'
};
const REQ_TIPO_LABEL = {material:'Material',servico:'Serviço externo',outro:'Outro'};
const FAT_ESTADO_LABEL = {pendente:'Pendente',paga:'Paga',anulada:'Anulada'};
const ALERTA_ANTEC = {
  itp_proxima:30, seguro_valido_ate:30, revisao_proxima:30,
  oleo_proxima_data:14, grua_proxima:60,
  caixa_proxima:60, tacografo_proxima:30, extintor_validade:30,
  licenciamento_validade:30
};

/* ================================================================
   SVG ICONS
   ================================================================ */
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
  refresh:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  excel:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="9"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  sector:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

function icon(name, size=16) {
  return `<span class="svg-icon" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;vertical-align:middle;">${ICONS[name]||''}</span>`;
}

/* ================================================================
   UTILITÁRIOS
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
function fmtEuro(v) { return (parseFloat(v)||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'}); }
function calcDuracao(entrada, saida) {
  if (!entrada) return '—';
  const ini = new Date(entrada), fim = saida ? new Date(saida) : new Date();
  const min = Math.round((fim-ini)/60000);
  if (isNaN(min)||min<0) return '—';
  const d=Math.floor(min/1440), h=Math.floor((min%1440)/60), m=min%60;
  let r=''; if(d>0)r+=`${d}d `; if(h>0||d>0)r+=`${h}h `; r+=`${String(m).padStart(2,'0')}m`;
  return r.trim();
}
function calcMinutos(entrada, saida) {
  if (!entrada) return 0;
  const ini=new Date(entrada), fim=saida?new Date(saida):new Date();
  return Math.max(0,Math.round((fim-ini)/60000));
}
function diasAte(dataStr) {
  if (!dataStr) return null;
  const hoje=new Date(); hoje.setHours(0,0,0,0);
  const alvo=new Date(dataStr+'T00:00:00');
  return Math.round((alvo-hoje)/86400000);
}
function toastMsg(msg, tipo='') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className=`toast show ${tipo}`;
  clearTimeout(t._t); t._t=setTimeout(()=>{t.className='toast';},3400);
}
function esc(s)    { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nl2br(s)  { return (s||'').replace(/\n/g,'<br>'); }
function tiposArray(v) { if(!v)return []; if(Array.isArray(v))return v; return [v]; }
function tiposStr(v)   { return tiposArray(v).join(', ')||'—'; }
function uid()         { return Math.random().toString(36).slice(2)+Date.now().toString(36); }
function localISO(d)   { const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
function dataValida(s) { return !!s && !Number.isNaN(new Date(s.length===10?s+'T00:00:00':s).getTime()); }
function intervaloValido(entrada, saida) {
  if(!entrada || !saida) return true;
  return new Date(saida).getTime() >= new Date(entrada).getTime();
}

/* ================================================================
   MODAL
   ================================================================ */
function openModal(titulo, corpo, rodape='', grande=false) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML   = corpo;
  document.getElementById('modalFooter').innerHTML = rodape;
  document.getElementById('modalBox').style.maxWidth = grande ? '920px' : '700px';
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display='none'; }

/* ================================================================
   ROTEADOR
   ================================================================ */
let paginaAtual = 'dashboard';
let _relTimers  = [];

function ir(pagina, params={}) {
  _relTimers.forEach(t=>clearInterval(t)); _relTimers=[];
  paginaAtual = pagina;
  document.getElementById('sidebar').classList.remove('open');
  document.querySelectorAll('.nav-link').forEach(l=>{
    l.classList.toggle('active', l.dataset.page===pagina);
  });
  const titulos = {
    dashboard:'Dashboard', veiculos:'Frota Municipal', obras:'Obras',
    alertas:'Alertas & Certificações', custos:'Faturação / Requisições',
    relatorios:'Relatórios', 'obra-detalhe':'Detalhe da Obra',
    'veiculo-historico':'Histórico do Veículo'
  };
  document.getElementById('pageTitle').textContent = titulos[pagina]||pagina;
  document.getElementById('topbarActions').innerHTML = '';
  switch(pagina) {
    case 'dashboard':         renderDashboard();                 break;
    case 'veiculos':          renderVeiculos();                  break;
    case 'obras':             renderObras();                     break;
    case 'alertas':           renderAlertas();                   break;
    case 'itp':               renderAlertas();                   break;
    case 'custos':            renderFaturacao();                 break;
    case 'faturas':           renderFaturacao('faturas');        break;
    case 'relatorios':        renderRelatorios();               break;
    case 'obra-detalhe':      renderObraDetalhe(params.id);     break;
    case 'veiculo-historico': renderVeiculoHistorico(params.id);break;
    default: document.getElementById('pageContainer').innerHTML='<p style="padding:40px;color:var(--text-light)">Página não encontrada.</p>';
  }
  atualizarBadgeAlertas();
}

/* ================================================================
   BADGES HELPERS
   ================================================================ */
function badgeEstado(estado) {
  if (estado==='aberta')  return `<span class="badge badge-red">${icon('tools',11)} Aberta</span>`;
  if (estado==='fechada') return `<span class="badge badge-green">${icon('check',11)} Fechada</span>`;
  return `<span class="badge badge-gray">${estado}</span>`;
}
function badgeTipos(tipos) {
  return tiposArray(tipos).map(t=>`<span class="badge ${INT_COR[t]||'badge-gray'}" style="margin:1px 2px 1px 0">${t}</span>`).join('');
}
function badgeEstadoOp(eop) {
  const m={
    operacional:`<span class="badge badge-green">${icon('check',11)} Operacional</span>`,
    manutencao: `<span class="badge badge-yellow">${icon('wrench',11)} Em Manutenção</span>`,
    avaria:     `<span class="badge badge-red">${icon('alert',11)} Avaria</span>`,
    inativo:    `<span class="badge badge-gray">Inativo</span>`
  };
  return m[eop]||`<span class="badge badge-gray">${eop||'—'}</span>`;
}
function iconVeiculo(tipo, size=22) {
  if (tipo==='pesado')  return icon('truck',size);
  if (tipo==='maquina') return icon('tractor',size);
  return icon('car',size);
}
function badgeAlertaStatus(st) {
  if (st==='expirado') return `<span class="badge badge-red">${icon('alert',11)} Expirado</span>`;
  if (st==='proximo')  return `<span class="badge badge-yellow">${icon('alert',11)} Próximo</span>`;
  if (st==='ok')       return `<span class="badge badge-green">${icon('check',11)} Válido</span>`;
  return `<span class="badge badge-gray">Sem data</span>`;
}
function badgeFatEstado(estado) {
  const m={
    pendente:`<span class="badge badge-yellow">${icon('clock',11)} Pendente</span>`,
    paga:    `<span class="badge badge-green">${icon('check',11)} Paga</span>`,
    anulada: `<span class="badge badge-gray">Anulada</span>`
  };
  return m[estado]||`<span class="badge badge-gray">${estado}</span>`;
}
function badgeReqEstado(estado) {
  const m={
    pendente: `<span class="badge req-status-pendente">Pendente</span>`,
    aprovada: `<span class="badge req-status-aprovada">Aprovada</span>`,
    rejeitada:`<span class="badge req-status-rejeitada">Rejeitada</span>`,
    concluida:`<span class="badge req-status-concluida">Concluída</span>`
  };
  return m[estado]||`<span class="badge badge-gray">${estado}</span>`;
}

/* Badge ITP compat */
function badgeITPStatus(dias, antec) {
  if (dias===null) return `<span class="badge badge-gray">Sem data</span>`;
  if (dias<0)      return `<span class="badge badge-red">${icon('alert',11)} Expirada (${Math.abs(dias)}d)</span>`;
  if (dias<=(antec||30)) return `<span class="badge badge-yellow">${icon('alert',11)} Próxima (${dias}d)</span>`;
  return `<span class="badge badge-green">${icon('check',11)} Válida (${dias}d)</span>`;
}

/* ================================================================
   BADGE MENU ALERTAS
   ================================================================ */
function atualizarBadgeAlertas() {
  const badge = document.getElementById('navBadgeAlertas');
  if (!badge) return;
  const alertas = DB.getAlertas();
  let total = 0;
  alertas.forEach(al => { total += contarAlertasVeiculo(al); });
  if (total>0) { badge.textContent=total; badge.classList.add('visible'); }
  else         { badge.classList.remove('visible'); }
}
/* Alias para compatibilidade */
function atualizarBadgeITP() { atualizarBadgeAlertas(); }

/* ================================================================
   CHECKBOXES TIPO INTERVENÇÃO
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
   10. DASHBOARD
   ================================================================ */
function renderDashboard() {
  const obras    = DB.getObras();
  const veiculos = DB.getVeiculos();
  const alertas  = DB.getAlertas();
  const abertas  = obras.filter(o=>o.estado==='aberta');
  const fechadas = obras.filter(o=>o.estado==='fechada');
  const horasImob= abertas.reduce((s,o)=>s+calcMinutos(o.data_entrada,null)/60,0);
  const recentes = [...obras].sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada)).slice(0,6);
  const reqs     = DB.getReqs();
  const reqsPend = reqs.filter(r=>r.estado==='pendente').length;
  const hoje     = new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  /* Calcular alertas críticos */
  let totalAlertasExp=0, totalAlertasProx=0;
  const alertasExpirados = [];
  const alertasProximos  = [];
  alertas.forEach(al=>{
    Object.entries(ALERTA_ANTEC).forEach(([campo, antec])=>{
      const st = alertaStatus(al[campo], antec);
      if (st==='expirado') { totalAlertasExp++; if(alertasExpirados.length<5) alertasExpirados.push({al,campo}); }
      if (st==='proximo')  { totalAlertasProx++; if(alertasProximos.length<3) alertasProximos.push({al,campo}); }
    });
  });

  /* Veículos por estado operacional */
  const vOp   = veiculos.filter(v=>v.estado_op==='operacional').length;
  const vMut  = veiculos.filter(v=>v.estado_op==='manutencao').length;
  const vAv   = veiculos.filter(v=>v.estado_op==='avaria').length;
  const vIn   = veiculos.filter(v=>v.estado_op==='inativo').length;

  /* Custo total obras fechadas */
  const custoTotal = fechadas.reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header">
      <div><h2>Dashboard Operacional</h2><p>GOM v3.0 · ${hoje}</p></div>
      <button class="btn btn-primary" onclick="modalCriarObra()">${icon('plus')} Nova Obra</button>
    </div>

    ${(totalAlertasExp>0||totalAlertasProx>0)?`
    <div class="dashboard-alerts">
      ${totalAlertasExp>0?`<div class="dash-alert dash-alert-danger" onclick="ir('alertas')" style="cursor:pointer">
        ${icon('alert',16)}
        <div><strong>${totalAlertasExp} alerta${totalAlertasExp>1?'s':''} expirado${totalAlertasExp>1?'s':''}!</strong>
        Certificações/documentos fora de validade — <u>Clique para ver</u></div>
      </div>`:''}
      ${totalAlertasProx>0?`<div class="dash-alert dash-alert-warning" onclick="ir('alertas')" style="cursor:pointer">
        ${icon('alert',16)}
        <div><strong>${totalAlertasProx} alerta${totalAlertasProx>1?'s':''} próximo${totalAlertasProx>1?'s':''} do prazo.</strong>
        Documentos a vencer em breve — <u>Clique para ver</u></div>
      </div>`:''}
    </div>`:''}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">${icon('truck',22)}</div>
        <div class="stat-info"><div class="stat-value">${veiculos.length}</div><div class="stat-label">Viaturas Registadas</div></div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="renderVeiculosFiltrado('operacional')">
        <div class="stat-icon green">${icon('checkCircle',22)}</div>
        <div class="stat-info"><div class="stat-value">${vOp}</div><div class="stat-label">Operacionais</div></div>
      </div>
      <div class="stat-card" style="cursor:pointer;border-color:var(--warning)" onclick="renderVeiculosFiltrado('manutencao')">
        <div class="stat-icon yellow">${icon('wrench',22)}</div>
        <div class="stat-info"><div class="stat-value">${vMut}</div><div class="stat-label">Em Manutenção</div></div>
      </div>
      <div class="stat-card" style="cursor:pointer;border-color:var(--danger)" onclick="renderVeiculosFiltrado('avaria')">
        <div class="stat-icon red">${icon('alert',22)}</div>
        <div class="stat-info"><div class="stat-value">${vAv}</div><div class="stat-label">Em Avaria</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">${icon('tools',22)}</div>
        <div class="stat-info"><div class="stat-value">${abertas.length}</div><div class="stat-label">Obras Abertas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">${icon('timer',22)}</div>
        <div class="stat-info"><div class="stat-value">${Math.round(horasImob)}h</div><div class="stat-label">Imob. Total Ativa</div></div>
      </div>
      ${totalAlertasExp+totalAlertasProx>0?`
      <div class="stat-card dash-card-alert" style="cursor:pointer;border-color:var(--danger)" onclick="ir('alertas')">
        <div class="stat-icon red">${icon('bell',22)}</div>
        <div class="stat-info"><div class="stat-value">${totalAlertasExp+totalAlertasProx}</div><div class="stat-label">Alertas Ativos</div></div>
      </div>`:''}
      ${reqsPend>0?`
      <div class="stat-card" style="cursor:pointer;border-color:var(--warning)" onclick="ir('custos')">
        <div class="stat-icon yellow">${icon('list',22)}</div>
        <div class="stat-info"><div class="stat-value">${reqsPend}</div><div class="stat-label">Req. Pendentes</div></div>
      </div>`:''}
      <div class="stat-card">
        <div class="stat-icon blue">${icon('euro',22)}</div>
        <div class="stat-info"><div class="stat-value">${fmtEuro(custoTotal)}</div><div class="stat-label">Custo Total Obras</div></div>
      </div>
    </div>

    <div class="grid-2col">
      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('clock',15)} Obras Abertas (${abertas.length})</span>
          <button class="btn btn-sm btn-outline" onclick="ir('obras')">Ver todas</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Nº Obra</th><th>Viatura / Setor</th><th>Tipo(s)</th><th>Imobilização</th><th></th></tr></thead>
            <tbody>
              ${abertas.length===0
                ?`<tr><td colspan="5" class="table-empty">Sem obras abertas ${icon('checkCircle',14)}</td></tr>`
                :abertas.slice(0,6).map(o=>`
                  <tr class="row-aberta">
                    <td><strong>${o.numero_obra}</strong></td>
                    <td><div style="font-weight:600">${esc(o.matricula)}</div>
                      <div style="font-size:11px;color:var(--text-medium)">${esc(o.patrimonio||'—')} · <span class="badge badge-blue" style="font-size:10px;padding:1px 6px">${esc(o.setor_snapshot||'—')}</span></div>
                    </td>
                    <td>${badgeTipos(o.tipos_intervencao)}</td>
                    <td><span class="imob-live badge badge-orange" data-entrada="${o.data_entrada||''}">${calcDuracao(o.data_entrada,null)}</span></td>
                    <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button></td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('bell',15)} Alertas Críticos</span>
          <button class="btn btn-sm btn-outline" onclick="ir('alertas')">Ver todos</button>
        </div>
        <div style="padding:0 16px 16px;">
          ${alertasExpirados.length===0&&alertasProximos.length===0
            ?`<div style="padding:32px;text-align:center;color:var(--text-light)">${icon('checkCircle',28)}<p style="margin-top:8px">Sem alertas críticos</p></div>`
            :[...alertasExpirados.map(({al,campo})=>`
              <div class="alert-item alert-item-danger" onclick="ir('alertas')" style="cursor:pointer;">
                <div>${icon('alert',14)}</div>
                <div>
                  <strong>${al.matricula}</strong> — ${ALERTA_LABEL[campo.replace('_proxima','').replace('_valido_ate','').replace('_ultima_data','').replace('_validade','')] || ALERTA_LABEL[Object.keys(ALERTA_LABEL).find(k=>campo.includes(k))||''] || campo}
                  <div style="font-size:11px;color:var(--danger)">EXPIRADO — ${fmtData(al[campo])}</div>
                </div>
              </div>`),
            ...alertasProximos.map(({al,campo})=>`
              <div class="alert-item alert-item-warning" onclick="ir('alertas')" style="cursor:pointer;">
                <div>${icon('alert',14)}</div>
                <div>
                  <strong>${al.matricula}</strong> — ${ALERTA_LABEL[campo.replace('_proxima','').replace('_valido_ate','').replace('_ultima_data','').replace('_validade','')]||campo}
                  <div style="font-size:11px;color:var(--warning)">Vence em ${diasAte(al[campo])} dias — ${fmtData(al[campo])}</div>
                </div>
              </div>`)
            ].join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header">
        <span class="card-title">${icon('history',15)} Obras Recentes</span>
        <button class="btn btn-sm btn-outline" onclick="ir('obras')">Ver todas</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nº Obra</th><th>Matrícula</th><th>Tipo(s)</th><th>Estado</th><th>Custo</th><th></th></tr></thead>
          <tbody>
            ${recentes.map(o=>`
              <tr>
                <td><strong>${o.numero_obra}</strong></td>
                <td><div>${esc(o.matricula)}</div><div style="font-size:11px;color:var(--text-light)">${fmtData(o.data_entrada)}</div></td>
                <td>${badgeTipos(o.tipos_intervencao)}</td>
                <td>${badgeEstado(o.estado)}</td>
                <td>${o.estado==='fechada'?`<strong>${fmtEuro(o.custo_total)}</strong>`:'<span style="color:var(--text-light)">—</span>'}</td>
                <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  iniciarTimersImob();
}

function renderVeiculosFiltrado(estadoOp) {
  ir('veiculos');
  setTimeout(()=>{
    const el=document.getElementById('filtroEstadoOp');
    if(el){el.value=estadoOp;filtrarVeiculos();}
  },100);
}

function iniciarTimersImob() {
  const els=document.querySelectorAll('.imob-live');
  if(!els.length) return;
  const t=setInterval(()=>{els.forEach(el=>{if(el.dataset.entrada)el.textContent=calcDuracao(el.dataset.entrada,null);});},30000);
  _relTimers.push(t);
}

/* ================================================================
   11. VEÍCULOS
   ================================================================ */
function renderVeiculos() {
  const veiculos=DB.getVeiculos();
  window._veiculos=veiculos;
  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-outline" onclick="modalEditarSetor(null)">${icon('sector')} Gerir Setores</button>
    <button class="btn btn-primary" onclick="modalNovoVeiculo()">${icon('plus')} Novo Veículo</button>`;
  document.getElementById('pageContainer').innerHTML=`
    <div class="page-header">
      <div><h2>Frota Municipal</h2><p>${veiculos.length} veículos e máquinas registados</p></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" placeholder="Pesquisar matrícula, marca, modelo…" id="searchVeiculo" oninput="filtrarVeiculos()">
      <select class="form-control" id="filtroTipoV" onchange="filtrarVeiculos()">
        <option value="">Todos os tipos</option>
        <option value="ligeiro">Ligeiro</option><option value="pesado">Pesado</option><option value="maquina">Máquina</option>
      </select>
      <select class="form-control" id="filtroSetorV" onchange="filtrarVeiculos()">
        <option value="">Todos os setores</option>
        ${SETORES.map(s=>`<option>${s}</option>`).join('')}
      </select>
      <select class="form-control" id="filtroEstadoOp" onchange="filtrarVeiculos()">
        <option value="">Todos os estados</option>
        <option value="operacional">Operacional</option>
        <option value="manutencao">Em Manutenção</option>
        <option value="avaria">Avaria</option>
        <option value="inativo">Inativo</option>
      </select>
    </div>
    <div class="veiculos-grid" id="veiculosGrid">${renderVeiculoCards(veiculos)}</div>`;
}

function renderVeiculoCards(lista) {
  if(!Array.isArray(lista)||!lista.length) return '<p style="color:var(--text-light);grid-column:1/-1;padding:40px;text-align:center">Nenhum veículo encontrado.</p>';
  const obras=DB.getObras();
  return lista.map(v=>{
    const vObras  = obras.filter(o=>o.veiculo_id===v.id||o.matricula===v.matricula);
    const abertas = vObras.filter(o=>o.estado==='aberta').length;
    const alerta  = DB.getAlerta(v.id);
    const nAl     = alerta ? contarAlertasVeiculo(alerta) : 0;
    return `
      <div class="veiculo-card ${v.estado_op==='inativo'?'veiculo-card-inativo':''}" onclick="ir('veiculo-historico',{id:'${v.id}'})">
        <div class="veiculo-icon">${iconVeiculo(v.tipo)}</div>
        <div class="veiculo-info" style="flex:1;min-width:0">
          <h4>${v.marca} ${v.modelo}</h4>
          <p>${TIPO_LABEL[v.tipo]||v.tipo} · ${v.ano} · <strong style="color:var(--primary)">${v.setor||'—'}</strong></p>
          <span class="matricula">${v.matricula}</span>
          <div style="margin-top:3px;font-size:11px;color:var(--text-light)">${v.patrimonio} · ${v.categoria||''}</div>
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px;">
            ${badgeEstadoOp(v.estado_op)}
            ${abertas>0?`<span class="badge badge-red" style="font-size:10.5px;">${abertas} obra${abertas>1?'s':''} aberta${abertas>1?'s':''}</span>`:''}
            ${nAl>0?`<span class="badge badge-orange" style="font-size:10.5px;">${icon('bell',10)} ${nAl} alerta${nAl>1?'s':''}</span>`:''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          <button class="btn btn-sm btn-outline btn-icon" title="Editar"
            onclick="event.stopPropagation();modalEditarVeiculo('${v.id}')">${icon('edit',13)}</button>
          <button class="btn btn-sm btn-outline btn-icon" title="Setor"
            onclick="event.stopPropagation();modalEditarSetor('${v.id}')">${icon('sector',13)}</button>
          <button class="btn btn-sm btn-danger btn-icon" title="Eliminar"
            onclick="event.stopPropagation();eliminarVeiculo('${v.id}')">${icon('trash',13)}</button>
        </div>
      </div>`;
  }).join('');
}

function filtrarVeiculos() {
  const q  = (document.getElementById('searchVeiculo')?.value||'').toLowerCase();
  const t  = document.getElementById('filtroTipoV')?.value||'';
  const s  = document.getElementById('filtroSetorV')?.value||'';
  const eop= document.getElementById('filtroEstadoOp')?.value||'';
  const lista=(window._veiculos||[]).filter(v=>{
    const match = !q||`${v.marca} ${v.modelo} ${v.matricula} ${v.patrimonio} ${v.categoria||''}`.toLowerCase().includes(q);
    const tipo  = !t||v.tipo===t;
    const setor = !s||v.setor===s;
    const estop = !eop||v.estado_op===eop;
    return match&&tipo&&setor&&estop;
  });
  document.getElementById('veiculosGrid').innerHTML=renderVeiculoCards(lista);
}

/* ── Formulário Veículo ── */
function htmlFormVeiculo(v=null) {
  return `<form onsubmit="return false;">
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Matrícula *</label>
        <input type="text" class="form-control" id="vf_mat" value="${esc(v?.matricula||'')}" placeholder="00-AA-00" required style="text-transform:uppercase"></div>
      <div class="form-group"><label class="form-label">Nº de Património *</label>
        <input type="text" class="form-control" id="vf_pat" value="${esc(v?.patrimonio||'')}" placeholder="PAT-000" required></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Tipo *</label>
        <select class="form-control" id="vf_tipo">
          <option value="ligeiro" ${!v||v.tipo==='ligeiro'?'selected':''}>Ligeiro</option>
          <option value="pesado"  ${v?.tipo==='pesado'?'selected':''}>Pesado</option>
          <option value="maquina" ${v?.tipo==='maquina'?'selected':''}>Máquina</option>
        </select></div>
      <div class="form-group"><label class="form-label">Categoria</label>
        <input type="text" class="form-control" id="vf_cat" value="${esc(v?.categoria||'')}" placeholder="Carrinha, Camião, Retroescavadora…"></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Marca *</label>
        <input type="text" class="form-control" id="vf_marca" value="${esc(v?.marca||'')}" required></div>
      <div class="form-group"><label class="form-label">Modelo *</label>
        <input type="text" class="form-control" id="vf_modelo" value="${esc(v?.modelo||'')}" required></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Ano *</label>
        <input type="number" class="form-control" id="vf_ano" value="${v?.ano||new Date().getFullYear()}" min="1980" max="${new Date().getFullYear()+1}"></div>
      <div class="form-group"><label class="form-label">Setor *</label>
        <select class="form-control" id="vf_setor">
          ${SETORES.map(s=>`<option value="${s}" ${v?.setor===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Departamento</label>
        <select class="form-control" id="vf_dep">
          ${DEPARTAMENTOS.map(d=>`<option value="${d}" ${v?.departamento===d?'selected':''}>${d}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Estado Operacional</label>
        <select class="form-control" id="vf_eop">
          <option value="operacional" ${!v||v.estado_op==='operacional'?'selected':''}>Operacional</option>
          <option value="manutencao"  ${v?.estado_op==='manutencao'?'selected':''}>Em Manutenção</option>
          <option value="avaria"      ${v?.estado_op==='avaria'?'selected':''}>Avaria</option>
          <option value="inativo"     ${v?.estado_op==='inativo'?'selected':''}>Inativo</option>
        </select></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Combustível</label>
        <select class="form-control" id="vf_comb">
          <option ${v?.combustivel==='Diesel'||!v?'selected':''}>Diesel</option>
          <option ${v?.combustivel==='Gasolina'?'selected':''}>Gasolina</option>
          <option ${v?.combustivel==='Elétrico'?'selected':''}>Elétrico</option>
          <option ${v?.combustivel==='Híbrido'?'selected':''}>Híbrido</option>
          <option ${v?.combustivel==='GPL'?'selected':''}>GPL</option>
        </select></div>
      <div class="form-group"><label class="form-label">Km / Horas</label>
        <input type="number" class="form-control" id="vf_km" value="${v?.km||v?.horas||0}" min="0"></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Responsável</label>
        <input type="text" class="form-control" id="vf_resp" value="${esc(v?.responsavel||'')}"></div>
      <div class="form-group"><label class="form-label">Localização</label>
        <input type="text" class="form-control" id="vf_loc" value="${esc(v?.localizacao||'')}"></div>
    </div>
  </form>`;
}

function modalNovoVeiculo() {
  openModal('Novo Veículo / Máquina', htmlFormVeiculo(),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarVeiculo()">${icon('save')} Registar</button>`);
}
function modalEditarVeiculo(vid) {
  const v=DB.getVeiculo(vid); if(!v) return;
  openModal(`Editar — ${v.matricula}`, htmlFormVeiculo(v),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="guardarVeiculo('${vid}')">${icon('save')} Guardar</button>`);
}

function _lerFormVeiculo() {
  return {
    matricula:    (document.getElementById('vf_mat')?.value||'').trim().toUpperCase(),
    patrimonio:   (document.getElementById('vf_pat')?.value||'').trim(),
    tipo:         document.getElementById('vf_tipo')?.value||'ligeiro',
    categoria:    (document.getElementById('vf_cat')?.value||'').trim(),
    marca:        (document.getElementById('vf_marca')?.value||'').trim(),
    modelo:       (document.getElementById('vf_modelo')?.value||'').trim(),
    ano:          parseInt(document.getElementById('vf_ano')?.value)||new Date().getFullYear(),
    setor:        document.getElementById('vf_setor')?.value||SETORES[0],
    departamento: document.getElementById('vf_dep')?.value||'',
    estado_op:    document.getElementById('vf_eop')?.value||'operacional',
    combustivel:  document.getElementById('vf_comb')?.value||'Diesel',
    km:           parseInt(document.getElementById('vf_km')?.value)||0,
    responsavel:  (document.getElementById('vf_resp')?.value||'').trim(),
    localizacao:  (document.getElementById('vf_loc')?.value||'').trim(),
    ativo:        true
  };
}

function criarVeiculo() {
  const d=_lerFormVeiculo();
  if(!d.matricula||!d.patrimonio||!d.marca||!d.modelo){toastMsg('Preencha todos os campos obrigatórios','error');return;}
  if(DB.getVeiculos().some(v=>v.matricula===d.matricula)){toastMsg('Matrícula já registada','error');return;}
  DB.criarVeiculo(d);
  closeModal(); toastMsg(`Veículo ${d.matricula} registado com sucesso!`,'success'); renderVeiculos();
}
function guardarVeiculo(vid) {
  const d=_lerFormVeiculo();
  if(!d.matricula||!d.patrimonio||!d.marca||!d.modelo){toastMsg('Preencha todos os campos obrigatórios','error');return;}
  DB.actualizarVeiculo(vid,d);
  closeModal(); toastMsg('Veículo atualizado!','success'); renderVeiculos();
}
function eliminarVeiculo(vid) {
  const v=DB.getVeiculo(vid); if(!v) return;
  const obras=DB.getObras().filter(o=>o.veiculo_id===vid||o.matricula===v.matricula);
  const msg=obras.length>0
    ?`Atenção: O veículo ${v.matricula} tem ${obras.length} obra(s). Eliminar o veículo não apagará as obras.\n\nDeseja continuar?`
    :`Eliminar o veículo ${v.matricula}?`;
  if(!confirm(msg)) return;
  DB.eliminarVeiculo(vid);
  toastMsg('Veículo eliminado.','warning'); renderVeiculos();
}

/* ── Setor ── */
function modalEditarSetor(vid) {
  const veiculos=DB.getVeiculos();
  if(vid){
    const v=veiculos.find(x=>x.id===vid); if(!v) return;
    openModal(`Alterar Setor — ${v.matricula}`,`
      <div class="alert-box alert-box-info">${icon('info',15)} A alteração do setor não afeta o histórico de obras existentes.</div>
      <div class="form-group"><label class="form-label">Novo Setor *</label>
        <select class="form-control" id="novo_setor">
          ${SETORES.map(s=>`<option value="${s}" ${v.setor===s?'selected':''}>${s}</option>`).join('')}
        </select></div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="guardarSetor('${vid}')">${icon('save')} Guardar</button>`);
  } else {
    openModal('Gerir Setores',`
      <div class="table-wrapper"><table>
        <thead><tr><th>Matrícula</th><th>Veículo</th><th>Setor</th><th>Ação</th></tr></thead>
        <tbody>${veiculos.map(v=>`
          <tr><td><strong>${v.matricula}</strong></td><td>${v.marca} ${v.modelo}</td>
          <td><span class="badge badge-blue">${v.setor||'—'}</span></td>
          <td><button class="btn btn-sm btn-outline" onclick="closeModal();setTimeout(()=>modalEditarSetor('${v.id}'),150)">${icon('edit',13)} Alterar</button></td>
          </tr>`).join('')}
        </tbody></table></div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Fechar</button>`,true);
  }
}
function guardarSetor(vid) {
  const novo=document.getElementById('novo_setor')?.value; if(!novo) return;
  DB.actualizarVeiculo(vid,{setor:novo});
  closeModal(); toastMsg('Setor atualizado!','success'); renderVeiculos();
}

/* ================================================================
   12. OBRAS — LISTA
   ================================================================ */
function renderObras() {
  const obras=[...DB.getObras()].sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
  window._obras=obras;
  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-primary" onclick="modalCriarObra()">${icon('plus')} Nova Obra</button>`;
  document.getElementById('pageContainer').innerHTML=`
    <div class="page-header">
      <div><h2>Gestão de Obras</h2><p>${obras.length} obras registadas</p></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" placeholder="Pesquisar…" id="searchObra" oninput="filtrarObras()">
      <select class="form-control" id="filtroEstado" onchange="filtrarObras()">
        <option value="">Todos os estados</option>
        <option value="aberta">Abertas</option><option value="fechada">Fechadas</option>
      </select>
      <select class="form-control" id="filtroInt" onchange="filtrarObras()">
        <option value="">Todos os tipos</option>
        ${TIPOS_INT.map(t=>`<option value="${t}">${t}</option>`).join('')}
      </select>
      <select class="form-control" id="filtroSetor" onchange="filtrarObras()">
        <option value="">Todos os setores</option>
        ${SETORES.map(s=>`<option>${s}</option>`).join('')}
      </select>
    </div>
    <div class="card"><div class="table-wrapper"><table>
      <thead><tr><th>Nº Obra</th><th>Matrícula</th><th>Setor</th><th>Tipo(s)</th><th>Entrada</th><th>Imob.</th><th>Estado</th><th>Ações</th></tr></thead>
      <tbody id="obrasBody">${rowsObras(obras)}</tbody>
    </table></div></div>`;
  iniciarTimersImob();
}

function rowsObras(lista) {
  if(!Array.isArray(lista)||!lista.length) return `<tr><td colspan="8" class="table-empty">Nenhuma obra encontrada.</td></tr>`;
  return lista.map(o=>`
    <tr>
      <td><strong>${o.numero_obra}</strong></td>
      <td>${esc(o.matricula)}</td>
      <td><span class="badge badge-blue" style="font-size:11px">${esc(o.setor_snapshot||'—')}</span></td>
      <td>${badgeTipos(o.tipos_intervencao)}</td>
      <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
      <td><span class="${o.estado==='aberta'?'imob-live badge badge-orange':'badge badge-gray'}" data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">
        ${calcDuracao(o.data_entrada,o.data_saida)}</span></td>
      <td>${badgeEstado(o.estado)}</td>
      <td><div style="display:flex;gap:3px;">
        <button class="btn btn-sm btn-outline btn-icon" title="Ver" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',14)}</button>
        <button class="btn btn-sm btn-secondary btn-icon" title="Imprimir" onclick="imprimirObra('${o.id}')">${icon('print',14)}</button>
        ${o.estado==='aberta'?`
        <button class="btn btn-sm btn-warning btn-icon" title="Actualizar" onclick="modalActualizar('${o.id}')">${icon('edit',14)}</button>
        <button class="btn btn-sm btn-success btn-icon" title="Fechar" onclick="modalFechar('${o.id}')">${icon('check',14)}</button>`:''}
      </div></td>
    </tr>`).join('');
}

function filtrarObras() {
  const q =(document.getElementById('searchObra')?.value||'').toLowerCase();
  const es= document.getElementById('filtroEstado')?.value||'';
  const ti= document.getElementById('filtroInt')?.value||'';
  const se= document.getElementById('filtroSetor')?.value||'';
  const lista=(window._obras||[]).filter(o=>{
    const match=!q||`${o.numero_obra} ${esc(o.matricula)} ${o.descricao_avaria}`.toLowerCase().includes(q);
    const tipok=!ti||tiposArray(o.tipos_intervencao).includes(ti);
    const setork=!se||(o.setor_snapshot||'')===se;
    return match&&(!es||o.estado===es)&&tipok&&setork;
  });
  document.getElementById('obrasBody').innerHTML=rowsObras(lista);
}

/* ── Modais obras ── */
function modalCriarObra() {
  const veiculos=DB.getVeiculos();
  openModal('Nova Obra',`
    <form onsubmit="return false;">
      <div class="form-group"><label class="form-label">Veículo *</label>
        <select class="form-control" id="nv_veiculo">
          <option value="">— Selecione —</option>
          ${veiculos.map(v=>`<option value="${v.id}" data-mat="${v.matricula}" data-pat="${v.patrimonio}" data-setor="${v.setor}">${v.matricula} — ${v.marca} ${v.modelo} (${v.setor})</option>`).join('')}
        </select></div>
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Data/Hora de Entrada *</label>
          <input type="datetime-local" class="form-control" id="nv_entrada" value="${localISO(new Date())}"></div>
        <div class="form-group"><label class="form-label">Data/Hora de Saída</label>
          <input type="datetime-local" class="form-control" id="nv_saida"></div>
      </div>
      <div class="form-group"><label class="form-label">Tipos de Intervenção *</label>${htmlCheckboxesTipos([],'nv')}</div>
      <div class="form-group"><label class="form-label">Descrição *</label>
        <textarea class="form-control" id="nv_desc" rows="3" placeholder="Descreva a avaria ou motivo da intervenção…"></textarea></div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarObra()">${icon('save')} Criar Obra</button>`);
}

function criarObra() {
  const sel=document.getElementById('nv_veiculo');
  const vid=sel?.value; if(!vid){toastMsg('Selecione um veículo','error');return;}
  const opt=sel.options[sel.selectedIndex];
  const mat=opt.dataset.mat||'', pat=opt.dataset.pat||'', setor=opt.dataset.setor||'';
  const entrada=document.getElementById('nv_entrada')?.value;
  const saida  =document.getElementById('nv_saida')?.value||null;
  const tipos  =lerCheckboxesTipos('nv');
  const desc   =(document.getElementById('nv_desc')?.value||'').trim();
  if(!entrada){toastMsg('Preencha a data de entrada','error');return;}
  if(!tipos.length){toastMsg('Selecione pelo menos um tipo de intervenção','error');return;}
  if(!desc){toastMsg('Preencha a descrição','error');return;}
  const ano=new Date(entrada).getFullYear();
  const num=DB.proximoNumeroObra(ano);
  DB.criarObra({numero_obra:num,veiculo_id:vid,matricula:mat,patrimonio:pat,setor_snapshot:setor,
    data_entrada:entrada,data_saida:saida,estado:'aberta',tipos_intervencao:tipos,descricao_avaria:desc,
    trabalhos_realizados:'',pecas_materiais:'',servicos_externos:'',
    custo_mao_obra:0,custo_servicos_externos:0,custo_materiais:0,custo_total:0});
  closeModal(); toastMsg(`Obra ${num} criada!`,'success');
  setTimeout(()=>ir('obras'),350);
}

function modalCriarObraVeiculo(vid,mat,pat) {
  const v=DB.getVeiculo(vid); if(!v) return;
  modalCriarObra();
  setTimeout(()=>{
    const sel=document.getElementById('nv_veiculo');
    if(sel){sel.value=vid;}
  },100);
}

function modalActualizar(id) {
  const o=DB.getObra(id); if(!o) return;
  openModal(`Actualizar Obra ${o.numero_obra}`,`
    <form onsubmit="return false;">
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Data/Hora de Entrada</label>
          <input type="datetime-local" class="form-control" id="ua_entrada" value="${o.data_entrada||''}"></div>
        <div class="form-group"><label class="form-label">Data/Hora de Saída</label>
          <input type="datetime-local" class="form-control" id="ua_saida" value="${o.data_saida||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Tipos de Intervenção</label>${htmlCheckboxesTipos(o.tipos_intervencao,'ua')}</div>
      <div class="form-group"><label class="form-label">Trabalhos Realizados</label>
        <textarea class="form-control" id="ua_trabalhos" rows="3">${esc(o.trabalhos_realizados||'')}</textarea></div>
      <div class="form-group"><label class="form-label">Peças e Materiais</label>
        <textarea class="form-control" id="ua_pecas" rows="3">${esc(o.pecas_materiais||'')}</textarea></div>
      <div class="form-group"><label class="form-label">Serviços Externos</label>
        <textarea class="form-control" id="ua_servicos" rows="2">${esc(o.servicos_externos||'')}</textarea></div>
      <div class="form-row form-row-3">
        <div class="form-group"><label class="form-label">Mão de Obra (€)</label>
          <input type="number" step="0.01" class="form-control" id="ua_mao" value="${o.custo_mao_obra||0}"></div>
        <div class="form-group"><label class="form-label">Serviços Ext. (€)</label>
          <input type="number" step="0.01" class="form-control" id="ua_servext" value="${o.custo_servicos_externos||0}"></div>
        <div class="form-group"><label class="form-label">Materiais (€)</label>
          <input type="number" step="0.01" class="form-control" id="ua_mat" value="${o.custo_materiais||0}"></div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="actualizarObra('${id}')">${icon('save')} Guardar</button>`);
}

function actualizarObra(id) {
  const entrada=document.getElementById('ua_entrada')?.value||null;
  const saida  =document.getElementById('ua_saida')?.value||null;
  const tipos  =lerCheckboxesTipos('ua');
  const trab   =document.getElementById('ua_trabalhos')?.value||'';
  const pecas  =document.getElementById('ua_pecas')?.value||'';
  const serv   =document.getElementById('ua_servicos')?.value||'';
  if(entrada&&!dataValida(entrada)){toastMsg('Data de entrada inválida','error');return;}
  if(saida&&!intervaloValido(entrada,saida)){toastMsg('A saída não pode ser anterior à entrada','error');return;}
  const mao    =parseFloat(document.getElementById('ua_mao')?.value)||0;
  const servext=parseFloat(document.getElementById('ua_servext')?.value)||0;
  const mat    =parseFloat(document.getElementById('ua_mat')?.value)||0;
  DB.actualizarObra(id,{data_entrada:entrada,data_saida:saida,tipos_intervencao:tipos,
    trabalhos_realizados:trab,pecas_materiais:pecas,servicos_externos:serv,
    custo_mao_obra:mao,custo_servicos_externos:servext,custo_materiais:mat});
  closeModal(); toastMsg('Obra actualizada!','success');
  const pg=typeof paginaAtual!=='undefined'?paginaAtual:'';
  if(pg==='obra-detalhe') setTimeout(()=>renderObraDetalhe(id),350);
  else setTimeout(()=>ir('obras'),350);
}

function modalFechar(id) {
  const o=DB.getObra(id); if(!o) return;
  openModal(`Fechar Obra ${o.numero_obra}`,`
    <form onsubmit="return false;">
      <div class="alert-box alert-box-info">${icon('info',15)} Ao fechar a obra, registam-se os custos finais.</div>
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Data/Hora de Entrada</label>
          <input type="datetime-local" class="form-control" id="fc_entrada" value="${o.data_entrada||''}"></div>
        <div class="form-group"><label class="form-label">Data/Hora de Saída *</label>
          <input type="datetime-local" class="form-control" id="fc_saida" value="${localISO(new Date())}"></div>
      </div>
      <div class="form-row form-row-3">
        <div class="form-group"><label class="form-label">Mão de Obra (€)</label>
          <input type="number" step="0.01" class="form-control" id="fc_mao" value="${o.custo_mao_obra||0}"></div>
        <div class="form-group"><label class="form-label">Serviços Ext. (€)</label>
          <input type="number" step="0.01" class="form-control" id="fc_serv" value="${o.custo_servicos_externos||0}"></div>
        <div class="form-group"><label class="form-label">Materiais (€)</label>
          <input type="number" step="0.01" class="form-control" id="fc_mat" value="${o.custo_materiais||0}"></div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-success" onclick="fecharObra('${id}')">${icon('check')} Fechar Obra</button>`);
}

function fecharObra(id) {
  const saida =document.getElementById('fc_saida')?.value;
  const entrada=document.getElementById('fc_entrada')?.value||null;
  if(!saida||!dataValida(saida)){toastMsg('Preencha uma data/hora de saída válida','error');return;}
  if(entrada&&!intervaloValido(entrada,saida)){toastMsg('A saída não pode ser anterior à entrada','error');return;}
  const mao =parseFloat(document.getElementById('fc_mao')?.value)||0;
  const serv=parseFloat(document.getElementById('fc_serv')?.value)||0;
  const mat =parseFloat(document.getElementById('fc_mat')?.value)||0;
  DB.actualizarObra(id,{estado:'fechada',data_entrada:entrada,data_saida:saida,
    custo_mao_obra:mao,custo_servicos_externos:serv,custo_materiais:mat,custo_total:mao+serv+mat});
  closeModal(); toastMsg('Obra fechada com sucesso!','success');
  setTimeout(()=>ir('obras'),350);
}

function eliminarObra(id) {
  if(!confirm('Eliminar esta obra? Esta ação não pode ser desfeita.')) return;
  DB.eliminarObra(id);
  toastMsg('Obra eliminada.','warning');
  setTimeout(()=>ir('obras'),350);
}

/* ================================================================
   13. DETALHE DA OBRA
   ================================================================ */
function renderObraDetalhe(id) {
  const o=DB.getObra(id);
  if(!o){document.getElementById('pageContainer').innerHTML='<p style="color:var(--danger);padding:40px">Obra não encontrada.</p>';return;}
  const mao =Number(o.custo_mao_obra||0);
  const serv=Number(o.custo_servicos_externos||0);
  const mat =Number(o.custo_materiais||0);
  const tot =Number(o.custo_total||0)||(mao+serv+mat);

  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-secondary btn-sm" onclick="ir('obras')">${icon('back')} Voltar</button>
    <button class="btn btn-outline btn-sm" onclick="imprimirObra('${o.id}')">${icon('print')} Imprimir</button>
    ${o.estado==='aberta'?`
    <button class="btn btn-warning btn-sm" onclick="modalActualizar('${o.id}')">${icon('edit')} Actualizar</button>
    <button class="btn btn-success btn-sm" onclick="modalFechar('${o.id}')">${icon('check')} Fechar Obra</button>`:''}`;

  document.getElementById('pageContainer').innerHTML=`
    <div style="max-width:860px;margin:0 auto;">
      <div class="card" style="margin-bottom:16px;">
        <div style="padding:20px;background:linear-gradient(135deg,var(--primary-dark),var(--primary));border-radius:var(--radius) var(--radius) 0 0;color:#fff;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div><div style="font-size:22px;font-weight:800;">${o.numero_obra}</div>
              <div style="opacity:.8;font-size:13px;margin-top:3px;">${fmtDataHora(o.data_entrada)}</div></div>
            <div>${badgeEstado(o.estado)}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="obra-detail-grid">
            <div><div class="detail-label">Matrícula</div><div class="detail-value" style="font-size:20px;font-weight:800;color:var(--primary)">${esc(o.matricula)}</div></div>
            <div><div class="detail-label">Nº de Património</div><div class="detail-value">${esc(o.patrimonio||'—')}</div></div>
            <div><div class="detail-label">Setor</div><div class="detail-value"><span class="badge badge-blue">${esc(o.setor_snapshot||'—')}</span></div></div>
            <div><div class="detail-label">Estado</div><div class="detail-value">${badgeEstado(o.estado)}</div></div>
            <div><div class="detail-label">Entrada</div><div class="detail-value">${fmtDataHora(o.data_entrada)}</div></div>
            <div><div class="detail-label">Saída</div><div class="detail-value">${o.data_saida?fmtDataHora(o.data_saida):'<span style="color:var(--text-light)">— (em intervenção)</span>'}</div></div>
            <div style="grid-column:span 2"><div class="detail-label">Tempo de Imobilização</div>
              <div class="detail-value"><span class="${o.estado==='aberta'?'imob-live badge badge-orange':'badge badge-gray'}" data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">
                ${icon('timer',13)} ${calcDuracao(o.data_entrada,o.data_saida)}</span></div></div>
          </div>
          <div class="form-group"><div class="detail-label">Tipos de Intervenção</div>
            <div style="margin-top:6px;">${badgeTipos(o.tipos_intervencao)||'—'}</div></div>
          <div class="section-divider"></div>
          <div class="form-group"><div class="detail-label">Descrição da Avaria / Intervenção</div>
            <div class="text-block">${o.descricao_avaria||'<em style="color:var(--text-light)">Sem descrição</em>'}</div></div>
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
  if(o.estado==='aberta') iniciarTimersImob();
}

/* ================================================================
   14. HISTÓRICO DO VEÍCULO
   ================================================================ */
function renderVeiculoHistorico(id) {
  const v=DB.getVeiculo(id);
  if(!v){document.getElementById('pageContainer').innerHTML='<p style="color:var(--danger);padding:40px">Veículo não encontrado.</p>';return;}
  const obras   =DB.getObras().filter(o=>o.veiculo_id===id||o.matricula===v.matricula).sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
  const abertas =obras.filter(o=>o.estado==='aberta').length;
  const fechadas=obras.filter(o=>o.estado==='fechada').length;
  const custoAc =obras.filter(o=>o.estado==='fechada').reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);
  const minTot  =obras.reduce((s,o)=>s+calcMinutos(o.data_entrada,o.data_saida),0);
  const diasImob=Math.round(minTot/1440);
  const alerta  =DB.getAlerta(id);
  const nAl     =alerta?contarAlertasVeiculo(alerta):0;

  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-secondary btn-sm" onclick="ir('veiculos')">${icon('back')} Voltar</button>
    <button class="btn btn-primary btn-sm" onclick="modalCriarObraVeiculo('${v.id}','${v.matricula}','${v.patrimonio}')">${icon('plus')} Nova Obra</button>`;

  document.getElementById('pageContainer').innerHTML=`
    <div style="max-width:900px;margin:0 auto;">
      <div class="card" style="margin-bottom:20px;">
        <div class="historico-header">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:56px;height:56px;background:rgba(255,255,255,.15);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:#fff;">${iconVeiculo(v.tipo,26)}</div>
            <div><h3>${v.marca} ${v.modelo}</h3><p>${TIPO_LABEL[v.tipo]||v.tipo} · ${v.ano} · ${v.categoria||''}</p></div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${badgeEstadoOp(v.estado_op)}
            <span class="matricula">${v.matricula}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="obra-detail-grid">
            <div><div class="detail-label">Nº de Património</div><div class="detail-value">${v.patrimonio}</div></div>
            <div><div class="detail-label">Setor Atual</div><div class="detail-value"><span class="badge badge-blue">${v.setor||'—'}</span></div></div>
            <div><div class="detail-label">Departamento</div><div class="detail-value" style="font-size:12px">${v.departamento||'—'}</div></div>
            <div><div class="detail-label">Responsável</div><div class="detail-value">${v.responsavel||'—'}</div></div>
            <div><div class="detail-label">Combustível</div><div class="detail-value">${v.combustivel||'—'}</div></div>
            <div><div class="detail-label">Km / Horas</div><div class="detail-value">${(v.km||v.horas||0).toLocaleString('pt-PT')} ${v.tipo==='maquina'?'h':'km'}</div></div>
            <div><div class="detail-label">Localização</div><div class="detail-value">${v.localizacao||'—'}</div></div>
            ${nAl>0?`<div><div class="detail-label">Alertas</div><div class="detail-value"><span class="badge badge-red">${icon('alert',12)} ${nAl} alerta${nAl>1?'s':''}</span></div></div>`:''}
          </div>
        </div>
      </div>

      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
        <div class="stat-card"><div class="stat-icon blue">${icon('history',18)}</div>
          <div class="stat-info"><div class="stat-value">${obras.length}</div><div class="stat-label">Total Obras</div></div></div>
        <div class="stat-card"><div class="stat-icon red">${icon('tools',18)}</div>
          <div class="stat-info"><div class="stat-value">${abertas}</div><div class="stat-label">Abertas</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">${icon('timer',18)}</div>
          <div class="stat-info"><div class="stat-value">${diasImob}d</div><div class="stat-label">Dias Imob.</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">${icon('euro',18)}</div>
          <div class="stat-info"><div class="stat-value" style="font-size:16px">${fmtEuro(custoAc)}</div><div class="stat-label">Custo Total</div></div></div>
      </div>

      ${alerta?`
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header"><span class="card-title">${icon('bell',15)} Alertas & Certificações</span>
          <button class="btn btn-sm btn-outline" onclick="modalEditarAlerta('${alerta.id}')">${icon('edit',13)} Editar</button></div>
        <div class="card-body">
          <div class="alertas-grid">
            ${_rowAlertaSimples('ITP',alerta.itp_proxima,alerta.itp_antec||30,alerta.itp_ultima)}
            ${_rowAlertaSimples('Seguro',alerta.seguro_valido_ate,30,null)}
            ${_rowAlertaSimples('Revisão',alerta.revisao_proxima,30,alerta.revisao_ultima)}
            ${_rowAlertaSimples('Mudança de Óleo',alerta.oleo_proxima_data,14,alerta.oleo_ultima_data)}
            ${alerta.grua_proxima?_rowAlertaSimples('Certif. Grua',alerta.grua_proxima,60,alerta.grua_ultima):''}
            ${alerta.caixa_proxima?_rowAlertaSimples('Certif. Caixa',alerta.caixa_proxima,60,alerta.caixa_ultima):''}
            ${alerta.tacografo_proxima?_rowAlertaSimples('Tacógrafo',alerta.tacografo_proxima,30,alerta.tacografo_ultima):''}
            ${_rowAlertaSimples('Extintores',alerta.extintor_validade,30,null)}
            ${_rowAlertaSimples('Licenciamento',alerta.licenciamento_validade,30,null)}
          </div>
          ${alerta.observacoes?`<p style="margin-top:12px;font-size:12px;color:var(--text-medium)">${icon('info',12)} ${esc(alerta.observacoes)}</p>`:''}
        </div>
      </div>`:`
      <div class="card" style="margin-bottom:20px;"><div class="card-body" style="text-align:center;padding:32px;color:var(--text-light)">
        <p>Sem registo de alertas para este veículo.</p>
        <button class="btn btn-outline" style="margin-top:12px" onclick="modalNovoAlertaVeiculo('${v.id}')">Adicionar Alertas</button>
      </div></div>`}

      <div class="card">
        <div class="card-header"><span class="card-title">${icon('history',15)} Histórico de Obras (${obras.length})</span></div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Nº Obra</th><th>Tipo(s)</th><th>Entrada</th><th>Imob.</th><th>Estado</th><th>Custo</th><th></th></tr></thead>
          <tbody>
            ${obras.length===0?`<tr><td colspan="7" class="table-empty">Sem obras registadas.</td></tr>`
            :obras.map(o=>`
              <tr>
                <td><strong>${o.numero_obra}</strong></td>
                <td>${badgeTipos(o.tipos_intervencao)}</td>
                <td style="white-space:nowrap">${fmtDataHora(o.data_entrada)}</td>
                <td><span class="${o.estado==='aberta'?'imob-live badge badge-orange':'badge badge-gray'}" data-entrada="${o.data_entrada||''}" data-saida="${o.data_saida||''}">${calcDuracao(o.data_entrada,o.data_saida)}</span></td>
                <td>${badgeEstado(o.estado)}</td>
                <td>${o.estado==='fechada'?fmtEuro(o.custo_total):'—'}</td>
                <td><button class="btn btn-sm btn-outline btn-icon" onclick="ir('obra-detalhe',{id:'${o.id}'})">${icon('eye',13)}</button></td>
              </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
  iniciarTimersImob();
}

function _rowAlertaSimples(label, dataProx, antec, dataUlt) {
  const st=alertaStatus(dataProx,antec);
  const d=diasAte(dataProx);
  let statusHtml='';
  if(st==='expirado') statusHtml=`<span class="badge badge-red">${icon('alert',10)} Expirado (${Math.abs(d)}d)</span>`;
  else if(st==='proximo') statusHtml=`<span class="badge badge-yellow">${icon('alert',10)} Próximo (${d}d)</span>`;
  else if(st==='ok') statusHtml=`<span class="badge badge-green">${icon('check',10)} Válido (${d}d)</span>`;
  else statusHtml=`<span class="badge badge-gray">Sem data</span>`;
  return `<div class="alerta-row">
    <div class="alerta-row-label">${label}</div>
    <div class="alerta-row-data">${dataUlt?fmtData(dataUlt):'—'}</div>
    <div class="alerta-row-prox">${dataProx?fmtData(dataProx):'—'}</div>
    <div>${statusHtml}</div>
  </div>`;
}

/* ================================================================
   15. ALERTAS & CERTIFICAÇÕES
   ================================================================ */
function renderAlertas() {
  const alertas =DB.getAlertas();
  const veiculos=DB.getVeiculos();
  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-primary" onclick="modalNovoAlerta()">${icon('plus')} Registar Alertas</button>`;

  /* Calcular totais */
  let totalExp=0, totalProx=0, totalOk=0;
  const linhas=[];
  alertas.forEach(al=>{
    const v=veiculos.find(x=>x.id===al.veiculo_id)||{matricula:al.matricula,tipo:'ligeiro',marca:'',modelo:'',setor:'',departamento:''};
    Object.entries(ALERTA_ANTEC).forEach(([campo,antec])=>{
      const dataVal=al[campo];
      if(!dataVal) return;
      const st=alertaStatus(dataVal,antec);
      const d=diasAte(dataVal);
      if(st==='expirado') totalExp++;
      else if(st==='proximo') totalProx++;
      else totalOk++;
      const labelKey=campo.replace('_proxima','').replace('_valido_ate','').replace('_ultima_data','').replace('_validade','');
      const labelFinal=ALERTA_LABEL[labelKey]||ALERTA_LABEL[Object.keys(ALERTA_LABEL).find(k=>campo.startsWith(k))||'']||campo;
      linhas.push({al,v,campo,dataVal,st,d,label:labelFinal});
    });
  });

  /* Ordenar: expirado → proximo → ok */
  linhas.sort((a,b)=>{
    const ord={expirado:0,proximo:1,ok:2,sem_data:3};
    return (ord[a.st]||3)-(ord[b.st]||3) || (a.d||9999)-(b.d||9999);
  });

  document.getElementById('pageContainer').innerHTML=`
    <div class="page-header">
      <div><h2>Alertas &amp; Certificações</h2><p>Monitorização de prazos e documentação da frota</p></div>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
      <div class="stat-card" style="${totalExp>0?'border-color:var(--danger)':''}">
        <div class="stat-icon red">${icon('alert',22)}</div>
        <div class="stat-info"><div class="stat-value">${totalExp}</div><div class="stat-label">Expirados</div></div>
      </div>
      <div class="stat-card" style="${totalProx>0?'border-color:var(--warning)':''}">
        <div class="stat-icon yellow">${icon('bell',22)}</div>
        <div class="stat-info"><div class="stat-value">${totalProx}</div><div class="stat-label">Próximos do Prazo</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">${icon('checkCircle',22)}</div>
        <div class="stat-info"><div class="stat-value">${totalOk}</div><div class="stat-label">Em Dia</div></div>
      </div>
    </div>

    <div class="filter-bar" style="margin-bottom:16px;">
      <input type="text" class="form-control" placeholder="Pesquisar matrícula…" id="searchAlerta" oninput="filtrarAlertas()">
      <select class="form-control" id="filtroAlertaTipo" onchange="filtrarAlertas()">
        <option value="">Todos os tipos de alerta</option>
        ${Object.entries(ALERTA_LABEL).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
      </select>
      <select class="form-control" id="filtroAlertaStatus" onchange="filtrarAlertas()">
        <option value="">Todos os estados</option>
        <option value="expirado">Expirado</option>
        <option value="proximo">Próximo do prazo</option>
        <option value="ok">Em dia</option>
      </select>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Matrícula</th><th>Tipo</th><th>Departamento</th><th>Certificação / Documento</th><th>Validade</th><th>Estado</th><th>Dias</th><th>Ação</th></tr></thead>
          <tbody id="alertasBody">${rowsAlertas(linhas)}</tbody>
        </table>
      </div>
    </div>`;
  window._alertasLinhas=linhas;
}

function rowsAlertas(linhas) {
  if(!linhas.length) return '<tr><td colspan="8" class="table-empty">Nenhum alerta encontrado.</td></tr>';
  return linhas.map(({al,v,campo,dataVal,st,d,label})=>`
    <tr class="${st==='expirado'?'row-aberta':''}">
      <td><strong>${al.matricula}</strong><div style="font-size:11px;color:var(--text-medium)">${v.marca||''} ${v.modelo||''}</div></td>
      <td>${icon(v.tipo==='pesado'?'truck':v.tipo==='maquina'?'tractor':'car',13)} ${TIPO_LABEL[v.tipo]||'—'}</td>
      <td style="font-size:12px;color:var(--text-medium)">${v.departamento||'—'}</td>
      <td><strong>${label}</strong></td>
      <td style="white-space:nowrap">${fmtData(dataVal)}</td>
      <td>${badgeAlertaStatus(st)}</td>
      <td style="font-weight:600;color:${st==='expirado'?'var(--danger)':st==='proximo'?'var(--warning)':'var(--success)'}">${d!==null?(d<0?Math.abs(d)+'d atrás':d+'d'):'—'}</td>
      <td><button class="btn btn-sm btn-outline" onclick="ir('veiculo-historico',{id:'${al.veiculo_id}'})">${icon('eye',12)} Ver</button></td>
    </tr>`).join('');
}

window._alertasLinhas=[];
function filtrarAlertas() {
  const q  =(document.getElementById('searchAlerta')?.value||'').toLowerCase();
  const t  = document.getElementById('filtroAlertaTipo')?.value||'';
  const st = document.getElementById('filtroAlertaStatus')?.value||'';
  const linhas=(window._alertasLinhas||[]).filter(l=>{
    const matchQ=!q||l.al.matricula.toLowerCase().includes(q)||(l.v.marca||'').toLowerCase().includes(q);
    const matchT=!t||l.campo.startsWith(t);
    const matchS=!st||l.st===st;
    return matchQ&&matchT&&matchS;
  });
  document.getElementById('alertasBody').innerHTML=rowsAlertas(linhas);
}

/* ── Modal alertas ── */
function _htmlFormAlerta(al=null) {
  return `<form onsubmit="return false;" style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">
    <div class="form-group" style="grid-column:span 2"><h4 style="margin-bottom:8px;color:var(--primary)">${icon('shield',14)} ITP / Inspeção Técnica</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
        <div><label class="form-label">Última ITP</label><input type="date" class="form-control" id="al_itp_ult" value="${al?.itp_ultima||''}"></div>
        <div><label class="form-label">Próxima ITP</label><input type="date" class="form-control" id="al_itp_prox" value="${al?.itp_proxima||''}"></div>
        <div><label class="form-label">Antecedência (dias)</label><input type="number" class="form-control" id="al_itp_antec" value="${al?.itp_antec||30}"></div>
      </div></div>
    <div class="form-group"><label class="form-label">Seguro válido até</label><input type="date" class="form-control" id="al_seguro" value="${al?.seguro_valido_ate||''}"></div>
    <div class="form-group"><label class="form-label">Licenciamento válido até</label><input type="date" class="form-control" id="al_licenc" value="${al?.licenciamento_validade||''}"></div>
    <div class="form-group"><label class="form-label">Última Revisão</label><input type="date" class="form-control" id="al_rev_ult" value="${al?.revisao_ultima||''}"></div>
    <div class="form-group"><label class="form-label">Próxima Revisão</label><input type="date" class="form-control" id="al_rev_prox" value="${al?.revisao_proxima||''}"></div>
    <div class="form-group"><label class="form-label">Última Mudança Óleo</label><input type="date" class="form-control" id="al_oleo_ult" value="${al?.oleo_ultima_data||''}"></div>
    <div class="form-group"><label class="form-label">Próx. Mudança Óleo</label><input type="date" class="form-control" id="al_oleo_prox" value="${al?.oleo_proxima_data||''}"></div>
    <div class="form-group"><label class="form-label">Certif. Grua (última)</label><input type="date" class="form-control" id="al_grua_ult" value="${al?.grua_ultima||''}"></div>
    <div class="form-group"><label class="form-label">Certif. Grua (próxima)</label><input type="date" class="form-control" id="al_grua_prox" value="${al?.grua_proxima||''}"></div>
    <div class="form-group"><label class="form-label">Certif. Caixa (última)</label><input type="date" class="form-control" id="al_caixa_ult" value="${al?.caixa_ultima||''}"></div>
    <div class="form-group"><label class="form-label">Certif. Caixa (próxima)</label><input type="date" class="form-control" id="al_caixa_prox" value="${al?.caixa_proxima||''}"></div>
    <div class="form-group"><label class="form-label">Tacógrafo (última)</label><input type="date" class="form-control" id="al_tac_ult" value="${al?.tacografo_ultima||''}"></div>
    <div class="form-group"><label class="form-label">Tacógrafo (próximo)</label><input type="date" class="form-control" id="al_tac_prox" value="${al?.tacografo_proxima||''}"></div>
    <div class="form-group"><label class="form-label">Extintores (validade)</label><input type="date" class="form-control" id="al_ext" value="${al?.extintor_validade||''}"></div>
    <div class="form-group" style="grid-column:span 2"><label class="form-label">Observações</label>
      <textarea class="form-control" id="al_obs" rows="2">${esc(al?.observacoes||'')}</textarea></div>
  </form>`;
}
function _lerFormAlerta() {
  const g=id=>document.getElementById(id)?.value||null;
  return {
    itp_ultima:g('al_itp_ult'),itp_proxima:g('al_itp_prox'),itp_antec:parseInt(g('al_itp_antec'))||30,
    seguro_valido_ate:g('al_seguro'),licenciamento_validade:g('al_licenc'),
    revisao_ultima:g('al_rev_ult'),revisao_proxima:g('al_rev_prox'),
    oleo_ultima_data:g('al_oleo_ult'),oleo_proxima_data:g('al_oleo_prox'),
    grua_ultima:g('al_grua_ult'),grua_proxima:g('al_grua_prox'),
    caixa_ultima:g('al_caixa_ult'),caixa_proxima:g('al_caixa_prox'),
    tacografo_ultima:g('al_tac_ult'),tacografo_proxima:g('al_tac_prox'),
    extintor_validade:g('al_ext'),
    observacoes:g('al_obs')
  };
}
function modalNovoAlerta() {
  const veiculos=DB.getVeiculos();
  openModal('Registar Alertas — Novo Veículo',`
    <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Veículo *</label>
      <select class="form-control" id="al_veiculo">
        <option value="">— Selecione —</option>
        ${veiculos.map(v=>`<option value="${v.id}" data-mat="${v.matricula}">${v.matricula} — ${v.marca} ${v.modelo}</option>`).join('')}
      </select></div>
    ${_htmlFormAlerta()}`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarAlerta()">${icon('save')} Guardar</button>`,true);
}
function modalNovoAlertaVeiculo(vid) {
  const v=DB.getVeiculo(vid); if(!v) return;
  openModal(`Alertas — ${v.matricula}`,_htmlFormAlerta(),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarAlertaVeiculo('${vid}','${v.matricula}')">${icon('save')} Guardar</button>`,true);
}
function modalEditarAlerta(id) {
  const al=DB.getAlertas().find(a=>a.id===id); if(!al) return;
  openModal(`Editar Alertas — ${al.matricula}`,_htmlFormAlerta(al),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="guardarAlerta('${id}')">${icon('save')} Guardar</button>`,true);
}
function criarAlerta() {
  const sel=document.getElementById('al_veiculo');
  const vid=sel?.value; if(!vid){toastMsg('Selecione um veículo','error');return;}
  const mat=sel.options[sel.selectedIndex].dataset.mat||'';
  const campos=_lerFormAlerta();
  DB.criarAlerta({veiculo_id:vid,matricula:mat,...campos});
  closeModal(); toastMsg('Alertas registados!','success'); renderAlertas();
}
function criarAlertaVeiculo(vid,mat) {
  const campos=_lerFormAlerta();
  DB.criarAlerta({veiculo_id:vid,matricula:mat,...campos});
  closeModal(); toastMsg('Alertas registados!','success');
  renderVeiculoHistorico(vid);
}
function guardarAlerta(id) {
  const campos=_lerFormAlerta();
  DB.actualizarAlerta(id,campos);
  closeModal(); toastMsg('Alertas atualizados!','success');
  if(paginaAtual==='alertas') renderAlertas();
  else {
    const al=DB.getAlertas().find(a=>a.id===id);
    if(al) renderVeiculoHistorico(al.veiculo_id);
  }
}

/* ================================================================
   16. FATURAÇÃO / REQUISIÇÕES
   ================================================================ */
function renderFaturacao(tab='requisicoes') {
  const reqs   =DB.getReqs();
  const faturas=DB.getFaturas();
  const veiculos=DB.getVeiculos();

  document.getElementById('topbarActions').innerHTML=`
    <button class="btn btn-primary" id="btnNovaFaturacao" onclick="modalNovaReq()">${icon('plus')} Nova Requisição</button>`;

  document.getElementById('pageContainer').innerHTML=`
    <div class="page-header"><div><h2>Faturação / Requisições</h2></div></div>
    <div class="tab-bar" id="fatTabs">
      <button class="tab-btn ${tab==='requisicoes'?'active':''}" onclick="switchFatTab(this,'requisicoes')">Requisições (${reqs.length})</button>
      <button class="tab-btn ${tab==='faturas'?'active':''}" onclick="switchFatTab(this,'faturas')">Faturas (${faturas.length})</button>
    </div>
    <div id="fatTabRequisicoes" style="display:${tab==='requisicoes'?'block':'none'};">
      <div class="filter-bar"><input type="text" class="form-control" placeholder="Pesquisar…" id="searchReq" oninput="filtrarReqs()">
        <select class="form-control" id="filtroReqEstado" onchange="filtrarReqs()">
          <option value="">Todos os estados</option>
          <option>pendente</option><option>aprovada</option><option>rejeitada</option><option>concluida</option>
        </select></div>
      <div class="card"><div class="table-wrapper"><table>
        <thead><tr><th>Nº Req.</th><th>Matrícula</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Data</th><th>Estado</th><th>Ações</th></tr></thead>
        <tbody id="reqsBody">${rowsReqs(reqs)}</tbody>
      </table></div></div>
    </div>
    <div id="fatTabFaturas" style="display:${tab==='faturas'?'block':'none'};">
      <div class="filter-bar"><input type="text" class="form-control" placeholder="Pesquisar…" id="searchFat" oninput="filtrarFaturas()">
        <select class="form-control" id="filtroFatEstado" onchange="filtrarFaturas()">
          <option value="">Todos os estados</option>
          <option>pendente</option><option>paga</option><option>anulada</option>
        </select></div>
      <div class="card"><div class="table-wrapper"><table>
        <thead><tr><th>Nº Fatura</th><th>Nº Ext.</th><th>Matrícula</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Estado</th><th>Ações</th></tr></thead>
        <tbody id="faturasBody">${rowsFaturas(faturas)}</tbody>
      </table></div></div>
    </div>`;
  window._reqs=reqs; window._faturas=faturas;
}

function switchFatTab(btn,tab) {
  document.getElementById('fatTabs').querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('fatTabRequisicoes').style.display=tab==='requisicoes'?'block':'none';
  document.getElementById('fatTabFaturas').style.display=tab==='faturas'?'block':'none';
  const btnTop=document.getElementById('btnNovaFaturacao');
  if(btnTop){
    if(tab==='faturas'){btnTop.innerHTML=icon('plus')+' Nova Fatura';btnTop.onclick=()=>modalNovaFatura();}
    else{btnTop.innerHTML=icon('plus')+' Nova Requisição';btnTop.onclick=()=>modalNovaReq();}
  }
}

function rowsReqs(lista) {
  if(!Array.isArray(lista)||!lista.length) return '<tr><td colspan="8" class="table-empty">Nenhuma requisição encontrada.</td></tr>';
  return lista.map(r=>`
    <tr><td><strong>${r.numero_req}</strong></td><td>${r.matricula||'—'}</td>
    <td>${REQ_TIPO_LABEL[r.tipo]||r.tipo}</td>
    <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(r.descricao)}">${esc(r.descricao)}</td>
    <td><strong>${fmtEuro(r.valor)}</strong></td>
    <td>${fmtData(r.data)}</td><td>${badgeReqEstado(r.estado)}</td>
    <td><div style="display:flex;gap:3px;">
      <button class="btn btn-sm btn-outline btn-icon" onclick="modalEditarReq('${r.id}')">${icon('edit',13)}</button>
      <button class="btn btn-sm btn-danger btn-icon" onclick="eliminarReq('${r.id}')">${icon('trash',13)}</button>
    </div></td></tr>`).join('');
}
function rowsFaturas(lista) {
  if(!Array.isArray(lista)||!lista.length) return '<tr><td colspan="8" class="table-empty">Nenhuma fatura encontrada.</td></tr>';
  return lista.map(f=>`
    <tr><td><strong>${f.numero_fat}</strong></td><td style="font-size:12px">${f.numero_fatura_ext||'—'}</td>
    <td>${f.matricula||'—'}</td><td style="font-size:12px">${esc(f.fornecedor||'—')}</td>
    <td><strong>${fmtEuro(f.valor)}</strong></td>
    <td style="white-space:nowrap">${fmtData(f.data_vencimento)}</td>
    <td>${badgeFatEstado(f.estado)}</td>
    <td><div style="display:flex;gap:3px;">
      <button class="btn btn-sm btn-outline btn-icon" onclick="modalEditarFatura('${f.id}')">${icon('edit',13)}</button>
      <button class="btn btn-sm btn-danger btn-icon" onclick="eliminarFatura('${f.id}')">${icon('trash',13)}</button>
    </div></td></tr>`).join('');
}

function filtrarReqs() {
  const q=(document.getElementById('searchReq')?.value||'').toLowerCase();
  const es=document.getElementById('filtroReqEstado')?.value||'';
  const lista=(window._reqs||[]).filter(r=>{
    const m=!q||`${r.numero_req} ${r.matricula} ${r.descricao} ${r.fornecedor}`.toLowerCase().includes(q);
    return m&&(!es||r.estado===es);
  });
  document.getElementById('reqsBody').innerHTML=rowsReqs(lista);
}
function filtrarFaturas() {
  const q=(document.getElementById('searchFat')?.value||'').toLowerCase();
  const es=document.getElementById('filtroFatEstado')?.value||'';
  const lista=(window._faturas||[]).filter(f=>{
    const m=!q||`${f.numero_fat} ${f.matricula} ${f.fornecedor} ${f.descricao}`.toLowerCase().includes(q);
    return m&&(!es||f.estado===es);
  });
  document.getElementById('faturasBody').innerHTML=rowsFaturas(lista);
}

/* ── Modais Requisição ── */
function _htmlFormReq(r=null) {
  const veiculos=DB.getVeiculos(); const obras=DB.getObras();
  return `<form onsubmit="return false;">
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Veículo</label>
        <select class="form-control" id="req_veiculo">
          <option value="">— Opcional —</option>
          ${veiculos.map(v=>`<option value="${v.id}" data-mat="${v.matricula}" ${r?.veiculo_id===v.id?'selected':''}>${v.matricula} — ${v.marca} ${v.modelo}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Obra Associada</label>
        <select class="form-control" id="req_obra">
          <option value="">— Opcional —</option>
          ${obras.map(o=>`<option value="${o.id}" ${r?.obra_id===o.id?'selected':''}>${o.numero_obra} — ${esc(o.matricula)}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Tipo *</label>
        <select class="form-control" id="req_tipo">
          <option value="material" ${!r||r.tipo==='material'?'selected':''}>Material</option>
          <option value="servico"  ${r?.tipo==='servico'?'selected':''}>Serviço externo</option>
          <option value="outro"    ${r?.tipo==='outro'?'selected':''}>Outro</option>
        </select></div>
      <div class="form-group"><label class="form-label">Estado</label>
        <select class="form-control" id="req_estado">
          <option value="pendente"  ${!r||r.estado==='pendente'?'selected':''}>Pendente</option>
          <option value="aprovada"  ${r?.estado==='aprovada'?'selected':''}>Aprovada</option>
          <option value="rejeitada" ${r?.estado==='rejeitada'?'selected':''}>Rejeitada</option>
          <option value="concluida" ${r?.estado==='concluida'?'selected':''}>Concluída</option>
        </select></div>
    </div>
    <div class="form-group"><label class="form-label">Descrição *</label>
      <textarea class="form-control" id="req_desc" rows="2">${esc(r?.descricao||'')}</textarea></div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Valor (€)</label>
        <input type="number" step="0.01" class="form-control" id="req_valor" value="${r?.valor||0}"></div>
      <div class="form-group"><label class="form-label">Data</label>
        <input type="date" class="form-control" id="req_data" value="${r?.data||new Date().toISOString().slice(0,10)}"></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Fornecedor</label>
        <input type="text" class="form-control" id="req_fornecedor" value="${esc(r?.fornecedor||'')}"></div>
      <div class="form-group"><label class="form-label">Observações</label>
        <input type="text" class="form-control" id="req_obs" value="${esc(r?.observacoes||'')}"></div>
    </div>
  </form>`;
}
function modalNovaReq() {
  openModal('Nova Requisição',_htmlFormReq(),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarReq()">${icon('save')} Criar</button>`);
}
function modalEditarReq(id) {
  const r=DB.getReq(id); if(!r) return;
  openModal(`Editar ${r.numero_req}`,_htmlFormReq(r),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="guardarReq('${id}')">${icon('save')} Guardar</button>`);
}
function _lerFormReq() {
  const sel=document.getElementById('req_veiculo');
  const vid=sel?.value||null;
  const mat=vid&&sel.selectedIndex>=0?(sel.options[sel.selectedIndex].dataset.mat||''):'';
  return {veiculo_id:vid,matricula:mat||null,obra_id:document.getElementById('req_obra')?.value||null,
    tipo:document.getElementById('req_tipo')?.value||'material',
    estado:document.getElementById('req_estado')?.value||'pendente',
    descricao:(document.getElementById('req_desc')?.value||'').trim(),
    valor:parseFloat(document.getElementById('req_valor')?.value)||0,
    data:document.getElementById('req_data')?.value||'',
    fornecedor:document.getElementById('req_fornecedor')?.value||'',
    observacoes:document.getElementById('req_obs')?.value||''};
}
function criarReq() {
  const d=_lerFormReq(); if(!d.descricao){toastMsg('Preencha a descrição','error');return;}
  const num=DB.proximoNumeroReq();
  DB.criarReq({numero_req:num,...d});
  closeModal(); toastMsg(`Requisição ${num} criada!`,'success'); renderFaturacao();
}
function guardarReq(id) {
  const d=_lerFormReq(); if(!d.descricao){toastMsg('Preencha a descrição','error');return;}
  DB.actualizarReq(id,d);
  closeModal(); toastMsg('Requisição atualizada!','success'); renderFaturacao();
}
function eliminarReq(id) {
  if(!confirm('Eliminar esta requisição?')) return;
  DB.eliminarReq(id); toastMsg('Requisição eliminada.','warning'); renderFaturacao();
}

/* ── Modais Fatura ── */
function _htmlFormFatura(f=null) {
  const veiculos=DB.getVeiculos(); const obras=DB.getObras(); const reqs=DB.getReqs();
  return `<form onsubmit="return false;">
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Veículo</label>
        <select class="form-control" id="fat_veiculo">
          <option value="">— Opcional —</option>
          ${veiculos.map(v=>`<option value="${v.id}" data-mat="${v.matricula}" ${f?.veiculo_id===v.id?'selected':''}>${v.matricula} — ${v.marca} ${v.modelo}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Nº Fatura Ext.</label>
        <input type="text" class="form-control" id="fat_num_ext" value="${esc(f?.numero_fatura_ext||'')}"></div>
    </div>
    <div class="form-row form-row-2">
      <div class="form-group"><label class="form-label">Fornecedor</label>
        <input type="text" class="form-control" id="fat_fornecedor" value="${esc(f?.fornecedor||'')}"></div>
      <div class="form-group"><label class="form-label">Estado</label>
        <select class="form-control" id="fat_estado">
          <option value="pendente" ${!f||f.estado==='pendente'?'selected':''}>Pendente</option>
          <option value="paga"     ${f?.estado==='paga'?'selected':''}>Paga</option>
          <option value="anulada"  ${f?.estado==='anulada'?'selected':''}>Anulada</option>
        </select></div>
    </div>
    <div class="form-group"><label class="form-label">Descrição *</label>
      <textarea class="form-control" id="fat_desc" rows="2">${esc(f?.descricao||'')}</textarea></div>
    <div class="form-row form-row-3">
      <div class="form-group"><label class="form-label">Valor (€) *</label>
        <input type="number" step="0.01" class="form-control" id="fat_valor" value="${f?.valor||0}"></div>
      <div class="form-group"><label class="form-label">Data Fatura</label>
        <input type="date" class="form-control" id="fat_data" value="${f?.data_fatura||new Date().toISOString().slice(0,10)}"></div>
      <div class="form-group"><label class="form-label">Data Vencimento</label>
        <input type="date" class="form-control" id="fat_venc" value="${f?.data_vencimento||''}"></div>
    </div>
    <div class="form-group"><label class="form-label">Observações</label>
      <input type="text" class="form-control" id="fat_obs" value="${esc(f?.observacoes||'')}"></div>
  </form>`;
}
function modalNovaFatura() {
  openModal('Nova Fatura',_htmlFormFatura(),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="criarFaturaModal()">${icon('save')} Criar</button>`);
}
function modalEditarFatura(id) {
  const f=DB.getFatura(id); if(!f) return;
  openModal(`Editar ${f.numero_fat}`,_htmlFormFatura(f),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="guardarFaturaModal('${id}')">${icon('save')} Guardar</button>`);
}
function _lerFormFatura() {
  const sel=document.getElementById('fat_veiculo');
  const vid=sel?.value||null;
  const mat=vid&&sel.selectedIndex>=0?(sel.options[sel.selectedIndex].dataset.mat||''):'';
  return {veiculo_id:vid,matricula:mat||null,
    numero_fatura_ext:document.getElementById('fat_num_ext')?.value||'',
    fornecedor:document.getElementById('fat_fornecedor')?.value||'',
    estado:document.getElementById('fat_estado')?.value||'pendente',
    descricao:(document.getElementById('fat_desc')?.value||'').trim(),
    valor:parseFloat(document.getElementById('fat_valor')?.value)||0,
    data_fatura:document.getElementById('fat_data')?.value||'',
    data_vencimento:document.getElementById('fat_venc')?.value||'',
    observacoes:document.getElementById('fat_obs')?.value||''};
}
function criarFaturaModal() {
  const d=_lerFormFatura(); if(!d.descricao){toastMsg('Preencha a descrição','error');return;}
  const num=DB.proximoNumeroFatura();
  DB.criarFatura({numero_fat:num,...d});
  closeModal(); toastMsg(`Fatura ${num} criada!`,'success'); renderFaturacao('faturas');
}
function guardarFaturaModal(id) {
  const d=_lerFormFatura(); if(!d.descricao){toastMsg('Preencha a descrição','error');return;}
  DB.actualizarFatura(id,d);
  closeModal(); toastMsg('Fatura atualizada!','success'); renderFaturacao('faturas');
}
function eliminarFatura(id) {
  const f=DB.getFatura(id); if(!f) return;
  if(!confirm(`Eliminar fatura ${f.numero_fat}?`)) return;
  DB.eliminarFatura(id); toastMsg('Fatura eliminada.','warning'); renderFaturacao('faturas');
}

/* ================================================================
   17. RELATÓRIOS
   ================================================================ */
/* ================================================================
   RELATÓRIOS — ESTADO ACTUAL (tab ativa)
================================================================ */
let _relTabAtiva = 'resumo';

function renderRelatorios() {
  const obras    = DB.getObras();
  const veiculos = DB.getVeiculos();
  const reqs     = DB.getReqs();
  const faturas  = DB.getFaturas();
  const alertas  = DB.getAlertas();
  const periodo  = _getPeriodoLabel();

  document.getElementById('topbarActions').innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="exportarRelatorioExcel()">
        ${icon('excel',14)} Excel
      </button>
      <button class="btn btn-outline btn-sm" onclick="exportarRelatorioPDF()">
        ${icon('print',14)} PDF
      </button>
    </div>`;

  document.getElementById('pageContainer').innerHTML = `
    <div class="page-header" style="margin-bottom:12px;">
      <div>
        <h2 style="display:flex;align-items:center;gap:8px;">${icon('chart',18)} Relatórios de Atividades — Frota Municipal</h2>
        <p>Gestão e Manutenção de Viaturas e Equipamentos · ${periodo}</p>
      </div>
    </div>

    <!-- TABS -->
    <div class="rel-tabs-wrap">
      <div class="tab-bar" id="relTabs">
        <button class="tab-btn active"  onclick="switchRelTab(this,'resumo')"  id="relBtnResumo">
          ${icon('dashboard',14)} Resumo Geral
        </button>
        <button class="tab-btn" onclick="switchRelTab(this,'custos')"  id="relBtnCustos">
          ${icon('euro',14)} Análise de Custos
        </button>
        <button class="tab-btn" onclick="switchRelTab(this,'alertas')" id="relBtnAlertas">
          ${icon('bell',14)} Estado de Alertas
        </button>
        <button class="tab-btn" onclick="switchRelTab(this,'frota')"   id="relBtnFrota">
          ${icon('truck',14)} Estado da Frota
        </button>
      </div>
      <div class="rel-tab-actions" id="relTabActions"></div>
    </div>

    <!-- CONTEÚDO DAS ABAS -->
    <div id="relTabResumo">${_tabResumo(obras,veiculos,reqs,faturas,alertas)}</div>
    <div id="relTabCustos"  style="display:none">${_tabCustos(obras,veiculos,faturas,reqs)}</div>
    <div id="relTabAlertas" style="display:none">${_tabAlertas(alertas,veiculos)}</div>
    <div id="relTabFrota"   style="display:none">${_tabFrota(veiculos,obras)}</div>`;

  _relTabAtiva = 'resumo';
  _atualizarRelTabActions('resumo');
  setTimeout(()=>{
    _drawChartObrasEstado(obras);
    _drawChartCustosMensais(obras);
    _drawChartTiposInt(obras);
  }, 120);
}

/* ── switchRelTab (local — sobrepõe fixes.js) ── */
function switchRelTab(btn, tab) {
  destroyCharts();
  document.getElementById('relTabs').querySelectorAll('.tab-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['relTabResumo','relTabCustos','relTabAlertas','relTabFrota'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const map = {resumo:'relTabResumo', custos:'relTabCustos', alertas:'relTabAlertas', frota:'relTabFrota'};
  const el = document.getElementById(map[tab]); if (el) el.style.display = '';
  _relTabAtiva = tab;
  _atualizarRelTabActions(tab);
  setTimeout(() => {
    if (tab==='resumo')  { _drawChartObrasEstado(DB.getObras()); _drawChartCustosMensais(DB.getObras()); _drawChartTiposInt(DB.getObras()); }
    if (tab==='custos')  { _drawChartCustosMensais2(DB.getObras()); _drawChartCustoVeiculo(DB.getObras()); _drawChartCustoTipo(DB.getObras()); }
    if (tab==='alertas') { _drawChartAlertasTipos(DB.getAlertas()); }
    if (tab==='frota')   { _drawChartFrota(DB.getVeiculos()); _drawChartEstadoOp(DB.getVeiculos()); }
  }, 120);
}

function _atualizarRelTabActions(tab) {
  const c = document.getElementById('relTabActions');
  if (!c) return;
  const btnExcel = `<button class="btn btn-outline btn-sm" onclick="exportarRelatorioExcel('${tab}')">${icon('excel',13)} Excel</button>`;
  const btnPDF   = `<button class="btn btn-outline btn-sm" onclick="exportarRelatorioPDF('${tab}')">${icon('print',13)} PDF</button>`;
  c.innerHTML = btnExcel + btnPDF;
}

function _getPeriodoLabel() {
  const obras = DB.getObras();
  if (!obras.length) return new Date().getFullYear();
  const anos = obras.map(o => new Date(o.data_entrada).getFullYear()).filter(Boolean);
  const min = Math.min(...anos), max = Math.max(...anos);
  return min===max ? String(max) : `${min} – ${max}`;
}

/* ================================================================
   ABA 1 — RESUMO GERAL
   (estrutura: Quadro de Evolução + Métricas + Gráficos + Quadro Intervenções)
================================================================ */
function _tabResumo(obras, veiculos, reqs, faturas, alertas) {
  const abertas  = obras.filter(o => o.estado==='aberta');
  const fechadas = obras.filter(o => o.estado==='fechada');
  const total    = obras.length;
  const custoTotal = fechadas.reduce((s,o) => s+(parseFloat(o.custo_total)||0), 0);
  const custoMed   = fechadas.length ? custoTotal/fechadas.length : 0;
  const fatPagas   = faturas.filter(f=>f.estado==='paga').reduce((s,f)=>s+(parseFloat(f.valor)||0), 0);
  const fatPend    = faturas.filter(f=>f.estado==='pendente').reduce((s,f)=>s+(parseFloat(f.valor)||0), 0);
  let  totalAlCrit = 0; alertas.forEach(al => { totalAlCrit += contarAlertasVeiculo(al); });
  const vOp  = veiculos.filter(v=>v.estado_op==='operacional').length;
  const vMut = veiculos.filter(v=>v.estado_op==='manutencao').length;
  const vAv  = veiculos.filter(v=>v.estado_op==='avaria').length;
  const vIn  = veiculos.filter(v=>v.estado_op==='inativo').length;

  /* Quadro de intervenções por tipo */
  const porTipo = {};
  obras.forEach(o => tiposArray(o.tipos_intervencao).forEach(t => { porTipo[t]=(porTipo[t]||0)+1; }));
  const tiposOrdenados = Object.entries(porTipo).sort((a,b)=>b[1]-a[1]);

  /* Intervenções por setor */
  const porSetor = {};
  obras.forEach(o => { const s=o.setor_snapshot||'—'; porSetor[s]=(porSetor[s]||0)+1; });
  const setoresOrdenados = Object.entries(porSetor).sort((a,b)=>b[1]-a[1]);

  /* Evolução mensal (últimos 6 meses) */
  const mapMes = {};
  obras.forEach(o => {
    if (!o.data_entrada) return;
    const d=new Date(o.data_entrada);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    mapMes[k]=(mapMes[k]||0)+1;
  });
  const meses6 = Object.keys(mapMes).sort().slice(-6);

  return `
  <!-- ── MÉTRICAS TOPO ── -->
  <div class="rel-stats-grid">
    <div class="rel-stat-card accent-blue">
      <div class="rsc-icon">${icon('tools',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${total}</div><div class="rsc-lbl">Total de Intervenções</div></div>
    </div>
    <div class="rel-stat-card accent-green">
      <div class="rsc-icon">${icon('checkCircle',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${fechadas.length}</div><div class="rsc-lbl">Obras Concluídas</div></div>
    </div>
    <div class="rel-stat-card accent-red">
      <div class="rsc-icon">${icon('alert',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${abertas.length}</div><div class="rsc-lbl">Em Curso</div></div>
    </div>
    <div class="rel-stat-card accent-orange">
      <div class="rsc-icon">${icon('truck',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${veiculos.length}</div><div class="rsc-lbl">Viaturas / Equipamentos</div></div>
    </div>
    <div class="rel-stat-card accent-purple">
      <div class="rsc-icon">${icon('euro',22)}</div>
      <div class="rsc-body"><div class="rsc-num" style="font-size:18px">${fmtEuro(custoTotal)}</div><div class="rsc-lbl">Custo Total Obras</div></div>
    </div>
    <div class="rel-stat-card accent-yellow">
      <div class="rsc-icon">${icon('bell',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${totalAlCrit}</div><div class="rsc-lbl">Alertas Críticos</div></div>
    </div>
  </div>

  <!-- ── QUADRO 1: ESTADO OPERACIONAL DA FROTA ── -->
  <div class="rel-section-title">${icon('truck',15)} Quadro 1 – Estado Operacional da Frota</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Estado</th><th style="text-align:center">Nº Viaturas</th><th style="text-align:center">% da Frota</th>
          <th>Indicador</th>
        </tr></thead>
        <tbody>
          ${[
            {lbl:'Operacional',    n:vOp,  cls:'badge-green', color:'#22c55e'},
            {lbl:'Em Manutenção',  n:vMut, cls:'badge-yellow', color:'#f59e0b'},
            {lbl:'Avaria',         n:vAv,  cls:'badge-red',   color:'#ef4444'},
            {lbl:'Inativo / Abate',n:vIn,  cls:'badge-gray',  color:'#94a3b8'},
          ].map(r=>`<tr>
            <td><span class="badge ${r.cls}">${r.lbl}</span></td>
            <td style="text-align:center;font-weight:700;font-size:15px">${r.n}</td>
            <td style="text-align:center">${veiculos.length?Math.round(r.n/veiculos.length*100):0}%</td>
            <td><div class="rel-bar-bg"><div class="rel-bar-fill" style="width:${veiculos.length?Math.round(r.n/veiculos.length*100):0}%;background:${r.color}"></div></div></td>
          </tr>`).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAL</td>
            <td style="text-align:center;font-size:15px">${veiculos.length}</td>
            <td style="text-align:center">100%</td><td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── QUADRO 2: EVOLUÇÃO MENSAL DE INTERVENÇÕES ── -->
  <div class="rel-section-title">${icon('chart',15)} Quadro 2 – Evolução Mensal de Intervenções</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Mês</th><th style="text-align:center">Intervenções</th><th>Variação</th><th>Tendência</th>
        </tr></thead>
        <tbody>${meses6.map((k,i)=>{
          const n=mapMes[k];
          const prev=i>0?mapMes[meses6[i-1]]:null;
          const delta=prev!=null?n-prev:null;
          const [ano,mes]=k.split('-');
          const nomeMes=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mes)-1];
          return `<tr>
            <td><strong>${nomeMes} ${ano}</strong></td>
            <td style="text-align:center;font-weight:700;font-size:15px">${n}</td>
            <td>${delta!=null?(delta>0?`<span style="color:var(--danger)">▲ +${delta}</span>`:(delta<0?`<span style="color:var(--success)">▼ ${delta}</span>`:'<span style="color:var(--text-light)">= 0</span>')):'—'}</td>
            <td><div class="rel-bar-bg"><div class="rel-bar-fill" style="width:${Math.round(n/Math.max(...Object.values(mapMes))*100)}%;background:#3b82f6"></div></div></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  </div>

  <!-- ── GRÁFICOS LADO A LADO ── -->
  <div class="grid-2col rel-card-mb">
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('chart',14)} Estado das Obras</span></div>
      <div style="height:260px;padding:16px;"><canvas id="chartObrasEstado"></canvas></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('list',14)} Tipos de Intervenção</span></div>
      <div style="height:260px;padding:16px;"><canvas id="chartTiposInt"></canvas></div>
    </div>
  </div>

  <!-- ── QUADRO 3: INTERVENÇÕES POR TIPO ── -->
  <div class="rel-section-title">${icon('tools',15)} Quadro 3 – Detalhe das Intervenções por Tipo</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Tipo de Intervenção</th>
          <th style="text-align:center">Qtd.</th>
          <th style="text-align:center">% do Total</th>
          <th>Distribuição</th>
        </tr></thead>
        <tbody>${tiposOrdenados.map(([tipo,n],i)=>`
          <tr>
            <td><span class="badge ${INT_COR[tipo]||'badge-gray'}">${tipo}</span></td>
            <td style="text-align:center;font-weight:700">${n}</td>
            <td style="text-align:center">${total?Math.round(n/total*100):0}%</td>
            <td><div class="rel-bar-bg"><div class="rel-bar-fill" style="width:${total?Math.round(n/total*100):0}%;background:var(--primary)"></div></div></td>
          </tr>`).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAL</td>
            <td style="text-align:center">${tiposOrdenados.reduce((s,[,n])=>s+n,0)}</td>
            <td></td><td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── QUADRO 4: INTERVENÇÕES POR SETOR ── -->
  <div class="rel-section-title">${icon('sector',15)} Quadro 4 – Intervenções por Setor / Departamento</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Setor</th>
          <th style="text-align:center">Intervenções</th>
          <th style="text-align:center">Concluídas</th>
          <th style="text-align:center">Em Curso</th>
          <th style="text-align:center">% do Total</th>
          <th>Peso</th>
        </tr></thead>
        <tbody>${setoresOrdenados.map(([s,n])=>{
          const sAbr = obras.filter(o=>o.setor_snapshot===s&&o.estado==='aberta').length;
          const sFec = obras.filter(o=>o.setor_snapshot===s&&o.estado==='fechada').length;
          return `<tr>
            <td><strong>${s}</strong></td>
            <td style="text-align:center;font-weight:700">${n}</td>
            <td style="text-align:center"><span class="badge badge-green">${sFec}</span></td>
            <td style="text-align:center"><span class="badge badge-red">${sAbr}</span></td>
            <td style="text-align:center">${total?Math.round(n/total*100):0}%</td>
            <td><div class="rel-bar-bg"><div class="rel-bar-fill" style="width:${total?Math.round(n/total*100):0}%;background:#8b5cf6"></div></div></td>
          </tr>`;
        }).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAL</td>
            <td style="text-align:center">${total}</td>
            <td style="text-align:center">${fechadas.length}</td>
            <td style="text-align:center">${abertas.length}</td>
            <td style="text-align:center">100%</td><td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── CUSTOS MENSAIS ── -->
  <div class="rel-section-title">${icon('euro',15)} Evolução de Custos Mensais</div>
  <div class="card rel-card-mb">
    <div class="card-header">
      <span class="card-title">Custos de Manutenção por Mês</span>
      <span style="font-size:12px;color:var(--text-medium)">Obras concluídas</span>
    </div>
    <div style="height:300px;padding:16px;"><canvas id="chartCustosMensais"></canvas></div>
    <div class="card-body" style="padding-top:0;">
      <div class="rel-custo-summary">
        <div class="rel-custo-item">
          <div class="rci-lbl">Custo Total Obras</div>
          <div class="rci-val">${fmtEuro(custoTotal)}</div>
        </div>
        <div class="rel-custo-item">
          <div class="rci-lbl">Custo Médio por Obra</div>
          <div class="rci-val">${fmtEuro(custoMed)}</div>
        </div>
        <div class="rel-custo-item">
          <div class="rci-lbl">Faturas Pagas</div>
          <div class="rci-val" style="color:var(--success)">${fmtEuro(fatPagas)}</div>
        </div>
        <div class="rel-custo-item">
          <div class="rci-lbl">Faturas Pendentes</div>
          <div class="rci-val" style="color:var(--warning)">${fmtEuro(fatPend)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ================================================================
   ABA 2 — ANÁLISE DE CUSTOS
================================================================ */
function _tabCustos(obras, veiculos, faturas, reqs) {
  const fechadas   = obras.filter(o => o.estado==='fechada');
  const custoTotal = fechadas.reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);
  const custoMao   = fechadas.reduce((s,o)=>s+(parseFloat(o.custo_mao_obra)||0),0);
  const custoServ  = fechadas.reduce((s,o)=>s+(parseFloat(o.custo_servicos_externos)||0),0);
  const custoMat   = fechadas.reduce((s,o)=>s+(parseFloat(o.custo_materiais)||0),0);

  /* Custo por viatura */
  const porViat = {};
  fechadas.forEach(o => {
    const mat = o.matricula||'Desconhecido';
    if (!porViat[mat]) porViat[mat] = {mat, obras:0, mao:0, serv:0, mat2:0, total:0, setor:o.setor_snapshot||'—'};
    porViat[mat].obras++;
    porViat[mat].mao  += parseFloat(o.custo_mao_obra)||0;
    porViat[mat].serv += parseFloat(o.custo_servicos_externos)||0;
    porViat[mat].mat2 += parseFloat(o.custo_materiais)||0;
    porViat[mat].total+= parseFloat(o.custo_total)||0;
  });
  const viatOrdenadas = Object.values(porViat).sort((a,b)=>b.total-a.total);

  /* Custo por setor */
  const porSetor = {};
  fechadas.forEach(o => {
    const s = o.setor_snapshot||'—';
    if (!porSetor[s]) porSetor[s]={s,obras:0,total:0,mao:0,serv:0,mat:0};
    porSetor[s].obras++;
    porSetor[s].total += parseFloat(o.custo_total)||0;
    porSetor[s].mao   += parseFloat(o.custo_mao_obra)||0;
    porSetor[s].serv  += parseFloat(o.custo_servicos_externos)||0;
    porSetor[s].mat   += parseFloat(o.custo_materiais)||0;
  });
  const setoresC = Object.values(porSetor).sort((a,b)=>b.total-a.total);

  /* Custo por tipo de intervenção */
  const porTipoC = {};
  fechadas.forEach(o => {
    tiposArray(o.tipos_intervencao).forEach(t => {
      if (!porTipoC[t]) porTipoC[t]={t,obras:0,total:0};
      porTipoC[t].obras++;
      porTipoC[t].total += parseFloat(o.custo_total)||0;
    });
  });
  const tiposC = Object.values(porTipoC).sort((a,b)=>b.total-a.total);

  return `
  <!-- ── MÉTRICAS TOPO CUSTOS ── -->
  <div class="rel-stats-grid">
    <div class="rel-stat-card accent-blue">
      <div class="rsc-icon">${icon('euro',22)}</div>
      <div class="rsc-body"><div class="rsc-num" style="font-size:18px">${fmtEuro(custoTotal)}</div><div class="rsc-lbl">Custo Total</div></div>
    </div>
    <div class="rel-stat-card accent-green">
      <div class="rsc-icon">${icon('users',22)}</div>
      <div class="rsc-body"><div class="rsc-num" style="font-size:18px">${fmtEuro(custoMao)}</div><div class="rsc-lbl">Mão-de-Obra</div></div>
    </div>
    <div class="rel-stat-card accent-orange">
      <div class="rsc-icon">${icon('tools',22)}</div>
      <div class="rsc-body"><div class="rsc-num" style="font-size:18px">${fmtEuro(custoServ)}</div><div class="rsc-lbl">Serviços Externos</div></div>
    </div>
    <div class="rel-stat-card accent-purple">
      <div class="rsc-icon">${icon('wrench',22)}</div>
      <div class="rsc-body"><div class="rsc-num" style="font-size:18px">${fmtEuro(custoMat)}</div><div class="rsc-lbl">Materiais / Peças</div></div>
    </div>
  </div>

  <!-- ── GRÁFICOS ── -->
  <div class="grid-2col rel-card-mb">
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('chart',14)} Custos Mensais</span></div>
      <div style="height:280px;padding:16px;"><canvas id="chartCustosMensais2"></canvas></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('chart',14)} Repartição de Custos</span></div>
      <div style="height:280px;padding:16px;"><canvas id="chartCustoTipo"></canvas></div>
    </div>
  </div>

  <!-- ── GRÁFICO CUSTO POR VIATURA ── -->
  <div class="card rel-card-mb">
    <div class="card-header">
      <span class="card-title">${icon('truck',14)} Custo por Viatura (Top 10)</span>
      <span style="font-size:12px;color:var(--text-medium)">Obras concluídas</span>
    </div>
    <div style="height:320px;padding:16px;"><canvas id="chartCustoVeiculo"></canvas></div>
  </div>

  <!-- ── QUADRO: CUSTO POR VIATURA ── -->
  <div class="rel-section-title">${icon('truck',15)} Quadro de Custos por Viatura / Equipamento</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Pos.</th><th>Matrícula</th><th>Setor</th><th style="text-align:center">Obras</th>
            <th style="text-align:right">Mão-de-Obra</th>
            <th style="text-align:right">Serv. Ext.</th>
            <th style="text-align:right">Materiais</th>
            <th style="text-align:right">Total</th>
            <th style="text-align:center">% Total</th>
          </tr></thead>
          <tbody>${viatOrdenadas.slice(0,15).map((v,i)=>`
            <tr class="${i<3?'rel-row-top':''}">
              <td><strong style="color:${i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'var(--text-medium)'}">#${i+1}</strong></td>
              <td><strong>${v.mat}</strong></td>
              <td><span class="badge badge-blue" style="font-size:10px">${v.setor}</span></td>
              <td style="text-align:center">${v.obras}</td>
              <td style="text-align:right">${fmtEuro(v.mao)}</td>
              <td style="text-align:right">${fmtEuro(v.serv)}</td>
              <td style="text-align:right">${fmtEuro(v.mat2)}</td>
              <td style="text-align:right;font-weight:700">${fmtEuro(v.total)}</td>
              <td style="text-align:center">
                <div style="display:flex;align-items:center;gap:6px;">
                  <div class="rel-bar-bg" style="flex:1"><div class="rel-bar-fill" style="width:${custoTotal?Math.round(v.total/custoTotal*100):0}%;background:#1a4d8f"></div></div>
                  <span style="font-size:11px;min-width:28px">${custoTotal?Math.round(v.total/custoTotal*100):0}%</span>
                </div>
              </td>
            </tr>`).join('')}
            <tr style="font-weight:700;background:#eff6ff">
              <td colspan="3"><strong>TOTAL GERAL</strong></td>
              <td style="text-align:center">${fechadas.length}</td>
              <td style="text-align:right">${fmtEuro(custoMao)}</td>
              <td style="text-align:right">${fmtEuro(custoServ)}</td>
              <td style="text-align:right">${fmtEuro(custoMat)}</td>
              <td style="text-align:right">${fmtEuro(custoTotal)}</td>
              <td style="text-align:center">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ── QUADRO: CUSTO POR SETOR ── -->
  <div class="rel-section-title">${icon('sector',15)} Quadro de Custos por Setor / Departamento</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Setor</th><th style="text-align:center">Obras</th>
          <th style="text-align:right">Mão-de-Obra</th>
          <th style="text-align:right">Serv. Ext.</th>
          <th style="text-align:right">Materiais</th>
          <th style="text-align:right">Total</th>
          <th style="text-align:center">% do Total</th>
        </tr></thead>
        <tbody>${setoresC.map(s=>`
          <tr>
            <td><strong>${s.s}</strong></td>
            <td style="text-align:center">${s.obras}</td>
            <td style="text-align:right">${fmtEuro(s.mao)}</td>
            <td style="text-align:right">${fmtEuro(s.serv)}</td>
            <td style="text-align:right">${fmtEuro(s.mat)}</td>
            <td style="text-align:right;font-weight:700">${fmtEuro(s.total)}</td>
            <td style="text-align:center">
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="rel-bar-bg" style="flex:1"><div class="rel-bar-fill" style="width:${custoTotal?Math.round(s.total/custoTotal*100):0}%;background:#8b5cf6"></div></div>
                <span style="font-size:11px">${custoTotal?Math.round(s.total/custoTotal*100):0}%</span>
              </div>
            </td>
          </tr>`).join('')}
          <tr style="font-weight:700;background:#eff6ff">
            <td>TOTAL</td>
            <td style="text-align:center">${fechadas.length}</td>
            <td style="text-align:right">${fmtEuro(custoMao)}</td>
            <td style="text-align:right">${fmtEuro(custoServ)}</td>
            <td style="text-align:right">${fmtEuro(custoMat)}</td>
            <td style="text-align:right">${fmtEuro(custoTotal)}</td>
            <td style="text-align:center">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── QUADRO: CUSTO POR TIPO INTERVENÇÃO ── -->
  <div class="rel-section-title">${icon('tools',15)} Quadro de Custos por Tipo de Intervenção</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Tipo de Intervenção</th><th style="text-align:center">Obras</th>
          <th style="text-align:right">Custo Total</th>
          <th style="text-align:right">Custo Médio</th>
          <th style="text-align:center">% do Total</th>
        </tr></thead>
        <tbody>${tiposC.map(t=>`
          <tr>
            <td><span class="badge ${INT_COR[t.t]||'badge-gray'}">${t.t}</span></td>
            <td style="text-align:center">${t.obras}</td>
            <td style="text-align:right;font-weight:700">${fmtEuro(t.total)}</td>
            <td style="text-align:right">${fmtEuro(t.obras?t.total/t.obras:0)}</td>
            <td style="text-align:center">
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="rel-bar-bg" style="flex:1"><div class="rel-bar-fill" style="width:${custoTotal?Math.round(t.total/custoTotal*100):0}%;background:#f97316"></div></div>
                <span style="font-size:11px">${custoTotal?Math.round(t.total/custoTotal*100):0}%</span>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

/* ================================================================
   ABA 3 — ESTADO DE ALERTAS & CERTIFICAÇÕES
================================================================ */
function _tabAlertas(alertas, veiculos) {
  /* Contagens globais por tipo */
  const CAMPOS_ALERTA = [
    {key:'itp',          campo:'itp_proxima',           lbl:'ITP / Inspeção Técnica',     antec:30},
    {key:'seguro',       campo:'seguro_valido_ate',      lbl:'Seguro',                     antec:30},
    {key:'revisao',      campo:'revisao_proxima',        lbl:'Revisão Periódica',          antec:30},
    {key:'oleo',         campo:'oleo_proxima_data',      lbl:'Mudança de Óleo',            antec:14},
    {key:'grua',         campo:'grua_proxima',           lbl:'Certificação de Grua',       antec:60},
    {key:'caixa',        campo:'caixa_proxima',          lbl:'Certificação de Caixa',      antec:60},
    {key:'tacografo',    campo:'tacografo_proxima',      lbl:'Tacógrafo',                  antec:30},
    {key:'extintor',     campo:'extintor_validade',      lbl:'Extintores',                 antec:30},
    {key:'licenciamento',campo:'licenciamento_validade', lbl:'Licenciamento',              antec:30},
  ];
  const cont = {};
  CAMPOS_ALERTA.forEach(c => { cont[c.key]={exp:0,prox:0,ok:0,sem:0}; });
  alertas.forEach(al => {
    CAMPOS_ALERTA.forEach(c => {
      const st = alertaStatus(al[c.campo], c.antec);
      cont[c.key][st==='expirado'?'exp':st==='proximo'?'prox':st==='ok'?'ok':'sem']++;
    });
  });
  const totalExp  = Object.values(cont).reduce((s,c)=>s+c.exp,0);
  const totalProx = Object.values(cont).reduce((s,c)=>s+c.prox,0);
  const totalOk   = Object.values(cont).reduce((s,c)=>s+c.ok,0);

  /* Viaturas críticas (expirado ou próximo em QUALQUER tipo) */
  const viatCriticas = alertas.filter(al =>
    CAMPOS_ALERTA.some(c => ['expirado','proximo'].includes(alertaStatus(al[c.campo],c.antec)))
  ).map(al => {
    const v = veiculos.find(v=>v.id===al.veiculo_id)||{};
    const alertasCrit = CAMPOS_ALERTA.filter(c=>alertaStatus(al[c.campo],c.antec)==='expirado');
    const alertasProx = CAMPOS_ALERTA.filter(c=>alertaStatus(al[c.campo],c.antec)==='proximo');
    return {al, v, alertasCrit, alertasProx};
  }).sort((a,b)=>b.alertasCrit.length-a.alertasCrit.length);

  return `
  <!-- ── MÉTRICAS TOPO ── -->
  <div class="rel-stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
    <div class="rel-stat-card accent-red">
      <div class="rsc-icon">${icon('alert',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${totalExp}</div><div class="rsc-lbl">Expirados</div></div>
    </div>
    <div class="rel-stat-card accent-yellow">
      <div class="rsc-icon">${icon('clock',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${totalProx}</div><div class="rsc-lbl">A Vencer Em Breve</div></div>
    </div>
    <div class="rel-stat-card accent-green">
      <div class="rsc-icon">${icon('checkCircle',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${totalOk}</div><div class="rsc-lbl">Em Dia</div></div>
    </div>
    <div class="rel-stat-card accent-blue">
      <div class="rsc-icon">${icon('truck',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${viatCriticas.length}</div><div class="rsc-lbl">Viaturas c/ Alerta</div></div>
    </div>
  </div>

  <!-- ── GRÁFICO ALERTAS ── -->
  <div class="card rel-card-mb">
    <div class="card-header"><span class="card-title">${icon('chart',14)} Estado das Certificações por Tipo</span></div>
    <div style="height:300px;padding:16px;"><canvas id="chartAlertasTipos"></canvas></div>
  </div>

  <!-- ── QUADRO: ESTADO POR TIPO DE CERTIFICAÇÃO ── -->
  <div class="rel-section-title">${icon('shield',15)} Quadro – Estado das Certificações e Documentação</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Tipo de Certificação / Documento</th>
          <th style="text-align:center">Antecedência</th>
          <th style="text-align:center">⛔ Expirado</th>
          <th style="text-align:center">⚠️ A Vencer</th>
          <th style="text-align:center">✅ Em Dia</th>
          <th style="text-align:center">— Sem Data</th>
          <th style="text-align:center">Total c/ Dados</th>
        </tr></thead>
        <tbody>${CAMPOS_ALERTA.map(c=>{
          const cc=cont[c.key];
          const comData=cc.exp+cc.prox+cc.ok;
          return `<tr class="${cc.exp>0?'rel-row-danger':cc.prox>0?'rel-row-warn':''}">
            <td><strong>${c.lbl}</strong></td>
            <td style="text-align:center;font-size:12px;color:var(--text-medium)">${c.antec} dias</td>
            <td style="text-align:center">${cc.exp>0?`<span class="badge badge-red">${cc.exp}</span>`:`<span style="color:var(--text-light)">—</span>`}</td>
            <td style="text-align:center">${cc.prox>0?`<span class="badge badge-yellow">${cc.prox}</span>`:`<span style="color:var(--text-light)">—</span>`}</td>
            <td style="text-align:center">${cc.ok>0?`<span class="badge badge-green">${cc.ok}</span>`:`<span style="color:var(--text-light)">—</span>`}</td>
            <td style="text-align:center;color:var(--text-light)">${cc.sem}</td>
            <td style="text-align:center;font-weight:700">${comData}</td>
          </tr>`;
        }).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAIS</td><td></td>
            <td style="text-align:center"><span class="badge badge-red">${totalExp}</span></td>
            <td style="text-align:center"><span class="badge badge-yellow">${totalProx}</span></td>
            <td style="text-align:center"><span class="badge badge-green">${totalOk}</span></td>
            <td style="text-align:center;color:var(--text-light)">${Object.values(cont).reduce((s,c)=>s+c.sem,0)}</td>
            <td style="text-align:center">${totalExp+totalProx+totalOk}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── QUADRO: VIATURAS CRÍTICAS ── -->
  <div class="rel-section-title">${icon('alert',15)} Viaturas com Alertas Críticos</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      ${!viatCriticas.length ? `<div class="table-empty">✅ Não existem viaturas com alertas críticos!</div>` : `
      <div class="table-wrapper"><table>
        <thead><tr>
          <th>Matrícula</th><th>Tipo</th><th>Setor</th><th>Responsável</th>
          <th>Expirados</th><th>A Vencer</th><th>Detalhes</th>
        </tr></thead>
        <tbody>${viatCriticas.map(({al,v,alertasCrit,alertasProx})=>`
          <tr class="${alertasCrit.length?'rel-row-danger':'rel-row-warn'}" style="cursor:pointer" onclick="ir('veiculo-historico',{id:'${v.id||''}'})">
            <td><strong style="color:var(--primary)">${v.matricula||al.matricula||'—'}</strong></td>
            <td style="font-size:12px">${v.categoria||TIPO_LABEL[v.tipo]||'—'}</td>
            <td><span class="badge badge-blue" style="font-size:10px">${v.setor||'—'}</span></td>
            <td style="font-size:12px">${v.responsavel||'—'}</td>
            <td>${alertasCrit.length?`<span class="badge badge-red">${alertasCrit.length} expirado${alertasCrit.length>1?'s':''}</span>`:'—'}</td>
            <td>${alertasProx.length?`<span class="badge badge-yellow">${alertasProx.length} a vencer</span>`:'—'}</td>
            <td style="font-size:11px;color:var(--text-medium)">${[...alertasCrit,...alertasProx].map(c=>c.lbl).join(', ')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`}
    </div>
  </div>`;
}

/* ================================================================
   ABA 4 — ESTADO DA FROTA
================================================================ */
function _tabFrota(veiculos, obras) {
  const porTipo  = {ligeiro:0,pesado:0,maquina:0};
  const porEstOp = {operacional:0,manutencao:0,avaria:0,inativo:0};
  const porSetor = {};
  const porDepto = {};
  const porComb  = {};
  const porAno   = {};
  veiculos.forEach(v => {
    porTipo[v.tipo]  = (porTipo[v.tipo]||0)+1;
    porEstOp[v.estado_op] = (porEstOp[v.estado_op]||0)+1;
    porSetor[v.setor] = (porSetor[v.setor]||0)+1;
    const d=v.departamento||'—'; porDepto[d]=(porDepto[d]||0)+1;
    const c=v.combustivel||'—'; porComb[c]=(porComb[c]||0)+1;
    const a=String(v.ano||'—'); porAno[a]=(porAno[a]||0)+1;
  });

  /* Obras por viatura */
  const obrasPorViat = {};
  obras.forEach(o=>{obrasPorViat[o.matricula]=(obrasPorViat[o.matricula]||0)+1;});

  /* Viaturas sem nenhuma obra */
  const semObras = veiculos.filter(v=>!obrasPorViat[v.matricula]).length;

  /* Idade média da frota */
  const anoAtual = new Date().getFullYear();
  const idades = veiculos.map(v=>anoAtual-(v.ano||anoAtual)).filter(n=>n>=0);
  const idadeMed = idades.length ? Math.round(idades.reduce((s,n)=>s+n,0)/idades.length) : 0;
  const idadeMax = idades.length ? Math.max(...idades) : 0;

  return `
  <!-- ── MÉTRICAS ── -->
  <div class="rel-stats-grid">
    <div class="rel-stat-card accent-blue">
      <div class="rsc-icon">${icon('truck',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${veiculos.length}</div><div class="rsc-lbl">Total Viaturas / Equipamentos</div></div>
    </div>
    <div class="rel-stat-card accent-green">
      <div class="rsc-icon">${icon('checkCircle',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${porEstOp.operacional||0}</div><div class="rsc-lbl">Operacionais</div></div>
    </div>
    <div class="rel-stat-card accent-yellow">
      <div class="rsc-icon">${icon('clock',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${idadeMed}</div><div class="rsc-lbl">Idade Média (anos)</div></div>
    </div>
    <div class="rel-stat-card accent-orange">
      <div class="rsc-icon">${icon('timer',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${idadeMax}</div><div class="rsc-lbl">Viatura Mais Antiga (anos)</div></div>
    </div>
    <div class="rel-stat-card accent-purple">
      <div class="rsc-icon">${icon('tools',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${obras.length}</div><div class="rsc-lbl">Total Intervenções</div></div>
    </div>
    <div class="rel-stat-card accent-red">
      <div class="rsc-icon">${icon('info',22)}</div>
      <div class="rsc-body"><div class="rsc-num">${semObras}</div><div class="rsc-lbl">Sem Intervenções</div></div>
    </div>
  </div>

  <!-- ── GRÁFICOS ── -->
  <div class="grid-2col rel-card-mb">
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('chart',14)} Distribuição por Tipo</span></div>
      <div style="height:260px;padding:16px;"><canvas id="chartFrota"></canvas></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">${icon('chart',14)} Estado Operacional</span></div>
      <div style="height:260px;padding:16px;"><canvas id="chartEstadoOp"></canvas></div>
    </div>
  </div>

  <!-- ── QUADRO RESUMO POR TIPO ── -->
  <div class="rel-section-title">${icon('truck',15)} Quadro 1 – Composição da Frota por Tipo</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Tipo</th>
          <th style="text-align:center">Total</th>
          <th style="text-align:center">Operacional</th>
          <th style="text-align:center">Manutenção</th>
          <th style="text-align:center">Avaria</th>
          <th style="text-align:center">Inativo</th>
          <th style="text-align:center">% Frota</th>
        </tr></thead>
        <tbody>${[
          {tipo:'ligeiro',lbl:'Ligeiros (Vans, Pick-ups, Elétricos)'},
          {tipo:'pesado', lbl:'Pesados (Camiões, Autocarros, Cisternas)'},
          {tipo:'maquina',lbl:'Máquinas (Escavadoras, Tratores, Guindastes)'},
        ].map(r=>{
          const vT=veiculos.filter(v=>v.tipo===r.tipo);
          const n=vT.length;
          return `<tr>
            <td><strong>${r.lbl}</strong></td>
            <td style="text-align:center;font-weight:700;font-size:15px">${n}</td>
            <td style="text-align:center"><span class="badge badge-green">${vT.filter(v=>v.estado_op==='operacional').length}</span></td>
            <td style="text-align:center"><span class="badge badge-yellow">${vT.filter(v=>v.estado_op==='manutencao').length}</span></td>
            <td style="text-align:center"><span class="badge badge-red">${vT.filter(v=>v.estado_op==='avaria').length}</span></td>
            <td style="text-align:center"><span class="badge badge-gray">${vT.filter(v=>v.estado_op==='inativo').length}</span></td>
            <td style="text-align:center">
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="rel-bar-bg" style="flex:1"><div class="rel-bar-fill" style="width:${veiculos.length?Math.round(n/veiculos.length*100):0}%;background:var(--primary)"></div></div>
                <span style="font-size:11px">${veiculos.length?Math.round(n/veiculos.length*100):0}%</span>
              </div>
            </td>
          </tr>`;
        }).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAL</td>
            <td style="text-align:center">${veiculos.length}</td>
            <td style="text-align:center"><span class="badge badge-green">${porEstOp.operacional||0}</span></td>
            <td style="text-align:center"><span class="badge badge-yellow">${porEstOp.manutencao||0}</span></td>
            <td style="text-align:center"><span class="badge badge-red">${porEstOp.avaria||0}</span></td>
            <td style="text-align:center"><span class="badge badge-gray">${porEstOp.inativo||0}</span></td>
            <td style="text-align:center">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── QUADRO: POR SETOR ── -->
  <div class="rel-section-title">${icon('sector',15)} Quadro 2 – Frota por Setor / Departamento</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <table>
        <thead><tr>
          <th>Setor</th>
          <th style="text-align:center">Ligeiros</th>
          <th style="text-align:center">Pesados</th>
          <th style="text-align:center">Máquinas</th>
          <th style="text-align:center">Total</th>
          <th style="text-align:center">% Frota</th>
          <th>Distribuição</th>
        </tr></thead>
        <tbody>${Object.entries(porSetor).sort((a,b)=>b[1]-a[1]).map(([s,n])=>{
          const vS=veiculos.filter(v=>v.setor===s);
          return `<tr>
            <td><strong>${s}</strong></td>
            <td style="text-align:center">${vS.filter(v=>v.tipo==='ligeiro').length}</td>
            <td style="text-align:center">${vS.filter(v=>v.tipo==='pesado').length}</td>
            <td style="text-align:center">${vS.filter(v=>v.tipo==='maquina').length}</td>
            <td style="text-align:center;font-weight:700">${n}</td>
            <td style="text-align:center">${veiculos.length?Math.round(n/veiculos.length*100):0}%</td>
            <td><div class="rel-bar-bg"><div class="rel-bar-fill" style="width:${veiculos.length?Math.round(n/veiculos.length*100):0}%;background:#8b5cf6"></div></div></td>
          </tr>`;
        }).join('')}
          <tr style="font-weight:700;background:#f8fafc">
            <td>TOTAL</td>
            <td style="text-align:center">${porTipo.ligeiro||0}</td>
            <td style="text-align:center">${porTipo.pesado||0}</td>
            <td style="text-align:center">${porTipo.maquina||0}</td>
            <td style="text-align:center">${veiculos.length}</td>
            <td style="text-align:center">100%</td><td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── LISTA COMPLETA ── -->
  <div class="rel-section-title">${icon('list',15)} Quadro 3 – Inventário Completo da Frota</div>
  <div class="card rel-card-mb">
    <div class="card-body" style="padding:0;">
      <div class="table-wrapper"><table>
        <thead><tr>
          <th>Nº Pat.</th><th>Matrícula</th><th>Tipo / Categoria</th>
          <th>Marca / Modelo</th><th>Ano</th><th>Combustível</th>
          <th>Setor</th><th>Responsável</th><th>Estado</th>
          <th style="text-align:center">Obras</th>
        </tr></thead>
        <tbody>${veiculos.map(v=>`
          <tr onclick="ir('veiculo-historico',{id:'${v.id}'})" style="cursor:pointer"
              class="${v.estado_op==='avaria'?'rel-row-danger':v.estado_op==='inativo'?'rel-row-inativo':''}">
            <td style="font-size:12px;color:var(--text-medium)">${v.patrimonio}</td>
            <td><strong style="color:var(--primary)">${v.matricula}</strong></td>
            <td style="font-size:12px">${v.categoria||TIPO_LABEL[v.tipo]}</td>
            <td>${v.marca} ${v.modelo}</td>
            <td>${v.ano}</td>
            <td style="font-size:12px">${v.combustivel||'—'}</td>
            <td><span class="badge badge-blue" style="font-size:10px">${v.setor}</span></td>
            <td style="font-size:12px;color:var(--text-medium)">${v.responsavel||'—'}</td>
            <td>${badgeEstadoOp(v.estado_op)}</td>
            <td style="text-align:center">
              <span class="badge ${obrasPorViat[v.matricula]?'badge-blue':'badge-gray'}" style="font-size:11px">
                ${obrasPorViat[v.matricula]||0}
              </span>
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  </div>`;
}

/* ================================================================
   CHARTS — todos os gráficos dos relatórios
================================================================ */
let _charts = {};
function destroyCharts() {
  Object.values(_charts).forEach(c=>{ try{c.destroy();}catch(e){} });
  _charts = {};
}
function _chart(id, config) {
  const el = document.getElementById(id); if (!el) return;
  if (_charts[id]) { try{_charts[id].destroy();}catch(e){} }
  _charts[id] = new Chart(el, config);
}

const _CHART_COLORS = ['#1a4d8f','#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#f97316','#0f766e','#e11d48','#0ea5e9','#84cc16','#6366f1'];

function _drawChartObrasEstado(obras) {
  const ab=obras.filter(o=>o.estado==='aberta').length;
  const fe=obras.filter(o=>o.estado==='fechada').length;
  _chart('chartObrasEstado',{type:'doughnut',data:{labels:['Em Curso','Concluídas'],datasets:[{data:[ab,fe],backgroundColor:['#ef4444','#22c55e'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw} obras`}}}}});
}

function _drawChartCustosMensais(obras) {
  const map={};
  obras.filter(o=>o.estado==='fechada'&&o.data_saida).forEach(o=>{
    const d=new Date(o.data_saida);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    map[k]=(map[k]||0)+(parseFloat(o.custo_total)||0);
  });
  const keys=Object.keys(map).sort().slice(-12);
  const nomes=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const labels=keys.map(k=>{const[a,m]=k.split('-');return `${nomes[parseInt(m)-1]} ${a}`;});
  _chart('chartCustosMensais',{type:'bar',data:{labels,datasets:[{label:'Custo (€)',data:keys.map(k=>map[k]),backgroundColor:'#3b82f6',borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`Custo: ${fmtEuro(ctx.raw)}`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtEuro(v)},grid:{color:'rgba(0,0,0,.04)'}},x:{grid:{display:false}}}}});
}

function _drawChartCustosMensais2(obras) {
  const maoMap={},servMap={},matMap={};
  obras.filter(o=>o.estado==='fechada'&&o.data_saida).forEach(o=>{
    const d=new Date(o.data_saida);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    maoMap[k]=(maoMap[k]||0)+(parseFloat(o.custo_mao_obra)||0);
    servMap[k]=(servMap[k]||0)+(parseFloat(o.custo_servicos_externos)||0);
    matMap[k]=(matMap[k]||0)+(parseFloat(o.custo_materiais)||0);
  });
  const keys=Object.keys(maoMap).sort().slice(-10);
  const nomes=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const labels=keys.map(k=>{const[a,m]=k.split('-');return `${nomes[parseInt(m)-1]} ${a}`;});
  _chart('chartCustosMensais2',{type:'bar',data:{labels,datasets:[
    {label:'Mão-de-Obra',data:keys.map(k=>maoMap[k]||0),backgroundColor:'#1a4d8f',borderRadius:3,stack:'s'},
    {label:'Serviços Ext.',data:keys.map(k=>servMap[k]||0),backgroundColor:'#3b82f6',borderRadius:3,stack:'s'},
    {label:'Materiais',data:keys.map(k=>matMap[k]||0),backgroundColor:'#93c5fd',borderRadius:3,stack:'s'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtEuro(v)},stacked:true},x:{stacked:true,grid:{display:false}}}}});
}

function _drawChartCustoTipo(obras) {
  const map={};
  obras.filter(o=>o.estado==='fechada').forEach(o=>{
    tiposArray(o.tipos_intervencao).forEach(t=>{map[t]=(map[t]||0)+(parseFloat(o.custo_total)||0);});
  });
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6);
  _chart('chartCustoTipo',{type:'doughnut',data:{labels:sorted.map(e=>e[0]),datasets:[{data:sorted.map(e=>e[1]),backgroundColor:_CHART_COLORS,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:10,font:{size:10}}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${fmtEuro(ctx.raw)}`}}}}});
}

function _drawChartTiposInt(obras) {
  const map={};
  obras.forEach(o=>tiposArray(o.tipos_intervencao).forEach(t=>{map[t]=(map[t]||0)+1;}));
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,7);
  _chart('chartTiposInt',{type:'bar',data:{labels:sorted.map(e=>e[0]),datasets:[{label:'Nº Obras',data:sorted.map(e=>e[1]),backgroundColor:_CHART_COLORS,borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{stepSize:1},grid:{color:'rgba(0,0,0,.04)'}},y:{grid:{display:false}}}}});
}

function _drawChartCustoVeiculo(obras) {
  const map={};
  obras.filter(o=>o.estado==='fechada').forEach(o=>{map[o.matricula]=(map[o.matricula]||0)+(parseFloat(o.custo_total)||0);});
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
  _chart('chartCustoVeiculo',{type:'bar',data:{labels:sorted.map(e=>e[0]),datasets:[{label:'Custo Total (€)',data:sorted.map(e=>e[1]),backgroundColor:_CHART_COLORS,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${fmtEuro(ctx.raw)}`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtEuro(v)},grid:{color:'rgba(0,0,0,.04)'}},x:{grid:{display:false}}}}});
}

function _drawChartAlertasTipos(alertas) {
  const CAMPOS=[
    {campo:'itp_proxima',lbl:'ITP',antec:30},
    {campo:'seguro_valido_ate',lbl:'Seguro',antec:30},
    {campo:'revisao_proxima',lbl:'Revisão',antec:30},
    {campo:'oleo_proxima_data',lbl:'Óleo',antec:14},
    {campo:'grua_proxima',lbl:'Grua',antec:60},
    {campo:'tacografo_proxima',lbl:'Tacógrafo',antec:30},
    {campo:'extintor_validade',lbl:'Extintor',antec:30},
    {campo:'licenciamento_validade',lbl:'Licença',antec:30},
  ];
  const exp=[],prox=[],ok=[];
  CAMPOS.forEach(c=>{
    let e=0,p=0,o2=0;
    alertas.forEach(al=>{
      const st=alertaStatus(al[c.campo],c.antec);
      if(st==='expirado')e++; else if(st==='proximo')p++; else if(st==='ok')o2++;
    });
    exp.push(e); prox.push(p); ok.push(o2);
  });
  _chart('chartAlertasTipos',{type:'bar',data:{labels:CAMPOS.map(c=>c.lbl),datasets:[
    {label:'Expirado',data:exp,backgroundColor:'#ef4444',borderRadius:3,stack:'s'},
    {label:'A Vencer',data:prox,backgroundColor:'#f59e0b',borderRadius:3,stack:'s'},
    {label:'Em Dia',data:ok,backgroundColor:'#22c55e',borderRadius:3,stack:'s'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}},scales:{y:{beginAtZero:true,stacked:true,ticks:{stepSize:1},grid:{color:'rgba(0,0,0,.04)'}},x:{stacked:true,grid:{display:false}}}}});
}

function _drawChartFrota(veiculos) {
  const l=veiculos.filter(v=>v.tipo==='ligeiro').length;
  const p=veiculos.filter(v=>v.tipo==='pesado').length;
  const m=veiculos.filter(v=>v.tipo==='maquina').length;
  _chart('chartFrota',{type:'doughnut',data:{labels:['Ligeiros','Pesados','Máquinas'],datasets:[{data:[l,p,m],backgroundColor:['#3b82f6','#f97316','#22c55e'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:14,font:{size:12}}}}}});
}

function _drawChartEstadoOp(veiculos) {
  const labels=['Operacional','Em Manutenção','Avaria','Inativo'];
  const data=[
    veiculos.filter(v=>v.estado_op==='operacional').length,
    veiculos.filter(v=>v.estado_op==='manutencao').length,
    veiculos.filter(v=>v.estado_op==='avaria').length,
    veiculos.filter(v=>v.estado_op==='inativo').length,
  ];
  _chart('chartEstadoOp',{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:['#22c55e','#f59e0b','#ef4444','#94a3b8'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:14,font:{size:12}}}}}});
}

/* ================================================================
   EXPORTAÇÃO EXCEL — multi-folha por aba
================================================================ */
function exportarRelatorioExcel(tab) {
  if (typeof XLSX==='undefined') { toastMsg('SheetJS não disponível','error'); return; }
  tab = tab || _relTabAtiva || 'resumo';
  const wb    = XLSX.utils.book_new();
  const obras = DB.getObras();
  const veics = DB.getVeiculos();
  const reqs  = DB.getReqs();
  const fats  = DB.getFaturas();
  const als   = DB.getAlertas();
  const hoje  = new Date().toISOString().slice(0,10);

  /* ── Helpers de estilo ── */
  function _sheet(data, nome) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, nome.slice(0,31));
  }

  if (tab==='resumo' || tab==='all') {
    /* Folha 1 — Resumo Intervenções por Setor */
    const porSetor={};
    obras.forEach(o=>{
      const s=o.setor_snapshot||'—';
      if(!porSetor[s]) porSetor[s]={Setor:s,'Total Intervenções':0,'Concluídas':0,'Em Curso':0,'Custo Total (€)':0};
      porSetor[s]['Total Intervenções']++;
      if(o.estado==='fechada'){porSetor[s]['Concluídas']++;porSetor[s]['Custo Total (€)']+=(parseFloat(o.custo_total)||0);}
      else porSetor[s]['Em Curso']++;
    });
    _sheet(Object.values(porSetor),'Resumo por Setor');

    /* Folha 2 — Intervenções por Tipo */
    const porTipo={};
    obras.forEach(o=>tiposArray(o.tipos_intervencao).forEach(t=>{
      if(!porTipo[t]) porTipo[t]={'Tipo de Intervenção':t,'Nº Obras':0,'% Total':'',};
      porTipo[t]['Nº Obras']++;
    }));
    const tot=obras.length;
    Object.values(porTipo).forEach(r=>{r['% Total']=tot?Math.round(r['Nº Obras']/tot*100)+'%':'—';});
    _sheet(Object.values(porTipo).sort((a,b)=>b['Nº Obras']-a['Nº Obras']),'Intervenções por Tipo');

    /* Folha 3 — Evolução Mensal */
    const mapMes={};
    obras.forEach(o=>{
      if(!o.data_entrada) return;
      const d=new Date(o.data_entrada);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if(!mapMes[k]) mapMes[k]={'Mês':k,'Nº Intervenções':0,'Obras Concluídas':0,'Em Curso':0,'Custo (€)':0};
      mapMes[k]['Nº Intervenções']++;
      if(o.estado==='fechada'){mapMes[k]['Obras Concluídas']++;mapMes[k]['Custo (€)']+=(parseFloat(o.custo_total)||0);}
      else mapMes[k]['Em Curso']++;
    });
    _sheet(Object.values(mapMes).sort((a,b)=>a['Mês'].localeCompare(b['Mês'])),'Evolução Mensal');
  }

  if (tab==='custos' || tab==='all') {
    /* Folha — Custo por Viatura */
    const porViat={};
    obras.filter(o=>o.estado==='fechada').forEach(o=>{
      const mat=o.matricula||'—';
      if(!porViat[mat]) porViat[mat]={'Matrícula':mat,'Setor':o.setor_snapshot||'—','Nº Obras':0,'Mão-de-Obra (€)':0,'Serv. Externos (€)':0,'Materiais (€)':0,'Total (€)':0};
      porViat[mat]['Nº Obras']++;
      porViat[mat]['Mão-de-Obra (€)']+=(parseFloat(o.custo_mao_obra)||0);
      porViat[mat]['Serv. Externos (€)']+=(parseFloat(o.custo_servicos_externos)||0);
      porViat[mat]['Materiais (€)']+=(parseFloat(o.custo_materiais)||0);
      porViat[mat]['Total (€)']+=(parseFloat(o.custo_total)||0);
    });
    _sheet(Object.values(porViat).sort((a,b)=>b['Total (€)']-a['Total (€)']),'Custo por Viatura');

    /* Folha — Custo por Setor */
    const porSetorC={};
    obras.filter(o=>o.estado==='fechada').forEach(o=>{
      const s=o.setor_snapshot||'—';
      if(!porSetorC[s]) porSetorC[s]={'Setor':s,'Obras':0,'Mão-de-Obra (€)':0,'Serv. Ext. (€)':0,'Materiais (€)':0,'Total (€)':0};
      porSetorC[s]['Obras']++;
      porSetorC[s]['Mão-de-Obra (€)']+=(parseFloat(o.custo_mao_obra)||0);
      porSetorC[s]['Serv. Ext. (€)']+=(parseFloat(o.custo_servicos_externos)||0);
      porSetorC[s]['Materiais (€)']+=(parseFloat(o.custo_materiais)||0);
      porSetorC[s]['Total (€)']+=(parseFloat(o.custo_total)||0);
    });
    _sheet(Object.values(porSetorC).sort((a,b)=>b['Total (€)']-a['Total (€)']),'Custo por Setor');

    /* Folha — Detalhe Obras */
    _sheet(obras.map(o=>({
      'Nº Obra':o.numero_obra,'Matrícula':o.matricula,'Setor':o.setor_snapshot||'—',
      'Tipo(s)':tiposStr(o.tipos_intervencao),'Estado':o.estado==='aberta'?'Em Curso':'Concluída',
      'Entrada':fmtDataHora(o.data_entrada),'Saída':o.data_saida?fmtDataHora(o.data_saida):'—',
      'Mão-de-Obra (€)':parseFloat(o.custo_mao_obra)||0,
      'Serviços Ext. (€)':parseFloat(o.custo_servicos_externos)||0,
      'Materiais (€)':parseFloat(o.custo_materiais)||0,
      'Custo Total (€)':parseFloat(o.custo_total)||0,
    })),'Detalhe Obras');
  }

  if (tab==='alertas' || tab==='all') {
    const CAMPOS=[
      {campo:'itp_proxima',lbl:'ITP',antec:30},
      {campo:'seguro_valido_ate',lbl:'Seguro',antec:30},
      {campo:'revisao_proxima',lbl:'Revisão',antec:30},
      {campo:'oleo_proxima_data',lbl:'Óleo',antec:14},
      {campo:'grua_proxima',lbl:'Grua',antec:60},
      {campo:'caixa_proxima',lbl:'Caixa',antec:60},
      {campo:'tacografo_proxima',lbl:'Tacógrafo',antec:30},
      {campo:'extintor_validade',lbl:'Extintor',antec:30},
      {campo:'licenciamento_validade',lbl:'Licenciamento',antec:30},
    ];
    /* Folha — Alertas por Viatura */
    const rowsAl = als.map(al=>{
      const v=veics.find(v=>v.id===al.veiculo_id)||{};
      const row={'Matrícula':al.matricula||v.matricula||'—','Setor':v.setor||'—','Departamento':v.departamento||'—'};
      CAMPOS.forEach(c=>{
        const st=alertaStatus(al[c.campo],c.antec);
        row[c.lbl+' — Data']=al[c.campo]||'—';
        row[c.lbl+' — Estado']=st==='expirado'?'EXPIRADO':st==='proximo'?'A VENCER':st==='ok'?'Em Dia':'Sem Data';
      });
      return row;
    });
    _sheet(rowsAl,'Alertas por Viatura');

    /* Folha — Resumo por Tipo Alerta */
    const contT={};
    CAMPOS.forEach(c=>{
      contT[c.lbl]={Certificação:c.lbl,'Antecedência (dias)':c.antec,Expirados:0,'A Vencer':0,'Em Dia':0,'Sem Data':0};
    });
    als.forEach(al=>{
      CAMPOS.forEach(c=>{
        const st=alertaStatus(al[c.campo],c.antec);
        if(st==='expirado')contT[c.lbl]['Expirados']++;
        else if(st==='proximo')contT[c.lbl]['A Vencer']++;
        else if(st==='ok')contT[c.lbl]['Em Dia']++;
        else contT[c.lbl]['Sem Data']++;
      });
    });
    _sheet(Object.values(contT),'Resumo Alertas por Tipo');
  }

  if (tab==='frota' || tab==='all') {
    /* Folha — Inventário Frota */
    const obrasPorViat={};
    obras.forEach(o=>{obrasPorViat[o.matricula]=(obrasPorViat[o.matricula]||0)+1;});
    const anoAtual=new Date().getFullYear();
    _sheet(veics.map(v=>({
      'Nº Patrimonial':v.patrimonio,'Matrícula':v.matricula,
      'Tipo':TIPO_LABEL[v.tipo]||v.tipo,'Categoria':v.categoria||'—',
      'Marca':v.marca,'Modelo':v.modelo,'Ano':v.ano,'Idade (anos)':anoAtual-v.ano,
      'Combustível':v.combustivel||'—','Km/Horas':v.km||v.horas||0,
      'Setor':v.setor,'Departamento':v.departamento||'—',
      'Responsável':v.responsavel||'—','Localização':v.localizacao||'—',
      'Estado Operacional':ESTADO_OP_LABEL[v.estado_op]||v.estado_op,
      'Ativo':v.ativo?'Sim':'Não',
      'Nº Intervenções':obrasPorViat[v.matricula]||0,
    })),'Inventário Frota');

    /* Folha — Resumo por Tipo */
    _sheet([
      {Tipo:'Ligeiros',..._resumoTipo(veics,'ligeiro',obras)},
      {Tipo:'Pesados',..._resumoTipo(veics,'pesado',obras)},
      {Tipo:'Máquinas',..._resumoTipo(veics,'maquina',obras)},
    ],'Frota por Tipo');
  }

  XLSX.writeFile(wb, `GOM_Relatorio_${tab}_${hoje}.xlsx`);
  toastMsg(`Excel exportado: GOM_Relatorio_${tab}_${hoje}.xlsx`, 'success');
}

function _resumoTipo(veics, tipo, obras) {
  const vT=veics.filter(v=>v.tipo===tipo);
  return {
    'Total':vT.length,
    'Operacional':vT.filter(v=>v.estado_op==='operacional').length,
    'Em Manutenção':vT.filter(v=>v.estado_op==='manutencao').length,
    'Avaria':vT.filter(v=>v.estado_op==='avaria').length,
    'Inativo':vT.filter(v=>v.estado_op==='inativo').length,
    'Intervenções':obras.filter(o=>vT.some(v=>v.matricula===o.matricula)).length,
  };
}

/* ================================================================
   EXPORTAÇÃO PDF — relatório institucional profissional
================================================================ */
function exportarRelatorioPDF(tab) {
  tab = tab || _relTabAtiva || 'resumo';
  const obras    = DB.getObras();
  const veics    = DB.getVeiculos();
  const als      = DB.getAlertas();
  const faturas  = DB.getFaturas();
  const reqs     = DB.getReqs();
  const agora    = new Date().toLocaleString('pt-PT');
  const hoje     = new Date().toLocaleDateString('pt-PT',{day:'2-digit',month:'long',year:'numeric'});
  const periodo  = _getPeriodoLabel();

  const fechadas  = obras.filter(o=>o.estado==='fechada');
  const abertas   = obras.filter(o=>o.estado==='aberta');
  const custoTotal= fechadas.reduce((s,o)=>s+(parseFloat(o.custo_total)||0),0);
  const vOp       = veics.filter(v=>v.estado_op==='operacional').length;

  const NOMES_TAB = {resumo:'Resumo Geral',custos:'Análise de Custos',alertas:'Estado de Alertas',frota:'Estado da Frota'};

  /* ── CSS comum ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;color:#1e293b;font-size:10pt;background:#fff;}
    /* Cabeçalho institucional */
    .hdr{background:linear-gradient(135deg,#123566,#1a4d8f);color:#fff;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
    .hdr-logo{display:flex;align-items:center;gap:12px;}
    .hdr-logo-box{width:44px;height:44px;background:rgba(255,255,255,.18);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;}
    .hdr-txt-org{font-size:9pt;opacity:.75;letter-spacing:.5px;text-transform:uppercase;}
    .hdr-txt-sys{font-size:16pt;font-weight:800;letter-spacing:-.3px;}
    .hdr-meta{text-align:right;font-size:9pt;opacity:.8;}
    /* Títulos de secção */
    h1{font-size:14pt;font-weight:800;color:#1a4d8f;margin:20px 0 10px;border-bottom:2px solid #1a4d8f;padding-bottom:5px;}
    h2{font-size:11pt;font-weight:700;color:#1a4d8f;margin:16px 0 8px;padding-left:8px;border-left:3px solid #1a4d8f;}
    /* Tabelas */
    table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:9pt;}
    thead{background:#1a4d8f;color:#fff;}
    thead th{padding:7px 10px;text-align:left;font-weight:700;font-size:8.5pt;letter-spacing:.3px;}
    tbody tr:nth-child(even){background:#f8fafc;}
    tbody tr:hover{background:#eff6ff;}
    td{padding:6px 10px;border-bottom:1px solid #e2e8f0;vertical-align:middle;}
    td.num{text-align:right;}td.ctr{text-align:center;}
    .total-row{background:#eff6ff!important;font-weight:700;}
    /* Badges inline */
    .b{display:inline-block;padding:2px 7px;border-radius:10px;font-size:8pt;font-weight:700;}
    .b-g{background:#d1fae5;color:#065f46;}.b-r{background:#fee2e2;color:#991b1b;}
    .b-y{background:#fef3c7;color:#92400e;}.b-b{background:#dbeafe;color:#1e40af;}
    .b-gr{background:#f1f5f9;color:#64748b;}
    /* Cards de métricas */
    .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
    .kpi{border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;text-align:center;}
    .kpi-n{font-size:18pt;font-weight:800;color:#1a4d8f;}
    .kpi-l{font-size:8pt;color:#64748b;margin-top:3px;text-transform:uppercase;letter-spacing:.4px;}
    /* Barra de progresso */
    .bar-wrap{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;}
    .bar-fill{height:100%;border-radius:3px;}
    /* Assinatura */
    .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:8pt;color:#94a3b8;}
    @media print{body{padding:0;}@page{margin:15mm;}}
  `;

  let corpo = '';

  if (tab==='resumo') {
    /* Quadro por setor */
    const porSetor={};
    obras.forEach(o=>{
      const s=o.setor_snapshot||'—';
      if(!porSetor[s]) porSetor[s]={n:0,ab:0,fe:0,custo:0};
      porSetor[s].n++;
      if(o.estado==='fechada'){porSetor[s].fe++;porSetor[s].custo+=(parseFloat(o.custo_total)||0);}
      else porSetor[s].ab++;
    });
    /* Quadro por tipo intervenção */
    const porTipo={};
    obras.forEach(o=>tiposArray(o.tipos_intervencao).forEach(t=>{porTipo[t]=(porTipo[t]||0)+1;}));
    const tiposS=Object.entries(porTipo).sort((a,b)=>b[1]-a[1]);

    corpo=`
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-n">${obras.length}</div><div class="kpi-l">Total Intervenções</div></div>
        <div class="kpi"><div class="kpi-n">${fechadas.length}</div><div class="kpi-l">Concluídas</div></div>
        <div class="kpi"><div class="kpi-n">${abertas.length}</div><div class="kpi-l">Em Curso</div></div>
        <div class="kpi"><div class="kpi-n">${veics.length}</div><div class="kpi-l">Viaturas</div></div>
        <div class="kpi"><div class="kpi-n" style="font-size:12pt">${fmtEuro(custoTotal)}</div><div class="kpi-l">Custo Total</div></div>
        <div class="kpi"><div class="kpi-n">${vOp}</div><div class="kpi-l">Viaturas Operacionais</div></div>
      </div>
      <h2>Intervenções por Setor</h2>
      <table><thead><tr><th>Setor</th><th class="ctr">Total</th><th class="ctr">Concluídas</th><th class="ctr">Em Curso</th><th class="num">Custo (€)</th><th class="ctr">%</th></tr></thead>
      <tbody>${Object.entries(porSetor).sort((a,b)=>b[1].n-a[1].n).map(([s,v])=>`
        <tr><td><strong>${s}</strong></td><td class="ctr">${v.n}</td><td class="ctr">${v.fe}</td><td class="ctr">${v.ab}</td><td class="num">${fmtEuro(v.custo)}</td><td class="ctr">${obras.length?Math.round(v.n/obras.length*100):0}%</td></tr>`).join('')}
        <tr class="total-row"><td>TOTAL</td><td class="ctr">${obras.length}</td><td class="ctr">${fechadas.length}</td><td class="ctr">${abertas.length}</td><td class="num">${fmtEuro(custoTotal)}</td><td class="ctr">100%</td></tr>
      </tbody></table>
      <h2>Intervenções por Tipo</h2>
      <table><thead><tr><th>Tipo de Intervenção</th><th class="ctr">Nº</th><th class="ctr">%</th></tr></thead>
      <tbody>${tiposS.map(([t,n])=>`<tr><td>${t}</td><td class="ctr">${n}</td><td class="ctr">${obras.length?Math.round(n/obras.length*100):0}%</td></tr>`).join('')}
        <tr class="total-row"><td>TOTAL</td><td class="ctr">${tiposS.reduce((s,[,n])=>s+n,0)}</td><td class="ctr">100%</td></tr>
      </tbody></table>`;

  } else if (tab==='custos') {
    const porViat={};
    fechadas.forEach(o=>{
      const mat=o.matricula||'—';
      if(!porViat[mat]) porViat[mat]={mat,obras:0,mao:0,serv:0,mat2:0,total:0,setor:o.setor_snapshot||'—'};
      porViat[mat].obras++;porViat[mat].mao+=(parseFloat(o.custo_mao_obra)||0);
      porViat[mat].serv+=(parseFloat(o.custo_servicos_externos)||0);
      porViat[mat].mat2+=(parseFloat(o.custo_materiais)||0);
      porViat[mat].total+=(parseFloat(o.custo_total)||0);
    });
    const viatS=Object.values(porViat).sort((a,b)=>b.total-a.total);
    const custoMao=fechadas.reduce((s,o)=>s+(parseFloat(o.custo_mao_obra)||0),0);
    const custoServ=fechadas.reduce((s,o)=>s+(parseFloat(o.custo_servicos_externos)||0),0);
    const custoMat=fechadas.reduce((s,o)=>s+(parseFloat(o.custo_materiais)||0),0);

    corpo=`
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-n" style="font-size:11pt">${fmtEuro(custoTotal)}</div><div class="kpi-l">Custo Total</div></div>
        <div class="kpi"><div class="kpi-n" style="font-size:11pt">${fmtEuro(custoMao)}</div><div class="kpi-l">Mão-de-Obra</div></div>
        <div class="kpi"><div class="kpi-n" style="font-size:11pt">${fmtEuro(custoServ)}</div><div class="kpi-l">Serviços Externos</div></div>
        <div class="kpi"><div class="kpi-n" style="font-size:11pt">${fmtEuro(custoMat)}</div><div class="kpi-l">Materiais</div></div>
        <div class="kpi"><div class="kpi-n">${fechadas.length}</div><div class="kpi-l">Obras Concluídas</div></div>
        <div class="kpi"><div class="kpi-n" style="font-size:11pt">${fmtEuro(fechadas.length?custoTotal/fechadas.length:0)}</div><div class="kpi-l">Custo Médio / Obra</div></div>
      </div>
      <h2>Custo por Viatura (Top 15)</h2>
      <table><thead><tr><th>Pos.</th><th>Matrícula</th><th>Setor</th><th class="ctr">Obras</th><th class="num">Mão-obra</th><th class="num">Serv.Ext.</th><th class="num">Materiais</th><th class="num">Total</th><th class="ctr">%</th></tr></thead>
      <tbody>${viatS.slice(0,15).map((v,i)=>`<tr>
        <td><strong>#${i+1}</strong></td><td><strong>${v.mat}</strong></td><td>${v.setor}</td><td class="ctr">${v.obras}</td>
        <td class="num">${fmtEuro(v.mao)}</td><td class="num">${fmtEuro(v.serv)}</td><td class="num">${fmtEuro(v.mat2)}</td>
        <td class="num"><strong>${fmtEuro(v.total)}</strong></td>
        <td class="ctr">${custoTotal?Math.round(v.total/custoTotal*100):0}%</td></tr>`).join('')}
        <tr class="total-row"><td colspan="3">TOTAL</td><td class="ctr">${fechadas.length}</td><td class="num">${fmtEuro(custoMao)}</td><td class="num">${fmtEuro(custoServ)}</td><td class="num">${fmtEuro(custoMat)}</td><td class="num">${fmtEuro(custoTotal)}</td><td class="ctr">100%</td></tr>
      </tbody></table>`;

  } else if (tab==='alertas') {
    const CAMPOS=[
      {campo:'itp_proxima',lbl:'ITP',antec:30},{campo:'seguro_valido_ate',lbl:'Seguro',antec:30},
      {campo:'revisao_proxima',lbl:'Revisão',antec:30},{campo:'oleo_proxima_data',lbl:'Óleo',antec:14},
      {campo:'grua_proxima',lbl:'Grua',antec:60},
      {campo:'caixa_proxima',lbl:'Caixa',antec:60},{campo:'tacografo_proxima',lbl:'Tacógrafo',antec:30},
      {campo:'extintor_validade',lbl:'Extintor',antec:30},
      {campo:'licenciamento_validade',lbl:'Licenciamento',antec:30},
    ];
    const cont={};
    CAMPOS.forEach(c=>{cont[c.lbl]={exp:0,prox:0,ok:0,sem:0};});
    als.forEach(al=>{CAMPOS.forEach(c=>{const st=alertaStatus(al[c.campo],c.antec);cont[c.lbl][st==='expirado'?'exp':st==='proximo'?'prox':st==='ok'?'ok':'sem']++;});});
    const totalExp=Object.values(cont).reduce((s,c)=>s+c.exp,0);
    const totalProx=Object.values(cont).reduce((s,c)=>s+c.prox,0);
    const totalOk=Object.values(cont).reduce((s,c)=>s+c.ok,0);

    corpo=`
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-n" style="color:#ef4444">${totalExp}</div><div class="kpi-l">Expirados</div></div>
        <div class="kpi"><div class="kpi-n" style="color:#f59e0b">${totalProx}</div><div class="kpi-l">A Vencer</div></div>
        <div class="kpi"><div class="kpi-n" style="color:#22c55e">${totalOk}</div><div class="kpi-l">Em Dia</div></div>
      </div>
      <h2>Estado das Certificações por Tipo</h2>
      <table><thead><tr><th>Certificação / Documento</th><th class="ctr">Antecedência</th><th class="ctr">⛔ Expirado</th><th class="ctr">⚠️ A Vencer</th><th class="ctr">✅ Em Dia</th><th class="ctr">Sem Data</th></tr></thead>
      <tbody>${CAMPOS.map(c=>`<tr style="${cont[c.lbl].exp>0?'background:#fff5f5':cont[c.lbl].prox>0?'background:#fffdf0':''}">
        <td><strong>${c.lbl}</strong></td><td class="ctr">${c.antec}d</td>
        <td class="ctr">${cont[c.lbl].exp>0?`<span class="b b-r">${cont[c.lbl].exp}</span>`:'—'}</td>
        <td class="ctr">${cont[c.lbl].prox>0?`<span class="b b-y">${cont[c.lbl].prox}</span>`:'—'}</td>
        <td class="ctr">${cont[c.lbl].ok>0?`<span class="b b-g">${cont[c.lbl].ok}</span>`:'—'}</td>
        <td class="ctr">${cont[c.lbl].sem}</td></tr>`).join('')}
        <tr class="total-row"><td>TOTAIS</td><td></td>
          <td class="ctr"><span class="b b-r">${totalExp}</span></td>
          <td class="ctr"><span class="b b-y">${totalProx}</span></td>
          <td class="ctr"><span class="b b-g">${totalOk}</span></td>
          <td class="ctr">${Object.values(cont).reduce((s,c)=>s+c.sem,0)}</td></tr>
      </tbody></table>
      <h2>Viaturas com Alertas Críticos</h2>
      <table><thead><tr><th>Matrícula</th><th>Tipo/Categoria</th><th>Setor</th><th>Responsável</th><th>Alertas Expirados</th><th>A Vencer</th></tr></thead>
      <tbody>${als.filter(al=>CAMPOS.some(c=>['expirado','proximo'].includes(alertaStatus(al[c.campo],c.antec)))).map(al=>{
        const v=veics.find(v=>v.id===al.veiculo_id)||{};
        const exp=CAMPOS.filter(c=>alertaStatus(al[c.campo],c.antec)==='expirado').map(c=>c.lbl);
        const prox=CAMPOS.filter(c=>alertaStatus(al[c.campo],c.antec)==='proximo').map(c=>c.lbl);
        return `<tr style="${exp.length?'background:#fff5f5':'background:#fffdf0'}">
          <td><strong>${al.matricula||v.matricula||'—'}</strong></td>
          <td>${v.categoria||TIPO_LABEL[v.tipo]||'—'}</td>
          <td>${v.setor||'—'}</td><td>${v.responsavel||'—'}</td>
          <td>${exp.length?`<span class="b b-r">${exp.join(', ')}</span>`:'—'}</td>
          <td>${prox.length?`<span class="b b-y">${prox.join(', ')}</span>`:'—'}</td></tr>`;
      }).join('')||'<tr><td colspan="6" style="text-align:center;color:#22c55e">✅ Sem viaturas com alertas críticos</td></tr>'}
      </tbody></table>`;

  } else if (tab==='frota') {
    const anoAtual=new Date().getFullYear();
    const idades=veics.map(v=>anoAtual-(v.ano||anoAtual)).filter(n=>n>=0);
    const idadeMed=idades.length?Math.round(idades.reduce((s,n)=>s+n,0)/idades.length):0;
    const porSetor={};
    veics.forEach(v=>{porSetor[v.setor]=(porSetor[v.setor]||0)+1;});
    const obrasPorViat={};obras.forEach(o=>{obrasPorViat[o.matricula]=(obrasPorViat[o.matricula]||0)+1;});

    corpo=`
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-n">${veics.length}</div><div class="kpi-l">Total Viaturas</div></div>
        <div class="kpi"><div class="kpi-n">${vOp}</div><div class="kpi-l">Operacionais</div></div>
        <div class="kpi"><div class="kpi-n">${idadeMed}</div><div class="kpi-l">Idade Média (anos)</div></div>
        <div class="kpi"><div class="kpi-n">${veics.filter(v=>v.tipo==='ligeiro').length}</div><div class="kpi-l">Ligeiros</div></div>
        <div class="kpi"><div class="kpi-n">${veics.filter(v=>v.tipo==='pesado').length}</div><div class="kpi-l">Pesados</div></div>
        <div class="kpi"><div class="kpi-n">${veics.filter(v=>v.tipo==='maquina').length}</div><div class="kpi-l">Máquinas</div></div>
      </div>
      <h2>Frota por Setor</h2>
      <table><thead><tr><th>Setor</th><th class="ctr">Ligeiros</th><th class="ctr">Pesados</th><th class="ctr">Máquinas</th><th class="ctr">Total</th><th class="ctr">%</th></tr></thead>
      <tbody>${Object.entries(porSetor).sort((a,b)=>b[1]-a[1]).map(([s,n])=>{
        const vS=veics.filter(v=>v.setor===s);
        return `<tr><td><strong>${s}</strong></td><td class="ctr">${vS.filter(v=>v.tipo==='ligeiro').length}</td><td class="ctr">${vS.filter(v=>v.tipo==='pesado').length}</td><td class="ctr">${vS.filter(v=>v.tipo==='maquina').length}</td><td class="ctr"><strong>${n}</strong></td><td class="ctr">${veics.length?Math.round(n/veics.length*100):0}%</td></tr>`;
      }).join('')}
        <tr class="total-row"><td>TOTAL</td><td class="ctr">${veics.filter(v=>v.tipo==='ligeiro').length}</td><td class="ctr">${veics.filter(v=>v.tipo==='pesado').length}</td><td class="ctr">${veics.filter(v=>v.tipo==='maquina').length}</td><td class="ctr">${veics.length}</td><td class="ctr">100%</td></tr>
      </tbody></table>
      <h2>Inventário da Frota</h2>
      <table><thead><tr><th>Pat.</th><th>Matrícula</th><th>Categoria</th><th>Marca/Modelo</th><th class="ctr">Ano</th><th>Setor</th><th>Estado</th><th class="ctr">Obras</th></tr></thead>
      <tbody>${veics.map(v=>`<tr style="${v.estado_op==='avaria'?'background:#fff5f5':v.estado_op==='inativo'?'background:#f8fafc':''}">
        <td style="font-size:8pt">${v.patrimonio}</td><td><strong>${v.matricula}</strong></td>
        <td style="font-size:8.5pt">${v.categoria||TIPO_LABEL[v.tipo]}</td>
        <td>${v.marca} ${v.modelo}</td><td class="ctr">${v.ano}</td>
        <td>${v.setor}</td>
        <td><span class="b ${v.estado_op==='operacional'?'b-g':v.estado_op==='manutencao'?'b-y':v.estado_op==='avaria'?'b-r':'b-gr'}">${ESTADO_OP_LABEL[v.estado_op]||v.estado_op}</span></td>
        <td class="ctr">${obrasPorViat[v.matricula]||0}</td></tr>`).join('')}
      </tbody></table>`;
  }

  /* Montar HTML final */
  const html=`<!DOCTYPE html><html lang="pt-PT"><head><meta charset="UTF-8">
    <title>GOM v3.0 — Relatório ${NOMES_TAB[tab]}</title>
    <style>${css}</style></head>
    <body>
    <div class="hdr">
      <div class="hdr-logo">
        <div class="hdr-logo-box">🚛</div>
        <div>
          <div class="hdr-txt-org">Município · Serviço de Frotas</div>
          <div class="hdr-txt-sys">GOM v3.0 — Gestão de Frota</div>
        </div>
      </div>
      <div class="hdr-meta">
        <div><strong>Relatório: ${NOMES_TAB[tab]}</strong></div>
        <div>Período: ${periodo}</div>
        <div>Emitido em: ${hoje}</div>
      </div>
    </div>
    <h1>${NOMES_TAB[tab]}</h1>
    ${corpo}
    <div class="footer">
      <span>GOM v3.0 · Gestão de Obras de Manutenção de Frota Municipal</span>
      <span>Gerado em ${agora}</span>
    </div>
    </body></html>`;

  const pa=document.getElementById('printArea');
  pa.innerHTML=html; pa.style.display='block';
  setTimeout(()=>{
    window.print();
    setTimeout(()=>{ pa.style.display='none'; pa.innerHTML=''; }, 1800);
  },300);
  toastMsg(`A gerar PDF: ${NOMES_TAB[tab]}…`,'success');
}

/* ================================================================
   18. IMPRESSÃO OBRA
   ================================================================ */
function imprimirObra(id) {
  const o=DB.getObra(id); if(!o) return;
  const mao =Number(o.custo_mao_obra||0);
  const serv=Number(o.custo_servicos_externos||0);
  const mat =Number(o.custo_materiais||0);
  const tot =Number(o.custo_total||0)||(mao+serv+mat);
  const agora=new Date().toLocaleString('pt-PT');
  document.getElementById('printArea').innerHTML=`
    <style>
      @page{size:A4;margin:18mm 16mm;}
      *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
      body{font-size:11pt;color:#111;}
      .ph{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #1a4d8f;margin-bottom:18px;}
      .logo{width:52px;height:52px;background:#1a4d8f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border-radius:4px;flex-shrink:0;}
      .org h1{font-size:13pt;color:#1a4d8f;font-weight:800;}.org p{font-size:9pt;color:#666;margin-top:2px;}
      .doc-right{text-align:right;}.doc-right h2{font-size:15pt;font-weight:900;color:#1a4d8f;}
      .doc-right .num{font-size:12pt;color:#333;margin-top:3px;}
      .estado-box{display:inline-block;padding:3px 12px;border-radius:10px;font-size:9pt;font-weight:700;margin-top:5px;background:${o.estado==='fechada'?'#d4edda':'#fee2e2'};color:${o.estado==='fechada'?'#1e7e44':'#b91c1c'};}
      .ig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px;}
      .ii{border:1px solid #ddd;border-radius:4px;padding:10px;}
      .il{font-size:8pt;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
      .iv{font-size:11pt;font-weight:700;color:#1a4d8f;}.iv.n{font-size:10pt;color:#111;}
      .sec{margin-bottom:14px;}.st{font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#1a4d8f;border-bottom:1.5px solid #1a4d8f;padding-bottom:4px;margin-bottom:8px;}
      .sb{padding:10px;border:1px solid #e0e0e0;border-radius:4px;font-size:10pt;line-height:1.6;min-height:44px;background:#fafafa;white-space:pre-wrap;}
      .ct{width:100%;border-collapse:collapse;}.ct td{padding:7px 10px;border:1px solid #ddd;font-size:10pt;}
      .ct tr:last-child td{font-weight:800;background:#1a4d8f;color:#fff;font-size:11pt;}.ct td:last-child{text-align:right;}
      .assin{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;}
      .ab{border-top:1.5px solid #333;padding-top:6px;text-align:center;font-size:9pt;color:#555;}
      .footer{margin-top:20px;border-top:1px solid #ccc;padding-top:8px;display:flex;justify-content:space-between;font-size:8pt;color:#888;}
    </style>
    <div class="ph">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="logo">CM</div>
        <div class="org"><h1>Câmara Municipal</h1><p>Serviço de Gestão de Frota e Manutenção</p><p>GOM v3.0 — Gestão de Obras de Manutenção</p></div>
      </div>
      <div class="doc-right"><h2>Ordem de Trabalho</h2><div class="num">${o.numero_obra}</div>
        <div class="estado-box">${o.estado==='fechada'?'✓ CONCLUÍDA':'⚙ EM ABERTO'}</div></div>
    </div>
    <div class="ig">
      <div class="ii"><div class="il">Matrícula</div><div class="iv">${esc(o.matricula)}</div></div>
      <div class="ii"><div class="il">Nº de Património</div><div class="iv">${esc(o.patrimonio||'—')}</div></div>
      <div class="ii"><div class="il">Setor</div><div class="iv n">${esc(o.setor_snapshot||'—')}</div></div>
      <div class="ii"><div class="il">Entrada</div><div class="iv n">${fmtDataHora(o.data_entrada)}</div></div>
      <div class="ii"><div class="il">Saída</div><div class="iv n">${fmtDataHora(o.data_saida)}</div></div>
      <div class="ii"><div class="il">Imobilização</div><div class="iv n">${calcDuracao(o.data_entrada,o.data_saida)}</div></div>
    </div>
    <div class="sec"><div class="st">Tipos de Intervenção</div><div class="sb">${esc(tiposStr(o.tipos_intervencao))}</div></div>
    <div class="sec"><div class="st">Descrição da Avaria / Intervenção</div><div class="sb">${esc(o.descricao_avaria||'Sem descrição')}</div></div>
    <div class="sec"><div class="st">Trabalhos Realizados</div><div class="sb">${esc(o.trabalhos_realizados||'Não preenchido')}</div></div>
    <div class="sec"><div class="st">Peças e Materiais</div><div class="sb">${esc(o.pecas_materiais||'Não preenchido')}</div></div>
    <div class="sec"><div class="st">Serviços Externos</div><div class="sb">${esc(o.servicos_externos||'Não aplicável')}</div></div>
    <div class="sec"><div class="st">Resumo de Custos</div>
      <table class="ct">
        <tr><td>Mão de obra interna</td><td>${fmtEuro(mao)}</td></tr>
        <tr><td>Serviços externos</td><td>${fmtEuro(serv)}</td></tr>
        <tr><td>Materiais / Peças</td><td>${fmtEuro(mat)}</td></tr>
        <tr><td>CUSTO TOTAL</td><td>${fmtEuro(tot)}</td></tr>
      </table></div>
    <div class="assin"><div class="ab">Responsável pela Intervenção</div><div class="ab">Chefe de Serviço / Responsável</div></div>
    <div class="footer"><span>Impresso em ${agora}</span><span>GOM v3.0 · Câmara Municipal</span><span>Documento interno</span></div>`;
  document.getElementById('printArea').style.display='block';
  window.print();
  setTimeout(()=>{document.getElementById('printArea').style.display='none';document.getElementById('printArea').innerHTML='';},1500);
}

/* ================================================================
   EVENTOS GLOBAIS — registados em fixes.js
   ================================================================ */
