package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"time"

	firebase "firebase.google.com/go/v4"
	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/joho/godotenv"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type Server struct {
	fs        *firestore.Client
	gcsClient *storage.Client
}

type Account struct {
	ID              string     `json:"id" firestore:"id"`
	UserID          string     `json:"userId" firestore:"userId"`
	Provider        string     `json:"provider" firestore:"provider"`
	ExternalID      string     `json:"externalId" firestore:"externalId"`
	DisplayName     string     `json:"displayName,omitempty" firestore:"displayName,omitempty"`
	AliasName       string     `json:"aliasName,omitempty" firestore:"aliasName,omitempty"`
	AvatarURL       string     `json:"avatarUrl,omitempty" firestore:"avatarUrl,omitempty"`
	AccessToken     string     `json:"-" firestore:"accessToken,omitempty"`
	RefreshToken    string     `json:"-" firestore:"refreshToken,omitempty"`
	TokenExpiresAt  *time.Time `json:"-" firestore:"tokenExpiresAt,omitempty"`
	Scope           string     `json:"-" firestore:"scope,omitempty"`
	CreatedAt       time.Time  `json:"createdAt" firestore:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt" firestore:"updatedAt"`
}

type AccountUpsertRequest struct {
	UserID         string  `json:"userId"`
	Provider       string  `json:"provider"`
	ExternalID     string  `json:"externalId"`
	DisplayName    string  `json:"displayName,omitempty"`
	AvatarURL      string  `json:"avatarUrl,omitempty"`
	AccessToken    string  `json:"accessToken"`
	RefreshToken   string  `json:"refreshToken,omitempty"`
	TokenExpiresAt *string `json:"tokenExpiresAt,omitempty"` // ISO8601
	Scope          string  `json:"scope,omitempty"`
}

type Video struct {
	ID           string    `json:"id" firestore:"id"`
	UserID       string    `json:"userId" firestore:"userId"`
	S3Key        string    `json:"s3Key" firestore:"s3Key"`
	Title        string    `json:"title" firestore:"title"`
	Description  string    `json:"description,omitempty" firestore:"description,omitempty"`
	Tags         []string  `json:"tags" firestore:"tags"`
	Visibility   string    `json:"visibility" firestore:"visibility"`
	ScheduledAt  *time.Time `json:"scheduledAt,omitempty" firestore:"scheduledAt,omitempty"`
	CreatedAt    time.Time `json:"createdAt" firestore:"createdAt"`
}

type UploadTarget struct {
	ID         string    `json:"id" firestore:"id"`
	VideoID    string    `json:"videoId" firestore:"videoId"`
	AccountID  string    `json:"accountId" firestore:"accountId"`
	Provider   string    `json:"provider" firestore:"provider"`
	Status     string    `json:"status" firestore:"status"`
	Progress   int       `json:"progress" firestore:"progress"`
	Error      string    `json:"errorMessage,omitempty" firestore:"errorMessage,omitempty"`
	RemoteID   string    `json:"remoteId,omitempty" firestore:"remoteId,omitempty"`
	RemoteURL  string    `json:"remoteUrl,omitempty" firestore:"remoteUrl,omitempty"`
	CreatedAt  time.Time `json:"createdAt" firestore:"createdAt"`
}

type UploadRequest struct {
	UserID      string   `json:"userId"`
	Accounts    []string `json:"accounts"`
	S3Key       string   `json:"s3Key"`
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	Visibility  string   `json:"visibility,omitempty"`
	ScheduledAt *string  `json:"scheduledAt,omitempty"`
}

func main() {
	// Charger .env (backend/.env ou repo/.env selon d'où on lance)
	if err := godotenv.Load(".env"); err != nil {
		_ = godotenv.Load(filepath.Join("..", ".env"))
	}

	ctx := context.Background()

	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		log.Fatal("FIREBASE_PROJECT_ID is required")
	}

	var app *firebase.App
	var err error

	credFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credFile != "" {
		app, err = firebase.NewApp(ctx, &firebase.Config{ProjectID: projectID}, option.WithCredentialsFile(credFile))
	} else {
		app, err = firebase.NewApp(ctx, &firebase.Config{ProjectID: projectID})
	}
	if err != nil {
		log.Fatalf("error initializing firebase app: %v", err)
	}

	fs, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error initializing firestore: %v", err)
	}
	defer fs.Close()

	var gcsClient *storage.Client
	if credFile != "" {
		gcsClient, err = storage.NewClient(ctx, option.WithCredentialsFile(credFile))
		if err != nil {
			log.Fatalf("error initializing GCS client: %v", err)
		}
		defer gcsClient.Close()
	}

	s := &Server{fs: fs, gcsClient: gcsClient}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.handleHealth)
	mux.HandleFunc("GET /accounts", s.handleAccounts)
	mux.HandleFunc("POST /accounts/upsert", s.handleAccountsUpsert)
	mux.HandleFunc("GET /history", s.handleHistory)
	mux.HandleFunc("GET /uploads/status", s.handleStatus)
	mux.HandleFunc("POST /upload", s.handleUpload)

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	log.Printf("Go backend listening on %s", addr)
	if err := http.ListenAndServe(addr, cors(mux)); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-Id")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleAccounts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("x-user-id")
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing user context"})
		return
	}

	// Requête sans OrderBy pour éviter l’index composite Firestore ; tri en mémoire
	iter := s.fs.Collection("accounts").Where("userId", "==", userID).Documents(ctx)
	var accounts []Account
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("accounts query error: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load accounts", "details": err.Error()})
			return
		}
		var a Account
		if err := doc.DataTo(&a); err == nil {
			accounts = append(accounts, a)
		}
	}
	// Tri par createdAt décroissant
	sort.Slice(accounts, func(i, j int) bool { return accounts[i].CreatedAt.After(accounts[j].CreatedAt) })

	writeJSON(w, http.StatusOK, map[string]any{"accounts": accounts})
}

func (s *Server) handleAccountsUpsert(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var body AccountUpsertRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	if body.UserID == "" || body.Provider == "" || body.ExternalID == "" || body.AccessToken == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
		return
	}

	docID := body.UserID + "-" + body.Provider + "-" + body.ExternalID
	ref := s.fs.Collection("accounts").Doc(docID)
	now := time.Now()

	var tokenExpiresAt *time.Time
	if body.TokenExpiresAt != nil && *body.TokenExpiresAt != "" {
		if t, err := time.Parse(time.RFC3339, *body.TokenExpiresAt); err == nil {
			tokenExpiresAt = &t
		}
	}

	acc := Account{
		ID:             docID,
		UserID:         body.UserID,
		Provider:       body.Provider,
		ExternalID:     body.ExternalID,
		DisplayName:    body.DisplayName,
		AvatarURL:      body.AvatarURL,
		AccessToken:    body.AccessToken,
		RefreshToken:   body.RefreshToken,
		TokenExpiresAt: tokenExpiresAt,
		Scope:          body.Scope,
		UpdatedAt:      now,
	}

	existing, err := ref.Get(ctx)
	if err != nil || !existing.Exists() {
		acc.CreatedAt = now
	} else {
		var existingAcc Account
		if err := existing.DataTo(&existingAcc); err == nil {
			acc.CreatedAt = existingAcc.CreatedAt
		} else {
			acc.CreatedAt = now
		}
	}

	if _, err := ref.Set(ctx, acc); err != nil {
		log.Printf("accounts upsert error: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save account"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": docID})
}

func (s *Server) handleHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("x-user-id")
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing user context"})
		return
	}

	iter := s.fs.Collection("videos").Where("userId", "==", userID).OrderBy("createdAt", firestore.Desc).Limit(20).Documents(ctx)
	type VideoWithTargets struct {
		Video
		UploadTargets []UploadTarget `json:"uploadTargets"`
	}
	var result []VideoWithTargets

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("history query error: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load history"})
			return
		}
		var v Video
		if err := doc.DataTo(&v); err != nil {
			continue
		}
		targetIter := s.fs.Collection("uploadTargets").Where("videoId", "==", v.ID).Documents(ctx)
		var targets []UploadTarget
		for {
			td, err := targetIter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				break
			}
			var t UploadTarget
			if err := td.DataTo(&t); err == nil {
				targets = append(targets, t)
			}
		}
		result = append(result, VideoWithTargets{Video: v, UploadTargets: targets})
	}

	writeJSON(w, http.StatusOK, map[string]any{"videos": result})
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("x-user-id")
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing user context"})
		return
	}

	accountsCount, _ := s.fs.Collection("accounts").Where("userId", "==", userID).Documents(ctx).GetAll()
	videosCount, _ := s.fs.Collection("videos").Where("userId", "==", userID).Documents(ctx).GetAll()

	runningSnap, _ := s.fs.Collection("uploadTargets").Where("status", "==", "UPLOADING").Where("userId", "==", userID).Documents(ctx).GetAll()
	errorSnap, _ := s.fs.Collection("uploadTargets").Where("status", "==", "ERROR").Where("userId", "==", userID).Documents(ctx).GetAll()

	iter := s.fs.Collection("uploadTargets").Where("userId", "==", userID).OrderBy("createdAt", firestore.Desc).Limit(10).Documents(ctx)
	var recent []UploadTarget
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			break
		}
		var t UploadTarget
		if err := doc.DataTo(&t); err == nil {
			recent = append(recent, t)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"counts": map[string]any{
			"accounts": len(accountsCount),
			"videos":   len(videosCount),
			"running":  len(runningSnap),
			"errors":   len(errorSnap),
		},
		"recentTargets": recent,
	})
}

func (s *Server) handleUpload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var body UploadRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	if body.UserID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing user context"})
		return
	}
	if body.S3Key == "" || body.Title == "" || len(body.Accounts) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
		return
	}

	now := time.Now()
	videoRef := s.fs.Collection("videos").NewDoc()
	video := Video{
		ID:          videoRef.ID,
		UserID:      body.UserID,
		S3Key:       body.S3Key,
		Title:       body.Title,
		Description: body.Description,
		Tags:        body.Tags,
		Visibility:  firstNonEmpty(body.Visibility, "PUBLIC"),
		CreatedAt:   now,
	}
	if body.ScheduledAt != nil && *body.ScheduledAt != "" {
		if t, err := time.Parse(time.RFC3339, *body.ScheduledAt); err == nil {
			video.ScheduledAt = &t
		}
	}

	batch := s.fs.Batch()
	batch.Set(videoRef, video)

	var targets []UploadTarget
	for _, accID := range body.Accounts {
		tRef := s.fs.Collection("uploadTargets").NewDoc()
		t := UploadTarget{
			ID:        tRef.ID,
			VideoID:   video.ID,
			AccountID: accID,
			Provider:  "YOUTUBE",
			Status:    "UPLOADING",
			Progress:  0,
			CreatedAt: now,
		}
		batch.Set(tRef, t)
		targets = append(targets, t)
	}

	if _, err := batch.Commit(ctx); err != nil {
		log.Printf("upload commit error: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create upload"})
		return
	}

	// Upload vers YouTube pour chaque compte
	for i := range targets {
		t := &targets[i]
		accSnap, err := s.fs.Collection("accounts").Doc(t.AccountID).Get(ctx)
		if err != nil {
			s.setTargetError(ctx, t.ID, "compte introuvable")
			t.Status = "ERROR"
			t.Error = "compte introuvable"
			continue
		}
		var acc Account
		if err := accSnap.DataTo(&acc); err != nil {
			s.setTargetError(ctx, t.ID, "compte invalide")
			t.Status = "ERROR"
			t.Error = "compte invalide"
			continue
		}
		if acc.AccessToken == "" {
			s.setTargetError(ctx, t.ID, "token manquant, reconnectez le compte")
			t.Status = "ERROR"
			t.Error = "token manquant"
			continue
		}
		if err := s.uploadVideoToYouTube(ctx, video, *t, acc); err != nil {
			log.Printf("YouTube upload failed for target %s: %v", t.ID, err)
			s.setTargetError(ctx, t.ID, err.Error())
			t.Status = "ERROR"
			t.Error = err.Error()
		} else {
			t.Status = "PUBLISHED"
			t.Progress = 100
			// remoteId/remoteUrl sont mis à jour dans uploadVideoToYouTube
			tRef := s.fs.Collection("uploadTargets").Doc(t.ID)
			if snap, _ := tRef.Get(ctx); snap.Exists() {
				_ = snap.DataTo(t)
			}
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"videoId": video.ID,
		"targets": targets,
	})
}

func (s *Server) setTargetError(ctx context.Context, targetID, errMsg string) {
	tRef := s.fs.Collection("uploadTargets").Doc(targetID)
	_, _ = tRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: "ERROR"},
		{Path: "errorMessage", Value: errMsg},
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

