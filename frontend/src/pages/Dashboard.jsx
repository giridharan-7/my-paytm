import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import AppBar from '../components/AppBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { accountAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, statementData] = await Promise.all([
        accountAPI.getBalance(),
        accountAPI.getStatement()
      ]);
      
      setBalance(balanceData.balance);
      setTransactions(statementData.recentTransactions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      time: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your money today.
          </p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg font-medium">
                  Total Balance
                </CardTitle>
                <button
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="text-white/80 hover:text-white"
                >
                  {isBalanceVisible ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {isBalanceVisible ? formatCurrency(balance) : '••••••'}
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate('/send')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  <ArrowUpIcon className="w-4 h-4 mr-2" />
                  Send Money
                </Button>
                <Button
                  onClick={() => navigate('/request')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  <ArrowDownIcon className="w-4 h-4 mr-2" />
                  Request Money
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/send')}
                className="w-full justify-start"
                variant="ghost"
              >
                <PlusIcon className="w-4 h-4 mr-3" />
                Send Money
              </Button>
              <Button
                onClick={() => navigate('/transactions')}
                className="w-full justify-start"
                variant="ghost"
              >
                <ChartBarIcon className="w-4 h-4 mr-3" />
                View Transactions
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                className="w-full justify-start"
                variant="ghost"
              >
                <CreditCardIcon className="w-4 h-4 mr-3" />
                Manage Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Transactions</CardTitle>
              <Button
                onClick={() => navigate('/transactions')}
                variant="outline"
                size="sm"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by sending money to someone
                </p>
                <Button onClick={() => navigate('/send')}>
                  Send Money
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'debit' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.type === 'debit' ? (
                          <ArrowUpIcon className="w-5 h-5" />
                        ) : (
                          <ArrowDownIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.type === 'debit' ? 'Sent to' : 'Received from'} {transaction.otherParty}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'debit' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;