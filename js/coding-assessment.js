/* =========================================================
   PREP2HIRE CODING ASSESSMENT
   Secure Frontend Prototype
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

// Later replace this with Mohitha's deployed FastAPI URL.

const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   STATE
========================================================= */

let timeRemaining = 30 * 60;

let timerInterval = null;

let violationCount = 0;

let assessmentTerminated = false;

let questionLoaded = false;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const timerElement =
    document.getElementById("timer");

const questionTitle =
    document.getElementById("questionTitle");

const questionDescription =
    document.getElementById("questionDescription");

const inputFormat =
    document.getElementById("inputFormat");

const outputFormat =
    document.getElementById("outputFormat");

const constraints =
    document.getElementById("constraints");

const questionNumber =
    document.getElementById("questionNumber");

const codeEditor =
    document.getElementById("codeEditor");

const language =
    document.getElementById("language");

const submitCodeBtn =
    document.getElementById("submitCodeBtn");

const resultBox =
    document.getElementById("resultBox");

const violationBox =
    document.getElementById("violationBox");

const violationMessage =
    document.getElementById("violationMessage");

const violationCountElement =
    document.getElementById("violationCount");

const tabStatus =
    document.getElementById("tabStatus");

const fullscreenStatus =
    document.getElementById("fullscreenStatus");

const aiStatus =
    document.getElementById("aiStatus");

const securityOverlay =
    document.getElementById("securityOverlay");

const terminationReason =
    document.getElementById("terminationReason");

const returnHomeBtn =
    document.getElementById("returnHomeBtn");


/* =========================================================
   SESSION ID
========================================================= */

const interviewSessionId =
    sessionStorage.getItem(
        "interviewSessionId"
    );


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        startTimer();

        setupSecurityMonitoring();

        await requestFullscreen();

        await loadUniqueQuestion();

    }
);


/* =========================================================
   LOAD UNIQUE QUESTION
========================================================= */

async function loadUniqueQuestion() {

    /*
       IMPORTANT:

       For production, Mohitha's FastAPI should generate/
       select the unique question.

       The frontend should NOT decide the question.
    */


    try {

        if (!interviewSessionId) {

            console.warn(
                "Interview session ID not found."
            );

            /*
               Temporary prototype question.
            */

            loadDemoQuestion();

            return;
        }


        const response = await fetch(

            `${API_BASE_URL}/interview/${interviewSessionId}/coding/question`,

            {
                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json"

                }

            }

        );


        if (!response.ok) {

            throw new Error(
                "Unable to load coding question."
            );

        }


        const data =
            await response.json();


        displayQuestion(data);


    }
    catch (error) {

        console.error(error);

        /*
           Temporary fallback so your frontend
           can still be tested before backend
           integration.
        */

        loadDemoQuestion();

    }

}


/* =========================================================
   DISPLAY QUESTION
========================================================= */

function displayQuestion(data) {

    questionTitle.textContent =
        data.title ||
        "Coding Problem";

    questionDescription.textContent =
        data.description ||
        "";

    inputFormat.textContent =
        data.input_format ||
        "Refer to problem description.";

    outputFormat.textContent =
        data.output_format ||
        "Return the required output.";

    constraints.textContent =
        data.constraints ||
        "Follow the given constraints.";

    questionNumber.textContent =
        `Question ${data.question_number || 1}`;

    questionLoaded = true;

}


/* =========================================================
   DEMO QUESTION
========================================================= */

function loadDemoQuestion() {

    const demoQuestions = [

        {
            title:
                "Two Sum",

            description:
                "Given an array of integers and a target value, return the indices of two numbers that add up to the target.",

            input_format:
                "nums = [2, 7, 11, 15]\ntarget = 9",

            output_format:
                "[0, 1]",

            constraints:
                "2 <= nums.length <= 10^4\nEach input has exactly one solution."
        },

        {
            title:
                "Reverse a String",

            description:
                "Write a program that reverses the given string without using a built-in reverse function.",

            input_format:
                "hello",

            output_format:
                "olleh",

            constraints:
                "1 <= string length <= 10^5"
        },

        {
            title:
                "Find Maximum Element",

            description:
                "Given an array of integers, find the maximum value.",

            input_format:
                "[10, 5, 20, 8]",

            output_format:
                "20",

            constraints:
                "The array contains at least one element."
        }

    ];


    /*
       Random question for frontend testing.

       IMPORTANT:
       Production version should get the
       unique question from FastAPI.
    */

    const randomIndex =
        Math.floor(
            Math.random() *
            demoQuestions.length
        );


    displayQuestion(
        demoQuestions[randomIndex]
    );

}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    updateTimer();

    timerInterval =
        setInterval(
            function () {

                if (
                    assessmentTerminated
                ) {

                    clearInterval(
                        timerInterval
                    );

                    return;

                }


                timeRemaining--;


                updateTimer();


                if (
                    timeRemaining <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );

                    terminateAssessment(
                        "Time limit exceeded."
                    );

                }

            },
            1000
        );

}


function updateTimer() {

    const minutes =
        Math.floor(
            timeRemaining / 60
        );

    const seconds =
        timeRemaining % 60;


    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =========================================================
   SECURITY MONITORING
========================================================= */

function setupSecurityMonitoring() {

    /*
       TAB SWITCHING
    */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.hidden
            ) {

                registerViolation(
                    "You left the coding assessment tab."
                );

            }
            else {

                tabStatus.textContent =
                    "Active";

            }

        }
    );


    /*
       WINDOW BLUR

       Detects when browser window loses focus.
    */

    window.addEventListener(
        "blur",
        function () {

            registerViolation(
                "The assessment window lost focus."
            );

        }
    );


    /*
       DISABLE RIGHT CLICK
    */

    document.addEventListener(
        "contextmenu",
        function (event) {

            event.preventDefault();

            registerViolation(
                "Right-click is disabled during the assessment."
            );

        }
    );


    /*
       COPY
    */

    document.addEventListener(
        "copy",
        function (event) {

            event.preventDefault();

            registerViolation(
                "Copying content is not allowed."
            );

        }
    );


    /*
       CUT
    */

    document.addEventListener(
        "cut",
        function (event) {

            event.preventDefault();

            registerViolation(
                "Cutting content is not allowed."
            );

        }
    );


    /*
       PASTE

       We disable paste into the editor.
    */

    codeEditor.addEventListener(
        "paste",
        function (event) {

            event.preventDefault();

            registerViolation(
                "Pasting code is not allowed."
            );

        }
    );


    /*
       DRAGGING
    */

    document.addEventListener(
        "dragstart",
        function (event) {

            event.preventDefault();

        }
    );


    /*
       KEYBOARD SHORTCUTS
    */

    document.addEventListener(
        "keydown",
        function (event) {

            const key =
                event.key.toLowerCase();


            /*
               Ctrl+C
            */

            if (
                event.ctrlKey &&
                key === "c"
            ) {

                event.preventDefault();

                registerViolation(
                    "Copy shortcut is disabled."
                );

            }


            /*
               Ctrl+V
            */

            if (
                event.ctrlKey &&
                key === "v"
            ) {

                event.preventDefault();

                registerViolation(
                    "Paste shortcut is disabled."
                );

            }


            /*
               Ctrl+X
            */

            if (
                event.ctrlKey &&
                key === "x"
            ) {

                event.preventDefault();

                registerViolation(
                    "Cut shortcut is disabled."
                );

            }


            /*
               Ctrl+A

               Prevent selecting the entire
               question page.
            */

            if (
                event.ctrlKey &&
                key === "a"
            ) {

                event.preventDefault();

            }


            /*
               F12

               Disable developer tools shortcut.
            */

            if (
                event.key === "F12"
            ) {

                event.preventDefault();

                registerViolation(
                    "Developer tools are not allowed."
                );

            }


            /*
               Ctrl+Shift+I
            */

            if (
                event.ctrlKey &&
                event.shiftKey &&
                key === "i"
            ) {

                event.preventDefault();

                registerViolation(
                    "Developer tools shortcut detected."
                );

            }


            /*
               Ctrl+Shift+J
            */

            if (
                event.ctrlKey &&
                event.shiftKey &&
                key === "j"
            ) {

                event.preventDefault();

                registerViolation(
                    "Developer tools shortcut detected."
                );

            }


            /*
               Ctrl+Shift+C
            */

            if (
                event.ctrlKey &&
                event.shiftKey &&
                key === "c"
            ) {

                event.preventDefault();

                registerViolation(
                    "Developer tools shortcut detected."
                );

            }

        }
    );

}


/* =========================================================
   REGISTER VIOLATION
========================================================= */

function registerViolation(reason) {

    if (
        assessmentTerminated
    ) {

        return;

    }


    violationCount++;


    violationCountElement.textContent =
        violationCount;


    violationBox.style.display =
        "block";


    violationMessage.textContent =
        reason;


    aiStatus.textContent =
        "Security violation detected.";


    /*
       Three-strike policy.

       You can change this later.
    */

    if (
        violationCount >= 3
    ) {

        terminateAssessment(
            "Multiple security violations were detected."
        );

    }

}


/* =========================================================
   TERMINATE ASSESSMENT
========================================================= */

async function terminateAssessment(reason) {

    if (
        assessmentTerminated
    ) {

        return;

    }


    assessmentTerminated = true;


    clearInterval(
        timerInterval
    );


    codeEditor.disabled =
        true;


    submitCodeBtn.disabled =
        true;


    terminationReason.textContent =
        reason;


    securityOverlay.style.display =
        "flex";


    /*
       Tell backend about termination.

       This becomes important once Mohitha's
       API is connected.
    */

    await reportTermination(
        reason
    );

}


/* =========================================================
   REPORT TERMINATION TO BACKEND
========================================================= */

async function reportTermination(reason) {

    if (
        !interviewSessionId
    ) {

        return;

    }


    try {

        await fetch(

            `${API_BASE_URL}/interview/${interviewSessionId}/coding/violation`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    reason:
                        reason,

                    violation_count:
                        violationCount

                })

            }

        );

    }
    catch (error) {

        console.error(
            "Could not report violation:",
            error
        );

    }

}


/* =========================================================
   FULLSCREEN
========================================================= */

async function requestFullscreen() {

    try {

        if (
            !document.fullscreenElement
        ) {

            await document.documentElement
                .requestFullscreen();

        }

    }
    catch (error) {

        console.warn(
            "Fullscreen request was blocked.",
            error
        );

    }

}


/* =========================================================
   FULLSCREEN MONITOR
========================================================= */

document.addEventListener(
    "fullscreenchange",
    function () {

        if (
            !document.fullscreenElement
        ) {

            fullscreenStatus.textContent =
                "Exited";

            fullscreenStatus.className =
                "text-danger fw-bold";


            registerViolation(
                "You exited fullscreen mode."
            );

        }
        else {

            fullscreenStatus.textContent =
                "Active";

            fullscreenStatus.className =
                "text-success fw-bold";

        }

    }
);


/* =========================================================
   SUBMIT CODE
========================================================= */

submitCodeBtn.addEventListener(
    "click",
    async function () {

        if (
            assessmentTerminated
        ) {

            return;

        }


        const code =
            codeEditor.value.trim();


        if (!code) {

            alert(
                "Please write your code before submitting."
            );

            return;

        }


        submitCodeBtn.disabled =
            true;


        submitCodeBtn.innerHTML =
            `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;


        try {

            /*
               Backend integration
            */

            if (
                interviewSessionId
            ) {

                const response =
                    await fetch(

                        `${API_BASE_URL}/interview/${interviewSessionId}/coding/submit`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                language:
                                    language.value,

                                code:
                                    code

                            })

                        }

                    );


                if (!response.ok) {

                    throw new Error(
                        "Submission failed."
                    );

                }


                const result =
                    await response.json();


                showResult(
                    result
                );


                /*
                   Backend tells frontend
                   which round comes next.
                */

                if (
                    result.next_round === "hr"
                ) {

                    setTimeout(
                        function () {

                            window.location.href =
                                "hr-interview.html";

                        },
                        2500
                    );

                }

            }
            else {

                /*
                   Temporary frontend testing.
                */

                showResult({

                    score: 80,

                    passed: 8,

                    total: 10,

                    message:
                        "Demo submission successful."

                });

            }

        }
        catch (error) {

            console.error(error);

            resultBox.className =
                "alert alert-danger mt-4";

            resultBox.textContent =
                "Unable to submit code. Please try again.";

            resultBox.classList.remove(
                "d-none"
            );

        }


        submitCodeBtn.disabled =
            false;


        submitCodeBtn.innerHTML =
            `<i class="bi bi-send me-2"></i>Submit Code`;

    }
);


/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(result) {

    resultBox.className =
        "alert alert-success mt-4";


    resultBox.classList.remove(
        "d-none"
    );


    resultBox.innerHTML = `

        <strong>
            Coding Assessment Result
        </strong>

        <hr>

        <div>
            Score:
            <strong>
                ${result.score ?? 0}
            </strong>
        </div>

        ${
            result.passed !== undefined
            ?
            `
            <div>
                Test Cases Passed:
                <strong>
                    ${result.passed}/${result.total}
                </strong>
            </div>
            `
            :
            ""
        }

        ${
            result.message
            ?
            `
            <div class="mt-2">
                ${result.message}
            </div>
            `
            :
            ""
        }

    `;

}


/* =========================================================
   RETURN HOME
========================================================= */

returnHomeBtn.addEventListener(
    "click",
    function () {

        /*
           Clear current interview state.
        */

        sessionStorage.removeItem(
            "interviewSessionId"
        );


        sessionStorage.removeItem(
            "codingQuestionId"
        );


        /*
           Return to landing page.
        */

        window.location.href =
            "../index.html";

    }
);


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    function (event) {

        if (
            !assessmentTerminated &&
            questionLoaded
        ) {

            /*
               Browser will show its own
               confirmation dialog.

               We cannot force the browser
               to close the tab.
            */

            event.preventDefault();

            event.returnValue = "";

        }

    }
);