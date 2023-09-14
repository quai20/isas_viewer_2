#!/usr/bin/env python
# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('agg')

import matplotlib.pyplot as plt
import cartopy
import cartopy.crs as ccrs
import cartopy.feature as cfeature
land_feature=cfeature.NaturalEarthFeature(category='physical',name='land',scale='50m',facecolor=[120/255, 108/255, 92/255])
from cartopy.geodesic import Geodesic
geode = Geodesic()
import xarray as xr
import pandas as pd
import numpy as np
import json
import os, sys, glob, time, requests

# Datasets configurations
jsonfile=open('static/dataset.json')
dataset_config = json.load(jsonfile)
# Grid, here we presume that it's the same for every product
grid = xr.open_dataset('static/isas_grid.nc')
lon_array = grid.longitude.values
lat_array = grid.latitude.values

def gen_filename(op, lat0, lon0, lat1, lon1, dataset, variable, depth, date, ptype):   
    """funtion that return a unique filename string 
    corresponding to the requests

    Args:
        op (int): operation id
        lat0 (float): latitude value
        lon0 (float): longitude value
        lat1 (float): latitude value
        lon1 (float): longitude value
        dataset (str): dataset name
        variable (str): variable name
        depth (float): depth value
        date (str): datetime
        ptype (int): anomaly var

    Returns:
        str: filename
    """
    operations = ['T','P','R','S']
    pfx = 'static/nc_cache/'    
    if(op==0):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%d'%depth)  
    elif(op==1):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, str(date)[:10])  
    elif(op==2):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%.2f'%lat1, '%.2f'%lon1, '%d'%depth, str(date)[:10])  
    else :
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%.2f'%lat1, '%.2f'%lon1, str(date)[:10]) 
    return pfx + '_'.join(params) + '.nc'   

def gen_figname(op, lat0, lon0, lat1, lon1, dataset, variable, depth, date, ptype, lowval, highval):   
    """funtion that return a unique filename string 
    corresponding to the requests

    Args:
        op (int): operation id
        lat0 (float): latitude value
        lon0 (float): longitude value
        lat1 (float): latitude value
        lon1 (float): longitude value
        dataset (str): dataset name
        variable (str): variable name
        depth (float): depth value
        date (str): datetime
        ptype (int): anomaly var
        lowval (float) : clim low
        highval (float): clim high

    Returns:
        str: filename
    """
    operations = ['T','P','R','S']
    pfx = 'static/img/'
    if lowval==None:
        lowval=0
    if highval==None:
        highval=0
    
    if(op==0):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%d'%depth)  
    elif(op==1):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, str(date)[:10])  
    elif(op==2):
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%.2f'%lat1, '%.2f'%lon1, '%d'%depth, str(date)[:10], '%.1f'%lowval, '%.1f'%highval)  
    else :
        params = (operations[op], dataset, str(ptype) , variable, '%.2f'%lat0, '%.2f'%lon0, '%.2f'%lat1, '%.2f'%lon1, str(date)[:10], '%.1f'%lowval, '%.1f'%highval) 
    return pfx + '_'.join(params) + '.png' 

def open_dap_ds(ix,decode_times=True):
    """return the xarray dataset from opendap request
    for cmems, it uses MOTU env var

    Args:
        ix (int): dataset id
        decode_times (bool, optional): Defaults to True.

    Returns:
        xr.Dataset: xarray dataset, lazy dap
    """
    if (dataset_config[ix]['credentials']):
        #open with cmems cred
        user = os.environ['MOTU_USERNAME']
        password = os.environ['MOTU_PASSWORD']
        session = requests.Session()
        session.auth = (user, password)
        root = dataset_config[ix]['opendap']
        store = xr.backends.PydapDataStore.open(root, session=session)
        ds = xr.open_dataset(store,decode_times=decode_times)
    else:
        ds = xr.open_dataset(dataset_config[ix]['opendap'],decode_times=decode_times)
    return ds

def time_serie_on_point(lat, lon, dataset, variable, depth,ptype, clim):    
    """plot time series

    Args:
        lat (float): Latitude value
        lon (float): Longitude value
        dataset (str): dataset name
        variable (str): variable name
        depth (float): depth value
        ptype (int): anomaly var
        clim (str): name of the climatology

    Returns:
        str: plot image filename
    """        

    # Saving netcdf in cache dir    
    nc_filename = gen_filename(0, lat, lon, None, None, dataset, variable, depth, None, ptype)

    # Gen random img filename
    png_filename = gen_figname(0, lat, lon, None, None, dataset, variable, depth, None, ptype, None, None)

    if (os.path.exists(nc_filename)):
        ds = xr.open_dataset(nc_filename)
        if (ptype==1):
            ylabel=variable+' anomaly'
        else:
            ylabel=variable
    else :               
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)        
        
        if (ptype==1):           
            iz = [clim==dataset_config[i]['name'] for i in range(len(dataset_config))]
            iz = np.argmax(iz)      
            if(variable in dataset_config[iz]['vars']):                            
                dsa = open_dap_ds(iz,decode_times=False)
                dsa = dsa.sel(latitude=lat,longitude=lon,depth=np.abs(depth),method='nearest')
                dsa['time'] = np.arange(1,13)
                dsa = dsa.rename({'time':'month'})
                
                dsb = open_dap_ds(ix,decode_times=True)
                dsb = dsb.sel(latitude=lat,longitude=lon,depth=np.abs(depth),method='nearest')
                ds = dsb.groupby('time.month') - dsa    
                ylabel=variable+' anomaly'           
            else:
                return "static/dist/unavailable.png"
        else :
            ds = open_dap_ds(ix,decode_times=True)
            ds = ds.sel(latitude=lat,longitude=lon,depth=np.abs(depth),method='nearest')
            ylabel=variable
        ds.to_netcdf(nc_filename)    

    my_dpi=100
    f,ax = plt.subplots(1,1,figsize=(700/my_dpi, 250/my_dpi), dpi=my_dpi)
    ds[variable].plot(linewidth=2,ax=ax)        
    ax.set_title('')
    ax.set_ylabel(ylabel)
    ax.set_xlabel('')
    ax.grid(linestyle=':')

    plt.savefig(png_filename, bbox_inches='tight')    
    return png_filename


def profile_on_point(lat, lon, dataset, variable, date, ptype, clim):
    """plot profile

    Args:
        lat (float): Latitude value
        lon (float): Longitude value
        dataset (str): dataset name
        variable (str): variable name
        date (str): datetime
        ptype (int): anomaly var
        clim (str): name of the climatology

    Returns:
        str: plot image filename
    """        
    
    nc_filename = gen_filename(1, lat, lon, None, None, dataset, variable, None, date, ptype)

    png_filename = gen_figname(1, lat, lon, None, None, dataset, variable, None, date, ptype, None, None)
    
    if (os.path.exists(nc_filename)):
        ds = xr.open_dataset(nc_filename)
        if (ptype==1):
            xlabel=variable+' anomaly'
        else:
            xlabel=variable
    else:
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)                        
        month_index = pd.to_datetime(np.datetime64(date)).month - 1       

        if (ptype==1):
            iz = [clim==dataset_config[i]['name'] for i in range(len(dataset_config))]
            iz = np.argmax(iz)
            if (variable in dataset_config[iz]['vars']):                
                dsa = open_dap_ds(iz,decode_times=False)
                dsa = dsa.sel(latitude=lat,longitude=lon,method='nearest').isel(time=month_index).squeeze()                
                
                dsb = open_dap_ds(ix,decode_times=True)
                dsb = dsb.sel(latitude=lat,longitude=lon,time=np.datetime64(date),method='nearest').squeeze()
                ds = dsb - dsa                   
                xlabel=variable+' anomaly'
            else :
                return "static/dist/unavailable.png"
        else :                
            ds = open_dap_ds(ix,decode_times=True)
            ds = ds.sel(latitude=lat,longitude=lon,time=np.datetime64(date),method='nearest')
            xlabel = variable
        ds.to_netcdf(nc_filename) 
        
    my_dpi=100
    f,ax = plt.subplots(1,1,figsize=(250/my_dpi, 600/my_dpi), dpi=my_dpi)
    ds[variable].plot(linewidth=2,y='depth',ax=ax)    
    ax.set_title('')
    ax.set_xlabel(xlabel)    
    ax.grid(linestyle=':')
    ax.invert_yaxis()
    plt.savefig(png_filename, bbox_inches='tight')    

    return png_filename


def snapshot(lat0, lon0, lat1, lon1, dataset, variable, depth, date, lowval, highval, ptype, clim):
    """plot a region

    Args:
        lat0 (float): Latitude value
        lon0 (float): Longitude value
        lat1 (float): Latitude value
        lon1 (float): Longitude value
        dataset (str): dataset name
        variable (str): variable name
        depth (float): depth value
        date (str): datetime
        lowval (float): Color low limit
        highval (float): Color high limit
        ptype (int): anomaly var
        clim (str): name of the climatology

    Returns:
        str: plot image filename
    """
    
    nc_filename = gen_filename(2, lat0, lon0, lat1, lon1, dataset, variable, depth, date, ptype)
    
    png_filename = gen_figname(2, lat0, lon0, lat1, lon1, dataset, variable, depth, date, ptype, lowval, highval)
        
    if (os.path.exists(nc_filename)):
        ds = xr.open_dataset(nc_filename)
        if (ptype==1):
            clabel=variable+' anomaly'
        else:
            clabel=variable

    else:
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)        
        month_index = pd.to_datetime(np.datetime64(date)).month - 1  
        
        if (ptype==1):

            iz = [clim==dataset_config[i]['name'] for i in range(len(dataset_config))]
            iz = np.argmax(iz)
            if (variable in dataset_config[iz]['vars']):               

                dsa = open_dap_ds(iz,decode_times=False)
                if(lon0<lon1):
                    dsa = dsa.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,lon1)).sel(depth=np.abs(depth),method='nearest').isel(time=month_index).squeeze()                
                else: #crossing meridian
                    dsa_1 = dsa.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,180)).sel(depth=np.abs(depth),method='nearest').isel(time=month_index).squeeze()                
                    dsa_2 = dsa.sel(latitude=slice(lat0,lat1),longitude=slice(-180,lon1)).sel(depth=np.abs(depth),method='nearest').isel(time=month_index).squeeze()                
                    dsa_2['longitude'] = dsa_2['longitude']+360
                    dsa = xr.concat([dsa_1,dsa_2],dim='longitude')

                dsb = open_dap_ds(ix,decode_times=True)    
                if(lon0<lon1):
                    dsb = dsb.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,lon1)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest').squeeze()                                
                else : #crossing meridian
                    dsb_1 = dsb.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,180)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest').squeeze()                                
                    dsb_2 = dsb.sel(latitude=slice(lat0,lat1),longitude=slice(-180,lon1)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest').squeeze()                                
                    dsb_2['longitude'] = dsb_2['longitude']+360
                    dsb = xr.concat([dsb_1,dsb_2],dim='longitude')
                ds = dsb - dsa
                clabel=variable+' anomaly'
            else :
                return "static/dist/unavailable.png"
        else :            
            ds = open_dap_ds(ix,decode_times=True)    
            if(lon0<lon1):
                ds = ds.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,lon1)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest')
            else: #crossing meridian
                ds_1 = ds.sel(latitude=slice(lat0,lat1),longitude=slice(lon0,180)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest')
                ds_2 = ds.sel(latitude=slice(lat0,lat1),longitude=slice(-180,lon1)).sel(depth=np.abs(depth),time=np.datetime64(date),method='nearest')
                ds_2['longitude']=ds_2['longitude']+360
                ds = xr.concat([ds_1,ds_2],dim='longitude')

            clabel=variable
        ds.to_netcdf(nc_filename)    

    fig = plt.figure(figsize=(9,9),dpi=100)
    if(lon0<lon1):
        ax = fig.add_subplot(1,1,1,projection=ccrs.Miller(central_longitude=0))    
    else:
        ax = fig.add_subplot(1,1,1,projection=ccrs.Miller(central_longitude=180))

    if((lowval==None)&(highval==None)):
        lowval = ds[variable].squeeze().min().values
        highval = ds[variable].squeeze().max().values

    ds[variable].squeeze().plot(cmap=plt.get_cmap('turbo'),vmin=lowval,vmax=highval,ax=ax,cbar_kwargs={'orientation':'horizontal','pad':0.05,'shrink':0.5,'label':clabel},transform=ccrs.PlateCarree())    
    #ds[variable].squeeze().plot.contourf(levels=50,cmap=plt.get_cmap('turbo'),vmin=lowval,vmax=highval,ax=ax,cbar_kwargs={'spacing':'uniform','orientation':'horizontal','pad':0.05,'shrink':0.5,'label':clabel},transform=ccrs.PlateCarree())    
    ax.set_title('')
    #ax.coastlines()   
    ax.add_feature(land_feature)
    gl = ax.gridlines(linestyle=':',draw_labels=True)
    gl.right_labels = None
    gl.top_labels = None
    
    plt.savefig(png_filename, bbox_inches='tight')
    return png_filename        

def section(lat0, lon0, lat1, lon1, dataset, variable, date, lowval, highval, ptype, clim):
    """plot vertical section

    Args:
        lat0 (float): Latitude value
        lon0 (float): Longitude value
        lat1 (float): Latitude value
        lon1 (float): Longitude value
        dataset (str): dataset name
        variable (str): variable name
        date (str): datetime
        lowval (float): Color low limit
        highval (float): Color high limit
        ptype (int): anomaly var
        clim (str) : name of the climatology

    Returns:
        str: plot image filename
    """
    
    nc_filename = gen_filename(3, lat0, lon0, lat1, lon1, dataset, variable, None, date, ptype)

    png_filename = gen_figname(3, lat0, lon0, lat1, lon1, dataset, variable, None, date, ptype, lowval, highval)
    
    if (os.path.exists(nc_filename)):
        ds = xr.open_dataset(nc_filename)
        if (ptype==1):
            clabel=variable+' anomaly'
        else:
            clabel=variable

    else:        
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)
        
        lat0f, lat1f, lon0f, lon1f = lat0, lat1, lon0, lon1
        if (lat0f>lat1f):
            lat0f,lat1f = lat1f,lat0f        
        lat0f=max(lat0f-1,-90)
        lat1f=min(lat1f+1,90)

        if(lon0f<lon1f):
            lon0f=max(lon0f-1,-180)
            lon1f=min(lon1f+1,180)
        else: #crossing meridian
            lon0f-=1
            lon1f+=1
        
        month_index = pd.to_datetime(np.datetime64(date)).month - 1  

        if (ptype==1):
            iz = [clim==dataset_config[i]['name'] for i in range(len(dataset_config))]
            iz = np.argmax(iz)

            if (variable in dataset_config[iz]['vars']):

                dsa = open_dap_ds(iz,decode_times=False)
                if(lon0f<lon1f):
                    dsa = dsa.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,lon1f)).isel(time=month_index).squeeze()                
                else: #crossing meridian
                    dsa_1 = dsa.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,180)).isel(time=month_index).squeeze()                
                    dsa_2 = dsa.sel(latitude=slice(lat0f,lat1f),longitude=slice(-180,lon1f)).isel(time=month_index).squeeze()                
                    dsa_2['longitude'] = dsa_2['longitude']+360
                    dsa = xr.concat([dsa_1,dsa_2],dim='longitude')

                dsb = open_dap_ds(ix,decode_times=True)    
                if(lon0f<lon1f):
                    dsb = dsb.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,lon1f)).sel(time=np.datetime64(date),method='nearest').squeeze()                                
                else : #crossing meridian
                    dsb_1 = dsb.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,180)).sel(time=np.datetime64(date),method='nearest').squeeze()                                
                    dsb_2 = dsb.sel(latitude=slice(lat0f,lat1f),longitude=slice(-180,lon1f)).sel(time=np.datetime64(date),method='nearest').squeeze()                                
                    dsb_2['longitude'] = dsb_2['longitude']+360
                    dsb = xr.concat([dsb_1,dsb_2],dim='longitude')
                ds = dsb - dsa

                clabel=variable+' anomaly'

            else :
                return "static/dist/unavailable.png"
        else :                
            ds = open_dap_ds(ix,decode_times=True)   
            if(lon0<lon1):
                ds = ds.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,lon1f)).sel(time=np.datetime64(date),method='nearest')
            else: #crossing meridian
                ds_1 = ds.sel(latitude=slice(lat0f,lat1f),longitude=slice(lon0f,180)).sel(time=np.datetime64(date),method='nearest')
                ds_2 = ds.sel(latitude=slice(lat0f,lat1f),longitude=slice(-180,lon1f)).sel(time=np.datetime64(date),method='nearest')
                ds_2['longitude']=ds_2['longitude']+360
                ds = xr.concat([ds_1,ds_2],dim='longitude')
            clabel=variable
        ds.to_netcdf(nc_filename)    
        
    if(lon0>lon1): #crossing meridian
        lon0b = lon0
        lon1b = lon1+360
    else:
        lon0b=lon0
        lon1b=lon1    

    #distance between points
    drt = geode.inverse((lon0b,lat0),(lon1b,lat1))    
    d = drt[0][0]
    #distance array
    distances = np.linspace(0,d,int(d/50000)) #step in meters, here 50km
    seclon_array = np.linspace(lon0b,lon1b,int(d/50000),endpoint=True)
    seclat_array = np.linspace(lat0,lat1,int(d/50000),endpoint=True)

    #2 dataarrays with new distance coordinate to interpolate ds on points (not grid)
    secx = xr.DataArray(seclon_array, coords={"distance":distances/1e3})
    secy = xr.DataArray(seclat_array, coords={"distance":distances/1e3})
    dsi = ds.interp(longitude=secx,latitude=secy)
        
    my_dpi=100
    f,ax = plt.subplots(1,1,figsize=(900/my_dpi, 350/my_dpi), dpi=my_dpi) 
    
    if((lowval==None)&(highval==None)):
        lowval = dsi[variable].squeeze().min().values
        highval = dsi[variable].squeeze().max().values

    dsi[variable].squeeze().plot(y='depth',cmap=plt.get_cmap('turbo'),cbar_kwargs={'shrink':0.8,'label':clabel},ax=ax,vmin=lowval,vmax=highval)
    #dsi[variable].squeeze().plot.contourf(levels=50,y='depth',cmap=plt.get_cmap('turbo'),cbar_kwargs={'shrink':0.8,'label':clabel},ax=ax,vmin=lowval,vmax=highval)
    ax.set_title('')                
    ax.grid(linestyle=':')
    ax.invert_yaxis()
    ax.set_xlabel('distance along section (km)')
    plt.savefig(png_filename, bbox_inches='tight')
    return png_filename       
