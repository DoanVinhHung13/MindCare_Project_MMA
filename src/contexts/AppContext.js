import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import cycleDataService from '../services/cycleDataService';

// Initial state
const initialState = {
  // Authentication state
  isAuthenticated: false,
  user: null,
  isLoading: true,
  authError: null,

  // Cycle data state
  cycles: [],
  currentCycle: null,
  cycleStats: null,
  predictions: {},
  symptoms: [],
  settings: null,
  dataLoading: false,
  dataError: null,

  // UI state
  selectedDate: null,
  markedDates: {}
};

// Action types
const ActionTypes = {
  // Auth actions
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_UPDATE_USER: 'AUTH_UPDATE_USER',

  // Data actions
  DATA_LOADING_START: 'DATA_LOADING_START',
  DATA_LOADING_SUCCESS: 'DATA_LOADING_SUCCESS',
  DATA_LOADING_FAILURE: 'DATA_LOADING_FAILURE',
  CYCLES_UPDATED: 'CYCLES_UPDATED',
  SYMPTOMS_UPDATED: 'SYMPTOMS_UPDATED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  PREDICTIONS_UPDATED: 'PREDICTIONS_UPDATED',

  // UI actions
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_MARKED_DATES: 'SET_MARKED_DATES'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    // Auth cases
    case ActionTypes.AUTH_START:
      return {
        ...state,
        isLoading: true,
        authError: null
      };

    case ActionTypes.AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
        authError: null
      };

    case ActionTypes.AUTH_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        authError: action.payload.error
      };

    case ActionTypes.AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        authError: null,
        // Clear all data on logout
        cycles: [],
        currentCycle: null,
        cycleStats: null,
        predictions: {},
        symptoms: [],
        settings: null
      };

    case ActionTypes.AUTH_UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    // Data cases
    case ActionTypes.DATA_LOADING_START:
      return {
        ...state,
        dataLoading: true,
        dataError: null
      };

    case ActionTypes.DATA_LOADING_SUCCESS:
      return {
        ...state,
        dataLoading: false,
        dataError: null,
        ...action.payload
      };

    case ActionTypes.DATA_LOADING_FAILURE:
      return {
        ...state,
        dataLoading: false,
        dataError: action.payload.error
      };

    case ActionTypes.CYCLES_UPDATED:
      return {
        ...state,
        cycles: action.payload.cycles,
        currentCycle: action.payload.currentCycle,
        cycleStats: action.payload.cycleStats
      };

    case ActionTypes.SYMPTOMS_UPDATED:
      return {
        ...state,
        symptoms: action.payload
      };

    case ActionTypes.SETTINGS_UPDATED:
      return {
        ...state,
        settings: action.payload
      };

    case ActionTypes.PREDICTIONS_UPDATED:
      return {
        ...state,
        predictions: action.payload
      };

    // UI cases
    case ActionTypes.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };

    case ActionTypes.SET_MARKED_DATES:
      return {
        ...state,
        markedDates: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: ActionTypes.AUTH_START });

      // Initialize auth service
      const authInitialized = await authService.initialize();
      
      if (authInitialized && authService.isLoggedIn()) {
        const user = authService.getCurrentUser();
        dispatch({
          type: ActionTypes.AUTH_SUCCESS,
          payload: { user }
        });

        // Initialize cycle data service
        await initializeCycleData(user.id);
      } else {
        dispatch({ type: ActionTypes.AUTH_FAILURE, payload: { error: null } });
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      dispatch({
        type: ActionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
    }
  };

  const initializeCycleData = async (userId) => {
    try {
      dispatch({ type: ActionTypes.DATA_LOADING_START });

      const initialized = await cycleDataService.initialize(userId);
      if (!initialized) {
        throw new Error('Failed to initialize cycle data service');
      }

      // Load all data
      const [cycles, currentCycle, cycleStats, predictions, symptoms, settings, markedDates] = await Promise.all([
        cycleDataService.getCycles(),
        cycleDataService.getCurrentCycle(),
        cycleDataService.getCycleStats(),
        cycleDataService.getPredictions(),
        cycleDataService.getSymptoms(),
        cycleDataService.getSettings(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.DATA_LOADING_SUCCESS,
        payload: {
          cycles,
          currentCycle,
          cycleStats,
          predictions,
          symptoms,
          settings,
          markedDates
        }
      });
    } catch (error) {
      console.error('Error initializing cycle data:', error);
      dispatch({
        type: ActionTypes.DATA_LOADING_FAILURE,
        payload: { error: error.message }
      });
    }
  };

  // Auth actions
  const login = async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: ActionTypes.AUTH_START });

      const result = await authService.login(email, password, rememberMe);
      
      if (result.success) {
        dispatch({
          type: ActionTypes.AUTH_SUCCESS,
          payload: { user: result.user }
        });
        
        // Initialize cycle data after successful login
        await initializeCycleData(result.user.id);
        
        return { success: true };
      } else {
        dispatch({
          type: ActionTypes.AUTH_FAILURE,
          payload: { error: result.error }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: ActionTypes.AUTH_START });

      const result = await authService.register(userData);
      
      if (result.success) {
        dispatch({
          type: ActionTypes.AUTH_SUCCESS,
          payload: { user: result.user }
        });
        
        // Initialize cycle data after successful registration
        await initializeCycleData(result.user.id);
        
        return { success: true };
      } else {
        dispatch({
          type: ActionTypes.AUTH_FAILURE,
          payload: { error: result.error }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.AUTH_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: ActionTypes.AUTH_LOGOUT });
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const result = await authService.updateProfile(updateData);
      
      if (result.success) {
        dispatch({
          type: ActionTypes.AUTH_UPDATE_USER,
          payload: result.user
        });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Cycle data actions
  const addCycle = async (cycleData) => {
    try {
      const newCycle = await cycleDataService.addCycle(cycleData);
      
      // Refresh data
      const [cycles, currentCycle, cycleStats, predictions, markedDates] = await Promise.all([
        cycleDataService.getCycles(),
        cycleDataService.getCurrentCycle(),
        cycleDataService.getCycleStats(),
        cycleDataService.getPredictions(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.CYCLES_UPDATED,
        payload: { cycles, currentCycle, cycleStats }
      });

      dispatch({
        type: ActionTypes.PREDICTIONS_UPDATED,
        payload: predictions
      });

      dispatch({
        type: ActionTypes.SET_MARKED_DATES,
        payload: markedDates
      });

      return { success: true, cycle: newCycle };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCycle = async (cycleId, updateData) => {
    try {
      const updatedCycle = await cycleDataService.updateCycle(cycleId, updateData);
      
      // Refresh data
      const [cycles, currentCycle, cycleStats, predictions, markedDates] = await Promise.all([
        cycleDataService.getCycles(),
        cycleDataService.getCurrentCycle(),
        cycleDataService.getCycleStats(),
        cycleDataService.getPredictions(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.CYCLES_UPDATED,
        payload: { cycles, currentCycle, cycleStats }
      });

      dispatch({
        type: ActionTypes.PREDICTIONS_UPDATED,
        payload: predictions
      });

      dispatch({
        type: ActionTypes.SET_MARKED_DATES,
        payload: markedDates
      });

      return { success: true, cycle: updatedCycle };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteCycle = async (cycleId) => {
    try {
      await cycleDataService.deleteCycle(cycleId);
      
      // Refresh data
      const [cycles, currentCycle, cycleStats, predictions, markedDates] = await Promise.all([
        cycleDataService.getCycles(),
        cycleDataService.getCurrentCycle(),
        cycleDataService.getCycleStats(),
        cycleDataService.getPredictions(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.CYCLES_UPDATED,
        payload: { cycles, currentCycle, cycleStats }
      });

      dispatch({
        type: ActionTypes.PREDICTIONS_UPDATED,
        payload: predictions
      });

      dispatch({
        type: ActionTypes.SET_MARKED_DATES,
        payload: markedDates
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addSymptom = async (symptomData) => {
    try {
      const newSymptom = await cycleDataService.addSymptom(symptomData);
      
      const symptoms = await cycleDataService.getSymptoms();
      dispatch({
        type: ActionTypes.SYMPTOMS_UPDATED,
        payload: symptoms
      });

      return { success: true, symptom: newSymptom };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateSymptom = async (symptomId, updateData) => {
    try {
      const updatedSymptom = await cycleDataService.updateSymptom(symptomId, updateData);
      
      const symptoms = await cycleDataService.getSymptoms();
      dispatch({
        type: ActionTypes.SYMPTOMS_UPDATED,
        payload: symptoms
      });

      return { success: true, symptom: updatedSymptom };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteSymptom = async (symptomId) => {
    try {
      await cycleDataService.deleteSymptom(symptomId);
      
      const symptoms = await cycleDataService.getSymptoms();
      dispatch({
        type: ActionTypes.SYMPTOMS_UPDATED,
        payload: symptoms
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = await cycleDataService.updateSettings(newSettings);
      
      dispatch({
        type: ActionTypes.SETTINGS_UPDATED,
        payload: updatedSettings
      });

      // Update predictions and marked dates if cycle settings changed
      const [predictions, markedDates] = await Promise.all([
        cycleDataService.getPredictions(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.PREDICTIONS_UPDATED,
        payload: predictions
      });

      dispatch({
        type: ActionTypes.SET_MARKED_DATES,
        payload: markedDates
      });

      return { success: true, settings: updatedSettings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // UI actions
  const setSelectedDate = (date) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_DATE,
      payload: date
    });
  };

  const getSymptomsByDate = async (date) => {
    try {
      return await cycleDataService.getSymptomsByDate(date);
    } catch (error) {
      console.error('Error getting symptoms by date:', error);
      return null;
    }
  };

  const exportData = async () => {
    try {
      const data = await cycleDataService.exportData();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const importData = async (data) => {
    try {
      await cycleDataService.importData(data);
      
      // Refresh all data
      const [cycles, currentCycle, cycleStats, predictions, symptoms, settings, markedDates] = await Promise.all([
        cycleDataService.getCycles(),
        cycleDataService.getCurrentCycle(),
        cycleDataService.getCycleStats(),
        cycleDataService.getPredictions(),
        cycleDataService.getSymptoms(),
        cycleDataService.getSettings(),
        cycleDataService.getMarkedDates()
      ]);

      dispatch({
        type: ActionTypes.DATA_LOADING_SUCCESS,
        payload: {
          cycles,
          currentCycle,
          cycleStats,
          predictions,
          symptoms,
          settings,
          markedDates
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearAllData = async () => {
    try {
      await cycleDataService.clearAllData();
      
      // Reset data state
      const settings = await cycleDataService.getSettings();
      dispatch({
        type: ActionTypes.DATA_LOADING_SUCCESS,
        payload: {
          cycles: [],
          currentCycle: null,
          cycleStats: null,
          predictions: {},
          symptoms: [],
          settings: settings,
          markedDates: {}
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const contextValue = {
    // State
    ...state,

    // Auth actions
    login,
    register,
    logout,
    updateProfile,

    // Cycle data actions
    addCycle,
    updateCycle,
    deleteCycle,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    updateSettings,

    // UI actions
    setSelectedDate,
    getSymptomsByDate,

    // Data management
    exportData,
    importData,
    clearAllData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
