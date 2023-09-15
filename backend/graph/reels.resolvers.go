package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"

	"github.com/google/uuid"
	"github.com/roglau/WEB-RA-231/graph/model"
)

// CreateReels is the resolver for the createReels field.
func (r *mutationResolver) CreateReels(ctx context.Context, inputReels model.NewReels) (*model.Reels, error) {
	reels := &model.Reels{
		// ctrl .
		ID:     uuid.NewString(),
		Video:  inputReels.Video,
		Text:   inputReels.Text,
		UserID: inputReels.UserID,
	}

	return reels, r.DB.Save(&reels).Error
}

// GetAllReels is the resolver for the getAllReels field.
func (r *queryResolver) GetAllReels(ctx context.Context) ([]*model.ReelsList, error) {
	var reels []*model.Reels

	if err := r.DB.Find(&reels).Error; err != nil {
		return nil, err
	}

	var reelsList []*model.ReelsList

	for _, reel := range reels {

		user, err := r.Query().GetUser(ctx, reel.UserID)
		if err != nil {
			return nil, err
		}

		comments, err := r.Query().GetAllCommentPost(ctx, reel.ID)
		if err != nil {
			return nil, err
		}

		likes, err := r.Query().GetAllLikePost(ctx, reel.ID)

		if err != nil {
			return nil, err
		}

		reelsList = append(reelsList, &model.ReelsList{
			Reels:    reel,
			User:     user,
			Comments: comments,
			Likes:    likes,
		})
	}

	return reelsList, nil
}

// GetReels is the resolver for the getReels field.
func (r *queryResolver) GetReels(ctx context.Context, id string) (*model.ReelsList, error) {
	var reel *model.Reels

	if err := r.DB.Where("id = ?", id).Find(&reel).Error; err != nil {
		return nil, err
	}

	user, err := r.Query().GetUser(ctx, reel.UserID)
	if err != nil {
		return nil, err
	}

	comments, err := r.Query().GetAllCommentPost(ctx, reel.ID)
	if err != nil {
		return nil, err
	}

	likes, err := r.Query().GetAllLikePost(ctx, reel.ID)

	if err != nil {
		return nil, err
	}

	reelsList := &model.ReelsList{
		Reels:    reel,
		User:     user,
		Comments: comments,
		Likes:    likes,
	}

	return reelsList, nil
}

// GetAllReelsUser is the resolver for the getAllReelsUser field.
func (r *queryResolver) GetAllReelsUser(ctx context.Context, userID string) ([]*model.ReelsList, error) {
	var reels []*model.Reels

	if err := r.DB.Where("user_id = ?", userID).Find(&reels).Error; err != nil {
		return nil, err
	}

	var reelsList []*model.ReelsList

	for _, reel := range reels {

		user, err := r.Query().GetUser(ctx, reel.UserID)
		if err != nil {
			return nil, err
		}

		comments, err := r.Query().GetAllCommentPost(ctx, reel.ID)
		if err != nil {
			return nil, err
		}

		likes, err := r.Query().GetAllLikePost(ctx, reel.ID)

		if err != nil {
			return nil, err
		}

		reelsList = append(reelsList, &model.ReelsList{
			Reels:    reel,
			User:     user,
			Comments: comments,
			Likes:    likes,
		})
	}

	return reelsList, nil
}