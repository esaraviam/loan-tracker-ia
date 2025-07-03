"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useCallback, useState, useTransition } from "react"

export function LoanFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("filter", value)}`)
    })
  }

  const handleSortChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("sort", value)}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("search", search)}`)
    })
  }

  const clearSearch = () => {
    setSearch("")
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("search", "")}`)
    })
  }

  const currentFilter = searchParams.get("filter") || "all"
  const currentSort = searchParams.get("sort") || "newest"

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('loans.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
            disabled={isPending}
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {t('common.search')}
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs
          value={currentFilter}
          onValueChange={handleFilterChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t('dashboard.filters.all')}</TabsTrigger>
            <TabsTrigger value="active">{t('dashboard.filters.active')}</TabsTrigger>
            <TabsTrigger value="overdue">{t('dashboard.filters.overdue')}</TabsTrigger>
            <TabsTrigger value="returned">{t('dashboard.filters.returned')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('loans.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('dashboard.sort.newest')}</SelectItem>
            <SelectItem value="oldest">{t('dashboard.sort.oldest')}</SelectItem>
            <SelectItem value="return-date">{t('dashboard.sort.dueDate')}</SelectItem>
            <SelectItem value="name">{t('dashboard.sort.itemName')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}