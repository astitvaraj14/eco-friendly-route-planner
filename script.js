// ===============================
// Initialize the map
// ===============================
var map = L.map('map').setView([19.0760, 72.8777], 10); // Centered on Mumbai

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// ===============================
// Custom Icons
// ===============================
var startIcon = L.icon({
    iconUrl: 'path/to/start-icon.png', // Replace with actual path
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

var endIcon = L.icon({
    iconUrl: 'path/to/end-icon.png', // Replace with actual path
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// ===============================
// Routing Control
// ===============================
var routingControl;

document.getElementById('routeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const start = document.getElementById('startDestination').value;
    const end = document.getElementById('endDestination').value;

    if (routingControl) {
        map.removeControl(routingControl);
    }

    Promise.all([getCoordinates(start), getCoordinates(end)]).then(([startCoords, endCoords]) => {
        if (startCoords && endCoords) {
            const startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon }).addTo(map);
            const endMarker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon }).addTo(map);

            startMarker.bindPopup('Start: ' + start).openPopup();
            endMarker.bindPopup('End: ' + end).openPopup();

            // Routing control with multiple routes
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startCoords.lat, startCoords.lng),
                    L.latLng(endCoords.lat, endCoords.lng),
                ],
                routeWhileDragging: true,
                showAlternatives: true,
                createMarker: function () { return null; },
                lineOptions: {
                    styles: [
                        { color: 'blue', opacity: 0.9, weight: 5 } // ✅ Main route is blue
                    ]
                },
                altLineOptions: {
                    styles: [
                        { color: 'green', opacity: 0.6, weight: 4, dashArray: '5,10' },
                        { color: 'orange', opacity: 0.6, weight: 4, dashArray: '5,10' }
                    ]
                }
            }).addTo(map);

            // Event listener when routes are found
            routingControl.on('routesfound', function (e) {
                var distance = e.routes[0].summary.totalDistance / 1000;
                var totalCost = calculateTotalCost(distance);

                document.getElementById('distance').innerText = distance.toFixed(2) + ' km';
                document.getElementById('totalCost').innerText = '₹' + totalCost.toFixed(2);

                console.log("Number of routes:", e.routes.length);
                e.routes.forEach((route, index) => {
                    console.log(`Route ${index + 1}: ${(route.summary.totalDistance / 1000).toFixed(2)} km`);
                });
            });
        } else {
            alert('Unable to find one or both locations.');
        }
    });
});

// ===============================
// Geocoding with Nominatim
// ===============================
function getCoordinates(address) {
    return new Promise((resolve) => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    resolve({ lat: data[0].lat, lng: data[0].lon });
                } else {
                    resolve(null);
                }
            });
    });
}

// ===============================
// Cost Calculation
// ===============================
function calculateTotalCost(distance) {
    const costPerKm = 10;
    return distance * costPerKm;
}

// ===============================
// Weather Popup
// ===============================
const apiKey = '00f9200b705b883cbcc8420f8d8ab749';
const city = 'Mumbai';

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        const windSpeedKph = (data.wind.speed * 3.6).toFixed(1);

        document.getElementById('temp').innerHTML = `${Math.round(data.main.temp)}&deg;`;
        document.getElementById('feelsLike').innerHTML = `Feels Like: ${Math.round(data.main.feels_like)}&deg;`;
        document.getElementById('description').innerText = data.weather[0].description;
        document.getElementById('humidity').innerHTML = data.main.humidity;
        document.getElementById('wind').innerText = windSpeedKph;

        document.getElementById('cityHeader').innerText = `Weather in ${city}`;
        document.getElementById('weatherPopup').style.display = 'block';

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchWeather();
    setInterval(fetchWeather, 600000);
});

// ===============================
// Sidebar Toggle Logic
// ===============================
document.querySelector('.open-btn').addEventListener('click', function () {
    document.getElementById('side_nav').classList.toggle('active');
});

document.querySelector('.close-btn').addEventListener('click', function () {
    document.getElementById('side_nav').classList.remove('active');
});

// ===============================
// Legend for Routes
// ===============================
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML = `
        <h4>Route Legend</h4>
        <div><span style="background:blue; width:20px; height:4px; display:inline-block; margin-right:5px;"></span>Main Route</div>
        <div><span style="background:green; width:20px; height:4px; display:inline-block; margin-right:5px;"></span>Alternative Route 1</div>
        <div><span style="background:orange; width:20px; height:4px; display:inline-block; margin-right:5px;"></span>Alternative Route 2</div>
    `;
    return div;
};

legend.addTo(map);
