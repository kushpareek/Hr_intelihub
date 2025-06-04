
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  onClick?: () => void;
  color?: string; // Tailwind color class e.g. 'bg-blue-500'
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, description, onClick, color = 'bg-blue-500' }) => {
  return (
    <div 
      className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between h-full ${onClick ? 'transform hover:scale-105' : ''} bg-white`}
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      </div>
      {description && <p className="text-sm text-gray-500 mt-auto">{description}</p>}
    </div>
  );
};

export default DashboardCard;
    