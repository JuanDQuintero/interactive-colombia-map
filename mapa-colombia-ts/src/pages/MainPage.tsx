import { type User } from 'firebase/auth';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import colombiaIcon from '../assets/Colombia-icon.png';
import ColombiaMap from '../components/Map/ColombiaMap';
import DepartmentMap from '../components/Map/DepartmentMap';
import Legend from '../components/Map/Legend';
import DepartmentModal from '../components/Modals/DepartmentModal';
import ProgressStats from '../components/Stats/ProgressStats';
import InstallAppButton from '../components/UI/InstallAppButton';
import Loader from '../components/UI/Loader';
import UserDropdown from '../components/UI/UserDropdown';
import Notifications from '../components/User/Notifications';
import TravelTips from '../components/User/TravelTips';
import { departmentsData } from '../data/colombiaMapData';
import { useDepartmentStats } from '../hooks/useDepartmentStats';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<{ id: string, name: string } | null>(null);
    const [drillDept, setDrillDept] = useState<{ id: string, name: string } | null>(null);
    const [presetMunicipalityId, setPresetMunicipalityId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'map' | 'admin'>('map');

    // El tooltip de hover solo deberia verse con mouse real y sin estar
    // presionando; manteniendo pulsado (movil/PC) no debe aparecer ningun recuadro.
    const lastPointerTypeRef = useRef<string | null>(null);
    const isPointerDownRef = useRef(false);
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            lastPointerTypeRef.current = e.pointerType;
            isPointerDownRef.current = true;
            setTooltip(null);
        };
        const onPointerUp = () => { isPointerDownRef.current = false; };
        const onPointerCancel = () => { isPointerDownRef.current = false; };
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerCancel);
        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerCancel);
        };
    }, []);

    const { completedCount, partialCount, unvisitedCount, totalProgress } = useMapStats(visitedAttractions);
    const deptStats = useDepartmentStats(visitedAttractions, drillDept?.id ?? null);
    const isDrilling = drillDept !== null && deptStats !== null && deptStats.loaded;
    const handleDepartmentClick = (depId: string, depName: string) => {
        setTooltip(null);
        setDrillDept({ id: depId, name: depName });
    };

    const openDepartmentModal = (department: { id: string, name: string }, municipalityId: string | null) => {
        setTooltip(null);
        setSelectedDept(department);
        setPresetMunicipalityId(municipalityId);
        setIsModalOpen(true);
    };

    const handleShowAttractions = () => {
        if (drillDept) openDepartmentModal(drillDept, null);
    };

    const handleMunicipalityClick = (municipalityId: string) => {
        if (drillDept) openDepartmentModal(drillDept, municipalityId);
    };

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    const handleMapHover = (name: string | null, event?: MouseEvent) => {
        if (name && event && !isPointerDownRef.current && lastPointerTypeRef.current !== 'touch') {
            setTooltip({ content: name, x: event.pageX, y: event.pageY });
        } else {
            setTooltip(null);
        }
    };

    if (isLoadingData) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-paper font-sans text-ink">
            {tooltip && (
                <div className="absolute pointer-events-none z-30 px-2.5 py-1.5 bg-ink text-paper text-xs font-medium tracking-wide rounded shadow-lg"
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
                    user={user}
                    isAdmin={isAdmin}
                    initialMunicipalityId={presetMunicipalityId}
                />
            )}

            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                {/* Header editorial: marca, título e índice de secciones */}
                <header className="mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rule bg-panel shadow-sm">
                                <img src={colombiaIcon} alt="" className="h-7 w-7" />
                            </span>
                            <div>
                                <p className="micro text-clay mb-1.5">Guía interactiva de viajes</p>
                                <h1 className="font-display text-[1.65rem] md:text-[2.15rem] font-semibold leading-tight tracking-tight text-ink">
                                    {activeTab === 'map' ? (
                                        <>Check &amp; Travel <em className="font-normal italic text-clay">Colombia</em></>
                                    ) : (
                                        <>Panel de <em className="font-normal italic text-clay">administración</em></>
                                    )}
                                </h1>
                                {activeTab === 'map' && (
                                    <p className="mt-1.5 text-sm text-ink-soft">
                                        {drillDept && deptStats ? (
                                            <>
                                                <span className="font-semibold text-ink tabular-nums">{deptStats.visitedMunicipalities}</span>
                                                {' de '}
                                                <span className="tabular-nums">{deptStats.totalMunicipalities}</span>
                                                {' municipios visitados en '}
                                                <span className="font-medium text-ink">{drillDept.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-semibold text-ink tabular-nums">{completedCount + partialCount}</span>
                                                {' de '}
                                                <span className="tabular-nums">{Object.keys(departmentsData).length}</span>
                                                {' departamentos con al menos una visita'}
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="relative flex items-center gap-2">
                            <InstallAppButton />
                            <Notifications
                                userId={user?.uid}
                                isAdmin={isAdmin}
                                onOpenProposal={() => setActiveTab('admin')}
                            />
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="ml-1 outline-1 rounded-full overflow-hidden ring-rule hover:ring-2 focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper focus:ring-forest mr-1 focus:outline-none transition-all duration-200"
                            >
                                <img
                                    src={user.photoURL ?? 'src/assets/default-avatar.jpg'}
                                    alt={user.displayName ?? 'Avatar'}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full"
                                />
                            </button>
                            {isDropdownOpen && <UserDropdown onLogout={handleLogout} onClose={() => setIsDropdownOpen(false)} />}
                        </div>

                    </div>

                    {/* Índice de secciones, como en una guía impresa */}
                    <nav className="mt-6 flex gap-7 border-b border-rule">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${activeTab === 'map'
                                ? 'border-ink text-ink'
                                : 'border-transparent text-ink-faint hover:text-ink-soft'}`}
                        >
                            <span className="text-clay">01</span> Mapa
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${activeTab === 'admin'
                                    ? 'border-ink text-ink'
                                    : 'border-transparent text-ink-faint hover:text-ink-soft'}`}
                            >
                                <span className="text-clay">02</span> Administración
                            </button>
                        )}
                    </nav>

                    {activeTab === 'map' && (
                        <p className="mt-4 flex items-start gap-2.5 font-display text-[15px] italic leading-relaxed text-ink-soft">
                            <span aria-hidden="true" className="mt-px font-sans text-sm font-bold not-italic text-clay">→</span>
                            Toca un departamento para explorar sus municipios y toca un municipio para registrar tus visitas.
                        </p>
                    )}

                </header>

                {activeTab === 'map' ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                            <main className="lg:col-span-4 panel p-4 sm:p-5">
                                {drillDept ? (
                                    <DepartmentMap
                                        departmentId={drillDept.id}
                                        departmentName={drillDept.name}
                                        visitedAttractions={visitedAttractions}
                                        onMunicipalityClick={handleMunicipalityClick}
                                        onBack={() => setDrillDept(null)}
                                        onShowAttractions={handleShowAttractions}
                                        onHover={handleMapHover}
                                    />
                                ) : (
                                    <ColombiaMap
                                        visitedAttractions={visitedAttractions}
                                        onDepartmentClick={handleDepartmentClick}
                                        onDepartmentHover={handleMapHover}
                                    />
                                )}
                                <p className="mt-4 border-t border-rule-soft pt-3 text-center text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                                    Fronteras nacionales: Milenioscuro (CC BY-SA 4.0, Wikipedia) · Municipios: GADM 4.1 (2022)
                                </p>
                            </main>
                            <aside className="lg:col-span-2 space-y-5">
                                <ProgressStats
                                    completed={isDrilling ? deptStats.completed : completedCount}
                                    partial={isDrilling ? deptStats.partial : partialCount}
                                    unvisited={isDrilling ? deptStats.unvisited : unvisitedCount}
                                    totalProgress={isDrilling ? deptStats.totalProgress : totalProgress}
                                    title={drillDept ? drillDept.name : undefined}
                                    progressLabel={drillDept ? 'Municipios visitados' : undefined}
                                    completedLabel={drillDept ? 'Completos' : undefined}
                                    partialLabel={drillDept ? 'Parciales' : undefined}
                                    unvisitedLabel={drillDept ? 'Sin visitar' : undefined}
                                />
                                <Legend
                                    completed={isDrilling ? deptStats.completed : completedCount}
                                    partial={isDrilling ? deptStats.partial : partialCount}
                                    unvisited={isDrilling ? deptStats.unvisited : unvisitedCount}
                                    completedLabel={drillDept ? 'Municipios completos' : undefined}
                                    partialLabel={drillDept ? 'Municipios parciales' : undefined}
                                    unvisitedLabel={drillDept ? 'Municipios sin visitar' : undefined}
                                    tone={isDrilling ? 'muni' : 'dept'}
                                />
                                <TravelTips />
                            </aside>
                        </div>
                    </>
                ) : (
                    <div className="panel overflow-hidden">
                        <AdminPage user={user} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPage;