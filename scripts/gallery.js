// Setting a delay to load DB details and than trying to access it
setTimeout(() => {
    if (db) {
        // Video Retrieval
        
        // Accessing the video object store and iterating through each one of them
        let videoDBTransaction = db.transaction("video")
        let videoStore = videoDBTransaction.objectStore("video")
        let videoRequest = videoStore.getAll(); // Event driven
        videoRequest.onsuccess = (e) => {
            let videoResult = videoRequest.result;
            console.log("videoResult", videoResult)
            let galleryCont = document.querySelector(".gallery-cont")

            videoResult.forEach((videoObj) => {

                // Structuring a defined html div component which will display the video recordings with delete and download button
                let mediaElem = document.createElement("div")
                mediaElem.setAttribute("class", "media-cont");
                mediaElem.setAttribute("id", videoObj.id)

                let url = URL.createObjectURL(videoObj.blobData)

                mediaElem.innerHTML = `
                <div class="media">
                    <video autoplay loop src="${url}"></video>
                </div>
                <div class="delete action-btn">DELETE</div>
                <div class="download action-btn">DOWNLOAD</div>
                `;

                // Appending the element to gallery
                galleryCont.appendChild(mediaElem)

                // Adding action listeners to delete and download button
                let deleteBtn = mediaElem.querySelector(".delete");
                deleteBtn.addEventListener("click", deleteListener);
                let downloadBtn = mediaElem.querySelector(".download");
                downloadBtn.addEventListener("click", donwloadListener);
            })
        
        }

        // Image Retrival

        // Accessing the image object store and iterating through each one of them
        let imageDBTransaction = db.transaction("image")
        let imageStore = imageDBTransaction.objectStore("image")
        let imageRequest = imageStore.getAll(); // Event driven
        imageRequest.onsuccess = (e) => {
            let imageResult = imageRequest.result;
            console.log("imageResult", imageResult)
            let galleryCont = document.querySelector(".gallery-cont")

            imageResult.forEach((imageObj) => {

                // Structuring a defined html div component which will display the captured images with delete and download button
                let mediaElem = document.createElement("div")
                mediaElem.setAttribute("class", "media-cont");
                mediaElem.setAttribute("id", imageObj.id)

                let url = imageObj.url

                mediaElem.innerHTML = `
                <div class="media">
                    <img src="${url}" />
                </div>
                <div class="delete action-btn">DELETE</div>
                <div class="download action-btn">DOWNLOAD</div>
                `;

                // Appending the element to gallery
                galleryCont.appendChild(mediaElem)

                // Adding action listeners to delete and download button
                let deleteBtn = mediaElem.querySelector(".delete");
                deleteBtn.addEventListener("click", deleteListener);
                let downloadBtn = mediaElem.querySelector(".download");
                downloadBtn.addEventListener("click", donwloadListener);
            })
        
        }

    }
}, 100)

/**
 * This function deletes the targeted gallery element and removes it from both UI and DB
 * @param {Object} e 
 */
function deleteListener(e) {

    // Performing DB removal of gallery component
    let id = e.target.parentElement.getAttribute("id");
    let type = id.slice(0, 3);

    // Checking whether selected gallery element is a video or image and deleting based on media type
    if (type === "vid") {
        let videoDBTransaction = db.transaction("video", "readwrite")
        let videoStore = videoDBTransaction.objectStore("video")
        videoStore.delete(id);

    } else if (type === "img") {
        let imageDBTransaction = db.transaction("image", "readwrite")
        let imageStore = imageDBTransaction.objectStore("image")
        imageStore.delete(id);
    }

    // Selecting the gallery element and removing it from the html structure
    e.target.parentElement.remove();
}

/**
 * This function downloads the media element either it be video or image 
 * @param {Object} e 
 */
function donwloadListener(e) {
    let id = e.target.parentElement.getAttribute("id");
    let type = id.slice(0, 3);

    // Checking whether selected gallery element is a video or image and downloading it based on media type
    if (type === "vid") {
        let videoDBTransaction = db.transaction("video", "readwrite")
        let videoStore = videoDBTransaction.objectStore("video")
        let videoRequest = videoStore.get(id);
        videoRequest.onsuccess = (e) => {
            let videoResult = videoRequest.result;

            // Since video data is stored in blob data(chunks) format, creating a object url for it and assigning it to anchor tag and downloading it 
            let videoURL = URL.createObjectURL(videoResult.blobData);
            let a = document.createElement("a");
            a.href = videoURL;
            a.download = "stream.mp4"
            a.click();
        }

    } else if (type === "img") {
        let imageDBTransaction = db.transaction("image", "readwrite")
        let imageStore = imageDBTransaction.objectStore("image")
        let imageRequest = imageStore.get(id);
        imageRequest.onsuccess = (e) => {
            let imageResult = imageRequest.result;

            // In object store, image url is directly stored, we can assign it to anchor tag and use it for downloading 
            let imageURL = imageResult.url;
            let a = document.createElement("a")
            a.href = imageURL
            a.download = "image.jpeg";
            a.click()
        }
    }
}