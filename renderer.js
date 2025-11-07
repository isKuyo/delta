let monacoEditor = null;
let currentTab = null;

class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 1;
    this.init();
  }

  init() {
    this.addTab('Script1.lua', '-- Delta UI Remake by rwque.hpp');
  }

  addTab(name = null, content = '-- Delta UI Remake by rwque.hpp') {
    const tabId = `tab-${this.tabCounter++}`;
    const tabName = name || `Script${this.tabCounter - 1}.lua`;
    
    const tab = {
      id: tabId,
      name: tabName,
      content: content
    };

    this.tabs.push(tab);
    this.renderTabs();
    this.switchTab(tabId);
  }

  closeTab(tabId) {
    if (this.tabs.length <= 1) return;
    
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    this.tabs.splice(index, 1);
    
    if (this.activeTabId === tabId) {
      const newActiveIndex = Math.min(index, this.tabs.length - 1);
      this.activeTabId = this.tabs[newActiveIndex]?.id || null;
    }

    this.renderTabs();
    
    if (this.activeTabId) {
      this.switchTab(this.activeTabId);
    }
  }

  switchTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (this.activeTabId === tabId) return;

    this.activeTabId = tabId;
    currentTab = tab;
    this.renderTabs();
    
    if (monacoEditor) {
      const currentContent = monacoEditor.getValue();
      if (currentContent !== tab.content) {
        monacoEditor.setValue(tab.content);
      }
    }
  }

  getCurrentTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }

  updateCurrentTabContent(content) {
    const tab = this.getCurrentTab();
    if (tab) {
      tab.content = content;
    }
  }

  renderTabs() {
    const tabsList = document.getElementById('tabs-list');
    const existingTabs = Array.from(tabsList.querySelectorAll('.tab'));
    const existingTabIds = existingTabs.map(el => el.dataset.tabId);
    const currentTabIds = this.tabs.map(t => t.id);

    if (JSON.stringify(existingTabIds) !== JSON.stringify(currentTabIds)) {
      tabsList.innerHTML = '';

      this.tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${tab.id === this.activeTabId ? 'active' : ''}`;
        tabElement.dataset.tabId = tab.id;
        
        const tabName = document.createElement('span');
        tabName.className = 'tab-name';
        tabName.textContent = tab.name;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close';
        closeBtn.dataset.tabId = tab.id;
        
        const closeImg = document.createElement('img');
        closeImg.src = 'img/close.png';
        closeImg.alt = 'Close tab';
        closeBtn.appendChild(closeImg);
        
        tabElement.appendChild(tabName);
        tabElement.appendChild(closeBtn);
        
        tabElement.addEventListener('click', (e) => {
          if (!e.target.closest('.tab-close')) {
            this.switchTab(tab.id);
          }
        });
        
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab(tab.id);
        });
        
        tabsList.appendChild(tabElement);
      });
    } else {
      existingTabs.forEach(tabElement => {
        const tabId = tabElement.dataset.tabId;
        if (tabId === this.activeTabId) {
          tabElement.classList.add('active');
        } else {
          tabElement.classList.remove('active');
        }
      });
    }
  }
}

class NavigationManager {
  constructor() {
    this.navHidden = false;
    this.init();
  }

  init() {
    const hideNavBtn = document.getElementById('hide-nav-btn');
    hideNavBtn.addEventListener('click', () => this.toggleNav());
  }

  toggleNav() {
    this.navHidden = !this.navHidden;
    
    const homeContainer = document.getElementById('home-page-container');
    const hideBtn = document.getElementById('hide-nav-btn');
    const editorArea = document.querySelector('.editor-area');
    const tabsContainer = document.querySelector('.tabs-container');
    const actionButtons = document.querySelector('.action-buttons-container');
    
    if (this.navHidden) {
      homeContainer.classList.add('hidden');
      hideBtn.classList.add('hidden-state');
      editorArea.classList.add('expanded');
      tabsContainer.classList.add('expanded');
      actionButtons.classList.add('expanded');
    } else {
      homeContainer.classList.remove('hidden');
      hideBtn.classList.remove('hidden-state');
      editorArea.classList.remove('expanded');
      tabsContainer.classList.remove('expanded');
      actionButtons.classList.remove('expanded');
    }
  }
}

class FilterManager {
  constructor() {
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    const filterTxt = document.getElementById('filter-txt');
    const filterLua = document.getElementById('filter-lua');
    const filterAll = document.getElementById('filter-all');
    
    filterTxt.addEventListener('click', () => this.setFilter('txt', filterTxt));
    filterLua.addEventListener('click', () => this.setFilter('lua', filterLua));
    filterAll.addEventListener('click', () => this.setFilter('all', filterAll));
  }

  setFilter(filter, element) {
    this.activeFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    element.classList.add('active');
  }
}

class WindowController {
  constructor() {
    this.init();
  }

  init() {
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');

    minimizeBtn.addEventListener('click', () => this.controlWindow('minimize'));
    maximizeBtn.addEventListener('click', () => this.controlWindow('maximize'));
    closeBtn.addEventListener('click', () => this.controlWindow('close'));
  }

  async controlWindow(action) {
    if (window.electronAPI) {
      await window.electronAPI.windowControl(action);
    }
  }
}

class ActionButtons {
  constructor(tabManager) {
    this.tabManager = tabManager;
    this.init();
  }

  init() {
    const executeBtn = document.getElementById('execute-btn');
    const clearBtn = document.getElementById('clear-btn');
    const openBtn = document.getElementById('open-btn');
    const saveBtn = document.getElementById('save-btn');
    const injectBtn = document.getElementById('inject-btn');
    
    executeBtn.addEventListener('click', () => this.execute());
    clearBtn.addEventListener('click', () => this.clear());
    openBtn.addEventListener('click', () => this.open());
    saveBtn.addEventListener('click', () => this.save());
    injectBtn.addEventListener('click', () => this.inject());
  }

  execute() {
    console.log('Execute');
  }

  clear() {
    if (monacoEditor) {
      monacoEditor.setValue('');
      this.tabManager.updateCurrentTabContent('');
    }
  }

  open() {
    console.log('Open');
  }

  save() {
    console.log('Save');
  }

  inject() {
    console.log('Inject');
  }
}

class MonacoEditorManager {
  constructor(tabManager) {
    this.tabManager = tabManager;
    this.init();
  }

  init() {
    require.config({ 
      paths: { 
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
      } 
    });

    window.MonacoEnvironment = {
      getWorkerUrl: function(workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
          self.MonacoEnvironment = {
            baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/'
          };
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/base/worker/workerMain.js');
        `)}`;
      }
    };

    require(['vs/editor/editor.main'], () => {
      const tab = this.tabManager.getCurrentTab();
      const initialValue = tab ? tab.content : '-- Start coding here...';
      
      monaco.editor.defineTheme('deltaTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '656D73' },
          { token: 'keyword', foreground: '8ABBC8' },
          { token: 'string', foreground: 'D4876F' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'function', foreground: 'C5A26C' },
          { token: 'variable.predefined', foreground: '9583C7' },
          { token: 'type.identifier', foreground: '9583C7' },
        ],
        colors: {
          'editor.background': '#182026',
          'editor.foreground': '#FFFFFF',
          'editorLineNumber.foreground': '#747C80',
          'editorLineNumber.activeForeground': '#C6C6C6',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editor.lineHighlightBackground': '#FFFFFF05',
          'editor.lineHighlightBorder': '#00000000',
        }
      });

      monacoEditor = monaco.editor.create(document.getElementById('editor-area'), {
        value: initialValue,
        language: 'lua',
        theme: 'deltaTheme',
        fontSize: 11,
        minimap: { enabled: true, maxColumn: 60 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 5, bottom: 5 },
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        lineHeight: 16,
        letterSpacing: 0,
        roundedSelection: true,
        folding: true,
        foldingHighlight: true,
        showFoldingControls: 'mouseover',
        matchBrackets: 'always',
        bracketPairColorization: {
          enabled: true
        }
      });

      monacoEditor.onDidChangeModelContent(() => {
        const content = monacoEditor.getValue();
        this.tabManager.updateCurrentTabContent(content);
      });

      console.log('Monaco Editor initialized successfully');
    });
  }
}

class App {
  constructor() {
    this.tabManager = new TabManager();
    this.navigationManager = new NavigationManager();
    this.filterManager = new FilterManager();
    this.windowController = new WindowController();
    this.actionButtons = new ActionButtons(this.tabManager);
    this.monacoManager = new MonacoEditorManager(this.tabManager);
    this.init();
  }

  init() {
    const addTabBtn = document.getElementById('add-tab-btn');
    addTabBtn.addEventListener('click', () => {
      this.tabManager.addTab();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Delta Remake - Initializing...');
  new App();
  console.log('Delta Remake - Ready!');
});
