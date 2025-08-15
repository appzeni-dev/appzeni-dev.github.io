// manage.js
// Handles file upload, validation, and localStorage for question bank

document.addEventListener('DOMContentLoaded', function () {
    // Helper to get the question bank from localStorage
    function getQuestionBank() {
        try {
            const raw = localStorage.getItem('digitalSocietyQuestionBank');
            if (raw) return JSON.parse(raw);
        } catch {}
        return [];
    }
    const uploadForm = document.getElementById('uploadForm');
    const jsonFileInput = document.getElementById('jsonFile');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    const dangerSuccessMsg = document.getElementById('dangerSuccessMsg');

    // Clear buttons
    const clearExamBtn = document.getElementById('clearExamResponses');
    const clearQuizBtn = document.getElementById('clearQuizResponses');
    const clearBankBtn = document.getElementById('clearQuestionBank');

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        successMsg.classList.add('hidden');
    }

    // Modal elements
    const dangerModal = document.getElementById('dangerModal');
    const dangerModalMsg = document.getElementById('dangerModalMsg');
    const dangerConfirm = document.getElementById('dangerConfirm');
    const dangerCancel = document.getElementById('dangerCancel');
    const dangerClose = document.getElementById('dangerClose');

    let pendingDangerAction = null;
    function showSuccess(msg) {
        successMsg.textContent = msg;
        successMsg.classList.remove('hidden');
        errorMsg.classList.add('hidden');
    }
    function showDangerSuccess(msg) {
        if (dangerSuccessMsg) {
            dangerSuccessMsg.textContent = msg;
            dangerSuccessMsg.classList.remove('hidden');
            setTimeout(() => {
                dangerSuccessMsg.classList.add('hidden');
            }, 3000);
        }
    }
    function validateQuestionBank(data) {
        // Validation for Digital Society question bank format
        if (!Array.isArray(data)) return false;
        for (const q of data) {
            if (typeof q !== 'object' || q === null) return false;
            // Required fields: ID, QuestionText, AnswerText
            if (!q.hasOwnProperty('ID') || !q.hasOwnProperty('QuestionText') || !q.hasOwnProperty('AnswerText')) return false;
            // Optional: ConceptTags, ContentTags, ContextTags, ChallengeTags should be arrays if present
            for (const tagField of ['ConceptTags','ContentTags','ContextTags','ChallengeTags']) {
                if (q.hasOwnProperty(tagField) && !Array.isArray(q[tagField])) return false;
            }
        }
        return true;
    }
    function showDangerModal(msg, action) {
        dangerModalMsg.textContent = msg;
        dangerModal.style.display = '';
        pendingDangerAction = action;
    }
    function hideDangerModal() {
        dangerModal.style.display = 'none';
        pendingDangerAction = null;
    }
    uploadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const file = jsonFileInput.files[0];
        if (!file) {
            showError('Please select a JSON file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                if (!validateQuestionBank(data)) {
                    showError('Invalid question bank structure. Please check your JSON file.');
                    return;
                }
                localStorage.setItem('digitalSocietyQuestionBank', JSON.stringify(data));
                showSuccess('Question bank uploaded and saved to localStorage!');
            } catch (err) {
                showError('Error parsing JSON: ' + err.message);
            }
        };
        reader.onerror = function () {
            showError('Failed to read file.');
        };
        reader.readAsText(file);
    });

    // (Removed duplicate clearExamBtn event)

    if (clearExamBtn) {
        clearExamBtn.addEventListener('click', function () {
            showDangerModal('Are you sure you want to clear all Exam responses? This cannot be undone.', function () {
                localStorage.removeItem('questionBankExamResponses');
                showDangerSuccess('Exam responses cleared from localStorage.');
            });
        });
    }
    if (clearQuizBtn) {
        clearQuizBtn.addEventListener('click', function () {
            showDangerModal('Are you sure you want to clear all Quiz responses? This cannot be undone.', function () {
                localStorage.removeItem('questionBankQuizResponses');
                showDangerSuccess('Quiz responses cleared from localStorage.');
            });
        });
    }
    if (clearBankBtn) {
        clearBankBtn.addEventListener('click', function () {
            showDangerModal('Are you sure you want to clear the Question Bank? This cannot be undone.', function () {
                localStorage.removeItem('digitalSocietyQuestionBank');
                showDangerSuccess('Question bank cleared from localStorage.');
            });
        });
    }

    if (dangerConfirm) {
        dangerConfirm.addEventListener('click', function () {
            if (pendingDangerAction) {
                pendingDangerAction();
            }
            hideDangerModal();
        });
    }
    if (dangerCancel) {
        dangerCancel.addEventListener('click', function () {
            hideDangerModal();
        });
    }
    if (dangerClose) {
        dangerClose.addEventListener('click', function () {
            hideDangerModal();
        });
    }
});
