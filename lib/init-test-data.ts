import type { Bookmark } from '../types/bookmark'

// 测试数据
export const testBookmarks: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // 文件夹
  {
    title: '开发工具',
    url: '',
    category: '2',
    tags: ['开发', '工具'],
    isFolder: true,
    children: [
      {
        id: 'child-1',
        title: 'GitHub',
        url: 'https://github.com',
        category: '2',
        tags: ['代码', '版本控制'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-2',
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        category: '3',
        tags: ['问答', '学习'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-3',
        title: 'Figma',
        url: 'https://figma.com',
        category: '5',
        tags: ['设计', 'UI'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-4',
        title: 'VS Code',
        url: 'https://code.visualstudio.com',
        category: '5',
        tags: ['编辑器', '开发'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      }
    ],
  },
  {
    title: '学习资源',
    url: '',
    category: '3',
    tags: ['学习', '教育'],
    isFolder: true,
    children: [
      {
        id: 'child-5',
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        category: '3',
        tags: ['文档', 'Web开发'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-6',
        title: 'W3Schools',
        url: 'https://www.w3schools.com',
        category: '3',
        tags: ['教程', 'Web开发'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-7',
        title: 'CSS-Tricks',
        url: 'https://css-tricks.com',
        category: '3',
        tags: ['CSS', '前端'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      }
    ],
  },
  // 普通书签
  {
    title: 'Google',
    url: 'https://google.com',
    category: '1',
    tags: ['搜索', '常用'],
    isFolder: false,
  },
  {
    title: 'YouTube',
    url: 'https://youtube.com',
    category: '4',
    tags: ['视频', '娱乐'],
    isFolder: false,
  },
  {
    title: 'Figma',
    url: 'https://figma.com',
    category: '5',
    tags: ['设计', '工具'],
    isFolder: false,
  },
]

// 初始化测试数据的函数
export const initializeTestData = (addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void) => {
  console.log('🚀 开始初始化测试数据...')
  
  for (const bookmarkData of testBookmarks) {
    try {
      addBookmark(bookmarkData)
      console.log(`✅ 已添加: ${bookmarkData.title}`)
    } catch (error) {
      console.error(`❌ 添加失败: ${bookmarkData.title}`, error)
    }
  }
  
  console.log('🎉 测试数据初始化完成！')
} 