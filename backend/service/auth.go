package service

import (
	"context"

	"github.com/roglau/WEB-RA-231/graph/model"
	// "github.com/vektah/gqlparser/v2/gqlerror"
	// "gorm.io/gorm"
)

// func UserRegister(ctx context.Context, input model.NewUser) (interface{}, error) {
// 	// Check Email
// 	_, err := 	(ctx, input.Email)
// 	if err == nil {
// 		// if err != record not found
// 		if err != gorm.ErrRecordNotFound {
// 			return nil, err
// 		}
// 	}

// 	createdUser, err := UserCreate(ctx, input)
// 	if err != nil {
// 		return nil, err
// 	}

// 	token, err := JwtGenerate(ctx, createdUser.ID)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return map[string]interface{}{
// 		"token": token,
// 	}, nil
// }

func UserLogin(ctx context.Context, email string, password string, ID string, inputtedPass string) (string, error) {

	if !model.CheckPasswordHash(inputtedPass, password) {
		return "Email and password is not valid", nil
	}

	token, err := JwtGenerate(ctx, ID)
	if err != nil {
		return "Email and password is not valid", err
	}

	return token, nil
}
