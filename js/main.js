//API NAME: Open-Meteo
//LINK: https://open-meteo.com/

const contenedorUno = document.getElementById("climaLocalHoy")
const contenedorDos = document.getElementById("climaLocalSemanal")
const weatherMap = {
    0: "wi-day-sunny",
    1: "wi-day-sunny-overcast",
    2: "wi-day-cloudy",
    3: "wi-cloudy",
    45: "wi-fog", 48: "wi-fog",
    51: "wi-sprinkle", 52: "wi-sprinkle", 53: "wi-sprinkle",
    54: "wi-sprinkle", 55: "wi-sprinkle", 56: "wi-sprinkle", 57: "wi-sprinkle",
    61: "wi-rain", 62: "wi-rain", 63: "wi-rain",
    65: "wi-rain",
    66: "wi-rain-mix", 67: "wi-rain-mix",
    71: "wi-snow", 72: "wi-snow", 73: "wi-snow",
    75: "wi-snow",
    77: "wi-snowflake-cold",
    80: "wi-showers", 81: "wi-showers", 82: "wi-showers",
    85: "wi-snow-wind", 86: "wi-snow-wind",
    95: "wi-thunderstorm",
    96: "wi-storm-showers", 99: "wi-storm-showers"
};

document.addEventListener("DOMContentLoaded", function () {
    //Aca se usa Geolocalizacion para mostrar el clima en la ubicacion encontrada
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let latitud = position.coords.latitude
            let longitud = position.coords.longitude


            //

            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`prov`)
                    provinciaElement.innerHTML = `<h1>${data.principalSubdivision}</h1>`
                    contenedorUno.appendChild(provinciaElement)




                    //----------------------------SECCION DE CLIMA DE HOY DIA-------------------------------------
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,weather_code,cloud_cover,visibility,precipitation_probability,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation&timezone=auto`)
                        .then(respuesta => respuesta.json())
                        .then(data => {

                            const climas = data.hourly
                            const fragment = document.createDocumentFragment()

                            //CONTENEDOR DE LOS CONTENEDORES DE HORARIOS DEL CLIMA DE HOY
                            const climaContenedor = document.createElement("div")
                            climaContenedor.classList.add(`climas`)
                            provinciaElement.appendChild(climaContenedor)

                            climas.time.forEach((hora, i) => {

                                const horaApi = new Date(climas.time[i])
                                const date = new Date()

                                //solo me esta mostrando la temperatura del dia de la fecha
                                if (horaApi.getHours() >= date.getHours() && horaApi.getDate() === date.getDate() && horaApi.getMonth() === date.getMonth() && date.getFullYear === horaApi.getFullYear) {

                                    //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                                    const climaElement = document.createElement("div")
                                    climaElement.classList.add("tempImg")

                                    let icono = weatherMap[climas.weather_code[i]] || "wi-na"

                                    climaElement.innerHTML = `
                                    <div>
                                    <i class="wi ${icono}"></i>
                                    <h2><strong></strong> ${climas.temperature_2m[i]}<span> °C</span></h2>
                                    </div>
                                    <p class="hora"><strong> ${horaApi.getHours()}:00hs </strong></p>
                                    <p><strong> Nubes:</strong> ${climas.cloud_cover[i]}%</p>
                                    <p><strong> Precipitacion:</strong> ${climas.precipitation_probability[i]}%</p>
                                    `

                                    //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                                    fragment.appendChild(climaElement)

                                }
                            })
                            climaContenedor.appendChild(fragment)

                        });
                });
            //-------------------------------------------------------------------



            //------------------SECCION DE CLIMA SEMANAL----------------------
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`tituloSemanal`)
                    provinciaElement.innerHTML = `<h2>Semana</h2>`
                    contenedorDos.appendChild(provinciaElement)

                    //https://api.open-meteo.com/v1/forecast?latitude=-32.97348864051367&longitude=-68.85284653320433&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`)
                        .then(respuesta => respuesta.json())
                        .then(data => {
                            const climas = data.daily
                            const fragment = document.createDocumentFragment()
                            contenedorDos
                            const diasDeSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

                            climas.time.forEach((hora, i) => {
                                const fecha = new Date(climas.time[i])
                                //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                                const climaElementSemanal = document.createElement("div")
                                climaElementSemanal.classList.add("contenedorClimaSemanal")

                                let icono = weatherMap[climas.weather_code[i]] || "wi-na"
                                console.log(fecha.getDay());

                                climaElementSemanal.innerHTML = `
                                    <div class="contenedorClimaIndividual">
                                        <div class="tituloClimaIndiv">
                                        <i class="wi ${icono}"></i>
                                        <h2>${diasDeSemana[fecha.getDay()]}</h2>
                                        </div>
                                    <p><strong></strong> ${climas.temperature_2m_min[i]}<span>°C</span>  -  <strong></strong> ${climas.temperature_2m_max[i]}<span>°C</span></p>
                                    </div>
                                    `

                                //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                                fragment.appendChild(climaElementSemanal)


                            })
                            contenedorDos.appendChild(fragment)
                        })
                })
            //--------------------------------------------------------------------------------



        },
        function onGeoError(error) {
            console.warn("No pudimos obtener tu ubicación. Usaremos Mendoza por defecto.");

            const lat = -32.8908;
            const lon = -68.8272;

            // Titulo
            const provinciaElement = document.createElement("div");
            provinciaElement.classList.add("prov");
            provinciaElement.innerHTML = `<h1>Mendoza</h1>`;
            contenedorUno.appendChild(provinciaElement);

            // Aca mostramos el clima del dia en sus direnetes horarios
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,cloud_cover,precipitation_probability&timezone=auto`)
                .then(res => res.json())
                .then(data => {
                    const hourly = data.hourly;
                    const now = new Date();

                    const climaContenedor = document.createElement("div");
                    climaContenedor.classList.add("climas");
                    provinciaElement.appendChild(climaContenedor);

                    hourly.time.forEach((hora, i) => {
                        const horaApi = new Date(hora);

                        // Filtrar: solo horas de hoy y desde ahora
                        if (horaApi.getDate() === now.getDate() && horaApi.getHours() >= now.getHours()) {

                            const climaElement = document.createElement("div");
                            climaElement.classList.add("tempImg");
                            climaElement.innerHTML = `
                                <h2>${hourly.temperature_2m[i]} °C</h2>
                                <p>${horaApi.getHours()}:00hs</p>
                                <p>Nubes: ${hourly.cloud_cover[i]}%</p>
                                <p>Precipitación: ${hourly.precipitation_probability[i]}%</p>
                                `;
                            climaContenedor.appendChild(climaElement);
                        }
                    });
                });
        }

    )
})
//-------------------------------------------------------------------------
