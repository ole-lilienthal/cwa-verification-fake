'use strict';

/*
 * TeleTAN process
 * 1. User enters 10-digit teleTan
 * 2. Client sends teleTAN to Verification Server /version/v1/registrationToken
 * 3. Verification Server returns registrationToken
 * 4. Client sends registrationToken to Verification Server /version/v1/tan
 * 5. Verification Server returns tan
 * 6. Client sends tan + diagnosis keys to Upload server /version/v1/diagnosis-keys"
 *
 * GUID process
 * 1. User enters 38-digit SHA-256 hasehd GUID
 * 2. Client sends hashed GUID to Verification Server /version/v1/registrationToken
 * 3. Verification Server returns registrationToken
 * 4. Client periodically sends registrationToken to Verification Server /version/v1/testresult
 * 5. Verification Server returns test result
 * 6. If positive continue, otherwise return to step 4 for 21 days
 * 7. Client sends registrationToken to Verification Server /version/v1/tan
 * 8. Verification Server returns tan
 * 6. Client sends tan + diagnosis keys to Upload server /version/v1/diagnosis-keys"
*/

// TANS accepted by /version/v1/tan/verify
const validTans = [
  "edc07f08-a1aa-11ea-bb37-0242ac130002"
];

// TeleTANs accepted by /version/v1/registrationToken
const teleTanToRegToken = {
  "R3ZNUEV9JA": "7f86c6fd-5c66-4003-abb1-4eee36680c9b",
  "CG4Z5A9CY9": "7f86c6fd-5c66-4003-abb1-4eee36680c9b"
};

// SHA-256 hashed GUIDs accepted by /version/v1/registrationToken
const guidsToRegToken = {
  // GUID = 3BF1D4-1C6003DD-733D-41F1-9F30-F85FA7406BF7
  "75552e6e1dae7a520bad64e92b7569447d0f5ca3c539335e0418a7695606147e": "7f86c6fd-5c66-4003-abb1-4eee36680c9b",
  // GUID = 3D6D08-3567F3F2-4DCF-43A3-8737-4CD1F87D6FDA
  "49cadef62bc9cdd16c73a044d1ff85e229cfc7a308ef4413d42af8276c9e4e98": "b3586b13-280f-4a6d-8b54-5fbf8fb8d550"
};

// Registration tokens accepted by /version/v1/tan
const regTokenToTan = {
  "7f86c6fd-5c66-4003-abb1-4eee36680c9b": "edc07f08-a1aa-11ea-bb37-0242ac130002",
  "b3586b13-280f-4a6d-8b54-5fbf8fb8d550": "edc07f08-a1aa-11ea-bb37-0242ac130002"
};

// Registration tokens accepted by /version/v1/testresult
const regTokenToTestResult = {
    "7f86c6fd-5c66-4003-abb1-4eee36680c9b": {testResult: 1, chance: 0.1},
    "b3586b13-280f-4a6d-8b54-5fbf8fb8d550": {testResult: 2, chance: 0.1}
}

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
 * Generates a TAN on input of Registration Token. With the TAN one can submit their Diagnosis keys
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

/**
 * Return test result diagnosis
 * /version/v1/testresult
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
 * Body: {"testResult":<int>}
 *   <int> test regTokenToTestResult; 1 = Negative; 2 = Positive; 3 = Invalid
 */
app.post('/version/v1/testresult', function (req, res) {
  console.log(req.body);
  if (regTokenToTestResult[req.body.registrationToken] !== undefined) {
    res.status(201);
    var random = Math.random();
    if (random < regTokenToTestResult[req.body.registrationToken].chance) {
        res.json({ testResult: regTokenToTestResult[req.body.registrationToken].testResult });
    } else {
      res.json({ testResult: 3 });
    }
  } else {
    res.status(400).send();
  }
});

app.listen(server_port, server_host, function () {
    console.log( "Listening on " + server_host + ", port " + server_port )
});
