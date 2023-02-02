#!/usr/bin/env python
#-*- coding: utf-8 -*-

from flask import Flask, request, jsonify, render_template, url_for
import ast, json
import numpy as np
import time
from utilities import *
import sys

app = Flask(__name__)

@app.route("/")
def init_webpage():
    """landing page routing function

    Render the index.html template
    """
    # Should do a cleanup of the /static/img dir
    return render_template('index.html')

@app.route("/get_img", methods=['POST','GET'])
def gen_img_route():
    """rounting function to generate an image

    Returns:
        json: path to generated img
    """
    lat0 = float(request.args.get('lat0'))
    lon0 = float(request.args.get('lon0'))
    lat1 = float(request.args.get('lat1'))
    lon1 = float(request.args.get('lon1'))
    operation = int(request.args.get('operation'))
    dataset = request.args.get('dataset')
    variable = request.args.get('variable')
    depth = float(request.args.get('depth'))
    date = request.args.get('time')
    try :
        lowval = float(request.args.get('lowval'))
        highval = float(request.args.get('highval'))
    except :
        lowval = None
        highval = None    
        
    # test on operation
    if (operation == 1):
        img_path = time_serie_on_point(lat0,lon0,dataset,variable,depth)          
    elif (operation==2):
        img_path = profile_on_point(lat0,lon0,dataset,variable,date)          
    else :
        img_path = url_for("static", filename='dist/unavailable.png')

    return json.dumps(img_path)    

if __name__ == '__main__': 
    app.run()