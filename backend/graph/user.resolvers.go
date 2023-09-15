package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/roglau/WEB-RA-231/graph/model"
	"github.com/roglau/WEB-RA-231/service"
	"gorm.io/gorm"
)

func isValidEmail(email string) bool {
	emailPattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$`
	return regexp.MustCompile(emailPattern).MatchString(email)
}

func isValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasLetter := false
	for _, char := range password {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') {
			hasLetter = true
			break
		}
	}
	if !hasLetter {
		return false
	}

	hasDigit := false
	for _, char := range password {
		if char >= '0' && char <= '9' {
			hasDigit = true
			break
		}
	}

	return hasDigit && hasLetter
}

type CustomError string

// Error returns the error message as a string
func (e CustomError) Error() string {
	return string(e)
}

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, inputUser model.NewUser) (*model.User, error) {

	if !isValidEmail(inputUser.Email) {
		return nil, CustomError("Invalid email format")
	}

	if !isValidPassword(inputUser.Password) {
		return nil, CustomError("Invalid password format, must be min 8 length and alphanumeric")
	}

	// Validate Firstname length only if it's not empty
	if len(inputUser.Firstname) > 0 && len(inputUser.Firstname) < 4 {
		return nil, CustomError("Firstname must be at least 4 characters")
	}

	// Validate Surname length only if it's not empty
	if len(inputUser.Surname) > 0 && len(inputUser.Surname) < 4 {
		return nil, CustomError("Surname must be at least 4 characters")
	}

	if inputUser.Gender != "Male" && inputUser.Gender != "Female" {
		return nil, CustomError("Invalid gender")
	}

	password, err := model.HashPassword(inputUser.Password)

	if err != nil {
		return nil, err
	}

	profile := "https://res.cloudinary.com/diuzx0kak/image/upload/v1691992390/fxauqa7a3bqctevcfhiu.png"

	user := &model.User{
		// ctrl .
		ID:        uuid.NewString(),
		Email:     inputUser.Email,
		Firstname: inputUser.Firstname,
		Surname:   inputUser.Surname,
		Dob:       inputUser.Dob,
		Gender:    inputUser.Gender,
		Password:  password,
		Activated: inputUser.Activated,
		Profile:   profile,
	}

	return user, r.DB.Save(&user).Error
}

// UpdateUser is the resolver for the updateUser field.
func (r *mutationResolver) UpdateUser(ctx context.Context, id string, inputUser model.NewUser) (*model.User, error) {
	var user *model.User

	r.DB.First(&user, "id = ?", id)

	if err := r.DB.First(&user, "id = ?", id).Error; err != nil {
		//halo ger ini geru bukan siapa siapa
		return nil, err
	}

	user.Email = inputUser.Email
	user.Firstname = inputUser.Firstname
	user.Surname = inputUser.Surname
	user.Dob = inputUser.Dob
	user.Gender = inputUser.Gender
	user.Password = inputUser.Password

	return user, r.DB.Save(&user).Error
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, id string) (*model.User, error) {
	var user *model.User

	if err := r.DB.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return user, r.DB.Delete(&user).Error
}

// LoginUser is the resolver for the loginUser field.
func (r *mutationResolver) LoginUser(ctx context.Context, email string, password string) (string, error) {
	var user *model.User

	if err := r.DB.First(&user, "email = ? AND activated = ?", email, true).Error; err != nil {
		return "Email and password is not valid", err
	}

	return service.UserLogin(ctx, user.Email, user.Password, user.ID, password)
}

// ActivateUser is the resolver for the activateUser field.
func (r *mutationResolver) ActivateUser(ctx context.Context, id string) (string, error) {
	var user *model.User

	r.DB.First(&user, "id = ?", id)

	if err := r.DB.First(&user, "id = ?", id).Error; err != nil {
		return "", err
	}

	user.Activated = true

	return "Success", r.DB.Save(&user).Error
}

// UpdatePassword is the resolver for the updatePassword field.
func (r *mutationResolver) UpdatePassword(ctx context.Context, email string, password string) (string, error) {
	var user *model.User

	r.DB.First(&user, "email = ?", email)

	if err := r.DB.First(&user, "email = ?", email).Error; err != nil {
		return "Email not found", err
	}

	passwordHashed, err := model.HashPassword(password)
	if err != nil {
		return "Hash error", err
	}

	if model.CheckPasswordHash(password, user.Password) {
		return "New password must be different from the old password", nil
	}

	user.Password = passwordHashed

	return "Success", r.DB.Save(&user).Error
}

// GetUserWToken is the resolver for the getUserWToken field.
func (r *mutationResolver) GetUserWToken(ctx context.Context, token string) (*model.User, error) {
	var user *model.User

	jwtToken, err := service.JwtValidate(ctx, token)
	if err != nil {
		return nil, err
	}

	if claims, ok := jwtToken.Claims.(*service.JwtCustom); ok && jwtToken.Valid {
		// Access user ID from the custom claims
		userID := claims.ID
		// fmt.Println(userID)
		r.DB.First(&user, "id = ?", userID)

		// Use the userID to fetch the user from your data source
		// For example:
		// user, err = r.DB.GetUserByID(ctx, userID)

		// Return the user object
		return user, nil
	}
	return user, nil
}

// UpdateProfile is the resolver for the updateProfile field.
func (r *mutationResolver) UpdateProfile(ctx context.Context, id string, profile string) (string, error) {
	var user *model.User

	r.DB.First(&user, "id = ?", id)

	if err := r.DB.First(&user, "id = ?", id).Error; err != nil {
		return "", err
	}

	user.Profile = profile

	return "Success", r.DB.Save(&user).Error
}

// GetUser is the resolver for the getUser field.
func (r *queryResolver) GetUser(ctx context.Context, id string) (*model.User, error) {
	var user *model.User

	err := r.DB.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	// fmt.Println(user.Profile)

	return user, nil
}

// GetAllUser is the resolver for the getAllUser field.
func (r *queryResolver) GetAllUser(ctx context.Context) ([]*model.User, error) {
	var users []*model.User

	return users, r.DB.Find(&users).Error
}

// GetEmail is the resolver for the getEmail field.
func (r *queryResolver) GetEmail(ctx context.Context, email string) (*model.User, error) {
	var user *model.User

	return user, r.DB.First(&user, "email = ?", email).Error
}

// GetAllUserName is the resolver for the getAllUserName field.
func (r *queryResolver) GetAllUserName(ctx context.Context, name string, id string) ([]*model.UserWRequest, error) {
	var users []*model.User

	nameLower := strings.ToLower(name) // Convert name to lowercase

	if err := r.DB.Where("LOWER(firstname) LIKE ? OR LOWER(surname) LIKE ?", "%"+nameLower+"%", "%"+nameLower+"%").Find(&users).Error; err != nil {
		return nil, err
	}

	userWithRequestsList := []*model.UserWRequest{}
	for _, user := range users {
		hasFriendRequest, err := r.HasFriendRequest(ctx, id, user.ID)
		if err != nil {
			return nil, err
		}

		hasSentRequest, err := r.HasSentRequest(ctx, id, user.ID)
		if err != nil {
			return nil, err
		}

		isFriend, err := r.AreFriends(ctx, id, user.ID)
		if err != nil {
			return nil, err
		}

		userWithRequests := &model.UserWRequest{
			User:             user,
			HasFriendRequest: hasFriendRequest,
			HasSentRequest:   hasSentRequest,
			IsFriend:         isFriend,
		}

		userWithRequestsList = append(userWithRequestsList, userWithRequests)
	}

	return userWithRequestsList, nil
}

// GetFriendSuggestions is the resolver for the getFriendSuggestions field.
func (r *queryResolver) GetFriendSuggestions(ctx context.Context, userID string) ([]*model.UserNMutual, error) {
	// Get the user's friends
	var userFriends []*model.Friend
	if err := r.DB.Where("user_id = ?", userID).Find(&userFriends).Error; err != nil {
		return nil, err
	}

	// Get the user's friend IDs
	var friendIDs []string
	for _, friend := range userFriends {
		friendIDs = append(friendIDs, friend.FriendID)
	}

	// Get the friends of the user's friends
	var friendsOfFriends []*model.Friend
	if err := r.DB.Where("user_id IN ?", friendIDs).Find(&friendsOfFriends).Error; err != nil {
		return nil, err
	}

	// Filter out friends of the user and friends of friends
	suggestedFriendIDs := make(map[string]bool)
	for _, fof := range friendsOfFriends {
		if fof.FriendID != userID && !contains(friendIDs, fof.FriendID) {
			suggestedFriendIDs[fof.FriendID] = true
		}
	}

	// Get the details of suggested friends
	var suggestedFriends []*model.User
	if err := r.DB.Where("id IN ?", keys(suggestedFriendIDs)).Find(&suggestedFriends).Error; err != nil {
		return nil, err
	}

	// Populate mutual friends and check for friend requests for each suggested friend
	var userNMutualList []*model.UserNMutual
	for _, suggestedFriend := range suggestedFriends {
		mutualFriends := make([]*model.User, 0)
		for _, fof := range friendsOfFriends {
			if fof.FriendID == suggestedFriend.ID && contains(friendIDs, fof.UserID) {
				mutualFriend, err := r.Query().GetUser(ctx, fof.UserID)
				if err != nil {
					return nil, err
				}
				mutualFriends = append(mutualFriends, mutualFriend)
			}
		}

		// Check if the suggested friend has sent a friend request to the current user
		var friendRequest model.FriendRequest
		if err := r.DB.Where("requester_id = ? AND target_id = ?", suggestedFriend.ID, userID).First(&friendRequest).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return nil, err
			}
		}

		// Check if the current user has sent a friend request to the suggested friend
		var sentFriendRequest model.FriendRequest
		if err := r.DB.Where("requester_id = ? AND target_id = ?", userID, suggestedFriend.ID).First(&sentFriendRequest).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return nil, err
			}
		}

		userNMutual := &model.UserNMutual{
			User:             suggestedFriend,
			Mutuals:          mutualFriends,
			HasFriendRequest: friendRequest.ID != "",     // Check if a friend request exists
			HasSentRequest:   sentFriendRequest.ID != "", // Check if a friend request has been sent
		}

		userNMutualList = append(userNMutualList, userNMutual)
	}

	return userNMutualList, nil
}

// GetUserWRequest is the resolver for the getUserWRequest field.
func (r *queryResolver) GetUserWRequest(ctx context.Context, userID string, user2id string) (*model.UserWRequest, error) {
	var user *model.User

	if err := r.DB.Where("id = ?", user2id).Find(&user).Error; err != nil {
		return nil, err
	}

	hasFriendRequest, err := r.HasFriendRequest(ctx, userID, user.ID)
	if err != nil {
		return nil, err
	}

	hasSentRequest, err := r.HasSentRequest(ctx, userID, user.ID)
	if err != nil {
		return nil, err
	}

	isFriend, err := r.AreFriends(ctx, userID, user.ID)
	if err != nil {
		return nil, err
	}

	userWithRequests := &model.UserWRequest{
		User:             user,
		HasFriendRequest: hasFriendRequest,
		HasSentRequest:   hasSentRequest,
		IsFriend:         isFriend,
	}

	return userWithRequests, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *queryResolver) GetPeopleMayKnow(ctx context.Context, userID string, friendID string) ([]*model.UserNMutual, error) {
	panic(fmt.Errorf("not implemented: GetPeopleMayKnow - getPeopleMayKnow"))
}
func (r *queryResolver) AreFriends(ctx context.Context, userID1, userID2 string) (bool, error) {
	var count int64
	if err := r.DB.Model(&model.Friend{}).Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", userID1, userID2, userID2, userID1).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
func (r *queryResolver) HasFriendRequest(ctx context.Context, userID, targetUserID string) (bool, error) {
	var count int64
	if err := r.DB.Model(&model.FriendRequest{}).Where("requester_id = ? AND target_id = ?", userID, targetUserID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
func (r *queryResolver) HasSentRequest(ctx context.Context, userID, targetUserID string) (bool, error) {
	var count int64
	if err := r.DB.Model(&model.FriendRequest{}).Where("requester_id = ? AND target_id = ?", targetUserID, userID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
func keys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}