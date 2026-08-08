import { createSlice } from '@reduxjs/toolkit';
import { CATEGORY } from '../types';

const menuSlice = createSlice({
    name: CATEGORY,
    initialState: {
        categories: {},
        menuItems: {},
        categoriesOptions: [],
        selectedCategory: {},
        modalData: false,
        sorting: [{ id: 'createdAt', desc: true }],
        filtering: {},
        pagination: {
            pageIndex: 0,
            pageSize: 10
        }
    },
    reducers: {
        getCategoryRequest() {},
        getCategorySucess(state, action) {
            const result = action.payload?.result || action.payload;
            const preferredCategoryId = action.payload?.preferredCategoryId;
            const { rows } = result;
            const categories = rows?.map((item) => ({ label: item.name, value: item.id }));
            const currentCategoryId = state.selectedCategory?.value;
            const selectedCategory =
                categories?.find((item) => item.value === preferredCategoryId) ||
                categories?.find((item) => item.value === currentCategoryId) ||
                categories?.[0] ||
                {};

            state.categories = result;
            state.categoriesOptions = categories;
            if (selectedCategory.value !== currentCategoryId) {
                state.pagination.pageIndex = 0;
                state.menuItems = {};
            }
            state.selectedCategory = selectedCategory;
        },
        setMenuModalData(state, action) {
            state.modalData = action.payload;
        },
        createCategoryRequest() {},
        setSelectedCategory(state, action) {
            state.selectedCategory = action.payload;
            state.pagination.pageIndex = 0;
            state.menuItems = {};
        },
        updateCategoryRequest() {},
        removeCategoryRequest() {},
        getMenuItemsRequest() {},
        getMenuItemsSuccess(state, action) {
            state.menuItems = action.payload;
        },
        createMenuItemRequest() {},
        removeMenuItemRequest() {},
        updateMenuItemsRequest() {},
        setSorting(state, action) {
            state.sorting = action.payload;
        },
        setFiltering(state, action) {
            state.filtering = action.payload;
        },
        setPagination(state, action) {
            state.pagination = action.payload;
        }
    }
});

export const {
    getCategoryRequest,
    getCategorySucess,
    setMenuModalData,
    createCategoryRequest,
    setSelectedCategory,
    updateCategoryRequest,
    removeCategoryRequest,
    getMenuItemsRequest,
    getMenuItemsSuccess,
    createMenuItemRequest,
    removeMenuItemRequest,
    updateMenuItemsRequest,
    setSorting,
    setFiltering,
    setPagination
} = menuSlice.actions;

export const menuReducer = menuSlice.reducer;
