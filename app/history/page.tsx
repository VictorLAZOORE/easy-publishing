import dynamic from 'next/dynamic';

const VideoTable = dynamic(() => import('../../components/VideoTable'), { ssr: false });

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <h1 className="page-header">Historique des uploads</h1>
      <p className="text-slate-600 max-w-xl">
        Suivez le statut de vos publications sur chaque plateforme.
      </p>
      <VideoTable />
    </div>
  );
}
