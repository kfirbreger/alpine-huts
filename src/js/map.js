
function main() {
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
    console.log(data);
    return data;
  });
  return call;
}

function displayHuts(map) {
  const dataset = ['at.json'];
  for (let i = 0; i < dataset.length; i++) {
    loadHuts('data/' + dataset[i])
    .then(data => {
      addHutsToMap(data, map);
    });
}


document.addEventListener("DOMContentLoaded", () => {
  const map = main();
  displayHuts(map);
});
