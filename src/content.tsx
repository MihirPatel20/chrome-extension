import React from 'react';
import { createRoot } from 'react-dom/client';
import { Palette, Moon, Sun } from 'lucide-react';

const themes = {
  dark: {
    '--ytmusic-background': '#030303',
    '--ytmusic-nav-bar': '#030303',
    '--ytmusic-player-bar': '#000000',
    '--ytmusic-text': '#ffffff',
    '--ytmusic-subtitle': '#aaaaaa',
  },
  light: {
    '--ytmusic-background': '#ffffff',
    '--ytmusic-nav-bar': '#ffffff',
    '--ytmusic-player-bar': '#f5f5f5',
    '--ytmusic-text': '#030303',
    '--ytmusic-subtitle': '#606060',
  },
  sunset: {
    '--ytmusic-background': '#2d1b2d',
    '--ytmusic-nav-bar': '#1a0f1a',
    '--ytmusic-player-bar': '#1a0f1a',
    '--ytmusic-text': '#ffd1dc',
    '--ytmusic-subtitle': '#ffb6c1',
  }
};

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = React.useState('dark');
  const [isOpen, setIsOpen] = React.useState(false);

  const applyTheme = (themeName: keyof typeof themes) => {
    const theme = themes[themeName];
    
    // Apply theme to YouTube Music elements
    const app = document.querySelector('ytmusic-app');
    const navBar = document.querySelector('ytmusic-nav-bar');
    const playerBar = document.querySelector('ytmusic-player-bar');
    const mainPanel = document.querySelector('ytmusic-browse-response');
    const tabBar = document.querySelector('ytmusic-tabs-bar');

    if (app) {
      app.style.setProperty('--ytmusic-background', theme['--ytmusic-background']);
      app.style.setProperty('--ytmusic-text', theme['--ytmusic-text']);
      app.style.setProperty('--ytmusic-subtitle', theme['--ytmusic-subtitle']);
      app.style.backgroundColor = theme['--ytmusic-background'];
    }

    if (navBar) {
      navBar.style.backgroundColor = theme['--ytmusic-nav-bar'];
    }

    if (playerBar) {
      playerBar.style.backgroundColor = theme['--ytmusic-player-bar'];
    }

    if (mainPanel) {
      mainPanel.style.backgroundColor = theme['--ytmusic-background'];
      mainPanel.style.color = theme['--ytmusic-text'];
    }

    if (tabBar) {
      tabBar.style.backgroundColor = theme['--ytmusic-background'];
    }

    // Update all text colors
    document.querySelectorAll('yt-formatted-string, .title').forEach((element) => {
      (element as HTMLElement).style.color = theme['--ytmusic-text'];
    });

    document.querySelectorAll('.subtitle').forEach((element) => {
      (element as HTMLElement).style.color = theme['--ytmusic-subtitle'];
    });

    setCurrentTheme(themeName);
    chrome.storage.local.set({ theme: themeName });
  };

  // Load saved theme on mount
  React.useEffect(() => {
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme && themes[result.theme as keyof typeof themes]) {
        applyTheme(result.theme as keyof typeof themes);
      }
    });
  }, []);

  // Set up message listener
  React.useEffect(() => {
    const messageListener = (message: any, sender: any, sendResponse: any) => {
      if (message.type === 'GET_THEME') {
        sendResponse({ theme: currentTheme });
        return true;
      } else if (message.type === 'SET_THEME' && message.theme) {
        applyTheme(message.theme as keyof typeof themes);
        sendResponse({ success: true });
        return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [currentTheme]);

  // Re-apply theme on navigation
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(currentTheme as keyof typeof themes);
    });

    const app = document.querySelector('ytmusic-app');
    if (app) {
      observer.observe(app, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [currentTheme]);

  return (
    <div className="fixed right-4 bottom-20 z-[9999]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Palette className="w-6 h-6 text-gray-700" />
        </button>

        {isOpen && (
          <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
            <button
              onClick={() => {
                applyTheme('dark');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100"
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                applyTheme('light');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100"
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                applyTheme('sunset');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100"
            >
              <Palette className="w-4 h-4" />
              <span>Sunset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Wait for YouTube Music app to be ready
const waitForYTMusic = () => {
  return new Promise((resolve) => {
    const check = () => {
      const app = document.querySelector('ytmusic-app');
      if (app) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

// Initialize when YouTube Music is ready
const initialize = async () => {
  await waitForYTMusic();
  
  const container = document.createElement('div');
  container.id = 'yt-music-theme-switcher';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<ThemeSwitcher />);
};

initialize();