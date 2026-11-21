package services

import (
	"context"
	"fmt"
	"google.golang.org/api/drive/v3"
)

type DriveService struct {
	srv *drive.Service
}

func NewDriveService(srv *drive.Service) *DriveService {
	return &DriveService{srv: srv}
}

// GetOrCreateDuitKuFolder finds or creates the "DuitKu" folder in user's Google Drive
func (d *DriveService) GetOrCreateDuitKuFolder(ctx context.Context) (string, error) {
	if d.srv == nil {
		return "", fmt.Errorf("Google Drive service tidak aktif")
	}

	// Search for existing folder
	query := "mimeType='application/vnd.google-apps.folder' and name='DuitKu' and trashed=false"
	r, err := d.srv.Files.List().Q(query).Fields("files(id, name)").Context(ctx).Do()
	if err == nil && len(r.Files) > 0 {
		return r.Files[0].Id, nil
	}

	// Create new folder
	folderMeta := &drive.File{
		Name:     "DuitKu",
		MimeType: "application/vnd.google-apps.folder",
	}

	folder, err := d.srv.Files.Create(folderMeta).Fields("id").Context(ctx).Do()
	if err != nil {
		return "", fmt.Errorf("gagal membuat folder DuitKu di Google Drive: %w", err)
	}

	return folder.Id, nil
}

// MoveFileToFolder moves spreadsheet into the DuitKu folder
func (d *DriveService) MoveFileToFolder(ctx context.Context, fileID, folderID string) error {
	if d.srv == nil {
		return nil
	}

	// Retrieve existing parents
	f, err := d.srv.Files.Get(fileID).Fields("parents").Context(ctx).Do()
	if err != nil {
		return err
	}

	prevParents := ""
	for i, p := range f.Parents {
		if i > 0 {
			prevParents += ","
		}
		prevParents += p
	}

	// Move file
	_, err = d.srv.Files.Update(fileID, nil).
		AddParents(folderID).
		RemoveParents(prevParents).
		Fields("id, parents").
		Context(ctx).
		Do()

	return err
}
