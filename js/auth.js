// ==========================================
// Prep2Hire Authentication
// Frontend Prototype
// Supports MULTIPLE user accounts
// ==========================================


// ==========================================
// GET ALL USERS
// ==========================================

function getUsers() {

    const users =
        JSON.parse(
            localStorage.getItem("prep2hireUsers")
        );

    return users || [];

}


// ==========================================
// SAVE ALL USERS
// ==========================================

function saveUsers(users) {

    localStorage.setItem(
        "prep2hireUsers",
        JSON.stringify(users)
    );

}


// ==========================================
// CREATE ACCOUNT
// ==========================================

function createAccount() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const college =
        document.getElementById("college").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const year =
        document.getElementById("year").value;


    // ------------------------------------------
    // Check empty fields
    // ------------------------------------------

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        !college ||
        !department ||
        !year
    ) {

        alert("Please fill in all fields.");

        return;

    }


    // ------------------------------------------
    // Validate email
    // ------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        return;

    }


    // ------------------------------------------
    // Password validation
    // ------------------------------------------

    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;

    }


    // ------------------------------------------
    // Confirm password
    // ------------------------------------------

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }


    // ------------------------------------------
    // Get existing users
    // ------------------------------------------

    const users = getUsers();


    // ------------------------------------------
    // Check whether email already exists
    // ------------------------------------------

    const emailExists =
        users.some(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (emailExists) {

        alert(
            "An account with this email already exists. Please login."
        );

        window.location.href = "login.html";

        return;

    }


    // ------------------------------------------
    // Create new user
    // ------------------------------------------

    const newUser = {

        id: Date.now(),

        name: name,

        email: email,

        password: password,

        college: college,

        department: department,

        year: year,

        createdAt:
            new Date().toISOString()

    };


    // ------------------------------------------
    // Add new user to users array
    // ------------------------------------------

    users.push(newUser);


    // ------------------------------------------
    // Save users
    // ------------------------------------------

    saveUsers(users);


    // ------------------------------------------
    // Success
    // ------------------------------------------

    alert(
        "Account created successfully! Please login."
    );


    // ------------------------------------------
    // Go to login
    // ------------------------------------------

    window.location.href =
        "login.html";

}


// ==========================================
// LOGIN
// ==========================================

function loginUser() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // ------------------------------------------
    // Check fields
    // ------------------------------------------

    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;

    }


    // ------------------------------------------
    // Get all users
    // ------------------------------------------

    const users = getUsers();


    // ------------------------------------------
    // Find matching user
    // ------------------------------------------

    const user =
        users.find(
            storedUser =>

                storedUser.email.toLowerCase() ===
                email.toLowerCase() &&

                storedUser.password === password
        );


    // ------------------------------------------
    // User not found
    // ------------------------------------------

    if (!user) {

        alert(
            "Incorrect email or password."
        );

        return;

    }


    // ------------------------------------------
    // Save login session
    // ------------------------------------------

    localStorage.setItem(
        "prep2hireLoggedIn",
        "true"
    );


    localStorage.setItem(
        "prep2hireCurrentUser",
        JSON.stringify(user)
    );


    // ------------------------------------------
    // Login successful
    // ------------------------------------------

    window.location.href =
        "dashboard.html";

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    localStorage.removeItem(
        "prep2hireLoggedIn"
    );

    localStorage.removeItem(
        "prep2hireCurrentUser"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// PROTECT PAGE
// ==========================================

function protectPage() {

    const loggedIn =
        localStorage.getItem(
            "prep2hireLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "login.html";

    }

}


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "prep2hireCurrentUser"
            )
        );


    return user;

}


// ==========================================
// LOAD CURRENT USER
// ==========================================

function loadCurrentUser() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    // User name

    const nameElements =
        document.querySelectorAll(
            ".user-name"
        );


    nameElements.forEach(
        element => {

            element.textContent =
                user.name;

        }
    );


    // User email

    const emailElements =
        document.querySelectorAll(
            ".user-email"
        );


    emailElements.forEach(
        element => {

            element.textContent =
                user.email;

        }
    );

}