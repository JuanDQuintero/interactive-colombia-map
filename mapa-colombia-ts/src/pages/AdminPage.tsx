import type { User } from 'firebase/auth';
import { useState } from 'react';
import AttractionsManager from '../components/Admin/AttractionManager';
import ProposalManager from '../components/Admin/PropolsalManager';

const AdminPage: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'proposals' | 'attractions'>('proposals');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
            <div className="container mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Panel de Administración
                    </h1>

                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'proposals'
                                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                }`}
                        >
                            Propuestas
                        </button>
                        <button
                            onClick={() => setActiveTab('attractions')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'attractions'
                                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                }`}
                        >
                            Atractivos
                        </button>
                    </div>
                </header>

                {activeTab === 'proposals' ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filtrar por estado:
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="all">Todas</option>
                                <option value="pending">Pendientes</option>
                                <option value="approved">Aprobadas</option>
                                <option value="rejected">Rechazadas</option>
                            </select>
                        </div>

                        <ProposalManager
                            user={user}
                            filter={filter}
                            onUpdateProposal={handleUpdate}
                            key={refreshKey}
                        />
                    </>
                ) : (
                    <AttractionsManager
                        user={user}
                        onUpdateAttraction={handleUpdate}
                        key={refreshKey}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminPage;