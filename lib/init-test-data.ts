import type { Bookmark } from '../types/bookmark'

// 测试数据
export const testBookmarks: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // 文件夹
  {
    title: '开发工具',
    url: '',


    isFolder: true,
    children: [
      {
        id: 'child-1',
        title: 'GitHub',
        url: 'https://github.com',
    

        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-2',
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',


        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-3',
        title: 'Figma',
        url: 'https://figma.com',


        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-4',
        title: 'VS Code',
        url: 'https://code.visualstudio.com',


        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      }
    ],
  },
  {
    title: '学习资源',
    url: '',
 

    isFolder: true,
    children: [
      {
        id: 'child-5',
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',


        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-6',
        title: 'W3Schools',
        url: 'https://www.w3schools.com',


        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: false,
      },
      {
        id: 'child-7',
        title: 'CSS-Tricks',
        url: 'https://css-tricks.com',


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
 

    isFolder: false,
  },
  {
    title: 'YouTube',
    url: 'https://youtube.com',
     

    isFolder: false,
  },
  {
    title: 'Figma',
    url: 'https://figma.com',
 

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