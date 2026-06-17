const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    menuBtn.classList.toggle("active");
    dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (
        !menuBtn.contains(e.target) &&
        !dropdownMenu.contains(e.target)
    ) {
        menuBtn.classList.remove("active");
        dropdownMenu.classList.remove("show");
    }
});