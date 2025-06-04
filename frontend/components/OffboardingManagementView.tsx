import React, { useState, useCallback } from 'react';
import { OffboardingCase, OffboardingCaseType, OffboardingStatus } from '../types';
import { MOCK_OFFBOARDING_CASES } from '../constants';
import { UserMinusIcon, SparklesIcon, LoadingSpinner, DocumentTextIcon, ClipboardDocumentListIcon } from './common/IconComponents';
import { analyzeTextWithSystemInstruction } from '../services/geminiService';


const StatusBadge: React.FC<{ status: OffboardingStatus }> = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-800';
  if (status.includes('Pending') || status === 'PIP Review Pending') colorClasses = 'bg-yellow-100 text-yellow-800';
  else if (status.includes('Active') || status === 'PIP Active') colorClasses = 'bg-blue-100 text-blue-800';
  else if (status.includes('Requires Attention')) colorClasses = 'bg-red-100 text-red-800';
  else if (status.includes('Closed')) colorClasses = 'bg-green-100 text-green-800';
  
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{status}</span>;
};

const CaseTypeBadge: React.FC<{ type: OffboardingCaseType }> = ({ type }) => {
  let colorClasses = 'bg-gray-200 text-gray-700';
  if (type === 'Resignation') colorClasses = 'bg-purple-100 text-purple-800';
  else if (type === 'Termination') colorClasses = 'bg-pink-100 text-pink-800';
  else if (type === 'PIP') colorClasses = 'bg-orange-100 text-orange-800';

  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{type}</span>;
};


const OffboardingManagementView: React.FC = () => {
  const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>(MOCK_OFFBOARDING_CASES);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [newCaseData, setNewCaseData] = useState<Partial<OffboardingCase>>({ type: 'Resignation', status: 'Initiated', initiatedDate: new Date() });

  const handleAiAssist = useCallback(async (caseItem: OffboardingCase, action: 'draftPIP' | 'draftAcknowledgement' | 'reviewChecklist') => {
    setIsLoading(true);
    setActionMessage(`AI processing: ${action} for ${caseItem.employeeName}...`);
    let prompt = "";
    let systemInstruction = "You are an expert HR assistant providing concise, actionable advice or drafts.";

    switch (action) {
        case 'draftPIP':
            prompt = `Draft a basic Performance Improvement Plan (PIP) communication for an employee named ${caseItem.employeeName}. Key issues: ${caseItem.reason || 'Not specified'}. Manager: ${caseItem.manager || 'HR'}. Focus on clear expectations and a review period of 60 days.`;
            systemInstruction = "Draft a formal, yet supportive, PIP initiation document. Include sections for: Employee Details, Manager Details, Reason for PIP, Specific Improvement Areas, Expected Standards, Support/Resources Provided, Timeline & Review Dates, Consequences of Not Meeting Expectations. Keep it concise and professional.";
            break;
        case 'draftAcknowledgement':
            prompt = `Draft a polite and professional resignation acknowledgement letter for ${caseItem.employeeName} who resigned on ${caseItem.initiatedDate.toLocaleDateString()}. Their last working day is ${caseItem.lastWorkingDay?.toLocaleDateString() || 'to be confirmed'}. Express thanks and outline next steps like exit interview and final settlement.`;
            systemInstruction = "Draft a formal resignation acknowledgement. Include: Confirmation of resignation receipt, Last working day, Gratitude for service, Information on exit process (interview, final pay, benefits continuation if any).";
            break;
        case 'reviewChecklist':
            prompt = `Provide a concise checklist of key HR considerations for processing the ${caseItem.type.toLowerCase()} of ${caseItem.employeeName}. Key details: Reason - ${caseItem.reason || 'N/A'}, Last Day - ${caseItem.lastWorkingDay?.toLocaleDateString() || 'N/A'}. Ensure legal compliance points are highlighted.`;
            systemInstruction = "Generate a checklist for HR to manage an employee separation. Cover: Documentation, System Access Revocation, Asset Recovery, Final Payroll, Benefits, Exit Interview, Legal Considerations. Tailor slightly based on separation type (Resignation/Termination).";
            break;
    }

    try {
        const aiResponse = await analyzeTextWithSystemInstruction(prompt, systemInstruction);
        setActionMessage(`AI Assistance for ${caseItem.employeeName} (${action}):\n${aiResponse}`);
        // In a real app, you might open a modal with this text or pre-fill a form.
        console.log(`AI Response for ${action} on ${caseItem.employeeName}:`, aiResponse);
    } catch (error) {
        console.error("AI assistance error:", error);
        setActionMessage(`Error getting AI assistance for ${caseItem.employeeName}.`);
    } finally {
        setIsLoading(false);
        setTimeout(() => setActionMessage(null), 10000); // Clear message after 10s
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCaseData(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
  };

  const handleAddNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call & AI analysis if needed
    const newId = `offboard${Date.now()}`;
    const newCase: OffboardingCase = {
      ...newCaseData,
      id: newId,
      employeeName: newCaseData.employeeName || "Unknown Employee",
      employeeId: newCaseData.employeeId || `E${Date.now().toString().slice(-4)}`,
      initiatedDate: newCaseData.initiatedDate || new Date(),
      status: newCaseData.status || 'Initiated',
      type: newCaseData.type || 'Resignation',
    };
    console.log("Adding new offboarding case (simulated):", newCase);
    
    // Simulate Gemini analyzing the new case details
    analyzeTextWithSystemInstruction(
      `New offboarding case initiated: ${JSON.stringify(newCase)}`,
      "You are an HR AI. Review this new offboarding case. Provide a very brief (1-2 sentence) comment or flag if anything seems unusual (e.g., very short notice for resignation if provided, missing critical info for termination)."
    ).then(aiComment => {
      setActionMessage(`New case for ${newCase.employeeName} added. AI Comment: ${aiComment}`);
      setOffboardingCases(prev => [newCase, ...prev]); // Add to top
      setShowNewCaseForm(false);
      setNewCaseData({ type: 'Resignation', status: 'Initiated', initiatedDate: new Date() });
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 7000);
    }).catch(err => {
      setActionMessage(`New case for ${newCase.employeeName} added, but AI comment failed.`);
      console.error("AI comment failed for new case:", err);
      setOffboardingCases(prev => [newCase, ...prev]);
      setShowNewCaseForm(false);
      setNewCaseData({ type: 'Resignation', status: 'Initiated', initiatedDate: new Date() });
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 7000);
    });
  };


  const pips = offboardingCases.filter(c => c.type === 'PIP');
  const separations = offboardingCases.filter(c => c.type === 'Resignation' || c.type === 'Termination');

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <UserMinusIcon className="w-7 h-7 mr-2 text-red-600" />
          Offboarding & Separations Management
        </h2>
        <button
          onClick={() => setShowNewCaseForm(!showNewCaseForm)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center"
        >
          <SparklesIcon className="w-4 h-4 mr-1.5" /> {showNewCaseForm ? 'Cancel' : 'Initiate New Case'}
        </button>
      </div>

      {actionMessage && (
          <div className={`p-3 mb-4 text-sm rounded-lg ${actionMessage.toLowerCase().includes("error") ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`} role="alert">
            <pre className="whitespace-pre-wrap break-words">{actionMessage}</pre>
          </div>
      )}
      {isLoading && !actionMessage && <div className="flex justify-center my-4"><LoadingSpinner /></div>}


      {showNewCaseForm && (
        <form onSubmit={handleAddNewCase} className="mb-8 p-6 border border-red-200 bg-red-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-red-700 mb-4">New Offboarding/PIP Case</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Employee Name*</label>
              <input type="text" name="employeeName" id="employeeName" value={newCaseData.employeeName || ''} onChange={handleInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"/>
            </div>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input type="text" name="employeeId" id="employeeId" value={newCaseData.employeeId || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Case Type*</label>
              <select name="type" id="type" value={newCaseData.type} onChange={handleInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="PIP">Performance Improvement Plan (PIP)</option>
              </select>
            </div>
             <div>
              <label htmlFor="initiatedDate" className="block text-sm font-medium text-gray-700">Initiated Date*</label>
              <input type="date" name="initiatedDate" id="initiatedDate" value={newCaseData.initiatedDate ? newCaseData.initiatedDate.toISOString().split('T')[0] : ''} onChange={handleDateChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            {newCaseData.type !== 'PIP' && (
                 <div>
                  <label htmlFor="lastWorkingDay" className="block text-sm font-medium text-gray-700">Last Working Day</label>
                  <input type="date" name="lastWorkingDay" id="lastWorkingDay" value={newCaseData.lastWorkingDay ? newCaseData.lastWorkingDay.toISOString().split('T')[0] : ''} onChange={handleDateChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            )}
            {newCaseData.type === 'PIP' && (
                 <div>
                  <label htmlFor="pipReviewDate" className="block text-sm font-medium text-gray-700">PIP Review Date</label>
                  <input type="date" name="pipReviewDate" id="pipReviewDate" value={newCaseData.pipReviewDate ? newCaseData.pipReviewDate.toISOString().split('T')[0] : ''} onChange={handleDateChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            )}
             <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager (for PIP)</label>
              <input type="text" name="manager" id="manager" value={newCaseData.manager || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason / PIP Focus Areas</label>
                <textarea name="reason" id="reason" value={newCaseData.reason || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setShowNewCaseForm(false)} className="mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size={5}/> : <SparklesIcon className="w-4 h-4 mr-1.5"/>} Add Case
            </button>
          </div>
        </form>
      )}

      {/* PIPs Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-orange-500"/> Active Performance Improvement Plans ({pips.length})
        </h3>
        {pips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pips.map(c => (
              <div key={c.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{c.employeeName} <span className="text-xs text-gray-500">({c.employeeId})</span></h4>
                    <CaseTypeBadge type={c.type} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Manager: <span className="font-medium">{c.manager || 'N/A'}</span></p>
                <p className="text-sm text-gray-600 mb-1">Initiated: <span className="font-medium">{c.initiatedDate.toLocaleDateString()}</span></p>
                <p className="text-sm text-gray-600 mb-2">Review Due: <span className="font-medium">{c.pipReviewDate ? c.pipReviewDate.toLocaleDateString() : 'N/A'}</span></p>
                <div className="mb-2"><StatusBadge status={c.status} /></div>
                {c.reason && <p className="text-xs text-gray-500 mt-1 mb-2">Focus: {c.reason}</p>}
                {c.nextStep && <p className="text-xs text-blue-600 font-semibold mb-3">Next Step: {c.nextStep}</p>}
                <button
                    onClick={() => handleAiAssist(c, 'draftPIP')}
                    disabled={isLoading}
                    className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition flex items-center disabled:opacity-60"
                >
                    <SparklesIcon className="w-3 h-3 mr-1"/> AI: Draft PIP Doc
                </button>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500">No active PIPs.</p>}
      </section>

      {/* Separations Section */}
      <section>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-purple-500"/> Pending Separations (Resignations/Terminations) ({separations.length})
        </h3>
        {separations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LWD</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Step</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {separations.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.employeeName}</div>
                        <div className="text-xs text-gray-500">{c.employeeId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><CaseTypeBadge type={c.type} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.lastWorkingDay ? c.lastWorkingDay.toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-blue-600 font-semibold">{c.nextStep || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs space-x-1">
                       {c.type === 'Resignation' && (
                           <button onClick={() => handleAiAssist(c, 'draftAcknowledgement')} disabled={isLoading} className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 disabled:opacity-60"><SparklesIcon className="w-3 h-3 inline-block mr-0.5"/>Ackn.</button>
                       )}
                        <button onClick={() => handleAiAssist(c, 'reviewChecklist')} disabled={isLoading} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-60"><SparklesIcon className="w-3 h-3 inline-block mr-0.5"/>Checklist</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500">No pending separations.</p>}
      </section>
    </div>
  );
};

export default OffboardingManagementView;