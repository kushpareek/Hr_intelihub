import React, { useState } from 'react';
import { CreditCardIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';
import { User } from '../types'; // Assuming User type includes subscriptionTier

interface BillingViewProps {
  currentUser: User | null;
  onManageSubscription: (action: 'upgrade' | 'cancel' | 'updatePayment', plan?: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ currentUser, onManageSubscription }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const plans = [
    { name: 'Basic', price: '$29/mo', features: ['Core HR Chatbot', 'AI Task Monitoring (5 tasks/mo)', 'Basic Email Summaries'], idealFor: 'Small Teams', cta: 'Downgrade or Manage'},
    { name: 'Pro', price: '$79/mo', features: ['All Basic Features', 'Advanced Candidate Sourcing AI', 'Full Email Automation', 'Offer Management', 'Onboarding Tracker (Unlimited)'], idealFor: 'Growing Businesses', cta: 'Upgrade to Pro' },
    { name: 'Enterprise', price: 'Custom', features: ['All Pro Features', 'Dedicated AI Model Tuning', 'Custom Integrations', 'Premium Support & SLA', 'Advanced Security Options'], idealFor: 'Large Organizations', cta: 'Contact Sales'},
  ];

  const currentSubTier = currentUser?.subscriptionTier || 'Trial';

  const handlePlanAction = (action: 'upgrade' | 'cancel' | 'updatePayment', planName?: string) => {
    setIsLoading(true);
    setActionMessage(null);
    // Simulate API call
    setTimeout(() => {
      onManageSubscription(action, planName);
      setActionMessage(`Successfully simulated '${action}' ${planName ? `for ${planName} plan` : ''}. In a real app, this would integrate with a payment provider.`);
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 6000);
    }, 1500);
  };


  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 flex items-center mb-3 md:mb-0">
          <CreditCardIcon className="w-8 h-8 mr-3 text-blue-600" />
          Billing & Subscription
        </h2>
        <div className="text-sm text-gray-600">
            Current Plan: <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                currentSubTier === 'Pro' ? 'bg-green-100 text-green-700' :
                currentSubTier === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                currentSubTier === 'Basic' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
            }`}>{currentSubTier}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {actionMessage}
        </div>
      )}
      {isLoading && !actionMessage && <div className="flex justify-center my-6"><LoadingSpinner /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {plans.map((plan) => (
          <div key={plan.name} className={`border rounded-lg p-6 flex flex-col shadow-md hover:shadow-lg transition-shadow ${currentSubTier === plan.name ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}>
            <h3 className="text-xl font-semibold text-blue-700 mb-1">{plan.name}</h3>
            <p className="text-2xl font-bold text-gray-800 mb-3">{plan.price}</p>
            <p className="text-xs text-gray-500 mb-4">{plan.idealFor}</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <SparklesIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanAction(plan.name === 'Enterprise' ? 'updatePayment' : 'upgrade', plan.name)}
              disabled={isLoading || currentSubTier === plan.name && plan.name !== 'Enterprise'}
              className={`w-full mt-auto py-2 px-4 rounded-md font-medium text-sm transition-colors
                ${currentSubTier === plan.name 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}
                ${plan.name === 'Enterprise' && currentSubTier !== 'Enterprise' ? '!bg-purple-600 hover:!bg-purple-700' : ''}
                disabled:opacity-70`}
            >
              {currentSubTier === plan.name ? (plan.name === 'Enterprise' ? 'Contact Support' : 'Current Plan') : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Payment Details (Conceptual)</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Your primary payment method: Visa **** **** **** 1234</p>
          <p className="text-sm text-gray-600 mb-4">Next billing date: October 25, 2024</p>
          <div className="flex space-x-3">
            <button 
                onClick={() => handlePlanAction('updatePayment')} 
                disabled={isLoading}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm disabled:opacity-70">
                Update Payment Method
            </button>
            <button 
                onClick={() => handlePlanAction('cancel')} 
                disabled={isLoading}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 text-sm disabled:opacity-70">
                Cancel Subscription
            </button>
          </div>
        </div>
      </div>
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Billing History (Conceptual)</h3>
            <p className="text-sm text-gray-500">No billing history available in this demo.</p>
            {/* Placeholder for a table or list of invoices */}
        </div>
    </div>
  );
};

export default BillingView;
