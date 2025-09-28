import { usePage } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'exchange_house' | 'operator';
  exchange_house_id?: number;
  exchange_house?: {
    id: number;
    name: string;
  };
}

interface PageProps {
  auth: {
    user: User;
  };
}

export function useAuth() {
  const { auth } = usePage<PageProps>().props;
  
  return {
    user: auth.user,
    isSuperAdmin: auth.user.role === 'super_admin',
    isExchangeHouse: auth.user.role === 'exchange_house',
    isOperator: auth.user.role === 'operator',
  };
}