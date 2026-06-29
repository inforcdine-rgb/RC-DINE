import React, { useEffect, useRef, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import moment from 'moment/moment';
import { IoCloseSharp } from 'react-icons/io5';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { TiPlus } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { instance } from '../../api/apiClient';
import ActionDropdown from '../../components/ActionDropdown';
import CustomSelect from '../../components/CustomSelect';
import OMTModal from '../../components/Modal';
import NoData from '../../components/NoData/index.jsx';
import Table from '../../components/Table';
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
    setSorting,
    updateCategoryRequest
} from '../../store/slice/menu.slice';
import { FIELD_CLASS, MENU_STATUS } from '../../utils/constants.js';
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

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError('File size must be under 5MB'); return; }
        setError('');
        setFile(f);
        setPreview(URL.createObjectURL(f));
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
                    <button className="img-modal-close" onClick={onClose}>✕</button>
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
                    <button className="img-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="img-btn-upload" onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Create Menu Items with optional image ─────────────────────────────────────
function CreateMenuWithImageModal({ categoryId, hotelId, onClose, onSuccess }) {
    const [rows, setRows] = useState([{ id: Date.now(), name: '', description: '', price: '', file: null, preview: null }]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileRefs = useRef({});

    const addRow = () => {
        setRows((prev) => [...prev, { id: Date.now(), name: '', description: '', price: '', file: null, preview: null }]);
    };

    const removeRow = (id) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const updateRow = (id, field, value) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const handleFileChange = (id, e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, [id]: 'Max 5MB' }));
            return;
        }
        setErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, file: f, preview: URL.createObjectURL(f) } : r))
        );
    };

    const validate = () => {
        const errs = {};
        rows.forEach((r) => {
            if (!r.name.trim()) errs[`${r.id}-name`] = 'Name required';
            if (!r.price || isNaN(Number(r.price)) || Number(r.price) <= 0) errs[`${r.id}-price`] = 'Valid price required';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const data = rows.map((r) => ({ name: r.name.trim(), description: r.description.trim(), price: Number(r.price) }));
            const res = await instance.post('/menu', { categoryId, hotelId, data });

            const created = Array.isArray(res.data) ? res.data : [];
            const imageUploads = rows
                .map((r, i) => ({ file: r.file, item: created[i] }))
                .filter((x) => x.file && x.item?.id);

            await Promise.all(
                imageUploads.map(async ({ file, item }) => {
                    const fd = new FormData();
                    fd.append('image', file);
                    fd.append('hotelId', hotelId);
                    await instance.post(`/menu/${item.id}/image`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                })
            );

            onSuccess();
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
                    <button className="img-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="img-modal-body create-menu-body">
                    {rows.map((row) => (
                        <div key={row.id} className="create-menu-row">
                            <div
                                className="create-menu-img-cell"
                                title="Click to add photo"
                                onClick={() => fileRefs.current[row.id]?.click()}
                            >
                                {row.preview
                                    ? <img src={row.preview} alt="preview" className="create-menu-img-preview" />
                                    : <span className="create-menu-img-placeholder">📷</span>}
                            </div>
                            <input
                                ref={(el) => { fileRefs.current[row.id] = el; }}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(row.id, e)}
                            />
                            <div className="create-menu-fields">
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
                                {errors[row.id] && (
                                    <span className="create-menu-field-error">{errors[row.id]}</span>
                                )}
                            </div>
                            {rows.length > 1 && (
                                <button className="create-menu-remove-btn" onClick={() => removeRow(row.id)}>✕</button>
                            )}
                        </div>
                    ))}
                    {errors._global && <div className="img-error">{errors._global}</div>}
                    <button className="create-menu-add-row-btn" onClick={addRow}>+ Add Another Item</button>
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>Cancel</button>
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
    const [status, setStatus] = useState(item.status === MENU_STATUS[0]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(item.image || null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const inputRef = useRef();

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: 'Max 5MB' }));
            return;
        }
        setErrors((prev) => { const next = { ...prev }; delete next.image; return next; });
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Valid price required';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const data = {};
            if (name !== item.name) data.name = name.trim();
            if (Number(price) !== Number(item.price)) data.price = Number(price);
            if (description !== (item.description || '')) data.description = description.trim();
            if (status !== (item.status === MENU_STATUS[0])) data.status = status;

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
                    <button className="img-modal-close" onClick={onClose}>✕</button>
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

                    <div className="update-menu-field update-menu-status-row">
                        <label className="update-menu-label">Available</label>
                        <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            className="update-menu-checkbox"
                        />
                    </div>

                    {errors._global && <div className="img-error">{errors._global}</div>}
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>Cancel</button>
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
        if (!name.trim()) { setError('Combo name required'); return; }
        if (!price || Number(price) <= 0) { setError('Valid combo price required'); return; }
        if (selectedIds.length < 2) { setError('Combo me minimum 2 food items add karo'); return; }
        if (selectedIds.length > 5) { setError('Combo me maximum 5 food items allowed hain'); return; }
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
            if (combo?.id) {
                await instance.put(`/menu/combo/${combo.id}`, payload);
            } else {
                await instance.post('/menu/combo', payload);
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
                    <button className="img-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="img-modal-body combo-modal-body">
                    <div className="combo-form-grid">
                        <div className="update-menu-field">
                            <label className="update-menu-label">Combo Name</label>
                            <input className="create-menu-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pizza + Coke Combo" />
                        </div>
                        <div className="update-menu-field">
                            <label className="update-menu-label">Combo Price (₹)</label>
                            <input className="create-menu-input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="199" />
                        </div>
                    </div>
                    <div className="update-menu-field">
                        <label className="update-menu-label">Description</label>
                        <textarea className="create-menu-input create-menu-textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Combo details" />
                    </div>
                    <div className="update-menu-field update-menu-status-row">
                        <label className="update-menu-label">Available</label>
                        <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} className="update-menu-checkbox" />
                    </div>

                    <div className="combo-select-head">
                        <b>Select Food Items</b>
                        <span>{selectedIds.length}/5 selected · min 2</span>
                    </div>
                    <div className="combo-food-list">
                        {allFoodItems.map((item) => {
                            const active = selectedIds.includes(String(item.id));
                            return (
                                <button key={item.id} type="button" className={`combo-food-option ${active ? 'active' : ''}`} onClick={() => toggleFood(item.id)}>
                                    <span className="combo-food-photo">{item.image ? <img src={item.image} alt={item.name} /> : '🍽️'}</span>
                                    <span className="combo-food-info"><b>{item.name}</b><small>₹{item.price} · {item.categoryName}</small></span>
                                    <span className="combo-check">{active ? '✓' : '+'}</span>
                                </button>
                            );
                        })}
                    </div>
                    {error && <div className="img-error">{error}</div>}
                </div>
                <div className="img-modal-footer">
                    <button className="img-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="img-btn-upload" onClick={handleSubmit} disabled={saving || selectedIds.length < 2 || selectedIds.length > 5}>
                        {saving ? 'Saving...' : combo?.id ? 'Update Combo' : 'Create Combo'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Menu page ─────────────────────────────────────────────────────────────
function Menu() {
    const dispatch = useDispatch();
    const { selectedCategory, modalData, categoriesOptions, categories, menuItems, sorting, filtering, pagination } =
        useSelector((state) => state.menu);
    const hotelId = useSelector((state) => state.hotel.globalHotelId);

    const [imageModal, setImageModal] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(null);
    const [managerSection, setManagerSection] = useState('categories');
    const [comboItems, setComboItems] = useState({ count: 0, rows: [] });
    const [allFoodItems, setAllFoodItems] = useState([]);
    const [comboModal, setComboModal] = useState(null);
    const [comboLoading, setComboLoading] = useState(false);
    const [comboError, setComboError] = useState('');

    const onPaginationChange = (paginate) => dispatch(setPagination(paginate(pagination)));

    const refreshMenu = () => {
        dispatch(getMenuItemsRequest({
            categoryId: selectedCategory.value,
            skip: pagination?.pageIndex ? pagination.pageIndex * pagination.pageSize : 0,
            limit: pagination?.pageSize || 10,
            sortKey: sorting[0]?.id,
            sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
            filterKey: filtering?.field,
            filterValue: filtering?.value
        }));
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
        if (!categories?.rows?.length) { setAllFoodItems([]); return; }
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
        const params = {
            skip: pagination?.pageIndex ? pagination.pageIndex * pagination.pageSize : undefined,
            limit: pagination?.pageSize,
            sortKey: sorting[0]?.id,
            sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
            filterKey: filtering?.field,
            filterValue: filtering?.value,
            categoryId: selectedCategory.value
        };
        dispatch(getMenuItemsRequest(params));
    // eslint-disable-next-line
    }, [pagination, sorting[0]?.desc, sorting[0]?.id, filtering.field, filtering.value]);

    const onSortingChange = (e) => {
        const sortDetails = e()[0];
        const data = [...sorting][0];
        if (!data || data.id !== sortDetails.id) {
            dispatch(setSorting([{ id: sortDetails.id, desc: false }]));
            return;
        }
        dispatch(setSorting([{ ...data, desc: !data.desc }]));
    };

    const onFilterChange = (e) => {
        dispatch(setFiltering({ field: e.target.name, value: e.target.value }));
    };

    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.display({
            id: 'image',
            header: 'Photo',
            minSize: 80,
            cell: ({ row }) => (
                <div
                    className="menu-thumb-wrap"
                    title="Click to upload photo"
                    onClick={() => setImageModal({ item: row.original })}
                >
                    {row.original.image ? (
                        <img src={row.original.image} alt={row.original.name} className="menu-thumb" />
                    ) : (
                        <div className="menu-thumb-placeholder">📷</div>
                    )}
                </div>
            )
        }),
        columnHelper.display({
            id: 'name',
            header: 'Name',
            minSize: 200,
            cell: ({ row }) => <div>{row.original.name}</div>
        }),
        columnHelper.display({
            id: 'description',
            header: 'Description',
            minSize: 260,
            cell: ({ row }) => <div className="menu-desc-cell">{row.original.description || '-'}</div>
        }),
        columnHelper.display({
            id: 'price',
            header: 'Price',
            minSize: 150,
            cell: ({ row }) => <div>{row.original.price}</div>
        }),
        columnHelper.display({
            id: 'status',
            header: 'Status',
            minSize: 180,
            cell: ({ row }) => row.original.status && <h6>{row.original.status}</h6>
        }),
        columnHelper.display({
            id: 'createdAt',
            header: 'Added On',
            minSize: 150,
            cell: ({ row }) =>
                row.original.createdAt && <div>{moment(row.original.createdAt).format('DD-MMM-YYYY')}</div>
        }),
        columnHelper.display({
            id: 'update',
            header: 'Update',
            enableSorting: 'FALSE',
            enableFiltering: 'FALSE',
            minSize: 150,
            cell: ({ row }) =>
                row.original.name ? (
                    <MdModeEditOutline
                        color="#49AC60"
                        size={20}
                        role="button"
                        onClick={() => setUpdateModal({ item: row.original })}
                    />
                ) : (
                    <></>
                )
        })
    ];

    useEffect(() => {
        if (hotelId) dispatch(getCategoryRequest(hotelId));
    }, [hotelId]);

    useEffect(() => {
        if (hotelId && managerSection === 'combos') {
            fetchCombos();
            fetchAllFoodItems();
        }
    // eslint-disable-next-line
    }, [hotelId, managerSection, categories?.rows?.length]);

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
                    onClick: (id) => { addOptions = handleRemoveClick(id, addOptions, type); }
                },
                'add-button': {
                    name: 'add-button',
                    type: 'button',
                    label: 'Add',
                    className: 'col my-2 ms-auto w-100',
                    getValues: true,
                    invalidDisable: true,
                    onClick: (values) => { addOptions = handleAddButtonClick(addOptions, values, type); }
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
                cur.options[key] = { name: key, type: 'checkbox', label: `${next.name}`, className: 'd-flex justify-content-between my-2' };
                cur.initialValues[key] = false;
                return cur;
            },
            { initialValues: {}, options: {} }
        );

        dispatch(setMenuModalData({
            title: type === 'category' ? 'Remove Categories' : 'Remove Menu Items',
            type: type === 'category' ? 'remove' : 'removemenu',
            initialValues,
            options: {
                warning: {
                    name: 'warning',
                    type: 'strong',
                    label: type === 'category'
                        ? '⚠️ Warning: Deleting categories will remove all menu items linked with them!'
                        : '⚠️ Warning: The action cannot be undone!',
                    className: 'text-center my-2 text-danger'
                },
                ...options
            },
            submitText: 'Remove',
            closeText: 'Close'
        }));
    };

    const handleUpdateCategoryClick = () => {
        const category = categories.rows.find((obj) => obj.id === selectedCategory.value);
        dispatch(setMenuModalData({
            title: 'Update Category',
            type: 'update',
            initialValues: { name: category.name, order: category.order },
            options: {
                name: { name: 'name', type: 'text', label: 'Name', className: FIELD_CLASS },
                order: { name: 'order', type: 'number', label: 'Order', className: FIELD_CLASS }
            },
            submitText: 'Update',
            closeText: 'Close'
        }));
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
            case 'create': return validateCreateCategory(modalData?.initialValues, categories?.rows);
            case 'update': return validateUpdateCategory(modalData?.initialValues, categories?.rows);
            case 'createmenu': return validateCreateMenuItem(modalData?.initialValues, menuItems?.rows);
            default: return defaultValidation;
        }
    };

    return (
        <>
            <div className="width-container mx-auto my-4">
                <div className="menu-section-tabs">
                    <button type="button" className={managerSection === 'categories' ? 'active' : ''} onClick={() => setManagerSection('categories')}>Categories</button>
                    <button type="button" className={managerSection === 'combos' ? 'active' : ''} onClick={() => setManagerSection('combos')}>🍱 Combos</button>
                </div>
                {managerSection === 'categories' ? (
                    <div className="d-flex">
                        <CustomSelect
                            className="w-100 me-4"
                            options={categoriesOptions || []}
                            value={selectedCategory}
                            onChange={(item) => {
                                dispatch(setSelectedCategory(item));
                                dispatch(getMenuItemsRequest({ categoryId: item.value }));
                            }}
                        />
                        <ActionDropdown
                            options={[
                                { label: 'Add', icon: TiPlus, onClick: () => handleAddItemClick('category') },
                                { label: 'Update', icon: MdModeEditOutline, disabled: !Object.keys(selectedCategory).length, onClick: handleUpdateCategoryClick },
                                { label: 'Delete', disabled: !Object.keys(selectedCategory).length, icon: MdDeleteForever, onClick: () => handleDeleteItemClick('category') }
                            ]}
                        />
                    </div>
                ) : (
                    <div className="combo-toolbar">
                        <div>
                            <h6 className="mb-1">Combos Menu</h6>
                            <small>1 combo me minimum 2 aur maximum 5 food items add honge.</small>
                        </div>
                        <button className="combo-add-main-btn" type="button" onClick={() => setComboModal({})}>+ Add Combo</button>
                    </div>
                )}
            </div>

            {managerSection === 'combos' ? (
                <div className="combo-manager-wrap mx-md-5 mx-2">
                    {comboError && <div className="combo-error-box">{comboError}</div>}
                    {comboLoading ? (
                        <div className="combo-empty-card">Loading combos...</div>
                    ) : comboItems.rows?.length ? (
                        <div className="combo-grid">
                            {comboItems.rows.map((combo) => {
                                const ids = Array.isArray(combo.comboItems) ? combo.comboItems : [];
                                const names = ids.map((id) => allFoodItems.find((item) => String(item.id) === String(id))?.name).filter(Boolean);
                                return (
                                    <div key={combo.id} className="combo-card">
                                        <div className="combo-card-top"><span>🍱</span><b>{combo.name}</b></div>
                                        <p>{combo.description || 'Combo menu'}</p>
                                        <div className="combo-items-text">{names.length ? names.join(' + ') : `${ids.length} food items selected`}</div>
                                        <div className="combo-card-bottom">
                                            <strong>₹{combo.price}</strong>
                                            <span className={combo.status === MENU_STATUS[0] ? 'combo-live' : 'combo-off'}>{combo.status}</span>
                                        </div>
                                        <div className="combo-card-actions">
                                            <button type="button" onClick={() => setComboModal(combo)}>Edit</button>
                                            <button type="button" className="danger" onClick={() => handleDeleteCombo(combo.id)}>Delete</button>
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
                            className="ms-auto"
                            buttonColor="white"
                            iconColor="#49AC60"
                            options={[
                                { label: 'Add', icon: TiPlus, onClick: () => handleAddItemClick('menu') },
                                { label: 'Delete', disabled: !menuItems.count, icon: MdDeleteForever, onClick: () => handleDeleteItemClick('menu') }
                            ]}
                        />
                    </div>
                    <Table
                        columns={columns}
                        data={menuItems.rows}
                        count={menuItems.count}
                        onPaginationChange={onPaginationChange}
                        pagination={pagination}
                        onSortingChange={onSortingChange}
                        sorting={sorting}
                        onFilterChange={onFilterChange}
                        filtering={filtering}
                    />
                </div>
            ) : (
                <div className="d-flex"><NoData className="menu-no-data" /></div>
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
                    onSuccess={() => { refreshMenu(); setImageModal(null); }}
                />
            )}

            {/* Create menu items with optional image */}
            {createModal && (
                <CreateMenuWithImageModal
                    categoryId={selectedCategory.value}
                    hotelId={hotelId}
                    onClose={() => setCreateModal(false)}
                    onSuccess={() => {
                        setCreateModal(false);
                        dispatch(getMenuItemsRequest({ categoryId: selectedCategory.value }));
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
                    onSuccess={() => { setUpdateModal(null); refreshMenu(); }}
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
                @media(max-width:576px) { .combo-toolbar { flex-direction:column; align-items:stretch; } .combo-form-grid { grid-template-columns:1fr; } .combo-modal { width:95vw; } }

            `}</style>
        </>
    );
}

export default Menu;
