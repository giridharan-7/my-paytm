import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import AppBar from '../components/AppBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { userAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Transactions = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchTransactions();
  }, [isAuthenticated, navigate, currentPage]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getTransactions(currentPage, 10);
      setTransactions(response.transactions);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'sent' ? (
      <ArrowUpIcon className="w-5 h-5" />
    ) : (
      <ArrowDownIcon className="w-5 h-5" />
    );
  };

  const getTransactionColor = (type) => {
    return type === 'sent' 
      ? 'bg-red-100 text-red-600' 
      : 'bg-green-100 text-green-600';
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.otherUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && currentPage === 1) {
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-2xl">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                Transaction History
              </CardTitle>
              <Button
                onClick={() => navigate('/send')}
                size="sm"
              >
                Send Money
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No matching transactions' : 'No transactions yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start by sending money to someone'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/send')}>
                    Send Money
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {transaction.type === 'sent' ? 'Sent to' : 'Received from'}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {transaction.otherUser}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.description && (
                            <>
                              <span>•</span>
                              <span>{transaction.description}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'sent' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
