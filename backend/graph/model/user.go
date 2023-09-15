package model

import "golang.org/x/crypto/bcrypt"

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email" gorm:"unique"`
	Firstname string `json:"firstname"`
	Surname   string `json:"surname"`
	Dob       string `json:"dob"`
	Gender    string `json:"gender"`
	Password  string `json:"password"`
	Activated bool   `json:"activated"`
	Profile string `json:"profile"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
