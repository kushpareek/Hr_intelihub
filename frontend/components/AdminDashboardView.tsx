import React, { useState } from 'react';
import { ClientSubscription, SupportQuery, SubscriptionTier, SubscriptionStatus, SupportQueryStatus } from '../types';
import { MOCK_CLIENT_SUBSCRIPTIONS, MOCK_SUPPORT_QUERIES } from '../constants';
import { ShieldCheckIcon, UserGroupIcon, ChatBubbleIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';
import DashboardCard from './DashboardCard'; // Reusing DashboardCard for summary stats

const SubscriptionPlanBadge: React.FC<{ plan: SubscriptionTier }> = ({ plan }) => {
  let color = '';
  switch (plan) {
    case 'Basic': color = 'bg-blue-100 text-blue-700'; break;
    case 'Pro': color = 'bg-green-100 text-green-700'; break;
    case 'Enterprise': color = 'bg-purple-100 text-purple-700'; break;
    case 'Trial': color = 'bg-yellow-100 text-yellow-700'; break;
    default: color = 'bg-gray-100 text-gray-700';
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{plan}</span>;
};

const ClientStatusBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => {
  let color = '';
  switch (status) {
    case 'Active': color = 'bg-green-100 text-green-700'; break;
    case 'Trialing': color = 'bg-yellow-100 text-yellow-700'; break;
    case 'Past Due': color = 'bg-orange-100 text-orange-700'; break;
    case 'Canceled': color = 'bg-red-100 text-red-700'; break;
    default: color = 'bg-gray-100 text-gray-700';
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{status}</span>;
};

const QueryStatusBadge: React.FC<{ status: SupportQueryStatus }> = ({ status }) => {
  let color = '';
  switch (status) {
    case 'Open': color = 'bg-red-100 text-red-700'; break;
    case 'In Progress': color = 'bg-yellow-100 text-yellow-700'; break;
    case 'Resolved': color = 'bg-green-100 text-green-700'; break;
    case 'Closed': color = 'bg-gray-100 text-gray-800'; break;
    default: color = 'bg-gray-100 text-gray-700';
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{status}</span>;
};


const AdminDashboardView: React.FC = () => {
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>(MOCK_CLIENT_SUBSCRIPTIONS);
  const [supportQueries, setSupportQueries] = useState<SupportQuery[]>(MOCK_SUPPORT_QUERIES);
  const [isLoading, setIsLoading] = useState(false); // For simulated actions
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleClientAction = (clientId: string, action: string) => {
    setIsLoading(true);
    setActionMessage(`Simulating action: ${action} for client ID ${clientId}...`);
    console.log(`Admin action: ${action} for client ${clientId}`);
    setTimeout(() => {
      // Example: update status if action is 'suspend'
      if (action === 'suspend_trial') {
        setClientSubscriptions(prev => prev.map(c => c.id === clientId && c.status === 'Trialing' ? {...c, status: 'Canceled'} : c));
      }
      setActionMessage(`Action '${action}' for client ID ${clientId} simulated.`);
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }, 1500);
  };

  const handleSupportQueryAction = (queryId: string, action: string) => {
    setIsLoading(true);
    setActionMessage(`Simulating action: ${action} for query ID ${queryId}...`);
    console.log(`Admin action: ${action} for query ${queryId}`);
    setTimeout(() => {
       if (action === 'resolve_query') {
        setSupportQueries(prev => prev.map(q => q.id === queryId ? {...q, status: 'Resolved', lastUpdatedDate: new Date()} : q));
      }
      setActionMessage(`Action '${action}' for query ID ${queryId} simulated.`);
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }, 1500);
  };

  const totalClients = clientSubscriptions.length;
  const activeSubscriptions = clientSubscriptions.filter(c => c.status === 'Active' || c.status === 'Trialing').length;
  const openSupportTickets = supportQueries.filter(q => q.status === 'Open' || q.status === 'In Progress').length;


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ShieldCheckIcon className="w-9 h-9 mr-3 text-indigo-600" />
          Admin Dashboard
        </h1>
         {isLoading && <LoadingSpinner size={6} />}
      </div>

      {actionMessage && (
        <div className={`p-3 mb-4 text-sm rounded-lg shadow ${actionMessage.toLowerCase().includes("error") ? 'bg-red-50 text-red-800' : 'bg-indigo-50 text-indigo-700'}`} role="alert">
          {actionMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Clients" value={totalClients} icon={<UserGroupIcon className="w-5 h-5"/>} color="bg-indigo-500" description="All registered client accounts." />
        <DashboardCard title="Active Subscriptions" value={activeSubscriptions} icon={<ShieldCheckIcon className="w-5 h-5"/>} color="bg-green-500" description="Clients with active or trial plans." />
        <DashboardCard title="Open Support Tickets" value={openSupportTickets} icon={<ChatBubbleIcon className="w-5 h-5"/>} color="bg-red-500" description="Queries needing attention." />
      </div>

      {/* Client Subscriptions Management */}
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
          <UserGroupIcon className="w-7 h-7 mr-2 text-indigo-600" />
          Client Subscriptions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientSubscriptions.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.clientEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><SubscriptionPlanBadge plan={client.plan} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><ClientStatusBadge status={client.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.joinedDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleClientAction(client.id, 'view_details')} className="text-indigo-600 hover:text-indigo-800 transition">View</button>
                    <button onClick={() => handleClientAction(client.id, 'manage_subscription')} className="text-green-600 hover:text-green-800 transition">Manage</button>
                    {client.status === 'Trialing' && <button onClick={() => handleClientAction(client.id, 'suspend_trial')} className="text-red-600 hover:text-red-800 transition">Suspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {clientSubscriptions.length === 0 && <p className="text-center py-4 text-gray-500">No client subscriptions found.</p>}
      </div>

      {/* Support Queries Overview */}
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
          <ChatBubbleIcon className="w-7 h-7 mr-2 text-indigo-600" />
          Support Queries
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supportQueries.map((query) => (
                <tr key={query.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={query.subject}>{query.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.submittedDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><QueryStatusBadge status={query.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.assignedTo || 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleSupportQueryAction(query.id, 'view_query')} className="text-indigo-600 hover:text-indigo-800 transition">View</button>
                     {query.status !== 'Resolved' && query.status !== 'Closed' &&  <button onClick={() => handleSupportQueryAction(query.id, 'resolve_query')} className="text-green-600 hover:text-green-800 transition">Resolve</button> }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {supportQueries.length === 0 && <p className="text-center py-4 text-gray-500">No support queries found.</p>}
      </div>
    </div>
  );
};

export default AdminDashboardView;