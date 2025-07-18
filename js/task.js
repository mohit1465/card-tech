// Role definitions with their specific assignments
const roleAssignments = {
    '3d-artist': {
        title: '3D Artist Internship Assignment',
        description: 'Create a detailed 3D model of a futuristic vehicle',
        requirements: [
            'Model should be created using Blender or Maya',
            'Include detailed textures and materials',
            'Provide wireframe and rendered views',
            'Include a short animation showcasing the model',
            'Submit both the source file and rendered images'
        ]
    },
    'graphic-designer': {
        title: 'Graphic Designer Internship Assignment',
        description: 'Design a brand identity for a sustainable fashion brand',
        requirements: [
            'Create a logo design',
            'Design a color palette',
            'Create 3 social media post templates',
            'Design a business card',
            'Include a style guide'
        ]
    },
    'ui-ux': {
        title: 'UI/UX Designer Internship Assignment',
        description: 'Design a mobile app interface for a food delivery service',
        requirements: [
            'Create wireframes for key screens',
            'Design a complete user flow',
            'Include a style guide',
            'Create high-fidelity mockups',
            'Add micro-interactions'
        ]
    },
    'web-developer': {
        title: 'Web Developer Internship Assignment',
        description: 'Build a responsive portfolio website',
        requirements: [
            'Use modern HTML5 and CSS3',
            'Implement responsive design',
            'Add JavaScript interactivity',
            'Optimize for performance',
            'Include a contact form'
        ]
    }
};

// Initialize the task manager
// --- Add variable to store selected character for 3D Artist ---
let selected3DCharacter = null;

document.addEventListener('DOMContentLoaded', function() {
    const taskSection = document.getElementById('taskSection');
    if (!taskSection) return;

    // Create role selection section
    const roleSelection = document.createElement('div');
    roleSelection.className = 'role-selection';
    roleSelection.innerHTML = `
        <h2>Select Your Role</h2>
        <div class="role-grid">
            <div class="role-card" data-role="3d-artist">
                <div class="role-icon">🎨</div>
                <div class="role-title">3D Artist</div>
                <div class="role-description">Create stunning 3D models and animations</div>
            </div>
            <div class="role-card" data-role="graphic-designer">
                <div class="role-icon">🎯</div>
                <div class="role-title">Graphic Designer</div>
                <div class="role-description">Design beautiful visual content</div>
            </div>
            <div class="role-card" data-role="ui-ux">
                <div class="role-icon">💻</div>
                <div class="role-title">UI/UX Designer</div>
                <div class="role-description">Create intuitive user interfaces</div>
            </div>
            <div class="role-card" data-role="web-developer">
                <div class="role-icon">🌐</div>
                <div class="role-title">Web Developer</div>
                <div class="role-description">Build responsive websites</div>
            </div>
        </div>
    `;

    // Create application form
    const applicationForm = document.createElement('div');
    applicationForm.className = 'application-form';
    applicationForm.innerHTML = `
        <h2>Application Details</h2>
        <form id="internshipForm">
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="experience">Years of Experience</label>
                <input type="number" id="experience" class="form-control" min="0" max="10" required>
            </div>
            <div class="form-group">
                <label for="skills">Key Skills</label>
                <textarea id="skills" class="form-control" rows="3" placeholder="List your key skills and tools you're proficient with..." required></textarea>
            </div>
            <div class="portfolio-section">
                <label>Resume/CV</label>
                <div class="portfolio-upload" id="resumeUpload">
                    <div class="upload-icon">📄</div>
                    <p>Click to upload your resume (PDF or DOC)</p>
                    <input type="file" id="resumeFile" accept=".pdf,.doc,.docx" style="display: none;">
                </div>
            </div>
            <br>
            <button type="submit" class="submit-btn">Get Assignment</button>
        </form>
    `;

    // Create assignment section
    const assignmentSection = document.createElement('div');
    assignmentSection.className = 'assignment-section';
    assignmentSection.innerHTML = `
        <div class="assignment-header">
            <h2 class="assignment-title"></h2>
            <p class="assignment-description"></p>
        </div>
        <div class="assignment-requirements">
            <h3>Requirements:</h3>
            <ul class="requirement-list"></ul>
        </div>
        <div class="assignment-actions">
            <button class="submit-btn" id="downloadAssignment">Download Assignment Details</button>
        </div>
    `;

    // Create submission section
    const submissionSection = document.createElement('div');
    submissionSection.className = 'submission-section';
    submissionSection.innerHTML = `
        <h2>Submit Your Assignment</h2>
        <form id="submissionForm">
            <div class="submission-grid">
                <div class="submission-item">
                    <label>Resume/CV</label>
                    <div class="file-upload" id="submissionResume">
                        <div class="upload-icon">📄</div>
                        <p>Upload your resume</p>
                        <input type="file" accept=".pdf,.doc,.docx" style="display: none;">
                    </div>
                </div>
                <div class="submission-item">
                    <label>Assignment Text File</label>
                    <div class="file-upload" id="submissionText">
                        <div class="upload-icon">📝</div>
                        <p>Upload your text file</p>
                        <input type="file" accept=".txt" style="display: none;">
                    </div>
                </div>
                <div class="submission-item">
                    <label>Assignment Files</label>
                    <div class="file-upload" id="submissionFiles">
                        <div class="upload-icon">📦</div>
                        <p>Upload your assignment files</p>
                        <input type="file" accept=".pdf,.zip" style="display: none;">
                    </div>
                </div>
            </div>
            <div class="file-size-info">Maximum file size: 50MB per file</div>
            <button type="submit" class="submit-btn">Submit Assignment</button>
        </form>
    `;

    // Add sections to the task section
    taskSection.appendChild(roleSelection);
    taskSection.appendChild(applicationForm);
    taskSection.appendChild(assignmentSection);
    taskSection.appendChild(submissionSection);

    // Add event listeners
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            roleCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            applicationForm.classList.add('active');
            assignmentSection.classList.remove('active');
        });
    });

    // Handle resume upload
    const resumeUpload = document.getElementById('resumeUpload');
    const resumeFile = document.getElementById('resumeFile');
    
    resumeUpload.addEventListener('click', () => {
        resumeFile.click();
    });

    resumeFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            resumeUpload.innerHTML = `
                <div class="upload-icon">✓</div>
                <p>${e.target.files[0].name}</p>
            `;
        }
    });

    // Handle form submission
    const internshipForm = document.getElementById('internshipForm');
    internshipForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedRole = document.querySelector('.role-card.selected');
        if (!selectedRole) {
            alert('Please select a role first');
            return;
        }

        const role = selectedRole.dataset.role;
        const assignment = roleAssignments[role];

        // --- 3D Artist: fetch and show random character ---
        if (role === '3d-artist') {
            try {
                const res = await fetch('http://localhost:3000/api/data');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Pick a random character
                    const randomIdx = Math.floor(Math.random() * data.length);
                    selected3DCharacter = data[randomIdx];
                } else {
                    selected3DCharacter = null;
                }
            } catch (err) {
                selected3DCharacter = null;
            }
        } else {
            selected3DCharacter = null;
        }

        // Update assignment section
        document.querySelector('.assignment-title').textContent = assignment.title;
        document.querySelector('.assignment-description').textContent = assignment.description;
        
        const requirementsList = document.querySelector('.requirement-list');
        requirementsList.innerHTML = assignment.requirements
            .map(req => `<li>${req}</li>`)
            .join('');

        // --- 3D Artist: show character info in assignment section ---
        if (role === '3d-artist' && selected3DCharacter) {
            // Insert character info below requirements
            let charHtml = `<div class="character-assignment" style="margin-top:24px;">
                <h3>Assigned Character:</h3>
                <div><strong>Name:</strong> ${selected3DCharacter.charID || 'Unnamed'}</div>`;
            // Images
            const images = [];
            if (selected3DCharacter.front_link) images.push({label:'Front',url:selected3DCharacter.front_link});
            if (selected3DCharacter.back_link) images.push({label:'Back',url:selected3DCharacter.back_link});
            if (selected3DCharacter.side_link) images.push({label:'Side',url:selected3DCharacter.side_link});
            if (images.length) {
                charHtml += '<div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap;">';
                images.forEach(img => {
                    charHtml += `<div style='text-align:center;'><img src="${img.url}" alt="${img.label}" style="max-width:120px;max-height:120px;border-radius:10px;display:block;margin-bottom:4px;"><div style='font-size:0.95em;color:#b6c2d1;'>${img.label}</div></div>`;
                });
                charHtml += '</div>';
            }
            charHtml += '</div>';
            // Add to assignment section
            requirementsList.insertAdjacentHTML('afterend', charHtml);
        } else {
            // Remove any previous character-assignment info
            const prev = document.querySelector('.character-assignment');
            if (prev) prev.remove();
        }

        // Show assignment section
        assignmentSection.classList.add('active');
    });

    // Handle assignment download
    const downloadAssignment = document.getElementById('downloadAssignment');
    downloadAssignment.addEventListener('click', function() {
        const selectedRole = document.querySelector('.role-card.selected');
        const role = selectedRole.dataset.role;
        const assignment = roleAssignments[role];
        
        let content = `${assignment.title}\n\n${assignment.description}\n\nRequirements:\n${assignment.requirements.map(req => `- ${req}`).join('\n')}`;
        // --- 3D Artist: add character info to download ---
        if (role === '3d-artist' && selected3DCharacter) {
            content += `\n\nAssigned Character:\nName: ${selected3DCharacter.charID || 'Unnamed'}`;
            const images = [];
            if (selected3DCharacter.front_link) images.push(`Front: ${selected3DCharacter.front_link}`);
            if (selected3DCharacter.back_link) images.push(`Back: ${selected3DCharacter.back_link}`);
            if (selected3DCharacter.side_link) images.push(`Side: ${selected3DCharacter.side_link}`);
            if (images.length) {
                content += `\nImages:`;
                images.forEach(img => {
                    content += `\n- ${img}`;
                });
            }
        }
        // Create and download file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${role}-assignment.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // Handle submission file uploads
    const submissionUploads = document.querySelectorAll('.file-upload');
    submissionUploads.forEach(upload => {
        const input = upload.querySelector('input');
        upload.addEventListener('click', () => input.click());
        
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.size > 50 * 1024 * 1024) { // 50MB
                    alert('File size exceeds 50MB limit');
                    return;
                }
                upload.innerHTML = `
                    <div class="upload-icon">✓</div>
                    <p>${file.name}</p>
                `;
            }
        });
    });

    // Handle submission form
    const submissionForm = document.getElementById('submissionForm');
    submissionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Assignment submitted successfully! We will review your work and get back to you soon.');
    });
});
