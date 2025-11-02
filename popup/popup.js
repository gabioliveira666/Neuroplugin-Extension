document.addEventListener("DOMContentLoaded", function () {
  const btns = {
    modoFoco: document.getElementById("modoFoco"),
    modoEspacado: document.getElementById("modoEspacado"),
    modoSimplificado: document.getElementById("modoSimplificado"),
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
          chrome.tabs.sendMessage(tabs[0].id, { action: "atualizarEstilo" }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn("Content script não disponível");
            }
          });
        }
      });
    });
  }

  // ---------- Carrega estado inicial ----------
  chrome.storage.sync.get(null, (data) => {
    const extensaoAtiva = data.extensaoAtiva !== false; // padrão = true
    setButtonState(btns.toggleExtensao, extensaoAtiva);

    [
      "modoFoco", "modoEspacado", "modoSimplificado",
      "protanomalia", "deuteranomalia", "tritanomalia"
    ].forEach((key) => {
      setButtonState(btns[key], data[key] || false);
    });
  });

  // ---------- Toggle Extensão On/Off ----------
  btns.toggleExtensao.addEventListener("click", () => {
    const isOn = btns.toggleExtensao.textContent === "Off";
    setButtonState(btns.toggleExtensao, isOn);
    saveAndUpdateStorage("extensaoAtiva", isOn);
  });

  // ---------- Toggle modos ----------
  [
    "modoFoco", "modoEspacado", "modoSimplificado",
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

  // ---------- Botão Reset ----------
  btns.resetar.addEventListener("click", () => {
    setButtonState(btns.toggleExtensao, false);

    [
      "modoFoco", "modoEspacado", "modoSimplificado",
      "protanomalia", "deuteranomalia", "tritanomalia"
    ].forEach((key) => {
      setButtonState(btns[key], false);
    });

    const defaultState = {
      extensaoAtiva: false,
      modoFoco: false,
      modoEspacado: false,
      modoSimplificado: false,
      protanomalia: false,
      deuteranomalia: false,
      tritanomalia: false,
    };

    chrome.storage.sync.set(defaultState, () => {
      // Consulta aba antes de enviar mensagem
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "atualizarEstilo" }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn("Content script não disponível");
            }
          });
        }
      });
    });
  });
});
