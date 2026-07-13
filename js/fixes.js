/* ================================================================
   GOM v3.1 — ARRANQUE E EVENTOS GLOBAIS
   Mantém apenas a inicialização. As operações funcionais pertencem
   a app.js para evitar versões duplicadas e incompatíveis dos formulários.
   ================================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  if (typeof window._loadingStep === 'function') {
    window._loadingStep(25, 'A inicializar dados…');
  }

  try {
    DB.init();
  } catch (erro) {
    console.error('[GOM] Falha ao inicializar os dados:', erro);
    if (typeof toastMsg === 'function') {
      toastMsg('Não foi possível iniciar os dados locais. Verifique as permissões do navegador.', 'error');
    }
  }

  if (typeof window._loadingStep === 'function') {
    window._loadingStep(55, 'A construir interface…');
  }

  const overlay = document.getElementById('modalOverlay');
  const btnClose = document.getElementById('modalClose');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (overlay) {
    overlay.addEventListener('click', function (evento) {
      if (evento.target === overlay && typeof closeModal === 'function') closeModal();
    });
  }
  if (btnClose) {
    btnClose.addEventListener('click', function () {
      if (typeof closeModal === 'function') closeModal();
    });
  }
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
    link.addEventListener('click', function (evento) {
      evento.preventDefault();
      if (link.dataset.page && typeof ir === 'function') ir(link.dataset.page);
    });
  });

  document.addEventListener('click', function (evento) {
    if (!sidebar || !sidebar.classList.contains('open')) return;
    if (!sidebar.contains(evento.target) && evento.target !== menuToggle) {
      sidebar.classList.remove('open');
    }
  });

  if (typeof window._loadingStep === 'function') window._loadingStep(85, 'Pronto!');
  if (typeof ir === 'function') ir('dashboard');
  if (typeof window._loadingFim === 'function') setTimeout(window._loadingFim, 450);

  if (typeof Chart === 'undefined') {
    console.warn('[GOM] Chart.js indisponível: os gráficos requerem ligação à internet nesta versão.');
  }
  if (typeof XLSX === 'undefined') {
    console.warn('[GOM] SheetJS indisponível: a exportação Excel requer ligação à internet nesta versão.');
  }

  console.log('[GOM v3.1] Aplicação iniciada — ' +
    DB.getVeiculos().length + ' veículos | ' +
    DB.getObras().length + ' obras | ' +
    DB.getAlertas().length + ' registos de alertas');
});
