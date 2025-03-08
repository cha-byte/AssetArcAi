import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Filter, Home, PieChart, Download, ArrowUp, ArrowDown, Calendar, Search } from 'lucide-react';
import AddExpenseForm from '../components/AddExpenseForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeView, setActiveView] = useState('expenses'); // 'expenses' or 'visualizations'
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/auth');
      return;
    }

    try {
      setUser(JSON.parse(loggedInUser));
      
      // Load expenses from localStorage
      const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      setExpenses(savedExpenses);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setSearchQuery('');
  };

  const getFilteredAndSortedExpenses = () => {
    // First apply filters
    let filtered = [...expenses];
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(query) || 
        expense.category.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }
    
    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(expense => new Date(expense.date) >= new Date(filterDateFrom));
    }
    
    if (filterDateTo) {
      filtered = filtered.filter(expense => new Date(expense.date) <= new Date(filterDateTo));
    }
    
    // Amount range filter
    if (filterMinAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(filterMinAmount));
    }
    
    if (filterMaxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(filterMaxAmount));
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle special fields
      if (sortField === 'date') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      // Compare based on direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Calculate category-based statistics for visualizations
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        amount: 0,
        count: 0
      };
    }
    acc[category].amount += expense.amount;
    acc[category].count += 1;
    return acc;
  }, {});
  
  // Find most expensive category
  const mostExpensiveCategory = Object.entries(categoryData)
    .sort((a, b) => b[1].amount - a[1].amount)[0]?.[0] || 'None';
  
  // For date-based analysis (monthly spending)
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = expense.date.substring(0, 7); // Format: YYYY-MM
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += expense.amount;
    return acc;
  }, {});
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(expenses.map(expense => expense.category))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AssetArcAi</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveView('expenses')}
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeView === 'expenses' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-150 ease-in-out flex items-center gap-2`}
              >
                <Home size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('visualizations')}
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeView === 'visualizations' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-150 ease-in-out flex items-center gap-2`}
              >
                <PieChart size={18} />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Hello, {user?.name || 'User'}</h2>
          <p className="text-gray-600 mt-1">Welcome to your financial dashboard</p>
        </div>

        {activeView === 'expenses' ? (
          /* EXPENSES VIEW */
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Expenses</h3>
                <p className="text-3xl mt-2 font-bold text-gray-900">
                  ₹{totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Number of Expenses</h3>
                <p className="text-3xl mt-2 font-bold text-gray-900">{expenses.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Top Category</h3>
                <p className="text-3xl mt-2 font-bold text-gray-900">{mostExpensiveCategory}</p>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg font-medium text-gray-900 flex-shrink-0">Expenses</h2>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-grow max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search expenses..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Filter toggle */}
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  
                  {/* Add Expense button */}
                  <button 
                    onClick={handleAddExpense}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    <Plus size={16} /> Add Expense
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Category filter */}
                    <div>
                      <label htmlFor="filter-category" className="block text-xs font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="filter-category"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">All Categories</option>
                        {uniqueCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Date range filters */}
                    <div>
                      <label htmlFor="filter-date-from" className="block text-xs font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        id="filter-date-from"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="filter-date-to" className="block text-xs font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        id="filter-date-to"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    {/* Amount range filters */}
                    <div>
                      <label htmlFor="filter-min-amount" className="block text-xs font-medium text-gray-700 mb-1">
                        Min Amount (₹)
                      </label>
                      <input
                        type="number"
                        id="filter-min-amount"
                        value={filterMinAmount}
                        onChange={(e) => setFilterMinAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="filter-max-amount" className="block text-xs font-medium text-gray-700 mb-1">
                        Max Amount (₹)
                      </label>
                      <input
                        type="number"
                        id="filter-max-amount"
                        value={filterMaxAmount}
                        onChange={(e) => setFilterMaxAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center gap-1">
                          Description
                          <span className="text-gray-400 group-hover:text-gray-500">
                            {getSortIcon('description')}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          Category
                          <span className="text-gray-400 group-hover:text-gray-500">
                            {getSortIcon('category')}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <span className="text-gray-400 group-hover:text-gray-500">
                            {getSortIcon('date')}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          <span className="text-gray-400 group-hover:text-gray-500">
                            {getSortIcon('amount')}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredAndSortedExpenses().length > 0 ? (
                      getFilteredAndSortedExpenses().map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{expense.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No expenses found. Add your first expense to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {getFilteredAndSortedExpenses().length > 0 && (
                <div className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Showing {getFilteredAndSortedExpenses().length} of {expenses.length} expenses
                </div>
              )}
            </div>
          </>
        ) : (
          /* VISUALIZATIONS VIEW */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Category Summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expense by Category</h3>
                
                {/* Simple visualization of the pie chart */}
                <div className="h-60 flex items-center justify-center mb-4">
                  {/* Placeholder for a pie chart - in a real app, you'd use a chart library like Chart.js or Recharts */}
                  <div className="relative w-40 h-40 rounded-full overflow-hidden">
                    {Object.entries(categoryData).map(([category, data], index, array) => {
                      const percentage = (data.amount / totalExpenses) * 100;
                      const randomColor = `hsl(${index * (360 / array.length)}, 70%, 65%)`;
                      return (
                        <div
                          key={category}
                          className="absolute inset-0 pie-segment"
                          style={{
                            backgroundColor: randomColor,
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((index / array.length) * 2 * Math.PI)}% ${50 + 50 * Math.sin((index / array.length) * 2 * Math.PI)}%)`
                          }}
                        />
                      );
                    })}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full scale-75">
                      <span className="text-xl font-semibold">₹{totalExpenses.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Category breakdown */}
                <div className="space-y-3">
                  {Object.entries(categoryData)
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .map(([category, data], index) => {
                      const percentage = (data.amount / totalExpenses) * 100;
                      const randomColor = `hsl(${index * 40}, 70%, 65%)`;
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: randomColor }}
                            />
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                          </div>
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">₹{data.amount.toFixed(2)}</span>
                            <span className="text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              
              {/* Monthly Spending Trends */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trends</h3>
                
                {/* Bar chart visualization */}
                <div className="h-60 flex items-end space-x-2 mb-4">
                  {sortedMonths.map((month, index) => {
                    const amount = monthlyData[month];
                    // Find the max value to scale properly
                    const maxValue = Math.max(...Object.values(monthlyData));
                    const height = maxValue > 0 ? (amount / maxValue) * 100 : 0;
                    
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative">
                          <div 
                            className="w-full bg-indigo-500 rounded-t transition-all duration-300 group-hover:bg-indigo-600"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            ₹{amount.toFixed(0)}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-gray-500 mt-2 truncate w-full text-center">
                          {month.substring(5)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <h4 className="font-medium text-gray-700 mt-8 mb-3">Monthly Summary</h4>
                <div className="space-y-3">
                  {sortedMonths.slice(-3).map(month => (
                    <div key={month} className="flex justify-between items-center">
                      <div className="text-sm font-medium">
                        {new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-sm font-medium">₹{monthlyData[month].toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-sm text-gray-500">
                  {sortedMonths.length > 0 ? (
                    <p>
                      Your highest spending month was {
                        new Date(Object.entries(monthlyData).sort((a, b) => b[1] - a[1])[0][0] + "-01")
                          .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      }
                    </p>
                  ) : (
                    <p>Add expenses to see your monthly spending trends.</p>
                  )}
                </div>
              </div>
              
              {/* Additional Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Insights</h3>
                
                <div className="space-y-6">
                  {/* Average expense */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Expense</h4>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      ₹{expenses.length ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  
                  {/* Highest expense */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Highest Expense</h4>
                    {expenses.length > 0 ? (
                      <div className="mt-1">
                        <p className="text-3xl font-semibold text-gray-900">
                          ₹{Math.max(...expenses.map(e => e.amount)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {expenses.sort((a, b) => b.amount - a.amount)[0]?.description}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-3xl font-semibold text-gray-900">₹0.00</p>
                    )}
                  </div>
                  
                  {/* Recent activity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Recent Activity</h4>
                    <div className="mt-2 space-y-2">
                      {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(expense => (
                        <div key={expense.id} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate">{expense.description}</span>
                          <span className="text-gray-900 font-medium">₹{expense.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spending Patterns */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Analysis</h3>
                
                <div className="space-y-4">
                  {/* Category with most transactions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Most Frequent Category</h4>
                    {Object.entries(categoryData).length > 0 ? (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xl font-medium text-gray-900">
                          {Object.entries(categoryData).sort((a, b) => b[1].count - a[1].count)[0]?.[0]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {Object.entries(categoryData).sort((a, b) => b[1].count - a[1].count)[0]?.[1].count} transactions
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-700">No data available</p>
                    )}
                  </div>
                  
                  {/* Category distribution visualization (horizontal bars) */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Category Distribution</h4>
                    
                    <div className="space-y-3">
                      {Object.entries(categoryData)
                        .sort((a, b) => b[1].amount - a[1].amount)
                        .slice(0, 5) // Show top 5
                        .map(([category, data], index) => {
                          const percentage = (data.amount / totalExpenses) * 100;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium text-gray-700">
                                <span>{category}</span>
                                <span>₹{data.amount.toFixed(0)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Expense frequency */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Spending Frequency</h4>
                    <p className="text-sm text-gray-700">
                      You have an average of {(expenses.length / (sortedMonths.length || 1)).toFixed(1)} expenses per month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export button */}
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                <Download size={16} />
                Export Data
              </button>
            </div>
          </>
        )}
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseForm 
          onClose={() => setShowAddExpense(false)} 
          onAddExpense={handleExpenseAdded} 
        />
      )}
    </div>
  );
};

export default Dashboard; 