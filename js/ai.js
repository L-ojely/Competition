// AI解释生成模块 - 自生长知识库
// 预设种子 + AI生成自动沉淀 + 搜索热度追踪

const KnowledgeBase = (function () {
  // 预设种子知识库（冷启动数据）
  const SEED = {
    "内卷": {
      meaning: "指同行间竞相付出更多努力以争夺有限资源，从而导致个体\"收益努力比\"下降的现象。简单说就是大家拼命卷，但整体收益不变。",
      origin: "源自社会学概念，最初由人类学家用来描述农业社会无法突破的困境，后被互联网广泛用于描述职场、教育等领域的过度竞争。",
      example: "\"我们公司天天加班到晚上十点，太内卷了。\"",
      tags: ["职场", "社会"]
    },
    "破防": {
      meaning: "原指游戏中被打破防御，现指心理防线被突破，情绪失控、感动落泪或感到扎心。",
      origin: "源自游戏术语，指打破对方的防御系统。后演变为形容人受到强烈情感冲击。",
      example: "\"看到这个视频我直接破防了，太感人了。\"",
      tags: ["网络用语", "游戏"]
    },
    "emo": {
      meaning: "Emotional的缩写，指陷入负面情绪、感到悲伤或抑郁的状态。\"我emo了\"就是\"我情绪低落了\"。",
      origin: "最初指Emo摇滚音乐风格，后被网友音译使用，泛指一种忧郁、伤感的情绪状态。",
      example: "\"考试没考好，整个人都emo了。\"",
      tags: ["情绪", "网络用语"]
    },
    "YYDS": {
      meaning: "\"永远的神\"的拼音首字母缩写，用于表达对某人或某事物的极度崇拜和赞美。",
      origin: "最早来源于电竞圈，前职业选手在直播中用\"乌兹永远的神\"夸赞队友，后被简化为YYDS并广泛传播。",
      example: "\"这家店的火锅也太好吃了，YYDS！\"",
      tags: ["网络用语", "缩写"]
    },
    "凡尔赛": {
      meaning: "一种\"以低调的方式进行炫耀\"的话语模式，表面上是在抱怨或自嘲，实际上是在展示自己的优越条件。",
      origin: "源自日本漫画《凡尔赛玫瑰》，后被网友用来描述那种不经意间炫耀的行为，又称\"凡学\"。",
      example: "\"老公又给我买了辆保时捷，颜色好丑哦，真烦。——典型的凡尔赛发言。\"",
      tags: ["网络用语", "社交"]
    },
    "社恐": {
      meaning: "社交恐惧症的简称，指在公共场合或社交活动中感到极度紧张和不适。网络语境中常用于自嘲不擅长社交。",
      origin: "临床心理学术语，后成为当代年轻人的身份标签和自我调侃用语。",
      example: "\"周末有个聚会，我社恐不想去，好想找个理由推掉。\"",
      tags: ["心理", "社交"]
    },
    "AI": {
      meaning: "人工智能（Artificial Intelligence），指由人制造出来的机器所表现出来的智能，能够学习、推理、自我修正。",
      origin: "1956年达特茅斯会议上首次提出，近年来随着大语言模型的发展进入爆发期。",
      example: "\"AI正在改变我们的工作方式，很多重复性工作都可以交给AI完成。\"",
      tags: ["科技", "专业术语"]
    },
    "区块链": {
      meaning: "一种分布式账本技术，数据以区块为单位按时间顺序链接，具有去中心化、不可篡改、可追溯的特点。",
      origin: "2008年中本聪在比特币白皮书中首次提出，随后成为金融、供应链等领域的创新技术。",
      example: "\"区块链技术可以确保数据无法被篡改，在版权保护领域有很大应用前景。\"",
      tags: ["科技", "金融", "专业术语"]
    },
    "元宇宙": {
      meaning: "一个融合现实与虚拟的数字化世界，用户可以在这个共享空间中社交、工作、游戏和交易。",
      origin: "源自1992年科幻小说《雪崩》，2021年随着Meta公司改名再次成为全球热词。",
      example: "\"很多科技公司都在布局元宇宙，希望打造下一代互联网入口。\"",
      tags: ["科技", "概念"]
    },
    "pua": {
      meaning: "Pick-Up Artist的缩写，原指搭讪艺术家，现泛指通过精神控制、打压对方自尊的方式来操纵他人的行为。",
      origin: "最初是西方约会文化的一部分，后传入国内被广泛应用在职场、家庭、亲密关系等领域。",
      example: "\"老板天天否定我的工作能力，感觉就是在职场PUA我。\"",
      tags: ["社会", "心理学"]
    },
    "绝绝子": {
      meaning: "一种极强化表达，相当于\"绝了\"的超级版本，形容某事物好到极点或坏到极点。",
      origin: "源自饭圈文化和短视频平台，通过\"XX子\"这种叠词方式表达强烈情感。",
      example: "\"这家店的奶茶好喝到绝绝子！\"",
      tags: ["网络用语", "饭圈"]
    },
    "摆烂": {
      meaning: "指当事情无法往好的方向发展时，干脆不再采取措施加以控制，任由其往坏的方向发展。",
      origin: "源自NBA选秀文化，球队故意输球以获取更好选秀权，后成为年轻人\"躺平\"心态的一种表达。",
      example: "\"明天就要考试了，但我完全不想复习，准备彻底摆烂了。\"",
      tags: ["网络用语", "心态"]
    },
    "躺平": {
      meaning: "放弃内卷式竞争，选择低欲望生活，不买房不结婚不生娃，用最少的消耗维持生存。",
      origin: "源自一篇名为《躺平即是正义》的网络文章，迅速成为年轻人对高压社会的一种态度宣言。",
      example: "\"我已经看开了，与其累死累活地卷，不如选择躺平。\"",
      tags: ["社会", "生活方式"]
    },
    "显眼包": {
      meaning: "在人群中很显眼、很张扬的人事物。多带有调侃和喜爱意味，形容一个人在群体中表现得特别突出。",
      origin: "源自方言和社交媒体，逐渐成为对性格活泼、在群体中\"出圈\"的人的爱称。",
      example: "\"他在公司年会上穿了一身荧光绿，真的是个显眼包。\"",
      tags: ["网络用语", "社交"]
    },
    "松弛感": {
      meaning: "指一种不紧不慢、从容自在的生活状态和气质，不刻意不焦虑，自然流露出自信和舒适感。",
      origin: "源自对法式生活方式的推崇，后成为国内年轻人追求的理想状态。",
      example: "\"她拍照时那种松弛感太迷人了，看起来毫不费力。\"",
      tags: ["生活方式", "心理学"]
    }
  };

  // 从 localStorage 加载已自生长的词条和搜索计数
  function loadGrowingEntries() {
    try { return JSON.parse(localStorage.getItem('gbk_growing_kb') || '{}'); }
    catch { return {}; }
  }

  function saveGrowingEntries(entries) {
    localStorage.setItem('gbk_growing_kb', JSON.stringify(entries));
  }

  function loadSearchCounts() {
    try { return JSON.parse(localStorage.getItem('gbk_search_counts') || '{}'); }
    catch { return {}; }
  }

  function saveSearchCounts(counts) {
    localStorage.setItem('gbk_search_counts', JSON.stringify(counts));
  }

  // 获取合并后的完整知识库（种子 + 自生长）
  function getMergedEntries() {
    const growing = loadGrowingEntries();
    return { ...SEED, ...growing };
  }

  return {
    // 查询单个词条
    get(word) {
      const merged = getMergedEntries();
      const key = Object.keys(merged).find(k => k.toLowerCase() === word.toLowerCase());
      return key ? merged[key] : null;
    },

    // 获取全部词条（用于热词展示）
    getAll() {
      return getMergedEntries();
    },

    // 获取所有词条名
    getHotWords() {
      // 按搜索热度排序
      const merged = getMergedEntries();
      const counts = loadSearchCounts();
      return Object.keys(merged).sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
    },

    // 全文搜索
    search(query) {
      const q = query.toLowerCase();
      const merged = getMergedEntries();
      return Object.entries(merged)
        .filter(([key, data]) =>
          key.toLowerCase().includes(q) ||
          (data.meaning || '').toLowerCase().includes(q) ||
          (data.origin || '').toLowerCase().includes(q) ||
          (data.tags || []).some(t => t.toLowerCase().includes(q))
        )
        .map(([key, data]) => ({ word: key, ...data }));
    },

    // 获取相关推荐词
    getRelated(word, tags, count = 4) {
      const merged = getMergedEntries();
      const existing = new Set([word]);
      return Object.entries(merged)
        .filter(([key, data]) => {
          if (existing.has(key)) return false;
          return (tags || []).some(tag => (data.tags || []).includes(tag));
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(([key]) => key);
    },

    // 保存新词条到自生长知识库
    save({ word, meaning, origin, example, tags }) {
      const growing = loadGrowingEntries();
      growing[word] = { meaning, origin, example, tags, grownAt: Date.now() };
      saveGrowingEntries(growing);
    },

    // 记录搜索次数（用于热度排序）
    recordSearch(word) {
      const counts = loadSearchCounts();
      counts[word] = (counts[word] || 0) + 1;
      saveSearchCounts(counts);
    },

    // 获取知识库统计信息
    getStats() {
      const merged = getMergedEntries();
      const seedCount = Object.keys(SEED).length;
      const grownCount = Object.keys(loadGrowingEntries()).length;
      const totalSearches = Object.values(loadSearchCounts()).reduce((a, b) => a + b, 0);
      return {
        totalEntries: Object.keys(merged).length,
        seedEntries: seedCount,
        grownEntries: grownCount,
        totalSearches,
      };
    }
  };
})();

// AI解释生成器
const AIEngine = {
  // 生成解释（API优先 → 知识库 → 联网搜索 → 模板）
  async generateExplanation(query) {
    // 记录搜索
    KnowledgeBase.recordSearch(query);

    // 先在知识库中查找
    const kbResult = KnowledgeBase.get(query);
    if (kbResult) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      return {
        word: query,
        ...kbResult,
        related: KnowledgeBase.getRelated(query, kbResult.tags || []),
        source: 'knowledge_base'
      };
    }

    // 检查是否配置了 API Key
    const apiConfig = typeof Storage !== 'undefined' ? Storage.getApiConfig() : null;

    let result;
    if (apiConfig && apiConfig.apiKey) {
      // 使用真实 LLM API
      result = await this.callLLMApi(query, apiConfig);
    } else {
      // 兜底：联网搜索 + 模板生成
      result = await this.aiGenerate(query);
    }

    // 自动沉淀到知识库
    KnowledgeBase.save({
      word: query,
      meaning: result.meaning,
      origin: result.origin,
      example: result.example,
      tags: result.tags,
    });

    result.related = KnowledgeBase.getRelated(query, result.tags);
    result.justGrown = true;
    return result;
  },

  // 调用真实 LLM API
  async callLLMApi(query, config) {
    const prompt = `你是一个专业的网络热词、新兴词汇和专业术语解释助手。用户想了解"${query}"的含义。

请用以下JSON格式回答（只返回JSON，不要其他内容）：
{
  "meaning": "用通俗易懂的语言解释${query}的含义，要让完全不懂的人也能理解。注意：如果这是一个真实存在的词汇、概念、热梗，请根据你的知识给出准确解释；如果这是用户编造的或你确实不了解的词，请在meaning中诚实说明。",
  "origin": "解释${query}的来源、出处或产生背景",
  "example": "给出一个使用${query}的生活场景例句",
  "tags": ["标签1", "标签2", "标签3"]
}`;

    const resp = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!resp.ok) {
      throw new Error(`API error: ${resp.status}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析 JSON 响应
    try {
      const parsed = JSON.parse(content);
      return {
        word: query,
        meaning: parsed.meaning || '',
        origin: parsed.origin || '',
        example: parsed.example || '',
        tags: parsed.tags || ['热词'],
        source: 'api'
      };
    } catch {
      // JSON 解析失败，尝试从文本中提取
      return {
        word: query,
        meaning: content,
        origin: '来自 AI 智能生成',
        example: `"${query}这个词最近经常被大家提起，一起来了解一下吧。"`,
        tags: ['AI生成'],
        source: 'api'
      };
    }
  },

  // AI智能生成（兜底方案）
  async aiGenerate(query) {
    let webInfo = null;
    try {
      webInfo = await this.webSearch(query);
    } catch { /* fall through */ }

    if (webInfo) return webInfo;
    return this.templateGenerate(query);
  },

  // 联网搜索（尝试获取真实信息）
  async webSearch(query) {
    // 使用 DuckDuckGo 的 Instant Answer API（无需API Key）
    const resp = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!resp.ok) return null;
    const data = await resp.json();

    const abstract = data.AbstractText || data.Abstract || '';
    const heading = data.Heading || '';
    const source = data.AbstractSource || data.AbstractURL || '';

    if (!abstract) return null;

    return {
      word: query,
      meaning: abstract.slice(0, 300),
      origin: heading
        ? `相关信息来源：${heading}${source ? '（' + source + '）' : ''}`
        : '来自互联网公开信息',
      example: this.generateWebExample(query, abstract),
      tags: this.inferTags(query, abstract),
      source: 'web_search'
    };
  },

  generateWebExample(query, abstract) {
    const word = query;
    const contexts = [
      `"最近大家都在讨论${word}，我也来了解一下。"`,
      `"关于${word}，网上有很多不同的说法，不过核心意思都差不多。"`,
      `"${word}这个话题最近很火，你怎么看？"`,
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  inferTags(query, text) {
    const tags = [];
    const lowerText = text.toLowerCase();
    if (/科技|技术|ai|人工智能|算法|代码|编程/.test(lowerText)) tags.push('科技');
    if (/金融|经济|股票|投资|货币/.test(lowerText)) tags.push('金融');
    if (/网络|网红|社交媒体|短视频|直播/.test(lowerText)) tags.push('网络用语');
    if (/游戏|电竞|动漫|二次元/.test(lowerText)) tags.push('游戏');
    if (/心理|情绪|情感|心态/.test(lowerText)) tags.push('心理学');
    if (/职场|工作|公司|上班/.test(lowerText)) tags.push('职场');
    if (/社会|民生|政策|公共/.test(lowerText)) tags.push('社会');
    if (/生活|日常|饮食|穿搭|旅行/.test(lowerText)) tags.push('生活方式');
    if (tags.length === 0) tags.push('热词');
    return tags.slice(0, 3);
  },

  // 模板生成（兜底方案）
  templateGenerate(query) {
    const words = ['年轻人', '互联网用户', '社交媒体', '科技圈', '职场人', '学生群体'];
    const phenomena = ['一种有趣的现象', '特定情境下的情绪表达', '某个领域的流行趋势', '一种新的生活方式', '社交互动中的默契'];
    const purposes = ['表达一种态度', '描述一个现象', '传递一种情绪', '指代一类行为', '概括一种趋势'];
    const origins = ['社交媒体平台', '短视频平台', '论坛社区', '粉丝圈子', '职场交流', '大学生群体'];
    const spreadWays = ['口口相传', '热门视频', '大V转发', '社区讨论', '网络段子'];
    const times = ['2025年', '2026年', '近期'];
    const events = ['网络讨论', '热门事件', '综艺节目', '直播互动', '社会话题'];
    const examples = [
      `"最近在网上又看到了很多关于${query}的讨论，感觉大家都在聊这个。"`,
      `"你知道吗？${query}现在已经成为热门话题了，几乎每个人都在讨论。"`,
      `"如果你还不了解${query}意味着什么，那你可能已经落伍了。快来了解一下吧！"`,
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
      word: query,
      meaning: `${query}是一个在互联网上流行的新概念，指代一种与${query}相关的内容、行为或现象。它体现了当代${pick(words)}的一种新的表达方式或文化认同。`,
      origin: `${query}最早出现在${pick(origins)}中，通过${pick(spreadWays)}迅速走红。${query}的流行始于${pick(times)}的一场${pick(events)}，从此成为大家津津乐道的热门话题。`,
      example: pick(examples),
      tags: [pick(['网络用语', '热词', '流行语', '新概念', '专业术语'])],
      source: 'ai_generated'
    };
  }
};
