// Template definitions
const templates = {
    casa_basic: {
        name: "CASA Basic",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 20,
                y: 20,
                width: 100,
                height: 100,
                opacity: 1,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "CASA CARD",
                x: 400,
                y: 300,
                fontSize: 48,
                font: "Arial",
                color: "#FF0000",
                opacity: 1,
                fontWeight: "bold",
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 24,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 1,
                rotation: 0
            }
        ]
    },

    casa_template_1: {
        name: "Overlay - TopLeft Logo",
        layers: [
        {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 30,
            y: 30,
            width: 120,
            height: 120,
            opacity: 1
        },
        {
            type: 'text',
            text: "WWW.CARD.CASA",
            x: 30,
            y: 899,
            fontSize: 30,
            font: "Helvetica",
            color: "#FFFFFF",
            fontWeight: "bold",
            opacity: 1
        },
        {
            type: 'text',
            text: "@CARD.CASA",
            x: 760,
            y: 950,
            fontSize: 30,
            font: "Helvetica",
            color: "#FFFFFF",
            fontWeight: "bold",
            opacity: 1
        },
        {
            type: 'text',
            text: "@CARD_CASA",
            x: 760,
            y: 899,
            fontSize: 30,
            font: "Helvetica",
            color: "#FFFFFF",
            fontWeight: "bold",
            opacity: 1
        }
        ]
    },

    casa_template_2: {
        name: "Overlay - BottomRight Logo",
        layers: [
            {
                type: 'image',
                name: "CASA Logo",
                imageData: 'assets/card_casa_white_logo.png',
                x: 30,
                y: 30,
                width: 120,
                height: 120,
                opacity: 1
            },
            {
                type: 'text',
                text: "WWW.CARD.CASA",
                x: 100,
                y: 968,
                fontSize: 30,
                font: "Helvetica",
                color: "#FFFFFF",
                fontWeight: "bold",
                opacity: 1
            },
            {
                type: 'text',
                text: "@CARD.CASA",
                x: 130,
                y: 880,
                fontSize: 30,
                font: "Helvetica",
                color: "#FFFFFF",
                fontWeight: "bold",
                opacity: 1
            },
            {
                type: 'text',
                text: "@CARD_CASA",
                x: 126,
                y: 922,
                fontSize: 30,
                font: "Helvetica",
                color: "#FFFFFF",
                fontWeight: "bold",
                opacity: 1
            }
        ]
    },

    casa_template_3: {
        name: "Overlay - Centered Logo",
        layers: [
            {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 560,
            y: 20,
            width: 100,
            height: 100,
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD.CASA | @CARD_CASA",
            x: 460,
            y: 140,
            fontSize: 20,
            font: "Helvetica",
            color: "#FFFFFF",
            opacity: 1
            },
            {
            type: 'text',
            text: "WWW.CARD.CASA",
            x: 500,
            y: 700,
            fontSize: 20,
            font: "Arial",
            color: "#FFC107",
            opacity: 1
            }
        ]
    },

    casa_template_4: {
        name: "Overlay - Side Aligns",
        layers: [
            {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 1080,
            y: 300,
            width: 90,
            height: 90,
            opacity: 1
            },
            {
            type: 'text',
            text: "WWW.CARD.CASA",
            x: 20,
            y: 360,
            fontSize: 24,
            font: "Georgia",
            color: "#4CAF50",
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD.CASA",
            x: 980,
            y: 20,
            fontSize: 16,
            font: "Courier",
            color: "#E91E63",
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD_CASA",
            x: 980,
            y: 50,
            fontSize: 16,
            font: "Courier",
            color: "#9C27B0",
            opacity: 1
            }
        ]
    },

    casa_template_5: {
        name: "Overlay - ZigZag Layout",
        layers: [
            {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 20,
            y: 650,
            width: 90,
            height: 90,
            opacity: 1
            },
            {
            type: 'text',
            text: "WWW.CARD.CASA",
            x: 950,
            y: 30,
            fontSize: 22,
            font: "Arial",
            color: "#00BCD4",
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD.CASA | @CARD_CASA",
            x: 450,
            y: 650,
            fontSize: 18,
            font: "Tahoma",
            color: "#FFF",
            opacity: 1
            }
        ]
    },

    casa_template_6: {
        name: "Overlay - Footer Strip",
        layers: [
            {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 20,
            y: 640,
            width: 70,
            height: 70,
            opacity: 1
            },
            {
            type: 'text',
            text: "WWW.CARD.CASA  |  @CARD.CASA  |  @CARD_CASA",
            x: 200,
            y: 670,
            fontSize: 18,
            font: "Arial",
            color: "#F5F5F5",
            opacity: 1
            }
        ]
    },

    casa_template_7: {
        name: "Overlay - Badge Style",
        layers: [
            {
            type: 'image',
            name: "CASA Logo",
            imageData: 'assets/card_casa_white_logo.png',
            x: 1000,
            y: 20,
            width: 60,
            height: 60,
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD.CASA",
            x: 1000,
            y: 90,
            fontSize: 16,
            font: "Arial",
            color: "#03A9F4",
            opacity: 1
            },
            {
            type: 'text',
            text: "@CARD_CASA",
            x: 1000,
            y: 115,
            fontSize: 16,
            font: "Arial",
            color: "#FFEB3B",
            opacity: 1
            },
            {
            type: 'text',
            text: "WWW.CARD.CASA",
            x: 1000,
            y: 140,
            fontSize: 16,
            font: "Arial",
            color: "#00E676",
            opacity: 1
            }
        ]
    },
                                                
    casa_elegant: {
        name: "CASA Elegant",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 30,
                y: 30,
                width: 120,
                height: 120,
                opacity: 0.9,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "CASA CARD",
                x: 400,
                y: 300,
                fontSize: 56,
                font: "Georgia",
                color: "#FF0000",
                opacity: 1,
                fontWeight: "bold",
                shadow: true,
                shadowColor: "#000000",
                shadowBlur: 5,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 28,
                font: "Georgia",
                color: "#FFFFFF",
                opacity: 1,
                shadow: true,
                shadowColor: "#000000",
                shadowBlur: 3,
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                rotation: 0
            }
        ]
    },
    birthday: {
        name: "Birthday Card",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 20,
                y: 20,
                width: 80,
                height: 80,
                opacity: 0.8,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "Happy Birthday!",
                x: 100,
                y: 100,
                fontSize: 48,
                font: "Impact",
                color: "#FFD700",
                opacity: 1,
                shadow: true,
                shadowColor: "#000000",
                shadowBlur: 5,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                rotation: 0
            },
            {
                type: 'text',
                text: "Wishing you a day filled with happiness and joy!",
                x: 100,
                y: 180,
                fontSize: 24,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 1,
                shadow: true,
                shadowColor: "#000000",
                shadowBlur: 3,
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 24,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 1,
                rotation: 0
            }
        ]
    },
    announcement: {
        name: "Announcement",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 20,
                y: 20,
                width: 80,
                height: 80,
                opacity: 0.8,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "ANNOUNCEMENT",
                x: 100,
                y: 80,
                fontSize: 36,
                font: "Arial",
                color: "#000000",
                opacity: 1,
                fontWeight: "bold",
                rotation: 0
            },
            {
                type: 'text',
                text: "We are pleased to announce...",
                x: 100,
                y: 140,
                fontSize: 24,
                font: "Arial",
                color: "#333333",
                opacity: 1,
                rotation: 0
            },
            {
                type: 'text',
                text: "Click to edit this text",
                x: 100,
                y: 180,
                fontSize: 20,
                font: "Arial",
                color: "#666666",
                opacity: 1,
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 24,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 1,
                rotation: 0
            }
        ]
    },
    quote: {
        name: "Quote Card",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 20,
                y: 20,
                width: 80,
                height: 80,
                opacity: 0.8,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "",
                x: 80,
                y: 100,
                fontSize: 72,
                font: "Georgia",
                color: "#4A4A4A",
                opacity: 0.8,
                rotation: 0
            },
            {
                type: 'text',
                text: "Your quote goes here...",
                x: 100,
                y: 160,
                fontSize: 28,
                font: "Georgia",
                color: "#333333",
                opacity: 1,
                fontStyle: "italic",
                rotation: 0
            },
            {
                type: 'text',
                text: "- Author Name",
                x: 100,
                y: 220,
                fontSize: 20,
                font: "Georgia",
                color: "#666666",
                opacity: 1,
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 24,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 1,
                rotation: 0
            }
        ]
    },
    minimal: {
        name: "Minimal Design",
        layers: [
            {
                type: 'image',
                imageData: 'assets/card_casa_white_logo.png',
                x: 20,
                y: 20,
                width: 60,
                height: 60,
                opacity: 0.7,
                name: "CASA Logo"
            },
            {
                type: 'text',
                text: "CASA CARD",
                x: 400,
                y: 300,
                fontSize: 42,
                font: "Arial",
                color: "#FF0000",
                opacity: 1,
                fontWeight: "bold",
                rotation: 0
            },
            {
                type: 'text',
                text: "@CASA_CARD",
                x: 500,
                y: 500,
                fontSize: 20,
                font: "Arial",
                color: "#FFFFFF",
                opacity: 0.9,
                rotation: 0
            }
        ]
    }
};

// Function to apply a template to the current image
function applyTemplate(templateName) {
    if (!templates[templateName]) {
        console.error(`Template ${templateName} not found`);
        return;
    }

    // Clear existing layers
    layers = [];
    
    // Clone template layers to avoid modifying the originals
    const templateLayers = JSON.parse(JSON.stringify(templates[templateName].layers));
    
    // Process each layer
    templateLayers.forEach(layer => {
        // Generate unique ID for each layer
        layer.id = Date.now() + Math.random();
        
        // If it's an image layer, preload the image
        if (layer.type === 'image' && layer.imageData) {
            const img = new Image();
            img.onload = () => {
                // Store the loaded image in cache
                imageLayerCache.set(layer.id, img);
                // Render canvas after image is loaded
                renderCanvas();
            };
            img.src = layer.imageData;
        }
        
        layers.push(layer);
    });
    
    // Save the layers for this image
    if (currentImage) {
        imageLayersMap.set(currentImage, layers);
        const currentStyle = window.imageStyleMap && window.imageStyleMap.get(currentImage);
        if (currentStyle) {
            styleLayersMap.set(currentStyle, JSON.parse(JSON.stringify(layers)));
        }
    }
    
    // Update UI
    updateLayerList();
    
    // Switch to edited view
    const showEdited = document.getElementById('showEdited');
    const showOriginal = document.getElementById('showOriginal');
    const modalImage = document.getElementById('modalImage');
    const textCanvas = document.getElementById('textCanvas');
    
    if (showEdited && showOriginal && modalImage && textCanvas) {
        showEdited.classList.add('active');
        showOriginal.classList.remove('active');
        textCanvas.classList.add('active');
        modalImage.classList.remove('active');
    }
    
    // Select the first layer to update property editor UI
    if (layers.length > 0) {
        selectLayer(layers[0].id);
    }
    
    // Render the canvas
    renderCanvas();
}

// Initialize template functionality
function initTemplates() {
    const templateItems = document.querySelectorAll('.template-item');
    templateItems.forEach(item => {
        item.addEventListener('click', () => {
            const templateName = item.getAttribute('data-template');
            applyTemplate(templateName);
        });
    });
}

// Update the setupTabSwitching function to include templates tab
function setupTabSwitching() {
    const propertiesTab = document.getElementById('propertiesTab');
    const layersTab = document.getElementById('layersTab');
    const templatesTab = document.getElementById('templatesTab');
    const propertiesContent = document.getElementById('propertiesContent');
    const layersContent = document.getElementById('layersContent');
    const templatesContent = document.getElementById('templatesContent');

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
    }

    // Set up event listeners
    propertiesTab.addEventListener('click', () => {
        activateTab(propertiesTab, propertiesContent);
    });

    layersTab.addEventListener('click', () => {
        activateTab(layersTab, layersContent);
    });

    templatesTab.addEventListener('click', () => {
        activateTab(templatesTab, templatesContent);
    });
}

// Initialize templates when the modal is shown
document.addEventListener('DOMContentLoaded', () => {
    // Initialize templates
    initTemplates();
}); 