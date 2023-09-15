package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/roglau/WEB-RA-231/graph/model"
)

// CreateStory is the resolver for the createStory field.
func (r *mutationResolver) CreateStory(ctx context.Context, inputStory model.NewStory) (*model.Story, error) {
	story := &model.Story{
		// ctrl .
		ID:        uuid.NewString(),
		UserID:    inputStory.UserID,
		Image:     inputStory.Image,
		Text:      inputStory.Text,
		BgColor:   inputStory.BgColor,
		CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}

	return story, r.DB.Save(&story).Error
}

// GetAllStoryUser is the resolver for the getAllStoryUser field.
func (r *queryResolver) GetAllStoryUser(ctx context.Context, userID string) (*model.StoryList, error) {
	var stories []*model.Story

	// oneDayAgo := time.Now().Add(-24 * time.Hour)
	location, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		// Handle the error
		return nil, err
	}

	// Query stories for the user and then filter based on createdAt
	if err := r.DB.Where("user_id = ?", userID).Find(&stories).Error; err != nil {
		return nil, err
	}

	// Filter stories based on createdAt within the last day
	var recentStories []*model.Story
	for _, story := range stories {
		createdAt, err := time.ParseInLocation("2006-01-02 15:04:05", story.CreatedAt, location)
		if err != nil {
			// Handle parsing error
			continue
		}

		duration := time.Since(createdAt)
		// fmt.Println(duration, createdAt)
		// Compare the duration with a 24-hour duration
		if duration <= 24*time.Hour {
			recentStories = append(recentStories, story)
		}

	}

	user, err := r.Query().GetUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	storyList := &model.StoryList{
		Stories: recentStories,
		User:    user,
	}

	return storyList, nil
}

// GetAllStory is the resolver for the getAllStory field.
func (r *queryResolver) GetAllStory(ctx context.Context, userID string) ([]*model.StoryList, error) {
	friendDetails, err := r.GetAllFriend(ctx, userID)
	if err != nil {
		return nil, err
	}

	var friendStories []*model.StoryList

	userStoryList, err := r.GetAllStoryUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(userStoryList.Stories) > 0 {
		friendStories = append(friendStories, userStoryList)
	}

	for _, friend := range friendDetails {
		storyList, err := r.GetAllStoryUser(ctx, friend.ID)
		if err != nil {
			return nil, err
		}
		if len(storyList.Stories) > 0 {
			friendStories = append(friendStories, storyList)
		}
	}

	return friendStories, nil
}
