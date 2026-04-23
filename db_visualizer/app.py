from flask import Flask, render_template, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            database='gym_management',
            user='root',
            password=''
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/db_status')
def db_status():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to database"}), 500
    
    tables_data = {}
    tables = ['Member', 'Trainer', 'Training_Assignment', 'Membership_Plan', 'Membership_Account', 'Payment']
    
    cursor = conn.cursor(dictionary=True)
    for table in tables:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            tables_data[table] = cursor.fetchall()
        except Error as e:
            tables_data[table] = []
            
    cursor.close()
    conn.close()
    
    return jsonify(tables_data)

@app.route('/api/clear_db', methods=['POST'])
def clear_db():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to database"}), 500
    
    cursor = conn.cursor()
    try:
        # Disable foreign key checks to truncate everything safely
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        tables = ['Payment', 'Membership_Account', 'Training_Assignment', 'Member', 'Trainer', 'Membership_Plan']
        for table in tables:
            cursor.execute(f"TRUNCATE TABLE {table}")
            
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()
        return jsonify({"message": "Database cleared successfully"})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    # Running on port 5001 so it doesn't conflict with the main backend on 5000
    app.run(debug=True, host='0.0.0.0', port=5001)
