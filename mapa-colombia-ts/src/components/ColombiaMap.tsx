
import React from 'react';
import { attractionsData } from '../data/attractionsData';
import { departmentsData } from '../data/colombiaMapData';

interface ColombiaMapProps {
    visitedAttractions: Record<string, string[]>;
    onDepartmentClick: (id: string, name: string) => void;
    onDepartmentHover: (name: string | null, event?: React.MouseEvent) => void;
}

const ColombiaMap: React.FC<ColombiaMapProps> = ({ visitedAttractions, onDepartmentClick, onDepartmentHover }) => {

    const getDepartmentClass = (id: string) => {
        const visitedInDept = visitedAttractions[id] || [];
        const totalAttractions = attractionsData[id]?.length || 0;

        if (id in visitedAttractions && totalAttractions === 0) {
            return 'department visited-all';
        }
        if (visitedInDept.length === 0) {
            return 'department';
        }
        if (totalAttractions > 0 && visitedInDept.length === totalAttractions) {
            return 'department visited-all';
        }
        return 'department visited-some';
    };

    return (
        <svg baseProfile="tiny" height="100%" width="100%" version="1.2" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <g id="features">

                {Object.entries(departmentsData).map(([id, department]) => (
                    <path
                        key={id}
                        name={department.name}
                        className={getDepartmentClass(id)} // Pasamos el ID para calcular el color
                        onClick={() => onDepartmentClick(id, department.name)} // Pasamos ID y nombre
                        onMouseMove={(e) => onDepartmentHover(department.name, e)}
                        onMouseLeave={() => onDepartmentHover(null)}
                        d={department.path}
                    />
                ))}

                {/* La sección de San Andrés ya estaba bien y no requiere cambios */}
                <g transform="translate(50, 50)">
                    <rect x="0" y="0" width="150" height="150" className="fill-white stroke-gray-400" strokeWidth="1" />
                    <g transform="translate(-650, -500) scale(6)">
                        <path
                            id="CO-SAP"
                            className={getDepartmentClass("CO-SAP")}
                            onClick={() => onDepartmentClick("CO-SAP", "San Andrés y Providencia")}
                            onMouseMove={(e) => onDepartmentHover("San Andrés y Providencia", e)}
                            onMouseLeave={() => onDepartmentHover(null)}
                            d="M124.6 100.3l-0.5-1 0.2-1.1 0.5-0.8 0.8-0.6 0.2 0.6-0.9 3.9-0.6 0.1-0.4-0.5 0.7-0.6z m-10 5l-0.2-1.2 0.4-1.1 0.7-0.6 0.7 0.4 0.3 0.9-0.3 0.8-0.7 0.5-0.9 0.3z"
                        />
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default ColombiaMap;