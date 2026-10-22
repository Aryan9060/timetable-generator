import React, { useState, useCallback, useEffect, memo } from "react";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import { login } from "../store/auth/authSlice";
import { toggleTheme } from "../store/theme/themeSlice";
import apiClient from "../services/apiClient";

//* Validation rules
const validateForm = (values) => {
  const errors = {};
  
  if (!values.username?.trim()) {
    errors.username = "Username is required";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters";
  }
  
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 4) {
    errors.password = "Password must be at least 4 characters";
  }
  
  return errors;
};

//! Theme toggle icon component
const ThemeToggleIcon = memo(({ theme }) => (
  theme === "dark" ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  )
));

//* Password visibility toggle icon
const EyeIcon = memo(({ visible }) => (
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
));

function Login() {
  const dispatch = useDispatch();
  const { isAuthenticated, userData, loading: authLoading } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();

  //* Form state
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //* Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && userData?.role) {
      const userRole = userData.role.toLowerCase();
      const redirectPath = {
        admin: "/admin",
        student: "/student",
        faculty: "/faculty",
      }[userRole] || "/";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userData, navigate]);

  //! Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    //! Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  //! Handle input blur for validation
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validateForm(values);
    if (fieldErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }, [values]);

  //! Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    //* Validate all fields
    const formErrors = validateForm(values);
    setErrors(formErrors);
    setTouched({ username: true, password: true });
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    const loadingToastId = toast.loading("Signing in...");

    const loginData = {
      user_id: values.username.trim(),
      password: values.password,
    };

    try {
      // Direct API call without toast wrapper for better control
      const response = await apiClient.post("/users/login", loginData);
      
      //* Extract data from response
      const apiResponse = response.data;
      
      if (!apiResponse.success) {
        setErrors({ submit: apiResponse.message || "Login failed" });
        setIsSubmitting(false);
        return;
      }

      //* Backend returns user data directly in data, not wrapped in 'user' property
      const responseData = apiResponse.data || {};
      const { accessToken, refreshToken, ...user } = responseData;
      
      if (!user._id || !accessToken) {
        setErrors({ submit: "Invalid response from server." });
        setIsSubmitting(false);
        return;
      }

      //! Prepare user data for Redux store
      const userDataForStore = {
        ...user,
        token: accessToken,
        refreshToken: refreshToken,
      };
      
      //* Dispatch login action
      dispatch(login(userDataForStore));
      
      //* Dismiss loading and show success message
      toast.dismiss(loadingToastId);
      toast.success(`Welcome back, ${user.user_name || user.user_id || "User"}!`);
      
      //* Navigation is handled by useEffect that watches isAuthenticated
      
    } catch (error) {
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, dispatch]);

  //* Show loading while verifying session (only on initial app load, not during login)
  if (authLoading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-primary">Loading...</span>
        </div>
      </div>
    );
  }



  return (
    <div className="relative h-screen bg-background transition-colors duration-200">
      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-surface-hover text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Go to Home"
        aria-label="Go to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </Link>

      {/* Toggle Theme Button */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-hover text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <ThemeToggleIcon theme={theme} />
      </button>

      {/* Login Form */}
      <Container className="flex items-center justify-center h-full">
        <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-xl border border-border">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
            <p className="mt-2 text-sm text-text/60">Sign in to your account to continue</p>
          </div>
          
          {errors.submit && (
            <div 
              className="p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text/80"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.username && errors.username ? "true" : "false"}
                aria-describedby={touched.username && errors.username ? "username-error" : undefined}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-background text-text sm:text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                  touched.username && errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-border focus:border-primary"
                }`}
                placeholder="Enter your username"
              />
              {touched.username && errors.username && (
                <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text/80"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={touched.password && errors.password ? "true" : "false"}
                  aria-describedby={touched.password && errors.password ? "password-error" : undefined}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm bg-background text-text sm:text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary pr-10 ${
                    touched.password && errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text/50 hover:text-text transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {touched.password && errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}

export default memo(Login);
