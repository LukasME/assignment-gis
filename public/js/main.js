/* eslint-env jquery, browser */
$(document).ready(() => {

  // DEFINED VARIABLES
  // ------------------
  const leafletMap = L.map('map',{
    trackResize: true
  }).setView([50.85, 4.36], 12);
  const mapboxAccessToken = 'pk.eyJ1IjoibG1lbmhlcnQiLCJhIjoiY2puM3MzOHVmMGgybDNxbzR1MG03ejFybCJ9.odUEnjK-CAYIp_StjHw4cQ';

  const darkTiling = L.tileLayer('https://api.mapbox.com/styles/v1/lmenhert/cjp73c55935542rukv6mute9s/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxAccessToken  
  });
  const defaultTiling = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
  });
  const mapBoxBasicTiling = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: mapboxAccessToken  
  });
  const lightTiling = L.tileLayer('https://api.mapbox.com/styles/v1/lmenhert/cjp739p6x102m2smrc5vcco7o/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxAccessToken  
  });

  const apiPrefix = '/api/v1/';
  let positionMarker = null;
  let positionDistance = null;
  let modalViewSettings = document.getElementById('modal-view-settings');
  let modalFindMarker = document.getElementById('modal-find-marker');

  // Sidemenu
  let sidemenuContainer = $('#sidemenu-container');
  let sidemenuMarker = $('#sidemenu-marker');
  let sidemenuLandmark = $('#sidemenu-landmark');

  // Values
  let latPosition = document.getElementById('lat-position');
  let lngPosition = document.getElementById('lng-position');
  let maxDistance = document.getElementById('max-distance');

  let geoPointsLayer = null;
  let geoProvincesLayer = null;
  let geoLinesLayer = null;
  let geoAttractionsLayer = null;

  let provinceLayers = [];
  let provinceResult = null;

  /**
   * 0 = for turned off
   * 1 = for sidemenu type 1
   * 2 = for sidemenu type 2
   */
  let isSideMenuOn = 0;
  // let modalFindRoute = document.getElementById('map-control');

  // INITIALIZE VIEW
  // ------------------

  defaultTiling.addTo(leafletMap);

  L.easyButton('fa-map-marker', function (btn, map) {
      // This is sidemenu 1
      if (isSideMenuOn == 0) {
        $('#map').addClass('col-md-8 col-sm-4 col-4');
        sidemenuContainer.addClass('col-md-4 col-sm-8 col-8');
        sidemenuContainer[0].style.display = 'flex';
        sidemenuMarker[0].style.display = 'flex';
        isSideMenuOn = 1;
        if(positionDistance && !leafletMap.hasLayer(positionDistance)){
          leafletMap.addLayer(positionDistance);
          positionDistance.bringToBack();
        }
      } else if (isSideMenuOn == 1) {
        $('#map').removeClass('col-md-8 col-sm-4 col-4');
        sidemenuContainer.removeClass('col-md-4 col-sm-8 col-8');
        sidemenuContainer[0].style.display = 'none';
        sidemenuMarker[0].style.display = 'none';
        isSideMenuOn = 0;
      } else if (isSideMenuOn == 2) {
        sidemenuLandmark[0].style.display = 'none';
        sidemenuMarker[0].style.display = 'flex';
        isSideMenuOn = 1;
        if(positionDistance && !leafletMap.hasLayer(positionDistance)){
          leafletMap.addLayer(positionDistance);
          positionDistance.bringToBack();
        }
      }
      leafletMap.invalidateSize();
    },
    'Search for all things bicycle related'
  ).addTo(leafletMap);

  L.easyButton('fa-landmark', function (btn, map) {
      // This is sidemenu 2
      if (isSideMenuOn == 0) {
        $('#map').addClass('col-md-8 col-sm-4 col-4');
        sidemenuContainer.addClass('col-md-4 col-sm-8 col-8');
        sidemenuContainer[0].style.display = 'flex';
        sidemenuLandmark[0].style.display = 'flex';
        isSideMenuOn = 2;
        if(positionDistance && leafletMap.hasLayer(positionDistance)){
          leafletMap.removeLayer(positionDistance);
        }
      } else if (isSideMenuOn == 2) {
        $('#map').removeClass('col-md-8 col-sm-4 col-4');
        sidemenuContainer.removeClass('col-md-4 col-sm-8 col-8');
        sidemenuContainer[0].style.display = 'none';
        sidemenuLandmark[0].style.display = 'none';
        isSideMenuOn = 0;
      } else if (isSideMenuOn == 1) {
        sidemenuMarker[0].style.display = 'none';
        sidemenuLandmark[0].style.display = 'flex';
        isSideMenuOn = 2;
        if(positionDistance && leafletMap.hasLayer(positionDistance)){
          leafletMap.removeLayer(positionDistance);
        }
      }
      leafletMap.invalidateSize();
    },
    'Navigate around landmarks'
  ).addTo(leafletMap);

  L.easyButton('fa-cog', function (btn, map) {
    modalViewSettings.style.display = 'block';
  },
  'View settings'
  ).addTo(leafletMap);

  // MODAL OPTIONS functionality
  // ------------------
  // Get the modal

  // Close the modal on button click
  var apply = document.getElementById('apply-changes-btn');
  apply.onclick = function () {
    // Get values of control elements
    let tilingDropbox = document.getElementById('tweewieler-tiling-list-tab');
    let selectedTiling = tilingDropbox.getElementsByClassName('active')[0].getAttribute('value');

    // Apply settings
    switch(selectedTiling) {
      case 'MapBox':
        setTiling($('div#modal-view-settings #list-profile .form-check-input:checked')[0].value);
        break;
      default:
        setTiling('0');
        break;
    }
  }
  // https://api.mapbox.com/styles/v1/mapbox/emerald-v8/tiles/{z}/{x}/{y}
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modalViewSettings) {
      modalViewSettings.style.display = 'none';
    } else if (event.target == modalFindMarker) {
      modalFindMarker.style.display = 'none';
    } 
  }

  // MAP VIEW functionality
  // ------------------

  // Example Code and playground
  function onMapClickEvent(e) {
    if(positionMarker){
      leafletMap.removeLayer(positionMarker); 
    }
    if(positionDistance && leafletMap.hasLayer(positionDistance)){
      leafletMap.removeLayer(positionDistance);
    }
    positionMarker = L.marker(e.latlng).addTo(leafletMap);
    
    if(maxDistance.value){
      positionDistance = L.circle(e.latlng, getPositionDistanceOptions(maxDistance.value)).bringToBack();
      if(isSideMenuOn == 1){
        positionDistance.addTo(leafletMap);
      }
    }

    findCyclePaths(e.latlng.lng, e.latlng.lat)

    latPosition.value = e.latlng.lat;
    lngPosition.value = e.latlng.lng;
  }

  leafletMap.on('click', onMapClickEvent);

  // SIDE MENU MARKER functionality
  // ------------------

  /**
   * When changing position on map click
   */
  $('#lat-position').on('input', function() { 
    if(isNumeric(lngPosition.value)){
      if(positionMarker){
        leafletMap.removeLayer(positionMarker);
      }
      positionMarker = L.marker([latPosition.value, lngPosition.value]).addTo(leafletMap);
    }
  });

  $('#lng-position').on('input', function() { 
    if(isNumeric(latPosition.value)){
      if(positionMarker){
        leafletMap.removeLayer(positionMarker);
      }
      positionMarker = L.marker([latPosition.value, lngPosition.value]).addTo(leafletMap);
    }
  });

  $('#max-distance').on('input', function() { 
    if(positionDistance && leafletMap.hasLayer(positionDistance)){
      leafletMap.removeLayer(positionDistance);
    }

    if(positionMarker && positionDistance){
      positionDistance = L.circle([latPosition.value, lngPosition.value], getPositionDistanceOptions(maxDistance.value)).bringToBack();
    } else if (positionMarker && maxDistance.value != null) {
      positionDistance = L.circle([latPosition.value, lngPosition.value], getPositionDistanceOptions(maxDistance.value)).bringToBack();
    }
    if(positionDistance && isSideMenuOn == 1){
      positionDistance.addTo(leafletMap);
      leafletMap.invalidateSize();
      leafletMap.fitBounds(positionDistance.getBounds(), {padding: L.point(20, 20)});
    }
  });

  /**
   * Button click event
   */
  $('button#geo-point-request').click(function(){
    // Query
    if(maxDistance.value && latPosition.value && lngPosition.value){
      queryParams = {}
      queryParams['latitude'] = latPosition.value;
      queryParams['longitude'] = lngPosition.value;
      queryParams['radius'] = maxDistance.value;
      if($('input#checkRentalAmenity:checked').length > 0) queryParams['rental'] = true;
      if($('input#checkRepairAmenity:checked').length > 0) queryParams['repair'] = true;
      if($('input#checkParkingAmenity:checked').length > 0) queryParams['parking'] = true;
      if($('input#checkShop:checked').length > 0) queryParams['shop'] = true;
      query = buildUrl(apiPrefix, {
        path: 'geoPoints',
        queryParams: queryParams
      });

      $.ajax({
        url:query,
        type: 'GET',
        success: function(result){
          if(geoPointsLayer && leafletMap.hasLayer(geoPointsLayer)){
            leafletMap.removeLayer(geoPointsLayer);
          }
          geoPointsLayer = L.featureGroup()
          $('#sidemenu-marker > ul.list-results > li').remove();
          
          for (var i = 0; i < result.length; i++) {
            let popup = `${result[i].name ? '<b>Name: </b>' + result[i].name + '</br>': ''}${result[i].tags.rental ? '<b>Bicycle rental</b></br>': ''}${result[i].tags.network ? '<b>Network: </b>' + result[i].tags.network + '</br>': ''}${result[i].tags.bicycle_parking ? '<b>Type of parking: </b>' + result[i].tags.bicycle_parking + '</br>': ''}${result[i].tags.capacity ? '<b>Capacity: </b>' + result[i].tags.capacity + '</br>': ''}${result[i].tags.opening_hours ? '<b>Opening hours: </b>' + result[i].tags.opening_hours + '</br>': ''}${result[i].tags["service:bicycle:chain_tool"] ? '<b>Chain tool:</b> yes</br>': ''}${result[i].tags["service:bicycle:pump"] ? '<b>Pump:</b> yes</br>': ''}${result[i].tags.fee ? '<b>Fee: </b>' + result[i].tags.fee + '</br>': ''}`;

            geojsonCoord = JSON.parse(result[i].st_asgeojson).coordinates;
            circleMarker = L.circleMarker([geojsonCoord[1], geojsonCoord[0]], {
              color: getPointColor(result[i].amenity, result[i].shop),
              fillColor: '#ffffff',
              fillOpacity: 0.3,
              radius: 7
            }).bindPopup(popup === '' ? 'No data available' : popup);
            geoPointsLayer.addLayer(circleMarker);

            var item = $(`
              <li>${Math.floor(result[i].st_distance)}m ${result[i].name ? result[i].name : getPointCategory(result[i])}</li>
            `).attr('value', geoPointsLayer.getLayerId(circleMarker)).addClass('list-group-item list-group-item-action');
            item.click(function() {
              // Create new layer to zoom on marker and selected point
              fitToPoint($(this)[0].value, geoPointsLayer);
            })
            $('#sidemenu-marker > ul.list-results').append(item);     
          }
          geoPointsLayer.addTo(leafletMap);
          if(positionDistance){
            leafletMap.invalidateSize();
            leafletMap.fitBounds(positionDistance.getBounds(), {padding: L.point(20, 20)});
          }
        },
        error: function (error) {
          console.log(`Error ${error}`);
        }
      })
    } else {
      console.log("Few required attributes are missing");
    }
  })

  // SHOW PROVINCES
  const UrlProvinces = apiPrefix + 'geoProvinces';
  $('button#geo-provinces-request').click(function(){
      $.ajax({
        url: UrlProvinces,
        type: 'GET',
        success: function(result){
          if(provinceResult == null){
            provinceResult = result;
            // Show provinces
            geoProvincesLayer = L.featureGroup();
            lastProvinceName = result[0].name;
            provinceLayer = L.featureGroup();
            let i = 0;
            for (; i < result.length; i++) {
              if(result[i].name != lastProvinceName){
                provinceLayers.push(provinceLayer);

                item = createFormCheck((provinceLayers.length - 1) , lastProvinceName);
                item.data('osm_id', result[i - 1].id);
                $('#sidemenu-landmark div#geo-provinces-radiobox').append(item);
                provinceLayer = L.featureGroup();
                lastProvinceName = result[i].name;
              } 
              geojsonCoord = JSON.parse(result[i].st_asgeojson).coordinates;
              // Add polygon
              polygon = L.polygon(geojsonCoord, {
                color: provinceColor(result[i].name), 
                fillOpacity: 0.2
              });
              provinceLayer.addLayer(polygon);
            }
            provinceLayers.push(provinceLayer);
            item = createFormCheck((provinceLayers.length - 1) , lastProvinceName);
            item.data('osm_id', result[i - 1].id);
            $('#sidemenu-landmark div#geo-provinces-radiobox').append(item);

            $('button#geo-provinces-request')[0].style.display = 'none';
            $('#search-provinces')[0].style.display = 'block';

            $('#sidemenu-landmark div#geo-provinces-radiobox input.form-check-input').click(function(){
              if(leafletMap.hasLayer(geoProvincesLayer)){
                leafletMap.removeLayer(geoProvincesLayer)
              }
              geoProvincesLayer = L.featureGroup();
              geoProvincesLayer.addLayer(provinceLayers[$(this)[0].value])
              leafletMap.addLayer(geoProvincesLayer);
              leafletMap.invalidateSize();
              leafletMap.fitBounds(geoProvincesLayer.getBounds(), {padding: L.point(20, 20)});
              geoProvincesLayer.bringToBack();
            });
          }
        },
        error: function (error) {
          console.log(`Error ${error}`);
        }
      })
  })

  $('button#geo-landmarks-request').click(function(){
    query = buildUrl(apiPrefix, {
      path: 'geoLandmarks',
      queryParams: {
        provinceId: $('#sidemenu-landmark div#geo-provinces-radiobox input.form-check-input:checked').length > 0 ? $('#sidemenu-landmark div#geo-provinces-radiobox input.form-check-input:checked').parent().data('osm_id') : null
      }
    });
    let selectedProvince = $('#sidemenu-landmark div#geo-provinces-radiobox input.form-check-input:checked').siblings('label')[0].innerHTML;
    
    $.ajax({
      url: query,
      type: 'GET',
      success: function(result){
        if(geoAttractionsLayer && leafletMap.hasLayer(geoAttractionsLayer)){
          leafletMap.removeLayer(geoAttractionsLayer);
        }
        geoAttractionsLayer = L.featureGroup()
        $('#sidemenu-landmark ul.list-results > li').remove();
        
        for (var i = 0; i < result.length; i++) {
          let popup = `${result[i].name ? result[i].name : ''} ${result[i].tourism ? result[i].tourism : ''} ${result[i].historic ? result[i].historic : ''}`;

          geojsonCoord = JSON.parse(result[i].st_asgeojson).coordinates;
          circleMarker = L.circleMarker([geojsonCoord[1], geojsonCoord[0]], {
            color: '#ffffff',
            fillColor: provinceColor(selectedProvince),
            fillOpacity: 0.8,
            radius: 7
          }).bindPopup(popup === '' ? 'No data available' : popup);
          geoAttractionsLayer.addLayer(circleMarker);
          // TODO
          var listItem = $(`
            <li>${result[i].name ? result[i].name : ''} ${result[i].tourism ? result[i].tourism : ''} ${result[i].historic ? result[i].historic : ''}</li>
          `).attr('value', geoAttractionsLayer.getLayerId(circleMarker)).addClass('list-group-item list-group-item-action');
          // Create new layer to zoom on marker and selected point
          listItem.click(function() {
            fitToPoint($(this)[0].value, geoAttractionsLayer);
          })
          $('#sidemenu-landmark ul.list-results').append(listItem); 
          
          if(geoProvincesLayer && leafletMap.hasLayer(geoProvincesLayer)){
            leafletMap.removeLayer(geoProvincesLayer);
          }    
        }
        geoAttractionsLayer.addTo(leafletMap);
      },
      error: function (error) {
        console.log(`Error ${error}`);
      }
    })
  })


  // Cycle paths
function findCyclePaths(longitude, latitude){
  queryParams = {}
  queryParams['latitude'] = latitude;
  queryParams['longitude'] = longitude;
  query = buildUrl(apiPrefix, {
    path: 'geoPaths',
    queryParams: queryParams
  });

  $.ajax({
    url: query,
    type: 'GET',
    success: function(result){
      newGeoLinesLayer = L.featureGroup()
      for (var i = 0; i < result.length; i++) {
        geojsonCoord = JSON.parse(result[i].st_asgeojson).coordinates;
        // Add road
        path = L.polyline(geojsonCoord, {
          color: getSurfaceColor(result[i])
        }).addTo(leafletMap);
        newGeoLinesLayer.addLayer(path);
      }
      if(geoLinesLayer && leafletMap.hasLayer(geoLinesLayer)){
        leafletMap.removeLayer(geoLinesLayer);
      }
      geoLinesLayer = newGeoLinesLayer;
      geoLinesLayer.addTo(leafletMap);
    },
    error: function (error) {
      console.log(`Error ${error}`);
    }
  })
}
  

  function fitToPoint(id, parentLayer){
    let zoomLayer = L.featureGroup();
    let layer = parentLayer.getLayer(id);
    zoomLayer.addLayer(layer);
    if(positionMarker){
      zoomLayer.addLayer(positionMarker);
    }
    leafletMap.invalidateSize();
    leafletMap.fitBounds(zoomLayer.getBounds(), {padding: L.point(100, 100)});
    layer.openPopup();
  }


  function setTiling(value){
    removeTiling();
    switch(value){
      case '1':
        mapBoxBasicTiling.addTo(leafletMap);
        break;
      case '2': 
        darkTiling.addTo(leafletMap);
        break;
      case '3': 
        lightTiling.addTo(leafletMap);
        break;
      default:
        defaultTiling.addTo(leafletMap);
        break;
    }
  }

  function removeTiling(){
    if(leafletMap.hasLayer(defaultTiling)){
      leafletMap.removeLayer(defaultTiling);
    }
    if(leafletMap.hasLayer(mapBoxBasicTiling)){
      leafletMap.removeLayer(mapBoxBasicTiling);
    }
    if(leafletMap.hasLayer(darkTiling)){
      leafletMap.removeLayer(darkTiling);
    }
    if(leafletMap.hasLayer(lightTiling)){
      leafletMap.removeLayer(lightTiling);
    }
  }

});

// UTIL functions
// ------------------

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getPointColor(amenity, shop){
  if(shop == 'bicycle'){
    return 'red';
  }

  switch(amenity){
    case 'bicycle_repair_station':
      return '#ffa838';
      break;
    case 'bicycle_repair_station;bicycle_rental':
      return '#000000';
      break;
    case 'bicycle_parking':
      return '#3d67ff';
      break;
    case 'bicycle_rental':
      return '#000000';
      break;
  }
}

function provinceColor(name){
  switch(name){
    case 'Hainaut':
      return '#FF1744';
    case 'Namur':
      return '#8BC34A';
    case 'Luxembourg':
     return '#AA00FF';
    case 'Liège':
      return '#C2185B';
    case 'West-Vlaanderen':
      return '#2979FF';
    case 'Oost-Vlaanderen':
      return '#388E3C';
    case 'Brabant wallon':
      return '#536DFE';
    case 'Vlaams-Brabant':
      return '#FFEA00';
    case 'Antwerpen':
      return '#FF9100';
    case 'Limburg':
      return '#795548';
    default:
      return '#FF1744'
  }
}

function getPointCategory(row){
  if(row.shop == 'bicycle'){
    return 'Shop';
  }

  switch(row.amenity){
    case 'bicycle_repair_station':
      return 'Repair station';
    case 'bicycle_repair_station;bicycle_rental':
      return 'Rental and repair';
    case 'bicycle_parking':
      return 'Parking';
    case 'bicycle_rental':
      return 'Rental';
    default:
      return 'unknown';
  }
}

function createFormCheck(id, label){
  return $(`
  <div class="form-check">
    <input class="form-check-input" type="radio" name="provinceRadios" value="${id}" id="province-radio-${id}">
    <label class="form-check-label" for="exampleRadios${id}">${label}</label>
  </div>`);
}

function getSurfaceColor(row){
  let good = '#43a047';
  let bad = '#ff1744';
  let ok = '#ffc400'
  let unknown = '#0288d1';
  
  switch(row.surface){
    case 'paved':
      return good;
    case 'gravel':
      return bad;
    case 'asphalt':
      return good;
    case 'unpaved':
      return unknown;
    case 'fine_gravel':
      return bad;
    case 'concrete':
      return good;
    case 'paving_stones':
      return ok;
    case 'dirt':
      return ok;
    case 'ground':
      return ok;
    case 'compacted':
      return ok;
    default:
      return unknown;
  }
}

function getPositionDistanceOptions(radius){
  return {
    color: 'black',
    fillColor: 'black',
    fillOpacity: 0.1,
    radius: radius
  }
}

