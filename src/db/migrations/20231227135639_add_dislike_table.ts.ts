import type { Knex } from 'knex';

const TableName = {
  USERS: 'users',
  POSTS: 'posts',
  POST_DISLIKE: 'post_dislike'
} as const;

const ColumnName = {
  CREATED_AT: 'created_at',
  ID: 'id',
  IS_DISLIKE: 'is_dislike',
  UPDATED_AT: 'updated_at',
  POST_ID: 'post_id',
  USER_ID: 'user_id'
} as const;

const RelationRule = {
  CASCADE: 'CASCADE',
  SET_NULL: 'SET NULL'
};

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TableName.POST_DISLIKE, table => {
    table.increments(ColumnName.ID).primary();
    table.boolean(ColumnName.IS_DISLIKE).notNullable().defaultTo(true);
    table
      .dateTime(ColumnName.CREATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .dateTime(ColumnName.UPDATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .integer(ColumnName.USER_ID)
      .references(ColumnName.ID)
      .inTable(TableName.USERS)
      .onUpdate(RelationRule.CASCADE)
      .onDelete(RelationRule.SET_NULL);
    table
      .integer(ColumnName.POST_ID)
      .references(ColumnName.ID)
      .inTable(TableName.POSTS)
      .onUpdate(RelationRule.CASCADE)
      .onDelete(RelationRule.SET_NULL);
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.POST_DISLIKE);
}
