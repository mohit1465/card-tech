// File upload and preview handling
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function previewConversion(dataUrl, quality, isJPEG, previewElement, downloadBtn) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Get ratio settings with null checks
        const downloadPanel = previewElement?.closest('.download-panel');
        if (!downloadPanel) {
            console.error('Download panel not found');
            return;
        }

        const ratioSelect = downloadPanel.querySelector('.ratio-select');
        const ratioMethodInput = downloadPanel.querySelector('input[name="ratioMethod"]:checked');
        
        // Get the selected ratio value and parse it
        let selectedRatio = ratioSelect?.value || 'original';
        const ratioMethod = ratioMethodInput?.value || 'stretch';

        // Calculate new dimensions based on ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (selectedRatio !== 'original') {
            // Parse the ratio string (e.g., "1.91:1" or "16:9")
            let widthRatio, heightRatio;
            if (selectedRatio.includes('.')) {
                // Handle decimal ratios like "1.91:1"
                [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
            } else {
                // Handle standard ratios like "16:9"
                [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
            }
            
            const targetRatio = widthRatio / heightRatio;
            const currentRatio = img.width / img.height;

            if (ratioMethod === 'stretch') {
                // For stretch, we maintain the target ratio by adjusting both dimensions
                if (targetRatio > currentRatio) {
                    // Image is too tall, stretch width
                    newWidth = img.height * targetRatio;
                    newHeight = img.height;
                } else {
                    // Image is too wide, stretch height
                    newWidth = img.width;
                    newHeight = img.width / targetRatio;
                }
            } else { // crop method
                // For crop, we maintain the target ratio by cropping excess
                if (targetRatio > currentRatio) {
                    // Image is too tall, crop height
                    newWidth = img.width;
                    newHeight = img.width / targetRatio;
                } else {
                    // Image is too wide, crop width
                    newWidth = img.height * targetRatio;
                    newHeight = img.height;
                }
            }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw image with appropriate method
        if (ratioMethod === 'stretch') {
            // For stretch, we draw the entire image scaled to fit the new dimensions
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
        } else { // crop method
            // For crop, we calculate the source coordinates to center the crop
            const sourceX = Math.max(0, (img.width - newWidth) / 2);
            const sourceY = Math.max(0, (img.height - newHeight) / 2);
            const sourceWidth = Math.min(img.width, newWidth);
            const sourceHeight = Math.min(img.height, newHeight);
            
            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
                0, 0, newWidth, newHeight                     // Destination rectangle
            );
        }
        
        const format = isJPEG ? 'image/jpeg' : 'image/png';
        const extension = isJPEG ? '.jpeg' : '.png';
        const dataUrl = canvas.toDataURL(format, quality);
        
        const base64str = dataUrl.split(',')[1];
        const decodedSize = atob(base64str).length;
        const maxSize = 7 * 1024 * 1024; // 7MB in bytes
        
        const compressedSize = previewElement.querySelector('.compressed-size');
        if (compressedSize) {
            compressedSize.textContent = formatFileSize(decodedSize);
            
            // Enable/disable download button based on size
            if (downloadBtn) {
                downloadBtn.disabled = decodedSize > maxSize;
            }
            if (decodedSize > maxSize) {
                compressedSize.classList.add('size-warning');
            } else {
                compressedSize.classList.remove('size-warning');
            }
        }
    };
    
    img.src = dataUrl;
}

function downloadImage(dataUrl, originalFileName, quality, isJPEG) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Get ratio settings
        const ratioSelect = document.querySelector('.ratio-select');
        const ratioMethodInput = document.querySelector('input[name="ratioMethod"]:checked');
        
        // Get the selected ratio value and parse it
        let selectedRatio = ratioSelect?.value || 'original';
        const ratioMethod = ratioMethodInput?.value || 'stretch';

        // Calculate new dimensions based on ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (selectedRatio !== 'original') {
            // Parse the ratio string (e.g., "1.91:1" or "16:9")
            let widthRatio, heightRatio;
            if (selectedRatio.includes('.')) {
                // Handle decimal ratios like "1.91:1"
                [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
            } else {
                // Handle standard ratios like "16:9"
                [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
            }
            
            const targetRatio = widthRatio / heightRatio;
            const currentRatio = img.width / img.height;

            if (ratioMethod === 'stretch') {
                // For stretch, we maintain the target ratio by adjusting both dimensions
                if (targetRatio > currentRatio) {
                    // Image is too tall, stretch width
                    newWidth = img.height * targetRatio;
                    newHeight = img.height;
                } else {
                    // Image is too wide, stretch height
                    newWidth = img.width;
                    newHeight = img.width / targetRatio;
                }
            } else { // crop method
                // For crop, we maintain the target ratio by cropping excess
                if (targetRatio > currentRatio) {
                    // Image is too tall, crop height
                    newWidth = img.width;
                    newHeight = img.width / targetRatio;
                } else {
                    // Image is too wide, crop width
                    newWidth = img.height * targetRatio;
                    newHeight = img.height;
                }
            }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw image with appropriate method
        if (ratioMethod === 'stretch') {
            // For stretch, we draw the entire image scaled to fit the new dimensions
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
        } else { // crop method
            // For crop, we calculate the source coordinates to center the crop
            const sourceX = Math.max(0, (img.width - newWidth) / 2);
            const sourceY = Math.max(0, (img.height - newHeight) / 2);
            const sourceWidth = Math.min(img.width, newWidth);
            const sourceHeight = Math.min(img.height, newHeight);
            
            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
                0, 0, newWidth, newHeight                     // Destination rectangle
            );
        }
        
        const format = isJPEG ? 'image/jpeg' : 'image/png';
        const extension = isJPEG ? '.jpeg' : '.png';
        const dataUrl = canvas.toDataURL(format, quality);
        
        const base64str = dataUrl.split(',')[1];
        const decodedSize = atob(base64str).length;
        const maxSize = 7 * 1024 * 1024; // 7MB in bytes
        
        if (decodedSize > maxSize) {
            alert('Compressed image is still too large. Please reduce quality further.');
            return;
        }
        
        const link = document.createElement('a');
        link.download = originalFileName.replace(/\.[^/.]+$/, '') + extension;
        link.href = dataUrl;
        link.click();
    };
    
    img.src = dataUrl;
}

function getFileIcon(fileType) {
    // Add file type icons here
    return '📄';
}

function createPreview(file) {
    const postFilePreviews = document.getElementById('postFilePreviews');
    const previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview-item';

    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-preview';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => {
        previewContainer.remove();
        const postImageInput = document.getElementById('postImageInput');
        if (postImageInput) postImageInput.value = ''; // Clear the file input
    };

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.file = file;
        previewContent.appendChild(img);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            
            // Create preview info section
            const previewInfo = document.createElement('div');
            previewInfo.className = 'preview-info';
            previewInfo.innerHTML = `
                <div class="file-name">${file.name}</div>
                <div class="file-size">Original Size: ${formatFileSize(file.size)}</div>
            `;
            previewContent.appendChild(previewInfo);

            // Create separate download options panel
            const downloadPanel = document.createElement('div');
            downloadPanel.className = 'download-panel';
            
            // Add compression controls
            const compressionControls = document.createElement('div');
            compressionControls.className = 'compression-controls';
            
            // Quality slider
            const qualityControl = document.createElement('div');
            qualityControl.className = 'quality-control';
            qualityControl.innerHTML = `
                <label>Quality: <span class="quality-value">90%</span></label>
                <input type="range" min="1" max="100" value="90" class="quality-slider">
            `;

            // Add ratio controls
            const ratioControl = document.createElement('div');
            ratioControl.className = 'ratio-control';
            ratioControl.innerHTML = `
                <label>Image Ratio:</label>
                <select class="ratio-select">
                    <option value="original">Original</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="1.91:1">1.91:1 (Landscape)</option>
                </select>
                <div class="ratio-method">
                    <label>
                        <input type="radio" name="ratioMethod" value="stretch" checked> Stretch
                    </label>
                    <label>
                        <input type="radio" name="ratioMethod" value="crop"> Crop
                    </label>
                </div>
            `;
            
            // Format toggle
            const formatToggle = document.createElement('div');
            formatToggle.className = 'format-toggle';
            formatToggle.innerHTML = `
                <label class="switch">
                    <input type="checkbox" class="format-checkbox" checked>
                    <span class="slider round"></span>
                </label>
                <span class="format-label">JPEG</span>
            `;

            // Preview conversion button
            const previewBtn = document.createElement('button');
            previewBtn.className = 'preview-conversion-btn';
            previewBtn.innerHTML = 'Preview Conversion';
            
            // Conversion preview section
            const conversionPreview = document.createElement('div');
            conversionPreview.className = 'conversion-preview';
            conversionPreview.innerHTML = `
                <div class="preview-header">Conversion Preview</div>
                <div class="preview-details">
                    <div class="preview-size">Compressed Size: <span class="compressed-size">-</span></div>
                    <div class="preview-format">Format: <span class="format-type">JPEG</span></div>
                </div>
            `;
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '⬇️ Download';
            downloadBtn.disabled = true;
            
            // Add event listeners
            const qualitySlider = qualityControl.querySelector('.quality-slider');
            const qualityValue = qualityControl.querySelector('.quality-value');
            const formatCheckbox = formatToggle.querySelector('.format-checkbox');
            const formatType = conversionPreview.querySelector('.format-type');
            
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = `${e.target.value}%`;
            });

            formatCheckbox.addEventListener('change', (e) => {
                formatType.textContent = e.target.checked ? 'JPEG' : 'PNG';
            });
            
            // Preview conversion
            previewBtn.addEventListener('click', () => {
                const quality = qualitySlider.value / 100;
                const isJPEG = formatCheckbox.checked;
                previewConversion(img.src, quality, isJPEG, conversionPreview, downloadBtn);
            });
            
            // Download handler
            downloadBtn.addEventListener('click', () => {
                const quality = qualitySlider.value / 100;
                const isJPEG = formatCheckbox.checked;
                downloadImage(img.src, file.name, quality, isJPEG);
            });
            
            // Assemble controls
            compressionControls.appendChild(qualityControl);
            compressionControls.appendChild(ratioControl);
            compressionControls.appendChild(formatToggle);
            downloadPanel.appendChild(compressionControls);
            downloadPanel.appendChild(previewBtn);
            downloadPanel.appendChild(conversionPreview);
            downloadPanel.appendChild(downloadBtn);

            // Assemble the preview item
            previewContainer.appendChild(previewContent);
            previewContainer.appendChild(downloadPanel);
            previewContainer.appendChild(removeBtn);

            // Add to the preview grid
            postFilePreviews.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
    } else {
        // For non-image files, show file icon and name
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        fileIcon.innerHTML = getFileIcon(file.type);
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        previewContent.appendChild(fileIcon);
        previewContent.appendChild(fileName);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const postImageInput = document.getElementById('postImageInput');
    const postFilePreviews = document.getElementById('postFilePreviews');
    const uploadArea = document.querySelector('.image-upload-area');

    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('highlight');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('highlight');
    }

    // Handle file drop
    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle click to upload
    uploadArea.addEventListener('click', () => {
        postImageInput.click();
    });

    // Handle file input change
    postImageInput.addEventListener('change', function(e) {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        // Only take the first file
        const file = files[0];
        
        // Clear existing previews
        postFilePreviews.innerHTML = '';
        
        createPreview(file);
    }

    // Function to preview conversion
    function previewConversion(dataUrl, quality, isJPEG, previewElement, downloadBtn) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Get ratio settings
            const ratioSelect = previewElement.closest('.download-panel').querySelector('.ratio-select');
            const ratioMethod = previewElement.closest('.download-panel').querySelector('input[name="ratioMethod"]:checked').value;
            const selectedRatio = ratioSelect.value;

            // Calculate new dimensions based on ratio
            let newWidth = img.width;
            let newHeight = img.height;

            if (selectedRatio !== 'original') {
                const [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
                const targetRatio = widthRatio / heightRatio;
                const currentRatio = img.width / img.height;

                if (ratioMethod === 'stretch') {
                    if (targetRatio > currentRatio) {
                        newWidth = img.height * targetRatio;
                        newHeight = img.height;
                    } else {
                        newWidth = img.width;
                        newHeight = img.width / targetRatio;
                    }
                } else { // crop method
                    if (targetRatio > currentRatio) {
                        newWidth = img.width;
                        newHeight = img.width / targetRatio;
                    } else {
                        newWidth = img.height * targetRatio;
                        newHeight = img.height;
                    }
                }
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw image with appropriate method
            if (ratioMethod === 'stretch') {
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
            } else { // crop method
                const sourceX = (img.width - newWidth) / 2;
                const sourceY = (img.height - newHeight) / 2;
                ctx.drawImage(img, sourceX, sourceY, newWidth, newHeight, 0, 0, newWidth, newHeight);
            }
            
            const format = isJPEG ? 'image/jpeg' : 'image/png';
            const dataUrl = canvas.toDataURL(format, quality);
            
            const base64str = dataUrl.split(',')[1];
            const decodedSize = atob(base64str).length;
            const maxSize = 7 * 1024 * 1024; // 7MB in bytes
            
            const compressedSize = previewElement.querySelector('.compressed-size');
            compressedSize.textContent = formatFileSize(decodedSize);
            
            // Enable/disable download button based on size
            downloadBtn.disabled = decodedSize > maxSize;
            if (decodedSize > maxSize) {
                compressedSize.classList.add('size-warning');
            } else {
                compressedSize.classList.remove('size-warning');
            }
        };
        
        img.src = dataUrl;
    }

    // Function to download image with compression
    function downloadImage(dataUrl, originalFileName, quality, isJPEG) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Get ratio settings
            const ratioSelect = document.querySelector('.ratio-select');
            const ratioMethodInput = document.querySelector('input[name="ratioMethod"]:checked');
            
            // Get the selected ratio value and parse it
            let selectedRatio = ratioSelect?.value || 'original';
            const ratioMethod = ratioMethodInput?.value || 'stretch';

            // Calculate new dimensions based on ratio
            let newWidth = img.width;
            let newHeight = img.height;

            if (selectedRatio !== 'original') {
                const [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
                const targetRatio = widthRatio / heightRatio;
                const currentRatio = img.width / img.height;

                if (ratioMethod === 'stretch') {
                    if (targetRatio > currentRatio) {
                        newWidth = img.height * targetRatio;
                        newHeight = img.height;
                    } else {
                        newWidth = img.width;
                        newHeight = img.width / targetRatio;
                    }
                } else { // crop method
                    if (targetRatio > currentRatio) {
                        newWidth = img.width;
                        newHeight = img.width / targetRatio;
                    } else {
                        newWidth = img.height * targetRatio;
                        newHeight = img.height;
                    }
                }
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw image with appropriate method
            if (ratioMethod === 'stretch') {
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
            } else { // crop method
                const sourceX = (img.width - newWidth) / 2;
                const sourceY = (img.height - newHeight) / 2;
                ctx.drawImage(img, sourceX, sourceY, newWidth, newHeight, 0, 0, newWidth, newHeight);
            }
            
            const format = isJPEG ? 'image/jpeg' : 'image/png';
            const extension = isJPEG ? '.jpeg' : '.png';
            const dataUrl = canvas.toDataURL(format, quality);
            
            const base64str = dataUrl.split(',')[1];
            const decodedSize = atob(base64str).length;
            const maxSize = 7 * 1024 * 1024; // 7MB in bytes
            
            if (decodedSize > maxSize) {
                alert('Compressed image is still too large. Please reduce quality further.');
                return;
            }
            
            const link = document.createElement('a');
            link.download = originalFileName.replace(/\.[^/.]+$/, '') + extension;
            link.href = dataUrl;
            link.click();
        };
        
        img.src = dataUrl;
    }

    function getFileIcon(fileType) {
        // Return appropriate icon based on file type
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
        return '📁';
    }
});
