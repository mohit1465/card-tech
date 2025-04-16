// Update the API URL to use the Render deployment URL
const MODEL_ID = 'gemini-2.0-flash-exp-image-generation';
const API_URL = 'https://cart-ai.onrender.com/api/generate';  // Update this with your Render URL

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imageCountInput = document.getElementById('imageCount');
    const imageSizeInput = document.getElementById('imageSize');
    const resultsDiv = document.getElementById('results');
    const uploadCircle = document.querySelector('.upload-circle');
    const modal = document.getElementById('imagePreviewModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    const downloadImage = document.getElementById('downloadImage');

    // New elements for responsive layout
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    // Create sidebar overlay
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
    
    // Toggle sidebar on hamburger menu click
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
    
    // Close sidebar when clicking the close button or overlay
    closeSidebar.addEventListener('click', closeSidebarFunction);
    sidebarOverlay.addEventListener('click', closeSidebarFunction);
    
    function closeSidebarFunction() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    // Fixed Custom Select Functionality
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(customSelect => {
        const selectSelected = customSelect.querySelector('.select-selected');
        const selectItems = customSelect.querySelector('.select-items');
        const selectOptions = selectItems.querySelectorAll('div');
        const selectElement = customSelect.querySelector('select');
        
        // Toggle dropdown
        selectSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close all other dropdowns first
            customSelects.forEach(otherSelect => {
                if (otherSelect !== customSelect) {
                    otherSelect.querySelector('.select-selected').classList.remove('active');
                    otherSelect.querySelector('.select-items').classList.remove('active');
                    otherSelect.querySelector('.select-items').classList.add('select-hide');
                }
            });
            
            // Toggle current dropdown
            selectSelected.classList.toggle('active');
            selectItems.classList.toggle('active');
            selectItems.classList.toggle('select-hide');
        });
        
        // Handle option selection
        selectOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = e.target.getAttribute('data-value');
                const text = e.target.textContent;
                
                // Update the select display
                selectSelected.textContent = text;
                
                // Update the hidden select value
                selectElement.value = value;
                
                // Update selected styling
                selectOptions.forEach(opt => opt.classList.remove('same-as-selected'));
                e.target.classList.add('same-as-selected');
                
                // Close dropdown
                selectSelected.classList.remove('active');
                selectItems.classList.remove('active');
                selectItems.classList.add('select-hide');
                
                // Trigger change event on the select element
                const event = new Event('change');
                selectElement.dispatchEvent(event);
            });
        });
    });
    
    // Close all select boxes when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            customSelects.forEach(customSelect => {
                const selectSelected = customSelect.querySelector('.select-selected');
                const selectItems = customSelect.querySelector('.select-items');
                
                selectSelected.classList.remove('active');
                selectItems.classList.remove('active');
                selectItems.classList.add('select-hide');
            });
        }
    });

    // Handle image upload and preview
    uploadCircle.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                uploadCircle.style.border = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
            uploadCircle.style.border = '2px dashed var(--border-color)';
        }
    });

    // Modal functionality
    function showModal(imageSrc) {
        modalImage.src = imageSrc;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeModal.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Download functionality
    downloadImage.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = modalImage.src;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Validate image count input
    imageCountInput.addEventListener('input', () => {
        let value = parseInt(imageCountInput.value);
        if (value < 1) value = 1;
        if (value > 6) value = 6;
        imageCountInput.value = value;
    });

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

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        const imageCount = Math.min(6, Math.max(1, parseInt(imageCountInput.value)));
        const imageSize = imageSizeInput.value; // Get the selected image size
        
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        generateBtn.disabled = true;
        resultsDiv.querySelector('.image-grid').innerHTML = '';
        
        const imageGrid = resultsDiv.querySelector('.image-grid');

        let imageBase64 = null;
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            imageBase64 = await toBase64(file);
        }

        const createImageContainer = (index) => {
            const container = document.createElement('div');
            container.className = 'image-container';
            container.innerHTML = `
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
            `;
            imageGrid.appendChild(container);
            return container;
        };

        const updateProgress = (container, progress) => {
            const progressBar = container.querySelector('.progress-bar');
            progressBar.style.width = `${progress}%`;
        };

        const updateStatus = (container, status, error = null) => {
            const statusIndicator = container.querySelector('.status-indicator');
            statusIndicator.className = `status-indicator status-${status}`;
            statusIndicator.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        };

        const processStreamResponse = async (reader, container, index) => {
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let progress = 0;
            
            progress = 20;
            updateProgress(container, progress);
            
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 15;
                    updateProgress(container, Math.min(progress, 90));
                }
            }, 300);

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    if (buffer.indexOf('"inlineData"') !== -1) {
                        try {
                            const imageMatch = buffer.match(/"inlineData":\s*{\s*"mimeType":\s*"image\/png",\s*"data":\s*"([^"]+)"/);
                            if (imageMatch && imageMatch[1]) {
                                clearInterval(progressInterval);
                                updateProgress(container, 100);
                                updateStatus(container, 'complete');
                                
                                const img = document.createElement('img');
                                const imageSrc = `data:image/png;base64,${imageMatch[1]}`;
                                img.src = imageSrc;
                                img.alt = `Generated Image ${index + 1}`;
                                container.insertBefore(img, container.querySelector('.progress-container'));
                                
                                // Add click event for preview
                                img.addEventListener('click', () => showModal(imageSrc));
                                
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
                                
                                return true;
                            }
                        } catch (e) {
                            // Continue even if parsing fails
                        }
                    }
                }
            } catch (err) {
                clearInterval(progressInterval);
                updateStatus(container, 'error', err.message);
                console.error(`Error processing stream:`, err);
                return false;
            } finally {
                clearInterval(progressInterval);
            }
            return false;
        };

        const generateSingleImage = async (index) => {
            const container = createImageContainer(index);
            
            try {
                let parts = [];

                if (imageInput.files.length > 0) {
                    const file = imageInput.files[0];
                    const compressedImage = await compressImage(file);
                    parts.push({
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: compressedImage.split(',')[1]
                        }
                    });
                }

                // Get the selected art style
                const artStyle = artStyleInput.value;
                
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
                        aspectRatio = "in widescreen (16:9) aspect ratio";
                }

                if (promptText !== "") {
                    parts.push({ text: `Generate a detailed image: ${promptText} ${aspectRatio}` });
                }

                const requestData = {
                    contents: [{
                        role: "user",
                        parts: parts
                    }],
                    generationConfig: {
                        responseModalities: ["image", "text"],
                        responseMimeType: "text/plain",
                        temperature: 0.4
                    }
                };

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                await processStreamResponse(reader, container, index);
            } catch (err) {
                updateStatus(container, 'error', err.message);
                console.error(`Error generating image ${index + 1}:`, err);
            }
        };

        const imagePromises = Array.from({ length: imageCount }, (_, i) => generateSingleImage(i));
        await Promise.allSettled(imagePromises);
        
        generateBtn.disabled = false;
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