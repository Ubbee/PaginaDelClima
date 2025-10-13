// API NAME: Open-Meteo
// LINK: https://open-meteo.com/

const contenedorUno = document.getElementById("climaActual");
const contenedorDos = document.getElementById("climaLocalSemanal");
const contenedorTres = document.getElementById("climaLocalHoy");

const toggle = document.getElementById("container-dark");
const body = document.querySelector("body");

toggle.addEventListener("click", ()=>{
    toggle.classList.toggle("active")
    body.classList.toggle("active")
})

const weatherMap = {
    0: "wi-day-sunny", 1: "wi-day-sunny-overcast", 2: "wi-day-cloudy", 3: "wi-cloudy",
    45: "wi-fog", 48: "wi-fog",
    51: "wi-sprinkle", 52: "wi-sprinkle", 53: "wi-sprinkle",
    54: "wi-sprinkle", 55: "wi-sprinkle", 56: "wi-sprinkle", 57: "wi-sprinkle",
    61: "wi-rain", 62: "wi-rain", 63: "wi-rain", 65: "wi-rain",
    66: "wi-rain-mix", 67: "wi-rain-mix",
    71: "wi-snow", 72: "wi-snow", 73: "wi-snow", 75: "wi-snow",
    77: "wi-snowflake-cold",
    80: "wi-showers", 81: "wi-showers", 82: "wi-showers",
    85: "wi-snow-wind", 86: "wi-snow-wind",
    95: "wi-thunderstorm", 96: "wi-storm-showers", 99: "wi-storm-showers"
};
const direccionesViento = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const diasDeSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

// -------------------- Helper --------------------
function crearTitulo(selectorClase, html) {
    const div = document.createElement("div");
    div.classList.add(selectorClase);
    div.innerHTML = html;
    return div;
}

// -------------------- Fetch helpers --------------------
function fetchReverse(lat, lon) {
    return fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`)
        .then(r => r.json());
}

function fetchHoy(lat, lon) {
    return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&current_weather=true&longitude=${lon}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,visibility,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto`)
        .then(r => r.json());
}

function fetchActualYGrafico(lat, lon) {
    return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,visibility,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure,pressure_msl,dew_point_2m,wind_gusts_10m&timezone=auto`)
        .then(r => r.json());
}

function fetchSemanal(lat, lon) {
    return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`)
        .then(r => r.json());
}

// -------------------- Render: por horas --------------------
function renderHoy(provinciaElement, hourly) {
    const fragment = document.createDocumentFragment();
    const lista = document.createElement("div");
    lista.classList.add("climas");
    provinciaElement.appendChild(lista);

    const ahora = new Date(); ahora.setMinutes(0, 0, 0);
    const fin = new Date(ahora); fin.setHours(ahora.getHours() + 12);

    hourly.time.forEach((_, i) => {

        const horaApi = new Date(hourly.time[i]);

        if (horaApi >= ahora && horaApi < fin) {
            let dia = horaApi.getDay()-1
            if (horaApi.getDay() === 0) {
                dia = 6
            }
            const icono = weatherMap[hourly.weather_code[i]] || "wi-na";
            const item = document.createElement("div");
            item.classList.add("tempImg");
            item.innerHTML = `
                <div class="tituloItem">
                    <i class="wi ${icono}"></i>
                    <h2>${hourly.temperature_2m[i]}<span> °C</span></h2>
                </div>
                <h3>${diasDeSemana[dia]}</h3>
                <p class="hora"><strong>${horaApi.getHours()}:00hs</strong></p>
                <p><span>Nubes:</span> ${hourly.cloud_cover[i]}%</p>
                <p><span>Precipitacion:</span> ${hourly.precipitation_probability[i]}%</p>
                <p><i class="wi wi-strong-wind"></i> ${hourly.wind_speed_10m[i]}km/h - ${hourly.wind_direction_10m[i]}°</p>
            `;
            fragment.appendChild(item);


        }

    });
    lista.appendChild(fragment);
}

// -------------------- Chart helpers --------------------
let climaChartRef = null;
function indiceHoraMasCercana(hourly) {
    const now = Date.now();
    const timesMs = hourly.time.map(t => new Date(t).getTime());
    return timesMs.reduce((best, t, i) =>
        Math.abs(t - now) < Math.abs(timesMs[best] - now) ? i : best, 0
    );
}
function renderClimaChart(hourly, startIndex = 0, cantidad = 12) {
    const times = hourly.time.slice(startIndex, startIndex + cantidad);
    const temps = hourly.temperature_2m.slice(startIndex, startIndex + cantidad);
    const popsSource = hourly.precipitation_probability ?? Array(hourly.time.length).fill(0);
    const pops = popsSource.slice(startIndex, startIndex + cantidad);

    const labels = times.map(t => {
        const d = new Date(t);
        return `${String(d.getHours()).padStart(2, "0")}:00`;
    });

    const ctx = document.getElementById('climaChart').getContext('2d');
    if (climaChartRef) climaChartRef.destroy();

    climaChartRef = new Chart(ctx, {
        data: {
            labels,
            datasets: [
                {
                    type: 'bar', label: 'Prob. lluvia (%)', data: pops, yAxisID: 'y2',
                    backgroundColor: 'rgba(104, 193, 253, 0.55)', borderRadius: 4, barThickness: 'flex'
                },
                {
                    type: 'line', label: 'Temperatura (°C)', data: temps, yAxisID: 'y1',
                    borderWidth: 2, tension: 0.35, pointRadius: 3, pointHoverRadius: 5,
                    borderColor: 'rgba(252,39,39,1)', backgroundColor: 'rgba(255,99,132,0.2)', fill: false
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: {
                tooltip: { callbacks: { label: (ctx) => ctx.dataset.yAxisID === 'y1' ? `Temp: ${ctx.parsed.y} °C` : `Prob. lluvia: ${ctx.parsed.y}%` } },
                legend: { labels: { usePointStyle: true, color: '#fff' } }
            },
            scales: {
                x: { grid: { color: '#ffffff33' }, ticks: { color: '#fff', maxRotation: 0, autoSkip: true } },
                y1: {
                    type: 'linear', position: 'left', title: { display: true, text: '°C', color: '#fff' },
                    ticks: { color: '#fff' }, grid: { color: '#ffffff33' }
                },
                y2: {
                    type: 'linear', position: 'right', title: { display: true, text: '%', color: '#fff' },
                    ticks: { color: '#fff' }, suggestedMin: 0, suggestedMax: 100, grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

// -------------------- Render: Actual + grafico --------------------
function renderActual(contenedorTitulo, data) {
    const climas = data.current;
    const hourly = data.hourly;
    const fragment = document.createDocumentFragment();

    const date = new Date();
    const horaApi = new Date(climas.time);
    const indice = Math.round(climas.wind_direction_10m / 22.5) % 16;

    if (horaApi.toDateString() === date.toDateString() && horaApi.getHours() === date.getHours()) {
        const icono = weatherMap[climas.weather_code] || "wi-na";
        const box = document.createElement("div");
        box.classList.add("tempImg");
        box.innerHTML = `
      <div class="climaActualContenedor">
        <div class="infoActual">
          <div class="iconoT">
            <i class="wi ${icono}"></i>
            <h2>${climas.temperature_2m}<span>°C</span></h2>
          </div>
          <div class="infoParticular">
            <h3>${diasDeSemana[horaApi.getDay()]} ${horaApi.getHours()}:00hs</h3>
            <p><span>Nubes:</span> ${climas.cloud_cover}%</p>
            <p><span>Humedad:</span> ${climas.relative_humidity_2m}%</p>
            <p><span>Viento:</span> ${climas.wind_speed_10m}Km/h - (${direccionesViento[indice]})</p>
          </div>
        </div>
        <div class="climaChartContenedor">
          <canvas id="climaChart"></canvas>
        </div>
      </div>
    `;
        fragment.appendChild(box);
        contenedorTitulo.appendChild(fragment);

        const idx = indiceHoraMasCercana(hourly);
        renderClimaChart(hourly, idx, 12);
    }
}

// -------------------- Render: Semanal --------------------
function renderSemanal(contenedor, daily) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("contenedorPrincipalSemanal");

    const frag = document.createDocumentFragment();
    daily.time.forEach((_, i) => {
        const fecha = new Date(daily.time[i]);
        const icono = weatherMap[daily.weather_code[i]] || "wi-na";

        const card = document.createElement("div");
        card.classList.add("contenedorClimaSemanal");
        card.innerHTML = `
      <div class="contenedorClimaIndividual">
        <div class="tituloClimaIndiv">
          <i class="wi ${icono}"></i>
          <h2>${diasDeSemana[fecha.getDay()]}</h2>
        </div>
        <p>${daily.temperature_2m_min[i]}<span>°C</span> / <strong></strong>${daily.temperature_2m_max[i]}<span>°C</span></p>
      </div>
    `;
        frag.appendChild(card);
    });

    wrapper.appendChild(frag);
    contenedor.appendChild(wrapper);
}

// -------------------- titulos segun locacion --------------------
function renderTodo(lat, lon) {
    // por horas en contenedorTres
    fetchReverse(lat, lon).then(data => {
        const tituloProv = crearTitulo("prov", `<h1>${data.principalSubdivision}</h1>`);
        contenedorTres.appendChild(tituloProv);
        return fetchHoy(lat, lon).then(hoy => renderHoy(tituloProv, hoy.hourly));
    });

    // ACTUAL en contenedorUno
    fetchReverse(lat, lon).then(data => {
        const titulo = crearTitulo("titulo", `<h1 class="tp">${data.locality}, ${data.principalSubdivision}</h1>`);
        contenedorUno.appendChild(titulo);
        return fetchActualYGrafico(lat, lon).then(payload => renderActual(titulo, payload));
    });

    // SEMANAL en contenedorDos
    fetchReverse(lat, lon).then(() => {
        const tituloSem = crearTitulo("tituloSemanal", `<h2>Semana</h2>`);
        contenedorDos.appendChild(tituloSem);
        return fetchSemanal(lat, lon).then(payload => renderSemanal(contenedorDos, payload.daily));
    });
}

// -------------------- Init --------------------
document.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition(
        pos => renderTodo(pos.coords.latitude, pos.coords.longitude),
        () => renderTodo(-32.8908, -68.8272) // Mendoza por defecto
    );
});
