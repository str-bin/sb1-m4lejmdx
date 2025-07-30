import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const formSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  url: z.string().min(1, '请输入URL').refine(isValidUrl, '请输入有效的URL'),
  category: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddBookmarkDialog: React.FC<AddBookmarkDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addBookmark, categories } = useBookmarkStore()
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      category: '',
    },
  })

  const onSubmit = (data: FormData) => {
    addBookmark({
      title: data.title,
      url: data.url,
      category: data.category || undefined,
      tags: [],
    })
    
    toast.success(`已添加书签 "${data.title}"`)
    form.reset()
    onOpenChange(false)
  }

  const handleUrlBlur = async (url: string) => {
    if (!url || !isValidUrl(url)) return

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新书签</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input placeholder="书签标题" {...field} />
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
                添加书签
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddBookmarkDialog