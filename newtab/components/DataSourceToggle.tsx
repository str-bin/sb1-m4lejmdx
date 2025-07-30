import React from 'react'
import { Database, Bookmark } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { isBrowserExtension } from '../../lib/utils'
import { toast } from 'sonner'

const DataSourceToggle: React.FC = () => {
  const { dataSource, switchDataSource, isLoading } = useBookmarkStore()

  const handleSwitch = async (type: 'indexeddb' | 'browser') => {
    if (type === dataSource) return

    try {
      await switchDataSource(type)
    } catch (error) {
      toast.error(`切换失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 在网页版中不显示浏览器书签选项
  if (!isBrowserExtension()) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Database className="w-3 h-3 mr-1" />
          本地存储
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={dataSource === 'indexeddb' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSwitch('indexeddb')}
        disabled={isLoading}
        className="h-8"
      >
        <Database className="w-3 h-3 mr-1" />
        本地存储
      </Button>
      
      <Button
        variant={dataSource === 'browser' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSwitch('browser')}
        disabled={isLoading}
        className="h-8"
      >
        <Bookmark className="w-3 h-3 mr-1" />
        浏览器书签
      </Button>
    </div>
  )
}

export default DataSourceToggle 