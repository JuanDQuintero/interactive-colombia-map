import React from 'react';
import Select, { type CSSObjectWithLabel, type SingleValue, type StylesConfig } from 'react-select';
import { useTheme } from '../../context/ThemeContext';

export interface CategoryOption {
    value: string;
    label: string;
    color?: string;
}

interface CategorySelectProps {
    options: CategoryOption[];
    value: CategoryOption | null;
    onChange: (option: SingleValue<CategoryOption>) => void;
    placeholder?: string;
    isSearchable?: boolean;
    disabled?: boolean;
}

// Z-index máximo para que el menú esté siempre por encima de cualquier modal
const MENU_Z_INDEX = 99999;

const baseMenuStyles = (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...provided,
    zIndex: MENU_Z_INDEX,
    overflowY: 'auto',
    maxHeight: '220px',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
});

const lightStyles: StylesConfig<CategoryOption, false> = {
    menu: (provided) => baseMenuStyles({
        ...provided,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--rule)',
        padding: '10px 0',
        background: 'var(--panel)',
    }),
    option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? 'white' : state.data.color || 'var(--ink)',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || 'var(--forest)'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}20` : 'var(--paper-deep)')
                : 'var(--panel)',
        '&:active': {
            background: state.data.color || 'var(--forest)',
            color: 'white',
        },
    }),
    control: (provided, state) => ({
        ...provided,
        borderRadius: '6px',
        borderColor: state.isFocused ? 'var(--forest)' : 'var(--rule)',
        boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, var(--forest) 25%, transparent)' : 'none',
        padding: '4px',
        '&:hover': {
            borderColor: state.isFocused ? 'var(--forest)' : 'var(--rule)',
        },
    }),
    menuPortal: (provided: CSSObjectWithLabel) => ({
        ...provided,
        zIndex: MENU_Z_INDEX,
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: state.data.color || 'var(--ink)',
        fontWeight: '500',
    }),
};

const darkStyles: StylesConfig<CategoryOption, false> = {
    menu: (provided) => baseMenuStyles({
        ...provided,
        borderRadius: '6px',
        background: 'var(--panel)',
        color: 'white',
        border: '1px solid var(--rule)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        padding: '10px 0',
    }),
    option: (provided, state) => ({
        ...provided,
        color: 'white',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || 'var(--forest)'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}40` : 'var(--paper-deep)')
                : 'var(--panel)',
        '&:active': {
            background: state.data.color || 'var(--forest)',
        },
    }),
    control: (provided, state) => ({
        ...provided,
        borderRadius: '6px',
        background: 'var(--panel)',
        border: '2px solid var(--rule)',
        color: 'white',
        boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, var(--forest) 45%, transparent)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? 'var(--forest)' : 'var(--rule)',
        },
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: state.data.color || 'white',
        fontWeight: '500',
    }),
    menuPortal: (provided: CSSObjectWithLabel) => ({
        ...provided,
        zIndex: MENU_Z_INDEX,
    }),
    input: (provided) => ({
        ...provided,
        color: 'white',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'var(--ink-faint)',
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: 'var(--rule)',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: 'var(--ink-faint)',
        '&:hover': {
            color: 'white',
        },
    }),
};

const CategorySelect: React.FC<CategorySelectProps> = ({ options, value, onChange, placeholder, isSearchable = false, disabled = false }) => {
    const { theme } = useTheme();
    const styles = theme === 'dark' ? darkStyles : lightStyles;

    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            styles={styles}
            className={`react-select-container ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            classNamePrefix="react-select"
            placeholder={placeholder}
            isSearchable={isSearchable}
            isDisabled={disabled}
            noOptionsMessage={() => 'Sin resultados'}
            menuPortalTarget={document.body}
            menuPosition="absolute"
            menuShouldScrollIntoView={true}
            maxMenuHeight={220}
            closeMenuOnSelect={true}
        />
    );
};

export default CategorySelect;