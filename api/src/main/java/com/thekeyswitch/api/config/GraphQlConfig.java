package com.thekeyswitch.api.config;

import graphql.language.StringValue;
import graphql.scalars.ExtendedScalars;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class GraphQlConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        GraphQLScalarType dateTimeScalar = GraphQLScalarType.newScalar()
                .name("DateTime")
                .description("An RFC-3339 compliant DateTime scalar")
                .coercing(new Coercing<OffsetDateTime, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof OffsetDateTime odt) {
                            return odt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                        }
                        throw new CoercingSerializeException("Expected an OffsetDateTime object");
                    }

                    @Override
                    public OffsetDateTime parseValue(Object input) throws CoercingParseValueException {
                        if (input instanceof String s) {
                            try {
                                return OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                            } catch (DateTimeParseException e) {
                                throw new CoercingParseValueException("Invalid DateTime format: " + s);
                            }
                        }
                        throw new CoercingParseValueException("Expected a String for DateTime");
                    }

                    @Override
                    public OffsetDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue sv) {
                            try {
                                return OffsetDateTime.parse(sv.getValue(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                            } catch (DateTimeParseException e) {
                                throw new CoercingParseLiteralException("Invalid DateTime format: " + sv.getValue());
                            }
                        }
                        throw new CoercingParseLiteralException("Expected a StringValue for DateTime");
                    }
                })
                .build();

        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.Json)
                .scalar(ExtendedScalars.GraphQLLong)
                .scalar(dateTimeScalar);
    }
}
