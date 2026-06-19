const imageInput = document.getElementById("image-upload");
const fileCount = document.getElementById("file-count");

imageInput.addEventListener("change", () => {
    const totalFiles = imageInput.files.length;

    if (totalFiles > 0) {
        fileCount.textContent = `${totalFiles} image(s) selected`;
    } else {
        fileCount.textContent = "";
    }
});