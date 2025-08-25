import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { departmentsData } from '../../data/colombiaMapData';

interface DepartmentFilterProps {
    selectedDepartment: string;
    onDepartmentChange: (department: string) => void;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({ selectedDepartment, onDepartmentChange }) => {
    const departmentOptions = [
        { value: 'all', label: 'Todos los departamentos' },
        ...Object.entries(departmentsData).map(([id, data]) => ({
            value: id,
            label: data.name
        }))
    ];

    return (
        <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtrar por departamento:
            </label>
            <Listbox value={selectedDepartment} onChange={onDepartmentChange}>
                <div className="relative w-64">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-2 text-left text-gray-900 dark:text-gray-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:focus-visible:outline-blue-400 transition-colors">
                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                            <span className="block truncate">
                                {departmentOptions.find(opt => opt.value === selectedDepartment)?.label}
                            </span>
                        </span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 dark:text-gray-400"
                        />
                    </ListboxButton>

                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 text-base shadow-lg outline outline-1 outline-black/5 dark:outline-gray-600">
                        {departmentOptions.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-gray-100 data-[focus]:bg-blue-600 data-[focus]:text-white data-[focus]:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                                        {option.label}
                                    </span>
                                </div>

                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400 group-[:not([data-selected])]:hidden group-data-[focus]:text-white">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                </span>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    );
};

export default DepartmentFilter;