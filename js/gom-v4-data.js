/* ================================================================
   GOM v4 - CAMADA ADITIVA DE DADOS
   Carregar depois de app.js e antes do evento DOMContentLoaded.
   Migra dados existentes de forma idempotente, sem apagar campos legados.
   ================================================================ */
(function (global) {
  'use strict';

  if (typeof DB === 'undefined' || !DB) {
    console.error('[GOM v4 dados] DB não está disponível.');
    return;
  }

  const PATCH_VERSION = '4.0-data-1';
  const DIA_MS = 86400000;
  const ESTADOS_ADMINISTRATIVOS = Object.freeze({
    ATIVO: 'ativo',
    INATIVO: 'inativo_suspenso'
  });
  const ESTADOS_OPERACIONAIS = Object.freeze({
    OPERACIONAL: 'operacional',
    REPARACAO: 'em_reparacao',
    STANDBY: 'inoperacional_standby'
  });
  const ALERTAS_ATIVOS = Object.freeze([
    'itp', 'seguro', 'revisao', 'oleo', 'grua', 'caixa',
    'tacografo', 'extintor', 'licenciamento'
  ]);
  const ALERTAS_NAO_ATIVOS = Object.freeze(['pneus', 'lavagem', 'higienizacao']);
  const CUSTOS_OBRA = Object.freeze([
    'materiais', 'mao_obra', 'servicos_externos', 'pecas', 'outros'
  ]);
  const INTERVENCOES = Object.freeze([
    'Revisão', 'Mudança de óleo', 'Lavagem', 'Higienização', 'Pneus',
    'Manutenção preventiva', 'Reparação', 'Inspeção', 'Avaria elétrica',
    'Avaria hidráulica', 'Avaria motor', 'Carroçaria / Pintura', 'Outro'
  ]);
  const PNEUS_TIPOS = Object.freeze([
    'Substituição', 'Reparação', 'Rotação', 'Alinhamento/equilibragem', 'Outro'
  ]);
  const LOCAIS_EXECUCAO = Object.freeze({
    oficina_interna: 'Oficina interna',
    oficina_externa: 'Oficina externa',
    mista: 'Intervenção mista'
  });
  const PONTOS_SITUACAO = Object.freeze({
    aguarda_pecas: 'Aguarda peças',
    aguarda_orcamento: 'Aguarda orçamento',
    aguarda_autorizacao: 'Aguarda autorização',
    aguarda_transporte: 'Aguarda transporte',
    oficina_interna: 'Em oficina interna',
    oficina_externa: 'Em oficina externa',
    intervencao_curso: 'Intervenção em curso',
    outro: 'Outro'
  });

  const SETORES_DEMO = Object.freeze([
    { legado: 'Setor A', id: 'set-dop', sigla: 'DOP', nome_completo: 'Divisão de Operações e Património' },
    { legado: 'Setor B', id: 'set-dst', sigla: 'DST', nome_completo: 'Divisão de Serviços Técnicos' },
    { legado: 'Setor C', id: 'set-dal', sigla: 'DAL', nome_completo: 'Divisão de Apoio Logístico' },
    { legado: 'Setor D', id: 'set-die', sigla: 'DIE', nome_completo: 'Divisão de Infraestruturas e Equipamentos' }
  ]);

  Object.assign(DB.KEYS, {
    setores: 'gom_setores',
    historico: 'gom_historico',
    inoperacionalidades: 'gom_inoperacionalidades',
    config: 'gom_config',
    contadores: 'gom_contadores'
  });

  const base = {
    init: DB.init.bind(DB),
    criarVeiculo: DB.criarVeiculo.bind(DB),
    actualizarVeiculo: DB.actualizarVeiculo.bind(DB),
    eliminarVeiculo: DB.eliminarVeiculo.bind(DB),
    criarObra: DB.criarObra.bind(DB),
    actualizarObra: DB.actualizarObra.bind(DB),
    criarAlerta: DB.criarAlerta.bind(DB),
    actualizarAlerta: DB.actualizarAlerta.bind(DB),
    exportarTudo: DB.exportarTudo.bind(DB),
    importarTudo: DB.importarTudo.bind(DB)
  };

  function tem(obj, chave) {
    return Object.prototype.hasOwnProperty.call(obj || {}, chave);
  }

  function texto(valor) {
    return valor == null ? '' : String(valor).trim();
  }

  function chave(valor) {
    let resultado = texto(valor).toLowerCase();
    if (resultado.normalize) resultado = resultado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return resultado.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function slug(valor) {
    return chave(valor).replace(/_/g, '-').slice(0, 48) || 'sem-nome';
  }

  function numero(valor) {
    if (typeof valor === 'string') valor = valor.replace(',', '.');
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  function inteiro(valor) {
    const n = parseInt(valor, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function hoje() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function agora() {
    return new Date().toISOString();
  }

  function soData(valor) {
    const s = texto(valor);
    if (!s) return '';
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }

  function diaNumero(valor) {
    const s = soData(valor);
    if (!s) return null;
    const partes = s.split('-').map(Number);
    if (partes.length !== 3) return null;
    const n = Date.UTC(partes[0], partes[1] - 1, partes[2]) / DIA_MS;
    const teste = new Date(n * DIA_MS);
    if (teste.getUTCFullYear() !== partes[0] || teste.getUTCMonth() !== partes[1] - 1 || teste.getUTCDate() !== partes[2]) return null;
    return n;
  }

  function dataValida(valor) {
    return diaNumero(valor) !== null;
  }

  function exigirDataNaoFutura(valor, rotulo) {
    if (diaNumero(valor) > diaNumero(hoje())) throw new Error(`${rotulo || 'A data'} não pode ser futura.`);
  }

  function dataDeDia(n) {
    return new Date(n * DIA_MS).toISOString().slice(0, 10);
  }

  function somarDias(data, quantidade) {
    const n = diaNumero(data);
    return n === null ? '' : dataDeDia(n + quantidade);
  }

  function novoId(prefixo) {
    return typeof DB._id === 'function'
      ? DB._id(prefixo)
      : prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function siglaDoNome(nome) {
    const original = texto(nome);
    if (!original) return 'S/S';
    if (/^[A-Z0-9-]{2,10}$/.test(original)) return original;
    let limpo = original;
    if (limpo.normalize) limpo = limpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const ignorar = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
    const palavras = limpo.split(/[^A-Za-z0-9]+/).filter(p => p && !ignorar.has(p.toLowerCase()));
    const abreviatura = palavras.map(p => p.charAt(0)).join('').toUpperCase().slice(0, 8);
    return abreviatura || limpo.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'SET';
  }

  function demoPorLegado(nome) {
    const k = chave(nome);
    return SETORES_DEMO.find(s => chave(s.legado) === k) || null;
  }

  function normalizarSetor(valor, indice) {
    const origem = typeof valor === 'string' ? { nome_completo: valor } : { ...(valor || {}) };
    const nomeRecebido = texto(origem.nome_completo || origem.nome || origem.designacao || origem.setor || origem.sigla);
    const demo = demoPorLegado(nomeRecebido);
    const apenasNomeDemo = demo && chave(nomeRecebido) === chave(demo.legado) && !texto(origem.sigla);
    const nomeCompleto = apenasNomeDemo
      ? demo.nome_completo
      : (texto(origem.nome_completo || origem.nome) || (demo ? demo.nome_completo : nomeRecebido) || `Setor ${indice + 1}`);
    const sigla = texto(origem.sigla || (demo && demo.sigla) || siglaDoNome(nomeRecebido || nomeCompleto)).toUpperCase();
    const id = texto(origem.id || (demo && demo.id)) || `set-${slug(nomeRecebido || nomeCompleto || sigla)}`;
    return {
      ...origem,
      id,
      sigla,
      nome: nomeCompleto,
      nome_completo: nomeCompleto,
      ...(apenasNomeDemo ? { nome_legado: nomeRecebido } : {}),
      ativo: origem.ativo !== false
    };
  }

  function deduplicarSetores(lista) {
    const resultado = [];
    const ids = new Set();
    const nomes = new Set();
    (Array.isArray(lista) ? lista : []).forEach((item, i) => {
      const setor = normalizarSetor(item, i);
      const nk = chave(setor.nome_completo);
      const sk = chave(setor.sigla);
      if (ids.has(setor.id) || nomes.has(nk) || (sk && resultado.some(s => chave(s.sigla) === sk && chave(s.nome_completo) === nk))) return;
      ids.add(setor.id);
      nomes.add(nk);
      resultado.push(setor);
    });
    return resultado;
  }

  DB.getSetores = function () {
    return this._get(this.KEYS.setores, []);
  };

  DB.getSetor = function (referencia) {
    if (!referencia) return null;
    if (typeof referencia === 'object' && referencia.id) referencia = referencia.id;
    const ref = texto(referencia);
    const k = chave(ref);
    return this.getSetores().find(s =>
      texto(s.id) === ref || chave(s.sigla) === k || chave(s.nome_completo || s.nome) === k
      || chave(s.nome_legado || s.legado) === k
    ) || null;
  };

  DB.saveSetores = function (lista) {
    const normalizados = deduplicarSetores(lista);
    this._set(this.KEYS.setores, normalizados);
    return normalizados;
  };

  DB.getHistorico = function (entidadeId) {
    const lista = this._get(this.KEYS.historico, []);
    if (!entidadeId) return lista;
    return lista.filter(h => h.entidade_id === entidadeId || h.veiculo_id === entidadeId);
  };

  DB.saveHistorico = function (lista) {
    const atual = this._get(this.KEYS.historico, []);
    const ids = new Set(atual.map(h => h.id));
    (Array.isArray(lista) ? lista : []).forEach(h => {
      if (!h || ids.has(h.id)) return;
      atual.push(h);
      ids.add(h.id);
    });
    this._set(this.KEYS.historico, atual);
    return atual;
  };

  DB.adicionarHistorico = function (entrada) {
    this.saveHistorico([entrada]);
    return entrada;
  };

  DB.getInoperacionalidades = function (veiculoId) {
    const lista = this._get(this.KEYS.inoperacionalidades, []);
    return veiculoId ? lista.filter(p => p.veiculo_id === veiculoId) : lista;
  };

  DB.getInoperacionalidade = function (id) {
    return this.getInoperacionalidades().find(p => p.id === id) || null;
  };

  DB.saveInoperacionalidades = function (lista) {
    const dados = Array.isArray(lista) ? lista : [];
    this._set(this.KEYS.inoperacionalidades, dados);
    return dados;
  };

  DB.getConfig = function () {
    return this._get(this.KEYS.config, {});
  };

  DB.saveConfig = function (config) {
    const dados = { ...this.getConfig(), ...(config || {}) };
    this._set(this.KEYS.config, dados);
    return dados;
  };

  DB.getContadores = function () {
    return this._get(this.KEYS.contadores, {});
  };

  DB.saveContadores = function (contadores) {
    const dados = { ...(contadores || {}) };
    this._set(this.KEYS.contadores, dados);
    return dados;
  };

  function obterSetor(referencia, setores) {
    if (!referencia) return null;
    const lista = setores || DB.getSetores();
    const ref = typeof referencia === 'object' ? (referencia.id || referencia.sigla || referencia.nome_completo || referencia.nome) : referencia;
    const k = chave(ref);
    return lista.find(s => texto(s.id) === texto(ref) || chave(s.sigla) === k
      || chave(s.nome_completo || s.nome) === k || chave(s.nome_legado || s.legado) === k) || null;
  }

  function construirSetores() {
    const existentes = DB.getSetores();
    const referencias = [];
    DB.getVeiculos().forEach(v => {
      if (v.setor) referencias.push(v.setor);
      else if (v.setor_nome) referencias.push(v.setor_nome);
      else if (v.setor_id) referencias.push(v.setor_id);
    });
    DB.getObras().forEach(o => {
      if (o.setor_snapshot) referencias.push(o.setor_snapshot);
      else if (o.setor_nome_snapshot) referencias.push(o.setor_nome_snapshot);
    });
    const baseSetores = existentes.length ? existentes.slice() : [];
    if (!baseSetores.length && !referencias.length) baseSetores.push(...SETORES_DEMO);
    referencias.forEach(ref => {
      if (!obterSetor(ref, deduplicarSetores(baseSetores))) baseSetores.push(ref);
    });
    return DB.saveSetores(baseSetores);
  }

  function estadoAdministrativo(valor, legadoAtivo, legadoEstado) {
    const k = chave(valor);
    if (['inativo', 'suspenso', 'inativo_suspenso', 'inativo_suspenso_'].includes(k)) return ESTADOS_ADMINISTRATIVOS.INATIVO;
    if (k === 'ativo') return ESTADOS_ADMINISTRATIVOS.ATIVO;
    return legadoAtivo === false || chave(legadoEstado) === 'inativo'
      ? ESTADOS_ADMINISTRATIVOS.INATIVO
      : ESTADOS_ADMINISTRATIVOS.ATIVO;
  }

  function estadoOperacional(valor, temObraAberta) {
    const k = chave(valor);
    if (['operacional', 'ativo'].includes(k)) return ESTADOS_OPERACIONAIS.OPERACIONAL;
    if (['em_reparacao', 'reparacao', 'em_manutencao', 'manutencao'].includes(k)) return ESTADOS_OPERACIONAIS.REPARACAO;
    if (['inoperacional_standby', 'inoperacional', 'standby'].includes(k)) return ESTADOS_OPERACIONAIS.STANDBY;
    if (k === 'avaria') return temObraAberta ? ESTADOS_OPERACIONAIS.REPARACAO : ESTADOS_OPERACIONAIS.STANDBY;
    if (k === 'inativo') return ESTADOS_OPERACIONAIS.STANDBY;
    return ESTADOS_OPERACIONAIS.OPERACIONAL;
  }

  function estadoLegado(operacional, administrativo) {
    return operacional || ESTADOS_OPERACIONAIS.OPERACIONAL;
  }

  function normalizarEspecificacoes(valor) {
    if (Array.isArray(valor)) {
      return valor.map(item => typeof item === 'object'
        ? { ...item, nome: texto(item.nome || item.chave), valor: texto(item.valor) }
        : { nome: texto(item), valor: '' });
    }
    if (valor && typeof valor === 'object') {
      return Object.keys(valor).map(nome => ({ nome, valor: texto(valor[nome]) }));
    }
    return [];
  }

  function veiculoTemObraAberta(veiculo, obras) {
    return (obras || DB.getObras()).some(o =>
      chave(o.estado) === 'aberta' &&
      (o.veiculo_id === veiculo.id || (veiculo.matricula && o.matricula === veiculo.matricula))
    );
  }

  function normalizarVeiculo(veiculo, setores, obras) {
    const v = { ...(veiculo || {}) };
    const principal = chave(v.tipo_principal) === 'maquina' || chave(v.tipo) === 'maquina' ? 'maquina' : 'viatura';
    const setor = obterSetor(v.setor_id || v.setor_sigla || v.setor_nome || v.setor, setores);
    const admin = estadoAdministrativo(v.estado_administrativo, v.ativo, v.estado_op);
    const op = estadoOperacional(v.estado_operacional || v.estado_op, veiculoTemObraAberta(v, obras));
    const specs = normalizarEspecificacoes(v.outras_especificacoes || v.especificacoes);
    const resultado = {
      ...v,
      patrimonio: texto(v.patrimonio || v.numero_patrimonio),
      numero_patrimonio: texto(v.numero_patrimonio || v.patrimonio),
      matricula: texto(v.matricula),
      tipo_principal: principal,
      centro_custos: texto(v.centro_custos || v.centro_custo),
      centro_responsabilidade: texto(v.centro_responsabilidade),
      setor_id: setor ? setor.id : texto(v.setor_id),
      setor_sigla: setor ? setor.sigla : texto(v.setor_sigla || v.setor),
      setor_nome: setor ? setor.nome_completo : texto(v.setor_nome || v.setor),
      carrocaria_configuracao: texto(v.carrocaria_configuracao || v.tipo_carrocaria || v.configuracao),
      tipo_carrocaria: texto(v.tipo_carrocaria || v.carrocaria_configuracao || v.configuracao),
      numero_lugares: tem(v, 'numero_lugares') ? v.numero_lugares : (principal === 'maquina' ? 'Não aplicável' : ''),
      data_matricula: soData(v.data_matricula),
      data_propriedade_municipal: soData(v.data_propriedade_municipal || v.data_propriedade),
      tipo_energia: texto(v.tipo_energia || v.combustivel),
      quilometragem: tem(v, 'quilometragem') ? numero(v.quilometragem) : numero(v.km),
      horas_funcionamento: tem(v, 'horas_funcionamento') ? numero(v.horas_funcionamento) : numero(v.horas),
      outras_especificacoes: specs,
      especificacoes: specs.map(s => ({ ...s })),
      estado_administrativo: admin,
      estado_operacional: op,
      estado_op: op,
      ativo: admin === ESTADOS_ADMINISTRATIVOS.ATIVO
    };
    if (v.estado_op && v.estado_op !== op && !v.estado_op_original) resultado.estado_op_original = v.estado_op;
    if (admin === ESTADOS_ADMINISTRATIVOS.INATIVO && !soData(resultado.data_suspensao)) {
      resultado.data_suspensao = hoje();
      resultado.data_suspensao_estimada = true;
      if (!resultado.nota_migracao_estado) {
        resultado.nota_migracao_estado = 'A data original de suspensão não estava disponível; foi usada a data da migração.';
      }
    }
    if (principal === 'maquina' && !resultado.matricula) resultado.matricula_nao_aplicavel = true;
    return resultado;
  }

  function lerNumeroObra(valor, anoAlternativo) {
    if (valor && typeof valor === 'object') {
      const nObj = inteiro(valor.numero_sequencial || valor.sequencial_obra);
      const aObj = inteiro(valor.ano_obra);
      if (nObj > 0 && aObj >= 2000) return { numero: nObj, ano: aObj };
      anoAlternativo = aObj || anoAlternativo;
      valor = valor.numero_obra;
    }
    const s = texto(valor);
    let m = s.match(/^(\d+)\s*\/\s*(\d{4})$/);
    if (m) return { numero: inteiro(m[1]), ano: inteiro(m[2]) };
    m = s.match(/^OBR[-_/ ](\d{4})[-_/ ](\d+)$/i);
    if (m) return { numero: inteiro(m[2]), ano: inteiro(m[1]) };
    m = s.match(/^(\d{4})[-_/ ](\d+)$/);
    if (m) return { numero: inteiro(m[2]), ano: inteiro(m[1]) };
    m = s.match(/(\d+)(?!.*\d)/);
    const ano = inteiro(anoAlternativo);
    if (m && ano >= 2000) return { numero: inteiro(m[1]), ano };
    return null;
  }

  function numeroObra(valor, ano) {
    if (ano !== undefined) {
      const n = inteiro(valor), a = inteiro(ano);
      return n > 0 && a >= 2000 ? `${n}/${a}` : texto(valor);
    }
    const dados = lerNumeroObra(valor, valor && valor.ano_obra);
    return dados && dados.numero > 0 && dados.ano >= 2000
      ? `${dados.numero}/${dados.ano}`
      : texto(valor && valor.numero_obra !== undefined ? valor.numero_obra : valor);
  }

  function custosDaObra(obra, alteracoes) {
    const o = obra || {};
    const a = alteracoes || {};
    const nested = { ...((o.custos && typeof o.custos === 'object') ? o.custos : {}) };
    if (a.custos && typeof a.custos === 'object') Object.assign(nested, a.custos);
    const mapa = {
      materiais: 'custo_materiais',
      mao_obra: 'custo_mao_obra',
      servicos_externos: 'custo_servicos_externos',
      pecas: 'custo_pecas',
      outros: 'custo_outros'
    };
    const resultado = {};
    let temRubrica = false;
    CUSTOS_OBRA.forEach(nome => {
      const flat = mapa[nome];
      let valor;
      if (tem(a, flat)) valor = a[flat];
      else if (tem(nested, nome)) valor = nested[nome];
      else if (tem(o, flat)) valor = o[flat];
      else valor = 0;
      if (tem(a, flat) || tem(nested, nome) || tem(o, flat)) temRubrica = true;
      resultado[nome] = Math.max(0, numero(valor));
    });
    const totalLegado = Math.max(0, numero(tem(a, 'custo_total') ? a.custo_total : o.custo_total));
    if (!temRubrica && totalLegado > 0) resultado.outros = totalLegado;
    else {
      const outrosExplicitos = tem(a, 'custo_outros') || tem(nested, 'outros') || tem(o, 'custo_outros');
      const somaRubricas = CUSTOS_OBRA.reduce((total, nome) => total + resultado[nome], 0);
      if (!alteracoes && !outrosExplicitos && totalLegado > somaRubricas) {
        resultado.outros += Math.round((totalLegado - somaRubricas) * 100) / 100;
      }
    }
    return resultado;
  }

  function calcularTotalObra(obra) {
    const custos = custosDaObra(obra);
    return Math.round(CUSTOS_OBRA.reduce((total, nome) => total + custos[nome], 0) * 100) / 100;
  }

  function normalizarObra(obra, setores, alteracoes) {
    const o = { ...(obra || {}) };
    const custos = custosDaObra(o, alteracoes);
    const total = Math.round(CUSTOS_OBRA.reduce((soma, nome) => soma + custos[nome], 0) * 100) / 100;
    const setor = obterSetor(o.setor_id_snapshot || o.setor_sigla_snapshot || o.setor_nome_snapshot || o.setor_snapshot, setores);
    const resultado = {
      ...o,
      custos,
      custo_materiais: custos.materiais,
      custo_mao_obra: custos.mao_obra,
      custo_servicos_externos: custos.servicos_externos,
      custo_pecas: custos.pecas,
      custo_outros: custos.outros,
      custo_total: total,
      setor_id_snapshot: setor ? setor.id : texto(o.setor_id_snapshot),
      setor_sigla_snapshot: setor ? setor.sigla : texto(o.setor_sigla_snapshot || o.setor_snapshot),
      setor_nome_snapshot: setor ? setor.nome_completo : texto(o.setor_nome_snapshot || o.setor_snapshot),
      intervencao_outro_descricao: texto(o.intervencao_outro_descricao),
      pneus_tipo: texto(o.pneus_tipo),
      pneus_outro_descricao: texto(o.pneus_outro_descricao),
      local_execucao: texto(o.local_execucao || o.local_intervencao),
      ponto_situacao: texto(o.ponto_situacao),
      ponto_situacao_observacao: texto(o.ponto_situacao_observacao),
      observacoes: texto(o.observacoes)
    };
    const anterior = numero(o.custo_total);
    if (tem(o, 'custo_total') && Math.abs(anterior - total) > 0.004 && !tem(o, 'custo_total_original')) {
      resultado.custo_total_original = o.custo_total;
    }
    return resultado;
  }

  function normalizarAlerta(alerta) {
    const a = { ...(alerta || {}) };
    const estadoRecebido = chave(a.seguro_estado || a.estado_seguro);
    const estado = estadoRecebido === 'anulado' || a.seguro_anulado === true ? 'anulado' : 'ativo';
    return {
      ...a,
      seguro_estado: estado,
      seguro_nota: texto(a.seguro_nota || a.nota_seguro || a.seguro_observacoes)
    };
  }

  function normalizarPeriodo(periodo) {
    const p = { ...(periodo || {}) };
    const inicio = soData(p.data_inicio || p.inicio || p.data_inicio_inoperacionalidade);
    const fim = soData(p.data_fim || p.fim || p.data_fim_inoperacionalidade) || null;
    const estado = estadoOperacional(p.estado_operacional || p.estado || p.estado_atual, false) === ESTADOS_OPERACIONAIS.OPERACIONAL
      ? ESTADOS_OPERACIONAIS.STANDBY
      : estadoOperacional(p.estado_operacional || p.estado || p.estado_atual, false);
    return {
      ...p,
      id: texto(p.id) || novoId('ino-'),
      veiculo_id: texto(p.veiculo_id),
      data_inicio: inicio,
      data_fim: fim,
      motivo: texto(p.motivo),
      observacoes: texto(p.observacoes),
      estado,
      estado_atual: estado,
      estado_operacional: estado,
      situacao: fim ? 'terminada' : 'ativa',
      origem: texto(p.origem) || 'manual',
      criado_em: p.criado_em || agora(),
      atualizado_em: p.atualizado_em || p.criado_em || agora()
    };
  }

  function maximosObras(obras, contadores) {
    const maximos = { ...(((contadores || {}).obras && typeof contadores.obras === 'object') ? contadores.obras : {}) };
    (obras || []).forEach(o => {
      const info = lerNumeroObra(o, new Date(o.data_entrada || Date.now()).getFullYear());
      if (!info || info.numero < 1 || info.ano < 2000) return;
      maximos[info.ano] = Math.max(inteiro(maximos[info.ano]), info.numero);
    });
    return maximos;
  }

  function migrarObras(setores) {
    const originais = DB.getObras();
    const contadores = DB.getContadores();
    const maximos = maximosObras(originais, contadores);
    const usados = new Set();
    const migradas = originais.map(original => {
      const anoData = new Date(original.data_entrada || Date.now()).getFullYear();
      let info = lerNumeroObra(original, anoData);
      const chaveNumero = info ? `${info.ano}/${info.numero}` : '';
      if (!info || info.numero < 1 || info.ano < 2000 || usados.has(chaveNumero)) {
        const ano = info && info.ano >= 2000 ? info.ano : anoData;
        maximos[ano] = inteiro(maximos[ano]) + 1;
        info = { numero: maximos[ano], ano };
      }
      usados.add(`${info.ano}/${info.numero}`);
      maximos[info.ano] = Math.max(inteiro(maximos[info.ano]), info.numero);
      const canonico = `${info.numero}/${info.ano}`;
      const obra = {
        ...original,
        numero_obra: canonico,
        numero_sequencial: info.numero,
        sequencial_obra: info.numero,
        ano_obra: info.ano
      };
      if (texto(original.numero_obra) && texto(original.numero_obra) !== canonico && !original.numero_obra_original) {
        obra.numero_obra_original = original.numero_obra;
      }
      return normalizarObra(obra, setores);
    });
    DB.saveObras(migradas);
    DB.saveContadores({ ...contadores, obras: maximos });
    return migradas;
  }

  function migrarVeiculos(setores, obras) {
    const migrados = DB.getVeiculos().map(v => normalizarVeiculo(v, setores, obras));
    DB.saveVeiculos(migrados);
    return migrados;
  }

  function migrarAlertas() {
    const migrados = DB.getAlertas().map(normalizarAlerta);
    DB.saveAlertas(migrados);
    return migrados;
  }

  function migrarPeriodos(veiculos, obras) {
    const existentes = DB.getInoperacionalidades().map(normalizarPeriodo).filter(p => p.veiculo_id && p.data_inicio);
    const hojeMigracao = hoje();
    veiculos.forEach(v => {
      if (v.estado_administrativo !== ESTADOS_ADMINISTRATIVOS.ATIVO || v.estado_operacional === ESTADOS_OPERACIONAIS.OPERACIONAL) return;
      if (existentes.some(p => p.veiculo_id === v.id && !p.data_fim)) return;
      const abertas = obras.filter(o => chave(o.estado) === 'aberta' && (o.veiculo_id === v.id || (v.matricula && o.matricula === v.matricula)))
        .sort((a, b) => new Date(a.data_entrada || 0) - new Date(b.data_entrada || 0));
      const inicioConhecido = soData(v.data_inicio_inoperacionalidade || v.data_inicio_estado || (abertas[0] && abertas[0].data_entrada));
      existentes.push(normalizarPeriodo({
        id: `ino-migracao-${v.id}`,
        veiculo_id: v.id,
        data_inicio: inicioConhecido || hojeMigracao,
        data_fim: null,
        motivo: texto(v.motivo_inoperacionalidade || (abertas[0] && abertas[0].descricao_avaria)) || 'Estado operacional migrado',
        observacoes: inicioConhecido ? texto(v.observacoes_inoperacionalidade) : 'A data original não estava disponível; foi usada a data da migração.',
        estado: v.estado_operacional,
        origem: abertas.length ? 'obra' : 'migracao',
        obra_id: abertas[0] ? abertas[0].id : null,
        obra_ids: abertas.map(o => o.id),
        data_inicio_estimada: !inicioConhecido,
        criado_em: agora(),
        atualizado_em: agora()
      }));
    });
    DB.saveInoperacionalidades(existentes);
    return existentes;
  }

  function assegurarEstruturas() {
    if (localStorage.getItem(DB.KEYS.setores) === null) DB._set(DB.KEYS.setores, []);
    if (localStorage.getItem(DB.KEYS.historico) === null) DB._set(DB.KEYS.historico, []);
    if (localStorage.getItem(DB.KEYS.inoperacionalidades) === null) DB._set(DB.KEYS.inoperacionalidades, []);
    if (localStorage.getItem(DB.KEYS.config) === null) DB._set(DB.KEYS.config, {});
    if (localStorage.getItem(DB.KEYS.contadores) === null) DB._set(DB.KEYS.contadores, { obras: {} });
  }

  function migrarTudo() {
    assegurarEstruturas();
    const setores = construirSetores();
    const obras = migrarObras(setores);
    const veiculos = migrarVeiculos(setores, obras);
    migrarAlertas();
    migrarPeriodos(veiculos, obras);
    const config = DB.getConfig();
    const migracoes = { ...(config.migracoes || {}) };
    if (!migracoes.gom_v4_data) migracoes.gom_v4_data = agora();
    DB.saveConfig({
      ...config,
      schema_dados: PATCH_VERSION,
      identificacao_operacional: texto(config.identificacao_operacional),
      modo_prototipo: true,
      migracoes
    });
    return true;
  }

  DB.reservarNumeroObra = function (ano) {
    const a = inteiro(ano || new Date().getFullYear());
    if (a < 2000) throw new Error('Ano da obra inválido.');
    const contadores = this.getContadores();
    const obras = { ...maximosObras(this.getObras(), contadores) };
    const seguinte = inteiro(obras[a]) + 1;
    obras[a] = seguinte;
    this.saveContadores({ ...contadores, obras });
    return `${seguinte}/${a}`;
  };

  DB.proximoNumeroObra = function (ano) {
    return this.reservarNumeroObra(ano);
  };
  DB.proximoNumObra = DB.proximoNumeroObra;

  DB.criarVeiculo = function (dados) {
    const normalizado = normalizarVeiculo({
      estado_administrativo: ESTADOS_ADMINISTRATIVOS.ATIVO,
      estado_operacional: ESTADOS_OPERACIONAIS.OPERACIONAL,
      estado_op: 'operacional',
      ativo: true,
      ...(dados || {})
    }, this.getSetores(), this.getObras());
    return base.criarVeiculo(normalizado);
  };

  DB.actualizarVeiculo = function (id, campos) {
    const atual = this.getVeiculo(id);
    if (!atual) return null;
    const seguros = { ...(campos || {}) };
    // Sincroniza nomes legados/canónicos quando a edição chega pela interface antiga.
    if (tem(seguros, 'patrimonio') && !tem(seguros, 'numero_patrimonio')) seguros.numero_patrimonio = seguros.patrimonio;
    if (tem(seguros, 'numero_patrimonio') && !tem(seguros, 'patrimonio')) seguros.patrimonio = seguros.numero_patrimonio;
    if (tem(seguros, 'carrocaria_configuracao') && !tem(seguros, 'tipo_carrocaria')) seguros.tipo_carrocaria = seguros.carrocaria_configuracao;
    if (tem(seguros, 'tipo_carrocaria') && !tem(seguros, 'carrocaria_configuracao')) seguros.carrocaria_configuracao = seguros.tipo_carrocaria;
    if (tem(seguros, 'tipo_energia') && !tem(seguros, 'combustivel')) seguros.combustivel = seguros.tipo_energia;
    if (tem(seguros, 'combustivel') && !tem(seguros, 'tipo_energia')) seguros.tipo_energia = seguros.combustivel;
    if (tem(seguros, 'estado_op') && !tem(seguros, 'estado_operacional')) seguros.estado_operacional = seguros.estado_op;
    if (tem(seguros, 'estado_operacional') && !tem(seguros, 'estado_op')) seguros.estado_op = seguros.estado_operacional;
    if (tem(seguros, 'km') && !tem(seguros, 'quilometragem')) seguros.quilometragem = seguros.km;
    if (tem(seguros, 'quilometragem') && !tem(seguros, 'km')) seguros.km = seguros.quilometragem;
    if (tem(seguros, 'horas') && !tem(seguros, 'horas_funcionamento')) seguros.horas_funcionamento = seguros.horas;
    if (tem(seguros, 'horas_funcionamento') && !tem(seguros, 'horas')) seguros.horas = seguros.horas_funcionamento;
    if (atual.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO && seguros.ativo === true && !tem(seguros, 'estado_administrativo')) {
      seguros.ativo = false;
    }
    return base.actualizarVeiculo(id, normalizarVeiculo({ ...atual, ...seguros }, this.getSetores(), this.getObras()));
  };

  DB.eliminarVeiculo = function (id) {
    console.warn('[GOM v4 dados] Eliminação definitiva bloqueada. Use suspender/inativar.', id);
    return null;
  };

  DB.eliminarObra = function (id) {
    console.warn('[GOM v4 dados] Eliminação definitiva bloqueada. Use a anulação da obra.', id);
    return null;
  };

  DB.criarObra = function (dados) {
    const d = { ...(dados || {}) };
    const veiculo = d.veiculo_id ? this.getVeiculo(d.veiculo_id) : null;
    if (veiculo && estadoAdministrativo(veiculo.estado_administrativo, veiculo.ativo, veiculo.estado_op) !== ESTADOS_ADMINISTRATIVOS.ATIVO) {
      throw new Error('Um veículo ou máquina inativo não pode abrir uma nova obra.');
    }
    const ano = inteiro(d.ano_obra) || new Date(d.data_entrada || Date.now()).getFullYear();
    if (!d.numero_obra) d.numero_obra = this.reservarNumeroObra(ano);
    let info = lerNumeroObra(d, ano);
    if (info && this.getObras().some(o => {
      const existente = lerNumeroObra(o, o.ano_obra);
      return existente && existente.numero === info.numero && existente.ano === info.ano;
    })) {
      d.numero_obra = this.reservarNumeroObra(info.ano);
      info = lerNumeroObra(d, info.ano);
    }
    if (info) {
      d.numero_obra = `${info.numero}/${info.ano}`;
      d.numero_sequencial = info.numero;
      d.sequencial_obra = info.numero;
      d.ano_obra = info.ano;
      const contadores = this.getContadores();
      const obras = { ...((contadores.obras && typeof contadores.obras === 'object') ? contadores.obras : {}) };
      obras[info.ano] = Math.max(inteiro(obras[info.ano]), info.numero);
      this.saveContadores({ ...contadores, obras });
    }
    return base.criarObra(normalizarObra(d, this.getSetores()));
  };

  DB.actualizarObra = function (id, campos) {
    const atual = this.getObra(id);
    if (!atual) return null;
    const combinado = {
      ...atual,
      ...(campos || {}),
      // A identificação reservada é imutável, mesmo em anulação/edição.
      numero_obra: atual.numero_obra,
      numero_sequencial: atual.numero_sequencial,
      sequencial_obra: atual.sequencial_obra,
      ano_obra: atual.ano_obra
    };
    return base.actualizarObra(id, normalizarObra(combinado, this.getSetores(), campos));
  };

  DB.criarAlerta = function (dados) {
    return base.criarAlerta(normalizarAlerta(dados));
  };

  DB.actualizarAlerta = function (id, campos) {
    const atual = this.getAlertas().find(a => a.id === id);
    if (!atual) return null;
    return base.actualizarAlerta(id, normalizarAlerta({ ...atual, ...(campos || {}) }));
  };

  DB.exportarTudo = function () {
    const backup = base.exportarTudo();
    return {
      ...backup,
      versao_dados: PATCH_VERSION,
      dados: {
        ...(backup.dados || {}),
        setores: this.getSetores(),
        historico: this.getHistorico(),
        inoperacionalidades: this.getInoperacionalidades(),
        config: this.getConfig(),
        contadores: this.getContadores()
      }
    };
  };

  DB.importarTudo = function (backup) {
    if (!backup || backup.formato !== 'GOM_BACKUP' || !backup.dados) throw new Error('Cópia de segurança inválida.');
    const resultado = base.importarTudo(backup);
    const dados = backup.dados;
    this._set(this.KEYS.setores, Array.isArray(dados.setores) ? dados.setores : []);
    this._set(this.KEYS.historico, Array.isArray(dados.historico) ? dados.historico : []);
    this._set(this.KEYS.inoperacionalidades, Array.isArray(dados.inoperacionalidades) ? dados.inoperacionalidades : []);
    this._set(this.KEYS.config, dados.config && typeof dados.config === 'object' ? dados.config : {});
    this._set(this.KEYS.contadores, dados.contadores && typeof dados.contadores === 'object' ? dados.contadores : { obras: {} });
    migrarTudo();
    return resultado;
  };

  function operador() {
    return texto(DB.getConfig().identificacao_operacional) || 'Operação local';
  }

  function configurarOperador(nome) {
    const identificacao = texto(nome);
    if (!identificacao) throw new Error('Indique a identificação operacional.');
    DB.saveConfig({ identificacao_operacional: identificacao });
    return identificacao;
  }

  function exigirMotivo(motivo) {
    const m = texto(motivo);
    if (!m) throw new Error('O motivo é obrigatório.');
    return m;
  }

  function registarHistorico() {
    const args = Array.from(arguments);
    let dados;
    if (args[0] && typeof args[0] === 'object') {
      dados = { ...args[0] };
    } else if (['veiculo', 'obra', 'setor', 'alerta', 'requisicao'].includes(chave(args[0]))) {
      dados = {
        entidade: chave(args[0]), entidade_id: args[1], tipo: args[2],
        valor_anterior: args[3], valor_novo: args[4], motivo: args[5],
        observacoes: args[6], data_efetiva: args[7]
      };
    } else {
      dados = {
        entidade: 'veiculo', entidade_id: args[0], veiculo_id: args[0], tipo: args[1],
        valor_anterior: args[2], valor_novo: args[3], motivo: args[4],
        observacoes: args[5], data_efetiva: args[6]
      };
    }
    dados.entidade = chave(dados.entidade || 'veiculo');
    dados.entidade_id = texto(dados.entidade_id || dados.veiculo_id);
    if (!dados.entidade_id) throw new Error('O registo de histórico necessita de uma entidade.');
    const entrada = {
      ...dados,
      id: texto(dados.id) || novoId('hist-'),
      entidade: dados.entidade,
      entidade_id: dados.entidade_id,
      veiculo_id: dados.entidade === 'veiculo' ? dados.entidade_id : (dados.veiculo_id || null),
      data_hora: dados.data_hora || agora(),
      data_efetiva: soData(dados.data_efetiva) || soData(dados.data_hora) || hoje(),
      tipo: texto(dados.tipo),
      motivo: exigirMotivo(dados.motivo),
      observacoes: texto(dados.observacoes),
      utilizador: texto(dados.utilizador) || operador()
    };
    return DB.adicionarHistorico(entrada);
  }

  function validarSobreposicao(veiculoId, inicio, fim, ignorarId) {
    const a = diaNumero(inicio);
    const b = fim ? diaNumero(fim) : Number.MAX_SAFE_INTEGER;
    if (a === null || b === null || b < a) return false;
    return !DB.getInoperacionalidades(veiculoId).some(p => {
      if (p.id === ignorarId) return false;
      const pi = diaNumero(p.data_inicio || p.inicio);
      const pf = p.data_fim || p.fim ? diaNumero(p.data_fim || p.fim) : Number.MAX_SAFE_INTEGER;
      return pi !== null && pf !== null && a <= pf && pi <= b;
    });
  }

  function atualizarVeiculoSistema(id, campos) {
    const atual = DB.getVeiculo(id);
    if (!atual) throw new Error('Veículo ou máquina não encontrado.');
    return base.actualizarVeiculo(id, normalizarVeiculo({ ...atual, ...(campos || {}) }, DB.getSetores(), DB.getObras()));
  }

  function mudarSetor(veiculoId, novoSetor, dataEfetiva, motivo, observacoes) {
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    const setorNovo = obterSetor(novoSetor);
    if (!setorNovo) throw new Error('Novo setor inválido.');
    if (!dataValida(dataEfetiva)) throw new Error('Data efetiva inválida.');
    exigirDataNaoFutura(dataEfetiva, 'A data efetiva');
    const motivoFinal = exigirMotivo(motivo);
    const setorAnterior = obterSetor(veiculo.setor_id || veiculo.setor);
    const atualizado = atualizarVeiculoSistema(veiculoId, {
      setor_id: setorNovo.id,
      setor_sigla: setorNovo.sigla,
      setor_nome: setorNovo.nome_completo,
      setor: setorNovo.nome_completo
    });
    registarHistorico('veiculo', veiculoId, 'mudanca_setor',
      setorAnterior ? { id: setorAnterior.id, sigla: setorAnterior.sigla, nome_completo: setorAnterior.nome_completo } : veiculo.setor,
      { id: setorNovo.id, sigla: setorNovo.sigla, nome_completo: setorNovo.nome_completo },
      motivoFinal, observacoes, dataEfetiva);
    return atualizado;
  }

  function interpretarInicio(args) {
    if (args[1] && typeof args[1] === 'object') return { ...args[1] };
    return {
      data_inicio: args[1], motivo: args[2], observacoes: args[3],
      estado_operacional: args[4], obra_id: args[5]
    };
  }

  function iniciarInoperacionalidade() {
    const args = Array.from(arguments);
    const veiculoId = args[0];
    const dados = interpretarInicio(args);
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    if (veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO) throw new Error('Reative o registo antes de alterar o estado operacional.');
    const inicio = soData(dados.data_inicio || dados.inicio);
    const motivo = exigirMotivo(dados.motivo);
    if (!dataValida(inicio)) throw new Error('Data de início inválida.');
    exigirDataNaoFutura(inicio, 'A data de início');
    const ultimaReativacao = ultimaDataAdministrativa(veiculo, 'reativacao');
    if (ultimaReativacao && diaNumero(inicio) < diaNumero(ultimaReativacao)) {
      throw new Error('A inoperacionalidade atual não pode começar antes da última reativação.');
    }
    let estado = estadoOperacional(dados.estado_operacional || dados.estado || ESTADOS_OPERACIONAIS.STANDBY, false);
    if (estado === ESTADOS_OPERACIONAIS.OPERACIONAL) estado = ESTADOS_OPERACIONAIS.STANDBY;
    const ativos = DB.getInoperacionalidades(veiculoId).filter(p => !p.data_fim);
    if (ativos.length) {
      const atual = ativos[0];
      if (dados.obra_id) {
        const lista = DB.getInoperacionalidades();
        const i = lista.findIndex(p => p.id === atual.id);
        const obraIds = Array.from(new Set([...(atual.obra_ids || []), atual.obra_id, dados.obra_id].filter(Boolean)));
        lista[i] = normalizarPeriodo({
          ...atual,
          obra_id: atual.obra_id || dados.obra_id,
          obra_ids: obraIds,
          estado: ESTADOS_OPERACIONAIS.REPARACAO,
          estado_atual: ESTADOS_OPERACIONAIS.REPARACAO,
          estado_operacional: ESTADOS_OPERACIONAIS.REPARACAO,
          atualizado_em: agora()
        });
        DB.saveInoperacionalidades(lista);
        atualizarVeiculoSistema(veiculoId, { estado_operacional: ESTADOS_OPERACIONAIS.REPARACAO, estado_op: 'manutencao' });
        return lista[i];
      }
      throw new Error('Já existe um período de inoperacionalidade ativo para este registo.');
    }
    if (!validarSobreposicao(veiculoId, inicio, null)) throw new Error('O período sobrepõe-se a outro período de inoperacionalidade.');
    const periodo = normalizarPeriodo({
      id: novoId('ino-'), veiculo_id: veiculoId, data_inicio: inicio, data_fim: null,
      motivo, observacoes: dados.observacoes, estado, origem: dados.origem || (dados.obra_id ? 'obra' : 'manual'),
      obra_id: dados.obra_id || null, obra_ids: dados.obra_id ? [dados.obra_id] : [],
      criado_em: agora(), atualizado_em: agora()
    });
    const lista = DB.getInoperacionalidades();
    lista.push(periodo);
    DB.saveInoperacionalidades(lista);
    atualizarVeiculoSistema(veiculoId, {
      estado_operacional: estado,
      estado_op: estadoLegado(estado, ESTADOS_ADMINISTRATIVOS.ATIVO),
      data_inicio_inoperacionalidade: inicio,
      motivo_inoperacionalidade: motivo,
      observacoes_inoperacionalidade: texto(dados.observacoes)
    });
    registarHistorico('veiculo', veiculoId, 'entrada_inoperacionalidade',
      veiculo.estado_operacional || veiculo.estado_op, estado, motivo, dados.observacoes, inicio);
    return periodo;
  }

  function regressarOperacional(veiculoId, dataFim, motivo, observacoes, periodoId) {
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    const fim = soData(dataFim);
    const motivoFinal = exigirMotivo(motivo);
    if (!dataValida(fim)) throw new Error('Data de fim inválida.');
    exigirDataNaoFutura(fim, 'A data de fim');
    const lista = DB.getInoperacionalidades();
    const alvos = lista.filter(p => p.veiculo_id === veiculoId && !p.data_fim && (!periodoId || p.id === periodoId));
    alvos.forEach(p => {
      if (diaNumero(fim) < diaNumero(p.data_inicio)) throw new Error('A data de fim não pode ser anterior à data de início.');
      const i = lista.findIndex(item => item.id === p.id);
      lista[i] = normalizarPeriodo({ ...p, data_fim: fim, fim_motivo: motivoFinal, fim_observacoes: texto(observacoes), atualizado_em: agora() });
    });
    DB.saveInoperacionalidades(lista);
    const restantes = lista.filter(p => p.veiculo_id === veiculoId && !p.data_fim);
    const novoEstado = restantes.length
      ? (restantes.some(p => p.estado === ESTADOS_OPERACIONAIS.REPARACAO) ? ESTADOS_OPERACIONAIS.REPARACAO : ESTADOS_OPERACIONAIS.STANDBY)
      : ESTADOS_OPERACIONAIS.OPERACIONAL;
    const atualizado = atualizarVeiculoSistema(veiculoId, {
      estado_operacional: novoEstado,
      estado_op: estadoLegado(novoEstado, veiculo.estado_administrativo),
      data_fim_inoperacionalidade: fim
    });
    registarHistorico('veiculo', veiculoId,
      restantes.length ? 'fim_periodo_inoperacionalidade' : 'regresso_operacional',
      veiculo.estado_operacional || veiculo.estado_op, novoEstado, motivoFinal, observacoes, fim);
    return atualizado;
  }

  function alterarEstadoOperacional(veiculoId, novoEstado, terceiro, quarto, quinto) {
    const dataPrimeiro = dataValida(terceiro);
    const dataEfetiva = dataPrimeiro ? soData(terceiro) : (soData(quinto) || hoje());
    const motivo = dataPrimeiro ? quarto : terceiro;
    const observacoes = dataPrimeiro ? quinto : quarto;
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    if (veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO) throw new Error('Reative o registo antes de alterar o estado operacional.');
    exigirDataNaoFutura(dataEfetiva, 'A data efetiva');
    const novo = estadoOperacional(novoEstado, false);
    if (novo === ESTADOS_OPERACIONAIS.OPERACIONAL) return regressarOperacional(veiculoId, dataEfetiva, motivo, observacoes);
    exigirMotivo(motivo);
    const ativos = DB.getInoperacionalidades(veiculoId).filter(p => !p.data_fim);
    if (!ativos.length) return iniciarInoperacionalidade(veiculoId, dataEfetiva, motivo, observacoes, novo);
    if (ativos.some(p => diaNumero(dataEfetiva) < diaNumero(p.data_inicio))) {
      throw new Error('A alteração de estado não pode ser anterior ao início da inoperacionalidade.');
    }
    const lista = DB.getInoperacionalidades();
    ativos.forEach(p => {
      const i = lista.findIndex(item => item.id === p.id);
      lista[i] = normalizarPeriodo({
        ...p,
        estado: novo,
        estado_atual: novo,
        estado_operacional: novo,
        motivo: texto(motivo),
        observacoes: texto(observacoes) || texto(p.observacoes),
        atualizado_em: agora()
      });
    });
    DB.saveInoperacionalidades(lista);
    const anterior = veiculo.estado_operacional || veiculo.estado_op;
    const atualizado = atualizarVeiculoSistema(veiculoId, {
      estado_operacional: novo,
      estado_op: estadoLegado(novo, ESTADOS_ADMINISTRATIVOS.ATIVO),
      motivo_inoperacionalidade: texto(motivo),
      observacoes_inoperacionalidade: texto(observacoes) || texto(veiculo.observacoes_inoperacionalidade)
    });
    registarHistorico('veiculo', veiculoId, 'alteracao_estado_operacional', anterior, novo, motivo, observacoes, dataEfetiva);
    return atualizado;
  }

  function ultimaDataAdministrativa(veiculo, tipo) {
    const alvo = chave(tipo);
    const datas = DB.getHistorico(veiculo.id)
      .filter(h => chave(h.tipo) === alvo)
      .map(h => soData(h.data_efetiva || h.data_hora))
      .filter(dataValida);
    const campo = alvo === 'reativacao' ? veiculo.data_reativacao : veiculo.data_suspensao;
    if (dataValida(campo)) datas.push(soData(campo));
    return datas.sort().pop() || '';
  }

  function suspender(veiculoId, data, motivo, observacoes, confirmado) {
    if (confirmado !== true) throw new Error('É necessária confirmação explícita.');
    if (!permissoes.pode('suspender_veiculo')) throw new Error('Sem permissão para suspender este registo.');
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    if (veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO) throw new Error('O registo já está inativo/suspenso.');
    const efetiva = soData(data);
    const motivoFinal = exigirMotivo(motivo);
    if (!dataValida(efetiva)) throw new Error('Data de suspensão inválida.');
    exigirDataNaoFutura(efetiva, 'A data de suspensão');
    const ultimaReativacao = ultimaDataAdministrativa(veiculo, 'reativacao');
    if (ultimaReativacao && diaNumero(efetiva) < diaNumero(ultimaReativacao)) {
      throw new Error('A suspensão não pode ser anterior à última reativação.');
    }
    const lista = DB.getInoperacionalidades();
    lista.filter(p => p.veiculo_id === veiculoId && !p.data_fim).forEach(p => {
      if (diaNumero(efetiva) < diaNumero(p.data_inicio)) throw new Error('A suspensão não pode ser anterior ao início da inoperacionalidade.');
      const i = lista.findIndex(item => item.id === p.id);
      lista[i] = normalizarPeriodo({ ...p, data_fim: efetiva, fim_motivo: 'Suspensão/Inativação', fim_observacoes: texto(observacoes), atualizado_em: agora() });
    });
    DB.saveInoperacionalidades(lista);
    const atualizado = atualizarVeiculoSistema(veiculoId, {
      estado_administrativo: ESTADOS_ADMINISTRATIVOS.INATIVO,
      ativo: false,
      estado_op: veiculo.estado_operacional || ESTADOS_OPERACIONAIS.OPERACIONAL,
      data_suspensao: efetiva,
      motivo_suspensao: motivoFinal,
      observacoes_suspensao: texto(observacoes)
    });
    registarHistorico('veiculo', veiculoId, 'suspensao_inativacao',
      veiculo.estado_administrativo || 'ativo', ESTADOS_ADMINISTRATIVOS.INATIVO,
      motivoFinal, observacoes, efetiva);
    return atualizado;
  }

  function reativar(veiculoId, data, motivo, observacoes) {
    const veiculo = DB.getVeiculo(veiculoId);
    if (!veiculo) throw new Error('Veículo ou máquina não encontrado.');
    if (veiculo.estado_administrativo !== ESTADOS_ADMINISTRATIVOS.INATIVO) throw new Error('O registo já está ativo.');
    const efetiva = soData(data);
    const motivoFinal = exigirMotivo(motivo);
    if (!dataValida(efetiva)) throw new Error('Data de reativação inválida.');
    exigirDataNaoFutura(efetiva, 'A data de reativação');
    const ultimaSuspensao = ultimaDataAdministrativa(veiculo, 'suspensao_inativacao');
    if (ultimaSuspensao && diaNumero(efetiva) < diaNumero(ultimaSuspensao)) {
      throw new Error('A reativação não pode ser anterior à última suspensão/inativação.');
    }
    const ativos = DB.getInoperacionalidades(veiculoId).filter(p => !p.data_fim);
    const op = ativos.length
      ? (ativos.some(p => p.estado === ESTADOS_OPERACIONAIS.REPARACAO) ? ESTADOS_OPERACIONAIS.REPARACAO : ESTADOS_OPERACIONAIS.STANDBY)
      : ESTADOS_OPERACIONAIS.OPERACIONAL;
    const atualizado = atualizarVeiculoSistema(veiculoId, {
      estado_administrativo: ESTADOS_ADMINISTRATIVOS.ATIVO,
      ativo: true,
      estado_operacional: op,
      estado_op: estadoLegado(op, ESTADOS_ADMINISTRATIVOS.ATIVO),
      data_reativacao: efetiva,
      motivo_reativacao: motivoFinal,
      observacoes_reativacao: texto(observacoes)
    });
    registarHistorico('veiculo', veiculoId, 'reativacao',
      veiculo.estado_administrativo || ESTADOS_ADMINISTRATIVOS.INATIVO,
      ESTADOS_ADMINISTRATIVOS.ATIVO, motivoFinal, observacoes, efetiva);
    return atualizado;
  }

  function unirIntervalos(intervalos) {
    const ordenados = intervalos.filter(i => i && i.inicio !== null && i.fim !== null && i.fim >= i.inicio)
      .sort((a, b) => a.inicio - b.inicio || a.fim - b.fim);
    const unidos = [];
    ordenados.forEach(i => {
      const ultimo = unidos[unidos.length - 1];
      if (!ultimo || i.inicio > ultimo.fim + 1) unidos.push({ inicio: i.inicio, fim: i.fim });
      else ultimo.fim = Math.max(ultimo.fim, i.fim);
    });
    return unidos;
  }

  function totalIntervalos(intervalos) {
    return unirIntervalos(intervalos).reduce((soma, i) => soma + i.fim - i.inicio + 1, 0);
  }

  function periodosDoAlvo(alvo, periodoId) {
    if (alvo && typeof alvo === 'object' && (alvo.data_inicio || alvo.inicio)) return [alvo];
    const id = typeof alvo === 'object' ? alvo.id : alvo;
    const lista = DB.getInoperacionalidades(id);
    return periodoId ? lista.filter(p => p.id === periodoId) : lista;
  }

  function diasInoperacionalidade(alvo, inicio, fim, periodoId) {
    const periodos = periodosDoAlvo(alvo, periodoId);
    if (!periodos.length) return 0;
    let limiteInicio = diaNumero(inicio);
    let limiteFim = diaNumero(fim);
    if (limiteInicio === null) limiteInicio = Math.min(...periodos.map(p => diaNumero(p.data_inicio || p.inicio)).filter(n => n !== null));
    if (limiteFim === null) limiteFim = diaNumero(hoje());
    if (!Number.isFinite(limiteInicio) || limiteFim === null || limiteFim < limiteInicio) return 0;
    const intervalos = periodos.map(p => {
      const pi = diaNumero(p.data_inicio || p.inicio);
      const pf = diaNumero(p.data_fim || p.fim) ?? limiteFim;
      if (pi === null || pf === null) return null;
      return { inicio: Math.max(pi, limiteInicio), fim: Math.min(pf, limiteFim) };
    });
    return totalIntervalos(intervalos);
  }

  function eventosAdministrativos(veiculo) {
    const eventos = DB.getHistorico(veiculo.id).filter(h =>
      ['suspensao_inativacao', 'reativacao'].includes(chave(h.tipo))
    ).map((h, indice) => ({
      dia: diaNumero(h.data_efetiva || h.data_hora),
      estado: chave(h.tipo) === 'reativacao' ? ESTADOS_ADMINISTRATIVOS.ATIVO : ESTADOS_ADMINISTRATIVOS.INATIVO,
      ordem: Number.isFinite(new Date(h.data_hora || '').getTime()) ? new Date(h.data_hora).getTime() : indice
    })).filter(e => e.dia !== null);
    if (!eventos.some(e => e.estado === ESTADOS_ADMINISTRATIVOS.INATIVO) && veiculo.data_suspensao) {
      eventos.push({
        dia: diaNumero(veiculo.data_suspensao),
        estado: ESTADOS_ADMINISTRATIVOS.INATIVO,
        ordem: veiculo.data_suspensao_estimada ? -2 : (veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO ? Number.MAX_SAFE_INTEGER : -1)
      });
    }
    if (!eventos.some(e => e.estado === ESTADOS_ADMINISTRATIVOS.ATIVO) && veiculo.data_reativacao) {
      eventos.push({
        dia: diaNumero(veiculo.data_reativacao),
        estado: ESTADOS_ADMINISTRATIVOS.ATIVO,
        ordem: veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.ATIVO ? Number.MAX_SAFE_INTEGER : 0
      });
    }
    return eventos.filter(e => e.dia !== null).sort((a, b) => a.dia - b.dia || a.ordem - b.ordem);
  }

  function intervalosAtivos(veiculo, inicio, fim) {
    let desde = inicio;
    const propriedade = diaNumero(veiculo.data_propriedade_municipal || veiculo.data_propriedade);
    if (propriedade !== null) desde = Math.max(desde, propriedade);
    if (desde > fim) return [];
    const eventos = eventosAdministrativos(veiculo);
    if (!eventos.length) {
      return veiculo.estado_administrativo === ESTADOS_ADMINISTRATIVOS.INATIVO ? [] : [{ inicio: desde, fim }];
    }
    let estado = ESTADOS_ADMINISTRATIVOS.ATIVO;
    eventos.filter(e => e.dia < desde).forEach(e => { estado = e.estado; });
    const resultado = [];
    let cursor = desde;
    eventos.filter(e => e.dia >= desde && e.dia <= fim).forEach(e => {
      if (estado === ESTADOS_ADMINISTRATIVOS.ATIVO && e.dia > cursor) resultado.push({ inicio: cursor, fim: e.dia - 1 });
      estado = e.estado;
      cursor = e.dia;
    });
    if (estado === ESTADOS_ADMINISTRATIVOS.ATIVO && cursor <= fim) resultado.push({ inicio: cursor, fim });
    return unirIntervalos(resultado);
  }

  function intersetarIntervalos(a, b) {
    const resultado = [];
    unirIntervalos(a).forEach(x => unirIntervalos(b).forEach(y => {
      const inicio = Math.max(x.inicio, y.inicio);
      const fim = Math.min(x.fim, y.fim);
      if (inicio <= fim) resultado.push({ inicio, fim });
    }));
    return unirIntervalos(resultado);
  }

  function taxaInoperacionalidade(veiculos, inicio, fim) {
    let lista;
    if (Array.isArray(veiculos)) {
      lista = veiculos.map(v => typeof v === 'object' ? v : DB.getVeiculo(v)).filter(Boolean);
    } else if (veiculos) {
      const v = typeof veiculos === 'object' ? veiculos : DB.getVeiculo(veiculos);
      lista = v ? [v] : [];
    } else lista = DB.getVeiculos();
    const atual = new Date();
    const inicioPadrao = `${atual.getFullYear()}-01-01`;
    const a = diaNumero(inicio || inicioPadrao);
    const b = diaNumero(fim || hoje());
    if (a === null || b === null || b < a) return 0;
    let diasAtivos = 0;
    let diasInoperacionais = 0;
    lista.forEach(v => {
      const ativos = intervalosAtivos(v, a, b);
      diasAtivos += totalIntervalos(ativos);
      const inoperacionais = DB.getInoperacionalidades(v.id).map(p => {
        const pi = diaNumero(p.data_inicio || p.inicio);
        const pf = diaNumero(p.data_fim || p.fim) ?? b;
        return pi === null || pf === null ? null : { inicio: Math.max(pi, a), fim: Math.min(pf, b) };
      }).filter(Boolean);
      diasInoperacionais += totalIntervalos(intersetarIntervalos(inoperacionais, ativos));
    });
    return diasAtivos ? Math.round((diasInoperacionais / diasAtivos) * 10000) / 100 : 0;
  }

  const permissoes = Object.freeze({
    pode(acao) {
      /* TODO AUTORIZAÇÃO ADMIN: quando existir autenticação real, a ação
         suspender_veiculo será exclusiva do Rui com perfil administrador.
         No protótipo permanece disponível para teste, sem simular login. */
      if (chave(acao) === 'suspender_veiculo') return true;
      return true;
    }
  });

  DB.init = function () {
    const resultado = base.init();
    migrarTudo();
    return resultado;
  };

  const GOM = {
    ...(global.GOM || {}),
    versaoDados: PATCH_VERSION,
    constantes: Object.freeze({
      ESTADOS_ADMINISTRATIVOS,
      ESTADOS_OPERACIONAIS,
      ALERTAS_ATIVOS,
      ALERTAS_NAO_ATIVOS,
      CUSTOS_OBRA,
      INTERVENCOES,
      PNEUS_TIPOS,
      LOCAIS_EXECUCAO,
      PONTOS_SITUACAO
    }),
    ESTADOS_ADMINISTRATIVOS,
    ESTADOS_OPERACIONAIS,
    ALERTAS_ATIVOS,
    ALERTAS_NAO_ATIVOS,
    INTERVENCOES,
    PNEUS_TIPOS,
    LOCAIS_EXECUCAO,
    PONTOS_SITUACAO,
    getSetores: () => DB.getSetores(),
    getSetor: referencia => DB.getSetor(referencia),
    setorSigla: referencia => {
      const s = DB.getSetor(referencia && typeof referencia === 'object' ? (referencia.setor_id || referencia.id || referencia.setor) : referencia);
      return s ? s.sigla : texto(referencia && referencia.setor_sigla || referencia) || '—';
    },
    setorNome: referencia => {
      const s = DB.getSetor(referencia && typeof referencia === 'object' ? (referencia.setor_id || referencia.id || referencia.setor) : referencia);
      return s ? s.nome_completo : texto(referencia && (referencia.setor_nome || referencia.setor) || referencia) || '—';
    },
    labelLocalExecucao: valor => LOCAIS_EXECUCAO[texto(valor)] || texto(valor).replace(/_/g, ' ') || '—',
    labelPontoSituacao: valor => PONTOS_SITUACAO[texto(valor)] || texto(valor).replace(/_/g, ' ') || '—',
    numeroObra,
    calcularTotalObra,
    operador,
    configurarOperador,
    registarHistorico,
    diasInoperacionalidade,
    taxaInoperacionalidade,
    validarSobreposicao,
    mudarSetor,
    alterarEstadoOperacional,
    iniciarInoperacionalidade,
    regressarOperacional,
    suspender,
    reativar,
    permissoes,
    migrarDados: migrarTudo
  };

  global.GOM = GOM;
  console.log('[GOM v4 dados] Patch aditivo preparado - ' + PATCH_VERSION);
})(typeof window !== 'undefined' ? window : globalThis);
