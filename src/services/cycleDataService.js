import axios from 'axios';
import { API_CONFIG, logApiConfig } from '../config/api';

// Log API configuration for debugging
logApiConfig();

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Default user settings
const DEFAULT_SETTINGS = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  notifications: {
    enabled: true,
    periodReminder: true,
    ovulationReminder: true,
    reminderDays: 2
  },
  darkMode: false,
  language: 'vi'
};

class CycleDataService {
  constructor() {
    this.currentUserId = null;
  }

  // Set current user ID
  setCurrentUserId(userId) {
    this.currentUserId = userId;
  }

  // Initialize service
  async initialize(userId) {
    try {
      this.setCurrentUserId(userId);
      return true;
    } catch (error) {
      console.error('Error initializing CycleDataService:', error);
      return false;
    }
  }

  // Helper method to handle API errors
  handleApiError(error) {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error('Request error: ' + error.message);
    }
  }

  // CYCLE MANAGEMENT
  // Add new cycle
  async addCycle(cycleData) {
    try {
      const newCycle = {
        userId: this.currentUserId,
        startDate: cycleData.startDate,
        endDate: cycleData.endDate || null,
        periodLength: cycleData.periodLength || DEFAULT_SETTINGS.averagePeriodLength,
        cycleLength: cycleData.cycleLength || DEFAULT_SETTINGS.averageCycleLength,
        symptoms: cycleData.symptoms || [],
        notes: cycleData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await api.post('/cycles', newCycle);
      await this.updatePredictions();
      
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Update existing cycle
  async updateCycle(cycleId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const response = await api.patch(`/cycles/${cycleId}`, updatePayload);
      await this.updatePredictions();
      
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Delete cycle
  async deleteCycle(cycleId) {
    try {
      await api.delete(`/cycles/${cycleId}`);
      await this.updatePredictions();
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Get all cycles for current user
  async getCycles() {
    try {
      const response = await api.get(`/cycles?userId=${this.currentUserId}&_sort=startDate&_order=desc`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Get current cycle
  async getCurrentCycle() {
    try {
      const cycles = await this.getCycles();
      if (cycles.length === 0) return null;
      
      const currentDate = new Date();
      const currentCycle = cycles.find(cycle => {
        const startDate = new Date(cycle.startDate);
        const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
        
        if (endDate) {
          return startDate <= currentDate && currentDate <= endDate;
        } else {
          // If no end date, check if it's within expected cycle length
          const expectedEnd = new Date(startDate);
          expectedEnd.setDate(expectedEnd.getDate() + cycle.cycleLength);
          return startDate <= currentDate && currentDate <= expectedEnd;
        }
      });

      return currentCycle || cycles[0];
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Get cycle statistics
  async getCycleStats() {
    try {
      const cycles = await this.getCycles();
      const settings = await this.getSettings();
      
      if (cycles.length === 0) {
        return {
          averageCycleLength: settings.averageCycleLength,
          averagePeriodLength: settings.averagePeriodLength,
          totalCycles: 0,
          regularity: 0
        };
      }

      const completedCycles = cycles.filter(cycle => cycle.endDate);
      
      if (completedCycles.length === 0) {
        return {
          averageCycleLength: settings.averageCycleLength,
          averagePeriodLength: settings.averagePeriodLength,
          totalCycles: cycles.length,
          regularity: 0
        };
      }

      const cycleLengths = completedCycles.map(cycle => cycle.cycleLength);
      const periodLengths = completedCycles.map(cycle => cycle.periodLength);
      
      const averageCycleLength = Math.round(
        cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
      );
      
      const averagePeriodLength = Math.round(
        periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
      );

      // Calculate regularity (percentage of cycles within ±2 days of average)
      const regularCycles = cycleLengths.filter(length => 
        Math.abs(length - averageCycleLength) <= 2
      );
      const regularity = Math.round((regularCycles.length / cycleLengths.length) * 100);

      return {
        averageCycleLength,
        averagePeriodLength,
        totalCycles: cycles.length,
        regularity
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // PREDICTION METHODS
  async updatePredictions() {
    try {
      const stats = await this.getCycleStats();
      const currentCycle = await this.getCurrentCycle();
      
      if (!currentCycle) {
        // Delete existing prediction if no current cycle
        try {
          await api.delete(`/predictions/${this.currentUserId}`);
        } catch (error) {
          // Ignore if prediction doesn't exist
        }
        return;
      }

      const lastStartDate = new Date(currentCycle.startDate);
      const nextPeriodStart = new Date(lastStartDate);
      nextPeriodStart.setDate(nextPeriodStart.getDate() + stats.averageCycleLength);
      
      const nextOvulationDate = new Date(nextPeriodStart);
      nextOvulationDate.setDate(nextOvulationDate.getDate() - 14);

      const predictions = {
        userId: this.currentUserId,
        nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
        nextOvulationDate: nextOvulationDate.toISOString().split('T')[0],
        fertileWindow: {
          start: new Date(nextOvulationDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(nextOvulationDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        lastUpdated: new Date().toISOString()
      };

      // Check if prediction exists for this user
      try {
        const existingPrediction = await api.get(`/predictions?userId=${this.currentUserId}`);
        if (existingPrediction.data.length > 0) {
          // Update existing prediction
          await api.patch(`/predictions/${existingPrediction.data[0].id}`, predictions);
        } else {
          // Create new prediction
          await api.post('/predictions', predictions);
        }
      } catch (error) {
        // Create new prediction if update fails
        await api.post('/predictions', predictions);
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getPredictions() {
    try {
      const response = await api.get(`/predictions?userId=${this.currentUserId}`);
      return response.data.length > 0 ? response.data[0] : {};
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // SETTINGS MANAGEMENT
  async updateSettings(newSettings) {
    try {
      // Check if settings exist for this user
      const existingSettings = await api.get(`/settings?userId=${this.currentUserId}`);
      
      const settingsData = {
        userId: this.currentUserId,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };

      if (existingSettings.data.length > 0) {
        // Update existing settings
        const response = await api.patch(`/settings/${existingSettings.data[0].id}`, settingsData);
        await this.updatePredictions();
        return response.data;
      } else {
        // Create new settings
        const response = await api.post('/settings', {
          ...settingsData,
          createdAt: new Date().toISOString()
        });
        await this.updatePredictions();
        return response.data;
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getSettings() {
    try {
      const response = await api.get(`/settings?userId=${this.currentUserId}`);
      if (response.data.length > 0) {
        return response.data[0];
      } else {
        // Return default settings if none exist
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // SYMPTOMS MANAGEMENT
  async addSymptom(symptomData) {
    try {
      const newSymptom = {
        userId: this.currentUserId,
        date: symptomData.date,
        symptoms: symptomData.symptoms || [],
        mood: symptomData.mood || null,
        notes: symptomData.notes || '',
        createdAt: new Date().toISOString()
      };

      const response = await api.post('/symptoms', newSymptom);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateSymptom(symptomId, updateData) {
    try {
      const response = await api.patch(`/symptoms/${symptomId}`, updateData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteSymptom(symptomId) {
    try {
      await api.delete(`/symptoms/${symptomId}`);
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getSymptoms() {
    try {
      const response = await api.get(`/symptoms?userId=${this.currentUserId}&_sort=date&_order=desc`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getSymptomsByDate(date) {
    try {
      const response = await api.get(`/symptoms?userId=${this.currentUserId}&date=${date}`);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // UTILITY METHODS
  async exportData() {
    try {
      const [cycles, settings, symptoms, predictions] = await Promise.all([
        this.getCycles(),
        this.getSettings(),
        this.getSymptoms(),
        this.getPredictions()
      ]);

      return {
        cycles,
        settings,
        symptoms,
        predictions,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async importData(data) {
    try {
      // Import cycles
      if (data.cycles && Array.isArray(data.cycles)) {
        for (const cycle of data.cycles) {
          const cycleData = { ...cycle };
          delete cycleData.id; // Remove ID to create new records
          cycleData.userId = this.currentUserId;
          await api.post('/cycles', cycleData);
        }
      }

      // Import symptoms
      if (data.symptoms && Array.isArray(data.symptoms)) {
        for (const symptom of data.symptoms) {
          const symptomData = { ...symptom };
          delete symptomData.id; // Remove ID to create new records
          symptomData.userId = this.currentUserId;
          await api.post('/symptoms', symptomData);
        }
      }

      // Import settings
      if (data.settings) {
        await this.updateSettings(data.settings);
      }

      // Update predictions after importing data
      await this.updatePredictions();
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async clearAllData() {
    try {
      // Get all data for current user
      const [cycles, symptoms, settings, predictions] = await Promise.all([
        this.getCycles(),
        this.getSymptoms(),
        this.getSettings(),
        this.getPredictions()
      ]);

      // Delete all cycles
      for (const cycle of cycles) {
        await api.delete(`/cycles/${cycle.id}`);
      }

      // Delete all symptoms
      for (const symptom of symptoms) {
        await api.delete(`/symptoms/${symptom.id}`);
      }

      // Delete settings if exists
      if (settings.id) {
        await api.delete(`/settings/${settings.id}`);
      }

      // Delete predictions if exists
      if (predictions.id) {
        await api.delete(`/predictions/${predictions.id}`);
      }

      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Get marked dates for calendar
  async getMarkedDates() {
    try {
      const [cycles, predictions] = await Promise.all([
        this.getCycles(),
        this.getPredictions()
      ]);

      const markedDates = {};
      
      // Mark period dates
      cycles.forEach(cycle => {
        const startDate = new Date(cycle.startDate);
        for (let i = 0; i < cycle.periodLength; i++) {
          const periodDate = new Date(startDate);
          periodDate.setDate(startDate.getDate() + i);
          const dateString = periodDate.toISOString().split('T')[0];
          
          markedDates[dateString] = {
            marked: true,
            dotColor: '#e91e63',
            customStyles: {
              container: { backgroundColor: '#ffebee' },
              text: { color: '#e91e63', fontWeight: 'bold' }
            }
          };
        }
      });

      // Mark ovulation dates
      if (predictions.nextOvulationDate) {
        markedDates[predictions.nextOvulationDate] = {
          marked: true,
          dotColor: '#4caf50',
          customStyles: {
            container: { backgroundColor: '#e8f5e8' },
            text: { color: '#4caf50', fontWeight: 'bold' }
          }
        };
      }

      return markedDates;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

// Create singleton instance
const cycleDataService = new CycleDataService();

export default cycleDataService;
