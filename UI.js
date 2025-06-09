            class QuizApp {
            constructor() {
                this.currentSubject = null;
                this.currentQuestion = null;
                this.currentQuestionIndex = 0;
                this.totalQuestions = 10;
                this.score = 0;
                this.timeRemaining = 30;
                this.selectedAnswer = null;
                this.sessionData = [];
                this.timer = null;
                this.useGemini = false;
                this.currentTopic = null;
                this.currentStudySubject = null;
                this.studiedTopics = this.getLocalStorage('studiedTopics', {});
                this.isTopicBasedQuiz = false;
                this.currentTopicContext = null;
                this.calculatorState = { expression: '', result: 0 };
                this.wikiCache = this.getLocalStorage('wikiCache', {});
                this.lastWikiRequestTime = 0;
                this.minRequestInterval = 1000;

                // DOM Elements
                this.loadingPage = document.getElementById('loadingPage');
                this.appContainer = document.getElementById('appContainer');
                this.authModal = document.getElementById('authModal');
                this.profileAvatar = document.getElementById('profileAvatar');
                this.profileName = document.getElementById('profileName');
                this.nicknameInput = document.getElementById('nicknameInput');
                this.avatarInput = document.getElementById('avatarInput');
                this.avatarPreview = document.getElementById('avatarPreview');
                this.authBtn = document.getElementById('authBtn');
                this.dashboard = document.getElementById('dashboard');
                this.welcomeName = document.getElementById('welcomeName');
                this.quizSection = document.getElementById('quizSection');
                this.questionCounter = document.getElementById('questionCounter');
                this.timerDisplay = document.getElementById('timerDisplay');
                this.progressFill = document.getElementById('progressFill');
                this.questionImage = document.getElementById('questionImage');
                this.questionText = document.getElementById('questionText');
                this.optionsContainer = document.getElementById('optionsContainer');
                this.prevBtn = document.getElementById('prevBtn');
                this.submitBtn = document.getElementById('submitBtn');
                this.nextBtn = document.getElementById('nextBtn');
                this.explanationContainer = document.getElementById('explanationContainer');
                this.explanationText = document.getElementById('explanationText');
                this.toggleAI = document.getElementById('toggleAI');
                this.reviewSection = document.getElementById('reviewSection');
                this.reviewContent = document.getElementById('reviewContent');
                this.backToDashboard = document.getElementById('backToDashboard');
                this.retryQuiz = document.getElementById('retryQuiz');
                this.leaderboardSection = document.getElementById('leaderboardSection');
                this.backToDashboardLeaderboard = document.getElementById('backToDashboardLeaderboard');
                this.showLeaderboard = document.getElementById('showLeaderboard');
                this.logoutBtn = document.getElementById('logoutBtn');
                this.studyPlanSection = document.getElementById('studyPlanSection');
                this.studySubjectTitle = document.getElementById('studySubjectTitle');
                this.topicSelection = document.getElementById('topicSelection');
                this.topicsContainer = document.getElementById('topicsContainer');
                this.studyContent = document.getElementById('studyContent');
                this.currentTopicTitle = document.getElementById('currentTopicTitle');
                this.studyPlanContent = document.getElementById('studyPlanContent');
                this.studyProgress = document.getElementById('studyProgress');
                this.studyProgressBar = document.getElementById('studyProgressBar');
                this.backToDashboardStudy = document.getElementById('backToDashboardStudy');
                this.backToTopics = document.getElementById('backToTopics');
                this.goToStudy = document.getElementById('goToStudy');
                this.regenerateStudyPlan = document.getElementById('regenerateStudyPlan');
                this.toggleStudyPlanAI = document.getElementById('toggleStudyPlanAI');
                this.startTopicQuiz = document.getElementById('startTopicQuiz');
                this.markAsStudied = document.getElementById('markAsStudied');
                this.wikiSection = document.getElementById('wikiSection');
                this.wikiSearchInput = document.getElementById('wikiSearchInput');
                this.wikiSearchBtn = document.getElementById('wikiSearchBtn');
                this.wikiResults = document.getElementById('wikiResults');
                this.showWikiSearch = document.getElementById('showWikiSearch');
                this.backToDashboardWiki = document.getElementById('backToDashboardWiki');
                this.calculatorModal = document.getElementById('calculatorModal');
                this.calculatorDisplay = document.getElementById('calculatorDisplay');
                this.openCalculator = document.getElementById('openCalculator');
                this.openCalculatorStudy = document.getElementById('openCalculatorStudy');

                // Event Listeners
                this.authBtn.addEventListener('click', () => this.handleAuth());
                this.avatarInput.addEventListener('change', () => this.previewAvatar());
                this.prevBtn.addEventListener('click', () => this.prevQuestion());
                this.submitBtn.addEventListener('click', () => this.submitAnswer());
                this.nextBtn.addEventListener('click', () => this.nextQuestion());
                this.toggleAI.addEventListener('click', () => this.toggleAIExplanation());
                this.backToDashboard.addEventListener('click', () => this.showDashboard());
                this.retryQuiz.addEventListener('click', () => this.startQuiz(this.currentSubject));
                this.backToDashboardLeaderboard.addEventListener('click', () => this.showDashboard());
                this.showLeaderboard.addEventListener('click', () => this.showLeaderboardSection());
                this.logoutBtn.addEventListener('click', () => this.logout());
                this.backToDashboardStudy.addEventListener('click', () => this.showDashboard());
                this.backToTopics.addEventListener('click', () => this.showTopicSelection());
                this.goToStudy.addEventListener('click', () => this.showTopicSelection());
                this.regenerateStudyPlan.addEventListener('click', () => this.generateStudyPlan(this.currentTopic));
                this.toggleStudyPlanAI.addEventListener('click', () => this.toggleStudyPlanAI());
                this.startTopicQuiz.addEventListener('click', () => this.startTopicBasedQuiz());
                this.markAsStudied.addEventListener('click', () => this.markTopicAsStudied());
                this.wikiSearchBtn.addEventListener('click', () => this.searchWikipedia());
                this.wikiSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.searchWikipedia(); });
                this.showWikiSearch.addEventListener('click', () => this.showWikiSection());
                this.backToDashboardWiki.addEventListener('click', () => this.showDashboard());
                this.openCalculator.addEventListener('click', () => this.showCalculator());
                this.openCalculatorStudy.addEventListener('click', () => this.showCalculator());
                document.querySelectorAll('.subject-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.startQuiz(btn.dataset.subject));
                });
                document.querySelectorAll('.study-plan-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.showStudyPlan(btn.dataset.subject));
                });

                // Initialize
                this.init();
            }

            // Safely retrieve and parse localStorage data
            getLocalStorage(key, defaultValue) {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : defaultValue;
                } catch (error) {
                    console.error(`Error parsing ${key} from localStorage:`, error);
                    return defaultValue;
                }
            }

            // Safely save to localStorage
            setLocalStorage(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (error) {
                    console.error(`Error saving ${key} to localStorage:`, error);
                }
            }

            async init() {
                // Failsafe timeout to hide loading screen after 3 seconds
                const failsafeTimeout = setTimeout(() => {
                    console.warn('Failsafe triggered: Hiding loading screen');
                    this.loadingPage.classList.add('hidden');
                    this.appContainer.classList.remove('hidden');
                    this.authModal.classList.remove('hidden');
                }, 3000);

                try {
                    // Get profile from localStorage safely
                    const profile = this.getLocalStorage('profile', null);

                    // Minimal delay to ensure smooth UI transition
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Clear failsafe timeout since initialization succeeded
                    clearTimeout(failsafeTimeout);

                    // Hide loading page and show app
                    this.loadingPage.classList.add('hidden');
                    this.appContainer.classList.remove('hidden');

                    // Show dashboard if logged in, otherwise show auth modal
                    if (profile && profile.nickname) {
                        this.profileName.textContent = profile.nickname;
                        this.welcomeName.textContent = profile.nickname;
                        this.profileAvatar.src = profile.avatar || 'https://via.placeholder.com/40';
                        this.showDashboard();
                    } else {
                        this.authModal.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error('Initialization error:', error);
                    clearTimeout(failsafeTimeout);
                    this.loadingPage.classList.add('hidden');
                    this.appContainer.classList.remove('hidden');
                    this.authModal.classList.remove('hidden');
                    this.showError('Failed to initialize the app. Please refresh the page.');
                }
            }

            handleAuth() {
                const nickname = this.nicknameInput.value.trim();
                if (!nickname) {
                    this.showError('Please enter a nickname');
                    return;
                }
                const avatar = this.avatarPreview.src;
                const profile = { nickname, avatar };
                this.setLocalStorage('profile', profile);
                this.profileName.textContent = nickname;
                this.welcomeName.textContent = nickname;
                this.profileAvatar.src = avatar;
                this.authModal.classList.add('hidden');
                this.showDashboard();
            }

            previewAvatar() {
                const file = this.avatarInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => this.avatarPreview.src = reader.result;
                    reader.readAsDataURL(file);
                }
            }

            logout() {
                localStorage.removeItem('profile');
                localStorage.removeItem('studiedTopics');
                localStorage.removeItem('wikiCache');
                this.authModal.classList.remove('hidden');
                this.hideAllSections();
                this.nicknameInput.value = '';
                this.avatarPreview.src = 'https://via.placeholder.com/40';
            }

            hideAllSections() {
                this.dashboard.classList.add('hidden');
                this.quizSection.classList.add('hidden');
                this.reviewSection.classList.add('hidden');
                this.leaderboardSection.classList.add('hidden');
                this.studyPlanSection.classList.add('hidden');
                this.wikiSection.classList.add('hidden');
                this.calculatorModal.classList.add('hidden');
            }

            showDashboard() {
                this.hideAllSections();
                this.dashboard.classList.remove('hidden');
            }

            showWikiSection() {
                this.hideAllSections();
                this.wikiSection.classList.remove('hidden');
                this.wikiSearchInput.value = '';
                this.wikiResults.innerHTML = '';
            }

            showLeaderboardSection() {
                this.hideAllSections();
                this.leaderboardSection.classList.remove('hidden');
            }

            async startQuiz(subject) {
                this.currentSubject = subject;
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.sessionData = [];
                this.isTopicBasedQuiz = false;
                this.currentTopicContext = null;
                this.hideAllSections();
                this.quizSection.classList.remove('hidden');
                this.loadingPage.classList.remove('hidden');
                try {
                    await this.loadQuestion();
                    this.loadingPage.classList.add('hidden');
                } catch (error) {
                    console.error('Quiz start error:', error);
                    this.showError('Failed to start quiz. Please try again.');
                    this.loadingPage.classList.add('hidden');
                    this.showDashboard();
                }
            }

            async loadQuestion() {
                try {
                    const url = this.isTopicBasedQuiz && this.currentTopicContext
                        ? `https://questions.aloc.com.ng/api/v2/q?subject=${this.currentSubject}&topic=${encodeURIComponent(this.currentTopicContext)}`
                        : `https://questions.aloc.com.ng/api/v2/q?subject=${this.currentSubject}`;
                    const response = await this.fetchWithTimeout(url, {
                        headers: {
                            'Accept': 'application/json',
                            'AccessToken': 'QB-139d5195a490b3c12794'
                        }
                    }, 10000);
                    const data = await response.json();
                    if (!data.data) throw new Error('No question data received');
                    this.currentQuestion = data.data;
                    this.displayQuestion();
                    this.startTimer();
                } catch (error) {
                    console.error('Error loading question:', error);
                    throw new Error('Failed to load question');
                }
            }

            displayQuestion() {
                this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.totalQuestions}`;
                this.questionText.textContent = this.currentQuestion.question || 'Question text not available';
                this.progressFill.style.width = `${(this.currentQuestionIndex / this.totalQuestions) * 100}%`;
                this.questionImage.src = this.currentQuestion.image || '';
                this.questionImage.classList.toggle('hidden', !this.currentQuestion.image);
                this.selectedAnswer = null;
                this.submitBtn.disabled = true;
                this.submitBtn.classList.remove('hidden');
                this.nextBtn.classList.add('hidden');
                this.explanationContainer.classList.add('hidden');
                this.optionsContainer.innerHTML = '';
                this.displayOptions();
                this.openCalculator.classList.toggle('hidden', !['Mathematics', 'Physics', 'Chemistry'].includes(this.currentSubject));
            }

            displayOptions() {
                const options = ['a', 'b', 'c', 'd'];
                options.forEach(option => {
                    const button = document.createElement('button');
                    button.className = 'option-button bg-gray-700 p-4 rounded hover:bg-gray-600 w-full text-left';
                    button.dataset.option = option.toUpperCase();
                    button.innerHTML = `
                        <span class="font-bold">${option.toUpperCase()}</span>
                        ${this.currentQuestion.option[option] || 'Option not available'}
                    `;
                    button.addEventListener('click', () => this.selectOption(option.toUpperCase(), button));
                    this.optionsContainer.appendChild(button);
                });
            }

            selectOption(option, buttonElement) {
                document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('bg-blue-600'));
                buttonElement.classList.add('bg-blue-600');
                this.selectedAnswer = option;
                this.submitBtn.disabled = false;
            }

            startTimer() {
                clearInterval(this.timer);
                this.timeRemaining = 30;
                this.updateTimerDisplay();
                this.timer = setInterval(() => {
                    this.timeRemaining--;
                    this.updateTimerDisplay();
                    if (this.timeRemaining <= 0) this.timeUp();
                }, 1000);
            }

            updateTimerDisplay() {
                const minutes = Math.floor(this.timeRemaining / 60);
                const seconds = this.timeRemaining % 60;
                this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                this.timerDisplay.style.background = this.timeRemaining <= 10 ? '#e74c3c' : '#ff6b6b';
            }

            timeUp() {
                clearInterval(this.timer);
                if (this.selectedAnswer) {
                    this.submitAnswer();
                } else {
                    this.showCorrectAnswer();
                    this.nextQuestion();
                }
            }

            async submitAnswer() {
                clearInterval(this.timer);
                const isCorrect = this.selectedAnswer === this.currentQuestion.answer;
                if (isCorrect) this.score++;
                this.sessionData.push({
                    question: this.currentQuestion,
                    userAnswer: this.selectedAnswer,
                    correct: isCorrect,
                    timeSpent: 30 - this.timeRemaining
                });
                this.showCorrectAnswer();
                await this.showExplanation();
                this.nextBtn.classList.remove('hidden');
                this.submitBtn.classList.add('hidden');
            }

            showCorrectAnswer() {
                document.querySelectorAll('.option-button').forEach(btn => {
                    btn.classList.toggle('bg-green-600', btn.dataset.option === this.currentQuestion.answer);
                    btn.classList.toggle('bg-red-600', btn.dataset.option === this.selectedAnswer && !this.sessionData[this.currentQuestionIndex].correct);
                });
            }

            cleanAIResponse(text) {
                return text
                    .replace(/\*\*|\*|_|\#\#/g, '')
                    .replace(/\n\s*\n/g, '\n')
                    .replace(/^\s+|\s+$/g, '')
                    .replace(/```/g, '');
            }

            async showExplanation() {
                this.explanationText.textContent = 'Generating AI explanation...';
                this.explanationContainer.classList.remove('hidden');
                try {
                    const prompt = `You are an expert tutor for the University of Ibadan POST UTME CBT. Provide a detailed, educational explanation for the following ${this.currentSubject} question, suitable for a student preparing for the exam. Include why the correct answer is right, why other options are incorrect, and address common misconceptions. Keep the tone clear, concise, and engaging. Do not use markdown formatting.

Question: "${this.currentQuestion.question}"
Options:
A) ${this.currentQuestion.option.a || 'N/A'}
B) ${this.currentQuestion.option.b || 'N/A'}
C) ${this.currentQuestion.option.c || 'N/A'}
D) ${this.currentQuestion.option.d || 'N/A'}
Correct Answer: ${this.currentQuestion.answer}
Student's Answer: ${this.selectedAnswer || 'No answer selected'}

Explanation should be 150-300 words, structured with an introduction, explanation of the correct answer, analysis of incorrect options, and a summary of key takeaways. After the explanation, state: "Correct Answer: [answer]".`;
                    const response = await this.fetchWithTimeout(
                        `https://kaiz-apis.gleeze.com/api/gpt-4.1?ask=${encodeURIComponent(prompt)}&uid=1268&apikey=a0ebe80e-bf1a-4dbf-8d36-6935b1bfa5ea`,
                        { method: 'GET', headers: { 'Content-Type': 'application/json' } },
                        10000
                    );
                    const data = await response.json();
                    const rawText = data.response || 'No explanation provided by GPT API.';
                    this.explanationText.textContent = this.cleanAIResponse(rawText) + `\n\nCorrect Answer: ${this.currentQuestion.answer}`;
                } catch (error) {
                    console.error('Error getting explanation:', error);
                    this.explanationText.textContent = `Explanation: The correct answer is based on key concepts in ${this.currentSubject}. Please review your study materials or use the Wikipedia Search for a detailed understanding.\n\nCorrect Answer: ${this.currentQuestion.answer}`;
                }
            }

            toggleAIExplanation() {
                this.useGemini = !this.useGemini;
                this.toggleAI.textContent = `Switch to ${this.useGemini ? 'Static' : 'GPT'}`;
                this.showExplanation();
            }

            prevQuestion() {
                if (this.currentQuestionIndex > 0) {
                    clearInterval(this.timer);
                    this.currentQuestionIndex--;
                    this.loadQuestion();
                }
            }

            nextQuestion() {
                this.currentQuestionIndex++;
                if (this.currentQuestionIndex < this.totalQuestions) {
                    clearInterval(this.timer);
                    this.submitBtn.classList.remove('hidden');
                    this.nextBtn.classList.add('hidden');
                    this.loadQuestion();
                } else {
                    this.endQuiz();
                }
            }

            endQuiz() {
                this.hideAllSections();
                this.reviewSection.classList.remove('hidden');
                this.showReview();
                this.showConfetti();
                this.setLocalStorage('quizResults', this.sessionData);
            }

            showReview() {
                this.reviewContent.innerHTML = '';
                this.sessionData.forEach((data, index) => {
                    const div = document.createElement('div');
                    div.className = 'bg-gray-800 p-4 rounded mb-4';
                    div.innerHTML = `
                        <p class="font-bold">Question ${index + 1}: ${data.question.question}</p>
                        <p>Your Answer: ${data.userAnswer || 'No answer'}</p>
                        <p>Correct Answer: ${data.question.answer}</p>
                        <p>Status: ${data.correct ? 'Correct' : 'Incorrect'}</p>
                        <p>Time Spent: ${data.timeSpent}s</p>
                    `;
                    this.reviewContent.appendChild(div);
                });
            }

            showConfetti() {
                const confettiContainer = document.getElementById('confettiContainer');
                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = `${Math.random() * 100}vw`;
                    confetti.style.background = ['#f00', '#0f0', '#00f', '#ff0'][Math.floor(Math.random() * 4)];
                    confetti.style.animationDelay = `${Math.random() * 2}s`;
                    confettiContainer.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }
            }

            getSubjectTopics(subject) {
                const topics = {
                    'English': [
                        'Comprehension Passages', 'Grammar and Syntax', 'Vocabulary and Word Formation',
                        'Figures of Speech', 'Essay Writing', 'Oral English', 'Literature Appreciation',
                        'Phonetics and Phonology', 'Sentence Construction', 'Punctuation and Spelling'
                    ],
                    'Mathematics': [
                        'Algebra and Polynomials', 'Coordinate Geometry', 'Trigonometry', 'Calculus Basics',
                        'Statistics and Probability', 'Set Theory', 'Number Theory', 'Logarithms and Indices',
                        'Quadratic Equations', 'Sequences and Series', 'Geometry and Mensuration'
                    ],
                    'Biology': [
                        'Cell Biology', 'Genetics and Heredity', 'Ecology and Environment', 'Plant Biology',
                        'Animal Biology', 'Human Physiology', 'Evolution', 'Reproduction',
                        'Nutrition and Respiration', 'Classification of Living Things', 'Biotechnology'
                    ],
                    'Physics': [
                        'Mechanics and Motion', 'Waves and Oscillations', 'Electricity and Magnetism',
                        'Thermodynamics', 'Optics', 'Atomic Physics', 'Nuclear Physics',
                        'Electromagnetism', 'Simple Harmonic Motion', 'Modern Physics'
                    ],
                    'Chemistry': [
                        'Atomic Structure', 'Chemical Bonding', 'Periodic Table', 'Acids and Bases',
                        'Organic Chemistry', 'Electrochemistry', 'Chemical Kinetics', 'Equilibrium',
                        'Thermochemistry', 'Solutions and Colligative Properties', 'Redox Reactions'
                    ],
                    'Economics': [
                        'Microeconomics', 'Macroeconomics', 'Market Structures', 'Demand and Supply',
                        'National Income', 'Money and Banking', 'International Trade', 'Public Finance',
                        'Economic Development', 'Inflation and Unemployment', 'Economic Systems'
                    ],
                    'Government': [
                        'Constitutional Law', 'Political Systems', 'Democracy and Governance', 'Federalism',
                        'Human Rights', 'International Relations', 'Political Parties', 'Elections',
                        'Rule of Law', 'Separation of Powers', 'Nigerian Government'
                    ],
                    'Literature': [
                        'Poetry Analysis', 'Prose and Fiction', 'Drama and Theatre', 'Literary Devices',
                        'African Literature', 'Oral Literature', 'Literary Criticism', 'Themes and Motifs',
                        'Character Analysis', 'Plot and Setting', 'Comparative Literature'
                    ]
                };
                return topics[subject] || [];
            }

            showStudyPlan(subject) {
                this.currentStudySubject = subject;
                this.studySubjectTitle.textContent = subject;
                this.hideAllSections();
                this.studyPlanSection.classList.remove('hidden');
                this.showTopicSelection();
                this.openCalculatorStudy.classList.toggle('hidden', !['Mathematics', 'Physics', 'Chemistry'].includes(subject));
            }

            showTopicSelection() {
                this.topicSelection.classList.remove('hidden');
                this.studyContent.classList.add('hidden');
                this.loadTopics();
            }

            loadTopics() {
                this.topicsContainer.innerHTML = '';
                const topics = this.getSubjectTopics(this.currentStudySubject);
                topics.forEach(topic => {
                    const button = document.createElement('button');
                    const isStudied = this.studiedTopics[this.currentStudySubject]?.includes(topic);
                    button.className = `topic-btn p-4 rounded transition transform hover:scale-105 ${
                        isStudied ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`;
                    button.innerHTML = `
                        <div class="text-left">
                            <div class="font-semibold">${topic}</div>
                            <div class="text-sm opacity-75">${isStudied ? '✓ Studied' : 'Click to study'}</div>
                        </div>
                    `;
                    button.addEventListener('click', () => this.selectTopic(topic));
                    this.topicsContainer.appendChild(button);
                });
            }

            selectTopic(topic) {
                this.currentTopic = topic;
                this.currentTopicTitle.textContent = topic;
                this.topicSelection.classList.add('hidden');
                this.studyContent.classList.remove('hidden');
                this.toggleStudyPlanAI.textContent = `Switch to ${this.useGemini ? 'Static' : 'GPT'}`;
                this.generateStudyPlan(topic);
                this.updateStudyProgress();
            }

            async generateStudyPlan(topic, retryCount = 0, maxRetries = 2) {
                this.studyPlanContent.innerHTML = `
                    <div class="flex items-center justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span class="ml-2">Generating comprehensive study plan for ${topic}...</span>
                    </div>
                `;
                try {
                    let studyPlan;
                    if (!this.useGemini) {
                        const prompt = `You are an expert tutor for the University of Ibadan POST UTME examination. Create a comprehensive, textbook-style study guide for the topic "${topic}" in ${this.currentStudySubject}, designed to prepare students for the POST UTME. The content should be self-contained, covering everything a student needs to know, similar to a textbook chapter. Use clear, educational language and avoid markdown formatting.

Structure the response as follows:
1. INTRODUCTION: Explain the topic's importance in the POST UTME and its relevance to ${this.currentStudySubject}.
2. DEFINITIONS: Provide clear definitions of 5-7 key terms related to the topic, with examples.
3. CORE CONCEPTS: Explain 5-7 main concepts in detail, including formulas, principles, or rules where applicable.
4. DETAILED EXPLANATIONS: Break down the topic into subtopics with in-depth explanations, including step-by-step processes or examples.
5. POST UTME EXAM TIPS: Describe how this topic is tested in the University of Ibadan POST UTME, including common question types and strategies.
6. PRACTICE QUESTIONS: Provide 3-5 sample POST UTME-style questions with answers (no explanations needed).
7. SUMMARY: Summarize the key points for quick revision.

The content should be 600-800 words, engaging, and tailored to the University of Ibadan POST UTME standards. Use headings and bullet points for clarity.`;
                        const response = await this.fetchWithTimeout(
                            `https://kaiz-apis.gleeze.com/api/gpt-4.1?ask=${encodeURIComponent(prompt)}&uid=1268&apikey=a0ebe80e-bf1a-4dbf-8d36-6935b1bfa5ea`,
                            { method: 'GET', headers: { 'Content-Type': 'application/json' } },
                            15000
                        );
                        const data = await response.json();
                        studyPlan = data.response || 'No study plan provided by GPT API.';
                    } else {
                        studyPlan = this.getFallbackStudyPlan(this.currentStudySubject, topic);
                    }
                    this.studyPlanContent.innerHTML = `
                        <div class="prose prose-invert max-w-none">
                            <div class="whitespace-pre-line leading-relaxed text-gray-100">
                                ${this.formatStudyPlan(studyPlan)}
                            </div>
                        </div>
                    `;
                } catch (error) {
                    console.error(`Error generating study plan (Attempt ${retryCount + 1}):`, error);
                    if (!this.useGemini && retryCount < maxRetries) {
                        setTimeout(() => this.generateStudyPlan(topic, retryCount + 1, maxRetries), 1000);
                        return;
                    }
                    const fallbackPlan = this.getFallbackStudyPlan(this.currentStudySubject, topic);
                    this.studyPlanContent.innerHTML = `
                        <div class="prose prose-invert max-w-none">
                            <div class="whitespace-pre-line leading-relaxed text-gray-100">
                                ${this.formatStudyPlan(fallbackPlan)}
                            </div>
                            <div class="text-yellow-400 p-4 bg-yellow-900/20 rounded mt-4">
                                <h3 class="font-bold mb-2">Note</h3>
                                <p>This is a fallback study plan due to an issue with the ${this.useGemini ? 'static content' : 'GPT API'}. Please try again later or switch to static content.</p>
                                <button onclick="app.generateStudyPlan('${topic}')" class="mt-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Retry ${this.useGemini ? 'Static' : 'GPT'}</button>
                            </div>
                        </div>
                    `;
                }
            }

            toggleStudyPlanAI() {
                this.useGemini = !this.useGemini;
                this.toggleStudyPlanAI.textContent = `Switch to ${this.useGemini ? 'Static' : 'GPT'}`;
                this.generateStudyPlan(this.currentTopic);
            }

            getFallbackStudyPlan(subject, topic) {
                const specificPlans = {
                    'English': {
                        'Comprehension Passages': `
INTRODUCTION
Comprehension Passages are a cornerstone of the English POST UTME, testing your ability to understand, interpret, and analyze written texts. Mastering this topic is crucial for scoring high in the University of Ibadan POST UTME.

DEFINITIONS
- Main Idea: The central theme or primary message of a passage. Example: A passage about climate change may have the main idea that human activity contributes to global warming.
- Vocabulary in Context: Determining a word's meaning based on its use in a sentence. Example: "The politician was candid" implies honesty.
- Inference: A conclusion drawn from evidence not explicitly stated. Example: If a character is described as shivering, you infer it's cold.
- Supporting Details: Facts or examples that reinforce the main idea. Example: Statistics in a passage about deforestation.
- Tone: The author's attitude toward the subject. Example: A sarcastic tone mocks the subject.

CORE CONCEPTS
- Identifying the Main Idea: Skim the passage to grasp its purpose.
- Understanding Vocabulary: Use context clues to decode unfamiliar words.
- Making Inferences: Combine clues from the text with prior knowledge.
- Locating Supporting Details: Find evidence that backs the main point.
- Determining Tone and Purpose: Analyze word choice to understand the author's intent.

DETAILED EXPLANATIONS
1. Reading Strategy: Read the questions first to focus your reading. Skim the passage, then read closely for details.
2. Vocabulary Skills: Practice synonyms and antonyms. Use surrounding sentences to infer meanings.
3. Inference Questions: Look for implied ideas. Example: "She avoided eye contact" suggests nervousness.
4. Supporting Details: Highlight facts, examples, or statistics in the passage.
5. Tone Analysis: Note positive, negative, or neutral words to identify tone.

POST UTME EXAM TIPS
Comprehension questions (5-10 per passage) test main ideas, vocabulary, inferences, and tone. Expect passages on science, culture, or history. Time management is key: allocate 5-7 minutes per passage.

PRACTICE QUESTIONS
1. What is the main idea of a passage discussing solar energy benefits? A) Solar energy is expensive B) Solar energy is renewable C) Solar energy is unreliable D) Solar energy is outdated. Answer: B
2. In the sentence "The policy was futile," futile means: A) Effective B) Useless C) Popular D) Complex. Answer: B
3. A passage states, "He smiled despite the loss." What can be inferred? A) He was unaffected B) He was angry C) He was optimistic D) He was confused. Answer: C

SUMMARY
- Focus on main ideas, vocabulary, and inferences.
- Practice time management with passages.
- Use context clues and evidence to answer questions.
                        `
                    }
                };
                return specificPlans[subject]?.[topic] || `
INTRODUCTION
The topic "${topic}" is a critical component of ${subject} in the University of Ibadan POST UTME, forming the foundation for key concepts tested in the exam.

DEFINITIONS
- Term 1: Basic principle of ${topic}. Example: A fundamental rule or definition.
- Term 2: Common pattern in ${topic}. Example: A typical scenario.
- Term 3: Key terminology. Example: A core word or phrase.
- Term 4: Application of ${topic}. Example: A practical use.
- Term 5: Related concept. Example: A connected idea.

CORE CONCEPTS
- Concept 1: Understand the principles of ${topic}.
- Concept 2: Identify patterns and applications.
- Concept 3: Master problem-solving techniques.
- Concept 4: Learn key terms and definitions.
- Concept 5: Explore real-world examples.

DETAILED EXPLANATIONS
Start by reviewing the fundamentals of ${topic}. Practice with examples to understand the 'why' behind each concept.

POST UTME EXAM TIPS
The University of Ibadan tests ${topic} through multiple-choice questions requiring theoretical and practical knowledge.

PRACTICE QUESTIONS
1. What is a key aspect of ${topic}? A) Option 1 B) Option 2 C) Option 3 D) Option 4. Answer: C
2. Define a term in ${topic}: A) Definition 1 B) Definition 2 C) Definition 3 D) Definition 4. Answer: B
3. Apply ${topic}: A) Application 1 B) Application 2 C) Application 3 D) Application 4. Answer: A

SUMMARY
- ${topic} is foundational for ${subject}.
- Focus on definitions and core concepts.
- Practice regularly to master exam questions.
                `;
            }

            formatStudyPlan(text) {
                return text
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                    .replace(/###\s*([^\n]+)/g, '<h3 class="text-xl font-bold mt-6 mb-3 text-blue-300">$1</h3>')
                    .replace(/##\s*([^\n]+)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-green-300">$1</h2>')
                    .replace(/^\d+\.\s*([^\n]+)/gm, '<div class="mt-4 mb-2"><strong class="text-yellow-300">$1</strong></div>')
                    .replace(/^[-•]\s*([^\n]+)/gm, '<div class="ml-4 mb-1">• $1</div>')
                    .replace(/\n\n/g, '<div class="mb-4"></div>');
            }

            updateStudyProgress() {
                if (!this.studiedTopics[this.currentStudySubject]) {
                    this.studiedTopics[this.currentStudySubject] = [];
                }
                const totalTopics = this.getSubjectTopics(this.currentStudySubject).length;
                const studiedCount = this.studiedTopics[this.currentStudySubject].length;
                const percentage = Math.round((studiedCount / totalTopics) * 100);
                this.studyProgress.textContent = `${percentage}%`;
                this.studyProgressBar.style.width = `${percentage}%`;
            }

            markTopicAsStudied() {
                if (!this.studiedTopics[this.currentStudySubject]) {
                    this.studiedTopics[this.currentStudySubject] = [];
                }
                if (!this.studiedTopics[this.currentStudySubject].includes(this.currentTopic)) {
                    this.studiedTopics[this.currentStudySubject].push(this.currentTopic);
                    this.setLocalStorage('studiedTopics', this.studiedTopics);
                    this.updateStudyProgress();
                    const button = this.markAsStudied;
                    const originalText = button.textContent;
                    button.textContent = '✓ Marked as Studied!';
                    button.classList.add('bg-green-700');
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('bg-green-700');
                    }, 2000);
                }
            }

            async startTopicBasedQuiz() {
                this.currentSubject = this.currentStudySubject;
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.sessionData = [];
                this.totalQuestions = 5;
                this.isTopicBasedQuiz = true;
                this.currentTopicContext = this.currentTopic;
                this.hideAllSections();
                this.quizSection.classList.remove('hidden');
                this.loadingPage.classList.remove('hidden');
                try {
                    await this.loadQuestion();
                    this.loadingPage.classList.add('hidden');
                } catch (error) {
                    console.error('Topic quiz error:', error);
                    this.showError('Failed to start topic quiz. Please try again.');
                    this.loadingPage.classList.add('hidden');
                    this.showStudyPlan(this.currentStudySubject);
                }
            }

            async searchWikipedia() {
                const query = this.wikiSearchInput.value.trim();
                if (!query) {
                    this.showError('Please enter a search term');
                    this.wikiResults.innerHTML = '';
                    return;
                }

                // Check cache
                if (this.wikiCache[query]) {
                    this.wikiResults.innerHTML = this.wikiCache[query];
                    return;
                }

                // Rate limiting
                const now = Date.now();
                if (now - this.lastWikiRequestTime < this.minRequestInterval) {
                    await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - (now - this.lastWikiRequestTime)));
                }
                this.lastWikiRequestTime = now;

                this.wikiResults.innerHTML = `
                    <div class="flex items-center justify-center py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span class="ml-2">Searching Wikipedia...</span>
                    </div>
                `;

                try {
                    const baseUrl = 'https://en.wikipedia.org/api/rest_v1';
                    const searchUrl = `${baseUrl}/page/search/${encodeURIComponent(query)}?origin=*`;
                    const searchResponse = await this.fetchWithTimeout(searchUrl, {
                        headers: { 'User-Agent': 'POSTUTMECBT/1.0 (contact@example.com)' }
                    }, 10000);
                    const searchData = await searchResponse.json();
                    const page = searchData.pages[0];
                    if (!page) {
                        this.wikiResults.innerHTML = `
                            <div class="text-yellow-400 p-4 bg-yellow-900/20 rounded">
                                <h3 class="font-bold mb-2">No Results</h3>
                                <p>No Wikipedia articles found for "${query}". Try a different search term.</p>
                            </div>
                        `;
                        return;
                    }

                    const summaryUrl = `${baseUrl}/page/summary/${encodeURIComponent(page.title)}?origin=*`;
                    const summaryResponse = await this.fetchWithTimeout(summaryUrl, {
                        headers: { 'User-Agent': 'POSTUTMECBT/1.0 (contact@example.com)' }
                    }, 10000);
                    const summaryData = await summaryResponse.json();

                    const mediaUrl = `${baseUrl}/page/media/${encodeURIComponent(page.title)}?origin=*`;
                    const mediaResponse = await this.fetchWithTimeout(mediaUrl, {
                        headers: { 'User-Agent': 'POSTUTMECBT/1.0 (contact@example.com)' }
                    }, 10000);
                    const mediaData = await mediaResponse.json();
                    const images = mediaData.items?.slice(0, 3).map(item => ({
                        src: item.srcset?.[0]?.src || item.url || '',
                        caption: item.caption?.text || 'Image related to ' + page.title
                    })) || [];

                    const html = `
                        <h2 class="text-2xl font-bold mb-4">${summaryData.title || 'Untitled'}</h2>
                        <div class="whitespace-pre-line leading-relaxed text-gray-100">
                            ${summaryData.extract || 'No summary available.'}
                        </div>
                        ${images.length ? `
                            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                ${images.map(img => `
                                    <div>
                                        <img src="${img.src}" alt="${img.caption}" class="w-full h-auto rounded" onerror="this.src='https://via.placeholder.com/200'; this.alt='Image unavailable';">
                                        <p class="text-sm mt-2">${img.caption}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="mt-4">
                            <a href="${summaryData.content_urls?.desktop?.page || '#'}"
                               target="_blank" class="text-blue-400 hover:underline">Read more on Wikipedia</a>
                        </div>
                    `;
                    this.wikiResults.innerHTML = html;
                    this.wikiCache[query] = html;
                    this.setLocalStorage('wikiCache', this.wikiCache);
                } catch (error) {
                    console.error('Wikipedia search error:', error);
                    this.wikiResults.innerHTML = `
                        <div class="text-yellow-400 p-4 bg-yellow-900/20 rounded">
                            <h3 class="font-bold mb-2">Error</h3>
                            <p>Unable to fetch Wikipedia data: ${error.message}. Please try again or check your connection.</p>
                        </div>
                    `;
                }
            }

            showCalculator() {
                this.calculatorModal.classList.remove('hidden');
                this.calculatorClear();
            }

            closeCalculator() {
                this.calculatorModal.classList.add('hidden');
            }

            calculatorInput(value) {
                this.calculatorState.expression += value;
                this.calculatorDisplay.textContent = this.calculatorState.expression || '0';
            }

            calculatorClear() {
                this.calculatorState.expression = '';
                this.calculatorState.result = 0;
                this.calculatorDisplay.textContent = '0';
            }

            calculatorEvaluate() {
                try {
                    this.calculatorState.result = eval(this.calculatorState.expression);
                    this.calculatorDisplay.textContent = this.calculatorState.result;
                    this.calculatorState.expression = this.calculatorState.result.toString();
                } catch (error) {
                    this.calculatorDisplay.textContent = 'Error';
                    this.calculatorState.expression = '';
                }
            }

            calculatorFunction(func) {
                try {
                    if (func === 'sqrt') {
                        const result = Math.sqrt(parseFloat(this.calculatorState.expression));
                        this.calculatorDisplay.textContent = result;
                        this.calculatorState.expression = result.toString();
                    } else if (func === 'pow') {
                        const result = Math.pow(parseFloat(this.calculatorState.expression), 2);
                        this.calculatorDisplay.textContent = result;
                        this.calculatorState.expression = result.toString();
                    } else if (func === 'sin') {
                        const result = Math.sin(parseFloat(this.calculatorState.expression) * Math.PI / 180);
                        this.calculatorDisplay.textContent = result;
                        this.calculatorState.expression = result.toString();
                    } else if (func === 'cos') {
                        const result = Math.cos(parseFloat(this.calculatorState.expression) * Math.PI / 180);
                        this.calculatorDisplay.textContent = result;
                        this.calculatorState.expression = result.toString();
                    } else if (func === 'tan') {
                        const result = Math.tan(parseFloat(this.calculatorState.expression) * Math.PI / 180);
                        this.calculatorDisplay.textContent = result;
                        this.calculatorState.expression = result.toString();
                    } else if (func === 'quad') {
                        const coeffs = prompt('Enter coefficients a, b, c for ax² + bx + c = 0 (e.g., 1, -3, 2)').split(',').map(Number);
                        if (coeffs.length === 3 && coeffs.every(n => !isNaN(n))) {
                            const [a, b, c] = coeffs;
                            const discriminant = b * b - 4 * a * c;
                            if (discriminant < 0) {
                                this.calculatorDisplay.textContent = 'No real roots';
                            } else {
                                const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                                const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                                this.calculatorDisplay.textContent = `Roots: ${root1}, ${root2}`;
                            }
                            this.calculatorState.expression = '';
                        } else {
                            this.calculatorDisplay.textContent = 'Invalid input';
                        }
                    }
                } catch (error) {
                    this.calculatorDisplay.textContent = 'Error';
                    this.calculatorState.expression = '';
                }
            }

            async fetchWithTimeout(url, options, timeout = 10000) {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                try {
                    const response = await fetch(url, { ...options, signal: controller.signal });
                    clearTimeout(id);
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    return response;
                } catch (error) {
                    clearTimeout(id);
                    throw error;
                }
            }

            showError(message) {
                alert(message);
            }
        }

        const app = new QuizApp();
