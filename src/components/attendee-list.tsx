import { Search, MoreHorizontal, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import { IconButton } from './icon-button'
import { Table } from './table/table'
import { TableHeader } from './table/table-header'
import { TableCell } from './table/table-cell'
import { TableRow } from './table/table-row'
import { ChangeEvent, useEffect, useState } from 'react'

dayjs.extend(relativeTime);
dayjs.locale('pt-br')

interface Attendee {
  id: string;
  name: string;
  email: string;
  checkedInAt: string;
  createdAt: string;
}

interface AttendeeResponse {
  attendees: Attendee[];
  total: number;
}


function getInitialPage() {
  const url = new URL(window.location.toString());

  if (url.searchParams.has('page')) {
    return Number(url.searchParams.get('page'));
  }
  return 1
}

function getInitialSearch() {
  const url = new URL(window.location.toString());

  if (url.searchParams.has('search')) {
    return url.searchParams.get('search') ?? '';
  }
  return ''
}

export function AttendeeList() {
  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(getInitialPage);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [total, setTotal] = useState<number>(0);

  const lastPage = Math.ceil(total / 10);

  function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCurrentSearch(event.target.value);
  }

  function setCurrentSearch(_search: string) {
    const url = new URL(window.location.toString());

    url.searchParams.set('search', _search);

    window.history.pushState({}, "", url.toString());

    setSearch(_search);
  }

  function setCurrentPage(_page: number) {
    const url = new URL(window.location.toString());

    url.searchParams.set('page', String(_page));

    window.history.pushState({}, "", url.toString());

    setPage(_page);
  }

  function goToNextPage() {
    setCurrentPage(page + 1)
  }

  function goToPreviousPage() {
    setCurrentPage(page - 1);
  }

  function goToFirstPage() {
    setCurrentPage(1);
  }

  function goToLastPage() {
    setCurrentPage(lastPage);
  }

  function fetchAttendees(_page: number, _search: string) {
    const url = new URL('http://localhost:3333/events/9e9bd979-9d10-4915-b339-3786b1634f33/attendees');
    url.searchParams.set('pageIndex', String(_page - 1));

    if (_search.length > 0)
      url.searchParams.set('query', _search);

    fetch(url)
      .then(response => response.json())
      .then((data: AttendeeResponse) => {
        setAttendees(data.attendees)
        setTotal(data.total)
      })
  }

  useEffect(() => {
    fetchAttendees(page, search);
  }, [page, search]);

  return (
    <div className='flex flex-col gap-4'>
      <div className="flex gap-3 items-center">
        <h1 className="text-2xl font-bold">Participantes</h1>
        <div className="px-3 w-72 py-1.5 border border-white/10 rounded-lg text-sm flex items-center gap-3">
          <Search className='size-4 text-emerald-500' />
          <input
            defaultValue={search ?? ''}
            onChange={onSearchInputChanged}
            className="bg-transparent flex-1 outline-none border-0 p-0 focus:ring-0"
            placeholder="Buscar participante..."
          />
        </div>
      </div>

      <Table>
        <thead>
          <tr className='border-b border-white/10'>
            <TableHeader>
              <input type="checkbox" className='size-4 bg-black/20 rounded border border-white/10' />
            </TableHeader>
            <TableHeader>
              Código
            </TableHeader>
            <TableHeader>
              Participantes
            </TableHeader>
            <TableHeader>
              Data de inscrição
            </TableHeader>
            <TableHeader>
              Data do check-in
            </TableHeader>
            <TableHeader style={{ width: 48 }} />
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) =>
            <TableRow key={attendee.id} >
              <TableCell>
                <input type="checkbox" className='size-4 bg-black/20 rounded border border-white/10 ' />
              </TableCell>
              <TableCell>
                {attendee.id}
              </TableCell>
              <TableCell>
                <div className='flex flex-col gap-1'>
                  <span className='font-semibold text-white'>{attendee.name}</span>
                  <span>{attendee.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {dayjs().to(attendee.createdAt)}
              </TableCell>
              <TableCell>
                {
                  attendee.checkedInAt
                    ? dayjs().to(attendee.checkedInAt)
                    : <span className='text-zinc-400'>Não fez check-in</span>
                }
              </TableCell>
              <TableCell>
                <IconButton transparent>
                  <MoreHorizontal className='size-4' />
                </IconButton>
              </TableCell>
            </TableRow>
          )}
        </tbody>
        <tfoot>
          <tr>
            <TableCell colSpan={3}>
              Mostrando {attendees.length} de {total} items
            </TableCell>
            <TableCell className="text-right" colSpan={3}>
              <div className='inline-flex items-center gap-8'>
                <span>Página {page} de {lastPage}</span>
                <div className='flex gap-1.5'>
                  <IconButton onClick={goToFirstPage} disabled={page == 1}>
                    <ChevronsLeft className='size-4' />
                  </IconButton>
                  <IconButton onClick={goToPreviousPage} disabled={page == 1}>
                    <ChevronLeft className='size-4' />
                  </IconButton>
                  <IconButton onClick={goToNextPage} disabled={page == lastPage}>
                    <ChevronRight className='size-4' />
                  </IconButton>
                  <IconButton onClick={goToLastPage} disabled={page == lastPage}>
                    <ChevronsRight className='size-4' />
                  </IconButton>
                </div>
              </div>
            </TableCell>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
}