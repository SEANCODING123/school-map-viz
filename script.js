document.addEventListener('DOMContentLoaded', () => {
    // Conradie Park coordinates
    const conradiePark = [-33.9229, 18.5212];

    // Initialize the map
    const map = L.map('map').setView(conradiePark, 12);

    // Add CartoDB Positron tiles (Cleaner, less detailed)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add a marker for Conradie Park (Central Location)
    const centralIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    L.marker(conradiePark, { icon: centralIcon }).addTo(map)
        .bindPopup('<b>Conradie Park</b><br>Central Location')
        .openPopup();

    // Fetch and display school data
    fetch('schools.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(school => {
                let { School_Name, Students, Latitude, Longitude, Distance_KM, Address } = school;

                // Offset logic for schools very close to Conradie Park to prevent overlap
                // 0.002 degrees is roughly 200 meters.
                const latDiff = Math.abs(Latitude - conradiePark[0]);
                const lngDiff = Math.abs(Longitude - conradiePark[1]);

                if (latDiff < 0.002 && lngDiff < 0.002) {
                    // Shift slightly North-East
                    Latitude += 0.002;
                    Longitude += 0.002;
                }

                // Calculate radius based on students
                // Minimum radius of 5, scaling up with square root of students
                const radius = Math.max(6, Math.sqrt(Students) * 3);

                const marker = L.circleMarker([Latitude, Longitude], {
                    radius: radius,
                    fillColor: "#3388ff",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                const popupContent = `
                    <b>${School_Name}</b><br>
                    Students: ${Students}<br>
                    Distance: ${Distance_KM} km<br>
                    Address: ${Address}
                `;

                marker.bindPopup(popupContent);

                // Determine label direction based on position relative to Conradie Park
                // If East -> Right, If West -> Left
                const labelDirection = (Longitude > conradiePark[1]) ? 'right' : 'left';

                // Add permanent label
                marker.bindTooltip(School_Name, {
                    permanent: true,
                    direction: labelDirection,
                    className: 'school-label',
                    offset: [labelDirection === 'right' ? radius + 2 : -(radius + 2), 0]
                });
            });
        })
        .catch(error => console.error('Error loading school data:', error));
});
