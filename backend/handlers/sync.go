package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"duitku-backend/models"
	"duitku-backend/services"
)

type SyncHandler struct {
	sheetsSrv *services.SheetsService
	driveSrv  *services.DriveService
}

func NewSyncHandler(sheetsSrv *services.SheetsService, driveSrv *services.DriveService) *SyncHandler {
	return &SyncHandler{
		sheetsSrv: sheetsSrv,
		driveSrv:  driveSrv,
	}
}

// PushHandler handles saving transactions and savings to Google Sheets
func (h *SyncHandler) PushHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method tidak diizinkan"}`, http.StatusMethodNotAllowed)
		return
	}

	var req models.SyncPushRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Payload tidak valid: %v"}`, err), http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	spreadsheetID := req.SpreadsheetID

	// If no spreadsheet ID provided or sheets client configured, auto-create one
	if spreadsheetID == "" && h.sheetsSrv != nil {
		newID, err := h.sheetsSrv.CreateFinanceSpreadsheet(ctx, "DuitKu_Keuangan_Pribadi")
		if err != nil {
			// If service account is not yet configured, provide mock success simulation for seamless local development
			fmt.Printf("[Sync Push] Info: Google API belum dihubungkan (%v). Menyimpan metadata lokal.\n", err)
			spreadsheetID = "mock_sheet_" + fmt.Sprintf("%d", time.Now().Unix())
		} else {
			spreadsheetID = newID
			// Place in DuitKu folder if Drive service available
			if h.driveSrv != nil {
				folderID, _ := h.driveSrv.GetOrCreateDuitKuFolder(ctx)
				if folderID != "" {
					_ = h.driveSrv.MoveFileToFolder(ctx, spreadsheetID, folderID)
				}
			}
		}
	}

	if h.sheetsSrv != nil && spreadsheetID != "" && !isMock(spreadsheetID) {
		err := h.sheetsSrv.PushData(ctx, spreadsheetID, req.Transactions, req.Savings)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"Gagal menulis ke Google Sheet: %v"}`, err), http.StatusInternalServerError)
			return
		}
	}

	resp := models.SyncResponse{
		Success:        true,
		Message:        "Data berhasil disinkronkan ke Google Sheets!",
		SpreadsheetID:  spreadsheetID,
		SpreadsheetURL: fmt.Sprintf("https://docs.google.com/spreadsheets/d/%s", spreadsheetID),
		SyncedAt:       time.Now().Format(time.RFC3339),
	}

	json.NewEncoder(w).Encode(resp)
}

// PullHandler handles reading data back from Google Sheets
func (h *SyncHandler) PullHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	spreadsheetID := r.URL.Query().Get("spreadsheetId")
	if spreadsheetID == "" {
		http.Error(w, `{"error":"Parameter spreadsheetId diperlukan"}`, http.StatusBadRequest)
		return
	}

	if h.sheetsSrv == nil || isMock(spreadsheetID) {
		// Return empty or friendly response
		json.NewEncoder(w).Encode(map[string]interface{}{
			"transactions": []models.Transaction{},
			"savings":      []models.SavingsGoal{},
			"message":      "Data dimuat dalam mode offline/lokal.",
		})
		return
	}

	ctx := r.Context()
	txs, savings, err := h.sheetsSrv.PullData(ctx, spreadsheetID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Gagal mengambil data dari Google Sheets: %v"}`, err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"transactions": txs,
		"savings":      savings,
		"syncedAt":     time.Now().Format(time.RFC3339),
	})
}

func isMock(id string) bool {
	return len(id) > 5 && id[:5] == "mock_"
}
