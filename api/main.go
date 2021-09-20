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
	"github.com/gosimple/slug"
)

const path = "../content/post/"

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
	Name        string `json:"name"`
	Title       string `json:"title"`
	Tags        string `json:"tags"`
	Categories  string `json:"categories"`
	Content     string `json:"content"`
	Author      string `json:"author"`
	Description string `json:"description"`
	Date        string `json:"date"`
}

func postArticle(c *gin.Context) {
	var dataJSON DataJSON
	err := c.BindJSON(&dataJSON)
	if err != nil {
		c.IndentedJSON(http.StatusNoContent, err)
	} else {
		content := []byte(dataJSON.Content)
		fullpath := path + dataJSON.Name + ".md"
		err := ioutil.WriteFile(fullpath, content, 0755)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, err)
		} else {
			if dataJSON.Title != "" {
				slugTitle := slug.Make(dataJSON.Title)
				if slugTitle != dataJSON.Name {
					os.Rename(fullpath, path+slugTitle+".md")
				}
				c.IndentedJSON(http.StatusOK, slugTitle)
			} else {
				c.IndentedJSON(http.StatusOK, nil)
			}
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
