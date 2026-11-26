import { defineEventHandler } from 'h3';
import { getBooksPage } from '@/features/book/book-queries.server';
import { toBookQuery } from '@/features/book/book-utils';
import { readSearchParams } from '../../../api';

export default defineEventHandler(async (event) => getBooksPage(toBookQuery(await readSearchParams(event))));
