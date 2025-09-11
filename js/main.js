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
            
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`prov`)
                    provinciaElement.innerHTML = `<h1>${data.principalSubdivision}</h1>`
                    contenedorUno.appendChild(provinciaElement)
                    
                });

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,weather_code,cloud_cover,visibility,precipitation_probability,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation`)
                .then(respuesta => respuesta.json())
                .then(data => {
                    const climas = data.hourly

                    //CONTENEDOR DE LOS CONTENEDORES DE HORARIOS DEL CLIMA DE HOY
                    const climaContenedor = document.createElement("div")
                    climaContenedor.classList.add(`climaContenedor`)
                    contenedorUno.appendChild(climaContenedor)

                    climas.time.forEach((hora, i) => {

                        const horaApi = new Date(climas.time[i])

                        if (horaApi.getHours() >= date.getHours() && horaApi.getDay() === date.getDay()) {//solo me esta mostrando la temperatura del dia se se ejecuta el comando

                            //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                            const climaElement = document.createElement("div")
                            climaElement.classList.add("tempImg")

                            climaElement.innerHTML = `
                            <div>
                            <i class="wi wi-wmo4680-${climas.weather_code[i]}"></i>
                            <h2><strong></strong> ${climas.temperature_2m[i]}<span> °C</span></h2>
                            </div>
                            <p><strong> ${horaApi.getHours()}:00hs </strong></p>
                            <p><strong> Nubes:</strong> ${climas.cloud_cover[i]}%</p>
                            <p><strong> Precipitacion:</strong> ${climas.precipitation_probability[i]}%</p>
                            `

                            //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                            climaContenedor.appendChild(climaElement)

                        }
                    })

                });
        },
        function () {
            let URL = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,visibility,cloud_cover,precipitation_probability,wind_speed_10m,apparent_temperature,relative_humidity_2m&timezone=auto`
        }
    )
})
//-------------------------------------------------------------------------
