
// ------------------------------------------
// MUUTUJAD
// ------------------------------------------

let kaart;

let alguspunkt = null;
let loppunkt = null;

let marker1 = null;
let marker2 = null;

let marsruut = null;


// ------------------------------------------
// KAARDI KÄIVITAMINE
// ------------------------------------------

function algus() {

    // Loome kaardi ja keskendume Tallinnale
    kaart = L.map("kaardikiht").setView(
        [59.439, 24.773],
        12
    );


    // Maa-ameti kaart
    new L.TileLayer(
        "https://tiles.maaamet.ee/tm/tms/1.0.0/hybriid@GMC/{z}/{x}/{y}.png&ASUTUS=TLU&ERIALA=DIGIHUMANITAARIA",
        {
            attribution:
                "Kaart: <a href='https://www.maaamet.ee/'>Maa-amet</a>",

            tms: true
        }
    ).addTo(kaart);


    // Kui kaardil klikitakse
    kaart.on("click", kaardiVajutus);

}


// ------------------------------------------
// KAARDIL KLIKKIMINE
// ------------------------------------------

function kaardiVajutus(e) {

    // Kui alguspunkti pole veel valitud
    if (alguspunkt === null) {

        alguspunkt = e.latlng;

        marker1 = L.marker(alguspunkt)
            .addTo(kaart)
            .bindPopup("Alguspunkt")
            .openPopup();


        document.getElementById("juhis").innerText =
            "📍 Alguspunkt valitud. Nüüd klõpsa kaardil lõpp-punkt.";

        return;
    }


    // Kui alguspunkt on olemas, aga lõpp-punkti pole
    if (loppunkt === null) {

        loppunkt = e.latlng;

        marker2 = L.marker(loppunkt)
            .addTo(kaart)
            .bindPopup("Lõpp-punkt")
            .openPopup();


        document.getElementById("juhis").innerText =
            "🚗 Teekonda arvutatakse...";


        arvutaMarsruut();

        return;
    }

}


// ------------------------------------------
// MARSRUUDI ARVUTAMINE
// ------------------------------------------

function arvutaMarsruut() {

    let aadress =
        "https://router.project-osrm.org/route/v1/driving/" +

        alguspunkt.lng + "," +
        alguspunkt.lat +

        ";" +

        loppunkt.lng + "," +
        loppunkt.lat +

        "?overview=full&geometries=geojson";


    console.log("OSRM päring:");
    console.log(aadress);


    fetch(aadress)

        .then(vastus => vastus.json())

        .then(andmed => {

            if (
                !andmed.routes ||
                andmed.routes.length === 0
            ) {

                document.getElementById("juhis").innerText =
                    "Marsruuti ei leitud.";

                return;
            }


            // Võtame esimese marsruudi
            marsruut = andmed.routes[0];


            // Marsruudi pikkus on meetrites
            let meetrid = marsruut.distance;


            // Teeme meetritest kilomeetrid
            let kilomeetrid = meetrid / 1000;


            // Näitame kilomeetreid
            document.getElementById("distants").innerText =
                kilomeetrid.toFixed(2) + " km";


            document.getElementById("juhis").innerText =
                "✅ Teekond leitud! Kütusekulu on arvutatud.";


            // Joonistame marsruudi kaardile
            L.geoJSON(marsruut.geometry)
                .addTo(kaart);


            // Arvutame kütusekulu
            arvutaKulu(kilomeetrid);

        })

        .catch(viga => {

            console.error(viga);

            document.getElementById("juhis").innerText =
                "Marsruudi arvutamisel tekkis viga.";

        });

}


// ------------------------------------------
// KÜTUSEKULU ARVUTAMINE
// ------------------------------------------

function arvutaKulu(kilomeetrid) {

    // Kasutaja sisestatud keskmine kütusekulu
    let kulu = parseFloat(
        document.getElementById("kulu").value
    );


    // Kasutaja sisestatud kütuse hind
    let hind = parseFloat(
        document.getElementById("hind").value
    );


    // Kontrollime, kas numbrid on olemas
    if (
        isNaN(kulu) ||
        isNaN(hind)
    ) {
        return;
    }


    // Kui auto kulutab näiteks
    // 6.5 l / 100 km
    //
    // siis 20 km jaoks:
    //
    // 20 * 6.5 / 100 = 1.3 l

    let liitrid =
        kilomeetrid * kulu / 100;


    // Maksumus
    let maksumus =
        liitrid * hind;


    // Kuvame tulemused
    document.getElementById("liitrid").innerText =
        liitrid.toFixed(2) + " l";


    document.getElementById("maksumus").innerText =
        maksumus.toFixed(2) + " €";

}


// ------------------------------------------
// KÜTUSEKULU MUUTUMISE JÄLGIMINE
// ------------------------------------------

document.getElementById("kulu")
    .addEventListener("input", function () {

        if (marsruut !== null) {

            let kilomeetrid =
                marsruut.distance / 1000;

            arvutaKulu(kilomeetrid);

        }

    });


document.getElementById("hind")
    .addEventListener("input", function () {

        if (marsruut !== null) {

            let kilomeetrid =
                marsruut.distance / 1000;

            arvutaKulu(kilomeetrid);

        }

    });


// ------------------------------------------
// UUE TEEKONNA ALUSTAMINE
// ------------------------------------------

document.getElementById("uusTeekond")
    .addEventListener("click", function () {

        // Eemaldame markerid
        if (marker1 !== null) {
            kaart.removeLayer(marker1);
        }

        if (marker2 !== null) {
            kaart.removeLayer(marker2);
        }


        // Lähtestame muutujad
        alguspunkt = null;
        loppunkt = null;
        marker1 = null;
        marker2 = null;
        marsruut = null;


        // Puhastame kaardi marsruudist
        kaart.eachLayer(function(layer) {

            if (
                layer instanceof L.GeoJSON
            ) {
                kaart.removeLayer(layer);
            }

        });


        // Lähtestame tulemused
        document.getElementById("distants").innerText =
            "0 km";

        document.getElementById("liitrid").innerText =
            "0 l";

        document.getElementById("maksumus").innerText =
            "0 €";


        document.getElementById("juhis").innerText =
            "📍 Klõpsa kaardil, et valida alguspunkt.";

    });


// ------------------------------------------
// KÄIVITAME KAARDI
// ------------------------------------------

algus();

```javascript
function saadaGoogleSheetsi() {

    if (
        alguspunkt === null ||
        loppunkt === null ||
        marsruut === null
    ) {
        return;
    }


    let kulu =
        parseFloat(
            document.getElementById("kulu").value
        );


    let hind =
        parseFloat(
            document.getElementById("hind").value
        );


    let distants =
        marsruut.distance / 1000;


    let liitrid =
        distants * kulu / 100;


    let maksumus =
        liitrid * hind;


    let andmed = {

        algusLat: alguspunkt.lat,
        algusLng: alguspunkt.lng,

        loppLat: loppunkt.lat,
        loppLng: loppunkt.lng,

        distants: distants.toFixed(2),

        kulu: kulu,

        hind: hind,

        liitrid: liitrid.toFixed(2),

        maksumus: maksumus.toFixed(2)

    };


    fetch(
        "https://script.google.com/macros/s/AKfycbxRecfFUMK7MA0Nu3ApyJPufDYFGT6kkKMqt1Skrt2BU_4WslcL13IKvtlYhhuysBMa/exec",
        {

            method: "POST",

            body: JSON.stringify(andmed),

            headers: {
                "Content-Type": "text/plain"
            }

        }
    )

    .then(vastus => vastus.json())

    .then(andmed => {

        console.log(
            "Andmed salvestatud:",
            andmed
        );

    })

    .catch(viga => {

        console.error(
            "Google Sheetsi saatmisel tekkis viga:",
            viga
        );

    });

}
