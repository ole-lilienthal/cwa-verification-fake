package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type responseBody struct {
	Tan string
}

func (resp responseBody) isValid(validtans []string) bool {
	for _, t := range validtans {
		if t == resp.Tan {
			return true
		}
	}
	return false
}
func main() {
	validtans := []string{"edc07f08-a1aa-11ea-bb37-0242ac130002"}

	serverhost := os.Getenv("IP")
	if serverhost == "" {
		serverhost = "0.0.0.0"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8004"
	}

	http.HandleFunc("/version/v1/tan/verify", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			decoder := json.NewDecoder(r.Body)
			var resp responseBody
			if err := decoder.Decode(&resp); err != nil {
				http.Error(w, err.Error(), 404)
			}
			log.Printf("%+v", resp)
			if resp.isValid(validtans) {
				w.WriteHeader(200)
			} else {
				http.Error(w, "wrong tan", 404)
			}
		} else {
			http.Error(w, "Only POST is supported", 404)
		}
	})

	log.Printf("listening on %s, port %s", serverhost, port)
	log.Fatal(http.ListenAndServe(serverhost+":"+port, nil)) //if serverhost is "", listen all
}
