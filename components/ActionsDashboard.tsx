
import React, { useState, useEffect, useMemo } from 'react';
import { ActionItem, ActionItemStatus, ActionItemUrgency } from '../types';
import { ExportIcon } from './icons/ExportIcon';

interface ActionsDashboardProps {
    initialItems: ActionItem[];
}

const getStatusColor = (status: ActionItemStatus) => {
    switch (status) {
        case ActionItemStatus.Done: return 'bg-green-500/20 text-green-300 border-green-500/30';
        case ActionItemStatus.InProgress: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case ActionItemStatus.ToDo: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

const getUrgencyColor = (urgency: ActionItemUrgency) => {
    switch (urgency) {
        case ActionItemUrgency.High: return 'bg-red-500/20 text-red-300 border-red-500/30';
        case ActionItemUrgency.Medium: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        case ActionItemUrgency.Low: return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

const ActionsDashboard: React.FC<ActionsDashboardProps> = ({ initialItems }) => {
    const [items, setItems] = useState<ActionItem[]>(initialItems);
    const [filters, setFilters] = useState({ status: 'All', urgency: 'All', assignedTo: '' });

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const handleStatusChange = (id: string, newStatus: ActionItemStatus) => {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const statusMatch = filters.status === 'All' || item.status === filters.status;
            const urgencyMatch = filters.urgency === 'All' || item.urgency === filters.urgency;
            const assignedToMatch = item.assignedTo.toLowerCase().includes(filters.assignedTo.toLowerCase());
            return statusMatch && urgencyMatch && assignedToMatch;
        });
    }, [items, filters]);

    const exportToCSV = () => {
        const headers = ['Task', 'Assigned To', 'Urgency', 'Status'];
        const rows = filteredItems.map(item => [item.task, item.assignedTo, item.urgency, item.status]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "action_items.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (initialItems.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-3">Action Items</h2>
                <p className="text-gray-400">No action items were identified in the transcript.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-white">Action Items Dashboard</h2>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-sm font-medium text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
                    <ExportIcon className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                <input type="text" name="assignedTo" placeholder="Filter by assignee..." value={filters.assignedTo} onChange={handleFilterChange} className="bg-gray-700 border-gray-600 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"/>
                <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="bg-gray-700 border-gray-600 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="All">All Urgencies</option>
                    {Object.values(ActionItemUrgency).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-gray-700 border-gray-600 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="All">All Statuses</option>
                    {Object.values(ActionItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Actions Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3">Task</th>
                            <th className="px-4 py-3">Assigned To</th>
                            <th className="px-4 py-3">Urgency</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                <td className="px-4 py-4 font-medium text-gray-200">{item.task}</td>
                                <td className="px-4 py-4 text-gray-300">{item.assignedTo}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(item.urgency)}`}>{item.urgency}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value as ActionItemStatus)} className={`border text-xs font-semibold rounded-md p-1 pr-7 focus:ring-1 focus:outline-none ${getStatusColor(item.status)}`}>
                                        {Object.values(ActionItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredItems.length === 0 && <p className="text-center py-6 text-gray-400">No action items match the current filters.</p>}
            </div>
        </div>
    );
};

export default ActionsDashboard;
