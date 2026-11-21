package services

import (
	"context"
	"fmt"
	"duitku-backend/models"

	"google.golang.org/api/sheets/v4"
)

type SheetsService struct {
	srv *sheets.Service
}

func NewSheetsService(srv *sheets.Service) *SheetsService {
	return &SheetsService{srv: srv}
}

// CreateFinanceSpreadsheet creates a new Google Spreadsheet with predefined sheets & Glow-styled headers
func (s *SheetsService) CreateFinanceSpreadsheet(ctx context.Context, title string) (string, error) {
	if s.srv == nil {
		return "", fmt.Errorf("Google Sheets service belum diinisialisasi")
	}

	rb := &sheets.Spreadsheet{
		Properties: &sheets.SpreadsheetProperties{
			Title: title,
		},
		Sheets: []*sheets.Sheet{
			{
				Properties: &sheets.SheetProperties{
					Title: "Transaksi",
					GridProperties: &sheets.GridProperties{
						FrozenRowCount: 1,
					},
				},
			},
			{
				Properties: &sheets.SheetProperties{
					Title: "Target_Tabungan",
					GridProperties: &sheets.GridProperties{
						FrozenRowCount: 1,
					},
				},
			},
		},
	}

	resp, err := s.srv.Spreadsheets.Create(rb).Context(ctx).Do()
	if err != nil {
		return "", err
	}

	// Initialize headers for Transaksi
	txHeaders := []interface{}{"ID", "Tipe", "Nominal (Rp)", "Kategori", "Keterangan", "Tanggal", "Dibuat Pada"}
	_, err = s.srv.Spreadsheets.Values.Update(resp.SpreadsheetId, "Transaksi!A1:G1", &sheets.ValueRange{
		Values: [][]interface{}{txHeaders},
	}).ValueInputOption("USER_ENTERED").Context(ctx).Do()
	if err != nil {
		return resp.SpreadsheetId, err
	}

	// Initialize headers for Target Tabungan
	savingHeaders := []interface{}{"ID", "Ikon", "Nama Target", "Target (Rp)", "Terkumpul (Rp)", "Deadline", "Status"}
	_, _ = s.srv.Spreadsheets.Values.Update(resp.SpreadsheetId, "Target_Tabungan!A1:G1", &sheets.ValueRange{
		Values: [][]interface{}{savingHeaders},
	}).ValueInputOption("USER_ENTERED").Context(ctx).Do()

	return resp.SpreadsheetId, nil
}

// PushData writes transactions and savings to the spreadsheet
func (s *SheetsService) PushData(ctx context.Context, spreadsheetID string, txs []models.Transaction, savings []models.SavingsGoal) error {
	if s.srv == nil {
		return fmt.Errorf("Google Sheets API service tidak aktif")
	}

	// 1. Prepare Transaksi values
	txRows := [][]interface{}{
		{"ID", "Tipe", "Nominal (Rp)", "Kategori", "Keterangan", "Tanggal", "Dibuat Pada"},
	}
	for _, t := range txs {
		txRows = append(txRows, []interface{}{
			t.ID,
			t.Type,
			t.Amount,
			t.CategoryID,
			t.Description,
			t.Date,
			t.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	// Clear and write Transaksi
	_, _ = s.srv.Spreadsheets.Values.Clear(spreadsheetID, "Transaksi!A1:Z10000", &sheets.ClearValuesRequest{}).Context(ctx).Do()
	_, err := s.srv.Spreadsheets.Values.Update(spreadsheetID, "Transaksi!A1", &sheets.ValueRange{
		Values: txRows,
	}).ValueInputOption("USER_ENTERED").Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("gagal menulis Transaksi: %w", err)
	}

	// 2. Prepare Target Tabungan values
	savingRows := [][]interface{}{
		{"ID", "Ikon", "Nama Target", "Target (Rp)", "Terkumpul (Rp)", "Deadline", "Status"},
	}
	for _, sg := range savings {
		status := "Berjalan"
		if sg.Completed {
			status = "Tercapai"
		}
		savingRows = append(savingRows, []interface{}{
			sg.ID,
			sg.Icon,
			sg.Name,
			sg.TargetAmount,
			sg.CurrentAmount,
			sg.Deadline,
			status,
		})
	}

	// Clear and write Tabungan
	_, _ = s.srv.Spreadsheets.Values.Clear(spreadsheetID, "Target_Tabungan!A1:Z1000", &sheets.ClearValuesRequest{}).Context(ctx).Do()
	_, err = s.srv.Spreadsheets.Values.Update(spreadsheetID, "Target_Tabungan!A1", &sheets.ValueRange{
		Values: savingRows,
	}).ValueInputOption("USER_ENTERED").Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("gagal menulis Tabungan: %w", err)
	}

	return nil
}

// PullData reads all transactions and savings from Google Sheets
func (s *SheetsService) PullData(ctx context.Context, spreadsheetID string) ([]models.Transaction, []models.SavingsGoal, error) {
	if s.srv == nil {
		return nil, nil, fmt.Errorf("Google Sheets service tidak aktif")
	}

	respTx, err := s.srv.Spreadsheets.Values.Get(spreadsheetID, "Transaksi!A2:G").Context(ctx).Do()
	if err != nil {
		return nil, nil, err
	}

	var txList []models.Transaction
	for _, row := range respTx.Values {
		if len(row) < 3 {
			continue
		}
		id := fmt.Sprintf("%v", row[0])
		tType := fmt.Sprintf("%v", row[1])
		var amount float64
		fmt.Sscanf(fmt.Sprintf("%v", row[2]), "%f", &amount)

		cat := ""
		if len(row) > 3 {
			cat = fmt.Sprintf("%v", row[3])
		}
		desc := ""
		if len(row) > 4 {
			desc = fmt.Sprintf("%v", row[4])
		}
		date := ""
		if len(row) > 5 {
			date = fmt.Sprintf("%v", row[5])
		}

		txList = append(txList, models.Transaction{
			ID:          id,
			Type:        tType,
			Amount:      amount,
			CategoryID:  cat,
			Description: desc,
			Date:        date,
		})
	}

	var savingsList []models.SavingsGoal
	respSg, err := s.srv.Spreadsheets.Values.Get(spreadsheetID, "Target_Tabungan!A2:G").Context(ctx).Do()
	if err == nil {
		for _, row := range respSg.Values {
			if len(row) < 5 {
				continue
			}
			id := fmt.Sprintf("%v", row[0])
			icon := fmt.Sprintf("%v", row[1])
			name := fmt.Sprintf("%v", row[2])
			var target, current float64
			fmt.Sscanf(fmt.Sprintf("%v", row[3]), "%f", &target)
			fmt.Sscanf(fmt.Sprintf("%v", row[4]), "%f", &current)

			deadline := ""
			if len(row) > 5 {
				deadline = fmt.Sprintf("%v", row[5])
			}

			savingsList = append(savingsList, models.SavingsGoal{
				ID:            id,
				Icon:          icon,
				Name:          name,
				TargetAmount:  target,
				CurrentAmount: current,
				Deadline:      deadline,
				Completed:     current >= target,
			})
		}
	}

	return txList, savingsList, nil
}
