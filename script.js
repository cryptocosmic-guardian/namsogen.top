document.addEventListener('DOMContentLoaded', function() {
    // App Download Menu Functionality - Enhanced
    const downloadMenuBtn = document.getElementById('downloadMenuBtn');
    const downloadMenu = document.getElementById('downloadMenu');
    
    if (downloadMenuBtn && downloadMenu) {
        downloadMenuBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event from bubbling
            downloadMenu.classList.toggle('active');
        });
        
        // Close the menu when clicking outside
        document.addEventListener('click', function(event) {
            if (downloadMenu && !downloadMenuBtn.contains(event.target) && !downloadMenu.contains(event.target)) {
                downloadMenu.classList.remove('active');
            }
        });

        // Prevent menu from closing when clicking inside the menu
        downloadMenu.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Clear status
            clearStatus();
        });
    });
    
    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the password input within the same form group
            const passwordInput = this.closest('.form-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // File upload handling - Encrypt
    const encryptDropArea = document.getElementById('encrypt-drop-area');
    const encryptFileInput = document.getElementById('encrypt-file-input');
    const encryptFileName = document.getElementById('encrypt-file-name');
    const encryptPassword = document.getElementById('encrypt-password');
    const encryptConfirmPassword = document.getElementById('encrypt-confirm-password');
    const encryptButton = document.getElementById('encrypt-button');
    
    // File upload handling - Decrypt
    const decryptDropArea = document.getElementById('decrypt-drop-area');
    const decryptFileInput = document.getElementById('decrypt-file-input');
    const decryptFileName = document.getElementById('decrypt-file-name');
    const decryptPassword = document.getElementById('decrypt-password');
    const decryptButton = document.getElementById('decrypt-button');
    
    // Status display
    const statusElement = document.getElementById('status');
    
    // Animations
    const encryptAnimation = document.getElementById('encrypt-animation');
    const decryptAnimation = document.getElementById('decrypt-animation');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        encryptDropArea.addEventListener(eventName, preventDefaults, false);
        decryptDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when dragging file over it
    ['dragenter', 'dragover'].forEach(eventName => {
        encryptDropArea.addEventListener(eventName, highlight, false);
        decryptDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        encryptDropArea.addEventListener(eventName, unhighlight, false);
        decryptDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    }
    
    function unhighlight(e) {
        this.style.borderColor = '';
        this.style.backgroundColor = '';
    }
    
    // Handle dropped files
    encryptDropArea.addEventListener('drop', handleEncryptDrop, false);
    decryptDropArea.addEventListener('drop', handleDecryptDrop, false);
    
    function handleEncryptDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleEncryptFiles(files);
    }
    
    function handleDecryptDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleDecryptFiles(files);
    }
    
    // Setup click to select files
    encryptDropArea.addEventListener('click', () => encryptFileInput.click());
    decryptDropArea.addEventListener('click', () => decryptFileInput.click());
    
    encryptFileInput.addEventListener('change', () => {
        handleEncryptFiles(encryptFileInput.files);
    });
    
    decryptFileInput.addEventListener('change', () => {
        handleDecryptFiles(decryptFileInput.files);
    });
    
    function handleEncryptFiles(files) {
        if (files.length > 0) {
            encryptFileName.textContent = `Selected: ${files[0].name}`;
            checkEncryptEnabled();
        }
    }
    
    function handleDecryptFiles(files) {
        if (files.length > 0) {
            checkDecryptEnabled();
        }
    }
    
    // Password confirmation and validation
    function checkPasswordMatch() {
        const passwordVal = encryptPassword.value.trim();
        const confirmVal = encryptConfirmPassword.value.trim();
        
        if (passwordVal && confirmVal) {
            if (passwordVal !== confirmVal) {
                // Add visual indication that passwords don't match
                encryptConfirmPassword.classList.add('password-mismatch');
                encryptPassword.classList.add('password-mismatch');
                return false;
            } else {
                // Remove mismatch class if passwords match
                encryptConfirmPassword.classList.remove('password-mismatch');
                encryptPassword.classList.remove('password-mismatch');
                return true;
            }
        }
        return false;
    }

    encryptPassword.addEventListener('input', checkEncryptEnabled);
    encryptConfirmPassword.addEventListener('input', function() {
        checkPasswordMatch();
        checkEncryptEnabled();
    });

    function checkEncryptEnabled() {
        const hasFile = encryptFileInput.files.length > 0;
        const hasPassword = encryptPassword.value.trim() !== '';
        const passwordsMatch = checkPasswordMatch();
        
        encryptButton.disabled = !(hasFile && hasPassword && passwordsMatch);
    }

    decryptPassword.addEventListener('input', checkDecryptEnabled);
    decryptFileInput.addEventListener('input', checkDecryptEnabled);

    function checkDecryptEnabled() {
        const file = decryptFileInput.files[0];
        const password = decryptPassword.value.trim();
        
        // Update extension check to be more flexible
        const isValidExtension = file && (
            file.name.toLowerCase().endsWith('.encsi') ||
            file.name.toLowerCase().includes('.encsi.') ||
            file.name.toLowerCase().includes('.encsi')
        );
        
        decryptButton.disabled = !(file && password && isValidExtension);

        // Add visual feedback for invalid extension
        if (file && !isValidExtension) {
            decryptFileName.innerHTML = `
                <span style="color: var(--danger-color)">
                    <i class="fas fa-exclamation-triangle"></i> Invalid file. Use .encSI extension
                </span>
            `;
        } else if (file) {
            decryptFileName.textContent = `Selected: ${file.name}`;
        }
    }
    
    // Encryption and decryption
    encryptButton.addEventListener('click', encryptFile);
    decryptButton.addEventListener('click', decryptFile);
    
    function encryptFile() {
        const file = encryptFileInput.files[0];
        const password = encryptPassword.value;
        
        if (!file || !password) return;
        
        // Show animation
        encryptAnimation.style.display = 'flex';
        updateStatus('progress', 'Encrypting file...');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Simulating delay to show animation
                setTimeout(() => {
                    // Convert file content to WordArray
                    const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
                    
                    // Encrypt the content
                    const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
                    
                    // Hide animation
                    encryptAnimation.style.display = 'none';
                    
                    // Show success status with download option
                    updateStatus('success', 'File encrypted successfully! Click below to download.');
                    
                    // Create download button
                    const downloadBtn = document.createElement('button');
                    downloadBtn.textContent = 'Download Encrypted File';
                    downloadBtn.classList.add('action-button', 'download-btn');
                    downloadBtn.addEventListener('click', () => {
                        // Use .enc extension
                        downloadFile(`${file.name}.encSi`, encrypted);
                    });
                    
                    // Append download button to status
                    statusElement.appendChild(downloadBtn);
                }, 1500); // Simulated encryption time
            } catch (error) {
                console.error('Encryption error:', error);
                encryptAnimation.style.display = 'none';
                updateStatus('error', 'Error encrypting file: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            encryptAnimation.style.display = 'none';
            updateStatus('error', 'Error reading file');
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    function decryptFile() {
        const file = decryptFileInput.files[0];
        const password = decryptPassword.value;
        
        if (!file || !password) return;
        
        // Show animation
        decryptAnimation.style.display = 'flex';
        updateStatus('progress', 'Decrypting file...');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Simulating delay to show animation
                setTimeout(() => {
                    // Read the encrypted content
                    const encryptedText = e.target.result;
                    
                    // Decrypt the content
                    const decrypted = CryptoJS.AES.decrypt(encryptedText, password);
                    
                    // Check if decryption was successful
                    const decryptedBytes = decrypted.sigBytes;
                    if (decryptedBytes <= 0) {
                        // Decryption failed - likely incorrect password
                        decryptAnimation.style.display = 'none';
                        
                        // Create a more prominent error message
                        const errorMessage = document.createElement('div');
                        errorMessage.innerHTML = `
                            <div style="background-color: rgba(231, 76, 60, 0.1); 
                                        color: var(--danger-color); 
                                        padding: 15px; 
                                        border-radius: 8px; 
                                        margin-top: 15px; 
                                        text-align: center;">
                                <strong><i class="fas fa-exclamation-triangle"></i> Decryption Failed</strong>
                                <p>The file could not be decrypted. Possible reasons:</p>
                                <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
                                    <li>Incorrect password</li>
                                    <li>File may be corrupted</li>
                                    <li>Wrong encryption method</li>
                                </ul>
                                <p style="margin-top: 10px; font-size: 0.9rem;">
                                    <strong>Important:</strong> If the password is incorrect, the file CANNOT be opened or recovered.
                                </p>
                            </div>
                        `;
                        
                        // Clear previous status and add new error message
                        statusElement.innerHTML = '';
                        statusElement.classList.add('error');
                        statusElement.appendChild(errorMessage);
                        
                        return;
                    }
                    
                    // Convert to ArrayBuffer
                    const wordArray = decrypted;
                    const arrayBuffer = wordArrayToArrayBuffer(wordArray);
                    
                    // Determine original filename and extension
                    let originalName = file.name;
                    
                    // Remove any .encSi variations
                    originalName = originalName.replace(/\.encsi(\.txt)?$/i, '');
                    
                    // Hide animation
                    decryptAnimation.style.display = 'none';
                    
                    // Show success status with download option
                    updateStatus('success', 'File decrypted successfully! Click below to download.');
                    
                    // Create download button
                    const downloadBtn = document.createElement('button');
                    downloadBtn.textContent = 'Download Decrypted File';
                    downloadBtn.classList.add('action-button', 'download-btn');
                    downloadBtn.addEventListener('click', () => {
                        const blob = new Blob([arrayBuffer]);
                        downloadBlob(originalName, blob);
                    });
                    
                    // Append download button to status
                    statusElement.appendChild(downloadBtn);
                }, 1500); // Simulated decryption time
            } catch (error) {
                console.error('Decryption error:', error);
                decryptAnimation.style.display = 'none';
                
                // Create a more detailed error message
                const errorMessage = document.createElement('div');
                errorMessage.innerHTML = `
                    <div style="background-color: rgba(231, 76, 60, 0.1); 
                                color: var(--danger-color); 
                                padding: 15px; 
                                border-radius: 8px; 
                                margin-top: 15px; 
                                text-align: center;">
                        <strong><i class="fas fa-exclamation-triangle"></i> Decryption Error</strong>
                        <p>An unexpected error occurred during decryption.</p>
                        <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
                            <li>Verify the file is correctly encrypted</li>
                            <li>Check the password</li>
                            <li>Ensure file integrity</li>
                        </ul>
                        <p style="margin-top: 10px; font-size: 0.9rem;">
                            <strong>Important:</strong> If the password is incorrect, the file CANNOT be opened or recovered.
                        </p>
                    </div>
                `;
                
                // Clear previous status and add new error message
                statusElement.innerHTML = '';
                statusElement.classList.add('error');
                statusElement.appendChild(errorMessage);
            }
        };
        
        reader.onerror = function() {
            decryptAnimation.style.display = 'none';
            
            // Create a file read error message
            const errorMessage = document.createElement('div');
            errorMessage.innerHTML = `
                <div style="background-color: rgba(231, 76, 60, 0.1); 
                            color: var(--danger-color); 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin-top: 15px; 
                            text-align: center;">
                    <strong><i class="fas fa-exclamation-triangle"></i> File Reading Error</strong>
                    <p>Unable to read the encrypted file.</p>
                    <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
                        <li>Check file format</li>
                        <li>Verify file integrity</li>
                        <li>Ensure file is not corrupted</li>
                    </ul>
                </div>
            `;
            
            // Clear previous status and add new error message
            statusElement.innerHTML = '';
            statusElement.classList.add('error');
            statusElement.appendChild(errorMessage);
        };
        
        reader.readAsText(file);
    }
    
    function wordArrayToArrayBuffer(wordArray) {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;
        
        const u8 = new Uint8Array(sigBytes);
        for (let i = 0; i < sigBytes; i++) {
            const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            u8[i] = byte;
        }
        
        return u8.buffer;
    }
    
    function downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
    function downloadBlob(filename, blob) {
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = filename;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
    }
    
    function updateStatus(type, message) {
        statusElement.textContent = message;
        statusElement.className = 'status';
        statusElement.classList.add(type);
    }
    
    function clearStatus() {
        statusElement.textContent = '';
        statusElement.className = 'status';
    }
});