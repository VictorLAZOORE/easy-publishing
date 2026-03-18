import dynamic from 'next/dynamic';

const VideoTable = dynamic(() => import('../../components/VideoTable'), { ssr: false });

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Historique</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Suivez le statut de vos publications et ouvrez les liens YouTube.
        </p>
      </div>
      <VideoTable />
    </div>
  );
}
