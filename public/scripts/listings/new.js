const form = document.querySelector("form");
const imageInput = document.getElementById("image-upload");
const previewContainer = document.getElementById("image-preview-container");
const fileCount = document.getElementById("file-count");
const uploadFlash = document.getElementById("upload-flash");

const MAX_FILES = 5;
const MAX_SIZE = 2 * 1024 * 1024;
let selectedFiles = [];

form.addEventListener("submit", (e) => {
    if (selectedFiles.length === 0) {
        e.preventDefault();
        flash.textContent = "Please upload at least one image.";
        flash.style.display = "block";
        document.querySelector(".upload-card").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

imageInput.addEventListener("change", (e) => {
    const files = [...e.target.files];
    let validFiles = [];
    for (const file of files) {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            showFlash(`${file.name} is not a valid image.`);
            continue;
        }
        if (file.size > MAX_SIZE) {
            showFlash(`${file.name} exceeds the 2MB limit.`);
            continue;
        }
        const alreadyExists = selectedFiles.some(
            existing =>
                existing.name === file.name &&
                existing.size === file.size
        );
        if (!alreadyExists) {
            validFiles.push(file);
        }
    }

    const availableSlots = MAX_FILES - selectedFiles.length;
    
    if (availableSlots <= 0) {
        showFlash(`Maximum ${MAX_FILES} images allowed`);
        imageInput.value = "";
        return;
    }
    if (validFiles.length > availableSlots) {
        showFlash(`Only ${availableSlots} more image(s) can be added`);
        validFiles = validFiles.slice(0, availableSlots);
    }
    selectedFiles.push(...validFiles);
    syncFileInput();
    renderPreviews();
});

function syncFileInput() {
    const dataTransfer = new DataTransfer();

    selectedFiles.forEach(file => {
        dataTransfer.items.add(file);
    });

    imageInput.files = dataTransfer.files;
}

function renderPreviews() {
    previewContainer.innerHTML = "";
    if (selectedFiles.length === 0) {
        fileCount.textContent = "";
        return;
    }
    fileCount.textContent = `${selectedFiles.length} image(s) selected`;
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const card = document.createElement("div");
            card.classList.add("preview-card");
            card.innerHTML = `
                <img src="${event.target.result}" alt="${file.name}">
                <button
                    type="button"
                    class="remove-image"
                    data-index="${index}"
                >
                    <i class="bi bi-x-lg"></i>
                </button>

                <div class="preview-info">
                    <div class="preview-name">
                        ${file.name}
                    </div>
                </div>
            `;
            previewContainer.appendChild(card);
        };
        reader.readAsDataURL(file);
    });
}

previewContainer.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-image");
    if (!removeBtn) return;
    const index = Number(removeBtn.dataset.index);
    const card = removeBtn.closest(".preview-card");
    card.classList.add("removing");

    setTimeout(() => {
        selectedFiles.splice(index, 1);
        syncFileInput();
        renderPreviews();
    }, 300);
});

function showFlash(message) {
    uploadFlash.textContent = message;
    uploadFlash.style.display = "block";
    setTimeout(() => {
        uploadFlash.style.display = "none";
    }, 4000);
}

