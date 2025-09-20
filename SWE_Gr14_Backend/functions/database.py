import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def make_db():
    connection = psycopg2.connect(
        user=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME")
    )
    cursor = connection.cursor()
    return connection, cursor
