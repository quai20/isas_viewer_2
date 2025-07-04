#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, render_template, url_for
import ast
import json
import numpy as np
import time
from utilities import *
import os, sys, glob, random, string

sub_uri = os.getenv("SUB_URI", "/")

app = Flask(__name__,
            static_url_path=f'{sub_uri}/static')

@app.route(f"{sub_uri}/")
def init_webpage():
    """landing page routing function

    Clear the image cache & clear the nc cache when it's over 200Mb
    Render the index.html template
    """        
    # Clean img dir if it's too big
    if (sum(os.path.getsize(f) for f in glob.glob('static/img/*.png'))/1e6 > 200):
        files_tbrm = glob.glob('static/img/*.png')
        for f in files_tbrm:
            os.remove(f)
    # Clean netcdf cache dir if dir too big
    if (sum(os.path.getsize(f) for f in glob.glob('static/nc_cache/*.nc'))/1e6 > 200):
        files_tbrn = glob.glob('static/nc_cache/*.nc')
        for f in files_tbrn:
            os.remove(f)
    # Render index
    return render_template('index.html')


@app.route(f"{sub_uri}/get_img", methods=['POST', 'GET'])
def gen_img_route():
    """routing function to generate an image

    Returns:
        json: path to generated img
    """
    lat0 = float(request.args.get('lat0'))
    lon0 = float(request.args.get('lon0'))
    lat1 = float(request.args.get('lat1'))
    lon1 = float(request.args.get('lon1'))
    operation = int(request.args.get('operation'))
    anomaly = int(request.args.get('anomaly'))
    dataset = request.args.get('dataset')
    variable = request.args.get('variable')
    depth = float(request.args.get('depth'))
    date = request.args.get('time')
    clim = request.args.get('clim')
    rd = int(request.args.get('rd'))
    try:
        lowval = float(request.args.get('lowval'))
        highval = float(request.args.get('highval'))
        if(np.isnan(lowval)):
            lowval = None
        if(np.isnan(highval)):
            highval = None
    except:
        lowval = None
        highval = None

    # tests on operation
    if (operation == 1):
        img_path = time_serie_on_point(lat0, lon0, dataset, variable, depth,anomaly, clim)
    elif (operation == 2):
        img_path = profile_on_point(lat0, lon0, dataset, variable, date,anomaly, clim)
    elif (operation == 3):
        img_path = snapshot(lat0, lon0, lat1, lon1, dataset,
                            variable, depth, date, lowval, highval,anomaly, clim, rd)
    elif (operation == 4):
        img_path = section(lat0, lon0, lat1, lon1, dataset,
                           variable, date, lowval, highval,anomaly, clim, rd)    
    else:
        img_path = url_for("static", filename='dist/unavailable.png')

    return json.dumps(img_path)

@app.route(f"{sub_uri}/help")
def help():
    return render_template('helppage.html')

if __name__ == '__main__':
    app.run()
