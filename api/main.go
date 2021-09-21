package main

import (
	"crypto/md5"
	"encoding/hex"
	"os"
	"time"

	"io/ioutil"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const path = "../content/post/"
const ext = ".md"

var name = ""

func main() {

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST"},
		AllowHeaders: []string{"X-Requested-With", "Content-Type"},
		// ExposeHeaders:    []string{"Content-Length"},
		// AllowCredentials: true,
		// AllowOriginFunc: func(origin string) bool {
		// 	return origin == "http://localhost:8080"
		// },
		MaxAge: 12 * time.Hour,
	}))

	router.GET("/articles", getArticles)
	router.POST("/article", postArticle)
	router.GET("/article/:name", getArticle)

	router.Run("localhost:8081")
}

type DataJSON struct {
	Name    string `json:"name"`
	Slug    string `json:"slug"`
	Content string `json:"content"`
	Author  string `json:"author"`
	Date    string `json:"date"`
}

func rename(oldName string, newName string) {
	os.Rename(path+oldName+ext, path+newName+ext)
}

func saveFile(name string, content []byte) error {
	err := ioutil.WriteFile(path+name+ext, content, 0755)
	if err != nil {
		return err
	}
	return nil
}

func postArticle(c *gin.Context) {
	var dataJSON DataJSON
	err := c.BindJSON(&dataJSON)
	if err != nil {
		c.IndentedJSON(http.StatusNoContent, dataJSON.Slug)
	} else {
		if dataJSON.Name != "" {
			name = dataJSON.Name
			if dataJSON.Name != dataJSON.Slug {
				rename(dataJSON.Name, dataJSON.Slug)
				name = dataJSON.Slug
			}
		} else {
			name = dataJSON.Slug
		}

		content := []byte(dataJSON.Content)
		err := saveFile(name, content)
		if err != nil {
			c.IndentedJSON(http.StatusOK, dataJSON.Slug)
		} else {
			c.IndentedJSON(http.StatusOK, dataJSON.Slug)
		}
	}
}

func getArticle(c *gin.Context) {
	name := c.Param("name")
	content, err := ioutil.ReadFile(path + name + ".md")
	if err != nil {
		c.IndentedJSON(http.StatusNotModified, err)
	} else {
		c.IndentedJSON(http.StatusOK, string(content))
	}
}

func getArticles(c *gin.Context) {
	files, err := ioutil.ReadDir(path)

	if err != nil {
		c.IndentedJSON(http.StatusNoContent, err)
	} else {
		data := map[string]interface{}{}
		var fileName []string
		var hash []string
		for _, f := range files {
			fileName = append(fileName, f.Name())
			content, _ := ioutil.ReadFile(path + f.Name())
			hashed := md5.Sum([]byte(content))
			hash = append(hash, hex.EncodeToString(hashed[:]))
		}
		data["files"] = fileName
		data["hash"] = hash
		data["status"] = "Success"

		c.IndentedJSON(http.StatusOK, data)
	}
}
