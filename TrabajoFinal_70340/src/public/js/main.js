console.log("Estoy en main.js"); 

const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  // console.log(data);
  // console.log(document.cookie);

})

console.log(document.cookie);