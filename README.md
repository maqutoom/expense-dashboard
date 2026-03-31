# Expense Dashboard

A modern, responsive Expense Management Web Application built with React, Tailwind CSS, and Chart.js. The app helps multiple users manage personal income, expenses, reports, and budgets through a fintech-style dashboard UI.

## Features

- User authentication with separate user-based data
- Personal dashboard with total income, expenses, balance, and savings
- Add, edit, delete, search, and filter transactions
- Expense breakdown and monthly analytics charts
- Budget planner with usage tracking and overspending alerts
- Export reports to Excel and PDF
- Share report summary
- Dark fintech-style responsive interface for mobile, tablet, and desktop
- Local storage persistence so data remains after refresh

## Demo Accounts

Use either of these demo accounts to test the app:

- `aarav@example.com` / `demo123`
- `meera@example.com` / `demo123`

You can also create a new account from the signup screen.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Chart.js
- React Chart.js 2
- Heroicons
- xlsx
- jsPDF
- Local Storage

## Project Structure

```text
src/
  context/
    AppContext.jsx
  data/
    mockData.js
  pages/
    AuthPage.jsx
    DashboardPage.jsx
  utils/
    reporting.js
    storage.js
  App.jsx
  index.css
  main.jsx
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app runs locally at:

```text
http://127.0.0.1:5173/
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Main Modules

### Authentication

Users can sign up and log in. Each user only sees their own stored expenses and income.

### Dashboard

The dashboard includes:

- Total income
- Total expenses
- Remaining balance
- Monthly savings
- Top spending chart
- Monthly analytics
- Quick transaction history
- Budget usage and report cards

### Transaction Management

Users can:

- Add transactions
- Edit existing transactions
- Delete transactions
- Search by title or notes
- Filter by category and date

### Reports

Users can:

- View weekly and monthly summaries
- Export Excel reports
- Download PDF statements
- Share report summary

### Budget Planner

Users can set a monthly budget and track how much has been used.

## Data Persistence

This project currently uses browser local storage for persistence.

- App state is saved automatically
- User session is stored locally
- Theme preference is stored locally
- Data remains after refresh

## Validation

The transaction form includes validation for:

- Required title
- Required date
- Required category
- Required payment method
- Amount must be a valid number
- Amount must be greater than 0

## Future Improvements

- Firebase authentication and database integration
- PostgreSQL backend with APIs
- More advanced analytics and category reports
- Recurring transactions
- Notifications and reminders
- Better accessibility and keyboard navigation

## Repository

GitHub repository:

[https://github.com/maqutoom/expense-dashboard](https://github.com/maqutoom/expense-dashboard)

## License

This project is for learning and portfolio/demo purposes.
