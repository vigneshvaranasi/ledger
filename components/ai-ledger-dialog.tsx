'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import {
  Mic,
  Plus,
  Send,
  Square,
  Sparkles,
  Trash2,
  CalendarIcon
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

type Draft = {
  name: string
  amount: number
  date: string
  category?: string | null
  method?: string | null
}
type RecognitionEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
type Recognition = {
  start: () => void
  stop: () => void
  onresult: ((event: RecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  continuous: boolean
  interimResults: boolean
  lang: string
}

export function AiLedgerDialog({
  categories,
  methods
}: {
  categories: string[]
  methods: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<Recognition | null>(null)

  useLayoutEffect(() => {
    if (!open) return

    const { body, documentElement } = document
    const scrollY = window.scrollY
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const previousPosition = body.style.position
    const previousTop = body.style.top
    const previousWidth = body.style.width
    const previousHtmlOverflow = documentElement.style.overflow
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    documentElement.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      body.style.position = previousPosition
      body.style.top = previousTop
      body.style.width = previousWidth
      window.scrollTo(0, scrollY)
    }
  }, [open])

  async function ask() {
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, categories, methods })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not understand that')
      setDrafts(
        (data.transactions || []).map((row: Draft) => ({
          ...row,
          method: row.method || 'UPI'
        }))
      )
      if (!data.transactions?.length)
        toast.info('Describe one or more expenses to create review drafts.')
      if (data.warning) toast.message(data.warning)
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  function speak() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const RecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!RecognitionCtor) {
      toast.error(
        'Speech recognition is not supported in this browser. Please type your entry.'
      )
      return
    }
    const recognition: Recognition = new RecognitionCtor()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = event =>
      setMessage(
        value => `${value}${value ? ' ' : ''}${event.results[0][0].transcript}`
      )
    recognition.onend = () => setListening(false)
    recognition.onerror = () => {
      setListening(false)
      toast.error('I couldn’t hear that. Please try again.')
    }
    setListening(true)
    recognitionRef.current = recognition
    recognition.start()
  }

  function update(index: number, field: keyof Draft, value: string) {
    setDrafts(rows =>
      rows.map((row, i) =>
        i === index
          ? { ...row, [field]: field === 'amount' ? Number(value) : value }
          : row
      )
    )
  }

  function updateCategory(index: number, category: string) {
    setDrafts(rows =>
      rows.map((row, i) =>
        i === index
          ? { ...row, category: category === '__none__' ? null : category }
          : row
      )
    )
  }

  function updateMethod(index: number, method: string) {
    setDrafts(rows =>
      rows.map((row, i) => (i === index ? { ...row, method } : row))
    )
  }

  function updateDate(index: number, date: Date | undefined) {
    if (!date) return
    setDrafts(rows =>
      rows.map((row, i) =>
        i === index ? { ...row, date: format(date, 'yyyy-MM-dd') } : row
      )
    )
  }

  async function addAll() {
    if (!drafts.length) return
    setLoading(true)
    try {
      for (const row of drafts) {
        const res = await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...row,
            type: 'Expense',
            notes: 'Added with AI assistant'
          })
        })
        if (!res.ok)
          throw new Error(
            (await res.json()).error || 'Could not add transaction'
          )
      }
      toast.success(
        `${drafts.length} transaction${drafts.length === 1 ? '' : 's'} added`
      )
      setDrafts([])
      setMessage('')
      setOpen(false)
      router.refresh()
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Could not add transactions'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline'>
          <Sparkles className='size-4' />
          AI entry
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-0 max-h-[calc(100dvh-1rem)] gap-0 overflow-x-hidden overflow-y-auto overscroll-contain p-0 sm:max-h-[90vh] sm:max-w-5xl'>
        <DialogHeader className='border-b bg-muted/30 px-4 py-4 pr-12 sm:px-6 sm:py-5 sm:pr-14'>
          <DialogTitle>Speak or type your entries</DialogTitle>
          <p className='mt-1 max-w-md text-sm text-muted-foreground'>
            Your entries stay as drafts until you confirm them.
          </p>
        </DialogHeader>
        <div className='min-w-0 space-y-5 p-4 sm:p-6'>
          <div className='space-y-2'>
            <Label htmlFor='ai-message'>
              What would you like to add?
            </Label>
            <div className='relative'>
              <Textarea
                className='min-h-28 resize-none rounded-xl bg-muted/20 px-4 py-3 pr-16 pb-12 leading-6 shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:bg-background'
                id='ai-message'
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder='e.g. ₹200 movie, ₹500 Uber in cash'
              />
              <Button
                className='absolute bottom-3 right-3 size-9 rounded-full shadow-sm transition-transform hover:scale-105'
                type='button'
                variant={listening ? 'destructive' : 'secondary'}
                size='icon'
                onClick={speak}
                aria-label={listening ? 'Stop speaking' : 'Speak entry'}
              >
                {listening ? (
                  <Square className='size-3.5' />
                ) : (
                  <Mic className='size-4' />
                )}
              </Button>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <Button
                type='button'
                onClick={ask}
                disabled={loading || !message.trim()}
                className='w-full sm:w-fit'
              >
                <Send className='size-4' />
                {loading ? 'Extracting…' : 'Review entries'}
              </Button>
            </div>
          </div>
          {drafts.length > 0 && (
            <div className='min-w-0 space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Review before adding</p>
                </div>
                <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                  {drafts.length} draft{drafts.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className='hidden min-w-0 max-w-full overflow-x-auto rounded-lg border bg-card md:block'>
                <Table className='min-w-220'>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='w-[24%]'>Description</TableHead>
                      <TableHead className='w-[12%]'>Amount (₹)</TableHead>
                      <TableHead className='w-[16%]'>Category</TableHead>
                      <TableHead className='w-[16%]'>Method</TableHead>
                      <TableHead className='w-[20%]'>Date</TableHead>
                      <TableHead className='w-10'>
                        <span className='sr-only'>Remove</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className='py-2.5'>
                          <Input
                            className='h-9 bg-background'
                            value={row.name}
                            onChange={e =>
                              update(index, 'name', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className='py-2.5'>
                          <Input
                            className='h-9 bg-background'
                            type='number'
                            min='0'
                            value={row.amount}
                            onChange={e =>
                              update(index, 'amount', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className='py-2.5'>
                          <Select
                            value={row.category ?? '__none__'}
                            onValueChange={value =>
                              updateCategory(index, value)
                            }
                          >
                            <SelectTrigger className='h-9 w-full bg-background'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='__none__'>
                                Uncategorized
                              </SelectItem>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='py-2.5'>
                          <Select
                            value={row.method || 'UPI'}
                            onValueChange={value => updateMethod(index, value)}
                          >
                            <SelectTrigger className='h-9 w-full bg-background'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ...new Set([
                                  'UPI',
                                  ...methods,
                                  row.method || 'UPI'
                                ])
                              ].map(method => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='py-2.5'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type='button'
                                variant='outline'
                                className='h-9 w-full justify-start bg-background px-3 text-left font-normal'
                              >
                                <CalendarIcon className='mr-2 size-3.5 text-muted-foreground' />
                                {row.date
                                  ? format(parseISO(row.date), 'd MMM yyyy')
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={
                                  row.date ? parseISO(row.date) : undefined
                                }
                                onSelect={date => updateDate(index, date)}
                                disabled={{ after: new Date() }}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className='py-2.5'>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            onClick={() =>
                              setDrafts(rows =>
                                rows.filter((_, i) => i !== index)
                              )
                            }
                            aria-label={`Remove ${row.name}`}
                          >
                            <Trash2 className='size-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className='space-y-3 md:hidden'>
                {drafts.map((row, index) => (
                  <div
                    className='space-y-3 rounded-xl border bg-card p-3 shadow-sm'
                    key={index}
                  >
                    <div className='flex items-start gap-2'>
                      <Input
                        className='h-10 min-w-0 flex-1 bg-background'
                        aria-label='Description'
                        value={row.name}
                        onChange={e => update(index, 'name', e.target.value)}
                      />
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        className='size-10 shrink-0'
                        onClick={() =>
                          setDrafts(rows => rows.filter((_, i) => i !== index))
                        }
                        aria-label={`Remove ${row.name}`}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Amount (₹)
                        </Label>
                        <Input
                          className='h-10 bg-background'
                          type='number'
                          min='0'
                          value={row.amount}
                          onChange={e =>
                            update(index, 'amount', e.target.value)
                          }
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type='button'
                              variant='outline'
                              className='h-10 w-full justify-start bg-background px-3 text-left font-normal'
                            >
                              <CalendarIcon className='mr-2 size-3.5 shrink-0 text-muted-foreground' />
                              {row.date
                                ? format(parseISO(row.date), 'd MMM yyyy')
                                : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={
                                row.date ? parseISO(row.date) : undefined
                              }
                              onSelect={date => updateDate(index, date)}
                              disabled={{ after: new Date() }}
                              autoFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Category
                        </Label>
                        <Select
                          value={row.category ?? '__none__'}
                          onValueChange={value => updateCategory(index, value)}
                        >
                          <SelectTrigger className='h-10 w-full bg-background'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='__none__'>
                              Uncategorized
                            </SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Method
                        </Label>
                        <Select
                          value={row.method || 'UPI'}
                          onValueChange={value => updateMethod(index, value)}
                        >
                          <SelectTrigger className='h-10 w-full bg-background'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...new Set(['UPI', ...methods, row.method || 'UPI'])].map(
                              method => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {drafts.length > 0 && (
          <DialogFooter className='border-t bg-muted/20 px-4 py-3 sm:px-6 sm:py-4 sm:flex-row sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              disabled={loading}
              onClick={() => setDrafts([])}
              className='w-full sm:w-auto'
            >
              <Trash2 className='size-4' />
              Clear drafts
            </Button>
            <Button onClick={addAll} disabled={loading} className='w-full sm:w-auto'>
              <Plus className='size-4' />
              Add {drafts.length} to ledger
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
}