// src/app/admin/agents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  license_number: string;
  bio: string;
  specializations: string[];
  years_experience: number;
  status: string;
  avatar_url: string;
}

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState<Omit<Agent, 'id'>>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    license_number: '',
    bio: '',
    specializations: [],
    years_experience: 0,
    status: 'active',
    avatar_url: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [specializationInput, setSpecializationInput] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, agentId?: string) => {
    const { name, value } = e.target;
    
    if (agentId) {
      // Editing existing agent
      setEditingAgent(prev => prev ? {
        ...prev,
        [name]: name === 'years_experience' ? parseInt(value) || 0 : value
      } : null);
    } else {
      // Adding new agent
      setNewAgent(prev => ({
        ...prev,
        [name]: name === 'years_experience' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleSpecializationRemove = (indexToRemove: number, agentId?: string) => {
    if (agentId) {
      // Editing existing agent
      setEditingAgent(prev => prev ? {
        ...prev,
        specializations: prev.specializations.filter((_, index) => index !== indexToRemove)
      } : null);
    } else {
      // Adding new agent
      setNewAgent(prev => ({
        ...prev,
        specializations: prev.specializations.filter((_, index) => index !== indexToRemove)
      }));
    }
  };

  const handleSaveAgent = async (agentId?: string) => {
    try {
      const agentData = agentId ? editingAgent : newAgent;
      if (!agentData) return;

      const response = agentId
        ? await fetch(`/api/admin/agents/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
          })
        : await fetch('/api/admin/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
          });

      if (response.ok) {
        fetchAgents(); // Refresh the list
        if (agentId) {
          setEditingAgent(null); // Exit edit mode
        } else {
          setNewAgent({
            name: '',
            email: '',
            phone: '',
            company_name: '',
            license_number: '',
            bio: '',
            specializations: [],
            years_experience: 0,
            status: 'active',
            avatar_url: '',
          });
          setShowAddForm(false); // Close add form
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to ${agentId ? 'update' : 'create'} agent: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${agentId ? 'updating' : 'creating'} agent:`, error);
      alert(`Error ${agentId ? 'updating' : 'creating'} agent`);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAgents(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to delete agent: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  const startEditing = (agent: Agent) => {
    setEditingAgent({ ...agent });
  };

  const cancelEditing = () => {
    setEditingAgent(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Agents</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Add Agent
        </button>
      </div>

      {/* Add Agent Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Agent</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={newAgent.name}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Agent's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newAgent.email}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="agent@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={newAgent.phone}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="+254..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={newAgent.company_name}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Real Estate Company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input
                type="text"
                name="license_number"
                value={newAgent.license_number}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="RE12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="years_experience"
                value={newAgent.years_experience}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={newAgent.bio}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Brief description of the agent's background..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
              <div className="flex">
                <input
                  type="text"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a specialization (e.g., luxury homes, commercial)"
                  onKeyPress={(e) => e.key === 'Enter' && handleSpecializationAdd()}
                />
                <button
                  type="button"
                  onClick={() => handleSpecializationAdd()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              
              {/* Specializations list */}
              <div className="mt-2 flex flex-wrap gap-2">
                {newAgent.specializations.map((spec, index) => (
                  <div key={index} className="flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm">
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleSpecializationRemove(index)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewAgent({
                  name: '',
                  email: '',
                  phone: '',
                  company_name: '',
                  license_number: '',
                  bio: '',
                  specializations: [],
                  years_experience: 0,
                  status: 'active',
                  avatar_url: '',
                });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveAgent()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FaSave className="mr-2" /> Save Agent
            </button>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.company_name}</p>
                </div>
              </div>

              {editingAgent && editingAgent.id === agent.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editingAgent.email}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editingAgent.phone}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      name="license_number"
                      value={editingAgent.license_number}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      name="years_experience"
                      value={editingAgent.years_experience}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={editingAgent.bio}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={editingAgent.status}
                      onChange={(e) => handleInputChange(e, agent.id)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Specializations editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={specializationInput}
                        onChange={(e) => setSpecializationInput(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-l focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Add specialization"
                        onKeyPress={(e) => e.key === 'Enter' && handleSpecializationAdd(agent.id)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSpecializationAdd(agent.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-r text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {editingAgent.specializations.map((spec, index) => (
                        <div key={index} className="flex items-center bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs">
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => handleSpecializationRemove(index, agent.id)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveAgent(agent.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center"
                    >
                      <FaSave className="mr-1" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{agent.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900">{agent.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">License:</span>
                      <span className="text-gray-900">{agent.license_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-900">{agent.years_experience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : agent.status === 'inactive' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {agent.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 italic">"{agent.bio}"</p>
                    </div>
                  )}

                  {agent.specializations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.map((spec, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => startEditing(agent)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsPage;