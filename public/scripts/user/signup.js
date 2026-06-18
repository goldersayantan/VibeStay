const passwordInput = document.getElementById("password");
const passwordMessage = document.getElementById("password-message");

passwordInput.addEventListener("input", () => {

    const password = passwordInput.value;

    const isValid =
        /[A-Z]/.test(password) &&      // Uppercase
        /[a-z]/.test(password) &&      // Lowercase
        /\d/.test(password) &&         // Number
        /[^A-Za-z0-9]/.test(password) && // Special Character
        password.length >= 8;

    if (password.length === 0) {
        passwordMessage.textContent =
            "8+ characters, uppercase, lowercase, number and special character";
        passwordMessage.style.color = "#6b7280";
    }
    else if (isValid) {
        passwordMessage.textContent = "✓ Strong password";
        passwordMessage.style.color = "green";
    }
    else {
        passwordMessage.textContent =
            "Password does not meet requirements";
        passwordMessage.style.color = "red";
    }

});

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {

    const password = passwordInput.value;

    const isValid =
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password) &&
        password.length >= 8;

    if (!isValid) {
        e.preventDefault();
        alert(
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
        );
    }

});