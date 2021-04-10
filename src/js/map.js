
function createMap() {
  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
      center: [6.869810, 45.925461], // starting position [lng, lat]
      zoom: 10 // starting zoom
  });
  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  // @TODO look into this https://docs.mapbox.com/mapbox-gl-js/example/hillshade/

  map.on('load', loadHutsGeojson);
  return map;
}

function loadHutsGeojson() {
  const map = this;  // Clarifies what we are actually working on
  map.addSource('frHuts', {
    type: 'geojson',
    data: 'data/fr.geojson',
    cluster: true,
    clusterRadius: 50
  });

  map.addLayer({
    id: 'fr_markers',
    type: 'circle',
    source: 'frHuts',
    filter: ['!=', 'cluster', true]
  });
  // Objects to keep track of markers in memory and visible
  const markers = {};
  let visibleMarkers = {};
  function updateMarkers() {
    const newMarkers = {};
    const features = map.querySourceFeatures('frHuts');
    // Create html for each cluster marker with no marker
    for (let i = 0; i < features.length; i++) {
      const coords = features[i].geometry.coordinates;
      let props = features[i].properties;
      // If not in cluster, move on
      if (!props.cluster) {
        continue;
      }
      const id = props.cluster_id;
      let marker = markers[id];
      if (!marker) {
        marker = markers[id] = new mapboxgl.Marker().setLngLat(coords);
      }
      newMarkers[id] = marker;

      if (!visibleMarkers[id]) {
        marker.addTo(map);
      }
    }
    // Removing all no longer visible cluster markers
    for (id in visibleMarkers) {
      if (!newMarkers[id]) {
        visibleMarkers[id].remove();
      }
    }

    visibleMarkers = newMarkers;
  }
  // Updating visible markers on each map render
  map.on('render', function() {
    if (!map.isSourceLoaded('frHuts')) {
      return;
    }
    updateMarkers();
  });
      
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
  const dataset = ['fr.geojson'];
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
  //getAndDisplayHuts(map);
});
