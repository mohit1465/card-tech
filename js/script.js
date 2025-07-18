// Direct access to Gemini API
const MODEL_ID = 'gemini-2.0-flash-exp-image-generation';
// We'll load the API key from config
let GEMINI_API_KEY = null;

// Store generated images for the carousel
const generatedImages = [];
// Store image style information
const imageStyleMap = new Map();

// Modal functionality
function showModal(imageSrc) {
    const modal = document.getElementById('imagePreviewModal');
    
    if (!modal || !imageSrc) {
        console.error('Modal elements not found or no image source provided');
        return;
    }
    
    // Add the image to our collection if it's not already there
    if (!generatedImages.includes(imageSrc)) {
        generatedImages.push(imageSrc);
        
        // Store the current style for this image
        const artStyle = document.getElementById('artStyle').value;
        imageStyleMap.set(imageSrc, artStyle);
    }
    
    // Show modal and switch to the image
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    switchToImage(imageSrc);
}

// Update thumbnails in the carousel
const updateThumbnails = (currentImageSrc = null) => {
    const thumbnailsContainer = document.getElementById('imageThumbnails');
    
    if (!thumbnailsContainer) {
        console.error('Thumbnails container not found with ID: imageThumbnails');
        return;
    }
    
    // Clear existing thumbnails
    thumbnailsContainer.innerHTML = '';
    
    // Add each generated image as a thumbnail
    generatedImages.forEach((imgSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        
        // Add active class to the current image
        if (currentImageSrc === imgSrc) {
            thumbnail.classList.add('active');
        }
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Thumbnail ${index + 1}`;
        
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
        
        // Add click event to switch to this image when clicked
        thumbnail.addEventListener('click', () => {
            switchToImage(imgSrc);
        });
    });

    // Setup carousel navigation
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => {
            const currentIndex = generatedImages.indexOf(currentImageSrc);
            if (currentIndex > 0) {
                const prevImage = generatedImages[currentIndex - 1];
                switchToImage(prevImage);
            }
        };
        
        nextBtn.onclick = () => {
            const currentIndex = generatedImages.indexOf(currentImageSrc);
            if (currentIndex < generatedImages.length - 1) {
                const nextImage = generatedImages[currentIndex + 1];
                switchToImage(nextImage);
            }
        };
    }
};

// Add a new function to handle image switching
function switchToImage(imageSrc) {
    // Update image in preview
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
    }
    
    // Update all thumbnails to remove active class
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Add active class to the corresponding thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    const index = generatedImages.indexOf(imageSrc);
    if (index !== -1 && thumbnails[index]) {
        thumbnails[index].classList.add('active');
    }
    
    // Initialize text editor for the new image
    initTextEditor();
}

// Setup carousel navigation buttons
function setupCarouselNavigation() {
    const container = document.getElementById('imageThumbnails');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    if (!container || !prevBtn || !nextBtn) return;
    
    prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: 200, behavior: 'smooth' });
    });
}

// Expose the showModal function to the global scope
window.showModal = showModal;

// Function to load config and get API key
async function loadConfig() {
    try {
        // Use the CONFIG variable defined in config.js
        GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
        return true;
    } catch (error) {
        console.error('Failed to load API key:', error);
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="api-key-error">
                <p>⚠️ Failed to load API key. Please check your config.js file.</p>
                <button id="dismissError">Dismiss</button>
            </div>
        `);
        document.getElementById('dismissError').addEventListener('click', function() {
            document.querySelector('.api-key-error').style.display = 'none';
        });
        return false;
    }
}

// Generation Type Dropdown Functionality
document.addEventListener('DOMContentLoaded', () => {
    const generationType = document.getElementById('generationType');
    const characterOptions = document.getElementById('characterOptions');
    const accessoryOptions = document.getElementById('accessoryOptions');
    const toggleDetails = document.getElementById('toggleDetails');
    const imageDetails = document.querySelector('.image-details');

    // Character type options
    const characterType = document.getElementById('characterType');
    const characterSpecies = document.getElementById('characterSpecies');
    const characterPowers = document.getElementById('characterPowers');
    const characterTheme = document.getElementById('characterTheme');

    // Accessory type options
    const accessoryType = document.getElementById('accessoryType');
    const accessoryStyle = document.getElementById('accessoryStyle');
    const accessoryMaterial = document.getElementById('accessoryMaterial');

    // Style options based on accessory type
    const styleOptions = {
        jewelry: ['Classic', 'Modern', 'Vintage', 'Bohemian', 'Minimalist'],
        clothing: ['Casual', 'Formal', 'Sporty', 'Gothic', 'Ethnic'],
        weapon: ['Medieval', 'Modern', 'Futuristic', 'Magical', 'Steampunk'],
        magical: ['Arcane', 'Divine', 'Elemental', 'Necromantic', 'Celestial']
    };

    // Material options based on accessory type
    const materialOptions = {
        jewelry: ['Gold', 'Silver', 'Platinum', 'Gemstone', 'Pearl'],
        clothing: ['Cotton', 'Silk', 'Leather', 'Wool', 'Synthetic'],
        weapon: ['Steel', 'Wood', 'Crystal', 'Mythril', 'Obsidian'],
        magical: ['Crystal', 'Enchanted Metal', 'Ancient Wood', 'Mystic Stone', 'Ethereal Material']
    };

    // Handle generation type change
    generationType.addEventListener('change', () => {
        const selectedType = generationType.value;
        
        // Hide all sub-options first
        characterOptions.style.display = 'none';
        accessoryOptions.style.display = 'none';
        
        // Show relevant sub-options
        if (selectedType === 'character') {
            characterOptions.style.display = 'flex';
            setTimeout(() => characterOptions.classList.add('visible'), 10);
        } else if (selectedType === 'accessory') {
            accessoryOptions.style.display = 'flex';
            setTimeout(() => accessoryOptions.classList.add('visible'), 10);
        }
    });

    // Handle character type change
    characterType.addEventListener('change', () => {
        const selectedType = characterType.value;
        
        // Species options based on character type
        const speciesOptions = {
            humanoid: ['Human', 'Elf', 'Dwarf', 'Orc', 'Vampire', 'Werewolf'],
            animal: ['Mammal', 'Reptile', 'Bird', 'Fish', 'Insect', 'Hybrid'],
            fantasy: ['Dragon', 'Fairy', 'Phoenix', 'Griffin', 'Unicorn', 'Pegasus'],
            robot: ['Android', 'Cyborg', 'Mech', 'Drone', 'AI', 'Automaton'],
            alien: ['Extraterrestrial', 'Cosmic', 'Interdimensional', 'Mutant', 'Hybrid'],
            monster: ['Beast', 'Demon', 'Creature', 'Abomination', 'Horror'],
            mythical: ['Deity', 'Titan', 'Spirit', 'Elemental', 'Guardian'],
            hybrid: ['Chimera', 'Fusion', 'Crossbreed', 'Mutant', 'Hybrid'],
            undead: ['Zombie', 'Skeleton', 'Ghost', 'Wraith', 'Lich']
        };

        // Power options based on character type
        const powerOptions = {
            humanoid: ['Super Strength', 'Intelligence', 'Agility', 'Charisma', 'Leadership', 'Combat Skills'],
            animal: ['Enhanced Senses', 'Speed', 'Strength', 'Camouflage', 'Flight', 'Natural Weapons'],
            fantasy: ['Magic', 'Elemental Control', 'Shapeshifting', 'Healing', 'Teleportation', 'Summoning'],
            robot: ['Technology', 'Energy Weapons', 'Shields', 'Flight', 'Transformation', 'Hacking'],
            alien: ['Telepathy', 'Energy Manipulation', 'Shapeshifting', 'Mind Control', 'Cosmic Powers'],
            monster: ['Supernatural Strength', 'Regeneration', 'Fear Inducement', 'Dark Magic', 'Possession'],
            mythical: ['Divine Powers', 'Creation', 'Destruction', 'Time Control', 'Reality Warping'],
            hybrid: ['Mixed Powers', 'Adaptation', 'Evolution', 'Power Absorption', 'Transformation'],
            undead: ['Necromancy', 'Life Drain', 'Soul Manipulation', 'Dark Magic', 'Immortality']
        };

        // Theme options based on character type
        const themeOptions = {
            humanoid: ['Modern', 'Medieval', 'Futuristic', 'Fantasy', 'Cyberpunk', 'Steampunk'],
            animal: ['Natural', 'Wild', 'Mythical', 'Urban', 'Jungle', 'Arctic'],
            fantasy: ['Magical', 'Enchanted', 'Mystical', 'Ethereal', 'Celestial', 'Arcane'],
            robot: ['Futuristic', 'Industrial', 'High-Tech', 'Mechanical', 'Digital', 'Cyberpunk'],
            alien: ['Cosmic', 'Interstellar', 'Otherworldly', 'Dimensional', 'Ethereal', 'Bizarre'],
            monster: ['Horror', 'Dark', 'Gothic', 'Mysterious', 'Sinister', 'Eldritch'],
            mythical: ['Divine', 'Ancient', 'Legendary', 'Mystical', 'Sacred', 'Profane'],
            hybrid: ['Fusion', 'Experimental', 'Unnatural', 'Mutated', 'Transformed', 'Evolved'],
            undead: ['Gothic', 'Dark', 'Mysterious', 'Haunted', 'Cursed', 'Necromantic']
        };

        // Update species options
        characterSpecies.innerHTML = '<option value="Random">Random</option>';
        if (speciesOptions[selectedType]) {
            speciesOptions[selectedType].forEach(species => {
                const option = document.createElement('option');
                option.value = species.toLowerCase();
                option.textContent = species;
                characterSpecies.appendChild(option);
            });
        }

        // Update powers options
        characterPowers.innerHTML = '<option value="Random">Random</option>';
        if (powerOptions[selectedType]) {
            powerOptions[selectedType].forEach(power => {
                const option = document.createElement('option');
                option.value = power.toLowerCase();
                option.textContent = power;
                characterPowers.appendChild(option);
            });
        }

        // Update theme options
        characterTheme.innerHTML = '<option value="Random">Random</option>';
        if (themeOptions[selectedType]) {
            themeOptions[selectedType].forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.toLowerCase();
                option.textContent = theme;
                characterTheme.appendChild(option);
            });
        }
    });

    // Handle accessory type change
    accessoryType.addEventListener('change', () => {
        const selectedType = accessoryType.value;
        
        // Update style options
        accessoryStyle.innerHTML = '<option value="">Select Style</option>';
        if (styleOptions[selectedType]) {
            styleOptions[selectedType].forEach(style => {
                const option = document.createElement('option');
                option.value = style.toLowerCase();
                option.textContent = style;
                accessoryStyle.appendChild(option);
            });
        }

        // Update material options
        accessoryMaterial.innerHTML = '<option value="">Select Material</option>';
        if (materialOptions[selectedType]) {
            materialOptions[selectedType].forEach(material => {
                const option = document.createElement('option');
                option.value = material.toLowerCase();
                option.textContent = material;
                accessoryMaterial.appendChild(option);
            });
        }
    });

    // Handle theme options
    // themeOptions.forEach(theme => {
    //     const option = document.createElement('option');
    //     option.value = theme.toLowerCase();
    //     option.textContent = theme;
    //     characterTheme.appendChild(option);
    // });

    // Toggle details visibility
    toggleDetails.addEventListener('click', () => {
        const isCollapsed = toggleDetails.classList.toggle('collapsed');
        
        if (isCollapsed) {
            // Collapse
            toggleDetails.classList.remove('collapsed');
            imageDetails.style.minHeight = 'auto';
            if (generationType.value === 'character') {
                characterOptions.style.display = 'flex';
                setTimeout(() => characterOptions.classList.add('visible'), 10);
            } else if (generationType.value === 'accessory') {
                accessoryOptions.style.display = 'flex';
                setTimeout(() => accessoryOptions.classList.add('visible'), 10);
            }
        } else {
            // Expand
            toggleDetails.classList.add('collapsed');
            imageDetails.style.minHeight = '50px';
            characterOptions.classList.remove('visible');
            accessoryOptions.classList.remove('visible');
            setTimeout(() => {
                characterOptions.style.display = 'none';
                accessoryOptions.style.display = 'none';
            }, 300);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Load configuration
    loadConfig();

    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const imageInput = document.getElementById('imageInput');
    const multipleImagePreview = document.getElementById('multipleImagePreview');
    const imageCountInput = document.getElementById('imageCount');
    const imageSizeInput = document.getElementById('imageSize');
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    const resultsDiv = document.getElementById('results');
    const uploadCircle = document.querySelector('.upload-circle');
    const modal = document.getElementById('imagePreviewModal');
    const closeModal = document.querySelector('.close-modal');

    // Sidebar elements
    const leftSidebar = document.querySelector('.left-sidebar');
    const rightSidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const mainContainerLogo = document.getElementById('main-container-logo');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeButtons = document.querySelectorAll('.close-sidebar');
    const mainContent = document.querySelector('.main-content');
    const navItems = document.querySelectorAll('.nav-item');
    const mainContainer = document.querySelector('.main-container');


    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            
            // Show/hide hamburger menu based on section
            if (hamburgerMenu) {
                if (section === 'image') {
                    hamburgerMenu.style.display = 'flex';
                } else {
                    hamburgerMenu.style.display = 'none';
                }
            }
            
            // Handle section switching
            const resetWidths = () => {
                const mainContainer = document.querySelector('.main-container');
                const header = document.querySelector('.header');
                if (window.innerWidth < 850) {
                    mainContainer.style.width = '100vw';
                    header.style.width = '100vw';
                } else {
                    mainContainer.style.width = '';
                    header.style.width = '';
                }
            };

            switch(section) {
                case 'image':
                    // Show the current image generation content
                    mainContent.style.display = 'block';
                    rightSidebar.style.display = 'block';
                    document.querySelector('.input-section').style.display = 'block';
                    resetWidths();
                    break;
                case 'post':
                    // Just hide current content and show post section
                    mainContent.style.display = 'none';
                    rightSidebar.style.display = 'none';
                    document.querySelector('.input-section').style.display = 'none';
                    if (window.innerWidth < 850) {
                        document.querySelector('.main-container').style.width = '100vw';
                        document.querySelector('.header').style.width = '100vw';
                    } else {
                        resetWidths();
                    }
                    break;
                case 'email':
                    // Hide current content and show email content
                    mainContent.style.display = 'none';
                    rightSidebar.style.display = 'none';
                    document.querySelector('.input-section').style.display = 'none';
                    if (window.innerWidth < 850) {
                        document.querySelector('.main-container').style.width = '80vw';
                        document.querySelector('.header').style.width = '100vw';
                    } else {
                        resetWidths();
                    }
                    // TODO: Add email content
                    break;
                case 'task':
                    // Hide current content and show task content
                    mainContent.style.display = 'none';
                    rightSidebar.style.display = 'none';
                    document.querySelector('.input-section').style.display = 'none';
                    if (window.innerWidth < 850) {
                        document.querySelector('.main-container').style.width = '80vw';
                        document.querySelector('.header').style.width = '100vw';
                    } else {
                        resetWidths();
                    }
                    // TODO: Add task content
                    break;
                case 'characters':
                    // Hide other sections and show characters section
                    mainContent.style.display = 'none';
                    rightSidebar.style.display = 'none';
                    document.querySelector('.input-section').style.display = 'none';
                    document.getElementById('charactersSection').style.display = '';
                    document.getElementById('imageSection').style.display = 'none';
                    document.getElementById('postSection').style.display = 'none';
                    document.getElementById('taskSection').style.display = 'none';
                    document.getElementById('emailSection') && (document.getElementById('emailSection').style.display = 'none');
                    if (window.showCharactersSection) window.showCharactersSection();
                    resetWidths();
                    break;
            }
            
            // Close the left sidebar on mobile after selection
            if (window.innerWidth <= 850) {
                leftSidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });

    // Initialize hamburger menu visibility on page load
    document.addEventListener('DOMContentLoaded', () => {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const activeSection = document.querySelector('.nav-item.active');
        
        if (hamburgerMenu && activeSection) {
            if (activeSection.getAttribute('data-section') === 'image') {
                hamburgerMenu.style.display = 'flex';
            } else {
                hamburgerMenu.style.display = 'none';
            }
        }
    });

    // Toggle left sidebar when main container logo is clicked
    if (mainContainerLogo) {
        mainContainerLogo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Only toggle left sidebar
            leftSidebar.classList.toggle('active');
            // Close right sidebar if open
            rightSidebar.classList.remove('active');
            // Toggle overlay
            overlay.classList.toggle('active');
        });
    }

    // Close both sidebars when overlay is clicked
    if (overlay) {
        overlay.addEventListener('click', function() {
            leftSidebar.classList.remove('active');
            rightSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar when close button is clicked
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sidebar = this.closest('.sidebar, .left-sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });

    // Custom select implementation
    document.querySelectorAll('.custom-select').forEach(selectElement => {
        const selectButton = selectElement.querySelector('.select-selected');
        const selectOptions = selectElement.querySelector('.select-items');
        const hiddenSelect = selectElement.querySelector('select');
        
        if (selectButton && selectOptions) {
            // Initialize with correct value from hidden select if available
            if (hiddenSelect && hiddenSelect.options.length > 0) {
                const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
                if (selectedOption) {
                    selectButton.textContent = selectedOption.textContent;
                }
            }
            
            // Toggle dropdown when clicking on the select button
            selectButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent document click from immediately closing it
                
                // Close all other select dropdowns
                document.querySelectorAll('.custom-select .select-items').forEach(options => {
                    if (options !== selectOptions) {
                        options.classList.remove('active');
                }
            });
            
                // Toggle the dropdown
                selectOptions.classList.toggle('active');
                selectButton.classList.toggle('active');
        });
        
            // Add click event to select options
            selectOptions.querySelectorAll('div').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.getAttribute('data-value');
                    const text = option.textContent;
                
                    // Update the selected option text
                    selectButton.textContent = text;
                
                    // Update the hidden select value if available
                    if (hiddenSelect) {
                        hiddenSelect.value = value;
                
                        // Trigger native select change event
                        const changeEvent = new Event('change', { bubbles: true });
                        hiddenSelect.dispatchEvent(changeEvent);
                    }
                    
                    // Mark this option as selected
                    selectOptions.querySelectorAll('div').forEach(opt => {
                        opt.classList.remove('same-as-selected');
                    });
                    option.classList.add('same-as-selected');
                
                // Close dropdown
                    selectOptions.classList.remove('active');
                    selectButton.classList.remove('active');
                
                    // Trigger change event for the custom select
                    const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
            });
        });
        }
    });
    
    // Close all custom selects when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-selected') && !e.target.closest('.select-items')) {
            document.querySelectorAll('.custom-select .select-items.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            document.querySelectorAll('.select-selected.active').forEach(button => {
                button.classList.remove('active');
            });
        }
    });

    // Auto-expand textarea
    const textarea = document.getElementById('prompt');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 250);
            this.style.height = newHeight + 'px';
        });
            
        let originalHeight = textarea.style.height;
        
        textarea.addEventListener('focus', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 250);
            this.style.height = newHeight + 'px';
        });

        textarea.addEventListener('blur', function() {
            this.style.height = originalHeight;
        });
    }

    // Handle image upload and preview
    uploadCircle.addEventListener('click', () => {
        imageInput.click();
    });

    // Variable to store uploaded image files
    let uploadedImages = [];

    imageInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            uploadedImages = Array.from(files);
            
            // Clear previous previews
            multipleImagePreview.innerHTML = '';
            
            // Show all images in the multipleImagePreview div
            for (let i = 0; i < files.length; i++) {
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-thumbnail';
                    imgContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${i+1}">
                        <div class="remove-image" data-index="${i}">×</div>
                    `;
                    multipleImagePreview.appendChild(imgContainer);
                    
                    // Add event listener to remove button
                    imgContainer.querySelector('.remove-image').addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.getAttribute('data-index'));
                        uploadedImages.splice(index, 1);
                        this.parentElement.remove();
                        
                        // Update the data-index attributes
                        const removeButtons = multipleImagePreview.querySelectorAll('.remove-image');
                        removeButtons.forEach((btn, idx) => {
                            btn.setAttribute('data-index', idx);
                        });
                    });
                };
                fileReader.readAsDataURL(files[i]);
            }
            
            // Keep the upload circle styled as active
            uploadCircle.style.border = '2px dashed var(--border-color)';

            uploadCircle.addEventListener('mouseover', () => {
                uploadCircle.style.borderColor = 'var(--accent-color)';
                uploadCircle.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.2)';
            });
            
            uploadCircle.addEventListener('mouseout', () => {
                uploadCircle.style.borderColor = 'var(--border-color)';
                uploadCircle.style.boxShadow = 'none';
            });

        } else {
            multipleImagePreview.innerHTML = '';
            uploadCircle.style.border = '2px dashed var(--border-color)';
            uploadedImages = [];
        }
    });

    // Modal functionality
    function hideModal() {
        if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        }
    }

    // Initialize event listeners only if elements exist
    if (closeModal) {
    closeModal.addEventListener('click', hideModal);
    }
    
    if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Keyboard event listener to close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            hideModal();
        }
    });

    // Validate image count input and update UI
    const imageCountSelect = document.getElementById('imageCount');
    if (imageCountSelect) {
        imageCountSelect.addEventListener('change', () => {
            let value = parseInt(imageCountSelect.value);
        if (value < 1) value = 1;
        if (value > 6) value = 6;
            imageCountSelect.value = value;
            
            // Also update the custom select text if needed
            const customSelect = imageCountSelect.closest('.custom-select');
            if (customSelect) {
                const selectButton = customSelect.querySelector('.select-selected');
                if (selectButton) {
                    const suffix = value === 1 ? ' Image' : ' Images';
                    selectButton.textContent = value + suffix;
                }
            }
    });
    }

    // Art Style variables
    const styleSearch = document.getElementById('styleSearch');
    const styleItems = document.querySelectorAll('.style-item');
    const selectedStyleText = document.getElementById('selectedStyleText');
    const selectedStyle = document.querySelector('.selected-style');
    const artStyleInput = document.getElementById('artStyle');
    
    // Style search functionality
    styleSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        styleItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Style selection
    styleItems.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            
            // Update visuals
            styleItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update selected style display
            selectedStyleText.textContent = value;
            selectedStyle.classList.add('has-style');
            
            // Update hidden input
            artStyleInput.value = value;
        });
    });

    // Temperature slider functionality
    temperatureSlider.addEventListener('input', function() {
        temperatureValue.textContent = this.value;
    });

    // Generate button click handler
    generateBtn.addEventListener('click', async () => {
        // Check if API key is configured
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            alert('Please set your Gemini API key before generating images.');
            return;
        }
        
        const prompt = promptInput.value.trim();
        const generationType = document.getElementById('generationType').value;
        const imageCount = Math.min(6, Math.max(1, parseInt(imageCountInput.value)));
        const imageSize = imageSizeInput.value;
        const temperature = parseFloat(temperatureSlider.value);
        
        // Only require prompt if not in character generation mode
        if (!prompt && generationType !== 'character') {
            // Show error animation on prompt textarea
            promptInput.classList.add('error-shake');
            setTimeout(() => promptInput.classList.remove('error-shake'), 600);
            return;
        }

        // For character generation, check if required fields are filled
        if (generationType === 'character') {
            let characterType = document.getElementById('characterType').value;
            let characterView = document.getElementById('characterSide').value;
            let characterSpecies = document.getElementById('characterSpecies').value;
            let characterPowers = document.getElementById('characterPowers').value;
            let characterTheme = document.getElementById('characterTheme').value;
            
            // If Random is selected for type, randomly choose from available types
            if (characterType === 'Random') {
                const availableTypes = ['humanoid', 'animal', 'fantasy', 'robot', 'alien', 'monster', 'mythical', 'hybrid', 'undead'];
                characterType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            // If Random Pose is selected, randomly choose from available poses
            if (characterView === 'Random Pose') {
                const availablePoses = ['Front', 'Back', 'Side', 'Three Quarter', 'Dynamic Pose', 'Action Pose', 'Flying Pose', 'Sitting Pose', 'Running Pose'];
                characterView = availablePoses[Math.floor(Math.random() * availablePoses.length)];
            }

            // Define all options
            const speciesOptions = {
                humanoid: ['Human', 'Elf', 'Dwarf', 'Orc', 'Vampire', 'Werewolf'],
                animal: ['Mammal', 'Reptile', 'Bird', 'Fish', 'Insect', 'Hybrid'],
                fantasy: ['Dragon', 'Fairy', 'Phoenix', 'Griffin', 'Unicorn', 'Pegasus'],
                robot: ['Android', 'Cyborg', 'Mech', 'Drone', 'AI', 'Automaton'],
                alien: ['Extraterrestrial', 'Cosmic', 'Interdimensional', 'Mutant', 'Hybrid'],
                monster: ['Beast', 'Demon', 'Creature', 'Abomination', 'Horror'],
                mythical: ['Deity', 'Titan', 'Spirit', 'Elemental', 'Guardian'],
                hybrid: ['Chimera', 'Fusion', 'Crossbreed', 'Mutant', 'Hybrid'],
                undead: ['Zombie', 'Skeleton', 'Ghost', 'Wraith', 'Lich']
            };

            const powerOptions = {
                humanoid: ['Super Strength', 'Intelligence', 'Agility', 'Charisma', 'Leadership', 'Combat Skills'],
                animal: ['Enhanced Senses', 'Speed', 'Strength', 'Camouflage', 'Flight', 'Natural Weapons'],
                fantasy: ['Magic', 'Elemental Control', 'Shapeshifting', 'Healing', 'Teleportation', 'Summoning'],
                robot: ['Technology', 'Energy Weapons', 'Shields', 'Flight', 'Transformation', 'Hacking'],
                alien: ['Telepathy', 'Energy Manipulation', 'Shapeshifting', 'Mind Control', 'Cosmic Powers'],
                monster: ['Supernatural Strength', 'Regeneration', 'Fear Inducement', 'Dark Magic', 'Possession'],
                mythical: ['Divine Powers', 'Creation', 'Destruction', 'Time Control', 'Reality Warping'],
                hybrid: ['Mixed Powers', 'Adaptation', 'Evolution', 'Power Absorption', 'Transformation'],
                undead: ['Necromancy', 'Life Drain', 'Soul Manipulation', 'Dark Magic', 'Immortality']
            };

            const themeOptions = {
                humanoid: ['Modern', 'Medieval', 'Futuristic', 'Fantasy', 'Cyberpunk', 'Steampunk'],
                animal: ['Natural', 'Wild', 'Mythical', 'Urban', 'Jungle', 'Arctic'],
                fantasy: ['Magical', 'Enchanted', 'Mystical', 'Ethereal', 'Celestial', 'Arcane'],
                robot: ['Futuristic', 'Industrial', 'High-Tech', 'Mechanical', 'Digital', 'Cyberpunk'],
                alien: ['Cosmic', 'Interstellar', 'Otherworldly', 'Dimensional', 'Ethereal', 'Bizarre'],
                monster: ['Horror', 'Dark', 'Gothic', 'Mysterious', 'Sinister', 'Eldritch'],
                mythical: ['Divine', 'Ancient', 'Legendary', 'Mystical', 'Sacred', 'Profane'],
                hybrid: ['Fusion', 'Experimental', 'Unnatural', 'Mutated', 'Transformed', 'Evolved'],
                undead: ['Gothic', 'Dark', 'Mysterious', 'Haunted', 'Cursed', 'Necromantic']
            };

            // Update dropdowns based on character type
            const speciesSelect = document.getElementById('characterSpecies');
            const powersSelect = document.getElementById('characterPowers');
            const themeSelect = document.getElementById('characterTheme');

            // Clear existing options except Random
            while (speciesSelect.options.length > 1) speciesSelect.remove(1);
            while (powersSelect.options.length > 1) powersSelect.remove(1);
            while (themeSelect.options.length > 1) themeSelect.remove(1);

            // Add new options based on character type
            speciesOptions[characterType].forEach(species => {
                const option = new Option(species, species);
                speciesSelect.add(option);
            });

            powerOptions[characterType].forEach(power => {
                const option = new Option(power, power);
                powersSelect.add(option);
            });

            themeOptions[characterType].forEach(theme => {
                const option = new Option(theme, theme);
                themeSelect.add(option);
            });

            // Handle Random for Species
            if (characterSpecies === 'Random') {
                const availableSpecies = speciesOptions[characterType] || [];
                characterSpecies = availableSpecies[Math.floor(Math.random() * availableSpecies.length)];
            }

            // Handle Random for Powers
            if (characterPowers === 'Random') {
                const availablePowers = powerOptions[characterType] || [];
                characterPowers = availablePowers[Math.floor(Math.random() * availablePowers.length)];
            }

            // Handle Random for Theme
            if (characterTheme === 'Random') {
                const availableThemes = themeOptions[characterType] || [];
                characterTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
            }

            // Update all select elements with the chosen values
            document.getElementById('characterType').value = characterType;
            document.getElementById('characterSide').value = characterView;
            document.getElementById('characterSpecies').value = characterSpecies;
            document.getElementById('characterPowers').value = characterPowers;
            document.getElementById('characterTheme').value = characterTheme;
        }

        // Show loading state on button
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');
        const originalBtnText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span>Generating...</span>';
        
        // Clear previous results
        resultsDiv.querySelector('.image-grid').innerHTML = '';
        
        const imageGrid = resultsDiv.querySelector('.image-grid');

        // Scroll to results area
        window.scrollTo({
            top: resultsDiv.offsetTop - 50,
            behavior: 'smooth'
        });

        let imageBase64 = null;
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            imageBase64 = await toBase64(file);
        }

        const createImageContainer = (index) => {
            const container = document.createElement('div');
            container.className = 'image-container';
            container.innerHTML = `
                <div class="loading-animation">
                    <div class="loading-spinner"></div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <div class="status-indicator status-generating">Generating</div>
                <button class="download-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                </button>
                <button class="retry-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Retry
                </button>
            `;
            imageGrid.appendChild(container);
            
            // Add retry button functionality
            const retryBtn = container.querySelector('.retry-btn');
            retryBtn.addEventListener('click', () => {
                // Reset container and re-generate this image
                container.innerHTML = '';
                generateSingleImage(index);
            });
            
            return container;
        };

        const updateProgress = (container, progress) => {
            const progressBar = container.querySelector('.progress-bar');
            progressBar.style.width = `${progress}%`;
        };

        const updateStatus = (container, status, error = null) => {
            const statusIndicator = container.querySelector('.status-indicator');
            statusIndicator.className = `status-indicator status-${status}`;
            
            // Add or remove error class on container
            if (status === 'error') {
                container.classList.add('error');
                // Show specific error message
                statusIndicator.innerHTML = `Error: ${error ? (error.substring(0, 50) + (error.length > 50 ? '...' : '')) : 'Failed to generate image'}`;
                statusIndicator.title = error || 'Unknown error occurred'; // Full error on hover
            } else {
                container.classList.remove('error');
                statusIndicator.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                statusIndicator.title = ''; // Clear any existing title
            }
        };

        const generateSingleImage = async (index) => {
            const container = createImageContainer(index);
            
            try {
                let parts = [];

                // Add all uploaded images to the request
                if (uploadedImages.length > 0) {
                    for (const imageFile of uploadedImages) {
                        const compressedImage = await compressImage(imageFile);
                        parts.push({
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: compressedImage.split(',')[1]
                            }
                        });
                    }
                }

                // Get the selected art style
                const artStyle = document.getElementById('artStyle').value;
                
                // Get generation type and related options
                let promptText = promptInput.value.trim();
                let finalPrompt = promptText;

                // Handle character generation
                if (generationType === 'character') {
                    const characterType = document.getElementById('characterType').value;
                    const characterView = document.getElementById('characterSide').value;
                    const characterSpecies = document.getElementById('characterSpecies').value;
                    const characterPowers = document.getElementById('characterPowers').value;
                    const characterTheme = document.getElementById('characterTheme').value;
                    const characterNegative = document.getElementById('characterDescription').value;

                    // Only proceed if required fields are filled
                    if (characterType && characterView && characterSpecies) {
                        finalPrompt = `Create a photo-realistic style character of ${characterType} in a full body, T-pose, ${characterView}-facing. The character is Species ${characterSpecies}`;
                        
                        // Add optional fields if they exist
                        if (characterPowers) finalPrompt += `, Powers ${characterPowers}`;
                        if (characterTheme) finalPrompt += `, Theme ${characterTheme}`;
                        if (promptText) finalPrompt += `, ${promptText}`;
                        
                        finalPrompt += `. The character stands on a plain white background to ensure clarity of details.`;
                        
                        // Add negative prompt if provided
                        if (characterNegative) {
                            finalPrompt += ` --no ${characterNegative}`;
                        }
                    }
                }
                
                // Add art style to the prompt if selected
                if (artStyle) {
                    finalPrompt += `, ${artStyle} style`;
                }
                
                // Add aspect ratio to the prompt
                let aspectRatio = "";
                switch(imageSize) {
                    case "1:1":
                        aspectRatio = "in square (1:1) aspect ratio";
                        break;
                    case "3:4":
                        aspectRatio = "in portrait (3:4) aspect ratio";
                        break;
                    case "4:3":
                        aspectRatio = "in landscape (4:3) aspect ratio";
                        break;
                    case "9:16":
                        aspectRatio = "in tall portrait (9:16) aspect ratio";
                        break;
                    case "16:9":
                        aspectRatio = "in widescreen (16:9) aspect ratio";
                        break;
                    default:
                        aspectRatio = "in square (1:1) aspect ratio";
                }
                finalPrompt += ` ${aspectRatio}`;

                // Check if magic prompt is enabled
                const magicPromptEnabled = document.getElementById('magicPromptToggle').checked;
                if (magicPromptEnabled) {
                    try {
                        // Call Gemini API to enhance the prompt
                        const enhanceResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `create an enhanced version of user prompt, this is users prompt: "${finalPrompt}". only provide the new enhanced prompt, if user saying that he has provided image then just refer that image don't give explaination about it (it means user already provide the image)`
                                    }]
                                }]
                            })
                        });

                        if (enhanceResponse.ok) {
                            const enhanceData = await enhanceResponse.json();
                            if (enhanceData.candidates && enhanceData.candidates[0].content.parts[0].text) {
                                finalPrompt = enhanceData.candidates[0].content.parts[0].text.trim();
                            }
                        }
                    } catch (error) {
                        console.warn('Failed to enhance prompt:', error);
                        // Continue with original prompt if enhancement fails
                    }
                }

                if (finalPrompt !== "") {
                    parts.push({ text: finalPrompt });
                }

                const requestData = {
                    contents: [{
                        role: "user",
                        parts: parts
                    }],
                    generationConfig: {
                        responseModalities: ["image", "text"],
                        responseMimeType: "text/plain",
                        temperature: temperature
                    }
                };

                // Call Gemini API directly 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    try {
                        // Try to parse error response for more details
                        const errorData = JSON.parse(errorText);
                        if (errorData.error) {
                            if (errorData.error.message) {
                            errorMessage = errorData.error.message;
                            } else if (typeof errorData.error === 'string') {
                                errorMessage = errorData.error;
                            } else if (errorData.details) {
                                errorMessage = errorData.details;
                            }
                            
                            // Special handling for common error cases
                            if (errorMessage.includes('API key')) {
                                errorMessage = 'Missing or invalid API key. Check your config.js file.';
                            } else if (response.status === 429) {
                                errorMessage = 'Rate limit exceeded. Please try again later.';
                            } else if (response.status === 500) {
                                errorMessage = 'Server error. Check if the API key is set up correctly.';
                            }
                        }
                    } catch (e) {
                        // If we can't parse the error, just use the text
                        if (errorText) errorMessage += ` - ${errorText}`;
                    }
                    throw new Error(errorMessage);
                }

                // Process the JSON response directly
                const data = await response.json();
                
                // Show progress updates
                updateProgress(container, 90);
                
                if (data && data.candidates && data.candidates.length > 0) {
                    const parts = data.candidates[0].content.parts;
                    const imagePart = parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));
                    
                    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
                        updateProgress(container, 100);
                        updateStatus(container, 'complete');
                        
                        // Remove loading animation if present
                        const loadingAnimation = container.querySelector('.loading-animation');
                        if (loadingAnimation) {
                            loadingAnimation.remove();
                        }
                        
                        // Create and set up the image
                        const img = document.createElement('img');
                        const imageSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                        img.src = imageSrc;
                        img.alt = `Generated Image ${index + 1}`;
                        container.insertBefore(img, container.querySelector('.progress-container'));
                        
                        // Store the image in our collection
                        if (!generatedImages.includes(imageSrc)) {
                            generatedImages.push(imageSrc);
                            
                            // Store the current style for this image
                            imageStyleMap.set(imageSrc, artStyle);
                        }
                        
                        // Always update thumbnails regardless of whether the modal is open
                        updateThumbnails(imageSrc);
                        
                        // Add click event for preview
                        img.addEventListener('click', () => {
                            // Ensure the modal opens with this image
                            showModal(imageSrc);
                        });
                        
                        // If this is the first image and only generating one, automatically open the modal
                        if (index === 0 && imageCount === 1) {
                            // Short delay to allow UI to update first
                            setTimeout(() => showModal(imageSrc), 500);
                        }
                        
                        // Show download button
                        const downloadBtn = container.querySelector('.download-btn');
                        downloadBtn.style.display = 'flex';
                        downloadBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = imageSrc;
                            link.download = `generated-image-${index + 1}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        });
                    } else {
                        updateStatus(container, 'error', 'No image data found in the API response');
                    }
                } else {
                    updateStatus(container, 'error', 'Invalid response from API');
                }
            } catch (err) {
                updateStatus(container, 'error', err.message);
                console.error(`Error generating image ${index + 1}:`, err);
                
                // Show retry button
                const retryBtn = container.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.style.display = 'flex';
                }
            }
        };

        const imagePromises = Array.from({ length: imageCount }, (_, i) => generateSingleImage(i));
        await Promise.allSettled(imagePromises);
        
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = originalBtnText;
    });

    // Handle logo click on mobile
    if (mainContainerLogo) {
        mainContainerLogo.addEventListener('click', (e) => {
            if (window.innerWidth <= 850) {
                e.preventDefault();
                e.stopPropagation();
                leftSidebar.classList.add('active');
                overlay.classList.add('active');
            }
        });
    }

    // Close sidebar when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            leftSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar when clicking close button
    const closeSidebarBtn = document.querySelector('.left-sidebar .close-sidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            leftSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }


    // Function to reset container widths
    function resetWidths() {
        const mainContainer = document.querySelector('.main-container');
        const header = document.querySelector('.header');
        if (window.innerWidth < 850) {
            mainContainer.style.width = '100vw';
            header.style.width = '100vw';
        } else {
            mainContainer.style.width = '';
            header.style.width = '';
        }
    }

    // Function to handle section switching
    function switchSection(sectionId) {
        // Remove active class from all sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(`${sectionId}Section`);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }

        // Handle header width and hamburger menu visibility
        if (sectionId === 'image') {
            mainContainer.classList.add('image-section-active');
            if (window.innerWidth <= 850) {
                hamburgerMenu.style.display = 'flex';
            }
            // Show right sidebar for image section
            rightSidebar.style.display = 'block';
            // Show main content and input section
            mainContent.style.display = 'block';
            document.querySelector('.input-section').style.display = 'block';
        } else {
            mainContainer.classList.remove('image-section-active');
            hamburgerMenu.style.display = 'none';
            // Hide right sidebar for non-image sections
            rightSidebar.style.display = 'none';
            // Hide main content and input section
            mainContent.style.display = 'none';
            document.querySelector('.input-section').style.display = 'none';
            // Close right sidebar if open
            rightSidebar.classList.remove('active');
            overlay.classList.remove('active');
        }

        // Handle mobile layout
        if (window.innerWidth < 850) {
            if (sectionId === 'post') {
                document.querySelector('.main-container').style.width = '100vw';
                document.querySelector('.header').style.width = '100vw';
            } else {
                resetWidths();
            }
        } else {
            resetWidths();
        }
    }

    // Add click handlers for nav items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            switchSection(sectionId);
        });
    });

    // Handle hamburger menu click
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            rightSidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    // Initialize with image section active
    if (document.querySelector('.nav-item.active')) {
        const activeSection = document.querySelector('.nav-item.active').getAttribute('data-section');
        switchSection(activeSection);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 850) {
            rightSidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });
});

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Update the generateImage function to use the proxy
async function generateImage(prompt, imageCount) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                imageCount: imageCount
            })
        });
        
        const data = await response.json();
        // ... rest of your existing code ...
    } catch (error) {
        console.error('Error:', error);
        // ... error handling ...
    }
}

// Helper function to compress image
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                const maxSize = 1024; // Maximum dimension
                
                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with quality compression
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Initialize text editor when modal is shown
function initTextEditor() {
    canvas = document.getElementById('textCanvas');
    if (!canvas) {
        console.error('Text canvas not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Get image dimensions and set canvas size
    const img = document.getElementById('modalImage');
    if (!img) {
        console.error('Modal image not found');
        return;
    }
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Store the current image source
    currentImage = img.src;
    
    // Get the current image style
    const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
    
    // First check if this specific image has layers
    if (imageLayersMap.has(currentImage)) {
        layers = imageLayersMap.get(currentImage);
    } 
    // Then check if there are layers for this style that we can apply
    else if (currentStyle && styleLayersMap.has(currentStyle) && styleLayersMap.get(currentStyle).length > 0) {
        // Clone the style layers to avoid modifying the originals
        layers = JSON.parse(JSON.stringify(styleLayersMap.get(currentStyle)));
        // Save these layers for this specific image
        imageLayersMap.set(currentImage, layers);
    } 
    // Otherwise use empty layers array
    else {
        layers = [];
    }
    
    activeLayer = layers.length > 0 ? layers[0] : null;
    
    updateLayerList();
    
    // Set up toggle buttons
    const showOriginal = document.getElementById('showOriginal');
    const showEdited = document.getElementById('showEdited');
    const modalImage = document.getElementById('modalImage');
    const textCanvas = document.getElementById('textCanvas');
    
    if (showOriginal) {
        showOriginal.addEventListener('click', () => {
            if (showOriginal && showEdited && modalImage && textCanvas) {
                showOriginal.classList.add('active');
                showEdited.classList.remove('active');
                modalImage.classList.add('active');
                textCanvas.classList.remove('active');
            }
        });
    }
    
    if (showEdited) {
        showEdited.addEventListener('click', () => {
            if (showOriginal && showEdited && modalImage && textCanvas) {
                showEdited.classList.add('active');
                showOriginal.classList.remove('active');
                textCanvas.classList.add('active');
                modalImage.classList.remove('active');
                renderCanvas();
            }
        });
    }
    
    // Add text layer button
    const addTextLayerBtn = document.getElementById('addTextLayer');
    if (addTextLayerBtn) {
        addTextLayerBtn.addEventListener('click', addTextLayer);
    }
    
    // Download buttons
    const downloadOriginalBtn = document.getElementById('downloadOriginal');
    if (downloadOriginalBtn) {
        downloadOriginalBtn.addEventListener('click', downloadOriginal);
    }
    
    const downloadEditedBtn = document.getElementById('downloadEdited');
    if (downloadEditedBtn) {
        downloadEditedBtn.addEventListener('click', downloadEdited);
    }
    
    // Setup tab switching for mobile view
    setupTabSwitching();
    
    // If we have layers, render the canvas and show edited view if needed
    if (layers.length > 0) {
        renderCanvas();
        // If previously the user was viewing the edited version, show that
        if (imageLayersMap.get(currentImage + '_viewingEdited')) {
            if (showEdited) showEdited.click();
        }
    }
    
    // Hide layer editor initially if no active layer
    toggleLayerEditorVisibility();
}

function setupTabSwitching() {
    const propertiesTab = document.getElementById('propertiesTab');
    const layersTab = document.getElementById('layersTab');
    const propertiesContent = document.getElementById('propertiesContent');
    const layersContent = document.getElementById('layersContent');

    function activateTab(tab, content) {
        // Remove 'active' class from all tabs and contents
        propertiesTab.classList.remove('active');
        layersTab.classList.remove('active');
        propertiesContent.classList.remove('active');
        layersContent.classList.remove('active');

        // Add 'active' class to selected tab and its content
        tab.classList.add('active');
        content.classList.add('active');
    }

    // Set up event listeners
    propertiesTab.addEventListener('click', () => {
        activateTab(propertiesTab, propertiesContent);
    });

    layersTab.addEventListener('click', () => {
        activateTab(layersTab, layersContent);
    });
}

// Add Layer Dropdown Toggle
document.getElementById('addLayerBtn').addEventListener('click', (e) => {
    const dropdown = document.querySelector('.layer-dropdown');
    dropdown.classList.toggle('show');
    e.stopPropagation();
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.querySelector('.layer-dropdown').classList.remove('show');
});

// Image Layer Functions
function replaceLayerImage() {
    if (!activeLayer || activeLayer.type !== 'image') return;
    document.getElementById('layerImageInput').click();
}

// Keep aspect ratio when resizing
let maintainAspect = true;
let aspectRatio = 1;

document.getElementById('maintainAspectRatio').addEventListener('click', (e) => {
    maintainAspect = !maintainAspect;
    e.target.textContent = maintainAspect ? '🔒' : '🔓';
});

// Handle image size changes
document.getElementById('imageWidth').addEventListener('input', (e) => {
    if (maintainAspect) {
        const height = Math.round(parseInt(e.target.value) / aspectRatio);
        document.getElementById('imageHeight').value = height;
        document.getElementById('imageHeightSlider').value = height;
    }
    updateLayer();
});

document.getElementById('imageHeight').addEventListener('input', (e) => {
    if (maintainAspect) {
        const width = Math.round(parseInt(e.target.value) * aspectRatio);
        document.getElementById('imageWidth').value = width;
        document.getElementById('imageWidthSlider').value = width;
    }
    updateLayer();
});

// Update displays
document.getElementById('imageOpacity').addEventListener('input', (e) => {
    document.getElementById('opacityValue').textContent = `${Math.round(e.target.value * 100)}%`;
});

document.getElementById('imageRotation').addEventListener('input', (e) => {
    document.getElementById('rotationValue').textContent = `${e.target.value}°`;
});

// Section Switching
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = {
        'image': document.getElementById('imageSection'),
        'post': document.getElementById('postSection')
    };

    // Function to switch sections
    function switchSection(sectionId) {
        // Hide all sections
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show selected section
        if (sections[sectionId]) {
            sections[sectionId].style.display = 'block';
        }

        // Update active nav item
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });

        // Close mobile menu if open
        if (window.innerWidth <= 850) {
            document.querySelector('.left-sidebar').classList.remove('active');
            document.querySelector('.sidebar-overlay').classList.remove('active');
        }
    }

    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            switchSection(sectionId);
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 850) {
            const leftSidebar = document.querySelector('.left-sidebar');
            const rightSidebar = document.querySelector('.sidebar');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const mainContainerLogo = document.getElementById('main-container-logo');
            
            if (!leftSidebar.contains(e.target) && !mainContainerLogo.contains(e.target)) {
                leftSidebar.classList.remove('active');
            }
            if (!rightSidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                rightSidebar.classList.remove('active');
            }
            if (!leftSidebar.contains(e.target) && !rightSidebar.contains(e.target) && 
                !hamburgerMenu.contains(e.target) && !mainContainerLogo.contains(e.target)) {
                document.querySelector('.sidebar-overlay').classList.remove('active');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 850) {
            document.querySelector('.left-sidebar').classList.remove('active');
            document.querySelector('.sidebar').classList.remove('active');
            document.querySelector('.sidebar-overlay').classList.remove('active');
        }
    });

    // Initialize with image section active
    switchSection('image');
});

// Image Details Section Functionality
function initImageDetails() {
    const toggleDetails = document.getElementById('toggleDetails');
    const detailsContent = document.querySelector('.details-content');
    const generationType = document.getElementById('generationType');
    const characterOptions = document.getElementById('characterOptions');
    const accessoryOptions = document.getElementById('accessoryOptions');
    const characterDescription = document.getElementById('characterDescription');
    const charCount = document.querySelector('.char-count');

    // Toggle details section
    toggleDetails.addEventListener('click', () => {
        const isCollapsed = toggleDetails.classList.toggle('collapsed');
        if (isCollapsed) {
            // Collapse
            characterOptions.classList.remove('visible');
            accessoryOptions.classList.remove('visible');
        } else {
            // Expand
            detailsContent.style.display = 'block';
        }
    });

    // Handle generation type change
    generationType.addEventListener('change', () => {
        const selectedType = generationType.value;
        
        // Hide all options first
        characterOptions.classList.remove('visible');
        accessoryOptions.classList.remove('visible');
        
        // Show selected options
        if (selectedType === 'character') {
            characterOptions.classList.add('visible');
        } else if (selectedType === 'accessory') {
            accessoryOptions.classList.add('visible');
        }
    });

    // Character description character count
    characterDescription.addEventListener('input', () => {
        const maxLength = 500;
        const currentLength = characterDescription.value.length;
        charCount.textContent = `${currentLength}/${maxLength}`;
        
        if (currentLength > maxLength) {
            characterDescription.value = characterDescription.value.substring(0, maxLength);
            charCount.textContent = `${maxLength}/${maxLength}`;
        }
    });

    // Handle reference image upload
    const referenceInput = document.getElementById('characterReferenceImage');
    const referencePreview = document.getElementById('referencePreview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');

    referenceInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                referencePreview.style.display = 'block';
                referencePreview.innerHTML = `<img src="${e.target.result}" alt="Reference Preview">`;
                uploadPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag and drop functionality
    const referenceUpload = document.querySelector('.reference-upload');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        referenceUpload.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        referenceUpload.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        referenceUpload.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        referenceUpload.classList.add('highlight');
    }

    function unhighlight(e) {
        referenceUpload.classList.remove('highlight');
    }

    referenceUpload.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file && file.type.startsWith('image/')) {
            referenceInput.files = dt.files;
            const event = new Event('change');
            referenceInput.dispatchEvent(event);
        }
    }
}

// Initialize image details when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initImageDetails();
});
