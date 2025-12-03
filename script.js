document.addEventListener('DOMContentLoaded', () => {
    // Conradie Park coordinates
    const conradiePark = [-33.9229, 18.5212];

    // Initialize the map
    const map = L.map('map').setView(conradiePark, 12);

    // Add CartoDB Light Nolabels tiles (Ultra-minimal, no roads or labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
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
        .bindPopup('<b>Conradie Park</b>');

    // Fetch and display school data
    fetch('schools.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(school => {
                let { School_Name, Students, Latitude, Longitude, Distance_KM, Address } = school;

                // Offset logic for schools very close to Conradie Park to prevent overlap
                // 0.002 degrees is roughly 200 meters.
                const offsetLatDiff = Math.abs(Latitude - conradiePark[0]);
                const offsetLngDiff = Math.abs(Longitude - conradiePark[1]);

                if (offsetLatDiff < 0.002 && offsetLngDiff < 0.002) {
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

                // Smart 4-direction label positioning based on quadrant
                const latDiff = Latitude - conradiePark[0];
                const lngDiff = Longitude - conradiePark[1];

                let labelDirection, labelOffset;

                if (Math.abs(latDiff) > Math.abs(lngDiff)) {
                    // Vertical positioning dominant
                    if (latDiff > 0) {
                        labelDirection = 'bottom';  // School is North
                        labelOffset = [0, radius + 10];
                    } else {
                        labelDirection = 'top';     // School is South
                        labelOffset = [0, -(radius + 10)];
                    }
                } else {
                    // Horizontal positioning dominant
                    if (lngDiff > 0) {
                        labelDirection = 'right';   // School is East
                        labelOffset = [radius + 10, 0];
                    } else {
                        labelDirection = 'left';    // School is West
                        labelOffset = [-(radius + 10), 0];
                    }
                }


                // Only show permanent labels for schools with 3+ students
                // Smaller schools will show labels on hover only
                if (Students >= 3) {
                    marker.bindTooltip(School_Name, {
                        permanent: true,
                        direction: labelDirection,
                        className: 'school-label',
                        offset: labelOffset
                    });
                } else {
                    // Hover-only label for schools with 1-2 students
                    marker.bindTooltip(School_Name, {
                        permanent: false,
                        direction: labelDirection,
                        className: 'school-label',
                        offset: labelOffset
                    });
                }
            });
        })
        .catch(error => console.error('Error loading school data:', error));
});
