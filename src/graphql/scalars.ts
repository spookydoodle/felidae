import { DateTime } from 'luxon';
import { GraphQLScalarType, Kind } from "graphql";
import { MAX_ITEMS_PER_PAGE } from "../routers/news-middleware";

export const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date in ISO format',
    serialize(value: unknown) {
        if (!(value instanceof Date)) {
            throw new Error('Value must be of type Date');
        }
        return value.toISOString();
    },
    parseValue(value: unknown) {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) {
            throw new Error('Incorrect date value');
        }
        return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new Error('Date literal must be a string');
        }
        const date = new Date(ast.value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date literal');
        }
        return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    }
});

export const pageScalar = new GraphQLScalarType({
    name: 'Page',
    description: 'Page as integer greater than 0',
    serialize(value: unknown) {
        if (!(typeof value === 'number') || value < 1) {
            throw new Error('Page must be a number greater than 0');
        }
        return value;
    },
    parseValue(value: unknown) {
        const page = Number(value);
        if (isNaN(page) || page < 1) {
            throw new Error('Page must be a number greater than 0');
        }
        return page;
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.INT) {
            throw new Error('Page literal must be a number');
        }
        const page = Number(ast.value);
        if (isNaN(page) || page < 1) {
            throw new Error('Invalid page literal');
        }
        return page;
    }
});

export const itemsScalar = new GraphQLScalarType({
    name: 'Items',
    description: `Items per page numberas greater than 0 and less than ${MAX_ITEMS_PER_PAGE}`,
    serialize(value: unknown) {
        if (!(typeof value === 'number') || value < 1 || value > MAX_ITEMS_PER_PAGE) {
            throw new Error(`Items must be a number greater than 0 and less than ${MAX_ITEMS_PER_PAGE}`);
        }
        return value;
    },
    parseValue(value: unknown) {
        const page = Number(value);
        if (isNaN(page)) {
            throw new Error(`Items must be a number greater than 0 and less than ${MAX_ITEMS_PER_PAGE}`);
        }
        return page;
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.INT) {
            throw new Error('Items literal must be a number');
        }
        const page = Number(ast.value);
        if (isNaN(page) || page < 1 || page > MAX_ITEMS_PER_PAGE) {
            throw new Error(`Invalid page literal. Must be a number greater than 0 and less than ${MAX_ITEMS_PER_PAGE}`);
        }
        return page;
    }
});
