var current = "ofi";
var loader = null;

function initialSetup() {
    window.onhashchange = parseUrl;
}

function setHash(hash) {
    if(history.pushState) {
        history.pushState(null, null, hash);
    }
    else {
        location.hash = hash;
    }
}

function parseUrl() {
    // First stop loading the current data
    if (loader !== null) loader.abort()

    document.querySelector("a[href='#" + current + "']").classList.remove("active");
    if (window.location.hash !== "") {
        current = window.location.hash.substr(1)
    }
    var currentObject = document.querySelector("a[href='#" + current + "']");
    document.querySelector("#logo img").src = "/img/logos/" + current + ".png";
    currentObject.classList.add("active");

    var friendPasteHash = currentObject.getAttribute("data-hash");
    loadData(friendPasteHash);
}

var graphic_params = {
    animate_on_load: true,
    target: '#chart',
    full_width: true,
    //x_axis: true,
    //x_extended_ticks: true,
    //area: false,
    interpolate: d3.curveBasis,
    right: 0,
    top: 15,
    left: 35,
    bottom: 50,
}


initialSetup();
parseUrl();

function loadData(hash) {

    document.querySelector("#hour").innerText = "00:00";
    document.querySelector("#count").innerText = "00";
    document.querySelector("#since").innerText = "...";

    graphic_params.chart_type = 'missing-data';
    graphic_params.missing_text = 'Descargando grafico...';
    MG.data_graphic(graphic_params);

    loader = d3.json("https://friendpaste.com/" + hash + "/raw?" + Date.now(), function (data) {

        if (data === null) {
            graphic_params.missing_text = 'No hay informacion disponible';
            MG.data_graphic(graphic_params);
            return;
        } else {
            graphic_params.missing_text = 'Procesando grafico...';
            MG.data_graphic(graphic_params);
        }

        var max_count = 0;
        var max_date = "";
        var last_date = null;
        data.forEach(function (d) {
            d.date = new Date(d.date * 1000);
            last_date = d.date;
        });
        data.forEach(function (d) {
            if (d.value > max_count) {
                max_count = d.value;
                max_date = new Date(d.date);
            }
        });

        graphic_params.chart_type = "line";
        graphic_params.data = data;
        graphic_params.markers = [
            {'date': max_date, 'label': 'Record del dia'},
        ];

        MG.data_graphic(graphic_params);
        document.querySelector("#hour").innerText = ('0' + max_date.getHours()).slice(-2) + ":" + ('0' + max_date.getMinutes()).slice(-2);
        document.querySelector("#count").innerText = max_count;
        document.querySelector("#since").innerText = timeSince(last_date);

    });
}


function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " dias";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " horas";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutos";
    }
    return Math.floor(seconds) + " segundos";
}