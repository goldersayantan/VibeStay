const form = document.querySelector("form");
form.addEventListener("submit", function (e) {
    const roomCheckboxes = document.querySelectorAll(
        'input[name="roomTypes[]"]'
    );

    let isChecked = false;

    roomCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            isChecked = true;
        }
    });

    if (!isChecked) {
        e.preventDefault();
        alert("Please select at least one room type.");
    }
});