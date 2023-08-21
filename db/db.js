// Open a database
// Create ObjectStore
let db;
let openRequest = indexedDB.open("MyGallery");

// On successful open operation of indexedDB store the result in db
openRequest.addEventListener("success", (e) => {
    console.log("DB Success")
    db = openRequest.result;
})

// If error occured on open operation of indexedDB logging it to console
openRequest.addEventListener("error", (e) => {
    console.log("DB Error")

})

// This event happens whenever a upgrade is made in indexedDb or on a new creating of db
openRequest.addEventListener("upgradeneeded", (e) => {
    console.log("DB Upgraded and also for initial DB creation")
    db = openRequest.result;

    // Creating two object stores, one for video and one for image
    db.createObjectStore("video", {keyPath: "id"})
    db.createObjectStore("image", {keyPath: "id"})

})