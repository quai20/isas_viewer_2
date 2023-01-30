#!/usr/bin/env python
#-*- coding: utf-8 -*-

from flask import Flask, request, jsonify, render_template
import ast, json
import numpy as np
import time

app = Flask(__name__)

@app.route("/")
def init_webpage():
    return render_template('index.html')

@app.route("/get_ts", methods=['POST','GET'])
def time_serie_route():
    lat = request.args.get('lat')
    lon = request.args.get('lon')           
    # call py func    
    return json.dumps("routed TS "+lat+"/"+lon)

@app.route("/get_prf", methods=['POST','GET'])
def profile_route():
    lat = request.args.get('lat')
    lon = request.args.get('lon')        
    # call py func    
    return json.dumps("routed PRF "+lat+"/"+lon)

@app.route("/get_snapshot", methods=['POST','GET'])
def snapshot_route():
    lat0 = request.args.get('lat0')
    lon0 = request.args.get('lon0')
    lat1 = request.args.get('lat1')
    lon1 = request.args.get('lon1')        
    # call py func    
    return json.dumps("routed SNAP "+lat0+"/"+lon0+" - "+lat1+"/"+lon1)

@app.route("/ano_ts", methods=['POST','GET'])
def ano_time_serie_route():
    lat = request.args.get('lat')
    lon = request.args.get('lon')        
    # call py func    
    return json.dumps("routed ANO TS "+lat+"/"+lon)

@app.route("/ano_prf", methods=['POST','GET'])
def ano_profile_route():
    lat = request.args.get('lat')
    lon = request.args.get('lon')        
    # call py func    
    return json.dumps("routed ANO PRF "+lat+"/"+lon)

@app.route("/ano_snapshot", methods=['POST','GET'])
def ano_snapshot_route():
    lat0 = request.args.get('lat0')
    lon0 = request.args.get('lon0')
    lat1 = request.args.get('lat1')
    lon1 = request.args.get('lon1')        
    # call py func    
    return json.dumps("routed ANO SNAP "+lat0+"/"+lon0+" - "+lat1+"/"+lon1)  

if __name__ == '__main__': 
    app.run()