'use strict'
/* dependencies */
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');


// Create an Express application.
const app = express();
const axios = require('axios');

// Add body parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("OK");
});

// Add routers
app.post('/', (req, res) => {
  
  var event = req.body;
  if ( event.data  && event.data.context && event.data.context.activityLog ) {
    var rgName = event.data.context.activityLog.resourceGroupName;
    
    var provId = rgName.split("-")[rgName.split("-").length-1];
    var sendData = {
      "provID": provId,
      "rgName": rgName,
      "cloudName": "QMI Automation",
      "instanceState": process.env.TRIGGER_STATUS,
      "logEvent": "AzureWebhook"
    };
    
    
    //Save user photo
    axios({
        method: 'post',
        url: process.env.QMICLOUD_API_URL,
        headers: { 'QMI-ApiKey' : process.env.QMICLOUD_KEY },
        data: sendData
    }).then(function (response) {
        console.log("Sent to QMICLOUD", sendData);
    }).catch(function(err){
        console.log('Error# ', err);
    });
    
  }
  res.json(event);
})

app.use((req, res, next) => res.send("404"))
app.use((err, req, res, next) => {
  console.error(err)
  if (res.headerSent) return next(err)
  return res.send("500")
})


module.exports = app;

