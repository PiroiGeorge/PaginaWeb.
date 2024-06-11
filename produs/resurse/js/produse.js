window.addEventListener("load", function () {
    let iduriProduse = localStorage.getItem("cos_virtual");
    iduriProduse = iduriProduse ? iduriProduse.split(",") : [];

    for (let idp of iduriProduse) {
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if (ch) {
            ch.checked = true;
        } else {
            console.log("id cos virtual inexistent:", idp);
        }
    }

    let checkboxuri = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri) {
        ch.onchange = function () {
            let iduriProduse = localStorage.getItem("cos_virtual");
            iduriProduse = iduriProduse ? iduriProduse.split(",") : [];

            if (this.checked) {
                iduriProduse.push(this.value);
            } else {
                let poz = iduriProduse.indexOf(this.value);
                if (poz != -1) {
                    iduriProduse.splice(poz, 1);
                }
            }

            localStorage.setItem("cos_virtual", iduriProduse.join(","));
        };
    }

    document.getElementById("inp-pret").oninput = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    };

    document.getElementById("filtrare").onclick = function () {
        // Verificăm întâi dacă valorile inputurilor sunt valide
        if (!validateInputs()) {
            return; // Întrerupem operația dacă valorile nu sunt valide
        }

        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let val_pret = parseFloat(document.getElementById("inp-pret").value);
        let val_categ = document.getElementById("inp-categorie").value;

        let produse = document.getElementsByClassName("produs");

        for (let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            let cond1 = nume.includes(val_nume);
            let cond2 = val_categ === "toate" || categorie === val_categ;
            let cond3 = pret >= val_pret;

            if (cond1 && cond2 && cond3) {
                prod.style.display = "block";
            }
        }
    };

    document.getElementById("resetare").onclick = function () {
        // Afisam un mesaj de confirmare
        let confirmReset = confirm("Sunteți sigur că doriți să resetati filtrele? Aceasta acțiune va afișa toate produsele și va anula sortarea.");

        // Daca utilizatorul a confirmat resetarea
        if (confirmReset) {
            // Reseteaza valorile filtrului de nume
            document.getElementById("inp-nume").value = "";

            // Reseteaza valoarea filtrului de pret
            let inpPret = document.getElementById("inp-pret");
            inpPret.value = inpPret.min;

            // Reseteaza filtrul de categorie
            document.getElementById("inp-categorie").value = "toate";

            // Reafișează toate produsele (fără niciun filtru aplicat)
            let produse = document.getElementsByClassName("produs");
            for (let prod of produse) {
                prod.style.display = "block";
            }

            // Anuleaza sortarea
            let container = document.getElementById("produse");
            let initialOrder = container.querySelectorAll(".produs");
            for (let prod of initialOrder) {
                container.appendChild(prod);
            }

            // Revenim la ordinea inițială a produselor
        }
    };

    function sortare(semn) {
        let produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a === pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        });
        let container = document.getElementById("produse");
        for (let prod of v_produse) {
            container.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function () {
        // Verificăm întâi dacă valorile inputurilor sunt valide
        if (!validateInputs()) {
            return; // Întrerupem operația dacă valorile nu sunt valide
        }

        sortare(1);
    };

    document.getElementById("sortDescrescNume").onclick = function () {
        // Verificăm întâi dacă valorile inputurilor sunt valide
        if (!validateInputs()) {
            return; // Întrerupem operația dacă valorile nu sunt valide
        }

        sortare(-1);
    };

    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            // Calculează suma produselor selectate
            let sumaSelectata = 0;
            let produseSelectate = document.querySelectorAll(".select-cos:checked");
            produseSelectate.forEach(function (prod) {
                let pret = parseFloat(prod.closest(".produs").getElementsByClassName("val-pret")[0].innerHTML);
                sumaSelectata += pret;
            });

            // Afisează suma într-un mesaj
            alert("Suma produselor selectate este: " + sumaSelectata.toFixed(2));
        }
    };
});

// Funcție pentru verificarea valorilor valide ale inputurilor
function validateInputs() {
    // Verificare input de tip număr (preț minim)
    let pretInput = document.getElementById("inp-pret");
    if (isNaN(parseFloat(pretInput.value)) || parseFloat(pretInput.value) < parseFloat(pretInput.min) || parseFloat(pretInput.value) > parseFloat(pretInput.max)) {
        alert("Vă rugăm să introduceți un preț valid.");
        return false;
    }

    // Dacă toate verificările sunt trecute, returnează true
    return true;
}
