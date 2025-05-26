import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAds, createAd, updateAd, deleteAd } from "./api";

export const fetchAds = createAsyncThunk(
  "ads/fetchAds",
  async (_, thunkAPI) => {
    try {
      const response = await getAds();
      return response.data.ads;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch ads"
      );
    }
  }
);

export const addAd = createAsyncThunk("ads/addAd", async (adData, thunkAPI) => {
  try {
    const response = await createAd(adData);
    return response.data.ad;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to create ad"
    );
  }
});

export const editAd = createAsyncThunk(
  "ads/editAd",
  async ({ id, adData }, thunkAPI) => {
    try {
      const response = await updateAd(id, adData);
      return response.data.ad;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update ad"
      );
    }
  }
);

export const removeAd = createAsyncThunk(
  "ads/removeAd",
  async (id, thunkAPI) => {
    try {
      await deleteAd(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete ad"
      );
    }
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAd.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(addAd.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editAd.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (ad) => ad._id === action.payload._id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(editAd.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeAd.fulfilled, (state, action) => {
        state.data = state.data.filter((ad) => ad._id !== action.payload);
      })
      .addCase(removeAd.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default adsSlice.reducer;
