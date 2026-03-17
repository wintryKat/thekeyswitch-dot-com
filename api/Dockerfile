# Stage 1: Build the fat JAR
FROM gradle:8.12-jdk21-alpine AS build
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
RUN gradle dependencies --no-daemon || true
COPY src/ src/
RUN gradle bootJar --no-daemon -x test

# Stage 2: Extract layers from fat JAR
FROM eclipse-temurin:21-jre-alpine AS extractor
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "org.springframework.boot.loader.launch.JarLauncher"]
