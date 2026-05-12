// ====================
// MINER EXAMPLES MODAL
// ====================
const modal = document.getElementById('modal');
const modalContent = document.querySelector('#modal .modal-content'); 
const modalTriggerButton = document.getElementById('modalTrigger');
const closeModalButton = document.getElementById('closeModal'); 
const animationDuration = 400;

function openModal() {
    modal.style.display = 'flex';
    setTimeout(() => {
        modalContent.classList.add('is-open');
    }, 10);
}

function closeModal() {
    modalContent.classList.remove('is-open');
    setTimeout(() => {
        modal.style.display = 'none';
    }, animationDuration);
}

if (modalTriggerButton) {
    modalTriggerButton.addEventListener('click', openModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

window.openModal = openModal;

// ====================
// HELP MODAL
// ====================
const modalHelp = document.getElementById('modal-help');
const modalHelpContent = document.querySelector('#modal-help .modal-content');
const modalHelpTriggerButton = document.querySelector('.modal-help-btn');
const closeHelpModalButton = document.getElementById('closeHelpModal');

function openHelpModal() {
    if (modalHelp && modalHelpContent) {
        modalHelp.style.display = 'flex';
        setTimeout(() => {
            modalHelpContent.classList.add('is-open');
        }, 10);
    }
}

function closeHelpModal() {
    if (modalHelp && modalHelpContent) {
        modalHelpContent.classList.remove('is-open');
        setTimeout(() => {
            modalHelp.style.display = 'none';
        }, animationDuration);
    }
}

// Event listener for help modal trigger button
if (modalHelpTriggerButton) {
    modalHelpTriggerButton.addEventListener('click', openHelpModal);
}

// Event listener for close button
if (closeHelpModalButton) {
    closeHelpModalButton.addEventListener('click', closeHelpModal);
}

// Close help modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modalHelp) {
        closeHelpModal();
    }
});

// Make function available globally if needed
window.openHelpModal = openHelpModal;