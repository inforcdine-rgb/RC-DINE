import React, { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment/moment';
import { IoCloseSharp } from 'react-icons/io5';
import {
    MdCheckCircleOutline,
    MdDeleteForever,
    MdDragIndicator,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
    MdModeEditOutline,
    MdOutlineQrCode2,
    MdReplay,
    MdTune
} from 'react-icons/md';
import { TiPlus } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { instance } from '../../api/apiClient';
import ActionDropdown from '../../components/ActionDropdown';
import CustomSelect from '../../components/CustomSelect';
import OMTModal from '../../components/Modal';
import NoData from '../../components/NoData/index.jsx';
import SmartImage from '../../components/SmartImage';
import '../../assets/styles/menu.css';
import {
    createCategoryRequest,
    getCategoryRequest,
    getMenuItemsRequest,
    removeCategoryRequest,
    removeMenuItemRequest,
    setFiltering,
    setMenuModalData,
    setPagination,
    setSelectedCategory,
    updateCategoryRequest
} from '../../store/slice/menu.slice';
import { FIELD_CLASS, MENU_STATUS } from '../../utils/constants.js';
import { compressComboImage, compressFoodImage } from '../../utils/imageCompression';
import { getBackgroundRequestVersion, registerRefreshHandler, waitForBackgroundRequests } from '../../utils/refreshBus';
import {
    defaultValidation,
    validateCreateCategory,
    validateCreateMenuItem,
    validateUpdateCategory
} from '../../validations/menu.js';

// ── Image Upload Modal (quick upload from table photo cell) ───────────────────
function ImageUploadModal({ item, hotelId, onClose, onSuccess }) {
    const [preview, setPreview] = useState(item?.image || null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef();

    const handleFileChange = async (e) => {
        const original = e.target.files[0];
        if (!original) return;
        if (original.size > 3 * 1024 * 1024) {
            setError('File size must be under 3MB');
            return;
        }
        try {
            const f = await compressFoodImage(original);
            setError('');
            setFile(f);
            setPreview(URL.createObjectURL(f));
        } catch (compressionError) {
            setError(compressionError.message || 'Image compression failed');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('hotelId', hotelId);
            const res = await instance.post(`/menu/${item.id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess(res.data.image);
        } catch (err) {
            setError(err?.response?.data?.message || 'Upload failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="img-modal-backdrop" onClick={onClose}>
            <div className="img-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="img-modal-header">
                    <span>📷 Upload Dish Photo</span>
                    <button className="img-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="img-modal-body">
                    <div
                        className={`img-drop-zone ${preview ? 'has-preview' : ''}`}
                        onClick={() => inputRef.current?.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="img-preview" />
                        ) : (
                            <>
                                <div className="img-drop-icon">🍽️</div>
                                <div className="img-drop-text">Click to choose photo</div>
                                <div className="img-drop-hint">JPG, PNG, WebP · Max 5MB</div>
                            </>
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <button className="img-change-btn" onClick={() => inputRef.current?.click()}>
                            Change Photo
                        </button>
                    )}
                    {error && <div className="img-error">{error}</div>}
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="img-btn-upload" onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Create Menu Items with optional image ─────────────────────────────────────
function CreateMenuWithImageModal({ categoryId, categoryName, categoriesOptions, hotelId, onClose, onSuccess }) {
    const [rows, setRows] = useState([
        {
            id: Date.now(),
            categoryId,
            name: '',
            description: '',
            price: '',
            foodType: 'VEG',
            isCartSuggestion: false,
            file: null,
            preview: null
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileRefs = useRef({});

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: Date.now(),
                categoryId,
                name: '',
                description: '',
                price: '',
                foodType: 'VEG',
                isCartSuggestion: false,
                file: null,
                preview: null
            }
        ]);
    };

    const removeRow = (id) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const updateRow = (id, field, value) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const handleFileChange = async (id, e) => {
        const original = e.target.files[0];
        if (!original) return;
        if (original.size > 3 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, [id]: 'Max 3MB' }));
            return;
        }
        try {
            const f = await compressFoodImage(original);
            setErrors((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, file: f, preview: URL.createObjectURL(f) } : r)));
        } catch (compressionError) {
            setErrors((prev) => ({ ...prev, [id]: compressionError.message || 'Compression failed' }));
        }
    };

    const validate = () => {
        const errs = {};
        rows.forEach((r) => {
            if (!r.categoryId) errs[`${r.id}-categoryId`] = 'Category required';
            if (!r.name.trim()) errs[`${r.id}-name`] = 'Name required';
            if (!r.price || isNaN(Number(r.price)) || Number(r.price) <= 0) {
                errs[`${r.id}-price`] = 'Valid price required';
            }
            if (!['VEG', 'NON_VEG'].includes(r.foodType)) errs[`${r.id}-foodType`] = 'Select Veg or Non-Veg';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const groupedRows = rows.reduce((groups, row) => {
                if (!groups[row.categoryId]) groups[row.categoryId] = [];
                groups[row.categoryId].push(row);
                return groups;
            }, {});
            const createResults = await Promise.allSettled(
                Object.entries(groupedRows).map(async ([targetCategoryId, categoryRows]) => {
                    const data = categoryRows.map((row) => ({
                        name: row.name.trim(),
                        description: row.description.trim(),
                        price: Number(row.price),
                        foodType: row.foodType,
                        isCartSuggestion: Boolean(row.isCartSuggestion)
                    }));
                    const response = await instance.post('/menu', { categoryId: targetCategoryId, hotelId, data });
                    return { categoryRows, created: Array.isArray(response.data) ? response.data : [] };
                })
            );
            const failedCategoryGroups = createResults.filter((result) => result.status === 'rejected');
            const createdByRowId = new Map();
            createResults.forEach((result) => {
                if (result.status !== 'fulfilled') return;
                result.value.categoryRows.forEach((row, index) => {
                    const createdItem = result.value.created[index];
                    if (createdItem?.id) createdByRowId.set(row.id, createdItem);
                });
            });
            if (!createdByRowId.size && failedCategoryGroups.length) {
                const error = failedCategoryGroups[0].reason;
                setErrors({ _global: error?.response?.data?.message || 'Failed to create menu items.' });
                return;
            }
            const imageUploads = rows
                .map((row) => ({ file: row.file, item: createdByRowId.get(row.id) }))
                .filter((x) => x.file && x.item?.id);

            const uploadResults = await Promise.allSettled(
                imageUploads.map(async ({ file, item }) => {
                    const fd = new FormData();
                    fd.append('image', file);
                    fd.append('hotelId', hotelId);
                    await instance.post(`/menu/${item.id}/image`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                })
            );
            const failedImageUploads = uploadResults.filter((result) => result.status === 'rejected').length;

            onSuccess({
                createdCount: createdByRowId.size,
                categoryCount: Object.keys(groupedRows).length - failedCategoryGroups.length,
                failedCategoryGroups: failedCategoryGroups.length,
                failedImageUploads
            });
        } catch (err) {
            setErrors({ _global: err?.response?.data?.message || 'Failed to create menu items.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="img-modal-backdrop" onClick={onClose}>
            <div className="img-modal-box create-menu-modal" onClick={(e) => e.stopPropagation()}>
                <div className="img-modal-header">
                    <span>🍽️ Create Menu Items</span>
                    <button className="img-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="img-modal-body create-menu-body">
                    <div className="create-menu-category-banner">
                        Default category: <strong>{categoryName || 'Selected category'}</strong>. You can change it for
                        each item below.
                    </div>
                    {rows.map((row) => (
                        <div key={row.id} className="create-menu-row">
                            <div
                                className="create-menu-img-cell"
                                title="Click to add photo"
                                onClick={() => fileRefs.current[row.id]?.click()}
                            >
                                {row.preview ? (
                                    <img src={row.preview} alt="preview" className="create-menu-img-preview" />
                                ) : (
                                    <span className="create-menu-img-placeholder">📷</span>
                                )}
                            </div>
                            <input
                                ref={(el) => {
                                    fileRefs.current[row.id] = el;
                                }}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(row.id, e)}
                            />
                            <div className="create-menu-fields">
                                <select
                                    className={`create-menu-input ${
                                        errors[`${row.id}-categoryId`] ? 'input-error' : ''
                                    }`}
                                    value={row.categoryId}
                                    onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {(categoriesOptions || []).map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors[`${row.id}-categoryId`] && (
                                    <span className="create-menu-field-error">{errors[`${row.id}-categoryId`]}</span>
                                )}
                                <input
                                    className={`create-menu-input ${errors[`${row.id}-name`] ? 'input-error' : ''}`}
                                    placeholder="Item name"
                                    value={row.name}
                                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                />
                                {errors[`${row.id}-name`] && (
                                    <span className="create-menu-field-error">{errors[`${row.id}-name`]}</span>
                                )}
                                <textarea
                                    className="create-menu-input create-menu-textarea"
                                    placeholder="Description / Ingredients (optional)"
                                    value={row.description}
                                    rows={2}
                                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                                />
                                <input
                                    className={`create-menu-input ${errors[`${row.id}-price`] ? 'input-error' : ''}`}
                                    placeholder="Price (₹)"
                                    type="number"
                                    min="0"
                                    value={row.price}
                                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                />
                                {errors[`${row.id}-price`] && (
                                    <span className="create-menu-field-error">{errors[`${row.id}-price`]}</span>
                                )}
                                <div className="food-type-selector">
                                    <span className="food-type-title">Food Type</span>
                                    <label className={`food-type-option veg ${row.foodType === 'VEG' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`foodType-${row.id}`}
                                            value="VEG"
                                            checked={row.foodType === 'VEG'}
                                            onChange={() => updateRow(row.id, 'foodType', 'VEG')}
                                        />
                                        Veg
                                    </label>
                                    <label
                                        className={`food-type-option non-veg ${row.foodType === 'NON_VEG' ? 'active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`foodType-${row.id}`}
                                            value="NON_VEG"
                                            checked={row.foodType === 'NON_VEG'}
                                            onChange={() => updateRow(row.id, 'foodType', 'NON_VEG')}
                                        />
                                        Non-Veg
                                    </label>
                                </div>
                                {errors[`${row.id}-foodType`] && (
                                    <span className="create-menu-field-error">{errors[`${row.id}-foodType`]}</span>
                                )}
                                <label className="cart-suggestion-toggle">
                                    <input
                                        type="checkbox"
                                        checked={row.isCartSuggestion}
                                        onChange={(e) => updateRow(row.id, 'isCartSuggestion', e.target.checked)}
                                    />
                                    <span>Show in customer cart suggestion popup</span>
                                </label>
                                {errors[row.id] && <span className="create-menu-field-error">{errors[row.id]}</span>}
                            </div>
                            {rows.length > 1 && (
                                <button className="create-menu-remove-btn" onClick={() => removeRow(row.id)}>
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {errors._global && <div className="img-error">{errors._global}</div>}
                    <button className="create-menu-add-row-btn" onClick={addRow}>
                        + Add Another Item
                    </button>
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="img-btn-upload" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Items'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Update Menu Item with image ───────────────────────────────────────────────
function UpdateMenuWithImageModal({ item, categoryId, hotelId, onClose, onSuccess }) {
    const [name, setName] = useState(item.name || '');
    const [price, setPrice] = useState(item.price || '');
    const [description, setDescription] = useState(item.description || '');
    const [foodType, setFoodType] = useState(item.foodType || 'VEG');
    const [status, setStatus] = useState(item.status === MENU_STATUS[0]);
    const [isCartSuggestion, setIsCartSuggestion] = useState(Boolean(item.isCartSuggestion));
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(item.image || null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const inputRef = useRef();

    const handleFileChange = async (e) => {
        const original = e.target.files?.[0];
        if (!original) return;

        if (original.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                image: 'Max 5MB'
            }));
            return;
        }

        try {
            const compressed = await compressFoodImage(original);

            setErrors((prev) => {
                const next = { ...prev };
                delete next.image;
                return next;
            });

            setFile(compressed);
            setPreview(URL.createObjectURL(compressed));
        } catch (compressionError) {
            setErrors((prev) => ({
                ...prev,
                image: compressionError.message || 'Image compression failed'
            }));
        }
    };

    const handleSubmit = async () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Valid price required';
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const data = {};
            if (name !== item.name) data.name = name.trim();
            if (Number(price) !== Number(item.price)) data.price = Number(price);
            if (description !== (item.description || '')) data.description = description.trim();
            if (foodType !== (item.foodType || 'VEG')) data.foodType = foodType;
            if (status !== (item.status === MENU_STATUS[0])) data.status = status;
            if (isCartSuggestion !== Boolean(item.isCartSuggestion)) data.isCartSuggestion = isCartSuggestion;

            if (Object.keys(data).length) {
                await instance.put(`/menu/${item.id}`, { hotelId, data });
            }

            if (file) {
                const fd = new FormData();
                fd.append('image', file);
                fd.append('hotelId', hotelId);
                await instance.post(`/menu/${item.id}/image`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onSuccess(categoryId);
        } catch (err) {
            setErrors({ _global: err?.response?.data?.message || 'Update failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="img-modal-backdrop" onClick={onClose}>
            <div className="img-modal-box update-menu-modal" onClick={(e) => e.stopPropagation()}>
                <div className="img-modal-header">
                    <span>✏️ Update Menu Item</span>
                    <button className="img-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="img-modal-body">
                    <div className="update-menu-img-row">
                        <div
                            className={`img-drop-zone update-img-drop ${preview ? 'has-preview' : ''}`}
                            onClick={() => inputRef.current?.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="img-preview" />
                            ) : (
                                <>
                                    <div className="img-drop-icon">📷</div>
                                    <div className="img-drop-text">Click to add photo</div>
                                    <div className="img-drop-hint">JPG, PNG, WebP · Max 5MB</div>
                                </>
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {preview && (
                            <button className="img-change-btn" onClick={() => inputRef.current?.click()}>
                                Change Photo
                            </button>
                        )}
                        {errors.image && <div className="img-error">{errors.image}</div>}
                    </div>

                    <div className="update-menu-field">
                        <label className="update-menu-label">Name</label>
                        <input
                            className={`create-menu-input ${errors.name ? 'input-error' : ''}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <span className="create-menu-field-error">{errors.name}</span>}
                    </div>

                    <div className="update-menu-field">
                        <label className="update-menu-label">Price (₹)</label>
                        <input
                            className={`create-menu-input ${errors.price ? 'input-error' : ''}`}
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        {errors.price && <span className="create-menu-field-error">{errors.price}</span>}
                    </div>

                    <div className="update-menu-field">
                        <label className="update-menu-label">Description / Ingredients</label>
                        <textarea
                            className="create-menu-input create-menu-textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="update-menu-field">
                        <label className="update-menu-label">Food Type</label>
                        <div className="food-type-selector update-food-type-selector">
                            <label className={`food-type-option veg ${foodType === 'VEG' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="update-food-type"
                                    value="VEG"
                                    checked={foodType === 'VEG'}
                                    onChange={() => setFoodType('VEG')}
                                />
                                Veg
                            </label>
                            <label className={`food-type-option non-veg ${foodType === 'NON_VEG' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="update-food-type"
                                    value="NON_VEG"
                                    checked={foodType === 'NON_VEG'}
                                    onChange={() => setFoodType('NON_VEG')}
                                />
                                Non-Veg
                            </label>
                        </div>
                    </div>

                    <div className="update-menu-field update-menu-status-row">
                        <label className="update-menu-label">Available</label>
                        <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            className="update-menu-checkbox"
                        />
                    </div>

                    <div className="update-menu-field update-menu-status-row cart-suggestion-admin-row">
                        <div>
                            <label className="update-menu-label">Cart Suggestion Popup</label>
                            <small>ON karoge to customer cart popup me ye item dikhega.</small>
                        </div>
                        <input
                            type="checkbox"
                            checked={isCartSuggestion}
                            onChange={(e) => setIsCartSuggestion(e.target.checked)}
                            className="update-menu-checkbox"
                        />
                    </div>

                    {errors._global && <div className="img-error">{errors._global}</div>}
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="img-btn-upload" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Combo Modal: 1 combo = minimum 2 and maximum 5 food items ────────────────
function ComboModal({ combo, allFoodItems, hotelId, onClose, onSuccess }) {
    const [name, setName] = useState(combo?.name || '');
    const [description, setDescription] = useState(combo?.description || '');
    const [price, setPrice] = useState(combo?.price || '');
    const [status, setStatus] = useState(combo ? combo.status === MENU_STATUS[0] : true);
    const [selectedIds, setSelectedIds] = useState(() => {
        if (Array.isArray(combo?.comboItems)) return combo.comboItems.map(String);
        try {
            return JSON.parse(combo?.comboItems || '[]').map(String);
        } catch (e) {
            return [];
        }
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [comboImage, setComboImage] = useState(null);
    const [comboPreview, setComboPreview] = useState(combo?.image || '');

    const selectedFoodItems = useMemo(
        () => selectedIds.map((id) => allFoodItems.find((item) => String(item.id) === String(id))).filter(Boolean),
        [allFoodItems, selectedIds]
    );

    const toggleFood = (id) => {
        const stringId = String(id);
        setError('');
        setSelectedIds((prev) => {
            if (prev.includes(stringId)) return prev.filter((itemId) => itemId !== stringId);
            if (prev.length >= 5) {
                setError('Maximum 5 food items add kar sakte ho.');
                return prev;
            }
            return [...prev, stringId];
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Combo name required');
            return;
        }
        if (!price || Number(price) <= 0) {
            setError('Valid combo price required');
            return;
        }
        if (selectedIds.length < 2) {
            setError('Combo me minimum 2 food items add karo');
            return;
        }
        if (selectedIds.length > 5) {
            setError('Combo me maximum 5 food items allowed hain');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                hotelId,
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                status,
                menuIds: selectedIds
            };
            let savedCombo;
            if (combo?.id) {
                const response = await instance.put(`/menu/combo/${combo.id}`, payload);
                savedCombo = response.data;
            } else {
                const response = await instance.post('/menu/combo', payload);
                savedCombo = response.data;
            }
            const comboId = combo?.id || savedCombo?.id;
            if (comboImage && comboId) {
                const fd = new FormData();
                fd.append('image', comboImage);
                fd.append('hotelId', hotelId);
                await instance.post(`/menu/${comboId}/image`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Combo save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="img-modal-backdrop" onClick={onClose}>
            <div className="img-modal-box combo-modal" onClick={(e) => e.stopPropagation()}>
                <div className="img-modal-header">
                    <span>{combo?.id ? '✏️ Update Combo' : '🍱 Add Combo'}</span>
                    <button className="img-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="img-modal-body combo-modal-body">
                    <div className="combo-form-grid">
                        <div className="update-menu-field">
                            <label className="update-menu-label">Combo Name</label>
                            <input
                                className="create-menu-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Pizza + Coke Combo"
                            />
                        </div>
                        <div className="update-menu-field">
                            <label className="update-menu-label">Combo Price (₹)</label>
                            <input
                                className="create-menu-input"
                                type="number"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="199"
                            />
                        </div>
                    </div>
                    <div className="update-menu-field">
                        <label className="update-menu-label">Combo Cover Image</label>
                        <input
                            className="form-control"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={async (event) => {
                                const original = event.target.files?.[0];
                                if (!original) return;
                                try {
                                    const compressed = await compressComboImage(original);
                                    setComboImage(compressed);
                                    setComboPreview(URL.createObjectURL(compressed));
                                } catch (compressionError) {
                                    setError(compressionError.message || 'Combo image compression failed');
                                }
                            }}
                        />
                        {comboPreview && <img src={comboPreview} alt="Combo preview" className="combo-cover-preview" />}
                        <small>WebP · target 200–300 KB</small>
                    </div>

                    <div className="update-menu-field">
                        <label className="update-menu-label">Description</label>
                        <textarea
                            className="create-menu-input create-menu-textarea"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Combo details"
                        />
                    </div>
                    <div className="update-menu-field update-menu-status-row">
                        <label className="update-menu-label">Available</label>
                        <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            className="update-menu-checkbox"
                        />
                    </div>

                    <div className="combo-select-head">
                        <b>Select Food Items</b>
                        <span>{selectedIds.length}/5 selected · min 2</span>
                    </div>

                    {selectedFoodItems.length > 0 && (
                        <div className="combo-selected-preview">
                            <div className="combo-selected-preview-head">
                                <span>Combo Images Preview</span>
                                <small>Customer side par ye images auto slide hongi</small>
                            </div>
                            <div className="combo-selected-images">
                                {selectedFoodItems.map((item) => (
                                    <span key={item.id} className="combo-selected-img" title={item.name}>
                                        {item.image ? <SmartImage src={item.image} alt={item.name} /> : '🍽️'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="combo-food-list" data-preserve-scroll>
                        {allFoodItems.map((item) => {
                            const active = selectedIds.includes(String(item.id));
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`combo-food-option ${active ? 'active' : ''}`}
                                    onClick={() => toggleFood(item.id)}
                                >
                                    <span className="combo-food-photo">
                                        {item.image ? <SmartImage src={item.image} alt={item.name} /> : '🍽️'}
                                    </span>
                                    <span className="combo-food-info">
                                        <b>{item.name}</b>
                                        <small>
                                            ₹{item.price} · {item.categoryName}
                                        </small>
                                    </span>
                                    <span className="combo-check">{active ? '✓' : '+'}</span>
                                </button>
                            );
                        })}
                    </div>
                    {error && <div className="img-error">{error}</div>}
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="img-btn-upload"
                        onClick={handleSubmit}
                        disabled={saving || selectedIds.length < 2 || selectedIds.length > 5}
                    >
                        {saving ? 'Saving...' : combo?.id ? 'Update Combo' : 'Create Combo'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Menu page ─────────────────────────────────────────────────────────────
function CategoryOrderOrganizer({ categories, hotelId, selectedCategory, onSelect, onSaved }) {
    const rows = useMemo(() => categories?.rows || [], [categories?.rows]);
    const [draft, setDraft] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const draggingIdRef = useRef(null);

    useEffect(() => {
        setDraft(rows);
        setSavedIds(rows.map((category) => category.id));
    }, [rows]);

    const draftIds = draft.map((category) => category.id);
    const hasChanges = draftIds.join('|') !== savedIds.join('|');

    const moveCategory = (categoryId, targetIndex) => {
        setDraft((current) => {
            const sourceIndex = current.findIndex((category) => category.id === categoryId);
            if (sourceIndex < 0 || sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= current.length) {
                return current;
            }
            const next = [...current];
            const [movedCategory] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, movedCategory);
            return next;
        });
    };

    const handleDragStart = (event, categoryId) => {
        draggingIdRef.current = categoryId;
        setDraggingId(categoryId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', categoryId);
    };

    const handleDragEnter = (targetIndex) => {
        if (draggingIdRef.current) moveCategory(draggingIdRef.current, targetIndex);
    };

    const handleDragEnd = () => {
        draggingIdRef.current = null;
        setDraggingId(null);
    };

    const resetOrder = () => setDraft(rows);

    const saveOrder = async () => {
        if (!hotelId || !draft.length || !hasChanges) return;
        setSaving(true);
        try {
            const categoryIds = draft.map((category) => category.id);
            const response = await instance.put('/menu/category/reorder', { hotelId, categoryIds });
            const savedRows = response.data?.rows || draft;
            setDraft(savedRows);
            setSavedIds(savedRows.map((category) => category.id));
            toast.success('Category order saved. QR menu is now updated.');
            onSaved(selectedCategory?.value);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Category order could not be saved');
        } finally {
            setSaving(false);
        }
    };

    if (!rows.length) return null;

    return (
        <section className="category-order-panel" aria-labelledby="category-order-title">
            <div className="category-order-header">
                <div className="category-order-heading">
                    <div className="category-order-icon">
                        <MdOutlineQrCode2 />
                    </div>
                    <div>
                        <div className="category-order-title-row">
                            <h2 id="category-order-title">Category Display Order</h2>
                            <span className="category-order-live">
                                <span /> QR Live Order
                            </span>
                        </div>
                        <p>Drag categories into position, or use the arrow buttons. Customers see this exact order.</p>
                    </div>
                </div>
                {hasChanges ? (
                    <span className="category-order-dirty">Unsaved changes</span>
                ) : (
                    <span className="category-order-saved">
                        <MdCheckCircleOutline /> Saved
                    </span>
                )}
            </div>

            <div className="category-order-list" role="list" aria-label="Category display order">
                {draft.map((category, index) => {
                    const selected = String(selectedCategory?.value) === String(category.id);
                    return (
                        <div
                            key={category.id}
                            role="listitem"
                            draggable
                            className={`category-order-item ${selected ? 'selected' : ''} ${
                                draggingId === category.id ? 'dragging' : ''
                            }`}
                            onDragStart={(event) => handleDragStart(event, category.id)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragOver={(event) => {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                handleDragEnd();
                            }}
                            onDragEnd={handleDragEnd}
                        >
                            <span className="category-order-number">{String(index + 1).padStart(2, '0')}</span>
                            <span className="category-order-drag" title="Drag to reorder" aria-hidden="true">
                                <MdDragIndicator />
                            </span>
                            <button
                                type="button"
                                className="category-order-name"
                                onClick={() => onSelect({ label: category.name, value: category.id })}
                            >
                                <strong>{category.name}</strong>
                                <small>{selected ? 'Currently selected' : 'Click to manage items'}</small>
                            </button>
                            <div className="category-order-arrows" aria-label={`Move ${category.name}`}>
                                <button
                                    type="button"
                                    disabled={index === 0}
                                    aria-label={`Move ${category.name} up`}
                                    title="Move up"
                                    onClick={() => moveCategory(category.id, index - 1)}
                                >
                                    <MdKeyboardArrowUp />
                                </button>
                                <button
                                    type="button"
                                    disabled={index === draft.length - 1}
                                    aria-label={`Move ${category.name} down`}
                                    title="Move down"
                                    onClick={() => moveCategory(category.id, index + 1)}
                                >
                                    <MdKeyboardArrowDown />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="category-order-footer">
                <small>Save once after arranging. New categories are added at the end automatically.</small>
                <div className="category-order-actions">
                    <button
                        type="button"
                        className="category-order-reset"
                        disabled={!hasChanges || saving}
                        onClick={resetOrder}
                    >
                        <MdReplay /> Reset
                    </button>
                    <button
                        type="button"
                        className="category-order-save"
                        disabled={!hasChanges || saving}
                        onClick={saveOrder}
                    >
                        <MdCheckCircleOutline /> {saving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>
        </section>
    );
}

function Menu() {
    const [managerFoodFilter, setManagerFoodFilter] = useState('ALL');
    const dispatch = useDispatch();
    const { selectedCategory, modalData, categoriesOptions, categories, menuItems, sorting, filtering, pagination } =
        useSelector((state) => state.menu);
    const hotelId = useSelector((state) => state.hotel.globalHotelId);

    const [imageModal, setImageModal] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(null);
    const [categoryOrganizerOpen, setCategoryOrganizerOpen] = useState(false);
    const [managerSection, setManagerSection] = useState('categories');
    const [comboItems, setComboItems] = useState({ count: 0, rows: [] });
    const [allFoodItems, setAllFoodItems] = useState([]);
    const [comboModal, setComboModal] = useState(null);
    const [comboLoading, setComboLoading] = useState(false);
    const [comboError, setComboError] = useState('');
    const refreshSnapshotRef = useRef('');
    refreshSnapshotRef.current = JSON.stringify({ categories, menuItems, comboItems });

    const refreshMenu = () => {
        dispatch(
            getMenuItemsRequest({
                categoryId: selectedCategory.value,
                skip: pagination?.pageIndex ? pagination.pageIndex * pagination.pageSize : 0,
                limit: pagination?.pageSize || 10,
                sortKey: sorting[0]?.id,
                sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
                filterKey: filtering?.field,
                filterValue: filtering?.value
            })
        );
    };

    const fetchCombos = async () => {
        if (!hotelId) return;
        setComboLoading(true);
        setComboError('');
        try {
            const res = await instance.get(`/menu/combo/${hotelId}?skip=0&limit=100`);
            setComboItems(res.data || { count: 0, rows: [] });
        } catch (err) {
            setComboError(err?.response?.data?.message || 'Failed to fetch combos');
        } finally {
            setComboLoading(false);
        }
    };

    const fetchAllFoodItems = async () => {
        if (!categories?.rows?.length) {
            setAllFoodItems([]);
            return;
        }
        try {
            const responses = await Promise.all(
                categories.rows.map(async (category) => {
                    const res = await instance.get(`/menu/${category.id}?skip=0&limit=500`);
                    return (res.data?.rows || []).map((item) => ({ ...item, categoryName: category.name }));
                })
            );
            setAllFoodItems(responses.flat().filter((item) => !item.isCombo));
        } catch (err) {
            setComboError(err?.response?.data?.message || 'Failed to fetch food items for combos');
        }
    };

    const handleDeleteCombo = async (comboId) => {
        if (!window.confirm('Delete this combo?')) return;
        try {
            await instance.delete('/menu/combo', { data: { comboIds: [comboId] } });
            await fetchCombos();
        } catch (err) {
            setComboError(err?.response?.data?.message || 'Failed to delete combo');
        }
    };

    useEffect(() => {
        if (!hotelId || !selectedCategory?.value) {
            return;
        }

        const params = {
            categoryId: selectedCategory.value,
            skip: pagination?.pageIndex ? pagination.pageIndex * pagination.pageSize : 0,
            limit: pagination?.pageSize || 10,
            sortKey: sorting[0]?.id,
            sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
            filterKey: filtering?.field,
            filterValue: filtering?.value
        };
        dispatch(getMenuItemsRequest(params));
        // eslint-disable-next-line
    }, [
        hotelId,
        selectedCategory?.value,
        pagination,
        sorting[0]?.desc,
        sorting[0]?.id,
        filtering.field,
        filtering.value
    ]);

    useEffect(() => {
        if (hotelId) dispatch(getCategoryRequest(hotelId));
    }, [hotelId]);

    useEffect(() => {
        if (!categoryOrganizerOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setCategoryOrganizerOpen(false);
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [categoryOrganizerOpen]);

    useEffect(
        () =>
            registerRefreshHandler('manager-menu', async () => {
                if (!hotelId) return false;
                const before = refreshSnapshotRef.current;
                const checkpoint = getBackgroundRequestVersion();
                dispatch(getCategoryRequest(hotelId));
                refreshMenu();
                if (managerSection === 'combos') await fetchCombos();
                await waitForBackgroundRequests({ checkpoint });
                return before !== refreshSnapshotRef.current;
            }),
        [hotelId, managerSection, selectedCategory?.value, pagination?.pageIndex, pagination?.pageSize]
    );

    useEffect(() => {
        if (hotelId && managerSection === 'combos') {
            fetchCombos();
            fetchAllFoodItems();
        }
        // eslint-disable-next-line
    }, [hotelId, managerSection, categories?.rows?.length]);

    const handleCategorySelect = (item) => {
        dispatch(setSelectedCategory(item));
        if (hotelId && item?.value) {
            dispatch(
                getMenuItemsRequest({
                    categoryId: item.value,
                    skip: 0,
                    limit: pagination?.pageSize || 10
                })
            );
        }
    };

    const handleAddButtonClick = (currentModalData, values, type) => {
        const { options } = currentModalData;
        const { 'add-button': addButton, ...rest } = options;
        const secondInput = type === 'category' ? null : 'price';
        const fieldsToAdd = secondInput ? ['name', secondInput, 'icon'] : ['name', 'icon'];

        const updatedOps = { ...rest };
        const key = moment().valueOf();
        fieldsToAdd.forEach((item) => {
            const iconKey = Object.keys(updatedOps).find((k) => k.startsWith(`${item}-`));
            updatedOps[`${item}-${key}`] = { ...rest[iconKey], name: `${item}-${key}` };
        });
        updatedOps['add-button'] = addButton;

        const updatedInitialVals = {
            ...values,
            [`name-${key}`]: '',
            ...(secondInput ? { [`${secondInput}-${key}`]: '' } : {})
        };

        const updated = { ...currentModalData, initialValues: updatedInitialVals, options: updatedOps };
        dispatch(setMenuModalData(updated));
        return updated;
    };

    const handleRemoveClick = (id, currentModalData, type) => {
        const { options, initialValues } = currentModalData;
        const secondInput = type === 'category' ? null : 'price';
        const updatedOptions = { ...options };
        const updatedInitialVals = { ...initialValues };

        delete updatedOptions[`name-${id}`];
        if (secondInput) delete updatedOptions[`${secondInput}-${id}`];
        delete updatedOptions[`icon-${id}`];
        delete updatedInitialVals[`name-${id}`];
        if (secondInput) delete updatedInitialVals[`${secondInput}-${id}`];

        const updated = { ...currentModalData, initialValues: updatedInitialVals, options: updatedOptions };
        dispatch(setMenuModalData(updated));
        return updated;
    };

    const handleAddItemClick = (type) => {
        if (type === 'menu') {
            setCreateModal(true);
            return;
        }

        const nameKey = 'name-0';
        const fieldOptions = {
            [nameKey]: {
                name: nameKey,
                type: 'text',
                label: 'Category Name',
                className: 'col-12 my-2'
            }
        };

        let addOptions = {
            title: 'Create Category',
            type: 'create',
            initialValues: { 'name-0': '' },
            options: {
                ...fieldOptions,
                'icon-0': {
                    name: 'icon-0',
                    type: 'icon',
                    icon: IoCloseSharp,
                    className: 'col my-2 p-0 align-self-end w-100 pointer',
                    onClick: (id) => {
                        addOptions = handleRemoveClick(id, addOptions, type);
                    }
                },
                'add-button': {
                    name: 'add-button',
                    type: 'button',
                    label: 'Add',
                    className: 'col my-2 ms-auto w-100',
                    getValues: true,
                    invalidDisable: true,
                    onClick: (values) => {
                        addOptions = handleAddButtonClick(addOptions, values, type);
                    }
                }
            },
            submitText: 'Submit',
            closeText: 'Close'
        };
        dispatch(setMenuModalData(addOptions));
    };

    const handleDeleteItemClick = (type) => {
        const { rows } = type === 'category' ? categories : menuItems;
        const { options, initialValues } = rows.reduce(
            (cur, next) => {
                const key = `category-${next.id}`;
                cur.options[key] = {
                    name: key,
                    type: 'checkbox',
                    label: `${next.name}`,
                    className: 'd-flex justify-content-between my-2'
                };
                cur.initialValues[key] = false;
                return cur;
            },
            { initialValues: {}, options: {} }
        );

        dispatch(
            setMenuModalData({
                title: type === 'category' ? 'Remove Categories' : 'Remove Menu Items',
                type: type === 'category' ? 'remove' : 'removemenu',
                initialValues,
                options: {
                    warning: {
                        name: 'warning',
                        type: 'strong',
                        label:
                            type === 'category'
                                ? '⚠️ Warning: Deleting categories will remove all menu items linked with them!'
                                : '⚠️ Warning: The action cannot be undone!',
                        className: 'text-center my-2 text-danger'
                    },
                    ...options
                },
                submitText: 'Remove',
                closeText: 'Close'
            })
        );
    };

    const handleUpdateCategoryClick = () => {
        const category = categories.rows.find((obj) => obj.id === selectedCategory.value);
        dispatch(
            setMenuModalData({
                title: 'Update Category',
                type: 'update',
                initialValues: { name: category.name },
                options: {
                    name: { name: 'name', type: 'text', label: 'Name', className: FIELD_CLASS }
                },
                submitText: 'Update',
                closeText: 'Close'
            })
        );
    };

    const handleSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);
        const categoryId = selectedCategory.value;

        if (modalData.type === 'create') {
            const payload = Object.entries(values).reduce((cur, next) => {
                const obj = next[0].split('-');
                if (!cur[obj[1]]) cur[obj[1]] = {};
                cur[obj[1]][obj[0]] = next[1];
                return cur;
            }, {});
            dispatch(createCategoryRequest({ hotelId, data: Object.values(payload) }));
        }

        if (modalData.type === 'update') {
            const data = {};
            Object.keys(values).forEach((key) => {
                if (values[key] !== modalData.initialValues[key]) data[key] = values[key];
            });
            dispatch(updateCategoryRequest({ hotelId, categoryId, data }));
        }

        if (['remove', 'removemenu'].includes(modalData.type)) {
            const itemIds = Object.entries(values).reduce((cur, [key, value]) => {
                const id = key.substring(key.indexOf('-') + 1);
                if (value) cur.push(id);
                return cur;
            }, []);
            if (modalData.type === 'remove') {
                dispatch(removeCategoryRequest({ hotelId, itemIds }));
            } else {
                dispatch(removeMenuItemRequest({ categoryId, itemIds }));
            }
        }

        setSubmitting(false);
    };

    const getValidationSchema = () => {
        switch (modalData.type) {
            case 'create':
                return validateCreateCategory(modalData?.initialValues, categories?.rows);
            case 'update':
                return validateUpdateCategory(modalData?.initialValues, categories?.rows);
            case 'createmenu':
                return validateCreateMenuItem(modalData?.initialValues, menuItems?.rows);
            default:
                return defaultValidation;
        }
    };

    return (
        <>
            <div className="width-container mx-auto my-4">
                <div className="menu-section-tabs">
                    <button
                        type="button"
                        className={managerSection === 'categories' ? 'active' : ''}
                        onClick={() => setManagerSection('categories')}
                    >
                        Categories
                    </button>
                    <button
                        type="button"
                        className={managerSection === 'combos' ? 'active' : ''}
                        onClick={() => setManagerSection('combos')}
                    >
                        🍱 Combos
                    </button>
                </div>
                {managerSection === 'categories' ? (
                    <div className="category-manager-section">
                        <div className="d-flex category-manager-toolbar">
                            <CustomSelect
                                className="w-100 me-4"
                                options={categoriesOptions || []}
                                value={selectedCategory}
                                onChange={handleCategorySelect}
                            />
                            <button
                                type="button"
                                className="category-edit-open-btn"
                                disabled={!categories?.rows?.length}
                                aria-haspopup="dialog"
                                onClick={() => setCategoryOrganizerOpen(true)}
                            >
                                <MdTune />
                                <span>Edit Categories</span>
                                <b>{categories?.count || 0}</b>
                            </button>
                            <ActionDropdown
                                options={[
                                    { label: 'Add', icon: TiPlus, onClick: () => handleAddItemClick('category') },
                                    {
                                        label: 'Rename Selected',
                                        icon: MdModeEditOutline,
                                        disabled: !Object.keys(selectedCategory).length,
                                        onClick: handleUpdateCategoryClick
                                    },
                                    {
                                        label: 'Delete',
                                        disabled: !Object.keys(selectedCategory).length,
                                        icon: MdDeleteForever,
                                        onClick: () => handleDeleteItemClick('category')
                                    }
                                ]}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="combo-toolbar">
                        <div>
                            <h6 className="mb-1">Combos Menu</h6>
                            <small>1 combo me minimum 2 aur maximum 5 food items add honge.</small>
                        </div>
                        <button className="combo-add-main-btn" type="button" onClick={() => setComboModal({})}>
                            + Add Combo
                        </button>
                    </div>
                )}
            </div>

            {categoryOrganizerOpen && (
                <div className="category-edit-backdrop">
                    <div
                        className="category-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="category-edit-modal-title"
                    >
                        <header className="category-edit-modal-bar">
                            <div>
                                <span className="category-edit-eyebrow">Menu settings</span>
                                <h2 id="category-edit-modal-title">Edit Categories</h2>
                                <p>Set the order customers will see on the QR menu.</p>
                            </div>
                            <button
                                type="button"
                                className="category-edit-close"
                                aria-label="Close category editor"
                                onClick={() => setCategoryOrganizerOpen(false)}
                            >
                                <IoCloseSharp />
                            </button>
                        </header>
                        <CategoryOrderOrganizer
                            categories={categories}
                            hotelId={hotelId}
                            selectedCategory={selectedCategory}
                            onSelect={handleCategorySelect}
                            onSaved={(preferredCategoryId) =>
                                dispatch(getCategoryRequest({ hotelId, preferredCategoryId }))
                            }
                        />
                    </div>
                </div>
            )}

            {managerSection === 'combos' ? (
                <div className="combo-manager-wrap mx-md-5 mx-2">
                    {comboError && <div className="combo-error-box">{comboError}</div>}
                    {comboLoading ? (
                        <div className="combo-empty-card">Loading combos...</div>
                    ) : comboItems.rows?.length ? (
                        <div className="combo-grid">
                            {comboItems.rows.map((combo) => {
                                const ids = Array.isArray(combo.comboItems) ? combo.comboItems : [];
                                const names = ids
                                    .map((id) => allFoodItems.find((item) => String(item.id) === String(id))?.name)
                                    .filter(Boolean);
                                return (
                                    <div key={combo.id} className="combo-card">
                                        <div className="combo-card-top">
                                            <span>🍱</span>
                                            <b>{combo.name}</b>
                                        </div>
                                        <p>{combo.description || 'Combo menu'}</p>
                                        <div className="combo-items-text">
                                            {names.length ? names.join(' + ') : `${ids.length} food items selected`}
                                        </div>
                                        <div className="combo-card-bottom">
                                            <strong>₹{combo.price}</strong>
                                            <span
                                                className={combo.status === MENU_STATUS[0] ? 'combo-live' : 'combo-off'}
                                            >
                                                {combo.status}
                                            </span>
                                        </div>
                                        <div className="combo-card-actions">
                                            <button type="button" onClick={() => setComboModal(combo)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="danger"
                                                onClick={() => handleDeleteCombo(combo.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="combo-empty-card">No combos added yet. Click “Add Combo”.</div>
                    )}
                </div>
            ) : Object.keys(selectedCategory).length ? (
                <div className="d-flex flex-column">
                    <div className="options-container d-flex align-items-center px-4 mx-md-5 mx-2">
                        <h5 className="text-white">{selectedCategory.label}</h5>
                        <ActionDropdown
                            className="ms-auto menu-item-action-dropdown"
                            buttonColor="white"
                            iconColor="#49AC60"
                            options={[
                                { label: 'Add', icon: TiPlus, onClick: () => handleAddItemClick('menu') },
                                {
                                    label: 'Delete',
                                    disabled: !menuItems.count,
                                    icon: MdDeleteForever,
                                    onClick: () => handleDeleteItemClick('menu')
                                }
                            ]}
                        />
                    </div>
                    <div className="manager-menu-tools mx-md-5 mx-2">
                        <input
                            type="text"
                            className="manager-menu-search"
                            name="name"
                            placeholder="Search menu item..."
                            value={filtering?.value || ''}
                            onChange={(e) => dispatch(setFiltering({ field: 'name', value: e.target.value }))}
                        />
                        <div className="manager-food-filter">
                            {['ALL', 'VEG', 'NON_VEG'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={managerFoodFilter === type ? 'active' : ''}
                                    onClick={() => setManagerFoodFilter(type)}
                                >
                                    {type === 'ALL' ? 'All' : type === 'VEG' ? 'Veg' : 'Non-Veg'}
                                </button>
                            ))}
                        </div>
                        <div className="manager-menu-count">
                            {
                                (menuItems.rows || []).filter(
                                    (item) => managerFoodFilter === 'ALL' || item.foodType === managerFoodFilter
                                ).length
                            }{' '}
                            visible
                        </div>
                    </div>

                    {menuItems.rows?.length ? (
                        <div className="manager-menu-grid mx-md-5 mx-2">
                            {menuItems.rows
                                .filter((item) => managerFoodFilter === 'ALL' || item.foodType === managerFoodFilter)
                                .map((item) => {
                                    const available = item.status === MENU_STATUS[0];
                                    return (
                                        <article
                                            key={item.id}
                                            className={`manager-menu-card ${available ? '' : 'unavailable'}`}
                                        >
                                            <button
                                                type="button"
                                                className="manager-menu-image"
                                                title="Click to upload or change photo"
                                                onClick={() => setImageModal({ item })}
                                            >
                                                {item.image ? (
                                                    <SmartImage src={item.image} alt={item.name} />
                                                ) : (
                                                    <span className="manager-menu-image-empty">📷</span>
                                                )}
                                                <span className="manager-menu-photo-action">Change photo</span>
                                            </button>

                                            <div className="manager-menu-card-body">
                                                <div className="manager-menu-card-head">
                                                    <h3 title={item.name}>{item.name}</h3>
                                                    <strong>₹{item.price}</strong>
                                                </div>

                                                <p className="manager-menu-description">
                                                    {item.description || 'No description added'}
                                                </p>

                                                <div className="manager-menu-badges">
                                                    <span
                                                        className={`manager-food-type-badge ${item.foodType === 'NON_VEG' ? 'non-veg' : 'veg'}`}
                                                    >
                                                        <span className="food-type-dot" />
                                                        {item.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                                                    </span>
                                                    <span
                                                        className={
                                                            available
                                                                ? 'manager-menu-status available'
                                                                : 'manager-menu-status unavailable'
                                                        }
                                                    >
                                                        {available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                    <span
                                                        className={
                                                            item.isCartSuggestion
                                                                ? 'cart-suggestion-badge on'
                                                                : 'cart-suggestion-badge'
                                                        }
                                                    >
                                                        Cart Popup {item.isCartSuggestion ? 'ON' : 'OFF'}
                                                    </span>
                                                </div>

                                                <div className="manager-menu-card-footer">
                                                    <small>
                                                        Added{' '}
                                                        {item.createdAt
                                                            ? moment(item.createdAt).format('DD MMM YYYY')
                                                            : '-'}
                                                    </small>
                                                    <button
                                                        type="button"
                                                        className="manager-menu-edit-btn"
                                                        onClick={() => setUpdateModal({ item })}
                                                    >
                                                        <MdModeEditOutline size={18} />
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="manager-menu-empty mx-md-5 mx-2">No menu items found in this category.</div>
                    )}

                    {Number(menuItems.count || 0) > Number(pagination?.pageSize || 10) && (
                        <div className="manager-menu-pagination mx-md-5 mx-2">
                            <button
                                type="button"
                                disabled={!pagination?.pageIndex}
                                onClick={() =>
                                    dispatch(
                                        setPagination({
                                            ...pagination,
                                            pageIndex: Math.max(0, Number(pagination?.pageIndex || 0) - 1)
                                        })
                                    )
                                }
                            >
                                Previous
                            </button>
                            <span>Page {Number(pagination?.pageIndex || 0) + 1}</span>
                            <button
                                type="button"
                                disabled={
                                    (Number(pagination?.pageIndex || 0) + 1) * Number(pagination?.pageSize || 10) >=
                                    Number(menuItems.count || 0)
                                }
                                onClick={() =>
                                    dispatch(
                                        setPagination({
                                            ...pagination,
                                            pageIndex: Number(pagination?.pageIndex || 0) + 1
                                        })
                                    )
                                }
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="d-flex">
                    <NoData className="menu-no-data" />
                </div>
            )}

            {/* Category modals — same OMTModal system */}
            <OMTModal
                show={modalData && ['create', 'update', 'remove', 'removemenu'].includes(modalData.type)}
                type="form"
                validationSchema={getValidationSchema}
                title={modalData?.title}
                initialValues={modalData?.initialValues || {}}
                handleSubmit={handleSubmit}
                description={modalData?.options || {}}
                handleClose={() => dispatch(setMenuModalData(false))}
                isFooter={false}
                size={['remove', 'removemenu'].includes(modalData.type) ? 'md' : 'lg'}
                submitText={modalData?.submitText}
                closeText={modalData?.closeText}
            />

            {/* Quick photo upload (click photo cell in table) */}
            {imageModal && (
                <ImageUploadModal
                    item={imageModal.item}
                    hotelId={hotelId}
                    onClose={() => setImageModal(null)}
                    onSuccess={() => {
                        refreshMenu();
                        setImageModal(null);
                    }}
                />
            )}

            {/* Create menu items with optional image */}
            {createModal && (
                <CreateMenuWithImageModal
                    categoryId={selectedCategory.value}
                    categoryName={selectedCategory.label}
                    categoriesOptions={categoriesOptions}
                    hotelId={hotelId}
                    onClose={() => setCreateModal(false)}
                    onSuccess={({ createdCount, categoryCount, failedCategoryGroups, failedImageUploads }) => {
                        setCreateModal(false);
                        dispatch(setPagination({ ...pagination, pageIndex: 0 }));
                        dispatch(
                            getMenuItemsRequest({
                                categoryId: selectedCategory.value,
                                skip: 0,
                                limit: pagination?.pageSize || 10,
                                sortKey: 'createdAt',
                                sortOrder: 'desc'
                            })
                        );
                        if (failedCategoryGroups || failedImageUploads) {
                            toast.warn(
                                `${createdCount} item(s) created in ${categoryCount} category(s).` +
                                    (failedCategoryGroups
                                        ? ` ${failedCategoryGroups} category batch(es) failed.`
                                        : '') +
                                    (failedImageUploads ? ` ${failedImageUploads} image(s) could not be uploaded.` : '')
                            );
                        } else {
                            toast.success(`${createdCount} menu item(s) added in ${categoryCount} category(s).`);
                        }
                    }}
                />
            )}

            {/* Update menu item with image */}
            {updateModal && (
                <UpdateMenuWithImageModal
                    item={updateModal.item}
                    categoryId={selectedCategory.value}
                    hotelId={hotelId}
                    onClose={() => setUpdateModal(null)}
                    onSuccess={() => {
                        setUpdateModal(null);
                        refreshMenu();
                    }}
                />
            )}

            {comboModal && (
                <ComboModal
                    combo={comboModal.id ? comboModal : null}
                    allFoodItems={allFoodItems}
                    hotelId={hotelId}
                    onClose={() => setComboModal(null)}
                    onSuccess={() => {
                        setComboModal(null);
                        fetchCombos();
                    }}
                />
            )}

            <style>{`
                .menu-thumb-wrap { width:48px; height:48px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px dashed #e2e8f0; display:flex; align-items:center; justify-content:center; transition:border-color .2s; }
                .menu-thumb-wrap:hover { border-color:#49ac60; }
                .menu-thumb { width:100%; height:100%; object-fit:cover; }
                .menu-thumb-placeholder { font-size:1.3rem; opacity:.4; }
                .img-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:9999; display:flex; align-items:center; justify-content:center; }
                .img-modal-box { background:#fff; border-radius:16px; width:400px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.3); overflow:hidden; }
                .img-modal-header { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.2rem; background:#08182d; color:#fff; font-weight:600; font-size:.95rem; }
                .img-modal-close { background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer; opacity:.7; }
                .img-modal-close:hover { opacity:1; }
                .img-modal-body { padding:1.2rem; max-height:65vh; overflow-y:auto; }
                .img-drop-zone { border:2px dashed #e2e8f0; border-radius:12px; padding:1.5rem; text-align:center; cursor:pointer; transition:all .2s; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
                .img-drop-zone:hover, .img-drop-zone.has-preview { border-color:#49ac60; }
                .img-drop-icon { font-size:2.5rem; margin-bottom:.5rem; }
                .img-drop-text { font-weight:600; color:#08182d; margin-bottom:.2rem; }
                .img-drop-hint { font-size:.75rem; color:#7a8a9a; }
                .img-preview { width:100%; height:140px; object-fit:cover; border-radius:8px; }
                .img-change-btn { display:block; margin:.6rem auto 0; background:none; border:1px solid #49ac60; color:#49ac60; border-radius:6px; padding:.3rem .8rem; font-size:.8rem; cursor:pointer; }
                .img-error { color:#e53e3e; font-size:.78rem; margin-top:.5rem; text-align:center; }
                .img-modal-footer { display:flex; gap:.75rem; padding:1rem 1.2rem; border-top:1px solid #f0f0f0; }
                .img-btn-cancel { flex:1; padding:.65rem; border:1.5px solid #e2e8f0; border-radius:8px; background:#fff; cursor:pointer; font-weight:600; color:#4a5568; }
                .img-btn-upload { flex:1; padding:.65rem; border:none; border-radius:8px; background:#49ac60; color:#fff; cursor:pointer; font-weight:700; transition:background .2s; }
                .img-btn-upload:hover:not(:disabled) { background:#3a9450; }
                .img-btn-upload:disabled { opacity:.4; cursor:not-allowed; }
                .create-menu-modal { width:520px; }
                .create-menu-body { display:flex; flex-direction:column; gap:12px; }
                .create-menu-category-banner { padding:.65rem .8rem; border:1px solid rgba(73,172,96,.3); border-radius:8px; background:rgba(73,172,96,.08); color:#245b31; font-size:.85rem; }
                .create-menu-row { display:flex; align-items:center; gap:10px; padding:10px; background:#f8f9fa; border-radius:10px; }
                .create-menu-img-cell { width:52px; height:52px; border-radius:8px; border:2px dashed #cdd5df; display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; flex-shrink:0; transition:border-color .2s; }
                .create-menu-img-cell:hover { border-color:#49ac60; }
                .create-menu-img-preview { width:100%; height:100%; object-fit:cover; }
                .create-menu-img-placeholder { font-size:1.4rem; opacity:.45; }
                .create-menu-fields { flex:1; display:flex; flex-direction:column; gap:6px; }
                .create-menu-input { width:100%; padding:.45rem .7rem; border:1.5px solid #e2e8f0; border-radius:7px; font-size:.88rem; outline:none; transition:border-color .2s; }
                .create-menu-input:focus { border-color:#49ac60; }
                .create-menu-input.input-error { border-color:#e53e3e; }
                .create-menu-field-error { font-size:.72rem; color:#e53e3e; }
                .create-menu-remove-btn { background:none; border:none; color:#a0aec0; font-size:1rem; cursor:pointer; padding:4px; flex-shrink:0; }
                .create-menu-remove-btn:hover { color:#e53e3e; }
                .create-menu-add-row-btn { width:100%; padding:.55rem; border:1.5px dashed #49ac60; border-radius:8px; background:none; color:#49ac60; font-weight:600; font-size:.85rem; cursor:pointer; margin-top:4px; }
                .create-menu-add-row-btn:hover { background:rgba(73,172,96,.06); }
                .update-menu-modal { width:420px; }
                .update-menu-img-row { margin-bottom:12px; }
                .update-img-drop { min-height:120px; }
                .update-menu-field { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; }
                .update-menu-label { font-size:.82rem; font-weight:600; color:#4a5568; }
                .update-menu-status-row { flex-direction:row; align-items:center; gap:10px; }
                .update-menu-checkbox { width:18px; height:18px; cursor:pointer; accent-color:#49ac60; }

                .category-manager-section { display:flex; flex-direction:column; }
                .category-manager-toolbar { align-items:center; gap:10px; }
                .category-manager-toolbar .me-4 { margin-right:0 !important; }
                .category-edit-open-btn { flex:0 0 auto; min-height:42px; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:.55rem .78rem; border:1.5px solid #cfe6d5; border-radius:12px; background:linear-gradient(135deg,#f1fbf3,#fff); color:#2e7e42; font-size:.78rem; font-weight:800; white-space:nowrap; box-shadow:0 6px 18px rgba(73,172,96,.1); transition:all .18s ease; }
                .category-edit-open-btn > svg { font-size:1.15rem; }
                .category-edit-open-btn > b { min-width:22px; height:22px; display:grid; place-items:center; padding:0 5px; border-radius:999px; background:#49ac60; color:#fff; font-size:.67rem; }
                .category-edit-open-btn:hover:not(:disabled) { border-color:#49ac60; background:#49ac60; color:#fff; box-shadow:0 9px 22px rgba(73,172,96,.22); transform:translateY(-1px); }
                .category-edit-open-btn:hover:not(:disabled) > b { background:#fff; color:#2f8f46; }
                .category-edit-open-btn:disabled { opacity:.45; cursor:not-allowed; }
                .category-edit-backdrop { position:fixed; inset:0; z-index:10020; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(4,15,29,.66); backdrop-filter:blur(5px); animation:categoryBackdropIn .18s ease-out; }
                .category-edit-modal { width:min(760px,100%); max-height:calc(100vh - 48px); overflow:hidden; border:1px solid rgba(255,255,255,.45); border-radius:24px; background:#f7faf8; box-shadow:0 28px 80px rgba(3,14,27,.35); animation:categoryModalIn .24s cubic-bezier(.2,.8,.2,1); }
                .category-edit-modal-bar { position:relative; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:20px 22px 16px; color:#fff; background:linear-gradient(125deg,#07182c 0%,#12334a 64%,#22533b 100%); }
                .category-edit-modal-bar::after { content:""; position:absolute; width:150px; height:150px; right:55px; top:-105px; border-radius:50%; border:28px solid rgba(255,255,255,.055); pointer-events:none; }
                .category-edit-eyebrow { display:block; margin-bottom:3px; color:#8ee2a1; font-size:.65rem; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
                .category-edit-modal-bar h2 { margin:0; color:#fff; font-size:1.18rem; font-weight:850; letter-spacing:-.02em; }
                .category-edit-modal-bar p { margin:4px 0 0; color:#c4d2dc; font-size:.76rem; }
                .category-edit-close { position:relative; z-index:1; width:38px; height:38px; flex:0 0 38px; display:grid; place-items:center; padding:0; border:1px solid rgba(255,255,255,.18); border-radius:12px; background:rgba(255,255,255,.09); color:#fff; font-size:1.25rem; transition:all .16s ease; }
                .category-edit-close:hover { border-color:rgba(255,255,255,.42); background:rgba(255,255,255,.18); transform:rotate(4deg); }
                .category-edit-modal .category-order-panel { max-height:calc(100vh - 170px); overflow:hidden; border:0; border-radius:0; box-shadow:none; background:linear-gradient(145deg,#fff 0%,#f7fbf8 100%); }
                .category-edit-modal .category-order-list { max-height:calc(100vh - 365px); min-height:160px; }
                @keyframes categoryBackdropIn { from { opacity:0; } to { opacity:1; } }
                @keyframes categoryModalIn { from { opacity:0; transform:translateY(14px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
                .category-order-panel { position:relative; overflow:hidden; padding:18px; border:1px solid #e5ede8; border-radius:20px; background:linear-gradient(145deg,#ffffff 0%,#f7fbf8 100%); box-shadow:0 16px 45px rgba(8,24,45,.09); }
                .category-order-panel::before { content:""; position:absolute; width:170px; height:170px; right:-75px; top:-90px; border-radius:50%; background:rgba(73,172,96,.08); pointer-events:none; }
                .category-order-header { position:relative; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
                .category-order-heading { display:flex; align-items:flex-start; gap:12px; min-width:0; }
                .category-order-icon { width:44px; height:44px; flex:0 0 44px; display:grid; place-items:center; border-radius:14px; color:#fff; font-size:1.5rem; background:linear-gradient(135deg,#49ac60,#2f8f46); box-shadow:0 8px 18px rgba(73,172,96,.28); }
                .category-order-title-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
                .category-order-title-row h2 { margin:0; color:#08182d; font-size:1.02rem; font-weight:800; letter-spacing:-.01em; }
                .category-order-heading p { margin:4px 0 0; color:#718096; font-size:.8rem; line-height:1.45; }
                .category-order-live { display:inline-flex; align-items:center; gap:5px; padding:.25rem .52rem; border:1px solid #ccebd4; border-radius:999px; background:#edfaf0; color:#287d3c; font-size:.67rem; font-weight:800; letter-spacing:.02em; text-transform:uppercase; }
                .category-order-live > span { width:6px; height:6px; border-radius:50%; background:#49ac60; box-shadow:0 0 0 4px rgba(73,172,96,.12); }
                .category-order-saved, .category-order-dirty { position:relative; flex:0 0 auto; display:inline-flex; align-items:center; gap:5px; padding:.4rem .65rem; border-radius:999px; font-size:.72rem; font-weight:800; }
                .category-order-saved { background:#edf9f0; color:#2f8f46; }
                .category-order-dirty { background:#fff6df; color:#a46600; }
                .category-order-list { position:relative; display:flex; flex-direction:column; gap:9px; max-height:390px; overflow-y:auto; padding:2px 5px 2px 2px; scrollbar-width:thin; scrollbar-color:#b9d7c0 transparent; }
                .category-order-item { display:flex; align-items:center; gap:10px; min-height:62px; padding:8px 10px; border:1.5px solid #e7eeea; border-radius:14px; background:#fff; box-shadow:0 5px 16px rgba(8,24,45,.045); transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease,opacity .18s ease; cursor:grab; }
                .category-order-item:hover { border-color:#b9ddc1; box-shadow:0 9px 22px rgba(8,24,45,.075); transform:translateY(-1px); }
                .category-order-item.selected { border-color:#89cc98; background:linear-gradient(90deg,#f2fbf4,#fff 55%); }
                .category-order-item.dragging { opacity:.55; border-color:#49ac60; box-shadow:0 12px 28px rgba(73,172,96,.18); cursor:grabbing; }
                .category-order-number { width:42px; height:42px; flex:0 0 42px; display:grid; place-items:center; border-radius:12px; background:#eef7f0; color:#2f8f46; font-size:.78rem; font-weight:900; letter-spacing:.04em; }
                .category-order-item.selected .category-order-number { background:#49ac60; color:#fff; }
                .category-order-drag { display:grid; place-items:center; flex:0 0 24px; color:#a7b4aa; font-size:1.45rem; }
                .category-order-name { min-width:0; flex:1; display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:3px 0; border:0; background:transparent; text-align:left; }
                .category-order-name strong { width:100%; overflow:hidden; color:#182b40; font-size:.9rem; text-overflow:ellipsis; white-space:nowrap; }
                .category-order-name small { color:#8a99a8; font-size:.69rem; }
                .category-order-arrows { display:flex; gap:6px; flex:0 0 auto; }
                .category-order-arrows button { width:34px; height:34px; display:grid; place-items:center; padding:0; border:1px solid #dde7e0; border-radius:10px; background:#f8fbf9; color:#355442; font-size:1.2rem; transition:all .16s ease; }
                .category-order-arrows button:hover:not(:disabled) { border-color:#49ac60; background:#49ac60; color:#fff; transform:translateY(-1px); }
                .category-order-arrows button:disabled { opacity:.3; cursor:not-allowed; }
                .category-order-footer { position:relative; display:flex; align-items:center; justify-content:space-between; gap:14px; padding-top:15px; }
                .category-order-footer > small { color:#778797; font-size:.73rem; }
                .category-order-actions { display:flex; gap:8px; flex:0 0 auto; }
                .category-order-actions button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:40px; padding:.55rem .82rem; border-radius:11px; font-size:.78rem; font-weight:800; transition:all .17s ease; }
                .category-order-reset { border:1px solid #dce6df; background:#fff; color:#526355; }
                .category-order-save { border:1px solid #49ac60; background:linear-gradient(135deg,#49ac60,#369b4d); color:#fff; box-shadow:0 7px 17px rgba(73,172,96,.22); }
                .category-order-actions button:hover:not(:disabled) { transform:translateY(-1px); }
                .category-order-actions button:disabled { opacity:.45; cursor:not-allowed; box-shadow:none; }

                .menu-section-tabs { display:flex; gap:10px; margin-bottom:12px; }
                .menu-section-tabs button { border:1.5px solid #dce5ef; background:#fff; color:#08182d; padding:.65rem 1rem; border-radius:999px; font-weight:700; box-shadow:0 6px 18px rgba(8,24,45,.06); }
                .menu-section-tabs button.active { background:#49ac60; color:#fff; border-color:#49ac60; }
                .combo-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; background:#fff; border:1px solid #edf2f7; border-radius:14px; padding:14px; box-shadow:0 8px 25px rgba(8,24,45,.06); }
                .combo-toolbar small { color:#718096; }
                .combo-add-main-btn { border:none; border-radius:10px; background:#49ac60; color:#fff; padding:.7rem 1rem; font-weight:800; white-space:nowrap; }
                .combo-manager-wrap { margin-bottom:28px; }
                .combo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px; }
                .combo-card { background:#fff; border:1px solid #edf2f7; border-radius:16px; padding:16px; box-shadow:0 10px 30px rgba(8,24,45,.08); }
                .combo-card-top { display:flex; gap:10px; align-items:center; font-size:1.05rem; color:#08182d; }
                .combo-card-top span { width:36px; height:36px; border-radius:12px; display:grid; place-items:center; background:#fff7ed; }
                .combo-card p { color:#4a5568; margin:10px 0 6px; font-size:.9rem; }
                .combo-items-text { min-height:38px; color:#718096; font-size:.82rem; line-height:1.35; }
                .combo-card-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:12px; }
                .combo-card-bottom strong { font-size:1.25rem; color:#08182d; }
                .combo-live, .combo-off { border-radius:999px; padding:.25rem .55rem; font-size:.72rem; font-weight:800; }
                .combo-live { background:#e8f8ed; color:#2f8f46; }
                .combo-off { background:#fff1f1; color:#d33; }
                .combo-card-actions { display:flex; gap:10px; margin-top:14px; }
                .combo-card-actions button { flex:1; border:none; border-radius:10px; background:#eef6f0; color:#2f8f46; padding:.55rem; font-weight:700; }
                .combo-card-actions button.danger { background:#fff1f1; color:#d33; }
                .combo-empty-card, .combo-error-box { background:#fff; border-radius:14px; padding:18px; border:1px solid #edf2f7; color:#718096; text-align:center; }
                .combo-error-box { color:#d33; margin-bottom:12px; border-color:#fed7d7; }
                .combo-modal { width:620px; }
                .combo-form-grid { display:grid; grid-template-columns:1fr 150px; gap:12px; }
                .combo-select-head { display:flex; justify-content:space-between; align-items:center; margin:12px 0 8px; }
                .combo-select-head span { color:#718096; font-size:.8rem; }
                .combo-food-list { display:grid; grid-template-columns:1fr; gap:8px; max-height:280px; overflow-y:auto; }
                .combo-food-option { display:flex; align-items:center; gap:10px; border:1.5px solid #edf2f7; background:#fff; border-radius:12px; padding:8px; text-align:left; cursor:pointer; }
                .combo-food-option.active { border-color:#49ac60; background:#f0fff4; }
                .combo-food-photo { width:42px; height:42px; border-radius:10px; overflow:hidden; display:grid; place-items:center; background:#f7fafc; flex-shrink:0; }
                .combo-food-photo img { width:100%; height:100%; object-fit:cover; }
                .combo-food-info { flex:1; display:flex; flex-direction:column; gap:2px; }
                .combo-food-info small { color:#718096; }
                .combo-check { width:26px; height:26px; border-radius:50%; display:grid; place-items:center; background:#edf2f7; color:#4a5568; font-weight:800; }
                .combo-food-option.active .combo-check { background:#49ac60; color:#fff; }
                @media(max-width:576px) {
                    .category-manager-toolbar { gap:7px; }
                    .category-edit-open-btn { min-width:44px; min-height:42px; padding:.5rem .65rem; }
                    .category-edit-open-btn > span { display:none; }
                    .category-edit-open-btn > b { min-width:19px; height:19px; font-size:.61rem; }
                    .category-edit-backdrop { align-items:flex-end; padding:0; }
                    .category-edit-modal { width:100%; max-height:92vh; border:0; border-radius:24px 24px 0 0; animation:categorySheetIn .25s cubic-bezier(.2,.8,.2,1); }
                    .category-edit-modal-bar { padding:17px 16px 14px; }
                    .category-edit-modal .category-order-panel { max-height:calc(92vh - 100px); padding:14px 14px 18px; }
                    .category-edit-modal .category-order-list { max-height:calc(92vh - 330px); min-height:150px; }
                    .category-order-panel { padding:14px; border-radius:17px; }
                    .category-order-header, .category-order-footer { flex-direction:column; align-items:stretch; }
                    .category-order-saved, .category-order-dirty { align-self:flex-start; }
                    .category-order-heading p { max-width:260px; }
                    .category-order-list { max-height:350px; }
                    .category-order-item { gap:7px; min-height:58px; padding:7px; }
                    .category-order-number { width:36px; height:36px; flex-basis:36px; border-radius:10px; }
                    .category-order-drag { display:none; }
                    .category-order-arrows { gap:4px; }
                    .category-order-arrows button { width:32px; height:32px; }
                    .category-order-actions { width:100%; }
                    .category-order-actions button { flex:1; }
                    .combo-toolbar { flex-direction:column; align-items:stretch; }
                    .combo-form-grid { grid-template-columns:1fr; }
                    .combo-modal { width:95vw; }
                }
                @keyframes categorySheetIn { from { opacity:.7; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }

            `}</style>
        </>
    );
}

export default Menu;
