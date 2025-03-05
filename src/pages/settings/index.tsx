import { FC, useState } from 'react';
import { ButtonPrimary, Input, Label, Tabs } from '@components';

export const SettingsPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState('Folder Settings');
  const [inputPathFolder, setInputPathFolder] = useState<string>('');
  const [inputApiKeyOpenAI, setInputApiKeyOpenAI] = useState<string>('');
  const [inputApiKeyClaude, setInputApiKeyClaude] = useState<string>('');

  return (
    <div className="p-5 space-y-4">
      <Tabs tabs={['Folder Settings', 'API Connections']} currentTab={selectedTab} onSelect={setSelectedTab} />
      {selectedTab === 'Folder Settings' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Path to main folder</h1>
          <div className="flex items-center space-x-2">
            <div className="w-1/2">
              <Input placeholder="Add path here" value={inputPathFolder} onChange={(e) => setInputPathFolder(e.target.value)} />
            </div>
            <ButtonPrimary>Save Path</ButtonPrimary>
          </div>
          <div className="text-muted_foreground">
            <p>The app will:</p>
            <ul className="list-disc pl-5">
              <li>Monitor this folder and all its subfolders for images</li>
              <li>Automatically detect new images when they are added</li>
              <li>Create its own organized folder structure for processed images and captions</li>
              <li>Keep track of which images have been processed</li>
            </ul>
          </div>
        </div>
      )}
      {selectedTab === 'API Connections' && (
        <div className="space-y-6">
          <div className="border border-line rounded-lg p-4 w-2/3 space-y-4">
            <div className="flex justify-between items-center space-x-2">
              <h1 className="text-lg font-medium">OpenAI API Configuration</h1>
              <p className="flex-none text-muted_foreground">$0.00 USD</p>
            </div>
            <div>
              <Label>API Key</Label>
              <Input placeholder="Enter your OpenAI key" value={inputApiKeyOpenAI} onChange={(e) => setInputApiKeyOpenAI(e.target.value)} />
            </div>
            <ButtonPrimary className="w-full">Save OpenAI Configuration</ButtonPrimary>
          </div>
          <div className="border border-line rounded-lg p-4 w-2/3 space-y-4">
            <div className="flex justify-between items-center space-x-2">
              <h1 className="text-lg font-medium">Anthropic (Claude) API Configuration</h1>
              <p className="flex-none text-muted_foreground">$0.00 USD</p>
            </div>
            <div>
              <Label>API Key</Label>
              <Input placeholder="Enter your Claude key" value={inputApiKeyClaude} onChange={(e) => setInputApiKeyClaude(e.target.value)} />
            </div>
            <ButtonPrimary className="w-full">Save Claude Configuration</ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  );
};
