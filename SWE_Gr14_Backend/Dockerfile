FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    composer \
    sudo \
    curl \
    git \
    postgresql \
    postgresql-contrib \
    libpq-dev \
    build-essential \
    python3 \
    python3-pip \
    nano

WORKDIR /Documents/SWE_Gr14/
# COPY . /var/www/html

RUN pip install "fastapi[standard]"

# Configure PostgreSQL to listen only on localhost
RUN echo "listen_addresses = 'localhost'" >> /etc/postgresql/14/main/postgresql.conf

# Create non-root user
RUN useradd -m swe_user && \
    echo "swe_user:swe_pass" | chpasswd

# Add netsec to the sudoers file (requires password for sudo)
RUN usermod -aG sudo swe_user

# Initialize PostgreSQL 
RUN service postgresql start && \
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" &&\
    # sudo -u postgres psql -c "CREATE USER swe_db_user WITH PASSWORD 'swe_db_pass';" && \
    # sudo -u postgres psql -c "CREATE DATABASE swe_db_name WITH OWNER swe_db_user;" && \
    # sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE swe_db_name TO swe_db_user;" && \
    service postgresql stop

COPY start.sh /home/swe_user/start.sh
RUN chmod +x /home/swe_user/start.sh
ENTRYPOINT ["/home/swe_user/start.sh"]
    

