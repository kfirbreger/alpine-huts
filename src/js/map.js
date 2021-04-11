
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


function updateMarkers(map, markers, visibleMarkers) {
  const newMarkers = {};
  const features = map.querySourceFeatures('frHuts');
  // Create html for each cluster marker with no marker
  for (let i = 0; i < features.length; i++) {
    let props = features[i].properties;
    // If not in cluster, move on
    if (!props.cluster) {
      continue;
    }
    const coords = features[i].geometry.coordinates;

    const id = props.cluster_id;
    let marker = markers[id];
    if (!marker) {
      const el = createClusterMarker(props);
      marker = markers[id] = new mapboxgl.Marker({
        element: el
      }).setLngLat(coords);
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

  return newMarkers;
}


function createClusterMarker(props) {
  // Calculating size of font and circle
  const fontSize = props.point_count >= 1000 ? 22 : props.point_count >= 100 ? 20 : props.point_count >= 10 ? 18 : 16;
  const r = props.point_count >= 1000 ? 50 : props.point_count >= 100 ? 32 : props.point_count >= 10 ? 24 : 18;
  const r0 = Math.round(r * 0.6);
  const w = r * 2;

  const html = `<svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-ancor="middle" style="font: ${fontSize}px sans-serif; display: block">` +
    `<circle cx="${r}" cy="${r}" r="${r-2}" style="fill:white;stroke:black;stroke-width:1;"/>` +
    `<text dominant-baseline="central" text-anchor="middle" transform="translate(${r}, ${r})">${props.point_count.toLocaleString()}</text></svg>`
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}


function loadHutsGeojson() {
  const map = this;  // Clarifies what we are actually working on
  map.addSource('frHuts', {
    type: 'geojson',
    data: 'data/fr.geojson',
    cluster: true,
    clusterRadius: 100
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
  visibleMarkers = updateMarkers(map, markers, visibleMarkers);
  
  // Updating visible markers on each map render
  map.on('render', function() {
    if (!map.isSourceLoaded('frHuts')) {
      return;
    }
    visibleMarkers = updateMarkers(map, markers, visibleMarkers);
  });
      
}


document.addEventListener("DOMContentLoaded", () => {
  const map = createMap();
  //getAndDisplayHuts(map);
});
