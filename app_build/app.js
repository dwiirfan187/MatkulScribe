// TODO: Replace with your actual Gemini API Key for local testing
const API_KEY = "AIzaSyAFGYqFpuR_7m-Q_BEcr89VWbz1c2KKs_s";


// --- UI Translation Dictionary (i18n) ---
const translations = {
    'en': {
        appSubtitle: "AI Study Suite",
        heroTitle: "Transform Lectures to Structured Summaries",
        heroDesc: "Upload your class recordings and let our AI generate comprehensive transcripts, actionable study summaries, deadlines, and key terms in seconds.",
        dropzoneTitle: "Upload your Lecture Audio",
        dropzoneSub: "Drag & drop or click to browse (.mp3, .wav)",
        processBtn: "Process Lecture Audio",
        loadingTitle: "Analyzing lecture with AI...",
        loadingSub: "Transcribing audio and generating study materials.",
        deadlinesTitle: "Deadlines & Reminders",
        conceptsTitle: "Core Concepts Summary",
        glossaryTitle: "Lecture Glossary",
        transcriptTitle: "Full Lecture Transcript",
        copyBtnText: "Copy Transcript",
        copiedText: "Copied! ✓",

        // Dynamic & Dynamic Feedback Text
        selectedFileText: "Selected: ",
        errInvalidFile: "Please upload a valid audio file (.mp3 or .wav).",
        errNoFile: "Please select a lecture audio file first.",
        errNoApiKey: "Please set your Gemini API Key in app.js.",
        errApiFail: "An unexpected error occurred while processing the audio.",
        errCopyFail: "Failed to copy transcript to clipboard."
    },
    'id': {
        appSubtitle: "Suite Belajar AI",
        heroTitle: "Ubah Perkuliahan Menjadi Ringkasan Terstruktur",
        heroDesc: "Unggah rekaman kelas Anda dan biarkan AI kami menghasilkan transkrip lengkap, ringkasan belajar yang dapat ditindaklanjuti, tenggat waktu, dan istilah penting dalam hitungan detik.",
        dropzoneTitle: "Unggah Audio Kuliah Anda",
        dropzoneSub: "Seret & lepas atau klik untuk mencari (.mp3, .wav)",
        processBtn: "Proses Audio Kuliah",
        loadingTitle: "Menganalisis kuliah dengan AI...",
        loadingSub: "Mentranskripsikan audio dan membuat materi pembelajaran.",
        deadlinesTitle: "Tenggat Waktu & Pengingat",
        conceptsTitle: "Ringkasan Konsep Inti",
        glossaryTitle: "Glosarium Kuliah",
        transcriptTitle: "Transkrip Lengkap Kuliah",
        copyBtnText: "Salin Transkrip",
        copiedText: "Tersalin! ✓",

        // Dynamic & Dynamic Feedback Text
        selectedFileText: "Dipilih: ",
        errInvalidFile: "Harap unggah file audio yang valid (.mp3 atau .wav).",
        errNoFile: "Harap pilih file audio kuliah terlebih dahulu.",
        errNoApiKey: "Harap atur Gemini API Key Anda di app.js.",
        errApiFail: "Terjadi kesalahan tidak terduga saat memproses audio.",
        errCopyFail: "Gagal menyalin transkrip ke papan klip."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const audioInput = document.getElementById('audioInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const processBtn = document.getElementById('processBtn');

    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    const keyPointsList = document.getElementById('keyPointsList');
    const transcriptText = document.getElementById('transcriptText');
    const deadlinesContainer = document.getElementById('deadlinesContainer');
    const deadlinesList = document.getElementById('deadlinesList');
    const outputLanguage = document.getElementById('outputLanguage');
    const copyTranscriptBtn = document.getElementById('copyTranscriptBtn');
    const copyBtnText = document.getElementById('copyBtnText');

    const glossaryContainer = document.getElementById('glossaryContainer');
    const glossaryList = document.getElementById('glossaryList');

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');

    let selectedFile = null;

    // --- Theme Toggle Logic ---
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeToggleIcon) {
                themeToggleIcon.className = 'fas fa-sun text-lg text-amber-500';
            }
        } else {
            document.documentElement.classList.remove('dark');
            if (themeToggleIcon) {
                themeToggleIcon.className = 'fas fa-moon text-lg';
            }
        }
    }

    // Initial Theme load
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- UI Localization (i18n) Logic ---
    function getTranslation(key) {
        const langVal = outputLanguage.value;
        const lang = langVal === 'Bahasa Indonesia' ? 'id' : 'en';
        return translations[lang][key] || key;
    }

    function updateUILanguage(langVal) {
        const lang = langVal === 'Bahasa Indonesia' ? 'id' : 'en';
        const t = translations[lang];

        // Loop through all elements with data-i18n attribute and update content
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (t[key]) {
                element.textContent = t[key];
            }
        });

        // Update active selection file text if one has been selected
        if (selectedFile) {
            fileNameDisplay.textContent = `${t.selectedFileText}${selectedFile.name}`;
        }
    }

    // Load initial language preference
    const savedLanguage = localStorage.getItem('language') || 'English';
    outputLanguage.value = savedLanguage;
    updateUILanguage(savedLanguage);

    // Event listener for language changes
    outputLanguage.addEventListener('change', () => {
        const lang = outputLanguage.value;
        updateUILanguage(lang);
        localStorage.setItem('language', lang);
    });

    // --- Drag and Drop Logic ---
    dropzone.addEventListener('click', () => audioInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-400', 'bg-indigo-50/20', 'dark:border-indigo-500', 'dark:bg-indigo-950/20');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-indigo-400', 'bg-indigo-50/20', 'dark:border-indigo-500', 'dark:bg-indigo-950/20');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-400', 'bg-indigo-50/20', 'dark:border-indigo-500', 'dark:bg-indigo-950/20');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    audioInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        if (!file.type.startsWith('audio/')) {
            showError(getTranslation('errInvalidFile'));
            return;
        }
        selectedFile = file;
        fileNameDisplay.textContent = `${getTranslation('selectedFileText')}${file.name}`;
        fileNameDisplay.classList.remove('hidden');
        hideError();
    }

    // --- File Processing ---
    processBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError(getTranslation('errNoFile'));
            return;
        }

        if (API_KEY === "YOUR_API_KEY_HERE" || API_KEY === "") {
            showError(getTranslation('errNoApiKey'));
            return;
        }

        // Reset UI State
        hideError();
        resultsContainer.classList.add('hidden');
        loadingState.classList.remove('hidden');
        processBtn.disabled = true;

        try {
            const base64Data = await readFileAsBase64(selectedFile);

            // Clean up the base64 string (remove data URL prefix)
            const base64Audio = base64Data.split(',')[1];
            const mimeType = selectedFile.type || 'audio/mp3';

            const payload = {
                contents: [{
                    parts: [
                        {
                            text: `Act as a Brilliant University Class Assistant. Listen to the provided lecture audio file. You MUST strictly return your response as a valid JSON object with exactly four keys. 'transcript': a string containing the full transcription of what the lecturer said. 'lectureSummary': an array of bullet points summarizing the core academic concepts taught. 'deadlinesAndReminders': an array of any homework, tasks, quiz announcements, or exam reminders mentioned (if none, return an empty array). 'aiGlossary': an array of objects representing key academic, technical, or complex terms used in the lecture and their student-friendly definitions, where each object has exactly two keys: 'term' and 'definition' (if none, return an empty array). You MUST generate the entire JSON response (transcript, lectureSummary, deadlinesAndReminders, and aiGlossary) STRICTLY in ${outputLanguage.value}. Return pure JSON only. Do not use markdown code blocks. STRICTLY DO NOT leave trailing commas in arrays or objects.`
                        },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Audio
                            }
                        }
                    ]
                }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            // Extract the text response
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new Error("Invalid response format from Gemini API.");
            }

            // Parse the JSON. 
            let cleanJsonStr = textResponse.trim();

            // Remove markdown code block syntax
            if (cleanJsonStr.startsWith('```')) {
                cleanJsonStr = cleanJsonStr.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
            }

            // Remove trailing commas before closing brackets/braces using regex
            cleanJsonStr = cleanJsonStr.replace(/,\s*([}\]])/g, '$1');

            const parsedResult = JSON.parse(cleanJsonStr);

            if (!parsedResult.transcript || !parsedResult.lectureSummary) {
                throw new Error("The API did not return the expected JSON structure.");
            }

            renderResults(
                parsedResult.transcript,
                parsedResult.lectureSummary,
                parsedResult.deadlinesAndReminders || [],
                parsedResult.aiGlossary || []
            );

        } catch (error) {
            console.error("Processing Error:", error);
            showError(error.message || getTranslation('errApiFail'));
        } finally {
            loadingState.classList.add('hidden');
            processBtn.disabled = false;
        }
    });

    // --- Helpers ---
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function hideError() {
        errorContainer.classList.add('hidden');
        errorMessage.textContent = '';
    }

    function renderResults(transcript, lectureSummary, deadlinesAndReminders, aiGlossary) {
        // Clear previous
        keyPointsList.innerHTML = '';
        deadlinesList.innerHTML = '';
        glossaryList.innerHTML = '';

        // Add core concepts
        lectureSummary.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            keyPointsList.appendChild(li);
        });

        // Add Deadlines
        if (deadlinesAndReminders && deadlinesAndReminders.length > 0) {
            deadlinesContainer.classList.remove('hidden');
            deadlinesAndReminders.forEach(reminder => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-exclamation-triangle text-amber-500 mr-2.5"></i> <span>${reminder}</span>`;
                li.classList.add('flex', 'items-start', 'gap-1');
                deadlinesList.appendChild(li);
            });
        } else {
            deadlinesContainer.classList.add('hidden');
        }

        // Add Glossary
        if (aiGlossary && aiGlossary.length > 0) {
            glossaryContainer.classList.remove('hidden');
            aiGlossary.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = `${index > 0 ? 'pt-4 border-t border-slate-100 dark:border-slate-800' : ''} pb-1`;

                const dt = document.createElement('dt');
                dt.className = 'font-bold text-slate-900 dark:text-slate-200 text-sm mb-1.5';
                dt.textContent = item.term;

                const dd = document.createElement('dd');
                dd.className = 'text-slate-600 dark:text-slate-400 text-sm leading-relaxed';
                dd.textContent = item.definition;

                div.appendChild(dt);
                div.appendChild(dd);
                glossaryList.appendChild(div);
            });
        } else {
            glossaryContainer.classList.add('hidden');
        }

        // Add transcript
        transcriptText.textContent = transcript;

        // Show results
        resultsContainer.classList.remove('hidden');
    }

    // --- Copy to Clipboard ---
    copyTranscriptBtn.addEventListener('click', async () => {
        if (!transcriptText.textContent) return;

        try {
            await navigator.clipboard.writeText(transcriptText.textContent);
            const originalText = copyBtnText.textContent;
            copyBtnText.textContent = getTranslation('copiedText');

            // Remove default and dark mode indigo classes
            copyTranscriptBtn.classList.remove(
                'text-indigo-600', 'hover:text-indigo-800',
                'dark:text-indigo-400', 'dark:hover:text-indigo-300',
                'bg-indigo-50/80', 'hover:bg-indigo-100/80',
                'dark:bg-indigo-950/40', 'dark:hover:bg-indigo-950/70',
                'border-indigo-100/30', 'dark:border-indigo-900/30'
            );
            // Add success green classes
            copyTranscriptBtn.classList.add(
                'text-green-600', 'dark:text-green-400',
                'bg-green-50/80', 'dark:bg-green-950/30',
                'border-green-100/30', 'dark:border-green-900/30'
            );

            setTimeout(() => {
                copyBtnText.textContent = originalText;
                copyTranscriptBtn.classList.remove(
                    'text-green-600', 'dark:text-green-400',
                    'bg-green-50/80', 'dark:bg-green-950/30',
                    'border-green-100/30', 'dark:border-green-900/30'
                );
                copyTranscriptBtn.classList.add(
                    'text-indigo-600', 'dark:text-indigo-400', 'hover:text-indigo-800', 'dark:hover:text-indigo-300',
                    'bg-indigo-50/80', 'hover:bg-indigo-100/80',
                    'dark:bg-indigo-950/40', 'dark:hover:bg-indigo-950/70',
                    'border-indigo-100/30', 'dark:border-indigo-900/30'
                );
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showError(getTranslation('errCopyFail'));
        }
    });
});
