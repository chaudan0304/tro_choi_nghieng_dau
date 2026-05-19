// --- CÂU HỎI MẶC ĐỊNH ---
        const DEFAULT_QUESTIONS = [
            { q: "HTML viết tắt của từ gì?", a: "Hyper Text Markup Language", b: "Home Tool Markup Language", c: "Hyperlinks Text Mark Language", d: "Hyper Tool Markup Language", correct: "A" },
            { q: "Trong CSS, thuộc tính nào đổi màu chữ?", a: "background-color", b: "color", c: "text-color", d: "font-color", correct: "B" },
            { q: "JavaScript chạy được ở đâu?", a: "Chỉ trên Server", b: "Chỉ trên Trình duyệt", c: "Cả Server và Trình duyệt", d: "Chỉ trên máy ảo", correct: "C" },
            { q: "Thẻ nào tạo liên kết trong HTML?", a: "Thẻ a", b: "Thẻ link", c: "Thẻ href", d: "Thẻ src", correct: "A" },
            { q: "1 Megabyte bằng bao nhiêu Kilobyte?", a: "1000 KB", b: "1024 KB", c: "100 KB", d: "1048 KB", correct: "B" },
            { q: "Đâu là Framework của JavaScript?", a: "Laravel", b: "Django", c: "Spring", d: "React", correct: "D" },
        ];

        // --- QUẢN LÝ DỮ LIỆU CÂU HỎI (localStorage) ---
        const STORAGE_KEY = 'quizgame_questions';

        function loadQuestions() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {
                console.error("Lỗi đọc dữ liệu:", e);
            }
            return JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
        }

        function saveQuestions(qs) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
            } catch (e) {
                console.error("Lỗi lưu dữ liệu:", e);
            }
        }


        let questions = loadQuestions();

        // --- SHUFFLE ---
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            return a;
        }

        // --- CẤU HÌNH ---
        const CONFIG = {
            tiltThreshold: 18,
            holdTimeMs: 800,
            timerSeconds: 15,
        };

        // --- TRẠNG THÁI GAME ---
        let state = {
            isPlaying: false,
            isAnswering: false,
            playerNum: 1,
            currentQIndex: 0,
            cameraReady: false,
            shuffledQuestions: [],
            teams: [],
            // Hold-to-confirm
            holdDirection: null,
            holdStart: 0,
            holdConfirmed: false,
            // Timer
            timerRemaining: 0,
            timerInterval: null,
        };

        // --- DOM ---
        const videoElement = document.getElementById('video');
        const canvasElement = document.getElementById('output_canvas');
        const canvasCtx = canvasElement.getContext('2d');
        const loadingText = document.getElementById('loadingCam');
        const errorCam = document.getElementById('errorCam');
        const tiltIndicator = document.getElementById('tiltIndicator');
        const holdRing = document.getElementById('holdRing');
        const holdCircle = document.getElementById('holdCircle');
        const holdLabel = document.getElementById('holdLabel');
        const CIRCUMFERENCE = 2 * Math.PI * 25; // r=25

        const ui = {
            menuView: document.getElementById('menuView'),
            gameView: document.getElementById('gameView'),
            scoreboard: document.getElementById('scoreboard'),
            numTeamsSelect: document.getElementById('numTeamsSelect'),
            t1Group: document.getElementById('t1Group'),
            t2Group: document.getElementById('t2Group'),
            t3Group: document.getElementById('t3Group'),
            t4Group: document.getElementById('t4Group'),
            team1Input: document.getElementById('team1Input'),
            team2Input: document.getElementById('team2Input'),
            team3Input: document.getElementById('team3Input'),
            team4Input: document.getElementById('team4Input'),
            musicInput: document.getElementById('musicInput'),
            chooseMusicBtn: document.getElementById('chooseMusicBtn'),
            musicStatus: document.getElementById('musicStatus'),
            menuStartBtn: document.getElementById('menuStartBtn'),
            menuManageBtn: document.getElementById('menuManageBtn'),
            menuQuitBtn: document.getElementById('menuQuitBtn'),
            playerInfo: document.getElementById('playerInfo'),
            questionText: document.getElementById('questionText'),
            questionCard: document.getElementById('questionCard'),
            textA: document.getElementById('textA'),
            textB: document.getElementById('textB'),
            textC: document.getElementById('textC'),
            textD: document.getElementById('textD'),
            ansA: document.getElementById('ansA'),
            ansB: document.getElementById('ansB'),
            ansC: document.getElementById('ansC'),
            ansD: document.getElementById('ansD'),
            feedback: document.getElementById('feedback'),
            startBtn: document.getElementById('startBtn'),
            homeBtn: document.getElementById('homeBtn'),
            endGameBtn: document.getElementById('endGameBtn'),
            progressContainer: document.getElementById('progressContainer'),
            progressLabel: document.getElementById('progressLabel'),
            progressPercent: document.getElementById('progressPercent'),
            progressFill: document.getElementById('progressFill'),
            timerBarContainer: document.getElementById('timerBarContainer'),
            timerBarFill: document.getElementById('timerBarFill'),
            timerText: document.getElementById('timerText'),
        };

        // --- CONFETTI ---
        const confettiCtx = document.getElementById('confettiCanvas').getContext('2d');
        function resizeConfetti() {
            document.getElementById('confettiCanvas').width = window.innerWidth;
            document.getElementById('confettiCanvas').height = window.innerHeight;
        }
        window.addEventListener('resize', resizeConfetti);
        resizeConfetti();

        let particles = [];
        const colors = ['#6c5ce7', '#a29bfe', '#fd7272', '#55efc4', '#f1c40f'];
        let confettiAnimationId = null;

        function fireConfetti(amount = 100) {
            for (let i = 0; i < amount; i++) {
                particles.push({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20 - 5,
                    size: Math.random() * 8 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    rot: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 10
                });
            }
            if (!confettiAnimationId) animateConfetti();
        }

        function animateConfetti() {
            confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // gravity
                p.life -= 0.01;
                p.rot += p.rotSpeed;
                
                confettiCtx.save();
                confettiCtx.globalAlpha = Math.max(p.life, 0);
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rot * Math.PI) / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                confettiCtx.restore();

                if (p.life <= 0) particles.splice(i, 1);
            }
            if (particles.length > 0) {
                confettiAnimationId = requestAnimationFrame(animateConfetti);
            } else {
                confettiAnimationId = null;
            }
        }

        // --- ÂM THANH ---
        let audioCtx;
        let musicMuted = false;
        let bgMusicInterval = null;
        let masterGain = null;
        let sfxGain = null;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioCtx.createGain();
                masterGain.gain.value = 0.15;
                masterGain.connect(audioCtx.destination);
                sfxGain = audioCtx.createGain();
                sfxGain.gain.value = 0.5;
                sfxGain.connect(audioCtx.destination);
            }
        }

        // --- NHẠC NỀN VUI NHỘN (Chiptune style) ---
        const MELODY_NOTES = [
            // Giai điệu vui nhộn kiểu game show
            523, 587, 659, 784, 659, 587, 523, 0,
            659, 784, 880, 784, 659, 784, 880, 0,
            784, 880, 988, 880, 784, 659, 587, 0,
            523, 659, 784, 880, 784, 659, 523, 0,
        ];
        const BASS_NOTES = [
            262, 262, 330, 330, 349, 349, 392, 392,
            330, 330, 392, 392, 440, 440, 392, 392,
            349, 349, 440, 440, 494, 494, 440, 440,
            262, 262, 392, 392, 349, 349, 262, 262,
        ];

        let customAudio = new Audio();
        let usingCustomMusic = false;
        let melodyIndex = 0;

        function playBgMusic() {
            if (!audioCtx || musicMuted) return;
            stopBgMusic();
            
            if (usingCustomMusic) {
                customAudio.loop = true;
                customAudio.volume = 0.5;
                customAudio.play().catch(e => console.log('Chưa tương tác'));
                return;
            }

            melodyIndex = 0;
            const bpm = 180;
            const interval = (60 / bpm) * 1000;

            function playBeat() {
                if (!audioCtx || musicMuted) return;
                const t = audioCtx.currentTime;
                const dur = interval / 1000 * 0.8;
                const note = MELODY_NOTES[melodyIndex % MELODY_NOTES.length];
                const bass = BASS_NOTES[melodyIndex % BASS_NOTES.length];

                // Melody
                if (note > 0) {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = note;
                    g.gain.setValueAtTime(0.12, t);
                    g.gain.exponentialRampToValueAtTime(0.01, t + dur);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(t);
                    osc.stop(t + dur);
                }

                // Bass
                if (bass > 0) {
                    const osc2 = audioCtx.createOscillator();
                    const g2 = audioCtx.createGain();
                    osc2.type = 'triangle';
                    osc2.frequency.value = bass / 2;
                    g2.gain.setValueAtTime(0.1, t);
                    g2.gain.exponentialRampToValueAtTime(0.01, t + dur);
                    osc2.connect(g2);
                    g2.connect(masterGain);
                    osc2.start(t);
                    osc2.stop(t + dur);
                }

                // Hi-hat percussion
                if (melodyIndex % 2 === 0) {
                    const noise = audioCtx.createBufferSource();
                    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
                    noise.buffer = buf;
                    const ng = audioCtx.createGain();
                    ng.gain.setValueAtTime(0.08, t);
                    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                    noise.connect(ng);
                    ng.connect(masterGain);
                    noise.start(t);
                }

                melodyIndex++;
            }

            playBeat();
            bgMusicInterval = setInterval(playBeat, interval);
        }

        function stopBgMusic() {
            if (bgMusicInterval) { clearInterval(bgMusicInterval); bgMusicInterval = null; }
        }

        // Toggle music
        const musicBtn = document.getElementById('musicBtn');
        musicBtn.addEventListener('click', () => {
            initAudio();
            musicMuted = !musicMuted;
            musicBtn.textContent = musicMuted ? '🔇' : '🔊';
            musicBtn.classList.toggle('muted', musicMuted);
            if (musicMuted) {
                stopBgMusic();
            } else if (state.isPlaying) {
                playBgMusic();
            }
        });

        // --- SFX ---
        function playSound(type) {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(sfxGain || audioCtx.destination);
            if (type === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                osc.start(); osc.stop(audioCtx.currentTime + 0.5);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                osc.start(); osc.stop(audioCtx.currentTime + 0.5);
            } else if (type === 'timeout') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
                osc.start(); osc.stop(audioCtx.currentTime + 0.6);
            } else if (type === 'victory') {
                // Nhạc chiến thắng
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = 'sine';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.4, audioCtx.currentTime + i * 0.15);
                    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.4);
                    o.connect(g); g.connect(sfxGain || audioCtx.destination);
                    o.start(audioCtx.currentTime + i * 0.15);
                    o.stop(audioCtx.currentTime + i * 0.15 + 0.4);
                });
            }
        }

        // --- TIMER ---
        function startTimer() {
            clearInterval(state.timerInterval);
            state.timerRemaining = CONFIG.timerSeconds;
            ui.timerBarContainer.style.display = 'block';
            ui.timerText.style.display = 'block';
            updateTimerUI();
            state.timerInterval = setInterval(() => {
                state.timerRemaining -= 0.1;
                if (state.timerRemaining <= 0) {
                    state.timerRemaining = 0;
                    clearInterval(state.timerInterval);
                    handleTimeout();
                }
                updateTimerUI();
            }, 100);
        }

        function stopTimer() {
            clearInterval(state.timerInterval);
        }

        function updateTimerUI() {
            const pct = (state.timerRemaining / CONFIG.timerSeconds) * 100;
            ui.timerBarFill.style.width = pct + '%';
            ui.timerText.textContent = `⏱️ ${Math.ceil(state.timerRemaining)}s`;
            ui.timerBarFill.classList.toggle('warning', pct <= 40 && pct > 20);
            ui.timerBarFill.classList.toggle('critical', pct <= 20);
        }

        function handleTimeout() {
            if (!state.isPlaying || state.isAnswering) return;
            state.isAnswering = true;
            playSound('timeout');
            const q = state.shuffledQuestions[state.currentQIndex];
            (q.correct === 'A' ? ui.ansA : q.correct === 'B' ? ui.ansB : q.correct === 'C' ? ui.ansC : ui.ansD).classList.add('correct');
            ui.feedback.style.color = 'var(--danger)';
            ui.feedback.textContent = "⏰ Hết giờ!";
            resetHold();
            setTimeout(() => { nextQuestion(); }, 2000);
        }

        // --- PROGRESS ---
        function updateProgress() {
            const total = state.shuffledQuestions.length;
            const cur = state.currentQIndex + 1;
            const pct = (cur / total) * 100;
            ui.progressLabel.textContent = `Câu ${cur}/${total}`;
            ui.progressPercent.textContent = `${Math.round(pct)}%`;
            ui.progressFill.style.width = pct + '%';
        }

        // --- LOGIC GAME ---
        function updateUI() {
            const currentTeamIndex = (state.playerNum - 1) % state.teams.length;
            const team = state.teams[currentTeamIndex];
            const isGroup1Color = currentTeamIndex % 2 === 0;
            const color = isGroup1Color ? 'var(--group1)' : 'var(--group2)';
            ui.playerInfo.innerHTML = `Lượt: <b>#${state.playerNum}</b> — <span style="color:${color}">${escapeHtml(team.name)}</span>`;
            
            for (let i = 0; i < state.teams.length; i++) {
                const box = document.getElementById(`scoreBox${i}`);
                if (box) box.classList.toggle('active', i === currentTeamIndex);
            }

            const q = state.shuffledQuestions[state.currentQIndex];
            ui.questionText.textContent = `Câu ${state.currentQIndex + 1}: ${q.q}`;
            ui.textA.textContent = q.a;
            ui.textB.textContent = q.b;
            ui.textC.textContent = q.c || '';
            ui.textD.textContent = q.d || '';
            ui.ansA.className = 'answer-btn';
            ui.ansB.className = 'answer-btn';
            ui.ansC.className = 'answer-btn';
            ui.ansD.className = 'answer-btn';
            ui.ansC.style.display = q.c ? '' : 'none';
            ui.ansD.style.display = q.d ? '' : 'none';
            ui.feedback.textContent = '';

            updateProgress();
            startTimer();
        }

        function handleAnswer(answer) {
            if (!state.isPlaying || state.isAnswering) return;
            state.isAnswering = true;
            stopTimer();
            resetHold();

            const q = state.shuffledQuestions[state.currentQIndex];
            const isCorrect = answer === q.correct;
            const isGroup1 = state.playerNum % 2 !== 0;
            const selectedBtn = answer === 'A' ? ui.ansA : answer === 'B' ? ui.ansB : answer === 'C' ? ui.ansC : ui.ansD;
            selectedBtn.classList.add('selected');

            setTimeout(() => {
                if (isCorrect) {
                    playSound('correct');
                    fireConfetti(50); // Bắn pháo giấy
                    selectedBtn.classList.add('correct');
                    ui.feedback.style.color = 'var(--success)';
                    ui.feedback.textContent = "🎉 Chính xác!";
                    const currentTeamIndex = (state.playerNum - 1) % state.teams.length;
                    state.teams[currentTeamIndex].score += 10;
                    const valEl = document.getElementById(`scoreVal${currentTeamIndex}`);
                    if (valEl) valEl.textContent = state.teams[currentTeamIndex].score;
                    
                    const box = document.getElementById(`scoreBox${currentTeamIndex}`);
                    if (box) {
                        box.classList.add('animate');
                        setTimeout(() => box.classList.remove('animate'), 500);
                    }
                } else {
                    playSound('wrong');
                    selectedBtn.classList.add('wrong');
                    ui.feedback.style.color = 'var(--danger)';
                    ui.feedback.textContent = "❌ Sai rồi!";
                    (q.correct === 'A' ? ui.ansA : q.correct === 'B' ? ui.ansB : q.correct === 'C' ? ui.ansC : ui.ansD).classList.add('correct');
                }
                setTimeout(() => { nextQuestion(); }, 2000);
            }, 500);
        }

        function nextQuestion() {
            state.currentQIndex++;
            state.playerNum++;
            if (state.currentQIndex < state.shuffledQuestions.length) {
                state.isAnswering = false;
                updateUI();
            } else {
                endGame();
            }
        }

        function startGame() {
            if (questions.length === 0) { alert('Chưa có câu hỏi nào! Hãy thêm câu hỏi trước.'); return; }
            initAudio();
            state.isPlaying = true;
            state.isAnswering = false;
            state.playerNum = 1;
            state.currentQIndex = 0;
            state.teams.forEach(t => t.score = 0);
            state.shuffledQuestions = shuffle(questions);
            state.holdDirection = null;
            state.holdStart = 0;
            state.holdConfirmed = false;

            for (let i = 0; i < state.teams.length; i++) {
                const valEl = document.getElementById(`scoreVal${i}`);
                if (valEl) valEl.textContent = "0";
            }
            ui.startBtn.style.display = 'none';
            ui.homeBtn.style.display = 'none';
            ui.endGameBtn.style.display = 'inline-block';
            tiltIndicator.style.display = 'block';
            ui.progressContainer.style.display = 'block';
            ui.ansA.style.display = '';
            ui.ansB.style.display = '';
            ui.ansC.style.display = '';
            ui.ansD.style.display = '';

            updateUI();
            playBgMusic();
        }

        function endGame() {
            state.isPlaying = false;
            stopBgMusic();
            playSound('victory');
            fireConfetti(200); // Bắn pháo giấy mạnh khi kết thúc
            stopTimer();
            tiltIndicator.style.display = 'none';
            holdRing.style.display = 'none';
            ui.timerBarContainer.style.display = 'none';
            ui.timerText.style.display = 'none';
            ui.playerInfo.innerHTML = "<b>🏁 TRÒ CHƠI KẾT THÚC!</b>";

            let result = "";
            if (state.teams.length === 1) {
                result = `Hoàn thành! Bạn được ${state.teams[0].score} điểm.`;
            } else {
                let maxScore = -1;
                let winners = [];
                state.teams.forEach(t => {
                    if (t.score > maxScore) { maxScore = t.score; winners = [t.name]; }
                    else if (t.score === maxScore) { winners.push(t.name); }
                });
                if (winners.length === state.teams.length) result = "🤝 Kết quả Hòa!";
                else result = `🏆 ${winners.join(' & ')} Chiến Thắng!`;
            }
            ui.questionText.textContent = result;
            ui.ansA.style.display = 'none';
            ui.ansB.style.display = 'none';
            ui.ansC.style.display = 'none';
            ui.ansD.style.display = 'none';
            ui.feedback.textContent = state.teams.map(t => `${t.name}: ${t.score}`).join(' | ');
            ui.feedback.style.color = 'var(--text)';

            ui.startBtn.textContent = "🔄 Chơi Lại";
            ui.startBtn.style.display = 'inline-block';
            ui.homeBtn.style.display = 'inline-block';
            ui.endGameBtn.style.display = 'none';
        }

        ui.startBtn.addEventListener('click', startGame);
        ui.endGameBtn.addEventListener('click', endGame);

        ui.homeBtn.addEventListener('click', () => {
            state.isPlaying = false;
            stopBgMusic();
            stopTimer();
            ui.gameView.classList.add('hidden');
            ui.menuView.classList.remove('hidden');
            ui.startBtn.style.display = 'inline-block';
            ui.startBtn.textContent = "🎮 Bắt đầu ngay";
            ui.startBtn.disabled = false;
            ui.homeBtn.style.display = 'none';
            ui.endGameBtn.style.display = 'none';
            ui.playerInfo.innerHTML = "Nhấn Bắt đầu để chơi!";
            ui.questionText.textContent = "Sẵn sàng chưa?";
            ui.ansA.style.display = '';
            ui.ansB.style.display = '';
            ui.ansC.style.display = '';
            ui.ansD.style.display = '';
            ui.textA.textContent = "Đáp án A";
            ui.textB.textContent = "Đáp án B";
            ui.textC.textContent = "Đáp án C";
            ui.textD.textContent = "Đáp án D";
            ui.ansA.className = 'answer-btn';
            ui.ansB.className = 'answer-btn';
            ui.ansC.className = 'answer-btn';
            ui.ansD.className = 'answer-btn';
            ui.feedback.textContent = "";
            ui.progressFill.style.width = "0%";
            ui.progressLabel.textContent = "Câu 0/0";
            ui.progressPercent.textContent = "0%";
            tiltIndicator.style.display = 'none';
            holdRing.style.display = 'none';
            ui.timerBarContainer.style.display = 'none';
            ui.timerText.style.display = 'none';
        });

        ui.numTeamsSelect.addEventListener('change', (e) => {
            const n = parseInt(e.target.value);
            ui.t1Group.style.display = n >= 1 ? 'block' : 'none';
            ui.t2Group.style.display = n >= 2 ? 'block' : 'none';
            ui.t3Group.style.display = n >= 3 ? 'block' : 'none';
            ui.t4Group.style.display = n >= 4 ? 'block' : 'none';
        });

        ui.chooseMusicBtn.addEventListener('click', () => ui.musicInput.click());

        ui.musicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                ui.musicStatus.textContent = "Đang dùng: " + file.name;
                usingCustomMusic = true;
                customAudio.src = url;
                localStorage.setItem('quizgame_music_name', file.name);
            }
        });

        const savedMusicName = localStorage.getItem('quizgame_music_name');
        if (savedMusicName) {
            ui.musicStatus.textContent = "Nhạc đã chọn: " + savedMusicName + " (chọn lại khi mở app)";
        }

        ui.menuStartBtn.addEventListener('click', () => {
            const numTeams = parseInt(ui.numTeamsSelect.value);
            state.teams = [];
            const inputs = [ui.team1Input, ui.team2Input, ui.team3Input, ui.team4Input];
            const colors = ['group1', 'group2', 'group1', 'group2']; // Mượn tạm 2 màu CSS
            
            ui.scoreboard.innerHTML = '';
            for (let i = 0; i < numTeams; i++) {
                const name = inputs[i].value.trim() || `Đội ${i+1}`;
                state.teams.push({ name, score: 0 });
                ui.scoreboard.innerHTML += `<div id="scoreBox${i}" class="score-box ${colors[i]}">${escapeHtml(name)}: <span id="scoreVal${i}">0</span></div>`;
            }

            // Chuyển màn hình
            ui.menuView.classList.add('hidden');
            ui.gameView.classList.remove('hidden');
        });

        ui.menuManageBtn.addEventListener('click', () => {
            openModal();
        });

        ui.menuQuitBtn.addEventListener('click', () => {
            window.close();
        });

        // --- HOLD-TO-CONFIRM LOGIC ---
        function resetHold() {
            state.holdDirection = null;
            state.holdStart = 0;
            state.holdConfirmed = false;
            holdRing.style.display = 'none';
            holdCircle.style.strokeDashoffset = CIRCUMFERENCE;
            tiltIndicator.style.background = 'rgba(0,0,0,0.7)';
        }

        function updateHold(direction) {
            const now = performance.now();
            if (direction === null) { resetHold(); return; }
            if (state.holdConfirmed) return;

            if (state.holdDirection !== direction) {
                state.holdDirection = direction;
                state.holdStart = now;
            }

            const elapsed = now - state.holdStart;
            const progress = Math.min(elapsed / CONFIG.holdTimeMs, 1);

            holdRing.style.display = 'block';
            let icon = direction === 'A' ? '👈' : direction === 'B' ? '👉' : direction === 'C' ? '👆' : '👇';
            holdLabel.textContent = icon;
            holdCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
            tiltIndicator.style.background = `rgba(108,92,231,${0.3 + progress * 0.5})`;

            if (progress >= 1) {
                state.holdConfirmed = true;
                holdCircle.style.stroke = 'var(--success)';
                handleAnswer(direction);
            }
        }

        // --- MEDIAPIPE ---
        function onResults(results) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                // Ẩn đường viền lưới khuôn mặt theo yêu cầu
                // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });

                const leftEye = landmarks[33];
                const rightEye = landmarks[263];
                const dx = rightEye.x - leftEye.x;
                const dy = rightEye.y - leftEye.y;
                let rollAngle = Math.atan2(dy, dx) * (180 / Math.PI);

                // Tính toán Pitch (Ngẩng / Cúi)
                const topFace = landmarks[10];
                const bottomFace = landmarks[152];
                const nose = landmarks[1];
                const faceHeight = bottomFace.y - topFace.y;
                const noseRatio = (nose.y - topFace.y) / faceHeight; 
                // Bình thường mũi nằm giữa (ratio ~0.5). Ngẩng đầu mũi lên cao (ratio < 0.45), cúi đầu mũi thấp (ratio > 0.58)

                if (state.isPlaying) {
                    tiltIndicator.innerText = `Nghiêng: ${Math.round(rollAngle)}° | Mũi: ${noseRatio.toFixed(2)}`;
                }

                if (state.isPlaying && !state.isAnswering) {
                    if (rollAngle > CONFIG.tiltThreshold) {
                        updateHold('A');
                    } else if (rollAngle < -CONFIG.tiltThreshold) {
                        updateHold('B');
                    } else if (noseRatio < 0.40) {
                        updateHold('C'); // Ngẩng cao
                    } else if (noseRatio > 0.60) {
                        updateHold('D'); // Cúi thấp
                    } else {
                        resetHold();
                    }
                }
            }
            canvasCtx.restore();
        }

        // --- KHỞI TẠO FACEMESH ---
        let faceMesh, camera;
        function initFaceMesh() {
            try {
                faceMesh = new FaceMesh({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                });
                faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
                faceMesh.onResults(onResults);

                camera = new Camera(videoElement, {
                    onFrame: async () => {
                        if (!state.cameraReady) {
                            state.cameraReady = true;
                            loadingText.style.display = 'none';
                            ui.startBtn.disabled = false;
                            ui.startBtn.textContent = "🎮 Bắt đầu ngay";
                            canvasElement.width = videoElement.videoWidth || 640;
                            canvasElement.height = videoElement.videoHeight || 480;
                        }
                        await faceMesh.send({ image: videoElement });
                    },
                    width: 640,
                    height: 480
                });
                camera.start().catch(handleCameraError);
            } catch (e) {
                handleCameraError(e);
            }
        }

        function handleCameraError(e) {
            console.error('Camera error:', e);
            loadingText.style.display = 'none';
            errorCam.style.display = 'block';
        }

        document.getElementById('retryCamera').addEventListener('click', () => {
            errorCam.style.display = 'none';
            loadingText.style.display = 'block';
            state.cameraReady = false;
            initFaceMesh();
        });

        initFaceMesh();

        // --- MODAL QUẢN LÝ CÂU HỎI ---
        const modal = document.getElementById('modalOverlay');
        const qList = document.getElementById('qList');
        const qForm = document.getElementById('qForm');
        const qListView = document.getElementById('qListView');
        let editingIndex = -1;

        document.getElementById('manageBtn').addEventListener('click', () => {
            if (state.isPlaying) { alert('Hãy kết thúc trò chơi trước!'); return; }
            openModal();
        });
        document.getElementById('modalClose').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        function openModal() {
            modal.classList.add('active');
            showListView();
        }
        function closeModal() {
            modal.classList.remove('active');
            editingIndex = -1;
        }

        function showListView() {
            qListView.style.display = 'block';
            qForm.classList.remove('active');
            renderQuestionList();
        }

        function renderQuestionList() {
            if (questions.length === 0) {
                qList.innerHTML = '<div class="empty-state">Chưa có câu hỏi nào.<br>Hãy thêm câu hỏi mới!</div>';
                return;
            }
            qList.innerHTML = questions.map((q, i) => `
                <div class="q-item">
                    <div class="q-num">${i + 1}</div>
                    <div class="q-content">
                        <div class="q-title">${escapeHtml(q.q)}</div>
                        <div class="q-answers">
                            A: ${escapeHtml(q.a)} ${q.correct === 'A' ? '<span class="correct-mark">✓</span>' : ''} &nbsp;|&nbsp;
                            B: ${escapeHtml(q.b)} ${q.correct === 'B' ? '<span class="correct-mark">✓</span>' : ''} <br>
                            C: ${escapeHtml(q.c || '')} ${q.correct === 'C' ? '<span class="correct-mark">✓</span>' : ''} &nbsp;|&nbsp;
                            D: ${escapeHtml(q.d || '')} ${q.correct === 'D' ? '<span class="correct-mark">✓</span>' : ''}
                        </div>
                    </div>
                    <div class="q-actions">
                        <button class="edit-btn" onclick="editQuestion(${i})">✏️</button>
                        <button class="del-btn" onclick="deleteQuestion(${i})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        function escapeHtml(s) {
            const d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        // Add
        document.getElementById('addQBtn').addEventListener('click', () => {
            editingIndex = -1;
            document.getElementById('qFormTitle').textContent = 'Thêm câu hỏi mới';
            document.getElementById('qInput').value = '';
            document.getElementById('qAInput').value = '';
            document.getElementById('qBInput').value = '';
            document.getElementById('qCInput').value = '';
            document.getElementById('qDInput').value = '';
            document.getElementById('qCorrectInput').value = 'A';
            qListView.style.display = 'none';
            qForm.classList.add('active');
        });

        // Edit
        window.editQuestion = function(i) {
            editingIndex = i;
            const q = questions[i];
            document.getElementById('qFormTitle').textContent = `Sửa câu hỏi #${i + 1}`;
            document.getElementById('qInput').value = q.q;
            document.getElementById('qAInput').value = q.a;
            document.getElementById('qBInput').value = q.b;
            document.getElementById('qCInput').value = q.c || '';
            document.getElementById('qDInput').value = q.d || '';
            document.getElementById('qCorrectInput').value = q.correct;
            qListView.style.display = 'none';
            qForm.classList.add('active');
        };

        // Delete
        window.deleteQuestion = function(i) {
            if (confirm(`Xóa câu hỏi #${i + 1}?`)) {
                questions.splice(i, 1);
                saveQuestions(questions);
                renderQuestionList();
            }
        };

        // Save form
        document.getElementById('qFormSave').addEventListener('click', () => {
            const q = document.getElementById('qInput').value.trim();
            const a = document.getElementById('qAInput').value.trim();
            const b = document.getElementById('qBInput').value.trim();
            const c = document.getElementById('qCInput').value.trim();
            const d = document.getElementById('qDInput').value.trim();
            const correct = document.getElementById('qCorrectInput').value;
            
            if (!q || !a || !b) { alert('Vui lòng điền tối thiểu Câu hỏi, Đáp án A và Đáp án B!'); return; }
            if ((c && !d) || (!c && d)) { alert('Nếu nhập thêm đáp án, vui lòng nhập cả C và D!'); return; }
            if (!c && !d && (correct === 'C' || correct === 'D')) { alert('Đáp án đúng không hợp lệ vì bạn chưa nhập C và D!'); return; }

            const obj = { q, a, b, c, d, correct };
            if (editingIndex >= 0) {
                questions[editingIndex] = obj;
            } else {
                questions.push(obj);
            }
            saveQuestions(questions);
            showListView();
        });

        // Cancel form
        document.getElementById('qFormCancel').addEventListener('click', showListView);

        // Export Excel
        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            const wsData = [
                ['Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng (A/B/C/D)']
            ];
            questions.forEach(q => {
                wsData.push([q.q, q.a, q.b, q.c || '', q.d || '', q.correct]);
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            // Tự động chỉnh độ rộng cột
            ws['!cols'] = [
                { wch: 40 }, // Câu hỏi
                { wch: 25 }, // Đáp án A
                { wch: 25 }, // Đáp án B
                { wch: 25 }, // Đáp án C
                { wch: 25 }, // Đáp án D
                { wch: 20 }, // Đáp án đúng
            ];
            XLSX.utils.book_append_sheet(wb, ws, 'Câu hỏi');
            XLSX.writeFile(wb, 'quiz_questions.xlsx');
        });

        // Import Excel
        document.getElementById('importExcelFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = new Uint8Array(ev.target.result);
                    const wb = XLSX.read(data, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

                    // Bỏ dòng tiêu đề nếu có
                    let startRow = 0;
                    if (rows.length > 0) {
                        const firstCell = String(rows[0][0] || '').toLowerCase();
                        if (firstCell.includes('câu') || firstCell.includes('question') || firstCell === 'q') {
                            startRow = 1;
                        }
                    }

                    const imported = [];
                    for (let i = startRow; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row || !row[0]) continue; // Bỏ dòng trống
                        const q = String(row[0] || '').trim();
                        const a = String(row[1] || '').trim();
                        const b = String(row[2] || '').trim();
                        const c = String(row[3] || '').trim();
                        const d = String(row[4] || '').trim();
                        let correct = String(row[5] || 'A').trim().toUpperCase();
                        if (!['A', 'B', 'C', 'D'].includes(correct)) correct = 'A';
                        if (q && a && b && c && d) {
                            imported.push({ q, a, b, c, d, correct });
                        }
                    }

                    if (imported.length === 0) throw new Error('No valid rows');
                    questions = imported;
                    saveQuestions(questions);
                    renderQuestionList();
                    alert(`✅ Đã nhập ${imported.length} câu hỏi từ Excel!`);
                } catch (err) {
                    alert('❌ File Excel không hợp lệ!\nCần có 6 cột: Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D)');
                }
                e.target.value = '';
            };
            reader.readAsArrayBuffer(file);
        });

        // Reset
        document.getElementById('resetQBtn').addEventListener('click', () => {
            if (confirm('Khôi phục câu hỏi mặc định? Dữ liệu hiện tại sẽ bị xóa.')) {
                questions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
                saveQuestions(questions);
                renderQuestionList();
            }
        });