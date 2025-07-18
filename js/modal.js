// Text layer editor functionality
 let canvas, ctx;
 let layers = [];
 let activeLayer = null;
 let currentImage = null;
 let imageLayerCache = new Map(); // Cache for loaded images

 // Store layers for each image and style
 const imageLayersMap = new Map();
 // Store style-specific layers to reuse across images with the same style
 const styleLayersMap = new Map();
 
 // Add these variables at the top of the file with other global variables
 let currentThumbnailIndex = 0;
 let thumbnailImages = [];
 
 // Initialize text editor when modal is shown
 function initTextEditor() {
     canvas = document.getElementById('textCanvas');
     if (!canvas) {
         console.error('Text canvas not found');
         return;
     }
     
     ctx = canvas.getContext('2d', { willReadFrequently: true });
     
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
     
     // Initialize tab switching and set templates as default
     setupTabSwitching();
     const templatesTab = document.getElementById('templatesTab');
     if (templatesTab) {
         templatesTab.click();
     }
     
     // Add text layer button
     const addTextLayerBtn = document.getElementById('addTextLayer');
     if (addTextLayerBtn) {
         addTextLayerBtn.addEventListener('click', addTextLayer);
     }

     // Add image layer button
     const addImageLayerBtn = document.getElementById('addImageLayer');
     if (addImageLayerBtn) {
         addImageLayerBtn.addEventListener('click', addImageLayer);
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

     // Add carousel navigation functionality
     const prevBtn = document.querySelector('.carousel-nav.prev');
     const nextBtn = document.querySelector('.carousel-nav.next');
     const thumbnailsContainer = document.querySelector('.thumbnails-container');

     if (prevBtn && nextBtn && thumbnailsContainer) {
         // Remove existing event listeners
         const newPrevBtn = prevBtn.cloneNode(true);
         const newNextBtn = nextBtn.cloneNode(true);
         prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
         nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

         newPrevBtn.addEventListener('click', () => {
             const thumbnails = Array.from(thumbnailsContainer.querySelectorAll('.thumbnail'));
             const activeThumb = thumbnailsContainer.querySelector('.thumbnail.active');
             const currentIndex = thumbnails.indexOf(activeThumb);
             
             if (currentIndex > 0) {
                 // Remove active class from current thumbnail
                 activeThumb.classList.remove('active');
                 // Add active class to previous thumbnail
                 thumbnails[currentIndex - 1].classList.add('active');
                 // Scroll the previous thumbnail into view
                 thumbnails[currentIndex - 1].scrollIntoView({ behavior: 'smooth', inline: 'center' });
                 // Update main image
                 const imgSrc = thumbnails[currentIndex - 1].querySelector('img').src;
                 const modalImage = document.getElementById('modalImage');
                 if (modalImage) {
                     modalImage.src = imgSrc;
                     // Reinitialize text editor with new image
                     modalImage.onload = () => {
                         initTextEditor();
                     };
                 }
             }
         });

         newNextBtn.addEventListener('click', () => {
             const thumbnails = Array.from(thumbnailsContainer.querySelectorAll('.thumbnail'));
             const activeThumb = thumbnailsContainer.querySelector('.thumbnail.active');
             const currentIndex = thumbnails.indexOf(activeThumb);
             
             if (currentIndex < thumbnails.length - 1) {
                 // Remove active class from current thumbnail
                 activeThumb.classList.remove('active');
                 // Add active class to next thumbnail
                 thumbnails[currentIndex + 1].classList.add('active');
                 // Scroll the next thumbnail into view
                 thumbnails[currentIndex + 1].scrollIntoView({ behavior: 'smooth', inline: 'center' });
                 // Update main image
                 const imgSrc = thumbnails[currentIndex + 1].querySelector('img').src;
                 const modalImage = document.getElementById('modalImage');
                 if (modalImage) {
                     modalImage.src = imgSrc;
                     // Reinitialize text editor with new image
                     modalImage.onload = () => {
                         initTextEditor();
                     };
                 }
             }
         });
     }
 }
 
 function toggleLayerEditorVisibility() {
     const layerEditor = document.getElementById('layerEditor');
     if (layerEditor) {
         if (activeLayer) {
            showEdited.classList.add('active');
            showOriginal.classList.remove('active');
            textCanvas.classList.add('active');
            modalImage.classList.remove('active');
            renderCanvas();
            console.log('Active layer found, showing editor');
         } else {
             layerEditor.style.display = 'none';
             showEdited.classList.remove('active');
             showOriginal.classList.add('active');
             textCanvas.classList.remove('active');
             modalImage.classList.add('active');
             renderCanvas();
         }
     }
 }
 
 function addTextLayer() {
     showEdited.classList.add('active');
     showOriginal.classList.remove('active');
     textCanvas.classList.add('active');
     modalImage.classList.remove('active');
     renderCanvas();

     const newLayer = {
         id: Date.now(),
         type: 'text',  // Specify layer type
         text: "Text Layer",
         x: 100,
         y: 100,
         fontSize: 30,
         font: "Arial",
         color: "#ffffff",
         opacity: 1,
         border: false,
         borderColor: "#000000",
         borderWidth: 1,
         borderStyle: "solid",
         borderPosition: "all",
         borderPlacement: "outside",
         shadow: false,
         shadowColor: "#000000",
         shadowBlur: 5
     };
     addLayer(newLayer);
 }

 // Modify the addImageLayer function
 function addImageLayer() {
     showEdited.classList.add('active');
     showOriginal.classList.remove('active');
     textCanvas.classList.add('active');
     modalImage.classList.remove('active');

     const textEditor = document.getElementById("layerEditor");
     const imageEditor = document.querySelector('.image-layer-controls');
     
     textEditor.style.display = 'none';
     imageEditor.style.display = 'block';
     
     const fileInput = document.getElementById('layerImageInput');
     fileInput.onchange = function(e) {
         const file = e.target.files[0];
         if (file) {
             const reader = new FileReader();
             reader.onload = function(event) {
                 const img = new Image();
                 img.onload = function() {
                     // Calculate initial dimensions maintaining aspect ratio
                     const maxInitialSize = 300;
                     let width = img.width;
                     let height = img.height;
                     
                     if (width > maxInitialSize || height > maxInitialSize) {
                         const ratio = img.width / img.height;
                         if (width > height) {
                             width = maxInitialSize;
                             height = Math.round(width / ratio);
                         } else {
                             height = maxInitialSize;
                             width = Math.round(height * ratio);
                         }
                     }

                     const newLayer = {
                         id: Date.now(),
                         type: 'image',
                         name: `Image Layer ${Date.now()}`,
                         x: 100,
                         y: 100,
                         width: width,
                         height: height,
                         opacity: 1,
                         rotation: 0,
                         border: false,
                         borderColor: "#000000",
                         borderWidth: 1,
                         borderStyle: "solid",
                         borderPosition: "all",
                         borderPlacement: "outside",
                         shadow: false,
                         shadowColor: "#000000",
                         shadowBlur: 5
                     };
                     
                     // Store image in cache before adding layer
                     imageLayerCache.set(newLayer.id, img);
                     
                     // Add layer
                     layers.push(newLayer);
                     activeLayer = newLayer;
                     
                     // Save changes
                     if (currentImage) {
                         imageLayersMap.set(currentImage, layers);
                         const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
                         if (currentStyle) {
                             styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
                         }
                     }
                     
                     // Update UI and render immediately
                     updateLayerList();
                     renderCanvas(); // Immediate render
                     selectLayer(newLayer.id);
                     toggleLayerEditorVisibility();
                 };
                 img.src = event.target.result;
             };
             reader.readAsDataURL(file);
         }
     };
     fileInput.click();
 }

 // Add this function to handle image replacement
 function replaceLayerImage() {
     if (!activeLayer || activeLayer.type !== 'image') return;
     
     const fileInput = document.getElementById('layerImageInput');
     fileInput.onchange = function(e) {
         const file = e.target.files[0];
         if (file) {
             const reader = new FileReader();
             reader.onload = function(event) {
                 const img = new Image();
                 img.onload = function() {
                     // Update existing layer instead of creating new one
                     activeLayer.imageData = event.target.result;
                     
                     // Store new image in cache
                     imageLayerCache.set(activeLayer.id, img);
                     
                     // Update preview
                     const preview = document.getElementById('layerImagePreview');
                     if (preview) {
                         preview.src = event.target.result;
                     }
                     
                     // Maintain aspect ratio if locked
                     const aspectLockBtn = document.getElementById('maintainAspectRatio');
                     const maintainAspect = aspectLockBtn?.textContent === '🔒';
                     
                     if (maintainAspect) {
                         const aspectRatio = img.width / img.height;
                         const newWidth = activeLayer.height * aspectRatio;
                         activeLayer.width = newWidth;
                         
                         // Update width controls
                         const widthInput = document.getElementById('imageWidth');
                         const widthSlider = document.getElementById('imageWidthSlider');
                         if (widthInput) widthInput.value = newWidth;
                         if (widthSlider) widthSlider.value = newWidth;
                     } else {
                         // Update dimensions to match new image
                         activeLayer.width = img.width;
                         activeLayer.height = img.height;
                         
                         // Update dimension controls
                         const controls = {
                             imageWidth: document.getElementById('imageWidth'),
                             imageHeight: document.getElementById('imageHeight'),
                             imageWidthSlider: document.getElementById('imageWidthSlider'),
                             imageHeightSlider: document.getElementById('imageHeightSlider')
                         };
                         
                         if (controls.imageWidth) controls.imageWidth.value = img.width;
                         if (controls.imageHeight) controls.imageHeight.value = img.height;
                         if (controls.imageWidthSlider) controls.imageWidthSlider.value = img.width;
                         if (controls.imageHeightSlider) controls.imageHeightSlider.value = img.height;
                     }
                     
                     // Save changes and update canvas
                     if (currentImage) {
                         imageLayersMap.set(currentImage, layers);
                         const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
                         if (currentStyle) {
                             styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
                         }
                     }
                     
                     updateLayerList();
                     renderCanvas();
                 };
                 img.src = event.target.result;
             };
             reader.readAsDataURL(file);
         }
     };
     fileInput.click();
 }

 // Add this function to handle boundary constraints
 function constrainToBounds(layer) {
     if (!layer) return;

     // Allow layers to extend up to their own dimensions beyond left/top boundaries
     if (layer.type === 'text') {
         // For text layers, use fontSize as height
         layer.x = Math.max(-layer.fontSize, layer.x);
         layer.y = Math.max(0, layer.y); // Keep text baseline visible
     } else if (layer.type === 'image') {
         // For image layers, use width and height
         layer.x = Math.max(-layer.width, layer.x);
         layer.y = Math.max(-layer.height, layer.y);
     }
 }

 // Add this function before addLayer()
 function ensureEditorsExist() {
     // Check if required editor elements exist
     const textEditor = document.getElementById("layerEditor");
     const imageEditor = document.querySelector('.image-layer-controls');
     const layerList = document.getElementById("layerList");
     const editorPanel = document.querySelector('.text-editor-panel');

     // Return true only if all required elements are found
     return textEditor && imageEditor && layerList && editorPanel;
 }

 // Then update the addLayer function to handle initialization better
 function addLayer(layer) {
     // First try to ensure editors exist
     if (!ensureEditorsExist()) {
         // If not ready, wait and retry with a maximum number of attempts
         if (!window.initAttempts) window.initAttempts = 0;
         if (window.initAttempts < 10) { // Limit retries to prevent infinite loop
             window.initAttempts++;
             console.warn(`Editors not ready, retry attempt ${window.initAttempts}...`);
             setTimeout(() => addLayer(layer), 100);
             return;
         } else {
             console.error('Failed to initialize editors after multiple attempts');
             return;
         }
     }
     
     // Reset attempts counter on success
     window.initAttempts = 0;
     
     // Proceed with adding the layer
     layers.push(layer);
     if (currentImage) {
         imageLayersMap.set(currentImage, layers);
         const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
         if (currentStyle) {
             styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
         }
     }
     
     updateLayerList();
     selectLayer(layer.id);
     renderCanvas();
     toggleLayerEditorVisibility();
 }

 // Modify the updateLayerList function
 function updateLayerList() {
     const list = document.getElementById("layerList");
     if (!list) return;
     
     list.innerHTML = "";
     
     // Reverse the array for display (so index 0 appears at bottom)
     [...layers].reverse().forEach((layer, reversedIndex) => {
         const actualIndex = layers.length - 1 - reversedIndex;
         const btn = document.createElement("button");
         btn.className = "layer-btn";
         if (layer.id === activeLayer?.id) {
             btn.classList.add('active');
         }

         const layerName = document.createElement('span');
         let displayName = layer.type === 'image' ? 
             (layer.name || `Image Layer ${layer.id}`) : 
             (layer.text || "Text Layer");
             
         // Truncate long names
         if (displayName.length > 15) {
             displayName = displayName.substring(0, 12) + '...';
         }
         layerName.innerText = displayName;
         layerName.title = layer.type === 'image' ? 
             (layer.name || `Image Layer ${layer.id}`) : 
             (layer.text || "Text Layer");

         const controls = document.createElement('div');
         controls.className = 'layer-controls';

         // Forward button
         const forwardBtn = document.createElement('button');
         forwardBtn.className = 'layer-order-btn';
         forwardBtn.innerHTML = '↑';
         forwardBtn.title = 'Move layer forward';
         forwardBtn.disabled = actualIndex === layers.length - 1;
         forwardBtn.onclick = (e) => {
             e.stopPropagation();
             moveLayer(actualIndex, actualIndex + 1);
         };

         // Backward button
         const backwardBtn = document.createElement('button');
         backwardBtn.className = 'layer-order-btn';
         backwardBtn.innerHTML = '↓';
         backwardBtn.title = 'Move layer backward';
         backwardBtn.disabled = actualIndex === 0;
         backwardBtn.onclick = (e) => {
             e.stopPropagation();
             moveLayer(actualIndex, actualIndex - 1);
         };

         // Delete button
         const deleteBtn = document.createElement('span');
         deleteBtn.className = 'delete-layer';
         deleteBtn.innerHTML = '&times;';
         deleteBtn.onclick = (e) => {
             e.stopPropagation();
             deleteLayer(layer.id);
         };

         controls.appendChild(forwardBtn);
         controls.appendChild(backwardBtn);
         controls.appendChild(deleteBtn);

         btn.appendChild(layerName);
         btn.appendChild(controls);
         btn.onclick = () => selectLayer(layer.id);
         
         list.appendChild(btn);
     });
 }

 // Add the moveLayer function
 function moveLayer(fromIndex, toIndex) {
     if (toIndex < 0 || toIndex >= layers.length) return;
     
     const layer = layers[fromIndex];
     layers.splice(fromIndex, 1);
     layers.splice(toIndex, 0, layer);
     
     // Save updated layers
     if (currentImage) {
         imageLayersMap.set(currentImage, layers);
         const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
         if (currentStyle) {
             styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
         }
     }
     
     updateLayerList();
     renderCanvas();
 }
 
 function deleteLayer(id) {
     const index = layers.findIndex(l => l.id === id);
     if (index !== -1) {
         layers.splice(index, 1);
         
         // Save updated layers
         if (currentImage) {
             imageLayersMap.set(currentImage, layers);
             
             // Update style layers
             const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
             if (currentStyle) {
                 styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
             }
         }
         
         // Update active layer
         activeLayer = layers.length > 0 ? layers[0] : null;
         
         updateLayerList();
         renderCanvas();
         
         if (activeLayer) {
             selectLayer(activeLayer.id);
         } else {
             toggleLayerEditorVisibility();
         }
     }
 }
 
 function selectLayer(id) {
     const layer = layers.find(l => l.id === id);
     if (!layer) return;
     
     activeLayer = layer;
     
     // Get both editor containers
     const textEditor = document.getElementById("layerEditor");
     const imageEditor = document.querySelector('.image-layer-controls');
     
     if (!textEditor || !imageEditor) {
         console.warn('Editor containers not found, waiting for DOM...');
         setTimeout(() => selectLayer(id), 100);
         return;
     }

     // Only show editors if properties tab is active
     const propertiesTab = document.getElementById('propertiesTab');
     if (propertiesTab && propertiesTab.classList.contains('active')) {
         if (layer.type === 'text') {
             textEditor.style.display = 'block';
             imageEditor.style.display = 'none';
         } else if (layer.type === 'image') {
             textEditor.style.display = 'none';
             imageEditor.style.display = 'block';
         }
     }
     
     updateLayerList();
     
     // Show appropriate editor based on layer type
     if (layer.type === 'text') {
         textEditor.style.display = 'block';
         imageEditor.style.display = 'none';

         updateLayerList();
         
         // Set text controls values
         const controls = {
             textInput: document.getElementById("textInput"),
             fontFamily: document.getElementById("fontFamily"),
             fontSize: document.getElementById("fontSize"),
             fontWeight: document.getElementById("fontWeight"),
             fontStyle: document.getElementById("fontStyle"),
             letterSpacing: document.getElementById("letterSpacing"),
             lineHeight: document.getElementById("lineHeight"),
             textColor: document.getElementById("textColor"),
             backgroundColor: document.getElementById("backgroundColor"),
             opacity: document.getElementById("opacity"),
             underline: document.getElementById("underline"),
             strikethrough: document.getElementById("strikethrough"),
             border: document.getElementById("border"),
             borderColor: document.getElementById("borderColor"),
             borderWidth: document.getElementById("borderWidth"),
             borderStyle: document.getElementById("borderStyle"),
             borderPosition: document.getElementById("borderPosition"),
             borderPlacement: document.getElementById("borderPlacement"),
             shadow: document.getElementById("shadow"),
             shadowColor: document.getElementById("shadowColor"),
             shadowBlur: document.getElementById("shadowBlur"),
             shadowOffsetX: document.getElementById("shadowOffsetX"),
             shadowOffsetY: document.getElementById("shadowOffsetY"),
             textRotation: document.getElementById("textRotation"),
             xPos: document.getElementById("xPos"),
             yPos: document.getElementById("yPos"),
             xSlider: document.getElementById("xSlider"),
             ySlider: document.getElementById("ySlider")
         };
         
         // Safely set text layer values
         if (controls.textInput) controls.textInput.value = layer.text || '';
         if (controls.fontFamily) controls.fontFamily.value = layer.font || 'Arial';
         if (controls.fontSize) controls.fontSize.value = layer.fontSize || 30;
         if (controls.fontWeight) controls.fontWeight.value = layer.fontWeight || 'normal';
         if (controls.fontStyle) controls.fontStyle.value = layer.fontStyle || 'normal';
         if (controls.textColor) controls.textColor.value = layer.color || '#ffffff';
         if (controls.opacity) controls.opacity.value = layer.opacity || 1;
         if (controls.border) controls.border.checked = layer.border || false;
         if (controls.borderColor) controls.borderColor.value = layer.borderColor || '#000000';
         if (controls.shadow) controls.shadow.checked = layer.shadow || false;
         if (controls.shadowColor) controls.shadowColor.value = layer.shadowColor || '#000000';
         if (controls.shadowBlur) controls.shadowBlur.value = layer.shadowBlur || 5;
         if (controls.shadowOffsetX) controls.shadowOffsetX.value = layer.shadowOffsetX || 2;
         if (controls.shadowOffsetY) controls.shadowOffsetY.value = layer.shadowOffsetY || 2;
         if (controls.textRotation) controls.textRotation.value = layer.rotation || 0;
         
         // Sync sliders with position inputs
         if (controls.xSlider && controls.xPos) {
             controls.xSlider.value = layer.x || 100;
             controls.xPos.value = layer.x || 100;
         }
         if (controls.ySlider && controls.yPos) {
             controls.ySlider.value = layer.y || 100;
             controls.yPos.value = layer.y || 100;
         }
         
     } else if (layer.type === 'image') {
         textEditor.style.display = 'none';
         imageEditor.style.display = 'block';
         
         updateLayerList();
         
         // Set image controls values and attach events
         const controls = {
             imageLayerName: document.getElementById('imageLayerName'),
             imageWidth: document.getElementById('imageWidth'),
             imageHeight: document.getElementById('imageHeight'),
             imageXPos: document.getElementById('imageXPos'),
             imageYPos: document.getElementById('imageYPos'),
             imageXSlider: document.getElementById('imageXSlider'),
             imageYSlider: document.getElementById('imageYSlider'),
             imageOpacity: document.getElementById('imageOpacity'),
             blendMode: document.getElementById('blendMode'),
             imageRotation: document.getElementById('imageRotation'),
             imageBorder: document.getElementById('imageBorder'),
             imageBorderColor: document.getElementById('imageBorderColor'),
             imageBorderWidth: document.getElementById('imageBorderWidth'),
             imageBorderStyle: document.getElementById('imageBorderStyle'),
             imageBorderPosition: document.getElementById('imageBorderPosition'),
             imageBorderPlacement: document.getElementById('imageBorderPlacement'),
             imageShadow: document.getElementById('imageShadow'),
             imageShadowColor: document.getElementById('imageShadowColor'),
             imageShadowBlur: document.getElementById('imageShadowBlur'),
             imageBorderRadius: document.getElementById('imageBorderRadius'),
             imageBorderRadiusInput: document.getElementById('imageBorderRadiusInput')
         };
         
         // Set values
         if (controls.imageLayerName) controls.imageLayerName.value = layer.name || `Image Layer ${layer.id}`;
         if (controls.imageWidth) controls.imageWidth.value = layer.width || 100;
         if (controls.imageHeight) controls.imageHeight.value = layer.height || 100;
         if (controls.imageXPos) controls.imageXPos.value = layer.x || 0;
         if (controls.imageYPos) controls.imageYPos.value = layer.y || 0;
         if (controls.imageOpacity) controls.imageOpacity.value = layer.opacity || 1;
         if (controls.blendMode) controls.blendMode.value = layer.blendMode || 'normal';
         if (controls.imageRotation) controls.imageRotation.value = layer.rotation || 0;
         if (controls.layerImagePreview && layer.imageData) {
             controls.layerImagePreview.src = layer.imageData;
         }
         if (controls.imageBorderRadius) {
             controls.imageBorderRadius.value = layer.borderRadius || 0;
         }
         if (controls.imageBorderRadiusInput) {
             controls.imageBorderRadiusInput.value = layer.borderRadius || 0;
         }
         // Update radius display
         const radiusDisplay = document.getElementById('radiusValue');
         if (radiusDisplay) {
             radiusDisplay.textContent = `${layer.borderRadius || 0}px`;
         }
         // Attach image-specific events
         attachImageLayerEvents();
     }
     
     // Update layer list to show active layer
     updateLayerList();
     
     // Attach events after ensuring elements exist
     attachLayerEvents();
 }

 // Add this function to handle image flipping
 function flipImage(direction) {
     if (!activeLayer || activeLayer.type !== 'image') return;
     
     if (!activeLayer.transform) {
         activeLayer.transform = {
             flipH: false,
             flipV: false
         };
     }
     
     if (direction === 'horizontal') {
         activeLayer.transform.flipH = !activeLayer.transform.flipH;
     } else {
         activeLayer.transform.flipV = !activeLayer.transform.flipV;
     }
     
     renderCanvas();
 }

 // Update the renderCanvas function to handle all properties
 function renderCanvas() {
     if (!canvas || !ctx) return;
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     const img = document.getElementById("modalImage");
     if (!img) return;
     
     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
     
     layers.forEach(layer => {
         if (!layer) return;
         ctx.save();
         
         if (layer.type === 'image') {
             const layerImg = imageLayerCache.get(layer.id);
             if (layerImg) {
                 ctx.globalAlpha = layer.opacity || 1;
                 ctx.globalCompositeOperation = layer.blendMode || 'normal';
                 
                 // Center point for transformations
                 const centerX = layer.x + layer.width/2;
                 const centerY = layer.y + layer.height/2;
                 
                 // Apply transformations
                 ctx.translate(centerX, centerY);
                 if (layer.rotation) {
                     ctx.rotate(layer.rotation * Math.PI / 180);
                 }
                 if (layer.transform) {
                     ctx.scale(
                         layer.transform.flipH ? -1 : 1,
                         layer.transform.flipV ? -1 : 1
                     );
                 }
                 ctx.translate(-centerX, -centerY);
                 
                 // Handle border radius if set
                 if (layer.borderRadius > 0) {
                     ctx.beginPath();
                     ctx.moveTo(layer.x + layer.borderRadius, layer.y);
                     ctx.lineTo(layer.x + layer.width - layer.borderRadius, layer.y);
                     ctx.quadraticCurveTo(layer.x + layer.width, layer.y, layer.x + layer.width, layer.y + layer.borderRadius);
                     ctx.lineTo(layer.x + layer.width, layer.y + layer.height - layer.borderRadius);
                     ctx.quadraticCurveTo(layer.x + layer.width, layer.y + layer.height, layer.x + layer.width - layer.borderRadius, layer.y + layer.height);
                     ctx.lineTo(layer.x + layer.borderRadius, layer.y + layer.height);
                     ctx.quadraticCurveTo(layer.x, layer.y + layer.height, layer.x, layer.y + layer.height - layer.borderRadius);
                     ctx.lineTo(layer.x, layer.y + layer.borderRadius);
                     ctx.quadraticCurveTo(layer.x, layer.y, layer.x + layer.borderRadius, layer.y);
                     ctx.closePath();
                     ctx.clip();
                 }
                 
                 // Draw image
                 ctx.drawImage(layerImg, layer.x, layer.y, layer.width, layer.height);
                 
                 // Draw border if enabled
                 if (layer.border) {
                     ctx.strokeStyle = layer.borderColor || '#000000';
                     ctx.lineWidth = layer.borderWidth || 1;
                     ctx.setLineDash(layer.borderStyle === 'dashed' ? [5, 5] : []);
                     
                     const x = layer.x;
                     const y = layer.y;
                     const width = layer.width;
                     const height = layer.height;
                     const borderWidth = layer.borderWidth || 1;
                     const placement = layer.borderPlacement === 'inside' ? borderWidth / 2 : -borderWidth / 2;
                     
                     ctx.beginPath();
                     
                     if (layer.borderPosition === 'all') {
                         ctx.rect(x + placement, y + placement, width - placement * 2, height - placement * 2);
                     } else {
                         if (layer.borderPosition === 'top' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + placement, y + placement);
                             ctx.lineTo(x + width - placement, y + placement);
                         }
                         if (layer.borderPosition === 'right' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + width - placement, y + placement);
                             ctx.lineTo(x + width - placement, y + height - placement);
                         }
                         if (layer.borderPosition === 'bottom' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + width - placement, y + height - placement);
                             ctx.lineTo(x + placement, y + height - placement);
                         }
                         if (layer.borderPosition === 'left' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + placement, y + height - placement);
                             ctx.lineTo(x + placement, y + placement);
                         }
                     }
                     
                     ctx.stroke();
                     ctx.setLineDash([]);
                 }
                 
                 // Add shadow if enabled
                 if (layer.shadow) {
                     ctx.shadowColor = layer.shadowColor || '#000000';
                     ctx.shadowBlur = layer.shadowBlur || 5;
                     ctx.shadowOffsetX = 2;
                     ctx.shadowOffsetY = 2;
                 }
             }
         } else if (layer.type === 'text') {
             // Set text properties
             const fontWeight = layer.fontWeight || 'normal';
             const fontStyle = layer.fontStyle || 'normal';
             ctx.font = `${fontWeight} ${fontStyle} ${layer.fontSize}px ${layer.font}`;
             ctx.fillStyle = layer.color;
             ctx.globalAlpha = layer.opacity || 1;
             
             // Letter spacing
             const letterSpacing = parseInt(layer.letterSpacing) || 0;
             if (letterSpacing !== 0) {
                 const chars = layer.text.split('');
                 let currentX = layer.x;
                 const y = layer.y;
                 
                 // Center point for rotation
                 const textWidth = ctx.measureText(layer.text).width;
                 const centerX = layer.x + textWidth/2;
                 const centerY = layer.y;
                 
                 // Apply rotation
                 if (layer.rotation) {
                     ctx.translate(centerX, centerY);
                     ctx.rotate(layer.rotation * Math.PI / 180);
                     ctx.translate(-centerX, -centerY);
                 }
                 
                 chars.forEach(char => {
                     // Shadow
                     if (layer.shadow) {
                         ctx.shadowColor = layer.shadowColor;
                         ctx.shadowBlur = layer.shadowBlur;
                         ctx.shadowOffsetX = parseInt(layer.shadowOffsetX) || 2;
                         ctx.shadowOffsetY = parseInt(layer.shadowOffsetY) || 2;
                     }
                     
                     // Border/Stroke
                     if (layer.border) {
                         ctx.strokeStyle = layer.borderColor;
                         ctx.lineWidth = layer.borderWidth || 1;
                         ctx.setLineDash(layer.borderStyle === 'dashed' ? [5, 5] : []);
                         
                         const textWidth = ctx.measureText(char).width;
                         const textHeight = layer.fontSize;
                         const x = currentX;
                         const y = layer.y;
                         const borderWidth = layer.borderWidth || 1;
                         const placement = layer.borderPlacement === 'inside' ? borderWidth / 2 : -borderWidth / 2;
                         
                         ctx.beginPath();
                         
                         if (layer.borderPosition === 'all') {
                             ctx.rect(x + placement, y - textHeight + placement, textWidth - placement * 2, textHeight - placement * 2);
                         } else {
                             if (layer.borderPosition === 'top' || layer.borderPosition === 'all') {
                                 ctx.moveTo(x + placement, y - textHeight + placement);
                                 ctx.lineTo(x + textWidth - placement, y - textHeight + placement);
                             }
                             if (layer.borderPosition === 'right' || layer.borderPosition === 'all') {
                                 ctx.moveTo(x + textWidth - placement, y - textHeight + placement);
                                 ctx.lineTo(x + textWidth - placement, y + placement);
                             }
                             if (layer.borderPosition === 'bottom' || layer.borderPosition === 'all') {
                                 ctx.moveTo(x + textWidth - placement, y + placement);
                                 ctx.lineTo(x + placement, y + placement);
                             }
                             if (layer.borderPosition === 'left' || layer.borderPosition === 'all') {
                                 ctx.moveTo(x + placement, y + placement);
                                 ctx.lineTo(x + placement, y - textHeight + placement);
                             }
                         }
                         
                         ctx.stroke();
                         ctx.setLineDash([]);
                     }
                     
                     // Underline
                     if (layer.underline) {
                         const metrics = ctx.measureText(char);
                         ctx.fillRect(
                             currentX,
                             y + 3,
                             metrics.width,
                             1
                         );
                     }
                     
                     // Strikethrough
                     if (layer.strikethrough) {
                         const metrics = ctx.measureText(char);
                         ctx.fillRect(
                             currentX,
                             y - layer.fontSize/4,
                             metrics.width,
                             1
                         );
                     }
                     
                     ctx.fillText(char, currentX, y);
                     currentX += ctx.measureText(char).width + letterSpacing;
                 });
             } else {
                 // Center point for rotation
                 const textWidth = ctx.measureText(layer.text).width;
                 const centerX = layer.x + textWidth/2;
                 const centerY = layer.y;
                 
                 // Apply rotation
                 if (layer.rotation) {
                     ctx.translate(centerX, centerY);
                     ctx.rotate(layer.rotation * Math.PI / 180);
                     ctx.translate(-centerX, -centerY);
                 }
                 
                 // Shadow
                 if (layer.shadow) {
                     ctx.shadowColor = layer.shadowColor;
                     ctx.shadowBlur = layer.shadowBlur;
                     ctx.shadowOffsetX = parseInt(layer.shadowOffsetX) || 2;
                     ctx.shadowOffsetY = parseInt(layer.shadowOffsetY) || 2;
                 }
                 
                 // Border/Stroke
                 if (layer.border) {
                     ctx.strokeStyle = layer.borderColor;
                     ctx.lineWidth = layer.borderWidth || 1;
                     ctx.setLineDash(layer.borderStyle === 'dashed' ? [5, 5] : []);
                     
                     const textWidth = ctx.measureText(layer.text).width;
                     const textHeight = layer.fontSize;
                     const x = layer.x;
                     const y = layer.y;
                     const borderWidth = layer.borderWidth || 1;
                     const placement = layer.borderPlacement === 'inside' ? borderWidth / 2 : -borderWidth / 2;
                     
                     ctx.beginPath();
                     
                     if (layer.borderPosition === 'all') {
                         ctx.rect(x + placement, y - textHeight + placement, textWidth - placement * 2, textHeight - placement * 2);
                     } else {
                         if (layer.borderPosition === 'top' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + placement, y - textHeight + placement);
                             ctx.lineTo(x + textWidth - placement, y - textHeight + placement);
                         }
                         if (layer.borderPosition === 'right' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + textWidth - placement, y - textHeight + placement);
                             ctx.lineTo(x + textWidth - placement, y + placement);
                         }
                         if (layer.borderPosition === 'bottom' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + textWidth - placement, y + placement);
                             ctx.lineTo(x + placement, y + placement);
                         }
                         if (layer.borderPosition === 'left' || layer.borderPosition === 'all') {
                             ctx.moveTo(x + placement, y + placement);
                             ctx.lineTo(x + placement, y - textHeight + placement);
                         }
                     }
                     
                     ctx.stroke();
                     ctx.setLineDash([]);
                 }
                 
                 // Underline
                 if (layer.underline) {
                     const metrics = ctx.measureText(layer.text);
                     ctx.fillRect(
                         layer.x,
                         layer.y + 3,
                         metrics.width,
                         1
                     );
                 }
                 
                 // Strikethrough
                 if (layer.strikethrough) {
                     const metrics = ctx.measureText(layer.text);
                     ctx.fillRect(
                         layer.x,
                         layer.y - layer.fontSize/4,
                         metrics.width,
                         1
                     );
                 }
                 
                 ctx.fillText(layer.text, layer.x, layer.y);
             }
         }
         
         ctx.restore();
     });
 }

 function attachLayerEvents() {
    if (!activeLayer) return;

    const elements = {
        textInput: document.getElementById("textInput"),
        fontFamily: document.getElementById("fontFamily"),
        fontSize: document.getElementById("fontSize"),
        fontWeight: document.getElementById("fontWeight"),
        fontStyle: document.getElementById("fontStyle"),
        letterSpacing: document.getElementById("letterSpacing"),
        lineHeight: document.getElementById("lineHeight"),
        textColor: document.getElementById("textColor"),
        backgroundColor: document.getElementById("backgroundColor"),
        opacity: document.getElementById("opacity"),
        underline: document.getElementById("underline"),
        strikethrough: document.getElementById("strikethrough"),
        border: document.getElementById("border"),
        borderColor: document.getElementById("borderColor"),
        borderWidth: document.getElementById("borderWidth"),
        borderStyle: document.getElementById("borderStyle"),
        borderPosition: document.getElementById("borderPosition"),
        borderPlacement: document.getElementById("borderPlacement"),
        shadow: document.getElementById("shadow"),
        shadowColor: document.getElementById("shadowColor"),
        shadowBlur: document.getElementById("shadowBlur"),
        shadowOffsetX: document.getElementById("shadowOffsetX"),
        shadowOffsetY: document.getElementById("shadowOffsetY"),
        textRotation: document.getElementById("textRotation"),
        xPos: document.getElementById("xPos"),
        yPos: document.getElementById("yPos"),
        xSlider: document.getElementById("xSlider"),
        ySlider: document.getElementById("ySlider")
    };

    const update = () => {
        if (!activeLayer) return;

        // Update text layer properties
        if (activeLayer.type === 'text') {
            activeLayer.text = elements.textInput?.value || activeLayer.text;
            activeLayer.font = elements.fontFamily?.value || activeLayer.font;
            activeLayer.fontSize = parseInt(elements.fontSize?.value) || activeLayer.fontSize;
            activeLayer.fontWeight = elements.fontWeight?.value || activeLayer.fontWeight;
            activeLayer.fontStyle = elements.fontStyle?.value || activeLayer.fontStyle;
            activeLayer.letterSpacing = parseInt(elements.letterSpacing?.value) || 0;
            activeLayer.lineHeight = parseFloat(elements.lineHeight?.value) || 1.2;
            activeLayer.color = elements.textColor?.value || activeLayer.color;
            activeLayer.backgroundColor = elements.backgroundColor?.value || 'transparent';
            activeLayer.opacity = parseFloat(elements.opacity?.value) || 1;
            activeLayer.underline = elements.underline?.checked || false;
            activeLayer.strikethrough = elements.strikethrough?.checked || false;
            activeLayer.border = elements.border?.checked || false;
            activeLayer.borderColor = elements.borderColor?.value || '#000000';
            activeLayer.borderWidth = parseInt(elements.borderWidth?.value) || 1;
            activeLayer.borderStyle = elements.borderStyle?.value || 'solid';
            activeLayer.borderPosition = elements.borderPosition?.value || 'all';
            activeLayer.borderPlacement = elements.borderPlacement?.value || 'outside';
            activeLayer.shadow = elements.shadow?.checked || false;
            activeLayer.shadowColor = elements.shadowColor?.value || '#000000';
            activeLayer.shadowBlur = parseInt(elements.shadowBlur?.value) || 5;
            activeLayer.shadowOffsetX = parseInt(elements.shadowOffsetX?.value) || 2;
            activeLayer.shadowOffsetY = parseInt(elements.shadowOffsetY?.value) || 2;
            activeLayer.rotation = parseInt(elements.textRotation?.value) || 0;
            activeLayer.x = parseInt(elements.xPos?.value) || activeLayer.x;
            activeLayer.y = parseInt(elements.yPos?.value) || activeLayer.y;

            // Sync sliders with position inputs
            if (elements.xSlider) elements.xSlider.value = activeLayer.x;
            if (elements.ySlider) elements.ySlider.value = activeLayer.y;
        }

        // Save changes
        if (currentImage) {
            imageLayersMap.set(currentImage, layers);
            const currentStyle = window.imageStyleMap?.get(currentImage);
            if (currentStyle) {
                styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
            }
        }

        updateLayerList();
        renderCanvas();
    };

    // Attach event listeners to all controls
    Object.values(elements).forEach(element => {
        if (element) {
            if (element.type === 'checkbox') {
                element.onchange = update;
            } else {
                element.oninput = update;
            }
        }
    });

    // Position controls sync
    if (elements.xSlider && elements.xPos) {
        elements.xSlider.oninput = () => {
            elements.xPos.value = elements.xSlider.value;
            update();
        };
        elements.xPos.oninput = () => {
            elements.xSlider.value = elements.xPos.value;
            update();
        };
    }

    if (elements.ySlider && elements.yPos) {
        elements.ySlider.oninput = () => {
            elements.yPos.value = elements.ySlider.value;
            update();
        };
        elements.yPos.oninput = () => {
            elements.ySlider.value = elements.yPos.value;
            update();
        };
    }
}

function attachImageLayerEvents() {
    if (!activeLayer || activeLayer.type !== 'image') return;
    
    const controls = {
        imageLayerName: document.getElementById('imageLayerName'),
        imageWidth: document.getElementById('imageWidth'),
        imageHeight: document.getElementById('imageHeight'),
        imageXPos: document.getElementById('imageXPos'),
        imageYPos: document.getElementById('imageYPos'),
        imageXSlider: document.getElementById('imageXSlider'),
        imageYSlider: document.getElementById('imageYSlider'),
        imageOpacity: document.getElementById('imageOpacity'),
        blendMode: document.getElementById('blendMode'),
        imageRotation: document.getElementById('imageRotation'),
        imageBorder: document.getElementById('imageBorder'),
        imageBorderColor: document.getElementById('imageBorderColor'),
        imageBorderWidth: document.getElementById('imageBorderWidth'),
        imageBorderStyle: document.getElementById('imageBorderStyle'),
        imageBorderPosition: document.getElementById('imageBorderPosition'),
        imageBorderPlacement: document.getElementById('imageBorderPlacement'),
        imageShadow: document.getElementById('imageShadow'),
        imageShadowColor: document.getElementById('imageShadowColor'),
        imageShadowBlur: document.getElementById('imageShadowBlur'),
        imageBorderRadius: document.getElementById('imageBorderRadius'),
        imageBorderRadiusInput: document.getElementById('imageBorderRadiusInput')
    };

    // Get the cached image for actual aspect ratio
    const layerImg = imageLayerCache.get(activeLayer.id);
    let originalAspectRatio = layerImg ? layerImg.width / layerImg.height : activeLayer.width / activeLayer.height;
    let maintainAspect = true;

    const aspectLockBtn = document.getElementById('maintainAspectRatio');
    if (aspectLockBtn) {
        // Set initial state
        aspectLockBtn.textContent = maintainAspect ? '🔒' : '🔓';
        
        aspectLockBtn.onclick = () => {
            maintainAspect = !maintainAspect;
            aspectLockBtn.textContent = maintainAspect ? '🔒' : '🔓';
            // Update aspect ratio from current dimensions when locking
            if (maintainAspect) {
                originalAspectRatio = activeLayer.width / activeLayer.height;
            }
        };
    }

    // Handle width changes
    if (controls.imageWidth) {
        controls.imageWidth.oninput = () => {
            const newWidth = parseInt(controls.imageWidth.value);
            if (maintainAspect && !isNaN(newWidth)) {
                const newHeight = Math.round(newWidth / originalAspectRatio);
                if (controls.imageHeight) controls.imageHeight.value = newHeight;
                activeLayer.height = newHeight;
            }
            activeLayer.width = newWidth;
            update();
        };
    }

    // Handle height changes
    if (controls.imageHeight) {
        controls.imageHeight.oninput = () => {
            const newHeight = parseInt(controls.imageHeight.value);
            if (maintainAspect && !isNaN(newHeight)) {
                const newWidth = Math.round(newHeight * originalAspectRatio);
                if (controls.imageWidth) controls.imageWidth.value = newWidth;
                activeLayer.width = newWidth;
            }
            activeLayer.height = newHeight;
            update();
        };
    }

    const update = () => {
        if (!activeLayer) return;

        // Update image layer properties
        activeLayer.name = controls.imageLayerName?.value || activeLayer.name;
        activeLayer.width = parseInt(controls.imageWidth?.value) || activeLayer.width;
        activeLayer.height = parseInt(controls.imageHeight?.value) || activeLayer.height;
        activeLayer.x = parseInt(controls.imageXPos?.value) || activeLayer.x;
        activeLayer.y = parseInt(controls.imageYPos?.value) || activeLayer.y;
        activeLayer.opacity = parseFloat(controls.imageOpacity?.value) || 1;
        activeLayer.blendMode = controls.blendMode?.value || 'normal';
        activeLayer.rotation = parseInt(controls.imageRotation?.value) || 0;
        activeLayer.border = controls.imageBorder?.checked || false;
        activeLayer.borderColor = controls.imageBorderColor?.value || '#000000';
        activeLayer.borderWidth = parseInt(controls.imageBorderWidth?.value) || 1;
        activeLayer.borderStyle = controls.imageBorderStyle?.value || 'solid';
        activeLayer.borderPosition = controls.imageBorderPosition?.value || 'all';
        activeLayer.borderPlacement = controls.imageBorderPlacement?.value || 'outside';
        activeLayer.shadow = controls.imageShadow?.checked || false;
        activeLayer.shadowColor = controls.imageShadowColor?.value || '#000000';
        activeLayer.shadowBlur = parseInt(controls.imageShadowBlur?.value) || 5;
        activeLayer.borderRadius = parseInt(controls.imageBorderRadius?.value) || 0;
        
        // Update radius value display
        const radiusDisplay = document.getElementById('radiusValue');
        if (radiusDisplay) {
            radiusDisplay.textContent = `${activeLayer.borderRadius}px`;
        }

        // Sync radius input with slider
        if (controls.imageBorderRadiusInput) {
            controls.imageBorderRadiusInput.value = activeLayer.borderRadius;
        }

        // Sync sliders with number inputs for position
        if (controls.imageXSlider) controls.imageXSlider.value = activeLayer.x;
        if (controls.imageYSlider) controls.imageYSlider.value = activeLayer.y;

        // Save changes
        if (currentImage) {
            imageLayersMap.set(currentImage, layers);
            const currentStyle = window.imageStyleMap?.get(currentImage);
            if (currentStyle) {
                styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
            }
        }

        updateLayerList();
        renderCanvas();
    };

    // Attach event listeners to all controls
    Object.values(controls).forEach(control => {
        if (control) {
            if (control.type === 'checkbox') {
                control.onchange = update;
            } else {
                control.oninput = update;
            }
        }
    });

    // Position controls sync
    const syncPositionControls = [
        { slider: controls.imageXSlider, input: controls.imageXPos },
        { slider: controls.imageYSlider, input: controls.imageYPos }
    ];

    syncPositionControls.forEach(({ slider, input }) => {
        if (slider && input) {
            slider.oninput = () => {
                input.value = slider.value;
                update();
            };
            input.oninput = () => {
                slider.value = input.value;
                update();
            };
        }
    });
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


function downloadOriginal() {
     const img = document.getElementById('modalImage');
     if (!img) return;
     
     const link = document.createElement('a');
     link.href = img.src;
     link.download = `generated-image-original.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
 }
 
 function downloadEdited() {
     const canvas = document.getElementById('textCanvas');
     const image = document.getElementById('modalImage');
     
     // If there's no canvas content, download the original image
     if (!canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some(x => x !== 0)) {
         downloadOriginal();
         return;
     }

     const link = document.createElement('a');
     link.download = 'edited-image.png';
     link.href = canvas.toDataURL('image/png');
     link.click();
 }
 
 function hideModal() {
     const modal = document.getElementById('imagePreviewModal');
     if (modal) {
         modal.classList.remove('show');
         // Clear any active layers or editors
         const layerEditor = document.querySelector('.layer-editor');
         const imageLayerControls = document.querySelector('.image-layer-controls');
         if (layerEditor) layerEditor.style.display = 'none';
         if (imageLayerControls) imageLayerControls.style.display = 'none';
     }
 }

 function postImage() {
     const canvas = document.getElementById('textCanvas');
     const image = document.getElementById('modalImage');
     
     // Get the image data - use canvas if it has content, otherwise use original image
     let imageData;
     if (canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data.some(x => x !== 0)) {
         imageData = canvas.toDataURL('image/png');
     } else {
         imageData = image.src;
     }

     // First close the modal
     hideModal();

     // Then switch to post section and ensure sidebar is hidden
     const rightSidebar = document.querySelector('.sidebar');
     if (rightSidebar) {
         rightSidebar.style.display = 'none';
         rightSidebar.classList.remove('active');
     }
     const overlay = document.querySelector('.sidebar-overlay');
     if (overlay) {
         overlay.classList.remove('active');
     }
     switchSection('post');

     // Convert data URL to Blob
     fetch(imageData)
         .then(res => res.blob())
         .then(blob => {
             // Create a File object from the Blob
             const file = new File([blob], 'posted-image.png', { type: 'image/png' });
             
             // Clear existing previews
             const postFilePreviews = document.getElementById('postFilePreviews');
             if (postFilePreviews) {
                 postFilePreviews.innerHTML = '';
             }
             
             // Use the createPreview function
             if (typeof createPreview === 'function') {
                 createPreview(file);
             } else {
                 console.error('createPreview function not found');
             }
         })
         .catch(error => {
             console.error('Error converting image:', error);
         });
 }

 // Add event listener for the post button
 document.addEventListener('DOMContentLoaded', function() {
     const postButton = document.getElementById('postImage');
     if (postButton) {
         postButton.addEventListener('click', postImage);
     }
 });
 
 // Track which view mode the user had for each image
 function saveViewMode() {
     if (currentImage) {
         const showEdited = document.getElementById('showEdited');
         const isEditedView = showEdited && showEdited.classList.contains('active');
         imageLayersMap.set(currentImage + '_viewingEdited', isEditedView);
     }
 }
 
 // Initialize text editor when image preview modal is shown
 const closeModalBtn = document.querySelector('.close-modal');
 if (closeModalBtn) {
     closeModalBtn.addEventListener('click', () => {
         // Save view mode before closing
         saveViewMode();
         
         const modalImage = document.getElementById('modalImage');
         const textCanvas = document.getElementById('textCanvas');
         const showOriginal = document.getElementById('showOriginal');
         const showEdited = document.getElementById('showEdited');
         
         if (modalImage) modalImage.classList.add('active');
         if (textCanvas) textCanvas.classList.remove('active');
         if (showOriginal) showOriginal.classList.add('active');
         if (showEdited) showEdited.classList.remove('active');
     });
 }
 
 // Hook into the modal image setting
 const originalShowModal = window.showModal;
 window.showModal = (imageSrc) => {
     // Save current view mode and layers before changing image
     saveViewMode();
     
     // Call the original implementation
     originalShowModal(imageSrc);
     
     // Add our additional functionality
     const modalImage = document.getElementById('modalImage');
     if (modalImage) {
         modalImage.onload = () => {
             // Initialize thumbnails array
             thumbnailImages = Array.from(document.querySelectorAll('.thumbnail img')).map(img => img.src);
             currentThumbnailIndex = thumbnailImages.indexOf(imageSrc);
             
             // Set up thumbnails
             const thumbnails = document.querySelectorAll('.thumbnail');
             thumbnails.forEach((thumb, index) => {
                 thumb.addEventListener('click', () => {
                     currentThumbnailIndex = index;
                     handleThumbnailClick(thumb);
                 });
             });
             
             // Set initial active thumbnail
             if (thumbnails.length > 0) {
                 thumbnails.forEach(thumb => thumb.classList.remove('active'));
                 thumbnails[currentThumbnailIndex].classList.add('active');
             }
             
             initTextEditor();
             
             // Check if the new image has layers
             const hasLayers = imageLayersMap.has(imageSrc) && imageLayersMap.get(imageSrc).length > 0;
             
             // If no layers, show original view
             if (!hasLayers) {
                 const showOriginal = document.getElementById('showOriginal');
                 const showEdited = document.getElementById('showEdited');
                 const textCanvas = document.getElementById('textCanvas');
                 
                 if (showOriginal && showEdited && modalImage && textCanvas) {
                     showOriginal.classList.add('active');
                     showEdited.classList.remove('active');
                     modalImage.classList.add('active');
                     textCanvas.classList.remove('active');
                 }
             }
         };
     }
 };

 // Hide layer editor initially
 const layerEditor = document.getElementById('layerEditor');
 if (layerEditor) {
     layerEditor.style.display = 'none';
 }
 
 // Expose key functions to window object for external access
 window.saveViewMode = saveViewMode;
 window.initTextEditor = initTextEditor;
 window.imageStyleMap = window.imageStyleMap || new Map();

function setupTabSwitching() {
    const propertiesTab = document.getElementById('propertiesTab');
    const layersTab = document.getElementById('layersTab');
    const templatesTab = document.getElementById('templatesTab');
    const propertiesContent = document.getElementById('propertiesContent');
    const layersContent = document.getElementById('layersContent');
    const templatesContent = document.getElementById('templatesContent');

    if (!propertiesTab || !layersTab || !templatesTab || !propertiesContent || !layersContent || !templatesContent) {
        console.warn('Tab elements not found, waiting for DOM...');
        setTimeout(setupTabSwitching, 100);
        return;
    }

    function activateTab(tab, content) {
        // Remove 'active' class from all tabs and contents
        propertiesTab.classList.remove('active');
        layersTab.classList.remove('active');
        templatesTab.classList.remove('active');
        propertiesContent.classList.remove('active');
        layersContent.classList.remove('active');
        templatesContent.classList.remove('active');

        // Add 'active' class to selected tab and its content
        tab.classList.add('active');
        content.classList.add('active');

        // Hide properties section if no layer is selected
        const layerEditor = document.getElementById('layerEditor');
        const imageLayerControls = document.querySelector('.image-layer-controls');
        if (!activeLayer) {
            if (layerEditor) layerEditor.style.display = 'none';
            if (imageLayerControls) imageLayerControls.style.display = 'none';
        }
    }

    // Set up event listeners
    propertiesTab.addEventListener('click', () => {
        activateTab(propertiesTab, propertiesContent);
        // Show appropriate editor based on active layer type
        if (activeLayer) {
            const layerEditor = document.getElementById('layerEditor');
            const imageLayerControls = document.querySelector('.image-layer-controls');
            if (activeLayer.type === 'text') {
                if (layerEditor) layerEditor.style.display = 'block';
                if (imageLayerControls) imageLayerControls.style.display = 'none';
            } else if (activeLayer.type === 'image') {
                if (layerEditor) layerEditor.style.display = 'none';
                if (imageLayerControls) imageLayerControls.style.display = 'block';
            }
        }
    });

    layersTab.addEventListener('click', () => {
        activateTab(layersTab, layersContent);
        // Hide editors in layers tab
        const layerEditor = document.getElementById('layerEditor');
        const imageLayerControls = document.querySelector('.image-layer-controls');
        if (layerEditor) layerEditor.style.display = 'none';
        if (imageLayerControls) imageLayerControls.style.display = 'none';
    });

    templatesTab.addEventListener('click', () => {
        activateTab(templatesTab, templatesContent);
        // Hide editors in templates tab
        const layerEditor = document.getElementById('layerEditor');
        const imageLayerControls = document.querySelector('.image-layer-controls');
        if (layerEditor) layerEditor.style.display = 'none';
        if (imageLayerControls) imageLayerControls.style.display = 'none';
    });
}

// Add this function to handle thumbnail clicks
function handleThumbnailClick(thumbnail) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const modalImage = document.getElementById('modalImage');
    
    if (modalImage) {
        // Update current index
        currentThumbnailIndex = Array.from(thumbnails).indexOf(thumbnail);
        
        // Remove active class from all thumbnails
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
        
        // Update main image
        modalImage.src = thumbnailImages[currentThumbnailIndex];
        
        // Reinitialize text editor with new image
        modalImage.onload = () => {
            initTextEditor();
        };
    }
}

// Add this new function to handle thumbnail updates
function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const modalImage = document.getElementById('modalImage');
    
    if (thumbnails.length > 0 && modalImage) {
        // Remove active class from all thumbnails
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Add active class to current thumbnail
        thumbnails[currentThumbnailIndex].classList.add('active');
        
        // Scroll the active thumbnail into view
        thumbnails[currentThumbnailIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
        
        // Update main image
        modalImage.src = thumbnailImages[currentThumbnailIndex];
        
        // Reinitialize text editor with new image
        modalImage.onload = () => {
            initTextEditor();
        };
    }
}

// Add switchSection function
function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId + 'Section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
}