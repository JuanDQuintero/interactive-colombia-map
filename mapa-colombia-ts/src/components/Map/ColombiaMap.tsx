import React from 'react';
import { useAttractionsData } from '../../context/AttractionsContext';
import { departmentsData } from '../../data/colombiaMapData';
import MapPanZoom from './MapPanZoom';

interface ColombiaMapProps {
    visitedAttractions: Record<string, string[]>;
    onDepartmentClick: (id: string, name: string) => void;
    onDepartmentHover: (name: string | null, event?: React.MouseEvent) => void;
}

const ColombiaMap: React.FC<ColombiaMapProps> = ({ visitedAttractions, onDepartmentClick, onDepartmentHover }) => {
    const { data: attractionsData } = useAttractionsData();

    const getDepartmentClass = (id: string) => {
        if (attractionsData[id] === undefined) {
            return 'department';
        }
        // Un departamento sin atractivos registrados no puede verse "todo visitado".
        const totalAttractions = attractionsData[id]?.length || 0;
        if (totalAttractions === 0) {
            return 'department';
        }
        const visitedInDept = visitedAttractions[id] || [];

        if (visitedInDept.length === 0) {
            return 'department';
        }
        if (visitedInDept.length >= totalAttractions) {
            return 'department visited-all';
        }
        return 'department visited-some';
    };

    return (
        <MapPanZoom viewBox="0 0 1000 1000">
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
        </MapPanZoom>
    );
};

export default ColombiaMap;