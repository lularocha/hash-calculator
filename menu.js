document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('terahash')) {
        // Initial calculation will be called by menu.js after rendering
    }
});

// Flag to prevent circular updates when programmatically changing values
let isUpdating = false;

// Store exchange rate globally
let exchangeRate = null;
let currentCurrency = 'BRL'; // Track current display currency
const BASE_BRL_VALUE = 0.90; // Base value is always in BRL

// Track if values have been manually modified
let isCustomValues = false;

// Fetch BRL-USDT exchange rate from Binance API
async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL');
        const data = await response.json();
        exchangeRate = parseFloat(data.price);
        return exchangeRate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Fallback exchange rate if API fails
        exchangeRate = 5.50;
        return exchangeRate;
    }
}

// Initialize exchange rate on page load and update currency after
fetchExchangeRate().then(() => {
    // After exchange rate is loaded, update currency based on saved language
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    const currency = savedLang === 'en' ? 'USD' : 'BRL';
    window.updateCurrency(currency);
});

// Function to get the BRL value (base value stored in data attribute)
function getBRLValue() {
    const priceInput = document.getElementById('price');
    const brlValue = parseFloat(priceInput.getAttribute('data-brl-value')) || BASE_BRL_VALUE;
    return brlValue;
}

// Function to update BRL value when user edits in any currency
function updateBRLValue(displayValue, currency) {
    const priceInput = document.getElementById('price');
    let brlValue;
    
    if (currency === 'BRL') {
        brlValue = displayValue;
    } else if (currency === 'USD' && exchangeRate) {
        brlValue = displayValue * exchangeRate;
    } else {
        brlValue = displayValue;
    }
    
    priceInput.setAttribute('data-brl-value', brlValue.toFixed(2));
}

// Function to update currency display
window.updateCurrency = function(currency) {
    const priceInput = document.getElementById('price');
    const currencyPrefix = document.getElementById('currency-prefix');
    
    if (!priceInput || !currencyPrefix) return;
    
    const brlValue = getBRLValue();
    
    // Convert and display based on target currency
    if (currency === 'USD' && exchangeRate) {
        const usdValue = brlValue / exchangeRate;
        priceInput.value = usdValue.toFixed(2); // EN uses dot
        currencyPrefix.querySelector('span').textContent = '$';
    } else {
        priceInput.value = brlValue.toFixed(2).replace('.', ','); // PT uses comma
        currencyPrefix.querySelector('span').textContent = 'R$';
    }
    
    // Store current display currency
    currentCurrency = currency;
    
    // Recalculate with new currency display
    calculateCost();
}

// Override the input event to update BRL base value
document.addEventListener('DOMContentLoaded', () => {
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', () => {
            // Replace comma with dot for parsing
            const normalizedValue = priceInput.value.replace(',', '.');
            const displayValue = parseFloat(normalizedValue) || 0;
            updateBRLValue(displayValue, currentCurrency);
            calculateCost();
        });
    }
});

// Function to calculate cost (updated to always use BRL equivalent)
function calculateCost() {
    const consumption = parseFloat(document.getElementById('consumption').value) || 0;
    const displayPrice = parseFloat(document.getElementById('price').value.replace(',', '.')) || 0;
    
    const MONTHLY_HOURS = 732;
    const WATT_TO_KW = 1000;

    const monthlyKWH = (consumption / WATT_TO_KW) * MONTHLY_HOURS;
    
    // Calculate cost using displayed price (already in correct currency)
    const monthlyCost = monthlyKWH * displayPrice;

    document.getElementById('monthly_kwh').textContent = monthlyKWH.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
}) + ' kWh';

    // Display cost with appropriate currency symbol and locale
    const currencySymbol = currentCurrency === 'USD' ? '$' : 'R$';
    const locale = currentCurrency === 'USD' ? 'en-US' : 'pt-BR';
    
    document.getElementById('monthly_cost').textContent = currencySymbol + ' ' + monthlyCost.toLocaleString(locale, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

/**
 * Handles input changes and recalculates related fields
 * @param {string} changedField - The field that was changed ('terahash', 'consumption', or 'efficiency')
 */
window.handleInputChange = function(changedField) {
    if (isUpdating) return;
    
    isUpdating = true;
    
    const terahashInput = document.getElementById('terahash');
    const consumptionInput = document.getElementById('consumption');
    const efficiencyInput = document.getElementById('efficiency');
    
    const terahash = parseFloat(terahashInput.value) || 0;
    const consumption = parseFloat(consumptionInput.value) || 0;
    const efficiency = parseFloat(efficiencyInput.value) || 0;
    
    // Calculate based on which field changed
    // Formula: Consumption (W) = Hashrate (TH/s) × Efficiency (J/TH)
    // Rearranged: Efficiency = Consumption / Hashrate
    // Rearranged: Hashrate = Consumption / Efficiency
    
    switch(changedField) {
        case 'terahash':
            // Recalculate consumption based on terahash and efficiency
            if (efficiency > 0) {
                const newConsumption = terahash * efficiency;
                consumptionInput.value = Math.round(newConsumption);
            }
            break;
            
        case 'consumption':
            // Recalculate efficiency based on consumption and terahash
            if (terahash > 0) {
                const newEfficiency = consumption / terahash;
                // Use Math.round() to ensure a whole number (no decimals)
                efficiencyInput.value = Math.round(newEfficiency); 
            }
            break;
            
        case 'efficiency':
            // Recalculate consumption based on terahash and efficiency
            if (terahash > 0) {
                const newConsumption = terahash * efficiency;
                consumptionInput.value = Math.round(newConsumption);
            }
            break;
    }
    
    // Mark as custom values when manually changed
    isCustomValues = true;
    updateCustomSelectToCustom();
    
    calculateCost();
    isUpdating = false;
}

/**
 * Updates the custom select to show "Custom values"
 */
function updateCustomSelectToCustom() {
    const trigger = document.getElementById('custom-select');
    if (trigger) {
        // Store a special value to indicate custom
        trigger.setAttribute('data-value', 'custom');
        // The text will be updated by renderCustomMenu when called
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        const customText = savedLang === 'en' ? 'Use my custom values' : 'Use meus valores personalizados';
        trigger.textContent = customText;
    }
}

// Miner data structure with consumption values added
const minerSpecs = [
    { nameKey: "Miners", hashrate: 0, consumption: 0, efficiency: 0 }, 
    { name: "Bitaxe Gamma 601", hashrate: 1.2, consumption: 18, efficiency: 15 },
    { name: "NerdQaxe++", hashrate: 4.8, consumption: 72, efficiency: 15 },
    { name: "Avalon Nano 3S", hashrate: 6, consumption: 140, efficiency: 23 },
    { name: "Antminer S19", hashrate: 95, consumption: 3250, efficiency: 34 },
    { name: "Antminer S21", hashrate: 200, consumption: 3500, efficiency: 18 },
    { name: "Antminer S23", hashrate: 318, consumption: 3500, efficiency: 11 }
];

/**
 * Updates the Hashrate, Consumption, and Efficiency fields and triggers calculation
 * @param {number} selectedIndex - The index of the miner in the minerSpecs list
 */
window.selectMinerAndCalculate = function(selectedIndex) {
    const miner = minerSpecs[selectedIndex];
    
    const hashrateInput = document.getElementById('terahash');
    const consumptionInput = document.getElementById('consumption');
    const efficiencyInput = document.getElementById('efficiency');

    if (hashrateInput && consumptionInput && efficiencyInput) {
        isUpdating = true; // Prevent circular updates
        
        hashrateInput.value = miner.hashrate;
        consumptionInput.value = miner.consumption;
        efficiencyInput.value = miner.efficiency;
        
        // Reset custom values flag when selecting a miner
        isCustomValues = false;
        
        calculateCost();
        
        isUpdating = false;
    }
}

/**
 * Renders and translates the custom menu (called by translate.js)
 * @param {string} lang - The current language ('en' or 'pt')
 * @param {object} translations - The translations dictionary
 */
window.renderCustomMenu = function(lang, translations) {
    const trigger = document.getElementById('custom-select');
    const optionsContainer = document.getElementById('custom-options');
    
    if (!trigger || !optionsContainer) return;

    optionsContainer.innerHTML = ''; // Clear existing options

    minerSpecs.forEach((miner, index) => {
        const optionDiv = document.createElement('div');
        let name;

        // Determine display name (translated or fixed)
        if (miner.nameKey) {
            name = translations[lang][miner.nameKey] || miner.nameKey; 
        } else {
            name = miner.name;
        }
        
        optionDiv.classList.add('custom-option');
        optionDiv.setAttribute('data-value', index);
        optionDiv.textContent = name;

        // Add click handler for the option
        optionDiv.addEventListener('click', () => {
            handleOptionSelect(index, name);
        });

        optionsContainer.appendChild(optionDiv);
    });

    // Get current data-value
    const currentValue = trigger.getAttribute('data-value');
    
    // If custom values are active or data-value is 'custom', show custom text
    if (isCustomValues || currentValue === 'custom') {
        const customText = lang === 'en' ? 'Use my custom values' : 'Use meus valores personalizados';
        trigger.textContent = customText;
        trigger.setAttribute('data-value', 'custom');
    } else {
        // Otherwise, show the selected miner name
        const initialIndex = parseInt(currentValue || 0);
        const initialMiner = minerSpecs[initialIndex];
        let initialName;
        if (initialMiner.nameKey) {
            initialName = translations[lang][initialMiner.nameKey] || initialMiner.nameKey;
        } else {
            initialName = initialMiner.name;
        }
        trigger.textContent = initialName;
    }
    
    // Only update values if NOT custom (preserve manual changes during language switch)
    if (!isCustomValues && currentValue !== 'custom') {
        const initialIndex = parseInt(currentValue || 0);
        selectMinerAndCalculate(initialIndex);
    }
}

/**
 * Handles the selection of an option in the custom menu
 */
function handleOptionSelect(index, name) {
    const trigger = document.getElementById('custom-select');
    const optionsContainer = document.getElementById('custom-options');
    
    // 1. Update the visible field text and value
    trigger.textContent = name;
    trigger.setAttribute('data-value', index);

    // 2. Close the dropdown
    optionsContainer.classList.remove('is-open');
    trigger.classList.remove('is-active');

    // 3. Update inputs and recalculate
    selectMinerAndCalculate(index);
}

/**
 * Toggles the open/closed state of the custom menu
 */
function toggleCustomMenu(trigger, optionsContainer) {
    optionsContainer.classList.toggle('is-open');
    trigger.classList.toggle('is-active');
}

// DOM event handlers for the custom menu
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('custom-select');
    const optionsContainer = document.getElementById('custom-options');

    if (trigger && optionsContainer) {
        // Toggle menu on visible field click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCustomMenu(trigger, optionsContainer);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            // Check if click was not on trigger or options container
            if (!trigger.contains(e.target) && !optionsContainer.contains(e.target)) {
                optionsContainer.classList.remove('is-open');
                trigger.classList.remove('is-active');
            }
        });
    }
});