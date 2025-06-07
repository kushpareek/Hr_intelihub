// frontend/components/AdminDashboardView.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { ClientSubscription, SupportQuery, SubscriptionTier, SubscriptionStatus, SupportQueryStatus } from '../types';
// import { MOCK_CLIENT_SUBSCRIPTIONS, MOCK_SUPPORT_QUERIES } from '../constants'; // Remove MOCK imports
import { ShieldCheckIcon, UserGroupIcon, ChatBubbleIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';
import DashboardCard from './DashboardCard';
import { apiClient } from '../services/api'; // Import apiClient

// Badge components (assuming these are defined as before or imported)
const SubscriptionPlanBadge: React.FC<{ plan: SubscriptionTier }> = ({ plan }) => {
  let colorClasses = '';
  switch (plan) {
    case 'Basic': colorClasses = 'bg-gray-100 text-gray-800'; break;
    case 'Pro': colorClasses = 'bg-blue-100 text-blue-800'; break;
    case 'Enterprise': colorClasses = 'bg-purple-100 text-purple-800'; break;
    case 'Trial': colorClasses = 'bg-yellow-100 text-yellow-800'; break;
    default: colorClasses = 'bg-gray-100 text-gray-800';
  }
  return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{plan}</span>;
};

const ClientStatusBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => {
  let colorClasses = '';
  switch (status) {
    case 'Active': colorClasses = 'bg-green-100 text-green-800'; break;
    case 'Trialing': colorClasses = 'bg-yellow-100 text-yellow-800'; break;
    case 'Past Due': colorClasses = 'bg-orange-100 text-orange-800'; break; // Assuming orange for Past Due
    case 'Canceled': colorClasses = 'bg-red-100 text-red-800'; break;
    default: colorClasses = 'bg-gray-100 text-gray-800';
  }
  return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};

const QueryStatusBadge: React.FC<{ status: SupportQueryStatus }> = ({ status }) => {
  let colorClasses = '';
  switch (status) {
    case 'Open': colorClasses = 'bg-blue-100 text-blue-800'; break;
    case 'In Progress': colorClasses = 'bg-yellow-100 text-yellow-800'; break;
    case 'Resolved': colorClasses = 'bg-green-100 text-green-800'; break;
    case 'Closed': colorClasses = 'bg-gray-100 text-gray-800'; break;
    default: colorClasses = 'bg-gray-100 text-gray-800';
  }
  return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};


const AdminDashboardView: React.FC = () => {
  // const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>(MOCK_CLIENT_SUBSCRIPTIONS); // CHANGE
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([]);
  // const [supportQueries, setSupportQueries] = useState<SupportQuery[]>(MOCK_SUPPORT_QUERIES); // CHANGE
  const [supportQueries, setSupportQueries] = useState<SupportQuery[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  // Add states for managing create/edit forms if needed, e.g., for adding a new client or support query
  // For this subtask, focusing on fetching and basic update actions (like status change)

  const fetchAdminData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
        const [subs, queries] = await Promise.all([
            apiClient<ClientSubscription[]>('/admin/subscriptions', 'GET'),
            apiClient<SupportQuery[]>('/admin/supportqueries', 'GET')
        ]);
        setClientSubscriptions(subs);
        setSupportQueries(queries);
    } catch (error) {
        console.error("Error fetching admin data:", error);
        setActionMessage(`Error fetching admin data: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleClientAction = async (clientId: string, action: string, newStatus?: SubscriptionStatus) => {
    setIsLoading(true);
    setActionMessage(`Simulating action: ${action} for client ID ${clientId}...`);
    console.log(`Admin action: ${action} for client ${clientId}`);

    try {
        if (action === 'suspend_trial' && newStatus) {
             await apiClient<ClientSubscription>(`/admin/subscriptions/${clientId}`, 'PUT', { status: newStatus });
             setActionMessage(`Client ${clientId} status updated to ${newStatus}.`);
             fetchAdminData(); // Re-fetch to update list
        } else if (action === 'view_details') {
            // Implement view details modal or navigation if needed
            const client = await apiClient<ClientSubscription>(`/admin/subscriptions/${clientId}`, 'GET');
            setActionMessage(`Details for ${client.client_name}: Plan: ${client.plan}, Status: ${client.status}. Joined: ${new Date(client.joined_date).toLocaleDateString()}`);
        } else if (action === 'manage_subscription') {
            // Implement management modal (e.g. change plan)
            // Example: apiClient<ClientSubscription>(`/admin/subscriptions/${clientId}`, 'PUT', { plan: 'Pro' });
            setActionMessage(`Manage action for ${clientId} (placeholder).`);
        }
        // Add more actions as needed (e.g., delete)
    } catch (error) {
        console.error(`Error performing client action ${action} for ${clientId}:`, error);
        setActionMessage(`Error: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
        setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleSupportQueryAction = async (queryId: string, action: string, newStatus?: SupportQueryStatus) => {
    setIsLoading(true);
    setActionMessage(`Simulating action: ${action} for query ID ${queryId}...`);
    console.log(`Admin action: ${action} for query ${queryId}`);
    try {
       if (action === 'resolve_query' && newStatus) {
            await apiClient<SupportQuery>(`/admin/supportqueries/${queryId}`, 'PUT', { status: newStatus });
            setActionMessage(`Support query ${queryId} status updated to ${newStatus}.`);
            fetchAdminData(); // Re-fetch
        } else if (action === 'view_query') {
            const query = await apiClient<SupportQuery>(`/admin/supportqueries/${queryId}`, 'GET');
            setActionMessage(`Query from ${query.client_name || query.client_email}: ${query.subject}. Status: ${query.status}`);
        }
        // Add more actions (assign, change priority, delete)
    } catch (error) {
        console.error(`Error performing query action ${action} for ${queryId}:`, error);
        setActionMessage(`Error: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
        setTimeout(() => setActionMessage(null), 3000);
    }
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
        {isLoading && clientSubscriptions.length === 0 && <div className="text-center py-4"><LoadingSpinner/> Loading subscriptions...</div>}
        {!isLoading && clientSubscriptions.length === 0 && <p className="text-center py-4 text-gray-500">No client subscriptions found.</p>}
        {clientSubscriptions.length > 0 && (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.client_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><SubscriptionPlanBadge plan={client.plan} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><ClientStatusBadge status={client.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(client.joined_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleClientAction(client.id, 'view_details')} className="text-indigo-600 hover:text-indigo-800 transition">View</button>
                        {/* <button onClick={() => handleClientAction(client.id, 'manage_subscription')} className="text-green-600 hover:text-green-800 transition">Manage</button> */}
                        {client.status === 'Trialing' && <button onClick={() => handleClientAction(client.id, 'suspend_trial', 'Canceled')} className="text-red-600 hover:text-red-800 transition">Suspend</button>}
                         {client.status === 'Active' && <button onClick={() => handleClientAction(client.id, 'suspend_trial', 'Canceled')} className="text-red-600 hover:text-red-800 transition">Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Support Queries Overview */}
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
          <ChatBubbleIcon className="w-7 h-7 mr-2 text-indigo-600" />
          Support Queries
        </h2>
        {isLoading && supportQueries.length === 0 && <div className="text-center py-4"><LoadingSpinner/> Loading queries...</div>}
        {!isLoading && supportQueries.length === 0 && <p className="text-center py-4 text-gray-500">No support queries found.</p>}
        {supportQueries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name/Email</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.client_name || query.client_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={query.subject}>{query.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(query.submitted_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><QueryStatusBadge status={query.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.assigned_to_user_id || 'Unassigned'}</td> {/* TODO: Fetch user name for assigned_to_user_id */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleSupportQueryAction(query.id, 'view_query')} className="text-indigo-600 hover:text-indigo-800 transition">View</button>
                         {query.status !== 'Resolved' && query.status !== 'Closed' &&  <button onClick={() => handleSupportQueryAction(query.id, 'resolve_query', 'Resolved')} className="text-green-600 hover:text-green-800 transition">Resolve</button> }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardView;