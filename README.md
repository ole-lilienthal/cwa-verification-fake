# cwa-verification-fake

This is a simple golang service to fake the verification service of the Corona-Warn-App.

Enter your fake TANs to the validTans array in the main.go. By default the service will start on port 8004. To try out the default setup, send a post request to http://localhost:8004/version/v1/tan/verify with the following reuqestBody:

```
{
    "tan": "edc07f08-a1aa-11ea-bb37-0242ac130002"
}
```

If requested with a TAN included in the valid TAN array, the fake service will return a status code 200. If the service is provided with any other valid UUID, the service will return a status code 404.
