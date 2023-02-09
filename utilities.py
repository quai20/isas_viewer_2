#!/usr/bin/env python
# -*- coding: utf-8 -*-

from erddapy import ERDDAP
import matplotlib.pyplot as plt
import cartopy
import cartopy.crs as ccrs
import cartopy.feature as cfeature
land_feature=cfeature.NaturalEarthFeature(category='physical',name='land',scale='50m',facecolor=[120/255, 108/255, 92/255])
from cartopy.geodesic import Geodesic
geode = Geodesic()
import xarray as xr
import numpy as np
import json
import os, sys, glob

# Datasets configurations
jsonfile=open('static/dataset.json')
dataset_config = json.load(jsonfile)
# Grid, here we presume that it's the same for every product
grid = xr.open_dataset('static/isas_grid.nc')
lon_array = grid.longitude.values
lat_array = grid.latitude.values

def time_serie_on_point(lat, lon, dataset, variable, depth,ptype):    
    """_summary_

    Args:
        lat (_type_): _description_
        lon (_type_): _description_
        dataset (_type_): _description_
        variable (_type_): _description_
        depth (_type_): _description_
        ptype (_type_): _description_

    Returns:
        _type_: _description_
    """    

    filename = 'static/img/'+dataset+'_'+variable+str(ptype)+'_'+str(depth)+'_'+'%.2f'%lat+'_%.2f'%lon+'.png'    

    if (os.path.exists(filename)):
        print("file already exists", file=sys.stdout)
    else:           

        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)
        depth_array = np.array(dataset_config[ix]['levels'])        
        time_array = np.array(dataset_config[ix]['daterange'],dtype='datetime64')
        lat_index = np.abs(lat_array-lat).argmin()
        lon_index = np.abs(lon_array-lon).argmin()
        dep_index = np.abs(depth_array-depth).argmin()
        
        if (ptype==1):
            if (('climato' in dataset_config[ix])):
                iz = [dataset_config[ix]['climato']==dataset_config[i]['name'] for i in range(len(dataset_config))]
                iz = np.argmax(iz)
                time_array_a = np.array(dataset_config[iz]['daterange'],dtype='datetime64')
                murla = dataset_config[iz]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[{dep_index}],time[0:1:{len(time_array_a)-1}],{variable}[0:1:{len(time_array_a)-1}][{dep_index}][{lat_index}][{lon_index}]"
                
                dsa = xr.open_dataset(murla,decode_times=True)
                dsa['time'] = np.arange(1,13)
                dsa = dsa.rename({'time':'month'})
                murlb = dataset_config[ix]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[{dep_index}],time[0:1:{len(time_array)-1}],{variable}[0:1:{len(time_array)-1}][{dep_index}][{lat_index}][{lon_index}]"
                dsb = xr.open_dataset(murlb,decode_times=True)
                ds = dsb.groupby('time.month') - dsa    
                ylabel=variable+' anomaly'
            else :
                return "static/dist/unavailable.png"
        else :
            murl = dataset_config[ix]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[{dep_index}],time[0:1:{len(time_array)-1}],{variable}[0:1:{len(time_array)-1}][{dep_index}][{lat_index}][{lon_index}]"
            ds = xr.open_dataset(murl,decode_times=True)
            ylabel=variable
    
        my_dpi=100
        f,ax = plt.subplots(1,1,figsize=(700/my_dpi, 250/my_dpi), dpi=my_dpi)
        ds[variable].plot(linewidth=2,ax=ax)    
        # ax.set_title(dataset+' - '+variable+' - '+str(depth)+' at '+'%.2f'%lat+'/%.2f'%lon,fontsize = 10)
        ax.set_title('')
        ax.set_ylabel(ylabel)
        ax.set_xlabel('')
        ax.grid(linestyle=':')

        plt.savefig(filename, bbox_inches='tight')    
    return filename


def profile_on_point(lat, lon, dataset, variable, date, ptype):
    """_summary_

    Args:
        lat (_type_): _description_
        lon (_type_): _description_
        dataset (_type_): _description_
        variable (_type_): _description_
        date (_type_): _description_
        ptype (_type_): _description_

    Returns:
        _type_: _description_
    """    
    filename = 'static/img/'+dataset+'_'+variable+str(ptype)+'_'+str(date)+'_'+'%.2f'%lat+'_%.2f'%lon+'.png'
    
    if (os.path.exists(filename)):
        print("file already exists", file=sys.stdout)
    else:
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)
        depth_array = np.array(dataset_config[ix]['levels'])
        time_array = np.array(dataset_config[ix]['daterange'],dtype='datetime64')

        lat_index = np.abs(lat_array-lat).argmin()
        lon_index = np.abs(lon_array-lon).argmin()    
        time_index = np.abs(time_array - np.datetime64(date)).argmin()

        if (ptype==1):
            if (('climato' in dataset_config[ix])):
                iz = [dataset_config[ix]['climato']==dataset_config[i]['name'] for i in range(len(dataset_config))]
                iz = np.argmax(iz)
                time_array_a = np.array(dataset_config[iz]['daterange'],dtype='datetime64')
                depth_array_a = np.array(dataset_config[iz]['levels'])
                murla = dataset_config[iz]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[0:1:{len(depth_array_a)-1}],time[0:1:{len(time_array_a)-1}],{variable}[0:1:{len(time_array_a)-1}][0:1:{len(depth_array_a)-1}][{lat_index}][{lon_index}]"
                dsa = xr.open_dataset(murla,decode_times=True)
                dsa['time'] = np.arange(1,13)
                dsa = dsa.rename({'time':'month'})
                murlb = dataset_config[ix]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[0:1:{len(depth_array)-1}],time[{time_index}],{variable}[{time_index}][0:1:{len(depth_array)-1}][{lat_index}][{lon_index}]"
                dsb = xr.open_dataset(murlb,decode_times=True)
                ds = dsb.groupby('time.month') - dsa   
                xlabel=variable+' anomaly'
            else :
                return "static/dist/unavailable.png"
        else :    
            murl = dataset_config[ix]['opendap'] + f"longitude[{lon_index}],latitude[{lat_index}],depth[0:1:{len(depth_array)-1}],time[{time_index}],{variable}[{time_index}][0:1:{len(depth_array)-1}][{lat_index}][{lon_index}]"
            ds = xr.open_dataset(murl,decode_times=True)
            xlabel = variable

        my_dpi=100
        f,ax = plt.subplots(1,1,figsize=(250/my_dpi, 600/my_dpi), dpi=my_dpi)
        ds[variable].plot(linewidth=2,y='depth',ax=ax)    
        ax.set_title('')
        ax.set_xlabel(xlabel)
        # ax.set_title(dataset+' - '+variable+' - '+str(date)+' at '+'%.2f'%lat+'/%.2f'%lon,rotation=90,y=-0.0,x=1.1,fontsize = 10)
        ax.grid(linestyle=':')
        ax.invert_yaxis()
        plt.savefig(filename, bbox_inches='tight')    
    return filename


def snapshot(lat0, lon0, lat1, lon1, dataset, variable, depth, date, lowval, highval, ptype):
    """_summary_

    Args:
        lat0 (_type_): _description_
        lon0 (_type_): _description_
        lat1 (_type_): _description_
        lon1 (_type_): _description_
        dataset (_type_): _description_
        variable (_type_): _description_
        depth (_type_): _description_
        date (_type_): _description_
        lowval (_type_): _description_
        highval (_type_): _description_
        ptype (_type_): _description_

    Returns:
        _type_: _description_
    """
    filename = 'static/img/'+dataset+'_'+variable+str(ptype)+'_'+str(date)[:10]+'_'+str(depth)+'_'+'%.2f'%lat0+'_%.2f'%lon0+'to'+'%.2f'%lat1+'_%.2f'%lon1+'_sna.png'    
    
    if (lat0>lat1):
        lat0,lat1 = lat1,lat0
    if (lon0>lon1):
        lon0,lon1 = lon1,lon0        

    if ((os.path.exists(filename))&(lowval is None)):
        print("file already exists", file=sys.stdout)
    else:
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)
        depth_array = np.array(dataset_config[ix]['levels'])
        time_array = np.array(dataset_config[ix]['daterange'],dtype='datetime64')

        lat0_index = np.abs(lat_array-lat0).argmin() - 1
        lat1_index = np.abs(lat_array-lat1).argmin() + 1 
        lon0_index = np.abs(lon_array-lon0).argmin() - 1   
        lon1_index = np.abs(lon_array-lon1).argmin() + 1       
        time_index = np.abs(time_array - np.datetime64(date)).argmin()
        dep_index = np.abs(depth_array-depth).argmin()

        if (ptype==1):
            if (('climato' in dataset_config[ix])):
                iz = [dataset_config[ix]['climato']==dataset_config[i]['name'] for i in range(len(dataset_config))]
                iz = np.argmax(iz)
                time_array_a = np.array(dataset_config[iz]['daterange'],dtype='datetime64')
                murla = dataset_config[iz]['opendap'] + f"longitude[{lon0_index}:{lon1_index}],latitude[{lat0_index}:{lat1_index}],depth[{dep_index}],time[0:1:{len(time_array_a)-1}],{variable}[0:1:{len(time_array_a)-1}][{dep_index}][{lat0_index}:{lat1_index}][{lon0_index}:{lon1_index}]"
                dsa = xr.open_dataset(murla,decode_times=True)
                dsa['time'] = np.arange(1,13)
                dsa = dsa.rename({'time':'month'})
                murlb = dataset_config[ix]['opendap'] + f"longitude[{lon0_index}:{lon1_index}],latitude[{lat0_index}:{lat1_index}],depth[{dep_index}],time[{time_index}],{variable}[{time_index}][{dep_index}][{lat0_index}:{lat1_index}][{lon0_index}:{lon1_index}]"
                dsb = xr.open_dataset(murlb,decode_times=True)    
                ds = dsb.groupby('time.month') - dsa
                clabel=variable+' anomaly'
            else :
                return "static/dist/unavailable.png"
        else :
            murl = dataset_config[ix]['opendap'] + f"longitude[{lon0_index}:{lon1_index}],latitude[{lat0_index}:{lat1_index}],depth[{dep_index}],time[{time_index}],{variable}[{time_index}][{dep_index}][{lat0_index}:{lat1_index}][{lon0_index}:{lon1_index}]"
            ds = xr.open_dataset(murl,decode_times=True)    
            clabel=variable

        fig = plt.figure(figsize=(9,9),dpi=100)
        ax = fig.add_subplot(1,1,1,projection=ccrs.Miller())    
        ds[variable].squeeze().plot(cmap=plt.get_cmap('turbo'),vmin=lowval,vmax=highval,ax=ax,cbar_kwargs={'orientation':'horizontal','pad':0.05,'shrink':0.5,'label':clabel},transform=ccrs.PlateCarree())    
        ax.set_title('')
        #ax.coastlines()   
        ax.add_feature(land_feature)
        gl = ax.gridlines(linestyle=':',draw_labels=True)
        gl.right_labels = None
        gl.top_labels = None
        plt.savefig(filename, bbox_inches='tight')
    return filename        

def section(lat0, lon0, lat1, lon1, dataset, variable, date, lowval, highval, ptype):
    """_summary_

    Args:
        lat0 (_type_): _description_
        lon0 (_type_): _description_
        lat1 (_type_): _description_
        lon1 (_type_): _description_
        dataset (_type_): _description_
        variable (_type_): _description_
        date (_type_): _description_
        lowval (_type_): _description_
        highval (_type_): _description_
        ptype (_type_): _description_s

    Returns:
        _type_: _description_
    """
    filename = 'static/img/'+dataset+'_'+variable+str(ptype)+'_'+str(date)[:10]+'_'+'%.2f'%lat0+'_%.2f'%lon0+'to'+'%.2f'%lat1+'_%.2f'%lon1+'_sec.png'    
    
    if ((os.path.exists(filename))&(lowval is None)):
        print("file already exists")
    else:        
        ix = [dataset==dataset_config[i]['name'] for i in range(len(dataset_config))]
        ix = np.argmax(ix)
        time_array = np.array(dataset_config[ix]['daterange'],dtype='datetime64')
        depth_array = np.array(dataset_config[ix]['levels'])

        lat0_index = np.abs(lat_array-(lat0-1)).argmin()
        lat1_index = np.abs(lat_array-(lat1+1)).argmin()
        lai0 = min(lat0_index,lat1_index)-10
        lai1 = max(lat0_index,lat1_index)+10        
        lon0_index = np.abs(lon_array-(lon0-1)).argmin()    
        lon1_index = np.abs(lon_array-(lon1+1)).argmin()        
        loi0 = min(lon0_index,lon1_index)-10
        loi1 = max(lon0_index,lon1_index)+10

        time_index = np.abs(time_array - np.datetime64(date)).argmin()

        if (ptype==1):
            if (('climato' in dataset_config[ix])):
                iz = [dataset_config[ix]['climato']==dataset_config[i]['name'] for i in range(len(dataset_config))]
                iz = np.argmax(iz)
                time_array_a = np.array(dataset_config[iz]['daterange'],dtype='datetime64')

                murla = dataset_config[iz]['opendap'] + f"longitude[{loi0}:{loi1}],latitude[{lai0}:{lai1}],depth[0:1:{len(depth_array)-1}],time[0:1:{len(time_array_a)-1}],{variable}[0:1:{len(time_array_a)-1}][0:1:{len(depth_array)-1}][{lai0}:{lai1}][{loi0}:{loi1}]"
                dsa = xr.open_dataset(murla,decode_times=True)
                dsa['time'] = np.arange(1,13)
                dsa = dsa.rename({'time':'month'})

                murlb = dataset_config[ix]['opendap'] + f"longitude[{loi0}:{loi1}],latitude[{lai0}:{lai1}],depth[0:1:{len(depth_array)-1}],time[{time_index}],{variable}[{time_index}][0:1:{len(depth_array)-1}][{lai0}:{lai1}][{loi0}:{loi1}]"
                dsb = xr.open_dataset(murlb,decode_times=True)   

                ds = dsb.groupby('time.month') - dsa
                clabel=variable+' anomaly'

            else :
                return "static/dist/unavailable.png"
        else :    
            murl = dataset_config[ix]['opendap'] + f"longitude[{loi0}:{loi1}],latitude[{lai0}:{lai1}],depth[0:1:{len(depth_array)-1}],time[{time_index}],{variable}[{time_index}][0:1:{len(depth_array)-1}][{lai0}:{lai1}][{loi0}:{loi1}]"
            ds = xr.open_dataset(murl,decode_times=True)   
            clabel=variable
        
        drt = geode.inverse((lon0,lat0),(lon1,lat1))
        d = drt[0][0]
        a = drt[0][1]
        distances = np.arange(0,d,50000) #step in meters, here 50km
        points = geode.direct((lon0,lat0),a.repeat(len(distances)),distances)
        seclon_array = points[:,0]
        seclat_array = points[:,1]
        secx = xr.DataArray(seclon_array, coords={"distance":distances/1e3})
        secy = xr.DataArray(seclat_array, coords={"distance":distances/1e3})
        dsi = ds.interp(longitude=secx,latitude=secy)        
        
        my_dpi=100
        f,ax = plt.subplots(1,1,figsize=(900/my_dpi, 350/my_dpi), dpi=my_dpi)        
        dsi[variable].squeeze().plot(y='depth',cmap=plt.get_cmap('turbo'),cbar_kwargs={'shrink':0.6,'label':clabel},ax=ax,vmin=lowval,vmax=highval)
        ax.set_title('')                
        ax.grid(linestyle=':')
        ax.invert_yaxis()
        ax.set_xlabel('distance along section (km)')
        plt.savefig(filename, bbox_inches='tight')
    return filename       
