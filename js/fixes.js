/* ================================================================
   GOM v3.0 — FIXES / STARTUP (MVP OFFLINE)
   100% localStorage · sem Firebase · sem VIA · sem APIs externas

   RESPONSABILIDADES:
   1. Arranque DOMContentLoaded — DB.init() + ir('dashboard')
   2. Eventos globais: modal, sidebar, nav-links
   3. Tabs: switchRelTab, switchFatTab
   4. CRUD de veículos, obras, alertas, requisições, faturas
      (funções expostas no window para serem chamadas via onclick no HTML)
   5. Utilitários auxiliares (lerCheckboxesTipos, etc.)
================================================================ */
'use strict';

/* ================================================================
   UTILITÁRIOS INTERNOS
================================================================ */
function _el(id)  { return document.getElementById(id); }
function _v(id)   { var e=_el(id); return e ? (e.value||'') : ''; }
function _n(id)   { return parseFloat((_v(id)||'0').replace(',','.'))||0; }
function _b(id)   { var e=_el(id); return e ? !!e.checked : false; }

function _toast(m, t) {
  if (typeof toastMsg === 'function') toastMsg(m, t||'');
}
function _close() {
  if (typeof closeModal === 'function') closeModal();
}
function _ir(pag, params) {
  if (typeof ir === 'function') setTimeout(function(){ ir(pag, params||{}); }, 300);
}
function _refresh(fn, arg, delay) {
  setTimeout(function(){
    if (typeof window[fn] === 'function') {
      if (arg !== undefined) window[fn](arg); else window[fn]();
    }
  }, delay||320);
}
function _badgeAlertas() {
  if (typeof atualizarBadgeAlertas === 'function') atualizarBadgeAlertas();
}

/* Lê checkboxes do formulário com prefixo dado (ex.: 'nv', 'ua') */
function lerCheckboxesTipos(pref) {
  var boxes = document.querySelectorAll('input[type="checkbox"][name="'+pref+'_tipo"]');
  var arr   = [];
  boxes.forEach(function(b){ if(b.checked) arr.push(b.value); });
  return arr;
}
window.lerCheckboxesTipos = lerCheckboxesTipos;

/* ================================================================
   1. CRUD — VEÍCULOS
================================================================ */
window.criarVeiculo = function() {
  var mat     = (_v('vf_mat')||'').trim().toUpperCase();
  var pat     = _v('vf_pat').trim();
  var tipo    = _v('vf_tipo');
  var cat     = _v('vf_categoria');
  var setor   = _v('vf_setor');
  var depto   = _v('vf_departamento');
  var marca   = _v('vf_marca').trim();
  var modelo  = _v('vf_modelo').trim();
  var ano     = parseInt(_v('vf_ano'))||new Date().getFullYear();
  var comb    = _v('vf_combustivel');
  var estOp   = _v('vf_estado_op')||'operacional';
  var ativo   = _v('vf_ativo') !== 'false';
  var resp    = _v('vf_responsavel');
  var loc     = _v('vf_localizacao');

  if (!mat||!pat||!marca||!modelo) {
    _toast('Preencha todos os campos obrigatórios','error'); return;
  }
  var existe = DB.getVeiculos().find(function(v){ return v.matricula===mat; });
  if (existe) { _toast('Matrícula já registada','error'); return; }

  DB.criarVeiculo({
    matricula:mat, patrimonio:pat, tipo:tipo, categoria:cat||'',
    setor:setor, departamento:depto||'', marca:marca, modelo:modelo, ano:ano,
    combustivel:comb||'diesel', estado_op:estOp, ativo:ativo,
    responsavel:resp||'', localizacao:loc||'',
    km:0, horas:0
  });
  _close();
  _toast('Veículo '+mat+' registado com sucesso!','success');
  _refresh('renderVeiculos');
};

window.guardarVeiculo = function(vid) {
  var mat     = (_v('vf_mat')||'').trim().toUpperCase();
  var pat     = _v('vf_pat').trim();
  var tipo    = _v('vf_tipo');
  var cat     = _v('vf_categoria');
  var setor   = _v('vf_setor');
  var depto   = _v('vf_departamento');
  var marca   = _v('vf_marca').trim();
  var modelo  = _v('vf_modelo').trim();
  var ano     = parseInt(_v('vf_ano'))||new Date().getFullYear();
  var comb    = _v('vf_combustivel');
  var estOp   = _v('vf_estado_op')||'operacional';
  var ativo   = _v('vf_ativo') !== 'false';
  var resp    = _v('vf_responsavel');
  var loc     = _v('vf_localizacao');
  var km      = _n('vf_km');
  var horas   = _n('vf_horas');

  if (!mat||!pat||!marca||!modelo) {
    _toast('Preencha todos os campos obrigatórios','error'); return;
  }
  DB.actualizarVeiculo(vid, {
    matricula:mat, patrimonio:pat, tipo:tipo, categoria:cat||'',
    setor:setor, departamento:depto||'', marca:marca, modelo:modelo, ano:ano,
    combustivel:comb||'diesel', estado_op:estOp, ativo:ativo,
    responsavel:resp||'', localizacao:loc||'',
    km:km||0, horas:horas||0
  });
  _close();
  _toast('Veículo atualizado com sucesso!','success');
  _refresh('renderVeiculos');
};

window.eliminarVeiculo = function(vid) {
  var v = DB.getVeiculo(vid);
  if (!v) return;
  var obras   = DB.getObras().filter(function(o){ return o.veiculo_id===vid||o.matricula===v.matricula; });
  var msg     = obras.length > 0
    ? 'Atenção: O veículo '+v.matricula+' tem '+obras.length+' obra(s).\nEliminar o veículo não apagará as obras — o histórico ficará preservado.\n\nDeseja continuar?'
    : 'Eliminar o veículo '+v.matricula+'?';
  if (!confirm(msg)) return;
  DB.eliminarVeiculo(vid);
  _toast('Veículo eliminado.','warning');
  _refresh('renderVeiculos');
};

window.guardarSetor = function(vid) {
  var novo = _v('novo_setor');
  if (!novo) { _toast('Selecione um setor','error'); return; }
  DB.actualizarVeiculo(vid, {setor:novo});
  _close();
  _toast('Setor atualizado com sucesso!','success');
  _refresh('renderVeiculos');
};

/* ================================================================
   2. CRUD — OBRAS
================================================================ */
window.criarObra = function() {
  var sel    = _el('nv_veiculo');
  var vid    = sel ? sel.value : '';
  if (!vid) { _toast('Seleccione um veículo','error'); return; }
  var opt    = sel.options[sel.selectedIndex];
  var mat    = opt.dataset.mat   || '';
  var pat    = opt.dataset.pat   || '';
  var setor  = opt.dataset.setor || '';
  var entrada= _v('nv_entrada');
  var saida  = _v('nv_saida') || null;
  var tipos  = lerCheckboxesTipos('nv');
  var desc   = (_v('nv_desc')||'').trim();
  if (!entrada)       { _toast('Preencha a data/hora de entrada','error'); return; }
  if (!tipos.length)  { _toast('Seleccione pelo menos um tipo de intervenção','error'); return; }
  if (!desc)          { _toast('Preencha a descrição','error'); return; }
  var ano = new Date(entrada).getFullYear();
  var num = DB.proximoNumeroObra(ano);
  DB.criarObra({
    numero_obra:num,
    veiculo_id:vid, matricula:mat, patrimonio:pat, setor_snapshot:setor,
    data_entrada:entrada, data_saida:saida, estado:'aberta',
    tipos_intervencao:tipos, descricao_avaria:desc,
    trabalhos_realizados:'', pecas_materiais:'', servicos_externos:'',
    custo_mao_obra:0, custo_servicos_externos:0, custo_materiais:0, custo_total:0
  });
  _close();
  _toast('Obra '+num+' criada com sucesso!','success');
  _ir('obras');
};

window.actualizarObra = function(id) {
  var entrada   = _v('ua_entrada') || null;
  var saida     = _v('ua_saida')   || null;
  var tipos     = lerCheckboxesTipos('ua');
  var trabalhos = _v('ua_trabalhos');
  var pecas     = _v('ua_pecas');
  var servicos  = _v('ua_servicos');
  var mao       = _n('ua_mao');
  var servext   = _n('ua_servext');
  var mat       = _n('ua_mat');
  DB.actualizarObra(id, {
    data_entrada:entrada, data_saida:saida,
    tipos_intervencao:tipos, trabalhos_realizados:trabalhos,
    pecas_materiais:pecas, servicos_externos:servicos,
    custo_mao_obra:mao, custo_servicos_externos:servext, custo_materiais:mat,
    custo_total:mao+servext+mat
  });
  _close();
  _toast('Obra actualizada com sucesso!','success');
  var pg = typeof paginaAtual !== 'undefined' ? paginaAtual : '';
  if (pg === 'obra-detalhe') _refresh('renderObraDetalhe', id);
  else _ir('obras');
};

window.fecharObra = function(id) {
  var saida  = _v('fc_saida');
  var entrada= _v('fc_entrada');
  if (!saida) { _toast('Preencha a data/hora de saída','error'); return; }
  var mao  = _n('fc_mao');
  var serv = _n('fc_serv');
  var mat  = _n('fc_mat');
  DB.actualizarObra(id, {
    estado:'fechada', data_entrada:entrada||null, data_saida:saida,
    custo_mao_obra:mao, custo_servicos_externos:serv,
    custo_materiais:mat, custo_total:mao+serv+mat
  });
  _close();
  _toast('Obra fechada com sucesso!','success');
  var pg = typeof paginaAtual !== 'undefined' ? paginaAtual : '';
  if (pg === 'obra-detalhe') _refresh('renderObraDetalhe', id);
  else _ir('obras');
};

window.eliminarObra = function(oid) {
  if (!confirm('Eliminar esta obra? Esta acção não pode ser desfeita.')) return;
  DB.eliminarObra(oid);
  _toast('Obra eliminada.','warning');
  _ir('obras');
};

/* ================================================================
   3. CRUD — ALERTAS & CERTIFICAÇÕES (11 tipos)
================================================================ */
window.criarAlerta = function() {
  var sel = _el('al_veiculo');
  var vid = sel ? sel.value : '';
  if (!vid) { _toast('Seleccione um veículo','error'); return; }

  /* Recolher todos os campos de data por tipo */
  var campos = {};
  var TIPOS = ['itp','seguro','revisao','oleo','pneus','grua','caixa','tacografo','extintor','higienizacao','licenciamento'];
  /* Mapas campos formulário → campo interno */
  var MAP_PROX = {
    itp:'itp_proxima', seguro:'seguro_valido_ate', revisao:'revisao_proxima',
    oleo:'oleo_proxima_data', pneus:'pneus_proxima', grua:'grua_proxima',
    caixa:'caixa_proxima', tacografo:'tacografo_proxima',
    extintor:'extintor_validade', higienizacao:'higienizacao_proxima',
    licenciamento:'licenciamento_validade'
  };
  var MAP_ULT = {
    itp:'itp_ultima', revisao:'revisao_ultima', oleo:'oleo_ultima_data',
    extintor:'extintor_ultima', higienizacao:'higienizacao_ultima'
  };

  TIPOS.forEach(function(t){
    var proxField = MAP_PROX[t];
    var ultField  = MAP_ULT[t];
    if (proxField) {
      var v = _v('al_'+t+'_prox') || _v('al_'+proxField);
      if (v) campos[proxField] = v;
    }
    if (ultField) {
      var v2 = _v('al_'+t+'_ult') || _v('al_'+ultField);
      if (v2) campos[ultField] = v2;
    }
  });

  /* Verificar se já existe registo para este veículo */
  var ex = DB.getAlerta(vid);
  if (ex) {
    DB.actualizarAlerta(ex.id, campos);
    _toast('Alertas actualizados!','success');
  } else {
    campos.veiculo_id = vid;
    var opt = sel.options[sel.selectedIndex];
    campos.matricula  = opt.dataset.mat || '';
    DB.criarAlerta(campos);
    _toast('Alertas registados com sucesso!','success');
  }
  _close();
  _badgeAlertas();
  _refresh('renderAlertas');
};

window.guardarAlerta = function(alId) {
  var MAP_PROX = {
    itp:'itp_proxima', seguro:'seguro_valido_ate', revisao:'revisao_proxima',
    oleo:'oleo_proxima_data', pneus:'pneus_proxima', grua:'grua_proxima',
    caixa:'caixa_proxima', tacografo:'tacografo_proxima',
    extintor:'extintor_validade', higienizacao:'higienizacao_proxima',
    licenciamento:'licenciamento_validade'
  };
  var MAP_ULT = {
    itp:'itp_ultima', revisao:'revisao_ultima', oleo:'oleo_ultima_data',
    extintor:'extintor_ultima', higienizacao:'higienizacao_ultima'
  };
  var campos = {};
  Object.keys(MAP_PROX).forEach(function(t){
    var f = MAP_PROX[t];
    var v = _v('al_'+t+'_prox') || _v('ale_'+f) || _v(f);
    if (v) campos[f] = v;
  });
  Object.keys(MAP_ULT).forEach(function(t){
    var f = MAP_ULT[t];
    var v = _v('al_'+t+'_ult') || _v('ale_'+f) || _v(f);
    if (v) campos[f] = v;
  });

  DB.actualizarAlerta(alId, campos);
  _close();
  _toast('Alertas guardados!','success');
  _badgeAlertas();
  var pg = typeof paginaAtual !== 'undefined' ? paginaAtual : '';
  if (pg === 'alertas') _refresh('renderAlertas');
  else if (pg === 'veiculo-historico') {
    /* refrescar histórico — manter veiculo_id */
    var al = DB.getAlertas().find(function(a){ return a.id===alId; });
    if (al && typeof renderVeiculoHistorico === 'function') {
      _refresh('renderVeiculoHistorico', al.veiculo_id);
    }
  }
};

/* ITP — compatibilidade com código legado que ainda chame criarITP/guardarITP */
window.criarITP = function() { window.criarAlerta(); };
window.guardarITP = function(alId) { window.guardarAlerta(alId); };
window.eliminarITP = function(alId) {
  if (!confirm('Eliminar registo de alertas?')) return;
  DB.eliminarAlerta(alId);
  _toast('Registo eliminado.','warning');
  _badgeAlertas();
  _refresh('renderAlertas');
};

/* ================================================================
   4. CRUD — REQUISIÇÕES
================================================================ */
window.criarReq = function() {
  var desc  = (_v('req_desc')||'').trim();
  var valor = _n('req_valor');
  var data  = _v('req_data');
  if (!desc) { _toast('Preencha a descrição','error'); return; }
  if (!data) { _toast('Preencha a data','error'); return; }
  var sel  = _el('req_veiculo');
  var vid  = sel ? sel.value : '';
  var mat  = (vid && sel.selectedIndex>=0) ? (sel.options[sel.selectedIndex].dataset.mat||'') : '';
  var num  = DB.proximoNumeroReq();
  DB.criarReq({
    numero_req:num,
    veiculo_id:vid||null, matricula:mat||null,
    obra_id:_v('req_obra')||null,
    tipo:_v('req_tipo'), estado:_v('req_estado')||'pendente',
    descricao:desc, valor:valor, data:data,
    fornecedor:_v('req_fornecedor'), observacoes:_v('req_obs')
  });
  _close();
  _toast('Requisição '+num+' criada!','success');
  _refresh('renderFaturacao');
};

window.guardarReq = function(id) {
  var desc  = (_v('req_desc')||'').trim();
  var valor = _n('req_valor');
  var data  = _v('req_data');
  if (!desc) { _toast('Preencha a descrição','error'); return; }
  var sel  = _el('req_veiculo');
  var vid  = sel ? sel.value : '';
  var mat  = (vid && sel.selectedIndex>=0) ? (sel.options[sel.selectedIndex].dataset.mat||'') : '';
  DB.actualizarReq(id, {
    veiculo_id:vid||null, matricula:mat||null,
    obra_id:_v('req_obra')||null,
    tipo:_v('req_tipo'), estado:_v('req_estado')||'pendente',
    descricao:desc, valor:valor, data:data,
    fornecedor:_v('req_fornecedor'), observacoes:_v('req_obs')
  });
  _close();
  _toast('Requisição atualizada!','success');
  _refresh('renderFaturacao');
};

window.eliminarReq = function(id) {
  if (!confirm('Eliminar esta requisição?')) return;
  DB.eliminarReq(id);
  _toast('Requisição eliminada.','warning');
  _refresh('renderFaturacao');
};

/* ================================================================
   5. CRUD — FATURAS
================================================================ */
window.criarFaturaModal = function() {
  var desc  = (_v('fat_desc')||'').trim();
  var valor = _n('fat_valor');
  var data  = _v('fat_data');
  if (!desc) { _toast('Preencha a descrição','error'); return; }
  if (!data) { _toast('Preencha a data da fatura','error'); return; }
  var sel  = _el('fat_veiculo');
  var vid  = sel ? sel.value : '';
  var mat  = (vid && sel.selectedIndex>=0) ? (sel.options[sel.selectedIndex].dataset.mat||'') : '';
  var num  = DB.proximoNumeroFatura();
  DB.criarFatura({
    numero_fat:num,
    numero_fatura_ext:_v('fat_num_ext'),
    veiculo_id:vid||null, matricula:mat||null,
    obra_id:_v('fat_obra')||null,
    req_id:_v('fat_req')||null,
    fornecedor:_v('fat_fornecedor'),
    valor:valor, data_fatura:data,
    data_vencimento:_v('fat_venc')||null,
    estado:_v('fat_estado')||'pendente',
    descricao:desc,
    observacoes:_v('fat_obs')
  });
  _close();
  _toast('Fatura '+num+' registada!','success');
  if (typeof renderFaturacao==='function') setTimeout(function(){ renderFaturacao('faturas'); }, 320);
};

window.guardarFaturaModal = function(fatId) {
  var desc  = (_v('fat_desc')||'').trim();
  var valor = _n('fat_valor');
  var data  = _v('fat_data');
  if (!desc) { _toast('Preencha a descrição','error'); return; }
  var sel  = _el('fat_veiculo');
  var vid  = sel ? sel.value : '';
  var mat  = (vid && sel.selectedIndex>=0) ? (sel.options[sel.selectedIndex].dataset.mat||'') : '';
  DB.actualizarFatura(fatId, {
    numero_fatura_ext:_v('fat_num_ext'),
    veiculo_id:vid||null, matricula:mat||null,
    obra_id:_v('fat_obra')||null,
    req_id:_v('fat_req')||null,
    fornecedor:_v('fat_fornecedor'),
    valor:valor, data_fatura:data,
    data_vencimento:_v('fat_venc')||null,
    estado:_v('fat_estado')||'pendente',
    descricao:desc,
    observacoes:_v('fat_obs')
  });
  _close();
  _toast('Fatura atualizada!','success');
  if (typeof renderFaturacao==='function') setTimeout(function(){ renderFaturacao('faturas'); }, 320);
};

window.eliminarFatura = function(fatId) {
  var f = DB.getFatura(fatId);
  if (!f) return;
  if (!confirm('Eliminar fatura '+f.numero_fat+'?')) return;
  DB.eliminarFatura(fatId);
  _toast('Fatura eliminada.','warning');
  if (typeof renderFaturacao==='function') setTimeout(function(){ renderFaturacao('faturas'); }, 320);
};

/* ================================================================
   6. TABS
================================================================ */

/* switchRelTab — Relatórios: 4 abas */
window.switchRelTab = function(btn, tab) {
  if (typeof destroyCharts === 'function') destroyCharts();
  var relTabs = _el('relTabs');
  if (relTabs) relTabs.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  /* IDs das abas de conteúdo geradas em renderRelatorios() */
  var mapa = {
    resumo:   'relTabResumo',
    custos:   'relTabCustos',
    alertas:  'relTabAlertas',
    frota:    'relTabFrota'
  };
  Object.keys(mapa).forEach(function(k){
    var el = _el(mapa[k]);
    if (el) el.style.display = (k===tab) ? '' : 'none';
  });
};

/* switchFatTab — Faturação: requisições / faturas */
window.switchFatTab = function(btn, tab) {
  var fatTabs = _el('fatTabs');
  if (fatTabs) fatTabs.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var tabIds = { requisicoes:'fatTabRequisicoes', faturas:'fatTabFaturas', historico:'fatTabHistorico' };
  Object.keys(tabIds).forEach(function(k){
    var el = _el(tabIds[k]);
    if (el) el.style.display = (k===tab) ? 'block' : 'none';
  });
  /* Atualizar botão de ação da topbar */
  var btnTop = _el('btnNovaFaturacao');
  if (btnTop) {
    if (tab==='faturas') {
      btnTop.innerHTML = (typeof icon==='function'?icon('plus',14):'+') + ' Nova Fatura';
      btnTop.onclick   = function(){ if(typeof modalNovaFatura==='function') modalNovaFatura(); };
    } else {
      btnTop.innerHTML = (typeof icon==='function'?icon('plus',14):'+') + ' Nova Requisição';
      btnTop.onclick   = function(){ if(typeof modalNovaReq==='function') modalNovaReq(); };
    }
  }
};

/* ================================================================
   7. ARRANQUE — DOMContentLoaded
================================================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* ── Barra de carregamento ── */
  if (typeof window._loadingStep === 'function') window._loadingStep(25, 'A inicializar dados…');

  /* ── Inicializar base de dados (localStorage) ── */
  DB.init();

  if (typeof window._loadingStep === 'function') window._loadingStep(55, 'A construir interface…');

  /* ── Eventos do modal ── */
  var overlay = _el('modalOverlay');
  var btnClose = _el('modalClose');
  if (overlay)  overlay.addEventListener('click',  function(e){ if(e.target===overlay) closeModal(); });
  if (btnClose) btnClose.addEventListener('click', function(){ closeModal(); });

  /* ── Toggle sidebar (mobile) ── */
  var menuToggle = _el('menuToggle');
  var sidebar    = _el('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function(){
      sidebar.classList.toggle('open');
    });
  }

  /* ── Navegação sidebar ── */
  document.querySelectorAll('.nav-link[data-page]').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      var pg = link.dataset.page;
      if (pg && typeof ir === 'function') ir(pg);
    });
  });

  /* ── Fechar sidebar ao clicar fora (mobile) ── */
  document.addEventListener('click', function(e){
    if (!sidebar) return;
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== menuToggle) {
      sidebar.classList.remove('open');
    }
  });

  /* ── Carregar dashboard ── */
  if (typeof window._loadingStep === 'function') window._loadingStep(85, 'Pronto!');

  if (typeof ir === 'function') {
    ir('dashboard');
  }

  /* ── Esconder ecrã de loading ── */
  if (typeof window._loadingFim === 'function') {
    setTimeout(window._loadingFim, 450);
  }

  console.log('[GOM v3.0] ✓ MVP offline iniciado — ' +
    DB.getVeiculos().length + ' veículos | ' +
    DB.getObras().length    + ' obras | ' +
    DB.getAlertas().length  + ' registos de alertas');
});
