//API NAME: Open-Meteo
//LINK: https://open-meteo.com/

const contenedorUno = document.getElementById("climaActual")
const contenedorDos = document.getElementById("climaLocalSemanal")
const contenedorTres = document.getElementById("climaLocalHoy")
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
const direccionesViento = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO",
    "O", "ONO", "NO", "NNO"
];
const diasDeSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]



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
                    contenedorTres.appendChild(provinciaElement)




                    //----------------------------SECCION DE CLIMA DE HOY DIA-------------------------------------
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&current_weather=true&longitude=${longitud}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,visibility,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto`)
                        .then(respuesta => respuesta.json())
                        .then(data => {

                            const climas = data.hourly
                            const fragment = document.createDocumentFragment()

                            //CONTENEDOR DE LOS CONTENEDORES DE HORARIOS DEL CLIMA DE HOY
                            const climaContenedor = document.createElement("div")
                            climaContenedor.classList.add(`climas`)
                            provinciaElement.appendChild(climaContenedor)

                            const ahora = new Date()
                            ahora.setMinutes(0, 0, 0)

                            const fin = new Date(ahora)
                            fin.setHours(ahora.getHours() + 12)

                            climas.time.forEach((hora, i) => {
                                const horaApi = new Date(climas.time[i])

                                //solo me esta mostrando la temperatura del dia de la fecha
                                if (horaApi >= ahora && horaApi < fin) {

                                    //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                                    const climaElement = document.createElement("div")
                                    climaElement.classList.add("tempImg")

                                    let icono = weatherMap[climas.weather_code[i]] || "wi-na"

                                    climaElement.innerHTML = `
                                    <div>
                                    <i class="wi ${icono}"></i>
                                    <h2> ${climas.temperature_2m[i]}<span> °C</span></h2>
                                    </div>
                                    <h3>${diasDeSemana[horaApi.getDay()]}</h3>
                                    <p class="hora"><strong> ${horaApi.getHours()}:00hs </strong></p>
                                    <p> Nubes: ${climas.cloud_cover[i]}%</p>
                                    <p> Precipitacion: ${climas.precipitation_probability[i]}%</p>
                                    `

                                    //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                                    fragment.appendChild(climaElement)

                                }
                            })
                            climaContenedor.appendChild(fragment)

                        });
                });
            //-------------------------------------------------------------------




            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`titulo`)
                    provinciaElement.innerHTML = `<h1 class="tp">${data.locality}, ${data.principalSubdivision}</h1>`
                    contenedorUno.appendChild(provinciaElement)




                    //----------------------------SECCION DE CLIMA ACTUAL-------------------------------------
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,visibility,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure,pressure_msl,dew_point_2m,wind_gusts_10m&timezone=auto`)
                        .then(respuesta => respuesta.json())
                        .then(data => {

                            const climas = data.current
                            const hourly = data.hourly
                            const fragment = document.createDocumentFragment()


                            const date = new Date();

                            const indice = Math.round(climas.wind_direction_10m / 22.5) % 16

                            const horaApi = new Date(climas.time)

                            //solo me esta mostrando la temperatura del dia de la fecha
                            if (horaApi.toDateString() === date.toDateString() && horaApi.getHours() === date.getHours()) {

                                //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                                const climaElement = document.createElement("div")
                                climaElement.classList.add("tempImg")

                                let icono = weatherMap[climas.weather_code] || "wi-na"

                                climaElement.innerHTML = `
                                <div class="climaActualContenedor">
                                    <div class="infoActual">
                                        <div class="iconoT">
                                            <i class="wi ${icono}"></i>
                                            <h2> ${climas.temperature_2m}<span>°C</span></h2>
                                        </div>
                                        <div class="infoParticular">
                                            <h3>${diasDeSemana[horaApi.getDay()]} ${horaApi.getHours()}:00hs</h3>
                                            <p><span>Nubes:</span> ${climas.cloud_cover}%</p>
                                            <p><span>Humedad:</span> ${climas.relative_humidity_2m}%</p>
                                            <p><span>Viento:</span> ${climas.wind_speed_10m}Km/h (${direccionesViento[indice]})</p>
                                        </div>
                                    </div>
                                    <div class="climaChartContenedor">
                                        <canvas id="climaChart"></canvas>
                                    </div>
                                </div>
                                    `

                                //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                                fragment.appendChild(climaElement)




                                /* -----------------GRAFICO----------------------- */

                                // se guarda una referencia global para poder destruir el gráfico si se redibuja
                                let climaChartRef = null;

                                function indiceHoraMasCercana(hourly) {
                                    const now = Date.now();
                                    const timesMs = hourly.time.map(t => new Date(t).getTime());
                                    return timesMs.reduce((best, t, i) =>
                                        Math.abs(t - now) < Math.abs(timesMs[best] - now) ? i : best, 0
                                    );
                                }
                                function renderClimaChart(hourly, startIndex = 0, cantidad = 12) {
                                    // Cortamos 12 horas desde el índice que queremos
                                    const times = hourly.time.slice(startIndex, startIndex + cantidad);
                                    const temps = hourly.temperature_2m.slice(startIndex, startIndex + cantidad);
                                    const popsSource = hourly.precipitation_probability ?? Array(hourly.time.length).fill(0);
                                    const pops = popsSource.slice(startIndex, startIndex + cantidad);

                                    // Etiquetas
                                    const labels = times.map(t => {
                                        const d = new Date(t);
                                        const hh = String(d.getHours()).padStart(2, "0");
                                        return `${hh}:00`;
                                    });

                                    // Config del gráfico
                                    const ctx = document.getElementById('climaChart').getContext('2d');

                                    // Si ya existe un gráfico previo, lo destruimos para evitar fugas
                                    if (climaChartRef) {
                                        climaChartRef.destroy();
                                    }

                                    climaChartRef = new Chart(ctx, {
                                        data: {
                                            labels,
                                            datasets: [
                                                // Barras - probabilidad de precipitación
                                                {
                                                    type: 'bar',
                                                    label: 'Prob. lluvia (%)',
                                                    data: pops,
                                                    yAxisID: 'y2',
                                                    backgroundColor: 'rgba(104, 193, 253, 0.55)',
                                                    borderRadius: 4,
                                                    barThickness: 'flex'
                                                },
                                                // Línea - temperatura
                                                {
                                                    type: 'line',
                                                    label: 'Temperatura (°C)',
                                                    data: temps,
                                                    yAxisID: 'y1',
                                                    borderWidth: 2,
                                                    tension: 0.35,
                                                    pointRadius: 3,
                                                    pointHoverRadius: 5,
                                                    borderColor: 'rgba(252, 39, 39, 1)',
                                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                    fill: false
                                                }
                                            ]
                                        },
                                        options: {
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            interaction: { mode: 'index', intersect: false },
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: (ctx) => {
                                                            const v = ctx.parsed.y;
                                                            return ctx.dataset.yAxisID === 'y1'
                                                                ? `Temp: ${v} °C`
                                                                : `Prob. lluvia: ${v}%`;
                                                        }
                                                    }
                                                },
                                                legend: {
                                                    labels: {
                                                        usePointStyle: true,
                                                        color: '#fff'        
                                                    }
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: { color: '#ffffff33' },    
                                                    ticks: {
                                                        color: '#fff',                 
                                                        maxRotation: 0,
                                                        autoSkip: true
                                                    }
                                                },
                                                y1: {
                                                    type: 'linear',
                                                    position: 'left',
                                                    title: {
                                                        display: true,
                                                        text: '°C',
                                                        color: '#fff'                  
                                                    },
                                                    ticks: { color: '#fff' },        
                                                    grid: { color: '#ffffff33' }    
                                                },
                                                y2: {
                                                    type: 'linear',
                                                    position: 'right',
                                                    title: {
                                                        display: true,
                                                        text: '%',
                                                        color: '#fff'                  
                                                    },
                                                    ticks: { color: '#fff' },        
                                                    suggestedMin: 0,
                                                    suggestedMax: 100,
                                                    grid: { drawOnChartArea: false } 
                                                }
                                            }
                                        }

                                    });
                                }

                                fragment.appendChild(climaElement);
                                provinciaElement.appendChild(fragment);

                                const idx = indiceHoraMasCercana(hourly);
                                renderClimaChart(hourly, idx, 12);

                                /* -------------------------------------------- */



                            }

                            provinciaElement.appendChild(fragment)



                        });
                });



            //------------------SECCION DE CLIMA SEMANAL----------------------
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`)
                .then(respuesta => respuesta.json())
                .then(data => {

                    const provinciaElement = document.createElement("div")
                    provinciaElement.classList.add(`tituloSemanal`)
                    provinciaElement.innerHTML = `<h2>Semana</h2>`
                    contenedorDos.appendChild(provinciaElement)



                    
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`)
                        .then(respuesta => respuesta.json())
                        .then(data => {
                            const climas = data.daily
                            const fragment = document.createDocumentFragment()

                            const climaContenedorSemanal = document.createElement("div")
                            climaContenedorSemanal.classList.add("contenedorPrincipalSemanal")

                            climas.time.forEach((hora, i) => {
                                const fecha = new Date(climas.time[i])
                                //ACA CREAMOS EL DIV QUE CONTIENE LOS DATOS DEL CLIMA
                                const climaElementSemanal = document.createElement("div")
                                climaElementSemanal.classList.add("contenedorClimaSemanal")

                                let icono = weatherMap[climas.weather_code[i]] || "wi-na"


                                climaElementSemanal.innerHTML = `
                                    <div class="contenedorClimaIndividual">
                                        <div class="tituloClimaIndiv">
                                        <i class="wi ${icono}"></i>
                                        <h2>${diasDeSemana[fecha.getDay()]}</h2>
                                        </div>
                                    <p> ${climas.temperature_2m_min[i]}<span>°C</span> / <strong></strong>${climas.temperature_2m_max[i]}<span>°C</span></p>
                                    </div>
                                    `

                                //ACA LO AGREGAMOS AL CONTENEDOR "climaContenedor"
                                fragment.appendChild(climaElementSemanal)


                            })
                            climaContenedorSemanal.appendChild(fragment)
                            contenedorDos.appendChild(climaContenedorSemanal)
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

            // Aca mostramos el clima del dia en sus diferentes horarios
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
