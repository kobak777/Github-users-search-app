const form = document.querySelector("[data-search-form]");
const input = document.querySelector("[data-search-input]");
const userInfoContainer = document.querySelector("[data-user-info-container]");
const reposContainer = document.querySelector("[data-repos-container]");
const historyContainer = document.querySelector("[data-history-container]");

const API_GITHUB = "https://api.github.com/users/";

let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
renderHistory();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = input.value.trim();

  if (!username) {
    alert("Please enter a GitHub username");
    return;
  }

  userInfoContainer.innerHTML = `<p>Loading...</p>`;
  reposContainer.innerHTML = "";

  try {
    const userResponse = await fetch(`${API_GITHUB}${username}`);
    if (!userResponse.ok) throw new Error("User not found!");
    const userData = await userResponse.json();

    userInfoContainer.innerHTML = `
        <div>
            <img src="${userData.avatar_url}" alt="${userData.login}">
            <h2>${userData.name || userData.login}</h2>
            <p>${userData.bio || "No bio available!"}</p>
        </div>
    `;
    addToHistory(username);

    const reposResponse = await fetch(userData.repos_url);
    if (!reposResponse.ok) throw new Error("Could not fetch repos!");
    const repos = await reposResponse.json();

    if (repos.length) {
      reposContainer.innerHTML = `<h3>Repositories</h3>`;
      repos.forEach(repo => {
        reposContainer.innerHTML += `
            <div class="repo">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </div>
        `;
      });
    } else {
      reposContainer.innerHTML = `<h2>No repositories found!</h2>`;
    }
  } catch (error) {
    userInfoContainer.innerHTML = `<p>${error.message}</p>`;
  }
});

function addToHistory(username) {
  searchHistory = searchHistory.filter(item => item.toLowerCase() !== username.toLowerCase());
  searchHistory.unshift(username);
  searchHistory = searchHistory.slice(0, 5);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  if (searchHistory.length === 0) {
    historyContainer.innerHTML = "History is clear";
    return;
  }
  historyContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3>Recent searches:</h3>
      <button class="clear-history-btn">Clear</button>
    </div>
    <ul>
      ${searchHistory.map(user => `<li><button class="history-btn">${user}</button></li>`).join("")}
    </ul>
  `;

  historyContainer.querySelectorAll(".history-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      input.value = btn.textContent;
      form.dispatchEvent(new Event("submit"));
    });
  });

  historyContainer.querySelector(".clear-history-btn").addEventListener("click", () => {
    searchHistory = [];
    localStorage.removeItem("searchHistory");
    renderHistory();
  });
}