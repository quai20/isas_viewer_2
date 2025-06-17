var wms_layer = new L.LayerGroup();
var islayed = false;

// predefined regions
var prefill = 0;
const regions = [[-180, 180, -90, 90], [-80, 0, 10, 70], [-70, 25, -60, 15], [25, 140, -60, 25], [120, 255, 10, 65], [120, 288, -55, 10]]

// Get user selection
var dst = parseInt(document.getElementById('dataset').value);
var variable = parseInt(document.getElementById('variable').value);
var level = parseInt(document.getElementById('depth').value);
var req_time = parseInt(document.getElementById('daterange').value);
var lowval = parseFloat(document.getElementById('lowval').value);
var highval = parseFloat(document.getElementById('highval').value);
var clim = parseInt(document.getElementById('climatology').value);

//init user selection dict
user_selection = {
  'dataset': dataset_config[dst]['name'], 'variable': dataset_config[dst]['vars'][variable], 'depth': dataset_config[dst]['levels'][level],
  'time': dataset_config[dst]['daterange'][req_time], 'lowval': lowval, 'highval': highval, 'climatology': dataset_config[clim]['name']
};
//TEST STORE VAR
// var datae;

// this function is called by the UPDATE button
function updateMap() {

  map.spin(false);
  // loader
  map.spin(true, { lines: 8, length: 30, width: 13, radius: 20, scale: 0.5, color: 'black' })

  // clear overlay
  if (islayed == true) {
    layerControl.removeLayer(wms_layer);
    map.removeLayer(wms_layer);
    document.getElementById("colorbar").innerHTML = "";
  }

  // Get user selection
  dst = parseInt(document.getElementById('dataset').value);
  variable = parseInt(document.getElementById('variable').value);
  level = parseInt(document.getElementById('depth').value);
  req_time = parseInt(document.getElementById('daterange').value);
  lowval = parseFloat(document.getElementById('lowval').value);
  highval = parseFloat(document.getElementById('highval').value);
  clim = parseInt(document.getElementById('climatology').value);

  user_selection = {
    'dataset': dataset_config[dst]['name'], 'variable': dataset_config[dst]['vars'][variable], 'depth': dataset_config[dst]['levels'][level],
    'time': dataset_config[dst]['daterange'][req_time], 'lowval': lowval, 'highval': highval, 'climatology': dataset_config[clim]['name']
  };

  // var parser = new ol.format.WMTSCapabilities();
  // var GetCapURL = 'https://wmts.marine.copernicus.eu/teroWmts/'+dataset_config[dst]['layer']+'?SERVICE=WMTS&version=1.0.0&REQUEST=GetCapabilities'
  // console.log(GetCapURL);

  //   $.ajax({    
  //     url: GetCapURL,
  //     dataType: "xml",
  //     success: function(data) {
  //         console.log(data);
  //         var result = parser.read(data);
  //         datae = result;
  //     }
  // });

  //WMTS LAYER (CMEMS)
  if (dataset_config[dst]['name'] == 'ISAS-NRT') {

    if (isNaN(lowval) || isNaN(highval) || (lowval > highval)) {
      var wmts_template =
        dataset_config[dst]['url'] + 'SERVICE=WMTS&REQUEST=GetTile&VERSION=&LAYER={layer}&FORMAT=image/png&TILEMATRIXSET={tileMatrixSet}&TILEMATRIX={z}&time={time}&elevation={elevation}&TILEROW={y}&TILECOL={x}'
      wms_layer = L.tileLayer(wmts_template, {
        layer: dataset_config[dst]['layer'] + '/' + dataset_config[dst]['vars'][variable],
        tileMatrixSet: 'EPSG:3857@2x',
        time: dataset_config[dst]['daterange'][req_time],
        elevation: String(dataset_config[dst]['levels'][level]),
        noWrap: true
      }).addTo(map);
      wms_layer.bringToFront();
    }
    else {
      var wmts_template =
        dataset_config[dst]['url'] + 'SERVICE=WMTS&REQUEST=GetTile&VERSION=&LAYER={layer}&FORMAT=image/png&TILEMATRIXSET={tileMatrixSet}&TILEMATRIX={z}&time={time}&elevation={elevation}&TILEROW={y}&TILECOL={x}&style=noClamp,range:{minvalue}/{maxvalue}'
      wms_layer = L.tileLayer(wmts_template, {
        layer: dataset_config[dst]['layer'] + '/' + dataset_config[dst]['vars'][variable],
        tileMatrixSet: 'EPSG:3857@2x',
        time: dataset_config[dst]['daterange'][req_time],
        elevation: String(dataset_config[dst]['levels'][level]),
        minvalue: lowval,
        maxvalue: highval,
        noWrap: true
      }).addTo(map);
      wms_layer.bringToFront();
    }

  }
  else {
    //WMS LAYER   
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
  }
  //spin 
  wms_layer.on('loading tileloadstart', function (e) {
    map.spin(true, { lines: 8, length: 30, width: 13, radius: 20, scale: 0.5, color: 'black' });
  });

  //loaded
  wms_layer.on('load tileerror tileabort tileunload tileload', function (e) {
    map.spin(false);
  });

  layerControl.addOverlay(wms_layer, "User request")
  islayed = true;
}

//map creation func : basemap tiles, zoom bounds
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
    layers: [Esri_WorldImagery]
  });

  var layerControl = L.control.layers(baseLayers);
  layerControl.addTo(map);

  map.setView([32, -36], 3);
  L.control.mousePosition().addTo(map);

  //add button
  L.easyButton('fa-crosshairs fa-lg', function (btn, map) {
    GetFeatureMarker();
  }).addTo(map);

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
var TS_Marker = new L.marker();
var PR_Marker = new L.marker();
var GF_Marker = new L.marker();
var winc_list = {};
var winc_divlist = {};

//called by the "draw point" button in time serie menu
function coords_timeserie() {
  clicked = 1;
  $('.leaflet-container').css('cursor', 'crosshair');
}

//called by the "draw point" button in profile menu
function coords_profile() {
  clicked = 2;
  $('.leaflet-container').css('cursor', 'crosshair');
}

//called by the "draw rectangle" button in snapshot menu
function coords_snapshot() {
  clicked = 3;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

//called by the "draw line" button in section menu
function coords_section() {
  clicked = 4;
  $('.leaflet-container').css('cursor', 'crosshair');
  map.fireEvent('click');
}

//called by the getvalue button on map
function GetFeatureMarker() {
  clicked = 5;
  $('.leaflet-container').css('cursor', 'crosshair');
}

//clear all inputs
function clear_ip() {
  tempLayer.clearLayers();
  document.getElementById('ts_lo0').value = "";
  document.getElementById('ts_la0').value = "";
  document.getElementById('pr_lo0').value = "";
  document.getElementById('pr_la0').value = "";
  document.getElementById('sn_lo0').value = "";
  document.getElementById('sn_la0').value = "";
  document.getElementById('sn_lo1').value = "";
  document.getElementById('sn_la1').value = "";
  document.getElementById('se_lo0').value = "";
  document.getElementById('se_la0').value = "";
  document.getElementById('se_lo1').value = "";
  document.getElementById('se_la1').value = "";
  prefill = 0;
  tempLayer.clearLayers();
}

//"click on map" management, regarding what button we clicked before
map.on('click', function (e) {

  if (clicked == 1) {
    //set values of inputs for time serie
    var nlat = e.latlng.lat;
    var nlon = outlon(e.latlng.lng);
    document.getElementById('ts_lo0').value = nlon;
    document.getElementById('ts_la0').value = nlat;
    //marker    
    TS_Marker.setLatLng([nlat, nlon]);
    TS_Marker.addTo(tempLayer);
    //pan
    map.panTo([nlat, nlon]);
    //reset clicked
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 2) {
    //set values of inputs for profile
    var nlat = e.latlng.lat;
    var nlon = outlon(e.latlng.lng);
    document.getElementById('pr_lo0').value = nlon;
    document.getElementById('pr_la0').value = nlat;
    //marker
    PR_Marker.setLatLng([nlat, nlon]);
    PR_Marker.addTo(tempLayer);
    //pan
    map.panTo([nlat, nlon]);
    //reset clicked
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
  else if (clicked == 3) {
    //enable rectable drawing for snapshot
    RectDrawer.enable();
  }
  else if (clicked == 4) {
    //enable line drawing for section
    LineDrawer.enable();
  }
  else if (clicked == 5) {
    //setMarker
    var nlat = e.latlng.lat;
    var nlon = outlon(e.latlng.lng);
    if (dst == 7) {
      // for isas nrt : retrieveWmtsValueFromLatLon
      var layer = dataset_config[dst]['layer'] + '/' + dataset_config[dst]['vars'][variable];
      var baseUrl = dataset_config[dst]['url'];
      var time = dataset_config[dst]['daterange'][req_time];
      var elevation = dataset_config[dst]['levels'][level];
      var feature_info = '';
      GF_Marker.setLatLng([nlat, nlon]);
      const run = async () => {
        feature_info = await retrieveWmtsValueFromLatLon(baseUrl, nlat, nlon, layer, time, elevation);
        //console.log(feature_info);
        GF_Marker.bindPopup(feature_info.value.toFixed(2) + ' ' + feature_info.units.toString());
        GF_Marker.getPopup().on('close', function () {
          tempLayer.clearLayers();
        });
        GF_Marker.addTo(tempLayer);
        GF_Marker.openPopup();
      };
      run();
    }
    //reset clicked
    $('.leaflet-container').css('cursor', '');
    clicked = 0;
  }
});

//map drawing management for rectangle & line
map.on('draw:created', function (e) {

  layer = e.layer;
  layer.addTo(tempLayer);
  var coords = layer.getLatLngs();

  if (clicked == 3) {

    //set values of inputs for snapshot
    var nlon0 = outlon(coords[0]['lng']);
    var nlon1 = outlon(coords[2]['lng']);
    var nlat0 = coords[0]['lat'];
    var nlat1 = coords[2]['lat'];

    document.getElementById('sn_lo0').value = nlon0;
    document.getElementById('sn_lo1').value = nlon1;
    document.getElementById('sn_la0').value = nlat0;
    document.getElementById('sn_la1').value = nlat1;

  }
  else if (clicked == 4) {
    //set values of inputs for section, sorting the line by longitude

    if (coords[0]['lng'] < coords[1]['lng']) {
      var nlon0 = outlon(coords[0]['lng']);
      var nlon1 = outlon(coords[1]['lng']);
      var nlat0 = coords[0]['lat'];
      var nlat1 = coords[1]['lat'];
    }
    else {
      var nlon0 = outlon(coords[1]['lng']);
      var nlon1 = outlon(coords[0]['lng']);
      var nlat0 = coords[1]['lat'];
      var nlat1 = coords[0]['lat'];
    }

    document.getElementById('se_lo0').value = nlon0;
    document.getElementById('se_lo1').value = nlon1;
    document.getElementById('se_la0').value = nlat0;
    document.getElementById('se_la1').value = nlat1;
  }

  $('.leaflet-container').css('cursor', '');
  clicked = 0;
});

//predefined region by clicking on the globe
function prefill_snapshot() {

  tempLayer.clearLayers();

  //set values of inputs
  document.getElementById('sn_lo0').value = regions[prefill][0];
  if (regions[prefill][1] <= 180) {
    document.getElementById('sn_lo1').value = regions[prefill][1];
  }
  else {
    document.getElementById('sn_lo1').value = regions[prefill][1] - 360;
  }
  document.getElementById('sn_la0').value = regions[prefill][2];
  document.getElementById('sn_la1').value = regions[prefill][3];
  //draw temp layer
  var rectangle = L.rectangle([[regions[prefill][2], regions[prefill][0]],
  [regions[prefill][3], regions[prefill][1]]],
    { color: '#6f42c1', weight: 1 }).addTo(tempLayer);

  //increment onto the next predefined region
  prefill = prefill < regions.length - 1 ? prefill + 1 : 0;
}


function gen_img(clicked) {

  //get inputs
  if (clicked == 1) {
    var lat0 = parseFloat(document.getElementById('ts_la0').value);
    var lon0 = parseFloat(document.getElementById('ts_lo0').value);
    var lat1 = parseFloat(document.getElementById('ts_la0').value);
    var lon1 = parseFloat(document.getElementById('ts_lo0').value);
    var ano = document.getElementById('ts_ano').checked == true ? 1 : 0;
  }
  else if (clicked == 2) {
    var lat0 = parseFloat(document.getElementById('pr_la0').value);
    var lon0 = parseFloat(document.getElementById('pr_lo0').value);
    var lat1 = parseFloat(document.getElementById('pr_la0').value);
    var lon1 = parseFloat(document.getElementById('pr_lo0').value);
    var ano = document.getElementById('pr_ano').checked == true ? 1 : 0;
  }
  else if (clicked == 3) {
    var lat0 = parseFloat(document.getElementById('sn_la0').value);
    var lon0 = parseFloat(document.getElementById('sn_lo0').value);
    var lat1 = parseFloat(document.getElementById('sn_la1').value);
    var lon1 = parseFloat(document.getElementById('sn_lo1').value);
    var ano = document.getElementById('sn_ano').checked == true ? 1 : 0;
  }
  else if (clicked == 4) {
    var lat0 = parseFloat(document.getElementById('se_la0').value);
    var lon0 = parseFloat(document.getElementById('se_lo0').value);
    var lat1 = parseFloat(document.getElementById('se_la1').value);
    var lon1 = parseFloat(document.getElementById('se_lo1').value);
    var ano = document.getElementById('se_ano').checked == true ? 1 : 0;
  }

  //CLEAR TEMPLAYER (for markers only)
  tempLayer.clearLayers();

  //CREATE ONESHOTNAME : a random id so that the plot (window obj) is handled individually
  var oneshotname = "l" + (Math.floor(Math.random() * 1e6)).toString();
  window[oneshotname] = L.layerGroup().addTo(map);

  //CREATE WINDOW OBJ
  winc_list[oneshotname] = L.control.window(map, { title: '', position: 'left', modal: false }).on('hide', function () {
    window[oneshotname].clearLayers();
    //When closing the window, we also need to remove the div element  
    winc_divlist[oneshotname].remove();
    //removing from dict
    delete winc_divlist[oneshotname];
    delete winc_list[oneshotname];
  });

  //store winc element in a dict with unique key, so it can be delete in the above func
  mapd = document.getElementById('map');
  winc_divlist[oneshotname] = mapd.lastElementChild;

  //MARKER FOR POINT OPERATIONS
  if (clicked < 3) {
    var marker = L.marker([(lat0 + lat1) / 2, (lon0 + lon1) / 2]).addTo(window[oneshotname]);
  }

  //RECTANGLE FOR SNAPSHOT
  if (clicked == 3) {
    if (lon0 < lon1) {
      var rectangle = L.rectangle([[lat0, lon0], [lat1, lon1]], { color: 'Red', weight: 1 }).addTo(window[oneshotname]);
      map.panTo([(lat0 + lat1) / 2, (lon0 + lon1) / 2]);
    }
    else { //crossing meridian
      var rectangle = L.rectangle([[lat0, lon0], [lat1, lon1 + 360]], { color: 'Red', weight: 1 }).addTo(window[oneshotname]);
      map.panTo([(lat0 + lat1) / 2, (lon0 + lon1 + 360) / 2]);
    }

  }

  //LINE FOR SECTION
  if (clicked == 4) {
    if (lon0 < lon1) {
      var line = L.polyline([[lat0, lon0], [lat1, lon1]], { color: 'Red' }).addTo(window[oneshotname]);
      map.panTo([(lat0 + lat1) / 2, (lon0 + lon1) / 2]);
    }
    else { //crossing meridian
      var line = L.polyline([[lat0, lon0], [lat1, lon1 + 360]], { color: 'Red' }).addTo(window[oneshotname]);
      map.panTo([(lat0 + lat1) / 2, (lon0 + lon1 + 360) / 2]);
    }
  }

  //SET WINDOW CONTENT
  winc_list[oneshotname].content("<div id='img_div'><center><div class=\"lds-dual-ring\"></div></center></div>");

  //TITLE
  if (clicked == 1) {
    winc_list[oneshotname].title("<a style=\"font-size:20px; font-weight:bold;\">" + lat0.toFixed(2) + ',' + lon0.toFixed(2) + " / " + user_selection['depth'].toString() + "m</a>");
  }
  else if (clicked == 2) {
    winc_list[oneshotname].title("<a style=\"font-size:20px; font-weight:bold;\">" + lat0.toFixed(2) + ',' + lon0.toFixed(2) + " / " + user_selection['time'].substr(0, 10) + "</a>");
  }
  else if (clicked == 3) {
    winc_list[oneshotname].title("<a style=\"font-size:20px; font-weight:bold;\">" + user_selection['time'].substr(0, 10) +
      ' / ' + user_selection['depth'].toString() + "m</a>");
  }
  else if (clicked == 4) {
    winc_list[oneshotname].title("<a style=\"font-size:20px; font-weight:bold;\">" + user_selection['time'].substr(0, 10) + "</a>");
  }

  winc_list[oneshotname].show();

  reqstring = 'lat0=' + lat0.toString() + '&lon0=' + lon0.toString() +
    '&lat1=' + lat1.toString() + '&lon1=' + lon1.toString() +
    '&operation=' + clicked.toString() + '&anomaly=' + ano.toString() + '&dataset=' + user_selection['dataset'] +
    '&variable=' + user_selection['variable'] + '&depth=' + user_selection['depth'].toString() +
    '&time=' + user_selection['time'] + '&lowval=' + user_selection['lowval'].toString() +
    '&highval=' + user_selection['highval'].toString() + '&clim=' + user_selection['climatology']

  //FLASK REQUEST
  $.ajax({
    type: "GET",
    url: window.location.href + '/get_img',
    data: reqstring,
    contentType: 'application/json;charset=UTF-8',
    success: function (data) {
      dataarray = JSON.parse(data)
      // EDIT IMG WINDOW (Add clim inputs for map plots)
      clim_input = "<a style=\"margin-left: 10px; float: left;\">Color range :</a>" +
        "<input type=\"number\" id=\"lowval2_" + oneshotname + "\" name=\"lowval2\" style=\"width:70px; margin-left: 10px; float: left;\">" +
        "<input type=\"number\" id=\"highval2_" + oneshotname + "\" name=\"highval2\" style=\"width:70px; margin-left: 10px; float:left;\">" +
        "<input type=\"button\" id=\"Redraw_" + oneshotname + "\" value=\"Redraw\" style=\"width:60px; margin-left: 10px;\" />";

      if ([3, 7, 4, 8].includes(clicked)) {
        winc_list[oneshotname].content("<img src=\"" + dataarray + "\" alt=\"img\"></img><br>" + clim_input);
        redraw_button = document.getElementById("Redraw_" + oneshotname);
        redraw_button.cparam = reqstring;
        redraw_button.rid = oneshotname;
        redraw_button.addEventListener("click", redrawMap, false);
      }
      else {
        winc_list[oneshotname].content("<img src=\"" + dataarray + "\" alt=\"img\"></img>");
      }

    }
  });

  //Called by the "redraw" button inside of a plot
  function redrawMap(e) {
    reqstring1 = e.target.cparam;
    oneshotname1 = e.target.rid;
    //parsing reqstring
    to_parse = new URL("http://toto.fr/?" + reqstring1);
    plat0 = parseFloat(to_parse.searchParams.get("lat0"));
    plon0 = parseFloat(to_parse.searchParams.get("lon0"));
    plat1 = parseFloat(to_parse.searchParams.get("lat1"));
    plon1 = parseFloat(to_parse.searchParams.get("lon1"));
    pclicked = parseInt(to_parse.searchParams.get("operation"));
    panomaly = parseInt(to_parse.searchParams.get("anomaly"));
    pdataset = to_parse.searchParams.get("dataset");
    pvariable = to_parse.searchParams.get("variable");
    pdepth = parseFloat(to_parse.searchParams.get("depth"));
    ptime = to_parse.searchParams.get("time");

    //Get new color range
    lowval2 = parseFloat(document.getElementById('lowval2_' + oneshotname1).value);
    highval2 = parseFloat(document.getElementById('highval2_' + oneshotname1).value);

    //climato
    pclim = to_parse.searchParams.get("clim");

    // New reqstring 
    if (isNaN(lowval2) || isNaN(highval2) || (lowval2 > highval2)) {
      reqstring2 = reqstring1;
    }
    else {
      reqstring2 = 'lat0=' + plat0.toString() + '&lon0=' + plon0.toString() +
        '&lat1=' + plat1.toString() + '&lon1=' + plon1.toString() +
        '&operation=' + clicked.toString() + '&anomaly=' + ano.toString() + '&dataset=' + pdataset +
        '&variable=' + pvariable + '&depth=' + pdepth.toString() +
        '&time=' + ptime + '&lowval=' + lowval2.toString() +
        '&highval=' + highval2.toString() + '&clim=' + pclim
    }

    //Loading
    winc_list[oneshotname1].content("<div id='img_div'><center><div class=\"lds-dual-ring\"></div></center></div>");

    //Re run the ajax call for /get_img and reset winc content
    $.ajax({
      type: "GET",
      url: window.location.href + '/get_img',
      data: reqstring2,
      contentType: 'application/json;charset=UTF-8',
      success: function (data) {
        dataarray = JSON.parse(data)
        // EDIT IMG WINDOW (Add clim inputs for map plots)
        clim_input = "<a style=\"margin-left: 10px; float: left;\">Color range :</a>" +
          "<input type=\"number\" id=\"lowval2_" + oneshotname1 + "\" name=\"lowval2\" style=\"width:70px; margin-left: 10px; float: left;\">" +
          "<input type=\"number\" id=\"highval2_" + oneshotname1 + "\" name=\"highval2\" style=\"width:70px; margin-left: 10px; float:left;\">" +
          "<input type=\"button\" id=\"Redraw_" + oneshotname1 + "\" value=\"Redraw\" style=\"width:60px; margin-left: 10px;\" />";

        if ([3, 7, 4, 8].includes(pclicked)) {
          winc_list[oneshotname1].content("<img src=\"" + dataarray + "\" alt=\"img\"></img><br>" + clim_input);
          redraw_button = document.getElementById("Redraw_" + oneshotname1);
          redraw_button.cparam = reqstring2;
          redraw_button.rid = oneshotname1;
          redraw_button.addEventListener("click", redrawMap, false);
        }
        else {
          winc_list[oneshotname1].content("<img src=\"" + dataarray + "\" alt=\"img\"></img>");
        }

      }
    });
  }
}

//The JavaScript Modulo Bug (https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm)
function mod(n, m) {
  return ((n % m) + m) % m;
}

//longitude between -180/180
function outlon(lon) {
  if (Math.abs(lon) > 180) {
    return lon > 0 ? mod(lon, 360) - 360 : mod(lon, 360);
  }
  else {
    return lon
  }
}

const latLonToTileEPSG4326 = (lat, lon, zoom) => {
  const constrainedLat = Math.max(-89.999999, lat); // Constrain lat within (-90, 90]
  const constrainedLon = lon === 180 ? 179.999999 : lon; // Constrain lon to be < 180

  // Define bounds in EPSG:4326
  const minLat = -90;
  const maxLat = 90;
  const minLon = -180;
  const maxLon = 180;

  // Number of tiles at this zoom level
  const tileCountX = Math.pow(2, zoom + 1);
  const tileCountY = Math.pow(2, zoom);

  // Calculate tile width and height in terms of lat/lon degrees
  const tileWidth = (maxLon - minLon) / tileCountX; // 360 degrees / 2^(zoom+1)
  const tileHeight = (maxLat - minLat) / tileCountY; // 180 degrees / 2^zoom

  // Calculate tile index
  const tileX = Math.floor((constrainedLon - minLon) / tileWidth);
  const tileY = Math.floor((maxLat - constrainedLat) / tileHeight);

  // Pixel position within the tile (256x256 pixels)
  const pixelX = Math.floor(
    (((constrainedLon - minLon) % tileWidth) / tileWidth) * 256
  );
  const pixelY = Math.floor(
    (((maxLat - constrainedLat) % tileHeight) / tileHeight) * 256
  );

  return {
    tileX,
    tileY,
    pixelX,
    pixelY,
  };
};

const retrieveWmtsValueFromLatLon = async (
  baseUrl,
  lat,
  lon,
  layer,
  time,
  elevation
) => {

  // Use the highest zoom level possible for best precision
  const zoom = 10;

  const { tileX, tileY, pixelX, pixelY } = latLonToTileEPSG4326(lat, lon, zoom);

  const url = `${baseUrl}?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=${layer}&INFOFORMAT=application/json&TILEMATRIXSET=EPSG:4326&TILEMATRIX=${zoom}&TILEROW=${tileY}&TILECOL=${tileX}&I=${pixelX}&J=${pixelY}&elevation=${elevation}&time=${time}`;
  console.log(url);

  const res = await fetch(url);
  const info = await res.json();

  return info.features[0].properties;
};

const retrieveWmsValueFromLatLon = async (
  baseUrl,
  lat,
  lon,
  layer,
  time,
  elevation
) => {
  var parameters = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: layer,
    query_layers: layer,
    time: time,
    elevation: elevation,
    info_format: 'text/xml',
    crs: 'EPSG:4326',
    width: 101,
    height: 101,
    i: 50,
    j: 50,
    bbox: (lat - 0.1) + ',' + (lon - 0.1) + ',' + (lat + 0.1) + ',' + (lon + 0.1)
  }
  url = baseUrl + L.Util.getParamString(parameters);
  console.log(url);

  const res = await fetch(url);
  console.log(res);
}