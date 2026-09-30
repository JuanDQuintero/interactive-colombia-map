import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { User } from 'firebase/auth';
import { useCallback, useState } from 'react';
import DepartmentFilter from '../components/Admin/AttractionSection/DepartmentFilter';
import AttractionsManager from '../components/Admin/AttractionSection/AttractionManager';
import ProposalManager from '../components/Admin/PropolsalSection/PropolsalManager';
import Button from '../components/UI/Button';

const AdminPage: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'proposals' | 'attractions'>('proposals');
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedMunicipality, setSelectedMunicipality] = useState('all');

    const [proposalCounts, setProposalCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [attractionCount, setAttractionCount] = useState(0);

    const [refreshSignal, setRefreshSignal] = useState(0);
    const [createSignal, setCreateSignal] = useState(0);

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleProposalCounts = useCallback((pending: number, approved: number, rejected: number) => {
        setProposalCounts({ pending, approved, rejected });
    }, []);

    const handleDepartmentChange = (dept: string) => {
        setSelectedDepartment(dept);
        setSelectedMunicipality('all');
    };

    const handleCreate = () => {
        setActiveTab('attractions');
        setCreateSignal(prev => prev + 1);
    };

    const tabClass = (active: boolean) =>
        `-mb-px flex items-center gap-2 border-b-2 pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${active
            ? 'border-ink text-ink'
            : 'border-transparent text-ink-faint hover:text-ink-soft'
        }`;

    return (
        <div className="min-h-screen bg-paper p-4 sm:p-6 md:p-8">
            <div className="container mx-auto">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center justify-between gap-2 w-full border-b border-rule">
                        <div className="flex gap-7 w-fit shrink-0">
                            <button
                                onClick={() => setActiveTab('proposals')}
                                className={tabClass(activeTab === 'proposals')}
                            >
                                <span className="text-clay">01</span> Propuestas{proposalCounts.pending > 0 && ` (${proposalCounts.pending})`}
                            </button>
                            <button
                                onClick={() => setActiveTab('attractions')}
                                className={tabClass(activeTab === 'attractions')}
                            >
                                <span className="text-clay">02</span> Atractivos{attractionCount > 0 && ` (${attractionCount})`}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setRefreshSignal(prev => prev + 1)}
                                title="Actualizar"
                                aria-label="Actualizar"
                                className="p-2 rounded-md border border-rule text-ink-soft hover:bg-paper-deep transition-colors"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                            <Button
                                onClick={handleCreate}
                                aria-label="Agregar atractivo"
                                className="flex items-center gap-2 whitespace-nowrap px-3"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Agregar atractivo</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <div className="relative w-full sm:max-w-sm">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar..."
                                className="field pl-9"
                            />
                        </div>
                        <DepartmentFilter
                            compact
                            selectedDepartment={selectedDepartment}
                            onDepartmentChange={handleDepartmentChange}
                            selectedMunicipality={selectedMunicipality}
                            onMunicipalityChange={setSelectedMunicipality}
                        />
                    </div>
                </div>

                {activeTab === 'proposals' ? (
                    <ProposalManager
                        key={refreshKey}
                        user={user}
                        onUpdateProposal={handleUpdate}
                        searchQuery={searchQuery}
                        selectedDepartment={selectedDepartment}
                        selectedMunicipality={selectedMunicipality}
                        onCountsChange={handleProposalCounts}
                        refreshSignal={refreshSignal}
                    />
                ) : (
                    <AttractionsManager
                        key={refreshKey}
                        user={user}
                        onUpdateAttraction={handleUpdate}
                        searchQuery={searchQuery}
                        selectedDepartment={selectedDepartment}
                        selectedMunicipality={selectedMunicipality}
                        onCountsChange={setAttractionCount}
                        refreshSignal={refreshSignal}
                        createSignal={createSignal}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminPage;