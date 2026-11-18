import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./style.css";

const initialCategories = ["Food", "Transport", "Bills", "Shopping", "Education", "Other"];

const initialExpenses = [
  { id: 1, title: "Lunch", amount: 450, category: "Food", date: "2026-11-18" },
  { id: 2, title: "Bus ticket", amount: 120, category: "Transport", date: "2026-11-17" },
  { id: 3, title: "Electricity bill", amount: 1800, category: "Bills", date: "2026-11-15" }
];

function App() {
  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("expenses")) || initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("categories")) || initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    title: "", amount: "", category: "Food",
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [expenses, categories]);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const thisMonth = expenses
    .filter(item => item.date.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const categoryData = categories.map(category => ({
    name: category,
    value: expenses
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + Number(item.amount), 0)
  })).filter(item => item.value > 0);

  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.toISOString().slice(0, 7);

    return {
      month: date.toLocaleString("en", { month: "short" }),
      amount: expenses
        .filter(item => item.date.slice(0, 7) === month)
        .reduce((sum, item) => sum + Number(item.amount), 0)
    };
  });

  function addExpense(e) {
    e.preventDefault();

    if (!form.title.trim() || Number(form.amount) <= 0) {
      alert("Enter a valid title and amount.");
      return;
    }

    setExpenses([
      { ...form, id: Date.now(), amount: Number(form.amount) },
      ...expenses
    ]);

    setForm({
      title: "",
      amount: "",
      category: categories[0] || "Other",
      date: new Date().toISOString().slice(0, 10)
    });
  }

  function deleteExpense(id) {
    if (window.confirm("Delete this expense?")) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  }

  function addCategory() {
    const name = prompt("Enter new category name:");
    if (name && name.trim() && !categories.some(c => c.toLowerCase() === name.trim().toLowerCase())) {
      setCategories([...categories, name.trim()]);
    }
  }

  function exportCSV() {
    const rows = [
      ["Title", "Amount", "Category", "Date"],
      ...expenses.map(e => [e.title, e.amount, e.category, e.date])
    ];

    const csv = rows.map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const filteredExpenses = expenses.filter(item =>
    (filter === "All" || item.category === filter) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>💰 ExpenseAI</h2>
        <p className="side-label">MENU</p>
        {["Dashboard", "Expenses", "Categories", "Analytics"].map(item => (
          <button
            key={item}
            className={page === item ? "nav active" : "nav"}
            onClick={() => setPage(item)}
          >
            {item === "Dashboard" ? "▦" : item === "Expenses" ? "↗" : item === "Categories" ? "◈" : "▥"}
            {" "}{item}
          </button>
        ))}
        <div className="sidebar-bottom">AI Assisted Expense Tracker</div>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{page}</h1>
            <p>Manage your money smarter with ExpenseAI.</p>
          </div>
          <button className="primary" onClick={() => setPage("Expenses")}>+ Add Expense</button>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="stats">
              <div className="stat-card">
                <span>Total Expenses</span>
                <h2>₹{total.toLocaleString("en-IN")}</h2>
                <small>All recorded expenses</small>
              </div>
              <div className="stat-card">
                <span>This Month</span>
                <h2>₹{thisMonth.toLocaleString("en-IN")}</h2>
                <small>Current month spending</small>
              </div>
              <div className="stat-card">
                <span>Total Transactions</span>
                <h2>{expenses.length}</h2>
                <small>Recorded transactions</small>
              </div>
              <div className="stat-card">
                <span>Categories</span>
                <h2>{categories.length}</h2>
                <small>Available categories</small>
              </div>
            </section>

            <section className="charts">
              <div className="panel">
                <h3>Expenses by Category</h3>
                {categoryData.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                        {categoryData.map((item, i) => (
                          <Cell key={item.name} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p>No expense data available.</p>}
              </div>

              <div className="panel">
                <h3>Monthly Spending Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={value => `₹${value}`} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel">
              <h3>Recent Transactions</h3>
              <ExpenseTable expenses={expenses.slice(0, 5)} onDelete={deleteExpense} />
            </section>
          </>
        )}

        {page === "Expenses" && (
          <>
            <section className="panel">
              <h3>Add New Expense</h3>
              <form className="expense-form" onSubmit={addExpense}>
                <input placeholder="Expense title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input type="number" min="0.01" step="0.01" placeholder="Amount (₹)"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} required />
                <select value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} required />
                <button className="primary" type="submit">Save Expense</button>
              </form>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h3>All Expenses</h3>
                <button className="secondary" onClick={exportCSV}>↓ Export CSV</button>
              </div>
              <div className="filters">
                <input placeholder="Search expenses..." value={search}
                  onChange={e => setSearch(e.target.value)} />
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option>All</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <ExpenseTable expenses={filteredExpenses} onDelete={deleteExpense} />
            </section>
          </>
        )}

        {page === "Categories" && (
          <section className="panel">
            <div className="section-heading">
              <h3>Expense Categories</h3>
              <button className="primary" onClick={addCategory}>+ Add Category</button>
            </div>
            <div className="category-grid">
              {categories.map((c, i) => (
                <div className="category-card" key={c}>
                  <span>{["🍔", "🚌", "💡", "🛍️", "📚", "📦"][i % 6]}</span>
                  <h3>{c}</h3>
                  <p>₹{expenses.filter(e => e.category === c)
                    .reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString("en-IN")}</p>
                  <button className="delete" onClick={() => {
                    if (window.confirm(`Delete ${c}? Its expenses will move to Other.`)) {
                      setCategories(categories.filter(x => x !== c));
                      setExpenses(expenses.map(e => e.category === c
                        ? { ...e, category: "Other" } : e));
                      if (!categories.includes("Other") && c !== "Other") {
                        setCategories([...categories.filter(x => x !== c), "Other"]);
                      }
                    }
                  }}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "Analytics" && (
          <>
            <section className="stats">
              <div className="stat-card">
                <span>Average Transaction</span>
                <h2>₹{expenses.length ? Math.round(total / expenses.length).toLocaleString("en-IN") : 0}</h2>
              </div>
              <div className="stat-card">
                <span>Highest Expense</span>
                <h2>₹{Math.max(0, ...expenses.map(e => Number(e.amount))).toLocaleString("en-IN")}</h2>
              </div>
            </section>
            <section className="panel">
              <h3>Spending Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={value => `₹${value}`} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
            <section className="panel">
              <h3>Category Breakdown</h3>
              {categoryData.map(item => (
                <div className="breakdown" key={item.name}>
                  <span>{item.name}</span>
                  <strong>₹{item.value.toLocaleString("en-IN")}</strong>
                  <span>{total ? ((item.value / total) * 100).toFixed(1) : 0}%</span>
                </div>
              ))}
            </section>
          </>
        )}
        <footer>© 2026 ExpenseAI | AI Assisted Expense Tracker</footer>
      </main>
    </div>
  );
}

function ExpenseTable({ expenses, onDelete }) {
  if (!expenses.length) return <p className="empty">No expenses found.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th>Action</th></tr>
        </thead>
        <tbody>
          {expenses.map(item => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td><span className="tag">{item.category}</span></td>
              <td>{item.date}</td>
              <td>₹{Number(item.amount).toLocaleString("en-IN")}</td>
              <td><button className="delete" onClick={() => onDelete(item.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);