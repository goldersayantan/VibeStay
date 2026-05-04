document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".explore-btn");

  if (btn) {
    btn.addEventListener("click", () => {
      btn.innerText = "Loading...";
    });
  }
});