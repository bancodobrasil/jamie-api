import { Logger } from '@nestjs/common';
import { PageInfo } from '../schema/objects/page-info.object';
import { PaginationArgs } from '../schema/args/pagination.arg';
import { SelectQueryBuilder, MoreThan, LessThan } from 'typeorm';
import { Direction } from '../schema/enums/direction.enum';
import { Connection } from '../types';

/**
 * Based on https://gist.github.com/tumainimosha/6652deb0aea172f7f2c4b2077c72d16c
 */
export async function paginate<T>(
  query: SelectQueryBuilder<T>,
  paginationArgs: PaginationArgs,
  cursorColumn = 'id',
  direction = Direction.ASC,
  defaultLimit = 25,
): Promise<Connection<T>> {
  const logger = new Logger('Pagination');

  // pagination ordering
  query.orderBy({ [cursorColumn]: direction });

  const totalCountQuery = query.clone();

  let reversed = false;

  // FORWARD pagination
  if (paginationArgs.first) {
    if (paginationArgs.after) {
      const offsetId = Number(
        Buffer.from(paginationArgs.after, 'base64').toString('ascii'),
      );
      logger.verbose(`Paginate After ID: ${offsetId}`);
      query.where({ [cursorColumn]: MoreThan(offsetId) });
    }

    const limit = paginationArgs.first ?? defaultLimit;

    query.take(limit);
  }

  // REVERSE pagination
  else if (paginationArgs.last && paginationArgs.before) {
    const offsetId = Number(
      Buffer.from(paginationArgs.before, 'base64').toString('ascii'),
    );
    logger.verbose(`Paginate Before ID: ${offsetId}`);

    const limit = paginationArgs.last ?? defaultLimit;

    query.where({ [cursorColumn]: LessThan(offsetId) }).take(limit);
    reversed = true;
  }

  let result = await query.getMany();

  if (reversed) {
    result = result.reverse()
  }

  const startCursorId: number =
    result.length > 0 ? result[0][cursorColumn] : null;
  const endCursorId: number =
    result.length > 0 ? result.slice(-1)[0][cursorColumn] : null;

  const beforeQuery = totalCountQuery.clone();

  const afterQuery = beforeQuery.clone();

  let countBefore = 0;
  let countAfter = 0;
  if (
    beforeQuery.expressionMap.wheres &&
    beforeQuery.expressionMap.wheres.length
  ) {
    countBefore = await beforeQuery
      .andWhere(`${cursorColumn} < :cursor`, { cursor: startCursorId })
      .getCount();
    countAfter = await afterQuery
      .andWhere(`${cursorColumn} > :cursor`, { cursor: endCursorId })
      .getCount();
  } else {
    countBefore = await beforeQuery
      .where(`${cursorColumn} < :cursor`, { cursor: startCursorId })
      .getCount();

    countAfter = await afterQuery
      .where(`${cursorColumn} > :cursor`, { cursor: endCursorId })
      .getCount();
  }

  logger.verbose(`CountBefore: ${countBefore}`);
  logger.verbose(`CountAfter: ${countAfter}`);

  const edges = result.map((value) => {
    return {
      node: value,
      cursor: Buffer.from(`${value[cursorColumn]}`).toString('base64'),
    };
  });

  const pageInfo = new PageInfo();
  pageInfo.startCursor = edges.length > 0 ? edges[0].cursor : null;
  pageInfo.endCursor = edges.length > 0 ? edges.slice(-1)[0].cursor : null;

  pageInfo.hasNextPage = countAfter > 0;
  pageInfo.hasPreviousPage = countBefore > 0;
  // pageInfo.countBefore = countBefore;
  // pageInfo.countNext = countAfter;
  // pageInfo.countCurrent = edges.length;
  // pageInfo.countTotal = countAfter + countBefore + edges.length;
  const totalCount = countAfter + countBefore + edges.length;

  return { edges, pageInfo, totalCount };
}
