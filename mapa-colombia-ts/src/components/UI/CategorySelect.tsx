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
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #eaeaea',
        padding: '10px 0',
        background: 'white',
    }),
    option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? 'white' : state.data.color || '#333',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || '#0065FF'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}20` : '#f0f7ff')
                : 'white',
        '&:active': {
            background: state.data.color || '#0065FF',
            color: 'white',
        },
    }),
    control: (provided, state) => ({
        ...provided,
        borderRadius: '8px',
        borderColor: state.isFocused ? '#0065FF' : '#eaeaea',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 101, 255, 0.2)' : 'none',
        padding: '4px',
        '&:hover': {
            borderColor: state.isFocused ? '#0065FF' : '#ccc',
        },
    }),
    menuPortal: (provided: CSSObjectWithLabel) => ({
        ...provided,
        zIndex: MENU_Z_INDEX,
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: state.data.color || '#333',
        fontWeight: '500',
    }),
};

const darkStyles: StylesConfig<CategoryOption, false> = {
    menu: (provided) => baseMenuStyles({
        ...provided,
        borderRadius: '8px',
        background: '#2D3748',
        color: 'white',
        border: '1px solid #4A5568',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        padding: '10px 0',
    }),
    option: (provided, state) => ({
        ...provided,
        color: 'white',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || '#0065FF'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}40` : '#4A5568')
                : '#2D3748',
        '&:active': {
            background: state.data.color || '#0065FF',
        },
    }),
    control: (provided, state) => ({
        ...provided,
        borderRadius: '8px',
        background: '#2D3748',
        border: '2px solid #4A5568',
        color: 'white',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(66, 153, 225, 0.5)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#0065FF' : '#4A5568',
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
        color: '#A0AEC0',
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: '#4A5568',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#A0AEC0',
        '&:hover': {
            color: 'white',
        },
    }),
};

const CategorySelect: React.FC<CategorySelectProps> = ({ options, value, onChange, placeholder }) => {
    const { theme } = useTheme();
    const styles = theme === 'dark' ? darkStyles : lightStyles;

    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            styles={styles}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder={placeholder}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="absolute"
            menuShouldScrollIntoView={true}
            maxMenuHeight={220}
            closeMenuOnSelect={true}
        />
    );
};

export default CategorySelect;