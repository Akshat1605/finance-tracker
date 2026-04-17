# Use Java 17 base image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Fix mvnw permission
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean install -DskipTests

# Expose port
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "target/financetracker-0.0.1-SNAPSHOT.jar"]