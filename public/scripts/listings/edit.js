const imageInput = document.getElementById("image-upload");
const previewContainer = document.getElementById("image-preview-container");
const existingContainer = document.getElementById("existing-images");
const fileCount = document.getElementById("file-count");
const uploadFlash = document.getElementById("upload-flash");
const deleteContainer = document.getElementById("delete-images-container");

console.log(existingContainer);

existingContainer.addEventListener("click", (e) => {
    console.log("clicked");
});

let selectedFiles = [];

function showFlash(message) {
    uploadFlash.textContent = message;
    uploadFlash.style.display = "block";
    setTimeout(() => {
        uploadFlash.style.display = "none";
    }, 4000);
}

function getExistingImageCount() {
    return document.querySelectorAll(
        "#existing-images .preview-card"
    ).length;
}

imageInput.addEventListener("change", (e) => {
    const newFiles = [...e.target.files];
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024;
    const existingCount = getExistingImageCount();
    let validFiles = [];
    newFiles.forEach(file => {
        if (file.size > MAX_SIZE) {
            showFlash(`${file.name} exceeds 5MB`);
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
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => {
        dataTransfer.items.add(file);
    });
    imageInput.files = dataTransfer.files;
    e.target.value = "";
    renderPreviews();
});

function renderPreviews() {
    previewContainer.innerHTML = "";
    if(selectedFiles.length === 0) {
        fileCount.textContent = "";
        return;
    }
    fileCount.textContent = `${selectedFiles.length} image(s) selected`;
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
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        imageInput.files = dataTransfer.files;
        renderPreviews();
    }, 300);

});

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
        fileCount.textContent =
            selectedFiles.length > 0
                ? `${selectedFiles.length} image(s) selected`
                : "";
        showFlash(
            `Image marked for deletion`
        );
    }, 300);
});