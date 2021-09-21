package main

import (
	"log"
	"net/http"
	"text/template"
)

type Page struct {
	Title string
	Body  []byte
}

func main() {
	fs := http.FileServer(http.Dir("./js"))
	http.Handle("/js/", http.StripPrefix("/js/", fs))
	http.HandleFunc("/", homeHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	p := &Page{Title: "Admin Panel for HUGO"}
	t, _ := template.ParseFiles("home.html")
	t.Execute(w, p)
}
