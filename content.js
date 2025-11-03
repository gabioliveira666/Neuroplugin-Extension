// content.js — versão com proteção de domínio corrigida

(() => {
  const dominioAtual = window.location.hostname;
  const dominiosBloqueados = [
    "google.",
    "gstatic.com",
    "youtube.com",
    "accounts.google.com"
  ];

  if (dominiosBloqueados.some(d => dominioAtual.includes(d))) {
    console.log("Extensão desativada neste site por segurança:", dominioAtual);
    return; // agora é permitido dentro da função
  }

  // Pequeno helper para logs
  function log(...args) {
    try { console.log("[neuroplugin content]", ...args); } catch (e) {}
  }

// === LIMPEZA (segura) ===
function limparResiduos() {
  try {
    // Remove apenas elementos que tenham sido marcados pela extensão (defensive)
    document.querySelectorAll('[data-neuro-text], mark.neuro-highlight').forEach(el => {
      const parent = el.parentNode;
      if (parent) parent.replaceChild(document.createTextNode(el.textContent), el);
    });

    // Remove atributos residuais criados pela extensão
    document.querySelectorAll('[data-original-text]').forEach(el => el.removeAttribute('data-original-text'));

    // Remove estilo temporário de seleção se existir
    document.getElementById('limpar-destaque')?.remove();
    const style = document.createElement('style');
    style.id = 'limpar-destaque';
    style.textContent = `
      ::selection { background: transparent !important; color: inherit !important; }
      mark.neuro-highlight { background: transparent !important; color: inherit !important; }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.warn("limparResiduos falhou:", e);
  }
}

// === MODO Foco/Leitura ===
function aplicarModoFoco() {
  removerModoFoco();
  try {
    const style = document.createElement('style');
    style.id = 'modo-foco';
    style.textContent = `
      /* destacar apenas a cor do texto dos blocos textuais (sem colorir fundo) */
      p, li, article, section, h1, h2, h3, h4, h5, h6 {
        transition: color 0.15s ease;
      }
      p:hover, li:hover, article:hover, section:hover, h1:hover, h2:hover, h3:hover {
        color: #b58900 !important;
        background-color: transparent !important;
      }
      /* evitar que filhos invertam o efeito */
      p *:hover, li *:hover, article *:hover, section *:hover {
        color: inherit !important;
      }
    `;
    document.head.appendChild(style);
    log("Modo Foco aplicado");
  } catch (e) { console.warn("aplicarModoFoco erro:", e); }
}
function removerModoFoco() {
  document.getElementById('modo-foco')?.remove();
}

// === MODO ESPAÇADO ===
function aplicarModoEspacado() {
  try {
    document.documentElement.style.setProperty("letter-spacing", "0.1em", "important");
    document.documentElement.style.setProperty("line-height", "1.8", "important");
    log("Modo Espaçado aplicado");
  } catch (e) { console.warn("aplicarModoEspacado erro:", e); }
}
function removerModoEspacado() {
  document.documentElement.style.removeProperty("letter-spacing");
  document.documentElement.style.removeProperty("line-height");
}

// === MODO SIMPLIFICADO ===
function aplicarModoSimplificado() {
  removerModoSimplificado();
  try {
    const style = document.createElement('style');
    style.id = 'modo-simplificado';
    style.textContent = `
      /* Força fonte simples e cores neutras em elementos textuais */
      body, body * {
        font-family: Arial, Verdana, sans-serif !important;
        color: #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      /* Ajustes de leitura */
      p, li, article, section, h1, h2, h3 {
        font-size: 1.05em !important;
        line-height: 1.6 !important;
      }
      /* Oculta mídia para foco no texto (opcional) */
      img, video, iframe, svg, canvas {
        display: none !important;
      }
      body {
        background: #fff !important;
      }
      a { color: #0033cc !important; text-decoration: underline !important; }
    `;
    document.head.appendChild(style);
    log("Modo Simplificado aplicado");
  } catch (e) { console.warn("aplicarModoSimplificado erro:", e); }
}
function removerModoSimplificado() {
  document.getElementById('modo-simplificado')?.remove();
}

// === MODO DISLÉXICO ===
  function ativarModoDislexico() {
    removerModoDislexico();
    const style = document.createElement("style");
    style.id = "modoDislexicoStyle";
    style.textContent = `
      @import url('https://fonts.cdnfonts.com/css/open-dyslexic');
      p, li, article, section, h1, h2, h3, h4, h5, h6, span, a {
        font-family: 'OpenDyslexic', Arial, sans-serif !important;
        letter-spacing: 0.05em !important; /* menor que espaçado */
        line-height: 1.6 !important;       /* menor que espaçado */
        font-size: 1.05em !important;      /* leve aumento de fonte */
      }
    `;
    document.head.appendChild(style);
    log("Modo Disléxico aplicado");
  }
  function removerModoDislexico() {
    document.getElementById('modoDislexicoStyle')?.remove();
  }

// Modo Padrão
function ativarModoPadrao() {
  // Remove o estilo específico do modo noturno suave, se existir
  const style = document.getElementById("modoNoturnoSuaveStyle");
  if (style) style.remove();

  // Restaura estilos visuais principais
  document.body.style.backgroundColor = "";
  document.body.style.color = "";

  // Remove filtros de daltonismo e restaura elementos
  removerFiltrosDaltonismo();

  // Restaura possíveis estilos aplicados em elementos
  document.querySelectorAll("*").forEach(el => {
    el.style.backgroundColor = "";
    el.style.color = "";
    el.style.filter = "";
  });

  console.log("Modo padrão restaurado");
}
function removerModoPadrao() {
  // Nada a remover — ele é um estado base, não injeta estilos.
}

// Modo Noturno Suave
function ativarModoNoturnoSuave() {
  const style = document.createElement("style");
  style.id = "modoNoturnoSuaveStyle";
  style.textContent = `
    body {
      background-color: #1e1f22 !important;
      color: #e4e6eb !important;
    }
    a, p, span, div, h1, h2, h3, h4, h5, h6 {
      color: #e4e6eb !important;
      background: none !important;
    }
    img, video {
      opacity: 0.85 !important;
    }
  `;
  document.head.appendChild(style);
}
function removerModoNoturnoSuave() {
  document.getElementById("modoNoturnoSuaveStyle")?.remove();
}

// === FILTROS DE DALTONISMO ===
function aplicarFiltroDaltonismo(tipo) {
  try {
    let matrix = "";
    if (tipo === "protanomalia") {
      matrix = "0.817 0.183 0 0 0, 0.333 0.667 0 0 0, 0 0.125 0.875 0 0, 0 0 0 1 0";
    } else if (tipo === "deuteranomalia") {
      matrix = "0.8 0.2 0 0 0, 0.258 0.742 0 0 0, 0 0.142 0.858 0 0, 0 0 0 1 0";
    } else if (tipo === "tritanomalia") {
      matrix = "0.967 0.033 0 0 0, 0 0.733 0.267 0 0, 0 0.183 0.817 0 0, 0 0 0 1 0";
    } else {
      matrix = "";
    }

    if (matrix) {
      document.documentElement.style.filter = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="daltonismo"><feColorMatrix type="matrix" values="${matrix}"/></filter></svg>#daltonismo')`;
      log("Filtro de daltonismo aplicado:", tipo);
    }
  } catch (e) {
    console.warn("aplicarFiltroDaltonismo erro:", e);
  }
}
function removerFiltrosDaltonismo() {
  try {
    document.documentElement.style.filter = "";
  } catch (e) { console.warn("removerFiltrosDaltonismo erro:", e); }
}

// === APLICAÇÃO GLOBAL DE ESTILOS (robusta) ===
function aplicarEstilos(data) {
  log("aplicarEstilos chamado com:", data);
  // limpar resíduos de elementos que a extensão mesma pode ter criado
  try { limparResiduos(); } catch (e) { console.warn("limparResiduos falhou:", e); }

  // Se user explicitamente desativou: remove tudo e retorna
  if (data && data.extensaoAtiva === false) {
    log("Extensão explicitamente desativada pelo usuário.");
    removerModoFoco();
    removerModoEspacado();
    removerModoSimplificado();
    removerModoDislexico();
    removerModoPadrao();
    removerModoNoturnoSuave();
    removerFiltrosDaltonismo();
    return;
  }

  // Se data for undefined, consideramos os modos desligados por padrão,
  // mas a extensão como um todo pode estar ativa (controle via extensaoAtiva).
  const modoFocoOn = !!(data && data.modoFoco);
  const modoEspacadoOn = !!(data && data.modoEspacado);
  const modoSimplificadoOn = !!(data && data.modoSimplificado);
  const modoDislexicoOn = !!(data && data.modoDislexico);
  const modoPadraoOn = !!(data && data.modoPadrao);
  const modoNoturnoSuaveOn = !!(data && data.modoNoturnoSuave);

  if (modoFocoOn) aplicarModoFoco(); else removerModoFoco();
  if (modoEspacadoOn) aplicarModoEspacado(); else removerModoEspacado();
  if (modoSimplificadoOn) aplicarModoSimplificado(); else removerModoSimplificado();
  if (modoDislexicoOn) ativarModoDislexico(); else removerModoDislexico();
  if (modoPadraoOn) ativarModoPadrao(); else removerModoPadrao();
  if (modoNoturnoSuaveOn) ativarModoNoturnoSuave(); else removerModoNoturnoSuave();

  // Daltonismo: limpa e aplica se necessário
  removerFiltrosDaltonismo();
  if (data && data.protanomalia) aplicarFiltroDaltonismo("protanomalia");
  if (data && data.deuteranomalia) aplicarFiltroDaltonismo("deuteranomalia");
  if (data && data.tritanomalia) aplicarFiltroDaltonismo("tritanomalia");
}

// === RECEBE MENSAGENS DO POPUP ===
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || !msg.action) return;

  if (msg.action === "resetarEstilos") {
  removerModoFoco();
  removerModoEspacado();
  removerModoSimplificado();
  removerModoDislexico();
  removerModoNoturnoSuave();
  removerFiltrosDaltonismo();
  ativarModoPadrao(); // garante fundo padrão imediatamente
}

  if (msg.action === "atualizarEstilo") {
    chrome.storage.sync.get(null, (data) => {
      try { aplicarEstilos(data); } catch (e) { console.warn("aplicarEstilos erro:", e); }
    });
  }
});

// === REAGE A MUDANÇAS DIRETAS NO STORAGE (caso o popup use set sem enviar mensagem) ===
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  // obter o estado atual completo e reaplicar
  chrome.storage.sync.get(null, (data) => {
    try { aplicarEstilos(data); } catch (e) { console.warn("aplicarEstilos erro (onChanged):", e); }
  });
});

// === EXECUTA AO CARREGAR (estado inicial) ===
chrome.storage.sync.get(null, (data) => {
  try { aplicarEstilos(data); } catch (e) { console.warn("aplicarEstilos erro (startup):", e); }
});

})();