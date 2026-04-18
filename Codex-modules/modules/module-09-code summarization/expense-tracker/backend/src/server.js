const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5033;

app.use(cors());
app.use(express.json());

let transactions = [
  {
    id: "txn-1",
    type: "income",
    amount: 5200,
    category: "Salary",
    description: "April salary",
    paymentMethod: "Bank transfer",
    date: "2026-04-01",
    createdAt: "2026-04-01T09:00:00.000Z"
  },
  {
    id: "txn-2",
    type: "expense",
    amount: 1200,
    category: "Rent",
    description: "Monthly apartment rent",
    paymentMethod: "Bank transfer",
    date: "2026-04-02",
    createdAt: "2026-04-02T10:00:00.000Z"
  },
  {
    id: "txn-3",
    type: "expense",
    amount: 86.5,
    category: "Food",
    description: "Groceries and vegetables",
    paymentMethod: "Debit card",
    date: "2026-04-05",
    createdAt: "2026-04-05T12:30:00.000Z"
  }
];

let budgets = [
  { id: "budget-1", category: "Food", month: "2026-04", limit: 550 },
  { id: "budget-2", category: "Travel", month: "2026-04", limit: 300 },
  { id: "budget-3", category: "Shopping", month: "2026-04", limit: 400 }
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTransaction(body) {
  return {
    type: body.type,
    amount: Number(body.amount),
    category: String(body.category || "").trim(),
    description: String(body.description || "").trim(),
    paymentMethod: String(body.paymentMethod || "").trim(),
    date: body.date,
    createdAt: body.createdAt || new Date().toISOString()
  };
}

function validateTransaction(transaction) {
  const errors = [];

  if (!["income", "expense"].includes(transaction.type)) {
    errors.push("type must be income or expense");
  }

  if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    errors.push("amount must be greater than 0");
  }

  if (!transaction.category) {
    errors.push("category is required");
  }

  if (!transaction.date) {
    errors.push("date is required");
  }

  return errors;
}

function getFilteredTransactions(query) {
  const search = String(query.search || "").toLowerCase();

  return transactions.filter((transaction) => {
    const matchesType = query.type ? transaction.type === query.type : true;
    const matchesCategory = query.category ? transaction.category === query.category : true;
    const matchesSearch = search
      ? `${transaction.description} ${transaction.category} ${transaction.paymentMethod}`
          .toLowerCase()
          .includes(search)
      : true;

    return matchesType && matchesCategory && matchesSearch;
  });
}

function getBudgetProgress() {
  return budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => {
        return (
          transaction.type === "expense" &&
          transaction.category === budget.category &&
          transaction.date.startsWith(budget.month)
        );
      })
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      ...budget,
      spent,
      remaining: budget.limit - spent,
      status: spent > budget.limit ? "over" : "within"
    };
  });
}

function getSummary() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const categoryTotals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "No expenses yet";

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    topCategory,
    categoryTotals,
    recentTransactions,
    budgetProgress: getBudgetProgress()
  };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "expense-tracker-backend" });
});

app.get("/api/transactions", (req, res) => {
  res.json(getFilteredTransactions(req.query));
});

app.post("/api/transactions", (req, res) => {
  const transaction = normalizeTransaction(req.body || {});
  const errors = validateTransaction(transaction);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const savedTransaction = {
    id: createId("txn"),
    ...transaction
  };

  transactions.unshift(savedTransaction);
  return res.status(201).json(savedTransaction);
});

app.put("/api/transactions/:id", (req, res) => {
  const existingTransaction = transactions.find((transaction) => transaction.id === req.params.id);

  if (!existingTransaction) {
    return res.status(404).json({ error: "transaction not found" });
  }

  const updatedTransaction = {
    ...existingTransaction,
    ...normalizeTransaction({ ...existingTransaction, ...(req.body || {}) })
  };

  const errors = validateTransaction(updatedTransaction);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  transactions = transactions.map((transaction) => {
    return transaction.id === req.params.id ? updatedTransaction : transaction;
  });

  return res.json(updatedTransaction);
});

app.delete("/api/transactions/:id", (req, res) => {
  const startingCount = transactions.length;
  transactions = transactions.filter((transaction) => transaction.id !== req.params.id);

  if (transactions.length === startingCount) {
    return res.status(404).json({ error: "transaction not found" });
  }

  return res.status(204).send();
});

app.get("/api/budgets", (req, res) => {
  res.json(budgets);
});

app.post("/api/budgets", (req, res) => {
  const category = String(req.body?.category || "").trim();
  const month = String(req.body?.month || "").trim();
  const limit = Number(req.body?.limit);

  if (!category || !month || !Number.isFinite(limit) || limit <= 0) {
    return res.status(400).json({ error: "category, month, and a positive limit are required" });
  }

  const existingBudget = budgets.find((budget) => {
    return budget.category === category && budget.month === month;
  });

  if (existingBudget) {
    existingBudget.limit = limit;
    return res.json(existingBudget);
  }

  const savedBudget = { id: createId("budget"), category, month, limit };
  budgets.push(savedBudget);
  return res.status(201).json(savedBudget);
});

app.get("/api/summary", (req, res) => {
  res.json(getSummary());
});

app.listen(PORT, () => {
  console.log(`Expense tracker backend listening on port ${PORT}`);
});
