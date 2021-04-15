const hutsMap = (function() {
  let map = null;
  const markers = {};
  
  function createMap() {
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
        center: [6.869810, 45.925461], // starting position [lng, lat]
        zoom: 10 // starting zoom
    });
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    // @TODO look into this https://docs.mapbox.com/mapbox-gl-js/example/hillshade/

    
  }


  function updateMarkers(visibleMarkers) {
    const newMarkers = {};
    const features = map.querySourceFeatures('alpenHuts');
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
    map.addSource('alpenHuts', {
      type: 'geojson',
      data: 'data/alpen.geojson',
      cluster: true,
      clusterMinPoints: 3,  // Require at least 3 points to form a cluster
      clusterRadius: 100
    });
    map.loadImage('img/wilderness_hut-18.png', function(error, image) {
      if (error) {
        throw error;
      }
      map.addImage('hut-marker', image);

      map.addLayer({
        id: 'alpenMarkers',
        type: 'symbol',
        source: 'alpenHuts',
        filter: ['!=', 'cluster', true],
        layout: {
          'icon-image': 'hut-marker',
          'text-field': ['get', 'name'],
          'text-offset': [0, 1],
          'text-anchor': 'top',
          'text-size': 10
        }
      });
    });
    // Objects to keep track of markers in memory and visible
    let visibleMarkers = updateMarkers({});
    
    // Updating visible markers on each map render
    map.on('render', function() {
      if (!map.isSourceLoaded('alpenHuts')) {
        return;
      }
      visibleMarkers = updateMarkers(visibleMarkers);
    });
        
  }

  function renderPopupFacilities(fac) {
    let html = `<li><div><h4 class="font-bold">facilities</h4><ul class="ml-4">`
    for  (id in fac) {
      html += `<li>${id}: ${fac[id]}</li>`;
    }
    html += `</ul></div></li>`;
    return html;
  }

  function renderPopupAddress(addr) {
    console.log(addr);
    let html = `<li><div><h4 class="font-bold">Address</h4><p class="ml-4">`;
    if (addr.street && addr.housenumber) {
      html += `${addr.street} ${addr.housenumber},`;
    } else if (addr.street) {
      html += `${addr.street},`;
    } else if (addr.housenumber) {
      html += `&num;${addr.housenumber},`;
    }
    if (addr.postcode) {
      html += ` ${addr.postcode}`;
    }
    if (addr.city) {
      html += ` ${addr.city}`;
    } else if (addr.place) {
      html += `${addr.place}`;
    }
    if (addr.country) {
      html += `, ${addr.country}`;
    }
    html += `</p></div></li>`;
    return html;
  }

  function markerPopupHtml(props) {
    // Create the html for the popup, based on the props data
    let html = `<div class="p-2"><h3 class="text-base">${props.name}</h3>`
    // Checking if there is more than just a name
    if (props.length === 1) {
      return html;
    } else {
      html += '<ul class="list-none">'
    }
    // Adding what is available
    if (props.website) {
      html += `<li class="text-blue-600"><a href="${props.website}">Website</a></li>`
    }
    if (props.email) {
      html += `<li>&commat;: ${props.email}</li>`
    }
    if (props.phone) {
      html += `<li>Tel: ${props.phone}</li>`
    }
    if (props.elev) {
      html += `<li>Elevation: ${props.elev}</li>`
    }
    if (props.facilities) {
      // @TODO mapbox does not completely parse the properties
      // so that needs to happen here
      const fac = JSON.parse(props.facilities);
      html += renderPopupFacilities(fac);
    }
    if (props.addr) {
      // @TODO see facilities
      const addr = JSON.parse(props.addr);
      html += renderPopupAddress(addr);
    }
    html += `</ul></div>`
    return html
  }

  function addPopup(e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['alpenMarkers']
    });

    if (!features.length) {
      return;
    }

    const feature = features[0];
    const html = markerPopupHtml(feature.properties);
    const popup = new mapboxgl.Popup({offset: [0, -15]})
    .setLngLat(feature.geometry.coordinates)
    .setHTML(html)
    .addTo(map);
  }

  function run() {
    // Collects everything to one external call
    createMap();
    // Loading hut information
    map.on('load', loadHutsGeojson);
    // Adding popup information
    map.on('click', function(e) {
      addPopup(e);
    });
  }

  return {
    run: run
  }

})();


document.addEventListener("DOMContentLoaded", () => {
  hutsMap.run();

});
