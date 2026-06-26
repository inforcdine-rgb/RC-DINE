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

// ── Main Menu page ─────────────────────────────────────────────────────────────
function Menu() {
    const dispatch = useDispatch();
    const { selectedCategory, modalData, categoriesOptions, categories, menuItems, sorting, filtering, pagination } =
        useSelector((state) => state.menu);
    const hotelId = useSelector((state) => state.hotel.globalHotelId);

    const [imageModal, setImageModal] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(null);

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
                <h6>Categories</h6>
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
            </div>

            {Object.keys(selectedCategory).length ? (
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
            `}</style>
        </>
    );
}

export default Menu;
