import os
from flask import Flask

from typeseam.extensions import (
    db, migrate, seamless_auth, ma, csrf, mail, sg
    )
from flask_user import (
    UserManager, SQLAlchemyAdapter
    )

def create_app():
    config = os.environ['CONFIG']
    app = Flask(__name__)
    app.config.from_object(config)
    register_extensions(app)
    register_blueprints(app)

    @app.before_first_request
    def setup():
        load_initial_data(app)

    return app

def register_extensions(app):
    db.init_app(app)
    migrate.init_app(app, db)
    seamless_auth.init_app(app)
    ma.init_app(app)
    csrf.init_app(app)
    mail.init_app(app)
    sg.init_app(app)

    from flask_sslify import SSLify
    # only trigger SSLify if the app is running on Heroku
    if 'DYNO' in os.environ:
        SSLify(app)

    # setup flask-user
    from typeseam.auth.models import User, UserInvitation
    db_adapter = SQLAlchemyAdapter(db, User, UserInvitationClass=UserInvitation)
    user_manager = UserManager(db_adapter, app)
    # use sendgrid for sending emails
    from typeseam.auth.tasks import sendgrid_email
    user_manager.send_email_function = sendgrid_email

def register_blueprints(app):
    from typeseam.form_filler import blueprint as form_filler
    app.register_blueprint(form_filler)
    from typeseam.auth import blueprint as auth
    app.register_blueprint(auth)

def load_initial_data(app):
    with app.app_context():
        if os.environ.get('MAKE_DEFAULT_USER', False):
            # create default user
            email = os.environ.get('DEFAULT_ADMIN_EMAIL', 'someone@example.com')
            password = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'Passw0rd')
            from typeseam.auth.queries import create_user
            user = create_user(email, password)
            # create default typeform
            form_key = os.environ.get('DEFAULT_TYPEFORM_KEY', '')
            title = os.environ.get('DEFAULT_TYPEFORM_TITLE', '')
            if form_key and title:
                from typeseam.form_filler.queries import create_typeform
                create_typeform(form_key=form_key, title=title, user=user)
        if app.config.get('LOAD_FAKE_DATA', False) and not app.testing:
            from typeseam.form_filler.queries import get_response_count
            from tests.mock.factories import generate_fake_data
            if get_response_count() < 10:
                results = generate_fake_data(num_users=10)
                print(results[0])





