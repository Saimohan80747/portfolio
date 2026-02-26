import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * PortfolioServer — A simple Java HTTP server that serves the portfolio website
 * and handles contact form submissions.
 *
 * Usage:
 *   javac PortfolioServer.java
 *   java PortfolioServer
 *
 * Then open http://localhost:8080 in your browser.
 */
public class PortfolioServer {

    private static final int PORT = 8080;
    private static final String WEB_ROOT = "."; // Serve files from current directory

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Serve static files (HTML, CSS, images, etc.)
        server.createContext("/", new StaticFileHandler());

        // Handle contact form POST
        server.createContext("/api/contact", new ContactFormHandler());

        server.setExecutor(null); // Use default executor
        server.start();

        System.out.println("============================================");
        System.out.println("  Portfolio Server is running!");
        System.out.println("  Open http://localhost:" + PORT + " in your browser");
        System.out.println("============================================");
    }

    /**
     * Serves static files from the web root directory.
     */
    static class StaticFileHandler implements HttpHandler {

        // Map file extensions to MIME types
        private static final Map<String, String> MIME_TYPES = new HashMap<>();
        static {
            MIME_TYPES.put("html", "text/html; charset=UTF-8");
            MIME_TYPES.put("css", "text/css; charset=UTF-8");
            MIME_TYPES.put("js", "application/javascript; charset=UTF-8");
            MIME_TYPES.put("json", "application/json; charset=UTF-8");
            MIME_TYPES.put("png", "image/png");
            MIME_TYPES.put("jpg", "image/jpeg");
            MIME_TYPES.put("jpeg", "image/jpeg");
            MIME_TYPES.put("gif", "image/gif");
            MIME_TYPES.put("svg", "image/svg+xml");
            MIME_TYPES.put("ico", "image/x-icon");
            MIME_TYPES.put("webp", "image/webp");
            MIME_TYPES.put("woff", "font/woff");
            MIME_TYPES.put("woff2", "font/woff2");
            MIME_TYPES.put("ttf", "font/ttf");
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // Default to index.html
            if (path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Prevent directory traversal attacks
            Path filePath = Paths.get(WEB_ROOT, path).normalize();
            if (!filePath.startsWith(Paths.get(WEB_ROOT).normalize())) {
                sendResponse(exchange, 403, "text/plain", "Forbidden");
                return;
            }

            File file = filePath.toFile();

            if (file.exists() && file.isFile()) {
                String extension = getFileExtension(file.getName());
                String mimeType = MIME_TYPES.getOrDefault(extension, "application/octet-stream");

                byte[] fileBytes = Files.readAllBytes(filePath);
                exchange.getResponseHeaders().set("Content-Type", mimeType);
                exchange.sendResponseHeaders(200, fileBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(fileBytes);
                }
            } else {
                sendResponse(exchange, 404, "text/html; charset=UTF-8",
                        "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'>"
                        + "<h1>404 - Not Found</h1><p>The requested page was not found.</p>"
                        + "<a href='/'>Go Home</a></body></html>");
            }

            System.out.println("[" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    + "] " + exchange.getRequestMethod() + " " + exchange.getRequestURI() + " -> "
                    + (file.exists() ? "200" : "404"));
        }
    }

    /**
     * Handles contact form submissions.
     * Saves messages to a local file and returns a JSON response.
     */
    static class ContactFormHandler implements HttpHandler {

        private static final String MESSAGES_FILE = "messages.txt";

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Only allow POST
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                sendResponse(exchange, 405, "application/json",
                        "{\"success\": false, \"message\": \"Method not allowed\"}");
                return;
            }

            try {
                // Read the form data from request body
                String body;
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(exchange.getRequestBody(), "UTF-8"))) {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    body = sb.toString();
                }

                // Parse form data (URL-encoded)
                Map<String, String> formData = parseFormData(body);

                String name = formData.getOrDefault("name", "");
                String email = formData.getOrDefault("email", "");
                String subject = formData.getOrDefault("subject", "");
                String message = formData.getOrDefault("message", "");

                // Validate
                if (name.isEmpty() || email.isEmpty() || subject.isEmpty() || message.isEmpty()) {
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    sendResponse(exchange, 400, "application/json",
                            "{\"success\": false, \"message\": \"All fields are required.\"}");
                    return;
                }

                // Save to file
                String timestamp = LocalDateTime.now().format(
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                String entry = String.format(
                        "%n========================================%n"
                        + "Date:    %s%n"
                        + "Name:    %s%n"
                        + "Email:   %s%n"
                        + "Subject: %s%n"
                        + "Message: %s%n"
                        + "========================================%n",
                        timestamp, name, email, subject, message);

                // Append to messages file
                try (FileWriter fw = new FileWriter(MESSAGES_FILE, true);
                     BufferedWriter bw = new BufferedWriter(fw)) {
                    bw.write(entry);
                }

                System.out.println("[" + timestamp + "] New contact message from: " + name + " <" + email + ">");

                // Send success response
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                sendResponse(exchange, 200, "application/json",
                        "{\"success\": true, \"message\": \"Thank you, " + escapeJson(name)
                        + "! Your message has been received.\"}");

            } catch (Exception e) {
                System.err.println("Error processing contact form: " + e.getMessage());
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                sendResponse(exchange, 500, "application/json",
                        "{\"success\": false, \"message\": \"Server error. Please try again later.\"}");
            }
        }
    }

    // ─── Utility Methods ────────────────────────────────────

    private static void sendResponse(HttpExchange exchange, int statusCode,
                                      String contentType, String body) throws IOException {
        byte[] bytes = body.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Map<String, String> parseFormData(String body) throws UnsupportedEncodingException {
        Map<String, String> data = new HashMap<>();
        if (body == null || body.isEmpty()) return data;

        for (String pair : body.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], "UTF-8");
            String value = parts.length > 1 ? URLDecoder.decode(parts[1], "UTF-8") : "";
            data.put(key, value);
        }
        return data;
    }

    private static String getFileExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }

    private static String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r");
    }
}
