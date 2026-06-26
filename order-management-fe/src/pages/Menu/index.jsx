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
    createMenuItemRequest,
    getCategoryRequest,
    getMenuItemsRequest,
    removeCategoryRequest,
    removeMenuItemRequest,
    setFiltering,
    setMenuModalData,
    setPagination,
    setSelectedCategory,
    setSorting,
    updateCategoryRequest,
    updateMenuItemsRequest
} from '../../store/slice/menu.slice';
import { FIELD_CLASS, MENU_STATUS } from '../../utils/constants.js';
import {
    defaultValidation,
    validateCreateCategory,
    validateCreateMenuItem,
    validateUpdateCategory
} from '../../validations/menu.js';

// ── Image upload modal ────────────────────────────────────────────────────────
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
            onClose();
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

// ── Main Menu page ─────────────────────────────────────────────────────────────
function Menu() {
    const dispatch = useDispatch();
    const { selectedCategory, modalData, categoriesOptions, categories, menuItems, sorting, filtering, pagination } =
        useSelector((state) => state.menu);
    const hotelId = useSelector((state) => state.hotel.globalHotelId);

    const [imageModal, setImageModal] = useState(null); // { item }

    const onPaginationChange = (paginate) => dispatch(setPagination(paginate(pagination)));

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
        // ── NEW: dish photo column ──
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
                        onClick={() => handleUpdateItemClick('menu', row.original)}
                    />
                ) : (
                    <></>
                )
        })
    ];

    useEffect(() => {
        if (hotelId) dispatch(getCategoryRequest(hotelId));
    }, [hotelId]);

    const handleAddButtonClick = (modalData, values, type) => {
        const { options } = modalData;
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

        modalData = { ...modalData, initialValues: updatedInitialVals, options: updatedOps };
        dispatch(setMenuModalData(modalData));
        return modalData;
    };

    const handleRemoveClick = (id, modalData, type) => {
        const { options, initialValues } = modalData;
        const secondInput = type === 'category' ? null : 'price';
        const updatedOptions = { ...options };
        const updatedInitialVals = { ...initialValues };

        delete updatedOptions[`name-${id}`];
        if (secondInput) delete updatedOptions[`${secondInput}-${id}`];
        delete updatedOptions[`icon-${id}`];
        delete updatedInitialVals[`name-${id}`];
        if (secondInput) delete updatedInitialVals[`${secondInput}-${id}`];

        modalData = { ...modalData, initialValues: updatedInitialVals, options: updatedOptions };
        dispatch(setMenuModalData(modalData));
        return modalData;
    };

    const handleAddItemClick = (type) => {
        const nameKey = 'name-0';
        const isCategory = type === 'category';
        const secondInput = isCategory ? null : 'price-0';

        const fieldOptions = {
            [nameKey]: {
                name: nameKey,
                type: 'text',
                label: isCategory ? 'Category Name' : 'Name',
                className: isCategory ? 'col-12 my-2' : 'col-md-6 col-12 my-2'
            }
        };
        if (!isCategory) {
            fieldOptions[secondInput] = { name: secondInput, type: 'number', label: 'Price', className: 'col-md-5 col-11 my-2' };
        }

        let addOptions = {
            title: isCategory ? 'Create Category' : 'Create Menu',
            type: isCategory ? 'create' : 'createmenu',
            initialValues: isCategory ? { 'name-0': '' } : { 'name-0': '', [secondInput]: '' },
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

    const handleUpdateItemClick = (type, data = {}) => {
        let initialValues = {};
        let options = {};

        if (type === 'category') {
            const category = categories.rows.find((obj) => obj.id === selectedCategory.value);
            initialValues = { name: category.name, order: category.order };
            options = {
                name: { name: 'name', type: 'text', label: 'Name', className: FIELD_CLASS },
                order: { name: 'order', type: 'number', label: 'Order', className: FIELD_CLASS }
            };
        } else {
            initialValues = { name: data.name, price: data.price, status: data.status === MENU_STATUS[0] };
            options = {
                name: { name: 'name', type: 'text', label: 'Name', className: 'col-12 my-2' },
                price: { name: 'price', type: 'number', label: 'Price', className: 'col-12 my-2' },
                status: { name: 'status', type: 'switch', checked: data.status === MENU_STATUS[0], label: 'Status', className: 'col-12 my-2' }
            };
        }

        const updateOptions = {
            title: type === 'category' ? 'Update Category' : 'Update Menu Item',
            type: type === 'category' ? 'update' : 'updatemenu',
            initialValues,
            options,
            submitText: 'Update',
            closeText: 'Close'
        };
        if (type === 'menu') updateOptions.updateItemId = data.id;
        dispatch(setMenuModalData(updateOptions));
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

        const removeOptions = {
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
        };
        dispatch(setMenuModalData(removeOptions));
    };

    const handleSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);
        const categoryId = selectedCategory.value;

        if (['create', 'createmenu'].includes(modalData.type)) {
            const payload = Object.entries(values).reduce((cur, next) => {
                const obj = next[0].split('-');
                if (!cur[obj[1]]) cur[obj[1]] = {};
                cur[obj[1]][obj[0]] = next[1];
                return cur;
            }, {});

            if (modalData.type === 'create') {
                dispatch(createCategoryRequest({ hotelId, data: Object.values(payload) }));
            } else {
                dispatch(createMenuItemRequest({ hotelId, categoryId: selectedCategory.value, data: Object.values(payload) }));
            }
        }

        if (['update', 'updatemenu'].includes(modalData.type)) {
            const data = {};
            Object.keys(values).forEach((key) => {
                if (values[key] !== modalData.initialValues[key]) data[key] = values[key];
            });
            if (modalData.type === 'update') {
                dispatch(updateCategoryRequest({ hotelId, categoryId, data }));
            } else {
                dispatch(updateMenuItemsRequest({ categoryId, id: modalData.updateItemId, data, hotelId }));
            }
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
                            { label: 'Update', icon: MdModeEditOutline, disabled: !Object.keys(selectedCategory).length, onClick: () => handleUpdateItemClick('category') },
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

            <OMTModal
                show={modalData}
                type="form"
                validationSchema={getValidationSchema}
                title={modalData?.title}
                initialValues={modalData?.initialValues || {}}
                handleSubmit={handleSubmit}
                description={modalData?.options || {}}
                handleClose={() => dispatch(setMenuModalData(false))}
                isFooter={false}
                size={modalData.type === 'remove' ? 'md' : 'lg'}
                submitText={modalData?.submitText}
                closeText={modalData?.closeText}
            />

            {/* Image Upload Modal */}
            {imageModal && (
                <ImageUploadModal
                    item={imageModal.item}
                    hotelId={hotelId}
                    onClose={() => setImageModal(null)}
                    onSuccess={(image) => {
                    // Category select karke fresh data fetch karo
                        dispatch(getMenuItemsRequest({ 
                            categoryId: selectedCategory.value,
                            skip: 0,
                            limit: pagination?.pageSize || 10
                        }));
                        setImageModal(null);
                    }}
                />
            )}

            {/* Inline styles for image upload UI */}
            <style>{`
                .menu-thumb-wrap { width:48px; height:48px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px dashed #e2e8f0; display:flex; align-items:center; justify-content:center; transition:border-color .2s; }
                .menu-thumb-wrap:hover { border-color:#49ac60; }
                .menu-thumb { width:100%; height:100%; object-fit:cover; }
                .menu-thumb-placeholder { font-size:1.3rem; opacity:.4; }
                .img-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:9999; display:flex; align-items:center; justify-content:center; }
                .img-modal-box { background:#fff; border-radius:16px; width:380px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.3); overflow:hidden; }
                .img-modal-header { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.2rem; background:#08182d; color:#fff; font-weight:600; font-size:.95rem; }
                .img-modal-close { background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer; opacity:.7; }
                .img-modal-close:hover { opacity:1; }
                .img-modal-body { padding:1.2rem; }
                .img-drop-zone { border:2px dashed #e2e8f0; border-radius:12px; padding:1.5rem; text-align:center; cursor:pointer; transition:all .2s; min-height:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
                .img-drop-zone:hover, .img-drop-zone.has-preview { border-color:#49ac60; }
                .img-drop-icon { font-size:2.5rem; margin-bottom:.5rem; }
                .img-drop-text { font-weight:600; color:#08182d; margin-bottom:.2rem; }
                .img-drop-hint { font-size:.75rem; color:#7a8a9a; }
                .img-preview { width:100%; height:160px; object-fit:cover; border-radius:8px; }
                .img-change-btn { display:block; margin:.6rem auto 0; background:none; border:1px solid #49ac60; color:#49ac60; border-radius:6px; padding:.3rem .8rem; font-size:.8rem; cursor:pointer; }
                .img-error { color:#e53e3e; font-size:.78rem; margin-top:.5rem; text-align:center; }
                .img-modal-footer { display:flex; gap:.75rem; padding:1rem 1.2rem; border-top:1px solid #f0f0f0; }
                .img-btn-cancel { flex:1; padding:.65rem; border:1.5px solid #e2e8f0; border-radius:8px; background:#fff; cursor:pointer; font-weight:600; color:#4a5568; }
                .img-btn-upload { flex:1; padding:.65rem; border:none; border-radius:8px; background:#49ac60; color:#fff; cursor:pointer; font-weight:700; transition:background .2s; }
                .img-btn-upload:hover:not(:disabled) { background:#3a9450; }
                .img-btn-upload:disabled { opacity:.4; cursor:not-allowed; }
            `}</style>
        </>
    );
}

export default Menu;
