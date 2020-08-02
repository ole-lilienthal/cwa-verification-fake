'use strict';

const validTans = [
  "edc07f08-a1aa-11ea-bb37-0242ac130002"
];

const teleTanToRegToken = {
  "R3ZNUEV9JA": "7f86c6fd-5c66-4003-abb1-4eee36680c9b",
  "CG4Z5A9CY9": "7f86c6fd-5c66-4003-abb1-4eee36680c9b"
};

const guidsToRegToken = {
  "f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b": "7f86c6fd-5c66-4003-abb1-4eee36680c9b",
  "0199effab87800689c15c08e234db54f088cc365132ffc230e882b82cd3ecf95": "b3586b13-280f-4a6d-8b54-5fbf8fb8d550"
};

const regTokenToTan = {
  "7f86c6fd-5c66-4003-abb1-4eee36680c9b": "edc07f08-a1aa-11ea-bb37-0242ac130002",
  "b3586b13-280f-4a6d-8b54-5fbf8fb8d550": "edc07f08-a1aa-11ea-bb37-0242ac130002"
};

const server_port = process.env.PORT || 8004;
const server_host = process.env.IP || '0.0.0.0';

const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

/**
 * Verify provided Tan
 * /version/v1/tan/verify
 *
 * Request
 * Content-type: application/json
 * Body: {"tan":<TAN>}
 *   <TAN> the transaction number, which needs to be verified
 *
 * Response
 * HTTP 200, if the verification was successful. Otherwise HTTP 404.
 */
app.post('/version/v1/tan/verify', function (req, res) {
  console.log(req.body);
  if (validTans.includes(req.body.tan)) {
    res.status(200).send();
  } else {
    res.status(404).send();
  }
});

/**
 * Get a registration token by providing a SHA-256 hasehd GUID or a teleTAN
 * /version/v1/registrationToken
 *
 * Request
 * Headers: "cwa-fake: 0"
 * Content-type: application/json
 * Body: {"keyType": <TYPE>, "key":<KEY>}
 *   <TYPE> one of "TELETAN" or "GUID"
 *   <KEY> either a TeleTAN or hashed GUID
 *
 * Response
 * HTTP 201 if successful. Otherwise HTTP 400.
 * Content-type: application/json
 * Body: {"registrationToken":<TOKEN>}
 *   <TOKEN> a registration token
 */
app.post('/version/v1/registrationToken', function (req, res) {
  console.log(req.body);
  if (req.body.keyType === "TELETAN") {
    if (teleTanToRegToken[req.body.key] !== undefined) {
      res.status(201);
      res.json({ registrationToken: teleTanToRegToken[req.body.key] });
    } else {
      res.status(400).send();
    }
  } else if (req.body.keyType === "GUID") {
    if (guidsToRegToken[req.body.key] !== undefined) {
      res.status(201);
      res.json({ registrationToken: guidsToRegToken[req.body.key] });
    } else {
      res.status(400).send();
    }
  } else {
    res.status(400).send();
  }
});

/**
 * Generates a TAN on input of Registration Token. With the TAN one can submit his Diagnosis keys
 * /version/v1/tan
 *
 * Request
 * Headers: "cwa-fake: 0"
 * Content-type: application/json
 * Body: {"registrationToken", <TOKEN>}
 *   <TOKEN> a registration token
 *
 * Response
 * HTTP 201 if successful. Otherwise HTTP 400.
 * Content-type: application/json
 * Body: {"tan":<TAN>}
 *   <TAN> transaction number
 */
app.post('/version/v1/tan', function (req, res) {
  console.log(req.body);
  if (regTokenToTan[req.body.registrationToken] !== undefined) {
    res.status(201);
    res.json({ tan: regTokenToTan[req.body.registrationToken] });
  } else {
    res.status(400).send();
  }
});

app.listen(server_port, server_host, function () {
    console.log( "Listening on " + server_host + ", port " + server_port )
});
