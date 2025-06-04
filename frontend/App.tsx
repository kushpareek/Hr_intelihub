import React, { useState, useCallback, useEffect } from 'react';
import { ActiveView, Candidate, JobPosting, CompanyPolicy, OnboardingItem, AITask, TaskStatus, OffboardingCase, User, SubscriptionTier } from './types';
import DashboardCard from './components/DashboardCard';
import ChatbotInterface from './components/ChatbotInterface';
import TaskManagement from './components/TaskManagement';
import EmployeeEmailSummariesView from './components/EmployeeEmailSummariesView';
import OffboardingManagementView from './components/OffboardingManagementView';
import LoginView from './components/LoginView';
import BillingView from './components/BillingView';
import AdminDashboardView from './components/AdminDashboardView'; // Import AdminDashboardView
import { 
  DashboardIcon, ChatBubbleIcon, CogIcon, UserGroupIcon, BriefcaseIcon, DocumentTextIcon, 
  ClipboardDocumentListIcon, PaperAirplaneIcon, DocumentCheckIcon, SparklesIcon, LoadingSpinner, 
  EnvelopeIcon, UserMinusIcon, CreditCardIcon, ArrowLeftOnRectangleIcon, ShieldCheckIcon // Added ShieldCheckIcon
} from './components/common/IconComponents';
import { 
    MOCK_CANDIDATES, MOCK_JOB_POSTINGS, MOCK_COMPANY_POLICIES, MOCK_ONBOARDING_ITEMS, 
    MOCK_AI_TASKS, BRAVO_API_PLACEHOLDER_URL, LINKEDIN_API_PLACEHOLDER_URL, 
    DOCUSIGN_API_PLACEHOLDER_URL, MOCK_OFFBOARDING_CASES, MOCK_USER_CREDENTIALS, MOCK_ADMIN_CREDENTIALS
} from './constants';
import { analyzeTextWithSystemInstruction } from './services/geminiService';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(MOCK_JOB_POSTINGS);
  const [policies, setPolicies] = useState<CompanyPolicy[]>(MOCK_COMPANY_POLICIES);
  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>(MOCK_ONBOARDING_ITEMS);
  const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>(MOCK_OFFBOARDING_CASES);
  
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

   useEffect(() => {
    const storedAuth = localStorage.getItem('hrIntelliHubAuth');
    const storedUser = localStorage.getItem('hrIntelliHubUser');
    if (storedAuth === 'true' && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);
        // If admin, default to admin dashboard, otherwise regular dashboard
        setActiveView(user.isAdmin ? 'adminDashboard' : 'dashboard');
      } catch (e) {
        localStorage.removeItem('hrIntelliHubAuth');
        localStorage.removeItem('hrIntelliHubUser');
      }
    }
  }, []);


  const handleLoginSuccess = (email: string, name?: string, tier?: SubscriptionTier, isAdmin?: boolean) => {
    const user: User = { 
      id: `user-${Date.now()}`, 
      email, 
      name: name || "Valued User", 
      subscriptionTier: tier || 'Trial',
      isAdmin: isAdmin || false 
    };
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveView(isAdmin ? 'adminDashboard' : 'dashboard'); // Navigate to appropriate dashboard
    localStorage.setItem('hrIntelliHubAuth', 'true');
    localStorage.setItem('hrIntelliHubUser', JSON.stringify(user));
    console.log("Login successful for:", user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('hrIntelliHubAuth');
    localStorage.removeItem('hrIntelliHubUser');
    // activeView will be implicitly reset as LoginView is rendered
    console.log("User logged out.");
  };
  
  const handleManageSubscription = (action: string, plan?: string) => {
    console.log(`Simulated subscription management: ${action} ${plan || ''} for user ${currentUser?.email}`);
    if (action === 'upgrade' && plan && currentUser) {
        const newTier = plan as SubscriptionTier;
        if (['Basic', 'Pro', 'Enterprise', 'Trial'].includes(newTier)) {
            const updatedUser = {...currentUser, subscriptionTier: newTier, isAdmin: currentUser.isAdmin}; // preserve isAdmin
            setCurrentUser(updatedUser);
            localStorage.setItem('hrIntelliHubUser', JSON.stringify(updatedUser));
            setActionMessage(`Successfully upgraded to ${plan} plan!`);
        }
    }
     setTimeout(() => setActionMessage(null), 5000);
  };


  const handleSimulatedApiCall = useCallback(async (actionDescription: string, apiEndpoint: string, payload?: any) => {
    setIsLoading(true);
    setActionMessage(`Processing: ${actionDescription}...`);
    console.log(`Simulating API call to ${apiEndpoint} with payload:`, payload);
    
    let geminiAnalysisResult = '';
    if (actionDescription.includes("offer letter content")) {
        geminiAnalysisResult = await analyzeTextWithSystemInstruction(
            JSON.stringify(payload), 
            "You are an AI assistant for HR. Review the following offer letter details and provide a brief summary or highlight any potential issues. For example, check if salary is within typical range for the role (assume typical range if not specified)."
        );
    } else if (actionDescription.includes("job description")) {
         geminiAnalysisResult = await analyzeTextWithSystemInstruction(
            JSON.stringify(payload), 
            "You are an AI assistant for HR. Review the following job description for clarity, inclusiveness, and completeness. Provide a brief feedback."
        );
    } else if (actionDescription.includes("offboarding communication") || actionDescription.includes("PIP document")) {
        geminiAnalysisResult = await analyzeTextWithSystemInstruction(
            JSON.stringify(payload),
            "You are an AI HR assistant. Review the provided context for an offboarding or PIP scenario. Draft a concise, professional, and empathetic communication for the specified action (e.g., PIP initiation, resignation acknowledgement). Highlight key details to include."
        );
    }


    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        const successMsg = `${actionDescription} initiated successfully. ${geminiAnalysisResult ? `AI Feedback: ${geminiAnalysisResult}` : ''}`;
        setActionMessage(successMsg);
        console.log(successMsg);
        setTimeout(() => setActionMessage(null), 5000); 
        resolve();
      }, 2000);
    });
  }, []);


  const renderView = () => {
    // If user is admin, certain views might be different or they might have an admin-specific dashboard
    if (currentUser?.isAdmin && activeView === 'adminDashboard') {
      return <AdminDashboardView />;
    }
    if (currentUser?.isAdmin && activeView === 'dashboard') { // Admin might still want to see regular dashboard
        return <DashboardView />;
    }


    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'queryResolution':
        return <ChatbotInterface mode="general" />;
      case 'aiWorkerMonitor':
         return currentUser?.subscriptionTier === 'Basic' && !currentUser.isAdmin 
            ? <FeatureLockedView featureName="AI Worker Monitor" requiredTier="Pro" /> 
            : <TaskManagement />;
      case 'candidateSourcing':
        return currentUser?.subscriptionTier === 'Basic' && !currentUser.isAdmin
            ? <FeatureLockedView featureName="Candidate Sourcing" requiredTier="Pro" />
            : <CandidateSourcingView />;
      case 'jobPosting':
        return <JobPostingView />;
      case 'policyCenter':
        return <PolicyCenterView />;
      case 'onboardingTracker':
        return currentUser?.subscriptionTier === 'Basic' && !currentUser.isAdmin
            ? <FeatureLockedView featureName="Onboarding Tracker" requiredTier="Pro" />
            : <OnboardingTrackerView />;
      case 'emailAutomation':
        return currentUser?.subscriptionTier === 'Basic' && !currentUser.isAdmin
            ? <FeatureLockedView featureName="Email Automation" requiredTier="Pro" />
            :<EmailAutomationView />;
      case 'offerManagement':
        return currentUser?.subscriptionTier === 'Basic' && !currentUser.isAdmin
            ? <FeatureLockedView featureName="Offer Management" requiredTier="Pro" />
            : <OfferManagementView />;
      case 'emailSummaries':
        return <EmployeeEmailSummariesView />;
      case 'offboardingManagement': 
        return <OffboardingManagementView />;
      case 'billing':
        return <BillingView currentUser={currentUser} onManageSubscription={handleManageSubscription} />;
      case 'adminDashboard': // Fallback for non-admin trying to access, or if admin is on another view
        return currentUser?.isAdmin ? <AdminDashboardView /> : <DashboardView /> ;
      default:
        return <DashboardView />;
    }
  };

  const FeatureLockedView: React.FC<{featureName: string, requiredTier: SubscriptionTier}> = ({featureName, requiredTier}) => (
    <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <SparklesIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4"/>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Feature Locked: {featureName}</h2>
        <p className="text-gray-600 mb-6">
            This feature requires a <span className="font-semibold">{requiredTier}</span> plan or higher.
            Your current plan is <span className="font-semibold">{currentUser?.subscriptionTier}</span>.
        </p>
        <button 
            onClick={() => setActiveView('billing')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-base font-medium"
        >
            Upgrade Your Plan
        </button>
    </div>
  );


  const NavItem: React.FC<{ view: ActiveView; label: string; icon: React.ReactNode; disabled?: boolean }> = ({ view, label, icon, disabled }) => (
    <li
      className={`px-4 py-3 text-gray-700 rounded-lg flex items-center space-x-3 transition-colors duration-150 ${
        disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : `hover:bg-blue-100 hover:text-blue-700 cursor-pointer ${activeView === view ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`
      }`}
      onClick={() => !disabled && setActiveView(view)}
      aria-disabled={disabled}
      role="menuitem"
    >
      {icon}
      <span>{label}</span>
    </li>
  );

  const DashboardView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <DashboardCard title="Active AI Tasks" value={MOCK_AI_TASKS.filter(t => t.status === TaskStatus.IN_PROGRESS).length} icon={<CogIcon />} description="Tasks currently being processed by AI." onClick={() => setActiveView('aiWorkerMonitor')} color="bg-purple-500" />
      <DashboardCard title="Candidates Sourced" value={candidates.length} icon={<UserGroupIcon />} description="Total candidates in pipeline." onClick={() => setActiveView('candidateSourcing')} color="bg-green-500"/>
      <DashboardCard title="Open Positions" value={jobPostings.filter(j => j.status === 'Open').length} icon={<BriefcaseIcon />} description="Jobs currently accepting applications." onClick={() => setActiveView('jobPosting')} color="bg-yellow-500" />
      <DashboardCard title="Policy Queries Today" value={7} icon={<ChatBubbleIcon />} description="AI assisted policy clarifications." onClick={() => setActiveView('policyCenter')} color="bg-red-500" />
      <DashboardCard title="Active Onboardings" value={onboardingItems.filter(i => i.status !== 'Completed').length} icon={<ClipboardDocumentListIcon />} description="New hires in onboarding process." onClick={() => setActiveView('onboardingTracker')} color="bg-indigo-500" />
      <DashboardCard title="Automated Emails Sent" value={128} icon={<PaperAirplaneIcon />} description="Emails sent by automation." onClick={() => setActiveView('emailAutomation')} color="bg-teal-500" />
      <DashboardCard title="Active Offboarding Cases" value={offboardingCases.filter(c => c.status !== 'Closed').length} icon={<UserMinusIcon />} description="Resignations, Terminations, PIPs." onClick={() => setActiveView('offboardingManagement')} color="bg-pink-500" />
      <DashboardCard title="Subscription Tier" value={currentUser?.subscriptionTier || 'Trial'} icon={<CreditCardIcon />} description="Manage your subscription." onClick={() => setActiveView('billing')} color="bg-sky-500" />
    </div>
  );

  const CandidateSourcingView: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><UserGroupIcon className="w-7 h-7 mr-2 text-green-600"/>Candidate Sourcing</h2>
      <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">AI Powered Sourcing</h3>
        <p className="text-sm text-blue-600 mb-3">
          Our AI can source candidates from various platforms. Enter criteria below to initiate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Job Title (e.g., Software Engineer)" className="p-2 border rounded"/>
          <input type="text" placeholder="Skills (e.g., React, Node.js)" className="p-2 border rounded"/>
          <input type="text" placeholder="Location (e.g., Remote, New York)" className="p-2 border rounded"/>
          <select className="p-2 border rounded bg-white">
            <option>LinkedIn (Conceptual)</option>
            <option>GitHub (Conceptual)</option>
          </select>
        </div>
        <button 
            onClick={() => handleSimulatedApiCall("Candidate Sourcing via LinkedIn", LINKEDIN_API_PLACEHOLDER_URL, {jobTitle: "Software Engineer"})}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size={5} /> : <SparklesIcon className="w-5 h-5 mr-2"/>}
            Start AI Sourcing
        </button>
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-4">Current Candidates</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.role}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Offered' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{c.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.platform}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const JobPostingView: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><BriefcaseIcon className="w-7 h-7 mr-2 text-yellow-600"/>Job Postings</h2>
       <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">Create New Job Posting (AI Assisted)</h3>
        <p className="text-sm text-yellow-600 mb-3">
          Draft a job description and our AI can help refine it and post to multiple platforms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input type="text" placeholder="Job Title" className="p-2 border rounded"/>
            <input type="text" placeholder="Department" className="p-2 border rounded"/>
        </div>
        <textarea placeholder="Job Description (AI can help generate/refine this)" rows={4} className="w-full p-2 border rounded mb-3"></textarea>
        <button 
            onClick={() => handleSimulatedApiCall("Job Description AI review and Post", "conceptual_job_board_api", {jobTitle: "Product Manager", description: "Lead product strategy..."})}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center" disabled={isLoading}>
             {isLoading ? <LoadingSpinner size={5} /> : <SparklesIcon className="w-5 h-5 mr-2"/>}
            Post Job (AI Assist)
        </button>
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-4">Current Postings</h3>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobPostings.map(j => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{j.department}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${j.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{j.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{j.postedAt ? j.postedAt.toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PolicyCenterView: React.FC = () => {
    const allPolicyText = policies.map(p => `Policy: ${p.title}\nCategory: ${p.category}\nSnippet: ${p.contentSnippet}`).join('\n\n');
    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
             <ChatbotInterface mode="policy" policyContext={allPolicyText} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><DocumentTextIcon className="w-7 h-7 mr-2 text-red-600"/>Company Policies</h2>
            <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                {policies.map(p => (
                <div key={p.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-700">{p.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{p.category}</p>
                    <p className="text-sm text-gray-600">{p.contentSnippet}</p>
                </div>
                ))}
            </div>
        </div>
    </div>
   );
  };

  const OnboardingTrackerView: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><ClipboardDocumentListIcon className="w-7 h-7 mr-2 text-indigo-600"/>Onboarding Tracker</h2>
       <div className="mb-6 p-4 border border-indigo-200 bg-indigo-50 rounded-md">
        <h3 className="text-lg font-semibold text-indigo-700 mb-2">Automated Onboarding Workflow</h3>
        <p className="text-sm text-indigo-600 mb-3">
          AI can manage onboarding tasks, send reminders, and track progress.
        </p>
        <button 
            onClick={() => handleSimulatedApiCall("New Hire Onboarding Sequence", "conceptual_workflow_engine", {newHireName: "Jane Doe"})}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center" disabled={isLoading}>
             {isLoading ? <LoadingSpinner size={5} /> : <SparklesIcon className="w-5 h-5 mr-2"/>}
            Initiate Onboarding
        </button>
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-4">Active Onboarding Tasks</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {onboardingItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.task}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.assignee}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'Requires Attention' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dueDate ? item.dueDate.toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EmailAutomationView: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><PaperAirplaneIcon className="w-7 h-7 mr-2 text-teal-600"/>Email Automation</h2>
       <div className="mb-6 p-4 border border-teal-200 bg-teal-50 rounded-md">
        <h3 className="text-lg font-semibold text-teal-700 mb-2">AI-Powered Email Campaigns</h3>
        <p className="text-sm text-teal-600 mb-3">
          Draft, personalize, and schedule emails for events, updates, and follow-ups.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input type="text" placeholder="Campaign Name" className="p-2 border rounded"/>
            <select className="p-2 border rounded bg-white">
                <option>Welcome Email Series</option>
                <option>Event Invitation</option>
                <option>Policy Update Notification</option>
            </select>
        </div>
        <textarea placeholder="Email Body (AI can help draft this)" rows={4} className="w-full p-2 border rounded mb-3"></textarea>
        <button 
            onClick={() => handleSimulatedApiCall("Email Campaign via Bravo API", BRAVO_API_PLACEHOLDER_URL, {campaignName: "Welcome Series"})}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center" disabled={isLoading}>
             {isLoading ? <LoadingSpinner size={5} /> : <SparklesIcon className="w-5 h-5 mr-2"/>}
            Schedule Email Campaign
        </button>
      </div>
      <p className="text-gray-600">Placeholder for email campaign logs and analytics.</p>
    </div>
  );

  const OfferManagementView: React.FC = () => (
     <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><DocumentCheckIcon className="w-7 h-7 mr-2 text-purple-600"/>Offer Letter Management</h2>
       <div className="mb-6 p-4 border border-purple-200 bg-purple-50 rounded-md">
        <h3 className="text-lg font-semibold text-purple-700 mb-2">Generate & Send Offer Letters (AI & DocuSign)</h3>
        <p className="text-sm text-purple-600 mb-3">
          AI helps draft offer letters, then send via DocuSign and track acceptance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <input type="text" placeholder="Candidate Name" className="p-2 border rounded"/>
            <input type="text" placeholder="Job Title" className="p-2 border rounded"/>
            <input type="text" placeholder="Salary" className="p-2 border rounded"/>
        </div>
        <textarea placeholder="Additional Terms (AI can help draft this)" rows={3} className="w-full p-2 border rounded mb-3"></textarea>
        <button 
            onClick={() => handleSimulatedApiCall("Offer Letter content generation and DocuSign dispatch", DOCUSIGN_API_PLACEHOLDER_URL, {candidate: "John Doe", role: "Engineer", salary: "100000"})}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center" disabled={isLoading}>
             {isLoading ? <LoadingSpinner size={5} /> : <SparklesIcon className="w-5 h-5 mr-2"/>}
            Prepare & Send Offer
        </button>
      </div>
      <p className="text-gray-600">Placeholder for tracking offer letter statuses (Sent, Viewed, Signed).</p>
    </div>
  );

  // If not authenticated, show LoginView
  if (!isAuthenticated || !currentUser) { // Add !currentUser check for safety
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated view
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white p-6 shadow-md flex flex-col">
        <div className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
            <SparklesIcon className="w-8 h-8 mr-2 text-blue-600"/> HR IntelliHub
        </div>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 truncate" title={currentUser.email}>{currentUser.name || "Current User"}</p>
            <p className="text-xs text-gray-500">Plan: <span className="font-semibold">{currentUser.subscriptionTier || 'Trial'}</span> {currentUser.isAdmin && <span className="font-bold text-indigo-600">(Admin)</span>}</p>
        </div>
        <nav className="flex-grow space-y-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar" role="navigation" aria-label="Main navigation">
          <ul role="menu">
            {currentUser.isAdmin && (
              <NavItem view="adminDashboard" label="Admin Dashboard" icon={<ShieldCheckIcon />} />
            )}
            <NavItem view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
            <NavItem view="queryResolution" label="AI HR Assistant" icon={<ChatBubbleIcon />} />
            <NavItem 
                view="aiWorkerMonitor" 
                label="AI Worker Monitor" 
                icon={<CogIcon />} 
                disabled={currentUser.subscriptionTier === 'Basic' && !currentUser.isAdmin} 
            />
            <NavItem view="emailSummaries" label="Email Summaries" icon={<EnvelopeIcon />} />
            <NavItem 
                view="candidateSourcing" 
                label="Candidate Sourcing" 
                icon={<UserGroupIcon />} 
                disabled={currentUser.subscriptionTier === 'Basic' && !currentUser.isAdmin} 
            />
            <NavItem view="jobPosting" label="Job Postings" icon={<BriefcaseIcon />} />
            <NavItem 
                view="offerManagement" 
                label="Offer Management" 
                icon={<DocumentCheckIcon />}
                disabled={currentUser.subscriptionTier === 'Basic' && !currentUser.isAdmin} 
            />
            <NavItem 
                view="onboardingTracker" 
                label="Onboarding Tracker" 
                icon={<ClipboardDocumentListIcon />} 
                disabled={currentUser.subscriptionTier === 'Basic' && !currentUser.isAdmin} 
            />
            <NavItem view="offboardingManagement" label="Offboarding" icon={<UserMinusIcon />} />
            <NavItem view="policyCenter" label="Policy Center" icon={<DocumentTextIcon />} />
            <NavItem 
                view="emailAutomation" 
                label="Email Automation" 
                icon={<PaperAirplaneIcon />} 
                disabled={currentUser.subscriptionTier === 'Basic' && !currentUser.isAdmin}
            />
            <NavItem view="billing" label="Billing" icon={<CreditCardIcon />} />
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200">
           <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-lg cursor-pointer flex items-center space-x-3 transition-colors duration-150"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6"/>
              <span>Logout</span>
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">&copy; {new Date().getFullYear()} HR IntelliHub v0.5</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto" role="main">
         {actionMessage && (
          <div className={`p-3 mb-4 text-sm rounded-lg shadow ${actionMessage.toLowerCase().includes("error") || actionMessage.toLowerCase().includes("failed") ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-700'}`} role="alert">
            <pre className="whitespace-pre-wrap break-words">{actionMessage}</pre>
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
};

export default App;