'use strict';

const fs = require('fs');
const drawing = require('pngjs-draw');
const png = drawing(require('pngjs2').PNG);

const trackFile ='out3000.csv';
var curplate='';
var lastPoint=null;
const staticmap = require("staticmap")

const lineCount=27031260;
let curLine=0;

let accessToken = 'pk.eyJ1IjoibHZ4IiwiYSI6ImNqZDR2bnowcjJ4bncycW54Zmg4eDgyd3UifQ.NEDEuCH5lhQCydWaHIaiHg';
let tileUrl= 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=' + accessToken;
const proxy= {}
const map = staticmap.create({ tileUrl, proxy });


console.log('downloading image')
map.getBox(staticmap.png({ width: 400, height: 400 }), 47.312698, 5.909284, 35.743953, 20.157524)
  .then((image) => {
      console.log('image downloaded')
      const lineReader = require('readline').createInterface({
        input: fs.createReadStream(trackFile)
      });
      let pngImage = this;
      lineReader.on('line', function (line) {
        curLine++;
        if(curLine%1000==0) console.log(Math.floor(curLine/lineCount*10000)/100)
        let a=line.split(";")
        const targa = a[4]
        let speed = a[12]
        if(a[7]){
          const point = [parseFloat (a[7]) ,parseFloat (a[8])];
          if(lastPoint && getDistanceFromLatLonInKm(lastPoint[0],lastPoint[1],point[0],point[1])<10){
            image.drawLine(image.lonToX(lastPoint[1]),image.latToY(lastPoint[0]),
                              image.lonToX(point[1]),image.latToY(point[0]),
                              image.color(102, 255, 255, speed));
            
          }
          lastPoint=point;

          if(curplate != targa){
            lastPoint=null
          }
          curplate=targa;
        }

      });
      lineReader.on('close', function () {
        image.save('speed.png');
        console.log('done')
      });
    })

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }
    
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

