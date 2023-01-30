var wms_layer = new L.LayerGroup();
var islayed = false;

 // Get user selection
 var dst = parseInt(document.getElementById('dataset').value);
 var variable = parseInt(document.getElementById('variable').value);
 var level = parseInt(document.getElementById('depth').value);
 var req_time = parseInt(document.getElementById('daterange').value);
 var lowval = parseFloat(document.getElementById('lowval').value);
 var highval = parseFloat(document.getElementById('highval').value);
 var user_selection = {
   'dataset': dataset_config[dst]['name'], 'variable': dataset_config[dst]['vars'][variable], 'depth': dataset_config[dst]['levels'][level],
   'time': dataset_config[dst]['daterange'][req_time], 'lowval': lowval, 'highval': highval
 };

 // this function is called by the UPDATE button
function updateMap() {  
  
  map.spin(false);
  // loader
  map.spin(true, { lines: 8, length: 30, width: 13, radius: 20, scale: 0.5, color: 'black' });

  // clear overlay
  if (islayed == true) {
    layerControl.removeLayer(wms_layer);
    map.removeLayer(wms_layer);
  }

  // Get user selection
  dst = parseInt(document.getElementById('dataset').value);
  variable = parseInt(document.getElementById('variable').value);
  level = parseInt(document.getElementById('depth').value);
  req_time = parseInt(document.getElementById('daterange').value);
  lowval = parseFloat(document.getElementById('lowval').value);
  highval = parseFloat(document.getElementById('highval').value);
  user_selection = {
    'dataset': dataset_config[dst]['name'], 'variable': dataset_config[dst]['vars'][variable], 'depth': dataset_config[dst]['levels'][level],
    'time': dataset_config[dst]['daterange'][req_time], 'lowval': lowval, 'highval': highval
  };

  if (isNaN(lowval) || isNaN(highval) || (lowval > highval)) {    
    var legend_url = dataset_config[dst]['url'] + "REQUEST=GetLegendGraphic&LAYER=" + dataset_config[dst]['vars'][variable] + "&bgcolor=0xffffff";
    //console.log(legend_url);
    wms_layer = L.tileLayer.wms(dataset_config[dst]['url'], {
      crs: L.CRS.EPSG3857,
      format: 'image/png',
      layers: dataset_config[dst]['vars'][variable],
      belowmincolor: 'transparent',
      abovemaxcolor: 'transparent',
      numcolorbands: 250,
      style: 'boxfill/ncview',
      time: dataset_config[dst]['daterange'][req_time],
      elevation: String(dataset_config[dst]['levels'][level]),
      transparent: true,
      opacity: 0.7,
      version: '1.3.0'
    }).addTo(map);
  }
  else {
    var legend_url = dataset_config[dst]['url'] + "REQUEST=GetLegendGraphic&LAYER=" + dataset_config[dst]['vars'][variable] + "&bgcolor=0xffffff&colorscalerange=" + String(lowval) + "," + String(highval);
    //console.log(legend_url);
    wms_layer = L.tileLayer.wms(dataset_config[dst]['url'], {
      crs: L.CRS.EPSG3857,
      format: 'image/png',
      layers: dataset_config[dst]['vars'][variable],
      belowmincolor: 'transparent',
      abovemaxcolor: 'transparent',
      numcolorbands: 250,
      style: 'boxfill/ncview',
      time: dataset_config[dst]['daterange'][req_time],
      elevation: String(dataset_config[dst]['levels'][level]),
      colorscalerange: [lowval, highval],
      transparent: true,
      opacity: 0.7,
      version: '1.3.0'
    }).addTo(map);
  }  

  //legend
  document.getElementById("colorbar").innerHTML = "<img id=\"imgL\"src=\"" + legend_url + "\" alt=\"\" height=264px width=110px>";

  //spin 
  wms_layer.on('loading', function (e) {
    map.spin(true, { lines: 8, length: 30, width: 13, radius: 20, scale: 0.5, color: 'black' });
  });

  wms_layer.on('load tileerror tileabort', function (e) {    
    map.spin(false);
  });
  
  layerControl.addOverlay(wms_layer, "User request")
  islayed = true;
}

function initDemoMap() {

  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  //BASE TILE GROUP LAYER
  var baseLayers = {
    'Base': Esri_WorldImagery
  };

  var map = L.map('map', {
    crs: L.CRS.EPSG3857,
    minZoom: 1,
    maxZoom: 8,
    layers: [Esri_WorldImagery],
  });

  var layerControl = L.control.layers(baseLayers);
  layerControl.addTo(map);

  map.setView([32, -36], 3);
  L.control.mousePosition().addTo(map);
  //INIT RETURN FUNCTION
  return {
    map: map,
    layerControl: layerControl
  };
}

// MAP CREATION
var mapStuff = initDemoMap();
var map = mapStuff.map;
var layerControl = mapStuff.layerControl;
var RectDrawer = new L.Draw.Rectangle(map);
var popup = L.popup();
var clicked = 0;

function gen_timeserie() {
  clicked = 1;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function gen_profile() {
  clicked = 2;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function gen_snapshot() {
  clicked = 3;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

function ano_timeserie() {
  clicked = 4;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function ano_profile() {
  clicked = 5;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function ano_snapshot() {
  clicked = 6;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

map.on('click', function (e) {
  if (clicked == 1) {
    gen_timeserie_2(e.latlng.lat, e.latlng.lng, 0)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 2) {
    gen_profile_2(e.latlng.lat, e.latlng.lng, 0)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 3) {
    RectDrawer.enable();
  }
  else if (clicked == 4) {
    gen_timeserie_2(e.latlng.lat, e.latlng.lng, 1)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 5) {
    gen_profile_2(e.latlng.lat, e.latlng.lng, 1)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 6) {
    RectDrawer.enable();
  }
});
map.on('draw:created', function (e) {
  var type = e.layerType,
    layer = e.layer;
  layer.addTo(map);
  var coords = layer.getLatLngs();

  popuplat = (coords[0][0]['lat'] + coords[0][2]['lat']) / 2;
  popuplon = (coords[0][0]['lng'] + coords[0][2]['lng']) / 2;
  popup = L.popup().setLatLng([popuplat, popuplon]).setContent("<div id='img_ts'><div class=\"lds-dual-ring\"></div></div>").openOn(map);
  popup.on('remove', function () {
    map.removeLayer(layer);
  });

  if (clicked == 3) {
    gen_snapshot_2(coords, 0);
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 6) {
    gen_snapshot_2(coords, 1);
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
});

function gen_timeserie_2(lat, lon, ano) {
  //open map popup to host to figure
  popup = L.popup().setLatLng([lat, lon]).setContent("<div id='img_ts'><div class=\"lds-dual-ring\"></div></div>").openOn(map);

  reqstring = 'lat=' + lat.toString() + '&lon=' + lon.toString() + '&user_selection=' + JSON.stringify(user_selection);

  if (ano == 0) {
    $.ajax({
      type: "GET",
      url: '/get_ts',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
        // EDIT POPUP
        document.getElementById("img_ts").innerText = dataarray ;
      }
    });
  }
  else if (ano == 1) {
    $.ajax({
      type: "GET",
      url: '/ano_ts',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
      }
    });
  }
}

function gen_profile_2(lat, lon, ano) {
  reqstring = 'lat=' + lat.toString() + '&lon=' + lon.toString()
  popup = L.popup().setLatLng([lat, lon]).setContent("<div id='img_ts'><div class=\"lds-dual-ring\"></div></div>").openOn(map);

  if (ano == 0) {
    $.ajax({
      type: "GET",
      url: '/get_prf',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
      }
    });
  }
  else if (ano == 1) {
    $.ajax({
      type: "GET",
      url: '/ano_prf',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
      }
    });
  }
}

function gen_snapshot_2(coords, ano) {
  reqstring = 'lat0=' + coords[0][0]['lat'].toString() + '&lon0=' + coords[0][0]['lng'].toString() + '&lat1=' + coords[0][2]['lat'].toString() + '&lon1=' + coords[0][2]['lng'].toString()
  if (ano == 0) {
    $.ajax({
      type: "GET",
      url: '/get_snapshot',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
      }
    });
  }
  else if (ano == 1) {
    $.ajax({
      type: "GET",
      url: '/ano_snapshot',
      data: reqstring,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        console.log(dataarray);
      }
    });
  }
}
