
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
                        className={getDepartmentClass(id)}
                        onClick={() => onDepartmentClick(id, department.name)}
                        onMouseMove={(e) => onDepartmentHover(department.name, e)}
                        onMouseLeave={() => onDepartmentHover(null)}
                        d={department.path}
                    />
                ))}
            </g>
        </svg>
    );
};

export default ColombiaMap;