import React from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  MailIcon,
  ChartBarIcon
} from './icons/IconComponents';

// Add new icon for collapse/expand
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

type View = 'dashboard' | 'logs' | 'analysis' | 'analytics' | 'networks';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, isCollapsed }) => {
  return (
    <li
      onClick={onClick}
      className={`flex items-center p-3 my-1 rounded-md cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
      title={isCollapsed ? label : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  return (
    <aside className={`bg-gray-800 p-4 flex flex-col border-r border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex items-center justify-between mb-8 px-2">
        {!isCollapsed && (
          <div className="flex items-center">
            <MailIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <h2 className="text-2xl font-bold text-gray-100 ml-2">Postfix</h2>
          </div>
        )}
        {isCollapsed && (
          <MailIcon className="w-8 h-8 text-primary mx-auto" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ${
            isCollapsed ? 'mx-auto mt-2' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1">
        <ul>
          <NavItem
            icon={<HomeIcon className="w-6 h-6" />}
            label="Dashboard"
            isActive={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<DocumentTextIcon className="w-6 h-6" />}
            label="Mail Logs"
            isActive={activeView === 'logs'}
            onClick={() => setActiveView('logs')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<SparklesIcon className="w-6 h-6" />}
            label="AI Log Analysis"
            isActive={activeView === 'analysis'}
            onClick={() => setActiveView('analysis')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Analytics"
            isActive={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<GlobeAltIcon className="w-6 h-6" />}
            label="Allowed Networks"
            isActive={activeView === 'networks'}
            onClick={() => setActiveView('networks')}
            isCollapsed={isCollapsed}
          />
        </ul>
      </nav>
      
      {!isCollapsed && (
        <div className="mt-auto text-center text-gray-500 text-xs">
          <p>Postfix Dashboard v2.2.0</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;