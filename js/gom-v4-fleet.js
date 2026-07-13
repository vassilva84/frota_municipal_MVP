/* ================================================================
   GOM — FROTA, ESTADOS, SETORES E ALERTAS
   Extensão aditiva sobre a versão 3.1. Não cria autenticação fictícia.
   ================================================================ */
'use strict';

(function () {
  const exportarRelatorioExcelLegado = window.exportarRelatorioExcel;
  const exportarRelatorioPDFLegado = window.exportarRelatorioPDF;
  const ALERTAS_ATIVOS = [
    { tipo:'itp', campo:'itp_proxima', ultima:'itp_ultima', label:'ITP / Inspeção Técnica', antec:30 },
    { tipo:'seguro', campo:'seguro_valido_ate', label:'Seguro', antec:30 },
    { tipo:'revisao', campo:'revisao_proxima', ultima:'revisao_ultima', label:'Revisão', antec:30 },
    { tipo:'oleo', campo:'oleo_proxima_data', ultima:'oleo_ultima_data', label:'Mudança de óleo', antec:14 },
    { tipo:'grua', campo:'grua_proxima', label:'Certificação de grua', antec:60 },
    { tipo:'caixa', campo:'caixa_proxima', label:'Certificação de caixa', antec:60 },
    { tipo:'tacografo', campo:'tacografo_proxima', label:'Tacógrafo', antec:30 },
    { tipo:'extintor', campo:'extintor_validade', ultima:'extintor_ultima', label:'Extintores', antec:30 },
    { tipo:'licenciamento', campo:'licenciamento_validade', label:'Licenciamento', antec:30 }
  ];

  const CATEGORIAS_VIATURA = [
    'Ligeiro de passageiros','Ligeiro de mercadorias','Pesado de passageiros',
    'Pesado de mercadorias','Veículo especial','Motociclo','Outro'
  ];
  const CARROÇARIAS = [
    'Furgão','Caixa aberta','Caixa fechada','Basculante','Cisterna','Compactador',
    'Plataforma','Minibus','Autocarro','Todo-o-terreno','Outro'
  ];
  const ENERGIAS = ['Diesel','Gasolina','Elétrico','Híbrido','GPL','Hidrogénio','Outro'];

  function el(id) { return document.getElementById(id); }
  function e(valor) { return esc(String(valor == null ? '' : valor)); }
  function hoje() { return new Date().toISOString().slice(0,10); }
  function agoraLocal() { return localISO(new Date()); }
  function valor(id) { return (el(id)?.value || '').trim(); }
  function numero(id) { return Number(valor(id).replace(',','.')) || 0; }
  function admin(v) {
    return v.estado_administrativo || ((v.ativo === false || v.estado_op === 'inativo') ? 'inativo_suspenso' : 'ativo');
  }
  function estadoOp(v) {
    const atual = v.estado_operacional || v.estado_op || 'operacional';
    if (atual === 'manutencao') return 'em_reparacao';
    if (atual === 'avaria') return 'inoperacional_standby';
    if (atual === 'inativo') return 'inoperacional_standby';
    return atual;
  }
  function tipoPrincipal(v) { return v.tipo_principal || (v.tipo === 'maquina' ? 'maquina' : 'viatura'); }
  function matriculaVisivel(v) {
    const m = (v.matricula || '').trim();
    return m || (tipoPrincipal(v) === 'maquina' ? 'Não aplicável' : '—');
  }
  function setor(v) {
    if (window.GOM?.getSetor) return GOM.getSetor(v.setor_id || v.setor);
    return { id:v.setor_id || v.setor, sigla:v.setor_sigla || v.setor || '—', nome_completo:v.setor_nome || v.setor || '—' };
  }
  function setorSigla(v) { const s=setor(v); return s?.sigla || v.setor_sigla || v.setor || '—'; }
  function setorNome(v) { const s=setor(v); return s?.nome_completo || s?.nome || v.setor_nome || v.setor || '—'; }
  function setores() { return window.GOM?.getSetores ? GOM.getSetores() : (DB.getSetores?.() || []); }
  function historicoVeiculo(id) {
    const lista = DB.getHistorico?.() || [];
    return lista.filter(h => (h.entidade_id || h.veiculo_id) === id)
      .sort((a,b)=>new Date(b.data_hora || b.data || 0)-new Date(a.data_hora || a.data || 0));
  }
  function periodosVeiculo(id) {
    const lista = DB.getInoperacionalidades?.() || [];
    return lista.filter(p => p.veiculo_id === id)
      .sort((a,b)=>new Date(b.data_inicio || b.inicio || 0)-new Date(a.data_inicio || a.inicio || 0));
  }
  function obrasVeiculo(v) {
    return DB.getObras().filter(o => o.veiculo_id === v.id || (v.matricula && o.matricula === v.matricula));
  }
  function etiquetaAdmin(v) {
    return admin(v)==='ativo'
      ? '<span class="badge badge-green">Ativo</span>'
      : '<span class="badge badge-gray">Inativo/Suspenso</span>';
  }
  function etiquetaOp(v) {
    const op=estadoOp(v);
    const mapa={
      operacional:['badge-green','Operacional'],
      em_reparacao:['badge-orange','Em reparação'],
      inoperacional_standby:['badge-red','Inoperacional/Standby']
    };
    const d=mapa[op]||['badge-gray',op||'—'];
    return `<span class="badge ${d[0]}">${d[1]}</span>`;
  }
  function executar(acao, mensagem, refrescar) {
    try {
      acao();
      closeModal();
      toastMsg(mensagem,'success');
      if (refrescar) refrescar();
    } catch (erro) {
      toastMsg(erro?.message || 'Não foi possível concluir a operação.','error');
    }
  }

  /* A contagem usa apenas alertas ativos. Pneus, lavagem e higienização
     continuam nos objetos guardados, mas não são apresentados nem contados. */
  window.contarAlertasVeiculo = function (al) {
    if (!al) return 0;
    return ALERTAS_ATIVOS.reduce((n,c) => {
      if (c.tipo === 'seguro' && al.seguro_estado === 'anulado') return n;
      const st=alertaStatus(al[c.campo],c.antec);
      return n + (st==='expirado'||st==='proximo' ? 1 : 0);
    },0);
  };

  window.badgeEstadoOp = function (op) {
    return etiquetaOp({estado_operacional:op,estado_op:op});
  };

  /* ==============================================================
     DASHBOARD — estados administrativos e operacionais separados
     ============================================================= */
  window.renderDashboard = function () {
    const veiculos=DB.getVeiculos();
    const ativos=veiculos.filter(v=>admin(v)==='ativo');
    const obras=DB.getObras();
    const abertas=obras.filter(o=>o.estado==='aberta').sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
    const alertas=DB.getAlertas();
    const urgentes=[];
    alertas.forEach(al=>ALERTAS_ATIVOS.forEach(c=>{
      if(c.tipo==='seguro'&&al.seguro_estado==='anulado') return;
      const st=alertaStatus(al[c.campo],c.antec);
      if(st==='expirado'||st==='proximo') urgentes.push({al,c,st,data:al[c.campo]});
    }));
    urgentes.sort((a,b)=>String(a.data||'').localeCompare(String(b.data||'')));

    el('pageTitle').textContent='Dashboard';
    el('topbarActions').innerHTML=`
      <button class="btn btn-outline" onclick="modalConfigurarOperador()">Identificação operacional</button>
      <button class="btn btn-primary" onclick="modalCriarObra()">${icon('plus')} Nova Obra</button>`;
    el('pageContainer').innerHTML=`
      <div class="page-header"><div><h2>Ponto de situação da frota</h2><p>Estados atuais, obras abertas e alertas ativos</p></div></div>
      <div class="stats-grid gom-stats-grid">
        <div class="stat-card"><div class="stat-value">${ativos.length}</div><div class="stat-label">Ativos</div></div>
        <div class="stat-card"><div class="stat-value">${ativos.filter(v=>estadoOp(v)==='operacional').length}</div><div class="stat-label">Operacionais</div></div>
        <div class="stat-card"><div class="stat-value">${ativos.filter(v=>estadoOp(v)==='em_reparacao').length}</div><div class="stat-label">Em reparação</div></div>
        <div class="stat-card"><div class="stat-value">${ativos.filter(v=>estadoOp(v)==='inoperacional_standby').length}</div><div class="stat-label">Inoperacionais/Standby</div></div>
        <div class="stat-card"><div class="stat-value">${veiculos.filter(v=>admin(v)!=='ativo').length}</div><div class="stat-label">Inativos/Suspensos</div></div>
        <div class="stat-card"><div class="stat-value">${abertas.length}</div><div class="stat-label">Obras abertas</div></div>
      </div>
      <div class="gom-two-columns">
        <div class="card"><div class="card-header"><span class="card-title">${icon('wrench',15)} Obras abertas</span></div>
          <div class="table-wrapper"><table><thead><tr><th>Obra</th><th>Património</th><th>Matrícula</th><th>Ponto de situação</th></tr></thead>
          <tbody>${abertas.slice(0,8).map(o=>{
            const v=DB.getVeiculo(o.veiculo_id)||{};
            return `<tr onclick="ir('obra-detalhe',{id:'${e(o.id)}'})" style="cursor:pointer"><td><strong>${e(GOM?.numeroObra?GOM.numeroObra(o):o.numero_obra)}</strong></td><td>${e(o.patrimonio||v.patrimonio||'—')}</td><td>${e(o.matricula||matriculaVisivel(v))}</td><td>${e(GOM?.labelPontoSituacao?GOM.labelPontoSituacao(o.ponto_situacao):(o.ponto_situacao||'—'))}</td></tr>`;
          }).join('')||'<tr><td colspan="4" class="table-empty">Sem obras abertas.</td></tr>'}</tbody></table></div>
        </div>
        <div class="card"><div class="card-header"><span class="card-title">${icon('alert',15)} Alertas ativos</span><span class="badge badge-orange">${urgentes.length}</span></div>
          <div class="gom-alert-list">${urgentes.slice(0,8).map(x=>{
            const v=DB.getVeiculo(x.al.veiculo_id)||{};
            return `<button class="gom-alert-row" onclick="ir('veiculo-historico',{id:'${e(x.al.veiculo_id)}'})"><span><strong>${e(v.patrimonio||'—')}</strong> · ${e(matriculaVisivel(v))}<small>${e(x.c.label)}</small></span><span>${fmtData(x.data)} ${badgeAlertaStatus(x.st)}</span></button>`;
          }).join('')||'<p class="table-empty">Sem alertas urgentes.</p>'}</div>
        </div>
      </div>`;
    atualizarBadgeAlertas();
  };

  /* ==============================================================
     FROTA — lista e formulário completo
     ============================================================= */
  window.renderVeiculos = function () {
    const veiculos=[...DB.getVeiculos()].sort((a,b)=>{
      return matriculaVisivel(a).localeCompare(matriculaVisivel(b),'pt') ||
        String(a.patrimonio||'').localeCompare(String(b.patrimonio||''),'pt') ||
        String(a.centro_custos||'').localeCompare(String(b.centro_custos||''),'pt');
    });
    window._veiculos=veiculos;
    el('pageTitle').textContent='Frota';
    el('topbarActions').innerHTML=`
      <button class="btn btn-outline" onclick="modalConfigurarOperador()">Operador: ${e(GOM?.operador?GOM.operador():'Operador local')}</button>
      <button class="btn btn-outline" onclick="modalEditarSetor(null)">${icon('sector')} Gerir setores</button>
      <button class="btn btn-primary" onclick="modalNovoVeiculo()">${icon('plus')} Novo registo</button>`;
    el('pageContainer').innerHTML=`
      <div class="page-header"><div><h2>Frota</h2><p>${veiculos.length} viaturas e máquinas registadas</p></div></div>
      <div class="filter-bar gom-filter-wrap">
        <input type="search" class="form-control" placeholder="Matrícula, património, centro de custos, marca…" id="searchVeiculo" oninput="filtrarVeiculos()">
        <select class="form-control" id="filtroTipoV" onchange="filtrarVeiculos()"><option value="">Viaturas e máquinas</option><option value="viatura">Viaturas</option><option value="maquina">Máquinas</option></select>
        <select class="form-control" id="filtroSetorV" onchange="filtrarVeiculos()"><option value="">Todos os setores</option>${setores().map(s=>`<option value="${e(s.id)}">${e(s.sigla)} — ${e(s.nome_completo||s.nome)}</option>`).join('')}</select>
        <select class="form-control" id="filtroEstadoOp" onchange="filtrarVeiculos()"><option value="">Todos os estados operacionais</option><option value="operacional">Operacional</option><option value="em_reparacao">Em reparação</option><option value="inoperacional_standby">Inoperacional/Standby</option></select>
        <select class="form-control" id="filtroEstadoAdmin" onchange="filtrarVeiculos()"><option value="">Ativos e inativos</option><option value="ativo">Ativos</option><option value="inativo_suspenso">Inativos/Suspensos</option></select>
      </div>
      <div class="veiculos-grid" id="veiculosGrid">${renderVeiculoCards(veiculos)}</div>`;
  };

  window.renderVeiculoCards = function (lista) {
    if(!lista?.length) return '<p class="table-empty" style="grid-column:1/-1">Nenhum registo encontrado.</p>';
    return lista.map(v=>{
      const abertas=obrasVeiculo(v).filter(o=>o.estado==='aberta').length;
      const nAl=contarAlertasVeiculo(DB.getAlerta(v.id));
      const inativo=admin(v)!=='ativo';
      return `<article class="veiculo-card gom-frota-card ${inativo?'veiculo-card-inativo':''}" onclick="ir('veiculo-historico',{id:'${e(v.id)}'})">
        <div class="gom-patrimonio-label">Número de património</div>
        <div class="gom-patrimonio">${e(v.patrimonio||'—')}</div>
        <div class="gom-card-identificacao"><span class="matricula">${e(matriculaVisivel(v))}</span><span class="gom-centro-custos">CC ${e(v.centro_custos||'—')}</span></div>
        <div class="gom-card-title"><span class="veiculo-icon">${iconVeiculo(tipoPrincipal(v)==='maquina'?'maquina':v.tipo)}</span><span><strong>${e(v.marca||'—')} ${e(v.modelo||'')}</strong><small>${e(tipoPrincipal(v)==='maquina'?'Máquina':'Viatura')} · ${e(v.categoria||'Sem categoria')}</small></span></div>
        <div class="gom-card-sector">${e(setorSigla(v))} — ${e(setorNome(v))}</div>
        <div class="gom-badge-row">${etiquetaAdmin(v)} ${etiquetaOp(v)} ${abertas?`<span class="badge badge-red">${abertas} obra${abertas>1?'s':''} aberta${abertas>1?'s':''}</span>`:''} ${nAl?`<span class="badge badge-orange">${nAl} alerta${nAl>1?'s':''}</span>`:''}</div>
        <div class="gom-card-actions">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();modalEditarVeiculo('${e(v.id)}')">${icon('edit',13)} Editar</button>
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();modalEditarSetor('${e(v.id)}')">${icon('sector',13)} Setor</button>
          ${inativo?`<button class="btn btn-sm btn-success" onclick="event.stopPropagation();modalReativarVeiculo('${e(v.id)}')">Reativar</button>`:`<button class="btn btn-sm btn-warning" onclick="event.stopPropagation();modalSuspenderVeiculo('${e(v.id)}')">Suspender</button>`}
        </div>
      </article>`;
    }).join('');
  };

  window.filtrarVeiculos = function () {
    const q=valor('searchVeiculo').toLowerCase();
    const tp=valor('filtroTipoV'), sid=valor('filtroSetorV'), op=valor('filtroEstadoOp'), ad=valor('filtroEstadoAdmin');
    const lista=(window._veiculos||[]).filter(v=>{
      const texto=[v.matricula,v.patrimonio,v.centro_custos,v.marca,v.modelo,v.categoria,setorSigla(v),setorNome(v)].join(' ').toLowerCase();
      const s=setor(v);
      return (!q||texto.includes(q))&&(!tp||tipoPrincipal(v)===tp)&&(!sid||(s?.id||v.setor_id)===sid)&&(!op||estadoOp(v)===op)&&(!ad||admin(v)===ad);
    });
    el('veiculosGrid').innerHTML=renderVeiculoCards(lista);
  };

  function categoriasDisponiveis(v) {
    const existentes=DB.getVeiculos().filter(x=>tipoPrincipal(x)===tipoPrincipal(v||{})).map(x=>x.categoria).filter(Boolean);
    const base=tipoPrincipal(v||{})==='maquina'
      ? ['Máquina de terraplenagem','Máquina agrícola','Equipamento industrial','Equipamento rebocável','Outro']
      : CATEGORIAS_VIATURA;
    return [...new Set([...base,...existentes])];
  }
  function carrocariasDisponiveis(v) {
    const atual=v?.carrocaria_configuracao||v?.tipo_carrocaria||v?.configuracao||'';
    return [...new Set([...CARROÇARIAS,...(atual?[atual]:[])])];
  }
  function energiasDisponiveis(v) {
    const atual=v?.tipo_energia||v?.combustivel||'';
    return [...new Set([...ENERGIAS,...(atual?[atual]:[])])];
  }
  function opcoesSetor(selecionado) {
    return setores().map(s=>`<option value="${e(s.id)}" ${String(selecionado||'')===String(s.id)?'selected':''}>${e(s.sigla)} — ${e(s.nome_completo||s.nome)}</option>`).join('');
  }
  function linhaEspecificacao(nome='',valorEsp='') {
    return `<div class="gom-spec-row"><input class="form-control gom-spec-nome" placeholder="Nome da especificação" value="${e(nome)}"><input class="form-control gom-spec-valor" placeholder="Valor" value="${e(valorEsp)}"><button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remover</button></div>`;
  }
  window.adicionarEspecificacao = function (nome='',valorEsp='') {
    el('vf_especificacoes')?.insertAdjacentHTML('beforeend',linhaEspecificacao(nome,valorEsp));
  };
  function htmlFormVeiculoV4(v=null) {
    const novo=!v;
    const tp=tipoPrincipal(v||{tipo_principal:'viatura'});
    const car=v?.carrocaria_configuracao||v?.tipo_carrocaria||'';
    const specs=Array.isArray(v?.outras_especificacoes)?v.outras_especificacoes:[];
    return `<form onsubmit="return false" class="gom-form-sections">
      <section class="gom-form-section"><h4>Identificação</h4>
        <div class="form-row form-row-3">
          <div class="form-group"><label class="form-label">Tipo principal *</label><select class="form-control" id="vf_tipo_principal" onchange="ajustarFormTipoPrincipal()"><option value="viatura" ${tp==='viatura'?'selected':''}>Viatura</option><option value="maquina" ${tp==='maquina'?'selected':''}>Máquina</option></select></div>
          <div class="form-group"><label class="form-label">Número de património *</label><input class="form-control" id="vf_pat" value="${e(v?.patrimonio||'')}" required></div>
          <div class="form-group"><label class="form-label">Matrícula <span id="vf_mat_req">*</span></label><input class="form-control" id="vf_mat" value="${e(v?.matricula||'')}" placeholder="00-AA-00"></div>
        </div>
        <div class="form-row form-row-2"><div class="form-group"><label class="form-label">Categoria *</label><select class="form-control" id="vf_categoria">${categoriasDisponiveis(v||{tipo_principal:tp}).map(c=>`<option ${v?.categoria===c?'selected':''}>${e(c)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Carroçaria / configuração</label><select class="form-control" id="vf_carrocaria" onchange="document.getElementById('vf_carrocaria_outro_wrap').style.display=this.value==='Outro'?'block':'none'"><option value="">— Selecionar —</option>${carrocariasDisponiveis(v).map(c=>`<option ${car===c?'selected':''}>${e(c)}</option>`).join('')}</select></div></div>
        <div class="form-group" id="vf_carrocaria_outro_wrap" style="display:${car==='Outro'?'block':'none'}"><label class="form-label">Outra carroçaria / configuração *</label><input class="form-control" id="vf_carrocaria_outro" value="${e(v?.carrocaria_outro||'')}"></div>
      </section>
      <section class="gom-form-section"><h4>Afetação orgânica</h4>
        <div class="form-row form-row-2"><div class="form-group"><label class="form-label">Centro de custos</label><input class="form-control" id="vf_centro_custos" value="${e(v?.centro_custos||'')}"></div><div class="form-group"><label class="form-label">Centro de responsabilidade</label><input class="form-control" id="vf_centro_responsabilidade" value="${e(v?.centro_responsabilidade||'')}"></div></div>
        <div class="form-row form-row-2"><div class="form-group"><label class="form-label">Setor *</label><select class="form-control" id="vf_setor_id" ${novo?'':'disabled'}>${opcoesSetor(v?.setor_id||setor(v||{})?.id)}</select>${novo?'':'<small>Use a ação “Alterar setor” para preservar o histórico.</small>'}</div><div class="form-group"><label class="form-label">Departamento / serviço</label><input class="form-control" id="vf_departamento" value="${e(v?.departamento||'')}"></div></div>
      </section>
      <section class="gom-form-section"><h4>Dados técnicos</h4>
        <div class="form-row form-row-3"><div class="form-group"><label class="form-label">Marca *</label><input class="form-control" id="vf_marca" value="${e(v?.marca||'')}" required></div><div class="form-group"><label class="form-label">Modelo *</label><input class="form-control" id="vf_modelo" value="${e(v?.modelo||'')}" required></div><div class="form-group"><label class="form-label">Número de lugares</label><input class="form-control" id="vf_lugares" value="${e(v?.numero_lugares??'')}"></div></div>
        <div class="form-row form-row-3"><div class="form-group"><label class="form-label">Data da matrícula</label><input type="date" class="form-control" id="vf_data_matricula" value="${e(v?.data_matricula||'')}"></div><div class="form-group"><label class="form-label">Data de propriedade municipal</label><input type="date" class="form-control" id="vf_data_propriedade" value="${e(v?.data_propriedade_municipal||'')}"></div><div class="form-group"><label class="form-label">Combustível / energia</label><select class="form-control" id="vf_energia">${energiasDisponiveis(v).map(x=>`<option ${String(v?.tipo_energia||v?.combustivel||'Diesel').toLowerCase()===x.toLowerCase()?'selected':''}>${e(x)}</option>`).join('')}</select></div></div>
        <div class="form-row form-row-2"><div class="form-group"><label class="form-label">Quilometragem</label><input type="number" min="0" class="form-control" id="vf_km" value="${Number(v?.quilometragem??v?.km??0)}"></div><div class="form-group"><label class="form-label">Horas de funcionamento</label><input type="number" min="0" class="form-control" id="vf_horas" value="${Number(v?.horas_funcionamento??v?.horas??0)}"></div></div>
        <div class="form-row form-row-2"><div class="form-group"><label class="form-label">Localização</label><input class="form-control" id="vf_localizacao" value="${e(v?.localizacao||'')}"></div><div class="form-group"><label class="form-label">Responsável</label><input class="form-control" id="vf_responsavel" value="${e(v?.responsavel||'')}"></div></div>
      </section>
      <section class="gom-form-section"><h4>Outras especificações</h4><p class="gom-help">Acrescente características diferentes sem alterar a aplicação.</p><div id="vf_especificacoes">${specs.map(s=>linhaEspecificacao(s.nome||s.chave||'',s.valor||'')).join('')}</div><button type="button" class="btn btn-sm btn-outline" onclick="adicionarEspecificacao()">${icon('plus',12)} Acrescentar especificação</button></section>
      ${novo?'':`<section class="gom-form-section"><h4>Justificação da alteração</h4><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="vf_motivo" required></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="vf_obs_alteracao" rows="2"></textarea></div></section>`}
    </form>`;
  }
  window.ajustarFormTipoPrincipal = function () {
    const maquina=valor('vf_tipo_principal')==='maquina';
    const mat=el('vf_mat'), lugares=el('vf_lugares');
    const categoria=el('vf_categoria'), categoriaAtual=categoria?.value||'';
    if(categoria){
      const opcoes=categoriasDisponiveis({tipo_principal:maquina?'maquina':'viatura'});
      if(categoriaAtual&&!opcoes.includes(categoriaAtual)) opcoes.push(categoriaAtual);
      categoria.innerHTML=opcoes.map(c=>`<option ${c===categoriaAtual?'selected':''}>${e(c)}</option>`).join('');
    }
    if(maquina){ if(!valor('vf_mat')) mat.value='Não aplicável'; if(!valor('vf_lugares')) lugares.value='Não aplicável'; }
    else { if(valor('vf_mat')==='Não aplicável') mat.value=''; if(valor('vf_lugares')==='Não aplicável') lugares.value=''; }
    if(el('vf_mat_req')) el('vf_mat_req').textContent=maquina?'(quando aplicável)':'*';
  };
  window.modalNovoVeiculo = function () {
    openModal('Nova viatura ou máquina',htmlFormVeiculoV4(),`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="criarVeiculo()">${icon('save')} Registar</button>`,true);
    ajustarFormTipoPrincipal();
  };
  window.modalEditarVeiculo = function (vid) {
    const v=DB.getVeiculo(vid); if(!v) return;
    openModal(`Editar — ${v.patrimonio||matriculaVisivel(v)}`,htmlFormVeiculoV4(v),`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarVeiculo('${e(vid)}')">${icon('save')} Guardar</button>`,true);
    ajustarFormTipoPrincipal();
  };
  function lerSpecs() {
    return [...document.querySelectorAll('#vf_especificacoes .gom-spec-row')].map(r=>({nome:(r.querySelector('.gom-spec-nome')?.value||'').trim(),valor:(r.querySelector('.gom-spec-valor')?.value||'').trim()})).filter(s=>s.nome||s.valor);
  }
  function lerVeiculo(vExistente=null) {
    const tp=valor('vf_tipo_principal')||'viatura';
    const matricula=tp==='maquina' ? (valor('vf_mat')||'Não aplicável') : valor('vf_mat').toUpperCase();
    const categoria=valor('vf_categoria');
    const legado=tp==='maquina'?'maquina':(/pesado/i.test(categoria)?'pesado':'ligeiro');
    const sid=vExistente?.setor_id || valor('vf_setor_id');
    const s=setores().find(x=>String(x.id)===String(sid));
    return {
      patrimonio:valor('vf_pat'), matricula, tipo_principal:tp, tipo:legado, categoria,
      carrocaria_configuracao:valor('vf_carrocaria'), carrocaria_outro:valor('vf_carrocaria_outro'),
      centro_custos:valor('vf_centro_custos'), centro_responsabilidade:valor('vf_centro_responsabilidade'),
      setor_id:sid, setor:s?.nome_completo||s?.nome||vExistente?.setor||'', setor_sigla:s?.sigla||vExistente?.setor_sigla||'', setor_nome:s?.nome_completo||s?.nome||vExistente?.setor_nome||'',
      departamento:valor('vf_departamento'), marca:valor('vf_marca'), modelo:valor('vf_modelo'),
      numero_lugares:tp==='maquina'?(valor('vf_lugares')||'Não aplicável'):valor('vf_lugares'),
      data_matricula:valor('vf_data_matricula'), data_propriedade_municipal:valor('vf_data_propriedade'),
      tipo_energia:valor('vf_energia'), combustivel:valor('vf_energia'),
      km:numero('vf_km'), quilometragem:numero('vf_km'),
      horas:numero('vf_horas'), horas_funcionamento:numero('vf_horas'),
      localizacao:valor('vf_localizacao'), responsavel:valor('vf_responsavel'), outras_especificacoes:lerSpecs(),
      ano:valor('vf_data_matricula')?Number(valor('vf_data_matricula').slice(0,4)):(vExistente?.ano||new Date().getFullYear())
    };
  }
  function validarVeiculo(d,idAtual) {
    if(!d.patrimonio||!d.marca||!d.modelo||!d.categoria) throw new Error('Preencha património, categoria, marca e modelo.');
    if(d.tipo_principal==='viatura'&&!d.matricula) throw new Error('A matrícula é obrigatória para viaturas.');
    const outros=DB.getVeiculos().filter(v=>v.id!==idAtual);
    if(outros.some(v=>String(v.patrimonio||'').toLowerCase()===d.patrimonio.toLowerCase())) throw new Error('O número de património já está registado.');
    if(d.matricula&&d.matricula!=='Não aplicável'&&outros.some(v=>String(v.matricula||'').toLowerCase()===d.matricula.toLowerCase())) throw new Error('A matrícula já está registada.');
    if(d.carrocaria_configuracao==='Outro'&&!d.carrocaria_outro) throw new Error('Descreva a outra carroçaria/configuração.');
  }
  function resumoDadosEssenciais(v) {
    return {
      patrimonio:v?.patrimonio||'', matricula:v?.matricula||'', tipo_principal:tipoPrincipal(v||{}),
      categoria:v?.categoria||'', carrocaria_configuracao:v?.carrocaria_configuracao||v?.tipo_carrocaria||'',
      carrocaria_outro:v?.carrocaria_outro||'', centro_custos:v?.centro_custos||'',
      centro_responsabilidade:v?.centro_responsabilidade||'', marca:v?.marca||'', modelo:v?.modelo||'',
      numero_lugares:v?.numero_lugares??'', data_matricula:v?.data_matricula||'',
      data_propriedade_municipal:v?.data_propriedade_municipal||'', tipo_energia:v?.tipo_energia||v?.combustivel||'',
      quilometragem:v?.quilometragem??v?.km??0, horas_funcionamento:v?.horas_funcionamento??v?.horas??0,
      localizacao:v?.localizacao||'', responsavel:v?.responsavel||'',
      outras_especificacoes:Array.isArray(v?.outras_especificacoes)?v.outras_especificacoes:[]
    };
  }
  window.criarVeiculo = function () {
    executar(()=>{
      const d=lerVeiculo(); validarVeiculo(d);
      d.estado_administrativo='ativo'; d.estado_operacional='operacional'; d.estado_op='operacional'; d.ativo=true;
      const novo=DB.criarVeiculo(d);
      GOM?.registarHistorico?.('veiculo',novo.id,'Registo inicial','—',d.patrimonio,'Criação do registo','');
    },'Registo criado com estado Ativo e Operacional.',renderVeiculos);
  };
  window.guardarVeiculo = function (vid) {
    executar(()=>{
      const anterior=DB.getVeiculo(vid); if(!anterior) throw new Error('Registo não encontrado.');
      const d=lerVeiculo(anterior); validarVeiculo(d,vid);
      const motivo=valor('vf_motivo'); if(!motivo) throw new Error('Indique o motivo da alteração.');
      const obs=valor('vf_obs_alteracao');
      const resumoAntes=resumoDadosEssenciais(anterior);
      const resumoDepois=resumoDadosEssenciais(d);
      DB.actualizarVeiculo(vid,d);
      GOM?.registarHistorico?.('veiculo',vid,'Alteração de dados essenciais',resumoAntes,resumoDepois,motivo,obs);
    },'Dados atualizados e registados no histórico.',()=>renderVeiculoHistorico(vid));
  };
  window.eliminarVeiculo = function (vid) { modalSuspenderVeiculo(vid); };

  /* ==============================================================
     SETORES E IDENTIFICAÇÃO OPERACIONAL
     ============================================================= */
  window.modalConfigurarOperador = function () {
    openModal('Identificação operacional',`<div class="alert-box alert-box-info">Esta identificação é gravada no histórico local. Não corresponde a um login nem simula autenticação.</div><div class="form-group"><label class="form-label">Identificação *</label><input class="form-control" id="gom_operador" value="${e(GOM?.operador?GOM.operador():'Operador local')}"></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarOperador()">Guardar</button>`);
  };
  window.guardarOperador = function () {
    const nome=valor('gom_operador'); if(!nome){toastMsg('Indique uma identificação operacional.','error');return;}
    GOM?.configurarOperador?.(nome); closeModal(); toastMsg('Identificação operacional atualizada.','success');
    if(paginaAtual==='veiculos') renderVeiculos();
  };
  window.modalEditarSetor = function (vid) {
    if(vid){
      const v=DB.getVeiculo(vid); if(!v) return;
      openModal(`Alterar setor — ${v.patrimonio}`,`<div class="alert-box alert-box-info">O setor anterior permanecerá no histórico.</div><div class="form-group"><label class="form-label">Novo setor *</label><select class="form-control" id="novo_setor_id">${opcoesSetor(v.setor_id||setor(v)?.id)}</select></div><div class="form-group"><label class="form-label">Data efetiva *</label><input type="date" class="form-control" id="setor_data" value="${hoje()}" max="${hoje()}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="setor_motivo"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="setor_obs" rows="2"></textarea></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarSetor('${e(vid)}')">Guardar alteração</button>`);
      return;
    }
    openModal('Gerir setores',`<div class="table-wrapper"><table><thead><tr><th>Sigla</th><th>Nome completo</th><th></th></tr></thead><tbody>${setores().map(s=>`<tr><td><strong>${e(s.sigla)}</strong></td><td>${e(s.nome_completo||s.nome)}</td><td><button class="btn btn-sm btn-outline" onclick="modalEditarSetorCatalogo('${e(s.id)}')">Editar</button></td></tr>`).join('')}</tbody></table></div><hr><h4>Novo setor</h4><div class="form-row form-row-2"><div class="form-group"><label class="form-label">Sigla *</label><input class="form-control" id="setor_nova_sigla"></div><div class="form-group"><label class="form-label">Nome completo *</label><input class="form-control" id="setor_novo_nome"></div></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Fechar</button><button class="btn btn-primary" onclick="criarSetorCatalogo()">${icon('plus')} Criar setor</button>`,true);
  };
  window.guardarSetor = function (vid) {
    executar(()=>{
      const novo=valor('novo_setor_id'), data=valor('setor_data'), motivo=valor('setor_motivo');
      if(!novo||!data||!motivo) throw new Error('Preencha o novo setor, a data efetiva e o motivo.');
      GOM.mudarSetor(vid,novo,data,motivo,valor('setor_obs'));
    },'Setor alterado e registado no histórico.',()=>renderVeiculoHistorico(vid));
  };
  window.criarSetorCatalogo = function () {
    executar(()=>{
      const sigla=valor('setor_nova_sigla').toUpperCase(), nome=valor('setor_novo_nome');
      if(!sigla||!nome) throw new Error('Preencha a sigla e o nome completo.');
      const lista=setores(); if(lista.some(s=>s.sigla.toUpperCase()===sigla)) throw new Error('A sigla já existe.');
      lista.push({id:DB._id?DB._id('set-'):'set-'+Date.now(),sigla,nome_completo:nome,ativo:true});
      DB.saveSetores(lista);
    },'Setor criado.',()=>modalEditarSetor(null));
  };
  window.modalEditarSetorCatalogo = function (id) {
    const s=setores().find(x=>x.id===id); if(!s) return;
    openModal('Editar setor',`<div class="form-group"><label class="form-label">Sigla *</label><input class="form-control" id="setor_edit_sigla" value="${e(s.sigla)}"></div><div class="form-group"><label class="form-label">Nome completo *</label><input class="form-control" id="setor_edit_nome" value="${e(s.nome_completo||s.nome)}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="setor_edit_motivo"></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarSetorCatalogo('${e(id)}')">Guardar</button>`);
  };
  window.guardarSetorCatalogo = function (id) {
    executar(()=>{
      const lista=setores(), i=lista.findIndex(s=>s.id===id); if(i<0) throw new Error('Setor não encontrado.');
      const sigla=valor('setor_edit_sigla').toUpperCase(), nome=valor('setor_edit_nome'), motivo=valor('setor_edit_motivo');
      if(!sigla||!nome||!motivo) throw new Error('Preencha a sigla, o nome e o motivo.');
      const antes={sigla:lista[i].sigla,nome_completo:lista[i].nome_completo||lista[i].nome};
      lista[i]={...lista[i],sigla,nome_completo:nome}; DB.saveSetores(lista);
      GOM?.registarHistorico?.('setor',id,'Alteração do setor',antes,{sigla,nome_completo:nome},motivo,'');
    },'Setor atualizado.',()=>modalEditarSetor(null));
  };

  /* ==============================================================
     ESTADOS, INOPERACIONALIDADE, SUSPENSÃO E REATIVAÇÃO
     ============================================================= */
  function motivoHtml(prefixo) {
    return `<div class="form-group"><label class="form-label">Motivo *</label><select class="form-control" id="${prefixo}_motivo" onchange="document.getElementById('${prefixo}_motivo_outro_wrap').style.display=this.value==='Outro'?'block':'none'"><option value="">— Selecionar —</option><option>Falta de rubrica orçamental</option><option>Aguarda autorização</option><option>Aguarda decisão</option><option>Aguarda peças</option><option>Aguarda abate</option><option>Outro</option></select></div><div class="form-group" id="${prefixo}_motivo_outro_wrap" style="display:none"><label class="form-label">Outro motivo *</label><input class="form-control" id="${prefixo}_motivo_outro"></div>`;
  }
  function lerMotivo(prefixo) { const m=valor(prefixo+'_motivo'); return m==='Outro'?valor(prefixo+'_motivo_outro'):m; }
  window.modalInoperacionalidade = function (vid) {
    const v=DB.getVeiculo(vid); if(!v||admin(v)!=='ativo') return;
    openModal(`Registar inoperacionalidade — ${v.patrimonio}`,`<div class="form-group"><label class="form-label">Data de início *</label><input type="date" class="form-control" id="ino_data" value="${hoje()}" max="${hoje()}"></div>${motivoHtml('ino')}<div class="form-group"><label class="form-label">Estado atual *</label><select class="form-control" id="ino_estado"><option value="inoperacional_standby">Inoperacional/Standby</option><option value="em_reparacao">Em reparação</option></select></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="ino_obs" rows="3"></textarea></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarInoperacionalidade('${e(vid)}')">Registar</button>`);
  };
  window.guardarInoperacionalidade = function (vid) {
    executar(()=>{
      const data=valor('ino_data'), motivo=lerMotivo('ino'), estado=valor('ino_estado');
      if(!data||!motivo) throw new Error('Preencha a data e o motivo.');
      GOM.iniciarInoperacionalidade(vid,data,motivo,valor('ino_obs'),estado);
    },'Inoperacionalidade registada.',()=>renderVeiculoHistorico(vid));
  };
  window.modalAlterarEstadoOperacional = function (vid) {
    const v=DB.getVeiculo(vid); if(!v||admin(v)!=='ativo') return;
    openModal(`Alterar estado operacional — ${v.patrimonio}`,`<div class="form-group"><label class="form-label">Novo estado *</label><select class="form-control" id="eop_novo"><option value="operacional">Operacional</option><option value="em_reparacao" ${estadoOp(v)==='em_reparacao'?'selected':''}>Em reparação</option><option value="inoperacional_standby" ${estadoOp(v)==='inoperacional_standby'?'selected':''}>Inoperacional/Standby</option></select></div><div class="form-group"><label class="form-label">Data efetiva *</label><input type="date" class="form-control" id="eop_data" value="${hoje()}" max="${hoje()}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="eop_motivo"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="eop_obs" rows="2"></textarea></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarEstadoOperacional('${e(vid)}')">Guardar</button>`);
  };
  window.guardarEstadoOperacional = function (vid) {
    executar(()=>{
      const novo=valor('eop_novo'), data=valor('eop_data'), motivo=valor('eop_motivo');
      if(!novo||!data||!motivo) throw new Error('Preencha o estado, a data e o motivo.');
      GOM.alterarEstadoOperacional(vid,novo,data,motivo,valor('eop_obs'));
    },'Estado operacional atualizado.',()=>renderVeiculoHistorico(vid));
  };
  window.modalRegressoOperacional = function (vid) {
    const v=DB.getVeiculo(vid); if(!v) return;
    openModal(`Regresso ao serviço — ${v.patrimonio}`,`<div class="form-group"><label class="form-label">Data de fim *</label><input type="date" class="form-control" id="reg_data" value="${hoje()}" max="${hoje()}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="reg_motivo" placeholder="Ex.: situação resolvida"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="reg_obs" rows="2"></textarea></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-success" onclick="guardarRegressoOperacional('${e(vid)}')">Colocar operacional</button>`);
  };
  window.guardarRegressoOperacional = function (vid) {
    executar(()=>{
      const data=valor('reg_data'), motivo=valor('reg_motivo'); if(!data||!motivo) throw new Error('Preencha a data e o motivo.');
      GOM.regressarOperacional(vid,data,motivo,valor('reg_obs'));
    },'Regresso ao estado operacional registado.',()=>renderVeiculoHistorico(vid));
  };
  window.modalSuspenderVeiculo = function (vid) {
    const v=DB.getVeiculo(vid); if(!v) return;
    if(GOM?.permissoes&&!GOM.permissoes.pode('suspender_veiculo')){toastMsg('Sem permissão para esta ação.','error');return;}
    openModal(`Suspender/Inativar — ${v.patrimonio}`,`<div class="alert-box alert-box-warning">A partir da data indicada, o registo deixa de contar para a taxa atual. Todo o histórico anterior é preservado.</div><div class="form-group"><label class="form-label">Data *</label><input type="date" class="form-control" id="sus_data" value="${hoje()}" max="${hoje()}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="sus_motivo"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="sus_obs" rows="2"></textarea></div><label class="gom-confirm"><input type="checkbox" id="sus_confirmar"> Confirmo explicitamente a suspensão/inativação deste registo.</label>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-warning" onclick="guardarSuspensao('${e(vid)}')">Suspender/Inativar</button>`);
  };
  window.guardarSuspensao = function (vid) {
    executar(()=>{
      if(!el('sus_confirmar')?.checked) throw new Error('É necessária confirmação explícita.');
      const data=valor('sus_data'), motivo=valor('sus_motivo'); if(!data||!motivo) throw new Error('Preencha a data e o motivo.');
      GOM.suspender(vid,data,motivo,valor('sus_obs'),true);
    },'Registo suspenso/inativado sem apagar o histórico.',()=>renderVeiculoHistorico(vid));
  };
  window.modalReativarVeiculo = function (vid) {
    const v=DB.getVeiculo(vid); if(!v) return;
    openModal(`Reativar — ${v.patrimonio}`,`<div class="form-group"><label class="form-label">Data *</label><input type="date" class="form-control" id="rea_data" value="${hoje()}" max="${hoje()}"></div><div class="form-group"><label class="form-label">Motivo *</label><input class="form-control" id="rea_motivo"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="rea_obs" rows="2"></textarea></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-success" onclick="guardarReativacao('${e(vid)}')">Reativar</button>`);
  };
  window.guardarReativacao = function (vid) {
    executar(()=>{
      const data=valor('rea_data'), motivo=valor('rea_motivo'); if(!data||!motivo) throw new Error('Preencha a data e o motivo.');
      GOM.reativar(vid,data,motivo,valor('rea_obs'));
    },'Registo reativado.',()=>renderVeiculoHistorico(vid));
  };

  /* ==============================================================
     FICHA INDIVIDUAL ORGANIZADA POR SECÇÕES E HISTÓRICO
     ============================================================= */
  function diasPeriodo(p) {
    if(window.GOM?.diasInoperacionalidade) return GOM.diasInoperacionalidade(p.veiculo_id,p.data_inicio||p.inicio,p.data_fim||p.fim,p.id);
    const a=new Date((p.data_inicio||p.inicio)+'T00:00:00'), b=new Date((p.data_fim||p.fim||hoje())+'T00:00:00');
    return Math.max(0,Math.floor((b-a)/86400000)+1);
  }
  function detalheLinha(label,valorDetalhe) { return `<div class="gom-detail-item"><span>${e(label)}</span><strong>${e(valorDetalhe||'—')}</strong></div>`; }
  window.renderVeiculoHistorico = function (id) {
    const v=DB.getVeiculo(id); if(!v){ir('veiculos');return;}
    const obras=[...obrasVeiculo(v)].sort((a,b)=>new Date(b.data_entrada)-new Date(a.data_entrada));
    const periodos=periodosVeiculo(id), hist=historicoVeiculo(id), al=DB.getAlerta(id);
    const ativo=admin(v)==='ativo';
    el('pageTitle').textContent=`Ficha — ${v.patrimonio||matriculaVisivel(v)}`;
    el('topbarActions').innerHTML=`<button class="btn btn-outline btn-sm" onclick="ir('veiculos')">${icon('back')} Frota</button><button class="btn btn-outline btn-sm" onclick="modalEditarVeiculo('${e(id)}')">${icon('edit')} Editar dados</button><button class="btn btn-outline btn-sm" onclick="modalEditarSetor('${e(id)}')">${icon('sector')} Alterar setor</button>${ativo?`<button class="btn btn-outline btn-sm" onclick="modalAlterarEstadoOperacional('${e(id)}')">Alterar estado</button>${estadoOp(v)==='operacional'?`<button class="btn btn-warning btn-sm" onclick="modalInoperacionalidade('${e(id)}')">Registar inoperacionalidade</button>`:`<button class="btn btn-success btn-sm" onclick="modalRegressoOperacional('${e(id)}')">Regresso ao serviço</button>`}<button class="btn btn-warning btn-sm" onclick="modalSuspenderVeiculo('${e(id)}')">Suspender/Inativar</button><button class="btn btn-primary btn-sm" onclick="modalCriarObraVeiculo('${e(id)}','${e(v.matricula)}','${e(v.patrimonio)}')">${icon('plus')} Nova obra</button>`:`<button class="btn btn-success btn-sm" onclick="modalReativarVeiculo('${e(id)}')">Reativar</button>`}`;
    el('pageContainer').innerHTML=`
      <div class="gom-record-hero"><div><span>Número de património</span><h2>${e(v.patrimonio||'—')}</h2><p><strong>${e(matriculaVisivel(v))}</strong> · Centro de custos ${e(v.centro_custos||'—')}</p></div><div class="gom-badge-row">${etiquetaAdmin(v)} ${etiquetaOp(v)}</div></div>
      <div class="gom-detail-grid">
        <section class="card gom-section-card"><div class="card-header"><span class="card-title">Identificação</span></div><div class="gom-detail-list">${detalheLinha('Matrícula',matriculaVisivel(v))}${detalheLinha('Património',v.patrimonio)}${detalheLinha('Tipo principal',tipoPrincipal(v)==='maquina'?'Máquina':'Viatura')}${detalheLinha('Categoria',v.categoria)}${detalheLinha('Carroçaria/configuração',v.carrocaria_configuracao==='Outro'?(v.carrocaria_outro||'Outro'):v.carrocaria_configuracao)}</div></section>
        <section class="card gom-section-card"><div class="card-header"><span class="card-title">Afetação orgânica</span></div><div class="gom-detail-list">${detalheLinha('Setor',`${setorSigla(v)} — ${setorNome(v)}`)}${detalheLinha('Centro de custos',v.centro_custos)}${detalheLinha('Centro de responsabilidade',v.centro_responsabilidade)}${detalheLinha('Serviço',v.departamento)}${detalheLinha('Responsável',v.responsavel)}${detalheLinha('Localização',v.localizacao)}</div></section>
        <section class="card gom-section-card gom-section-wide"><div class="card-header"><span class="card-title">Dados técnicos</span></div><div class="gom-detail-list gom-detail-list-3">${detalheLinha('Marca',v.marca)}${detalheLinha('Modelo',v.modelo)}${detalheLinha('Lugares',v.numero_lugares)}${detalheLinha('Data da matrícula',fmtData(v.data_matricula))}${detalheLinha('Propriedade municipal',fmtData(v.data_propriedade_municipal))}${detalheLinha('Energia',v.tipo_energia||v.combustivel)}${detalheLinha('Quilometragem',Number(v.quilometragem??v.km??0).toLocaleString('pt-PT')+' km')}${detalheLinha('Horas',Number(v.horas_funcionamento??v.horas??0).toLocaleString('pt-PT')+' h')}</div>${Array.isArray(v.outras_especificacoes)&&v.outras_especificacoes.length?`<div class="gom-spec-display">${v.outras_especificacoes.map(s=>detalheLinha(s.nome||s.chave,s.valor)).join('')}</div>`:''}</section>
      </div>
      <section class="card"><div class="card-header"><span class="card-title">Períodos de inoperacionalidade</span><strong>${periodos.reduce((n,p)=>n+diasPeriodo(p),0)} dias registados</strong></div><div class="table-wrapper"><table><thead><tr><th>Início</th><th>Fim</th><th>Estado</th><th>Motivo</th><th>Dias</th><th>Observações</th></tr></thead><tbody>${periodos.map(p=>`<tr><td>${fmtData(p.data_inicio||p.inicio)}</td><td>${fmtData(p.data_fim||p.fim)}</td><td>${etiquetaOp({estado_operacional:p.estado||p.estado_atual})}</td><td>${e(p.motivo||'—')}</td><td><strong>${diasPeriodo(p)}</strong></td><td>${e(p.observacoes||'—')}</td></tr>`).join('')||'<tr><td colspan="6" class="table-empty">Sem períodos registados.</td></tr>'}</tbody></table></div></section>
      <section class="card"><div class="card-header"><span class="card-title">Alertas ativos</span><button class="btn btn-sm btn-outline" onclick="${al?`modalEditarAlerta('${e(al.id)}')`:`modalNovoAlertaVeiculo('${e(id)}')`}">${icon('edit',12)} ${al?'Editar':'Adicionar'}</button></div>${htmlResumoAlertas(al)}</section>
      <section class="card"><div class="card-header"><span class="card-title">Histórico de obras (${obras.length})</span></div><div class="table-wrapper"><table><thead><tr><th>Obra</th><th>Data</th><th>Intervenções</th><th>Local</th><th>Ponto de situação</th><th>Estado</th></tr></thead><tbody>${obras.map(o=>`<tr onclick="ir('obra-detalhe',{id:'${e(o.id)}'})" style="cursor:pointer"><td><strong>${e(GOM?.numeroObra?GOM.numeroObra(o):o.numero_obra)}</strong></td><td>${fmtDataHora(o.data_entrada)}</td><td>${e(tiposStr(o.tipos_intervencao))}</td><td>${e(GOM?.labelLocalExecucao?GOM.labelLocalExecucao(o.local_execucao):(o.local_execucao||'—'))}</td><td>${e(GOM?.labelPontoSituacao?GOM.labelPontoSituacao(o.ponto_situacao):(o.ponto_situacao||'—'))}</td><td>${badgeEstado(o.estado)}</td></tr>`).join('')||'<tr><td colspan="6" class="table-empty">Sem obras.</td></tr>'}</tbody></table></div></section>
      <section class="card"><div class="card-header"><span class="card-title">Histórico de alterações</span></div><div class="table-wrapper"><table><thead><tr><th>Data e hora</th><th>Tipo</th><th>Valor anterior</th><th>Novo valor</th><th>Motivo</th><th>Observações</th><th>Identificação</th></tr></thead><tbody>${hist.map(h=>{const novo=('novo_valor' in h)?h.novo_valor:h.valor_novo;return `<tr><td>${fmtDataHora(h.data_hora||h.data)}</td><td><strong>${e(h.tipo_alteracao||h.tipo||'Alteração')}</strong></td><td>${e(typeof h.valor_anterior==='object'?JSON.stringify(h.valor_anterior):h.valor_anterior||'—')}</td><td>${e(typeof novo==='object'?JSON.stringify(novo):novo||'—')}</td><td>${e(h.motivo||'—')}</td><td>${e(h.observacoes||'—')}</td><td>${e(h.utilizador||h.operador||'—')}</td></tr>`;}).join('')||'<tr><td colspan="7" class="table-empty">Sem alterações registadas.</td></tr>'}</tbody></table></div></section>`;
  };

  /* ==============================================================
     ALERTAS — conjunto ativo e seguro com estado/nota
     ============================================================= */
  function linhasAlerta() {
    const linhas=[];
    DB.getAlertas().forEach(al=>{
      const v=DB.getVeiculo(al.veiculo_id)||{};
      ALERTAS_ATIVOS.forEach(c=>{
        const anulado=c.tipo==='seguro'&&al.seguro_estado==='anulado';
        linhas.push({al,v,c,data:al[c.campo]||'',status:anulado?'anulado':alertaStatus(al[c.campo],c.antec)});
      });
    });
    return linhas.sort((a,b)=>String(a.data||'9999').localeCompare(String(b.data||'9999')));
  }
  function badgeStatusAlerta(st) {
    if(st==='anulado') return '<span class="badge badge-gray">Anulado</span>';
    return badgeAlertaStatus(st);
  }
  function seguroDetalhe(al) {
    const estado=al.seguro_estado==='anulado'?'Anulado':'Ativo';
    return `<div class="gom-seguro-note"><strong>${estado}</strong>${al.seguro_nota?`<span>${e(al.seguro_nota)}</span>`:'<span>Sem nota</span>'}</div>`;
  }
  window.renderAlertas = function () {
    const linhas=linhasAlerta(); window._alertasLinhas=linhas;
    el('pageTitle').textContent='Alertas & Certificações';
    el('topbarActions').innerHTML=`<button class="btn btn-primary" onclick="modalNovoAlerta()">${icon('plus')} Registar alertas</button>`;
    el('pageContainer').innerHTML=`<div class="page-header"><div><h2>Alertas e certificações</h2><p>Apresentação exclusiva dos alertas ativos configurados.</p></div></div><div class="filter-bar"><input type="search" class="form-control" id="searchAlerta" oninput="filtrarAlertas()" placeholder="Património, matrícula ou nota do seguro…"><select class="form-control" id="filtroTipoAl" onchange="filtrarAlertas()"><option value="">Todos os tipos</option>${ALERTAS_ATIVOS.map(c=>`<option value="${c.tipo}">${e(c.label)}</option>`).join('')}</select><select class="form-control" id="filtroStatusAl" onchange="filtrarAlertas()"><option value="">Todos os estados</option><option value="expirado">Expirado</option><option value="proximo">Próximo</option><option value="ok">Válido</option><option value="anulado">Seguro anulado</option><option value="sem_data">Sem data</option></select></div><div class="card"><div class="table-wrapper"><table><thead><tr><th>Património</th><th>Matrícula</th><th>Tipo</th><th>Data</th><th>Estado / nota</th><th></th></tr></thead><tbody id="alertasBody">${rowsAlertas(linhas)}</tbody></table></div></div>`;
    atualizarBadgeAlertas();
  };
  window.rowsAlertas = function (linhas) {
    if(!linhas?.length) return '<tr><td colspan="6" class="table-empty">Nenhum alerta encontrado.</td></tr>';
    return linhas.map(x=>`<tr><td><strong>${e(x.v.patrimonio||'—')}</strong></td><td>${e(matriculaVisivel(x.v))}</td><td>${e(x.c.label)}</td><td>${fmtData(x.data)}</td><td>${x.c.tipo==='seguro'?seguroDetalhe(x.al):badgeStatusAlerta(x.status)}</td><td><button class="btn btn-sm btn-outline" onclick="modalEditarAlerta('${e(x.al.id)}')">${icon('edit',12)} Editar</button></td></tr>`).join('');
  };
  window.filtrarAlertas = function () {
    const q=valor('searchAlerta').toLowerCase(), tipo=valor('filtroTipoAl'), st=valor('filtroStatusAl');
    const lista=(window._alertasLinhas||[]).filter(x=>{
      const texto=[x.v.patrimonio,x.v.matricula,x.v.marca,x.v.modelo,x.al.seguro_nota].join(' ').toLowerCase();
      return(!q||texto.includes(q))&&(!tipo||x.c.tipo===tipo)&&(!st||x.status===st);
    });
    el('alertasBody').innerHTML=rowsAlertas(lista);
  };
  function campoAlerta(c,al) {
    const ultima=c.ultima?`<div class="form-group"><label class="form-label">Última data</label><input type="date" class="form-control" id="al_${c.ultima}" value="${e(al?.[c.ultima]||'')}"></div>`:'';
    const prox=`<div class="form-group"><label class="form-label">${c.tipo==='seguro'?'Válido até':'Próxima data'}</label><input type="date" class="form-control" id="al_${c.campo}" value="${e(al?.[c.campo]||'')}"></div>`;
    if(c.tipo==='seguro') return `<div class="gom-alert-field"><h5>${e(c.label)}</h5><div class="form-row form-row-2"><div class="form-group"><label class="form-label">Estado do seguro *</label><select class="form-control" id="al_seguro_estado"><option value="ativo" ${al?.seguro_estado!=='anulado'?'selected':''}>Ativo</option><option value="anulado" ${al?.seguro_estado==='anulado'?'selected':''}>Anulado</option></select></div>${prox}</div><div class="form-group"><label class="form-label">Nota associada ao seguro</label><textarea class="form-control" id="al_seguro_nota" rows="2">${e(al?.seguro_nota||'')}</textarea></div></div>`;
    return `<div class="gom-alert-field"><h5>${e(c.label)}</h5><div class="form-row form-row-2">${ultima}${prox}</div></div>`;
  }
  function htmlFormAlertaV4(al=null,incluirVeiculo=false,vid='') {
    return `<form onsubmit="return false">${incluirVeiculo?`<div class="form-group"><label class="form-label">Viatura / máquina *</label><select class="form-control" id="al_veiculo"><option value="">— Selecionar —</option>${DB.getVeiculos().map(v=>`<option value="${e(v.id)}" ${vid===v.id?'selected':''}>${e(v.patrimonio)} — ${e(matriculaVisivel(v))} — ${e(v.marca)} ${e(v.modelo)}</option>`).join('')}</select></div>`:''}<div class="gom-alert-grid">${ALERTAS_ATIVOS.map(c=>campoAlerta(c,al)).join('')}</div>${al?`<div class="form-group"><label class="form-label">Motivo da alteração *</label><input class="form-control" id="al_motivo"></div><div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="al_obs_alteracao" rows="2"></textarea></div>`:''}</form>`;
  }
  function lerAlerta() {
    const d={}; ALERTAS_ATIVOS.forEach(c=>{d[c.campo]=valor('al_'+c.campo);if(c.ultima)d[c.ultima]=valor('al_'+c.ultima);});
    d.seguro_estado=valor('al_seguro_estado')||'ativo'; d.seguro_nota=valor('al_seguro_nota'); return d;
  }
  window.modalNovoAlerta = function () { openModal('Registar alertas',htmlFormAlertaV4(null,true),`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="criarAlerta()">Guardar</button>`,true); };
  window.modalNovoAlertaVeiculo = function (vid) { openModal('Registar alertas',htmlFormAlertaV4(null,false,vid),`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="criarAlertaVeiculo('${e(vid)}')">Guardar</button>`,true); };
  window.modalEditarAlerta = function (id) { const al=DB.getAlertas().find(a=>a.id===id);if(!al)return;openModal('Editar alertas',htmlFormAlertaV4(al),`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarAlerta('${e(id)}')">Guardar</button>`,true); };
  function guardarDadosAlerta(vid,id) {
    const v=DB.getVeiculo(vid); if(!v) throw new Error('Selecione uma viatura ou máquina.');
    const dados=lerAlerta();
    const existente=id ? DB.getAlertas().find(a=>a.id===id) : DB.getAlerta(vid);
    if(existente) DB.actualizarAlerta(existente.id,dados);
    else DB.criarAlerta({veiculo_id:vid,matricula:v.matricula,...dados});
  }
  window.criarAlerta = function () { const vid=valor('al_veiculo');executar(()=>guardarDadosAlerta(vid,null),'Alertas registados.',renderAlertas); };
  window.criarAlertaVeiculo = function (vid) { executar(()=>guardarDadosAlerta(vid,null),'Alertas registados.',()=>renderVeiculoHistorico(vid)); };
  window.guardarAlerta = function (id) {
    const al=DB.getAlertas().find(a=>a.id===id); if(!al)return;
    executar(()=>{const motivo=valor('al_motivo');if(!motivo)throw new Error('Indique o motivo da alteração.');const antes={seguro_estado:al.seguro_estado,seguro_nota:al.seguro_nota};const dados=lerAlerta();guardarDadosAlerta(al.veiculo_id,id);GOM?.registarHistorico?.('veiculo',al.veiculo_id,'Alteração de alertas',antes,{seguro_estado:dados.seguro_estado,seguro_nota:dados.seguro_nota},motivo,valor('al_obs_alteracao'));},'Alertas atualizados.',()=>paginaAtual==='alertas'?renderAlertas():renderVeiculoHistorico(al.veiculo_id));
  };
  window.atualizarBadgeAlertas = function () {
    const n=DB.getAlertas().reduce((s,a)=>s+contarAlertasVeiculo(a),0), b=el('navBadgeAlertas');
    if(b){b.textContent=n||'';b.style.display=n?'inline-flex':'none';}
  };
  function htmlResumoAlertas(al) {
    if(!al) return '<p class="table-empty">Sem alertas registados.</p>';
    return `<div class="gom-alert-summary">${ALERTAS_ATIVOS.map(c=>`<div><span>${e(c.label)}</span>${c.tipo==='seguro'?seguroDetalhe(al):`<strong>${fmtData(al[c.campo])}</strong>${badgeStatusAlerta(alertaStatus(al[c.campo],c.antec))}`}</div>`).join('')}</div>`;
  }

  /* Substitui apenas a apresentação da aba de alertas dos relatórios antigos. */
  window._tabAlertas = function (alertas,veiculos) {
    const linhas=linhasAlerta();
    return `<div class="card"><div class="card-header"><span class="card-title">Estado dos alertas ativos</span></div><div class="table-wrapper"><table><thead><tr><th>Tipo</th><th>Expirados</th><th>Próximos</th><th>Válidos</th><th>Sem data / anulado</th></tr></thead><tbody>${ALERTAS_ATIVOS.map(c=>{const l=linhas.filter(x=>x.c.tipo===c.tipo);return `<tr><td><strong>${e(c.label)}</strong></td><td>${l.filter(x=>x.status==='expirado').length}</td><td>${l.filter(x=>x.status==='proximo').length}</td><td>${l.filter(x=>x.status==='ok').length}</td><td>${l.filter(x=>x.status==='sem_data'||x.status==='anulado').length}</td></tr>`;}).join('')}</tbody></table></div></div>`;
  };

  window._tabFrota = function (veiculos,obras) {
    const ativos=veiculos.filter(v=>admin(v)==='ativo');
    const op=ativos.filter(v=>estadoOp(v)==='operacional').length;
    const reparacao=ativos.filter(v=>estadoOp(v)==='em_reparacao').length;
    const standby=ativos.filter(v=>estadoOp(v)==='inoperacional_standby').length;
    const inicioAno=`${new Date().getFullYear()}-01-01`, fim=hoje();
    const taxa=GOM?.taxaInoperacionalidade?GOM.taxaInoperacionalidade(ativos,inicioAno,fim):0;
    return `<div class="rel-stats-grid"><div class="rel-stat-card accent-blue"><div class="rsc-body"><div class="rsc-num">${ativos.length}</div><div class="rsc-lbl">Ativos</div></div></div><div class="rel-stat-card accent-green"><div class="rsc-body"><div class="rsc-num">${op}</div><div class="rsc-lbl">Operacionais</div></div></div><div class="rel-stat-card accent-orange"><div class="rsc-body"><div class="rsc-num">${reparacao}</div><div class="rsc-lbl">Em reparação</div></div></div><div class="rel-stat-card accent-red"><div class="rsc-body"><div class="rsc-num">${standby}</div><div class="rsc-lbl">Inoperacionais/Standby</div></div></div><div class="rel-stat-card accent-purple"><div class="rsc-body"><div class="rsc-num">${Number(taxa).toLocaleString('pt-PT',{maximumFractionDigits:1})}%</div><div class="rsc-lbl">Taxa de inoperacionalidade</div></div></div></div>
      <div class="grid-2col rel-card-mb"><div class="card"><div class="card-header"><span class="card-title">Distribuição por tipo</span></div><div style="height:260px;padding:16px"><canvas id="chartFrota"></canvas></div></div><div class="card"><div class="card-header"><span class="card-title">Estado operacional</span></div><div style="height:260px;padding:16px"><canvas id="chartEstadoOp"></canvas></div></div></div>
      <div class="rel-section-title">Inventário atual da frota</div><div class="card"><div class="table-wrapper"><table><thead><tr><th>N.º património</th><th>Matrícula</th><th>Tipo principal</th><th>Categoria</th><th>Marca / modelo</th><th>Setor</th><th>Estado operacional</th></tr></thead><tbody>${ativos.sort((a,b)=>String(a.patrimonio||'').localeCompare(String(b.patrimonio||''),'pt',{numeric:true})).map(v=>`<tr onclick="ir('veiculo-historico',{id:'${e(v.id)}'})" style="cursor:pointer"><td><strong>${e(v.patrimonio||'—')}</strong></td><td>${e(matriculaVisivel(v))}</td><td>${tipoPrincipal(v)==='maquina'?'Máquina':'Viatura'}</td><td>${e(v.categoria||'—')}</td><td>${e(v.marca||'—')} ${e(v.modelo||'')}</td><td><strong>${e(setorSigla(v))}</strong></td><td>${etiquetaOp(v)}</td></tr>`).join('')||'<tr><td colspan="7" class="table-empty">Sem registos ativos.</td></tr>'}</tbody></table></div></div>`;
  };

  window._drawChartEstadoOp = function (veiculos) {
    const ativos=(veiculos||[]).filter(v=>admin(v)==='ativo');
    if(typeof _chart!=='function') return;
    _chart('chartEstadoOp',{type:'doughnut',data:{labels:['Operacional','Em reparação','Inoperacional/Standby'],datasets:[{data:[ativos.filter(v=>estadoOp(v)==='operacional').length,ativos.filter(v=>estadoOp(v)==='em_reparacao').length,ativos.filter(v=>estadoOp(v)==='inoperacional_standby').length],backgroundColor:['#22c55e','#f59e0b','#ef4444'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
  };

  function imprimirRelatorioOperacional(titulo,corpo) {
    const area=el('printArea'); if(!area) return;
    area.innerHTML=`<style>@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#172033}h1{font-size:17pt;color:#1a4d8f;border-bottom:3px solid #1a4d8f;padding-bottom:7px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d8e0ea;padding:5px;text-align:left;vertical-align:top}th{background:#eaf1f9;color:#123566}.meta{display:flex;justify-content:space-between;margin-bottom:10px;color:#64748b}.seg{display:grid;gap:2px}.seg strong{text-transform:uppercase;color:#1a4d8f;font-size:8pt}</style><h1>${e(titulo)}</h1><div class="meta"><span>GOM — Gestão de Obras de Manutenção de Frota</span><span>Emitido em ${e(new Date().toLocaleString('pt-PT'))}</span></div>${corpo}`;
    area.style.display='block'; window.print(); setTimeout(()=>{area.style.display='none';area.innerHTML='';},1500);
  }
  function linhasExportacaoAlertas() {
    return linhasAlerta().map(x=>({
      'N.º património':x.v.patrimonio||'—','Matrícula':matriculaVisivel(x.v),'Setor':setorSigla(x.v),
      'Alerta':x.c.label,'Data':x.data||'—','Estado':x.c.tipo==='seguro'?(x.al.seguro_estado==='anulado'?'Anulado':'Ativo'):x.status,
      'Nota do seguro':x.c.tipo==='seguro'?(x.al.seguro_nota||''):''
    }));
  }
  function linhasExportacaoFrota() {
    return DB.getVeiculos().filter(v=>admin(v)==='ativo').map(v=>({
      'N.º património':v.patrimonio||'—','Matrícula':matriculaVisivel(v),'Centro de custos':v.centro_custos||'—',
      'Tipo principal':tipoPrincipal(v)==='maquina'?'Máquina':'Viatura','Categoria':v.categoria||'—','Marca':v.marca||'',
      'Modelo':v.modelo||'','Setor':setorSigla(v),'Estado operacional':estadoOp(v)==='em_reparacao'?'Em reparação':estadoOp(v)==='inoperacional_standby'?'Inoperacional/Standby':'Operacional'
    }));
  }
  window.exportarRelatorioExcel = function (tab) {
    const alvo=tab||(typeof _relTabAtiva!=='undefined'?_relTabAtiva:'resumo');
    if(alvo!=='alertas'&&alvo!=='frota') return exportarRelatorioExcelLegado?.apply(window,arguments);
    if(typeof XLSX==='undefined'){toastMsg('A exportação Excel requer ligação à internet nesta versão.','error');return;}
    const wb=XLSX.utils.book_new(), dados=alvo==='alertas'?linhasExportacaoAlertas():linhasExportacaoFrota();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(dados),alvo==='alertas'?'Alertas ativos':'Frota ativa');
    XLSX.writeFile(wb,`GOM_${alvo}_${hoje()}.xlsx`); toastMsg('Excel exportado.','success');
  };
  window.exportarRelatorioPDF = function (tab) {
    const alvo=tab||(typeof _relTabAtiva!=='undefined'?_relTabAtiva:'resumo');
    if(alvo==='alertas'){
      const linhas=linhasExportacaoAlertas();
      imprimirRelatorioOperacional('Estado dos alertas ativos',`<table><thead><tr><th>Património</th><th>Matrícula</th><th>Setor</th><th>Alerta</th><th>Data</th><th>Estado e nota</th></tr></thead><tbody>${linhas.map(r=>`<tr><td><strong>${e(r['N.º património'])}</strong></td><td>${e(r.Matrícula)}</td><td>${e(r.Setor)}</td><td>${e(r.Alerta)}</td><td>${e(r.Data)}</td><td><div class="seg"><strong>${e(r.Estado)}</strong><span>${e(r['Nota do seguro']||'—')}</span></div></td></tr>`).join('')}</tbody></table>`);return;
    }
    if(alvo==='frota'){
      const linhas=linhasExportacaoFrota();
      imprimirRelatorioOperacional('Estado atual da frota',`<table><thead><tr><th>Património</th><th>Matrícula</th><th>Centro de custos</th><th>Tipo</th><th>Categoria</th><th>Setor</th><th>Estado operacional</th></tr></thead><tbody>${linhas.map(r=>`<tr><td><strong>${e(r['N.º património'])}</strong></td><td>${e(r.Matrícula)}</td><td>${e(r['Centro de custos'])}</td><td>${e(r['Tipo principal'])}</td><td>${e(r.Categoria)}</td><td>${e(r.Setor)}</td><td>${e(r['Estado operacional'])}</td></tr>`).join('')}</tbody></table>`);return;
    }
    return exportarRelatorioPDFLegado?.apply(window,arguments);
  };

  window.GOM_FROTA = {
    ALERTAS_ATIVOS, admin, estadoOp, tipoPrincipal, matriculaVisivel, setorSigla, setorNome,
    htmlResumoAlertas
  };
})();
