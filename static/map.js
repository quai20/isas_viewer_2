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
var marker = L.marker();
var layerControl = mapStuff.layerControl;
var RectDrawer = new L.Draw.Rectangle(map);
var clicked = 0;
var tempLayer = L.layerGroup().addTo(map);

var winc = L.control.window(map, {position: 'topLeft'}).on('hide', function() {          
  tempLayer.clearLayers();
});


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
  if ([1, 2, 4, 5].includes(clicked)) {
    gen_img([e.latlng.lat, e.latlng.lng, e.latlng.lat, e.latlng.lng], clicked)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if ([3, 6].includes(clicked)) {
    RectDrawer.enable();
  }
});

map.on('draw:created', function (e) {

  var type = e.layerType,
    layer = e.layer;
  layer.addTo(tempLayer);
  var coords = layer.getLatLngs();      

  gen_img([coords[0]['lat'], coords[0]['lng'], coords[2]['lat'], coords[2]['lng']], clicked);
  $('.leaflet-container').css('cursor', '');
  clicked = 0;
});

function gen_img(coords_array, clicked) {

  var lat0 = coords_array[0];
  var lon0 = coords_array[1];
  var lat1 = coords_array[2];
  var lon1 = coords_array[3];  

  // POP UP IS NOT A GOOD IDEA, WE SHOULD ADD A MARKER/RECTANGLE AND PLOT IN A SIDE OR BOTTOM PANEL INSTEAD
  //MARKER
  marker = L.marker([(lat0+lat1)/2, (lon0+lon1)/2]).addTo(tempLayer);
  //SET PANEL CONTENT
  winc.content("<div id='img_div'><div class=\"lds-dual-ring\"></div></div>");  
  winc.show();

  reqstring = 'lat0=' + lat0.toString() + '&lon0=' + lon0.toString() +
    '&lat1=' + lat1.toString() + '&lon1=' + lon1.toString() +
    '&operation=' + clicked.toString() + '&dataset=' + user_selection['dataset'] +
    '&variable=' + user_selection['variable'] + '&depth=' + user_selection['depth'].toString() +
    '&time=' + user_selection['time'] + '&lowval=' + user_selection['lowval'].toString() +
    '&highval=' + user_selection['highval'].toString()

  $.ajax({
    type: "GET",
    url: '/get_img',
    data: reqstring,
    contentType: 'application/json;charset=UTF-8',
    success: function (data) {
      dataarray = JSON.parse(data)
      //console.log(dataarray);
      // EDIT POPUP
      console.log("routed through flask")      
      winc.content("<img src=\"" + dataarray + "\" alt=\"img\"></img>");
    }
  });

}

