#!/bin/bash

# To start psql service
echo "Starting psql service..."
sudo -u postgres pg_ctlcluster 14 main start

# To create database
echo "Creating database..."
export PGPASSWORD=$DB_PASSWORD

cd ./backend/

psql -h localhost -U postgres -f main.sql

echo "Tables formed"

pip install -r requirements.txt

fastapi dev main.py --host 0.0.0.0 --port 8000
