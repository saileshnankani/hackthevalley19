'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  events = require('./create-event');
// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));


// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.get('/', (req, res) => {

	console.log('signup hit');
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  res.json({"response": "Failure"});
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post('/dialogflow', (req, res) => {
	console.log(req.body);


  if(req.body.intent === "CheckCalendarPrompt") {
    events.list().then(data => {  
      res.json({"payload": {
          "slack": {
            "text": data
                }
               }
        });
      res.status(200);
    }).catch(err => {
      console.log(err);	
      res.json({"payload": {
            "slack": {
              "text": "Could not get calendar data"
            }
          }
      });
      res.status(500);
    });	
  } else if(req.body.intent === "ApproveEvent") {
    events.add(req.body.queryResult.parameters['date-time']['date_time']).then(data => {  
      res.json({"payload": {
          "slack": {
            "text": data
                }
               }
        });
      res.status(200);
    }).catch(err => {
      console.log(err);	
      res.json({"payload": {
            "slack": {
              "text": "Could not get calendar data"
            }
          }
      });
      res.status(500);
    });	
  } else {
    res.json({"payload": {
        "slack": {
         "text": "Could not get calendar data"
        }
      }
    });
    res.status(500);
  }
});
