import * as Yup from 'yup';

export const validateCreateCategory = (initialValues, data = []) => {
    if (!initialValues) return Yup.object().shape();

    const names = data.map((obj) => obj.name);

    const valid = {};
    Object.keys(initialValues).forEach((key) => {
        if (!key.startsWith('name-')) return;

        valid[key] = Yup.string()
            .required('Category Name is required')
            .test('is-unique', 'Category name must be unique', function (value) {
                let isValid = !names.includes(value);

                if (isValid) {
                    Object.entries(this.parent).forEach(([vKey, vValue]) => {
                        if (vKey !== key && vKey.startsWith('name-') && vValue === value) {
                            isValid = false;
                        }
                    });
                }
                return isValid;
            });
    });

    return Yup.object().shape(valid);
};

export const validateUpdateCategory = (initialValues, data = []) => {
    const { names, orders } = data.reduce(
        (cur, next) => {
            cur.names.push(next.name);
            cur.orders.push(next.order);
            return cur;
        },
        { names: [], orders: [] }
    );

    return Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .test('is-unique', `Category name is already used`, function (value) {
                if (initialValues.name !== value && names.includes(value)) {
                    return false;
                }
                return true;
            }),
        order: Yup.number()
            .required('Order is required')
            .test('is-unique', `Category order is already used`, function (value) {
                if (initialValues.order !== value && orders.includes(Number(value))) {
                    return false;
                }
                return true;
            })
    });
};

export const defaultValidation = Yup.object().shape({});

export const validateCreateMenuItem = (initialValues, data = []) => {
    if (!initialValues) return Yup.object().shape();

    const names = data.map((obj) => obj.name);
    const valid = {};
    Object.keys(initialValues).forEach((key) => {
        if (key.startsWith('name-')) {
            valid[key] = Yup.string()
                .required('Name is required')
                .test('is-unique', 'Name value must be unique', function (value) {
                    let isValid = !names.includes(value);
                    if (isValid) {
                        Object.entries(this.parent).forEach(([vKey, vValue]) => {
                            if (vKey !== key && vKey.startsWith('name-') && vValue === value) isValid = false;
                        });
                    }
                    return isValid;
                });
            return;
        }
        if (key.startsWith('price-')) {
            valid[key] = Yup.number().typeError('Price is required').required('Price is required').min(0, 'Price cannot be negative');
            return;
        }
        if (key.startsWith('foodType-')) {
            valid[key] = Yup.string().oneOf(['VEG', 'NON_VEG'], 'Use VEG or NON_VEG').required('Food type is required');
            return;
        }
        if (key.startsWith('description-') || key.startsWith('image-')) {
            valid[key] = Yup.string().nullable();
        }
    });

    return Yup.object().shape(valid);
};
