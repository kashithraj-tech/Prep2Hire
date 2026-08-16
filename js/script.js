/* =====================================================
   PREP2HIRE - FRONTEND JAVASCRIPT
===================================================== */


/* =====================================================
   RESUME UPLOAD & VALIDATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* Check whether resume elements exist */

    const fileInput = document.getElementById("resumeFile");
    const fileName = document.getElementById("fileName");
    const validationMessage =
        document.getElementById("validationMessage");
    const progressBar = document.getElementById("progressBar");
    const continueBtn = document.getElementById("continueBtn");


    /* If this is not the resume page, stop here */

    if (
        !fileInput ||
        !fileName ||
        !validationMessage ||
        !progressBar ||
        !continueBtn
    ) {

        return;

    }



    /* =================================================
       PDF.JS CONFIGURATION
    ================================================= */

    if (typeof pdfjsLib !== "undefined") {

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    }



    /* =================================================
       RESUME KEYWORDS
    ================================================= */

    const resumeKeywords = [

        "education",
        "skills",
        "experience",
        "work experience",
        "projects",
        "project",
        "certification",
        "certifications",
        "technical skills",
        "professional experience",
        "internship",
        "internships",
        "qualification",
        "qualifications",
        "objective",
        "career objective",
        "summary",
        "profile",
        "achievements",
        "achievement",
        "languages",
        "contact",
        "email",
        "phone",
        "linkedin",
        "github"

    ];



    /* =================================================
       FILE INPUT EVENT
    ================================================= */

    fileInput.addEventListener("change", async function () {

        resetValidation();

        const file = this.files[0];


        /* No file */

        if (!file) {

            return;

        }


        /* Show file name */

        fileName.textContent = file.name;



        /* =================================================
           FILE SIZE CHECK
        ================================================= */

        const maxSize = 5 * 1024 * 1024; // 5 MB


        if (file.size > maxSize) {

            showError(
                "File size is too large. Please upload a resume smaller than 5 MB."
            );

            return;

        }



        /* =================================================
           FILE TYPE CHECK
        ================================================= */

        const fileExtension =
            file.name.split(".").pop().toLowerCase();


        const allowedExtensions = [
            "pdf",
            "doc",
            "docx"
        ];


        if (!allowedExtensions.includes(fileExtension)) {

            showError(
                "Invalid file type. Please upload a PDF, DOC or DOCX resume."
            );

            return;

        }



        /* =================================================
           PDF VALIDATION
        ================================================= */

        if (fileExtension === "pdf") {

            await validatePDF(file);

        }


        /* =================================================
           DOC / DOCX
        ================================================= */

        else {

            /*
                Browser-side DOC/DOCX content extraction is
                more complicated.

                For now we allow the file type and mark it
                as pending backend validation.

                Mohitha's FastAPI resume parser should perform
                the final validation.
            */

            showSuccess(
                "Resume file selected successfully. Final content validation will be performed by the backend."
            );

        }

    });



    /* =================================================
       PDF VALIDATION FUNCTION
    ================================================= */

    async function validatePDF(file) {

        try {

            /* Check PDF.js */

            if (typeof pdfjsLib === "undefined") {

                showError(
                    "PDF validation library could not be loaded. Please refresh the page and try again."
                );

                return;

            }


            /* Show processing message */

            showProcessing(
                "Checking your PDF to make sure it is a resume..."
            );


            /* Read file */

            const arrayBuffer =
                await file.arrayBuffer();


            /* Load PDF */

            const pdf =
                await pdfjsLib.getDocument({
                    data: arrayBuffer
                }).promise;


            let extractedText = "";


            /* Read every page */

            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {

                const page =
                    await pdf.getPage(pageNumber);


                const textContent =
                    await page.getTextContent();


                const pageText =
                    textContent.items
                        .map(item => item.str)
                        .join(" ");


                extractedText +=
                    " " + pageText;

            }



            /* Convert text to lowercase */

            const normalizedText =
                extractedText
                    .toLowerCase()
                    .replace(/\s+/g, " ");



            /* =================================================
               EMPTY PDF CHECK
            ================================================= */

            if (normalizedText.trim().length < 50) {

                showError(
                    "This PDF does not contain enough readable text. Please upload a text-based resume."
                );

                return;

            }



            /* =================================================
               CHECK RESUME KEYWORDS
            ================================================= */

            let matchedKeywords = [];


            resumeKeywords.forEach(keyword => {

                if (
                    normalizedText.includes(
                        keyword.toLowerCase()
                    )
                ) {

                    matchedKeywords.push(keyword);

                }

            });



            /* Remove duplicate similar results */

            matchedKeywords =
                [...new Set(matchedKeywords)];



            console.log(
                "Resume keywords detected:",
                matchedKeywords
            );



            /* =================================================
               RESUME VALIDATION RULE
            ================================================= */

            /*
                A genuine resume normally contains several
                sections.

                We require at least 4 resume-related
                keywords.
            */

            const minimumKeywords = 4;


            if (
                matchedKeywords.length >=
                minimumKeywords
            ) {

                showSuccess(
                    "Resume verified successfully. You can continue."
                );

                return;

            }



            /* =================================================
               NOT A RESUME
            ================================================= */

            showError(
                "This PDF does not appear to be a resume. Please upload your actual resume containing sections such as Education, Skills, Experience, Projects or Certifications."
            );

        }


        catch (error) {

            console.error(
                "PDF validation error:",
                error
            );


            showError(
                "Unable to read this PDF. Please try uploading another resume."
            );

        }

    }



    /* =================================================
       SUCCESS MESSAGE
    ================================================= */

    function showSuccess(message) {

        validationMessage.className =
            "alert alert-success";

        validationMessage.innerHTML =
            '<i class="bi bi-check-circle-fill"></i> ' +
            message;


        continueBtn.disabled = false;


        progressBar.style.width = "100%";

        progressBar.textContent = "100%";


        progressBar.classList.remove(
            "bg-danger"
        );

        progressBar.classList.add(
            "bg-success"
        );

    }



    /* =================================================
       ERROR MESSAGE
    ================================================= */

    function showError(message) {

        validationMessage.className =
            "alert alert-danger";

        validationMessage.innerHTML =
            '<i class="bi bi-exclamation-triangle-fill"></i> ' +
            message;


        continueBtn.disabled = true;


        progressBar.style.width = "0%";

        progressBar.textContent = "0%";


        progressBar.classList.remove(
            "bg-success"
        );

        progressBar.classList.add(
            "bg-danger"
        );

    }



    /* =================================================
       PROCESSING MESSAGE
    ================================================= */

    function showProcessing(message) {

        validationMessage.className =
            "alert alert-info";

        validationMessage.innerHTML =
            '<i class="bi bi-hourglass-split"></i> ' +
            message;


        continueBtn.disabled = true;


        progressBar.style.width = "50%";

        progressBar.textContent = "Checking...";


        progressBar.classList.remove(
            "bg-success",
            "bg-danger"
        );

    }



    /* =================================================
       RESET VALIDATION
    ================================================= */

    function resetValidation() {

        validationMessage.className =
            "alert d-none";

        validationMessage.textContent = "";


        continueBtn.disabled = true;


        progressBar.style.width = "0%";

        progressBar.textContent = "0%";


        progressBar.classList.remove(
            "bg-success",
            "bg-danger"
        );

    }



    /* =================================================
       CONTINUE BUTTON
    ================================================= */

    continueBtn.addEventListener("click", function () {

        /*
            Extra safety check.
            Even if somebody tries to click the button
            manually, navigation is only allowed when
            the button is enabled.
        */

        if (continueBtn.disabled) {

            return;

        }


        /* Save resume filename */

        const selectedResume =
            fileInput.files[0];


        if (!selectedResume) {

            showError(
                "Please upload your resume before continuing."
            );

            return;

        }


        localStorage.setItem(
            "selectedResumeName",
            selectedResume.name
        );


        /* Move to interview mode */

        window.location.href =
            "interview-mode.html";

    });

});