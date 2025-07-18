let allCharacters = []; // Store all loaded characters for searching
let selectedCharIDs = [];
let lastSelectedIndex = null;
let currentGroupView = null; // null = all groups, otherwise group name

// --- Helper for date filtering ---
function getDateAgo(unit, amount) {
    const now = new Date();
    switch (unit) {
        case 'year': now.setFullYear(now.getFullYear() - amount); break;
        case 'month': now.setMonth(now.getMonth() - amount); break;
        case 'week': now.setDate(now.getDate() - 7 * amount); break;
        case 'day': now.setDate(now.getDate() - amount); break;
        case 'hour': now.setHours(now.getHours() - amount); break;
    }
    return now;
}

function renderCharacters(data) {
    // Get controls
    const searchInput = document.getElementById('characterSearch');
    const sortDropdown = document.getElementById('characterSortDropdown');
    const filterDropdown = document.getElementById('characterFilterDropdown');
    let searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let sortValue = sortDropdown ? sortDropdown.value : '';
    let filterValue = filterDropdown ? filterDropdown.value : '';
    let filtered = data;
    // --- Filtering (always apply, even if search is empty) ---
    if (filterValue && filterValue !== 'all') {
        // Remove custom date pickers if present (in case user switched from custom before)
        let fromInput = document.getElementById('characterFilterFrom');
        let toInput = document.getElementById('characterFilterTo');
        if (fromInput) fromInput.remove();
        if (toInput) toInput.remove();
        // Preset filters
        let now = new Date();
        if (filterValue === 'today') {
            let compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filtered = filtered.filter(item => {
                if (!item.creationTime) return false;
                const itemDate = new Date(item.creationTime);
                return itemDate >= compareDate;
            });
        } else if (filterValue === '7d') {
            let compareDate = getDateAgo('day', 7);
            filtered = filtered.filter(item => {
                if (!item.creationTime) return false;
                const itemDate = new Date(item.creationTime);
                return itemDate >= compareDate;
            });
        } else if (filterValue === '30d') {
            let compareDate = getDateAgo('day', 30);
            filtered = filtered.filter(item => {
                if (!item.creationTime) return false;
                const itemDate = new Date(item.creationTime);
                return itemDate >= compareDate;
            });
        } else if (filterValue === '1y') {
            let compareDate = getDateAgo('year', 1);
            filtered = filtered.filter(item => {
                if (!item.creationTime) return false;
                const itemDate = new Date(item.creationTime);
                return itemDate >= compareDate;
            });
        } else if (filterValue === 'too_old') {
            let compareDate = getDateAgo('year', 1);
            filtered = filtered.filter(item => {
                if (!item.creationTime) return false;
                const itemDate = new Date(item.creationTime);
                return itemDate < compareDate;
            });
        }
    } else {
        // Remove custom date pickers if present
        let fromInput = document.getElementById('characterFilterFrom');
        let toInput = document.getElementById('characterFilterTo');
        if (fromInput) fromInput.remove();
        if (toInput) toInput.remove();
    }
    // --- Search (after filtering) ---
    if (searchTerm) {
        filtered = filtered.filter(item => {
            let creationStr = '';
            if (item.creationTime) {
                const date = new Date(item.creationTime);
                creationStr = date.toLocaleString().toLowerCase();
            }
            return (
                (item.charID && item.charID.toLowerCase().includes(searchTerm)) ||
                (item.prompt && item.prompt.toLowerCase().includes(searchTerm)) ||
                (creationStr && creationStr.includes(searchTerm))
            );
        });
    }
    // --- Sorting (always apply, even if search/filter is empty) ---
    if (sortValue) {
        if (sortValue === 'alpha_az') {
            filtered.sort((a, b) => (a.charID || '').localeCompare(b.charID || ''));
        } else if (sortValue === 'alpha_za') {
            filtered.sort((a, b) => (b.charID || '').localeCompare(a.charID || ''));
        } else if (sortValue === 'date_new') {
            filtered.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
        } else if (sortValue === 'date_old') {
            filtered.sort((a, b) => new Date(a.creationTime) - new Date(b.creationTime));
        } else if (sortValue === 'date_updated') {
            filtered.sort((a, b) => new Date(b.updatedAt || b.creationTime) - new Date(a.updatedAt || a.creationTime));
        }
    }
    // Group by group name, with pinned group first
    let groups = {};
    filtered.forEach(item => {
        const group = item.group || null;
        if (group) {
            if (!groups[group]) groups[group] = { pinned: !!item.pinned, items: [] };
            groups[group].items.push(item);
            if (item.pinned) groups[group].pinned = true;
        }
    });
    // Sort groups: pinned first, then alpha
    let groupNames = Object.keys(groups);
    groupNames.sort((a, b) => {
        if (groups[a].pinned && !groups[b].pinned) return -1;
        if (!groups[a].pinned && groups[b].pinned) return 1;
        return a.localeCompare(b);
    });
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '';
    // If viewing a single group, show back button and only that group's characters
    if (currentGroupView) {
        // Show a single back card with group name
        const backCard = document.createElement('div');
        backCard.className = 'character-card group-card character-group-back-btn';
        backCard.style.display = 'flex';
        backCard.style.flexDirection = 'row';
        backCard.style.alignItems = 'center';
        backCard.style.justifyContent = 'flex-start';
        backCard.style.cursor = 'pointer';
        backCard.style.marginBottom = '18px';
        backCard.innerHTML = `
            <span style="font-size:1.5rem;margin-right:18px;">&#8592;</span>
            <span style="font-size:1.15rem;font-weight:700;letter-spacing:0.5px;">${currentGroupView}${groups[currentGroupView]?.pinned ? ' 📌' : ''}</span>
        `;
        backCard.onclick = () => {
            // Clear selection when leaving a group
            selectedCharIDs = [];
            lastSelectedIndex = null;
            currentGroupView = null;
            renderCharacters(allCharacters);
        };
        characterList.appendChild(backCard);

        // Remove any existing floating ungroup button
        let ungroupBtn = document.getElementById('ungroupCharactersBtn');
        if (ungroupBtn) ungroupBtn.remove();

        // Remove any existing floating group button
        let groupBtn = document.getElementById('groupCharactersBtn');
        if (groupBtn) groupBtn.remove();

        // Remove any existing floating group/ungroup button containers
        let oldBtnContainer = document.getElementById('groupUngroupBtnsContainer');
        if (oldBtnContainer) oldBtnContainer.remove();

        // Prepare group/ungroup buttons in a flex container
        const section = document.getElementById('charactersSection');
        let showGroupBtn = false, showUngroupBtn = false;
        let groupBtnNeeded = false, ungroupBtnNeeded = false;

        // --- GROUP VIEW BUTTONS ---
        if (selectedCharIDs.length > 0 || (groups[currentGroupView]?.items || []).length > 0) {
            ungroupBtnNeeded = true;
            ungroupBtn = document.createElement('button');
            ungroupBtn.id = 'ungroupCharactersBtn';
            if (selectedCharIDs.length > 0) {
                ungroupBtn.textContent = `Ungroup (${selectedCharIDs.length})`;
            } else {
                ungroupBtn.textContent = 'Ungroup All';
            }
            ungroupBtn.className = 'character-group-ungroup-float-btn';
            // Remove fixed positioning for flex layout
            ungroupBtn.style.position = '';
            ungroupBtn.style.bottom = '';
            ungroupBtn.style.right = '';
            ungroupBtn.style.zIndex = '';
            ungroupBtn.style.margin = '0 8px 0 0';
            ungroupBtn.onclick = async () => {
                if (selectedCharIDs.length > 0) {
                    if (!confirm('Ungroup selected characters?')) return;
                    await fetch('http://localhost:3000/api/ungroup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ charIDs: selectedCharIDs })
                    });
                    selectedCharIDs = [];
                    lastSelectedIndex = null;
                    loadCharacters();
                } else {
                    if (!confirm('Ungroup all characters in this group?')) return;
                    const charIDs = (groups[currentGroupView]?.items || []).map(c => c.charID);
                    await fetch('http://localhost:3000/api/ungroup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ charIDs })
                    });
                    selectedCharIDs = [];
                    lastSelectedIndex = null;
                    currentGroupView = null;
                    loadCharacters();
                }
            };
        }
        // Show group button if 2+ selected (within group)
        if (selectedCharIDs.length >= 1) {
            groupBtnNeeded = true;
            groupBtn = document.createElement('button');
            groupBtn.id = 'groupCharactersBtn';
            groupBtn.textContent = 'Group';
            groupBtn.className = 'character-group-ungroup-float-btn';
            groupBtn.style.position = '';
            groupBtn.style.bottom = '';
            groupBtn.style.right = '';
            groupBtn.style.zIndex = '';
            groupBtn.style.margin = '0 8px 0 0';
            groupBtn.onclick = async () => {
                const allGroups = Array.from(new Set(allCharacters.map(c => c.group).filter(Boolean)));
                showGroupSelectionPopup(allGroups, async (groupName, isNew) => {
                    await fetch('http://localhost:3000/api/group-pin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ charIDs: selectedCharIDs, group: groupName, pin: true })
                    });
                    selectedCharIDs = [];
                    lastSelectedIndex = null;
                    loadCharacters();
                });
            };
        }
        // Create flex container if needed
        if (groupBtnNeeded || ungroupBtnNeeded) {
            const btnContainer = document.createElement('div');
            btnContainer.id = 'groupUngroupBtnsContainer';
            btnContainer.className = 'group-ungroup-btns';
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '12px';
            btnContainer.style.justifyContent = 'flex-end';
            btnContainer.style.margin = '24px 0 0 0';
            if (ungroupBtnNeeded) btnContainer.appendChild(ungroupBtn);
            if (groupBtnNeeded) btnContainer.appendChild(groupBtn);
            section.appendChild(btnContainer);
        }
        // Show only characters in this group
        (groups[currentGroupView]?.items || []).forEach(item => {
        // Determine image order: front, back, side
        const images = [];
        if (item.front_link) images.push(item.front_link);
        if (item.back_link) images.push(item.back_link);
        if (item.side_link) images.push(item.side_link);

        const div = document.createElement('div');
        div.className = 'character-card';
            if (selectedCharIDs.includes(item.charID)) div.classList.add('selected');

        let imagesHtml = images.map((img, idx) =>
            `<img src="${img}" alt="Character Image" class="character-img${idx === 0 ? ' visible' : ''}" style="z-index:${10-idx}">`
        ).join('');
        const imageCountBadge = `<div class="image-count-badge">${images.length}</div>`;

        // Format creation time
        let created = '';
        if (item.creationTime) {
            const date = new Date(item.creationTime);
            created = `<div class="character-created" style="font-size:0.78rem;color:#b6c2d1;opacity:0.7;margin:4px 0 0 0;">${date.toLocaleString()}</div>`;
        }

        // Add Edit button
        const editBtn = `<button class="character-edit-btn">Edit</button>`;
        div.innerHTML = `
            <div class="character-images" style="position:relative;">
                ${imagesHtml}
                ${imageCountBadge}
            </div>
            <h2 class="character-name">${item.charID || ''}</h2>
            <h2 class="character-created">${created}</h2>
            ${editBtn}
        `;
        
            // --- Multi-select logic ---
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('character-edit-btn')) return;
                const idx = groups[currentGroupView].items.findIndex(c => c.charID === item.charID);
                if (e.shiftKey && lastSelectedIndex !== null) {
                    // Range select
                    const start = Math.min(lastSelectedIndex, idx);
                    const end = Math.max(lastSelectedIndex, idx);
                    for (let i = start; i <= end; i++) {
                        const cid = groups[currentGroupView].items[i].charID;
                        if (!selectedCharIDs.includes(cid)) selectedCharIDs.push(cid);
                    }
                } else if (e.ctrlKey || e.metaKey) {
                    // Toggle select
                    if (selectedCharIDs.includes(item.charID)) {
                        selectedCharIDs = selectedCharIDs.filter(id => id !== item.charID);
                    } else {
                        selectedCharIDs.push(item.charID);
                    }
                    lastSelectedIndex = idx;
                } else {
                    // Single select
                    if (selectedCharIDs.length === 1 && selectedCharIDs[0] === item.charID) {
                        selectedCharIDs = [];
                        lastSelectedIndex = null;
                    } else {
                        selectedCharIDs = [item.charID];
                        lastSelectedIndex = idx;
                    }
                }
                renderCharacters(allCharacters);
                e.stopPropagation();
            });
        // --- Preview Modal Logic ---
            div.addEventListener('dblclick', (e) => {
                if (e.target.classList.contains('character-edit-btn')) return;
                showCharacterPreview(item);
            });
            characterList.appendChild(div);
            // Attach edit popup logic
            const editButton = div.querySelector('.character-edit-btn');
            if (editButton) {
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditPopup(item);
                });
            }
        });
        // Ensure hover animation works in group view
        setupCharacterImageHoverAnimation();
        return; // Only show this group
    }
    // MAIN VIEW: Only show one card per group, and ungrouped characters as individual cards
    // Render group cards
    groupNames.forEach(groupName => {
        const group = groups[groupName];
        // Render a single card for the group
        const groupCard = document.createElement('div');
        groupCard.className = 'character-card group-card';
        const groupBadge = `<div class="group-badge">Group</div>`;
        groupCard.innerHTML = `
            ${groupBadge}
            <div class="character-images" style="position:relative;justify-content:center;align-items:center;display:flex;min-height:60px;">
                <div class="image-count-badge" style="position:static;font-size:1.5rem;padding:6px 18px;">${group.items.length}</div>
            </div>
            <h2 class="character-name">${groupName}${group.pinned ? ' 📌' : ''}</h2>
            <p class="character-prompt">${group.items.length} character${group.items.length > 1 ? 's' : ''}</p>
        `;
        groupCard.addEventListener('click', () => {
            // Clear selection when entering a group
            selectedCharIDs = [];
            lastSelectedIndex = null;
            currentGroupView = groupName;
            renderCharacters(allCharacters);
        });
        characterList.appendChild(groupCard);
    });
    // Render ungrouped characters as individual cards
    filtered.filter(item => !item.group).forEach(item => {
        const images = [];
        if (item.front_link) images.push(item.front_link);
        if (item.back_link) images.push(item.back_link);
        if (item.side_link) images.push(item.side_link);
        const div = document.createElement('div');
        div.className = 'character-card';
        if (selectedCharIDs.includes(item.charID)) div.classList.add('selected');
        let imagesHtml = images.map((img, idx) =>
            `<img src="${img}" alt="Character Image" class="character-img${idx === 0 ? ' visible' : ''}" style="z-index:${10-idx}">`
        ).join('');
        const imageCountBadge = `<div class="image-count-badge">${images.length}</div>`;
        let created = '';
        if (item.creationTime) {
            const date = new Date(item.creationTime);
            created = `<div class="character-created" style="font-size:0.78rem;color:#b6c2d1;opacity:0.7;margin:4px 0 0 0;">${date.toLocaleString()}</div>`;
        }
        div.innerHTML = `
            <div class="character-images" style="position:relative;">
                ${imagesHtml}
                ${imageCountBadge}
            </div>
            <h2 class="character-name">${item.charID || ''}</h2>
            <h2 class="character-created">${created}</h2>
            <button class="character-edit-btn">Edit</button>
        `;
        // --- Multi-select logic ---
        div.addEventListener('click', (e) => {
            if (e.target.classList.contains('character-edit-btn')) return;
            const idx = filtered.filter(i => !i.group).findIndex(c => c.charID === item.charID);
            if (e.shiftKey && lastSelectedIndex !== null) {
                // Range select
                const ungrouped = filtered.filter(i => !i.group);
                const start = Math.min(lastSelectedIndex, idx);
                const end = Math.max(lastSelectedIndex, idx);
                for (let i = start; i <= end; i++) {
                    const cid = ungrouped[i].charID;
                    if (!selectedCharIDs.includes(cid)) selectedCharIDs.push(cid);
                }
            } else if (e.ctrlKey || e.metaKey) {
                // Toggle select
                if (selectedCharIDs.includes(item.charID)) {
                    selectedCharIDs = selectedCharIDs.filter(id => id !== item.charID);
                } else {
                    selectedCharIDs.push(item.charID);
                }
                lastSelectedIndex = idx;
            } else {
                // Single select
                if (selectedCharIDs.length === 1 && selectedCharIDs[0] === item.charID) {
                    selectedCharIDs = [];
                    lastSelectedIndex = null;
                } else {
                    selectedCharIDs = [item.charID];
                    lastSelectedIndex = idx;
                }
            }
            renderCharacters(allCharacters);
            e.stopPropagation();
        });
        // --- Preview Modal Logic ---
        div.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('character-edit-btn')) return;
            showCharacterPreview(item);
        });
        characterList.appendChild(div);
        // Attach edit popup logic
        const editButton = div.querySelector('.character-edit-btn');
        if (editButton) {
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showEditPopup(item);
            });
        }
    });
    // Show floating group button if 2+ selected (MAIN VIEW)
    let groupBtn = document.getElementById('groupCharactersBtn');
    // Hide ungroup button if not in group view
    let ungroupBtn = document.getElementById('ungroupCharactersBtn');
    if (!currentGroupView && ungroupBtn) ungroupBtn.remove();
    const section = document.getElementById('charactersSection');

    // Remove any existing group button container in main view
    let oldBtnContainer = document.getElementById('groupUngroupBtnsContainer');
    if (oldBtnContainer) oldBtnContainer.remove();

    if (!currentGroupView && selectedCharIDs.length >= 1) {
        // Create a flex container for the button (for consistent styling)
        const btnContainer = document.createElement('div');
        btnContainer.id = 'groupUngroupBtnsContainer';
        btnContainer.className = 'group-ungroup-btns';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '12px';
        btnContainer.style.justifyContent = 'flex-end';
        btnContainer.style.margin = '24px 0 0 0';

        // Create the group button
        groupBtn = document.createElement('button');
        groupBtn.id = 'groupCharactersBtn';
        groupBtn.textContent = 'Group';
        groupBtn.className = 'character-group-ungroup-float-btn';
        groupBtn.style.margin = '0 8px 0 0';
        groupBtn.onclick = async () => {
            const allGroups = Array.from(new Set(allCharacters.map(c => c.group).filter(Boolean)));
            showGroupSelectionPopup(allGroups, async (groupName, isNew) => {
                await fetch('http://localhost:3000/api/group-pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ charIDs: selectedCharIDs, group: groupName, pin: true })
                });
                selectedCharIDs = [];
                lastSelectedIndex = null;
                loadCharacters();
            });
        };

        btnContainer.appendChild(groupBtn);
        section.appendChild(btnContainer);
    } else if (groupBtn) {
        groupBtn.remove();
    }
    // Ensure hover animation works in main view
    setupCharacterImageHoverAnimation();
}

// --- Edit Popup Logic ---
function showEditPopup(character) {
    // Remove any existing popup
    let existing = document.getElementById('characterEditPopup');
    if (existing) existing.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'characterEditPopup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '9999';
    popup.style.backdropFilter = 'blur(10px)';

    popup.innerHTML = `
        <div class="edit-popup-inner">
            <h2>Edit Character</h2>
            <textarea id="characterEditText" rows="5" placeholder="Describe your update..."></textarea>
            <div class="edit-popup-actions">
                <button id="characterEditCancel">Cancel</button>
                <button id="characterEditSend">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Close/cancel logic
    function closePopup() {
        popup.remove();
    }
    popup.querySelector('#characterEditCancel').onclick = closePopup;

    // Close when clicking outside the popup inner
    popup.addEventListener('mousedown', function(e) {
        if (e.target === popup) closePopup();
    });

    // Send logic
    popup.querySelector('#characterEditSend').onclick = async function () {
        const updateText = popup.querySelector('#characterEditText').value.trim();
        if (!updateText) {
            popup.querySelector('#characterEditText').focus();
            return;
        }
        // Prepare payload: add to "updates" array
        const savePayload = {
            charID: character.charID,
            update: updateText
        };
        try {
            await fetch('http://localhost:3000/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload)
            });
            closePopup();
            alert('Update sent!');
            // Optionally reload characters to reflect update
            loadCharacters();
        } catch (err) {
            alert('Error saving update.');
        }
    };
}

// --- Character Preview Modal Logic ---
function showCharacterPreview(character) {
    // Remove any existing preview modal
    let existing = document.getElementById('characterPreviewModal');
    if (existing) existing.remove();

    // Prepare images
    const images = [];
    if (character.front_link) images.push(character.front_link);
    if (character.back_link) images.push(character.back_link);
    if (character.side_link) images.push(character.side_link);

    let currentImg = 0;

    // Modal HTML
    const modal = document.createElement('div');
    modal.id = 'characterPreviewModal';
    modal.className = 'character-preview-modal-overlay';
    modal.innerHTML = `
        <div class="character-preview-modal">
            <button id="closeCharacterPreview" class="character-preview-close">&times;</button>
            <div style="display:flex;flex-direction:column;align-items:center;">
                <div class="character-preview-image-container">
                    <button id="prevImgBtn" class="character-preview-img-btn prev" style="display:${images.length>1?'block':'none'};">&#8592;</button>
                    <img id="previewImg" src="${images[0]||''}" class="character-preview-img">
                    <button id="nextImgBtn" class="character-preview-img-btn next" style="display:${images.length>1?'block':'none'};">&#8594;</button>
                    <div class="character-preview-img-count">${images.length}</div>
                </div>
                <div style="width:100%;margin-top:18px;">
                    <div style="font-size:1.2rem;font-weight:700;color:#b6c2d1;">${character.charID||''}</div>
                    <div style="font-size:0.95rem;color:#b6c2d1;opacity:0.7;margin-bottom:8px;">${character.creationTime ? (new Date(character.creationTime)).toLocaleString() : ''}</div>
                    <div style="font-size:1.05rem;margin:10px 0 6px 0;font-weight:600;">Prompt:</div>
                    <div style="font-size:1rem;line-height:1.5;background:#232a3a;padding:10px 12px;border-radius:10px;word-break:break-word;">${character.prompt||''}</div>
                    <button id="characterPreviewEditBtn" class="character-preview-edit-btn">Edit</button>
                    <div id="characterUpdatesSection" style="margin-top:18px;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close logic
    modal.querySelector('#closeCharacterPreview').onclick = () => modal.remove();
    // Close when clicking outside modal content
    modal.addEventListener('mousedown', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Image navigation
    const previewImg = modal.querySelector('#previewImg');
    if (images.length > 1) {
        modal.querySelector('#prevImgBtn').onclick = (e) => {
            e.stopPropagation();
            currentImg = (currentImg - 1 + images.length) % images.length;
            previewImg.src = images[currentImg];
        };
        modal.querySelector('#nextImgBtn').onclick = (e) => {
            e.stopPropagation();
            currentImg = (currentImg + 1) % images.length;
            previewImg.src = images[currentImg];
        };
        // Optional: swipe support for mobile
        let startX = null;
        previewImg.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        previewImg.addEventListener('touchend', (e) => {
            if (startX === null) return;
            let endX = e.changedTouches[0].clientX;
            if (endX - startX > 40) {
                // swipe right
                currentImg = (currentImg - 1 + images.length) % images.length;
                previewImg.src = images[currentImg];
            } else if (startX - endX > 40) {
                // swipe left
                currentImg = (currentImg + 1) % images.length;
                previewImg.src = images[currentImg];
            }
            startX = null;
        });
    }

    // Edit button logic (reuse showEditPopup, reload updates after send)
    modal.querySelector('#characterPreviewEditBtn').onclick = () => {
        showEditPopup(character, refreshUpdates);
    };

    // Fetch and show updates
    const updatesSection = modal.querySelector('#characterUpdatesSection');
    updatesSection.innerHTML = '<div style="font-size:1.05rem;font-weight:600;margin-bottom:6px;">Updates:</div><div>Loading...</div>';

    function renderUpdatesList(updates) {
        if (Array.isArray(updates) && updates.length) {
            let html = '<div style="font-size:1.05rem;font-weight:600;margin-bottom:6px;">Updates:</div>';
            html += updates.map((u, idx) => {
                const status = u.status || 'Unseen';
                return `<div style="background:#232a3a;padding:8px 10px;margin-bottom:7px;border-radius:8px;font-size:0.98rem;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                    <div style="flex:1;">
                        ${u.text ? u.text : ''}
                        <div style='font-size:0.85rem;color:#b6c2d1;opacity:0.7;margin-top:2px;'>Status: ${status}</div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="update-delete-btn" data-idx="${idx}" style="background:#b91c1c;border:none;color:#fff;cursor:pointer;padding:2px 8px;font-size:0.92em;border-radius:5px;min-width:36px;">Delete</button>
                    </div>
                </div>`;
            }).join('');
            updatesSection.innerHTML = html;

            // Add event listeners for Delete buttons
            updatesSection.querySelectorAll('.update-delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const idx = parseInt(btn.getAttribute('data-idx'), 10);
                    if (!confirm('Delete this update?')) return;
                    await fetch('http://localhost:3000/update', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ charID: character.charID, idx })
                    });
                    refreshUpdates();
                    e.stopPropagation();
                });
            });
        } else {
            updatesSection.innerHTML = '<div style="font-size:1.05rem;font-weight:600;margin-bottom:6px;">Updates:</div><div style="color:#b6c2d1;opacity:0.7;">No updates yet.</div>';
        }
    }

    function refreshUpdates() {
        fetch(`http://localhost:3000/api/updates?charID=${encodeURIComponent(character.charID)}`)
            .then(res => res.json())
            .then(renderUpdatesList)
            .catch(() => {
                updatesSection.innerHTML = '<div style="font-size:1.05rem;font-weight:600;margin-bottom:6px;">Updates:</div><div style="color:#b6c2d1;opacity:0.7;">No updates found.</div>';
            });
    }
    refreshUpdates();
}

function loadCharacters() {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '<p>Loading...</p>';

    fetch('http://localhost:3000/api/data')
        .then(res => res.json())
        .then(data => {
            allCharacters = data || [];
            renderCharacters(allCharacters);
        });
}

// Add search event listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('characterSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderCharacters(allCharacters);
        });
    }
});

// Optional: Call this when the section is shown
window.showCharactersSection = loadCharacters;

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        // Select all visible
        const visible = Array.from(document.querySelectorAll('.character-card:not(.group-card)'));
        selectedCharIDs = visible.map(card => card.querySelector('.character-name').textContent.trim());
        renderCharacters(allCharacters);
        e.preventDefault();
    }
    if (e.key === 'Escape') {
        selectedCharIDs = [];
        lastSelectedIndex = null;
        renderCharacters(allCharacters);
    }
});

// --- Loading Indicator and Empty State ---
function showCharacterLoading() {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '<div style="text-align:center;padding:48px 0;font-size:1.3rem;color:#3b82f6;">Loading characters...</div>';
}
function showCharacterEmpty() {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '<div style="text-align:center;padding:48px 0;font-size:1.2rem;color:#b6c2d1;">No characters found.<br><span style="font-size:2.5rem;">🫥</span></div>';
}

// --- Quick Actions on Card Hover ---
function addCardQuickActions(div, item) {
    const actions = document.createElement('div');
    actions.className = 'character-card-actions';
    actions.style.position = 'absolute';
    actions.style.top = '8px';
    actions.style.left = '8px';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.zIndex = '30';
    actions.innerHTML = `
        <button class="card-action-btn" title="Preview">👁️</button>
        <button class="card-action-btn" title="Edit">✏️</button>
        <button class="card-action-btn" title="Delete">🗑️</button>
    `;
    actions.querySelectorAll('.card-action-btn')[0].onclick = (e) => { e.stopPropagation(); showCharacterPreview(item); };
    actions.querySelectorAll('.card-action-btn')[1].onclick = (e) => { e.stopPropagation(); showEditPopup(item); };
    actions.querySelectorAll('.card-action-btn')[2].onclick = async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this character?')) return;
        await fetch('http://localhost:3000/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ charIDs: [item.charID] })
        });
        loadCharacters();
    };
    div.appendChild(actions);
    div.onmouseenter = () => { actions.style.opacity = '1'; };
    div.onmouseleave = () => { actions.style.opacity = '0'; };
    actions.style.opacity = '0';
}

// --- Hover Animation for Character Images ---
function setupCharacterImageHoverAnimation() {
    document.querySelectorAll('.character-card .character-images').forEach(container => {
        const imgs = Array.from(container.querySelectorAll('img'));
        if (imgs.length <= 1) return;
        let current = 0;
        let interval = null;

        container.addEventListener('mouseenter', () => {
            interval = setInterval(() => {
                const prev = current;
                imgs[prev].classList.remove('visible');
                imgs[prev].classList.remove('animating-in');
                current = (current + 1) % imgs.length;
                const nextImg = imgs[current];
                nextImg.classList.add('animating-in');
                const onAnimEnd = () => {
                    nextImg.classList.remove('animating-in');
                    nextImg.classList.add('visible');
                    nextImg.removeEventListener('animationend', onAnimEnd);
                };
                nextImg.addEventListener('animationend', onAnimEnd);
            }, 900);
        });
        container.addEventListener('mouseleave', () => {
            clearInterval(interval);
            imgs.forEach((img, idx) => {
                img.classList.remove('animating-in');
                img.classList.toggle('visible', idx === 0);
            });
            current = 0;
        });
    });
}

// --- Group Selection Popup ---
function showGroupSelectionPopup(existingGroups, onConfirm) {
    // Remove any existing popup
    let existing = document.getElementById('groupSelectionPopup');
    if (existing) existing.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'groupSelectionPopup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '9999';
    popup.style.backdropFilter = 'blur(10px)';

    // Popup inner
    const inner = document.createElement('div');
    inner.style.background = 'var(--secondary-bg-dark, #181e2a)';
    inner.style.color = 'var(--text-color, #e2e8f0)';
    inner.style.padding = '1.2rem 1.2rem 1.2rem 1.2rem';
    inner.style.borderRadius = '18px';
    inner.style.maxWidth = '420px';
    inner.style.width = '100%';
    inner.style.position = 'relative';
    inner.style.border = '0.5px solid #ffffff1c';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    inner.style.gap = '1rem';

    inner.innerHTML = `
        <h2 style="margin:0 0 0.5rem 0;font-size:1.3rem;font-weight:700;color:var(--accent-color,#3b82f6);letter-spacing:0.5px;">Select Group</h2>
        <input type="text" id="groupSearchInput" placeholder="Search or enter new group name..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #2d3748;background:rgba(15,23,42,0.799);color:var(--text-color,#e2e8f0);font-size:1rem;">
        <div id="groupListContainer" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;">
            <button id="newGroupBtn" style="display:none;background:linear-gradient(90deg,#3b82f6 60%,#2563eb 100%);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:1rem;font-weight:600;cursor:pointer;">New Group</button>
            <button id="confirmGroupBtn" style="background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:1rem;font-weight:600;cursor:pointer;" disabled>Confirm</button>
            <button id="cancelGroupBtn" style="background:transparent;color:var(--accent-color,#3b82f6);border:1.5px solid var(--accent-color,#3b82f6);border-radius:10px;padding:8px 18px;font-size:1rem;font-weight:600;cursor:pointer;">Cancel</button>
        </div>
    `;
    popup.appendChild(inner);
    document.body.appendChild(popup);

    // State
    let filteredGroups = existingGroups.slice();
    let selectedGroup = null;
    let searchValue = '';

    const groupListContainer = inner.querySelector('#groupListContainer');
    const groupSearchInput = inner.querySelector('#groupSearchInput');
    const newGroupBtn = inner.querySelector('#newGroupBtn');
    const confirmGroupBtn = inner.querySelector('#confirmGroupBtn');
    const cancelGroupBtn = inner.querySelector('#cancelGroupBtn');

    function renderGroupList() {
        groupListContainer.innerHTML = '';
        filteredGroups.forEach(group => {
            const div = document.createElement('div');
            div.textContent = group;
            div.style.padding = '8px 12px';
            div.style.borderRadius = '8px';
            div.style.background = selectedGroup === group ? '#3b82f6' : '#232a3a';
            div.style.color = selectedGroup === group ? '#fff' : '#e2e8f0';
            div.style.cursor = 'pointer';
            div.style.fontWeight = selectedGroup === group ? '700' : '400';
            div.addEventListener('click', () => {
                selectedGroup = group;
                renderGroupList();
                confirmGroupBtn.disabled = false;
            });
            groupListContainer.appendChild(div);
        });
    }
    renderGroupList();

    groupSearchInput.addEventListener('input', () => {
        searchValue = groupSearchInput.value.trim();
        filteredGroups = existingGroups.filter(g => g.toLowerCase().includes(searchValue.toLowerCase()));
        renderGroupList();
        // Show New Group button if no group matches and input is not empty
        if (searchValue && !existingGroups.some(g => g.toLowerCase() === searchValue.toLowerCase())) {
            newGroupBtn.style.display = 'inline-block';
            confirmGroupBtn.disabled = true;
            selectedGroup = null;
        } else {
            newGroupBtn.style.display = 'none';
            confirmGroupBtn.disabled = !selectedGroup;
        }
    });

    newGroupBtn.addEventListener('click', () => {
        if (searchValue) {
            onConfirm(searchValue, true);
            popup.remove();
        }
    });
    confirmGroupBtn.addEventListener('click', () => {
        if (selectedGroup) {
            onConfirm(selectedGroup, false);
            popup.remove();
        }
    });
    cancelGroupBtn.addEventListener('click', () => {
        popup.remove();
    });
    // Close when clicking outside
    popup.addEventListener('mousedown', function(e) {
        if (e.target === popup) popup.remove();
    });
}

// --- Integrate Top Bar, Loading, Empty State, and Quick Actions ---
// In renderCharacters, call renderCharacterTopBar(filtered, groupMode) at the top, showCharacterLoading() when loading, showCharacterEmpty() if no results, and addCardQuickActions to each card.

// --- Update dropdowns on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // Update dropdown options for better UX
    const sortDropdown = document.getElementById('characterSortDropdown');
    if (sortDropdown) {
        sortDropdown.innerHTML = `
            <option value="">Sort by...</option>
            <option value="alpha_az">Alphabetical (A–Z)</option>
            <option value="alpha_za">Alphabetical (Z–A)</option>
            <option value="date_new">Newest First</option>
            <option value="date_old">Oldest First</option>
            <option value="date_updated">Most Recently Updated</option>
        `;
    }
    const filterDropdown = document.getElementById('characterFilterDropdown');
    if (filterDropdown) {
        filterDropdown.innerHTML = `
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
            <option value="1y">Past Year</option>
            <option value="too_old">Too Old (&gt; 1 year)</option>
        `;
    }
    const searchInput = document.getElementById('characterSearch');
    if (searchInput) searchInput.addEventListener('input', () => renderCharacters(allCharacters));
    if (sortDropdown) sortDropdown.addEventListener('change', () => renderCharacters(allCharacters));
    if (filterDropdown) filterDropdown.addEventListener('change', () => renderCharacters(allCharacters));
});
