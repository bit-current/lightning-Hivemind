// Supported file types configuration
const fileTypes = {
    'Text': {
        extensions: ['.txt', '.csv', '.json', '.jsonl', '.md', '.xml'],
        icon: 'fa-file-lines',
        iconClass: 'text'
    },
    'Document': {
        extensions: ['.pdf', '.doc', '.docx', '.rtf'],
        icon: 'fa-file-pdf',
        iconClass: 'document'
    },
    'Spreadsheet': {
        extensions: ['.xls', '.xlsx', '.tsv'],
        icon: 'fa-file-excel',
        iconClass: 'spreadsheet'
    },
    'Image': {
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
        icon: 'fa-file-image',
        iconClass: 'image'
    },
    'Code': {
        extensions: ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs', '.html', '.css'],
        icon: 'fa-file-code',
        iconClass: 'code'
    },
    'Unsupported': {
        extensions: [],
        icon: 'fa-file-circle-xmark',
        iconClass: 'unsupported'
    }
};

// Store uploaded files
let uploadedFiles = {};

// DOM Elements
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const fileTypeSections = document.getElementById('file-type-sections');
const progressBar = document.getElementById('progress');
const progressPercent = document.getElementById('progress-percent');
const progressContainer = document.getElementById('progress-container');
const submitBtn = document.getElementById('submit-btn');

// Initialize file type sections
function initFileTypeSections() {
    for (const [type, config] of Object.entries(fileTypes)) {
        const card = document.createElement('div');
        card.className = `file-type-card ${config.iconClass}`;
        card.id = `${type.toLowerCase()}-card`;

        const formatsText = type === 'Unsupported'
            ? 'Files we cannot process'
            : config.extensions.join(', ');

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon ${config.iconClass}">
                    <i class="fas ${config.icon}"></i>
                </div>
                <span class="card-title">${type}</span>
            </div>
            <div class="card-formats">${formatsText}</div>
            <ul id="${type.toLowerCase()}-file-list" class="file-list"></ul>
            <div class="file-count" id="${type.toLowerCase()}-count"></div>
        `;
        fileTypeSections.appendChild(card);
        uploadedFiles[type] = [];
    }
}

// Get file type from extension
function getFileType(fileName) {
    const ext = '.' + fileName.split('.').pop().toLowerCase();
    for (const [type, config] of Object.entries(fileTypes)) {
        if (config.extensions.includes(ext)) return type;
    }
    return 'Unsupported';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Clear all file lists
function clearFileLists() {
    for (const type of Object.keys(fileTypes)) {
        document.getElementById(`${type.toLowerCase()}-file-list`).innerHTML = '';
        document.getElementById(`${type.toLowerCase()}-count`).textContent = '';
        document.getElementById(`${type.toLowerCase()}-card`).classList.remove('has-files');
        uploadedFiles[type] = [];
    }
}

// Handle files from input or drop
function handleFiles(files) {
    clearFileLists();
    let unsupportedCount = 0;
    let supportedCount = 0;

    [...files].forEach(file => {
        const fileType = getFileType(file.name);
        uploadedFiles[fileType].push(file);

        const listElement = document.getElementById(`${fileType.toLowerCase()}-file-list`);
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        `;
        listElement.appendChild(li);

        if (fileType === 'Unsupported') {
            unsupportedCount++;
        } else {
            supportedCount++;
        }
    });

    // Update counts and card states
    for (const type of Object.keys(fileTypes)) {
        const count = uploadedFiles[type].length;
        const countElement = document.getElementById(`${type.toLowerCase()}-count`);
        const cardElement = document.getElementById(`${type.toLowerCase()}-card`);

        if (count > 0) {
            countElement.textContent = `${count} file${count > 1 ? 's' : ''} selected`;
            cardElement.classList.add('has-files');
        }
    }

    // Show warning for unsupported files
    if (unsupportedCount > 0) {
        showError(`${unsupportedCount} unsupported file${unsupportedCount > 1 ? 's' : ''} detected. These will be skipped during processing.`);
    }

    // Enable/disable submit button
    submitBtn.disabled = supportedCount === 0;
}

// Show error message
function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Simulate upload progress
function simulateUpload() {
    submitBtn.disabled = true;
    progressContainer.style.display = 'block';

    let progress = 0;
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressContainer.style.display = 'none';
                showSuccess('Upload completed successfully! Your data is ready for fine-tuning.');
                submitBtn.disabled = false;
            }, 500);
        }
    }, 150);
}

// Event Listeners
initFileTypeSections();

// Upload button click
uploadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// Upload zone click
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('dragover');
    });
});

uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
});

// Submit button click
submitBtn.addEventListener('click', simulateUpload);
