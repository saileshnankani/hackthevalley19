const readline = require('readline');
const {google} = require('googleapis');
const fs = require('fs');

const creds = ["credentials-sid.json","credentials-ryan.json","credentials-sailesh.json"]
const tokes = ["token-sid.json","token-ryan.json","token-sailesh.json"]

//const creds = ["credentials-ramnik.json"];

var timestamps = []

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

module.exports = {

  list() {
		let clients = [];
		let eventLists = []; 
		Promise.all(creds.map(readCredentials)).then(data => {
			clients = data;
			return Promise.all(clients.map(listEvents));
		}).then(data => {
			console.log("timestamps");
			console.log(timestamps);
			eventLists = getFreeTimes(timestamps);
			console.log("free times:")
			console.log(eventLists);
			return Promise.resolve(eventLists);
		});
	},

  add(timeStampEvent) {

		if(timeStampEvent === "" || timeStampEvent === null) {
			timeStampEvent = getIdealTime(eventList);
		}

    // Load client secrets from a local file.
    return new Promise((resolve, reject) => {  
    // Load client secrets from a local file.
	    fs.readFile('credentials-sid.json', (err, content) => {
	      if (err) reject(err);
	      // Authorize a client with credentials, then call the Google Calendar API.
	      resolve(authorize(JSON.parse(content)));
	    });
    }).then(client => {
    	return addEvents(client, timeStampEvent);
    }); 
  }
}	

  function readCredentials(credentialsPath, tokenIndex) {
		return new Promise((resolve, reject) => {
			fs.readFile(credentialsPath, (err, content) => {
				if (err) reject(err);
				// Authorize a client with credentials, then call the Google Calendar API.
				resolve(authorize(JSON.parse(content), tokes[tokenIndex]));
			});
		});
	}

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, tokenPath) {
    return new Promise((resolve, reject) => {
	 	 const {client_secret, client_id, redirect_uris} = credentials.installed;
   	 const oAuth2Client = new google.auth.OAuth2(
         client_id, client_secret, redirect_uris[0]);
	
    	// Check if we have previously stored a token.
    	fs.readFile(tokenPath, (err, token) => {
     		if (err) getAccessToken(oAuth2Client, tokenPath).then(res => {
									oAuth2Client.setCredentials(JSON.parse(token));
									resolve(res);
									});
				else {
					oAuth2Client.setCredentials(JSON.parse(token));
					resolve(oAuth2Client);
				} 
   	});
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, tokenPath) {
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
		fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
		  if (err) reject(err);
		  console.log('Token stored to', tokenPath);
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
				timeMax: "2019-02-24T23:59:00-05:00",
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
		//console.log('Upcoming 10 events:');
		events.map((event, i) => {
		  const start = event.start.dateTime || event.start.date;  
		  //console.log(`${start} - ${event.summary}`);
			foundEvents += (`${start} - ${event.summary}`); 
			timestamps.push(start); 
		  //console.log(timestamps[timestamps.length - 1]);
		});
		return Promise.resolve(timestamps);
	      } else {
		console.log('No');
		//timestamps = ['No upcoming events found.'];
		return Promise.resolve("");
	      }
    });    
  }

 function addEvents(auth, dateCreate) {
    var resources =  {
        "end":
        {
        "dateTime" : dateCreate
        },
        "start":
        {
        "dateTime" :dateCreate
        },
	"attendees": [
		  {
				      "email": "ramnik.chudha@gmail.com"
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
	
	function getFreeTimes(timesList) {
		let timehour = 13;
		let check_time = "2019-02-24T"+timehour+":00:00-05:00";
		let arr = [];
		let free = true;

		console.log("memes");

		while(timehour <= 22) {
			console.log("asdsafasdfasd");
			console.log(timesList);

			for(let i = 0; i < timesList.length; i++) {
				if(timesList[i] === check_time) {
					console.log("donee");
					free = false;
				}
			}
		
			if(free) {
				arr.push(check_time);
			}

			free = true;

			timehour +=1;

			check_time = "2019-02-24T"+timehour+":00:00-05:00"
		}

		return arr;
	}

	function getIdealTime(timesList) {
		let timehour = 13;
		let check_time = "2019-02-24T"+timehour+":00:00-05:00";
		let free = true;

		while(timehour <= 22) {
			for(let i = 0; i < timesList.length; i++) {
				if(timesList[i] === check_time) {
					free = false;
				}
			}
	
			if(free) {
				return check_time;
			}
			else {
				timehour += 1;
				check_time = "2019-02-24T"+timehour+":00:00-05:00"
			}
		}

		return "no free time";
	}
