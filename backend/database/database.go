package database

import (
	"github.com/roglau/WEB-RA-231/graph/model"
	"github.com/roglau/WEB-RA-231/helper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var database *gorm.DB

const defaultDatabase = "host=localhost user=guidowilliam password= dbname=postgres port=9920 sslmode=disable TimeZone=Asia/Shanghai"

func GetInstance() *gorm.DB {
	if database == nil {
		dsn := helper.GoDotEnvVariable("DATABASE_URL")

		if dsn == "" {
			dsn = defaultDatabase
		}

		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

		if err != nil {
			panic(err)
		}

		database = db
	}

	return database
}

func MigrateTable() {
	db := GetInstance()
	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Post{})
	db.AutoMigrate(&model.PostMedia{})
	db.AutoMigrate(&model.PostComment{})
	db.AutoMigrate(&model.PostLike{})
	db.AutoMigrate(&model.LikeComment{})
	db.AutoMigrate(&model.ReplyComment{})
	db.AutoMigrate(&model.Story{})
	db.AutoMigrate(&model.FriendRequest{})
	db.AutoMigrate(&model.Friend{})
	db.AutoMigrate(&model.Reels{})
    db.AutoMigrate(&model.Conversations{})
	db.AutoMigrate(&model.ConversationDetails{})
    db.AutoMigrate(&model.Messages{})
	db.AutoMigrate(&model.Notification{})
	db.AutoMigrate(&model.Group{})
	db.AutoMigrate(&model.GroupMembers{})
	db.AutoMigrate(&model.GroupInvited{})
	db.AutoMigrate(&model.GroupPost{})
	db.AutoMigrate(&model.GroupJoin{})
	db.AutoMigrate(&model.GroupFiles{})
}
