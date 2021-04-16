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

  function loadHutsGeojson() {
    map.addSource('alpenHuts', {
      type: 'geojson',
      data: 'data/alpen.geojson',
      cluster: true,
      clusterRadius: 75,
      clusterMaxZoom: 14
    });
    // cluster layer
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'alpenHuts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#fefefe',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          16,
          10,
          18,
          100,
          20,
          1000,
          22
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#111'
      }
    });
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'alpenHuts',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12
      }
    });
    map.loadImage('img/wilderness_hut-18.png', function(error, image) {
      if (error) {
        throw error;
      }
      map.addImage('hut-marker', image);
      // Huts markers layer
      map.addLayer({
        id: 'alpenMarkers',
        type: 'symbol',
        source: 'alpenHuts',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'hut-marker',
          'text-field': ['get', 'name'],
          'text-offset': [0, 1],
          'text-anchor': 'top',
          'text-size': 10
        }
      });
      

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

  function showPopup(e) {
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

  function clusterClick(e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('alpenHuts').getClusterExpansionZoom(
      clusterId,
      function(err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  }

  function run() {
    // Collects everything to one external call
    createMap();
    // Loading hut information
    map.on('load', loadHutsGeojson);
    // Cluster point clicking
    map.on('click', 'clusters', clusterClick);
    // Adding popup information
    map.on('click', function(e) {
      showPopup(e);
    });
  }

  return {
    run: run
  }

})();


document.addEventListener("DOMContentLoaded", () => {
  hutsMap.run();

});
