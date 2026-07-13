/* ================================================================
   GOM v4 — RELATÓRIO OPERACIONAL SEMANAL
   Módulo aditivo. Deve ser carregado depois de gom-v4-data.js,
   gom-v4-fleet.js, gom-v4-works.js e dos scripts base.
   ================================================================ */
(function (window) {
  'use strict';

  const GOM = window.GOM = window.GOM || {};
  const API = GOM.reports = GOM.reports || {};
  const renderRelatoriosAnterior = window.renderRelatorios;
  const atualizarAcoesAnterior = window._atualizarRelTabActions;
  let ultimoRelatorio = null;

  const ESTADO_OP_LABEL = {
    operacional: 'Operacional',
    em_reparacao: 'Em reparação',
    reparacao: 'Em reparação',
    manutencao: 'Em reparação',
    inoperacional_standby: 'Inoperacional/Standby',
    inoperacional: 'Inoperacional/Standby',
    standby: 'Inoperacional/Standby',
    avaria: 'Em reparação'
  };

  const INTERVENCAO_LABEL = {
    revisao: 'Revisão',
    revisao_geral: 'Revisão',
    mudanca_oleo: 'Mudança de óleo',
    oleo: 'Mudança de óleo',
    lavagem: 'Lavagem',
    higienizacao: 'Higienização',
    pneus: 'Pneus',
    reparacao: 'Reparação',
    manutencao_preventiva: 'Manutenção preventiva',
    inspecao: 'Inspeção',
    carroçaria_pintura: 'Carroçaria/Pintura',
    carrocaria_pintura: 'Carroçaria/Pintura',
    outro: 'Outro'
  };

  const PNEUS_LABEL = {
    substituicao: 'Substituição',
    reparacao: 'Reparação',
    rotacao: 'Rotação',
    alinhamento_equilibragem: 'Alinhamento/equilibragem',
    outro: 'Outro'
  };

  const LOCAL_LABEL = {
    oficina_interna: 'Oficina interna',
    interna: 'Oficina interna',
    oficina_externa: 'Oficina externa',
    externa: 'Oficina externa',
    intervencao_mista: 'Intervenção mista',
    mista: 'Intervenção mista'
  };

  const PONTO_LABEL = {
    aguarda_pecas: 'Aguarda peças',
    aguarda_orcamento: 'Aguarda orçamento',
    aguarda_autorizacao: 'Aguarda autorização',
    aguarda_transporte: 'Aguarda transporte',
    oficina_interna: 'Em oficina interna',
    em_oficina_interna: 'Em oficina interna',
    oficina_externa: 'Em oficina externa',
    em_oficina_externa: 'Em oficina externa',
    intervencao_curso: 'Intervenção em curso',
    em_curso: 'Intervenção em curso',
    outro: 'Outro'
  };

  function lista(valor) {
    return Array.isArray(valor) ? valor : [];
  }

  function texto(valor, fallback) {
    if (valor === null || valor === undefined || valor === '') return fallback || '';
    return String(valor);
  }

  function chave(valor) {
    return texto(valor).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function esc(valor) {
    return texto(valor).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escLinhas(valor) {
    return esc(limparFinanceiro(valor)).replace(/\r?\n/g, '<br>');
  }

  /* O relatório operacional nunca projeta campos financeiros. Esta limpeza
     adicional impede que anotações monetárias inseridas em texto livre sejam
     transportadas para a pré-visualização ou para o PDF. */
  function limparFinanceiro(valor) {
    return texto(valor)
      .replace(/(?:€\s*)?\b\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?\s*(?:€|EUR|euros?)\b/gi, '[informação financeira omitida]')
      .replace(/\b(?:EUR|euros?)\s*\d+(?:[.,]\d{1,2})?\b/gi, '[informação financeira omitida]')
      .replace(/\b(?:custo|preço|valor)(?:\s+total)?\b\s*[:=\-–—]?\s*(?:€\s*)?\d+(?:[.,]\d{1,2})?\s*(?:€|EUR|euros?)?/gi, '[informação financeira omitida]');
  }

  function toast(mensagem, tipo) {
    if (typeof window.toastMsg === 'function') window.toastMsg(mensagem, tipo || '');
  }

  function chamarLista(alvos) {
    for (const alvo of alvos) {
      try {
        if (typeof alvo === 'function') {
          const valor = alvo();
          if (Array.isArray(valor)) return valor;
        }
      } catch (erro) {
        console.warn('[GOM Relatórios] Fonte de dados indisponível:', erro);
      }
    }
    return [];
  }

  function veiculosAtuais() {
    return chamarLista([
      () => GOM.getVeiculos && GOM.getVeiculos(),
      () => GOM.data && GOM.data.getVeiculos && GOM.data.getVeiculos(),
      () => typeof DB !== 'undefined' && DB.getVeiculos && DB.getVeiculos()
    ]).slice();
  }

  function obrasAtuais() {
    return chamarLista([
      () => GOM.getObras && GOM.getObras(),
      () => GOM.data && GOM.data.getObras && GOM.data.getObras(),
      () => typeof DB !== 'undefined' && DB.getObras && DB.getObras()
    ]).slice();
  }

  function periodosAtuais() {
    return chamarLista([
      () => GOM.getInoperacionalidades && GOM.getInoperacionalidades(),
      () => GOM.getPeriodosInoperacionalidade && GOM.getPeriodosInoperacionalidade(),
      () => GOM.data && GOM.data.getInoperacionalidades && GOM.data.getInoperacionalidades(),
      () => typeof DB !== 'undefined' && DB.getInoperacionalidades && DB.getInoperacionalidades(),
      () => typeof DB !== 'undefined' && DB.getPeriodosInoperacionalidade && DB.getPeriodosInoperacionalidade()
    ]).slice();
  }

  function setoresRegistados() {
    return chamarLista([
      () => GOM.getSetores && GOM.getSetores(),
      () => GOM.data && GOM.data.getSetores && GOM.data.getSetores(),
      () => typeof DB !== 'undefined' && DB.getSetores && DB.getSetores()
    ]).slice();
  }

  function normalizarSetor(bruto) {
    if (bruto && typeof bruto === 'object') {
      const id = texto(bruto.id || bruto.setor_id || bruto.codigo || bruto.sigla || bruto.nome || bruto.nome_completo);
      const sigla = texto(bruto.sigla || bruto.codigo || bruto.abreviatura || bruto.nome || bruto.nome_completo, id);
      const nome = texto(bruto.nome_completo || bruto.nome || bruto.designacao, sigla);
      return { id, key: chave(id || sigla || nome), sigla, nome };
    }
    const valor = texto(bruto).trim();
    return { id: valor, key: chave(valor), sigla: valor, nome: valor };
  }

  function referenciaSetorVeiculo(v) {
    if (v.setor && typeof v.setor === 'object') return normalizarSetor(v.setor);
    return normalizarSetor({
      id: v.setor_id || v.setorId || v.setor || v.setor_sigla,
      sigla: v.setor_sigla || v.sigla_setor || v.setor,
      nome: v.setor_nome || v.nome_setor || v.setor
    });
  }

  function todosSetores() {
    const mapa = new Map();
    function adicionar(bruto) {
      const setor = normalizarSetor(bruto);
      if (!setor.key) return;
      if (!mapa.has(setor.key)) mapa.set(setor.key, setor);
    }
    setoresRegistados().forEach(adicionar);
    veiculosAtuais().forEach(v => adicionar(referenciaSetorVeiculo(v)));
    return Array.from(mapa.values()).sort((a, b) => a.sigla.localeCompare(b.sigla, 'pt'));
  }

  function setorDoVeiculo(v, setores) {
    const ref = referenciaSetorVeiculo(v);
    const candidatos = [ref.id, ref.key, ref.sigla, ref.nome].map(chave).filter(Boolean);
    return setores.find(s => [s.id, s.key, s.sigla, s.nome].map(chave).some(k => candidatos.includes(k))) || ref;
  }

  function dataISO(data) {
    const d = data instanceof Date ? data : new Date(data);
    if (Number.isNaN(d.getTime())) return '';
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function dataUTC(data) {
    const m = texto(data).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
  }

  function formatarData(data) {
    const d = dataUTC(data);
    return d ? d.toLocaleDateString('pt-PT', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  }

  function formatarDataHora(data) {
    const d = data instanceof Date ? data : new Date(data);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function semanaISO(data) {
    const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
    const dia = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dia);
    const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numero = Math.ceil((((d - inicioAno) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(numero).padStart(2, '0')}`;
  }

  function limitesSemana(valor) {
    const m = texto(valor).match(/^(\d{4})-W(\d{2})$/);
    if (!m) return null;
    const ano = Number(m[1]);
    const semana = Number(m[2]);
    const quatroJan = new Date(Date.UTC(ano, 0, 4));
    const dia = quatroJan.getUTCDay() || 7;
    const segunda = new Date(quatroJan);
    segunda.setUTCDate(quatroJan.getUTCDate() - dia + 1 + (semana - 1) * 7);
    const domingo = new Date(segunda);
    domingo.setUTCDate(segunda.getUTCDate() + 6);
    const iso = d => d.toISOString().slice(0, 10);
    return { inicio: iso(segunda), fim: iso(domingo), numero: semana, ano };
  }

  function intervaloSemanaAtual() {
    return limitesSemana(semanaISO(new Date()));
  }

  function estadoAdministrativo(v) {
    const valor = chave(v.estado_administrativo || v.estado_admin || (v.ativo === false ? 'inativo_suspenso' : 'ativo'));
    return /inativo|suspenso/.test(valor) ? 'inativo_suspenso' : 'ativo';
  }

  function estadoOperacional(v) {
    const valor = chave(v.estado_operacional || v.estado_op || 'operacional');
    if (valor === 'operacional') return 'operacional';
    if (/repar|manutencao|avaria/.test(valor)) return 'em_reparacao';
    if (/inoperacional|standby/.test(valor)) return 'inoperacional_standby';
    return valor || 'operacional';
  }

  function matriculaAplicavel(v) {
    const valor = texto(v.matricula).trim();
    const codigo = chave(valor);
    return valor && !['n_a', 'na', 'nao_aplicavel', 'sem_matricula'].includes(codigo)
      && valor !== '—' && valor !== '-' ? valor : '—';
  }

  function categoriaVeiculo(v) {
    const principal = chave(v.tipo_principal || v.classe_principal || v.tipo);
    const principalLabel = principal === 'maquina' ? 'Máquina' : principal === 'viatura' ? 'Viatura' : texto(v.tipo_principal || v.tipo);
    return texto(v.categoria || v.tipo_categoria || principalLabel, '—');
  }

  function periodoPertence(periodo, v) {
    if (texto(periodo.veiculo_id || periodo.vehicle_id) === texto(v.id)) return true;
    if (periodo.patrimonio && v.patrimonio && texto(periodo.patrimonio) === texto(v.patrimonio)) return true;
    const matV = matriculaAplicavel(v);
    return matV !== '—' && periodo.matricula && texto(periodo.matricula) === matV;
  }

  function inicioPeriodo(p) {
    return texto(p && (p.data_inicio || p.inicio || p.data_inicio_inoperacionalidade)).slice(0, 10);
  }

  function fimPeriodo(p) {
    return texto(p && (p.data_fim || p.fim || p.data_fim_inoperacionalidade)).slice(0, 10);
  }

  function periodoAnulado(p) {
    return /anulad|cancelad/.test(chave(p && (p.estado_registo || p.situacao || p.status || p.estado)));
  }

  function periodosDoVeiculo(v, globais) {
    const unidos = globais.filter(p => periodoPertence(p, v));
    lista(v.periodos_inoperacionalidade || v.inoperacionalidades).forEach(p => {
      if (!unidos.some(x => x === p || (x.id && p.id && x.id === p.id))) unidos.push(p);
    });
    return unidos.filter(p => !periodoAnulado(p)).sort((a, b) => inicioPeriodo(b).localeCompare(inicioPeriodo(a)));
  }

  function periodoAtual(v, globais, hoje) {
    const periodos = periodosDoVeiculo(v, globais);
    return periodos.find(p => {
      const inicio = inicioPeriodo(p);
      const fim = fimPeriodo(p);
      const ciclo = chave(p.situacao || p.estado_atual_ciclo);
      return ciclo !== 'terminada' && ciclo !== 'terminado'
        && inicio && inicio <= hoje && (!fim || fim >= hoje);
    }) || null;
  }

  function ultimoPeriodo(v, globais) {
    return periodosDoVeiculo(v, globais)[0] || null;
  }

  function obraPertence(o, v) {
    if (texto(o.veiculo_id || o.vehicle_id) === texto(v.id)) return true;
    if (o.patrimonio && v.patrimonio && texto(o.patrimonio) === texto(v.patrimonio)) return true;
    const matV = matriculaAplicavel(v);
    return matV !== '—' && o.matricula && texto(o.matricula) === matV;
  }

  function obraAberta(o) {
    return chave(o.estado || o.status) === 'aberta';
  }

  function numeroObra(o) {
    if (typeof GOM.numeroObra === 'function') {
      try { return texto(GOM.numeroObra(o), texto(o.numero_obra, '—')); } catch (_) { /* fallback */ }
    }
    const bruto = texto(o.numero_obra || o.numero, '—');
    const legado = bruto.match(/^OBR-(\d{4})-(\d+)$/i);
    if (legado) return `${Number(legado[2])}/${legado[1]}`;
    if (o.numero && o.ano) return `${o.numero}/${o.ano}`;
    return bruto;
  }

  function labelCodigo(valor, mapa) {
    const bruto = texto(valor);
    return mapa[chave(bruto)] || bruto.replace(/_/g, ' ') || '—';
  }

  function intervencoesObra(o) {
    const itens = lista(o.tipos_intervencao || o.intervencoes).map(item => {
      if (item && typeof item === 'object') return texto(item.label || item.tipo || item.nome || item.descricao);
      return texto(item);
    }).filter(Boolean).map(item => labelCodigo(item, INTERVENCAO_LABEL));
    if (itens.some(i => chave(i) === 'pneus') && o.pneus_tipo) {
      let pneus = labelCodigo(o.pneus_tipo, PNEUS_LABEL);
      if (chave(o.pneus_tipo) === 'outro' && o.pneus_outro_descricao) pneus += ` — ${limparFinanceiro(o.pneus_outro_descricao)}`;
      itens[itens.findIndex(i => chave(i) === 'pneus')] = `Pneus: ${pneus}`;
    }
    if (itens.some(i => chave(i) === 'outro') && o.intervencao_outro_descricao) {
      itens[itens.findIndex(i => chave(i) === 'outro')] = `Outro: ${limparFinanceiro(o.intervencao_outro_descricao)}`;
    }
    return itens.length ? itens.join(', ') : '—';
  }

  function resumoObra(o) {
    const ponto = labelCodigo(o.ponto_situacao || o.situacao, PONTO_LABEL);
    return {
      id: o.id,
      numero: numeroObra(o),
      data: texto(o.data_entrada || o.data_abertura).slice(0, 10),
      intervencoes: intervencoesObra(o),
      local: labelCodigo(o.local_execucao || o.local_intervencao, LOCAL_LABEL),
      ponto,
      espera: /^aguarda/i.test(ponto) ? ponto : '—',
      observacoes: limparFinanceiro(o.ponto_situacao_observacao || o.observacao_ponto_situacao || o.observacoes || '')
    };
  }

  function obrasAbertasDoVeiculo(v, obras) {
    return obras.filter(o => obraAberta(o) && obraPertence(o, v))
      .sort((a, b) => texto(b.data_entrada || b.data_abertura).localeCompare(texto(a.data_entrada || a.data_abertura)))
      .map(resumoObra);
  }

  function diferencaDias(inicio, fim) {
    const a = dataUTC(inicio);
    const b = dataUTC(fim);
    if (!a || !b || b < a) return 0;
    return Math.floor((b - a) / 86400000) + 1;
  }

  function diasInoperacionalidade(v, periodo, hoje) {
    const inicio = inicioPeriodo(periodo) || texto(v.data_inicio_inoperacionalidade).slice(0, 10);
    const fim = fimPeriodo(periodo) || hoje;
    if (!inicio) return 0;
    if (typeof GOM.diasInoperacionalidade === 'function') {
      const tentativas = [
        () => GOM.diasInoperacionalidade(v.id, inicio, fim, periodo && periodo.id),
        () => GOM.diasInoperacionalidade(periodo || v, inicio, fim),
        () => GOM.diasInoperacionalidade(v, inicio, fim),
        () => GOM.diasInoperacionalidade(v.id, inicio, fim)
      ];
      for (const tentativa of tentativas) {
        try {
          const valor = tentativa();
          const numero = typeof valor === 'object' && valor ? Number(valor.dias) : Number(valor);
          if (Number.isFinite(numero) && numero >= 0) return Math.round(numero);
        } catch (_) { /* experimentar assinatura compatível seguinte */ }
      }
    }
    return diferencaDias(inicio, fim);
  }

  function numeroTaxa(valor) {
    if (valor && typeof valor === 'object') valor = valor.taxa ?? valor.percentagem ?? valor.valor;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }

  function taxaAtual(filtros, veiculosSelecionados) {
    const hoje = dataISO(new Date());
    if (typeof GOM.taxaInoperacionalidade === 'function') {
      const tentativas = [
        () => GOM.taxaInoperacionalidade(veiculosSelecionados, hoje, hoje),
        () => GOM.taxaInoperacionalidade(veiculosSelecionados.map(v => v.id), hoje, hoje),
        () => GOM.taxaInoperacionalidade()
      ];
      for (const tentativa of tentativas) {
        try {
          const n = numeroTaxa(tentativa());
          if (n !== null) return n;
        } catch (_) { /* assinatura seguinte */ }
      }
    }
    const ativos = veiculosSelecionados.filter(v => estadoAdministrativo(v) === 'ativo');
    const inoperacionais = ativos.filter(v => estadoOperacional(v) !== 'operacional');
    return ativos.length ? (inoperacionais.length / ativos.length) * 100 : 0;
  }

  function motivoInoperacional(v, periodo, obras) {
    const motivo = texto(periodo && (periodo.motivo || periodo.motivo_inoperacionalidade)
      || v.motivo_inoperacionalidade || v.motivo_estado_operacional || v.motivo_estado);
    if (motivo) return limparFinanceiro(motivo);
    if (obras.length && v && estadoOperacional(v) === 'em_reparacao') {
      return `Intervenção associada à obra ${obras[0].numero}`;
    }
    return estadoOperacional(v) === 'em_reparacao' ? 'Intervenção/reparação' : 'Indisponibilidade operacional';
  }

  function observacoesInoperacional(v, periodo) {
    return limparFinanceiro(texto(periodo && (periodo.observacoes || periodo.observacao)
      || v.observacoes_inoperacionalidade || v.observacao_estado_operacional));
  }

  function dataInicioInoperacional(v, periodo, obras) {
    return inicioPeriodo(periodo)
      || texto(v.data_inicio_inoperacionalidade).slice(0, 10)
      || (obras.length ? obras.map(o => o.data).filter(Boolean).sort()[0] : '');
  }

  function ordenarAtivos(a, b) {
    return texto(a.patrimonio).localeCompare(texto(b.patrimonio), 'pt', { numeric: true })
      || texto(a.matricula).localeCompare(texto(b.matricula), 'pt', { numeric: true });
  }

  function construirDados(filtros) {
    const veiculos = veiculosAtuais();
    const obras = obrasAtuais();
    const periodos = periodosAtuais();
    const setores = todosSetores();
    const hoje = dataISO(new Date());
    const selecionados = filtros.setores.map(bruto => {
      const normalizado = normalizarSetor(bruto);
      return setores.find(x => x.key === normalizado.key
        || chave(x.id) === chave(normalizado.id)
        || chave(x.sigla) === chave(normalizado.sigla)) || normalizado;
    }).filter(s => s.key);
    const keys = new Set(selecionados.map(s => s.key));
    const candidatos = veiculos.filter(v => keys.has(setorDoVeiculo(v, setores).key));
    const visiveis = candidatos.filter(v => filtros.incluirInativos || estadoAdministrativo(v) === 'ativo');

    const grupos = selecionados.map(setor => {
      const operacionais = [];
      const inoperacionais = [];
      visiveis.filter(v => setorDoVeiculo(v, setores).key === setor.key).forEach(v => {
        const admin = estadoAdministrativo(v);
        const estadoOp = estadoOperacional(v);
        const abertas = obrasAbertasDoVeiculo(v, obras);
        const atual = periodoAtual(v, periodos, hoje);
        const relevante = atual || (admin !== 'ativo' ? ultimoPeriodo(v, periodos) : null);
        const comum = {
          id: v.id,
          patrimonio: texto(v.patrimonio || v.numero_patrimonio, '—'),
          matricula: matriculaAplicavel(v),
          categoria: categoriaVeiculo(v),
          estado: admin !== 'ativo' ? 'Inativo/Suspenso — histórico' : (ESTADO_OP_LABEL[estadoOp] || texto(estadoOp, '—'))
        };
        const aguardaAbate = /abate/.test(chave(motivoInoperacional(v, relevante, abertas)));
        if (admin === 'ativo' && estadoOp === 'operacional' && !atual && !aguardaAbate) {
          operacionais.push(comum);
        } else {
          const inicio = dataInicioInoperacional(v, relevante, abertas);
          inoperacionais.push(Object.assign({}, comum, {
            motivo: admin !== 'ativo' && !relevante
              ? limparFinanceiro(v.motivo_inativacao || v.motivo_suspensao || 'Suspensão/inativação administrativa')
              : motivoInoperacional(v, relevante, abertas),
            inicio,
            dias: inicio ? diasInoperacionalidade(v, relevante || { data_inicio: inicio }, hoje) : 0,
            observacoes: observacoesInoperacional(v, relevante),
            obras: abertas
          }));
        }
      });
      operacionais.sort(ordenarAtivos);
      inoperacionais.sort(ordenarAtivos);
      return { setor, operacionais, inoperacionais };
    });

    return {
      emitidoEm: new Date().toISOString(),
      periodo: filtros.periodo,
      inicio: filtros.inicio,
      fim: filtros.fim,
      observacao: limparFinanceiro(filtros.observacao),
      incluirInativos: filtros.incluirInativos,
      siglas: selecionados.map(s => s.sigla),
      taxa: taxaAtual(filtros, candidatos),
      grupos
    };
  }

  function htmlTabelaOperacionais(linhas, imprimir) {
    const vazio = imprimir ? '<tr><td colspan="4" class="empty">Sem registos.</td></tr>'
      : '<tr><td colspan="4" class="table-empty">Sem registos.</td></tr>';
    return `<div class="table-wrapper"><table class="${imprimir ? 'print-table' : 'rel-table-inst'}">
      <thead><tr><th>N.º património</th><th>Matrícula</th><th>Categoria/tipo</th><th>Estado operacional</th></tr></thead>
      <tbody>${linhas.length ? linhas.map(v => `<tr>
        <td><strong>${esc(v.patrimonio)}</strong></td><td>${esc(v.matricula)}</td>
        <td>${esc(v.categoria)}</td><td>${esc(v.estado)}</td></tr>`).join('') : vazio}</tbody>
    </table></div>`;
  }

  function htmlObrasAbertas(obras, imprimir) {
    if (!obras.length) return `<div class="${imprimir ? 'work-empty' : 'alert-box alert-box-info'}" style="margin:8px 0 0">Sem obra aberta associada.</div>`;
    return `<div class="table-wrapper" style="margin-top:8px"><table class="${imprimir ? 'work-table' : 'rel-table-inst'}">
      <thead><tr><th>N.º obra</th><th>Intervenções</th><th>Local</th><th>Ponto de situação</th><th>Espera</th><th>Observações</th></tr></thead>
      <tbody>${obras.map(o => `<tr>
        <td><strong>${esc(o.numero)}</strong>${o.data ? `<div class="muted">${esc(formatarData(o.data))}</div>` : ''}</td>
        <td>${esc(o.intervencoes)}</td><td>${esc(o.local)}</td><td>${esc(o.ponto)}</td>
        <td>${esc(o.espera)}</td><td>${escLinhas(o.observacoes) || '—'}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }

  function htmlInoperacional(v, imprimir) {
    return `<article class="${imprimir ? 'asset-card' : 'card'}" style="margin:0 0 10px;break-inside:avoid">
      <div style="${imprimir ? '' : 'padding:14px 16px'}">
        <div class="asset-grid" style="display:grid;grid-template-columns:${imprimir ? 'repeat(6,minmax(0,1fr))' : 'repeat(auto-fit,minmax(150px,1fr))'};gap:8px">
          <div><span class="k">N.º património</span><strong>${esc(v.patrimonio)}</strong></div>
          <div><span class="k">Matrícula</span><strong>${esc(v.matricula)}</strong></div>
          <div><span class="k">Categoria/tipo</span><strong>${esc(v.categoria)}</strong></div>
          <div><span class="k">Estado</span><strong>${esc(v.estado)}</strong></div>
          <div><span class="k">Início</span><strong>${esc(formatarData(v.inicio))}</strong></div>
          <div><span class="k">Dias inoperacional</span><strong>${Number(v.dias) || 0}</strong></div>
        </div>
        <div style="margin-top:8px"><span class="k">Motivo</span><strong>${esc(limparFinanceiro(v.motivo))}</strong></div>
        ${v.observacoes ? `<div style="margin-top:6px"><span class="k">Observações atualizadas</span><div>${escLinhas(v.observacoes)}</div></div>` : ''}
        <div style="margin-top:8px"><span class="k">Obras abertas (${v.obras.length})</span>${htmlObrasAbertas(v.obras, imprimir)}</div>
      </div>
    </article>`;
  }

  function htmlGrupo(grupo, imprimir) {
    return `<section class="sector-block">
      <h2>${esc(grupo.setor.sigla)}</h2>
      <h3>A. Operacionais (${grupo.operacionais.length})</h3>
      ${htmlTabelaOperacionais(grupo.operacionais, imprimir)}
      <h3>B. Inoperacionais ou em reparação (${grupo.inoperacionais.length})</h3>
      ${grupo.inoperacionais.length ? grupo.inoperacionais.map(v => htmlInoperacional(v, imprimir)).join('')
        : `<div class="${imprimir ? 'empty-box' : 'card'}" style="padding:14px;color:#64748b">Sem registos.</div>`}
    </section>`;
  }

  function htmlResumo(relatorio, imprimir) {
    const op = relatorio.grupos.reduce((n, g) => n + g.operacionais.length, 0);
    const ino = relatorio.grupos.reduce((n, g) => n + g.inoperacionais.length, 0);
    const estilo = imprimir ? '' : 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:16px';
    return `<div class="report-meta" style="${estilo}">
      <div><span class="k">Emissão</span><strong>${esc(formatarDataHora(relatorio.emitidoEm))}</strong></div>
      <div><span class="k">Semana/período</span><strong>${esc(relatorio.periodo)}</strong></div>
      <div><span class="k">Setores</span><strong>${esc(relatorio.siglas.join(', '))}</strong></div>
      <div><span class="k">Taxa atual de inoperacionalidade</span><strong>${relatorio.taxa.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}%</strong></div>
      <div><span class="k">Operacionais</span><strong>${op}</strong></div>
      <div><span class="k">Inoperacionais/em reparação</span><strong>${ino}</strong></div>
    </div>
    ${relatorio.observacao ? `<div class="general-note"><span class="k">Observação geral</span><div>${escLinhas(relatorio.observacao)}</div></div>` : ''}`;
  }

  function htmlPreview(relatorio) {
    return `<div class="card" style="margin-top:16px">
      <div class="card-header"><span class="card-title">Relatório operacional semanal</span>
        <span style="font-size:12px;color:var(--text-medium)">Dados atualizados na geração</span></div>
      <div class="card-body">
        ${htmlResumo(relatorio, false)}
        ${relatorio.grupos.map(g => htmlGrupo(g, false)).join('')}
      </div></div>`;
  }

  function htmlImpressao(relatorio) {
    return `<style>
      @page{size:A4 landscape;margin:10mm}
      .print-report,.print-report *{box-sizing:border-box}.print-report{width:100%;font-family:Arial,Helvetica,sans-serif;color:#172033;font-size:9pt}.print-header{border-bottom:3px solid #1a4d8f;margin-bottom:10px;padding-bottom:8px;display:flex;justify-content:space-between;gap:20px}
      .print-header h1{color:#1a4d8f;font-size:17pt;margin:0 0 3px}.print-header p{margin:0;color:#64748b}
      .report-meta{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:8px 0 10px}.report-meta>div,.general-note{border:1px solid #d8e0ea;border-radius:4px;padding:6px}
      .k{display:block;text-transform:uppercase;letter-spacing:.3px;font-size:7pt;color:#64748b;font-weight:700;margin-bottom:2px}
      .general-note{margin-bottom:10px}.sector-block{break-before:auto;margin:0 0 15px}.sector-block h2{color:#fff;background:#1a4d8f;padding:5px 8px;margin:12px 0 6px;font-size:12pt}
      .sector-block h3{color:#1a4d8f;border-left:3px solid #1a4d8f;padding-left:6px;margin:8px 0 5px;font-size:10pt}
      .print-report table{width:100%;border-collapse:collapse}.print-table th,.print-table td,.work-table th,.work-table td{border:1px solid #d8e0ea;padding:4px 5px;vertical-align:top;text-align:left}
      .print-report th{background:#eaf1f9;color:#123566;font-size:7.5pt}.asset-card{border:1px solid #cbd5e1;border-radius:4px;padding:7px;margin-bottom:7px}
      .asset-grid>div{min-width:0}.work-table{font-size:7.5pt}.muted{color:#64748b;font-size:7pt;margin-top:2px}
      .empty,.empty-box,.work-empty{color:#64748b;text-align:center;padding:7px}.footer{border-top:1px solid #cbd5e1;margin-top:10px;padding-top:5px;color:#64748b;font-size:7pt;display:flex;justify-content:space-between}
      @media print{.sector-block,.asset-card,tr{break-inside:avoid}.print-report{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style>
    <div class="print-report">
      <div class="print-header"><div><h1>Relatório operacional semanal</h1><p>GOM — Gestão de Obras de Manutenção de Frota</p></div>
        <div style="text-align:right"><strong>${esc(relatorio.periodo)}</strong><br>${esc(relatorio.siglas.join(', '))}</div></div>
      ${htmlResumo(relatorio, true)}
      ${relatorio.grupos.map(g => htmlGrupo(g, true)).join('')}
      <div class="footer"><span>Emitido em ${esc(formatarDataHora(relatorio.emitidoEm))}</span><span>Documento operacional sem informação financeira</span></div>
    </div>`;
  }

  function opcoesSetoresHTML() {
    const setores = todosSetores();
    if (!setores.length) return '<span style="color:var(--text-light)">Sem setores registados.</span>';
    return setores.map(s => `<label style="display:flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card)">
      <input type="checkbox" name="relSemSetor" value="${esc(s.key)}" checked>
      <strong>${esc(s.sigla)}</strong><span style="font-size:11px;color:var(--text-medium)">${s.nome !== s.sigla ? esc(s.nome) : ''}</span>
    </label>`).join('');
  }

  function painelSemanalHTML() {
    const atual = intervaloSemanaAtual();
    return `<div class="card rel-card-mb">
      <div class="card-header"><span class="card-title">Parâmetros do relatório semanal</span></div>
      <div class="card-body">
        <div class="form-row form-row-3">
          <div class="form-group"><label class="form-label" for="relSemModo">Definição temporal</label>
            <select class="form-control" id="relSemModo" onchange="alterarModoRelatorioSemanal()"><option value="semana">Semana</option><option value="periodo">Período personalizado</option></select></div>
          <div class="form-group" id="relSemCampoSemana"><label class="form-label" for="relSemSemana">Semana</label>
            <input class="form-control" type="week" id="relSemSemana" value="${semanaISO(new Date())}" onchange="atualizarDatasSemanaRelatorio()"></div>
          <div class="form-group"><label class="form-label">Inativos históricos</label>
            <label style="display:flex;align-items:center;gap:8px;min-height:39px"><input type="checkbox" id="relSemInativos"> Incluir suspensos/inativos para consulta histórica</label></div>
        </div>
        <div class="form-row form-row-2" id="relSemCamposPeriodo" style="display:none">
          <div class="form-group"><label class="form-label" for="relSemInicio">Data inicial</label><input class="form-control" type="date" id="relSemInicio" value="${atual.inicio}"></div>
          <div class="form-group"><label class="form-label" for="relSemFim">Data final</label><input class="form-control" type="date" id="relSemFim" value="${atual.fim}"></div>
        </div>
        <div class="form-group"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
          <label class="form-label" style="margin:0">Setores *</label><div><button type="button" class="btn btn-sm btn-outline" onclick="selecionarSetoresRelatorio(true)">Todos</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="selecionarSetoresRelatorio(false)">Nenhum</button></div></div>
          <div id="relSemSetores" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">${opcoesSetoresHTML()}</div></div>
        <div class="form-group"><label class="form-label" for="relSemObservacao">Observação geral</label>
          <textarea class="form-control" id="relSemObservacao" rows="2" placeholder="Observação a apresentar no relatório impresso"></textarea></div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="btn btn-primary" onclick="gerarRelatorioSemanal()">Gerar novamente com dados atuais</button>
          <button type="button" class="btn btn-outline" onclick="imprimirRelatorioSemanal()">Imprimir / Gravar PDF</button>
        </div>
      </div></div><div id="relSemPreview"></div>`;
  }

  function lerFiltros() {
    const modo = document.getElementById('relSemModo')?.value || 'semana';
    let inicio = '';
    let fim = '';
    let periodo = '';
    if (modo === 'semana') {
      const limites = limitesSemana(document.getElementById('relSemSemana')?.value);
      if (!limites) throw new Error('Selecione uma semana válida.');
      inicio = limites.inicio;
      fim = limites.fim;
      periodo = `Semana ${limites.numero}/${limites.ano} — ${formatarData(inicio)} a ${formatarData(fim)}`;
    } else {
      inicio = document.getElementById('relSemInicio')?.value || '';
      fim = document.getElementById('relSemFim')?.value || '';
      if (!inicio || !fim) throw new Error('Preencha as datas inicial e final.');
      if (fim < inicio) throw new Error('A data final não pode ser anterior à data inicial.');
      periodo = `${formatarData(inicio)} a ${formatarData(fim)}`;
    }
    const chaves = Array.from(document.querySelectorAll('input[name="relSemSetor"]:checked')).map(el => el.value);
    const mapa = new Map(todosSetores().map(s => [s.key, s]));
    const setores = chaves.map(k => mapa.get(k)).filter(Boolean);
    if (!setores.length) throw new Error('Selecione pelo menos um setor.');
    return {
      modo, inicio, fim, periodo, setores,
      observacao: document.getElementById('relSemObservacao')?.value || '',
      incluirInativos: !!document.getElementById('relSemInativos')?.checked
    };
  }

  function gerarRelatorioSemanal(silencioso) {
    try {
      const filtros = lerFiltros();
      const relatorio = construirDados(filtros);
      ultimoRelatorio = relatorio;
      GOM.relatorioSemanalAtual = relatorio;
      const preview = document.getElementById('relSemPreview');
      if (preview) preview.innerHTML = htmlPreview(relatorio);
      if (!silencioso) toast('Relatório semanal atualizado com os dados atuais.', 'success');
      return relatorio;
    } catch (erro) {
      toast(erro.message || 'Não foi possível gerar o relatório.', 'error');
      return null;
    }
  }

  function imprimirRelatorioSemanal() {
    const relatorio = gerarRelatorioSemanal(true);
    if (!relatorio) return;
    const area = document.getElementById('printArea');
    if (!area) { toast('Área de impressão indisponível.', 'error'); return; }
    area.innerHTML = htmlImpressao(relatorio);
    area.style.display = 'block';
    setTimeout(() => {
      window.print();
      setTimeout(() => { area.style.display = 'none'; area.innerHTML = ''; }, 1800);
    }, 120);
  }

  function alterarModoRelatorioSemanal() {
    const modo = document.getElementById('relSemModo')?.value || 'semana';
    const semana = document.getElementById('relSemCampoSemana');
    const periodo = document.getElementById('relSemCamposPeriodo');
    if (semana) semana.style.display = modo === 'semana' ? '' : 'none';
    if (periodo) periodo.style.display = modo === 'periodo' ? '' : 'none';
  }

  function atualizarDatasSemanaRelatorio() {
    const limites = limitesSemana(document.getElementById('relSemSemana')?.value);
    if (!limites) return;
    const inicio = document.getElementById('relSemInicio');
    const fim = document.getElementById('relSemFim');
    if (inicio) inicio.value = limites.inicio;
    if (fim) fim.value = limites.fim;
  }

  function selecionarSetoresRelatorio(selecionar) {
    document.querySelectorAll('input[name="relSemSetor"]').forEach(el => { el.checked = !!selecionar; });
  }

  function injetarAbaSemanal() {
    const tabs = document.getElementById('relTabs');
    if (!tabs) return;
    if (!document.getElementById('relBtnSemanal')) {
      const icone = typeof window.icon === 'function' ? window.icon('calendar', 14) : '';
      tabs.insertAdjacentHTML('beforeend', `<button class="tab-btn" onclick="switchRelTab(this,'semanal')" id="relBtnSemanal">${icone} Relatório semanal</button>`);
    }
    const contentor = document.getElementById('pageContainer');
    if (contentor && !document.getElementById('relTabSemanal')) {
      contentor.insertAdjacentHTML('beforeend', `<div id="relTabSemanal" style="display:none">${painelSemanalHTML()}</div>`);
    }
  }

  function atualizarTopbar(tab) {
    const topo = document.getElementById('topbarActions');
    if (!topo) return;
    const iconePrint = typeof window.icon === 'function' ? window.icon('print', 14) : '';
    const iconeExcel = typeof window.icon === 'function' ? window.icon('excel', 14) : '';
    const iconeRefresh = typeof window.icon === 'function' ? window.icon('refresh', 14) : '';
    if (tab === 'semanal') {
      topo.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="gerarRelatorioSemanal()">${iconeRefresh} Atualizar</button>
        <button class="btn btn-outline btn-sm" onclick="imprimirRelatorioSemanal()">${iconePrint} Imprimir / PDF</button></div>`;
    } else {
      topo.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="exportarRelatorioExcel('${esc(tab)}')">${iconeExcel} Excel</button>
        <button class="btn btn-outline btn-sm" onclick="exportarRelatorioPDF('${esc(tab)}')">${iconePrint} PDF</button></div>`;
    }
  }

  function atualizarAcoes(tab) {
    const contentor = document.getElementById('relTabActions');
    if (tab === 'semanal') {
      if (contentor) contentor.innerHTML = '<button class="btn btn-outline btn-sm" onclick="gerarRelatorioSemanal()">Atualizar</button><button class="btn btn-outline btn-sm" onclick="imprimirRelatorioSemanal()">Imprimir / PDF</button>';
    } else if (typeof atualizarAcoesAnterior === 'function') {
      atualizarAcoesAnterior(tab);
    }
    atualizarTopbar(tab);
  }

  function desenharGraficos(tab) {
    setTimeout(() => {
      const obras = obrasAtuais();
      const veiculos = veiculosAtuais();
      try {
        if (tab === 'resumo') {
          if (typeof window._drawChartObrasEstado === 'function') window._drawChartObrasEstado(obras);
          if (typeof window._drawChartCustosMensais === 'function') window._drawChartCustosMensais(obras);
          if (typeof window._drawChartTiposInt === 'function') window._drawChartTiposInt(obras);
        } else if (tab === 'custos') {
          if (typeof window._drawChartCustosMensais2 === 'function') window._drawChartCustosMensais2(obras);
          if (typeof window._drawChartCustoVeiculo === 'function') window._drawChartCustoVeiculo(obras);
          if (typeof window._drawChartCustoTipo === 'function') window._drawChartCustoTipo(obras);
        } else if (tab === 'alertas' && typeof window._drawChartAlertasTipos === 'function') {
          window._drawChartAlertasTipos(typeof DB !== 'undefined' && DB.getAlertas ? DB.getAlertas() : []);
        } else if (tab === 'frota') {
          if (typeof window._drawChartFrota === 'function') window._drawChartFrota(veiculos);
          if (typeof window._drawChartEstadoOp === 'function') window._drawChartEstadoOp(veiculos);
        }
      } catch (erro) {
        console.warn('[GOM Relatórios] Não foi possível atualizar um gráfico:', erro);
      }
    }, 120);
  }

  function switchRelTab(btn, tab) {
    if (typeof window.destroyCharts === 'function') window.destroyCharts();
    const tabs = document.getElementById('relTabs');
    if (tabs) tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const mapa = {
      resumo: 'relTabResumo', custos: 'relTabCustos', alertas: 'relTabAlertas',
      frota: 'relTabFrota', semanal: 'relTabSemanal'
    };
    Object.values(mapa).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const alvo = document.getElementById(mapa[tab]);
    if (alvo) alvo.style.display = '';
    try { _relTabAtiva = tab; } catch (_) { /* app antiga sem estado global acessível */ }
    window._gomRelTabAtiva = tab;
    atualizarAcoes(tab);
    if (tab === 'semanal') {
      if (!ultimoRelatorio) setTimeout(() => gerarRelatorioSemanal(true), 0);
    } else {
      desenharGraficos(tab);
    }
  }

  function renderRelatorios() {
    if (typeof renderRelatoriosAnterior === 'function') {
      renderRelatoriosAnterior.apply(window, arguments);
      injetarAbaSemanal();
      atualizarAcoes('resumo');
      return;
    }
    const pagina = document.getElementById('pageContainer');
    if (pagina) pagina.innerHTML = `<div class="tab-bar" id="relTabs"></div><div id="relTabSemanal">${painelSemanalHTML()}</div>`;
    injetarAbaSemanal();
  }

  function instalarGlobais() {
    window.renderRelatorios = renderRelatorios;
    window.switchRelTab = switchRelTab;
    window._atualizarRelTabActions = atualizarAcoes;
    window.gerarRelatorioSemanal = gerarRelatorioSemanal;
    window.imprimirRelatorioSemanal = imprimirRelatorioSemanal;
    window.alterarModoRelatorioSemanal = alterarModoRelatorioSemanal;
    window.atualizarDatasSemanaRelatorio = atualizarDatasSemanaRelatorio;
    window.selecionarSetoresRelatorio = selecionarSetoresRelatorio;
  }

  instalarGlobais();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instalarGlobais);
  }

  API.construirDadosSemanal = construirDados;
  API.gerarHTMLSemanal = htmlImpressao;
  API.limparFinanceiro = limparFinanceiro;
  API.lerFiltrosSemanal = lerFiltros;
})(window);
