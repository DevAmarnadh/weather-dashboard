let map;

// Initialize Leaflet map on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Leaflet map with center and zoom level
    map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Event listener for clicking on the map to get coordinates
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);
        console.log(`Selected location: Latitude ${lat}, Longitude ${lng}`);

        // Fetch weather data for the selected coordinates
        fetchWeatherDataByCoordinates(lat, lng);
    });

    // Event listener for manual search button click
    document.getElementById('searchBtn').addEventListener('click', () => {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            console.log(`Searching weather data for: ${city}`);
            getWeatherData(city);
            getForecastData(city);
        }
    });
});

async function getWeatherData(city) {
    const apiKey = 'e583edc1310e4852b9142804242706'; // Replace with your actual API key
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    document.getElementById('loading').style.display = 'block';
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.style.display = 'none';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        displayError(error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function getForecastData(city) {
    const apiKey = 'e583edc1310e4852b9142804242706'; // Replace with your actual API key
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5`;
    document.getElementById('loading').style.display = 'block';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }
        const data = await response.json();
        displayForecastData(data.forecast.forecastday);

        // Open result.html with forecast data
        const forecastHTML = generateForecastHTML(data.forecast.forecastday);
        openResultPage(forecastHTML, city);
    } catch (error) {
        displayError(error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function generateForecastHTML(forecastDays) {
    let forecastHTML = '';

    forecastDays.forEach(day => {
        const date = new Date(day.date).toLocaleDateString();
        forecastHTML += `
            <div class="forecast-day">
                <h3>${date}</h3>
                <p>Avg Temp: ${day.day.avgtemp_c} °C</p>
                <p>Max Temp: ${day.day.maxtemp_c} °C</p>
                <p>Min Temp: ${day.day.mintemp_c} °C</p>
                <p>Weather: ${day.day.condition.text}</p>
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                <p>Sunrise: ${day.astro.sunrise}</p>
                <p>Sunset: ${day.astro.sunset}</p>
            </div>
        `;
    });

    return forecastHTML;
}

function openResultPage(forecastHTML, city) {
    // Create a new window and set its content when loaded
    const newWindow = window.open('result.html', '_blank');
    newWindow.onload = function() {
        // Access elements in the new window after it's fully loaded
        const forecastContainer = newWindow.document.getElementById('forecastContainer');
        if (forecastContainer) {
            forecastContainer.innerHTML = forecastHTML;
        } else {
            console.error('Element with ID "forecastContainer" not found in result.html');
        }

        const locationInfo = newWindow.document.getElementById('locationInfo');
        if (locationInfo) {
            locationInfo.textContent = `Weather forecast for ${city}`;
        } else {
            console.error('Element with ID "locationInfo" not found in result.html');
        }
    };
}

function displayWeatherData(data) {
    const weatherInfo = document.getElementById('weatherInfo');

    weatherInfo.style.display = 'block';
    weatherInfo.innerHTML = `
        <h2>${data.location.name}</h2>
        <p>Temperature: ${data.current.temp_c} °C</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>Wind Speed: ${data.current.wind_kph} kph</p>
        <p>Weather: ${data.current.condition.text}</p>
    `;
}

function displayForecastData(forecastDays) {
    // Display forecast on the current page if needed
    const forecastContainer = document.getElementById('forecastContainer');
    if (forecastContainer) {
        forecastContainer.innerHTML = generateForecastHTML(forecastDays);
    } else {
        console.error('Element with ID "forecastContainer" not found in current page');
    }
}

function displayError(message) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.style.display = 'block';
    weatherInfo.innerHTML = `<p class="error">${message}</p>`;
}

async function fetchWeatherDataByCoordinates(lat, lng) {
    const apiKey = 'e583edc1310e4852b9142804242706'; // Replace with your actual API key
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}`;
    document.getElementById('loading').style.display = 'block';
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.style.display = 'none';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        displayError(error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
