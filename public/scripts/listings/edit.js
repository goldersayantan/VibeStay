const imageInput = document.getElementById("image-upload");
const previewContainer = document.getElementById("image-preview-container");
const existingContainer = document.getElementById("existing-images");
const fileCount = document.getElementById("file-count");
const uploadFlash = document.getElementById("upload-flash");
const deleteContainer = document.getElementById("delete-images-container");
const form = document.querySelector("form");


form.addEventListener("submit", (e) => {
    const totalImages = getExistingImageCount() + selectedFiles.length;

    if (totalImages === 0) {
        e.preventDefault();
        showFlash("Please upload at least one image");

        document.querySelector(".upload-card")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
    }
});

const MAX_FILES = 5;
const MAX_SIZE = 2 * 1024 * 1024;
let selectedFiles = [];

let flashTimeout;
function showFlash(message) {
    clearTimeout(flashTimeout);
    uploadFlash.textContent = message;
    uploadFlash.style.display = "block";
    flashTimeout = setTimeout(() => {
        uploadFlash.style.display = "none";
    }, 4000);
}

function syncFileInput() {
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => {
        dataTransfer.items.add(file);
    });
    imageInput.files = dataTransfer.files;
}

function getExistingImageCount() {
    return document.querySelectorAll(
        "#existing-images .preview-card"
    ).length;
}

imageInput.addEventListener("change", (e) => {
    const newFiles = [...e.target.files];
    const existingCount = getExistingImageCount();
    let validFiles = [];
    newFiles.forEach(file => {
        const allowedTypes = [
            "image/jpg",
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            showFlash(`${file.name} is not a JPG or PNG image`);
            return;
        }

        if (file.size > MAX_SIZE) {
            showFlash(`${file.name} exceeds 2MB`);
            return;
        }
        const alreadyAdded = selectedFiles.some(
            existing =>
                existing.name === file.name &&
                existing.size === file.size
        );
        if (!alreadyAdded) {
            validFiles.push(file);
        }
    });

    const availableSlots = MAX_FILES - existingCount - selectedFiles.length;

    if (availableSlots <= 0) {
        showFlash(
            `Maximum ${MAX_FILES} images allowed`
        );
        imageInput.value = "";
        return;
    }

    if (validFiles.length > availableSlots) {
        showFlash(
            `Only ${availableSlots} more image(s) can be added`
        );
        validFiles = validFiles.slice(0, availableSlots);
    }
    selectedFiles.push(...validFiles);
    syncFileInput();
    e.target.value = "";
    renderPreviews();
});

function renderPreviews() {
    previewContainer.innerHTML = "";
    if(selectedFiles.length === 0) {
        fileCount.textContent = "";
        return;
    }
    const totalCount = getExistingImageCount() + selectedFiles.length;
    fileCount.textContent = `${totalCount} image(s) selected`;
    selectedFiles.forEach((file,index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const card = document.createElement("div");
            card.classList.add("preview-card");
            card.innerHTML = `
                <img src="${e.target.result}">
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
    const btn = e.target.closest(".remove-image");
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const card = btn.closest(".preview-card");
    card.classList.add("removing");
    setTimeout(() => {
        selectedFiles.splice(index, 1);
        syncFileInput();
        renderPreviews();
    }, 300);

});

if(existingContainer)   {
    existingContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".remove-existing-image");
        if (!btn) return;
        const card = btn.closest(".preview-card");
        const filename = card.dataset.filename;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "deleteImages";
        input.value = filename;
        deleteContainer.appendChild(input);
        card.classList.add("removing");
        setTimeout(() => {
            card.remove();
            const totalCount = getExistingImageCount() + selectedFiles.length;
            fileCount.textContent =
                totalCount > 0
                    ? `${totalCount} image(s) selected`
                    : "";
            showFlash(
                `Image marked for deletion`
            );
        }, 300);
    });
}

