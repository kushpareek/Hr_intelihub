import { AITask, TaskStatus, Candidate, JobPosting, CompanyPolicy, OnboardingItem, OffboardingCase, User, ClientSubscription, SubscriptionStatus, SupportQuery, SupportQueryStatus, SubscriptionTier } from './types';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// API Base URL from environment variable, with a fallback for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/*
export const MOCK_AI_TASKS: AITask[] = [
  { id: 'task1', title: 'Send Welcome Emails Q3 New Hires', description: 'Draft and send personalized welcome emails to all new hires starting in Q3.', assignedTo: 'Email Automation Bot', status: TaskStatus.IN_PROGRESS, createdAt: new Date(2024, 6, 1), updatedAt: new Date() },
  { id: 'task2', title: 'Source Senior Frontend Engineers', description: 'Identify 10 potential candidates for Senior Frontend Engineer role from LinkedIn and GitHub.', assignedTo: 'Candidate Sourcing AI', status: TaskStatus.PENDING, createdAt: new Date(2024, 6, 10), updatedAt: new Date() },
  { id: 'task3', title: 'Review Annual Performance Feedback', description: 'Analyze sentiment and key themes from annual performance review feedback.', assignedTo: 'Data Analysis AI', status: TaskStatus.COMPLETED, createdAt: new Date(2024, 5, 15), updatedAt: new Date(2024, 5, 20) },
  { id: 'task4', title: 'Update Remote Work Policy Document', description: 'Incorporate new guidelines for hybrid work model into the company policy.', assignedTo: 'Policy Management AI', status: TaskStatus.FAILED, createdAt: new Date(2024, 6, 5), updatedAt: new Date(2024, 6, 6) },
];

export const MOCK_CANDIDATES: Candidate[] = [
  { id: 'cand1', name: 'Alice Wonderland', email: 'alice@example.com', platform: 'LinkedIn', role: 'Senior Frontend Engineer', status: 'Interviewing' },
  { id: 'cand2', name: 'Bob The Builder', email: 'bob@example.com', platform: 'Referral', role: 'Product Manager', status: 'Offered' },
  { id: 'cand3', name: 'Charlie Brown', email: 'charlie@example.com', platform: 'Careers Page', role: 'UX Designer', status: 'Sourced' },
];

export const MOCK_JOB_POSTINGS: JobPosting[] = [
  { id: 'job1', title: 'Senior Frontend Engineer', department: 'Engineering', description: 'Join our dynamic team to build next-gen web applications.', status: 'Open', postedAt: new Date(2024, 5, 20) },
  { id: 'job2', title: 'HR Specialist', department: 'Human Resources', description: 'Seeking an experienced HR professional to manage employee relations and recruitment.', status: 'Draft' },
];

export const MOCK_COMPANY_POLICIES: CompanyPolicy[] = [
  {id: 'pol1', title: 'Remote Work Policy', category: 'Work Environment', contentSnippet: 'Guidelines for remote work eligibility, equipment, and communication...'},
  {id: 'pol2', title: 'Code of Conduct', category: 'Ethics', contentSnippet: 'Our commitment to a respectful and inclusive workplace...'},
  {id: 'pol3', title: 'Data Privacy Policy', category: 'Security', contentSnippet: 'How we handle and protect employee and customer data...'},
];

export const MOCK_ONBOARDING_ITEMS: OnboardingItem[] = [
    { id: 'onboard1', task: 'Complete HR Paperwork', status: 'Pending', assignee: 'New Hire', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { id: 'onboard2', task: 'Setup Workstation & Accounts', status: 'In Progress', assignee: 'IT Department' },
    { id: 'onboard3', task: 'Welcome Meeting with Team', status: 'Pending', assignee: 'Hiring Manager', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { id: 'onboard4', task: 'Compliance Training', status: 'Completed', assignee: 'New Hire' },
];

export const MOCK_OFFBOARDING_CASES: OffboardingCase[] = [
  { id: 'offboard1', employeeName: 'Eve Adams', employeeId: 'E789', type: 'Resignation', status: 'Pending Exit Interview', initiatedDate: new Date(2024, 10, 1), lastWorkingDay: new Date(2024, 10, 30), reason: 'Moving to a new role.', nextStep: 'Schedule Exit Interview' },
  { id: 'offboard2', employeeName: 'Mike Ross', employeeId: 'E101', type: 'PIP', status: 'PIP Active', initiatedDate: new Date(2024, 9, 15), pipReviewDate: new Date(2024, 11, 15), manager: 'Jessica Pearson', reason: 'Consistently missing project deadlines.', nextStep: 'Monitor progress, prepare for review.' },
  { id: 'offboard3', employeeName: 'Sarah Connor', employeeId: 'E202', type: 'Termination', status: 'Requires Attention', initiatedDate: new Date(2024, 10, 5), lastWorkingDay: new Date(2024, 10, 19), reason: 'Company restructuring.', nextStep: 'Finalize severance package details.'},
  { id: 'offboard4', employeeName: 'John Rambo', employeeId: 'E303', type: 'Resignation', status: 'Pending Final Settlement', initiatedDate: new Date(2024, 9, 20), lastWorkingDay: new Date(2024, 10, 20), reason: 'Personal reasons.', nextStep: 'Process final dues.'},
];


export const DOCUSIGN_API_PLACEHOLDER_URL = "https_//api.docusign.com/placeholder"; // Not a real URL
export const BRAVO_API_PLACEHOLDER_URL = "https_//api.bravo.com/placeholder"; // Not a real URL
export const LINKEDIN_API_PLACEHOLDER_URL = "https_//api.linkedin.com/placeholder"; // Not a real URL

export const MOCK_RAW_EMAILS: Array<{id: string, sender: string, subject: string, body: string, receivedDate: Date}> = [
    {
        id: 'email1',
        sender: 'john.doe@example.com',
        subject: 'Request for Paternity Leave',
        body: "Dear HR Team,\n\nI would like to formally request paternity leave from October 1st, 2024, to October 15th, 2024, as my wife is expecting our child around that time. Please let me know the necessary procedures and forms I need to complete.\n\nThank you,\nJohn Doe",
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
        id: 'email2',
        sender: 'jane.smith@example.com',
        subject: 'Question about Dental Benefits',
        body: "Hello HR,\n\nI'm reviewing my benefits package and had a question regarding the dental coverage. Could you please clarify if orthodontic treatments are covered under the current plan? I couldn't find specific details in the handbook.\n\nBest regards,\nJane Smith",
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        id: 'email3',
        sender: 'peter.jones@example.com',
        subject: 'Feedback on recent Team Building Event',
        body: "Hi HR Department,\n\nI wanted to share some positive feedback on the team-building event last Friday. It was very well organized and a great opportunity to connect with colleagues from other departments. The activities were engaging and fun! I particularly enjoyed the escape room challenge. Looking forward to more such events.\n\nThanks,\nPeter Jones",
        receivedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000) // 12 hours ago
    },
     {
        id: 'email4',
        sender: 'alice.green@example.com',
        subject: 'Resignation - Alice Green',
        body: "Dear HR Manager,\n\nPlease accept this email as formal notification that I am resigning from my position as Marketing Specialist, with my last day of employment being November 30th, 2024. I have appreciated my time at the company and the opportunities I've been given.\n\nSincerely,\nAlice Green",
        receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
        id: 'email5',
        sender: 'bob.white@example.com',
        subject: 'Issue with Payroll - October',
        body: "Hello HR/Payroll,\n\nI noticed a discrepancy in my October paycheck. It seems my overtime hours were not fully accounted for. Could you please look into this at your earliest convenience? I have attached my timesheet for reference.\n\nRegards,\nBob White",
        receivedDate: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000) // ~5 hours ago
    }
];


export const MOCK_CLIENT_SUBSCRIPTIONS: ClientSubscription[] = [
  { id: 'client1', clientName: 'Innovatech Solutions', clientEmail: 'contact@innovatech.com', plan: 'Pro', status: 'Active', joinedDate: new Date(2023, 0, 15), renewalDate: new Date(2025, 0, 15) },
  { id: 'client2', clientName: 'GreenLeaf Organics', clientEmail: 'support@greenleaf.com', plan: 'Basic', status: 'Active', joinedDate: new Date(2023, 2, 10), renewalDate: new Date(2025, 2, 10) },
  { id: 'client3', clientName: 'Alpha Corp', clientEmail: 'admin@alphacorp.io', plan: 'Enterprise', status: 'Active', joinedDate: new Date(2022, 8, 1), renewalDate: new Date(2024, 8, 1) },
  { id: 'client4', clientName: 'StartupX Inc.', clientEmail: 'hello@startupx.dev', plan: 'Trial', status: 'Trialing', joinedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
  { id: 'client5', clientName: 'Legacy Systems Ltd.', clientEmail: 'info@legacysys.com', plan: 'Pro', status: 'Canceled', joinedDate: new Date(2022, 5, 20), renewalDate: new Date(2023, 5, 20) },
  { id: 'client6', clientName: 'Future Gadgets Lab', clientEmail: 'fg_lab@example.com', plan: 'Basic', status: 'Past Due', joinedDate: new Date(2023, 4, 5), renewalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)},
];

export const MOCK_SUPPORT_QUERIES: SupportQuery[] = [
  { id: 'query1', clientId: 'client1', clientName: 'Innovatech Solutions', subject: 'Issue with AI Worker Monitor', description: 'The AI worker monitor dashboard is not updating in real-time. We are on the Pro plan.', submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'In Progress', assignedTo: 'Tier 2 Support AI', priority: 'High' },
  { id: 'query2', clientId: 'client2', clientName: 'GreenLeaf Organics', subject: 'How to integrate with our payroll system?', description: 'We are using PayEasy and want to know if HR IntelliHub can integrate for automated data entry.', submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), lastUpdatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'Open', assignedTo: 'Sales Inquiries Bot', priority: 'Medium' },
  { id: 'query3', clientId: 'client4', clientName: 'StartupX Inc.', subject: 'Trial Extension Request', description: 'Our trial is ending soon, can we get an extension to evaluate the Enterprise features?', submittedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), lastUpdatedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), status: 'Open', priority: 'Medium' },
  { id: 'query4', clientId: 'client3', clientName: 'Alpha Corp', subject: 'Feedback on Email Summarization Accuracy', description: 'The email summarization for complex technical emails needs improvement. We have some examples.', submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), lastUpdatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'Resolved', assignedTo: 'AI Model Feedback Team', priority: 'Low' },
];
*/