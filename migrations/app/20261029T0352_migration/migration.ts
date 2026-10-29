#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/3b4b34126b68ecf169d9e25c05c4899c16ebd0ebe2f0a2c826ff0043e214a274/contract';
import startContract from '../../snapshots/3b4b34126b68ecf169d9e25c05c4899c16ebd0ebe2f0a2c826ff0043e214a274/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/6e3c66e88f545ce9a03908e24b9379b8d3b354c6f4705b9bd8eb584883b34683/contract';
import endContract from '../../snapshots/6e3c66e88f545ce9a03908e24b9379b8d3b354c6f4705b9bd8eb584883b34683/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'User', column: 'updatedAt' }),
      this.createTable({
        schema: 'public',
        table: 'Movie',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('createdBy', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('genres', 'text[]', {
            notNull: true,
            default: lit([]),
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('overview', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('posterUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('releaseYear', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('runtime', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Movie_genres_elem_not_null_6dc02271',
            sql`array_position("genres", NULL) IS NULL`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'WatchlistItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('movieId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('rating', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PLANNED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WatchlistItem_status_check_96b071fd',
            sql`"status" IN ('PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED')`,
          ),
        ],
      }),
      this.setDefault({
        schema: 'public',
        table: 'User',
        column: col('createdAt', 'timestamptz', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.alterColumnType({ schema: 'public', table: 'User', column: 'id', type: 'text' }),
      this.setNotNull({ schema: 'public', table: 'User', column: 'name' }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'password',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'WatchlistItem',
        constraint: 'WatchlistItem_userId_movieId_key',
        columns: ['userId', 'movieId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Movie',
        index: 'Movie_createdBy_idx_ba0f792f',
        columns: ['createdBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WatchlistItem',
        index: 'WatchlistItem_movieId_idx_8cb9f9db',
        columns: ['movieId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WatchlistItem',
        index: 'WatchlistItem_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Movie',
        foreignKey: {
          name: 'Movie_createdBy_fkey',
          columns: ['createdBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WatchlistItem',
        foreignKey: {
          name: 'WatchlistItem_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WatchlistItem',
        foreignKey: {
          name: 'WatchlistItem_movieId_fkey',
          columns: ['movieId'],
          references: { schema: 'public', table: 'Movie', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
