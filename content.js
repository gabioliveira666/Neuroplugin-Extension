// content.js — versão simplificada e funcional

// === LIMPEZA FORÇADA DE RESÍDUOS ===
function limparResiduos() {
  // Remove spans e marcas antigos
  document.querySelectorAll('span, mark, .highlight').forEach(el => {
    const parent = el.parentNode;
    if(parent) parent.replaceChild(document.createTextNode(el.textContent), el);
  });

  // Remove atributos residuais
  document.querySelectorAll('[data-original-text]').forEach(el => el.removeAttribute('data-original-text'));

  // CSS global para zerar seleção
  let style = document.getElementById('limpar-destaque');
  if(style) style.remove();
  style = document.createElement('style');
  style.id = 'limpar-destaque';
  style.textContent = `
    ::selection { background: transparent !important; color: inherit !important; }
    mark, .highlight { background: transparent !important; color: inherit !important; }
  `;
  document.head.appendChild(style);
}

// === MODO FOCUS/LEITURA ===
function aplicarModoFoco() {
  removerModoFoco();

  const style = document.createElement('style');
  style.id = 'modo-foco';
  style.textContent = `
    /* Aplica apenas ao texto */
    p, li, h1, h2, h3, h4, h5, h6, span {
      transition: color 0.2s ease;
    }

    p:hover, li:hover, h1:hover, h2:hover, h3:hover, h4:hover, h5:hover, h6:hover, span:hover {
      color: #b58900 !important; /* amarelo escuro para destaque das letras */
      background-color: transparent !important;
    }

    /* Garante que os filhos não sobrescrevam */
    p *:hover, li *:hover, span *:hover {
      color: inherit !important;
    }
  `;
  document.head.appendChild(style);
}

function removerModoFoco() {
  document.getElementById('modo-foco')?.remove();
}

// === MODO ESPAÇADO ===
function aplicarModoEspacado() {
  document.body.style.letterSpacing = "0.1em";
  document.body.style.lineHeight = "1.8em";
}
function removerModoEspacado() {
  document.body.style.letterSpacing = "";
  document.body.style.lineHeight = "";
}

// === MODO SIMPLIFICADO ===
function aplicarModoSimplificado() {
  removerModoSimplificado();

  const style = document.createElement('style');
  style.id = 'modo-simplificado';
  style.textContent = `
    * {
      font-family: Arial, Verdana, sans-serif !important;
      font-size: 1.1em !important;
      line-height: 1.6 !important;
      background: #ffffff !important;
      color: #000000 !important;
      box-shadow: none !important;
      text-shadow: none !important;
      border: none !important;
    }

    img, video, iframe, svg, canvas {
      display: none !important;
    }

    a {
      color: #0033cc !important;
      text-decoration: underline !important;
    }

    body {
      background: #ffffff !important;
    }
  `;
  document.head.appendChild(style);
}

function removerModoSimplificado() {
  document.getElementById('modo-simplificado')?.remove();
}

// === FILTROS DE DALTONISMO (corrigidos e calibrados) ===
function aplicarFiltroDaltonismo(tipo) {
  let matrix = "";

  if (tipo === "protanomalia") {
    // Dificuldade em perceber o vermelho
    matrix = "0.817 0.183 0 0 0, 0.333 0.667 0 0 0, 0 0.125 0.875 0 0, 0 0 0 1 0";
  } 
  else if (tipo === "deuteranomalia") {
    // Dificuldade em perceber o verde
    matrix = "0.8 0.2 0 0 0, 0.258 0.742 0 0 0, 0 0.142 0.858 0 0, 0 0 0 1 0";
  } 
  else if (tipo === "tritanomalia") {
    // Dificuldade em perceber o azul
    matrix = "0.967 0.033 0 0 0, 0 0.733 0.267 0 0, 0 0.183 0.817 0 0, 0 0 0 1 0";
  }

  // Aplica o filtro SVG diretamente no documento
  document.documentElement.style.filter = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="daltonismo"><feColorMatrix type="matrix" values="${matrix}"/></filter></svg>#daltonismo')`;
}

function removerFiltrosDaltonismo() {
  document.documentElement.style.filter = "";
}

// === APLICAÇÃO GERAL DE ESTILOS ===
function aplicarEstilos(data) {
  limparResiduos(); // limpa antes de aplicar novos modos
  if(!data.extensaoAtiva) return;

  data.modoFoco ? aplicarModoFoco() : removerModoFoco();
  data.modoEspacado ? aplicarModoEspacado() : removerModoEspacado();
  data.modoSimplificado ? aplicarModoSimplificado() : removerModoSimplificado();

  removerFiltrosDaltonismo();
  if(data.protanomalia) aplicarFiltroDaltonismo("protanomalia");
  if(data.deuteranomalia) aplicarFiltroDaltonismo("deuteranomalia");
  if(data.tritanomalia) aplicarFiltroDaltonismo("tritanomalia");
}

// === RECEBE MENSAGENS DO POPUP ===
chrome.runtime.onMessage.addListener((msg) => {
  if(msg.action === "atualizarEstilo") {
    chrome.storage.sync.get(null, (data) => aplicarEstilos(data));
  }
});

// === EXECUTA AO CARREGAR ===
chrome.storage.sync.get(null, (data) => aplicarEstilos(data));
