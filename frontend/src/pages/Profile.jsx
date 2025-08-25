import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import AppBar from '../components/AppBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.password !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      toast.error(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      await updateProfile({
        password: passwordData.password
      });
      setShowPasswordForm(false);
      setPasswordData({ password: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password update failed';
      toast.error(errorMessage);
    }
  };

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    });
    setIsEditing(false);
    setErrors({});
  };

  const cancelPasswordEdit = () => {
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              Profile Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-16 h-16 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500">{user?.username}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      required
                    />
                    
                    <Input
                      label="Last Name"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="mt-1 text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="mt-1 text-gray-900">{user?.lastName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user?.username}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                {!showPasswordForm && (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    variant="outline"
                    size="sm"
                  >
                    Change Password
                  </Button>
                )}
              </div>

              {showPasswordForm ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="New Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      error={errors.password}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={errors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelPasswordEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <p className="mt-1 text-gray-500">••••••••••••</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
