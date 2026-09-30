import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { departmentsData } from '../../../data/colombiaMapData';
import { getMunicipalitiesForDepartment } from '../../../data/municipalitiesData';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';

interface DepartmentFilterProps {
    selectedDepartment: string;
    onDepartmentChange: (department: string) => void;
    selectedMunicipality: string;
    onMunicipalityChange: (municipality: string) => void;
    compact?: boolean;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({ selectedDepartment, onDepartmentChange, selectedMunicipality, onMunicipalityChange, compact = false }) => {
    const departmentOptions = [
        { value: 'all', label: 'Todos los departamentos' },
        ...Object.entries(departmentsData).map(([id, data]) => ({
            value: id,
            label: data.name
        }))
    ];

    const municipalityOptions = getMunicipalitiesForDepartment(selectedDepartment);

    const [municipalitySearch, setMunicipalitySearch] = useState('');
    const filteredMunicipalities = municipalityOptions.filter((m) =>
        m.name.toLowerCase().includes(municipalitySearch.trim().toLowerCase())
    );

    return (
        <div className={`flex flex-col gap-3 ${compact ? 'sm:flex-row sm:items-center sm:gap-3' : 'sm:flex-row sm:items-center sm:gap-4'}`}>
            {!compact && (
                <label className="field-label">
                    Filtrar por departamento:
                </label>
            )}
            <Listbox value={selectedDepartment} onChange={onDepartmentChange}>
                <div className={`relative w-full ${compact ? 'sm:w-48' : 'sm:w-64'}`}>
                    <ListboxButton className="field grid w-full cursor-default grid-cols-1 text-left transition-colors">
                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                            <span className="block truncate">
                                {selectedDepartment === 'all'
                                    ? 'Todos los departamentos'
                                    : getDepartmentDisplayName(selectedDepartment)
                                }
                            </span>
                        </span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-ink-faint"
                        />
                    </ListboxButton>

                    <ListboxOptions className="panel absolute z-10 mt-1 max-h-60 w-full overflow-auto py-1 text-base shadow-lg">
                        {departmentOptions.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-ink data-[focus]:bg-forest data-[focus]:text-paper data-[focus]:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                                        {option.label}
                                    </span>
                                </div>

                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-forest group-[:not([data-selected])]:hidden group-data-[focus]:text-paper">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                </span>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

            {selectedDepartment !== 'all' && municipalityOptions.length > 0 && (
                <Listbox value={selectedMunicipality} onChange={onMunicipalityChange}>
                    <div className={`relative w-full ${compact ? 'sm:w-48' : 'sm:w-64'}`}>
                        <ListboxButton onClick={() => setMunicipalitySearch('')} className="field grid w-full cursor-default grid-cols-1 text-left transition-colors">
                            <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                <span className="block truncate">
                                    {selectedMunicipality === 'all'
                                        ? 'Todos los municipios'
                                        : municipalityOptions.find(m => m.id === selectedMunicipality)?.name || 'Selecciona un municipio'}
                                </span>
                            </span>
                            <ChevronUpDownIcon
                                aria-hidden="true"
                                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-ink-faint"
                            />
                        </ListboxButton>

                        <ListboxOptions className="panel absolute z-10 mt-1 max-h-72 w-full overflow-auto py-1 text-base shadow-lg">
                            <div className="relative px-2 py-1.5 border-b border-rule">
                                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-ink-faint" />
                                <input
                                    type="text"
                                    value={municipalitySearch}
                                    onChange={(e) => setMunicipalitySearch(e.target.value)}
                                    placeholder="Buscar municipio..."
                                    className="field pl-8"
                                />
                            </div>
                            <ListboxOption
                                value="all"
                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-ink data-[focus]:bg-forest data-[focus]:text-paper data-[focus]:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                                        Todos los municipios
                                    </span>
                                </div>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-forest group-[:not([data-selected])]:hidden group-data-[focus]:text-paper">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                </span>
                            </ListboxOption>
                            {filteredMunicipalities.map((option) => (
                                <ListboxOption
                                    key={option.id}
                                    value={option.id}
                                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-ink data-[focus]:bg-forest data-[focus]:text-paper data-[focus]:outline-none"
                                >
                                    <div className="flex items-center">
                                        <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                                            {option.name}
                                        </span>
                                    </div>

                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-forest group-[:not([data-selected])]:hidden group-data-[focus]:text-paper">
                                        <CheckIcon aria-hidden="true" className="size-5" />
                                    </span>
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </div>
                </Listbox>
            )}
        </div>
    );
};

export default DepartmentFilter;