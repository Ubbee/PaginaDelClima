//API NAME: Open-Meteo
//LINK: https://open-meteo.com/

const contenedorUno = document.getElementById("climaContenedor")
contenedorUno.classList.add(`contenedorPrincipal`)

const date = new Date()
let contador = 0

document.addEventListener("DOMContentLoaded", function () {
    //Aca se usa Geolocalizacion para mostrar el clima en la ubicacion encontrada
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let latitud = position.coords.latitude
            let longitud = position.coords.longitude
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

            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`prov`)
                    provinciaElement.innerHTML = `<h1>${data.principalSubdivision}</h1>`
                    contenedorUno.appendChild(provinciaElement)

                });

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,weather_code,cloud_cover,visibility,precipitation_probability,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation&timezone=auto`)
                .then(respuesta => respuesta.json())
                .then(data => {
                    const climas = data.hourly
                    let provinciaElement = document.querySelector(".prov")
                    const fragment = document.createDocumentFragment()

                    //CONTENEDOR DE LOS CONTENEDORES DE HORARIOS DEL CLIMA DE HOY
                    const climaContenedor = document.createElement("div")
                    climaContenedor.classList.add(`climas`)
                    provinciaElement.appendChild(climaContenedor)

                    climas.time.forEach((hora, i) => {

                        const horaApi = new Date(climas.time[i])

                        if (horaApi.getHours() >= date.getHours() && horaApi.getDay() === date.getDay()) {//solo me esta mostrando la temperatura del dia se se ejecuta el comando

                            //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                            const climaElement = document.createElement("div")
                            climaElement.classList.add("tempImg")




                            let icono = weatherMap[climas.weather_code[i]] || "wi-na"

                            climaElement.innerHTML = `
                            <div>
                            <i class="wi ${icono}"></i>
                            <h2><strong></strong> ${climas.temperature_2m[i]}<span> °C</span></h2>
                            </div>
                            <p><strong> ${horaApi.getHours()}:00hs </strong></p>
                            <p><strong> Nubes:</strong> ${climas.cloud_cover[i]}%</p>
                            <p><strong> Precipitacion:</strong> ${climas.precipitation_probability[i]}%</p>
                            `

                            //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                            fragment.appendChild(climaElement)

                        }
                    })
                    climaContenedor.appendChild(fragment)

                });
        },
        function () {
            let URL = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,visibility,cloud_cover,precipitation_probability,wind_speed_10m,apparent_temperature,relative_humidity_2m&timezone=auto`
        }
    )
})
//-------------------------------------------------------------------------
