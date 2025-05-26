import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
  plan: string;
  isAccountExpired: boolean;
}

const initialState: UserState = {
  isLoggedIn: false, // AsyncStorage will be checked asynchronously
  userId: null,
  plan: 'basic',
  isAccountExpired: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userId: string; plan: string }>) => {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      state.plan = action.payload.plan;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.userId = null;
      state.plan = 'basic';
      state.isAccountExpired = false;
    },
    updatePlan: (state, action: PayloadAction<string>) => {
      state.plan = action.payload;
    },
    setAccountExpired: (state, action: PayloadAction<boolean>) => {
      state.isAccountExpired = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
      state.isLoggedIn = !!action.payload;
    },
  },
});

export const { login, logout, updatePlan, setAccountExpired, setUserId } = userSlice.actions;
export default userSlice.reducer;