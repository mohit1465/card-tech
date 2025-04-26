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
    const modalImage = document.getElementById('modalImage');
    const modal = document.getElementById('imagePreviewModal');
    
    if (!modalImage || !modal || !imageSrc) {
        console.error('Modal elements not found or no image source provided');
        return;
    }
    
    // Add the image to our collection if it's not already there
    if (!generatedImages.includes(imageSrc)) {
        generatedImages.push(imageSrc);
        
        // Store the current style for this image
        const artStyle = document.getElementById('artStyle').value;
        imageStyleMap.set(imageSrc, artStyle);
        
        // Update thumbnail carousel
        updateThumbnails(imageSrc);
    } else {
        // Still update thumbnails to show the active state for this image
        updateThumbnails(imageSrc);
    }
    
    // Set the modal image
    modalImage.src = imageSrc;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
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
            // Update image in preview
            document.getElementById('modalImage').src = imgSrc;
            
            // Update all thumbnails to remove active class
            document.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            
            // Add active class to this thumbnail
            thumbnail.classList.add('active');
        });
    });
};

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
        console.log('API key loaded successfully');
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

document.addEventListener('DOMContentLoaded', async () => {
    // Load configuration
    await loadConfig();

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

    // New elements for responsive layout
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    // Create sidebar overlay
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
    
    // Toggle sidebar on hamburger menu click
    if (hamburgerMenu && sidebar && sidebarOverlay) {
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
    }
    
    // Close sidebar when clicking the close button or overlay
    if (closeSidebar) {
    closeSidebar.addEventListener('click', closeSidebarFunction);
    }
    
    if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarFunction);
    }
    
    function closeSidebarFunction() {
        if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
    }

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
            alert('Please set your Gemini API key in config.js before generating images.');
            return;
        }
        
        const prompt = promptInput.value.trim();
        const imageCount = Math.min(6, Math.max(1, parseInt(imageCountInput.value)));
        const imageSize = imageSizeInput.value; // Get the selected image size
        const temperature = parseFloat(temperatureSlider.value); // Get the temperature value
        
        if (!prompt) {
            // Show error animation on prompt textarea
            promptInput.classList.add('error-shake');
            setTimeout(() => promptInput.classList.remove('error-shake'), 600);
            return;
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
                
                // Add art style to the prompt if selected
                let promptText = promptInput.value.trim();
                if (artStyle) {
                    promptText += `, ${artStyle} style`;
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

                if (promptText !== "") {
                    parts.push({ text: `Generate a ultra high quality, detailed image: ${promptText} ${aspectRatio}` });
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
