import  { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import toast, { Toaster } from "react-hot-toast";
import logo_1 from "../assets/logo_1.png"

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user
          const result = await apiService.getCurrentUser();
          if (result.success && result.user) {
            // Redirect authenticated users to dashboard
            navigate('/dashboard');
            return;
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('keepLoggedIn');
          }
        }
      } catch (error: unknown) {
        console.error('Auth check failed:', error);
        // Clear storage on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('keepLoggedIn');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Show welcome toast when component mounts
    toast.success(
      "Welcome! I've added some custom features to enhance your experience.",
      {
        duration: 4000,
        position: "top-center",
        style: {
          background: '#363636',
          color: '#fff',
        },
      }
    );
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
      <Toaster />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img src={logo_1} alt="HiveDesk Logo" className="" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">HiveDesk</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal note-taking application with secure authentication and beautiful organization features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-600">Email-based OTP verification for secure access to your notes.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Organization</h3>
              <p className="text-gray-600">Organize notes with categories, tags, and pin important content.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Powerful Search</h3>
              <p className="text-gray-600">Find your notes quickly with advanced search and filtering.</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Vishal Haramkar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;