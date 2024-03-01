function initDropdownMenu() {
  let dropdownOpen = false; // Track if the dropdown is open

  // Function to calculate the dropdown width
  function getDropdownWidth() {
    const dropdown = document.querySelector('.dropdown-menu');
    return dropdown ? dropdown.offsetWidth : 0;
  }

  // Function to adjust the main content margin
  function adjustMainMargin() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.marginRight = dropdownOpen ? `${getDropdownWidth()}px` : '0px';
    }
  }

  // Define adjustDropdownPosition
  function adjustDropdownPosition() {
    const header = document.querySelector('header');
    const workLink = document.querySelector('a[href="#work"]');
    const dropdowns = document.querySelectorAll('.dropdown-menu');

    if (header && workLink) {
      const headerHeight = header.offsetHeight;
      const workLinkRect = workLink.getBoundingClientRect();

      dropdowns.forEach(dropdown => {
        dropdown.style.top = `${headerHeight}px`;

        let dropdownLeft = workLinkRect.left;
        let dropdownWidth = dropdown.offsetWidth;

        // Ensure the dropdown does not go beyond the left side of the 'work' link
        if (dropdownLeft + dropdownWidth > window.innerWidth) {
          dropdownLeft = window.innerWidth - dropdownWidth;
        }

        dropdown.style.left = `${dropdownLeft}px`;
        dropdown.style.height = `calc(100vh - ${headerHeight}px)`;
      });
    } else {
      console.error('Header or work link element not found');
    }
  }

  // Attach adjustDropdownPosition to the window object
  window.adjustDropdownPosition = adjustDropdownPosition;

  // Call adjustDropdownPosition on window resize
  window.addEventListener('resize', () => {
    adjustDropdownPosition();
    adjustMainMargin(); // Adjust main margin on window resize
  });

  function closeDropdown(dropdown) {
    if (dropdown && dropdown.classList.contains('show-dropdown')) {
      dropdown.classList.add('hide-dropdown');
      setTimeout(() => {
        dropdown.classList.remove('show-dropdown', 'hide-dropdown');
      }, 1000);
    }
  }

  document.querySelectorAll('.nav-item > a').forEach(item => {
    item.addEventListener('click', function(event) {
      event.stopPropagation();

      let dropdown = this.nextElementSibling;
      if (dropdown) {
        if (!dropdown.classList.contains('show-dropdown')) {
          dropdown.classList.add('show-dropdown');
          this.parentNode.classList.add('active');
          dropdownOpen = true;
        } else {
          closeDropdown(dropdown);
          this.parentNode.classList.remove('active');
          dropdownOpen = false;
        }
        adjustMainMargin(); // Adjust margin whenever the dropdown is toggled
      } else {
        console.error('Dropdown menu element not found for nav item', this);
      }

      document.querySelectorAll('.nav-item').forEach(otherItem => {
        let otherDropdown = otherItem.querySelector('.dropdown-menu');
        if (otherItem !== this.parentNode && otherDropdown && otherDropdown.classList.contains('show-dropdown')) {
          closeDropdown(otherDropdown);
          otherItem.classList.remove('active');
        }
      });
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-item')) {
      document.querySelectorAll('.dropdown-menu.show-dropdown').forEach(dropdown => {
        closeDropdown(dropdown);
        dropdownOpen = false;
        adjustMainMargin();
      });
      document.querySelectorAll('.nav-item.active').forEach(item => {
        item.classList.remove('active');
      });
    }
  });

  document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
    dropdown.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  });
}

// Initialize the dropdown menu on page load
initDropdownMenu();

// This function is separate and will be called after the header content is loaded
function initializeDropdownMenuListeners() {
  document.querySelectorAll('.dropdown-menu').forEach(dropdownMenu => {
    dropdownMenu.addEventListener('mouseleave', function() {
      console.log('Mouse left dropdown menu'); // Debugging line
      if (window.handleMouseLeaveDropdown) {
        window.handleMouseLeaveDropdown();
      }
    });
  });

  // Rest of the initialization code for dropdown menu items
  document.querySelectorAll('.dropdown-menu a').forEach((menuItem, index) => {
    menuItem.addEventListener('mouseover', function() {
      console.log('Hovered over menu item:', index); // Debugging line
      if (window.changeImage) {
        window.changeImage(index);
      }
    });
  });
}
