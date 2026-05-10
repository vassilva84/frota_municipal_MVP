/* ================================================================
   GOM v3.0 — CAMADA DE DADOS MOCK (100% offline / localStorage)
   Versão: 4.0-mvp
   30 veículos/máquinas · alertas completos · dados realistas
   ================================================================ */
'use strict';

/* ================================================================
   CONSTANTES GLOBAIS
   ================================================================ */
const TIPOS_INT = [
  'Manutenção preventiva','Reparação','Inspeção','Revisão geral',
  'Avaria elétrica','Avaria hidráulica','Avaria motor',
  'Substituição de pneus','Carroçaria / Pintura','Outro'
];
const SETORES = ['Setor A','Setor B','Setor C','Setor D'];
const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DEPARTAMENTOS = [
  'Serviço de Limpeza Urbana','Serviço de Jardins e Espaços Verdes',
  'Serviço de Obras Municipais','Serviço de Fiscalização',
  'Serviço de Transportes','Serviço de Meios Mecânicos',
  'Serviço de Proteção Civil'
];

/* Tipos de alerta suportados */
const TIPOS_ALERTA = [
  'itp','seguro','revisao','oleo','pneus','grua','caixa',
  'tacografo','extintor','higienizacao','licenciamento'
];
const ALERTA_LABEL = {
  itp:            'ITP / Inspeção Técnica',
  seguro:         'Seguro',
  revisao:        'Revisão Periódica',
  oleo:           'Mudança de Óleo',
  pneus:          'Substituição de Pneus',
  grua:           'Certificação de Grua',
  caixa:          'Certificação de Caixa',
  tacografo:      'Tacógrafo',
  extintor:       'Extintores',
  higienizacao:   'Higienização',
  licenciamento:  'Licenciamento'
};

/* ================================================================
   DADOS FICTÍCIOS — VEÍCULOS (30 unidades)
   ================================================================ */
function _d(ano,mes,dia){ return `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`; }

const DADOS_VEICULOS = [
  /* ── LIGEIROS ────────────────────────────────────────────── */
  {id:'v001',matricula:'23-AB-45',patrimonio:'PAT-001',tipo:'ligeiro',categoria:'Carrinha de Serviço',
   marca:'Volkswagen',modelo:'Caddy Cargo',ano:2019,km:87420,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Obras Municipais',
   responsavel:'António Ferreira',localizacao:'Parque Municipal A'},
  {id:'v002',matricula:'67-CD-89',patrimonio:'PAT-002',tipo:'ligeiro',categoria:'Carrinha de Serviço',
   marca:'Renault',modelo:'Kangoo Express',ano:2020,km:54310,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Jardins e Espaços Verdes',
   responsavel:'Maria Sousa',localizacao:'Parque Municipal A'},
  {id:'v003',matricula:'78-MN-90',patrimonio:'PAT-007',tipo:'ligeiro',categoria:'Carrinha Pick-up',
   marca:'Ford',modelo:'Ranger Wildtrak',ano:2021,km:42180,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Fiscalização',
   responsavel:'Carlos Mendes',localizacao:'Parque Municipal A'},
  {id:'v004',matricula:'55-ST-66',patrimonio:'PAT-010',tipo:'ligeiro',categoria:'Viatura de Serviço',
   marca:'Peugeot',modelo:'Partner Van',ano:2022,km:28640,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Fiscalização',
   responsavel:'Ana Costa',localizacao:'Parque Municipal A'},
  {id:'v005',matricula:'11-QQ-22',patrimonio:'PAT-013',tipo:'ligeiro',categoria:'Veículo Elétrico',
   marca:'Renault',modelo:'Zoe',ano:2023,km:18900,combustivel:'Elétrico',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Fiscalização',
   responsavel:'Filipe Ribeiro',localizacao:'Parque Municipal A'},
  {id:'v006',matricula:'44-RR-55',patrimonio:'PAT-014',tipo:'ligeiro',categoria:'Veículo Elétrico',
   marca:'Nissan',modelo:'e-NV200',ano:2022,km:21500,combustivel:'Elétrico',
   ativo:true,estado_op:'manutencao',setor:'Setor B',departamento:'Serviço de Obras Municipais',
   responsavel:'Teresa Lopes',localizacao:'Oficina Municipal'},
  {id:'v007',matricula:'88-ZZ-11',patrimonio:'PAT-015',tipo:'ligeiro',categoria:'Viatura Fiscalização',
   marca:'Toyota',modelo:'Land Cruiser',ano:2020,km:63200,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor B',departamento:'Serviço de Proteção Civil',
   responsavel:'João Almeida',localizacao:'Parque Municipal B'},
  {id:'v008',matricula:'33-KK-77',patrimonio:'PAT-016',tipo:'ligeiro',categoria:'Carrinha Pick-up',
   marca:'Mitsubishi',modelo:'L200',ano:2019,km:94100,combustivel:'Diesel',
   ativo:false,estado_op:'inativo',setor:'Setor C',departamento:'Serviço de Obras Municipais',
   responsavel:'Pedro Santos',localizacao:'Parque Municipal C'},

  /* ── PESADOS ─────────────────────────────────────────────── */
  {id:'v009',matricula:'12-EF-34',patrimonio:'PAT-003',tipo:'pesado',categoria:'Camião de Resíduos',
   marca:'Mercedes-Benz',modelo:'Actros 2040',ano:2018,km:312400,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor B',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Rui Oliveira',localizacao:'Parque Municipal B'},
  {id:'v010',matricula:'56-GH-78',patrimonio:'PAT-004',tipo:'pesado',categoria:'Camião de Resíduos',
   marca:'Volvo',modelo:'FH 460',ano:2017,km:428700,combustivel:'Diesel',
   ativo:true,estado_op:'avaria',setor:'Setor B',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Miguel Pinto',localizacao:'Oficina Municipal'},
  {id:'v011',matricula:'11-OP-22',patrimonio:'PAT-008',tipo:'pesado',categoria:'Limpa Ruas',
   marca:'Scania',modelo:'R 450',ano:2019,km:198300,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor B',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Nuno Gomes',localizacao:'Parque Municipal B'},
  {id:'v012',matricula:'77-UV-88',patrimonio:'PAT-011',tipo:'pesado',categoria:'Camião Cisterna',
   marca:'MAN',modelo:'TGS 26.440',ano:2018,km:267500,combustivel:'Diesel',
   ativo:true,estado_op:'manutencao',setor:'Setor B',departamento:'Serviço de Jardins e Espaços Verdes',
   responsavel:'Sónia Faria',localizacao:'Oficina Municipal'},
  {id:'v013',matricula:'22-SS-44',patrimonio:'PAT-017',tipo:'pesado',categoria:'Transporte Municipal',
   marca:'Mercedes-Benz',modelo:'Sprinter 519',ano:2021,km:87600,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor C',departamento:'Serviço de Transportes',
   responsavel:'Isabel Carvalho',localizacao:'Parque Municipal C'},
  {id:'v014',matricula:'66-TT-33',patrimonio:'PAT-018',tipo:'pesado',categoria:'Plataforma Elevatória',
   marca:'Iveco',modelo:'Daily 70-210',ano:2020,km:42300,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Obras Municipais',
   responsavel:'Luís Martins',localizacao:'Parque Municipal A'},
  {id:'v015',matricula:'99-WW-55',patrimonio:'PAT-019',tipo:'pesado',categoria:'Camião Resíduos Orgânicos',
   marca:'Scania',modelo:'P280 DB',ano:2016,km:512000,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor C',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Vasco Freitas',localizacao:'Parque Municipal C'},
  {id:'v016',matricula:'55-VV-88',patrimonio:'PAT-020',tipo:'pesado',categoria:'Camião Grua',
   marca:'Mercedes-Benz',modelo:'Atego 1630',ano:2017,km:189400,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Obras Municipais',
   responsavel:'Marta Silva',localizacao:'Parque Municipal D'},
  {id:'v017',matricula:'11-XX-99',patrimonio:'PAT-021',tipo:'pesado',categoria:'Varredora Urbana',
   marca:'Faun',modelo:'Viajet 6R',ano:2019,km:134200,combustivel:'Diesel',
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Ricardo Nunes',localizacao:'Parque Municipal D'},

  /* ── MÁQUINAS ────────────────────────────────────────────── */
  {id:'v018',matricula:'90-IJ-12',patrimonio:'PAT-005',tipo:'maquina',categoria:'Retroescavadora',
   marca:'Caterpillar',modelo:'420F2',ano:2016,km:0,combustivel:'Diesel',horas:14200,
   ativo:true,estado_op:'operacional',setor:'Setor C',departamento:'Serviço de Obras Municipais',
   responsavel:'Bruno Dias',localizacao:'Parque Municipal C'},
  {id:'v019',matricula:'34-KL-56',patrimonio:'PAT-006',tipo:'maquina',categoria:'Retroescavadora',
   marca:'JCB',modelo:'3CX Contractor',ano:2015,km:0,combustivel:'Diesel',horas:18700,
   ativo:true,estado_op:'manutencao',setor:'Setor C',departamento:'Serviço de Obras Municipais',
   responsavel:'Hugo Teixeira',localizacao:'Oficina Municipal'},
  {id:'v020',matricula:'33-QR-44',patrimonio:'PAT-009',tipo:'maquina',categoria:'Mini Giratória',
   marca:'Komatsu',modelo:'PC210-10M',ano:2014,km:0,combustivel:'Diesel',horas:22400,
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Obras Municipais',
   responsavel:'Gonçalo Pereira',localizacao:'Parque Municipal D'},
  {id:'v021',matricula:'99-WX-00',patrimonio:'PAT-012',tipo:'maquina',categoria:'Pá Carregadora',
   marca:'Bobcat',modelo:'S650',ano:2020,km:0,combustivel:'Diesel',horas:6800,
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Meios Mecânicos',
   responsavel:'Cláudia Rocha',localizacao:'Parque Municipal D'},
  {id:'v022',matricula:'44-YY-88',patrimonio:'PAT-022',tipo:'maquina',categoria:'Cilindro Compactador',
   marca:'Dynapac',modelo:'CC1300',ano:2018,km:0,combustivel:'Diesel',horas:8900,
   ativo:true,estado_op:'operacional',setor:'Setor C',departamento:'Serviço de Obras Municipais',
   responsavel:'André Monteiro',localizacao:'Parque Municipal C'},
  {id:'v023',matricula:'77-ZZ-33',patrimonio:'PAT-023',tipo:'maquina',categoria:'Trator Agrícola',
   marca:'John Deere',modelo:'5090R',ano:2017,km:0,combustivel:'Diesel',horas:11300,
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Jardins e Espaços Verdes',
   responsavel:'Filomena Cruz',localizacao:'Parque Municipal D'},
  {id:'v024',matricula:'22-AA-66',patrimonio:'PAT-024',tipo:'maquina',categoria:'Grua Móvel',
   marca:'Liebherr',modelo:'LTM 1030-2.1',ano:2019,km:0,combustivel:'Diesel',horas:4500,
   ativo:true,estado_op:'operacional',setor:'Setor B',departamento:'Serviço de Obras Municipais',
   responsavel:'Diogo Araújo',localizacao:'Parque Municipal B'},
  {id:'v025',matricula:'55-BB-11',patrimonio:'PAT-025',tipo:'maquina',categoria:'Plataforma Elevatória',
   marca:'Haulotte',modelo:'H23TPX',ano:2021,km:0,combustivel:'Diesel',horas:2100,
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Obras Municipais',
   responsavel:'Raquel Fernandes',localizacao:'Parque Municipal A'},
  {id:'v026',matricula:'88-CC-44',patrimonio:'PAT-026',tipo:'maquina',categoria:'Mini Giratória',
   marca:'Kubota',modelo:'KX080-4',ano:2020,km:0,combustivel:'Diesel',horas:5600,
   ativo:true,estado_op:'avaria',setor:'Setor B',departamento:'Serviço de Obras Municipais',
   responsavel:'Tiago Moreira',localizacao:'Oficina Municipal'},
  {id:'v027',matricula:'11-DD-77',patrimonio:'PAT-027',tipo:'maquina',categoria:'Varredora Compacta',
   marca:'Bucher',modelo:'Schoerling Citycat 5000',ano:2018,km:0,combustivel:'Diesel',horas:9800,
   ativo:true,estado_op:'operacional',setor:'Setor A',departamento:'Serviço de Limpeza Urbana',
   responsavel:'Patrícia Neto',localizacao:'Parque Municipal A'},
  {id:'v028',matricula:'44-EE-22',patrimonio:'PAT-028',tipo:'maquina',categoria:'Pá Carregadora',
   marca:'Volvo',modelo:'L60H',ano:2016,km:0,combustivel:'Diesel',horas:16400,
   ativo:true,estado_op:'operacional',setor:'Setor C',departamento:'Serviço de Meios Mecânicos',
   responsavel:'Simão Baptista',localizacao:'Parque Municipal C'},
  {id:'v029',matricula:'77-FF-55',patrimonio:'PAT-029',tipo:'maquina',categoria:'Retroescavadora',
   marca:'Case',modelo:'580SN',ano:2015,km:0,combustivel:'Diesel',horas:19800,
   ativo:false,estado_op:'inativo',setor:'Setor D',departamento:'Serviço de Obras Municipais',
   responsavel:'Leonor Castro',localizacao:'Depósito Municipal'},
  {id:'v030',matricula:'22-GG-88',patrimonio:'PAT-030',tipo:'maquina',categoria:'Trator com Reboque',
   marca:'New Holland',modelo:'T5.110',ano:2019,km:0,combustivel:'Diesel',horas:7200,
   ativo:true,estado_op:'operacional',setor:'Setor D',departamento:'Serviço de Jardins e Espaços Verdes',
   responsavel:'Osvaldo Lima',localizacao:'Parque Municipal D'}
];

/* ================================================================
   ALERTAS — 1 registo de alertas por veículo com todas as datas
   ================================================================ */
const DADOS_ALERTAS = [
  // v001 23-AB-45 — Volkswagen Caddy · Setor A · Obras Municipais
  {id:'al001',veiculo_id:'v001',matricula:'23-AB-45',
   itp_ultima:_d(2025,3,20),itp_proxima:_d(2026,3,20),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,3,20),revisao_proxima:_d(2026,3,20),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:_d(2025,1,15),pneus_proxima:_d(2027,1,15),
   extintor_validade:_d(2026,3,1),
   higienizacao_ultima:_d(2025,3,1),higienizacao_proxima:_d(2025,9,1),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v002 67-CD-89 — Renault Kangoo · Setor A · Jardins
  {id:'al002',veiculo_id:'v002',matricula:'67-CD-89',
   itp_ultima:_d(2025,4,10),itp_proxima:_d(2026,4,10),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,12,15),revisao_proxima:_d(2025,12,15),
   oleo_ultima_data:_d(2025,4,12),oleo_proxima_data:_d(2025,10,12),
   pneus_ultima:_d(2024,10,1),pneus_proxima:_d(2026,10,1),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,12),higienizacao_proxima:_d(2025,10,12),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v003 78-MN-90 — Ford Ranger · Setor A · Fiscalização
  {id:'al003',veiculo_id:'v003',matricula:'78-MN-90',
   itp_ultima:_d(2025,3,15),itp_proxima:_d(2026,3,15),itp_antec:30,
   seguro_valido_ate:_d(2025,9,30),
   revisao_ultima:_d(2025,3,15),revisao_proxima:_d(2026,3,15),
   oleo_ultima_data:_d(2025,3,20),oleo_proxima_data:_d(2025,9,20),
   pneus_ultima:_d(2024,11,1),pneus_proxima:_d(2026,11,1),
   extintor_validade:_d(2026,6,1),
   higienizacao_ultima:_d(2025,3,15),higienizacao_proxima:_d(2025,9,15),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v004 55-ST-66 — Peugeot Partner · Setor A · Fiscalização
  {id:'al004',veiculo_id:'v004',matricula:'55-ST-66',
   itp_ultima:_d(2025,4,10),itp_proxima:_d(2026,4,10),itp_antec:30,
   seguro_valido_ate:_d(2025,11,30),
   revisao_ultima:_d(2025,4,10),revisao_proxima:_d(2026,4,10),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:_d(2024,8,1),pneus_proxima:_d(2026,8,1),
   extintor_validade:_d(2026,3,1),
   higienizacao_ultima:_d(2025,4,1),higienizacao_proxima:_d(2025,10,1),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v005 11-QQ-22 — Renault Zoe · Setor A · Fiscalização (Elétrico)
  {id:'al005',veiculo_id:'v005',matricula:'11-QQ-22',
   itp_ultima:_d(2025,3,15),itp_proxima:_d(2026,3,15),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,3,15),revisao_proxima:_d(2026,3,15),
   oleo_ultima_data:null,oleo_proxima_data:null,
   pneus_ultima:_d(2025,1,15),pneus_proxima:_d(2027,1,15),
   extintor_validade:_d(2027,1,1),
   higienizacao_ultima:_d(2025,3,10),higienizacao_proxima:_d(2025,9,10),
   licenciamento_validade:_d(2025,12,31),observacoes:'Veículo elétrico — sem mudança de óleo'},
  // v006 44-RR-55 — Nissan e-NV200 · Setor B · Obras (Elétrico, manutenção)
  {id:'al006',veiculo_id:'v006',matricula:'44-RR-55',
   itp_ultima:_d(2025,4,20),itp_proxima:_d(2026,4,20),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,20),revisao_proxima:_d(2026,4,20),
   oleo_ultima_data:null,oleo_proxima_data:null,
   pneus_ultima:_d(2025,4,20),pneus_proxima:_d(2027,4,20),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,20),higienizacao_proxima:_d(2025,10,20),
   licenciamento_validade:_d(2025,12,31),observacoes:'Veículo elétrico em manutenção preventiva'},
  // v007 88-ZZ-11
  {id:'al007',veiculo_id:'v007',matricula:'88-ZZ-11',
   itp_ultima:_d(2024,7,8),itp_proxima:_d(2025,7,8),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,1,8),revisao_proxima:_d(2026,1,8),
   oleo_ultima_data:_d(2024,12,10),oleo_proxima_data:_d(2025,6,10),
   pneus_ultima:_d(2024,7,8),pneus_proxima:_d(2026,7,8),
   extintor_validade:_d(2026,7,1),
   higienizacao_ultima:_d(2025,2,1),higienizacao_proxima:_d(2025,8,1),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v008 33-KK-77 — inativo
  {id:'al008',veiculo_id:'v008',matricula:'33-KK-77',
   itp_ultima:_d(2022,5,1),itp_proxima:_d(2023,5,1),itp_antec:30,
   seguro_valido_ate:_d(2024,5,1),
   revisao_ultima:_d(2022,5,1),revisao_proxima:_d(2023,5,1),
   oleo_ultima_data:_d(2022,5,1),oleo_proxima_data:_d(2023,5,1),
   pneus_ultima:_d(2021,1,1),pneus_proxima:_d(2023,1,1),
   extintor_validade:_d(2023,1,1),
   higienizacao_ultima:_d(2022,5,1),higienizacao_proxima:_d(2023,5,1),
   licenciamento_validade:_d(2024,12,31),observacoes:'Veículo inativo — documentação toda expirada'},
  // v009 12-EF-34 — Mercedes Actros · Camião Resíduos · Setor B · Limpeza Urbana
  {id:'al009',veiculo_id:'v009',matricula:'12-EF-34',
   itp_ultima:_d(2025,4,15),itp_proxima:_d(2026,4,15),itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,15),revisao_proxima:_d(2025,10,15),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:_d(2025,2,20),pneus_proxima:_d(2026,2,20),
   tacografo_ultima:_d(2023,4,15),tacografo_proxima:_d(2027,4,15),
   grua_ultima:_d(2024,4,15),grua_proxima:_d(2025,5,28),
   caixa_ultima:_d(2024,4,15),caixa_proxima:_d(2025,4,15),
   extintor_validade:_d(2025,10,1),
   higienizacao_ultima:_d(2025,4,10),higienizacao_proxima:_d(2025,7,10),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de caixa compactadora e grua auxiliar a vencer'},
  // v010 56-GH-78 — Volvo FH · Camião Resíduos · Setor B · avaria grave
  {id:'al010',veiculo_id:'v010',matricula:'56-GH-78',
   itp_ultima:_d(2024,4,5),itp_proxima:_d(2025,4,5),itp_antec:60,
   seguro_valido_ate:_d(2025,11,30),
   revisao_ultima:_d(2024,4,5),revisao_proxima:_d(2025,4,5),
   oleo_ultima_data:_d(2024,10,1),oleo_proxima_data:_d(2025,4,1),
   pneus_ultima:_d(2023,6,1),pneus_proxima:_d(2025,6,1),
   tacografo_ultima:_d(2023,4,5),tacografo_proxima:_d(2027,4,5),
   grua_ultima:_d(2023,4,5),grua_proxima:_d(2025,4,5),
   caixa_ultima:_d(2024,4,5),caixa_proxima:_d(2025,4,5),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2024,10,5),higienizacao_proxima:_d(2025,4,5),
   licenciamento_validade:_d(2025,12,31),observacoes:'Veículo em avaria grave — ITP, revisão e óleo a requerer renovação urgente'},
  // v011 11-OP-22 — Scania R450 · Limpa Ruas · Setor B · Limpeza Urbana
  {id:'al011',veiculo_id:'v011',matricula:'11-OP-22',
   itp_ultima:_d(2025,4,20),itp_proxima:_d(2026,4,20),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,20),revisao_proxima:_d(2025,10,20),
   oleo_ultima_data:_d(2025,4,5),oleo_proxima_data:_d(2025,10,5),
   pneus_ultima:_d(2025,2,1),pneus_proxima:_d(2026,2,1),
   tacografo_ultima:_d(2023,4,15),tacografo_proxima:_d(2027,4,15),
   caixa_ultima:_d(2024,5,20),caixa_proxima:_d(2025,5,20),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,5),higienizacao_proxima:_d(2025,10,5),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de caixa de varrição a vencer em breve'},
  // v012 77-UV-88 — MAN TGS · Camião Cisterna · Setor B · Jardins (manutenção)
  {id:'al012',veiculo_id:'v012',matricula:'77-UV-88',
   itp_ultima:_d(2025,4,5),itp_proxima:_d(2026,4,5),itp_antec:45,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,5),revisao_proxima:_d(2025,10,5),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:_d(2025,3,10),pneus_proxima:_d(2026,3,10),
   tacografo_ultima:_d(2024,4,5),tacografo_proxima:_d(2028,4,5),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,5),higienizacao_proxima:_d(2025,7,5),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v013 22-SS-44 Sprinter transporte
  {id:'al013',veiculo_id:'v013',matricula:'22-SS-44',
   itp_ultima:_d(2024,8,10),itp_proxima:_d(2025,8,10),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,2,10),revisao_proxima:_d(2026,2,10),
   oleo_ultima_data:_d(2025,2,10),oleo_proxima_data:_d(2025,8,10),
   pneus_ultima:_d(2024,8,10),pneus_proxima:_d(2026,8,10),
   extintor_validade:_d(2026,8,1),
   higienizacao_ultima:_d(2025,2,10),higienizacao_proxima:_d(2025,8,10),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v014 66-TT-33 — Iveco Daily · Plataforma Elevatória · Setor A · Obras
  {id:'al014',veiculo_id:'v014',matricula:'66-TT-33',
   itp_ultima:_d(2025,4,25),itp_proxima:_d(2026,4,25),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,25),revisao_proxima:_d(2025,10,25),
   oleo_ultima_data:_d(2025,4,20),oleo_proxima_data:_d(2025,10,20),
   pneus_ultima:_d(2025,1,20),pneus_proxima:_d(2026,7,20),
   grua_ultima:_d(2024,5,25),grua_proxima:_d(2025,6,10),
   caixa_ultima:_d(2024,5,25),caixa_proxima:_d(2025,5,25),
   extintor_validade:_d(2026,5,1),
   higienizacao_ultima:_d(2025,4,20),higienizacao_proxima:_d(2025,10,20),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de grua e caixa a vencer — agendar inspeção'},
  // v015 99-WW-55 — Scania P280 · Camião Resíduos Orgânicos · Setor C · Limpeza Urbana
  {id:'al015',veiculo_id:'v015',matricula:'99-WW-55',
   itp_ultima:_d(2025,3,10),itp_proxima:_d(2026,3,10),itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,3,10),revisao_proxima:_d(2025,9,10),
   oleo_ultima_data:_d(2025,3,10),oleo_proxima_data:_d(2025,9,10),
   pneus_ultima:_d(2025,1,15),pneus_proxima:_d(2026,1,15),
   tacografo_ultima:_d(2023,3,10),tacografo_proxima:_d(2027,3,10),
   caixa_ultima:_d(2024,3,10),caixa_proxima:_d(2025,6,15),
   extintor_validade:_d(2026,3,1),
   higienizacao_ultima:_d(2025,3,10),higienizacao_proxima:_d(2025,6,10),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de caixa compactadora a vencer — veículo de resíduos orgânicos'},
  // v016 55-VV-88 — Mercedes Atego · Camião Grua · Setor D · Obras Municipais
  {id:'al016',veiculo_id:'v016',matricula:'55-VV-88',
   itp_ultima:_d(2025,4,18),itp_proxima:_d(2026,4,18),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,18),revisao_proxima:_d(2025,10,18),
   oleo_ultima_data:_d(2025,4,15),oleo_proxima_data:_d(2025,10,15),
   pneus_ultima:_d(2025,2,10),pneus_proxima:_d(2026,8,10),
   grua_ultima:_d(2025,2,10),grua_proxima:_d(2025,6,5),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,10),higienizacao_proxima:_d(2025,10,10),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de grua articulada a vencer — agendar inspeção CERTIF'},
  // v017 11-XX-99 — Faun Viajet · Varredora Urbana · Setor D · Limpeza Urbana
  {id:'al017',veiculo_id:'v017',matricula:'11-XX-99',
   itp_ultima:_d(2025,3,20),itp_proxima:_d(2026,3,20),itp_antec:30,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,3,20),revisao_proxima:_d(2025,9,20),
   oleo_ultima_data:_d(2025,3,20),oleo_proxima_data:_d(2025,9,20),
   pneus_ultima:_d(2025,1,5),pneus_proxima:_d(2026,7,5),
   tacografo_ultima:_d(2023,3,20),tacografo_proxima:_d(2027,3,20),
   caixa_ultima:_d(2025,3,20),caixa_proxima:_d(2026,3,20),
   extintor_validade:_d(2027,1,1),
   higienizacao_ultima:_d(2025,3,20),higienizacao_proxima:_d(2025,9,20),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de caixa de varrição renovada — válida até março 2026'},
  // v018 90-IJ-12 Caterpillar retro
  {id:'al018',veiculo_id:'v018',matricula:'90-IJ-12',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,8,20),revisao_proxima:_d(2025,8,20),
   oleo_ultima_data:_d(2025,2,20),oleo_proxima_data:_d(2025,8,20),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,8,1),
   higienizacao_ultima:_d(2025,2,20),higienizacao_proxima:_d(2025,8,20),
   licenciamento_validade:_d(2025,12,31),observacoes:'Máquina — sem ITP'},
  // v019 34-KL-56 — JCB 3CX · Retroescavadora · Setor C · Obras (manutenção)
  {id:'al019',veiculo_id:'v019',matricula:'34-KL-56',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,14),revisao_proxima:_d(2025,10,14),
   oleo_ultima_data:_d(2025,4,14),oleo_proxima_data:_d(2025,10,14),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,14),higienizacao_proxima:_d(2025,10,14),
   licenciamento_validade:_d(2025,12,31),observacoes:'Revisão e óleo efetuados — máquina em manutenção programada'},
  // v020 33-QR-44 — Komatsu PC210 · Mini Giratória · Setor D · Obras
  {id:'al020',veiculo_id:'v020',matricula:'33-QR-44',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,10),revisao_proxima:_d(2025,10,10),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,10),higienizacao_proxima:_d(2025,10,10),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v021 99-WX-00 Bobcat
  {id:'al021',veiculo_id:'v021',matricula:'99-WX-00',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,12),revisao_proxima:_d(2026,4,12),
   oleo_ultima_data:_d(2025,4,12),oleo_proxima_data:_d(2025,10,12),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2027,4,1),
   higienizacao_ultima:_d(2025,4,12),higienizacao_proxima:_d(2025,10,12),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v022 44-YY-88 Cilindro
  {id:'al022',veiculo_id:'v022',matricula:'44-YY-88',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,11,1),revisao_proxima:_d(2025,11,1),
   oleo_ultima_data:_d(2025,3,1),oleo_proxima_data:_d(2025,9,1),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,11,1),
   higienizacao_ultima:_d(2025,3,1),higienizacao_proxima:_d(2025,9,1),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v023 77-ZZ-33 Trator
  {id:'al023',veiculo_id:'v023',matricula:'77-ZZ-33',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,7,15),revisao_proxima:_d(2025,7,15),
   oleo_ultima_data:_d(2025,1,15),oleo_proxima_data:_d(2025,7,15),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,7,1),
   higienizacao_ultima:_d(2025,1,15),higienizacao_proxima:_d(2025,7,15),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v024 22-AA-66 — Liebherr LTM · Grua Móvel · Setor B · Obras Municipais
  {id:'al024',veiculo_id:'v024',matricula:'22-AA-66',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,3,20),revisao_proxima:_d(2025,9,20),
   oleo_ultima_data:_d(2025,3,20),oleo_proxima_data:_d(2025,9,20),
   pneus_ultima:null,pneus_proxima:null,
   grua_ultima:_d(2025,3,20),grua_proxima:_d(2025,6,20),
   extintor_validade:_d(2026,3,1),
   higienizacao_ultima:_d(2025,3,20),higienizacao_proxima:_d(2025,9,20),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de grua móvel (ACSS/IMTT) a vencer em junho — agendar'},
  // v025 55-BB-11 — Haulotte H23TPX · Plataforma Elevatória · Setor A · Obras
  {id:'al025',veiculo_id:'v025',matricula:'55-BB-11',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,15),revisao_proxima:_d(2026,4,15),
   oleo_ultima_data:_d(2025,4,15),oleo_proxima_data:_d(2025,10,15),
   pneus_ultima:null,pneus_proxima:null,
   caixa_ultima:_d(2025,4,15),caixa_proxima:_d(2026,4,15),
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,15),higienizacao_proxima:_d(2025,10,15),
   licenciamento_validade:_d(2025,12,31),observacoes:'Certificação de caixa elevatória renovada em abril 2025'},
  // v026 88-CC-44 Kubota — avaria
  {id:'al026',veiculo_id:'v026',matricula:'88-CC-44',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,10,8),revisao_proxima:_d(2025,10,8),
   oleo_ultima_data:_d(2025,4,8),oleo_proxima_data:_d(2025,10,8),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,10,1),
   higienizacao_ultima:_d(2025,4,8),higienizacao_proxima:_d(2025,10,8),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v027 11-DD-77 Bucher varredora
  {id:'al027',veiculo_id:'v027',matricula:'11-DD-77',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2024,12,20),revisao_proxima:_d(2025,12,20),
   oleo_ultima_data:_d(2025,3,20),oleo_proxima_data:_d(2025,9,20),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,12,1),
   higienizacao_ultima:_d(2025,3,20),higienizacao_proxima:_d(2025,9,20),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v028 44-EE-22 — Volvo L60H · Pá Carregadora · Setor C · Meios Mecânicos
  {id:'al028',veiculo_id:'v028',matricula:'44-EE-22',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,4,10),revisao_proxima:_d(2025,10,10),
   oleo_ultima_data:_d(2025,4,10),oleo_proxima_data:_d(2025,10,10),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,4,1),
   higienizacao_ultima:_d(2025,4,10),higienizacao_proxima:_d(2025,10,10),
   licenciamento_validade:_d(2025,12,31),observacoes:''},
  // v029 77-FF-55 Case — inativo
  {id:'al029',veiculo_id:'v029',matricula:'77-FF-55',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2023,1,1),
   revisao_ultima:_d(2022,1,1),revisao_proxima:_d(2023,1,1),
   oleo_ultima_data:_d(2022,1,1),oleo_proxima_data:_d(2023,1,1),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2023,1,1),
   higienizacao_ultima:_d(2022,1,1),higienizacao_proxima:_d(2023,1,1),
   licenciamento_validade:_d(2023,12,31),observacoes:'Máquina inativa — toda a documentação expirada'},
  // v030 22-GG-88 New Holland
  {id:'al030',veiculo_id:'v030',matricula:'22-GG-88',
   itp_ultima:null,itp_proxima:null,itp_antec:60,
   seguro_valido_ate:_d(2025,12,31),
   revisao_ultima:_d(2025,1,10),revisao_proxima:_d(2026,1,10),
   oleo_ultima_data:_d(2025,1,10),oleo_proxima_data:_d(2025,7,10),
   pneus_ultima:null,pneus_proxima:null,
   extintor_validade:_d(2026,1,1),
   higienizacao_ultima:_d(2025,1,10),higienizacao_proxima:_d(2025,7,10),
   licenciamento_validade:_d(2025,12,31),observacoes:''}
];

/* ================================================================
   OBRAS — 20 registos ricos
   ================================================================ */
function iso(d,h='08:00'){return `${d}T${h}:00`;}

const DADOS_OBRAS = [
  {id:'o001',numero_obra:'OBR-2024-001',veiculo_id:'v001',matricula:'23-AB-45',patrimonio:'PAT-001',setor_snapshot:'Setor A',
   data_entrada:iso('2024-01-15','08:00'),data_saida:iso('2024-01-17','16:30'),estado:'fechada',
   tipos_intervencao:['Manutenção preventiva'],descricao_avaria:'Mudança de óleo e filtros programada. Veículo atingiu os 15.000 km.',
   trabalhos_realizados:'Substituição de óleo motor 5W-40. Filtro de óleo e ar. Verificação de fluidos e correia auxiliar.',
   pecas_materiais:'1x Óleo motor 5W-40 (5L) — 28,50€\n1x Filtro de óleo — 12,80€\n1x Filtro de ar — 18,90€',
   servicos_externos:'',custo_mao_obra:45,custo_servicos_externos:0,custo_materiais:60.20,custo_total:105.20},
  {id:'o002',numero_obra:'OBR-2024-002',veiculo_id:'v009',matricula:'12-EF-34',patrimonio:'PAT-003',setor_snapshot:'Setor B',
   data_entrada:iso('2024-02-05','09:30'),data_saida:iso('2024-02-12','17:00'),estado:'fechada',
   tipos_intervencao:['Reparação'],descricao_avaria:'Falha no sistema de travões. Pedal mole e ruído ao travar.',
   trabalhos_realizados:'Substituição de pastilhas e discos dianteiros. Purga do líquido de travões.',
   pecas_materiais:'2x Discos travão — 145,00€\n1x Pastilhas — 68,50€\n1x Líquido DOT4 — 9,80€',
   servicos_externos:'Alinhamento em oficina externa — 85,00€',
   custo_mao_obra:120,custo_servicos_externos:85,custo_materiais:223.30,custo_total:428.30},
  {id:'o003',numero_obra:'OBR-2024-003',veiculo_id:'v018',matricula:'90-IJ-12',patrimonio:'PAT-005',setor_snapshot:'Setor C',
   data_entrada:iso('2024-02-20','10:00'),data_saida:iso('2024-03-05','12:00'),estado:'fechada',
   tipos_intervencao:['Avaria hidráulica','Reparação'],descricao_avaria:'Perda de pressão na pá frontal. Fuga de óleo hidráulico.',
   trabalhos_realizados:'Substituição de mangueira hidráulica. Troca de óleo hidráulico. Teste de pressão.',
   pecas_materiais:'1x Mangueira DN16 — 89,00€\n60L Óleo HV46 — 156,00€\nKit vedantes — 45,00€',
   servicos_externos:'Técnico especializado — 220,00€',
   custo_mao_obra:180,custo_servicos_externos:220,custo_materiais:290,custo_total:690},
  {id:'o004',numero_obra:'OBR-2024-004',veiculo_id:'v003',matricula:'78-MN-90',patrimonio:'PAT-007',setor_snapshot:'Setor A',
   data_entrada:iso('2024-03-10','08:00'),data_saida:iso('2024-03-11','15:30'),estado:'fechada',
   tipos_intervencao:['Substituição de pneus','Manutenção preventiva'],descricao_avaria:'Pneus dianteiros com desgaste excessivo.',
   trabalhos_realizados:'Substituição dos 2 pneus dianteiros. Equilibragem e balanceamento.',
   pecas_materiais:'2x Pneu 205/65R16C — 185,00€\nEquilibragem — 20,00€',
   servicos_externos:'',custo_mao_obra:30,custo_servicos_externos:0,custo_materiais:205,custo_total:235},
  {id:'o005',numero_obra:'OBR-2024-005',veiculo_id:'v010',matricula:'56-GH-78',patrimonio:'PAT-004',setor_snapshot:'Setor B',
   data_entrada:iso('2024-03-18','14:00'),data_saida:iso('2024-04-02','11:00'),estado:'fechada',
   tipos_intervencao:['Avaria motor','Reparação'],descricao_avaria:'Motor com perda de potência, fumo azul e consumo excessivo de óleo.',
   trabalhos_realizados:'Desmontagem e retificação do bloco. Substituição de segmentos, vedantes e juntas.',
   pecas_materiais:'Kit retificação — 820,00€\nJuntas — 145,00€\nÓleo 10W-40 — 89,00€',
   servicos_externos:'Retificação em oficina — 1.200,00€',
   custo_mao_obra:480,custo_servicos_externos:1200,custo_materiais:1054,custo_total:2734},
  {id:'o006',numero_obra:'OBR-2024-006',veiculo_id:'v002',matricula:'67-CD-89',patrimonio:'PAT-002',setor_snapshot:'Setor A',
   data_entrada:iso('2024-04-08','09:00'),data_saida:iso('2024-04-09','16:30'),estado:'fechada',
   tipos_intervencao:['Revisão geral'],descricao_avaria:'Revisão geral programada anual. Veículo com 20.000 km.',
   trabalhos_realizados:'Mudança de óleo e filtros. Filtro habitáculo. Verificação elétrica. Lubrificação geral.',
   pecas_materiais:'Óleo + filtros — 75,00€\nFiltro habitáculo — 22,00€',
   servicos_externos:'',custo_mao_obra:90,custo_servicos_externos:0,custo_materiais:97,custo_total:187},
  {id:'o007',numero_obra:'OBR-2024-007',veiculo_id:'v019',matricula:'34-KL-56',patrimonio:'PAT-006',setor_snapshot:'Setor C',
   data_entrada:iso('2024-05-14','08:00'),data_saida:iso('2024-05-16','17:00'),estado:'fechada',
   tipos_intervencao:['Avaria elétrica','Reparação'],descricao_avaria:'Retroescavadora sem arranque. Bateria descarregada repetidamente.',
   trabalhos_realizados:'Diagnóstico elétrico. Substituição do alternador e bateria.',
   pecas_materiais:'1x Alternador — 340,00€\n1x Bateria 100Ah — 185,00€',
   servicos_externos:'',custo_mao_obra:95,custo_servicos_externos:0,custo_materiais:525,custo_total:620},
  {id:'o008',numero_obra:'OBR-2024-008',veiculo_id:'v020',matricula:'33-QR-44',patrimonio:'PAT-009',setor_snapshot:'Setor D',
   data_entrada:iso('2024-06-01','10:00'),data_saida:iso('2024-06-15','16:00'),estado:'fechada',
   tipos_intervencao:['Avaria hidráulica','Reparação'],descricao_avaria:'Lagartas com desgaste excessivo. Risco de paragem em obra.',
   trabalhos_realizados:'Substituição do conjunto de lagartas. Verificação e aperto de rolamentos.',
   pecas_materiais:'Kit lagartas completo — 2.850,00€\nRolamentos — 320,00€',
   servicos_externos:'Técnico Komatsu — 450,00€',
   custo_mao_obra:280,custo_servicos_externos:450,custo_materiais:3170,custo_total:3900},
  {id:'o009',numero_obra:'OBR-2024-009',veiculo_id:'v011',matricula:'11-OP-22',patrimonio:'PAT-008',setor_snapshot:'Setor B',
   data_entrada:iso('2024-07-03','08:30'),data_saida:iso('2024-07-05','17:00'),estado:'fechada',
   tipos_intervencao:['Inspeção','Manutenção preventiva'],descricao_avaria:'Inspeção periódica obrigatória e manutenção programada.',
   trabalhos_realizados:'Inspeção completa. Mudança de óleo motor e caixa. Filtros. Verificação de luzes e sinalizadores.',
   pecas_materiais:'Óleos + filtros — 185,00€\nLâmpadas — 28,00€',
   servicos_externos:'Inspeção técnica — 145,00€',
   custo_mao_obra:120,custo_servicos_externos:145,custo_materiais:213,custo_total:478},
  {id:'o010',numero_obra:'OBR-2024-010',veiculo_id:'v024',matricula:'22-AA-66',patrimonio:'PAT-024',setor_snapshot:'Setor B',
   data_entrada:iso('2024-08-12','09:00'),data_saida:iso('2024-08-20','17:00'),estado:'fechada',
   tipos_intervencao:['Revisão geral','Inspeção'],descricao_avaria:'Revisão anual obrigatória. Verificação certificação de grua.',
   trabalhos_realizados:'Revisão geral completa. Lubrificação de todos os pontos. Teste de carga da grua.',
   pecas_materiais:'Kit revisão — 420,00€\nFluidos e lubrificantes — 180,00€',
   servicos_externos:'Inspeção certificação grua — 680,00€',
   custo_mao_obra:320,custo_servicos_externos:680,custo_materiais:600,custo_total:1600},
  {id:'o011',numero_obra:'OBR-2024-011',veiculo_id:'v007',matricula:'88-ZZ-11',patrimonio:'PAT-015',setor_snapshot:'Setor B',
   data_entrada:iso('2024-09-02','08:00'),data_saida:iso('2024-09-04','15:00'),estado:'fechada',
   tipos_intervencao:['Carroçaria / Pintura','Reparação'],descricao_avaria:'Colisão ligeira no lado esquerdo em manobra. Amolgadela na porta traseira.',
   trabalhos_realizados:'Reparação de lataria. Pintura parcial — porta traseira esquerda.',
   pecas_materiais:'Materiais de pintura — 145,00€',
   servicos_externos:'Oficina de lataria — 520,00€',
   custo_mao_obra:0,custo_servicos_externos:520,custo_materiais:145,custo_total:665},
  {id:'o012',numero_obra:'OBR-2024-012',veiculo_id:'v012',matricula:'77-UV-88',patrimonio:'PAT-011',setor_snapshot:'Setor B',
   data_entrada:iso('2024-10-14','10:00'),data_saida:iso('2024-10-18','17:00'),estado:'fechada',
   tipos_intervencao:['Manutenção preventiva','Avaria hidráulica'],descricao_avaria:'Manutenção preventiva semestral. Verificação do sistema de distribuição de água.',
   trabalhos_realizados:'Óleo hidráulico trocado. Filtro hidráulico substituído. Verificação válvulas.',
   pecas_materiais:'Óleo hidráulico + filtro — 215,00€\nJunta da válvula — 45,00€',
   servicos_externos:'',custo_mao_obra:90,custo_servicos_externos:0,custo_materiais:260,custo_total:350},
  {id:'o013',numero_obra:'OBR-2024-013',veiculo_id:'v015',matricula:'99-WW-55',patrimonio:'PAT-019',setor_snapshot:'Setor C',
   data_entrada:iso('2024-11-05','08:00'),data_saida:iso('2024-11-20','17:00'),estado:'fechada',
   tipos_intervencao:['Substituição de pneus','Reparação'],descricao_avaria:'Pneus com desgaste irregular. Sistema de direção com folga excessiva.',
   trabalhos_realizados:'Substituição dos 4 pneus traseiros. Reparação da caixa de direção. Alinhamento.',
   pecas_materiais:'4x Pneus 315/80R22.5 — 1.840,00€\nPeças direção — 380,00€',
   servicos_externos:'Alinhamento oficina — 120,00€',
   custo_mao_obra:240,custo_servicos_externos:120,custo_materiais:2220,custo_total:2580},
  {id:'o014',numero_obra:'OBR-2024-014',veiculo_id:'v025',matricula:'55-BB-11',patrimonio:'PAT-025',setor_snapshot:'Setor A',
   data_entrada:iso('2024-12-02','08:00'),data_saida:iso('2024-12-06','17:00'),estado:'fechada',
   tipos_intervencao:['Revisão geral','Inspeção'],descricao_avaria:'Revisão anual plataforma elevatória. Certificação de caixa.',
   trabalhos_realizados:'Revisão completa. Teste de carga. Substituição de mangueiras hidráulicas antigas.',
   pecas_materiais:'Mangueiras hidráulicas — 380,00€\nKit vedantes — 95,00€',
   servicos_externos:'Certificação entidade acreditada — 890,00€',
   custo_mao_obra:180,custo_servicos_externos:890,custo_materiais:475,custo_total:1545},
  {id:'o015',numero_obra:'OBR-2025-001',veiculo_id:'v004',matricula:'55-ST-66',patrimonio:'PAT-010',setor_snapshot:'Setor A',
   data_entrada:iso('2025-01-08','09:00'),data_saida:iso('2025-01-09','16:00'),estado:'fechada',
   tipos_intervencao:['Manutenção preventiva'],descricao_avaria:'Mudança de óleo. Veículo atingiu os 10.000 km programados.',
   trabalhos_realizados:'Drenagem e substituição de óleo 5W-30. Filtro de óleo e habitáculo.',
   pecas_materiais:'Óleo 5W-30 + filtros — 52,00€',
   servicos_externos:'',custo_mao_obra:35,custo_servicos_externos:0,custo_materiais:52,custo_total:87},
  {id:'o016',numero_obra:'OBR-2025-002',veiculo_id:'v016',matricula:'55-VV-88',patrimonio:'PAT-020',setor_snapshot:'Setor D',
   data_entrada:iso('2025-02-03','08:00'),data_saida:iso('2025-02-07','17:00'),estado:'fechada',
   tipos_intervencao:['Inspeção','Revisão geral'],descricao_avaria:'Revisão programada camião grua. Renovação certificação.',
   trabalhos_realizados:'Revisão mecânica completa. Inspeção estrutural da grua. Lubrificação dos sistemas.',
   pecas_materiais:'Kit revisão — 380,00€\nLubrificantes especiais — 145,00€',
   servicos_externos:'Inspeção certificação grua — 720,00€',
   custo_mao_obra:280,custo_servicos_externos:720,custo_materiais:525,custo_total:1525},
  {id:'o017',numero_obra:'OBR-2025-003',veiculo_id:'v011',matricula:'11-OP-22',patrimonio:'PAT-008',setor_snapshot:'Setor B',
   data_entrada:iso('2025-03-10','08:30'),data_saida:null,estado:'aberta',
   tipos_intervencao:['Inspeção'],descricao_avaria:'Inspeção periódica obrigatória — prazo a vencer a 15/04/2025.',
   trabalhos_realizados:'Verificação de luzes e sinalizadores. Verificação de travões.',
   pecas_materiais:'Lâmpadas — 15,00€',
   servicos_externos:'Inspeção técnica — 145,00€',
   custo_mao_obra:60,custo_servicos_externos:145,custo_materiais:15,custo_total:0},
  {id:'o018',numero_obra:'OBR-2025-004',veiculo_id:'v020',matricula:'33-QR-44',patrimonio:'PAT-009',setor_snapshot:'Setor D',
   data_entrada:iso('2025-04-01','10:00'),data_saida:null,estado:'aberta',
   tipos_intervencao:['Avaria hidráulica'],descricao_avaria:'Falha no cilindro hidráulico do braço. Perda total de pressão.',
   trabalhos_realizados:'',pecas_materiais:'',servicos_externos:'',
   custo_mao_obra:0,custo_servicos_externos:0,custo_materiais:0,custo_total:0},
  {id:'o019',numero_obra:'OBR-2025-005',veiculo_id:'v010',matricula:'56-GH-78',patrimonio:'PAT-004',setor_snapshot:'Setor B',
   data_entrada:iso('2025-04-05','14:00'),data_saida:null,estado:'aberta',
   tipos_intervencao:['Reparação','Avaria motor'],descricao_avaria:'Fuga de combustível. Veículo imobilizado por segurança.',
   trabalhos_realizados:'',pecas_materiais:'',servicos_externos:'',
   custo_mao_obra:0,custo_servicos_externos:0,custo_materiais:0,custo_total:0},
  {id:'o020',numero_obra:'OBR-2025-006',veiculo_id:'v026',matricula:'88-CC-44',patrimonio:'PAT-026',setor_snapshot:'Setor B',
   data_entrada:iso('2025-04-08','08:00'),data_saida:null,estado:'aberta',
   tipos_intervencao:['Avaria elétrica','Avaria hidráulica'],descricao_avaria:'Falha simultânea no sistema elétrico e hidráulico. Máquina parada em obra.',
   trabalhos_realizados:'Diagnóstico iniciado. Aguarda peças.',pecas_materiais:'',servicos_externos:'',
   custo_mao_obra:0,custo_servicos_externos:0,custo_materiais:0,custo_total:0}
];

/* ================================================================
   ITP — mantidos para compatibilidade (fusionado em ALERTAS)
   ================================================================ */
const DADOS_ITP = DADOS_ALERTAS
  .filter(a=>a.itp_proxima)
  .map(a=>({
    id:'itp'+a.id,
    veiculo_id:a.veiculo_id,
    matricula:a.matricula,
    ultima_itp:a.itp_ultima,
    proxima_itp:a.itp_proxima,
    antecedencia_dias:a.itp_antec||30,
    observacoes:a.observacoes||''
  }));

/* ================================================================
   REQUISIÇÕES
   ================================================================ */
const DADOS_REQUISICOES = [
  {id:'req001',numero_req:'REQ-2025-001',veiculo_id:'v001',matricula:'23-AB-45',obra_id:'o001',tipo:'material',descricao:'Óleo motor e filtros para VW Caddy',valor:88.70,data:'2025-01-15',estado:'concluida',fornecedor:'Auto Peças Silva, Lda.',observacoes:''},
  {id:'req002',numero_req:'REQ-2025-002',veiculo_id:'v009',matricula:'12-EF-34',obra_id:'o002',tipo:'servico',descricao:'Alinhamento e equilíbrio em oficina externa',valor:85.00,data:'2025-02-12',estado:'concluida',fornecedor:'Oficina Central, Lda.',observacoes:''},
  {id:'req003',numero_req:'REQ-2025-003',veiculo_id:'v018',matricula:'90-IJ-12',obra_id:'o003',tipo:'material',descricao:'Mangueira hidráulica DN16 e óleo HV46',valor:245.00,data:'2025-02-20',estado:'aprovada',fornecedor:'HydroTech Portugal',observacoes:'Urgente'},
  {id:'req004',numero_req:'REQ-2025-004',veiculo_id:'v010',matricula:'56-GH-78',obra_id:'o005',tipo:'servico',descricao:'Retificação de motor Volvo FH460',valor:1200.00,data:'2025-03-18',estado:'concluida',fornecedor:'Motor Center Porto',observacoes:''},
  {id:'req005',numero_req:'REQ-2025-005',veiculo_id:'v020',matricula:'33-QR-44',obra_id:'o008',tipo:'material',descricao:'Kit de lagartas completo Komatsu PC210',valor:3170.00,data:'2025-06-01',estado:'concluida',fornecedor:'Komatsu Ibérica',observacoes:''},
  {id:'req006',numero_req:'REQ-2025-006',veiculo_id:'v024',matricula:'22-AA-66',obra_id:'o010',tipo:'servico',descricao:'Inspeção e certificação de grua Liebherr',valor:680.00,data:'2025-08-12',estado:'concluida',fornecedor:'SGS Portugal',observacoes:''},
  {id:'req007',numero_req:'REQ-2025-007',veiculo_id:'v015',matricula:'99-WW-55',obra_id:'o013',tipo:'material',descricao:'4x Pneus 315/80R22.5 Michelin',valor:1840.00,data:'2025-11-05',estado:'concluida',fornecedor:'Pneus & Cia',observacoes:''},
  {id:'req008',numero_req:'REQ-2025-008',veiculo_id:'v011',matricula:'11-OP-22',obra_id:'o017',tipo:'servico',descricao:'Inspeção técnica periódica Scania R450',valor:145.00,data:'2025-03-10',estado:'pendente',fornecedor:'Centro de Inspeção Mota',observacoes:'A aguardar marcação'},
  {id:'req009',numero_req:'REQ-2025-009',veiculo_id:'v010',matricula:'56-GH-78',obra_id:'o019',tipo:'material',descricao:'Peças reparação fuga combustível Volvo FH',valor:380.00,data:'2025-04-05',estado:'pendente',fornecedor:'',observacoes:'A aguardar orçamento'},
  {id:'req010',numero_req:'REQ-2025-010',veiculo_id:'v026',matricula:'88-CC-44',obra_id:'o020',tipo:'material',descricao:'Componentes elétricos e hidráulicos Kubota',valor:520.00,data:'2025-04-08',estado:'aprovada',fornecedor:'Agri-Peças Norte',observacoes:'Urgente — máquina parada'}
];

/* ================================================================
   FATURAS
   ================================================================ */
const DADOS_FATURAS = [
  {id:'fat001',numero_fat:'FAT-2025-001',req_id:'req001',veiculo_id:'v001',matricula:'23-AB-45',obra_id:'o001',
   numero_fatura_ext:'FT 2025/0042',fornecedor:'Auto Peças Silva, Lda.',data_fatura:'2025-01-16',
   data_vencimento:'2025-02-16',valor:88.70,estado:'paga',descricao:'Óleo motor 5W-40 e filtros — VW Caddy',observacoes:'Fatura liquidada em 20/01/2025'},
  {id:'fat002',numero_fat:'FAT-2025-002',req_id:'req002',veiculo_id:'v009',matricula:'12-EF-34',obra_id:'o002',
   numero_fatura_ext:'RC 2025/0118',fornecedor:'Oficina Central, Lda.',data_fatura:'2025-02-13',
   data_vencimento:'2025-03-13',valor:85.00,estado:'paga',descricao:'Serviço de alinhamento e equilíbrio',observacoes:''},
  {id:'fat003',numero_fat:'FAT-2025-003',req_id:'req003',veiculo_id:'v018',matricula:'90-IJ-12',obra_id:'o003',
   numero_fatura_ext:'FT 2025/0207',fornecedor:'HydroTech Portugal',data_fatura:'2025-02-22',
   data_vencimento:'2025-03-22',valor:245.00,estado:'paga',descricao:'Mangueira hidráulica DN16 e óleo HV46 60L',observacoes:''},
  {id:'fat004',numero_fat:'FAT-2025-004',req_id:'req004',veiculo_id:'v010',matricula:'56-GH-78',obra_id:'o005',
   numero_fatura_ext:'FT 2025/0389',fornecedor:'Motor Center Porto',data_fatura:'2025-03-20',
   data_vencimento:'2025-04-20',valor:1200.00,estado:'paga',descricao:'Retificação completa motor Volvo FH460',observacoes:'Pago por transferência bancária'},
  {id:'fat005',numero_fat:'FAT-2025-005',req_id:'req005',veiculo_id:'v020',matricula:'33-QR-44',obra_id:'o008',
   numero_fatura_ext:'FT 2025/0512',fornecedor:'Komatsu Ibérica',data_fatura:'2025-06-02',
   data_vencimento:'2025-07-02',valor:3170.00,estado:'paga',descricao:'Kit lagartas completo Komatsu PC210-10M',observacoes:''},
  {id:'fat006',numero_fat:'FAT-2025-006',req_id:'req006',veiculo_id:'v024',matricula:'22-AA-66',obra_id:'o010',
   numero_fatura_ext:'SGS-2025/0089',fornecedor:'SGS Portugal',data_fatura:'2025-08-21',
   data_vencimento:'2025-09-21',valor:680.00,estado:'paga',descricao:'Inspeção e certificação de grua Liebherr LTM',observacoes:''},
  {id:'fat007',numero_fat:'FAT-2025-007',req_id:'req007',veiculo_id:'v015',matricula:'99-WW-55',obra_id:'o013',
   numero_fatura_ext:'PN-2025/1243',fornecedor:'Pneus & Cia',data_fatura:'2025-11-06',
   data_vencimento:'2025-12-06',valor:1840.00,estado:'paga',descricao:'4x Pneus 315/80R22.5 Michelin X-Works',observacoes:''},
  {id:'fat008',numero_fat:'FAT-2025-008',req_id:'req008',veiculo_id:'v011',matricula:'11-OP-22',obra_id:'o017',
   numero_fatura_ext:'',fornecedor:'Centro de Inspeção Mota',data_fatura:'2025-04-01',
   data_vencimento:'2025-05-01',valor:145.00,estado:'pendente',descricao:'Inspeção técnica periódica — Scania R450',observacoes:'A aguardar liquidação'},
  {id:'fat009',numero_fat:'FAT-2025-009',req_id:'req010',veiculo_id:'v026',matricula:'88-CC-44',obra_id:'o020',
   numero_fatura_ext:'AG-2025/0567',fornecedor:'Agri-Peças Norte',data_fatura:'2025-04-09',
   data_vencimento:'2025-05-09',valor:520.00,estado:'pendente',descricao:'Componentes elétricos e hidráulicos Kubota KX080',observacoes:'Urgente — máquina parada em obra'}
];

/* ================================================================
   MOTOR DB — localStorage
   ================================================================ */
const DB_VERSION = '4.0-mvp';

const DB = {
  KEYS: {
    v:'gom_veiculos', o:'gom_obras', al:'gom_alertas',
    itp:'gom_itp', req:'gom_requisicoes', fat:'gom_faturas', ver:'gom_version'
  },

  init() {
    const ver = localStorage.getItem(this.KEYS.ver);
    if (ver !== DB_VERSION) {
      /* Reset completo */
      localStorage.setItem(this.KEYS.v,   JSON.stringify(DADOS_VEICULOS));
      localStorage.setItem(this.KEYS.o,   JSON.stringify(DADOS_OBRAS));
      localStorage.setItem(this.KEYS.al,  JSON.stringify(DADOS_ALERTAS));
      localStorage.setItem(this.KEYS.itp, JSON.stringify(DADOS_ITP));
      localStorage.setItem(this.KEYS.req, JSON.stringify(DADOS_REQUISICOES));
      localStorage.setItem(this.KEYS.fat, JSON.stringify(DADOS_FATURAS));
      localStorage.setItem(this.KEYS.ver, DB_VERSION);
      console.log('[GOM DB] Dados inicializados — v' + DB_VERSION);
    } else {
      console.log('[GOM DB] Dados carregados do localStorage — v' + DB_VERSION);
    }
  },

  _get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch(e) { return fallback; }
  },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  /* ── VEÍCULOS ── */
  getVeiculos()  { return this._get(this.KEYS.v, []); },
  getVeiculo(id) { return this.getVeiculos().find(v=>v.id===id)||null; },
  saveVeiculos(l){ this._set(this.KEYS.v, l); },
  criarVeiculo(d) {
    const list=this.getVeiculos();
    const novo={id:'v'+Date.now(),...d};
    list.push(novo); this.saveVeiculos(list); return novo;
  },
  actualizarVeiculo(id,campos) {
    const list=this.getVeiculos(), i=list.findIndex(v=>v.id===id);
    if(i===-1) return null;
    list[i]={...list[i],...campos}; this.saveVeiculos(list); return list[i];
  },
  eliminarVeiculo(id) { this.saveVeiculos(this.getVeiculos().filter(v=>v.id!==id)); },

  /* ── OBRAS ── */
  getObras()  { return this._get(this.KEYS.o, []); },
  getObra(id) { return this.getObras().find(o=>o.id===id)||null; },
  saveObras(l){ this._set(this.KEYS.o, l); },
  criarObra(d) {
    const list=this.getObras();
    const nova={id:'o'+Date.now(),...d};
    list.push(nova); this.saveObras(list); return nova;
  },
  actualizarObra(id,campos) {
    const list=this.getObras(), i=list.findIndex(o=>o.id===id);
    if(i===-1) return null;
    list[i]={...list[i],...campos}; this.saveObras(list); return list[i];
  },
  eliminarObra(id) { this.saveObras(this.getObras().filter(o=>o.id!==id)); },
  proximoNumeroObra(ano) {
    const n=this.getObras().filter(o=>o.numero_obra&&o.numero_obra.startsWith(`OBR-${ano}-`)).length;
    return `OBR-${ano}-${String(n+1).padStart(3,'0')}`;
  },
  proximoNumObra(ano){ return this.proximoNumeroObra(ano); },

  /* ── ALERTAS ── */
  getAlertas()     { return this._get(this.KEYS.al, []); },
  getAlerta(vid)   { return this.getAlertas().find(a=>a.veiculo_id===vid)||null; },
  saveAlertas(l)   { this._set(this.KEYS.al, l); },
  criarAlerta(d) {
    const list=this.getAlertas();
    const novo={id:'al'+Date.now(),...d};
    list.push(novo); this.saveAlertas(list); return novo;
  },
  actualizarAlerta(id,campos) {
    const list=this.getAlertas(), i=list.findIndex(a=>a.id===id);
    if(i===-1) return null;
    list[i]={...list[i],...campos}; this.saveAlertas(list); return list[i];
  },
  eliminarAlerta(id) { this.saveAlertas(this.getAlertas().filter(a=>a.id!==id)); },

  /* ── ITP (compat) ── */
  getITPs()   { return this.getAlertas().filter(a=>a.itp_proxima); },
  getITP(vid) {
    const al=this.getAlerta(vid);
    if(!al||!al.itp_proxima) return null;
    return {id:al.id,veiculo_id:al.veiculo_id,matricula:al.matricula,
      ultima_itp:al.itp_ultima,proxima_itp:al.itp_proxima,
      antecedencia_dias:al.itp_antec||30,observacoes:al.observacoes||''};
  },
  criarITP(d) { return this.criarAlerta({...d}); },
  actualizarITP(id,campos) { return this.actualizarAlerta(id,campos); },
  eliminarITP(id) { this.eliminarAlerta(id); },
  saveITPs(l) { /* compat */ },

  /* ── REQUISIÇÕES ── */
  getReqs()   { return this._get(this.KEYS.req, []); },
  getReq(id)  { return this.getReqs().find(r=>r.id===id)||null; },
  saveReqs(l) { this._set(this.KEYS.req, l); },
  criarReq(d) {
    const list=this.getReqs();
    const nova={id:'req'+Date.now(),...d};
    list.push(nova); this.saveReqs(list); return nova;
  },
  actualizarReq(id,campos) {
    const list=this.getReqs(), i=list.findIndex(r=>r.id===id);
    if(i===-1) return null;
    list[i]={...list[i],...campos}; this.saveReqs(list); return list[i];
  },
  eliminarReq(id) { this.saveReqs(this.getReqs().filter(r=>r.id!==id)); },
  proximoNumeroReq() {
    const ano=new Date().getFullYear();
    const n=this.getReqs().filter(r=>r.numero_req&&r.numero_req.startsWith(`REQ-${ano}-`)).length;
    return `REQ-${ano}-${String(n+1).padStart(3,'0')}`;
  },
  proximoNumReq(){ return this.proximoNumeroReq(); },

  /* ── FATURAS ── */
  getFaturas()   { return this._get(this.KEYS.fat, []); },
  getFatura(id)  { return this.getFaturas().find(f=>f.id===id)||null; },
  saveFaturas(l) { this._set(this.KEYS.fat, l); },
  criarFatura(d) {
    const list=this.getFaturas();
    const nova={id:'fat'+Date.now(),...d};
    list.push(nova); this.saveFaturas(list); return nova;
  },
  actualizarFatura(id,campos) {
    const list=this.getFaturas(), i=list.findIndex(f=>f.id===id);
    if(i===-1) return null;
    list[i]={...list[i],...campos}; this.saveFaturas(list); return list[i];
  },
  eliminarFatura(id) { this.saveFaturas(this.getFaturas().filter(f=>f.id!==id)); },
  proximoNumeroFatura() {
    const ano=new Date().getFullYear();
    const n=this.getFaturas().filter(f=>f.numero_fat&&f.numero_fat.startsWith(`FAT-${ano}-`)).length;
    return `FAT-${ano}-${String(n+1).padStart(3,'0')}`;
  },
  proximoNumFatura(){ return this.proximoNumeroFatura(); }
};

/* ================================================================
   UTILITÁRIO — status de alerta por data
   retorna: 'ok' | 'proximo' | 'expirado' | 'sem_data'
   ================================================================ */
function alertaStatus(dataStr, diasAntec) {
  if (!dataStr) return 'sem_data';
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const alvo = new Date(dataStr + 'T00:00:00');
  const diff  = Math.round((alvo - hoje) / 86400000);
  if (diff < 0)                   return 'expirado';
  if (diff <= (diasAntec || 30))  return 'proximo';
  return 'ok';
}

/* ================================================================
   UTILITÁRIO — conta todos os alertas urgentes de um registo
   ================================================================ */
function contarAlertasVeiculo(al) {
  let n = 0;
  const chaves = [
    ['itp_proxima',   al.itp_antec||30],
    ['seguro_valido_ate', 30],
    ['revisao_proxima',   30],
    ['oleo_proxima_data', 14],
    ['pneus_proxima',     30],
    ['grua_proxima',      60],
    ['caixa_proxima',     60],
    ['tacografo_proxima', 30],
    ['extintor_validade', 30],
    ['higienizacao_proxima', 14],
    ['licenciamento_validade', 30]
  ];
  for (const [campo, antec] of chaves) {
    const st = alertaStatus(al[campo], antec);
    if (st === 'expirado' || st === 'proximo') n++;
  }
  return n;
}
