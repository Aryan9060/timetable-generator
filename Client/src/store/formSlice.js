import { createSlice } from "@reduxjs/toolkit";

const formSlice = createSlice({
    name: "form",
    initialState: {
        entityForm: {},
        editingEntityId: null,
        activeEntity: "program",
    },
    reducers: {
        setEntityForm: (state, action) => {
            state.entityForm = action.payload;
        },
        setEditingEntityId: (state, action) => {
            state.editingEntityId = action.payload;
        },
        setActiveEntity: (state, action) => {
            state.activeEntity = action.payload;
        },
    },
});

export const { setEntityForm, setEditingEntityId, setActiveEntity } = formSlice.actions;
export default formSlice.reducer;   