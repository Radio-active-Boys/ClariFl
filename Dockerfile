# Stage 1: Build the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the backend and SMTP server
FROM node:20-slim
WORKDIR /app

# Install postfix, supervisor, and clean up
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y postfix supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure Postfix: set mailname and allow local relay
RUN postconf -e "myhostname = localhost" && \
    postconf -e "relayhost =" && \
    postconf -e "mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128" && \
    postconf -e "inet_interfaces = loopback-only" && \
    postconf -e "inet_protocols = all"

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/
# Copy built frontend to backend/public
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Copy Supervisord config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3001
ENV PORT=3001
ENV SMTP_HOST=localhost
ENV SMTP_PORT=25
ENV SMTP_SECURE=false

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
