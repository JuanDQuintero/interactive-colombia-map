import type { User } from 'firebase/auth';
import { useState } from 'react';
import AttractionsManager from '../components/Admin/AttractionManager';
import ProposalManager from '../components/Admin/PropolsalManager';

const AdminPage: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'proposals' | 'attractions'>('proposals');
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
                    <ProposalManager
                        user={user}
                        onUpdateProposal={handleUpdate}
                        key={refreshKey}
                    />
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