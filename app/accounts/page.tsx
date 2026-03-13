import dynamic from 'next/dynamic';

const AccountsList = dynamic(() => import('../../components/AccountsList'), { ssr: false });

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <h1 className="page-header">Comptes connectés</h1>
      <p className="text-slate-600 max-w-xl">
        Connectez vos comptes YouTube pour publier vos vidéos en un clic sur plusieurs chaînes.
      </p>
      <AccountsList />
    </div>
  );
}
