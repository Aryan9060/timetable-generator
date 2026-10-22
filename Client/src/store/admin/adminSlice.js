import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import apiClient, { api, apiCache } from "../../services/apiClient";

const ENTITY_ENDPOINTS = {
  program: "/programmes",
  course: "/courses",
  room: "/rooms",
  division: "/divisions",
  specialization: "/specializations",
  faculty: "/faculties",
  student: "/students",
  qualification_type: "/qualification-types",
  subject_allocation: "/subject-allocations",
  time_slot: "/time-slots",
  timetable: "/timetables",
  timetable_entry: "/timetable-entries",
  user: "/users",
  semester: "/semesters",
};

export const fetchMasterData = createAsyncThunk(
  "admin/fetchMasterData",
  async ({ entityKey, params = {} }, { rejectWithValue }) => {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityKey];
      if (!endpoint) throw new Error("Invalid entity key");
      const response = await apiClient.get(endpoint, { params });
      return { entityKey, data: response.data.data || response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addMasterData = createAsyncThunk(
  "admin/addMasterData",
  async ({ entityKey, data }, { rejectWithValue }) => {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityKey];
      const response = await api.post(endpoint, data, { invalidateCache: entityKey });
      
      return { entityKey, data: response.data.data || response.data };
    } catch (error) {
       return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateMasterData = createAsyncThunk(
  "admin/updateMasterData",
  async ({ entityKey, id, data }, { rejectWithValue }) => {
    try {
      const endpoint = `${ENTITY_ENDPOINTS[entityKey]}/${id}`;
      const response = await api.put(endpoint, data, { invalidateCache: entityKey });

      return { entityKey, id, data: response.data.data || response.data };
    } catch (error) {
       return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteMasterData = createAsyncThunk(
  "admin/deleteMasterData",
  async ({ entityKey, id }, { rejectWithValue }) => {
    try {
      const endpoint = `${ENTITY_ENDPOINTS[entityKey]}/${id}`;
      await api.delete(endpoint, { invalidateCache: entityKey });
      return { entityKey, id };
    } catch (error) {
       return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  masterData: {},
  pagination: {},
  activeEntity: null,
  editingEntityId: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveEntity: (state, action) => {
      state.activeEntity = action.payload;
      state.editingEntityId = null;
      state.error = null;
    },
    setEditingEntityId: (state, action) => {
      state.editingEntityId = action.payload;
    },
    clearError: (state) => {
        state.error = null;
    },
    clearEntityCache: (state, action) => {
      //! Clear cache for specific entity or all entities
      if (action.payload) {
        apiCache.invalidate(action.payload);
        delete state.masterData[action.payload];
      } else {
        apiCache.clear();
        state.masterData = {};
      }
    },
    refreshEntity: (state, action) => {
      //* Mark entity for refresh (will be refetched on next access)
      if (action.payload) {
        apiCache.invalidate(action.payload);
        delete state.masterData[action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Master Data
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false;
        const { entityKey, data } = action.payload;
        //! Handle paginated response
        if (data.data && data.pagination) {
          state.masterData[entityKey] = data.data;
          state.pagination[entityKey] = data.pagination;
        } else {
          //! Handle non-paginated response (fallback)
          state.masterData[entityKey] = data;
        }
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //* Add Master Data
      .addCase(addMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMasterData.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.masterData[action.payload.entityKey]) {
            state.masterData[action.payload.entityKey] = [];
        }
        state.masterData[action.payload.entityKey].push(action.payload.data);
        toast.success(`${action.payload.entityKey} added successfully!`);
      })
      .addCase(addMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to add: ${action.payload}`);
      })
      //* Update Master Data
      .addCase(updateMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMasterData.fulfilled, (state, action) => {
        state.loading = false;
        const { entityKey, id, data } = action.payload;
        const list = state.masterData[entityKey] || [];
        const index = list.findIndex((item) => item._id === id || item.id === id);
        if (index !== -1) {
          list[index] = data;
        }
        toast.success(`${entityKey} updated successfully!`);
      })
      .addCase(updateMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to update: ${action.payload}`);
      })
      //! Delete Master Data
      .addCase(deleteMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMasterData.fulfilled, (state, action) => {
        state.loading = false;
        const { entityKey, id } = action.payload;
        const list = state.masterData[entityKey] || [];
        state.masterData[entityKey] = list.filter((item) => item._id !== id && item.id !== id);
        toast.success(`${entityKey} deleted successfully!`);
      })
      .addCase(deleteMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to delete: ${action.payload}`);
      });
  },
});

export const { setActiveEntity, setEditingEntityId, clearError, clearEntityCache, refreshEntity } = adminSlice.actions;

export default adminSlice.reducer;