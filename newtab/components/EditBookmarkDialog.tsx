import React, { useEffect } from 'react'
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
import type { Bookmark } from '../../types/bookmark'
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

interface EditBookmarkDialogProps {
  bookmark: Bookmark
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EditBookmarkDialog: React.FC<EditBookmarkDialogProps> = ({
  bookmark,
  open,
  onOpenChange,
}) => {
  const { updateBookmark, categories } = useBookmarkStore()
  const isFolder = bookmark.isFolder || false
  
  const form = useForm<FormData>({
    resolver: zodResolver(createFormSchema(isFolder)),
    defaultValues: {
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: bookmark.title,
        url: bookmark.url,
        category: bookmark.category || '',
      })
    }
  }, [bookmark, open, form])

  const onSubmit = (data: FormData) => {
    const updates: Partial<Bookmark> = {
      title: data.title,
      category: data.category || undefined,
    }

    if (!isFolder) {
      updates.url = data.url!
    }

    updateBookmark(bookmark.id, updates)
    
    toast.success(`已更新${isFolder ? '文件夹' : '书签'} "${data.title}"`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isFolder ? '编辑文件夹' : '编辑书签'}
          </DialogTitle>
        </DialogHeader>
        
        {/* 类型指示器 */}
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
          {isFolder ? (
            <>
              <Folder className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">文件夹</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">书签</span>
            </>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {!isFolder && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网址</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                      <SelectItem value="">无分类</SelectItem>
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
                保存更改
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditBookmarkDialog