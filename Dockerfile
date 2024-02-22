# Builder stage
FROM node:20.0.0-alpine as builder

# Set working directory in the builder stage
WORKDIR /app

# Copy package.json and yarn.lock for Yarn installation
COPY package.json yarn.lock ./

# Install Node.js dependencies in the builder stage
RUN yarn install

# Copy the rest of the app files into the builder stage
COPY . .

# Install Python dependencies and build Python packages in the builder stage
RUN apk --no-cache add \
    python3 \
    python3-dev \
    musl-dev \
    gcc \
    git \
    g++ \
    py3-pandas && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools && \
    pip3 install -e ./roles_royce && \
    pip3 install -r requirements.txt && \
    apk del python3-dev musl-dev gcc g++

# Runner stage
FROM node:20.0.0-alpine

# Set working directory in the runner stage
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/roles_royce ./roles_royce
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/dbank ./dbank
COPY --from=builder /app/requirements.txt ./requirements.txt
COPY --from=builder /usr/lib/python3.10/site-packages/ /usr/lib/python3.10/site-packages/
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.json ./
COPY run.sh /app/run.sh

# Make the script executable
RUN chmod +x /app/run.sh

# Install Python 3.10 in the runner stage
# Install openlabs for numpy+pandas
RUN apk --no-cache add python3 openblas

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHON_PATH=/usr/bin/python3

# Expose port
EXPOSE 3000

RUN yarn build

# Start the app
CMD ["/bin/sh", "/app/run.sh"]
