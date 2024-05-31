// Aplicado a todos los HTML
if (localStorage.getItem("sessionToken") !== null) {
    document.getElementById("logButton").innerText = "Log out";
} else {
    document.getElementById("logButton").innerText = "Log in";
}

// login.html
var loginButton = document.getElementById("logButton");
if (loginButton.innerText === "Log out") {
    loginButton.addEventListener("click", async () => {
        var token = localStorage.getItem("sessionToken");
        await logout(token);
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("usernameCache");
        window.location.href = "/";
    });
}
async function logout(token) {
    return await fetch("/api/logout", {
        method: "POST",
        body: JSON.stringify({
            token: token,
        }),
    }).then((response) => {
        return response.json();
    });
}
var form = document.querySelector("#login");
form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var result = await login(username, password);
    if (result.sessionToken != undefined) {
        localStorage.setItem("sessionToken", result.sessionToken);
        localStorage.setItem("usernameCache", result.username);
        window.location.href = "/";
    } else {
        alert("Invalid username or password!");
    }
});
async function login(username, password) {
    return await fetch("/api/weblogin", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        return response.json();
    });
}

// ranking.html
window.addEventListener("load", async () => {
    var result = await showRanking();
    if (result === undefined) {
        console.log("No hi ha dades per mostrar al ranking");
        return;
    }
    var iterator = 1;
    var user = localStorage.getItem("usernameCache");
    result.forEach((element) => {
        const table = document.querySelector("#ranking");
        const tr = document.createElement("tr");
        const position = document.createElement("td");
        const nameTd = document.createElement("td");
        const maxCoinsTd = document.createElement("td");
        position.textContent = iterator++;
        nameTd.textContent = element.name;
        maxCoinsTd.textContent = element.maxcoins;
        if (element.username == user) {
            position.style.backgroundColor = "lightblue";
            nameTd.style.backgroundColor = "lightblue";
            maxCoinsTd.style.backgroundColor = "lightblue";
        }
        tr.appendChild(position);
        tr.appendChild(nameTd);
        tr.appendChild(maxCoinsTd);
        table?.appendChild(tr);
    });
});
async function showRanking() {
    return await fetch("/api/ranking", {
        method: "GET",
    }).then((response) => {
        return response.json();
    });
}
