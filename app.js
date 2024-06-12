'use strict'
/* dependencies */
const express = require('express');
const path = require('path');
const NodeCache = require( "node-cache" );
const TRIGGER_STATUS = process.env.TRIGGER_STATUS || "Stopped";
const LOGEVENT_NAME = process.env.LOGEVENT_NAME || "AzureWebhook";
const SERVICE_NAME = process.env.SERVICE_NAME || "QMI Automation";

// Create an Express application.
const app = express();

const axios = require('axios');
const myCache = new NodeCache( { stdTTL: 300 } ); //5 minutes cache

// Add body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add routers
app.post('/', (req, res) => {
  
  var now = new Date();
  now = now.toISOString();
  
  const event = req.body;
  console.log(`${now}# Calling webhook POST endpoint, body`, event);

  if ( event.data  && event.data.context && event.data.context.activityLog ) {
    let rgName = event.data.context.activityLog.resourceGroupName;
    
    let provId = rgName.split("-")[rgName.split("-").length-1];
    let sendData = {
      "provID": provId,
      "rgName": rgName,
      "cloudName": SERVICE_NAME,
      "instanceState": TRIGGER_STATUS,
      "logEvent": LOGEVENT_NAME
    };
     
    
    if ( !myCache.get( provId ) ) {   
      
      console.log(`${now}# ProvId (${provId}). Sending '${sendData.instanceState}' to QMICLOUD...`);
      
      axios({
          method: 'post',
          url: process.env.QMICLOUD_API_URL,
          headers: { 'QMI-ApiKey' : process.env.QMICLOUD_KEY },
          data: sendData
      }).then(function (response) {
          myCache.set(provId, sendData);     
      }).catch(function(err){
          myCache.del(provId);
          console.log('Error# ', err);
      });
      
    } else {
      console.log(`${now}# ProvId (${provId}) recently sent. Won't be sent again.`);
    }
    
  }
  res.json(event);
})

app.post('/test', (req, res) => {
  console.log("Calling /test POST endpoint");
  res.send("OK");
});

app.use((req, res, next) => res.send("404"))
app.use((err, req, res, next) => {
  console.error(err)
  if (res.headerSent) return next(err)
  return res.send("500")
})


module.exports = app;

