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

  var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  });

  //BASE TILE GROUP LAYER
  var baseLayers = {
    'Esri': Esri_WorldImagery,
    'Open': OpenStreetMap_Mapnik,
    'Gray': Esri_WorldGrayCanvas
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
var LineDrawer = new L.Draw.Polyline(map);
var clicked = 0;
var tempLayer = L.layerGroup().addTo(map); //FOR INTERACTIVE PURPOSE


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

function gen_section() {
  clicked = 4;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

function ano_timeserie() {
  clicked = 5;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function ano_profile() {
  clicked = 6;
  $('.leaflet-container').css('cursor', 'crosshair');
}
function ano_snapshot() {
  clicked = 7;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}
function ano_section() {
  clicked = 8;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

map.on('click', function (e) {
  if ([1, 2, 5, 6].includes(clicked)) {
    gen_img([e.latlng.lat, e.latlng.lng, e.latlng.lat, e.latlng.lng], clicked)
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if ([3, 7].includes(clicked)) {
    RectDrawer.enable();
  }
  else if ([4, 8].includes(clicked)) {
    LineDrawer.enable();
  }
});

map.on('draw:created', function (e) {

  var type = e.layerType,
    layer = e.layer;
  layer.addTo(tempLayer);
  var coords = layer.getLatLngs();
  if ([3, 7].includes(clicked)) {
    gen_img([coords[0]['lat'], coords[0]['lng'], coords[2]['lat'], coords[2]['lng']], clicked);
  }
  else if ([4, 8].includes(clicked)) {
    gen_img([coords[0]['lat'], coords[0]['lng'], coords[1]['lat'], coords[1]['lng']], clicked);
  }

  $('.leaflet-container').css('cursor', '');
  clicked = 0;
});

function gen_img(coords_array, clicked) {

  var lat0 = coords_array[0];
  var lon0 = coords_array[1];
  var lat1 = coords_array[2];
  var lon1 = coords_array[3];

  //CLEAR TEMPLAYER
  tempLayer.clearLayers();

  //CREATE ONESHOTLAYER with a random name 
  var oneshotname = "l" + (Math.floor(Math.random() * 1e6)).toString();
  window[oneshotname] = L.layerGroup().addTo(map);

  //CREATE WINDOW OBJ
  var winc = L.control.window(map, { title: '', position: 'topLeft' }).on('hide', function () {
    window[oneshotname].clearLayers();
  });

  //MARKER FOR POINT OPERATIONS
  if ([1, 2, 5, 6].includes(clicked)) {
    var marker = L.marker([(lat0 + lat1) / 2, (lon0 + lon1) / 2]).addTo(window[oneshotname]);
  }

  //RECTANGLE FOR SNAPSHOT
  if ([3, 7].includes(clicked)) {
    var rectangle = L.rectangle([[lat0, lon0], [lat1, lon1]], { color: 'Red', weight: 1 }).addTo(window[oneshotname]);
  }

  //LINE FOR SECTION
  if ([4, 8].includes(clicked)) {
    var line = L.polyline([[lat0, lon0], [lat1, lon1]], { color: 'Red' }).addTo(window[oneshotname]);
  }

  //SET WINDOW CONTENT
  winc.content("<div id='img_div'><center><div class=\"lds-dual-ring\"></div></center></div>");

  if ([1, 5].includes(clicked)) {
    winc.title("<a style=\"font-size:20px; font-weight:bold;\">" + lat0.toFixed(2) + ',' + lon0.toFixed(2) + " / " + user_selection['depth'].toString() + "m</a>");
  }
  else if ([2, 6].includes(clicked)) {
    winc.title("<a style=\"font-size:20px; font-weight:bold;\">" + lat0.toFixed(2) + ',' + lon0.toFixed(2) + " / " + user_selection['time'].substr(0, 10) + "</a>");
  }
  else if ([3, 7].includes(clicked)) {
    winc.title("<a style=\"font-size:20px; font-weight:bold;\">" + user_selection['time'].substr(0, 10) +
      ' / ' + user_selection['depth'].toString() + "m</a>");
  }
  else {
    winc.title("<a style=\"font-size:20px; font-weight:bold;\">" + user_selection['time'].substr(0, 10) + "</a>");
  }

  winc.show();
  console.log(lon1);
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
      // EDIT IMG WINDOW      
      winc.content("<img src=\"" + dataarray + "\" alt=\"img\"></img>");
    }
  });

}

