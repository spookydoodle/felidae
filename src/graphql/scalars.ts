import { GraphQLScalarType, Kind } from "graphql";

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
        return date;
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new Error('Date literal must be a string');
        }
        const date = new Date(ast.value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date literal');
        }
        return date;
    }
});
