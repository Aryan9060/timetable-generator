import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMasterData, updateMasterData, setEditingEntityId, clearError } from '../../store/admin/adminSlice';

function Form({ currentEntityConfig, activeEntity }) {
    const dispatch = useDispatch();
    const editingEntityId = useSelector((state) => state.admin.editingEntityId);
    const masterData = useSelector((state) => state.admin.masterData);

    const [entityForm, setEntityForm] = useState(() => {
        if (editingEntityId && activeEntity && masterData[activeEntity] && currentEntityConfig) {
            const entityToEdit = masterData[activeEntity].find(e => e._id === editingEntityId || e.id === editingEntityId);
            if (entityToEdit) {
                //* Format date fields for input type="date"
                const formattedData = { ...entityToEdit };
                currentEntityConfig.fields.forEach(field => {
                    if (field.type === 'date' && formattedData[field.name]) {
                        const date = new Date(formattedData[field.name]);
                        if (!isNaN(date.getTime())) {
                            formattedData[field.name] = date.toISOString().split('T')[0];
                        }
                    }
                });
                return formattedData;
            }
        }
        return {};
    });

    //! Handle entity input change
    const handleEntityInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        //! Handle nested object fields (e.g., ltpHours.l)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEntityForm(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent] || {}),
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setEntityForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    //! Reset entity form
    const resetEntityForm = () => {
        setEntityForm({});
        dispatch(setEditingEntityId(null));
        dispatch(clearError());
    };

    //! Handle entity submit    
    const handleEntitySubmit = (e) => {
        e.preventDefault();
        if (editingEntityId) {
            dispatch(updateMasterData({ entityKey: activeEntity, id: editingEntityId, data: entityForm }))
                .unwrap()
                .then(() => resetEntityForm())
                .catch((err) => console.error("Update failed", err));
        } else {
            dispatch(addMasterData({ entityKey: activeEntity, data: [entityForm] }))
                .unwrap()
                .then(() => resetEntityForm())
                .catch((err) => console.error("Add failed", err));
        }
    };

    //! Render entity form
    //! If currentEntityConfig is not available, return null
    if (!currentEntityConfig) return null;

    return (
        <form
            onSubmit={handleEntitySubmit}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text">
                    {editingEntityId ? `Edit ${currentEntityConfig.label}` : `Add New ${currentEntityConfig.label}`}
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEntityConfig.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium text-text">
                            {field.label}
                            {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                        {field.type === 'boolean' ? (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name={field.name}
                                    checked={entityForm[field.name] || false}
                                    onChange={handleEntityInputChange}
                                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary bg-background focus:ring-offset-background"
                                />
                                <span className="ml-2 text-sm text-text/80">Yes</span>
                            </div>
                        ) : field.type === 'select' ? (
                            <select
                                name={field.name}
                                value={entityForm[field.name] || ""}
                                onChange={handleEntityInputChange}
                                required={field.required}
                                className="w-full px-4 py-2 text-sm text-text bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow duration-200"
                            >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((option) => (
                                    <option key={option} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={entityForm[field.name] || ""}
                                onChange={handleEntityInputChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="w-full px-4 py-2 text-sm text-text bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow duration-200 placeholder-text/40"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-4 pt-5 mt-6 border-t border-border">
                {editingEntityId && (
                    <button
                        type="button"
                        onClick={resetEntityForm}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text hover:bg-surface-hover transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setEntityForm({})}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text hover:bg-surface-hover transition-colors duration-200"
                >
                    Clear
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all duration-200"
                >
                    {editingEntityId ? "Update" : "Add"} {currentEntityConfig.label}
                </button>
            </div>
        </form>
    );
}

export default Form;