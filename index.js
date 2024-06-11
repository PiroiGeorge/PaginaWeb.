const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const ejs = require('ejs');
const AccesBD = require("./module_proprii/accesbd.js");
const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js");
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const { Client } = require('pg');

const client = new Client({
    database: "cti_2024",
    user: "george",
    password: "george",
    host: "localhost",
    port: 5432
});
client.connect();

client.query("select * from unnest(enum_range(null::categ_prajitura))", function (err, rez) {
    console.log(rez);
});

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
};

client.query("select * from unnest(enum_range(null::tipuri_produse))", function (err, rezCategorie) {
    if (err) {
        console.log(err);
    } else {
        obGlobal.optiuniMeniu = rezCategorie.rows;
    }
});

const vect_foldere = ["temp", "temp1", "backup", "poze_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

const app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }
    next();
});

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get(["/", "/home", "/index"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
});

app.get("/produse", function (req, res) {
    client.query("SELECT * FROM produse", function (err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 500);
        } else {
            res.render("pagini/produse", { produse: rez.rows, optiuni: [] });
        }
    });
});

app.get("/produs/:id", function (req, res) {
    const query = {
        text: 'SELECT * FROM produse WHERE id = $1',
        values: [req.params.id],
    };

    client.query(query, function (err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 500);
        } else {
            if (rez.rows.length === 0) {
                afisareEroare(res, 404, 'Produsul nu a fost găsit', 'Produsul căutat nu există în baza de date.');
            } else {
                res.render("pagini/produs", { prod: rez.rows[0] });
            }
        }
    });
});

app.get("/cerere", function (req, res) {
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
});

app.get("/data", function (req, res, next) {
    res.write("Data: ");
    next();
});

app.get("/data", function (req, res) {
    res.write("" + new Date());
    res.end();
});

app.get("/inregistrare", function (req, res) {
    res.render("pagini/inregistrare");
});

app.get("*/galerie-animata.css", function (req, res) {
    var sirScss = fs.readFileSync(path.join(__dirname, "resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    var culori = ["navy", "black", "purple", "grey"];
    var indiceAleator = Math.floor(Math.random() * culori.length);
    var culoareAleatoare = culori[indiceAleator];
    rezScss = ejs.render(sirScss, { culoare: culoareAleatoare });
    console.log(rezScss);
    var caleScss = path.join(__dirname, "temp/galerie_animata.scss");
    fs.writeFileSync(caleScss, rezScss);
    try {
        rezCompilare = sass.compile(caleScss, { sourceMap: true });
        var caleCss = path.join(__dirname, "temp/galerie_animata.css");
        fs.writeFileSync(caleCss, rezCompilare.css);
        res.setHeader("Content-Type", "text/css");
        res.sendFile(caleCss);
    } catch (err) {
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map", function (req, res) {
    res.sendFile(path.join(__dirname, "temp/galerie-animata.css.map"));
});

app.get("/suma/:a/:b", function (req, res) {
    var suma = parseInt(req.params.a) + parseInt(req.params.b);
    res.send("" + suma);
});

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"));
});

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    var formular = new formidable.IncomingForm();
    formular.parse(req, function (err, campuriText, campuriFisier) {
        if (err) {
            console.log(err);
            res.render("pagini/eroare_generala", { text: "Eroare la procesarea formularului" });
            return;
        }

        console.log("Inregistrare:", campuriText);
        console.log(campuriFisier);
        console.log(poza, username);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume[0];
            utilizNou.setareUsername = campuriText.username[0];
            utilizNou.email = campuriText.email[0];
            utilizNou.prenume = campuriText.prenume[0];
            utilizNou.parola = campuriText.parola[0];
            utilizNou.culoare_chat = campuriText.culoare_chat[0];
            utilizNou.poza = poza[0];
            utilizNou.rol = "comun";  // Assign the default role "comun"

            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) {
                    utilizNou.salvareUtilizator(function (err) {
                        if (err) {
                            console.log(err);
                            res.render("pagini/inregistrare", { err: "Eroare la salvarea utilizatorului. Încercați din nou." });
                        } else {
                            res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" });
                        }
                    });
                } else {
                    eroare += "Mai exista username-ul";
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
                }
            });
        } catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
        }
    });

    formular.on("field", function (nume, val) {
        if (nume == "username")
            username = val;
    });

    formular.on("fileBegin", function (nume, fisier) {
        var folderUser = path.join(__dirname, "poze_uploadate", username);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename);
        poza = fisier.originalFilename;
    });

    formular.on("file", function (nume, fisier) {
        console.log("file", nume, fisier);
    });
});


app.post("/login", function (req, res) {
    var username;
    var formular = new formidable.IncomingForm();
    formular.parse(req, function (err, campuriText, campuriFisier) {
        var parametriCallback = {
            req: req,
            res: res,
            parola: campuriText.parola[0]
        };
        Utilizator.getUtilizDupaUsername(campuriText.username[0], parametriCallback,
            function (u, obparam, eroare) {
                let parolaCriptata = Utilizator.criptareParola(obparam.parola);
                if (u.parola == parolaCriptata) {
                    u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                    obparam.req.session.utilizator = u;
                    obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                    obparam.res.redirect("/index");
                } else {
                    obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                    obparam.res.redirect("/index");
                }
            });
    });
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
});

app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function (req, res) {
    afisareEroare(res, 403);
});

app.get("/*", function (req, res) {
    try {
        res.render("pagini" + req.url, function (err, rezHtml) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                }
            } else {
                res.send(rezHtml + "");
            }
        });
    } catch (err1) {
        if (err1.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        } else {
            afisareEroare(res);
        }
    }
});




app.post("/sterge_utiliz", function (req, res) {

    /* TO DO
    * in if testam daca utilizatorul din sesiune are dreptul sa stearga utilizatori
    * completam obiectComanda cu parametrii comenzii select pentru a prelua toti utilizatorii
    */
    if (req?.utilizator?.areDreptul(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {
            var obiectComanda = {
                tabel: "utilizatori",
                conditiiAnd: [`id=${campuriText.id_utiliz[0]}`]
            }
            AccesBD.getInstanta().delete(obiectComanda, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }

})

function initErori() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
}

initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(elem => elem.identificator == identificator);
    if (!eroare) {
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: titlu || eroare_default.titlu,
            text: text || eroare_default.text,
            imagine: imagine || eroare_default.imagine,
        });
        return;
    } else {
        if (eroare.status)
            res.status(eroare.identificator);
        res.render("pagini/eroare", {
            titlu: titlu || eroare.titlu,
            text: text || eroare.text,
            imagine: imagine || eroare.imagine,
        });
        return;
    }
}

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}
initImagini();

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss));
    }
    let rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
}

let vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});

app.listen(8080);
console.log("Serverul a pornit pe portul 8080");
