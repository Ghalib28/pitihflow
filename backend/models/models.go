package models

import "time"

// Transaction represents an income or expense transaction
type Transaction struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // "income" or "expense"
	Amount      float64   `json:"amount"`
	CategoryID  string    `json:"categoryId"`
	Description string    `json:"description"`
	Date        string    `json:"date"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Deposit represents an addition to a savings goal
type Deposit struct {
	ID     string  `json:"id"`
	Amount float64 `json:"amount"`
	Date   string  `json:"date"`
	Note   string  `json:"note"`
}

// SavingsGoal represents a financial target goal
type SavingsGoal struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Icon          string    `json:"icon"`
	TargetAmount  float64   `json:"targetAmount"`
	CurrentAmount float64   `json:"currentAmount"`
	Deadline      string    `json:"deadline"`
	Color         string    `json:"color"`
	Completed     bool      `json:"completed"`
	CreatedAt     time.Time `json:"createdAt"`
	Deposits      []Deposit `json:"deposits"`
}

// SyncPushRequest represents payload sent from frontend to be saved into Google Sheets
type SyncPushRequest struct {
	SpreadsheetID string        `json:"spreadsheetId"`
	Transactions  []Transaction `json:"transactions"`
	Savings       []SavingsGoal `json:"savings"`
	UpdatedAt     string        `json:"updatedAt"`
}

// SyncResponse represents standard API response
type SyncResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	SpreadsheetID string `json:"spreadsheetId,omitempty"`
	SpreadsheetURL string `json:"spreadsheetUrl,omitempty"`
	FolderID      string `json:"folderId,omitempty"`
	SyncedAt      string `json:"syncedAt"`
}
