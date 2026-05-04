document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".listing-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.style.opacity = "0.7";
    });
  });
});