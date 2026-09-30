import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/16/solid";

interface PropolsalFilterProps {
    selectedStatePropolsal: 'all' | 'pending' | 'approved' | 'rejected';
    onStatePropolsalChange: (propolsal: 'all' | 'pending' | 'approved' | 'rejected') => void;
}

const stateLabels = {
    all: 'Todas las propuestas',
    pending: 'Pendientes',
    approved: 'Aprobadas',
    rejected: 'Rechazadas'
};

const statesPropolsalOptions = [
    { value: 'all', label: stateLabels.all },
    { value: 'pending', label: stateLabels.pending },
    { value: 'approved', label: stateLabels.approved },
    { value: 'rejected', label: stateLabels.rejected },
];

const PropolsalFilter: React.FC<PropolsalFilterProps> = ({ selectedStatePropolsal, onStatePropolsalChange }) => {
    return (
        <div>
            <Listbox value={selectedStatePropolsal} onChange={onStatePropolsalChange}>
                <div className="relative w-full sm:w-64">
                    <ListboxButton className="field grid w-full cursor-default grid-cols-1 text-left">
                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                            <span className="block truncate">
                                {stateLabels[selectedStatePropolsal]}
                            </span>
                        </span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-ink-faint"
                        />
                    </ListboxButton>

                    <ListboxOptions className="panel absolute z-10 mt-1 max-h-60 w-full overflow-auto py-1 text-base shadow-lg">
                        {statesPropolsalOptions.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-ink data-[focus]:bg-ink data-[focus]:text-paper data-[focus]:outline-none"
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
        </div>
    )
}

export default PropolsalFilter