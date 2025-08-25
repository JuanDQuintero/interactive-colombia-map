import { type User } from 'firebase/auth';
import { type MouseEvent, useState } from 'react';
import ColombiaMap from '../components/ColombiaMap';
import DepartmentModal from '../components/DepartmentModal';
import Legend from '../components/Legend';
import Notifications from '../components/Notifications';
import ProgressStats from '../components/ProgressStats';
import TravelTips from '../components/TravelTips';
import Loader from '../components/UI/Loader';
import UserDropdown from '../components/UI/UserDropdown';
import { departmentsData } from '../data/colombiaMapData';
import { useMapStats } from '../hooks/useMapStats';
import { useUserData } from '../hooks/useUserData';
import AdminPage from './AdminPage';

interface MainPageProps {
    user: User;
    logout: () => void;
    isAdmin?: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ user, logout, isAdmin }) => {
    const {
        visitedAttractions,
        isLoadingData,
        saveDepartmentAttractions,
    } = useUserData(user);

    const { completedCount, partialCount, unvisitedCount, totalProgress } = useMapStats(visitedAttractions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<{ id: string, name: string } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'map' | 'admin'>('map');
    const handleDepartmentClick = (depId: string, depName: string) => {
        setSelectedDept({ id: depId, name: depName });
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    const handleMapHover = (name: string | null, event?: MouseEvent) => {
        if (name && event) {
            setTooltip({ content: name, x: event.pageX, y: event.pageY });
        } else {
            setTooltip(null);
        }
    };

    if (isLoadingData) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans dark:bg-gray-900">
            {tooltip && (
                <div className="absolute pointer-events-none z-30 transform p-2 bg-gray-900 text-white text-sm rounded-md shadow-lg"
                    style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
                    {tooltip.content}
                </div>
            )}

            {isModalOpen && selectedDept && (
                <DepartmentModal
                    departmentId={selectedDept.id}
                    departmentName={selectedDept.name}
                    visitedInDept={visitedAttractions[selectedDept.id] || []}
                    onClose={() => setIsModalOpen(false)}
                    saveDepartmentAttractions={saveDepartmentAttractions}
                />
            )}

            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                {/* Header con pestañas */}
                <header className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {activeTab === 'map' ? 'Mapa de Viajes por Colombia' : 'Panel de Administración'}
                            </h1>
                            {activeTab === 'map' && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {completedCount + partialCount} / {Object.keys(departmentsData).length} departamentos visitados
                                </p>
                            )}
                        </div>

                        <div className="relative flex items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Notifications userId={user?.uid} isAdmin={isAdmin} />
                            </div>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="outline-1 rounded-full overflow-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 mr-2 focus:outline-none transition-all duration-200"
                            >
                                <img
                                    src={user.photoURL ?? 'src/assets/default-avatar.jpg'}
                                    alt={user.displayName ?? 'Avatar'}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                                />
                            </button>
                            {isDropdownOpen && <UserDropdown onLogout={handleLogout} onClose={() => setIsDropdownOpen(false)} />}
                        </div>

                    </div>

                    {/* Barra de pestañas */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-2 font-medium text-sm flex cursor-pointer items-center gap-2 ${activeTab === 'map'
                                ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                            </svg>
                            Mapa
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-2 font-medium text-sm flex cursor-pointer items-center gap-2 ${activeTab === 'admin'
                                    ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                Administración
                            </button>
                        )}
                    </div>

                </header>

                {activeTab === 'map' ? (
                    <>
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-200" role="alert">
                            <p className="font-bold">Interactúa con el mapa:</p>
                            <p>Pasa el mouse sobre un departamento para ver su nombre y haz clic para registrar tus visitas.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                            <main className="lg:col-span-4 bg-white dark:bg-gray-600/50 p-4 rounded-lg shadow-md dark:border dark:border-gray-700">
                                <ColombiaMap
                                    visitedAttractions={visitedAttractions}
                                    onDepartmentClick={handleDepartmentClick}
                                    onDepartmentHover={handleMapHover}
                                />
                            </main>
                            <aside className="lg:col-span-2 space-y-6">
                                <ProgressStats completed={completedCount} partial={partialCount} unvisited={unvisitedCount} totalProgress={totalProgress} />
                                <Legend completed={completedCount} partial={partialCount} unvisited={unvisitedCount} />
                                <TravelTips />
                            </aside>
                        </div>
                    </>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <AdminPage user={user} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPage;