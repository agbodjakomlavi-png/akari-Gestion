import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { MessageStatus } from '../../types';

interface TickIconProps {
  status: MessageStatus;
  className?: string;
}

export const TickIcon: React.FC<TickIconProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'sending':
      return <Clock className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 animate-pulse ${className}`} />;
    case 'sent':
      return <Check className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-400 ${className}`} />;
    case 'delivered':
      return <CheckCheck className={`w-4 h-4 text-gray-400 dark:text-gray-400 ${className}`} />;
    case 'read':
      return <CheckCheck className={`w-4 h-4 text-[#53bdeb] ${className}`} />;
    default:
      return null;
  }
};
