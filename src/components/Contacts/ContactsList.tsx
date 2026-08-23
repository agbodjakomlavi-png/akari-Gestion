import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Circle } from 'lucide-react';
import { authService } from '../../services/auth';

interface Contact {
  id: string;
  name: string;
  email: string;
  akariId: string;
  avatar: string;
  isOnline: boolean;
}

interface ContactsListProps {
  onSelectContact: (contact: Contact) => void;
}

export function ContactsList({ onSelectContact }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
    
    // Refresh contacts every 5 seconds
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await authService.fetchWithAuth(`${window.location.origin}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
        setError('');
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Chargement des contacts...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#00a884]" />
          Contacts
        </h2>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucun contact disponible
          </div>
        ) : (
          <div className="divide-y">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {contact.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.akariId}
                  </p>
                </div>

                {contact.isOnline ? (
                  <Circle className="w-2 h-2 text-green-500 flex-shrink-0" fill="currentColor" />
                ) : (
                  <Circle className="w-2 h-2 text-gray-300 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
