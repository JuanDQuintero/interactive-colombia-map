import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import type { User } from '../interfaces/user';
import { setAdminRole } from '../utils/roleManagement';


const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersData: User[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    usersData.push({
                        id: doc.id,
                        email: data.email,
                        displayName: data.displayName,
                        photoURL: data.photoURL,
                        isAdmin: data.isAdmin || false,
                        lastLogin: data.lastLogin?.toDate()
                    });
                });
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, isAdmin: boolean) => {
        const success = await setAdminRole(userId, isAdmin);
        if (success) {
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isAdmin } : user
            ));
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando usuarios...</div>;
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Gestión de Usuarios</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">Usuario</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Último acceso</th>
                            <th className="py-3 px-4 text-left">Rol</th>
                            <th className="py-3 px-4 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 flex items-center">
                                    {user.photoURL && (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName}
                                            className="w-8 h-8 rounded-full mr-3"
                                        />
                                    )}
                                    {user.displayName}
                                </td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                    {user.lastLogin?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.isAdmin
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                        {user.isAdmin ? 'Administrador' : 'Usuario'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleRoleChange(user.id, !user.isAdmin)}
                                        className={`px-3 py-1 rounded text-sm ${user.isAdmin
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                            } text-white`}
                                    >
                                        {user.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;