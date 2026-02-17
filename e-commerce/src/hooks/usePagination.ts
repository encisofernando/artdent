import { useState, useMemo } from 'react'

/**
 * Hook para manejar paginación
 */
export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)
  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}
