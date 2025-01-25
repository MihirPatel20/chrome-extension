import React from 'react';
import { Palette, Moon, Sun, Info } from 'lucide-react';

// Check if we're running in a Chrome extension environment
const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

function App() {
  const [currentTheme, setCurrentTheme] = React.useState('dark');
  const [error, setError] = React.useState<string | null>(null);
  
  // Get current theme on mount
  React.useEffect(() => {
    if (!isExtensionEnvironment) return;
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        try {
          console.log('Sending message to tab id:', tab.id);
          chrome.tabs.sendMessage(tab.id, { type: 'GET_THEME' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Runtime error:', chrome.runtime.lastError);
              setError('Please refresh YouTube Music page');
              return;
            }
            if (response && response.theme) {
              setCurrentTheme(response.theme);
            } else {
              console.error('No theme found in response:', response);
              setError('Please refresh YouTube Music page');
            }
          });
        } catch (err) {
          console.error('Caught error:', err);
          setError('Please refresh YouTube Music page');
        }
      } else {
        console.error('No tab id found');
        setError('Please refresh YouTube Music page');
      }
    });
  }, []);

  const changeTheme = (theme: string) => {
    if (!isExtensionEnvironment) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        try {
          chrome.tabs.sendMessage(tab.id, { type: 'SET_THEME', theme }, (response) => {
            if (chrome.runtime.lastError) {
              setError('Please refresh YouTube Music page');
              return;
            }
            if (response && response.success) {
              setCurrentTheme(theme);
            }
          });
        } catch (err) {
          setError('Please refresh YouTube Music page');
        }
      }
    });
  };

  if (!isExtensionEnvironment) {
    return (
      <div className="w-64 p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-600" />
          <h1 className="text-lg font-semibold text-gray-800">YTMusic Themes</h1>
        </div>
        <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
          This is a Chrome extension and needs to be loaded in Chrome to work.
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-600" />
        <h1 className="text-lg font-semibold text-gray-800">YTMusic Themes</h1>
      </div>

      {error ? (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => changeTheme('dark')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentTheme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-200 text-gray-700'
              }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Theme</span>
          </button>

          <button
            onClick={() => changeTheme('light')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentTheme === 'light'
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-200 text-gray-700'
              }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Theme</span>
          </button>

          <button
            onClick={() => changeTheme('sunset')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentTheme === 'sunset'
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-200 text-gray-700'
              }`}
          >
            <Palette className="w-4 h-4" />
            <span>Sunset Theme</span>
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Changes will apply immediately to your YouTube Music tab.</p>
        </div>
      </div>
    </div>
  );
}

export default App;