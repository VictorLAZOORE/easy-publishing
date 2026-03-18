import dynamic from 'next/dynamic';

const AccountsList = dynamic(() => import('../../components/AccountsList'), { ssr: false });

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Comptes</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Connectez vos chaînes YouTube pour publier en quelques clics.
        </p>
      </div>
      <AccountsList />
    </div>
  );
}
