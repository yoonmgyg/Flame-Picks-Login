from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from bs4 import BeautifulSoup


auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, user={"firstName": user.firstName, "lastName": user.lastName, "email": user.email}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@auth.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('firstName', '') 
    last_name = data.get('lastName', '')
    password1 = data.get('password1', '')
    password2 = data.get('password2', '')

    if not email or not first_name or not last_name:
        return jsonify({'error': 'Missing fields.'}), 400

    if password1 != password2:
        return jsonify({'error': 'Passwords do not match.'}), 400
    if len(password1) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'error': 'Email already in use.'}), 409

    new_user = User(email=email, firstName=first_name, lastName=last_name,
                password=generate_password_hash(password1, method='pbkdf2:sha256'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201


@auth.route('/get-events', methods=['GET'])
def get_events():
    url = 'https://www.thesportsdb.com/league/4387-NBA'
    response = requests.get(url)
    events = []

    if response.ok:
        soup = BeautifulSoup(response.content, 'html.parser')
        events_table = soup.find('table', style="width:100%")

        if not events_table:
            return jsonify({'error': 'Table not found'}), 404

        rows = events_table.find_all('tr')[1:]

        for row in rows:
            event_data = row.find_all('td')
            if event_data and len(event_data) > 2:
                href = event_data[1].find('a', href=True)['href'] if event_data[1].find('a', href=True) else None
                if href:
                    teams = href.split('/')[-1].split('-vs-')
                    home_team = teams[0].rsplit('-', 1)[-1]
                    away_team = teams[1].rsplit('-', 1)[-1]

                    date = event_data[0].get_text(strip=True)

                    events.append({'home_team': home_team, 'away_team': away_team, 'date': date})

        return jsonify(events)

    else:
        return jsonify({'error': 'Failed to retrieve content'}), response.status_code
