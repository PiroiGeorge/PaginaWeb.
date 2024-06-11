class Produs{

    constructor({ id, nume, descriere, pret, gramaj, tip_produs, categorie, imagine, data_adaugare, tehnologie, brand } ={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }

    }

}