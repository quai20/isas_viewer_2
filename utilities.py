#!/usr/bin/env python
#-*- coding: utf-8 -*-

from erddapy import ERDDAP
import xarray as xr
import matplotlib.pyplot as plt
import cartopy
import cartopy.crs as ccrs

def time_serie_on_point(lat,lon,dataset='ISAS13',variable='TEMP',depth=-1.0,):

    return None