// ============================================
// PREP2HIRE - AI HR INTERVIEW
// Frontend Mock Interview
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // Interview Questions
    // -----------------------------
    const questions = [
        "Tell me about yourself.",
        "Why did you choose Artificial Intelligence and Data Science as your field?",
        "What are your strengths?",
        "Tell me about a project you have worked on.",
        "Where do you see yourself in the next five years?"
    ];

    // -----------------------------
    // Interview State
    // -----------------------------
    let currentQuestion = 0;
    let interviewStarted = false;
    let interviewFinished = false;

    let timeRemaining = 10 * 60; // 10 minutes
    let timerInterval = null;

    let cameraStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];

    // Mock scores
    let answerScores = [];

    // -----------------------------
    // Get HTML Elements
    // -----------------------------
    const questionText = document.getElementById("questionText");
    const questionNumber = document.getElementById("questionNumber");
    const totalQuestions = document.getElementById("totalQuestions");

    const answerInput = document.getElementById("answerInput");

    const startBtn = document.getElementById("startInterviewBtn");
    const submitBtn = document.getElementById("submitAnswerBtn");

    const nextBtn = document.getElementById("nextQuestionBtn");

    const timerDisplay = document.getElementById("timer");

    const progressBar = document.getElementById("questionProgress");

    const interviewIntro = document.getElementById("interviewIntro");
    const interviewArea = document.getElementById("interviewArea");
    const completionArea = document.getElementById("completionArea");

    const camera = document.getElementById("candidateCamera");

    const cameraStatus = document.getElementById("cameraStatus");
    const microphoneStatus = document.getElementById("microphoneStatus");

    const recordingIndicator = document.getElementById("recordingIndicator");

    // -----------------------------
    // Selected Information
    // -----------------------------
    const selectedCompany =
        localStorage.getItem("selectedCompany") || "Selected Company";

    const selectedRole =
        localStorage.getItem("selectedRole") || "Selected Role";

    document.getElementById("companyName").textContent = selectedCompany;
    document.getElementById("roleName").textContent = selectedRole;

    totalQuestions.textContent = questions.length;

    // -----------------------------
    // Initial State
    // -----------------------------
    interviewArea.style.display = "none";
    completionArea.style.display = "none";

    submitBtn.disabled = true;
    nextBtn.style.display = "none";

    // -----------------------------
    // Display Question
    // -----------------------------
    function displayQuestion() {

        questionText.textContent = questions[currentQuestion];

        questionNumber.textContent = currentQuestion + 1;

        const progress =
            ((currentQuestion + 1) / questions.length) * 100;

        progressBar.style.width = `${progress}%`;

        progressBar.setAttribute(
            "aria-valuenow",
            progress
        );

        answerInput.value = "";

        submitBtn.disabled = false;
        nextBtn.style.display = "none";

        answerInput.disabled = false;
    }

    // -----------------------------
    // Start Interview
    // -----------------------------
    startBtn.addEventListener("click", async () => {

        interviewStarted = true;

        interviewIntro.style.display = "none";
        interviewArea.style.display = "block";

        startBtn.disabled = true;

        startTimer();

        displayQuestion();

        await startCamera();

        await setupMicrophone();
    });

    // -----------------------------
    // Timer
    // -----------------------------
    function startTimer() {

        updateTimer();

        timerInterval = setInterval(() => {

            if (timeRemaining <= 0) {

                clearInterval(timerInterval);

                finishInterview();

                return;
            }

            timeRemaining--;

            updateTimer();

        }, 1000);
    }

    function updateTimer() {

        const minutes =
            Math.floor(timeRemaining / 60);

        const seconds =
            timeRemaining % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // -----------------------------
    // Camera
    // -----------------------------
    async function startCamera() {

        try {

            cameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

            camera.srcObject = cameraStream;

            cameraStatus.textContent =
                "Camera connected";

            cameraStatus.className =
                "status-success";

            microphoneStatus.textContent =
                "Microphone connected";

            microphoneStatus.className =
                "status-success";

            setupMediaRecorder();

        } catch (error) {

            console.error(
                "Camera/Microphone error:",
                error
            );

            cameraStatus.textContent =
                "Camera unavailable";

            microphoneStatus.textContent =
                "Microphone unavailable";

            cameraStatus.className =
                "status-error";

            microphoneStatus.className =
                "status-error";
        }
    }

    // -----------------------------
    // Microphone Permission
    // -----------------------------
    async function setupMicrophone() {

        try {

            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            microphoneStatus.textContent =
                "Microphone ready";

        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );

            microphoneStatus.textContent =
                "Microphone permission denied";
        }
    }

    // -----------------------------
    // Media Recorder
    // -----------------------------
    function setupMediaRecorder() {

        if (!cameraStream) {
            return;
        }

        try {

            mediaRecorder =
                new MediaRecorder(cameraStream);

            mediaRecorder.ondataavailable =
                event => {

                    if (event.data.size > 0) {

                        recordedChunks.push(
                            event.data
                        );
                    }
                };

            mediaRecorder.onstart = () => {

                recordingIndicator.style.display =
                    "inline-flex";
            };

            mediaRecorder.onstop = () => {

                recordingIndicator.style.display =
                    "none";
            };

        } catch (error) {

            console.error(
                "MediaRecorder error:",
                error
            );
        }
    }

    // -----------------------------
    // Start Recording
    // -----------------------------
    document
        .getElementById("startRecordingBtn")
        .addEventListener("click", () => {

            if (!mediaRecorder) {

                alert(
                    "Camera or microphone is not available."
                );

                return;
            }

            if (
                mediaRecorder.state === "inactive"
            ) {

                recordedChunks = [];

                mediaRecorder.start();

                document.getElementById(
                    "startRecordingBtn"
                ).disabled = true;

                document.getElementById(
                    "stopRecordingBtn"
                ).disabled = false;
            }
        });

    // -----------------------------
    // Stop Recording
    // -----------------------------
    document
        .getElementById("stopRecordingBtn")
        .addEventListener("click", () => {

            if (
                mediaRecorder &&
                mediaRecorder.state === "recording"
            ) {

                mediaRecorder.stop();

                document.getElementById(
                    "startRecordingBtn"
                ).disabled = false;

                document.getElementById(
                    "stopRecordingBtn"
                ).disabled = true;
            }
        });

    // -----------------------------
    // Submit Answer
    // -----------------------------
    submitBtn.addEventListener("click", () => {

        const answer =
            answerInput.value.trim();

        if (!answer) {

            alert(
                "Please enter your answer before submitting."
            );

            return;
        }

        // ---------------------------------
        // Temporary frontend evaluation
        // ---------------------------------
        const score =
            calculateMockScore(answer);

        answerScores.push(score);

        submitBtn.disabled = true;

        answerInput.disabled = true;

        nextBtn.style.display =
            "inline-block";

    });

    // -----------------------------
    // Mock Answer Score
    // -----------------------------
    function calculateMockScore(answer) {

        const wordCount =
            answer.split(/\s+/).filter(Boolean).length;

        let score = 60;

        if (wordCount >= 20) {
            score += 10;
        }

        if (wordCount >= 40) {
            score += 10;
        }

        if (wordCount >= 70) {
            score += 10;
        }

        if (wordCount >= 100) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    // -----------------------------
    // Next Question
    // -----------------------------
    nextBtn.addEventListener("click", () => {

        if (
            currentQuestion <
            questions.length - 1
        ) {

            currentQuestion++;

            displayQuestion();

        } else {

            finishInterview();
        }
    });

    // -----------------------------
    // Finish Interview
    // -----------------------------
    function finishInterview() {

        if (interviewFinished) {
            return;
        }

        interviewFinished = true;

        clearInterval(timerInterval);

        stopCamera();

        interviewArea.style.display =
            "none";

        completionArea.style.display =
            "block";

        calculateFinalScore();
    }

    // -----------------------------
    // Stop Camera
    // -----------------------------
    function stopCamera() {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track => {
                    track.stop();
                });

            cameraStream = null;
        }
    }

    // -----------------------------
    // Final Score
    // -----------------------------
    function calculateFinalScore() {

        if (answerScores.length === 0) {

            document.getElementById(
                "finalScore"
            ).textContent = "0";

            return;
        }

        const total =
            answerScores.reduce(
                (sum, score) =>
                    sum + score,
                0
            );

        const average =
            Math.round(
                total /
                answerScores.length
            );

        document.getElementById(
            "finalScore"
        ).textContent = average;

        document.getElementById(
            "communicationScore"
        ).textContent =
            Math.min(average + 2, 100);

        document.getElementById(
            "confidenceScore"
        ).textContent =
            Math.max(average - 3, 0);

        document.getElementById(
            "answerQualityScore"
        ).textContent =
            Math.min(average + 1, 100);

        localStorage.setItem(
            "hrInterviewScore",
            average
        );

        localStorage.setItem(
            "hrInterviewCompleted",
            "true"
        );
    }

    // -----------------------------
    // View Analysis
    // -----------------------------
    document
        .getElementById("viewAnalysisBtn")
        .addEventListener("click", () => {

            window.location.href =
                "ai-analysis.html";
        });

});