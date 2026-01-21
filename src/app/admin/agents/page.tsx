'use client';

import { useState, useEffect } from 'react';
import { getDeliveryAgentsAction, promoteToAgentAction } from '@/app/actions/admin';
import { Truck, CheckCircle, XCircle, Plus, Search } from 'lucide-react';

export default function AgentsPage() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [promoting, setPromoting] = useState(false);

    const fetchAgents = async () => {
        setLoading(true);
        const res = await getDeliveryAgentsAction();
        if (res.success) setAgents(res.agents || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoting(true);
        const res = await promoteToAgentAction(email);
        if (res.success) {
            setEmail('');
            fetchAgents();
            alert('User promoted to Delivery Agent successfully');
        } else {
            alert(res.error || 'Failed to promote user');
        }
        setPromoting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Delivery Agents</h2>
                    <p className="text-gray-500 mt-1">Manage your delivery fleet and availability.</p>
                </div>
            </div>

            {/* Add Agent Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                    <Plus size={18} /> Add New Agent
                </h3>
                <form onSubmit={handlePromote} className="flex gap-3 max-w-lg">
                    <input
                        type="email"
                        required
                        placeholder="Enter user email to promote..."
                        className="flex-1 border p-2 rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={promoting}
                        className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        {promoting ? 'Adding...' : 'Promote User'}
                    </button>
                </form>
                <p className="text-xs text-gray-400 mt-2">
                    Note: The user must already be registered on the platform.
                </p>
            </div>

            {/* Agents List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : agents.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No active delivery agents found.</td></tr>
                        ) : (
                            agents.map(agent => (
                                <tr key={agent.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Truck size={14} />
                                            </div>
                                            {agent.name || 'Unnamed Agent'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div>{agent.email}</div>
                                        <div className="text-xs">{agent.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {agent.isAvailable ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Busy
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400">
                                        {/* Future: Edit / Remove */}
                                        <button className="text-xs hover:text-black">Manage</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
