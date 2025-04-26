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
 }
 
 function toggleLayerEditorVisibility() {
     const layerEditor = document.getElementById('layerEditor');
     if (layerEditor) {
         if (activeLayer) {
             layerEditor.style.display = 'block';
         } else {
             layerEditor.style.display = 'none';
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
                         imageData: event.target.result,
                         x: 100,
                         y: 100,
                         width: width,
                         height: height,
                         opacity: 1,
                         name: `Image Layer ${Date.now()}`
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
         layerName.innerText = layer.type === 'image' ? 
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
         // Wait for DOM to be ready
         setTimeout(() => selectLayer(id), 100);
         return;
     }
     
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
             xSlider: document.getElementById("xSlider"),
             ySlider: document.getElementById("ySlider"),
             xPos: document.getElementById("xPos"),
             yPos: document.getElementById("yPos"),
             textColor: document.getElementById("textColor"),
             opacity: document.getElementById("opacity"),
             border: document.getElementById("border"),
             borderColor: document.getElementById("borderColor"),
             shadow: document.getElementById("shadow"),
             shadowColor: document.getElementById("shadowColor"),
             shadowBlur: document.getElementById("shadowBlur")
         };
         
         // Safely set text layer values
         Object.keys(controls).forEach(key => {
             if (controls[key]) {
                 const value = layer[key.replace('Slider', '')];
                 if (value !== undefined) {
                     if (controls[key].type === 'checkbox') {
                         controls[key].checked = value;
                     } else {
                         controls[key].value = value;
                     }
                 }
             }
         });
         
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
             imageOpacity: document.getElementById('imageOpacity'),
             blendMode: document.getElementById('blendMode'),
             imageRotation: document.getElementById('imageRotation'),
             layerImagePreview: document.getElementById('layerImagePreview')
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
         
         // Attach image-specific events
         attachImageLayerEvents();
     }
     
     // Update layer list to show active layer
     updateLayerList();
     
     // Attach events after ensuring elements exist
     attachLayerEvents();
 }

 // Update the attachImageLayerEvents update function
 function attachImageLayerEvents() {
     if (!activeLayer || activeLayer.type !== 'image') return;
     
     const controls = {
         imageWidth: document.getElementById('imageWidth'),
         imageHeight: document.getElementById('imageHeight'),
         imageWidthSlider: document.getElementById('imageWidthSlider'),
         imageHeightSlider: document.getElementById('imageHeightSlider'),
         imageXPos: document.getElementById('imageXPos'),
         imageYPos: document.getElementById('imageYPos'),
         imageXSlider: document.getElementById('imageXSlider'),
         imageYSlider: document.getElementById('imageYSlider'),
         imageOpacity: document.getElementById('imageOpacity'),
         imageRotation: document.getElementById('imageRotation'),
         blendMode: document.getElementById('blendMode'),
         imageLayerName: document.getElementById('imageLayerName')
     };

     const update = () => {
         if (!activeLayer) return;
         
         // Update layer properties
         activeLayer.width = parseInt(controls.imageWidth.value);
         activeLayer.height = parseInt(controls.imageHeight.value);
         activeLayer.x = parseInt(controls.imageXPos.value);
         activeLayer.y = parseInt(controls.imageYPos.value);
         activeLayer.opacity = parseFloat(controls.imageOpacity.value);
         activeLayer.rotation = parseInt(controls.imageRotation.value);
         activeLayer.blendMode = controls.blendMode.value;
         activeLayer.name = controls.imageLayerName.value;

         // Apply constraints
         constrainToBounds(activeLayer);

         // Update controls with constrained values
         controls.imageXPos.value = activeLayer.x;
         controls.imageYPos.value = activeLayer.y;
         controls.imageXSlider.value = activeLayer.x;
         controls.imageYSlider.value = activeLayer.y;

         // Update display values
         document.getElementById('opacityValue').textContent = `${Math.round(activeLayer.opacity * 100)}%`;
         document.getElementById('rotationValue').textContent = `${activeLayer.rotation}°`;

         // Sync sliders with number inputs
         if (controls.imageWidthSlider) controls.imageWidthSlider.value = controls.imageWidth.value;
         if (controls.imageHeightSlider) controls.imageHeightSlider.value = controls.imageHeight.value;
         if (controls.imageXSlider) controls.imageXSlider.value = controls.imageXPos.value;
         if (controls.imageYSlider) controls.imageYSlider.value = controls.imageYPos.value;

         // Save and render
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

     // Attach event listeners for sliders
     const syncSliders = {
         imageWidthSlider: 'imageWidth',
         imageHeightSlider: 'imageHeight',
         imageXSlider: 'imageXPos',
         imageYSlider: 'imageYPos'
     };

     Object.entries(syncSliders).forEach(([sliderId, inputId]) => {
         const slider = controls[sliderId];
         const input = controls[inputId];
         
         if (slider && input) {
             // Sync initial values
             slider.value = input.value;
             
             // Update input when slider changes
             slider.addEventListener('input', (e) => {
                 input.value = e.target.value;
                 update();
             });
             
             // Update slider when input changes
             input.addEventListener('input', (e) => {
                 slider.value = e.target.value;
                 update();
             });
         }
     });

     // Attach event listeners to remaining controls
     ['imageOpacity', 'imageRotation', 'blendMode', 'imageLayerName'].forEach(controlId => {
         const control = controls[controlId];
         if (control) {
             control.addEventListener('input', update);
         }
     });

     // Initialize aspect ratio lock with the actual image aspect ratio
     let maintainAspect = true;
     // Get the actual image from cache to calculate real aspect ratio
     const layerImg = imageLayerCache.get(activeLayer.id);
     let aspectRatio = layerImg ? layerImg.width / layerImg.height : activeLayer.width / activeLayer.height;
     
     const aspectLockBtn = document.getElementById('maintainAspectRatio');
     if (aspectLockBtn) {
         aspectLockBtn.addEventListener('click', () => {
             maintainAspect = !maintainAspect;
             aspectLockBtn.textContent = maintainAspect ? '🔒' : '🔓';
             // Update aspect ratio from the cached image
             const img = imageLayerCache.get(activeLayer.id);
             if (img) {
                 aspectRatio = img.width / img.height;
             }
         });

         // Handle width changes (both slider and input)
         [controls.imageWidth, controls.imageWidthSlider].forEach(control => {
             if (control) {
                 control.addEventListener('input', (e) => {
                     const newWidth = parseInt(e.target.value);
                     if (maintainAspect) {
                         const newHeight = Math.round(newWidth / aspectRatio);
                         // Update both height input and slider
                         controls.imageHeight.value = newHeight;
                         controls.imageHeightSlider.value = newHeight;
                         activeLayer.height = newHeight;
                     }
                     // Sync width controls
                     controls.imageWidth.value = newWidth;
                     controls.imageWidthSlider.value = newWidth;
                     activeLayer.width = newWidth;
                     update();
                 });
             }
         });

         // Handle height changes (both slider and input)
         [controls.imageHeight, controls.imageHeightSlider].forEach(control => {
             if (control) {
                 control.addEventListener('input', (e) => {
                     const newHeight = parseInt(e.target.value);
                     if (maintainAspect) {
                         const newWidth = Math.round(newHeight * aspectRatio);
                         // Update both width input and slider
                         controls.imageWidth.value = newWidth;
                         controls.imageWidthSlider.value = newWidth;
                         activeLayer.width = newWidth;
                     }
                     // Sync height controls
                     controls.imageHeight.value = newHeight;
                     controls.imageHeightSlider.value = newHeight;
                     activeLayer.height = newHeight;
                     update();
                 });
             }
         });
     }

     // Add aspect ratio update to the main update function
     const originalUpdate = update;
     update = () => {
         originalUpdate();
         if (maintainAspect) {
             aspectRatio = activeLayer.width / activeLayer.height;
         }
     };
 }

 // Update the attachLayerEvents update function
 function attachLayerEvents() {
     if (!activeLayer) return;
     
     const update = () => {
         if (!activeLayer) return;
         
         const elements = {
             textInput: document.getElementById("textInput"),
             fontFamily: document.getElementById("fontFamily"),
             fontSize: document.getElementById("fontSize"),
             xPos: document.getElementById("xPos"),
             yPos: document.getElementById("yPos"),
             textColor: document.getElementById("textColor"),
             opacity: document.getElementById("opacity"),
             border: document.getElementById("border"),
             borderColor: document.getElementById("borderColor"),
             shadow: document.getElementById("shadow"),
             shadowColor: document.getElementById("shadowColor"),
             shadowBlur: document.getElementById("shadowBlur")
         };
         
         // Only update values from elements that exist
         if (elements.textInput) activeLayer.text = elements.textInput.value;
         if (elements.fontFamily) activeLayer.font = elements.fontFamily.value;
         if (elements.fontSize) activeLayer.fontSize = parseInt(elements.fontSize.value);
         if (elements.xPos) activeLayer.x = parseInt(elements.xPos.value);
         if (elements.yPos) activeLayer.y = parseInt(elements.yPos.value);
         if (elements.textColor) activeLayer.color = elements.textColor.value;
         if (elements.opacity) activeLayer.opacity = parseFloat(elements.opacity.value);
         if (elements.border) activeLayer.border = elements.border.checked;
         if (elements.borderColor) activeLayer.borderColor = elements.borderColor.value;
         if (elements.shadow) activeLayer.shadow = elements.shadow.checked;
         if (elements.shadowColor) activeLayer.shadowColor = elements.shadowColor.value;
         if (elements.shadowBlur) activeLayer.shadowBlur = parseInt(elements.shadowBlur.value);
         
         // Save layers for current image
         if (currentImage) {
             imageLayersMap.set(currentImage, layers);
             
             // Update style layers
             const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
             if (currentStyle) {
                 styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
             }
         }
         
         // Update layer list
         updateLayerList();
         
         // Update canvas
         renderCanvas();
     };
     
     // Attach events to all controls
     const ids = ["textInput", "fontFamily", "fontSize", "xPos", "yPos", "textColor", 
                 "opacity", "border", "borderColor", "shadow", "shadowColor", "shadowBlur"];
                 
     ids.forEach(id => {
         const element = document.getElementById(id);
         if (element) {
             element.oninput = update;
         }
     });
     
     // Sliders update number inputs
     const xSlider = document.getElementById("xSlider");
     const xPos = document.getElementById("xPos");
     if (xSlider && xPos) {
         xSlider.oninput = e => {
             xPos.value = e.target.value;
             update();
         };
     }
     
     const ySlider = document.getElementById("ySlider");
     const yPos = document.getElementById("yPos");
     if (ySlider && yPos) {
         ySlider.oninput = e => {
             yPos.value = e.target.value;
             update();
         };
     }
 }
 
 function renderCanvas() {
     if (!canvas || !ctx) return;
     
     // Clear canvas and draw image
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     
     const img = document.getElementById("modalImage");
     if (!img) return;
     
     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
     
     // Draw all layers
     layers.forEach(layer => {
         if (!layer) return;
         
         ctx.save();
         
         if (layer.type === 'image') {
             const layerImg = imageLayerCache.get(layer.id);
             if (layerImg) {
                 ctx.globalAlpha = layer.opacity || 1;
                 ctx.globalCompositeOperation = layer.blendMode || 'normal';
                 
                 // Handle rotation
                 if (layer.rotation) {
                     // Move to center of image
                     ctx.translate(layer.x + layer.width/2, layer.y + layer.height/2);
                     // Rotate
                     ctx.rotate(layer.rotation * Math.PI / 180);
                     // Move back
                     ctx.translate(-(layer.x + layer.width/2), -(layer.y + layer.height/2));
                 }
                 
                 ctx.drawImage(layerImg, layer.x, layer.y, layer.width, layer.height);
             }
         } else if (layer.type === 'text') {
             ctx.font = `${layer.fontSize}px ${layer.font}`;
             ctx.fillStyle = layer.color;
             
             // Add shadow if enabled
             if (layer.shadow) {
                 ctx.shadowColor = layer.shadowColor;
                 ctx.shadowBlur = layer.shadowBlur;
                 ctx.shadowOffsetX = 2;
                 ctx.shadowOffsetY = 2;
             }
             
             // Add border if enabled
             if (layer.border) {
                 ctx.strokeStyle = layer.borderColor;
                 ctx.lineWidth = 2;
                 ctx.strokeText(layer.text, layer.x, layer.y);
             }
             
             // Draw text
             ctx.fillText(layer.text, layer.x, layer.y);
         }
         
         ctx.restore();
     });
 }
 
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
     if (!canvas) return;
     
     // Make sure canvas is rendered with latest changes
     renderCanvas();
     
     const link = document.createElement('a');
     link.href = canvas.toDataURL('image/png');
     link.download = `generated-image-with-text.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
 }
 
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
             initTextEditor();
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