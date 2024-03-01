function loadComponent(componentName, placeholderId, callback) {
  fetch(`${componentName}.html`)
    .then(response => response.text())
    .then(data => {
      document.getElementById(placeholderId).innerHTML = data;
      if (componentName === 'header') {
        // Ensures these functions are called after header is loaded
        adjustDropdownPosition();
        initializeDropdownMenuListeners();
      }
      if (callback) {
        callback();
      }
    });
}

function reinitializeScripts() {
  // initCursorStyle(); // Uncomment or add any other initializations needed
  initDropdownMenu(); // Initializes the dropdown menu
  initScrambleEffect();
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', 'header-placeholder', reinitializeScripts);
  loadComponent('footer', 'footer-placeholder');
});
