/* ================================================================
   GOM v4 — Obras, custos, impressão e seleção em requisições
   Módulo aditivo carregado depois de gom-v4-data.js.
   ================================================================ */
'use strict';

(function (global) {
  const GOM = global.GOM || (global.GOM = {});

  const INTERVENCOES_FALLBACK = [
    'Revisão', 'Mudança de óleo', 'Lavagem', 'Higienização', 'Pneus',
    'Manutenção preventiva', 'Reparação', 'Inspeção', 'Avaria elétrica',
    'Avaria hidráulica', 'Avaria motor', 'Carroçaria / Pintura', 'Outro'
  ];
  const PNEUS_FALLBACK = [
    'Substituição', 'Reparação', 'Rotação', 'Alinhamento/equilibragem', 'Outro'
  ];
  const LOCAIS_FALLBACK = {
    oficina_interna: 'Oficina interna',
    oficina_externa: 'Oficina externa',
    mista: 'Intervenção mista'
  };
  const PONTOS_FALLBACK = {
    aguarda_pecas: 'Aguarda peças',
    aguarda_orcamento: 'Aguarda orçamento',
    aguarda_autorizacao: 'Aguarda autorização',
    aguarda_transporte: 'Aguarda transporte',
    oficina_interna: 'Em oficina interna',
    oficina_externa: 'Em oficina externa',
    intervencao_curso: 'Intervenção em curso',
    outro: 'Outro'
  };

  function texto(valor) {
    return valor === null || valor === undefined ? '' : String(valor);
  }

  function h(valor) {
    const s = texto(valor);
    if (typeof global.esc === 'function') return global.esc(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function js(valor) {
    return texto(valor).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      .replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  }

  function normalizar(valor) {
    return texto(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function ico(nome, tamanho) {
    return typeof global.icon === 'function' ? global.icon(nome, tamanho) : '';
  }

  function dataCurta(valor) {
    return typeof global.fmtData === 'function' ? global.fmtData(valor) : (texto(valor) || '—');
  }

  function dataHora(valor) {
    return typeof global.fmtDataHora === 'function' ? global.fmtDataHora(valor) : (texto(valor) || '—');
  }

  function euro(valor) {
    if (typeof global.fmtEuro === 'function') return global.fmtEuro(valor);
    return (Number(valor) || 0).toLocaleString('pt-PT', {style: 'currency', currency: 'EUR'});
  }

  function agoraLocal() {
    if (typeof global.localISO === 'function') return global.localISO(new Date());
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function dataValidaLocal(valor) {
    if (!valor) return false;
    const d = new Date(texto(valor).length === 10 ? valor + 'T00:00:00' : valor);
    return Number.isFinite(d.getTime());
  }

  function intervaloValidoLocal(inicio, fim) {
    if (!inicio || !fim) return true;
    return dataValidaLocal(inicio) && dataValidaLocal(fim) && new Date(fim) >= new Date(inicio);
  }

  function avisar(mensagem, tipo) {
    if (typeof global.toastMsg === 'function') global.toastMsg(mensagem, tipo || '');
  }

  function abrirModal(titulo, corpo, rodape, grande) {
    if (typeof global.openModal === 'function') global.openModal(titulo, corpo, rodape, !!grande);
  }

  function fecharModal() {
    if (typeof global.closeModal === 'function') global.closeModal();
  }

  function opcoes(fonte, fallback, mapaRotulos) {
    const origem = fonte || fallback;
    if (Array.isArray(origem)) {
      return origem.map(item => {
        if (item && typeof item === 'object') {
          const value = item.value ?? item.valor ?? item.codigo ?? item.id ?? item.label ?? item.nome;
          const label = item.label ?? item.nome ?? item.texto ?? mapaRotulos?.[value] ?? value;
          return {value: texto(value), label: texto(label)};
        }
        const value = texto(item);
        return {value, label: texto(mapaRotulos?.[value] || value)};
      }).filter(item => item.value);
    }
    if (origem && typeof origem === 'object') {
      return Object.entries(origem).map(([value, item]) => ({
        value,
        label: texto(item && typeof item === 'object' ? (item.label ?? item.nome ?? value) : item)
      }));
    }
    return [];
  }

  function opcoesIntervencao(selecionadas) {
    const base = opcoes(GOM.INTERVENCOES, INTERVENCOES_FALLBACK);
    const vistos = new Set(base.map(item => item.value));
    (Array.isArray(selecionadas) ? selecionadas : selecionadas ? [selecionadas] : []).forEach(valor => {
      if (!vistos.has(valor)) {
        base.push({value: texto(valor), label: texto(valor)});
        vistos.add(valor);
      }
    });
    return base;
  }

  function opcoesPneus() {
    return opcoes(GOM.PNEUS_TIPOS, PNEUS_FALLBACK);
  }

  function opcoesLocais() {
    return opcoes(GOM.LOCAIS_EXECUCAO, LOCAIS_FALLBACK, LOCAIS_FALLBACK);
  }

  function opcoesPontos() {
    return opcoes(GOM.PONTOS_SITUACAO, PONTOS_FALLBACK, PONTOS_FALLBACK);
  }

  function labelOpcao(lista, valor, fallback) {
    return lista.find(item => item.value === valor)?.label || fallback || valor || '—';
  }

  function numeroObra(obra) {
    if (typeof GOM.numeroObra === 'function') {
      try { return texto(GOM.numeroObra(obra)); } catch (erro) { /* fallback abaixo */ }
    }
    const valor = texto(obra && typeof obra === 'object' ? obra.numero_obra : obra);
    let m = /^OBR-(\d{4})-(\d+)$/.exec(valor);
    if (m) return `${parseInt(m[2], 10)}/${m[1]}`;
    m = /^(\d+)\/(\d{4})$/.exec(valor);
    return m ? `${parseInt(m[1], 10)}/${m[2]}` : valor || '—';
  }

  function estadoAdminAtivo(veiculo) {
    if (!veiculo) return false;
    const estado = veiculo.estado_administrativo || (veiculo.ativo === false ? 'inativo_suspenso' : 'ativo');
    return estado === 'ativo';
  }

  function veiculoDaObra(obra) {
    return obra?.veiculo_id ? DB.getVeiculo(obra.veiculo_id) : null;
  }

  function identificacaoBem(obra, veiculo) {
    const v = veiculo || veiculoDaObra(obra);
    if (!v) return obra?.patrimonio || obra?.matricula || 'Bem não identificado';
    const principal = v.tipo_principal === 'maquina' || v.tipo === 'maquina' ? 'Máquina' : 'Viatura';
    const nome = [v.marca, v.modelo].filter(Boolean).join(' ');
    return `${principal}${nome ? ' — ' + nome : ''}`;
  }

  function matriculaApresentacao(valor) {
    return texto(valor).trim() || 'Não aplicável';
  }

  function tiposArrayLocal(valor) {
    if (!valor) return [];
    return Array.isArray(valor) ? valor.filter(Boolean) : [valor];
  }

  function temOutro(tipos) {
    return tipos.some(tipo => normalizar(tipo) === 'outro');
  }

  function temPneus(tipos) {
    return tipos.some(tipo => normalizar(tipo).includes('pneu'));
  }

  function badgeTiposLocal(tipos) {
    const cores = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-purple', 'badge-orange', 'badge-teal'];
    return tiposArrayLocal(tipos).map((tipo, indice) =>
      `<span class="badge ${cores[indice % cores.length]}" style="margin:1px 2px 1px 0">${h(tipo)}</span>`
    ).join('') || '—';
  }

  function badgeEstadoObra(estado) {
    if (estado === 'aberta') return `<span class="badge badge-red">${ico('tools', 11)} Aberta</span>`;
    if (estado === 'fechada') return `<span class="badge badge-green">${ico('check', 11)} Fechada</span>`;
    if (estado === 'anulada') return `<span class="badge badge-gray">Anulada</span>`;
    return `<span class="badge badge-gray">${h(estado || '—')}</span>`;
  }

  function estadoObraLabel(estado) {
    return estado === 'aberta' ? 'Aberta' : estado === 'fechada' ? 'Fechada' : estado === 'anulada' ? 'Anulada' : texto(estado || '—');
  }

  function duracao(entrada, saida) {
    return typeof global.calcDuracao === 'function' ? global.calcDuracao(entrada, saida) : '—';
  }

  function totalObra(obra) {
    if (typeof GOM.calcularTotalObra === 'function') {
      const total = Number(GOM.calcularTotalObra(obra));
      if (Number.isFinite(total)) return total;
    }
    return ['custo_materiais', 'custo_mao_obra', 'custo_servicos_externos', 'custo_pecas', 'custo_outros']
      .reduce((soma, campo) => soma + (Number(obra?.[campo]) || 0), 0);
  }

  function camposCustos(valores) {
    const materiais = Number(valores.custo_materiais) || 0;
    const mao = Number(valores.custo_mao_obra) || 0;
    const servicos = Number(valores.custo_servicos_externos) || 0;
    const pecas = Number(valores.custo_pecas) || 0;
    const outros = Number(valores.custo_outros) || 0;
    const base = {
      custo_materiais: materiais,
      custo_mao_obra: mao,
      custo_servicos_externos: servicos,
      custo_pecas: pecas,
      custo_outros: outros,
      custos: {materiais, mao_obra: mao, servicos_externos: servicos, pecas, outros}
    };
    base.custo_total = totalObra(base);
    return base;
  }

  function lerCustos(prefixo) {
    const nomes = ['materiais', 'mao', 'servicos', 'pecas', 'outros'];
    const valores = {};
    for (const nome of nomes) {
      const elemento = document.getElementById(`${prefixo}_custo_${nome}`);
      const bruto = elemento?.value?.trim() || '0';
      const numero = Number(bruto.replace(',', '.'));
      if (!Number.isFinite(numero) || numero < 0) return {erro: 'Os custos devem ser valores iguais ou superiores a zero.'};
      valores[nome] = numero;
    }
    return {campos: camposCustos({
      custo_materiais: valores.materiais,
      custo_mao_obra: valores.mao,
      custo_servicos_externos: valores.servicos,
      custo_pecas: valores.pecas,
      custo_outros: valores.outros
    })};
  }

  function recalcularTotalObraForm(prefixo) {
    const resultado = lerCustos(prefixo);
    const alvo = document.getElementById(`${prefixo}_custo_total`);
    if (alvo) alvo.value = resultado.erro ? '—' : euro(resultado.campos.custo_total);
  }

  function registarHistorico(veiculoId, tipo, anterior, novo, motivo, observacoes, dataEfetiva) {
    if (!veiculoId || typeof GOM.registarHistorico !== 'function') return;
    GOM.registarHistorico(veiculoId, tipo, anterior, novo, motivo, observacoes || '', dataEfetiva);
  }

  function resumoObraHistorico(obra) {
    return {
      numero_obra: numeroObra(obra),
      estado: obra.estado,
      data_entrada: obra.data_entrada || '',
      data_saida: obra.data_saida || '',
      tipos_intervencao: tiposArrayLocal(obra.tipos_intervencao),
      local_execucao: obra.local_execucao || '',
      ponto_situacao: obra.ponto_situacao || '',
      ponto_situacao_observacao: obra.ponto_situacao_observacao || '',
      custo_total: totalObra(obra)
    };
  }

  function refreshObras(id) {
    const pagina = typeof paginaAtual !== 'undefined' ? paginaAtual : '';
    if (pagina === 'obra-detalhe' && id) global.renderObraDetalhe(id);
    else if (typeof global.ir === 'function') global.ir('obras');
    else global.renderObras();
  }

  function htmlIntervencoes(selecionadas, prefixo) {
    const tipos = tiposArrayLocal(selecionadas);
    const checks = opcoesIntervencao(tipos).map(item => `
      <label class="checkbox-label">
        <input type="checkbox" class="${h(prefixo)}-intervencao" value="${h(item.value)}"
          ${tipos.includes(item.value) ? 'checked' : ''} onchange="atualizarCamposIntervencao('${js(prefixo)}')">
        <span class="badge badge-blue" style="pointer-events:none">${h(item.label)}</span>
      </label>`).join('');
    return `<div class="checkbox-grid">${checks}</div>`;
  }

  function htmlSelectOpcoes(id, lista, selecionado, vazio) {
    return `<select class="form-control" id="${h(id)}">
      ${vazio !== null ? `<option value="">${h(vazio || '— Selecione —')}</option>` : ''}
      ${lista.map(item => `<option value="${h(item.value)}" ${item.value === selecionado ? 'selected' : ''}>${h(item.label)}</option>`).join('')}
    </select>`;
  }

  function camposIntervencaoHtml(obra, prefixo) {
    const tipos = tiposArrayLocal(obra?.tipos_intervencao);
    const mostrarOutro = temOutro(tipos);
    const mostrarPneus = temPneus(tipos);
    const pneusOutro = normalizar(obra?.pneus_tipo) === 'outro';
    return `
      <div class="form-group"><label class="form-label">Intervenções *</label>${htmlIntervencoes(tipos, prefixo)}</div>
      <div class="form-group" id="${h(prefixo)}_intervencao_outro_wrap" style="display:${mostrarOutro ? 'block' : 'none'}">
        <label class="form-label">Descrição de “Outro” *</label>
        <input class="form-control" id="${h(prefixo)}_intervencao_outro" value="${h(obra?.intervencao_outro_descricao || '')}">
      </div>
      <div id="${h(prefixo)}_pneus_wrap" style="display:${mostrarPneus ? 'block' : 'none'}">
        <div class="form-group"><label class="form-label">Tipo de intervenção em pneus *</label>
          <select class="form-control" id="${h(prefixo)}_pneus_tipo" onchange="atualizarCamposIntervencao('${js(prefixo)}')">
            <option value="">— Selecione —</option>
            ${opcoesPneus().map(item => `<option value="${h(item.value)}" ${item.value === obra?.pneus_tipo ? 'selected' : ''}>${h(item.label)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" id="${h(prefixo)}_pneus_outro_wrap" style="display:${pneusOutro ? 'block' : 'none'}">
          <label class="form-label">Descrição do outro tipo de intervenção em pneus *</label>
          <input class="form-control" id="${h(prefixo)}_pneus_outro" value="${h(obra?.pneus_outro_descricao || '')}">
        </div>
      </div>`;
  }

  function camposSituacaoHtml(obra, prefixo) {
    const pontoOutro = obra?.ponto_situacao === 'outro';
    return `
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Local de execução da intervenção *</label>
          ${htmlSelectOpcoes(`${prefixo}_local`, opcoesLocais(), obra?.local_execucao || '', '— Selecione —')}
        </div>
        <div class="form-group"><label class="form-label">Ponto de situação da obra</label>
          <select class="form-control" id="${h(prefixo)}_ponto" onchange="atualizarCamposIntervencao('${js(prefixo)}')">
            <option value="">— Sem indicação —</option>
            ${opcoesPontos().map(item => `<option value="${h(item.value)}" ${item.value === obra?.ponto_situacao ? 'selected' : ''}>${h(item.label)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group" id="${h(prefixo)}_ponto_outro_wrap" style="display:${pontoOutro ? 'block' : 'none'}">
        <label class="form-label">Observação do ponto de situação “Outro” *</label>
        <input class="form-control" id="${h(prefixo)}_ponto_outro" value="${h(obra?.ponto_situacao_observacao || '')}">
      </div>`;
  }

  function custosHtml(obra, prefixo) {
    const total = totalObra(obra || {});
    const campo = (sufixo, rotulo, valor) => `
      <div class="form-group"><label class="form-label">${h(rotulo)}</label>
        <input type="number" min="0" step="0.01" class="form-control" id="${h(prefixo)}_custo_${h(sufixo)}"
          value="${Number(valor) || 0}" oninput="recalcularTotalObraForm('${js(prefixo)}')">
      </div>`;
    return `
      <div class="form-row form-row-3">
        ${campo('materiais', 'Materiais (€)', obra?.custo_materiais)}
        ${campo('mao', 'Mão de obra (€)', obra?.custo_mao_obra)}
        ${campo('servicos', 'Serviços externos (€)', obra?.custo_servicos_externos)}
        ${campo('pecas', 'Peças (€)', obra?.custo_pecas)}
        ${campo('outros', 'Outros custos (€)', obra?.custo_outros)}
        <div class="form-group"><label class="form-label">Total da obra</label>
          <input class="form-control" id="${h(prefixo)}_custo_total" value="${h(euro(total))}" readonly>
        </div>
      </div>`;
  }

  function atualizarCamposIntervencao(prefixo) {
    const tipos = [...document.querySelectorAll(`.${prefixo}-intervencao:checked`)].map(item => item.value);
    const outroWrap = document.getElementById(`${prefixo}_intervencao_outro_wrap`);
    const pneusWrap = document.getElementById(`${prefixo}_pneus_wrap`);
    const pneusOutroWrap = document.getElementById(`${prefixo}_pneus_outro_wrap`);
    const pontoOutroWrap = document.getElementById(`${prefixo}_ponto_outro_wrap`);
    if (outroWrap) outroWrap.style.display = temOutro(tipos) ? 'block' : 'none';
    if (pneusWrap) pneusWrap.style.display = temPneus(tipos) ? 'block' : 'none';
    const pneusTipo = document.getElementById(`${prefixo}_pneus_tipo`)?.value || '';
    if (pneusOutroWrap) pneusOutroWrap.style.display = normalizar(pneusTipo) === 'outro' ? 'block' : 'none';
    const ponto = document.getElementById(`${prefixo}_ponto`)?.value || '';
    if (pontoOutroWrap) pontoOutroWrap.style.display = ponto === 'outro' ? 'block' : 'none';
  }

  function lerIntervencoes(prefixo) {
    const tipos = [...document.querySelectorAll(`.${prefixo}-intervencao:checked`)].map(item => item.value);
    return {
      tipos_intervencao: tipos,
      intervencao_outro_descricao: (document.getElementById(`${prefixo}_intervencao_outro`)?.value || '').trim(),
      pneus_tipo: document.getElementById(`${prefixo}_pneus_tipo`)?.value || '',
      pneus_outro_descricao: (document.getElementById(`${prefixo}_pneus_outro`)?.value || '').trim()
    };
  }

  function lerSituacao(prefixo) {
    return {
      local_execucao: document.getElementById(`${prefixo}_local`)?.value || '',
      ponto_situacao: document.getElementById(`${prefixo}_ponto`)?.value || '',
      ponto_situacao_observacao: (document.getElementById(`${prefixo}_ponto_outro`)?.value || '').trim()
    };
  }

  function validarCamposObra(intervencoes, situacao) {
    if (!intervencoes.tipos_intervencao.length) return 'Selecione pelo menos uma intervenção.';
    if (temOutro(intervencoes.tipos_intervencao) && !intervencoes.intervencao_outro_descricao) {
      return 'Descreva a intervenção “Outro”.';
    }
    if (temPneus(intervencoes.tipos_intervencao) && !intervencoes.pneus_tipo) {
      return 'Selecione o tipo de intervenção em pneus.';
    }
    if (temPneus(intervencoes.tipos_intervencao) && normalizar(intervencoes.pneus_tipo) === 'outro' && !intervencoes.pneus_outro_descricao) {
      return 'Descreva o outro tipo de intervenção em pneus.';
    }
    if (!situacao.local_execucao) return 'Selecione o local de execução da intervenção.';
    if (situacao.ponto_situacao === 'outro' && !situacao.ponto_situacao_observacao) {
      return 'Preencha a observação do ponto de situação “Outro”.';
    }
    return '';
  }

  function ordenarObras(lista) {
    return [...lista].sort((a, b) => new Date(b.data_entrada || 0) - new Date(a.data_entrada || 0));
  }

  function renderObrasV4() {
    const obras = ordenarObras(DB.getObras());
    global._obrasV4 = obras;
    const tipos = [...new Set([
      ...opcoesIntervencao([]).map(item => item.value),
      ...obras.flatMap(obra => tiposArrayLocal(obra.tipos_intervencao))
    ])];
    const setores = [...new Set(obras.map(obra => obra.setor_snapshot).filter(Boolean))].sort((a, b) => texto(a).localeCompare(texto(b), 'pt'));
    document.getElementById('topbarActions').innerHTML = `
      <button class="btn btn-primary" onclick="modalCriarObra()">${ico('plus')} Nova Obra</button>`;
    document.getElementById('pageContainer').innerHTML = `
      <div class="page-header"><div><h2>Gestão de Obras</h2><p>${obras.length} obras registadas</p></div></div>
      <div class="filter-bar">
        <input type="text" class="form-control" placeholder="Pesquisar por obra, património ou matrícula…" id="searchObra" oninput="filtrarObras()">
        <select class="form-control" id="filtroEstado" onchange="filtrarObras()">
          <option value="">Todos os estados</option><option value="aberta">Abertas</option>
          <option value="fechada">Fechadas</option><option value="anulada">Anuladas</option>
        </select>
        <select class="form-control" id="filtroInt" onchange="filtrarObras()">
          <option value="">Todas as intervenções</option>${tipos.map(tipo => `<option value="${h(tipo)}">${h(tipo)}</option>`).join('')}
        </select>
        <select class="form-control" id="filtroSetor" onchange="filtrarObras()">
          <option value="">Todos os setores</option>${setores.map(setor => `<option value="${h(setor)}">${h(setor)}</option>`).join('')}
        </select>
      </div>
      <div class="card"><div class="table-wrapper"><table>
        <thead><tr><th>N.º Obra</th><th>Bem</th><th>Património</th><th>Matrícula</th><th>Intervenção</th>
          <th>Local</th><th>Ponto de situação</th><th>Entrada</th><th>Estado</th><th>Ações</th></tr></thead>
        <tbody id="obrasBody">${rowsObrasV4(obras)}</tbody>
      </table></div></div>`;
    if (typeof global.iniciarTimersImob === 'function') global.iniciarTimersImob();
  }

  function rowsObrasV4(lista) {
    if (!Array.isArray(lista) || !lista.length) return '<tr><td colspan="10" class="table-empty">Nenhuma obra encontrada.</td></tr>';
    const locais = opcoesLocais();
    const pontos = opcoesPontos();
    return lista.map(obra => {
      const v = veiculoDaObra(obra);
      const id = js(obra.id);
      const acoesAbertas = obra.estado === 'aberta' ? `
        <button class="btn btn-sm btn-warning btn-icon" title="Atualizar" onclick="modalActualizar('${id}')">${ico('edit', 14)}</button>
        <button class="btn btn-sm btn-success btn-icon" title="Fechar" onclick="modalFechar('${id}')">${ico('check', 14)}</button>` : '';
      const anular = obra.estado !== 'anulada' ? `
        <button class="btn btn-sm btn-danger btn-icon" title="Anular" onclick="modalAnularObra('${id}')">${ico('x', 14)}</button>` : '';
      return `<tr>
        <td><strong>${h(numeroObra(obra))}</strong></td>
        <td>${h(identificacaoBem(obra, v))}</td>
        <td><strong>${h(obra.patrimonio || v?.patrimonio || '—')}</strong></td>
        <td>${h(matriculaApresentacao(obra.matricula || v?.matricula))}</td>
        <td>${badgeTiposLocal(obra.tipos_intervencao)}</td>
        <td>${h(labelOpcao(locais, obra.local_execucao, '—'))}</td>
        <td>${h(labelOpcao(pontos, obra.ponto_situacao, '—'))}</td>
        <td style="white-space:nowrap">${h(dataHora(obra.data_entrada))}</td>
        <td>${badgeEstadoObra(obra.estado)}</td>
        <td><div style="display:flex;gap:3px">
          <button class="btn btn-sm btn-outline btn-icon" title="Ver" onclick="ir('obra-detalhe',{id:'${id}'})">${ico('eye', 14)}</button>
          <button class="btn btn-sm btn-secondary btn-icon" title="Imprimir" onclick="imprimirObra('${id}')">${ico('print', 14)}</button>
          ${acoesAbertas}${anular}
        </div></td>
      </tr>`;
    }).join('');
  }

  function filtrarObrasV4() {
    const q = normalizar(document.getElementById('searchObra')?.value || '');
    const estado = document.getElementById('filtroEstado')?.value || '';
    const tipo = document.getElementById('filtroInt')?.value || '';
    const setor = document.getElementById('filtroSetor')?.value || '';
    const lista = (global._obrasV4 || []).filter(obra => {
      const v = veiculoDaObra(obra);
      const pesquisa = normalizar([
        numeroObra(obra), obra.numero_obra, obra.numero_obra_original,
        obra.patrimonio, v?.patrimonio, obra.matricula, v?.matricula,
        obra.descricao_avaria, identificacaoBem(obra, v)
      ].filter(Boolean).join(' '));
      return (!q || pesquisa.includes(q)) && (!estado || obra.estado === estado) &&
        (!tipo || tiposArrayLocal(obra.tipos_intervencao).includes(tipo)) &&
        (!setor || obra.setor_snapshot === setor);
    });
    const corpo = document.getElementById('obrasBody');
    if (corpo) corpo.innerHTML = rowsObrasV4(lista);
  }

  function modalCriarObraV4() {
    const veiculos = DB.getVeiculos().filter(estadoAdminAtivo).sort((a, b) =>
      texto(a.patrimonio).localeCompare(texto(b.patrimonio), 'pt') || texto(a.matricula).localeCompare(texto(b.matricula), 'pt'));
    abrirModal('Nova Obra', `
      <form onsubmit="return false">
        <div class="form-group"><label class="form-label">Viatura ou máquina *</label>
          <select class="form-control" id="nv_veiculo">
            <option value="">— Selecione —</option>
            ${veiculos.map(v => `<option value="${h(v.id)}">${h(v.patrimonio || 'Sem património')} — ${h(matriculaApresentacao(v.matricula))} — ${h([v.marca, v.modelo].filter(Boolean).join(' '))}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Data/hora de entrada *</label>
          <input type="datetime-local" class="form-control" id="nv_entrada" value="${h(agoraLocal())}">
        </div>
        ${camposIntervencaoHtml(null, 'nv')}
        <div class="form-group"><label class="form-label">Descrição da avaria ou intervenção *</label>
          <textarea class="form-control" id="nv_desc" rows="3"></textarea>
        </div>
        ${camposSituacaoHtml(null, 'nv')}
        <div class="form-group"><label class="form-label">Observações</label>
          <textarea class="form-control" id="nv_observacoes" rows="2"></textarea>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="criarObra()">${ico('save')} Criar Obra</button>`, true);
  }

  function criarObraV4() {
    const veiculoId = document.getElementById('nv_veiculo')?.value || '';
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) return avisar('Selecione uma viatura ou máquina.', 'error');
    if (!estadoAdminAtivo(veiculo)) return avisar('Um registo inativo/suspenso tem de ser reativado antes de abrir uma obra.', 'error');
    const entrada = document.getElementById('nv_entrada')?.value || '';
    if (!dataValidaLocal(entrada)) return avisar('Preencha uma data/hora de entrada válida.', 'error');
    const descricao = (document.getElementById('nv_desc')?.value || '').trim();
    if (!descricao) return avisar('Preencha a descrição da avaria ou intervenção.', 'error');
    const intervencoes = lerIntervencoes('nv');
    const situacao = lerSituacao('nv');
    const erro = validarCamposObra(intervencoes, situacao);
    if (erro) return avisar(erro, 'error');
    if (typeof DB.reservarNumeroObra !== 'function') return avisar('Não foi possível reservar o número da obra.', 'error');
    const ano = new Date(entrada).getFullYear();
    const numero = DB.reservarNumeroObra(ano);
    const dadosNumero = numero && typeof numero === 'object' ? {
      numero_obra: numero.numero_obra || numero.numero || numero.formatado,
      numero_sequencial: numero.numero_sequencial,
      ano_obra: numero.ano_obra || ano
    } : {numero_obra: numero, ano_obra: ano};
    const custos = camposCustos({});
    const nova = DB.criarObra({
      ...dadosNumero,
      veiculo_id: veiculo.id,
      matricula: veiculo.matricula || '',
      patrimonio: veiculo.patrimonio || '',
      setor_snapshot: veiculo.setor_sigla || veiculo.setor || '',
      data_entrada: entrada,
      data_saida: null,
      estado: 'aberta',
      ...intervencoes,
      ...situacao,
      descricao_avaria: descricao,
      observacoes: (document.getElementById('nv_observacoes')?.value || '').trim(),
      trabalhos_realizados: '',
      pecas_materiais: '',
      servicos_externos: '',
      ...custos
    });
    registarHistorico(veiculo.id, 'abertura_obra', null, resumoObraHistorico(nova), descricao,
      nova.observacoes || '', entrada);
    fecharModal();
    avisar(`Obra ${numeroObra(nova)} criada.`, 'success');
    setTimeout(() => refreshObras(), 200);
  }

  function modalCriarObraVeiculoV4(veiculoId) {
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo || !estadoAdminAtivo(veiculo)) {
      avisar('Um registo inativo/suspenso tem de ser reativado antes de abrir uma obra.', 'error');
      return;
    }
    modalCriarObraV4();
    const select = document.getElementById('nv_veiculo');
    if (select) select.value = veiculoId;
  }

  function modalActualizarV4(id) {
    const obra = DB.getObra(id);
    if (!obra) return;
    if (obra.estado !== 'aberta') return avisar('Só é possível atualizar uma obra aberta.', 'error');
    abrirModal(`Atualizar Obra ${numeroObra(obra)}`, `
      <form onsubmit="return false">
        <div class="form-group"><label class="form-label">Data/hora de entrada *</label>
          <input type="datetime-local" class="form-control" id="ua_entrada" value="${h(obra.data_entrada || '')}">
        </div>
        ${camposIntervencaoHtml(obra, 'ua')}
        <div class="form-group"><label class="form-label">Descrição da avaria ou intervenção *</label>
          <textarea class="form-control" id="ua_desc" rows="3">${h(obra.descricao_avaria || '')}</textarea>
        </div>
        ${camposSituacaoHtml(obra, 'ua')}
        <div class="form-group"><label class="form-label">Trabalhos realizados</label>
          <textarea class="form-control" id="ua_trabalhos" rows="3">${h(obra.trabalhos_realizados || '')}</textarea>
        </div>
        <div class="form-group"><label class="form-label">Peças e materiais utilizados</label>
          <textarea class="form-control" id="ua_pecas_texto" rows="3">${h(obra.pecas_materiais || '')}</textarea>
        </div>
        <div class="form-group"><label class="form-label">Serviços externos realizados</label>
          <textarea class="form-control" id="ua_servicos_texto" rows="2">${h(obra.servicos_externos || '')}</textarea>
        </div>
        <div class="form-group"><label class="form-label">Observações atualizadas</label>
          <textarea class="form-control" id="ua_observacoes" rows="2">${h(obra.observacoes || '')}</textarea>
        </div>
        <div class="section-divider"></div>
        <h4 style="margin-bottom:12px">Custos internos da obra</h4>
        ${custosHtml(obra, 'ua')}
        <div class="section-divider"></div>
        <div class="form-group"><label class="form-label">Motivo da alteração *</label>
          <input class="form-control" id="ua_motivo">
        </div>
        <div class="form-group"><label class="form-label">Observações da alteração</label>
          <textarea class="form-control" id="ua_motivo_obs" rows="2"></textarea>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="actualizarObra('${js(id)}')">${ico('save')} Guardar</button>`, true);
  }

  function actualizarObraV4(id) {
    const anterior = DB.getObra(id);
    if (!anterior) return;
    if (anterior.estado !== 'aberta') return avisar('Só é possível atualizar uma obra aberta.', 'error');
    const entrada = document.getElementById('ua_entrada')?.value || '';
    if (!dataValidaLocal(entrada)) return avisar('Preencha uma data/hora de entrada válida.', 'error');
    if (anterior.data_saida && !intervaloValidoLocal(entrada, anterior.data_saida)) {
      return avisar('A data final não pode ser anterior à data inicial.', 'error');
    }
    const descricao = (document.getElementById('ua_desc')?.value || '').trim();
    if (!descricao) return avisar('Preencha a descrição da avaria ou intervenção.', 'error');
    const intervencoes = lerIntervencoes('ua');
    const situacao = lerSituacao('ua');
    const erro = validarCamposObra(intervencoes, situacao);
    if (erro) return avisar(erro, 'error');
    const custos = lerCustos('ua');
    if (custos.erro) return avisar(custos.erro, 'error');
    const motivo = (document.getElementById('ua_motivo')?.value || '').trim();
    const motivoObs = (document.getElementById('ua_motivo_obs')?.value || '').trim();
    if (!motivo) return avisar('Indique o motivo da alteração.', 'error');
    const campos = {
      data_entrada: entrada,
      ...intervencoes,
      ...situacao,
      descricao_avaria: descricao,
      trabalhos_realizados: document.getElementById('ua_trabalhos')?.value || '',
      pecas_materiais: document.getElementById('ua_pecas_texto')?.value || '',
      servicos_externos: document.getElementById('ua_servicos_texto')?.value || '',
      observacoes: document.getElementById('ua_observacoes')?.value || '',
      ...custos.campos
    };
    const atualizada = DB.actualizarObra(id, campos);
    registarHistorico(anterior.veiculo_id, 'atualizacao_obra', resumoObraHistorico(anterior),
      resumoObraHistorico(atualizada), motivo, motivoObs, entrada);
    fecharModal();
    avisar('Obra atualizada.', 'success');
    setTimeout(() => refreshObras(id), 200);
  }

  function modalFecharV4(id) {
    const obra = DB.getObra(id);
    if (!obra) return;
    if (obra.estado !== 'aberta') return avisar('A obra já não está aberta.', 'error');
    abrirModal(`Fechar Obra ${numeroObra(obra)}`, `
      <form onsubmit="return false">
        <div class="alert-box alert-box-info">${ico('info', 15)} O fecho da obra não altera automaticamente o estado operacional do bem.</div>
        <div class="form-row form-row-2">
          <div class="form-group"><label class="form-label">Data/hora de entrada *</label>
            <input type="datetime-local" class="form-control" id="fc_entrada" value="${h(obra.data_entrada || '')}">
          </div>
          <div class="form-group"><label class="form-label">Data/hora de saída *</label>
            <input type="datetime-local" class="form-control" id="fc_saida" value="${h(agoraLocal())}">
          </div>
        </div>
        <div class="form-group"><label class="form-label">Local de execução da intervenção *</label>
          ${htmlSelectOpcoes('fc_local', opcoesLocais(), obra.local_execucao || '', '— Selecione —')}
        </div>
        <h4 style="margin-bottom:12px">Custos internos finais</h4>
        ${custosHtml(obra, 'fc')}
        <div class="form-group"><label class="form-label">Motivo/resultado do fecho *</label>
          <input class="form-control" id="fc_motivo">
        </div>
        <div class="form-group"><label class="form-label">Observações do fecho</label>
          <textarea class="form-control" id="fc_observacoes" rows="2"></textarea>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-success" onclick="fecharObra('${js(id)}')">${ico('check')} Fechar Obra</button>`, true);
  }

  function fecharObraV4(id) {
    const anterior = DB.getObra(id);
    if (!anterior) return;
    if (anterior.estado !== 'aberta') return avisar('A obra já não está aberta.', 'error');
    const entrada = document.getElementById('fc_entrada')?.value || '';
    const saida = document.getElementById('fc_saida')?.value || '';
    if (!dataValidaLocal(entrada) || !dataValidaLocal(saida)) return avisar('Preencha datas válidas.', 'error');
    if (!intervaloValidoLocal(entrada, saida)) return avisar('A data final não pode ser anterior à data inicial.', 'error');
    const local = document.getElementById('fc_local')?.value || '';
    if (!local) return avisar('Selecione o local de execução da intervenção.', 'error');
    const custos = lerCustos('fc');
    if (custos.erro) return avisar(custos.erro, 'error');
    const motivo = (document.getElementById('fc_motivo')?.value || '').trim();
    const observacoes = (document.getElementById('fc_observacoes')?.value || '').trim();
    if (!motivo) return avisar('Indique o motivo ou resultado do fecho.', 'error');
    const atualizada = DB.actualizarObra(id, {
      estado: 'fechada', data_entrada: entrada, data_saida: saida,
      local_execucao: local, ...custos.campos
    });
    registarHistorico(anterior.veiculo_id, 'fecho_obra', resumoObraHistorico(anterior),
      resumoObraHistorico(atualizada), motivo, observacoes, saida);
    fecharModal();
    avisar('Obra fechada.', 'success');
    setTimeout(() => refreshObras(id), 200);
  }

  function modalAnularObra(id) {
    const obra = DB.getObra(id);
    if (!obra || obra.estado === 'anulada') return;
    abrirModal(`Anular Obra ${numeroObra(obra)}`, `
      <div class="alert-box alert-box-warning">A obra será mantida no histórico e o respetivo número nunca será reutilizado.</div>
      <div class="form-group"><label class="form-label">Motivo da anulação *</label>
        <textarea class="form-control" id="an_motivo" rows="2"></textarea>
      </div>
      <div class="form-group"><label class="form-label">Observações</label>
        <textarea class="form-control" id="an_observacoes" rows="2"></textarea>
      </div>
      <label class="checkbox-label" style="margin-top:8px">
        <input type="checkbox" id="an_confirmar"> Confirmo a anulação desta obra
      </label>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="anularObra('${js(id)}')">Anular Obra</button>`);
  }

  function anularObra(id) {
    const anterior = DB.getObra(id);
    if (!anterior || anterior.estado === 'anulada') return;
    const motivo = (document.getElementById('an_motivo')?.value || '').trim();
    const observacoes = (document.getElementById('an_observacoes')?.value || '').trim();
    if (!motivo) return avisar('Indique o motivo da anulação.', 'error');
    if (!document.getElementById('an_confirmar')?.checked) return avisar('Confirme explicitamente a anulação.', 'error');
    const data = new Date().toISOString();
    const atualizada = DB.actualizarObra(id, {
      estado: 'anulada', anulada_em: data, motivo_anulacao: motivo, observacoes_anulacao: observacoes
    });
    registarHistorico(anterior.veiculo_id, 'anulacao_obra', resumoObraHistorico(anterior),
      resumoObraHistorico(atualizada), motivo, observacoes, data);
    fecharModal();
    avisar('Obra anulada e preservada no histórico.', 'warning');
    setTimeout(() => refreshObras(id), 200);
  }

  function detalheTexto(rotulo, valor) {
    if (!valor) return '';
    return `<div class="form-group"><div class="detail-label">${h(rotulo)}</div><div class="text-block">${h(valor).replace(/\n/g, '<br>')}</div></div>`;
  }

  function renderObraDetalheV4(id) {
    const obra = DB.getObra(id);
    if (!obra) {
      document.getElementById('pageContainer').innerHTML = '<p style="color:var(--danger);padding:40px">Obra não encontrada.</p>';
      return;
    }
    const v = veiculoDaObra(obra);
    const locais = opcoesLocais();
    const pontos = opcoesPontos();
    const idJs = js(id);
    document.getElementById('topbarActions').innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="ir('obras')">${ico('back')} Voltar</button>
      <button class="btn btn-outline btn-sm" onclick="imprimirObra('${idJs}')">${ico('print')} Imprimir</button>
      ${obra.estado === 'aberta' ? `
        <button class="btn btn-warning btn-sm" onclick="modalActualizar('${idJs}')">${ico('edit')} Atualizar</button>
        <button class="btn btn-success btn-sm" onclick="modalFechar('${idJs}')">${ico('check')} Fechar Obra</button>` : ''}
      ${obra.estado !== 'anulada' ? `<button class="btn btn-danger btn-sm" onclick="modalAnularObra('${idJs}')">Anular</button>` : ''}`;
    const tiposDetalhe = [
      obra.intervencao_outro_descricao ? `Outro: ${obra.intervencao_outro_descricao}` : '',
      obra.pneus_tipo ? `Pneus: ${obra.pneus_tipo}${obra.pneus_outro_descricao ? ' — ' + obra.pneus_outro_descricao : ''}` : ''
    ].filter(Boolean).join('\n');
    const total = totalObra(obra);
    document.getElementById('pageContainer').innerHTML = `
      <div style="max-width:900px;margin:0 auto">
        <div class="card" style="margin-bottom:16px">
          <div style="padding:20px;background:linear-gradient(135deg,var(--primary-dark),var(--primary));border-radius:var(--radius) var(--radius) 0 0;color:#fff">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
              <div><div style="font-size:22px;font-weight:800">${h(numeroObra(obra))}</div><div style="opacity:.85">${h(identificacaoBem(obra, v))}</div></div>
              ${badgeEstadoObra(obra.estado)}
            </div>
          </div>
          <div class="card-body">
            <div class="obra-detail-grid">
              <div><div class="detail-label">N.º de património</div><div class="detail-value">${h(obra.patrimonio || v?.patrimonio || '—')}</div></div>
              <div><div class="detail-label">Matrícula</div><div class="detail-value">${h(matriculaApresentacao(obra.matricula || v?.matricula))}</div></div>
              <div><div class="detail-label">Setor</div><div class="detail-value">${h(obra.setor_snapshot || '—')}</div></div>
              <div><div class="detail-label">Local de execução</div><div class="detail-value">${h(labelOpcao(locais, obra.local_execucao, '—'))}</div></div>
              <div><div class="detail-label">Entrada</div><div class="detail-value">${h(dataHora(obra.data_entrada))}</div></div>
              <div><div class="detail-label">Saída</div><div class="detail-value">${h(dataHora(obra.data_saida))}</div></div>
              <div><div class="detail-label">Imobilização</div><div class="detail-value">${h(duracao(obra.data_entrada, obra.data_saida))}</div></div>
              <div><div class="detail-label">Ponto de situação</div><div class="detail-value">${h(labelOpcao(pontos, obra.ponto_situacao, '—'))}</div></div>
            </div>
            <div class="form-group"><div class="detail-label">Intervenções</div><div style="margin-top:6px">${badgeTiposLocal(obra.tipos_intervencao)}</div></div>
            ${tiposDetalhe ? detalheTexto('Detalhe das intervenções', tiposDetalhe) : ''}
            ${obra.ponto_situacao_observacao ? detalheTexto('Observação do ponto de situação', obra.ponto_situacao_observacao) : ''}
            ${detalheTexto('Descrição da avaria ou intervenção', obra.descricao_avaria || 'Sem descrição')}
            ${detalheTexto('Trabalhos realizados', obra.trabalhos_realizados)}
            ${detalheTexto('Peças e materiais', obra.pecas_materiais)}
            ${detalheTexto('Serviços externos', obra.servicos_externos)}
            ${detalheTexto('Observações', obra.observacoes)}
            ${obra.estado === 'anulada' ? detalheTexto('Motivo da anulação', obra.motivo_anulacao) + detalheTexto('Observações da anulação', obra.observacoes_anulacao) : ''}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">${ico('euro', 15)} Custos internos</span></div>
          <div class="card-body">
            <div class="custo-row"><span>Materiais</span><strong>${euro(obra.custo_materiais)}</strong></div>
            <div class="custo-row"><span>Mão de obra</span><strong>${euro(obra.custo_mao_obra)}</strong></div>
            <div class="custo-row"><span>Serviços externos</span><strong>${euro(obra.custo_servicos_externos)}</strong></div>
            <div class="custo-row"><span>Peças</span><strong>${euro(obra.custo_pecas)}</strong></div>
            <div class="custo-row"><span>Outros custos</span><strong>${euro(obra.custo_outros)}</strong></div>
            <div class="custo-row total"><span>TOTAL</span><strong>${euro(total)}</strong></div>
          </div>
        </div>
      </div>`;
    if (obra.estado === 'aberta' && typeof global.iniciarTimersImob === 'function') global.iniciarTimersImob();
  }

  function textoSemMontantes(valor) {
    return texto(valor).split(/\r?\n/).map(linha => linha
      .replace(/\s*(?:[—–-]\s*)?(?:€\s*)?\d+(?:[.\s]\d{3})*(?:[,.]\d{1,2})?\s*(?:€|EUR\b|euros?\b)/gi, '')
      .replace(/\s*(?:[—–-]\s*)?(?:€|EUR)\s*\d+(?:[.\s]\d{3})*(?:[,.]\d{1,2})?/gi, '')
      .replace(/\b(?:custo|preço|valor)(?:\s+total)?\s*[:=-]?\s*\d+(?:[.\s]\d{3})*(?:[,.]\d{1,2})?/gi, '')
      .replace(/[ \t]{2,}/g, ' ').replace(/\s*[—–-]\s*$/, '').trim()
    ).filter(Boolean).join('\n');
  }

  function imprimirObraV4(id) {
    const obra = DB.getObra(id);
    if (!obra) return;
    const v = veiculoDaObra(obra);
    const limpo = valor => h(textoSemMontantes(valor) || 'Não preenchido');
    const local = labelOpcao(opcoesLocais(), obra.local_execucao, '—');
    const ponto = labelOpcao(opcoesPontos(), obra.ponto_situacao, '—');
    const detalheIntervencao = [
      texto(obra.intervencao_outro_descricao),
      obra.pneus_tipo ? `Pneus: ${obra.pneus_tipo}${obra.pneus_outro_descricao ? ' — ' + obra.pneus_outro_descricao : ''}` : ''
    ].filter(Boolean).join('\n');
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <style>
        @page{size:A4;margin:18mm 16mm}*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif}
        body{font-size:11pt;color:#111}.ph{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #1a4d8f;margin-bottom:18px}
        .logo{width:52px;height:52px;background:#1a4d8f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border-radius:4px}
        .org h1{font-size:13pt;color:#1a4d8f}.org p{font-size:9pt;color:#666;margin-top:2px}.doc-right{text-align:right}.doc-right h2{font-size:15pt;color:#1a4d8f}
        .num{font-size:12pt;margin-top:3px}.estado{display:inline-block;padding:3px 12px;border-radius:10px;font-size:9pt;font-weight:700;margin-top:5px;background:#e2e8f0}
        .ig{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.ii{border:1px solid #ddd;border-radius:4px;padding:10px}
        .il{font-size:8pt;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}.iv{font-size:10pt;font-weight:700;color:#1a4d8f}
        .sec{margin-bottom:14px}.st{font-size:9pt;font-weight:800;text-transform:uppercase;color:#1a4d8f;border-bottom:1.5px solid #1a4d8f;padding-bottom:4px;margin-bottom:8px}
        .sb{padding:10px;border:1px solid #e0e0e0;border-radius:4px;font-size:10pt;line-height:1.6;min-height:42px;background:#fafafa;white-space:pre-wrap}
        .assin{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px}.ab{border-top:1.5px solid #333;padding-top:6px;text-align:center;font-size:9pt;color:#555}
        .footer{margin-top:20px;border-top:1px solid #ccc;padding-top:8px;display:flex;justify-content:space-between;font-size:8pt;color:#888}
      </style>
      <div class="ph"><div style="display:flex;align-items:center;gap:12px"><div class="logo">CM</div>
        <div class="org"><h1>Câmara Municipal</h1><p>Serviço de Gestão de Frota e Manutenção</p><p>Gestão de Obras de Manutenção</p></div></div>
        <div class="doc-right"><h2>Ordem de Trabalho</h2><div class="num">${h(numeroObra(obra))}</div><div class="estado">${h(estadoObraLabel(obra.estado).toUpperCase())}</div></div>
      </div>
      <div class="ig">
        <div class="ii"><div class="il">N.º de património</div><div class="iv">${h(obra.patrimonio || v?.patrimonio || '—')}</div></div>
        <div class="ii"><div class="il">Matrícula</div><div class="iv">${h(matriculaApresentacao(obra.matricula || v?.matricula))}</div></div>
        <div class="ii"><div class="il">Setor</div><div class="iv">${h(obra.setor_snapshot || '—')}</div></div>
        <div class="ii"><div class="il">Entrada</div><div class="iv">${h(dataHora(obra.data_entrada))}</div></div>
        <div class="ii"><div class="il">Saída</div><div class="iv">${h(dataHora(obra.data_saida))}</div></div>
        <div class="ii"><div class="il">Local</div><div class="iv">${h(local)}</div></div>
      </div>
      <div class="sec"><div class="st">Intervenções</div><div class="sb">${limpo(tiposArrayLocal(obra.tipos_intervencao).join(', '))}</div></div>
      ${detalheIntervencao ? `<div class="sec"><div class="st">Detalhe das intervenções</div><div class="sb">${limpo(detalheIntervencao)}</div></div>` : ''}
      <div class="sec"><div class="st">Ponto de situação</div><div class="sb">${limpo(`${ponto}${obra.ponto_situacao_observacao ? ' — ' + obra.ponto_situacao_observacao : ''}`)}</div></div>
      <div class="sec"><div class="st">Descrição da avaria ou intervenção</div><div class="sb">${limpo(obra.descricao_avaria)}</div></div>
      <div class="sec"><div class="st">Trabalhos realizados</div><div class="sb">${limpo(obra.trabalhos_realizados)}</div></div>
      <div class="sec"><div class="st">Peças e materiais</div><div class="sb">${limpo(obra.pecas_materiais)}</div></div>
      <div class="sec"><div class="st">Serviços externos</div><div class="sb">${limpo(obra.servicos_externos)}</div></div>
      ${obra.observacoes ? `<div class="sec"><div class="st">Observações</div><div class="sb">${limpo(obra.observacoes)}</div></div>` : ''}
      <div class="assin"><div class="ab">Responsável pela intervenção</div><div class="ab">Chefe de serviço / responsável</div></div>
      <div class="footer"><span>Impresso em ${h(new Date().toLocaleString('pt-PT'))}</span><span>GOM · Câmara Municipal</span><span>Documento interno</span></div>`;
    printArea.style.display = 'block';
    global.print();
    setTimeout(() => { printArea.style.display = 'none'; printArea.innerHTML = ''; }, 1500);
  }

  function obrasParaRequisicao(requisicao) {
    return DB.getObras().filter(obra => obra.estado !== 'anulada' || obra.id === requisicao?.obra_id).sort((a, b) => {
      const rankA = a.estado === 'aberta' ? 0 : 1;
      const rankB = b.estado === 'aberta' ? 0 : 1;
      return rankA - rankB || new Date(b.data_entrada || 0) - new Date(a.data_entrada || 0);
    });
  }

  function textoOpcaoObra(obra) {
    const v = veiculoDaObra(obra);
    return `${obra.estado === 'aberta' ? '[Aberta] ' : ''}${numeroObra(obra)} — ${identificacaoBem(obra, v)} — Pat. ${obra.patrimonio || v?.patrimonio || '—'} — Mat. ${matriculaApresentacao(obra.matricula || v?.matricula)} — ${dataCurta(obra.data_entrada)}`;
  }

  function pesquisaObraReq(obra) {
    const v = veiculoDaObra(obra);
    return normalizar([
      numeroObra(obra), obra.numero_obra, obra.numero_obra_original,
      obra.patrimonio, v?.patrimonio, obra.matricula, v?.matricula
    ].filter(Boolean).join(' '));
  }

  function opcoesObrasReq(lista, selecionada) {
    return `<option value="">— Opcional —</option>${lista.map(obra =>
      `<option value="${h(obra.id)}" ${obra.id === selecionada ? 'selected' : ''}>${h(textoOpcaoObra(obra))}</option>`
    ).join('')}`;
  }

  function htmlFormReqV4(requisicao) {
    const veiculos = DB.getVeiculos().sort((a, b) => texto(a.patrimonio).localeCompare(texto(b.patrimonio), 'pt'));
    const obras = obrasParaRequisicao(requisicao);
    global._reqObrasOrdenadas = obras;
    return `<form onsubmit="return false">
      <div class="form-group"><label class="form-label">Pesquisar obra</label>
        <input class="form-control" id="req_obra_pesquisa" placeholder="Número da obra, património ou matrícula" oninput="filtrarObrasRequisicao()">
      </div>
      <div class="form-group"><label class="form-label">Obra associada</label>
        <select class="form-control" id="req_obra" onchange="sincronizarReqComObra()">
          ${opcoesObrasReq(obras, requisicao?.obra_id || '')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Viatura ou máquina</label>
        <select class="form-control" id="req_veiculo">
          <option value="">— Opcional quando não existe obra —</option>
          ${veiculos.map(v => `<option value="${h(v.id)}" ${requisicao?.veiculo_id === v.id ? 'selected' : ''}>${h(v.patrimonio || 'Sem património')} — ${h(matriculaApresentacao(v.matricula))} — ${h([v.marca, v.modelo].filter(Boolean).join(' '))}</option>`).join('')}
        </select>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Tipo *</label>
          <select class="form-control" id="req_tipo">
            <option value="material" ${!requisicao || requisicao.tipo === 'material' ? 'selected' : ''}>Material</option>
            <option value="servico" ${requisicao?.tipo === 'servico' ? 'selected' : ''}>Serviço externo</option>
            <option value="outro" ${requisicao?.tipo === 'outro' ? 'selected' : ''}>Outro</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Estado</label>
          <select class="form-control" id="req_estado">
            <option value="pendente" ${!requisicao || requisicao.estado === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="aprovada" ${requisicao?.estado === 'aprovada' ? 'selected' : ''}>Aprovada</option>
            <option value="rejeitada" ${requisicao?.estado === 'rejeitada' ? 'selected' : ''}>Rejeitada</option>
            <option value="concluida" ${requisicao?.estado === 'concluida' ? 'selected' : ''}>Concluída</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Descrição *</label>
        <textarea class="form-control" id="req_desc" rows="2">${h(requisicao?.descricao || '')}</textarea>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Valor (€)</label>
          <input type="number" min="0" step="0.01" class="form-control" id="req_valor" value="${Number(requisicao?.valor) || 0}">
        </div>
        <div class="form-group"><label class="form-label">Data</label>
          <input type="date" class="form-control" id="req_data" value="${h(requisicao?.data || new Date().toISOString().slice(0, 10))}">
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group"><label class="form-label">Fornecedor</label>
          <input class="form-control" id="req_fornecedor" value="${h(requisicao?.fornecedor || '')}">
        </div>
        <div class="form-group"><label class="form-label">Observações</label>
          <input class="form-control" id="req_obs" value="${h(requisicao?.observacoes || '')}">
        </div>
      </div>
      ${requisicao ? `
        <div class="section-divider"></div>
        <div class="form-group"><label class="form-label">Motivo da alteração *</label>
          <input class="form-control" id="req_motivo">
        </div>
        <div class="form-group"><label class="form-label">Observações da alteração</label>
          <textarea class="form-control" id="req_motivo_obs" rows="2"></textarea>
        </div>` : ''}
    </form>`;
  }

  function filtrarObrasRequisicao() {
    const q = normalizar(document.getElementById('req_obra_pesquisa')?.value || '');
    const select = document.getElementById('req_obra');
    if (!select) return;
    const selecionada = select.value;
    const lista = (global._reqObrasOrdenadas || []).filter(obra => !q || pesquisaObraReq(obra).includes(q) || obra.id === selecionada);
    select.innerHTML = opcoesObrasReq(lista, selecionada);
  }

  function sincronizarReqComObra() {
    const obraId = document.getElementById('req_obra')?.value || '';
    const veiculoSelect = document.getElementById('req_veiculo');
    if (!veiculoSelect) return;
    if (!obraId) {
      veiculoSelect.disabled = false;
      return;
    }
    const obra = DB.getObra(obraId);
    if (obra?.veiculo_id) veiculoSelect.value = obra.veiculo_id;
    veiculoSelect.disabled = true;
  }

  function badgeReqV4(estado) {
    if (estado === 'anulada') return '<span class="badge badge-gray">Anulada</span>';
    return typeof global.badgeReqEstado === 'function' ? global.badgeReqEstado(estado) : `<span class="badge badge-gray">${h(estado)}</span>`;
  }

  function rowsReqsV4(lista) {
    if (!Array.isArray(lista) || !lista.length) return '<tr><td colspan="11" class="table-empty">Nenhuma requisição encontrada.</td></tr>';
    return lista.map(req => {
      const obra = req.obra_id ? DB.getObra(req.obra_id) : null;
      const v = req.veiculo_id ? DB.getVeiculo(req.veiculo_id) : veiculoDaObra(obra);
      const id = js(req.id);
      return `<tr>
        <td><strong>${h(req.numero_req)}</strong></td>
        <td>${obra ? `<a href="#" class="link-obra" onclick="event.preventDefault();ir('obra-detalhe',{id:'${js(obra.id)}'})">${h(numeroObra(obra))}</a>` : '—'}</td>
        <td>${h(identificacaoBem(obra || {}, v))}</td>
        <td>${h(req.patrimonio || obra?.patrimonio || v?.patrimonio || '—')}</td>
        <td>${h(matriculaApresentacao(req.matricula || obra?.matricula || v?.matricula))}</td>
        <td>${h(req.tipo === 'material' ? 'Material' : req.tipo === 'servico' ? 'Serviço externo' : 'Outro')}</td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${h(req.descricao)}">${h(req.descricao)}</td>
        <td><strong>${euro(req.valor)}</strong></td><td>${h(dataCurta(req.data))}</td><td>${badgeReqV4(req.estado)}</td>
        <td><div style="display:flex;gap:3px">
          ${req.estado !== 'anulada' ? `
            <button class="btn btn-sm btn-outline btn-icon" title="Editar" onclick="modalEditarReq('${id}')">${ico('edit', 13)}</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Anular" onclick="modalAnularReq('${id}')">${ico('x', 13)}</button>` : ''}
        </div></td>
      </tr>`;
    }).join('');
  }

  function renderFaturacaoV4(tab) {
    tab = tab || 'requisicoes';
    const reqs = [...DB.getReqs()].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
    const faturas = DB.getFaturas();
    document.getElementById('topbarActions').innerHTML = `
      <button class="btn btn-primary" id="btnNovaFaturacao" onclick="${tab === 'faturas' ? 'modalNovaFatura()' : 'modalNovaReq()'}">${ico('plus')} ${tab === 'faturas' ? 'Nova Fatura' : 'Nova Requisição'}</button>`;
    const linhasFaturas = typeof global.rowsFaturas === 'function' ? global.rowsFaturas(faturas) : '';
    document.getElementById('pageContainer').innerHTML = `
      <div class="page-header"><div><h2>Faturação / Requisições</h2></div></div>
      <div class="tab-bar" id="fatTabs">
        <button class="tab-btn ${tab === 'requisicoes' ? 'active' : ''}" onclick="switchFatTab(this,'requisicoes')">Requisições (${reqs.length})</button>
        <button class="tab-btn ${tab === 'faturas' ? 'active' : ''}" onclick="switchFatTab(this,'faturas')">Faturas (${faturas.length})</button>
      </div>
      <div id="fatTabRequisicoes" style="display:${tab === 'requisicoes' ? 'block' : 'none'}">
        <div class="filter-bar"><input class="form-control" placeholder="Pesquisar requisição, obra, património ou matrícula…" id="searchReq" oninput="filtrarReqs()">
          <select class="form-control" id="filtroReqEstado" onchange="filtrarReqs()">
            <option value="">Todos os estados</option><option value="pendente">Pendente</option><option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option><option value="concluida">Concluída</option><option value="anulada">Anulada</option>
          </select>
        </div>
        <div class="card"><div class="table-wrapper"><table>
          <thead><tr><th>N.º Req.</th><th>Obra</th><th>Bem</th><th>Património</th><th>Matrícula</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Data</th><th>Estado</th><th>Ações</th></tr></thead>
          <tbody id="reqsBody">${rowsReqsV4(reqs)}</tbody>
        </table></div></div>
      </div>
      <div id="fatTabFaturas" style="display:${tab === 'faturas' ? 'block' : 'none'}">
        <div class="filter-bar"><input class="form-control" placeholder="Pesquisar…" id="searchFat" oninput="filtrarFaturas()">
          <select class="form-control" id="filtroFatEstado" onchange="filtrarFaturas()"><option value="">Todos os estados</option><option>pendente</option><option>paga</option><option>anulada</option></select>
        </div>
        <div class="card"><div class="table-wrapper"><table>
          <thead><tr><th>N.º Fatura</th><th>N.º Ext.</th><th>Matrícula</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Estado</th><th>Ações</th></tr></thead>
          <tbody id="faturasBody">${linhasFaturas}</tbody>
        </table></div></div>
      </div>`;
    global._reqs = reqs;
    global._faturas = faturas;
  }

  function filtrarReqsV4() {
    const q = normalizar(document.getElementById('searchReq')?.value || '');
    const estado = document.getElementById('filtroReqEstado')?.value || '';
    const lista = (global._reqs || []).filter(req => {
      const obra = req.obra_id ? DB.getObra(req.obra_id) : null;
      const v = req.veiculo_id ? DB.getVeiculo(req.veiculo_id) : veiculoDaObra(obra);
      const pesquisa = normalizar([
        req.numero_req, req.descricao, req.fornecedor, req.matricula, req.patrimonio,
        obra ? numeroObra(obra) : '', obra?.numero_obra, obra?.patrimonio, obra?.matricula,
        v?.patrimonio, v?.matricula
      ].filter(Boolean).join(' '));
      return (!q || pesquisa.includes(q)) && (!estado || req.estado === estado);
    });
    const corpo = document.getElementById('reqsBody');
    if (corpo) corpo.innerHTML = rowsReqsV4(lista);
  }

  function modalNovaReqV4() {
    abrirModal('Nova Requisição', htmlFormReqV4(null),
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="criarReq()">${ico('save')} Criar</button>`, true);
    sincronizarReqComObra();
  }

  function modalEditarReqV4(id) {
    const req = DB.getReq(id);
    if (!req || req.estado === 'anulada') return;
    abrirModal(`Editar ${h(req.numero_req)}`, htmlFormReqV4(req),
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="guardarReq('${js(id)}')">${ico('save')} Guardar</button>`, true);
    sincronizarReqComObra();
  }

  function lerFormReqV4() {
    const obraId = document.getElementById('req_obra')?.value || null;
    const obra = obraId ? DB.getObra(obraId) : null;
    const veiculoId = obra?.veiculo_id || document.getElementById('req_veiculo')?.value || null;
    const veiculo = veiculoId ? DB.getVeiculo(veiculoId) : null;
    return {
      veiculo_id: veiculoId,
      matricula: obra?.matricula || veiculo?.matricula || null,
      patrimonio: obra?.patrimonio || veiculo?.patrimonio || null,
      obra_id: obraId,
      tipo: document.getElementById('req_tipo')?.value || 'material',
      estado: document.getElementById('req_estado')?.value || 'pendente',
      descricao: (document.getElementById('req_desc')?.value || '').trim(),
      valor: Number(document.getElementById('req_valor')?.value || 0),
      data: document.getElementById('req_data')?.value || '',
      fornecedor: document.getElementById('req_fornecedor')?.value || '',
      observacoes: document.getElementById('req_obs')?.value || ''
    };
  }

  function validarReq(dados) {
    if (!dados.descricao) return 'Preencha a descrição.';
    if (!Number.isFinite(dados.valor) || dados.valor < 0) return 'O valor tem de ser igual ou superior a zero.';
    if (dados.data && !dataValidaLocal(dados.data)) return 'Preencha uma data válida.';
    if (dados.obra_id && !DB.getObra(dados.obra_id)) return 'A obra selecionada já não existe.';
    return '';
  }

  function criarReqV4() {
    const dados = lerFormReqV4();
    const erro = validarReq(dados);
    if (erro) return avisar(erro, 'error');
    const numero = DB.proximoNumeroReq();
    const nova = DB.criarReq({numero_req: numero, ...dados});
    if (nova.veiculo_id) registarHistorico(nova.veiculo_id, 'criacao_requisicao', null,
      {numero_req: nova.numero_req, obra: nova.obra_id ? numeroObra(DB.getObra(nova.obra_id)) : '', estado: nova.estado},
      nova.descricao, nova.observacoes, nova.data);
    fecharModal();
    avisar(`Requisição ${numero} criada.`, 'success');
    renderFaturacaoV4('requisicoes');
  }

  function guardarReqV4(id) {
    const anterior = DB.getReq(id);
    if (!anterior || anterior.estado === 'anulada') return;
    const dados = lerFormReqV4();
    const erro = validarReq(dados);
    if (erro) return avisar(erro, 'error');
    const motivo = (document.getElementById('req_motivo')?.value || '').trim();
    const observacoes = (document.getElementById('req_motivo_obs')?.value || '').trim();
    if (!motivo) return avisar('Indique o motivo da alteração.', 'error');
    const atualizada = DB.actualizarReq(id, dados);
    const veiculoId = atualizada.veiculo_id || anterior.veiculo_id;
    if (veiculoId) registarHistorico(veiculoId, 'atualizacao_requisicao',
      {numero_req: anterior.numero_req, obra_id: anterior.obra_id, estado: anterior.estado, valor: anterior.valor},
      {numero_req: atualizada.numero_req, obra_id: atualizada.obra_id, estado: atualizada.estado, valor: atualizada.valor},
      motivo, observacoes, atualizada.data);
    fecharModal();
    avisar('Requisição atualizada.', 'success');
    renderFaturacaoV4('requisicoes');
  }

  function modalAnularReq(id) {
    const req = DB.getReq(id);
    if (!req || req.estado === 'anulada') return;
    abrirModal(`Anular ${h(req.numero_req)}`, `
      <div class="alert-box alert-box-warning">A requisição será mantida no histórico.</div>
      <div class="form-group"><label class="form-label">Motivo da anulação *</label>
        <textarea class="form-control" id="req_an_motivo" rows="2"></textarea>
      </div>
      <div class="form-group"><label class="form-label">Observações</label>
        <textarea class="form-control" id="req_an_obs" rows="2"></textarea>
      </div>
      <label class="checkbox-label"><input type="checkbox" id="req_an_confirmar"> Confirmo a anulação</label>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="anularReq('${js(id)}')">Anular Requisição</button>`);
  }

  function anularReq(id) {
    const anterior = DB.getReq(id);
    if (!anterior || anterior.estado === 'anulada') return;
    const motivo = (document.getElementById('req_an_motivo')?.value || '').trim();
    const observacoes = (document.getElementById('req_an_obs')?.value || '').trim();
    if (!motivo) return avisar('Indique o motivo da anulação.', 'error');
    if (!document.getElementById('req_an_confirmar')?.checked) return avisar('Confirme explicitamente a anulação.', 'error');
    const data = new Date().toISOString();
    const atualizada = DB.actualizarReq(id, {estado: 'anulada', anulada_em: data, motivo_anulacao: motivo, observacoes_anulacao: observacoes});
    if (anterior.veiculo_id) registarHistorico(anterior.veiculo_id, 'anulacao_requisicao',
      {numero_req: anterior.numero_req, estado: anterior.estado}, {numero_req: atualizada.numero_req, estado: 'anulada'},
      motivo, observacoes, data);
    fecharModal();
    avisar('Requisição anulada e preservada.', 'warning');
    renderFaturacaoV4('requisicoes');
  }

  Object.assign(global, {
    recalcularTotalObraForm,
    atualizarCamposIntervencao,
    renderObras: renderObrasV4,
    rowsObras: rowsObrasV4,
    filtrarObras: filtrarObrasV4,
    modalCriarObra: modalCriarObraV4,
    criarObra: criarObraV4,
    modalCriarObraVeiculo: modalCriarObraVeiculoV4,
    modalActualizar: modalActualizarV4,
    actualizarObra: actualizarObraV4,
    modalFechar: modalFecharV4,
    fecharObra: fecharObraV4,
    modalAnularObra,
    anularObra,
    eliminarObra: modalAnularObra,
    renderObraDetalhe: renderObraDetalheV4,
    imprimirObra: imprimirObraV4,
    renderFaturacao: renderFaturacaoV4,
    rowsReqs: rowsReqsV4,
    filtrarReqs: filtrarReqsV4,
    _htmlFormReq: htmlFormReqV4,
    filtrarObrasRequisicao,
    sincronizarReqComObra,
    modalNovaReq: modalNovaReqV4,
    modalEditarReq: modalEditarReqV4,
    _lerFormReq: lerFormReqV4,
    criarReq: criarReqV4,
    guardarReq: guardarReqV4,
    modalAnularReq,
    anularReq,
    eliminarReq: modalAnularReq
  });
})(window);
