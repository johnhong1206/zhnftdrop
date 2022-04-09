import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const colorSlice = createSlice({
  name: 'colorMode',
  initialState: {
    colorMode: 'white',
  },
  reducers: {
    updateColorMode: (state, action) => {
      state.colorMode = action.payload
    },
    resetColorMode: (state) => {
      state.colorMode = 'white'
    },
  },
})
export const { updateColorMode, resetColorMode } = colorSlice.actions
export const selectColormode = (state: any) => state.colorMode.colorMode
export default colorSlice.reducer
