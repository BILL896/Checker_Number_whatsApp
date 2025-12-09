function creatPage() {
  const result = document.getElementById("result");
  const paragraphe = document.createElement("p");
}

check = document.querySelector("#check");
check.addEventListener("click", function () {
  const buttons = ["Enregistrez", "Envoyer un message", "Bloquer"];
  const container = document.getElementById("container");

  const number = document.getElementById("number");
  const valeur = number.value;
  const resultDiv = document.getElementById("result");
  if (valeur === "") {
    resultDiv.innerHTML = '<p class="error">❌ Le champ est vide</p>';
    return;
  }
  if (valeur.length < 8) {
    resultDiv.innerHTML =
      '<p style="color: red; font-weight: bold;">❌ format ou numero incorrect</p>';
    return; // ⬅️
  }
  if (!/^[0-9]+$/.test(valeur)) {
    resultDiv.innerHTML = '<p class="error">❌ Chiffres seulement</p>';
    return;
  }
  this.disabled = true;
  document.getElementById("result").innerHTML = "<p>⏳ Loading...</p>";
  container.innerHTML = "";
  setTimeout(() => {
    document.getElementById(
      "result"
    ).textContent = `✅ Terminé ! ${valeur} est sur whatsapp! `;

    // affiche les buttons d'actions
    buttons.forEach((texte, index) => {
      const btn = document.createElement("button");
      btn.textContent = texte;
      btn.className = "btn";
      btn.id = `btn-${index}`;

      if (texte == "Enregistrez") {
        btn.style.backgroundColor = "green";
        btn.style.color = "white";
        btn.addEventListener("click", () => {
          const Enregistrez = (document.getElementById(
            "data"
          ).innerHTML = `Enregitrez`);
        });
      }
      if (texte == "Envoyer un message") {
        btn.style.backgroundColor = "gray";
        btn.style.color = "white";
      }
      if (texte == "Bloquer") {
        btn.style.backgroundColor = "red";
        btn.style.color = "white";
        btn.addEventListener("click", () => {
          if (confirm("Voulez-vous vraiment bloquer?")) {
            alert(`vous avez bloquer ${valeur}`);
          }
        });
      }
      container.appendChild(btn);
    });

    check.disabled = false;
  }, 1000);
});
