/* ============================================
   CALCULUS II — APP
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        notesKey: 'calculus2_notes',
        storagePrefix: 'calc2_notes_'
    };

    const DAYS = [];
    for (let i = 1; i <= 18; i++) {
        DAYS.push({
            id: `day-${i}`,
            num: String(i).padStart(2, '0'),
            title: `Day ${String(i).padStart(2, '0')}`,
            file: `days/day-${String(i).padStart(2, '0')}.html`,
            folder: `Day ${String(i).padStart(2, '0')}`,
            category: 'days'
        });
    }

    const QUIZZES = [
        { id: 'quiz-01', num: '01', title: 'Quiz 01', file: 'quiz-reviews/quiz-01.html', folder: 'Quiz 01', category: 'quizzes' },
        { id: 'quiz-02', num: '02', title: 'Quiz 02', file: 'quiz-reviews/quiz-02.html', folder: 'Quiz 02', category: 'quizzes' },
        { id: 'quiz-03', num: '03', title: 'Quiz 03', file: 'quiz-reviews/quiz-03.html', folder: 'Quiz 03', category: 'quizzes' },
        { id: 'quiz-1-prep', num: '1P', title: 'Quiz 1 Prep', file: 'quiz-reviews/quiz-1-prep.html', folder: 'Quiz 1 Prep', category: 'quizzes' },
        { id: 'quiz-2-prep', num: '2P', title: 'Quiz 2 Prep', file: 'quiz-reviews/quiz-2-prep.html', folder: 'Quiz 2 Prep', category: 'quizzes' },
        { id: 'quiz-3-prep', num: '3P', title: 'Quiz 3 Prep', file: 'quiz-reviews/quiz-3-prep.html', folder: 'Quiz 3 Prep', category: 'quizzes' },
        { id: 'quiz-practice', num: 'PR', title: 'Quiz Practice', file: 'quiz-reviews/quiz-practice.html', folder: 'Quiz Practice', category: 'quizzes' }
    ];

    const FINAL_REVIEWS = [
        { id: 'final-review-1', num: 'R1', title: 'Final Review 1', file: 'final-reviews/final-review-1.html', folder: 'Final Review 1', category: 'final' },
        { id: 'final-review-2', num: 'R2', title: 'Final Review 2', file: 'final-reviews/final-review-2.html', folder: 'Final Review 2', category: 'final' },
        { id: 'final-review-3', num: 'R3', title: 'Final Review 3', file: 'final-reviews/final-review-3.html', folder: 'Final Review 3', category: 'final' },
        { id: 'final-review-4', num: 'R4', title: 'Final Review 4', file: 'final-reviews/final-review-4.html', folder: 'Final Review 4', category: 'final' }
    ];

    const FINAL_SAMPLES = [
        { id: 'final-sample-1', num: 'S1', title: 'Final Sample 1', file: 'final-samples/final-sample-1.html', folder: 'Final Sample 1', category: 'final' },
        { id: 'final-sample-2', num: 'S2', title: 'Final Sample 2', file: 'final-samples/final-sample-2.html', folder: 'Final Sample 2', category: 'final' },
        { id: 'final-sample-3', num: 'S3', title: 'Final Sample 3', file: 'final-samples/final-sample-3.html', folder: 'Final Sample 3', category: 'final' }
    ];

    const ALL_SECTIONS = [...DAYS, ...QUIZZES, ...FINAL_REVIEWS, ...FINAL_SAMPLES];
    const CATEGORY_MAP = {
        'days': { sections: DAYS, view: 'days', label: 'Day', hub: 'days/index.html' },
        'quizzes': { sections: QUIZZES, view: 'quiz-reviews', label: 'Quiz', hub: 'quiz-reviews/index.html' },
        'final': { sections: [...FINAL_REVIEWS, ...FINAL_SAMPLES], view: 'final-reviews', label: 'Review', hub: 'final-reviews/index.html' }
    };

    let manifest = {};
    let currentSection = null;
    let currentImageIndex = 0;
    let currentImages = [];

    function initMathJax() {
        if (typeof window.MathJax === 'undefined') return;
        if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch(err => console.warn('MathJax error:', err));
        }
    }

    function refreshMathJax() {
        if (typeof window.MathJax === 'undefined') return;
        if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch(err => console.warn('MathJax refresh error:', err));
        }
    }

    const NoteEngine = {
        getAllNotes() {
            try {
                const data = localStorage.getItem(CONFIG.notesKey);
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        },
        saveAllNotes(notes) {
            try {
                localStorage.setItem(CONFIG.notesKey, JSON.stringify(notes));
                return true;
            } catch (e) {
                return false;
            }
        },
        getChapterNotes(chapterId) {
            const notes = this.getAllNotes();
            return notes[chapterId] || '';
        },
        saveChapterNotes(chapterId, content) {
            const notes = this.getAllNotes();
            notes[chapterId] = content;
            return this.saveAllNotes(notes);
        },
        deleteChapterNotes(chapterId) {
            const notes = this.getAllNotes();
            delete notes[chapterId];
            return this.saveAllNotes(notes);
        },
        exportNotes(chapterId, filename) {
            const content = this.getChapterNotes(chapterId);
            const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `notes_${chapterId}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        importNotes(chapterId, file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const success = this.saveChapterNotes(chapterId, content);
                    if (success) resolve(content);
                    else reject(new Error('Failed to save'));
                };
                reader.onerror = () => reject(new Error('Failed to read'));
                reader.readAsText(file);
            });
        }
    };

    function createNoteSidebar(chapterId) {
        const existing = document.getElementById('note-sidebar');
        if (existing) return existing;

        const sidebar = document.createElement('div');
        sidebar.id = 'note-sidebar';
        sidebar.className = 'note-sidebar';
        sidebar.setAttribute('data-chapter-id', chapterId);

        const overlay = document.createElement('div');
        overlay.id = 'note-sidebar-overlay';
        overlay.className = 'note-sidebar-overlay';

        const currentNotes = NoteEngine.getChapterNotes(chapterId);

        sidebar.innerHTML = `
            <div class="note-sidebar-header">
                <h3>Study Notes</h3>
                <button class="note-sidebar-close" aria-label="Close notes">&times;</button>
            </div>
            <textarea id="sidebar-notes-textarea" placeholder="Type your notes here... They will auto-save as you type.

You can use markdown formatting:
- **bold**
- *italic*
- \`code\`
- Headings with #

Notes are saved per chapter and persist across sessions.">${escapeHtml(currentNotes)}</textarea>
            <div class="note-sidebar-actions">
                <button id="btn-save-notes">Save</button>
                <button id="btn-export-notes">Export .md</button>
                <button id="btn-import-notes">Import</button>
                <button id="btn-clear-notes">Clear</button>
            </div>
            <input type="file" id="import-file-input" accept=".md,.txt" style="display:none" />
            <p class="note-status" id="note-status">Notes auto-save locally</p>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(sidebar);

        const textarea = sidebar.querySelector('#sidebar-notes-textarea');
        const status = sidebar.querySelector('#note-status');
        let saveTimeout;

        function updateStatus(msg) {
            status.textContent = msg;
            setTimeout(() => { status.textContent = 'Notes auto-save locally'; }, 2000);
        }

        function saveNotes() {
            NoteEngine.saveChapterNotes(chapterId, textarea.value);
            updateStatus('Saved at ' + new Date().toLocaleTimeString());
        }

        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveNotes, 600);
            updateStatus('Typing...');
        });

        sidebar.querySelector('#btn-save-notes').addEventListener('click', saveNotes);

        sidebar.querySelector('#btn-export-notes').addEventListener('click', () => {
            const title = getCurrentSectionTitle();
            const filename = `${title || chapterId}_notes.md`;
            NoteEngine.exportNotes(chapterId, filename);
            updateStatus('Notes exported');
        });

        sidebar.querySelector('#btn-import-notes').addEventListener('click', () => {
            sidebar.querySelector('#import-file-input').click();
        });

        sidebar.querySelector('#import-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            NoteEngine.importNotes(chapterId, file).then(() => {
                textarea.value = NoteEngine.getChapterNotes(chapterId);
                updateStatus('Notes imported');
            }).catch(() => updateStatus('Import failed'));
            e.target.value = '';
        });

        sidebar.querySelector('#btn-clear-notes').addEventListener('click', () => {
            if (confirm('Clear all notes for this section? This cannot be undone.')) {
                textarea.value = '';
                NoteEngine.deleteChapterNotes(chapterId);
                updateStatus('Notes cleared');
            }
        });

        function closeSidebar() {
            saveNotes();
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        }

        sidebar.querySelector('.note-sidebar-close').addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        return sidebar;
    }

    function openNoteSidebar(chapterId) {
        const sidebar = createNoteSidebar(chapterId);
        const overlay = document.getElementById('note-sidebar-overlay');
        sidebar.classList.add('open');
        overlay.classList.add('open');
        sidebar.querySelector('#sidebar-notes-textarea').focus();
    }

    function getCurrentSectionTitle() {
        const h2 = document.querySelector('.chapter h2');
        if (h2) return h2.textContent.trim().replace(/[^a-zA-Z0-9]/g, '_');
        return 'section';
    }

    function initNavigation() {
        const currentFile = window.location.pathname.split('/').pop() || '';
        const currentSection = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
        
        if (!currentSection) return;

        const currentIndex = ALL_SECTIONS.findIndex(s => s.id === currentSection.id);
        const prevBtn = document.getElementById('prev-section');
        const nextBtn = document.getElementById('next-section');
        const indicator = document.getElementById('section-indicator');

        if (indicator) {
            indicator.textContent = `${currentSection.num} / ${ALL_SECTIONS.length}`;
        }

        if (prevBtn) {
            if (currentIndex > 0) {
                prevBtn.href = ALL_SECTIONS[currentIndex - 1].file;
                prevBtn.classList.remove('disabled');
                prevBtn.style.display = '';
            } else {
                prevBtn.classList.add('disabled');
                prevBtn.style.display = 'none';
            }
        }

        if (nextBtn) {
            if (currentIndex < ALL_SECTIONS.length - 1) {
                nextBtn.href = ALL_SECTIONS[currentIndex + 1].file;
                nextBtn.classList.remove('disabled');
                nextBtn.style.display = '';
            } else {
                nextBtn.classList.add('disabled');
                nextBtn.style.display = 'none';
            }
        }
    }

    function initProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = 'progress-bar';
        document.body.prepend(progressBar);

        const updateProgress = debounce(function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
            progressBar.style.width = progress + '%';
        }, 10);

        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    function initSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const sections = document.querySelectorAll('.section-card');
        const tocLinks = document.querySelectorAll('.toc a');

        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.toLowerCase().trim();

            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                section.style.display = text.includes(query) || query === '' ? 'block' : 'none';
            });

            tocLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                link.parentElement.style.display = text.includes(query) || query === '' ? 'list-item' : 'none';
            });
        }, 300));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                const nextBtn = document.getElementById('next-section');
                if (nextBtn && !nextBtn.classList.contains('disabled')) {
                    window.location.href = nextBtn.href;
                }
            }
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                const prevBtn = document.getElementById('prev-section');
                if (prevBtn && !prevBtn.classList.contains('disabled')) {
                    window.location.href = prevBtn.href;
                }
            }
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('note-sidebar');
                const overlay = document.getElementById('note-sidebar-overlay');
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('open');
                }
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                const currentFile = window.location.pathname.split('/').pop();
                const section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
                if (section) {
                    openNoteSidebar(section.id);
                }
            }
        });
    }

    function addNoteButtons() {
        const existing = document.querySelector('.note-sidebar-toggle');
        if (existing) {
            existing.addEventListener('click', () => {
                const currentFile = window.location.pathname.split('/').pop();
                const section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
                const sectionId = section ? section.id : 'general';
                openNoteSidebar(sectionId);
            });
            return;
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'note-btn note-sidebar-toggle';
        toggleBtn.textContent = 'Notes';
        toggleBtn.type = 'button';

        toggleBtn.addEventListener('click', () => {
            const currentFile = window.location.pathname.split('/').pop();
            const section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
            const sectionId = section ? section.id : 'general';
            openNoteSidebar(sectionId);
        });

        document.body.appendChild(toggleBtn);
    }

    function initNoteToggleLinks() {
        document.querySelectorAll('.note-toggle-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const currentFile = window.location.pathname.split('/').pop();
                const section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
                const sectionId = section ? section.id : 'general';
                openNoteSidebar(sectionId);
            });
        });
    }

    function initImageGallery() {
        const galleryImages = document.querySelectorAll('.gallery-image');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        const counter = document.getElementById('gallery-counter');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (!galleryImages.length) return;

        let currentIndex = 0;
        const images = Array.from(galleryImages);

        function showImage(index) {
            images.forEach((img, i) => {
                img.style.display = i === index ? 'block' : 'none';
            });
            
            if (counter) {
                counter.textContent = `${index + 1} / ${images.length}`;
            }

            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });

            if (prevBtn) {
                prevBtn.classList.toggle('disabled', index === 0);
            }
            if (nextBtn) {
                nextBtn.classList.toggle('disabled', index === images.length - 1);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    showImage(currentIndex);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < images.length - 1) {
                    currentIndex++;
                    showImage(currentIndex);
                }
            });
        }

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentIndex = index;
                showImage(currentIndex);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                showImage(currentIndex);
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                currentIndex++;
                showImage(currentIndex);
            }
        });

        showImage(0);
    }

    function init() {
        initMathJax();
        initNavigation();
        initProgressBar();
        addNoteButtons();
        initNoteToggleLinks();
        initSearch();
        initSmoothScroll();
        initKeyboardShortcuts();
        initImageGallery();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.Calculus = {
        DAYS,
        QUIZZES,
        FINAL_REVIEWS,
        FINAL_SAMPLES,
        ALL_SECTIONS,
        CATEGORY_MAP,
        NoteEngine,
        getSection: (id) => ALL_SECTIONS.find(s => s.id === id || (s.file && s.file.endsWith(id))),
        getCurrentSection: () => {
            const currentFile = window.location.pathname.split('/').pop();
            let section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
            if (!section && window.CurrentSectionId) {
                section = ALL_SECTIONS.find(s => s.id === window.CurrentSectionId);
            }
            return section;
        },
        refreshMath: refreshMathJax,
        openNotes: () => {
            let sectionId = 'general';
            const currentFile = window.location.pathname.split('/').pop();
            const section = ALL_SECTIONS.find(s => s.file && s.file.endsWith(currentFile));
            if (section) sectionId = section.id;
            if (window.CurrentSectionId) sectionId = window.CurrentSectionId;
            openNoteSidebar(sectionId);
        }
    };
})();
