# cwa-verification-fake

This is a simple node express service to fake the verification service of the Corona-Warn-App

Enter your fake TANs to the validTans array in the index.js. By default the service will start on port 8004. To try out the default setup send a post request to http://localhost:8004/version/v1/tan/verify with the following reuqestBody:

```
{
    "tan": "b69ab69f-9823-4549-8961-c41sa74b2f36"
}
```

If requested with a TAN included in the valid TAN array, the fake service will return a status code 200. If the service is provided any other valid UUID the service will return a status code 404.
