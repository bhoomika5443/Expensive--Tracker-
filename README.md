# AI-Assisted Expense Tracker — Program 05
React + Vite expense tracker with localStorage persistence, category management, monthly analytics and CSV export.


## Run locally
1. Install Node.js (LTS) from https://nodejs.org/ if not installed.
2. Open this project folder in terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed in terminal.
6. For production build: `npm run build`.

## Features
- Expense record: id, amount, category, date, note
- Add form validation: amount greater than zero, category/date required, note capped at 120 characters
- Expenses sorted newest-first
- Delete expense with confirmation
- Seeded categories and category creation, rename/recolor, delete with reassignment
- localStorage persistence
- Month selector and spending summary with comparison to prior month
- Pie category breakdown and six-month bar chart
- CSV export with headers and escaping

## Prompt sequence (AI-assisted development)
1. Scaffold: Create a React app shell with navbar, add-expense action, main layout, friendly empty state, functional components and separate CSS. Verify the empty state.
2. Entry form: Create a modal form for amount, category, date defaulting to today, and note. Validate amount > 0, category/date required, note <= 120 chars. On submit append expense and close. Verify invalid inputs are blocked.
3. List: Show transactions sorted by date descending with category tags and delete confirmation. Verify deletion asks first.
4. Data layer: Add seeded categories; create/edit/recolour/delete category with safe reassignment. Persist expenses and categories in localStorage. Verify data survives refresh.
5. Analytics: Add monthly summary, comparison to previous month, category pie chart, six-month trend, and CSV export. Verify chart values and CSV file.

## Sample CSV
id,amount,category,date,note
sample-1,450,Food,2026-11-03,Meals
sample-2,120,Transport,2026-11-05,Bus
sample-3,1800,Bills,2026-11-07,Monthly bills

## Reflection (edit to reflect your actual work)
AI-assisted prompts helped build the project one layer at a time. The first iterations focused on the form and expense list before adding persistence. localStorage was tested by reloading the page and confirming entries remained. Analytics and CSV export were added after the core flow was working. The most useful iteration was checking validation and category reassignment so the stored expense data stayed consistent.
