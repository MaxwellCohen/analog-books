import { createError, defineEventHandler, getRouterParam } from 'h3';
import { getBookById } from '@/features/book/book-queries.server';
import { readSearchParams } from '../../../api';

export default defineEventHandler(async (event) => {
  await readSearchParams(event);
  const book = await getBookById(decodeURIComponent(getRouterParam(event, 'id') ?? ''));
  if (!book) throw createError({ statusCode: 404, statusMessage: 'Book not found' });
  return book;
});
