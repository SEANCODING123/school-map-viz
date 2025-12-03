document.addEventListener('DOMContentLoaded', () => {
    // Conradie Park coordinates
    const conradiePark = [-33.9229, 18.5212];

    // Initialize the map
    const map = L.map('map').setView(conradiePark, 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
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
                const { School_Name, Students, Latitude, Longitude, Distance_KM, Address } = school;
                
                // Determine marker size or color based on student count if desired
                // For now, standard blue markers
                
                const marker = L.marker([Latitude, Longitude]).addTo(map);
                
                const popupContent = `
                    <b>${School_Name}</b><br>
                    Students: ${Students}<br>
                    Distance: ${Distance_KM} km<br>
                    Address: ${Address}
                `;
                
                marker.bindPopup(popupContent);
            });
        })
        .catch(error => console.error('Error loading school data:', error));
});
