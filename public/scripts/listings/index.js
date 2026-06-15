const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");
function toggleClearButton()	{
	clearBtn.style.display = searchInput.value.trim() ? "block" : "none;"
}
toggleClearButton();
searchInput.addEventListener("input", toggleClearButton);
clearBtn.addEventListener("click", () => {
	searchInput.value = "";
	window.location.href = "/listings";
});

const toast = document.getElementById("toast");
function showToast(message)	{
	toast.textContent = message;
	toast.classList.add("show");
	setTimeout(() => {
		toast.classList.remove("show");
	}, 3000);
}

document.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", async(e) => {
		e.preventDefault();
		e.stopPropagation();
		const listingId = btn.dataset.id;
		try	{
			const response = await fetch(`/wishlist/${listingId}`,  {
				method: "POST"
			});
			const data = await response.json();
			if(!data.success)	{
				return showToast(data.message);
			}
			const icon = btn.querySelector("i");
			icon.className = data.wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart";
			showToast(data.message);
		}catch(err)	{
			showToast("Something went wrong.");
		}
  	});
});