// Translation dictionary
const translations = {
  en: {
    Calculator: "Calculator",
    "Miner examples": "Compare miners",
    Miner: "Miner",

    Hashrate: "Hashrate",
    "Terahashes per second,": "Terahashes per second,",
    "check miner examples": "check miner examples",

    Consumption: "Power",
    "Power consumption in Watts": "Power consumption in Watts",
    "Consumption W": "Consumption W",

    Efficiency: "Efficiency",
    "Joules per Terahash, the lower the better":
      "Joules per Terahash, the lower the better",

    Tariff: "Enter your local tariff",
    "tariff-helper":
      "The value above is the estimated tariff in Rio de Janeiro",
    Results: "Per month",
    "Monthly consumption:": "Consumption:",
    "Estimated cost:": "Estimated cost:",

    "disclaimer-01": "Don't trust. Verify.",
    "disclaimer-02": "Efficiency formula: Joules/Terahash (J/TH) = Watts/TH/s",
    "disclaimer-03": "Check manufacturer specifications for precise values.",

    "Select miner": "Select a miner or enter values",
    Miners: "Miners",
    "Custom values": "Custom values",
    "Select miner to set values":
      "Select a miner to automatically set the values bellow or tap fields to enter your custom values manually",

    "Modal help title": "Help + Info",
    "Modal help Button": "Help + Info",
    "Modal help 00":
      "Choose the language: EN | PT\nNote that in English the cost is calculated in dollars and in Portuguese in Brazilian Reais.",
    "Modal help 01":
      "Select a miner to automatically set Hashrate, Power, and Efficiency values. You can also tap the fields to enter your values manually.",
    "Modal help 02":
      "My miner values are approximated.\nCheck the manufacturer's specifications for more precise values.",
    "Modal help 03":
      "Efficiency = Power ÷ Hashrate\n J/TH = Watts ÷ TH/s\nLower J/TH values = more efficiency",
    "Modal help 04":
      "Check your electricity bill to find out your local tariff, including taxes.",
    "Modal help 05":
      "Results are calculated based on 732 hours of monthly operation (annual average).",

    footer:
      'developed by Lula Rocha / <a href="https://sugiro.ai/" target="_blank">sugiro.ai</a>',
  },
  pt: {
    Calculator: "Calculadora",
    "Miner examples": "Compare mineradores",
    Miner: "Minerador",

    Hashrate: "Hashrate",
    "Terahashes per second,": "Terahashes por segundo,",
    "check miner examples": "exemplos de mineradores",

    Consumption: "Potência",
    "Power consumption in Watts": "Consumo de energia em Watts",
    "Consumption W": "Consumo W",

    Efficiency: "Eficiência",
    "Joules per Terahash, the lower the better":
      "Joules por Terahash, o menor é o melhor",

    Tariff: "Insira sua tarifa local",
    "tariff-helper": "R$ 0,90/kWh é a tarifa estimada no Rio de Janeiro",
    Results: "Por mês",
    "Monthly consumption:": "Consumo:",
    "Estimated cost:": "Custo estimado:",

    "disclaimer-01": "Não confie. Verifique.",
    "disclaimer-02":
      "Fórmula da Eficiência: Joules/Terahash (J/TH) = Watts/TH/s",
    "disclaimer-03":
      "Confira especificações do fabricante para valores precisos.",

    "Select miner": "Selecione um minerador ou insira valores",
    Miners: "Mineradores",
    "Custom values": "Valores personalizados",
    "Select miner to set values":
      "Selecione um minerador para definir os valores abaixo ou toque nos campos para inserir seus valores",

    "Modal help title": "Como usar + informações",
    "Modal help Button": "Como usar e mais informações",
    "Modal help 00":
      "Escolha o idiona: EN | PT\nNote que em inglês o custo é calculado em dólares e em português em reais.",
    "Modal help 01":
      "Selecione um minerador para definir automaticamente os valores de Hashrate, Potência e Eficiência. Você também pode tocar nos campos para inserir seus valores manualmente.",
    "Modal help 02":
      "Meus valores são aproximados.\nConfira as especificações do fabricante para valores mais precisos.",
    "Modal help 03":
      "Eficiência = Potência ÷ Hashrate\n J/TH = Watts ÷ TH/s\nValores J/TH mais baixos = maior eficiência",
    "Modal help 04":
      "Confira sua conta de luz para descobrir quanto é a sua tarifa local com impostos.",
    "Modal help 05":
      "Os resultados são calculados com base em 732 horas de operação mensal (média anual).",

    footer:
      'desenvolvido por Lula Rocha / <a href="https://sugiro.ai/" target="_blank">sugiro.ai</a>',
  },
};

/**
 * Applies translations for the current page
 * @param {string} lang - The language code ('en' or 'pt')
 */
window.translatePage = function (lang) {
  if (!translations[lang]) {
    console.error(`Language ${lang} not supported.`);
    return;
  }

  // 0. Add language class to body
  document.body.classList.remove("lang-en", "lang-pt");
  document.body.classList.add(`lang-${lang}`);

  // 1. Translate elements with data-translate
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[lang][key]) {
      if (translations[lang][key].includes("<")) {
        element.innerHTML = translations[lang][key];
      } else {
        element.textContent = translations[lang][key];
      }
    }
  });

  // 2. Update currency based on language
  const currency = lang === "en" ? "USD" : "BRL";
  if (typeof window.updateCurrency === "function") {
    window.updateCurrency(currency);
  }

  // 3. Populate/Translate the CUSTOM dropdown menu (call to menu.js)
  // This will now preserve custom values if they exist
  if (typeof renderCustomMenu === "function") {
    renderCustomMenu(lang, translations);
  }

  // 4. Update button states
  document.querySelectorAll(".circle-btn[data-lang]").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector(`.circle-btn[data-lang="${lang}"]`)
    .classList.add("active");

  // 5. Save preference
  localStorage.setItem("preferredLang", lang);
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferredLang") || "en";
  translatePage(savedLang); // Start translation and populate menu

  document
    .getElementById("btnEN")
    .addEventListener("click", () => translatePage("en"));
  document
    .getElementById("btnPT")
    .addEventListener("click", () => translatePage("pt"));

  // Listener for miner examples link in helper text
  const minerExamplesLink = document.getElementById("miner-examples-link");
  if (minerExamplesLink) {
    minerExamplesLink.addEventListener("click", (e) => {
      e.preventDefault();
      // openModal is defined in modal.js
      if (typeof window.openModal === "function") {
        window.openModal();
      }
    });
  }
});
