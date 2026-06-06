const roomInputs = document.querySelectorAll(".roomQty");
const totalPriceElement = document.getElementById("totalPrice");
const checkIn = new Date(document.querySelector('input[name="checkIn"]').value);
const checkOut = new Date(document.querySelector('input[name="checkOut"]').value);
const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

function calculateTotal()   {
    let total = 0;
    roomInputs.forEach(input => {
        const quantity = Number(input.value);
        const price = Number(input.dataset.price);
        total += quantity * price * nights;
    });
    totalPriceElement.textContent = total.toLocaleString();
}

roomInputs.forEach(input => {
    input.addEventListener("input", () => {
        const max = parseInt(input.max);
        if(input.value === "")  {
            return;
        }
        if(parseInt(input.value) > max) {
            input.value = max;
        }
        if(parseInt(input.value) < 0)   {
            input.value = 0;
        }
        calculateTotal();
    });
});

calculateTotal();
