import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import AppBar from '../components/AppBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { accountAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState('search'); // 'search', 'amount', 'confirm', 'success'
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Get initial balance
    fetchBalance();
    
    // Check if user was pre-selected from URL params
    const userId = searchParams.get('to');
    if (userId) {
      // Auto-select user and go to amount step
      setSelectedUser({ id: userId });
      setStep('amount');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const fetchBalance = async () => {
    try {
      const balanceData = await accountAPI.getBalance();
      setBalance(balanceData.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const searchUsers = useCallback(async (query) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await userAPI.searchUsers(query);
      setUsers(response.users);
    } catch (error) {
      console.error('Search failed:', error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep('amount');
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    setStep('confirm');
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      const response = await accountAPI.transfer({
        to: selectedUser.id,
        amount: parseFloat(amount),
        description: description.trim()
      });
      
      setTransactionResult(response);
      setStep('success');
      toast.success('Money sent successfully!');
    } catch (error) {
      console.error('Transfer failed:', error);
      const errorMessage = error.response?.data?.message || 'Transfer failed';
      toast.error(errorMessage);
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

  const renderSearchStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          Send Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSearching && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {!isSearching && users.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Select recipient:</h3>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isSearching && searchQuery.length >= 2 && users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching "{searchQuery}"
            </div>
          )}

          {searchQuery.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Start typing to search for users
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAmountStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <button
            onClick={() => setStep('search')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          Enter Amount
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAmountSubmit} className="space-y-6">
          {/* Recipient Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                Sending to: {selectedUser?.fullName}
              </div>
              <div className="text-sm text-gray-500">{selectedUser?.username}</div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(balance)}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (INR)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={balance}
              placeholder="0.00"
              className="input text-2xl text-center"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <Input
            label="Description (Optional)"
            name="description"
            type="text"
            placeholder="What's this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderConfirmStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <button
            onClick={() => setStep('amount')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          Confirm Transfer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Transfer Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(parseFloat(amount))}
              </div>
              <div className="text-gray-600">Transfer Amount</div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{selectedUser?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedUser?.username}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleTransfer}
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Send Money
            </Button>
            <Button
              onClick={() => setStep('amount')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Go Back
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card>
      <CardContent className="text-center py-8">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Transfer Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          {formatCurrency(parseFloat(amount))} has been sent to {transactionResult?.recipient?.name}
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
            size="lg"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              setStep('search');
              setSelectedUser(null);
              setAmount('');
              setDescription('');
              setTransactionResult(null);
            }}
            variant="outline"
            className="w-full"
          >
            Send Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <div className="max-w-md mx-auto px-4 py-8">
        {step === 'search' && renderSearchStep()}
        {step === 'amount' && renderAmountStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};

export default SendMoney;