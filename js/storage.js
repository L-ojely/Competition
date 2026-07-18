// 存储管理模块 - localStorage封装
const Storage = {
  // 搜索历史
  getHistory() {
    try { return JSON.parse(localStorage.getItem('gbk_history') || '[]'); }
    catch { return []; }
  },
  addHistory(word) {
    let list = this.getHistory();
    list = list.filter(w => w !== word);
    list.unshift(word);
    if (list.length > 30) list = list.slice(0, 30);
    localStorage.setItem('gbk_history', JSON.stringify(list));
    return list;
  },
  clearHistory() {
    localStorage.removeItem('gbk_history');
  },
  removeHistory(word) {
    let list = this.getHistory().filter(w => w !== word);
    localStorage.setItem('gbk_history', JSON.stringify(list));
    return list;
  },

  // 收藏
  getFavorites() {
    try { return JSON.parse(localStorage.getItem('gbk_favorites') || '{}'); }
    catch { return {}; }
  },
  toggleFavorite(word, data) {
    const favs = this.getFavorites();
    if (favs[word]) {
      delete favs[word];
      localStorage.setItem('gbk_favorites', JSON.stringify(favs));
      return false;
    } else {
      favs[word] = { ...data, savedAt: Date.now() };
      localStorage.setItem('gbk_favorites', JSON.stringify(favs));
      return true;
    }
  },
  isFavorite(word) {
    return !!this.getFavorites()[word];
  },
  getFavoriteList() {
    const favs = this.getFavorites();
    return Object.entries(favs)
      .sort((a, b) => b[1].savedAt - a[1].savedAt)
      .map(([word, data]) => ({ word, ...data }));
  },

  // 主题
  getTheme() {
    return localStorage.getItem('gbk_theme') || 'dark';
  },
  setTheme(theme) {
    localStorage.setItem('gbk_theme', theme);
  },

  // API 配置
  getApiConfig() {
    try { return JSON.parse(localStorage.getItem('gbk_api_config') || 'null'); }
    catch { return null; }
  },
  setApiConfig(config) {
    localStorage.setItem('gbk_api_config', JSON.stringify(config));
  },
  clearApiConfig() {
    localStorage.removeItem('gbk_api_config');
  }
};
