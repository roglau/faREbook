package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"

	"github.com/google/uuid"
	"github.com/roglau/WEB-RA-231/graph/model"
)

// CreateRequest is the resolver for the createRequest field.
func (r *mutationResolver) CreateRequest(ctx context.Context, inputRequest model.NewRequest) (*model.FriendRequest, error) {
	request := &model.FriendRequest{
		// ctrl .
		ID:          uuid.NewString(),
		RequesterID: inputRequest.RequesterID,
		TargetID:    inputRequest.TargetID,
	}

	return request, r.DB.Save(&request).Error
}

// CreateFriend is the resolver for the createFriend field.
func (r *mutationResolver) CreateFriend(ctx context.Context, inputFriend model.NewFriend) (*model.Friend, error) {
	friend1 := &model.Friend{
		ID:       uuid.NewString(),
		UserID:   inputFriend.UserID,
		FriendID: inputFriend.FriendID,
	}

	friend2 := &model.Friend{
		ID:       uuid.NewString(),
		UserID:   inputFriend.FriendID,
		FriendID: inputFriend.UserID,
	}

	// Save friend2 and check for errors
	if err := r.DB.Save(&friend2).Error; err != nil {
		return nil, err
	}

	// Save friend1 and check for errors
	if err := r.DB.Save(&friend1).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Where("requester_id = ?", friend1.FriendID).Delete(&model.FriendRequest{}).Error; err != nil {
		return nil, err
	}

	return friend1, nil
}

// DeleteRequest is the resolver for the deleteRequest field.
func (r *mutationResolver) DeleteRequest(ctx context.Context, id string) (string, error) {
	err := r.DB.Where("id = ?", id).Delete(&model.FriendRequest{}).Error
	if err != nil {
		return "", err
	}

	return "Friend request deleted successfully", nil
}

// DeleteRequestTarget is the resolver for the deleteRequestTarget field.
func (r *mutationResolver) DeleteRequestTarget(ctx context.Context, id string) (string, error) {
	var request model.FriendRequest
	if err := r.DB.Where("target_id = ?", id).First(&request).Error; err != nil {
		return "", err
	}

	if err := r.DB.Delete(&request).Error; err != nil {
		return "", err
	}

	return "Friend request deleted successfully", nil
}

// DeleteRequestRequester is the resolver for the deleteRequestRequester field.
func (r *mutationResolver) DeleteRequestRequester(ctx context.Context, id string) (string, error) {
	var request model.FriendRequest
	if err := r.DB.Where("requester_id = ?", id).First(&request).Error; err != nil {
		return "", err
	}

	if err := r.DB.Delete(&request).Error; err != nil {
		return "", err
	}

	return "Friend request deleted successfully", nil
}

// GetAllRequest is the resolver for the getAllRequest field.
func (r *queryResolver) GetAllRequest(ctx context.Context, targetID string) ([]*model.RequestList, error) {
	var requests []*model.FriendRequest

	if err := r.DB.Where("target_id = ?", targetID).Find(&requests).Error; err != nil {
		return nil, err
	}

	requestLists := []*model.RequestList{}
	for _, request := range requests {
		requester, err := r.Query().GetUser(ctx, request.RequesterID)
		if err != nil {
			return nil, err
		}

		// Find mutual friends for the requester
		mutualFriends, err := r.GetMutualFriends(ctx, targetID, request.RequesterID)
		if err != nil {
			return nil, err
		}

		requestList := &model.RequestList{
			Requests: request,
			Requester: &model.UserNMutual{
				User:    requester,
				Mutuals: mutualFriends,
			},
		}

		requestLists = append(requestLists, requestList)
	}

	return requestLists, nil
}

// GetAllFriend is the resolver for the getAllFriend field.
func (r *queryResolver) GetAllFriend(ctx context.Context, userID string) ([]*model.User, error) {
	var friends []*model.Friend

	// Query the database to retrieve friends for the given user ID
	if err := r.DB.Where("user_id = ?", userID).Find(&friends).Error; err != nil {
		return nil, err
	}

	var friendIDs []string
	for _, friend := range friends {
		friendIDs = append(friendIDs, friend.FriendID)
	}

	// Query the database to retrieve user details for friend IDs
	var friendDetails []*model.User
	if err := r.DB.Where("id IN ?", friendIDs).Find(&friendDetails).Error; err != nil {
		return nil, err
	}

	return friendDetails, nil
}

// GetAllFriendWMutuals is the resolver for the getAllFriendWMutuals field.
func (r *queryResolver) GetAllFriendWMutuals(ctx context.Context, userID string) ([]*model.FriendList, error) {
	var friends []*model.Friend

	// Query the database to retrieve friends for the given user ID
	if err := r.DB.Where("user_id = ?", userID).Find(&friends).Error; err != nil {
		return nil, err
	}

	var friendIDs []string
	for _, friend := range friends {
		friendIDs = append(friendIDs, friend.FriendID)
	}

	// Query the database to retrieve user details for friend IDs
	var friendDetails []*model.User
	if err := r.DB.Where("id IN ?", friendIDs).Find(&friendDetails).Error; err != nil {
		return nil, err
	}

	var friendLists []*model.FriendList
	for _, f := range friendDetails {
		mutualFriends, err := r.GetMutualFriends(ctx, userID, f.ID)
		if err != nil {
			return nil, err
		}

		friendLists = append(friendLists, &model.FriendList{
			Friend:  f,
			Mutuals: mutualFriends,
		})
	}

	return friendLists, nil
}

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *queryResolver) GetMutualFriends(ctx context.Context, userID1, userID2 string) ([]*model.User, error) {
	currUserF, err := r.Query().GetAllFriend(ctx, userID1)
	if err != nil {
		return nil, err
	}

	requesterF, err := r.Query().GetAllFriend(ctx, userID2)
	if err != nil {
		return nil, err
	}

	mutualFriends := make([]*model.User, 0)
	for _, currFriend := range currUserF {
		if containsFriend(requesterF, currFriend) {
			mutualFriend, err := r.Query().GetUser(ctx, currFriend.ID)
			if err != nil {
				return nil, err
			}
			mutualFriends = append(mutualFriends, mutualFriend)
		}
	}

	return mutualFriends, nil
}
func containsFriend(friends []*model.User, friend *model.User) bool {
	for _, f := range friends {
		if f.ID == friend.ID {
			return true
		}
	}
	return false
}
