// src/pages/MainPage.tsx
import { type User } from 'firebase/auth';
import { type MouseEvent, useState } from 'react';
import ColombiaMap from '../components/ColombiaMap';
import DepartmentModal from '../components/DepartmentModal';
import Legend from '../components/Legend';
import ProgressStats from '../components/ProgressStats';
import TravelTips from '../components/TravelTips';
import UserDropdown from '../components/UserDropdown';
import { departmentsData } from '../data/colombiaMapData';
import { useMapStats } from '../hooks/useMapStats';
import { useUserData } from '../hooks/useUserData';

interface MainPageProps {
    user: User;
    logout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ user, logout }) => {
    const { visitedAttractions, toggleAttraction, isLoadingData } = useUserData(user);
    const { completedCount, partialCount, unvisitedCount, totalProgress } = useMapStats(visitedAttractions);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<{ id: string, name: string } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

    const handleDepartmentClick = (depId: string, depName: string) => {
        console.log("ID del departamento recibido del mapa:", depId);
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
        return <div className="flex justify-center items-center h-screen text-xl">Cargando tus datos...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {tooltip && (
                <div className="absolute pointer-events-none z-30 transform p-2 bg-gray-900 text-white text-sm rounded-md shadow-lg" style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
                    {tooltip.content}
                </div>
            )}
            {isModalOpen && selectedDept && (
                <DepartmentModal
                    departmentId={selectedDept.id}
                    departmentName={selectedDept.name}
                    visitedInDept={visitedAttractions[selectedDept.id] || []}
                    onClose={() => setIsModalOpen(false)}
                    onAttractionToggle={toggleAttraction} />
            )}
            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mapa de Viajes por Colombia</h1>
                        <p className="text-sm text-gray-500">{completedCount + partialCount} / {Object.keys(departmentsData).length} departamentos visitados</p>
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            <img src={user.photoURL ?? ''} alt={user.displayName ?? 'Avatar'} className="w-12 h-12 rounded-full" />
                        </button>
                        {isDropdownOpen && <UserDropdown onLogout={handleLogout} />}
                    </div>
                </header>
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">Interactúa con el mapa:</p>
                    <p>Pasa el mouse sobre un departamento para ver su nombre y haz clic para registrar tus visitas.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    <main className="lg:col-span-4 bg-white p-4 rounded-lg shadow-md">
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
            </div>
        </div>
    );
};

export default MainPage;
