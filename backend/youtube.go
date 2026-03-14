package main

import (
	"context"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/youtube/v3"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// uploadVideoToYouTube uploads the video from GCS to the channel linked to the account.
// It updates the target in Firestore with remoteId, remoteUrl on success, or status ERROR on failure.
func (s *Server) uploadVideoToYouTube(ctx context.Context, video Video, target UploadTarget, account Account) error {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	bucketName := os.Getenv("GCS_BUCKET")
	if clientID == "" || clientSecret == "" {
		return errConfig("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET manquants")
	}
	if bucketName == "" {
		return errConfig("GCS_BUCKET manquant")
	}

	// OAuth2 client with account tokens (refresh if expired)
	conf := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint,
		Scopes:       []string{"https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"},
	}
	var expiry time.Time
	if account.TokenExpiresAt != nil {
		expiry = *account.TokenExpiresAt
	}
	tok := &oauth2.Token{
		AccessToken:  account.AccessToken,
		RefreshToken: account.RefreshToken,
		Expiry:       expiry,
	}
	tokenSource := oauth2.ReuseTokenSource(tok, conf.TokenSource(ctx, tok))
	client := oauth2.NewClient(ctx, tokenSource)

	// YouTube service
	yt, err := youtube.New(client)
	if err != nil {
		return err
	}

	// GCS reader for the video file
	if s.gcsClient == nil {
		return errConfig("stockage GCS non configuré")
	}
	bucket := s.gcsClient.Bucket(bucketName)
	obj := bucket.Object(video.S3Key)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return err
	}
	defer reader.Close()

	// Privacy status
	privacy := "public"
	switch video.Visibility {
	case "PRIVATE":
		privacy = "private"
	case "SCHEDULED":
		privacy = "private" // YouTube: schedule with publishAt
	case "UNLISTED":
		privacy = "unlisted"
	}

	req := &youtube.Video{
		Snippet: &youtube.VideoSnippet{
			Title:       video.Title,
			Description: video.Description,
			Tags:        video.Tags,
		},
		Status: &youtube.VideoStatus{
			PrivacyStatus: privacy,
			SelfDeclaredMadeForKids: false,
		},
	}
	if video.Visibility == "SCHEDULED" && video.ScheduledAt != nil {
		req.Status.PublishAt = video.ScheduledAt.Format(time.RFC3339)
	}

	call := yt.Videos.Insert([]string{"snippet", "status"}, req).Context(ctx)
	res, err := call.Media(reader).Do()
	if err != nil {
		return err
	}
	if res.Id == "" {
		return errConfig("YouTube n'a pas renvoyé d'id vidéo")
	}

	remoteURL := "https://www.youtube.com/watch?v=" + res.Id
	tRef := s.fs.Collection("uploadTargets").Doc(target.ID)
	_, err = tRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: "PUBLISHED"},
		{Path: "progress", Value: 100},
		{Path: "remoteId", Value: res.Id},
		{Path: "remoteUrl", Value: remoteURL},
	})
	if err != nil {
		log.Printf("failed to update target %s: %v", target.ID, err)
	}
	return nil
}

type errConfig string

func (e errConfig) Error() string { return string(e) }
