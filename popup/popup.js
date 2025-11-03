document.addEventListener("DOMContentLoaded", function () {
  const btns = {
    modoFoco: document.getElementById("modoFoco"),
    modoEspacado: document.getElementById("modoEspacado"),
    modoSimplificado: document.getElementById("modoSimplificado"),
    modoDislexico: document.getElementById("modoDislexico"),
    modoPadrao: document.getElementById("modoPadrao"),
    modoNoturnoSuave: document.getElementById("modoNoturnoSuave"),
    protanomalia: document.getElementById("protanomalia"),
    deuteranomalia: document.getElementById("deuteranomalia"),
    tritanomalia: document.getElementById("tritanomalia"),
    toggleExtensao: document.getElementById("toggleExtensao"),
    resetar: document.getElementById("resetar"),
  };

  // ---------- Atualiza visual do botão ----------
  function setButtonState(button, isOn) {
    if (!button) return;
    if (button === btns.toggleExtensao) {
      button.textContent = isOn ? "On" : "Off";
      button.classList.toggle("off", !isOn);
      button.classList.toggle("on", isOn);
    } else {
      button.style.backgroundColor = isOn ? "#4caf50" : "#ddd";
      button.style.color = isOn ? "white" : "#222";
    }
  }

  // ---------- Salva no storage e envia mensagem ----------
  function saveAndUpdateStorage(key, value) {
    chrome.storage.sync.set({ [key]: value }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "atualizarEstilo" });
        }
      });
    });
  }

  // ---------- Carrega estado inicial ----------
  chrome.storage.sync.get(null, (data) => {
    const extensaoAtiva = data.extensaoAtiva !== false;
    setButtonState(btns.toggleExtensao, extensaoAtiva);

    [
      "modoFoco", "modoEspacado", "modoSimplificado", "modoDislexico",
      "modoPadrao", "modoNoturnoSuave", "protanomalia", "deuteranomalia", "tritanomalia"
    ].forEach((key) => {
      setButtonState(btns[key], data[key] || false);
    });
  });

  // ---------- Botão ON/OFF ----------
  btns.toggleExtensao.addEventListener("click", () => {
    const isOn = btns.toggleExtensao.textContent === "Off";
    setButtonState(btns.toggleExtensao, isOn);

    if (!isOn) {
      // OFF: desliga tudo e aplica modo padrão
      const state = {
        extensaoAtiva: false,
        modoFoco: false,
        modoEspacado: false,
        modoSimplificado: false,
        modoDislexico: false,
        modoPadrao: true,
        modoNoturnoSuave: false,
        protanomalia: false,
        deuteranomalia: false,
        tritanomalia: false
      };

      Object.keys(btns).forEach(key => {
        if (state[key] !== undefined) setButtonState(btns[key], state[key]);
      });

      chrome.storage.sync.set(state, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "atualizarEstilo", data: state });
          }
        });
      });
    } else {
      // ON: apenas marca extensão como ativa
      chrome.storage.sync.set({ extensaoAtiva: true });
    }
  });

  // ---------- Toggle modos (exclui modoPadrao e modoNoturnoSuave) ----------
  [
    "modoFoco", "modoEspacado", "modoSimplificado", "modoDislexico",
    "protanomalia", "deuteranomalia", "tritanomalia"
  ].forEach((key) => {
    const btn = btns[key];
    if (!btn) return;

    btn.addEventListener("click", () => {
      const style = window.getComputedStyle(btn);
      const isOn = style.backgroundColor !== "rgb(76, 175, 80)"; // verde
      setButtonState(btn, isOn);
      saveAndUpdateStorage(key, isOn);
    });
  });

  // ---------- Toggle exclusivo modoPadrao e modoNoturnoSuave ----------
  ["modoPadrao", "modoNoturnoSuave"].forEach((key) => {
    const btn = btns[key];
    if (!btn) return;

    btn.addEventListener("click", () => {
      const outro = key === "modoPadrao" ? btns.modoNoturnoSuave : btns.modoPadrao;

      // Sempre ativa o botão clicado
      setButtonState(btn, true);
      chrome.storage.sync.set({ [key]: true });

      // Desativa o outro
      setButtonState(outro, false);
      chrome.storage.sync.set({ [outro === btns.modoPadrao ? "modoPadrao" : "modoNoturnoSuave"]: false });

      // Atualiza content.js
      saveAndUpdateStorage(key, true);
    });
  });

  // ---------- Botão Reset ----------
  btns.resetar.addEventListener("click", () => {
    const state = {
      extensaoAtiva: false,
      modoFoco: false,
      modoEspacado: false,
      modoSimplificado: false,
      modoDislexico: false,
      modoPadrao: true,
      modoNoturnoSuave: false,
      protanomalia: false,
      deuteranomalia: false,
      tritanomalia: false
    };

    // Atualiza botões
    Object.keys(btns).forEach(key => {
      if (state[key] !== undefined) setButtonState(btns[key], state[key]);
    });

    // Salva e aplica imediatamente
    chrome.storage.sync.set(state, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "atualizarEstilo", data: state });
        }
      });
    });
  });
});
