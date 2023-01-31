#!/usr/bin/env python
#-*- coding: utf-8 -*-

from flask import Flask, request, jsonify, render_template
import ast, json
import numpy as np


app = Flask(__name__)

@app.route("/")
def init_webpage():
    return render_template('index.html')

@app.route("/get_img", methods=['POST','GET'])
def time_serie_route():
    lat0 = request.args.get('lat0')
    lon0 = request.args.get('lon0')
    lat1 = request.args.get('lat1')
    lon1 = request.args.get('lon1')          
    operation = request.args.get('operation')          

    user_selection =  request.args.get('user_selection')          
    # call py func & return path to img file or error message
    #    
    return json.dumps("routed call "+lat0+"/"+lon0+'/'+lat1+"/"+lon1+"- operation : "+operation+" - user selection : "+user_selection)

if __name__ == '__main__': 
    app.run()