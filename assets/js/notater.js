const noteContainer = document.querySelector("#notes");
const input = document.querySelector("#inpNotattekst");



// EventListener to input field
input.addEventListener("keyup", opretNotat);

const wsurl = "https://notes-15933.firebaseio.com";


// Kald databasen når siden loader og vis alle notater fra Firebase
kaldWebserviceHentAlle();


// *** LOGIN ***********************
// ********************************

let minToken = null; // Token som vi får fra Firebase hvis login godkendes

loginNu(); // Kald loginNu function

function loginNu() {

    // GET
    // Api key fra

    fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCpCF6l5SeNHO0BcVPg4z_DbypXBqtqKlE", {
        method: 'POST',
        body: JSON.stringify({
            email: 'jonasv2711@gmail.com',
            password: 'jomani123',
            returnSecureToken: true
        })

    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        // console.log(json);
        minToken = json.idToken;
    }).catch(function (error) {
        console.log(error);
    });


}







// *** VIS ALLE NOTATER ***********************
// ********************************

function kaldWebserviceHentAlle() {

    //GET
    fetch(wsurl + "/notes.json", {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        udskrivNoter(json);
    }).catch(function (error) {
        console.log(error);
    });
}

function udskrivNoter(noterjson) {

    // Tøm tidligere indlæste notater for at undgå dubletter
    noteContainer.innerHTML = "";

    // Loop alle notater ind (ved pageload + efter opret, ret og slet)
    // Loop objektets keys igennem - altså ID'erne

    for (let id of Object.keys(noterjson)) {

        // Lav en <div class="note"><div className="">..
        let noteDiv = document.createElement("div");
        noteDiv.className = "note";
        let datoP = document.createElement("p");
        datoP.setAttribute("data-id", id);
        let dato = new Date().toLocaleString();
        datoP.innerHTML = noterjson[id].dato;


        let p = document.createElement("p");
        p.setAttribute("data-id", id);
        p.setAttribute("contenteditable", "true");
        p.onkeydown = function (e) {
            // Hvis der klikkes på return/enter .. 
            if (e.keyCode === 13) {
                e.preventDefault();
                kaldWebserviceRet(p, dato); // this = p som der er keyevents på
            }
        };
        p.innerHTML = noterjson[id].notat;


        // Lav <div> med sletsymbol
        let sletDiv = document.createElement("div");
        sletDiv.setAttribute("data-id", id);
        sletDiv.innerHTML = "&#9746;";
        sletDiv.onclick = function () {
            kaldWebserviceSlet(this.getAttribute("data-id"));
        }

        // Tilføj p og sletDiv til noteDiv
        noteDiv.appendChild(p);
        noteDiv.appendChild(datoP);
        noteDiv.appendChild(sletDiv);
        noteContainer.appendChild(noteDiv);

        // Tilføj noteDiv til div#notes
        noteContainer.appendChild(noteDiv);
    }
}


// *** POST - opret notat **************************************
//*********************************************** */ 
function opretNotat(e) {


    if (e.keyCode === 13) {
        kaldWebserviceOpret(e.target.value);
        input.value = "";

    }
}

kaldWebserviceHentAlle();
function kaldWebserviceOpret(input) {
    let tidsPunkt = new Date().toLocaleString();
    const nytNotat = {
        "notat": input,
        "dato": tidsPunkt

    };

    //POST
    fetch(wsurl + "/notes.json?auth=" + minToken, {
        method: 'POST',
        body: JSON.stringify(nytNotat)
    }).then(function () {


        kaldWebserviceHentAlle();

    }).catch(function (error) {
        console.log(error);
    });
}

// *** SLET NOTAT **************************************
//*********************************************** */ 

function kaldWebserviceSlet(notatid) {

    // console.log("Dert er klikket på slet - id " + notatid);

    // DELETE
    fetch(wsurl + "/notes/" + notatid + ".json?auth=" + minToken, {
        method: 'DELETE'
    }).then(function () {
        kaldWebserviceHentAlle(); // Genindlæs indhold/noter så den slettede er væk

    }).catch(function (error) {
        console.log(error);
    });
}

// *** RET NOTAT ****************************
// *************************************** 

function kaldWebserviceRet(p, dato) {

    let notatId = p.getAttribute("data-id");
    let notatText = p.innerHTML.replace("<br>", ""); // Fjern <br> fra teksten

    // console.log(notatId);
    // console.log(notatText);

    let retEtNotat = {
        "notat": notatText,
        "dato": dato
    };

    // PUT
    fetch(wsurl + "/notes/" + notatId + ".json?auth=" + minToken, {
        method: "PUT",
        body: JSON.stringify(retEtNotat)
    }).then(function () {
        kaldWebserviceHentAlle(); // Genindlæs indhold/noter nu med retten note

    }).catch(function (error) {
        console.log(error);
    });
}