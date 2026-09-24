import React, { useState, useEffect } from 'react';
import { ERWSRecord, ViewMode } from './types/erws';
import {
  loadRecordsFromStorage,
  saveRecordsToStorage,
  generateSeedRecords,
} from './utils/storage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { QuickRecordView } from './components/QuickRecordView';
import { DeepRecordView } from './components/DeepRecordView';
import { RecordsListView } from './components/RecordsListView';
import { TrendsAnalyticsView } from './components/TrendsAnalyticsView';
import { CognitivePatternsView } from './components/CognitivePatternsView';
import { AiExportView } from './components/AiExportView';
import { SettingsView } from './components/SettingsView';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [records, setRecords] = useState<ERWSRecord[]>(() => {
    const loaded = loadRecordsFromStorage();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    // Seed initial realistic data for immediate exploration
    const seed = generateSeedRecords();
    saveRecordsToStorage(seed);
    return seed;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [editingRecord, setEditingRecord] = useState<ERWSRecord | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to localStorage whenever records change
  useEffect(() => {
    saveRecordsToStorage(records);
  }, [records]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      text,
      type,
    });
  };

  const handleSaveNewRecord = (newRecord: ERWSRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    showToast('紀錄已成功儲存至本機！');
    setCurrentView('dashboard');
  };

  const handleUpdateRecord = (updatedRecord: ERWSRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    showToast('紀錄已成功更新');
    if (editingRecord) {
      setEditingRecord(null);
      setCurrentView('records');
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('已刪除該筆紀錄', 'info');
  };

  const handleStartEdit = (record: ERWSRecord) => {
    setEditingRecord(record);
    setCurrentView('deep-record');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      {/* Top Bar Navigation and Mobile Bottom Bar */}
      <Navigation
        currentView={currentView}
        onSelectView={(view) => {
          if (view !== 'deep-record') {
            setEditingRecord(null);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        recordCount={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView
            records={records}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onEditRecord={handleStartEdit}
          />
        )}

        {currentView === 'quick-record' && (
          <QuickRecordView
            onSaveRecord={handleSaveNewRecord}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            recentRecords={records.slice(0, 10)}
          />
        )}

        {currentView === 'deep-record' && (
          <DeepRecordView
            onSaveRecord={(record) => {
              if (editingRecord) {
                handleUpdateRecord(record);
              } else {
                handleSaveNewRecord(record);
              }
            }}
            initialRecord={editingRecord}
            onCancel={
              editingRecord
                ? () => {
                    setEditingRecord(null);
                    setCurrentView('records');
                  }
                : undefined
            }
          />
        )}

        {currentView === 'records' && (
          <RecordsListView
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onEditRecord={handleStartEdit}
            onUpdateRecord={handleUpdateRecord}
          />
        )}

        {currentView === 'trends' && (
          <TrendsAnalyticsView records={records} />
        )}

        {currentView === 'cognitive-patterns' && (
          <CognitivePatternsView records={records} />
        )}

        {currentView === 'ai-export' && (
          <AiExportView records={records} onShowToast={showToast} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            records={records}
            onSetRecords={(newRecords) => {
              setRecords(newRecords);
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
