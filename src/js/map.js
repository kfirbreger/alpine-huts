
function createMap() {
  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
      center: [6.869810, 45.925461], // starting position [lng, lat]
      zoom: 10 // starting zoom
  });
  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());
  return map;
}

function loadHuts(url) {
  let call = fetch(url)
  .then(resp => resp.json())
  .then(data => {
    return data;
  });
  return call;
}

function addHutToMap(hut, map) {
  // Looping through the huts
  const popup = new mapboxgl.Popup().setText(hut.name);
 
  const marker = document.createElement('div')
  // @TODO add id
  // marker.id = ?

  new mapboxgl.Marker()
    .setLngLat(hut.coordinates)
    .setPopup(popup)
    .addTo(map);
}


function getAndDisplayHuts(map) {
  const dataset = ['fr.json'];
  for (let i = 0; i < dataset.length; i++) {
    loadHuts('data/' + dataset[i])
    .then(huts => {
      for (let i = 0; i < huts.length;i++) {
        addHutToMap(huts[i], map);
      }
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const map = createMap();
  getAndDisplayHuts(map);
});
