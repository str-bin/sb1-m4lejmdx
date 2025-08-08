import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder, Link } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { isValidUrl } from '../../lib/utils'
import { toast } from 'sonner'

// 动态表单 schema
const createFormSchema = (isFolder: boolean) => {
  const baseSchema = {
    title: z.string().min(1, '请输入标题'),
    category: z.string().optional(),
  }

  if (isFolder) {
    return z.object(baseSchema)
  } else {
    return z.object({
      ...baseSchema,
      url: z.string().min(1, '请输入URL').refine(isValidUrl, '请输入有效的URL'),
    })
  }
}

type FormData = {
  title: string
  url?: string
  category?: string
}

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddBookmarkDialog: React.FC<AddBookmarkDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isFolder, setIsFolder] = useState(false)
  const { addBookmark, categories } = useBookmarkStore()
  
  const form = useForm<FormData>({
    resolver: zodResolver(createFormSchema(isFolder)),
    defaultValues: {
      title: '',
      url: '',
      category: '',
    },
  })

  const onSubmit = (data: FormData) => {
    if (isFolder) {
      addBookmark({
        title: data.title,
        url: '', // 文件夹不需要 URL
        category: data.category || undefined,
        tags: [],
        isFolder: true,
        children: [],
      })
      toast.success(`已创建文件夹 "${data.title}"`)
    } else {
      addBookmark({
        title: data.title,
        url: data.url!,
        category: data.category || undefined,
        tags: [],
        isFolder: false,
      })
      toast.success(`已添加书签 "${data.title}"`)
    }
    
    form.reset()
    setIsFolder(false)
    onOpenChange(false)
  }

  const handleUrlBlur = async (url: string) => {
    if (!url || !isValidUrl(url) || isFolder) return

    try {
      // 尝试获取页面标题
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      const title = doc.querySelector('title')?.textContent

      if (title && !form.getValues('title')) {
        form.setValue('title', title.trim())
      }
    } catch (error) {
      // 忽略错误，用户可以手动输入标题
    }
  }

  const handleTypeChange = (newIsFolder: boolean) => {
    setIsFolder(newIsFolder)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isFolder ? '创建新文件夹' : '添加新书签'}
          </DialogTitle>
        </DialogHeader>
        
        {/* 类型切换 */}
        <div className="flex space-x-2 p-2 bg-muted rounded-lg">
          <Button
            type="button"
            variant={!isFolder ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => handleTypeChange(false)}
          >
            <Link className="w-4 h-4 mr-2" />
            书签
          </Button>
          <Button
            type="button"
            variant={isFolder ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => handleTypeChange(true)}
          >
            <Folder className="w-4 h-4 mr-2" />
            文件夹
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!isFolder && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        onBlur={(e) => handleUrlBlur(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isFolder ? "文件夹名称" : "书签标题"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类（可选）" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" className="flex-1">
                {isFolder ? '创建文件夹' : '添加书签'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddBookmarkDialog