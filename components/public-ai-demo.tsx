'use client'

import { useState } from 'react'
import { CalendarIcon, Mic, Plus, Send, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type DemoRow = {
  id: number
  name: string
  amount: string
  category: string
  method: string
  date: Date
}

const categories = ['Dining', 'Transport', 'Entertainment', 'Shopping']
const methods = ['UPI', 'Cash', 'Card', 'Bank transfer']
const initialMessage =
  'I paid ₹120 cash for coffee this morning, ₹80 for the metro by card, ₹340 for lunch yesterday using UPI, ₹1,850 for groceries yesterday by card, and ₹450 for a movie two days ago.'

function initialRows(today: Date): DemoRow[] {
  return [
    { id: 1, name: 'Coffee', amount: '120', category: 'Dining', method: 'Cash', date: today },
    { id: 2, name: 'Metro ride', amount: '80', category: 'Transport', method: 'Card', date: today },
    { id: 3, name: 'Lunch', amount: '340', category: 'Dining', method: 'UPI', date: new Date(today.getTime() - 86400000) },
    { id: 4, name: 'Groceries', amount: '1850', category: 'Shopping', method: 'Card', date: new Date(today.getTime() - 86400000) },
    { id: 5, name: 'Movie', amount: '450', category: 'Entertainment', method: 'UPI', date: new Date(today.getTime() - 2 * 86400000) }
  ]
}

export function PublicAiDemo() {
  const [today] = useState(() => new Date())
  const [message, setMessage] = useState(initialMessage)
  const [rows, setRows] = useState<DemoRow[]>(() => initialRows(today))

  function resetDemo() {
    setMessage(initialMessage)
    setRows(initialRows(new Date()))
  }

  function updateRow(index: number, field: keyof DemoRow, value: string | Date) {
    setRows(current =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    )
  }

  return (
    <div className='rounded-lg border bg-background shadow-lg'>
      <div className='border-b bg-muted/30 px-4 py-4 sm:px-6'>
        <div className='text-lg font-semibold leading-none'>Speak or type your entries</div>
        <p className='mt-1 text-sm text-muted-foreground'>Your entries stay as drafts until you confirm them.</p>
      </div>
      <div className='space-y-5 p-4 sm:p-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium' htmlFor='public-ai-message'>What would you like to add?</label>
          <div className='relative'>
            <textarea
              id='public-ai-message'
              className='flex min-h-28 w-full resize-none rounded-xl border border-input bg-muted/20 px-4 py-3 pb-12 pr-16 text-base leading-6 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm'
              value={message}
              readOnly
              rows={4}
            />
            <Button type='button' className='absolute bottom-3 right-3 size-9 rounded-full shadow-sm' variant='secondary' size='icon' aria-label='Speak entry'>
              <Mic className='size-4' />
            </Button>
          </div>
          <div className='flex items-center justify-between gap-3'>
            <Button type='button' className='w-full sm:w-fit' onClick={resetDemo}>
              <Send className='size-4' />
              Review entries
            </Button>
          </div>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>Review before adding</p>
            <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>{rows.length} drafts</span>
          </div>
          <div className='min-w-0 max-w-full overflow-x-auto rounded-lg border bg-card'>
            <Table className='min-w-220'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='w-[24%]'>Description</TableHead>
                  <TableHead className='w-[12%]'>Amount (₹)</TableHead>
                  <TableHead className='w-[16%]'>Category</TableHead>
                  <TableHead className='w-[16%]'>Method</TableHead>
                  <TableHead className='w-[20%]'>Date</TableHead>
                  <TableHead className='w-10'><span className='sr-only'>Remove</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className='py-2.5'>
                      <Input className='h-9 bg-background' value={row.name} onChange={event => updateRow(index, 'name', event.target.value)} />
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <Input className='h-9 bg-background' type='number' min='0' value={row.amount} onChange={event => updateRow(index, 'amount', event.target.value)} />
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <Select value={row.category} onValueChange={value => updateRow(index, 'category', value)}>
                        <SelectTrigger className='h-9 w-full bg-background'><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <Select value={row.method} onValueChange={value => updateRow(index, 'method', value)}>
                        <SelectTrigger className='h-9 w-full bg-background'><SelectValue /></SelectTrigger>
                        <SelectContent>{methods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type='button' variant='outline' className='h-9 w-full justify-start bg-background px-3 text-left font-normal'>
                            <CalendarIcon className='mr-2 size-3.5 text-muted-foreground' />
                            {format(row.date, 'd MMM yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar mode='single' selected={row.date} onSelect={date => date && updateRow(index, 'date', date)} disabled={{ after: today }} autoFocus />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <Button type='button' size='icon' variant='ghost' aria-label={`Remove ${row.name}`} onClick={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))}>
                        <Trash2 className='size-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className='flex flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:justify-between sm:px-6 sm:py-4'>
        <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={() => setRows([])}>
          <Trash2 className='size-4' />Clear drafts
        </Button>
        <Button type='button' className='w-full sm:w-auto' disabled={rows.length === 0}>
          <Plus className='size-4' />Add {rows.length} to ledger
        </Button>
      </div>
    </div>
  )
}