import React from 'react';
import { ErrorMessage, Field } from 'formik';
import moment from 'moment';
import { Form, FormGroup, FormLabel } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { compressHotelLogo } from '../../utils/imageCompression';
import CustomButton from '../CustomButton';
import '../../assets/styles/formGroup.css';

function CustomFormGroup({
    name = '',
    type = 'text',
    label = '',
    className = 'mt-2',
    disabled = false,
    formKey = '',
    options = [],
    setFieldValue = () => {},
    isMulti = true,
    onClick = () => {},
    icon: Icon = <></>,
    getValues = false,
    values = {},
    setFormValues,
    required = false
}) {
    return (
        <FormGroup className={className} key={`${formKey}`}>
            {label && !['button', 'strong'].includes(type) && (
                <FormLabel htmlFor={name} className="small text-muted m-0 d-flex">
                    {label}
                    {required && <div className="text-danger ms-1">*</div>}
                </FormLabel>
            )}
            {type === 'select' ? (
                <Field name={name}>
                    {({ field }) => (
                        <Select
                            {...field}
                            options={options}
                            isMulti={isMulti}
                            onChange={(selectedOptions) => {
                                setFieldValue(name, selectedOptions);
                            }}
                        />
                    )}
                </Field>
            ) : type === 'switch' ? (
                <Field name={name}>
                    {({ field }) => (
                        <Form.Check
                            {...field}
                            type="switch"
                            disabled={disabled}
                            defaultChecked={field.value}
                            onChange={(e) => {
                                setFieldValue(name, e.target.checked);
                            }}
                        />
                    )}
                </Field>
            ) : type === 'checkbox' ? (
                <Field name={name}>
                    {({ field }) => (
                        <Form.Check
                            {...field}
                            disabled={disabled}
                            className="checkbox"
                            defaultChecked={field.value}
                            onChange={(e) => {
                                setFieldValue(name, e.target.checked);
                            }}
                        />
                    )}
                </Field>
            ) : type === 'image' ? (
                <div className="image-branding-field">
                    <div className="image-branding-preview">
                        {values?.logoPreview || values?.logo ? (
                            <img src={values.logoPreview || values.logo} alt="Hotel logo preview" />
                        ) : (
                            <span>RC</span>
                        )}
                    </div>
                    <Field name={name}>
                        {() => (
                            <Form.Control
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                disabled={disabled}
                                onChange={async (event) => {
                                    const file = event.currentTarget.files?.[0];
                                    if (!file) return;
                                    try {
                                        const compressed = await compressHotelLogo(file);
                                        setFieldValue(name, compressed);
                                        setFieldValue('logoPreview', URL.createObjectURL(compressed));
                                        setFieldValue('removeLogo', false);
                                    } catch (error) {
                                        console.error('Hotel logo compression failed:', error);
                                        setFieldValue(name, null);
                                        setFieldValue('logoPreview', '');
                                        toast.error(error?.message || 'Logo image process nahi ho payi');
                                        event.currentTarget.value = '';
                                    }
                                }}
                            />
                        )}
                    </Field>
                    <small className="text-muted">Square WebP · auto crop · target 30–80 KB</small>
                    {(values?.logoPreview || values?.logo) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => {
                                setFieldValue(name, null);
                                setFieldValue('logo', '');
                                setFieldValue('logoPreview', '');
                                setFieldValue('removeLogo', true);
                            }}
                        >
                            Remove Logo
                        </button>
                    )}
                </div>
            ) : type === 'button' ? (
                <Field name={name}>
                    {({ field }) => (
                        <CustomButton
                            {...field}
                            type={type}
                            className={className}
                            disabled={disabled}
                            label={label}
                            onClick={() => {
                                getValues ? onClick(values) : onClick();
                            }}
                        />
                    )}
                </Field>
            ) : type === 'icon' ? (
                <Field name={name}>
                    {({ field }) => (
                        <Icon
                            {...field}
                            key={name}
                            role="button"
                            className={className}
                            onClick={() => {
                                if (Object.keys(values).length <= 2) return;

                                const key = name.split('-')[1];
                                delete values[`name-${key}`];
                                delete values[`order-${key}`];
                                delete values[`price-${key}`];
                                delete values[`description-${key}`];
                                delete values[`image-${key}`];
                                delete values[`foodType-${key}`];
                                delete values[`isBestSeller-${key}`];
                                delete values[`isTodayDeal-${key}`];
                                delete values[`status-${key}`];
                                setFormValues(values);
                                onClick(key, values);
                            }}
                        />
                    )}
                </Field>
            ) : type === 'strong' ? (
                <strong className={className}>{label}</strong>
            ) : (
                <Field
                    data-testid={`${name}-input-${moment().valueOf()}`}
                    type={type}
                    name={name}
                    className="form-control"
                    disabled={disabled}
                />
            )}
            <ErrorMessage
                data-testid={`${name}-error-${moment().valueOf()}`}
                name={name}
                component="div"
                className="text-danger error-message"
            />
        </FormGroup>
    );
}

export default CustomFormGroup;
