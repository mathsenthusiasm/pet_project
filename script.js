const btn = document.getElementById("findBtn");
const statusText = document.getElementById("status");
const results = document.getElementById("results");

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

btn.addEventListener("click", () => {
  if (navigator.geolocation) {
    statusText.innerText = "Getting your location...";
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    statusText.innerText = "Geolocation not supported";
  }
});

function success(position) {

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  map.setView([lat, lon], 14);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  statusText.innerText =
    `Location Found: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

  findNearby(lat, lon);
}

function error() {
  statusText.innerText = "Location permission denied";
}

async function findNearby(lat, lon) {

  results.innerHTML = "<h3>Searching nearby clinics...</h3>";

  const query = `
  [out:json];
  (
    node["amenity"="veterinary"](around:5000,${lat},${lon});
  );
  out;
  `;

  try {

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method:"POST",
        body:query,
      }
    );

    const data = await response.json();

    results.innerHTML = "";

    if(data.elements.length === 0){
      results.innerHTML = "<h3>No nearby clinics found</h3>";
      return;
    }

    data.elements.forEach((place) => {

      const name = place.tags.name || "Pet Clinic";

      L.marker([place.lat, place.lon])
        .addTo(map)
        .bindPopup(name);

      results.innerHTML += `
        <div class="clinic">
          <h3>${name}</h3>

          <p>Veterinary Medical Center</p>

          <a href="https://www.google.com/maps?q=${place.lat},${place.lon}" target="_blank">
            Open in Maps
          </a>
        </div>
      `;
    });

  } catch(err) {
    results.innerHTML = "<h3>Error loading clinics</h3>";
  }
}