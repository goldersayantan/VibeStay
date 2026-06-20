const imageInput = document.getElementById("image-upload");
const previewContainer = document.getElementById("image-preview-container");
const fileCount = document.getElementById("file-count");

let selectedFiles = [];

imageInput.addEventListener("change", (e) => {
    const files = [...e.target.files];
    const MAX_FILES = 5;
    const MAX_SIZE = 2 * 1024 * 1024;
    let validFiles = [];
    for (const file of files) {
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
        showFlash(
            `Maximum ${MAX_FILES} images allowed`
        );
        imageInput.value = "";
        return;
    }
    if (validFiles.length > availableSlots) {
        showFlash(`Only ${availableSlots} more image(s) can be added`);
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
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        imageInput.files = dataTransfer.files;
        renderPreviews();
    }, 300);
});

const uploadFlash = document.getElementById("upload-flash");

function showFlash(message) {
    uploadFlash.textContent = message;
    uploadFlash.style.display = "block";
    setTimeout(() => {
        uploadFlash.style.display = "none";
    }, 4000);
}
