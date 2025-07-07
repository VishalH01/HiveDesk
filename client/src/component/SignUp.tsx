import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';
import signupVisual from '../assets/signup-visual.png';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    email: '',
    password: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(prev => ({ ...prev, [e.target.name]: true }));
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(prev => ({ ...prev, [e.target.name]: false }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain alphabets and spaces';
    }
    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.birthday);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        newErrors.birthday = 'Please enter a valid birthday (age 13+)';
      }
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (otpSent && !formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (otpSent && formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Please enter your email first' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }
    setIsSendingOTP(true);
    try {
      const result = await apiService.sendOTP(formData.email, 'signup', formData.name);
      if (result.success) {
        setOtpSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }
    setIsVerifyingOTP(true);
    try {
      const result = await apiService.verifyOTP(formData.email, formData.otp);
      if (result.success) {
        setOtpVerified(true);
        toast.success('OTP verified successfully! You can now create your account.');
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (!otpVerified) {
      toast.error('Please verify OTP first');
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiService.signUp({
        name: formData.name,
        email: formData.email,
        birthday: formData.birthday,
        password: formData.password,
        otp: formData.otp
      });
      if (result.success) {
        if (result.user) {
          localStorage.setItem('user', JSON.stringify({
            ...result.user,
            isAuthenticated: true
          }));
        }
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Floating label classes
  const floatingLabel = (field: keyof typeof formData) =>
    `absolute left-3 px-1 transition-all duration-200 bg-white pointer-events-none
    ${
      focused[field] || formData[field]
        ? '-top-2 text-xs text-blue-600 font-medium'
        : 'top-1/2 -translate-y-1/2 text-gray-400'
    }`;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 md:p-0">
        {/* Logo */}
        <div className="flex items-center w-full max-w-md mb-8 mt-4 md:mt-0 justify-center md:justify-start">
          <span className="mr-3 flex items-center">
            <svg width="343" height="32" viewBox="0 0 343 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M152.142 0.843087L148.985 0L146.325 9.89565L143.923 0.961791L140.766 1.80488L143.361 11.4573L136.897 5.01518L134.585 7.31854L141.676 14.3848L132.846 12.0269L132 15.1733L141.648 17.7496C141.537 17.2748 141.479 16.7801 141.479 16.2717C141.479 12.6737 144.406 9.75685 148.016 9.75685C151.626 9.75685 154.553 12.6737 154.553 16.2717C154.553 16.7768 154.495 17.2685 154.386 17.7405L163.154 20.0818L164 16.9354L154.314 14.3489L163.144 11.9908L162.298 8.84437L152.613 11.4308L159.077 4.98873L156.766 2.68538L149.774 9.65357L152.142 0.843087Z" fill="#367AFF"/>
              <path d="M154.378 17.7771C154.107 18.9176 153.535 19.9421 152.751 20.763L159.103 27.0935L161.415 24.7901L154.378 17.7771Z" fill="#367AFF"/>
              <path d="M152.687 20.8292C151.894 21.637 150.891 22.2398 149.766 22.5504L152.077 31.1472L155.235 30.3041L152.687 20.8292Z" fill="#367AFF"/>
              <path d="M149.648 22.5819C149.126 22.7156 148.579 22.7866 148.016 22.7866C147.412 22.7866 146.827 22.705 146.272 22.5523L143.959 31.1569L147.116 32L149.648 22.5819Z" fill="#367AFF"/>
              <path d="M146.161 22.5205C145.053 22.1945 144.068 21.584 143.291 20.7739L136.923 27.1199L139.234 29.4233L146.161 22.5205Z" fill="#367AFF"/>
              <path d="M143.238 20.7178C142.474 19.9026 141.917 18.8917 141.652 17.7688L132.856 20.1179L133.702 23.2643L143.238 20.7178Z" fill="#367AFF"/>
              <path d="M178.077 25V7.54544H181.239V14.9346H189.327V7.54544H192.497V25H189.327V17.5852H181.239V25H178.077ZM200.891 25H194.976V7.54544H201.01C202.743 7.54544 204.232 7.89487 205.476 8.59374C206.726 9.28692 207.686 10.2841 208.357 11.5852C209.027 12.8864 209.362 14.4432 209.362 16.2557C209.362 18.0739 209.024 19.6364 208.348 20.9432C207.678 22.25 206.709 23.2528 205.442 23.9517C204.181 24.6506 202.663 25 200.891 25ZM198.138 22.2642H200.737C201.953 22.2642 202.967 22.0426 203.78 21.5994C204.592 21.1506 205.203 20.4829 205.612 19.5966C206.021 18.7045 206.226 17.5909 206.226 16.2557C206.226 14.9204 206.021 13.8125 205.612 12.9318C205.203 12.0454 204.598 11.3835 203.797 10.946C203.002 10.5028 202.013 10.2812 200.831 10.2812H198.138V22.2642Z" fill="#232323"/>
            </svg>
          </span>
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center md:text-left">Sign up</h2>
          <p className="text-gray-500 mb-6 text-center md:text-left">Sign up to enjoy the feature of HD</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="off"
              />
              <label className={floatingLabel('name' as keyof typeof formData)}>Your Name</label>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            {/* Date of Birth */}
            <div className="relative">
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent appearance-none ${errors.birthday ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="off"
              />
              <label className={floatingLabel('birthday' as keyof typeof formData)}>Date of Birth</label>
              {errors.birthday && <p className="text-xs text-red-500 mt-1">{errors.birthday}</p>}
            </div>
            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 relative">
              <div className="relative flex-1">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  autoComplete="off"
                />
                <label className={floatingLabel('email' as keyof typeof formData)}>Email</label>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isSendingOTP || !formData.email}
                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? 'Sending OTP...' : otpSent ? 'Resend OTP' : 'Get OTP'}
              </button>
            </div>
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder=""
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="off"
              />
              <label className={floatingLabel('password' as keyof typeof formData)}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m1.414-1.414A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            {/* OTP Section */}
            <div>
              <div className="flex items-center space-x-2">
                {otpSent && !otpVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={isVerifyingOTP || !formData.otp}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
              </div>
              {otpSent && (
                <div className="mt-2 relative">
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder=""
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2 bg-transparent ${errors.otp ? 'border-red-400' : 'border-gray-300'}`}
                    autoComplete="off"
                  />
                  <label className={floatingLabel('otp' as keyof typeof formData)}>OTP</label>
                  {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
                  <p className="text-xs text-gray-500 mt-1">Check your email for the 6-digit OTP</p>
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="mt-6 text-center text-gray-500 text-sm">
            Already have an account??{' '}
            <Link to="/signin" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </div>
        </div>
      </div>
      {/* Right Side - Image (hidden on mobile) */}
      <div className="hidden md:block w-1/2 h-screen p-4">
        <img
          src={signupVisual}
          alt="Sign up visual"
          className=" w-full h-full"
        />
      </div>
    </div>
  );
};

export default SignUp;
