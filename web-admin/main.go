package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"text/template"
)

type Page struct {
	Title string
	Body  []byte
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/script.js", SendJs)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	p := &Page{Title: "Admin Panel for HUGO"}
	t, _ := template.ParseFiles("home.html")
	t.Execute(w, p)
}

func SendJs(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("script.js")
	if err != nil {
		http.Error(w, "Couldn't read file", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
	w.Write(data)
}
