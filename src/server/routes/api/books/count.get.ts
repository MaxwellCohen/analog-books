import { defineEventHandler } from 'h3';
import { getBooksCount } from '@/features/book/book-queries.server';
import { toBookFilters, toBookQuery } from '@/features/book/book-utils';
import { readSearchParams } from '../../../api';

export default defineEventHandler(async (event) =>
  getBooksCount(toBookFilters(toBookQuery(await readSearchParams(event)))),
);
