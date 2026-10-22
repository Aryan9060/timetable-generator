import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import themeReducer from './theme/themeSlice';
import adminReducer from './admin/adminSlice';
import formReducer from './formSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    admin: adminReducer,
    form: formReducer,
  },
});
