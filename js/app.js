// 梗百科 - 主应用逻辑
(function () {
  'use strict';

  // ========== State ==========
  const state = {
    currentPage: 'home',
    searchQuery: '',
    currentResult: null,
    isLoading: false,
    voiceListening: false,
  };

  // ========== DOM 缓存 ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ========== Init ==========
  function init() {
    applyTheme();
    renderHotTags();
    renderHistory();
    renderFavorites();
    renderHotRank();
    setupNavigation();
    setupSearch();
    setupVoice();
    setupThemeToggle();
    setupInstallPrompt();
    navigateTo(state.currentPage);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  // ========== Theme ==========
  function applyTheme() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    applyTheme();
    showToast(next === 'dark' ? '已切换为暗色模式' : '已切换为亮色模式');
  }

  function setupThemeToggle() {
    const toggle = $('#themeToggleBtn');
    if (toggle) toggle.addEventListener('click', toggleTheme);
  }

  // ========== Navigation ==========
  function setupNavigation() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        navigateTo(page);
      });
    });
  }

  function navigateTo(page, data) {
    state.currentPage = page;
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = $(`#page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navEl = $(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    if (page === 'home') {
      renderHistory();
      $('#searchInput')?.focus();
    } else if (page === 'hot') {
      renderHotRank();
    } else if (page === 'fav') {
      renderFavorites();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ========== Search ==========
  function setupSearch() {
    const input = $('#searchInput');
    const btn = $('#searchBtn');
    const resultInput = $('#resultSearchInput');
    const resultBtn = $('#resultSearchBtn');

    const doSearch = () => {
      const q = (state.currentPage === 'result' ? resultInput : input)?.value.trim();
      if (!q) return;
      performSearch(q);
    };

    [input, resultInput].forEach(el => {
      if (el) el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
      });
    });

    btn?.addEventListener('click', doSearch);
    resultBtn?.addEventListener('click', doSearch);
  }

  async function performSearch(query) {
    if (state.isLoading) return;
    state.isLoading = true;
    state.searchQuery = query;
    showLoading();

    try {
      const result = await AIEngine.generateExplanation(query);
      state.currentResult = result;
      Storage.addHistory(query);
      navigateTo('result', result);
      renderResult(result);
    } catch (err) {
      showToast('解释生成失败，请重试');
    } finally {
      state.isLoading = false;
      hideLoading();
    }
  }

  // ========== Result Rendering ==========
  function renderResult(data) {
    const el = $('#resultContent');
    if (!el) return;

    const isFav = Storage.isFavorite(data.word);

    el.innerHTML = `
      <div class="result-card">
        <div class="result-word">${escapeHtml(data.word)}</div>
        <span class="result-source-tag ${data.source}">
          ${data.source === 'knowledge_base' ? '知识库' : data.source === 'web_search' ? '联网搜索' : data.source === 'api' ? 'AI 大模型' : 'AI 生成'}
        </span>
        ${data.justGrown ? '<span class="result-source-tag grown">🌱 已自动入库</span>' : ''}

        <div class="result-section">
          <div class="result-label">含义解释</div>
          <div class="result-content">${escapeHtml(data.meaning)}</div>
        </div>

        <div class="result-section">
          <div class="result-label">来源出处</div>
          <div class="result-content">${escapeHtml(data.origin)}</div>
        </div>

        <div class="result-section">
          <div class="result-label">使用场景</div>
          <div class="result-content">${escapeHtml(data.example)}</div>
        </div>

        ${data.tags && data.tags.length > 0 ? `
        <div class="result-section">
          <div class="result-label">分类标签</div>
          <div class="result-tags">
            ${data.tags.map(t => `<span class="result-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>` : ''}

        <div class="result-actions">
          <button class="action-btn ${isFav ? 'favorited' : ''}" onclick="App.toggleFav('${escapeAttr(data.word)}')">
            <span>${isFav ? '★' : '☆'}</span>
            ${isFav ? '已收藏' : '收藏'}
          </button>
          <button class="action-btn" onclick="App.sharePoster('${escapeAttr(data.word)}')">
            <span>📋</span> 分享
          </button>
        </div>
      </div>

      ${data.related && data.related.length > 0 ? `
      <div class="related-section">
        <div class="section-title">相关推荐</div>
        <div class="related-list">
          ${data.related.map(w => `
            <div class="related-item" onclick="App.searchWord('${escapeAttr(w)}')">${escapeHtml(w)}</div>
          `).join('')}
        </div>
      </div>` : ''}
    `;

    // Update result search input
    const resultInput = $('#resultSearchInput');
    if (resultInput) resultInput.value = data.word;
  }

  // ========== Hot Tags ==========
  function renderHotTags() {
    const el = $('#hotTags');
    if (!el) return;

    const words = KnowledgeBase.getHotWords();
    const hotOnes = ['YYDS', '破防', 'emo', '内卷', '摆烂', '绝绝子', '凡尔赛', 'pua'];
    const newOnes = ['松弛感', '显眼包', '社恐'];

    el.innerHTML = words.map(w => {
      let cls = 'tag';
      if (hotOnes.includes(w)) cls += ' hot';
      else if (newOnes.includes(w)) cls += ' new';
      return `<span class="${cls}" onclick="App.searchWord('${escapeAttr(w)}')">${escapeHtml(w)}</span>`;
    }).join('');
  }

  // ========== Hot Rank ==========
  function renderHotRank() {
    const el = $('#hotRankList');
    const statsEl = $('#kbStats');
    if (!el) return;

    // 显示知识库统计
    const stats = KnowledgeBase.getStats();
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="kb-stats">
          <div class="kb-stat-item">
            <div class="kb-stat-num">${stats.totalEntries}</div>
            <div class="kb-stat-label">总词条</div>
          </div>
          <div class="kb-stat-item">
            <div class="kb-stat-num">${stats.seedEntries}</div>
            <div class="kb-stat-label">种子词</div>
          </div>
          <div class="kb-stat-item grow">
            <div class="kb-stat-num">${stats.grownEntries}</div>
            <div class="kb-stat-label">自生长</div>
          </div>
          <div class="kb-stat-item">
            <div class="kb-stat-num">${stats.totalSearches}</div>
            <div class="kb-stat-label">总搜索</div>
          </div>
        </div>
      `;
    }

    const words = KnowledgeBase.getHotWords();
    el.innerHTML = words.slice(0, 15).map((w, i) => {
      const numCls = i < 3 ? `top-${i + 1}` : '';
      const allEntries = KnowledgeBase.getAll();
      const entry = allEntries[w];
      const isSeed = entry && !entry.grownAt; // 种子词没有 grownAt
      return `
        <div class="rank-item" onclick="App.searchWord('${escapeAttr(w)}')">
          <div class="rank-num ${numCls}">${i + 1}</div>
          <div class="rank-info">
            <div class="rank-word">${escapeHtml(w)} ${isSeed ? '' : '<span class="grown-badge">🌱</span>'}</div>
            <div class="rank-desc">${escapeHtml(((entry?.meaning) || '').slice(0, 50))}...</div>
          </div>
          <div class="rank-arrow">›</div>
        </div>
      `;
    }).join('');
  }

  // ========== History ==========
  function renderHistory() {
    const el = $('#historyList');
    if (!el) return;

    const history = Storage.getHistory();
    if (history.length === 0) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = history.slice(0, 8).map(w => `
      <div class="history-item" onclick="App.searchWord('${escapeAttr(w)}')">
        ${escapeHtml(w)}
        <span class="history-remove" onclick="event.stopPropagation(); App.removeHistoryItem('${escapeAttr(w)}')">×</span>
      </div>
    `).join('');
  }

  function clearHistory() {
    Storage.clearHistory();
    renderHistory();
    showToast('搜索历史已清空');
  }

  function removeHistoryItem(word) {
    Storage.removeHistory(word);
    renderHistory();
  }

  // ========== Favorites ==========
  function renderFavorites() {
    const listEl = $('#favList');
    const emptyEl = $('#favEmpty');
    if (!listEl || !emptyEl) return;

    const favs = Storage.getFavoriteList();
    if (favs.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = favs.map(f => `
      <div class="fav-item" onclick="App.searchWord('${escapeAttr(f.word)}')">
        <div class="rank-num">★</div>
        <div class="fav-info" style="flex:1;min-width:0;">
          <div class="fav-word">${escapeHtml(f.word)}</div>
          <div class="fav-desc">${escapeHtml((f.meaning || '').slice(0, 60))}</div>
        </div>
        <div class="rank-arrow">›</div>
      </div>
    `).join('');
  }

  function toggleFav(word) {
    if (!state.currentResult || state.currentResult.word !== word) return;
    const isFav = Storage.toggleFavorite(word, {
      meaning: state.currentResult.meaning,
      origin: state.currentResult.origin,
      example: state.currentResult.example,
      tags: state.currentResult.tags,
    });
    renderResult(state.currentResult);
    showToast(isFav ? '已加入收藏' : '已取消收藏');
  }

  // ========== Voice ==========
  function setupVoice() {
    const btn = $('#voiceBtn');
    if (!btn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      btn.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.continuous = false;

    btn.addEventListener('click', () => {
      if (state.voiceListening) {
        recognition.stop();
        return;
      }

      state.voiceListening = true;
      btn.classList.add('listening');
      btn.querySelector('.voice-icon').textContent = '🔴';
      showToast('正在聆听...');

      try { recognition.start(); } catch { /* already started */ }
    });

    recognition.addEventListener('result', (e) => {
      const transcript = e.results[0][0].transcript.trim();
      const input = $('#searchInput');
      if (input) {
        input.value = transcript;
        input.focus();
      }
      showToast(`识别结果: ${transcript}`);
    });

    recognition.addEventListener('end', () => {
      state.voiceListening = false;
      btn.classList.remove('listening');
      btn.querySelector('.voice-icon').textContent = '🎤';
    });

    recognition.addEventListener('error', () => {
      state.voiceListening = false;
      btn.classList.remove('listening');
      btn.querySelector('.voice-icon').textContent = '🎤';
      showToast('语音识别失败，请重试');
    });
  }

  // ========== Share Poster ==========
  function sharePoster(word) {
    if (!state.currentResult) return;
    const data = state.currentResult;

    // Create a simple share card
    const posterHtml = `
【梗百科 · AI热词解码器】
━━━━━━━━━━━━━━━━
📌 ${data.word}

📖 含义:
${data.meaning}

📚 出处:
${data.origin}

💬 例句:
"${data.example}"

${data.tags ? '🏷 ' + data.tags.join(' · ') : ''}
━━━━━━━━━━━━━━━━
来自「梗百科」- 不懂任何词，来这就对了`;

    if (navigator.share) {
      navigator.share({
        title: `梗百科 - ${data.word}是什么意思？`,
        text: posterHtml,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(posterHtml).then(() => {
        showToast('解释卡片已复制到剪贴板');
      }).catch(() => {
        showToast('分享失败，请重试');
      });
    }
  }

  // ========== Loading ==========
  function showLoading() {
    let overlay = $('#loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">AI正在解码中...</div>
        <div class="loading-sub">查阅资料、分析语义、生成解释</div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  function hideLoading() {
    const overlay = $('#loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // ========== Toast ==========
  function showToast(msg) {
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ========== PWA Install ==========
  function setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install prompt after a delay
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          showInstallPrompt();
        }
      }, 5000);
    });

    window.addEventListener('appinstalled', () => {
      hideInstallPrompt();
      deferredPrompt = null;
      showToast('安装成功！可在桌面找到梗百科');
    });

    // Install button
    $('#installBtn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideInstallPrompt();
      }
    });

    $('#installClose')?.addEventListener('click', hideInstallPrompt);
  }

  function showInstallPrompt() {
    const el = $('#installPrompt');
    if (el) el.classList.add('show');
  }

  function hideInstallPrompt() {
    const el = $('#installPrompt');
    if (el) el.classList.remove('show');
  }

  // ========== API Settings ==========
  function loadApiConfig() {
    const config = Storage.getApiConfig();
    if (config) {
      const input = $('#apiKeyInput');
      const provider = $('#apiProvider');
      const baseUrl = $('#apiBaseUrl');
      const model = $('#apiModel');
      if (input) input.value = config.apiKey || '';
      if (provider) provider.value = config.provider || 'deepseek';
      if (baseUrl) baseUrl.value = config.baseUrl || '';
      if (model) model.value = config.model || '';
      handleProviderChange();
    }
    updateApiStatus();
  }

  function openApiSettings() {
    const modal = $('#apiModal');
    if (modal) {
      loadApiConfig();
      modal.style.display = 'flex';
    }
  }

  function closeApiSettings() {
    const modal = $('#apiModal');
    if (modal) modal.style.display = 'none';
  }

  function toggleApiKeyVisibility() {
    const input = $('#apiKeyInput');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      $('#apiKeyToggle').textContent = '🙈';
    } else {
      input.type = 'password';
      $('#apiKeyToggle').textContent = '👁';
    }
  }

  function handleProviderChange() {
    const provider = $('#apiProvider')?.value;
    const customFields = $('#customFields');
    const baseUrl = $('#apiBaseUrl');
    const model = $('#apiModel');
    if (!customFields || !baseUrl || !model) return;

    if (provider === 'custom') {
      customFields.style.display = 'block';
      if (!baseUrl.value) baseUrl.value = 'https://api.deepseek.com';
      if (!model.value) model.value = 'deepseek-chat';
    } else if (provider === 'deepseek') {
      customFields.style.display = 'none';
      baseUrl.value = 'https://api.deepseek.com';
      model.value = 'deepseek-chat';
    } else if (provider === 'openai') {
      customFields.style.display = 'none';
      baseUrl.value = 'https://api.openai.com/v1';
      model.value = 'gpt-4o';
    }
  }

  function saveApiKey() {
    const apiKey = $('#apiKeyInput')?.value.trim();
    const provider = $('#apiProvider')?.value;
    const baseUrl = $('#apiBaseUrl')?.value.trim();
    const model = $('#apiModel')?.value.trim();

    if (!apiKey) {
      showToast('请输入 API Key');
      return;
    }

    const config = { apiKey, provider: provider || 'deepseek', baseUrl, model };
    Storage.setApiConfig(config);

    // Test connectivity
    testApiConnection(config);
    closeApiSettings();
  }

  async function testApiConnection(config) {
    updateApiStatusDot('checking');
    showToast('正在测试 API 连接...');

    try {
      const resp = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (resp.ok) {
        updateApiStatusDot('online');
        showToast('API 连接成功！');
      } else if (resp.status === 401) {
        updateApiStatusDot('offline');
        showToast('API Key 无效，请检查');
      } else if (resp.status === 402) {
        updateApiStatusDot('offline');
        showToast('API 余额不足，请充值');
      } else {
        updateApiStatusDot('offline');
        showToast(`连接失败 (${resp.status})`);
      }
    } catch (err) {
      updateApiStatusDot('offline');
      showToast('API 连接失败，请检查网络或地址');
    }
  }

  function clearApiKey() {
    Storage.clearApiConfig();
    const input = $('#apiKeyInput');
    if (input) input.value = '';
    updateApiStatusDot('offline');
    updateApiStatus();
    showToast('API Key 已清除');
  }

  function updateApiStatusDot(status) {
    const dot = $('#apiStatusDot');
    if (!dot) return;
    dot.className = 'api-dot ' + status;
  }

  function updateApiStatus() {
    const config = Storage.getApiConfig();
    const bar = $('#apiStatusBar');
    const dot = $('#apiStatusDot');

    if (config && config.apiKey) {
      if (bar) {
        bar.className = 'api-status-bar success';
        bar.innerHTML = `<span class="api-status-text">状态：已配置 (${config.provider === 'deepseek' ? 'DeepSeek' : config.provider === 'openai' ? 'OpenAI' : '自定义'})</span>`;
      }
      updateApiStatusDot('online');
    } else {
      if (bar) {
        bar.className = 'api-status-bar';
        bar.innerHTML = '<span class="api-status-text">状态：未配置</span>';
      }
      updateApiStatusDot('offline');
    }
  }

  // ========== Utility ==========
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ========== Public API ==========
  window.App = {
    navigateTo,
    searchWord: (word) => {
      const input = $('#searchInput');
      if (input) input.value = word;
      performSearch(word);
    },
    toggleFav,
    removeHistoryItem,
    clearHistory,
    sharePoster,
    openApiSettings,
    closeApiSettings,
    toggleApiKeyVisibility,
    saveApiKey,
    clearApiKey,
  };

  // ========== Start ==========
  document.addEventListener('DOMContentLoaded', () => {
    init();

    // Provider dropdown change
    $('#apiProvider')?.addEventListener('change', handleProviderChange);

    // Load saved API config on startup
    updateApiStatus();

    // Back button handler
    $('#resultBackBtn')?.addEventListener('click', () => {
      navigateTo('home');
    });
  });

})();
