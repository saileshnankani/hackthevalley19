
const readline = require('readline');
const {google} = require('googleapis');
const fs = require('fs');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

module.exports = {

  list() {
    return new Promise((resolve, reject) => {  
    // Load client secrets from a local file.
	    fs.readFile('credentials.json', (err, content) => {
	      if (err) reject(err);
	      // Authorize a client with credentials, then call the Google Calendar API.
	      resolve(authorize(JSON.parse(content)));
	    });
    }).then(client => {
    	return listEvents(client);
    });	    
  },

  add() {
    // Load client secrets from a local file.
    return new Promise((resolve, reject) => {  
    // Load client secrets from a local file.
	    fs.readFile('credentials.json', (err, content) => {
	      if (err) reject(err);
	      // Authorize a client with credentials, then call the Google Calendar API.
	      resolve(authorize(JSON.parse(content)));
	    });
    }).then(client => {
    	return addEvents(client);
    }); 
  }
}	

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials) {
    return new Promise((resolve, reject) => {
	 const {client_secret, client_id, redirect_uris} = credentials.installed;
   	 const oAuth2Client = new google.auth.OAuth2(
         client_id, client_secret, redirect_uris[0]);
	
    	// Check if we have previously stored a token.
    	fs.readFile(TOKEN_PATH, (err, token) => {
     		if (err) getAccessToken(oAuth2Client, callback).then(res => {
			resolve(res);
		});
		else resolve(oAuth2Client);
		oAuth2Client.setCredentials(JSON.parse(token));
      		resolve(oAuth2Client);      
   	});
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => { 
	    const authUrl = oAuth2Client.generateAuthUrl({
	      access_type: 'offline',
	      scope: SCOPES,
	    });
	    console.log('Authorize this app by visiting this url:', authUrl);
	    const rl = readline.createInterface({
	      input: process.stdin,
	      output: process.stdout,
	    });
	    rl.question('Enter the code from that page here: ', (code) => {
	      rl.close();
	      oAuth2Client.getToken(code, (err, token) => {
		if (err) reject(err);
		oAuth2Client.setCredentials(token);
		// Store the token to disk for later program executions
		fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		  if (err) reject(err);
		  console.log('Token stored to', TOKEN_PATH);
		});
		resolve(oAuth2Client);
	      });
	    });
    });	    
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    let listCall = new Promise((resolve, reject) => {  
 	    const calendar = google.calendar({version: 'v3', auth});
	    calendar.events.list({
	      calendarId: 'primary',
	      timeMin: (new Date()).toISOString(),
	      maxResults: 10,
	      singleEvents: true,
	      orderBy: 'startTime',
	    }, (err, res) => {
	      if (err) reject(err);
	      const events = res.data.items;
	      resolve(events);
	    });
    })
		  
    return listCall.then((events) => {
	    let foundEvents = "";
	      if (events.length) {
		console.log('Upcoming 10 events:');
		events.map((event, i) => {
		  const start = event.start.dateTime || event.start.date;  
		  const end = event.end.dateTime || event.end.date;
		  console.log(`${start} - ${end} - ${event.summary}`);
		  foundEvents += (`${start} - ${end} - ${event.summary}`);  
		  console.log("");
		});
		return Promise.resolve(foundEvents);
	      } else {
		console.log('No');
		foundEvents = 'No upcoming events found.';
		return Promise.resolve(foundEvents);
	      }
    });    
  }

 function addEvents(auth) {
    var resources =  {
        "end":
        {
        "dateTime" : "2019-02-23T21:31:45+00:00"
        },
        "start":
        {
        "dateTime" :"2019-02-23T20:31:45+00:00"
        },
	"attendees": [
		  {
				      "email": "ramnik.chudha@gmail.com"
				    },
		  {
				      "email": "ryanmin42@gmail.com"
				    },
		  {
				      "email": "saileshhps@gmail.com"
				    }
		]
    }

    return new Promise((resolve, reject) => {	 
	    const calendar = google.calendar({version: 'v3', auth});
	    calendar.events.insert({
	      calendarId: 'primary',
	      sendNotifications: true,
	      sendUpdates: 'all',
	      supportsAttachments: true,
	      resource: resources,
	    }, (err, res) => {
	      if (err) reject(err); 
	      else {
		      console.log("Event created");
	      	      resolve("Event created");
	      }
	    });
    });	    
  }

