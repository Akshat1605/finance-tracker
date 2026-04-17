import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  createTransactionRequest,
  deleteTransactionRequest,
  getTransactionsRequest,
} from "../services";

const initialFormData = {
  type: "EXPENSE",
  amount: "",
  category: "",
  description: "",
  date: "",
};

function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  return fallbackMessage;
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;
  return parsedDate.toLocaleDateString();
}

function formatCurrency(amountValue) {
  const numericAmount = Number(amountValue);
  if (Number.isNaN(numericAmount)) return amountValue;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

function CategoryPieTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload;

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-lg shadow-slate-200">
      <p className="text-sm font-semibold text-slate-900">{dataPoint?.category || "-"}</p>
    </div>
  );
}

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadTransactions() {
    setIsLoading(true);
    setFetchError("");

    try {
      const response = await getTransactionsRequest();
      const transactionList = Array.isArray(response?.data)
        ? response.data
        : response?.data?.transactions || [];
      setTransactions(transactionList);
    } catch (error) {
      setFetchError(getApiErrorMessage(error, "Failed to fetch transactions."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = transactions
      .map((transaction) => transaction?.category)
      .filter(Boolean);
    return [...new Set(categories)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const categoryMatches = categoryFilter
        ? transaction?.category?.toLowerCase() === categoryFilter.toLowerCase()
        : true;

      const transactionDateOnly = transaction?.date
        ? String(transaction.date).slice(0, 10)
        : "";
      const afterStartDate = startDate ? transactionDateOnly >= startDate : true;
      const beforeEndDate = endDate ? transactionDateOnly <= endDate : true;
      const dateMatches = afterStartDate && beforeEndDate;

      return categoryMatches && dateMatches;
    });
  }, [transactions, categoryFilter, startDate, endDate]);

  const incomeTransactions = useMemo(
    () => filteredTransactions.filter((transaction) => transaction?.type === "INCOME"),
    [filteredTransactions]
  );

  const expenseTransactions = useMemo(
    () => filteredTransactions.filter((transaction) => transaction?.type === "EXPENSE"),
    [filteredTransactions]
  );

  const totalIncome = useMemo(
    () =>
      incomeTransactions.reduce(
        (sum, transaction) => sum + (Number(transaction?.amount) || 0),
        0
      ),
    [incomeTransactions]
  );

  const totalExpense = useMemo(
    () =>
      expenseTransactions.reduce(
        (sum, transaction) => sum + (Number(transaction?.amount) || 0),
        0
      ),
    [expenseTransactions]
  );

  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const chartData = useMemo(() => {
    const aggregated = filteredTransactions.reduce((accumulator, transaction) => {
      const type = transaction?.type || "EXPENSE";
      const category = transaction?.category || "Uncategorized";
      const key = `${type}__${category}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          name: category,
          category,
          type,
          value: 0,
          color: type === "INCOME" ? "#10b981" : "#ef4444",
        };
      }

      accumulator[key].value += Number(transaction?.amount) || 0;
      return accumulator;
    }, {});

    return Object.values(aggregated);
  }, [filteredTransactions]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCreateTransaction(event) {
    event.preventDefault();
    setFormError("");
    setIsCreating(true);

    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    try {
      await createTransactionRequest(payload);
      setFormData(initialFormData);
      await loadTransactions();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create transaction."));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteTransaction(transactionId) {
    setDeletingId(transactionId);
    setFetchError("");

    try {
      await deleteTransactionRequest(transactionId);
      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== transactionId)
      );
    } catch (error) {
      setFetchError(getApiErrorMessage(error, "Unable to delete transaction."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">
          Track your spending and income with a clear overview of transactions.
        </p>
      </motion.header>

      <div className="grid gap-4 xl:grid-cols-4">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-emerald-700">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-800">{formatCurrency(totalIncome)}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-rose-700">Total Expense</p>
          <p className="mt-2 text-2xl font-semibold text-rose-800">{formatCurrency(totalExpense)}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-blue-700">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-blue-800">{formatCurrency(balance)}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-800">Category Insights</h3>
          <div className="mt-3 h-48">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-600">
                Add transactions to visualize chart data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={66}
                    innerRadius={38}
                    paddingAngle={3}
                  >
                    {chartData.map((entry) => (
                      <Cell key={`${entry.type}-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
        >
          <h3 className="text-lg font-semibold text-slate-900">Add Transaction</h3>
          <form className="mt-4 space-y-4" onSubmit={handleCreateTransaction}>
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
              >
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="mb-1 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                placeholder="Food, Salary, Travel..."
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                placeholder="Optional note"
              />
            </div>

            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
              />
            </div>

            {formError ? (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {isCreating ? "Saving..." : "Add Transaction"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="categoryFilter"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Filter by category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
              >
                <option value="">All categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:max-w-xs">
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
              />
            </div>

            <div className="w-full sm:max-w-xs">
              <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-slate-700">
                End date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter("");
                setStartDate("");
                setEndDate("");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          {fetchError ? (
            <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{fetchError}</p>
          ) : null}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">
                No transactions found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              <section>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Income
                </h4>
                {incomeTransactions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    No income transactions for current filters.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {incomeTransactions.map((transaction) => (
                      <motion.article
                        key={transaction.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            INCOME
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="text-xs font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:text-rose-300"
                          >
                            {deletingId === transaction.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        <p className="mt-3 text-xl font-semibold text-emerald-800">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          <span className="font-medium text-slate-900">Category:</span>{" "}
                          {transaction.category || "-"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          <span className="font-medium text-slate-900">Date:</span>{" "}
                          {formatDate(transaction.date)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {transaction.description || "No description provided."}
                        </p>
                      </motion.article>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-700">
                  Expense
                </h4>
                {expenseTransactions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    No expense transactions for current filters.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {expenseTransactions.map((transaction) => (
                      <motion.article
                        key={transaction.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                            EXPENSE
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="text-xs font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:text-rose-300"
                          >
                            {deletingId === transaction.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        <p className="mt-3 text-xl font-semibold text-rose-800">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          <span className="font-medium text-slate-900">Category:</span>{" "}
                          {transaction.category || "-"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          <span className="font-medium text-slate-900">Date:</span>{" "}
                          {formatDate(transaction.date)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {transaction.description || "No description provided."}
                        </p>
                      </motion.article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default Dashboard;
