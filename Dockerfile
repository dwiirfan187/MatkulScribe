FROM nginx:alpine

# Add a build argument for the Gemini API key
ARG API_KEY

# Copy the static frontend assets from the app_build directory to Nginx's HTML serving folder
COPY app_build/ /usr/share/nginx/html/

# Dynamically replace the placeholder with the real API key during the build process
RUN sed -i 's/INJECT_API_KEY_HERE/'"${API_KEY}"'/g' /usr/share/nginx/html/app.js

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground to keep the container running
CMD ["nginx", "-g", "daemon off;"]
