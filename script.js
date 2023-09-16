document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

const toggleSidebarButton = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const flexBox = document.getElementById('flex-box');
const searchbar = document.getElementById('search-bar');

const favoriteListKey = "favoritesList";

// Check if the favorites list exists in local storage, if not, initialize it as an empty array.
if (localStorage.getItem(favoriteListKey) === null) {
    localStorage.setItem(favoriteListKey, JSON.stringify([]));
}

// Update the total task counter displayed in the UI.
function updateTaskCounter() {
    const taskCounter = document.getElementById('total-counter');
    const favoriteList = JSON.parse(localStorage.getItem(favoriteListKey));
    if (taskCounter.innerText !== null) {
        taskCounter.innerText = favoriteList.length;
    }
}

// Check if an item with a given ID is in the favorites list.
function isFavorite(list, id) {
    return list.includes(id);
}

// Truncate text to a specified length with an ellipsis (...) if it exceeds that length.
function truncateText(text, length) {
    return text?.length > length ? text.substr(0, length - 1) + "..." : text;
}

// Generate a random character.
function getRandomCharacter() {
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz";
    return possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
}

// Event listener for the toggle button to show/hide the sidebar.
toggleSidebarButton.addEventListener("click", function () {
    showFavoriteMealList();
    sidebar.classList.toggle("show");
    flexBox.classList.toggle('shrink');
});

// Event listener for scrolling in the flexBox to toggle the fixed position of the search bar.
flexBox.onscroll = function () {
    if (flexBox.scrollTop > searchbar.offsetTop) {
        searchbar.classList.add("fixed");
    } else {
        searchbar.classList.remove("fixed");
    }
};

// Function to fetch meals from an API based on a search value.
const fetchMealsFromApi = async (baseUrl, value) => {
    const response = await fetch(`${baseUrl + value}`);
    const meals = await response.json();
    return meals;
};

// Function to display a list of meals based on the search input.
async function showMealList() {
    const favoriteList = JSON.parse(localStorage.getItem(favoriteListKey));
    const inputValue = document.getElementById("search-input").value;
    const apiUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealsData = await fetchMealsFromApi(apiUrl, inputValue);
    let html = '';

    if (mealsData.meals) {
        html = mealsData.meals.map(element => {
            return `
            <div class="card">
                <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${inputValue}')">
                    <div class="dish-photo" >
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="dish-name">
                        ${element.strMeal}
                    </div>
                    <div class="dish-details">
                        ${truncateText(element.strInstructions, 50)}
                        <span class="button" onclick="showMealDetails(${element.idMeal}, '${inputValue}')">Know More</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="like">
                        <i class="fa-solid fa-heart ${isFavorite(favoriteList, element.idMeal) ? 'active' : ''} " onclick="addRemoveFromFavorites(${element.idMeal})">Add to Fav</i>
                    </div>
                    <div class="play">
                      
                    </div>
                </div>
            </div>`;
        }).join('');

        document.getElementById('cards-holder').innerHTML = html;
    }
}

// Function to add or remove a meal from the favorites list.
function addRemoveFromFavorites(id) {
    const favoritesList = JSON.parse(localStorage.getItem(favoriteListKey));
    const isExisting = favoritesList.includes(id);

    if (isExisting) {
        const index = favoritesList.indexOf(id);
        if (index !== -1) {
            favoritesList.splice(index, 1);
        }
    } else {
        favoritesList.push(id);
    }

    localStorage.setItem(favoriteListKey, JSON.stringify(favoritesList));
    showMealList();
    showFavoriteMealList();
    updateTaskCounter();
}

// Function to display detailed information about a meal.
async function showMealDetails(itemId, searchInput) {
    const favoritesList = JSON.parse(localStorage.getItem(favoriteListKey));
    flexBox.scrollTo({ top: 0, behavior: "smooth" });
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    const searchUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealList = await fetchMealsFromApi(searchUrl, searchInput);
    let html = '';

    const mealDetails = await fetchMealsFromApi(url, itemId);

    if (mealDetails.meals) {
        html = `
        <div class="container remove-top-margin">
            <div class="header hide">
                <div class="title">
                    Discover New Dining Experiences
                </div>
            </div>
            <div class="fixed" id="search-bar">
                <div class="icon">
                    <i class="fa-solid fa-search "></i>
                </div>
                <div class="new-search-input">
                    <form onkeyup="showMealList()">
                        <input id="search-input" type="text" placeholder="Search for food, recipe" />
                    </form>
                </div>
            </div>
        </div>
        <div class="item-details">
            <div class="item-details-left">
                <img src="${mealDetails.meals[0].strMealThumb}" alt="">
            </div>
            <div class="item-details-right">
                <div class="item-name">
                    <strong>Name: </strong>
                    <span class="item-text">${mealDetails.meals[0].strMeal}</span>
                 </div>
                <div class="item-category">
                    <strong>Category: </strong>
                    <span class="item-text">${mealDetails.meals[0].strCategory}</span>
                </div>
                <div class="item-ingredient">
                    <strong>Ingredients: </strong>
                    <span class="item-text">${mealDetails.meals[0].strIngredient1}, ${mealDetails.meals[0].strIngredient2}, ${mealDetails.meals[0].strIngredient3}, ${mealDetails.meals[0].strIngredient4}</span>
                </div>
                <div class="item-instruction">
                    <strong>Instructions: </strong>
                    <span class="item-text">${mealDetails.meals[0].strInstructions}</span>
                </div>
                <div class="item-video">
                    <strong>Video Link:</strong>
                    <span class="item-text"><a href="${mealDetails.meals[0].strYoutube}">Watch Here</a></span>
                    <div id="like-button" onclick="addRemoveFromFavorites(${mealDetails.meals[0].idMeal})">
                        ${isFavorite(favoritesList, mealDetails.meals[0].idMeal) ? 'Remove From Favorites' : 'Add To Favorites'}
                    </div>
                </div>
            </div>
        </div>
        <div class="card-name">
            Related Items
        </div>
        <div id="cards-holder" class="remove-top-margin">`;
    }

    if (mealList.meals !== null) {
        html += mealList.meals.map(element => {
            return `       
            <div class="card">
                <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${searchInput}')">
                    <div class="dish-photo" >
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="dish-name">
                        ${element.strMeal}
                    </div>
                    <div class="dish-details">
                        ${truncateText(element.strInstructions, 50)}
                        <span class="button" onclick="showMealDetails(${element.idMeal}, '${searchInput}')">Know More</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="like">
                        <i class="fa-solid fa-heart ${isFavorite(favoritesList, element.idMeal) ? 'active' : ''} " onclick="addRemoveFromFavorites(${element.idMeal})">Add to Fav</i>
                    </div>
                    <div class="play">
                        <a href="${element.strYoutube}">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    html = html + '</div>';

    document.getElementById('flex-box').innerHTML = html;
}

// Function to show the list of favorite meals.
async function showFavoriteMealList() {
    let favoriteList = JSON.parse(localStorage.getItem(favoriteListKey));
    let apiUrl = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    let html = "";

    if (favoriteList.length === 0) {
        html = `<div class="fav-item nothing"> <h1>Nothing To Show.....</h1> </div>`;
    } else {
        for (let i = 0; i < favoriteList.length; i++) {
            const favoriteMealList = await fetchMealsFromApi(apiUrl, favoriteList[i]);
            if (favoriteMealList.meals[0]) {
                let element = favoriteMealList.meals[0];
                html += `
                <div class="fav-item" onclick="showMealDetails(${element.idMeal},'${getRandomCharacter()}')">
                    <div class="fav-item-photo">
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="fav-item-details">
                        <div class="fav-item-name">
                            <strong>Name: </strong>
                            <span class="fav-item-text">${element.strMeal}</span>
                        </div>
                        <div id="fav-like-button" onclick="addRemoveFromFavorites(${element.idMeal})">
                            Remove
                        </div>
                    </div>
                </div>`;
            }
        }
    }
    document.getElementById('fav').innerHTML = html;
}

// Initialize the application when the page is loaded.
function initializeApp() {
    initializeTasks();
}
