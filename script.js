// Paste your short Bin ID between the quotes below!
const BIN_ID = "69d373ebaaba882197cb9a21"; 

let isLoggedIn = false;
let secretApiKey = ""; 

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const saveBtn = document.getElementById('saveBtn');
const addAnimeBtn = document.getElementById('addAnimeBtn');
const searchInput = document.getElementById('searchInput');
const animeNameInput = document.getElementById('animeName');
const rankedList = document.getElementById('ranked-list');
const unrankedPool = document.getElementById('unranked-pool');

let sortableRanked, sortablePool;

// Helper function to extract items from a list
const getListItems = (containerSelector) => {
    return Array.from(document.querySelectorAll(`${containerSelector} .anime-item`)).map(item => ({
        name: item.dataset.name,
        img: item.dataset.img,
        comment: item.querySelector('.anime-comment').value
    }));
};

// NEW: Helper function to stamp the permanent rank number on items
function updateRanks() {
    const rankedItems = document.querySelectorAll('#ranked-list .anime-item');
    // Loops through all items (even hidden ones) and gives them their true number
    rankedItems.forEach((item, index) => {
        const rankDiv = item.querySelector('.anime-rank');
        if(rankDiv) {
            rankDiv.innerText = index + 1;
        }
    });
}

// Save to the online database
async function saveData(showNotification = false) {
    if (!isLoggedIn) return; 

    const dataToSave = { 
        ranked: getListItems('#ranked-list'), 
        pool: getListItems('#unranked-pool') 
    };

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': secretApiKey 
            },
            body: JSON.stringify(dataToSave)
        });

        if (response.ok) {
            if (showNotification) alert("List successfully saved to the cloud!");
        } else {
            alert("Error saving. Did you enter the correct secret API key?");
        }
    } catch (error) {
        console.error("Could not save:", error);
    }
}

function initSortable() {
    const options = {
        group: 'shared', 
        animation: 150,
        disabled: true,
        onEnd: () => { 
            updateRanks(); // Recalculate numbers when dropped
            saveData(false); 
        } 
    };
    sortableRanked = new Sortable(rankedList, options);
    sortablePool = new Sortable(unrankedPool, options);
}

// Login logic
loginBtn.addEventListener('click', () => {
    if (!isLoggedIn) {
        const key = prompt("Enter your secret JSONBin API key to edit:");
        if (!key) return; 

        secretApiKey = key;
        isLoggedIn = true;
        
        document.body.classList.add('admin-mode');
        loginBtn.innerText = "Lock List (Logout)";
        loginBtn.classList.add('btn-primary');
        adminPanel.classList.remove('hidden');
        
        sortableRanked.option("disabled", false);
        sortablePool.option("disabled", false);
        document.querySelectorAll('.anime-comment').forEach(input => input.disabled = false);
    } else {
        secretApiKey = "";
        isLoggedIn = false;
        
        document.body.classList.remove('admin-mode');
        loginBtn.innerText = "Login to Edit";
        loginBtn.classList.remove('btn-primary');
        adminPanel.classList.add('hidden');
        
        sortableRanked.option("disabled", true);
        sortablePool.option("disabled", true);
        document.querySelectorAll('.anime-comment').forEach(input => input.disabled = true);
    }
});

animeNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        addAnimeBtn.click();
    }
});

// Create the DOM element for an anime
function createAnimeElement(name, imgUrl, commentText = "") {
    const item = document.createElement('div');
    item.classList.add('anime-item');
    item.dataset.name = name;
    item.dataset.img = imgUrl || '';

    // NEW: The physical number element
    const rankDiv = document.createElement('div');
    rankDiv.classList.add('anime-rank');
    // Initially empty, will be filled by updateRanks()

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('anime-img');
    if (imgUrl) imgDiv.style.backgroundImage = `url('${imgUrl}')`;
    
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('anime-title');
    titleDiv.innerText = name;

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.classList.add('anime-comment');
    commentInput.placeholder = "Write a comment...";
    commentInput.value = commentText;
    commentInput.disabled = !isLoggedIn; 
    
    commentInput.addEventListener('change', () => saveData(false));

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '✖';
    deleteBtn.title = "Remove anime";
    deleteBtn.addEventListener('click', () => {
        item.remove();
        updateRanks(); // Recalculate numbers if one is deleted
        saveData(false); 
    });

    // Add elements in the correct order
    item.appendChild(rankDiv); 
    item.appendChild(imgDiv);
    item.appendChild(titleDiv);
    item.appendChild(commentInput);
    item.appendChild(deleteBtn);

    return item;
}

// Fetch from API
addAnimeBtn.addEventListener('click', async () => {
    const nameInput = animeNameInput.value;
    if (nameInput.trim() === "") { 
        alert("You must enter a name!"); 
        return; 
    }

    addAnimeBtn.innerText = "Searching...";
    addAnimeBtn.disabled = true;

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nameInput)}&limit=1`);
        const data = await response.json();

        let finalName = nameInput;
        let imgUrl = "";

        if (data.data && data.data.length > 0) {
            finalName = data.data[0].title_english || data.data[0].title;
            imgUrl = data.data[0].images.jpg.image_url;
        } else {
            alert(`Could not find an anime named "${nameInput}". Adding it without an image.`);
        }

        const newItem = createAnimeElement(finalName, imgUrl, "");
        unrankedPool.appendChild(newItem);
        
        saveData(false);
        animeNameInput.value = "";
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Something went wrong while connecting to the database.");
    } finally {
        addAnimeBtn.innerText = "Search & Add";
        addAnimeBtn.disabled = false;
        animeNameInput.focus();
    }
});

// Search filter logic
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allItems = document.querySelectorAll('.anime-item');
    
    allItems.forEach(item => {
        const title = item.dataset.name.toLowerCase();
        item.style.display = title.includes(term) ? 'flex' : 'none';
    });
});

saveBtn.addEventListener('click', () => saveData(true));

// Load data from the cloud
async function loadLayout() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Bin-Meta': 'false' }
        });
        
        if (!response.ok) throw new Error("Could not fetch the data.");
        
        const savedData = await response.json();
        
        rankedList.innerHTML = '';
        unrankedPool.innerHTML = '';

        if (savedData.ranked) {
            savedData.ranked.forEach(item => {
                rankedList.appendChild(createAnimeElement(item.name, item.img, item.comment));
            });
        }
        
        if (savedData.pool) {
            savedData.pool.forEach(item => {
                unrankedPool.appendChild(createAnimeElement(item.name, item.img, item.comment));
            });
        }

        // Apply numbers as soon as the list is loaded
        updateRanks();

    } catch (error) {
        console.error(error);
        rankedList.innerHTML = `<div class="error-message">Could not load the list from the cloud. Verify your BIN_ID.</div>`;
    }
}

// Initialize the application
loadLayout();
initSortable();